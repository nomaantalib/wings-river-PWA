/**
 * Wings River Café - Design System & Theme Configuration
 * Module 1 Foundation Architecture
 */

export const THEME_CONFIG = {
  brand: {
    name: 'Wings River Café',
    slogan: 'Taste • Eat • Rides',
    location: 'Gomti Riverfront, Lucknow',
    phone: '07310008020',
    whatsapp: '917310008020',
    email: 'wingsrivercafe@gmail.com',
  },
  colors: {
    primary: {
      50: '#fffbe6',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Amber / Gold
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    dark: {
      950: '#060a12', // Deep Charcoal
      900: '#0f172a',
      800: '#1e293b',
      700: '#334155',
      600: '#475569',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
    },
  },
  spacingGrid: 8, // 8-point spacing system
  roles: ['Customer', 'Waiter', 'Kitchen', 'Reception', 'Manager', 'Admin'] as const,
};

export type UserRole = (typeof THEME_CONFIG.roles)[number];
