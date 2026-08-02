// Floor Plan Model Definition & Default Layout for Wings River Café

export type ObjectShape = 'circle' | 'square' | 'rectangle' | 'oval' | 'hexagon';

export type ObjectCategory = 
  | 'table' | 'chair' | 'sofa' | 'wall' | 'window' | 'door' 
  | 'stage' | 'counter' | 'cashier' | 'kitchen' | 'washroom' 
  | 'entrance' | 'exit' | 'garden' | 'plants' | 'decoration' 
  | 'stairs' | 'pool' | 'smoking_area' | 'bar' | 'vip_area' 
  | 'private_cabin' | 'parking' | 'emergency_exit';

export interface FloorObject {
  id: string;
  type: ObjectCategory;
  name: string;
  tableNumber?: string;
  shape?: ObjectShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity?: number;
  color?: string;
  status?: 'free' | 'reserved' | 'eating' | 'needs_cleaning' | 'blocked';
  priceMultiplier?: number;
  qrCode?: string;
  bookingEnabled?: boolean;
  isLocked?: boolean;
  area?: 'indoor' | 'garden' | 'rooftop' | string;
  floor?: string;
  description?: string;
}

export interface FloorPlanLayout {
  floor: string;
  updatedAt: string;
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  objects: FloorObject[];
}

