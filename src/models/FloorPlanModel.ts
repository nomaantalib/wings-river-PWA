import { FloorPlanLayout } from '@/types';

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

export type { FloorPlanLayout };

export const INITIAL_FLOOR_PLAN: FloorPlanLayout = {
  floor_id: 'main',
  name: 'Ground Floor & Riverfront Deck',
  updated_at: new Date().toISOString(),
  clusters: [
    {
      id: 'riverside',
      name: 'Riverfront Deck',
      description: 'Outdoor seating with view of Gomti river',
      display_order: 1,
      tables: [
        { id: 't1', table_number: 'T1', cluster_id: 'riverside', capacity: 2, shape: 'round', x_position: 80, y_position: 100, status: 'free', is_active: 1 },
        { id: 't2', table_number: 'T2', cluster_id: 'riverside', capacity: 4, shape: 'rectangle', x_position: 200, y_position: 100, status: 'eating', is_active: 1 },
        { id: 't3', table_number: 'T3', cluster_id: 'riverside', capacity: 2, shape: 'round', x_position: 340, y_position: 100, status: 'free', is_active: 1 },
        { id: 't4', table_number: 'T4', cluster_id: 'riverside', capacity: 4, shape: 'rectangle', x_position: 460, y_position: 100, status: 'free', is_active: 1 }
      ]
    },
    {
      id: 'garden',
      name: 'Open Garden Area',
      description: 'Ambient open air lawn',
      display_order: 2,
      tables: [
        { id: 't7', table_number: 'T7', cluster_id: 'garden', capacity: 4, shape: 'rectangle', x_position: 80, y_position: 240, status: 'free', is_active: 1 },
        { id: 't8', table_number: 'T8', cluster_id: 'garden', capacity: 4, shape: 'rectangle', x_position: 210, y_position: 240, status: 'free', is_active: 1 },
        { id: 't9', table_number: 'T9', cluster_id: 'garden', capacity: 6, shape: 'rectangle', x_position: 340, y_position: 240, status: 'eating', is_active: 1 },
        { id: 't13', table_number: 'T13', cluster_id: 'garden', capacity: 8, shape: 'canopy', x_position: 870, y_position: 240, status: 'reserved', is_active: 1 }
      ]
    }
  ]
};
