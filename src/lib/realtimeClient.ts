import {
  RealtimeEventType,
  RoomName,
  WSServerFrame,
  WSClientFrame
} from '../backend/realtime/events';

export type EventCallback = (payload: any, eventType: RealtimeEventType) => void;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private hasSuccessfullyConnected = false;
  private failedAttempts = 0;
  private maxFailedAttempts = 3;
  private autoReconnect = true;
  private reconnectDelay = 2000;
  private maxReconnectDelay = 30000;
  private pingIntervalTimer: any = null;
  private subscribedRooms = new Set<RoomName>(['global']);
  private listeners = new Map<string, Set<EventCallback>>();

  /**
   * Initializes WebSocket connection to backend Real-Time Engine
   */
  connect(jwtToken?: string) {
    if (typeof window === 'undefined') return;
    if (!this.autoReconnect && this.failedAttempts >= this.maxFailedAttempts) {
      return;
    }
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = jwtToken || localStorage.getItem('wings_access_token') || '';
    const wsUrl = `${protocol}//${host}/api/realtime/connect${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.hasSuccessfullyConnected = true;
        this.failedAttempts = 0;
        this.reconnectDelay = 2000;
        this.startHeartbeat();

        // Resubscribe to active rooms upon reconnection
        for (const room of this.subscribedRooms) {
          this.sendFrame({ action: 'subscribe', room });
        }

        this.emit('connection.status', { connected: true });
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const frame: WSServerFrame = JSON.parse(event.data);
          this.handleServerFrame(frame);
        } catch (e) {
          // Silent catch
        }
      };

      this.socket.onclose = () => {
        this.cleanupSocket();
        if (!this.hasSuccessfullyConnected) {
          this.failedAttempts++;
          if (this.failedAttempts >= this.maxFailedAttempts) {
            this.autoReconnect = false;
            return;
          }
        }
        if (this.autoReconnect) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = () => {
        try { this.socket?.close(); } catch (e) {}
      };
    } catch (e) {
      if (!this.hasSuccessfullyConnected) {
        this.failedAttempts++;
        if (this.failedAttempts >= this.maxFailedAttempts) {
          this.autoReconnect = false;
          return;
        }
      }
      if (this.autoReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Disconnects WebSocket cleanly
   */
  disconnect() {
    this.autoReconnect = false;
    this.cleanupSocket();
    if (this.socket) {
      try { this.socket.close(); } catch (e) {}
      this.socket = null;
    }
  }

  /**
   * Subscribes client to a specific real-time room
   */
  subscribe(room: RoomName) {
    this.subscribedRooms.add(room);
    if (this.isConnected) {
      this.sendFrame({ action: 'subscribe', room });
    }
  }

  /**
   * Unsubscribes client from a room
   */
  unsubscribe(room: RoomName) {
    this.subscribedRooms.delete(room);
    if (this.isConnected) {
      this.sendFrame({ action: 'unsubscribe', room });
    }
  }

  /**
   * Sends atomic table hold request over WebSocket
   */
  holdTable(tableNumber: string, customerName?: string, customerPhone?: string) {
    this.sendFrame({
      action: 'hold_table',
      tableNumber,
      payload: { customerName, customerPhone }
    });
  }

  /**
   * Releases table hold
   */
  releaseTable(tableNumber: string) {
    this.sendFrame({
      action: 'release_table',
      tableNumber
    });
  }

  /**
   * Registers event listener callback
   */
  on(event: RealtimeEventType | 'connection.status' | string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unregisters event listener callback
   */
  off(event: RealtimeEventType | 'connection.status' | string, callback: EventCallback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  private handleServerFrame(frame: WSServerFrame) {
    if (frame.type === 'event' && frame.event) {
      this.emit(frame.event, frame.payload);
    } else if (frame.type === 'hold_success') {
      this.emit('table.hold_acquired', frame.payload);
    } else if (frame.type === 'hold_failed') {
      this.emit('table.hold_failed', { error: frame.message, code: frame.code });
    } else if (frame.type === 'connected') {
      this.emit('connection.connected', frame.payload);
    }
  }

  private emit(event: string, payload: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        try { cb(payload, event as RealtimeEventType); } catch (e) {}
      }
    }
  }

  private sendFrame(frame: WSClientFrame) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(frame));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      this.sendFrame({ action: 'ping' });
    }, 30000); // 30-second ping interval
  }

  private stopHeartbeat() {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  private cleanupSocket() {
    this.isConnected = false;
    this.stopHeartbeat();
    this.emit('connection.status', { connected: false });
  }

  private scheduleReconnect() {
    setTimeout(() => {
      if (this.autoReconnect) {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        this.connect();
      }
    }, this.reconnectDelay);
  }
}

export const realtimeClient = new RealtimeClient();
