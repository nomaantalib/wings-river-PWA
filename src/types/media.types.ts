export interface MediaItem {
  id: string;
  public_id?: string;
  secure_url: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  alt_text?: string;
  caption?: string;
  category?: string;
  folder?: string;
  tags?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}
