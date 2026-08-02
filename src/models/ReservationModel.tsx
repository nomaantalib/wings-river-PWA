// Reservation Model Definition & Validation Logic
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
  status: string;
  created_at?: string;
}

export function createDefaultReservation(): Reservation {
  return {
    id: `res-${Date.now()}`,
    name: '',
    phone: '',
    email: '',
    booking_type: 'table_booking',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: 2,
    special_requests: '',
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
}

export function validateReservation(res: Partial<Reservation>): string | null {
  if (!res.name || res.name.trim().length < 2) return 'Please enter a valid full name.';
  if (!res.phone || res.phone.trim().length < 10) return 'Please enter a valid 10-digit mobile number.';
  if (!res.date) return 'Please select a reservation date.';
  if (!res.time) return 'Please select a reservation time.';
  if (!res.guests || res.guests < 1) return 'Please enter guest count (at least 1).';
  return null;
}

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    name: 'Rahul Verma',
    phone: '9876543210',
    email: 'rahul.v@example.com',
    booking_type: 'table_booking',
    table_number: 'T2',
    cluster_name: 'Rooftop Upper Deck',
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    guests: 4,
    special_requests: 'Riverside deck table with candle decor',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'res-102',
    name: 'Priya Sharma',
    phone: '9811223344',
    email: 'priya.s@example.com',
    booking_type: 'birthday_party',
    table_number: 'V1',
    cluster_name: 'VIP Canopy',
    date: new Date().toISOString().split('T')[0],
    time: '21:30',
    guests: 8,
    special_requests: 'Birthday cake arrangements & ambient lights',
    status: 'pending',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

