import { AppContext, D1Database } from '../types';
import { CONFIG } from '../config';
import { sha1 } from './crypto';

export async function getCloudinaryCreds(c: AppContext, db: D1Database | null) {
  let cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
  let apiKey = c.env?.CLOUDINARY_API_KEY;
  let apiSecret = c.env?.CLOUDINARY_API_SECRET;

  if ((!cloudName || !apiKey || !apiSecret) && db) {
    try {
      const row = await db.prepare("SELECT value FROM settings WHERE key = 'site_settings'").first() as any;
      if (row?.value) {
        const s = JSON.parse(row.value);
        cloudName = cloudName || s.cloudinary_cloud_name;
        apiKey = apiKey || s.cloudinary_api_key;
        apiSecret = apiSecret || s.cloudinary_api_secret;
      }
    } catch (e) {}
  }

  return {
    cloudName: cloudName || CONFIG.CLOUDINARY_DEFAULTS.cloudName,
    apiKey: apiKey || CONFIG.CLOUDINARY_DEFAULTS.apiKey,
    apiSecret: apiSecret || CONFIG.CLOUDINARY_DEFAULTS.apiSecret
  };
}

export async function uploadToCloudinary(file: any, folder: string, c: AppContext, db: D1Database | null) {
  const { cloudName, apiKey, apiSecret } = await getCloudinaryCreds(c, db);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await sha1(`folder=${folder}&timestamp=${timestamp}${apiSecret}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  const data: any = await res.json();
  if (res.ok && data.secure_url) {
    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      width: data.width || 0,
      height: data.height || 0,
      format: data.format || 'jpg',
      bytes: data.bytes || 0
    };
  }
  throw new Error(data.error?.message || 'Cloudinary upload failed');
}

export async function destroyCloudinaryAsset(publicId: string, c: AppContext, db: D1Database | null) {
  if (!publicId) return;
  try {
    const { cloudName, apiKey, apiSecret } = await getCloudinaryCreds(c, db);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await sha1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData
    });
  } catch (e) {}
}
