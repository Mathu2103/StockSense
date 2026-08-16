import React, { useRef, useState } from 'react';
import { UploadService } from '../../../../../services/uploadService';
import { toast } from 'sonner';

type ProductImageUploaderProps = {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
};

export default function ProductImageUploader({ imageUrl, setImageUrl }: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await UploadService.uploadImage(file);
      if (res.success && res.url) {
        setImageUrl(res.url);
        toast.success('Image uploaded to Cloudinary successfully!');
      } else {
        toast.error('Failed to upload image.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePickClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <div
        onClick={handlePickClick}
        className={`relative group border-2 border-dashed border-outline-variant hover:border-primary bg-background rounded-xl p-6 h-48 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isUploading ? 'opacity-70 pointer-events-none' : ''
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-primary">Uploading to Cloudinary...</p>
          </div>
        ) : imageUrl ? (
          <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
            <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePickClick}
                className="bg-white text-on-surface hover:bg-slate-100 p-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">cached</span>
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-600 text-white hover:bg-red-700 p-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-slate-100 group-hover:bg-secondary-container rounded-full flex items-center justify-center mb-3 text-outline-variant group-hover:text-primary transition-all">
              <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
            </div>
            <h4 className="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">
              Click to Upload Image to Cloud
            </h4>
            <p className="text-[10px] text-outline mt-1 max-w-[180px]">
              JPG, PNG, WebP or GIF. Auto-optimized on Cloudinary.
            </p>
          </>
        )}
      </div>

      {imageUrl && !isUploading && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-xs text-red-600 font-bold hover:underline"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Remove Image Asset
          </button>
        </div>
      )}
    </div>
  );
}
