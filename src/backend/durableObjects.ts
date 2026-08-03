// Cloudflare Durable Objects Implementation for Wings River Café Realtime Sessions & Order Notifications

export class TableSessionDO {
  state: any;
  env: any;

  constructor(state: any, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const tableId = url.searchParams.get('tableId') || 'T1';

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      await this.state.storage.put('active_session', {
        tableId,
        sessionData: body,
        updatedAt: Date.now()
      });
      return new Response(JSON.stringify({ success: true, message: `Table ${tableId} session updated` }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await this.state.storage.get('active_session');
    return new Response(JSON.stringify({ success: true, session: session || null }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export class OrderNotifierDO {
  state: any;
  env: any;

  constructor(state: any, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method === 'POST') {
      const order = await request.json().catch(() => ({}));
      const existingOrders: any[] = (await this.state.storage.get('recent_orders')) || [];
      existingOrders.unshift({ ...order, timestamp: Date.now() });
      await this.state.storage.put('recent_orders', existingOrders.slice(0, 50));

      return new Response(JSON.stringify({ success: true, count: existingOrders.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orders = (await this.state.storage.get('recent_orders')) || [];
    return new Response(JSON.stringify({ success: true, orders }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
