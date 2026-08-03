import { AppContext } from '../types';
import { RealtimeEventType, RoomName } from '../realtime/events';

export class RealtimeService {
  /**
   * Gets or initializes the singleton RealtimeEngine Durable Object instance ID
   */
  private static getDOStub(c: AppContext) {
    const doNamespace = c.env?.REALTIME_ENGINE;
    if (!doNamespace) {
      return null;
    }
    try {
      const id = doNamespace.idFromName('wings-river-main-do');
      return doNamespace.get(id);
    } catch (e) {
      console.warn('[RealtimeService DO Stub Error]', e);
      return null;
    }
  }

  /**
   * Broadcasts a real-time event to all connected sockets in a room
   */
  static async broadcast(c: AppContext, room: RoomName, event: RealtimeEventType, payload: any) {
    const stub = this.getDOStub(c);
    if (!stub) {
      return { success: false, message: 'Durable Object binding unavailable' };
    }

    try {
      const res = await stub.fetch('http://do/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, event, payload })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Requests an atomic 5-minute table lock via Durable Object
   */
  static async holdTable(c: AppContext, tableNumber: string, customerName?: string, customerPhone?: string, userId?: string) {
    const stub = this.getDOStub(c);
    if (!stub) {
      return { success: false, error: 'Real-time engine offline' };
    }

    try {
      const res = await stub.fetch('http://do/hold-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, customerName, customerPhone, userId })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Releases a held table
   */
  static async releaseTable(c: AppContext, tableNumber: string, userId?: string) {
    const stub = this.getDOStub(c);
    if (!stub) {
      return { success: false, error: 'Real-time engine offline' };
    }

    try {
      const res = await stub.fetch('http://do/release-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber, userId })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Fetches room presence metrics
   */
  static async getPresence(c: AppContext, room: RoomName = 'global') {
    const stub = this.getDOStub(c);
    if (!stub) {
      return { success: true, presence: { room, activeCount: 0, users: [] } };
    }

    try {
      const res = await stub.fetch(`http://do/presence?room=${encodeURIComponent(room)}`);
      return await res.json();
    } catch (e: any) {
      return { success: true, presence: { room, activeCount: 0, users: [] } };
    }
  }
}
