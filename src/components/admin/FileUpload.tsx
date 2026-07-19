import React, { useRef, useState } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface FileUploadProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  fileType?: 'image' | 'pdf' | 'blueprint';
  label?: string;
  accept?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  fileType = 'image',
  label = 'Upload File',
  accept,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptAttr = accept ?? (fileType === 'image' ? 'image/jpeg,image/png,image/webp' : 'application/pdf');

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      const res = await apiFetch('/api/uploads', { method: 'POST', body: formData });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Upload failed');
      onChange(result.data.url, result.data.publicId);
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const isImage = fileType === 'image';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">
          {label}
        </label>
      )}

      {/* Preview */}
      {value && (
        <div className="relative inline-flex items-center gap-3 p-3 bg-brand-surface-container rounded-xl border border-white/8">
          {isImage ? (
            <img src={value} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-12 bg-brand-gold/10 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-brand-gold" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{value.split('/').pop()}</p>
            <p className="text-[10px] text-brand-on-surface-variant mt-0.5">Uploaded</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('', '')}
            className="p-1 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          dragging
            ? 'border-brand-gold/60 bg-brand-gold/5'
            : 'border-white/10 hover:border-brand-gold/30 hover:bg-white/[0.02]'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {uploading ? (
          <Loader2 size={24} className="text-brand-gold animate-spin" />
        ) : isImage ? (
          <ImageIcon size={24} className="text-brand-on-surface-variant" />
        ) : (
          <FileText size={24} className="text-brand-on-surface-variant" />
        )}
        <div className="text-center">
          <p className="text-xs text-brand-on-surface-variant">
            {uploading ? 'Uploading...' : (
              <>Drag & drop or <span className="text-brand-gold font-semibold">click to browse</span></>
            )}
          </p>
          <p className="text-[10px] text-brand-on-surface-variant/50 mt-1">
            {fileType === 'image' ? 'JPG, PNG, WEBP' : 'PDF only'} · Max {10}MB
          </p>
        </div>
        <UploadCloud size={16} className="text-brand-on-surface-variant/40" />
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
