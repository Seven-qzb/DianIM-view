import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Copy, Check } from 'lucide-react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setRotation(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
    setRotation(0);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
    setRotation(0);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.5));
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentImage);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="image-gallery-overlay"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full flex items-center justify-between text-white/90 z-10 px-2 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full text-white/90">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-xs text-white/60">左右滑动或点击箭头切换图片</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
            title="顺时针旋转90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer flex items-center gap-1"
            title="复制图片链接"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={currentImage}
            download="image.png"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
            title="下载原图"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-500/80 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer ml-2"
            title="关闭 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {/* Left Arrow Button */}
        {images.length > 1 && (
          <button
            id="gallery-btn-prev"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs active:scale-90"
            title="上一张 (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Display Image */}
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage}
            alt={`Image ${currentIndex + 1}`}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
            className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-2xl transition-all duration-150"
          />
        </div>

        {/* Right Arrow Button */}
        {images.length > 1 && (
          <button
            id="gallery-btn-next"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs active:scale-90"
            title="下一张 (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl max-w-md overflow-x-auto custom-scrollbar z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setScale(1);
                setRotation(0);
              }}
              className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-[#2979ff] scale-105 shadow-md ring-2 ring-[#2979ff]/40'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
