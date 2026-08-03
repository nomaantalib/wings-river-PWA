export interface DiningTable {
  id: string;
  table_number: string;
  cluster_id: string;
  capacity: number;
  shape: 'rectangle' | 'round' | 'canopy';
  x_position: number;
  y_position: number;
  status: 'free' | 'eating' | 'needs_cleaning' | 'reserved';
  is_active: number;
  created_at?: string;
}

export interface TableCluster {
  id: string;
  name: string;
  description?: string;
  display_order?: number;
  tables?: DiningTable[];
}

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
  floor?: string;
  floor_id?: string;
  name?: string;
  updatedAt?: string;
  updated_at?: string;
  gridSize?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  objects?: FloorObject[];
  clusters?: TableCluster[];
  version?: number;
}

export interface TableOrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface TableOrder {
  id: string;
  order_number: string;
  table_id?: string;
  table_number: string;
  customer_name: string;
  customer_phone: string;
  order_type?: string;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  payment_status?: 'paid' | 'unpaid' | 'pending';
  payment_method?: string;
  razorpay_payment_id?: string;
  total_amount: number;
  items: TableOrderItem[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CallWaiterRequest {
  id: string;
  table_id: string;
  table_number: string;
  request_type: 'water' | 'spoon' | 'tissue' | 'waiter' | string;
  status: 'pending' | 'resolved';
  created_at?: string;
  resolved_at?: string;
  resolved_by?: string;
}
