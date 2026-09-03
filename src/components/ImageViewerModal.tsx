import React from 'react';
import { X, Download } from 'lucide-react';
import { DiaryAttachment } from '../types';

interface ImageViewerModalProps {
  attachment: DiaryAttachment;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  attachment,
  onClose,
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-zinc-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-zinc-800 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between text-white bg-zinc-900/90">
          <div>
            <h4 className="text-xs font-semibold truncate max-w-md">{attachment.name}</h4>
            <p className="text-[10px] text-zinc-400 font-mono">
              {(attachment.size / 1024).toFixed(1)} KB • Uploaded {new Date(attachment.uploadedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={attachment.dataUrl}
              download={attachment.name}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
              title="Download original"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
              aria-label="Close image viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950">
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="max-h-[75vh] max-w-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
