import { Star, ArrowUpRight, Play } from 'lucide-react';
import slugify from '@/lib/slugify';
import { Link } from 'react-router-dom';

type Room = {
  id?: string;
  _id?: string;
  name?: string;
  available?: boolean;
  price?: number;
  max_guests?: number;
  maxGuests?: number;
};

type Property = {
  id?: string;
  _id?: string;
  name?: string;
  location?: string;
  description?: string;
  images?: string[];
  price?: number;
  basePricePerNight?: number;
  price_from?: number;
  minNights?: number;
  rating?: number;
  reviews?: number;
  numReviews?: number;
  featured?: boolean;
  externalUrl?: string | null;
  rooms?: Room[];
  safari_rooms?: Room[];
  type?: string;
  category?: string;
  slug?: string;
};

interface PropertyCardProps {
  property: Property;
  index?: number;
  className?: string;
}

const isVideo = (url: string): boolean => {
  const lower = url.toLowerCase();
  return ['.mp4', '.webm', '.mov'].some(e => lower.includes(e))
    || ['youtube.com', 'youtu.be', 'vimeo.com'].some(h => lower.includes(h));
};

const ytId = (url: string) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : '';
};

export default function PropertyCard({ property, index = 0, className = '' }: PropertyCardProps) {
  const id       = property.id || property._id;
  const name     = property.name || 'Property';
  const location = property.location || '';
  const desc     = property.description || '';
  const price      = property.price_from || property.basePricePerNight || property.price || 0;
  const minNights  = property.minNights || 1;
  const rating   = property.rating || 4.5;
  const featured = property.featured || false;
  const type     = property.type || property.category || '';
  const rooms    = (property.rooms || property.safari_rooms || []) as Room[];
  const booked   = rooms.length > 0 && rooms.every(r => !r.available);
  const slug     = property.slug || slugify(name) || id;
  const img      = property.images?.[0] ?? null;

  const media = () => {
    if (!img) {
      return (
        <div className="w-full h-full bg-tbc-surface flex items-center justify-center">
          <span className="text-white/15 text-[10px] tracking-[0.3em] uppercase">No image</span>
        </div>
      );
    }
    if (isVideo(img)) {
      const isYT = img.includes('youtube') || img.includes('youtu.be');
      if (isYT) {
        return (
          <img
            src={`https://img.youtube.com/vi/${ytId(img)}/maxresdefault.jpg`}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
            onError={e => { e.currentTarget.src = `https://img.youtube.com/vi/${ytId(img)}/hqdefault.jpg`; }}
          />
        );
      }
      return (
        <video
          className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
          muted loop playsInline preload="metadata"
          onCanPlay={e => { const v = e.target as HTMLVideoElement; v.play().catch(() => {}); }}
        >
          <source src={img} type="video/mp4" />
          <source src={img} type="video/webm" />
        </video>
      );
    }
    return (
      <img
        src={img}
        alt={`${name} — luxury ${type || 'safari lodge'} in ${location}`}
        className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
        loading={index < 3 ? 'eager' : 'lazy'}
        decoding="async"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
    );
  };

  return (
    <Link
      to={property.externalUrl || `/property/${slug}`}
      className={`block group relative overflow-hidden bg-tbc-ink ${className}`}
      aria-label={`${name}${location ? ` — ${location}` : ''}`}
    >
      {/* ── Full-bleed image ── */}
      <div className="absolute inset-0">{media()}</div>

      {/* ── Gradient layers ── */}
      {/* Permanent bottom vignette — readable text */}
      <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink via-tbc-ink/30 to-transparent" />
      {/* Subtle top vignette for badges */}
      <div className="absolute inset-0 bg-gradient-to-b from-tbc-ink/50 via-transparent to-transparent" />
      {/* Hover: lighten mid slightly to lift image */}
      <div className="absolute inset-0 bg-tbc-ink/20 group-hover:bg-transparent transition-colors duration-700" />

      {/* ── Gold left-edge reveal ── */}
      <div className="absolute left-0 top-0 w-[2px] h-0 bg-tbc-gold group-hover:h-full transition-all duration-700 ease-in-out z-20" />

      {/* ── Top row ── */}
      <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
        {type && (
          <span className="text-[8px] tracking-[0.45em] uppercase font-light text-white/40 bg-tbc-ink/50 backdrop-blur-sm px-2.5 py-1">
            {type}
          </span>
        )}
        {featured && (
          <span className="text-[8px] tracking-[0.3em] uppercase font-medium text-tbc-earth bg-tbc-gold px-2.5 py-1 ml-auto">
            Featured
          </span>
        )}
        {!featured && (
          <div className="flex items-center gap-1.5 ml-auto">
            <Star className="w-3 h-3 text-tbc-gold fill-tbc-gold" aria-hidden="true" />
            <span className="text-white/55 text-[11px] font-light tabular-nums">{rating}</span>
          </div>
        )}
      </div>

      {/* Video play icon */}
      {img && isVideo(img) && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-14 h-14 border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* ── Sequential index — fades on hover ── */}
      <div className="absolute bottom-[88px] right-5 z-10 opacity-15 group-hover:opacity-0 transition-opacity duration-400 pointer-events-none" aria-hidden="true">
        <span className="text-[11px] font-extralight text-white tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* ── Bottom content ── */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-16 z-10">
        {/* Location line */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-px bg-tbc-gold/50 flex-shrink-0" aria-hidden="true" />
          <span className="text-white/38 text-[10px] tracking-[0.25em] uppercase font-light truncate">
            {location}
          </span>
        </div>

        {/* Property name */}
        <h3 className="text-[1.35rem] md:text-2xl font-extralight text-white leading-snug tracking-tight">
          {name}
        </h3>

        {/* Description — slides in on hover */}
        <div className="overflow-hidden max-h-0 group-hover:max-h-[4.5rem] transition-all duration-500 ease-in-out">
          <p className="text-white/42 text-sm font-light leading-relaxed line-clamp-2 mt-2.5 pr-2">
            {desc}
          </p>
        </div>

        {/* Price + CTA — fades in on hover */}
        <div className="flex items-center justify-between mt-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
          <div>
            {price > 0 ? (
              <>
                <span className="text-white/25 text-[9px] uppercase tracking-[0.15em]">From </span>
                <span className="text-tbc-gold text-lg font-extralight tabular-nums">${price}</span>
                <span className="text-white/25 text-xs font-light">
                  {minNights > 1 ? ` /${minNights} nights` : ' /night'}
                </span>
              </>
            ) : (
              <span className="text-white/25 text-[10px] tracking-[0.2em] uppercase font-light">Contact for rates</span>
            )}
          </div>
          <span className="text-tbc-gold text-[9px] tracking-[0.35em] uppercase font-light flex items-center gap-1.5">
            {booked ? 'View' : 'Explore'}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
