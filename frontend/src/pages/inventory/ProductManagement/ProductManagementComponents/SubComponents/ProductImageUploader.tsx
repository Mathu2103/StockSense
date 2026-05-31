import React, { useRef } from 'react';

type ProductImageUploaderProps = {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
};

export default function ProductImageUploader({ imageUrl, setImageUrl }: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate direct front-end blob preview
    const preview = URL.createObjectURL(file);
    setImageUrl(preview);
  };

  const handlePickClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
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
      />

      <div
        onClick={handlePickClick}
        className="relative group border-2 border-dashed border-outline-variant hover:border-primary bg-background rounded-xl p-6 h-48 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
      >
        {imageUrl ? (
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
              Click to Upload Image
            </h4>
            <p className="text-[10px] text-outline mt-1 max-w-[180px]">
              Recommended 500x500 PNG or JPG. Max size: 2MB.
            </p>
          </>
        )}
      </div>

      {imageUrl && (
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
