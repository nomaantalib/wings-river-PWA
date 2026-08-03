/**
 * Shared Real-Time Event Types and WebSocket Message Protocols
 * Wings River Café Real-Time Engine
 */

export type RealtimeEventType =
  // Table Domain
  | 'table.status_changed'
  | 'table.hold_requested'
  | 'table.hold_acquired'
  | 'table.hold_released'
  | 'table.hold_expired'
  // Reservation Domain
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.cancelled'
  // Order & Kitchen Domain
  | 'order.created'
  | 'order.status_updated'
  | 'kitchen.ticket_updated'
  // Waiter Alerts Domain
  | 'waiter.call_received'
  | 'waiter.call_resolved'
  // Management & System Domain
  | 'dashboard.metrics_updated'
  | 'presence.updated'
  | 'system.notification';

export type RoomName =
  | 'global'
  | 'room:tables'
  | 'room:reservations'
  | 'room:orders'
  | 'room:kitchen'
  | 'room:waiter'
  | 'room:manager';

export interface BaseRealtimePayload {
  timestamp: number;
  eventId: string;
  senderId?: string;
  room?: RoomName;
  [key: string]: any;
}

export interface TableStatusPayload extends BaseRealtimePayload {
  tableNumber: string;
  status: 'free' | 'eating' | 'needs_cleaning' | 'reserved' | 'locked';
  updatedBy?: string;
}

export interface TableHoldPayload extends BaseRealtimePayload {
  tableNumber: string;
  holdId: string;
  customerName: string;
  customerPhone?: string;
  expiresAt: number; // unix timestamp in ms
  lockedByUserId?: string;
}

export interface ReservationEventPayload extends BaseRealtimePayload {
  reservationId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  bookingType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface OrderEventPayload extends BaseRealtimePayload {
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  customerName?: string;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  totalAmount: number;
}

export interface WaiterCallPayload extends BaseRealtimePayload {
  requestId: string;
  tableNumber: string;
  requestType: string;
  status: 'pending' | 'resolved';
}

export interface PresencePayload extends BaseRealtimePayload {
  room: RoomName;
  activeCount: number;
  users: Array<{ id: string; role: string; name?: string }>;
}

// Inbound WebSocket Frames from Client
export type WSClientAction =
  | 'auth'
  | 'subscribe'
  | 'unsubscribe'
  | 'hold_table'
  | 'release_table'
  | 'ping';

export interface WSClientFrame {
  action: WSClientAction;
  token?: string;
  room?: RoomName;
  tableNumber?: string;
  payload?: any;
}

// Outbound WebSocket Frames to Client
export type WSServerMessageType =
  | 'connected'
  | 'subscribed'
  | 'unsubscribed'
  | 'event'
  | 'hold_success'
  | 'hold_failed'
  | 'pong'
  | 'error';

export interface WSServerFrame {
  type: WSServerMessageType;
  room?: RoomName;
  event?: RealtimeEventType;
  payload?: any;
  message?: string;
  code?: string;
  timestamp: number;
}
