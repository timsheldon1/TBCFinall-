import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Users, Calendar, Clock, Check, Search, ChevronDown, ArrowRight, ArrowUpRight, ImageOff, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendPackages } from '@/hooks/useBackendPackages';
import { Package } from '@/types/package';
import slugify from '@/lib/slugify';

export default function Packages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'duration'>('featured');

  /* ── dropdown state ── */
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const durRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCategoryOpen(false);
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) setPriceOpen(false);
      if (durRef.current && !durRef.current.contains(e.target as Node)) setDurationOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getPriceRange = (filter: string) => {
    switch (filter) {
      case 'budget': return { minPrice: 0, maxPrice: 2500 };
      case 'mid': return { minPrice: 2500, maxPrice: 3500 };
      case 'luxury': return { minPrice: 3500, maxPrice: undefined };
      default: return { minPrice: undefined, maxPrice: undefined };
    }
  };

  const priceRange = getPriceRange(priceFilter);

  const packagesOptions = useMemo(() => ({
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    minPrice: priceRange.minPrice,
    maxPrice: priceRange.maxPrice,
    duration: durationFilter !== 'all' ? durationFilter : undefined,
    sortBy,
    page: 1,
    limit: 12
  }), [searchTerm, categoryFilter, priceRange.minPrice, priceRange.maxPrice, durationFilter, sortBy]);

  const { packages: sortedPackages, loading, error } = useBackendPackages(packagesOptions);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(sortedPackages.map(p => p.category))];
    return uniqueCategories.sort();
  }, [sortedPackages]);

  const durations = useMemo(() => {
    const uniqueDurations = [...new Set(sortedPackages.map(p => p.duration.split(' ')[0]))];
    return uniqueDurations.sort((a, b) => parseInt(a) - parseInt(b));
  }, [sortedPackages]);

  const getDisplayLocation = (pkg: Package) => {
    return pkg.location || pkg.destinations?.slice(0, 2).join(', ') || 'Multiple Destinations';
  };

  const featuredPackages = useMemo(() => {
    return sortedPackages.filter(p => p.featured);
  }, [sortedPackages]);

  const priceLabel = (v: string) => {
    if (v === 'budget') return 'Under $2,500';
    if (v === 'mid') return '$2,500 – $3,500';
    if (v === 'luxury') return '$3,500+';
    return 'All Prices';
  };

  const sortLabel = (v: string) => {
    if (v === 'price-low') return 'Price: Low → High';
    if (v === 'price-high') return 'Price: High → Low';
    if (v === 'rating') return 'Highest Rated';
    if (v === 'duration') return 'Duration';
    return 'Featured First';
  };

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#292524] flex items-center justify-center pt-[80px]">
        <div className="text-center">
          <div className="relative mx-auto w-14 h-14 mb-8">
            <div className="absolute inset-0 border border-[#c9a961]/20 animate-ping" />
            <div className="absolute inset-3 border border-[#c9a961]/40 animate-pulse" />
          </div>
          <p className="text-white/25 text-[10px] tracking-[0.5em] uppercase font-light">Loading Packages</p>
        </div>
      </div>
    );
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#292524] flex items-center justify-center pt-[80px] px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extralight text-white/80 mb-4">Something went wrong</h1>
          <p className="text-white/30 text-sm font-light mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="h-12 px-8 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-[#292524]">

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        {/* Ken Burns background */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.08] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://obbrmdtdcevckizykfzu.supabase.co/storage/v1/object/sign/images/Mwazaro-1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmQyZDM5YS1mOGUyLTQwNGItOTJlMy1mZjc1ZGJjYmQ5ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvTXdhemFyby0xLmpwZyIsImlhdCI6MTc2MzYyOTcwNCwiZXhwIjoxNzk1MTY1NzA0fQ.Ihw6Bmfj9cx-SsrMzKzH0bt-4Qej5J0sfxw-JgKWllA')`
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#292524]/70 via-[#292524]/40 to-[#292524]/80" />

        {/* Content — centred in the visible area below the fixed nav */}
        <div className="absolute inset-0 flex items-center justify-center pt-[80px]">
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-[1px] bg-[#c9a961]" />
                <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Curated Journeys</span>
                <div className="w-10 h-[1px] bg-[#c9a961]" />
              </div>

              <h1 className="text-5xl md:text-7xl font-extralight text-white/90 leading-[1.05] mb-6">
                Safari <span className="italic text-[#c9a961]/80">Packages</span>
              </h1>

              <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
                Carefully crafted safari experiences with expert guides, luxury accommodations,
                and unforgettable adventures across East Africa
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#all-packages"
                  className="h-13 px-10 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Browse All</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/contact"
                  className="h-13 px-10 border border-white/[0.12] hover:border-white/[0.25] text-white/60 hover:text-white/80 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Custom Package</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Vertical accent */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
            Est. 1983 — Curated Safari Experiences
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SEARCH & FILTERS
      ═══════════════════════════════════════════ */}
      <section className="relative z-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#322e2b] border border-white/[0.06] p-6 md:p-8"
          >
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                placeholder="Search packages by destination, property, activities, or highlights…"
                className="w-full h-13 pl-12 pr-5 bg-transparent text-white/80 border border-white/[0.08] hover:border-white/[0.15] focus:border-[#c9a961]/40 placeholder:text-white/15 text-sm font-light tracking-wide outline-none transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category */}
              <div ref={catRef} className="relative flex-1">
                <button
                  onClick={() => { setCategoryOpen(!categoryOpen); setPriceOpen(false); setDurationOpen(false); setSortOpen(false); }}
                  className="w-full h-12 px-5 bg-transparent border border-white/[0.08] hover:border-white/[0.15] text-white/50 text-xs tracking-[0.15em] uppercase font-light flex items-center justify-between transition-all duration-300"
                >
                  <span>{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${categoryOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {categoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 mt-1 w-full bg-[#322e2b] border border-white/[0.08] shadow-xl max-h-52 overflow-y-auto"
                    >
                      <button onClick={() => { setCategoryFilter('all'); setCategoryOpen(false); }} className={`w-full text-left px-5 py-3 text-xs tracking-wide font-light transition-colors ${categoryFilter === 'all' ? 'text-[#c9a961] bg-white/[0.03]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'}`}>All Categories</button>
                      {categories.map(c => (
                        <button key={c} onClick={() => { setCategoryFilter(c); setCategoryOpen(false); }} className={`w-full text-left px-5 py-3 text-xs tracking-wide font-light transition-colors ${categoryFilter === c ? 'text-[#c9a961] bg-white/[0.03]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'}`}>{c}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price */}
              <div ref={priceRef} className="relative flex-1">
                <button
                  onClick={() => { setPriceOpen(!priceOpen); setCategoryOpen(false); setDurationOpen(false); setSortOpen(false); }}
                  className="w-full h-12 px-5 bg-transparent border border-white/[0.08] hover:border-white/[0.15] text-white/50 text-xs tracking-[0.15em] uppercase font-light flex items-center justify-between transition-all duration-300"
                >
                  <span>{priceLabel(priceFilter)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${priceOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {priceOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 mt-1 w-full bg-[#322e2b] border border-white/[0.08] shadow-xl"
                    >
                      {['all', 'budget', 'mid', 'luxury'].map(v => (
                        <button key={v} onClick={() => { setPriceFilter(v); setPriceOpen(false); }} className={`w-full text-left px-5 py-3 text-xs tracking-wide font-light transition-colors ${priceFilter === v ? 'text-[#c9a961] bg-white/[0.03]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'}`}>{priceLabel(v)}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Duration */}
              <div ref={durRef} className="relative flex-1">
                <button
                  onClick={() => { setDurationOpen(!durationOpen); setCategoryOpen(false); setPriceOpen(false); setSortOpen(false); }}
                  className="w-full h-12 px-5 bg-transparent border border-white/[0.08] hover:border-white/[0.15] text-white/50 text-xs tracking-[0.15em] uppercase font-light flex items-center justify-between transition-all duration-300"
                >
                  <span>{durationFilter === 'all' ? 'All Durations' : `${durationFilter} Days`}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${durationOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {durationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 mt-1 w-full bg-[#322e2b] border border-white/[0.08] shadow-xl max-h-52 overflow-y-auto"
                    >
                      <button onClick={() => { setDurationFilter('all'); setDurationOpen(false); }} className={`w-full text-left px-5 py-3 text-xs tracking-wide font-light transition-colors ${durationFilter === 'all' ? 'text-[#c9a961] bg-white/[0.03]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'}`}>All Durations</button>
                      {durations.map(d => (
                        <button key={d} onClick={() => { setDurationFilter(d); setDurationOpen(false); }} className={`w-full text-left px-5 py-3 text-xs tracking-wide font-light transition-colors ${durationFilter === d ? 'text-[#c9a961] bg-white/[0.03]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'}`}>{d} Days</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort */}
              <div ref={sortRef} className="relative flex-1">
                <button
                  onClick={() => { setSortOpen(!sortOpen); setCategoryOpen(false); setPriceOpen(false); setDurationOpen(false); }}
                  className="w-full h-12 px-5 bg-transparent border border-white/[0.08] hover:border-white/[0.15] text-white/50 text-xs tracking-[0.15em] uppercase font-light flex items-center justify-between transition-all duration-300"
                >
                  <span>{sortLabel(sortBy)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 mt-1 w-full bg-[#322e2b] border border-white/[0.08] shadow-xl"
                    >
                      {(['featured', 'price-low', 'price-high', 'rating', 'duration'] as const).map(v => (
                        <button key={v} onClick={() => { setSortBy(v); setSortOpen(false); }} className={`w-full text-left px-5 py-3 text-xs tracking-wide font-light transition-colors ${sortBy === v ? 'text-[#c9a961] bg-white/[0.03]' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'}`}>{sortLabel(v)}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED PACKAGES
      ═══════════════════════════════════════════ */}
      {featuredPackages.length > 0 && (
        <section className="py-24 bg-[#292524]">
          <div className="max-w-6xl mx-auto px-6">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-[#c9a961]" />
                <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Editor's Selection</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <h2 className="text-3xl md:text-4xl font-extralight text-white/90 leading-tight">
                  Featured <span className="italic text-[#c9a961]/80">Packages</span>
                </h2>
                <p className="text-white/30 text-sm font-light max-w-md">
                  Our most popular and highly-rated safari experiences, handpicked by our curators
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to={`/package/${(pkg as any).slug || slugify(pkg.name) || pkg.id}`}
                    className="group block bg-[#322e2b] border border-white/[0.04] hover:border-[#c9a961]/20 transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#292524]/80 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a961] text-[#292524] text-[9px] tracking-[0.2em] uppercase font-medium">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                        {pkg.itinerary && pkg.itinerary.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-[9px] tracking-[0.15em] uppercase font-light">
                            <Calendar className="w-3 h-3" /> Itinerary
                          </span>
                        )}
                      </div>

                      {/* Save badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-[9px] tracking-[0.15em] uppercase font-light">
                          Save ${(pkg.originalPrice - pkg.price).toLocaleString()}
                        </span>
                      </div>

                      {/* Bottom: location + rating */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div className="flex items-center gap-1.5 text-white/70">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs font-light">{getDisplayLocation(pkg)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#c9a961]" />
                          <span className="text-white/70 text-xs font-light">{pkg.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-light text-white/90 mb-3 group-hover:text-[#c9a961] transition-colors duration-300">
                        {pkg.name}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-white/30 text-xs font-light mb-4">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {pkg.duration}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {pkg.groupSize}</span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1.5 mb-5">
                        {pkg.highlights.slice(0, 3).map((h, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-white/35 text-xs font-light">
                            <Check className="w-3 h-3 text-[#c9a961]/60 flex-shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-white/[0.06] mb-5" />

                      {/* Price + CTA */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-light text-[#c9a961]">${pkg.price.toLocaleString()}</span>
                            <span className="text-xs text-white/20 line-through">${pkg.originalPrice.toLocaleString()}</span>
                          </div>
                          <p className="text-[9px] text-white/20 tracking-wide uppercase mt-1">per person · {pkg.category}</p>
                        </div>
                        <span className="text-[#c9a961]/60 group-hover:text-[#c9a961] transition-colors duration-300">
                          <ArrowUpRight className="w-5 h-5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          ALL PACKAGES
      ═══════════════════════════════════════════ */}
      <section id="all-packages" className="py-24 bg-[#322e2b]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-[1px] bg-[#c9a961]" />
                <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Full Collection</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extralight text-white/90 leading-tight">
                All Safari <span className="italic text-[#c9a961]/80">Packages</span>
              </h2>
            </div>
            <p className="text-white/25 text-sm font-light">
              {sortedPackages.length} package{sortedPackages.length !== 1 ? 's' : ''} found
            </p>
          </motion.div>

          {sortedPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPackages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link
                    to={`/package/${(pkg as any).slug || slugify(pkg.name) || pkg.id}`}
                    className="group block bg-[#292524] border border-white/[0.04] hover:border-[#c9a961]/20 transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden bg-[#1c1917]">
                      {pkg.image ? (
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <ImageOff className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#292524]/80 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {pkg.itinerary && pkg.itinerary.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-[9px] tracking-[0.15em] uppercase font-light">
                            <Calendar className="w-3 h-3" /> Itinerary
                          </span>
                        )}
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-[9px] tracking-[0.15em] uppercase font-light">
                          Save ${(pkg.originalPrice - pkg.price).toLocaleString()}
                        </span>
                      </div>

                      {/* Bottom overlay: difficulty + location + rating */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 text-[8px] tracking-[0.15em] uppercase font-medium ${
                            pkg.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' :
                            pkg.difficulty === 'moderate' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-[#c9a961]/20 text-[#c9a961]'
                          }`}>
                            {pkg.difficulty.charAt(0).toUpperCase() + pkg.difficulty.slice(1)}
                          </span>
                          <span className="flex items-center gap-1 text-white/60 text-xs font-light">
                            <MapPin className="w-3 h-3" /> {getDisplayLocation(pkg)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#c9a961]" />
                          <span className="text-white/70 text-xs font-light">{pkg.rating}</span>
                          <span className="text-white/30 text-[10px]">({pkg.reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-light text-white/90 mb-3 group-hover:text-[#c9a961] transition-colors duration-300">
                        {pkg.name}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-white/30 text-xs font-light mb-4">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {pkg.duration}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {pkg.groupSize}</span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1.5 mb-5">
                        {pkg.highlights.slice(0, 3).map((h, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-white/35 text-xs font-light">
                            <Check className="w-3 h-3 text-[#c9a961]/60 flex-shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                        {pkg.highlights.length > 3 && (
                          <p className="text-white/15 text-[10px] font-light ml-5">+{pkg.highlights.length - 3} more</p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-white/[0.06] mb-5" />

                      {/* Price + CTA */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-light text-[#c9a961]">${pkg.price.toLocaleString()}</span>
                            <span className="text-xs text-white/20 line-through">${pkg.originalPrice.toLocaleString()}</span>
                          </div>
                          <p className="text-[9px] text-white/20 tracking-wide uppercase mt-1">per person · {pkg.category}</p>
                        </div>
                        <span className="text-[#c9a961]/60 group-hover:text-[#c9a961] transition-colors duration-300">
                          <ArrowUpRight className="w-5 h-5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center py-20"
>
  <div className="max-w-lg mx-auto">
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className="w-6 h-[1px] bg-[#c9a961]/40" />
      <span className="text-[#c9a961] text-[9px] tracking-[0.4em] uppercase font-medium flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" /> Curating Experiences
      </span>
      <div className="w-6 h-[1px] bg-[#c9a961]/40" />
    </div>

    <div className="mx-auto mb-8 flex items-center justify-center">
  <img
    src="https://res.cloudinary.com/dfaakg2ds/image/upload/v1777961695/LOGOremovedbg_vcj7au.png"
    alt="Logo"
    className="w-64 md:w-80 lg:w-96 h-auto object-contain opacity-95"
  />
</div>

    <h3 className="text-2xl font-extralight text-white mb-3">
      The next chapters are being written
    </h3>

    <p className="text-white text-sm font-light leading-relaxed mb-8">
      Our curators are polishing a new collection of bush escapes and beach retreats.
      Expect early-morning game drives, private sundowners, and seaside serenity, coming soon.
    </p>

    <button
      onClick={() => {
        setSearchTerm('');
        setCategoryFilter('all');
        setPriceFilter('all');
        setDurationFilter('all');
        setSortBy('featured');
      }}
      className="h-12 px-8 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300"
    >
      Reset Filters
    </button>

    <p className="text-white/15 text-[10px] tracking-wide mt-4">
      New departures posted weekly
    </p>
  </div>
</motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════ */}
      <section className="py-24 bg-[#292524] relative overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-[1px] bg-[#c9a961]" />
              <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Your Journey Awaits</span>
              <div className="w-10 h-[1px] bg-[#c9a961]" />
            </div>

            <h2 className="text-3xl md:text-5xl font-extralight text-white/90 leading-tight mb-5">
              Ready for Your <span className="italic text-[#c9a961]/80">Safari Adventure</span>?
            </h2>
            <p className="text-white/30 text-base font-light leading-relaxed mb-10 max-w-xl mx-auto">
              Book your dream safari package today and create memories that will last a lifetime
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/collections"
                className="h-13 px-10 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="h-13 px-10 border border-white/[0.12] hover:border-white/[0.25] text-white/60 hover:text-white/80 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span>Speak to an Expert</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="bg-[#1c1917] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-[1px] bg-[#c9a961]" />
                <span className="text-[#c9a961] text-[10px] tracking-[0.4em] uppercase font-medium">Safari Packages</span>
              </div>
              <p className="text-white/25 text-sm font-light leading-relaxed">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>

            {/* Package Types */}
            <div>
              <h4 className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-5">Package Types</h4>
              <ul className="space-y-3">
                {categories.map(category => (
                  <li key={category}>
                    <button
                      onClick={() => setCategoryFilter(category)}
                      className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-5">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300">About Us</Link></li>
                <li><Link to="/collections" className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300">Properties</Link></li>
                <li><Link to="/contact" className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300">Contact</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-5">Contact</h4>
              <ul className="space-y-3 text-white/25 text-sm font-light">
                <li>+254 116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/15 text-xs font-light tracking-wide">
              &copy; {new Date().getFullYear()} the bush collection. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[1px] bg-[#c9a961]/30" />
              <span className="text-[#c9a961]/30 text-[8px] tracking-[0.4em] uppercase font-light">Est. 1983</span>
              <div className="w-6 h-[1px] bg-[#c9a961]/30" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}