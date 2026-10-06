import {
  useState,
  useRef,
  useCallback,
  memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Star,
  MapPin,
  Users,
  Search,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Phone,
  Award,
  Shield,
} from 'lucide-react';
import slugify from '@/lib/slugify';
import { useBackendProperties, Property } from '@/hooks/useBackendProperties';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';
import { Link } from 'react-router-dom';
import { CollectionsSEO } from './CollectionsSEO';
import Footer from '@/components/Footer';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const safeCapitalize = (str: unknown): string => {
  if (typeof str !== 'string' || !str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Build a Cloudinary transform URL for responsive images */
const cdnImage = (url: string, width: number) =>
  url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);

/* ── Sub-components ─────────────────────────────────────────────────────── */

interface PropertyCardProps {
  property: Property;
  index: number;
}

const PropertyCard = memo(({ property, index }: PropertyCardProps) => {
  const slug = property.slug || slugify(property.name || '') || property.id;
  const price = property.price_from || property.basePricePerNight || property.price || 0;
  const minNights = property.minNights || 1;
  const rooms = property.rooms || property.safari_rooms || [];
  const isEven = index % 2 === 0;
  const imageUrl = property.images?.[0];

  return (
    <motion.article
      id={`property-${property.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.85, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`${property.name}, luxury safari lodge in ${property.location}`}
      className="border-b border-white/[0.05] last:border-0"
    >
      <Link to={`/property/${slug}`} className="block group" aria-label={`Explore ${property.name}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5">

          {/* ── Image — 3/5 ── */}
          <div className={`relative h-[360px] lg:h-[560px] overflow-hidden lg:col-span-3 ${!isEven ? 'lg:order-2' : ''}`}>
            {imageUrl ? (
              <img
                src={cdnImage(imageUrl, 1000)}
                srcSet={`${cdnImage(imageUrl, 600)} 600w, ${cdnImage(imageUrl, 1000)} 1000w, ${cdnImage(imageUrl, 1400)} 1400w`}
                sizes="(max-width: 1024px) 100vw, 60vw"
                alt={`${property.name}, ${safeCapitalize(property.type || property.category || 'safari lodge')} in ${property.location}`}
                className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                loading="lazy"
                decoding="async"
                width={1000}
                height={560}
              />
            ) : (
              <div className="w-full h-full bg-tbc-surface flex items-center justify-center text-white/10 text-sm font-light">No image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink/50 via-transparent to-transparent" />
            {/* Large index number — watermark style */}
            <span className="absolute top-6 left-7 text-[7rem] md:text-[9rem] font-light text-white/[0.07] leading-none select-none tabular-nums" aria-hidden="true">
              {pad(index + 1)}
            </span>
            {/* Category tag */}
            <span className="absolute bottom-7 left-7 text-[9px] tracking-[0.45em] uppercase font-light text-white/50 bg-tbc-ink/60 backdrop-blur-sm px-3.5 py-1.5">
              {safeCapitalize(property.type || property.category || 'safari')}
            </span>
            {/* Hover reveal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true">
              <div className="w-14 h-14 border border-white/30 bg-tbc-ink/20 backdrop-blur-sm flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* ── Content panel — 2/5 ── */}
          <div className={`bg-tbc-dark lg:col-span-2 ${!isEven ? 'lg:order-1' : ''} flex flex-col justify-center px-10 lg:px-14 py-12 lg:py-18`}>

            {/* Location */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-5 h-px bg-tbc-gold/50 flex-shrink-0" aria-hidden="true" />
              <span className="text-tbc-gold/65 text-[9px] tracking-[0.45em] uppercase font-light">
                {property.location}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-3xl md:text-4xl lg:text-[2.6rem] font-light text-white/90 leading-tight mb-5 group-hover:text-white transition-colors duration-500">
              {property.name}
            </h3>

            <div className="w-8 h-px bg-tbc-gold/35 mb-7" aria-hidden="true" />

            {/* Description */}
            <p className="text-white/35 text-sm font-light leading-[1.85] line-clamp-3 mb-9">
              {property.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-5 pb-8 border-b border-white/[0.06] text-xs mb-8">
              <div className="flex items-center gap-1.5" aria-label={`Rated ${property.rating} out of 5`}>
                <Star className="h-3 w-3 text-tbc-gold fill-tbc-gold flex-shrink-0" aria-hidden="true" />
                <span className="text-white/50 font-light">{property.rating}</span>
                <span className="text-white/20 font-light">({property.reviews || property.numReviews || 0})</span>
              </div>
              {rooms.length > 0 && (
                <>
                  <div className="w-px h-3 bg-white/10" aria-hidden="true" />
                  <div className="flex items-center gap-1.5 text-white/30 font-light">
                    <Users className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    <span>{rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[9px] tracking-[0.25em] uppercase text-white/25 font-light block mb-1.5">From</span>
                <span className="text-tbc-gold text-3xl font-light tabular-nums">${price}</span>
                <span className="text-white/25 text-sm font-light ml-1">
                  {minNights > 1 ? `/ ${minNights} nights` : '/ night'}
                </span>
              </div>
              <span className="text-[9px] tracking-[0.3em] uppercase font-light text-white/30 group-hover:text-tbc-gold flex items-center gap-1.5 transition-colors duration-300 pb-1" aria-hidden="true">
                Explore <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>
        </div>
      </Link>
    </motion.article>
  );
});
PropertyCard.displayName = 'PropertyCard';

/* ── FAQ data ────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'What is the best time to go on safari in Kenya?',
    a: 'Peak wildlife viewing runs July–October during the Great Migration in the Masai Mara. The dry seasons (June–October and January–February) offer excellent game viewing across all parks. The Bush Collection operates year-round and tailors itineraries to every season.',
  },
  {
    q: 'How do I choose the right safari lodge in Kenya?',
    a: "Choosing a lodge depends on your preferred ecosystem, travel style, and group size. Our collection spans private conservancies, tented bush camps, coastal retreats, and highland sanctuaries. Our travel experts match you to properties based on your priorities, whether that's the Big Five, the Migration, or pure seclusion.",
  },
  {
    q: 'What is typically included in a luxury safari package?',
    a: 'Most luxury packages include full-board accommodation, twice-daily game drives with expert naturalist guides, bush walks, airstrip transfers, and national park fees. Rates vary by property and season. Contact us for a transparent, bespoke itinerary.',
  },
  {
    q: 'Do I need to overnight in Nairobi before my safari?',
    a: 'Most international flights arrive at Jomo Kenyatta International Airport. An overnight Nairobi stay lets you rest, adjust to the time zone, and depart early for your bush destination. We recommend partner hotels in Karen and near the airport for pre-safari nights.',
  },
  {
    q: 'Are The Bush Collection properties suitable for families?',
    a: "Many of our properties welcome families with private vehicles, dedicated family tents or suites, and child-friendly activities. Some conservancies have minimum age requirements for certain game drives. We'll advise on the best family-friendly options.",
  },
];

/* ── Main Component ─────────────────────────────────────────────────────── */

const Collections = () => {
  const { properties, loading, error } = useBackendProperties();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(typeDropdownRef, useCallback(() => setTypeDropdownOpen(false), []));
  useOutsideClick(locationDropdownRef, useCallback(() => setLocationDropdownOpen(false), []));
  useOutsideClick(searchWrapperRef, useCallback(() => setSearchFocused(false), []));

  const { propertyTypes, filteredProperties, nonNairobiProperties, nairobiHotels, safariLocations } =
    usePropertyFilters(properties, { searchTerm, selectedType, selectedLocation });

  /* Derived stats for SEO schema counts */
  const propertyCount = properties.length;
  const destinationCount = safariLocations.length;

  /* ── Callbacks ── */
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedLocation('all');
  }, []);

  /* ── No early-return gate: hero, filter bar, and editorial sections
     render immediately. The property list shows skeletons while loading. ── */

  return (
    <>
      {/* ── SEO Metadata ── */}
      <CollectionsSEO
        propertyCount={propertyCount}
        destinationCount={destinationCount}
      />

      <div className="min-h-screen bg-tbc-earth">

        {/* ══════════════════════════════════════════════════════════════
    HERO
══════════════════════════════════════════════════════════════ */}
<section
  className="relative h-screen min-h-[720px] overflow-hidden bg-tbc-earth -mt-[80px]"
  aria-labelledby="hero-heading"
>
  {/* LCP hero image — NO lazy load, fetchpriority high */}
  <div className="absolute inset-0 animate-[kenburns_25s_ease-in-out_infinite_alternate]">
    <img
      src="https://res.cloudinary.com/dfaakg2ds/image/upload/v1784699851/J26-1126_eedtwc.jpg"
      alt="Mwazaro Beach Lodge, luxury Kenya coast safari property, The Bush Collection"
      className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
      fetchPriority="high"
      decoding="sync"
      width={1920}
      height={1080}
    />
  </div>

  {/* Overlays */}
  <div className="absolute inset-0 bg-gradient-to-t from-tbc-earth via-tbc-earth/40 to-transparent" aria-hidden="true" />
  <div className="absolute inset-0 bg-gradient-to-r from-tbc-earth/70 via-tbc-earth/20 to-transparent" aria-hidden="true" />
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-tbc-earth to-transparent" aria-hidden="true" />

  {/* Film grain */}
  <div
    className="absolute inset-0 opacity-[0.015] pointer-events-none"
    aria-hidden="true"
    style={{
      backgroundImage:
        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
    }}
  />

  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-[#c9a961]/40 to-transparent z-10" aria-hidden="true" />

  {/* ── Hero content ── */}
  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end pt-[80px]" style={{ top: '80px' }}>
    <div className="max-w-7xl w-full mx-auto px-8 md:px-16 pb-20 md:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-[1px] bg-tbc-gold" aria-hidden="true" />
          <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light">
            The Bush Collection
          </p>
        </div>

        <h1
          id="hero-heading"
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight text-white leading-[0.95] mb-8"
        >
          Our
          <br />
          <span className="italic text-tbc-gold/90">Collections</span>
        </h1>

        <p className="sr-only">
          Browse The Bush Collection's curated portfolio of luxury safari lodges, tented camps,
          and beachfront retreats across Kenya and Tanzania. Handpicked for over 40 years,
          our East Africa safari properties span the Masai Mara, Amboseli, Laikipia, Tsavo, Serengeti,
          and the Kenya coast. Find the perfect Kenya safari package or Tanzania safari experience.
        </p>

        <p className="text-white text-base md:text-lg font-light leading-relaxed max-w-xl mb-10">
          Handpicked luxury safari lodges, tented camps &amp; coastal retreats spanning the breadth
          of Kenya and Tanzania, each chosen for its soul, since 1983.
        </p>

        <div className="flex items-center gap-6">
          <span className="text-white text-[10px] tracking-[0.3em] uppercase font-light">
            Spanning Across East Africa
          </span>
          <div className="w-[1px] h-4 bg-white/10" aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  </div>

  {/* Vertical editorial text */}
  <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 z-20" aria-hidden="true">
    <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
      Curated Safari Portfolio · Since 1983
    </span>
  </div>

  {/* Scroll indicator */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-[scrollbounce_2s_ease-in-out_infinite]" aria-hidden="true">
    <div className="w-[1px] h-8 bg-gradient-to-b from-[#c9a961]/40 to-transparent" />
  </div>
</section>

        {/* ══════════════════════════════════════════════════════════════
            SOCIAL PROOF / TRUST STRIP
        ══════════════════════════════════════════════════════════════ */}
        <aside
          className="bg-tbc-dark border-b border-white/[0.04] py-5"
          aria-label="Trust signals and awards"
        >
          <div className="max-w-6xl mx-auto px-8 md:px-16">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {[
                { icon: <Award className="w-4 h-4 text-tbc-gold" />, text: 'Trusted Since 1983' },
                { icon: <Star className="w-4 h-4 text-tbc-gold fill-tbc-gold" />, text: '4.9 / 5 Average Rating' },
                { icon: <Shield className="w-4 h-4 text-tbc-gold" />, text: 'ATTA Member' },
                { icon: <MapPin className="w-4 h-4 text-tbc-gold" />, text: `${destinationCount}+ Destinations` },
                { icon: <Users className="w-4 h-4 text-tbc-gold" />, text: 'Expert Local Guides' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {item.icon}
                  <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-light whitespace-nowrap">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════════════
            SEARCH & FILTER
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="relative py-10 bg-tbc-muted border-b border-white/[0.04]"
          aria-label="Filter safari properties"
        >
          <div className="max-w-6xl mx-auto px-8 md:px-16">
            <div role="search" className="flex flex-col md:flex-row items-stretch gap-3">

              {/* Search input */}
              <div className="flex-1 relative" ref={searchWrapperRef}>
                <div className="relative group">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-tbc-gold/60 transition-colors"
                    aria-hidden="true"
                  />
                  <Input
                    id="property-search"
                    placeholder="Search by name, destination, or keyword..."
                    aria-label="Search safari properties by name, destination, or keyword"
                    className="pl-12 h-14 bg-transparent text-white/80 border-white/[0.06] hover:border-white/[0.12] focus:border-tbc-gold/30 placeholder:text-white/20 rounded-none text-sm tracking-wide transition-all duration-300 font-light"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    autoComplete="off"
                  />
                </div>

                {/* Search results dropdown */}
                <AnimatePresence>
                  {searchFocused && (
                    <motion.div
                      id="search-results-dropdown"
                      role="listbox"
                      aria-label="Search results"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#2a2523] border border-white/[0.08] shadow-2xl shadow-black/50 max-h-80 overflow-y-auto"
                    >
                      {filteredProperties.length === 0 ? (
                        <div className="px-5 py-6 text-center">
                          <p className="text-white/30 text-xs font-light">No properties found</p>
                        </div>
                      ) : (
                        <>
                          <div className="px-5 py-3 border-b border-white/[0.06]">
                            <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light">
                              {filteredProperties.length}{' '}
                              {filteredProperties.length === 1 ? 'property' : 'properties'} found
                            </p>
                          </div>
                          {filteredProperties.map((property) => (
                            <button
                              key={property.id}
                              role="option"
                              aria-selected={false}
                              type="button"
                              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors duration-150 text-left group/item"
                              onClick={() => {
                                setSearchFocused(false);
                                const el = document.getElementById(`property-${property.id}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  el.classList.add('ring-2', 'ring-[#c9a961]/40');
                                  setTimeout(() => el.classList.remove('ring-2', 'ring-[#c9a961]/40'), 2000);
                                }
                              }}
                            >
                              <div className="w-12 h-12 flex-shrink-0 overflow-hidden bg-tbc-ink">
                                {property.images?.[0] ? (
                                  <img
                                    src={cdnImage(property.images[0], 96)}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                    width={48}
                                    height={48}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/10">
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/80 text-sm font-light truncate group-hover/item:text-tbc-gold transition-colors duration-150">
                                  {property.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <MapPin className="w-3 h-3 text-tbc-gold/50 flex-shrink-0" aria-hidden="true" />
                                  <p className="text-white/30 text-xs font-light truncate">
                                    {property.location}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight
                                className="w-3.5 h-3.5 text-white/15 group-hover/item:text-tbc-gold group-hover/item:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                                aria-hidden="true"
                              />
                            </button>
                          ))}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Type dropdown */}
              <div className="relative md:w-48" ref={typeDropdownRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={typeDropdownOpen}
                  aria-label={`Filter by property type: ${selectedType === 'all' ? 'All Types' : safeCapitalize(selectedType)}`}
                  onClick={() => {
                    setTypeDropdownOpen(!typeDropdownOpen);
                    setLocationDropdownOpen(false);
                  }}
                  className="w-full h-14 px-5 bg-transparent text-white/60 border border-white/[0.06] hover:border-white/[0.12] rounded-none text-sm tracking-wide focus:outline-none focus:border-tbc-gold/30 transition-all duration-300 flex items-center justify-between font-light focus-visible:ring-2 focus-visible:ring-[#c9a961]/40"
                >
                  <span className="text-xs tracking-[0.15em] uppercase">
                    {selectedType === 'all' ? 'All Types' : safeCapitalize(selectedType)}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${typeDropdownOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {typeDropdownOpen && (
                  <ul
                    role="listbox"
                    aria-label="Property types"
                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#2a2523] border border-white/[0.08] shadow-2xl shadow-black/50 max-h-60 overflow-y-auto"
                  >
                    <li role="option" aria-selected={selectedType === 'all'}>
                      <button
                        type="button"
                        className={`w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase transition-colors duration-150 font-light ${
                          selectedType === 'all'
                            ? 'bg-tbc-gold/15 text-tbc-gold'
                            : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                        }`}
                        onClick={() => { setSelectedType('all'); setTypeDropdownOpen(false); }}
                      >
                        All Types
                      </button>
                    </li>
                    {propertyTypes.map((type: string, i: number) => (
                      <li key={type || `type-${i}`} role="option" aria-selected={selectedType === type}>
                        <button
                          type="button"
                          className={`w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase transition-colors duration-150 font-light ${
                            selectedType === type
                              ? 'bg-tbc-gold/15 text-tbc-gold'
                              : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                          }`}
                          onClick={() => { setSelectedType(type); setTypeDropdownOpen(false); }}
                        >
                          {safeCapitalize(type)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Location dropdown */}
              <div className="relative md:w-52" ref={locationDropdownRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={locationDropdownOpen}
                  aria-label={`Filter by location: ${selectedLocation === 'all' ? 'All Locations' : selectedLocation}`}
                  onClick={() => {
                    setLocationDropdownOpen(!locationDropdownOpen);
                    setTypeDropdownOpen(false);
                  }}
                  className="w-full h-14 px-5 bg-transparent text-white/60 border border-white/[0.06] hover:border-white/[0.12] rounded-none text-sm tracking-wide focus:outline-none focus:border-tbc-gold/30 transition-all duration-300 flex items-center justify-between font-light focus-visible:ring-2 focus-visible:ring-[#c9a961]/40"
                >
                  <span className="text-xs tracking-[0.15em] uppercase">
                    {selectedLocation === 'all' ? 'All Locations' : selectedLocation}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${locationDropdownOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {locationDropdownOpen && (
                  <ul
                    role="listbox"
                    aria-label="Safari destinations"
                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#2a2523] border border-white/[0.08] shadow-2xl shadow-black/50 max-h-60 overflow-y-auto"
                  >
                    <li role="option" aria-selected={selectedLocation === 'all'}>
                      <button
                        type="button"
                        className={`w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase transition-colors duration-150 font-light ${
                          selectedLocation === 'all'
                            ? 'bg-tbc-gold/15 text-tbc-gold'
                            : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                        }`}
                        onClick={() => { setSelectedLocation('all'); setLocationDropdownOpen(false); }}
                      >
                        All Locations
                      </button>
                    </li>
                    {safariLocations.map((loc: string, i: number) => (
                      <li key={loc || `loc-${i}`} role="option" aria-selected={selectedLocation === loc}>
                        <button
                          type="button"
                          className={`w-full text-left px-5 py-3.5 text-xs tracking-[0.1em] uppercase transition-colors duration-150 font-light ${
                            selectedLocation === loc
                              ? 'bg-tbc-gold/15 text-tbc-gold'
                              : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                          }`}
                          onClick={() => { setSelectedLocation(loc); setLocationDropdownOpen(false); }}
                        >
                          {loc}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Active filter pills */}
            <AnimatePresence>
              {(searchTerm || selectedType !== 'all' || selectedLocation !== 'all') && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 mt-6 flex-wrap"
                  role="status"
                  aria-live="polite"
                  aria-label={`${filteredProperties.length} properties match current filters`}
                >
                  <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase font-light">Active:</span>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      aria-label={`Remove search filter: ${searchTerm}`}
                      className="text-tbc-gold text-[10px] tracking-[0.15em] uppercase font-light border border-tbc-gold/15 px-3 py-1.5 hover:bg-tbc-gold/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#c9a961]/40"
                    >
                      &quot;{searchTerm}&quot; ×
                    </button>
                  )}
                  {selectedType !== 'all' && (
                    <button
                      onClick={() => setSelectedType('all')}
                      aria-label={`Remove type filter: ${selectedType}`}
                      className="text-tbc-gold text-[10px] tracking-[0.15em] uppercase font-light border border-tbc-gold/15 px-3 py-1.5 hover:bg-tbc-gold/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#c9a961]/40"
                    >
                      {safeCapitalize(selectedType)} ×
                    </button>
                  )}
                  {selectedLocation !== 'all' && (
                    <button
                      onClick={() => setSelectedLocation('all')}
                      aria-label={`Remove location filter: ${selectedLocation}`}
                      className="text-tbc-gold text-[10px] tracking-[0.15em] uppercase font-light border border-tbc-gold/15 px-3 py-1.5 hover:bg-tbc-gold/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#c9a961]/40"
                    >
                      {selectedLocation} ×
                    </button>
                  )}
                  <button
                    onClick={clearFilters}
                    aria-label="Clear all active filters"
                    className="text-white/25 text-[10px] tracking-[0.1em] uppercase font-light hover:text-white/50 transition-colors ml-1 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#c9a961]/40"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            EDITORIAL QUOTE / INTRO
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="relative py-28 md:py-36 bg-tbc-earth overflow-hidden"
          aria-labelledby="collection-intro-heading"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-[#c9a961]/20" aria-hidden="true" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-t from-transparent to-[#c9a961]/20" aria-hidden="true" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            aria-hidden="true"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '32px 32px' }}
          />

          <div className="max-w-5xl mx-auto px-8 md:px-16 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light mb-10">
                What Defines Us
              </p>
              <h2
                id="collection-intro-heading"
                className="text-3xl sm:text-4xl md:text-[2.75rem] font-extralight text-white/85 leading-[1.3] mb-10 max-w-4xl mx-auto"
              >
                Every luxury safari property in our collection is chosen for its{' '}
                <span className="italic text-tbc-gold">location</span>, its{' '}
                <span className="italic text-tbc-gold">character</span>, and its ability to deliver
                East African hospitality with{' '}
                <span className="italic text-tbc-gold">heartfelt warmth</span>.
              </h2>
              <div className="flex items-center justify-center gap-5">
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#c9a961]/30" aria-hidden="true" />
                <span className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-light">
                  40+ Years of Safari Heritage
                </span>
                <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#c9a961]/30" aria-hidden="true" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SAFARI PROPERTIES — EDITORIAL GRID
        ══════════════════════════════════════════════════════════════ */}
        {(loading || error || nonNairobiProperties.length > 0) && (
          <main id="safari-collection" className="bg-tbc-ink">

            {/* Section header */}
            <div className="max-w-7xl mx-auto px-8 md:px-16 pt-24 md:pt-32 pb-16 md:pb-20">
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-px bg-tbc-gold" aria-hidden="true" />
                      <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light">
                        Safari Collection
                      </p>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white/90 leading-[1.05]">
                      Luxury Safari Lodges
                      <br />
                      <span className="italic text-tbc-gold/80">&amp; Tented Camps</span>
                    </h2>
                  </div>
                  <div className="max-w-sm">
                    <p className="text-white/35 text-sm font-light leading-relaxed">
                      {nonNairobiProperties.length} exceptional Kenya and Tanzania safari destinations
                      handpicked across the most iconic landscapes in East Africa.
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-6 h-px bg-tbc-gold/40" aria-hidden="true" />
                      <span className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light flex items-center gap-2 flex-wrap">
                        <Link to="/bush-properties" className="hover:text-tbc-gold transition-colors duration-300">Bush Properties</Link>
                        ·
                        <Link to="/beach-properties" className="hover:text-tbc-gold transition-colors duration-300">Beach Properties</Link>
                        · Luxury · Conservation
                      </span>
                    </div>
                  </div>
                </div>
              </motion.header>
            </div>

            {/* Property cards */}
            <div
              role="feed"
              aria-label="Safari lodge and camp listings"
              aria-busy={loading}
              className="border-t border-white/[0.05]"
            >
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-1 lg:grid-cols-5 border-b border-white/[0.05] animate-pulse">
                    <div className="h-[360px] lg:h-[560px] lg:col-span-3 bg-tbc-surface" />
                    <div className="bg-tbc-dark lg:col-span-2 px-10 lg:px-14 py-12 space-y-5">
                      <div className="h-2.5 bg-white/[0.06] rounded w-1/3" />
                      <div className="h-8 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-px bg-white/[0.06] w-8" />
                      <div className="h-2.5 bg-white/[0.06] rounded w-full" />
                      <div className="h-2.5 bg-white/[0.06] rounded w-4/5" />
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="py-16 text-center">
                  <p className="text-tbc-gold text-xs tracking-[0.3em] uppercase mb-3">Could not load properties</p>
                  <p className="text-white/35 text-sm">{error}</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {nonNairobiProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Inline inquiry CTA */}
            <div className="max-w-7xl mx-auto px-8 md:px-16 py-20 md:py-28">
              <motion.div
                className="border border-white/[0.06] bg-tbc-dark p-10 md:p-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light mb-5">
                  Not Sure Where to Start?
                </p>
                <h3 className="text-3xl md:text-4xl font-light text-white/90 mb-5">
                  Let Our Experts Build Your Safari
                </h3>
                <p className="text-white/35 text-sm font-light leading-relaxed max-w-lg mx-auto mb-10">
                  With 40 years of on-the-ground experience, our team can recommend the perfect Kenya
                  or Tanzania safari package for your dates, group size, and interests.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact" aria-label="Contact us to plan your East Africa safari">
                    <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-10 py-5 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300">
                      Plan My Safari
                      <ArrowRight className="ml-3 w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <a
                    href="tel:+254700613165"
                    aria-label="Call The Bush Collection: +254 700 613165"
                    className="inline-flex items-center justify-center gap-2 border border-white/[0.1] hover:border-tbc-gold/30 text-white/40 hover:text-white/70 px-10 py-5 text-xs tracking-[0.2em] uppercase font-light transition-all duration-300"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    Call Us
                  </a>
                </div>
              </motion.div>
            </div>
          </main>
        )}

        {/* ══════════════════════════════════════════════════════════════
            NAIROBI HOTELS
        ══════════════════════════════════════════════════════════════ */}
        {nairobiHotels.length > 0 && (
          <section
            className="py-24 md:py-32 bg-tbc-earth"
            aria-labelledby="nairobi-hotels-heading"
          >
            <div className="max-w-7xl mx-auto px-8 md:px-16">
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mb-20"
              >
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-[1px] bg-tbc-gold" aria-hidden="true" />
                      <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-medium">
                        City Stays
                      </p>
                    </div>
                    <h2
                      id="nairobi-hotels-heading"
                      className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white/90 leading-[1.05]"
                    >
                      Nairobi Hotels
                      <br />
                      <span className="italic text-tbc-gold/80">Pre-Safari Stays</span>
                    </h2>
                  </div>
                  <p className="text-white/35 text-sm font-light max-w-sm leading-relaxed">
                    Most international flights arrive at Jomo Kenyatta International Airport in Nairobi.
                    Rest, adjust, and depart refreshed for your bush adventure.
                  </p>
                </div>
              </motion.header>

              {/* Our Hotels */}
              {(() => {
                const ownedHotels = nairobiHotels.filter(
                  h =>
                    h.name &&
                    (h.name.toLowerCase().includes('bush collection') ||
                      h.name.toLowerCase().includes('the bush') ||
                      h.featured === true),
                );
                return ownedHotels.length > 0 ? (
                  <div className="mb-20">
                    <div className="flex items-center gap-4 mb-12">
                      <h3 className="text-white/50 text-[10px] tracking-[0.3em] uppercase font-light">
                        Our Hotels
                      </h3>
                      <div className="flex-1 h-[1px] bg-white/[0.05]" aria-hidden="true" />
                      <span className="text-tbc-gold border border-tbc-gold/20 text-[9px] tracking-[0.2em] uppercase font-light px-4 py-1.5">
                        Book Direct
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ownedHotels.map((property, index) => {
                        const slug = property.slug || slugify(property.name || '') || property.id;
                        return (
                          <motion.article
                            key={property.id}
                            id={`property-${property.id}`}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.12 }}
                            aria-label={`${property.name}, Nairobi hotel`}
                          >
                            <div className="group relative overflow-hidden bg-tbc-surface border border-white/[0.04] hover:border-tbc-gold/15 transition-all duration-700">
                              <div className="relative h-72 overflow-hidden">
                                {property.images?.[0] ? (
                                  <img
                                    src={cdnImage(property.images[0], 800)}
                                    alt={`${property.name}, Nairobi hotel near safari departure point`}
                                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                                    loading="lazy"
                                    decoding="async"
                                    width={800}
                                    height={288}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-tbc-ink flex items-center justify-center text-white/15 text-sm font-light">
                                    No image
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-tbc-surface via-black/20 to-transparent" aria-hidden="true" />
                                <span className="absolute top-5 left-5 text-[9px] tracking-[0.4em] uppercase font-light text-tbc-gold bg-tbc-earth/70 backdrop-blur-md px-4 py-2">
                                  Nairobi
                                </span>
                                {property.featured && (
                                  <span className="absolute top-5 right-5 text-[9px] tracking-[0.4em] uppercase font-light text-tbc-earth bg-tbc-gold px-4 py-2">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <div className="p-8 md:p-10">
                                <h3 className="text-2xl md:text-3xl font-extralight text-white mb-3 group-hover:text-tbc-gold/90 transition-colors duration-500">
                                  {property.name}
                                </h3>
                                <div className="flex items-center text-white/35 text-sm font-light mb-5">
                                  <MapPin className="h-3.5 w-3.5 mr-2 text-tbc-gold/50" aria-hidden="true" />
                                  {property.location}
                                </div>
                                <div className="flex items-center gap-4 mb-6 text-xs">
                                  <div className="flex items-center gap-1" aria-label={`Rated ${property.rating}`}>
                                    <Star className="h-3.5 w-3.5 text-tbc-gold fill-tbc-gold" aria-hidden="true" />
                                    <span className="text-white/60 font-light">{property.rating}</span>
                                    <span className="text-white/25 font-light ml-0.5">
                                      ({property.reviews || property.numReviews || 0})
                                    </span>
                                  </div>
                                  {property.rooms?.length > 0 && (
                                    <>
                                      <div className="w-[1px] h-3 bg-white/10" aria-hidden="true" />
                                      <div className="flex items-center text-white/35 font-light">
                                        <Users className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                                        Up to{' '}
                                        {Math.max(
                                          ...property.rooms.map(
                                            r => r.maxGuests || r.max_guests || 1,
                                          ),
                                        )}{' '}
                                        guests
                                      </div>
                                    </>
                                  )}
                                </div>
                                <p className="text-white/35 text-sm font-light line-clamp-2 leading-relaxed mb-8">
                                  {property.description}
                                </p>
                                <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div>
                                    {(() => {
                                      const p = property.price_from || property.basePricePerNight || property.price || 0;
                                      const mn = property.minNights || 1;
                                      return (
                                        <>
                                          <span className="text-tbc-gold text-2xl md:text-3xl font-extralight">${p}</span>
                                          <span className="text-white/25 text-sm font-light ml-1.5">
                                            {mn > 1 ? `/ ${mn} nights` : '/ night'}
                                          </span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex gap-3">
                                    <Link
                                      to={`/property/${slug}`}
                                      aria-label={`View details for ${property.name}`}
                                      className="text-white/40 hover:text-tbc-gold text-[10px] tracking-[0.2em] uppercase font-light border border-white/[0.06] hover:border-tbc-gold/25 px-6 py-3 transition-all duration-300 inline-flex items-center"
                                    >
                                      Details
                                    </Link>
                                    <Link
                                      to={property.externalUrl ? property.externalUrl : `/book?property=${slug}`}
                                      {...(property.externalUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                      aria-label={`Book ${property.name} directly`}
                                      className="text-tbc-earth bg-tbc-gold hover:bg-tbc-gold-dark text-[10px] tracking-[0.2em] uppercase font-medium px-6 py-3 transition-all duration-300 inline-flex items-center"
                                    >
                                      Book Now
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Partner Hotels */}
              {(() => {
                const partnerHotels = nairobiHotels.filter(
                  h =>
                    h.name &&
                    !(
                      h.name.toLowerCase().includes('bush collection') ||
                      h.name.toLowerCase().includes('the bush') ||
                      h.featured === true
                    ),
                );
                return partnerHotels.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-4 mb-12">
                      <h3 className="text-white/50 text-[10px] tracking-[0.3em] uppercase font-light">
                        Partner Hotels
                      </h3>
                      <div className="flex-1 h-[1px] bg-white/[0.05]" aria-hidden="true" />
                      <span className="text-white/25 border border-white/[0.06] text-[9px] tracking-[0.2em] uppercase font-light px-4 py-1.5">
                        Information Only
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {partnerHotels.map((property, index) => (
                        <motion.article
                          key={property.id}
                          id={`property-${property.id}`}
                          initial={{ opacity: 0, y: 25 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          aria-label={`${property.name}, Nairobi partner hotel`}
                        >
                          <div className="group relative overflow-hidden bg-tbc-surface border border-white/[0.04] hover:border-white/[0.06] transition-all duration-700">
                            <div className="relative h-64 overflow-hidden">
                              {property.images?.[0] ? (
                                <img
                                  src={cdnImage(property.images[0], 800)}
                                  alt={`${property.name}, partner hotel in Nairobi`}
                                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                                  loading="lazy"
                                  decoding="async"
                                  width={800}
                                  height={256}
                                />
                              ) : (
                                <div className="w-full h-full bg-tbc-ink flex items-center justify-center text-white/15 text-sm font-light">
                                  No image
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-tbc-surface via-black/20 to-transparent" aria-hidden="true" />
                              <span className="absolute top-5 left-5 text-[9px] tracking-[0.4em] uppercase font-light text-white/50 bg-tbc-earth/70 backdrop-blur-md px-4 py-2">
                                Nairobi
                              </span>
                              <span className="absolute top-5 right-5 text-[9px] tracking-[0.4em] uppercase font-light text-white/40 bg-tbc-earth/70 backdrop-blur-md px-4 py-2">
                                Partner
                              </span>
                            </div>
                            <div className="p-8 md:p-10">
                              <h4 className="text-2xl md:text-3xl font-extralight text-white mb-3">
                                {property.name}
                              </h4>
                              <div className="flex items-center text-white/35 text-sm font-light mb-5">
                                <MapPin className="h-3.5 w-3.5 mr-2 text-tbc-gold/50" aria-hidden="true" />
                                {property.location}
                              </div>
                              <p className="text-white/35 text-sm font-light line-clamp-2 leading-relaxed mb-8">
                                {property.description}
                              </p>
                              <div className="border-t border-white/[0.05] pt-6 flex items-center justify-between gap-4">
                                <span className="text-white/25 text-sm font-light italic">
                                  Contact for pricing
                                </span>
                                <button
                                  className="text-white/15 text-[10px] tracking-[0.2em] uppercase font-light border border-white/[0.04] px-6 py-3 cursor-not-allowed"
                                  disabled
                                  aria-disabled="true"
                                  aria-label={`${property.name} is an information-only listing, not directly bookable`}
                                >
                                  Not Bookable
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Why Stay in Nairobi */}
              <motion.aside
                className="mt-20 border border-white/[0.04] bg-tbc-surface overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                aria-label="Travel tip: Why stay in Nairobi"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-20 bg-tbc-gold/5 flex items-center justify-center py-6 md:py-0" aria-hidden="true">
                    <MapPin className="h-5 w-5 text-tbc-gold/60" />
                  </div>
                  <div className="flex-1 p-10 md:p-12">
                    <p className="text-tbc-gold text-[10px] tracking-[0.4em] uppercase font-light mb-4">
                      Travel Tip
                    </p>
                    <h3 className="text-2xl md:text-3xl font-extralight text-white mb-5">
                      Why Stay in Nairobi Before Your Safari?
                    </h3>
                    <p className="text-white/35 text-sm font-light leading-[1.8] max-w-2xl">
                      Most international flights arrive at Jomo Kenyatta International Airport in Nairobi.
                      Spending a night here allows you to rest, adjust to the East Africa time zone, and
                      depart early on a scheduled or charter flight to your Kenya or Tanzania safari destination.
                      Our partner hotels offer comfortable accommodations, airport transfers, and early morning
                      departures to all major safari parks and conservancies.
                    </p>
                  </div>
                </div>
              </motion.aside>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            NO RESULTS
        ══════════════════════════════════════════════════════════════ */}
        {nonNairobiProperties.length === 0 && nairobiHotels.length === 0 && (
          <section className="py-36 bg-tbc-earth" role="status" aria-live="polite">
            <div className="max-w-7xl mx-auto px-8 md:px-16 text-center">
              <motion.div
                className="max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-16 h-16 border border-white/[0.06] flex items-center justify-center mx-auto mb-10" aria-hidden="true">
                  <Search className="h-5 w-5 text-tbc-gold/50" />
                </div>
                <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light mb-5">
                  No Results
                </p>
                <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4">
                  No safari properties found
                </h2>
                <p className="text-white/35 text-sm font-light leading-relaxed mb-12">
                  Try adjusting your search criteria or browse all Kenya and Tanzania safari properties.
                </p>
                <button
                  onClick={clearFilters}
                  aria-label="Clear all filters and show all safari properties"
                  className="text-tbc-earth bg-tbc-gold hover:bg-tbc-gold-dark text-[10px] tracking-[0.2em] uppercase font-medium px-10 py-3.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#c9a961]/60"
                >
                  Clear Filters
                </button>
              </motion.div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATS STRIP
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="py-24 bg-tbc-earth border-t border-white/[0.04]"
          aria-label="Collection statistics"
        >
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <dl className="grid grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">
              {[
                { value: nonNairobiProperties.length, label: 'Safari Properties' },
                { value: nairobiHotels.length, label: 'Nairobi Hotels' },
                { value: safariLocations.length, label: 'Destinations' },
                {
                  value: nonNairobiProperties.reduce((s: number, p) => s + (p.rooms?.length || 0), 0),
                  label: 'Safari Rooms',
                },
                {
                  value:
                    nonNairobiProperties.length > 0
                      ? (
                          nonNairobiProperties.reduce((s: number, p) => s + (p.rating || 0), 0) /
                          nonNairobiProperties.length
                        ).toFixed(1)
                      : '0.0',
                  label: 'Avg Guest Rating',
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <dt className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light order-2">
                    {stat.label}
                  </dt>
                  <dd className="text-4xl md:text-5xl font-extralight text-tbc-gold mb-3 order-1">
                    {stat.value}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FAQ SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="py-24 md:py-32 bg-tbc-dark"
          aria-labelledby="faq-heading"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          <div className="max-w-4xl mx-auto px-8 md:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-16 text-center"
            >
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="w-6 h-[1px] bg-tbc-gold/40" aria-hidden="true" />
                <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light">
                  Safari Planning
                </p>
                <div className="w-6 h-[1px] bg-tbc-gold/40" aria-hidden="true" />
              </div>
              <h2
                id="faq-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white/90"
              >
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="space-y-1">
              {FAQ_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <button
                    type="button"
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-answer-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-start justify-between gap-6 px-8 py-6 bg-tbc-earth hover:bg-tbc-surface text-left transition-colors duration-300 group focus-visible:ring-2 focus-visible:ring-[#c9a961]/40 focus-visible:outline-none"
                  >
                    <h3
                      className="text-white/70 text-sm font-light leading-relaxed group-hover:text-white/90 transition-colors"
                      itemProp="name"
                    >
                      {item.q}
                    </h3>
                    <ChevronDown
                      className={`w-4 h-4 text-tbc-gold/50 flex-shrink-0 mt-0.5 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        id={`faq-answer-${i}`}
                        role="region"
                        aria-label={item.q}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                      >
                        <div
                          className="px-8 py-6 bg-tbc-surface border-t border-white/[0.04]"
                          itemProp="text"
                        >
                          <p className="text-white/45 text-sm font-light leading-[1.8]">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="relative py-32 md:py-40 bg-tbc-surface overflow-hidden"
          aria-labelledby="cta-heading"
        >
          <div
            className="absolute inset-0 opacity-[0.02]"
            aria-hidden="true"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '40px 40px' }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-[#c9a961]/15" aria-hidden="true" />

          <div className="max-w-4xl mx-auto text-center px-8 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light mb-10">
                Begin Your Journey
              </p>
              <h2
                id="cta-heading"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-white/90 leading-[1.1] mb-8"
              >
                Ready for Your
                <br />
                <span className="italic text-tbc-gold">East Africa Safari?</span>
              </h2>
              <p className="text-white/40 text-base md:text-lg font-light leading-relaxed max-w-xl mx-auto mb-14">
                Let us craft the perfect Kenya or Tanzania safari itinerary for you, from the sun-drenched
                savannahs of the Masai Mara to the rhythm of the Indian Ocean coast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/book" aria-label="Start booking your Kenya or Tanzania safari">
                  <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-12 py-6 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300">
                    Start Booking
                    <ArrowRight className="ml-3 w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/contact" aria-label="Contact our safari planning team">
                  <Button className="bg-transparent hover:bg-white/[0.04] text-white/50 hover:text-white/80 border border-white/[0.08] hover:border-white/[0.15] rounded-none px-12 py-6 text-xs tracking-[0.2em] uppercase font-light transition-all duration-300">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />

        {/* ══════════════════════════════════════════════════════════════
            STICKY MOBILE CTA
        ══════════════════════════════════════════════════════════════ */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-tbc-dark/95 backdrop-blur-sm border-t border-white/[0.06] p-4"
          aria-label="Book a safari: sticky mobile call to action"
        >
          <div className="flex gap-3">
            <a
              href="tel:+254700613165"
              aria-label="Call The Bush Collection to book your safari"
              className="flex-shrink-0 flex items-center justify-center w-12 h-12 border border-white/[0.08] hover:border-tbc-gold/30 transition-colors"
            >
              <Phone className="w-4 h-4 text-white/50" aria-hidden="true" />
            </a>
            <Link
              to="/book"
              className="flex-1 flex items-center justify-center bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth text-[10px] tracking-[0.3em] uppercase font-medium h-12 transition-colors"
              aria-label="Start booking your East Africa safari"
            >
              Book Your Safari
            </Link>
          </div>
        </div>
        {/* Bottom padding so sticky bar doesn't overlap footer on mobile */}
        <div className="h-20 md:hidden" aria-hidden="true" />
      </div>
    </>
  );
};

export default Collections;