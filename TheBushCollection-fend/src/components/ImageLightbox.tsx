import { useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  altPrefix?: string;
}

// Full-screen viewer for browsing every image in a gallery — including the
// ones hidden behind a "+N more" tile. Closes on Escape / backdrop click,
// navigates with arrow keys or the on-screen controls.
export default function ImageLightbox({ images, index, onClose, onIndexChange, altPrefix = '' }: ImageLightboxProps) {
  const total = images.length;

  const goNext = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange]);
  const goPrev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, goNext, goPrev]);

  if (!total) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 z-10 w-11 h-11 flex items-center justify-center border border-white/15 hover:border-white/40 text-white/60 hover:text-white transition-colors duration-300"
        aria-label="Close gallery"
      >
        <X className="w-5 h-5" />
      </button>

      {total > 1 && (
        <span className="absolute top-7 left-6 text-white/40 text-[10px] tracking-[0.3em] uppercase font-light">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      )}

      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center border border-white/15 hover:border-white/40 bg-black/20 hover:bg-black/50 text-white/60 hover:text-white transition-all duration-300"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center border border-white/15 hover:border-white/40 bg-black/20 hover:bg-black/50 text-white/60 hover:text-white transition-all duration-300"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={`${altPrefix} — image ${index + 1}`}
        className="max-w-[92vw] max-h-[85vh] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />

      {total > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onIndexChange(i)}
              className={`flex-shrink-0 overflow-hidden transition-all duration-300 ${
                i === index ? 'w-14 h-9 ring-1 ring-tbc-gold' : 'w-9 h-6 opacity-40 hover:opacity-70'
              }`}
              aria-label={`Go to image ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