export const INITIAL_FLOOR_PLAN: FloorPlanLayout = {
  floor: 'Ground Floor & Riverfront Deck',
  updatedAt: new Date().toISOString(),
  gridSize: 20,
  canvasWidth: 1000,
  canvasHeight: 700,
  objects: [
    // ── RIVERFRONT LANDMARK INDICATOR ────────────────────────────
    {
      id: 'obj-river-mark',
      type: 'decoration',
      name: 'Gomti Riverfront Walkway & Dock',
      x: 40, y: 20, width: 920, height: 40, rotation: 0,
      color: '#1A3550', isLocked: true, area: 'general',
      description: 'Scenic Gomti Riverfront Promenade'
    },

    // ── ROOFTOP UPPER DECK TABLES (T1 – T6) ──────────────────────
    {
      id: 'obj-t1', type: 'table', name: 'Table T1', tableNumber: 'T1',
      shape: 'circle', x: 80, y: 100, width: 70, height: 70, rotation: 0,
      capacity: 2, status: 'free', area: 'rooftop', floor: 'Rooftop Deck',
      bookingEnabled: true, color: '#F5D061'
    },
    {
      id: 'obj-t2', type: 'table', name: 'Table T2', tableNumber: 'T2',
      shape: 'rectangle', x: 200, y: 100, width: 90, height: 70, rotation: 0,
      capacity: 4, status: 'eating', area: 'rooftop', floor: 'Rooftop Deck',
      bookingEnabled: true, color: '#F5D061'
    },
    {
      id: 'obj-t3', type: 'table', name: 'Table T3', tableNumber: 'T3',
      shape: 'circle', x: 340, y: 100, width: 70, height: 70, rotation: 0,
      capacity: 2, status: 'free', area: 'rooftop', floor: 'Rooftop Deck',
      bookingEnabled: true, color: '#F5D061'
    },
    {
      id: 'obj-t4', type: 'table', name: 'Table T4', tableNumber: 'T4',
      shape: 'rectangle', x: 460, y: 100, width: 90, height: 70, rotation: 0,
      capacity: 4, status: 'free', area: 'rooftop', floor: 'Rooftop Deck',
      bookingEnabled: true, color: '#F5D061'
    },
    {
      id: 'obj-t5', type: 'table', name: 'Table T5', tableNumber: 'T5',
      shape: 'circle', x: 600, y: 100, width: 70, height: 70, rotation: 0,
      capacity: 2, status: 'free', area: 'rooftop', floor: 'Rooftop Deck',
      bookingEnabled: true, color: '#F5D061'
    },
    {
      id: 'obj-t6', type: 'table', name: 'Table T6', tableNumber: 'T6',
      shape: 'rectangle', x: 740, y: 100, width: 90, height: 70, rotation: 0,
      capacity: 4, status: 'reserved', area: 'rooftop', floor: 'Rooftop Deck',
      bookingEnabled: true, color: '#F5D061'
    },

    // ── OPEN GARDEN AREA TABLES (T7 – T13) ───────────────────────
    {
      id: 'obj-t7', type: 'table', name: 'Table T7', tableNumber: 'T7',
      shape: 'square', x: 80, y: 240, width: 80, height: 80, rotation: 0,
      capacity: 4, status: 'free', area: 'garden', floor: 'Ground Floor',
      bookingEnabled: true, color: '#6B8E5E'
    },
    {
      id: 'obj-t8', type: 'table', name: 'Table T8', tableNumber: 'T8',
      shape: 'square', x: 210, y: 240, width: 80, height: 80, rotation: 0,
      capacity: 4, status: 'free', area: 'garden', floor: 'Ground Floor',
      bookingEnabled: true, color: '#6B8E5E'
    },
    {
      id: 'obj-t9', type: 'table', name: 'Table T9', tableNumber: 'T9',
      shape: 'rectangle', x: 340, y: 240, width: 110, height: 80, rotation: 0,
      capacity: 6, status: 'eating', area: 'garden', floor: 'Ground Floor',
      bookingEnabled: true, color: '#6B8E5E'
    },
    {
      id: 'obj-t10', type: 'table', name: 'Table T10', tableNumber: 'T10',
      shape: 'square', x: 490, y: 240, width: 80, height: 80, rotation: 0,
      capacity: 4, status: 'free', area: 'garden', floor: 'Ground Floor',
      bookingEnabled: true, color: '#6B8E5E'
    },
    {
      id: 'obj-t11', type: 'table', name: 'Table T11', tableNumber: 'T11',
      shape: 'square', x: 610, y: 240, width: 80, height: 80, rotation: 0,
      capacity: 4, status: 'free', area: 'garden', floor: 'Ground Floor',
      bookingEnabled: true, color: '#6B8E5E'
    },
    {
      id: 'obj-t12', type: 'table', name: 'Table T12', tableNumber: 'T12',
      shape: 'rectangle', x: 730, y: 240, width: 110, height: 80, rotation: 0,
      capacity: 6, status: 'free', area: 'garden', floor: 'Ground Floor',
      bookingEnabled: true, color: '#6B8E5E'
    },
    {
      id: 'obj-t13', type: 'table', name: 'Table T13 VIP Canopy', tableNumber: 'T13',
      shape: 'hexagon', x: 870, y: 240, width: 100, height: 100, rotation: 0,
      capacity: 8, status: 'reserved', area: 'garden', floor: 'Ground Floor',
      bookingEnabled: true, color: '#E5B82C'
    },

    // ── INDOOR AC HALL TABLES (T14 – T17) ────────────────────────
    {
      id: 'obj-t14', type: 'table', name: 'Table T14 Window AC', tableNumber: 'T14',
      shape: 'rectangle', x: 120, y: 400, width: 100, height: 80, rotation: 0,
      capacity: 4, status: 'free', area: 'indoor', floor: 'Ground Floor',
      bookingEnabled: true, color: '#E5B82C'
    },
    {
      id: 'obj-t15', type: 'table', name: 'Table T15 Window AC', tableNumber: 'T15',
      shape: 'rectangle', x: 280, y: 400, width: 100, height: 80, rotation: 0,
      capacity: 4, status: 'free', area: 'indoor', floor: 'Ground Floor',
      bookingEnabled: true, color: '#E5B82C'
    },
    {
      id: 'obj-t16', type: 'table', name: 'Table T16 Sofa Booth', tableNumber: 'T16',
      shape: 'oval', x: 450, y: 400, width: 120, height: 80, rotation: 0,
      capacity: 6, status: 'eating', area: 'indoor', floor: 'Ground Floor',
      bookingEnabled: true, color: '#E5B82C'
    },
    {
      id: 'obj-t17', type: 'table', name: 'Table T17 Family Suite', tableNumber: 'T17',
      shape: 'rectangle', x: 620, y: 400, width: 140, height: 90, rotation: 0,
      capacity: 8, status: 'free', area: 'indoor', floor: 'Ground Floor',
      bookingEnabled: true, color: '#E5B82C'
    },

    // ── AMENITIES & STRUCTURAL OBJECTS ───────────────────────────
    {
      id: 'obj-bar', type: 'bar', name: 'Mocktail & Coffee Bar Counter',
      x: 80, y: 540, width: 260, height: 60, rotation: 0,
      color: '#3D2612', isLocked: true, area: 'indoor'
    },
    {
      id: 'obj-kitchen', type: 'kitchen', name: 'Main Kitchen & Pass',
      x: 380, y: 540, width: 220, height: 70, rotation: 0,
      color: '#2A1E14', isLocked: true, area: 'indoor'
    },
    {
      id: 'obj-stage', type: 'stage', name: 'Live Music & Performance Stage',
      x: 640, y: 540, width: 200, height: 70, rotation: 0,
      color: '#E5B82C', isLocked: true, area: 'garden'
    },
    {
      id: 'obj-entrance', type: 'entrance', name: 'Main Entrance & Reception Desk',
      x: 870, y: 540, width: 100, height: 70, rotation: 0,
      color: '#6B8E5E', isLocked: true, area: 'indoor'
    }
  ]
};
