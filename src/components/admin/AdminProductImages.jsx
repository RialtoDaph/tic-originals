import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Star } from 'lucide-react';

export default function AdminProductImages({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map((file) => base44.integrations.Core.UploadFile({ file }))
      );
      const urls = uploaded.map((u) => u?.file_url).filter(Boolean);
      onChange([...images, ...urls]);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));

  const makePrimary = (idx) => {
    if (idx === 0) return;
    const next = [...images];
    const [pick] = next.splice(idx, 1);
    next.unshift(pick);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-text">First image = main product image</span>
        <label className="cursor-pointer">
          <Button asChild size="sm" variant="outline" type="button">
            <span>
              {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
              Upload
            </span>
          </Button>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {images.length === 0 ? (
        <div className="border border-dashed p-6 text-center text-xs text-gray-text">No images yet</div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square border bg-muted overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-cyan text-dark-deep text-[9px] font-bold px-1.5 py-0.5 uppercase">Main</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {idx !== 0 && (
                  <button type="button" onClick={() => makePrimary(idx)} className="p-1.5 bg-white rounded text-dark hover:text-cyan-dark" title="Make main">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => remove(idx)} className="p-1.5 bg-white rounded text-destructive" title="Remove">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}