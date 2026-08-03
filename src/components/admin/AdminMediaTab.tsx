import React, { useState } from 'react';
import { Megaphone, Trash2, Plus, Upload, Check, Copy } from 'lucide-react';
import { MediaItem } from '@/types';

interface AdminMediaTabProps {
  mediaItems: MediaItem[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AdminMediaTab: React.FC<AdminMediaTabProps> = ({ mediaItems, onUpload, onDelete }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/40 border border-white/10 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" /> Media Library
          </h2>
          <p className="text-xs text-gray-400 mt-1">Manage Cloudinary media assets and image uploads.</p>
        </div>
        <label className="cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all">
          <Upload className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
        </label>
      </div>

      {mediaItems.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-black/20 border border-white/5 rounded-2xl">
          No media items in library. Click Upload to add your first asset.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all">
              <div className="aspect-square relative bg-neutral-900">
                <img src={item.url || item.secure_url} alt={item.alt_text || 'Media'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopy(item.url || item.secure_url, item.id)}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-500/30 hover:bg-red-500/50 text-red-300 rounded-lg text-xs"
                    title="Delete Media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-2.5 text-[11px] text-gray-400 truncate">
                {item.alt_text || item.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMediaTab;
