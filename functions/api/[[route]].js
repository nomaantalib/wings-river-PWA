// Cloudflare Workers + Hono Centralized CMS REST API Router
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { jwt, sign, verify } from 'hono/jwt';

const app = new Hono().basePath('/api');

const JWT_SECRET = 'wings_river_cafe_jwt_secret_2026_super_secure';

// Helper: Seed Audit Log
async function logAction(db, userId, action, details) {
  try {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.prepare("INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)")
      .bind(id, userId || 'anonymous', action, details)
      .run();
  } catch (e) {
    console.error('Audit Log Error:', e);
  }
}

// ── MIDDLEWARE: AUTHENTICATION & JWT ─────────────────────────────────────────
async function authMiddleware(c, next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized: Missing token' }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const decoded = await verify(token, JWT_SECRET);
    c.set('user', decoded);
    return await next();
  } catch (e) {
    return c.json({ success: false, error: 'Unauthorized: Invalid or expired token' }, 401);
  }
}

// Helper: SHA-256 Hasher
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── 1. AUTH / LOGIN ENDPOINT ────────────────────────────────────────────────
app.post('/auth/login', async (c) => {
  const db = c.env.DB;
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) {
      return c.json({ success: false, error: 'Username and password required' }, 400);
    }
    const user = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const hashed = await sha256(password);
    if (user.password_hash !== hashed) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    // Generate JWT token (expires in 24 hours)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    };
    const token = await sign(payload, JWT_SECRET);
    await logAction(db, user.id, 'LOGIN', `User ${username} logged in successfully.`);
    return c.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 2. USERS & ROLES ────────────────────────────────────────────────────────
app.get('/users', authMiddleware, async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT id, username, email, role, created_at FROM users ORDER BY username ASC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/users', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  if (operator.role !== 'Administrator') {
    return c.json({ success: false, error: 'Forbidden: Requires Admin role' }, 403);
  }
  try {
    const data = await c.req.json();
    const { username, password, email, role } = data;
    if (!username || !password) return c.json({ success: false, error: 'Username and password required' }, 400);
    const id = `usr-${Date.now()}`;
    const hashed = await sha256(password);
    await db.prepare("INSERT INTO users (id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)")
      .bind(id, username, hashed, email || '', role || 'Author')
      .run();
    await logAction(db, operator.id, 'CREATE_USER', `Created user ${username} with role ${role}`);
    return c.json({ success: true, message: 'User created' });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/users/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const targetId = c.req.param('id');
  if (operator.role !== 'Administrator') return c.json({ success: false, error: 'Forbidden' }, 403);
  if (targetId === operator.id) return c.json({ success: false, error: 'Cannot delete own account' }, 400);
  await db.prepare("DELETE FROM users WHERE id = ?").bind(targetId).run();
  await logAction(db, operator.id, 'DELETE_USER', `Deleted user with ID ${targetId}`);
  return c.json({ success: true, message: 'User deleted' });
});

