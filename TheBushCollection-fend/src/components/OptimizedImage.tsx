import React, { useEffect, useState } from 'react';

type OptimizedImageProps = {
  src: string;
  alt?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  placeholder?: string;
};

// Keep track of URLs we've already warned about to avoid log spam
const warnedUrls = new Set<string>();

export default function OptimizedImage({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  placeholder = '/placeholder-image.png',
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => (loading === 'eager' ? src : placeholder));

  useEffect(() => {
    let cancelled = false;

    // If this image is marked eager, start loading immediately (visible slide).
    if (loading === 'eager') {
      // currentSrc already set to src on init; still attach a loader to detect errors
      try {
        const img = new Image();
        img.decoding = decoding as any;
        img.onload = () => {
          // no-op — browser is already rendering from the same src
        };
        img.onerror = (ev) => {
          if (!cancelled) {
            if (!warnedUrls.has(src)) {
              console.warn('OptimizedImage failed to load (eager), fallback applied:', src, ev);
              warnedUrls.add(src);
            }
            setCurrentSrc(placeholder);
          }
        };
        img.src = src;
      } catch (err) {
        if (!cancelled) {
          if (!warnedUrls.has(src)) {
            console.warn('OptimizedImage encountered error when loading (eager):', src, err);
            warnedUrls.add(src);
          }
          setCurrentSrc(placeholder);
        }
      }
      return () => {
        cancelled = true;
      };
    }

    // Lazy path: do a HEAD probe then fall back to image loader
    async function tryHeadThenImage() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        let headOk = false;
        try {
          const resp = await fetch(src, { method: 'HEAD', mode: 'cors', signal: controller.signal });
          clearTimeout(timeout);
          if (resp && resp.ok) headOk = true;
        } catch (err) {
          // HEAD might be blocked by CORS or not supported - fall through to Image loader
        }

        if (headOk) {
          if (!cancelled) setCurrentSrc(src);
          return;
        }
      } catch (err) {
        // ignore and fallback to Image loader
      }

      try {
        const img = new Image();
        img.decoding = decoding as any;
        img.onload = () => {
          if (!cancelled) setCurrentSrc(src);
        };
        img.onerror = (ev) => {
          if (!cancelled) {
            if (!warnedUrls.has(src)) {
              console.warn('OptimizedImage failed to load, fallback applied:', src, ev);
              warnedUrls.add(src);
            }
            setCurrentSrc(placeholder);
          }
        };
        img.src = src;
      } catch (err) {
        if (!cancelled) {
          if (!warnedUrls.has(src)) {
            console.warn('OptimizedImage encountered error when loading:', src, err);
            warnedUrls.add(src);
          }
          setCurrentSrc(placeholder);
        }
      }
    }

    tryHeadThenImage();

    return () => {
      cancelled = true;
    };
  }, [src, decoding, placeholder]);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img src={currentSrc} alt={alt} className={className} loading={loading} decoding={decoding} />
  );
}
