// Notification & Cancellation Policy Engine — WhatsApp, SMS, Email Alerts & 5-Hour Refund Rule

export interface NotificationPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingId: string;
  bookingType: string;
  date: string;
  timeSlot: string;
  guests: number;
  tableNumber?: string;
  status: string;
  totalAmount?: number;
}

// Check 5-Hour Cancellation Eligibility (Refunded only 5 hours before time slot)
export function isEligibleForRefundCancellation(bookingDateStr: string, timeSlotStr: string): { eligible: boolean; hoursRemaining: number; reason: string } {
  try {
    // Parse Booking Date & Time (e.g. 2026-08-02, 07:00 PM)
    const [year, month, day] = bookingDateStr.split('-').map(Number);
    let hours = 12;
    let minutes = 0;

    if (timeSlotStr) {
      const match = timeSlotStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }
    }

    const bookingDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    const diffMs = bookingDateTime.getTime() - now.getTime();
    const hoursRemaining = diffMs / (1000 * 60 * 60);

    if (hoursRemaining >= 5) {
      return {
        eligible: true,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        reason: `Eligible for 100% refund (${Math.round(hoursRemaining)} hours before time slot).`,
      };
    } else {
      return {
        eligible: false,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        reason: `Non-eligible for refund. Cancellations with full refund are allowed only up to 5 hours prior to the time slot (${Math.max(0, Math.round(hoursRemaining))}h remaining).`,
      };
    }
  } catch {
    return {
      eligible: false,
      hoursRemaining: 0,
      reason: 'Invalid booking timestamp.',
    };
  }
}

// Generate Direct WhatsApp Alert Link
export function getWhatsAppNotificationLink(payload: NotificationPayload): string {
  const cleanPhone = payload.customerPhone.replace(/\D/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const text = encodeURIComponent(
    `🌊 *Wings River Café — ${payload.status.toUpperCase()} ALERT*\n\n` +
    `Dear ${payload.customerName},\n` +
    `Your reservation details:\n` +
    `• *Booking ID*: ${payload.bookingId}\n` +
    `• *Date*: ${payload.date}\n` +
    `• *Time Slot*: ${payload.timeSlot}\n` +
    `• *Guests*: ${payload.guests} Persons\n` +
    `• *Table/Area*: ${payload.tableNumber || 'Assigned On Arrival'}\n` +
    `• *Status*: ${payload.status}\n\n` +
    `Location: Laxman Mela Ground Waterfront, Gomti Riverfront, Lucknow.\n` +
    `Need help? Call us at 07310008020`
  );

  return `https://wa.me/${targetPhone}?text=${text}`;
}

// Send Simulated Multi-Channel Notification Alerts (WhatsApp, SMS, Email)
export function triggerMultiChannelNotifications(payload: NotificationPayload) {
  if (typeof window === 'undefined') return;

  // Log Notification Audit Event
  const logMsg = `[Notification Sent] ${payload.status} | Phone: ${payload.customerPhone} | WhatsApp/SMS/Email Dispatched`;
  console.log(logMsg);

  // Trigger Custom Event for UI Toasts
  window.dispatchEvent(new CustomEvent('wings_notification_sent', { detail: payload }));
}
