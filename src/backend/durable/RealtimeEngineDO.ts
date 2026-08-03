import {
  WSServerFrame,
  WSClientFrame,
  RoomName,
  RealtimeEventType,
  TableHoldPayload,
  PresencePayload
} from '../realtime/events';
import { verify } from 'hono/jwt';
import { CONFIG } from '../config';

interface SessionInfo {
  id: string;
  userId: string;
  role: string;
  name?: string;
  rooms: Set<RoomName>;
  lastPing: number;
}

interface TableHoldInfo {
  holdId: string;
  tableNumber: string;
  customerName: string;
  customerPhone?: string;
  expiresAt: number;
  userId: string;
}

export class RealtimeEngineDO {
  private state: any;
  private env: any;
  private sessions = new Map<WebSocket, SessionInfo>();
  private tableHolds = new Map<string, TableHoldInfo>();

  constructor(state: any, env: any) {
    this.state = state;
    this.env = env;

    // Load persisted holds from DO storage if available
    this.state.blockConcurrencyWhile(async () => {
      try {
        const storedHolds = await this.state.storage.get('table_holds');
        if (storedHolds) {
          const now = Date.now();
          for (const [tableNum, hold] of Object.entries(storedHolds as Record<string, TableHoldInfo>)) {
            if (hold.expiresAt > now) {
              this.tableHolds.set(tableNum, hold);
            }
          }
        }
      } catch (e) {
        console.warn('[RealtimeEngineDO Storage Init Exception]', e);
      }
    });

    // Cleanup expired holds every 15 seconds
    setInterval(() => this.cleanupExpiredHolds(), 15000);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 1. Handle HTTP POST Broadcast Trigger
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      try {
        const body: any = await request.json();
        this.broadcast(body.room || 'global', body.event, body.payload);
        return new Response(JSON.stringify({ success: true, message: 'Event broadcasted' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 400 });
      }
    }

    // 2. Handle HTTP POST Table Hold Request (Atomic DO Lock)
    if (request.method === 'POST' && url.pathname === '/hold-table') {
      try {
        const body: any = await request.json();
        const res = await this.acquireTableHold(
          body.tableNumber,
          body.customerName || 'Guest',
          body.customerPhone || '',
          body.userId || 'anon'
        );
        return new Response(JSON.stringify(res), { headers: { 'Content-Type': 'application/json' } });
      } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 400 });
      }
    }

    // 3. Handle HTTP POST Table Release Request
    if (request.method === 'POST' && url.pathname === '/release-table') {
      try {
        const body: any = await request.json();
        const res = await this.releaseTableHold(body.tableNumber, body.userId);
        return new Response(JSON.stringify(res), { headers: { 'Content-Type': 'application/json' } });
      } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 400 });
      }
    }

    // 4. Handle HTTP GET Presence Metrics
    if (request.method === 'GET' && url.pathname === '/presence') {
      const room = (url.searchParams.get('room') as RoomName) || 'global';
      const presence = this.getPresence(room);
      return new Response(JSON.stringify({ success: true, presence }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. Handle WebSocket Upgrade Request
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket connection', { status: 426 });
    }

    // Authenticate WebSocket connection via JWT
    const token = url.searchParams.get('token') || request.headers.get('Sec-WebSocket-Protocol');
    let userClaims: any = { id: `user-${Math.random().toString(36).substring(2, 7)}`, role: 'Customer' };

    if (token) {
      const secret = this.env?.JWT_SECRET || this.env?.ADMIN_SECRET_KEY || CONFIG.JWT_SECRET_FALLBACK;
      try {
        const verified = await verify(token, secret, 'HS256');
        if (verified) {
          userClaims = verified;
        }
      } catch (e) {
        console.warn('[RealtimeEngineDO WS Token Verify Error]', e);
      }
    }

    // Create WebSocket pair
    const webSocketPair = new (globalThis as any).WebSocketPair();
    const [clientSocket, serverSocket] = Object.values(webSocketPair) as [WebSocket, WebSocket];

    (serverSocket as any).accept();

    const session: SessionInfo = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userClaims.id || userClaims.sub || 'anonymous',
      role: userClaims.role || 'Customer',
      name: userClaims.name || userClaims.username || 'Guest',
      rooms: new Set<RoomName>(['global']),
      lastPing: Date.now()
    };

    this.sessions.set(serverSocket, session);

    // Send connected handshake frame
    this.sendToSocket(serverSocket, {
      type: 'connected',
      payload: {
        sessionId: session.id,
        userId: session.userId,
        role: session.role,
        activeHolds: Array.from(this.tableHolds.values())
      },
      timestamp: Date.now()
    });

    // Broadcast presence update
    this.broadcastPresence('global');

    // Attach Event Listeners
    serverSocket.addEventListener('message', async (evt: MessageEvent) => {
      try {
        const frame: WSClientFrame = JSON.parse(evt.data.toString());
        await this.handleClientFrame(serverSocket, session, frame);
      } catch (err: any) {
        this.sendToSocket(serverSocket, {
          type: 'error',
          message: 'Invalid WebSocket JSON frame',
          code: 'BAD_FRAME',
          timestamp: Date.now()
        });
      }
    });

    serverSocket.addEventListener('close', () => {
      this.closeSocket(serverSocket);
    });

    serverSocket.addEventListener('error', () => {
      this.closeSocket(serverSocket);
    });

    return new Response(null, {
      status: 101,
      webSocket: clientSocket
    } as any);
  }

  /**
   * Processes client WebSocket action frames
   */
  private async handleClientFrame(ws: WebSocket, session: SessionInfo, frame: WSClientFrame) {
    session.lastPing = Date.now();

    switch (frame.action) {
      case 'ping':
        this.sendToSocket(ws, { type: 'pong', timestamp: Date.now() });
        break;

      case 'subscribe':
        if (frame.room) {
          session.rooms.add(frame.room);
          this.sendToSocket(ws, {
            type: 'subscribed',
            room: frame.room,
            timestamp: Date.now()
          });
          this.broadcastPresence(frame.room);
        }
        break;

      case 'unsubscribe':
        if (frame.room) {
          session.rooms.delete(frame.room);
          this.sendToSocket(ws, {
            type: 'unsubscribed',
            room: frame.room,
            timestamp: Date.now()
          });
          this.broadcastPresence(frame.room);
        }
        break;

      case 'hold_table':
        if (frame.tableNumber) {
          const res = await this.acquireTableHold(
            frame.tableNumber,
            frame.payload?.customerName || session.name || 'Guest',
            frame.payload?.customerPhone || '',
            session.userId
          );

          if (res.success) {
            this.sendToSocket(ws, {
              type: 'hold_success',
              payload: res.hold,
              timestamp: Date.now()
            });
          } else {
            this.sendToSocket(ws, {
              type: 'hold_failed',
              message: res.error,
              code: 'TABLE_LOCKED',
              timestamp: Date.now()
            });
          }
        }
        break;

      case 'release_table':
        if (frame.tableNumber) {
          await this.releaseTableHold(frame.tableNumber, session.userId);
        }
        break;

      default:
        break;
    }
  }

  /**
   * Atomic Table Locking: Locks selected table for 5 minutes (300,000 ms)
   */
  private async acquireTableHold(tableNumber: string, customerName: string, customerPhone: string, userId: string) {
    const cleanTable = tableNumber.toUpperCase().trim();
    const now = Date.now();
    const existingHold = this.tableHolds.get(cleanTable);

    // Check if table is locked by an active, unexpired hold from another user
    if (existingHold && existingHold.expiresAt > now && existingHold.userId !== userId) {
      return {
        success: false,
        error: `Table ${cleanTable} is currently locked by another guest. Please select another table.`,
        lockedUntil: existingHold.expiresAt
      };
    }

    // 5-minute hold lock duration (300,000 ms)
    const HOLD_DURATION_MS = 5 * 60 * 1000;
    const expiresAt = now + HOLD_DURATION_MS;
    const holdId = `hold-${cleanTable}-${now}`;

    const holdObj: TableHoldInfo = {
      holdId,
      tableNumber: cleanTable,
      customerName,
      customerPhone,
      expiresAt,
      userId
    };

    this.tableHolds.set(cleanTable, holdObj);

    // Persist holds map in DO storage
    try {
      const obj: Record<string, TableHoldInfo> = {};
      this.tableHolds.forEach((val, key) => { obj[key] = val; });
      await this.state.storage.put('table_holds', obj);
    } catch (e) {}

    // Broadcast hold acquired to all table room subscribers
    const payload: TableHoldPayload = {
      eventId: holdId,
      timestamp: now,
      tableNumber: cleanTable,
      holdId,
      customerName,
      customerPhone,
      expiresAt,
      lockedByUserId: userId
    };

    this.broadcast('room:tables', 'table.hold_acquired', payload);
    this.broadcast('room:tables', 'table.status_changed', {
      eventId: `stat-${holdId}`,
      timestamp: now,
      tableNumber: cleanTable,
      status: 'locked',
      updatedBy: customerName
    });

    return {
      success: true,
      hold: holdObj
    };
  }

  /**
   * Explicit Table Release
   */
  private async releaseTableHold(tableNumber: string, userId: string) {
    const cleanTable = tableNumber.toUpperCase().trim();
    const existing = this.tableHolds.get(cleanTable);

    if (existing) {
      this.tableHolds.delete(cleanTable);

      try {
        const obj: Record<string, TableHoldInfo> = {};
        this.tableHolds.forEach((val, key) => { obj[key] = val; });
        await this.state.storage.put('table_holds', obj);
      } catch (e) {}

      const now = Date.now();
      this.broadcast('room:tables', 'table.hold_released', {
        eventId: `rel-${now}`,
        timestamp: now,
        tableNumber: cleanTable
      });

      this.broadcast('room:tables', 'table.status_changed', {
        eventId: `free-${now}`,
        timestamp: now,
        tableNumber: cleanTable,
        status: 'free'
      });
    }

    return { success: true };
  }

  /**
   * Periodically checks and releases expired 5-minute table holds
   */
  private async cleanupExpiredHolds() {
    const now = Date.now();
    const expiredTables: string[] = [];

    this.tableHolds.forEach((hold, tableNum) => {
      if (now > hold.expiresAt) {
        expiredTables.push(tableNum);
      }
    });

    for (const tableNum of expiredTables) {
      this.tableHolds.delete(tableNum);
      this.broadcast('room:tables', 'table.hold_expired', {
        eventId: `exp-${tableNum}-${now}`,
        timestamp: now,
        tableNumber: tableNum
      });
      this.broadcast('room:tables', 'table.status_changed', {
        eventId: `free-${tableNum}-${now}`,
        timestamp: now,
        tableNumber: tableNum,
        status: 'free'
      });
    }

    if (expiredTables.length > 0) {
      try {
        const obj: Record<string, TableHoldInfo> = {};
        this.tableHolds.forEach((val, key) => { obj[key] = val; });
        await this.state.storage.put('table_holds', obj);
      } catch (e) {}
    }
  }

  /**
   * Broadcasts real-time events to all active WebSockets subscribed to room
   */
  private broadcast(room: RoomName, event: RealtimeEventType, payload: any) {
    const frame: WSServerFrame = {
      type: 'event',
      room,
      event,
      payload,
      timestamp: Date.now()
    };

    for (const [ws, session] of this.sessions.entries()) {
      if (room === 'global' || session.rooms.has(room) || session.rooms.has('global')) {
        this.sendToSocket(ws, frame);
      }
    }
  }

  /**
   * Calculates room presence count and active subscribers
   */
  private getPresence(room: RoomName): PresencePayload {
    const activeUsers: Array<{ id: string; role: string; name?: string }> = [];

    for (const session of this.sessions.values()) {
      if (room === 'global' || session.rooms.has(room)) {
        activeUsers.push({
          id: session.userId,
          role: session.role,
          name: session.name
        });
      }
    }

    return {
      eventId: `pres-${Date.now()}`,
      timestamp: Date.now(),
      room,
      activeCount: activeUsers.length,
      users: activeUsers
    };
  }

  private broadcastPresence(room: RoomName) {
    const presence = this.getPresence(room);
    this.broadcast(room, 'presence.updated', presence);
  }

  private sendToSocket(ws: WebSocket, frame: WSServerFrame) {
    try {
      if ((ws as any).readyState === 1) { // 1 = OPEN
        (ws as any).send(JSON.stringify(frame));
      }
    } catch (e) {
      this.closeSocket(ws);
    }
  }

  private closeSocket(ws: WebSocket) {
    const session = this.sessions.get(ws);
    if (session) {
      this.sessions.delete(ws);
      for (const room of session.rooms) {
        this.broadcastPresence(room);
      }
    }
    try { (ws as any).close(); } catch (e) {}
  }
}
