'use client';

import React, { useRef, useState } from 'react';
import { Upload, Link2, X, ImageIcon, Loader2, Check } from 'lucide-react';

interface ImageUploaderProps {
  value: string;                          // current image URL or base64
  onChange: (url: string) => void;        // called with base64 data URL or URL string
  label?: string;
  className?: string;
  previewHeight?: string;                 // e.g. 'h-48'
  accept?: string;
  maxSizeMB?: number;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image',
  className = '',
  previewHeight = 'h-48',
  accept = 'image/*',
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const safeValue = value || '';
  const [mode, setMode] = useState<'upload' | 'url'>(safeValue.startsWith('http') || safeValue.startsWith('/') ? 'url' : 'upload');
  const [urlInput, setUrlInput] = useState(safeValue.startsWith('http') || safeValue.startsWith('/') ? safeValue : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Sync state whenever the value prop changes from the parent component
  React.useEffect(() => {
    const val = value || '';
    setUrlInput(val);
    if (val.startsWith('http') || val.startsWith('/')) {
      setMode('url');
    }
  }, [value]);

  const processFile = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMB}MB.`);
      return;
    }
    const compressAndResize = (dataUrl: string, callback: (compressed: string) => void) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 700;
        const MAX_HEIGHT = 700;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
          callback(compressedDataUrl);
        } else {
          callback(dataUrl);
        }
      };
      img.onerror = () => callback(dataUrl);
      img.src = dataUrl;
    };

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      compressAndResize(result, (compressed) => {
        onChange(compressed);
        setLoading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2500);
      });
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setError('');
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasImage = Boolean(value);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</label>

      {/* Mode toggle */}
      <div className="flex items-center space-x-1 bg-dark-950/80 p-1 rounded-xl border border-white/10 w-fit">
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'upload' ? 'bg-amber-500 text-dark-950 shadow-md' : 'text-gray-400 hover:text-white'}`}>
          <Upload className="w-3.5 h-3.5" /><span>Upload from Device</span>
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'url' ? 'bg-amber-500 text-dark-950 shadow-md' : 'text-gray-400 hover:text-white'}`}>
          <Link2 className="w-3.5 h-3.5" /><span>Use URL / Path</span>
        </button>
      </div>

      {/* Upload Zone */}
      {mode === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${previewHeight} ${
            dragOver
              ? 'border-amber-400 bg-amber-400/10 scale-[1.01]'
              : hasImage
              ? 'border-green-500/50 bg-green-500/5 hover:border-green-400'
              : 'border-white/20 bg-white/5 hover:border-amber-400/60 hover:bg-amber-400/5'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Processing image…</p>
            </div>
          ) : hasImage ? (
            <>
              <img
                src={value}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-dark-950/60 rounded-2xl flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-amber-400 mb-1" />
                <p className="text-xs text-white font-bold">Click to replace image</p>
              </div>
              {uploadSuccess && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-green-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg">
                  <Check className="w-3 h-3" /><span>Uploaded!</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
                <ImageIcon className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Drop image here or <span className="text-amber-400 underline">browse device</span></p>
                <p className="text-[11px] text-gray-500 mt-1">JPG, PNG, WEBP, GIF · Max {maxSizeMB}MB</p>
              </div>
              {dragOver && <p className="text-xs text-amber-400 font-bold animate-bounce">Drop to upload!</p>}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* URL mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Paste image URL (e.g. https://... or /images/...)"
              value={urlInput}
              onChange={(e) => {
                const val = e.target.value;
                setUrlInput(val);
                onChange(val.trim());
                setError('');
              }}
              onBlur={() => {
                if (urlInput.trim()) onChange(urlInput.trim());
              }}
              className="flex-1 px-3.5 py-2.5 bg-dark-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              Apply
            </button>
          </div>
          {hasImage && (
            <div className={`relative ${previewHeight} rounded-2xl overflow-hidden bg-dark-950 flex items-center justify-center border border-white/10`}>
              <img
                src={value}
                alt="URL Preview"
                className="max-h-full max-w-full object-contain p-2"
                onError={() => setError('Invalid image URL or unable to load image preview.')}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white shadow-lg transition-colors"
                title="Clear image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center space-x-2 text-rose-400 text-[11px] bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
          <X className="w-3.5 h-3.5 shrink-0" /><span>{error}</span>
        </div>
      )}
    </div>
  );
}