// ── 3. MEDIA LIBRARY ────────────────────────────────────────────────────────
app.get('/media', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM media_library ORDER BY created_at DESC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/media', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const { url, alt_text, caption, category, file_size, dimensions } = await c.req.json();
    const id = `med-${Date.now()}`;
    await db.prepare("INSERT INTO media_library (id, url, alt_text, caption, category, file_size, dimensions) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, url, alt_text || '', caption || '', category || 'general', file_size || 0, dimensions || '')
      .run();
    await logAction(db, operator.id, 'UPLOAD_MEDIA', `Uploaded media item with url ${url}`);
    return c.json({ success: true, id, url });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/media/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("DELETE FROM media_library WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_MEDIA', `Deleted media ID ${id}`);
  return c.json({ success: true, message: 'Media deleted' });
});

// ── 4. PAGES ────────────────────────────────────────────────────────────────
app.get('/pages', async (c) => {
  const db = c.env.DB;
  const showDeleted = c.req.query('deleted') === '1' ? 1 : 0;
  const list = await db.prepare("SELECT * FROM pages WHERE is_deleted = ? ORDER BY display_order ASC, title ASC").bind(showDeleted).all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/pages', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `pg-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO pages (id, title, slug, content, status, display_order, version, is_deleted, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id,
      data.title || '',
      data.slug || id,
      data.content || '',
      data.status || 'draft',
      Number(data.display_order) || 0,
      Number(data.version) || 1,
      Number(data.is_deleted) || 0,
      data.published_at || null
    ).run();
    await logAction(db, operator.id, 'SAVE_PAGE', `Saved page: ${data.title}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/pages/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  const hard = c.req.query('hard') === '1';
  if (hard) {
    await db.prepare("DELETE FROM pages WHERE id = ?").bind(id).run();
    await logAction(db, operator.id, 'HARD_DELETE_PAGE', `Permanently deleted page ID ${id}`);
  } else {
    await db.prepare("UPDATE pages SET is_deleted = 1 WHERE id = ?").bind(id).run();
    await logAction(db, operator.id, 'SOFT_DELETE_PAGE', `Soft deleted page ID ${id}`);
  }
  return c.json({ success: true });
});

// ── 5. MENU CATEGORIES ──────────────────────────────────────────────────────
app.get('/categories', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM menu_categories WHERE is_deleted = 0 ORDER BY display_order ASC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/categories', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `cat-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO menu_categories (id, name, slug, description, display_order, is_deleted, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id,
      data.name || '',
      data.slug || id,
      data.description || '',
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_CATEGORY', `Saved menu category: ${data.name}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/categories/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE menu_categories SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_CATEGORY', `Soft deleted category ID ${id}`);
  return c.json({ success: true });
});

// ── 6. MENU ITEMS ───────────────────────────────────────────────────────────
app.get('/menu', async (c) => {
  const db = c.env.DB;
  const deleted = c.req.query('deleted') === '1' ? 1 : 0;
  const list = await db.prepare("SELECT * FROM menu_items WHERE is_deleted = ? ORDER BY display_order ASC, category_id ASC, name ASC").bind(deleted).all();
  const formatted = (list.results || []).map(r => ({
    ...r,
    is_veg: r.is_veg === 1 || r.is_veg === true,
    is_available: r.is_available === 1 || r.is_available === true
  }));
  return c.json({ success: true, data: formatted });
});

app.post('/menu', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `menu-${Date.now()}`;
    const isVeg = data.is_veg !== false ? 1 : 0;
    const isAvailable = data.is_available !== false ? 1 : 0;
    await db.prepare(`
      INSERT OR REPLACE INTO menu_items (id, category_id, name, description, price, is_veg, image_url, is_available, display_order, version, is_deleted, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id,
      data.category_id || 'cat-beverages',
      data.name || '',
      data.description || '',
      parseFloat(data.price) || 0.0,
      isVeg,
      data.image_url || '',
      isAvailable,
      Number(data.display_order) || 0,
      Number(data.version) || 1,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_MENU_ITEM', `Saved menu item: ${data.name}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/menu/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE menu_items SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_MENU_ITEM', `Soft deleted menu item ID ${id}`);
  return c.json({ success: true });
});

// ── 7. MENU PAGES ───────────────────────────────────────────────────────────
app.get('/menupages', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM menu_pages WHERE is_deleted = 0 ORDER BY page_number ASC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/menupages', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const categoriesStr = Array.isArray(data.categories) ? JSON.stringify(data.categories) : '[]';
    await db.prepare(`
      INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories, display_order, is_deleted, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      Number(data.page_number) || 1,
      data.title || '',
      data.subtitle || '',
      data.image || '',
      categoriesStr,
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_MENU_PAGE', `Saved menu booklet page ${data.page_number}`);
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/menupages/:page_number', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const page_number = Number(c.req.param('page_number'));
  await db.prepare("UPDATE menu_pages SET is_deleted = 1 WHERE page_number = ?").bind(page_number).run();
  await logAction(db, operator.id, 'DELETE_MENU_PAGE', `Soft deleted menu page ${page_number}`);
  return c.json({ success: true });
});

// ── 8. BLOGS ────────────────────────────────────────────────────────────────
app.get('/blogs', async (c) => {
  const db = c.env.DB;
  const deleted = c.req.query('deleted') === '1' ? 1 : 0;
  const list = await db.prepare("SELECT * FROM blogs WHERE is_deleted = ? ORDER BY created_at DESC").bind(deleted).all();
  const formatted = (list.results || []).map(r => {
    let imagesArr = [];
    try { imagesArr = JSON.parse(r.images || '[]'); } catch (e) {}
    return {
      ...r,
      images: Array.isArray(imagesArr) ? imagesArr : [],
      is_published: r.status === 'published'
    };
  });
  return c.json({ success: true, data: formatted });
});

app.post('/blogs', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `blog-${Date.now()}`;
    const imagesStr = Array.isArray(data.images) ? JSON.stringify(data.images) : '[]';
    const status = data.status || (data.is_published ? 'published' : 'draft');
    await db.prepare(`
      INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, author, read_time, status, version, is_deleted, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id,
      data.title || '',
      data.slug || id,
      data.excerpt || '',
      data.content || '',
      data.category || 'Food & Dining',
      data.cover_image || '',
      imagesStr,
      data.author || 'Wings River Team',
      data.read_time || '4 min read',
      status,
      Number(data.version) || 1,
      Number(data.is_deleted) || 0,
      data.published_at || null
    ).run();
    await logAction(db, operator.id, 'SAVE_BLOG', `Saved blog post: ${data.title}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/blogs/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE blogs SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_BLOG', `Soft deleted blog ID ${id}`);
  return c.json({ success: true });
});

// ── 9. PHOTO GALLERY ────────────────────────────────────────────────────────
app.get('/gallery', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM gallery WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC").all();
  const formatted = (list.results || []).map(r => ({
    ...r,
    featured: r.featured === 1 || r.featured === true
  }));
  return c.json({ success: true, data: formatted });
});

app.post('/gallery', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `gal-${Date.now()}`;
    const featured = data.featured ? 1 : 0;
    await db.prepare(`
      INSERT OR REPLACE INTO gallery (id, title, category, image_url, featured, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      data.category || 'Restaurant',
      data.image_url || '',
      featured,
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_GALLERY', `Saved gallery photo: ${data.title}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/gallery/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE gallery SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_GALLERY', `Soft deleted gallery ID ${id}`);
  return c.json({ success: true });
});

// ── 10. REVIEWS & TESTIMONIALS ──────────────────────────────────────────────
app.get('/reviews', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM reviews WHERE is_deleted = 0 ORDER BY created_at DESC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/reviews', async (c) => {
  const db = c.env.DB;
  try {
    const data = await c.req.json();
    const id = data.id || `rev-${Date.now()}`;
    const rating = parseInt(data.rating) || 5;
    const status = data.status || 'pending';
    await db.prepare(`
      INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.author_name || 'Anonymous Guest',
      rating,
      data.review_text || '',
      data.date_str || 'Just now',
      data.avatar_url || '',
      status,
      Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/reviews/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE reviews SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_REVIEW', `Soft deleted review ID ${id}`);
  return c.json({ success: true });
});

// ── 11. CONTACT & FEEDBACK MESSAGES ─────────────────────────────────────────
app.get('/contact', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM contact_messages WHERE is_deleted = 0 ORDER BY created_at DESC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/contact', async (c) => {
  const db = c.env.DB;
  try {
    const data = await c.req.json();
    const id = data.id || `msg-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO contact_messages (id, name, phone, email, message, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.message || '',
      data.status || 'unread',
      Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/contact/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE contact_messages SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_MESSAGE', `Soft deleted message ID ${id}`);
  return c.json({ success: true });
});

// ── 12. EVENT BANNERS ───────────────────────────────────────────────────────
app.get('/banners', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM event_banners WHERE is_deleted = 0 ORDER BY display_order ASC").all();
  const formatted = (list.results || []).map(r => ({
    ...r,
    is_active: r.status === 'published'
  }));
  return c.json({ success: true, data: formatted });
});

app.post('/banners', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `eb-${Date.now()}`;
    const status = data.status || (data.is_active ? 'published' : 'draft');
    await db.prepare(`
      INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      data.subtitle || '',
      data.image_url || '',
      data.cta_text || '',
      data.cta_link || '',
      status,
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_BANNER', `Saved event banner: ${data.title}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/banners/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE event_banners SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_BANNER', `Soft deleted banner ID ${id}`);
  return c.json({ success: true });
});

// ── 13. WATER SPORTS / RIDES ────────────────────────────────────────────────
app.get('/watersports', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM water_sports WHERE is_deleted = 0 ORDER BY display_order ASC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/watersports', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `ride-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.category || 'Water Sports',
      parseFloat(data.price) || 0.0,
      data.unit || 'Per Person',
      data.description || '',
      data.badge || '',
      data.image || '',
      data.emoji || '🏄',
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_RIDE', `Saved ride ticket: ${data.name}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/watersports/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE water_sports SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_RIDE', `Soft deleted ride ID ${id}`);
  return c.json({ success: true });
});

