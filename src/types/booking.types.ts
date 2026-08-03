export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  booking_type: string;
  table_number?: string;
  cluster_name?: string;
  cluster_id?: string;
  duration_hours?: number;
  qr_code?: string;
  amount?: number;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
  status: string; // confirmed, pending, cancelled
  created_at?: string;
}

export interface PartyBooking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  event_type: string;
  event_date: string;
  time_slot: string;
  guest_count: number;
  canopy_name?: string;
  custom_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at?: string;
}
