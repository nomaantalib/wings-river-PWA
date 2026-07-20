// Reservation Model Definition & Validation Logic
export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  booking_type: string;
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