// ── 14. OFFERS & DISCOUNTS ──────────────────────────────────────────────────
app.get('/offers', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM offers_discounts WHERE is_deleted = 0").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/offers', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `off-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO offers_discounts (id, title, code, description, discount_value, discount_type, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      data.code || id,
      data.description || '',
      parseFloat(data.discount_value) || 0.0,
      data.discount_type || 'percentage',
      data.status || 'draft',
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_OFFER', `Saved discount offer: ${data.title}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/offers/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE offers_discounts SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_OFFER', `Soft deleted offer ID ${id}`);
  return c.json({ success: true });
});

// ── 15. FAQS ────────────────────────────────────────────────────────────────
app.get('/faqs', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM faqs WHERE is_deleted = 0 ORDER BY display_order ASC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/faqs', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `faq-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO faqs (id, question, answer, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      id,
      data.question || '',
      data.answer || '',
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_FAQ', `Saved FAQ: ${data.question}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/faqs/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE faqs SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_FAQ', `Soft deleted FAQ ID ${id}`);
  return c.json({ success: true });
});

// ── 16. TEAM MEMBERS ────────────────────────────────────────────────────────
app.get('/team', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM team_members WHERE is_deleted = 0 ORDER BY display_order ASC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/team', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    const id = data.id || `tm-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO team_members (id, name, role, bio, image, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.role || '',
      data.bio || '',
      data.image || '',
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
    await logAction(db, operator.id, 'SAVE_TEAM', `Saved team member: ${data.name}`);
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/team/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE team_members SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_TEAM_MEMBER', `Soft deleted team member ID ${id}`);
  return c.json({ success: true });
});

