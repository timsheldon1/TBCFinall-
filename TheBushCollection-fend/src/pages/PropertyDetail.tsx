import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, MapPin, Users, Wifi, Car, Coffee, Utensils,
  ArrowLeft, ChevronLeft, ChevronRight, ArrowUpRight, Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBackendProperty } from '@/hooks/useBackendProperties';
import slugify from '@/lib/slugify';
import Footer from '@/components/Footer';
import ImageLightbox from '@/components/ImageLightbox';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoomData {
  id: string;
  name: string;
  description: string;
  type: string;
  maxGuests: number;
  price: number;
  available: boolean;
  amenities: string[];
  images: string[];
}

interface GroupedRoom {
  name: string;
  type: string;
  maxGuests: number;
  price: number;
  availableCount: number;
  totalCount: number;
  amenities: string[];
  images: string[];
  description: string;
  sampleRoomId: string;
  sampleRoomSlug: string;
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { property, loading, error } = useBackendProperty(id);
  const [heroIdx, setHeroIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showMoreThumbs, setShowMoreThumbs] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Redirect if externalUrl
  useEffect(() => {
    if (property?.externalUrl) window.location.href = property.externalUrl;
  }, [property]);

  // Sticky nav — appears once hero scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [property]);

  const nextHero = () => {
    if (property) setHeroIdx(p => (p + 1) % property.images.length);
  };
  const prevHero = () => {
    if (property) setHeroIdx(p => (p - 1 + property.images.length) % property.images.length);
  };

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

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-tbc-ink flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-tbc-gold text-xs tracking-[0.3em] uppercase mb-3 font-light">Unable to Load</p>
          <p className="text-white/35 text-sm font-light mb-10">{error}</p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase font-light transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (!property) {
    return (
      <div className="min-h-screen bg-tbc-ink flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-8 font-light">Property Not Found</p>
          <Link to="/collections">
            <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-10 py-5 text-xs tracking-[0.2em] uppercase font-medium">
              View Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Data preparation ──
  const images = property.images || [];
  const heroImg = images[heroIdx] ?? images[0] ?? '';
  const propertySlug = property.slug || slugify(property.name || '');
  const minNights = property.minNights || 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rooms: RoomData[] = (property.rooms || []).map((room: any) => ({
    id: room.id || room._id || '',
    name: room.name || 'Room',
    description: room.description || `${room.name} — accommodates up to ${room.maxGuests || room.max_guests || 2} guests.`,
    type: room.type || '',
    maxGuests: room.maxGuests || room.max_guests || 2,
    price: room.price || 0,
    available: room.available ?? true,
    amenities: room.amenities || [],
    images: room.images || [],
  }));

  const groupedRooms = rooms.reduce<GroupedRoom[]>((acc, room) => {
    const existing = acc.find(g => g.name === room.name);
    if (existing) {
      existing.totalCount++;
      if (room.available) existing.availableCount++;
      if (room.images.length && existing.images.length === 0) existing.images = room.images;
      if (room.amenities.length) existing.amenities = room.amenities;
    } else {
      acc.push({
        name: room.name,
        type: room.type,
        maxGuests: room.maxGuests,
        price: room.price,
        availableCount: room.available ? 1 : 0,
        totalCount: 1,
        amenities: room.amenities,
        images: room.images,
        description: room.description,
        sampleRoomId: room.id,
        sampleRoomSlug: slugify(room.name || room.id),
      });
    }
    return acc;
  }, []);

  // ── Render ──
  return (
    <div className="min-h-screen bg-tbc-ink overflow-x-hidden">

      {/* ── Sticky Navigation Bar ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          stickyVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-tbc-ink/95 backdrop-blur-md border-b border-white/[0.06] px-8 md:px-16 py-4 flex items-center justify-between max-w-[1600px] mx-auto">
          <Link
            to="/collections"
            className="flex items-center gap-2 text-white/45 hover:text-white text-[10px] tracking-[0.25em] uppercase font-light transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Collection
          </Link>
          <span className="text-white/60 text-sm font-extralight tracking-wide hidden sm:block">{property.name}</span>
          <Link to={`/book?property=${property.id}`}>
            <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none h-9 px-6 text-[10px] tracking-[0.2em] uppercase font-medium">
              Book Now
            </Button>
          </Link>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — Full Viewport
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section ref={heroRef} className="relative h-screen min-h-[720px] overflow-hidden -mt-[80px]">

        {/* Background media */}
        <div key={heroIdx} className="absolute inset-0 overflow-hidden bg-tbc-ink">
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
                alt={property.name}
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

        {/* Gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-tbc-ink/65 via-tbc-ink/15 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink/95 via-tbc-ink/20 to-tbc-ink/25 z-[1]" />

        {/* Frame line */}
        <div className="absolute inset-8 md:inset-12 border border-white/[0.07] z-[2] pointer-events-none" />

        {/* Back button */}
        <Link
          to="/collections"
          className="absolute top-10 left-10 z-30 flex items-center gap-2 text-white/45 hover:text-white text-[10px] tracking-[0.3em] uppercase font-light transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Collection</span>
        </Link>

        {/* Image counter — vertical right side */}
        {images.length > 1 && (
          <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3" aria-hidden="true">
            <span className="text-[9px] tracking-[0.4em] uppercase text-white/20 font-light [writing-mode:vertical-lr] rotate-180">
              {String(heroIdx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Arrow navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevHero}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center border border-white/15 hover:border-white/40 bg-tbc-ink/20 hover:bg-tbc-ink/50 text-white/50 hover:text-white transition-all duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextHero}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 flex items-center justify-center border border-white/15 hover:border-white/40 bg-tbc-ink/20 hover:bg-tbc-ink/50 text-white/50 hover:text-white transition-all duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Hero content — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-20 md:pb-28 px-10 md:px-16 max-w-[1600px] mx-auto w-full">
          <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-5">
            {property.type || 'Lodge'}&nbsp;·&nbsp;{property.location}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-[90px] font-extralight text-white leading-[0.92] tracking-tight mb-8">
            {property.name}
          </h1>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1" aria-label="5 star rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-tbc-gold text-tbc-gold" />
              ))}
            </div>
            {!!property.numReviews && (
              <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-light">
                {property.numReviews} Reviews
              </span>
            )}
            {!!property.basePricePerNight && (
              <>
                <div className="w-px h-3 bg-white/15" />
                <span className="text-tbc-gold/70 text-[10px] tracking-[0.2em] uppercase font-light">
                  From ${property.basePricePerNight}&nbsp;/&nbsp;night
                </span>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail strip — bottom right */}
        {images.length > 1 && (
          <div className="absolute bottom-6 right-10 md:right-16 z-30 hidden sm:flex flex-col-reverse items-end gap-1.5">
            {/* Main row — stays pinned to the bottom */}
            <div className="flex items-end gap-1.5">
              {images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIdx(i)}
                  className={`overflow-hidden transition-all duration-400 ${
                    i === heroIdx
                      ? 'w-16 h-10 ring-1 ring-tbc-gold'
                      : 'w-10 h-7 opacity-35 hover:opacity-65'
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
                      onClick={() => setHeroIdx(i)}
                      className={`overflow-hidden transition-all duration-400 ${
                        i === heroIdx
                          ? 'w-16 h-10 ring-1 ring-tbc-gold'
                          : 'w-10 h-7 opacity-35 hover:opacity-65'
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
                onClick={() => setHeroIdx(i)}
                className={`h-0.5 rounded-full transition-all duration-500 ${
                  i === heroIdx ? 'bg-tbc-gold w-7' : 'bg-white/25 w-3'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STATS BAR — key facts at a glance
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-tbc-dark border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="flex flex-wrap divide-x divide-white/[0.05]">
            {[
              { label: 'Location', value: property.location || '—' },
              { label: 'Category', value: property.type || 'Lodge' },
              { label: 'Rating', value: '5 Star' },
              property.basePricePerNight
                ? { label: 'From', value: `$${property.basePricePerNight} / night` }
                : null,
              groupedRooms.length > 0
                ? { label: 'Accommodation', value: `${groupedRooms.length} Room Type${groupedRooms.length !== 1 ? 's' : ''}` }
                : null,
            ].filter(Boolean).map((stat, i) => (
              <div key={i} className="flex-1 min-w-[140px] py-7 px-6 first:pl-0 last:pr-0">
                <p className="text-white/22 text-[8px] tracking-[0.4em] uppercase font-light mb-1.5">{stat!.label}</p>
                <p className="text-white/75 text-sm font-light tracking-wide">{stat!.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ABOUT — Description & Details
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-tbc-earth py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.65fr] gap-16 lg:gap-28 items-start">

            {/* Left — name, meta, CTA */}
            <div>
              <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-6">About the Property</p>
              <h2 className="text-4xl md:text-5xl lg:text-[56px] font-extralight text-white/90 leading-[1.05] mb-8">
                {property.name}
              </h2>
              <div className="flex items-center gap-2 mb-10">
                <MapPin className="w-3.5 h-3.5 text-tbc-gold flex-shrink-0" />
                <span className="text-white/45 text-sm font-light tracking-wide">{property.location}</span>
              </div>

              {/* Amenity chips */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-12">
                  {property.amenities.slice(0, 6).map((a, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 border border-white/[0.09] text-white/38 text-[9px] tracking-[0.2em] uppercase font-light hover:border-tbc-gold/25 hover:text-white/60 transition-colors duration-300 cursor-default"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Link
                  to={`/book?property=${property.id}`}
                  className="group inline-flex items-center gap-3 text-tbc-gold text-[10px] tracking-[0.35em] uppercase font-light hover:text-tbc-gold/75 transition-colors duration-300"
                >
                  Reserve Your Stay
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <button
                  onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group inline-flex items-center gap-3 text-white/30 text-[10px] tracking-[0.35em] uppercase font-light hover:text-white/55 transition-colors duration-300 text-left"
                >
                  View Rooms &amp; Suites
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>

            {/* Right — description & price */}
            <div>
              <div className="w-10 h-px bg-tbc-gold/45 mb-10" />
              <p className="text-xl md:text-[22px] text-white/60 leading-[1.9] font-extralight tracking-wide">
                {property.description ||
                  'Experience unparalleled luxury in the heart of the African wilderness. Each moment is carefully crafted to immerse you in the natural beauty and rich biodiversity of this remarkable ecosystem, while providing the comfort and elegance you deserve.'}
              </p>

              {property.basePricePerNight ? (
                <div className="mt-14 pt-12 border-t border-white/[0.06]">
                  <span className="text-white/22 text-[9px] tracking-[0.35em] uppercase font-light">From</span>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-5xl font-extralight text-tbc-gold tabular-nums">
                      ${property.basePricePerNight}
                    </span>
                    <span className="text-white/28 text-sm font-light">per night</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GALLERY MOSAIC — 1 large + 2×2 grid
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {images.length > 1 && (
        <section className="bg-tbc-ink" aria-label="Property gallery">
          <div className="flex flex-col lg:flex-row gap-px h-[65vh] min-h-[400px]">
            {/* Large image */}
            <div
              className="lg:w-[58%] h-[45%] lg:h-full overflow-hidden group cursor-pointer flex-shrink-0"
              onClick={() => setLightboxIdx(0)}
            >
              <img
                src={images[0]}
                alt={`${property.name} — main view`}
                className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>

            {/* 2×2 grid */}
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
                      alt={`${property.name} — view ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                    {/* "+more" overlay on last slot if there are more images */}
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
        </section>
      )}

      {lightboxIdx !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onIndexChange={setLightboxIdx}
          altPrefix={property.name}
        />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ROOMS & SUITES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="rooms-section" className="bg-tbc-earth py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-8 md:px-16">

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-4">Accommodation</p>
              <h2 className="text-4xl md:text-5xl font-extralight text-white/90 leading-tight">
                Rooms &amp; <span className="italic">Suites</span>
              </h2>
              {groupedRooms.length > 0 && (
                <p className="text-white/35 text-sm font-light mt-3">
                  {groupedRooms.length} room type{groupedRooms.length !== 1 ? 's' : ''} — exclusive wilderness access
                </p>
              )}
            </div>
            <Link
              to={`/book?property=${property.id}`}
              className="group flex items-center gap-3 text-tbc-gold/65 hover:text-tbc-gold text-[10px] tracking-[0.35em] uppercase font-light transition-colors duration-300 flex-shrink-0"
            >
              Book Your Stay
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {groupedRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px">
              {groupedRooms.map((room, index) => (
                <Link
                  key={room.sampleRoomId}
                  to={`/property/${propertySlug}/room/${room.sampleRoomSlug}`}
                  className="group relative overflow-hidden bg-tbc-ink block min-h-[420px] lg:min-h-[460px]"
                >
                  {/* Full-bleed image */}
                  <div className="absolute inset-0">
                    {room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-tbc-surface" />
                    )}
                  </div>

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink via-tbc-ink/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-tbc-ink/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-tbc-ink/20 group-hover:bg-tbc-ink/10 transition-colors duration-700" />

                  {/* Gold left edge */}
                  <div className="absolute left-0 top-0 w-[2px] h-0 bg-tbc-gold group-hover:h-full transition-all duration-700 ease-in-out z-20" />

                  {/* Top row */}
                  <div className="absolute top-5 left-6 right-6 flex items-start justify-between z-10">
                    <span className="text-[8px] tracking-[0.4em] uppercase text-white/25 font-light">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {room.availableCount > 0 ? (
                      <span className="text-[8px] tracking-[0.25em] uppercase text-tbc-gold/65 bg-tbc-ink/50 backdrop-blur-sm px-2.5 py-1 font-light">
                        Available
                      </span>
                    ) : (
                      <span className="text-[8px] tracking-[0.25em] uppercase text-white/25 bg-tbc-ink/50 backdrop-blur-sm px-2.5 py-1 font-light">
                        Fully Booked
                      </span>
                    )}
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-16 z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-px bg-tbc-gold/45 flex-shrink-0" />
                      <span className="text-white/55 text-[9px] tracking-[0.25em] uppercase font-light truncate">
                        {room.type || 'Suite'}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-extralight text-white leading-snug tracking-tight">
                      {room.name}
                    </h3>

                    {/* Description — reveals on hover */}
                    <div className="overflow-hidden max-h-0 group-hover:max-h-14 transition-all duration-500 ease-in-out">
                      <p className="text-white/80 text-sm font-light leading-relaxed mt-2 line-clamp-2 pr-2">
                        {room.description}
                      </p>
                    </div>

                    {/* Price + meta — fades in on hover */}
                    <div className="flex items-center justify-between mt-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                      <div className="flex items-center gap-4">
                        {room.price > 0 && (
                          <div>
                            <span className="text-white/60 text-[8px] uppercase tracking-[0.15em]">From </span>
                            <span className="text-tbc-gold text-lg font-extralight tabular-nums">${room.price}</span>
                            <span className="text-white/60 text-xs">
                              {minNights > 1 ? ` /${minNights} nights` : ' /night'}
                            </span>
                          </div>
                        )}
                        <span className="text-white/65 text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {room.maxGuests}
                        </span>
                      </div>
                      <span className="text-tbc-gold text-[8px] tracking-[0.4em] uppercase font-light flex items-center gap-1.5">
                        View
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-white/[0.05]">
              <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase font-light">Room information coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          AMENITIES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {property.amenities && property.amenities.length > 0 && (
        <section className="bg-tbc-dark py-20 md:py-24 border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="mb-14">
              <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light mb-4">What's Included</p>
              <h2 className="text-3xl md:text-4xl font-extralight text-white/90">
                Amenities &amp; Inclusions
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.03]">
              {property.amenities.map((amenity, i) => {
                const Icon = getAmenityIcon(amenity);
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
                    <span className="text-white/50 text-sm font-light tracking-wide group-hover:text-white/75 transition-colors duration-300">
                      {amenity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA — Reserve Section
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative py-28 md:py-40 bg-tbc-ink overflow-hidden">
        {/* Atmospheric background */}
        {images.length > 0 && (
          <>
            <div className="absolute inset-0">
              <img
                src={images[images.length > 2 ? Math.floor(images.length / 2) : 0]}
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
          <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light mb-6">Begin Your Journey</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white/90 leading-[1.12] mb-8">
            Reserve Your Stay at<br />
            <span className="italic text-tbc-gold">{property.name}</span>
          </h2>
          <p className="text-white/40 text-base font-light leading-relaxed max-w-lg mx-auto mb-14">
            Crafted for those who seek an authentic connection with the wild — contact us to begin planning your perfect safari experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/book?property=${property.id}`}>
              <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-12 py-6 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:tracking-[0.25em]">
                Book This Property
                <ArrowUpRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="bg-transparent hover:bg-white/[0.04] text-white/55 hover:text-white border border-white/12 hover:border-white/28 rounded-none px-12 py-6 text-xs tracking-[0.2em] uppercase font-light transition-all duration-300">
                Enquire Now
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
