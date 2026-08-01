/**
 * Wings River Café — Dynamic Pricing Helper
 * Per person rate:
 * - Weekdays (Monday - Friday): ₹300 / person
 * - Weekends (Saturday & Sunday) & Holidays: ₹600 / person
 */

export interface PricingBreakdown {
  isWeekend: boolean;
  perPersonRate: number;
  guestCount: number;
  totalPrice: number;
  dayName: string;
}

export function calculateBookingPrice(dateString: string, guests: number): PricingBreakdown {
  const dateObj = dateString ? new Date(dateString) : new Date();
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const perPersonRate = isWeekend ? 600 : 300;
  const guestCount = Math.max(1, Number(guests) || 1);
  const totalPrice = perPersonRate * guestCount;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[dayOfWeek] || 'Selected Day';

  return {
    isWeekend,
    perPersonRate,
    guestCount,
    totalPrice,
    dayName,
  };
}