// ── 17. RESERVATIONS & BOOKINGS ─────────────────────────────────────────────
app.get('/bookings', async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM reservations WHERE is_deleted = 0 ORDER BY date DESC, time DESC").all();
  return c.json({ success: true, data: list.results || [] });
});

app.post('/bookings', async (c) => {
  const db = c.env.DB;
  try {
    const data = await c.req.json();
    const id = data.id || `res-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO reservations (id, name, phone, email, booking_type, date, time, guests, special_requests, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.booking_type || 'table_booking',
      data.date || '',
      data.time || '',
      parseInt(data.guests) || 2,
      data.special_requests || '',
      data.status || 'pending',
      Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/bookings/:id', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  const id = c.req.param('id');
  await db.prepare("UPDATE reservations SET is_deleted = 1 WHERE id = ?").bind(id).run();
  await logAction(db, operator.id, 'DELETE_BOOKING', `Soft deleted reservation ID ${id}`);
  return c.json({ success: true });
});

// ── 18. SITE SETTINGS ───────────────────────────────────────────────────────
app.get('/hero', async (c) => {
  const db = c.env.DB;
  try {
    const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('wings_hero').first();
    const data = row ? JSON.parse(row.value) : null;
    return c.json({ success: true, data });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.post('/hero', authMiddleware, async (c) => {
  const db = c.env.DB;
  const operator = c.get('user');
  try {
    const data = await c.req.json();
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind('wings_hero', JSON.stringify(data)).run();
    await logAction(db, operator.id, 'SAVE_SETTINGS', `Updated layout settings.`);
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 19. AUDIT LOGS ──────────────────────────────────────────────────────────
app.get('/logs', authMiddleware, async (c) => {
  const db = c.env.DB;
  const list = await db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50").all();
  return c.json({ success: true, data: list.results || [] });
});

export const onRequest = handle(app);
