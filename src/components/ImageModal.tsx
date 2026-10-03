import React from "react";
import { X, ZoomIn, Download } from "lucide-react";

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-[#17212b] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1621] border-b border-white/10 text-white">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <ZoomIn className="w-4 h-4 text-sky-400" />
            <span>មើលរូបថតលំហាត់ពេញលេញ (Full View)</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="homework-image.png"
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white"
              title="ទាញយករូបភាព"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image body */}
        <div className="p-2 sm:p-4 overflow-auto flex items-center justify-center bg-black/60">
          <img
            src={imageUrl}
            alt="Homework problem"
            className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
