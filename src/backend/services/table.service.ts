import { AppContext, D1Database } from '../types';
import { ensureTables } from '../utils/db';
import { sanitize } from '../utils/crypto';

export class TableService {
  static async getTables(db: D1Database | null) {
    if (!db) return { success: true, data: [], clusters: [] };
    try {
      await ensureTables(db);
      const [tables, clusters] = await Promise.all([
        db.prepare('SELECT * FROM tables WHERE is_active = 1 ORDER BY table_number ASC').all(),
        db.prepare('SELECT * FROM table_clusters ORDER BY display_order ASC').all()
      ]);
      return { success: true, data: tables.results || [], clusters: clusters.results || [] };
    } catch (e) {
      return { success: true, data: [], clusters: [] };
    }
  }

  static async getTableByNumber(db: D1Database | null, tableNum: string) {
    if (!db) return { success: true, data: { table_number: tableNum, status: 'free', capacity: 4 }, active_order: null, active_call_request: null };
    try {
      await ensureTables(db);
      const [tbl, activeOrder, activeCall] = await Promise.all([
        db.prepare('SELECT * FROM tables WHERE table_number = ?').bind(tableNum).first(),
        db.prepare("SELECT * FROM orders WHERE table_number = ? AND status NOT IN ('completed','cancelled') ORDER BY created_at DESC LIMIT 1").bind(tableNum).first(),
        db.prepare("SELECT * FROM call_requests WHERE table_number = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1").bind(tableNum).first()
      ]);
      return {
        success: true,
        data: tbl || { table_number: tableNum, status: 'free', capacity: 4 },
        active_order: activeOrder || null,
        active_call_request: activeCall || null
      };
    } catch (e) {
      return { success: true, data: { table_number: tableNum, status: 'free', capacity: 4 }, active_order: null, active_call_request: null };
    }
  }

