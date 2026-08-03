const API_BASE = '/api';

export function getCloudinaryOptimizedUrl(url: string, width?: number, quality: string = 'auto'): string {
  if (!url) return url;
  const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vrgblmky';
  if (url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const cropTransform = width ? `c_fill,ar_4:6,g_auto,f_auto,q_${quality},w_${width}` : `f_auto,q_${quality}`;
      return `${parts[0]}/upload/${cropTransform}/${parts[1]}`;
    }
    return url;
  }
  if (url.startsWith('http')) {
    const encoded = encodeURIComponent(url);
    const cropTransform = width ? `c_fill,ar_4:6,g_auto,f_auto,q_${quality},w_${width}` : `f_auto,q_${quality}`;
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${cropTransform}/${encoded}`;
  }
  return url;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
    return { success: false, error: err?.message || 'Network request failed' };
  }
}
