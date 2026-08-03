import { AppContext, D1Database } from '../types';
import { ensureTables } from '../utils/db';
import { uploadToCloudinary, destroyCloudinaryAsset } from '../utils/cloudinary';

export class MediaService {
  static async getMediaList(db: D1Database | null, category?: string) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = category
        ? await db.prepare('SELECT * FROM media_library WHERE category = ? ORDER BY created_at DESC').bind(category).all()
        : await db.prepare('SELECT * FROM media_library ORDER BY created_at DESC').all();
      return { success: true, data: list.results || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  static async getMediaById(db: D1Database | null, id: string) {
    if (!db) return { success: true, data: null };
    try {
      const item = await db.prepare('SELECT * FROM media_library WHERE id = ? OR public_id = ?').bind(id, id).first() as any;
      if (!item) return { success: false, error: 'Image not found', status: 404 };
      return { success: true, data: item };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error fetching media', status: 500 };
    }
  }

  static async saveMediaRecord(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `med-${Date.now()}`;
    const secureUrl = data.secure_url || data.url || '';
    await db
      .prepare(
        'INSERT OR REPLACE INTO media_library (id, public_id, secure_url, url, width, height, format, alt_text, category, folder, tags, file_size, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(
        id, data.public_id || '', secureUrl, secureUrl, Number(data.width) || 0,
        Number(data.height) || 0, data.format || 'jpg', data.alt_text || '',
        data.category || 'general', data.folder || 'wings_river_cafe', data.tags || '',
        Number(data.file_size) || 0
      )
      .run();
    return { success: true, id, secure_url: secureUrl };
  }

  static async updateMediaRecord(db: D1Database | null, id: string, body: any, c: AppContext) {
    if (!db) return { success: true };
    await ensureTables(db);
    const item = await db.prepare('SELECT * FROM media_library WHERE id = ? OR public_id = ?').bind(id, id).first() as any;
    if (!item) return { success: false, error: 'Image not found', status: 404 };

    const newFile = body['file'];
    let { public_id: publicId, secure_url: secureUrl, width, height, format, file_size: fileSize } = item;

    if (newFile && typeof newFile !== 'string') {
      const cloudResult = await uploadToCloudinary(newFile, item.folder || 'wings_river_cafe', c, db);
      if (item.public_id) await destroyCloudinaryAsset(item.public_id, c, db);
      publicId = cloudResult.public_id;
      secureUrl = cloudResult.secure_url;
      width = cloudResult.width;
      height = cloudResult.height;
      format = cloudResult.format;
      fileSize = cloudResult.bytes || 0;
    }

    const altText = body['alt_text'] ?? item.alt_text;
    const category = body['category'] ?? item.category;
    const tags = body['tags'] ?? item.tags;

    await db
      .prepare(
        'UPDATE media_library SET public_id = ?, secure_url = ?, url = ?, width = ?, height = ?, format = ?, alt_text = ?, category = ?, tags = ?, file_size = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR public_id = ?'
      )
      .bind(publicId, secureUrl, secureUrl, width, height, format, altText, category, tags, fileSize, id, id)
      .run();

    return { success: true, id, secure_url: secureUrl };
  }

  static async deleteMediaRecord(db: D1Database | null, id: string, c: AppContext) {
    if (!db) return { success: true };
    const item = await db.prepare('SELECT public_id FROM media_library WHERE id = ? OR public_id = ?').bind(id, id).first() as any;
    if (item?.public_id) await destroyCloudinaryAsset(item.public_id, c, db);
    await db.prepare('DELETE FROM media_library WHERE id = ? OR public_id = ?').bind(id, id).run();
    return { success: true };
  }

  static async uploadMedia(c: AppContext, db: D1Database | null) {
    if (!db) {
      return { success: false, error: 'Database binding (D1) unconfigured.', status: 503 };
    }

    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') {
      return { success: false, error: 'No valid file provided', status: 400 };
    }

    const type = file.type || '';
    const name = file.name || '';
    const isImage = !type || type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(name);
    if (!isImage) {
      return { success: false, error: 'Only image files allowed.', status: 400 };
    }

    const category = (body['category'] as string) || 'general';
    const altText = (body['alt_text'] as string) || file.name || '';
    const folder = (body['folder'] as string) || 'wings_river_cafe';
    const tags = (body['tags'] as string) || '';

    const cloudResult = await uploadToCloudinary(file, folder, c, db);
    await ensureTables(db);

    const id = `med-${Date.now()}`;
    await db
      .prepare(
        'INSERT INTO media_library (id, public_id, secure_url, url, width, height, format, alt_text, category, folder, tags, file_size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      )
      .bind(
        id, cloudResult.public_id, cloudResult.secure_url, cloudResult.secure_url,
        cloudResult.width, cloudResult.height, cloudResult.format, altText, category,
        folder, tags, cloudResult.bytes || file.size || 0
      )
      .run();

    const saved = await db.prepare('SELECT * FROM media_library WHERE id = ?').bind(id).first() as any;
    return { success: true, url: cloudResult.secure_url, media_id: id, image: saved };
  }
}