  static getQrRedirect(c: AppContext, tableNum: string) {
    const host = c.req.header('host') || 'wings-river-pwa.pages.dev';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const targetUrl = `${protocol}://${host}/?table=${tableNum}`;
    return {
      success: true,
      table_number: tableNum,
      qr_redirect_url: targetUrl,
      qr_code_image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`
    };
  }

  static async createOrder(db: D1Database | null, tableNum: string, body: any) {
    const orderId = `ord-${Date.now()}`;
    const orderNum = `ORD-${Math.floor(100 + Math.random() * 900)}`;

    if (!db) {
      return { success: true, order_id: orderId, order_number: orderNum, table_number: tableNum };
    }

    try {
      await ensureTables(db);
      const items = body.items || [];
      const totalAmount = body.total_amount || items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

      await db
        .prepare("INSERT INTO orders (id, order_number, table_number, customer_name, customer_phone, order_type, status, total_amount, notes) VALUES (?, ?, ?, ?, ?, 'qr_dine_in', 'new', ?, ?)")
        .bind(orderId, orderNum, tableNum, sanitize(body.customer_name || 'Guest'), sanitize(body.customer_phone || ''), totalAmount, sanitize(body.notes || ''))
        .run();

      for (const item of items) {
        const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await db
          .prepare('INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(itemId, orderId, item.id || '', sanitize(item.name || ''), item.quantity || 1, item.price || 0, sanitize(item.notes || ''))
          .run();
      }

      await db.prepare("UPDATE tables SET status = 'eating' WHERE table_number = ?").bind(tableNum).run().catch(() => {});

      return { success: true, order_id: orderId, order_number: orderNum, table_number: tableNum };
    } catch (e) {
      return { success: true, order_id: orderId, order_number: orderNum, table_number: tableNum };
    }
  }

  static async callWaiter(db: D1Database | null, tableNum: string, reqTypeRaw: string) {
    const requestId = `call-${Date.now()}`;
    const reqType = sanitize(reqTypeRaw || 'Call Waiter');

    if (!db) return { success: true, request_id: requestId, table_number: tableNum, request_type: reqType };

    try {
      await ensureTables(db);
      await db
        .prepare("INSERT INTO call_requests (id, table_number, request_type, status) VALUES (?, ?, ?, 'pending')")
        .bind(requestId, tableNum, reqType)
        .run();
      return { success: true, request_id: requestId, table_number: tableNum, request_type: reqType };
    } catch (e) {
      return { success: true, request_id: requestId, table_number: tableNum, request_type: reqType };
    }
  }

  // Floor Plans
  static async getFloorPlan(db: D1Database | null, floorName: string = 'main') {
    if (!db) return { success: true, data: null };
    try {
      await ensureTables(db);
      const row = await db.prepare('SELECT layout_json FROM floor_plans WHERE floor_name = ?').bind(floorName).first() as any;
      if (row?.layout_json) {
        try { return { success: true, data: JSON.parse(row.layout_json) }; } catch (e) {}
      }
      const fallback = await db.prepare("SELECT value FROM settings WHERE key = 'floor_plan_layout'").first() as any;
      return { success: true, data: fallback?.value ? JSON.parse(fallback.value) : null };
    } catch (e) {
      return { success: true, data: null };
    }
  }

  static async saveFloorPlan(db: D1Database | null, floorName: string = 'main', layoutData: any) {
    if (!db) return { success: true };
    try {
      await ensureTables(db);
      const jsonString = JSON.stringify(layoutData);
      const id = `fp-${floorName}-${Date.now()}`;
      await db
        .prepare("INSERT INTO floor_plans (id, branch_id, floor_name, layout_json, updated_at) VALUES (?, 'wings_main', ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(floor_name) DO UPDATE SET layout_json = excluded.layout_json, updated_at = excluded.updated_at")
        .bind(id, floorName, jsonString)
        .run()
        .catch(() => {});

      await db
        .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('floor_plan_layout', ?)")
        .bind(jsonString)
        .run()
        .catch(() => {});

      return { success: true };
    } catch (e) {
      return { success: true };
    }
  }

  // Dining Sessions
  static async getDiningSession(db: D1Database | null, tableId: string) {
    const tableBase = { table_number: tableId, restaurant: 'Wings River Café', branch: 'Gomti Riverfront Lucknow', capacity: 4 };
    if (!db) return { success: true, table: { ...tableBase, status: 'available' }, activeSession: null };

    try {
      await ensureTables(db);
      const activeSession = await db
        .prepare("SELECT * FROM dining_sessions WHERE table_number = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1")
        .bind(tableId)
        .first();
      return {
        success: true,
        table: { ...tableBase, status: activeSession ? 'occupied' : 'available' },
        activeSession: activeSession || null
      };
    } catch (e) {
      return { success: true, table: { ...tableBase, status: 'available' }, activeSession: null };
    }
  }

  static async startDiningSession(db: D1Database | null, body: any) {
    const table_number = body.table_number || '';
    const customer_name = body.customer_name || 'Guest';
    const customer_phone = body.customer_phone || '';
    const sessionId = `ds-${Date.now()}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    if (db) {
      try {
        await ensureTables(db);
        await db
          .prepare("INSERT INTO dining_sessions (id, table_number, customer_name, customer_phone, started_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, 'active')")
          .bind(sessionId, table_number, customer_name, customer_phone, now, expiresAt)
          .run();

        await db
          .prepare("UPDATE tables SET status = 'eating' WHERE table_number = ?")
          .bind(table_number)
          .run()
          .catch(() => {});
      } catch (e) {}
    }

    return {
      success: true,
      session: { id: sessionId, table_number, customer_name, customer_phone, started_at: now, expires_at: expiresAt, status: 'active' }
    };
  }

  static async closeDiningSession(db: D1Database | null, body: any) {
    const session_id = body.session_id;
    const table_number = body.table_number;

    if (db) {
      try {
        await ensureTables(db);
        if (session_id) {
          await db.prepare("UPDATE dining_sessions SET status = 'closed' WHERE id = ?").bind(session_id).run();
        }
        if (table_number) {
          await db.prepare("UPDATE tables SET status = 'free' WHERE table_number = ?").bind(table_number).run().catch(() => {});
        }
      } catch (e) {}
    }

    return { success: true };
  }
}
