/**
 * Wings River Café - Unified Service API Client Layer
 * Module 1 Foundation Architecture
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? '/api' : 'https://wings-river-pwa.pages.dev/api';
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('wings_auth_token');
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return await response.json();
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Network request failed',
      };
    }
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Service Modules
export const authApi = {
  login: (credentials: { username?: string; phone?: string; password?: string }) =>
    apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout', {}),
  me: () => apiClient.get('/auth/me'),
};

export const tableApi = {
  getAll: () => apiClient.get('/tables'),
  getByNumber: (tableNumber: string) => apiClient.get(`/tables/${tableNumber}`),
  getQr: (tableNumber: string) => apiClient.get(`/tables/${tableNumber}/qr`),
  createOrder: (tableNumber: string, orderData: any) =>
    apiClient.post(`/tables/${tableNumber}/order`, orderData),
  callWaiter: (tableNumber: string, requestType: string) =>
    apiClient.post(`/tables/${tableNumber}/call-waiter`, { request_type: requestType }),
};

export const menuApi = {
  getCategories: () => apiClient.get('/categories'),
  getItems: (category?: string) => apiClient.get(`/menu${category ? `?category=${category}` : ''}`),
};

export const reservationApi = {
  getAll: () => apiClient.get('/reservations'),
  create: (data: any) => apiClient.post('/reservations', data),
};

export const cmsApi = {
  getBanners: () => apiClient.get('/banners'),
  getOffers: () => apiClient.get('/offers'),
  getBlogs: () => apiClient.get('/blogs'),
  getGallery: () => apiClient.get('/gallery'),
  getSettings: () => apiClient.get('/settings'),
};
