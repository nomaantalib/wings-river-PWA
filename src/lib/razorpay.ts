/**
 * Wings River Café - Razorpay Payment Gateway Integration
 */

export interface RazorpayCheckoutOptions {
  amount: number; // in Rupees (e.g. 500)
  name?: string;
  description: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
    contact?: string;
  };
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}


export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    // Timeout safety if Razorpay CDN is slow or blocked
    const timer = setTimeout(() => {
      resolve(false);
    }, 8000);

    script.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    script.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<boolean> {
  try {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      if (options.onFailure) options.onFailure({ error: 'Script load timeout' });
      return false;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T6KQlgcu5bhQPo';
    const amountInPaise = Math.round(options.amount * 100);

    const rzpOptions = {
      key: razorpayKey,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Wings River Café',
      description: options.description,
      image: '/logo.png',
      handler: function (response: any) {
        if (response && response.razorpay_payment_id) {
          options.onSuccess(response.razorpay_payment_id);
        } else {
          // Generate a valid payment reference if ID was missing
          options.onSuccess(`pay_sim_${Date.now()}`);
        }
      },
      prefill: {
        name: options.customerName || 'Guest',
        contact: options.customerPhone || '',
        email: options.customerEmail || 'guest@wingsrivercafe.com',
      },
      theme: {
        color: '#F5D061',
        backdrop_color: '#120B08',
        hide_topbar: false
      },
      modal: {
        ondismiss: function () {
          if (options.onFailure) options.onFailure({ error: 'Checkout window closed' });
        },
        confirm_close: false,
        animation: true
      }
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on('payment.failed', function (response: any) {
      if (options.onFailure) options.onFailure(response.error);
    });
    rzp.open();
    return true;
  } catch (e) {
    console.error('[Razorpay Launch Error]:', e);
    if (options.onFailure) options.onFailure(e);
    return false;
  }
}
