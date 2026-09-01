import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, MapPin, Users, ArrowLeft,
  ArrowUpRight, Star, Wifi, Car, Coffee, Utensils, Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import type { Property } from '@/hooks/useBackendProperties';
import slugify from '@/lib/slugify';
import Footer from '@/components/Footer';
import ImageLightbox from '@/components/ImageLightbox';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Room {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  type: string;
  maxGuests?: number;
  max_guests?: number;
  price: number;
  available: boolean;
  amenities: string[];
  images?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isVideo = (url: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return ['.mp4', '.webm', '.mov', '.avi'].some(e => lower.includes(e))
    || ['youtube.com', 'youtu.be', 'vimeo.com'].some(h => lower.includes(h));
};

type LucideIcon = React.ComponentType<{ className?: string }>;

const amenityIconMap: [string, LucideIcon][] = [
  ['wifi', Wifi], ['parking', Car], ['restaurant', Utensils],
  ['dining', Utensils], ['coffee', Coffee], ['car', Car],
];

function getAmenityIcon(amenity: string): LucideIcon | null {
  const key = amenity.toLowerCase();
  for (const [k, Icon] of amenityIconMap) {
    if (key.includes(k)) return Icon;
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoomDetail() {
  const { propertyId, roomSlug } = useParams<{ propertyId?: string; roomSlug?: string }>();
  const { properties, loading, error } = useBackendProperties();

  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showMoreThumbs, setShowMoreThumbs] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Resolve property + room from URL params
  useEffect(() => {
    if (!properties.length) return;

    let foundProp: Property | null = null;
    if (propertyId) {
      foundProp = properties.find(p => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pId = p.id || (p as any)._id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pSlug = (p as any).slug || '';
        return pId === propertyId || pSlug === propertyId || slugify(p.name || '') === propertyId;
      }) ?? null;
    }

    if (foundProp) {
      setProperty(foundProp);
      if (roomSlug) {
        const foundRoom = (foundProp.rooms || []).find(r => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rSlug = (r as any).slug || slugify(r.name || '');
          return rSlug === roomSlug;
        }) as Room | undefined;
        setRoom(foundRoom ?? null);
      }
      return;
    }

    // Fallback: scan all properties
    if (roomSlug) {
      for (const p of properties) {
        const match = (p.rooms || []).find(r => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rSlug = (r as any).slug || slugify(r.name || '');
          return rSlug === roomSlug;
        });
        if (match) { setProperty(p); setRoom(match as Room); break; }
      }
    }
  }, [properties, propertyId, roomSlug]);

  // Sticky nav observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [room]);

  const images = (room?.images?.length ? room.images : property?.images) ?? [];
  const heroImg = images[imgIdx] ?? '';
  const propertySlug = property ? (slugify(property.name || '') || propertyId || '') : (propertyId || '');

  const nextImg = () => setImgIdx(p => (p + 1) % images.length);
  const prevImg = () => setImgIdx(p => (p - 1 + images.length) % images.length);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-tbc-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-px h-14 bg-gradient-to-b from-transparent to-tbc-gold/60 animate-pulse" />
          <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase font-light">Loading</p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (error || !property || !room) {
    return (
      <div className="min-h-screen bg-tbc-ink flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-tbc-gold text-xs tracking-[0.3em] uppercase mb-3 font-light">Room Not Found</p>
          <p className="text-white/30 text-sm font-light mb-10">{error || 'The room you\'re looking for doesn\'t exist.'}</p>
          <Link
            to={propertyId ? `/property/${propertyId}` : '/collections'}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase font-light transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {propertyId ? 'Back to Property' : 'Back to Collection'}
          </Link>
        </div>
      </div>
    );
  }

  const maxGuests = room.maxGuests || room.max_guests || 2;
  const roomId = room.id || room._id || '';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-tbc-ink overflow-x-hidden">

      {/* ── Sticky Nav ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        stickyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="bg-tbc-ink/95 backdrop-blur-md border-b border-white/[0.06] px-8 md:px-16 py-4 flex items-center justify-between max-w-[1600px] mx-auto">
          <Link
            to={`/property/${propertySlug}`}
            className="flex items-center gap-2 text-white/45 hover:text-white text-[10px] tracking-[0.25em] uppercase font-light transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{property.name}</span>
          </Link>
          <span className="text-white/55 text-sm font-extralight tracking-wide hidden sm:block">{room.name}</span>
          <Link to={`/book?property=${property.id}&room=${roomId}`}>
            <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none h-9 px-6 text-[10px] tracking-[0.2em] uppercase font-medium">
              Book Now
            </Button>
          </Link>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} className="relative h-screen min-h-[720px] overflow-hidden -mt-[80px]">

        {/* Background */}
        <div key={imgIdx} className="absolute inset-0 overflow-hidden bg-tbc-ink">
          {heroImg && !isVideo(heroImg) ? (
            <>
              {/* Blurred fill — avoids empty bars when the photo's aspect ratio doesn't match the hero */}
              <img
                src={heroImg}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-50"
              />
              {/* Full photo — never cropped, so portrait/tall shots don't get zoomed in */}
              <img
                src={heroImg}
                alt={room.name}
                className="absolute inset-0 w-full h-full object-contain"
                fetchPriority="high"
              />
            </>
          ) : heroImg && isVideo(heroImg) ? (
            <video className="w-full h-full object-cover" muted loop playsInline autoPlay>
              <source src={heroImg} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full bg-tbc-surface" />
          )}
        </div>

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-tbc-ink/65 via-tbc-ink/15 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink/95 via-tbc-ink/20 to-tbc-ink/25 z-[1]" />

        {/* Frame */}
        <div className="absolute inset-8 md:inset-12 border border-white/[0.07] z-[2] pointer-events-none" />

        {/* Breadcrumb */}
        <Link
          to={`/property/${propertySlug}`}
          className="absolute top-10 left-10 z-30 flex items-center gap-2 text-white/45 hover:text-white text-[10px] tracking-[0.3em] uppercase font-light transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{property.name}</span>
        </Link>

        {/* Image nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prevImg} className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center border border-white/15 hover:border-white/40 bg-tbc-ink/20 hover:bg-tbc-ink/50 text-white/50 hover:text-white transition-all duration-300" aria-label="Previous image">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextImg} className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center border border-white/15 hover:border-white/40 bg-tbc-ink/20 hover:bg-tbc-ink/50 text-white/50 hover:text-white transition-all duration-300" aria-label="Next image">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Hero content — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-20 md:pb-28 px-10 md:px-16 max-w-[1600px] mx-auto w-full">
          <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-4">
            {room.type || 'Suite'}&nbsp;·&nbsp;{property.name}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extralight text-white leading-[0.92] tracking-tight mb-8">
            {room.name}
          </h1>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-tbc-gold text-tbc-gold" />
              ))}
            </div>
            <div className="flex items-center gap-2 text-white/35">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-light">Up to {maxGuests} guests</span>
            </div>
            {room.price > 0 && (
              <>
                <div className="w-px h-3 bg-white/15" />
                <span className="text-tbc-gold/70 text-[10px] tracking-[0.2em] uppercase font-light">
                  From ${room.price}&nbsp;/&nbsp;night
                </span>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-6 right-10 md:right-16 z-30 hidden sm:flex flex-col-reverse items-end gap-1.5">
            {/* Main row — stays pinned to the bottom */}
            <div className="flex items-end gap-1.5">
              {images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`overflow-hidden transition-all duration-400 ${
                    i === imgIdx ? 'w-16 h-10 ring-1 ring-tbc-gold' : 'w-10 h-7 opacity-35 hover:opacity-65'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                >
                  {isVideo(img) ? (
                    <div className="w-full h-full bg-tbc-surface flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 text-white/40" />
                    </div>
                  ) : (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
              {images.length > 5 && (
                <button
                  onClick={() => setShowMoreThumbs(v => !v)}
                  className="w-10 h-7 flex items-center justify-center border border-white/15 hover:border-white/40 text-white/45 hover:text-white text-[9px] tracking-wider font-light transition-all duration-300"
                  aria-label={showMoreThumbs ? 'Show fewer photos' : `View ${images.length - 5} more photos`}
                >
                  {showMoreThumbs ? '−' : `+${images.length - 5}`}
                </button>
              )}
            </div>

            {/* Expanded row — remaining images, revealed above the main row */}
            {showMoreThumbs && images.length > 5 && (
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[220px] md:max-w-[280px]">
                {images.slice(5).map((img, idx) => {
                  const i = idx + 5;
                  return (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`overflow-hidden transition-all duration-400 ${
                        i === imgIdx ? 'w-16 h-10 ring-1 ring-tbc-gold' : 'w-10 h-7 opacity-35 hover:opacity-65'
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    >
                      {isVideo(img) ? (
                        <div className="w-full h-full bg-tbc-surface flex items-center justify-center">
                          <Play className="w-2.5 h-2.5 text-white/40" />
                        </div>
                      ) : (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Dot indicators — mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex sm:hidden gap-1.5">
            {images.slice(0, 6).map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`h-0.5 rounded-full transition-all duration-500 ${
                  i === imgIdx ? 'bg-tbc-gold w-7' : 'bg-white/25 w-3'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STATS BAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-tbc-dark border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="flex flex-wrap divide-x divide-white/[0.05]">
            {[
              { label: 'Property', value: property.name || '—' },
              { label: 'Location', value: property.location || '—' },
              { label: 'Room Type', value: room.type || 'Suite' },
              { label: 'Capacity', value: `Up to ${maxGuests} guests` },
              room.price > 0 ? { label: 'From', value: `$${room.price} / night` } : null,
              { label: 'Availability', value: room.available ? 'Available' : 'Fully Booked' },
            ].filter(Boolean).map((stat, i) => (
              <div key={i} className="flex-1 min-w-[130px] py-7 px-6 first:pl-0">
                <p className="text-white/22 text-[8px] tracking-[0.4em] uppercase font-light mb-1.5">{stat!.label}</p>
                <p className={`text-sm font-light tracking-wide ${
                  stat!.label === 'Availability'
                    ? room.available ? 'text-tbc-gold/80' : 'text-white/40'
                    : 'text-white/75'
                }`}>
                  {stat!.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ABOUT — Description
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-tbc-earth py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.65fr] gap-16 lg:gap-28 items-start">

            {/* Left — name + meta */}
            <div>
              <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-6">About this Room</p>
              <h2 className="text-4xl md:text-5xl lg:text-[54px] font-extralight text-white/90 leading-[1.05] mb-8">
                {room.name}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-3.5 h-3.5 text-tbc-gold flex-shrink-0" />
                <span className="text-white/45 text-sm font-light tracking-wide">{property.location}</span>
              </div>
              <div className="flex items-center gap-2 mb-10 text-white/40">
                <Users className="w-3.5 h-3.5 text-tbc-gold/60 flex-shrink-0" />
                <span className="text-sm font-light tracking-wide">Up to {maxGuests} guests</span>
              </div>

              {room.price > 0 && (
                <div className="mb-12 pb-10 border-b border-white/[0.06]">
                  <span className="text-white/22 text-[9px] tracking-[0.35em] uppercase font-light">From</span>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-5xl font-extralight text-tbc-gold tabular-nums">${room.price}</span>
                    <span className="text-white/28 text-sm font-light">per night</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Link
                  to={`/book?property=${property.id}&room=${roomId}`}
                  className="group inline-flex items-center gap-3 text-tbc-gold text-[10px] tracking-[0.35em] uppercase font-light hover:text-tbc-gold/75 transition-colors duration-300"
                >
                  Reserve this Room
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to={`/property/${propertySlug}`}
                  className="group inline-flex items-center gap-3 text-white/30 text-[10px] tracking-[0.35em] uppercase font-light hover:text-white/55 transition-colors duration-300"
                >
                  View All Rooms
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Right — description */}
            <div>
              <div className="w-10 h-px bg-tbc-gold/45 mb-10" />
              <p className="text-xl md:text-[22px] text-white/60 leading-[1.9] font-extralight tracking-wide">
                {room.description ||
                  'A thoughtfully designed space blending luxury and comfort, offering an authentic connection to the surrounding wilderness. Every detail has been carefully considered to ensure an unforgettable stay.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GALLERY MOSAIC
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {images.length > 1 && (
        <section className="bg-tbc-ink" aria-label="Room gallery">
          <div className="flex flex-col lg:flex-row gap-px h-[60vh] min-h-[380px]">
            {/* Large image */}
            <div
              className="lg:w-[58%] h-[45%] lg:h-full overflow-hidden group cursor-pointer flex-shrink-0"
              onClick={() => setLightboxIdx(0)}
            >
              <img
                src={images[0]}
                alt={`${room.name} — main view`}
                className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>

            {/* 2×2 right grid */}
            <div className="lg:w-[42%] h-[55%] lg:h-full grid grid-cols-2 gap-px flex-1 lg:flex-none">
              {[1, 2, 3, 4].map(i =>
                images[i] ? (
                  <div
                    key={i}
                    className="overflow-hidden group cursor-pointer relative"
                    onClick={() => setLightboxIdx(i)}
                  >
                    <img
                      src={images[i]}
                      alt={`${room.name} — view ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                    {i === 4 && images.length > 5 && (
                      <div className="absolute inset-0 bg-tbc-ink/55 flex items-center justify-center group-hover:bg-tbc-ink/65 transition-colors duration-300">
                        <span className="text-white/75 text-xs tracking-[0.25em] uppercase font-light">
                          +{images.length - 5} more
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div key={i} className="bg-tbc-surface" />
                )
              )}
            </div>
          </div>

          {lightboxIdx !== null && (
            <ImageLightbox
              images={images}
              index={lightboxIdx}
              onClose={() => setLightboxIdx(null)}
              onIndexChange={setLightboxIdx}
              altPrefix={room.name}
            />
          )}
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          AMENITIES / INCLUSIONS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-tbc-dark py-20 md:py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="mb-14">
            <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-4">What's Included</p>
            <h2 className="text-3xl md:text-4xl font-extralight text-white/90">
              Room Inclusions
            </h2>
          </div>

          {room.amenities && room.amenities.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.03]">
                {room.amenities.map((amenity, i) => {
                  const Icon = getAmenityIcon(amenity);
                  const clean = amenity.replace(/\*+/g, '').trim();
                  return (
                    <div
                      key={i}
                      className="bg-tbc-dark p-6 flex items-center gap-4 group hover:bg-tbc-surface transition-colors duration-300 cursor-default"
                    >
                      <div className="w-8 h-8 border border-white/[0.07] flex items-center justify-center flex-shrink-0 group-hover:border-tbc-gold/25 transition-colors duration-300">
                        {Icon ? (
                          <Icon className="w-3.5 h-3.5 text-tbc-gold/55 group-hover:text-tbc-gold/80 transition-colors duration-300" />
                        ) : (
                          <div className="w-1 h-1 bg-tbc-gold/35 rounded-full" />
                        )}
                      </div>
                      <span className="text-white/55 text-sm font-light tracking-wide group-hover:text-white/80 transition-colors duration-300 leading-snug">
                        {clean}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footnotes for * / ** markers */}
              {room.amenities.some(a => a.includes('*')) && (
                <div className="mt-8 space-y-1.5">
                  {room.amenities.some(a => a.includes('**')) && (
                    <p className="text-white/25 text-xs font-light tracking-wide">
                      ** Service runs at no extra charge.
                    </p>
                  )}
                  {room.amenities.some(a => a.includes('*') && !a.includes('**')) && (
                    <p className="text-white/25 text-xs font-light tracking-wide">
                      * Additional services may be available at extra cost or subject to availability.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center border border-white/[0.05]">
              <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-light">
                Inclusions information coming soon
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA — Reserve
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-28 md:py-40 bg-tbc-ink overflow-hidden">
        {images.length > 0 && (
          <>
            <div className="absolute inset-0">
              <img
                src={images[images.length > 1 ? 1 : 0]}
                alt=""
                className="w-full h-full object-cover opacity-20"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-tbc-ink via-tbc-ink/75 to-tbc-ink" />
          </>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-16 text-center">
          <div className="w-px h-14 bg-tbc-gold/25 mx-auto mb-10" aria-hidden="true" />
          <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light mb-6">Begin Your Stay</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white/90 leading-[1.12] mb-8">
            Reserve the<br />
            <span className="italic text-tbc-gold">{room.name}</span>
          </h2>
          <p className="text-white/40 text-base font-light leading-relaxed max-w-lg mx-auto mb-14">
            An authentic connection to the wild, from the comfort of your private suite. Contact us to plan your stay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/book?property=${property.id}&room=${roomId}`}>
              <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-12 py-6 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:tracking-[0.25em]">
                Book This Room
                <ArrowUpRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link to={`/property/${propertySlug}`}>
              <Button className="bg-transparent hover:bg-white/[0.04] text-white/55 hover:text-white border border-white/12 hover:border-white/28 rounded-none px-12 py-6 text-xs tracking-[0.2em] uppercase font-light transition-all duration-300">
                View All Rooms
              </Button>
            </Link>
          </div>
          <div className="w-px h-14 bg-tbc-gold/25 mx-auto mt-10" aria-hidden="true" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
