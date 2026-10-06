import { useEffect, useState, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play, Download, Eye, Calendar, Search, Sparkles, ArrowUpRight, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  date: string;
  category: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

const SITE_NAME = 'The Bush Collection';
const SITE_URL  = 'https://www.thebushcollection.africa';
const PAGE_URL  = `${SITE_URL}/media`;

const PAGE_TITLE       = 'Safari Photos & Videos | East Africa Media Gallery | The Bush Collection';
const PAGE_DESCRIPTION = 'Explore stunning safari photos and videos from East Africa\'s finest lodges and wildlife reserves. Browse our media gallery featuring wildlife, landscapes, and luxury safari experiences in Kenya and Tanzania.';
const HERO_IMAGE = 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1784699852/J26-0448_iux7ke.jpg';

const categories = ['all', 'Wildlife', 'Landscapes', 'Culture', 'Accommodations', 'Activities', 'Safari Experience'];

/* ─────────────────────────────────────────────
   JSON-LD helpers
───────────────────────────────────────────── */
function buildStructuredData(items: MediaItem[]) {
  const imageGallery = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'East Africa Safari Media Gallery | The Bush Collection',
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    image: items
      .filter(i => i.type === 'image')
      .slice(0, 20)
      .map(i => ({
        '@type': 'ImageObject',
        contentUrl: i.url || i.thumbnail,
        thumbnailUrl: i.thumbnail,
        name: i.title,
        description: i.description,
        datePublished: i.date || i.created_at,
        keywords: `${i.category}, safari, East Africa, Kenya, wildlife`,
      })),
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-116-072-343',
      email: 'info@thebushcollection.africa',
      contactType: 'customer service',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '42 Claret Close, Silanga Road, Karen',
      addressLocality: 'Nairobi',
      postalCode: '00200',
      addressCountry: 'KE',
    },
    foundingDate: '1983',
    description: 'Luxury safari operator offering curated wildlife experiences across East Africa since 1983.',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Media Center', item: PAGE_URL },
    ],
  };

  return [imageGallery, organization, breadcrumb];
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function MediaCenter() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const mediaGridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  /* ── Utilities ── */
  const formatDateSafe = (dateStr?: string | null) => {
    if (!dateStr) return 'Unknown date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown date';
    try { return format(d, 'MMM d, yyyy'); } catch { return 'Unknown date'; }
  };

  const isoDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  };

  /* ── Data fetching ── */
  const fetchMediaItems = useCallback(async () => {
    try {
      setLoading(true);
      const params: { category?: string } = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      const res = await api.get('/media/media-center', { params });
      const raw = res.data || [];
      const items = (raw as Array<Record<string, unknown>>).map((obj) => {
        const id          = String(obj['_id'] ?? obj['id'] ?? '');
        const type        = String(obj['type'] ?? 'image') as 'image' | 'video';
        const title       = String(obj['title'] ?? '');
        const description = String(obj['description'] ?? '');
        const fileUrl     = String(obj['fileUrl'] ?? obj['url'] ?? '');
        const thumbnail   = String(obj['thumbnailUrl'] ?? obj['thumbnail'] ?? fileUrl ?? '');
        const date        = String(obj['createdAt'] ?? obj['date'] ?? new Date().toISOString());
        const category    = String(obj['category'] ?? '');
        const featured    = Boolean(obj['featured'] ?? false);
        return { id, type, title, description, url: fileUrl, thumbnail, date, category, featured } as MediaItem;
      });
      setMediaItems(items);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({ title: 'Error', description: 'Failed to load media content. Please try again later.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, toast]);

  useEffect(() => { fetchMediaItems(); }, [fetchMediaItems]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── Handlers ── */
  const handleMediaClick = (item: MediaItem) => { setSelectedMedia(item); setShowDialog(true); };

  const getVideoEmbed = (url?: string) => {
    if (!url) return { kind: 'unknown' as const };
    const u = url.trim();
    const ytMatch = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    if (ytMatch) return { kind: 'iframe' as const, src: `https://www.youtube.com/embed/${ytMatch[1]}` };
    const vMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vMatch) return { kind: 'iframe' as const, src: `https://player.vimeo.com/video/${vMatch[1]}` };
    if (/facebook\.com|fb\.watch/i.test(u))
      return { kind: 'iframe' as const, src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=0` };
    const igMatch = u.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/i);
    if (igMatch) return { kind: 'iframe' as const, src: `https://www.instagram.com/p/${igMatch[1]}/embed` };
    const ttMatch = u.match(/tiktok\.com\/(?:@[^/]+\/video\/)?(\d+)/i);
    if (ttMatch) return { kind: 'iframe' as const, src: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` };
    if (/\.(mp4|webm|ogg|mov|mkv)(\?|$)/i.test(u)) return { kind: 'video' as const, src: u };
    if (/embed|player\.vimeo|youtube\.com\/embed/i.test(u)) return { kind: 'iframe' as const, src: u };
    return { kind: 'iframe' as const, src: u };
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = title.replace(/\s+/g, '-').toLowerCase() + (url.endsWith('.mp4') ? '.mp4' : '.jpg');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast({ title: 'Error', description: 'Failed to download media. Please try again later.', variant: 'destructive' });
    }
  };

  const filteredItems = mediaItems.filter(item => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const featuredItems = filteredItems.filter(i => i.featured);
  const structuredData = buildStructuredData(mediaItems);

  /* ── Category display label ── */
  const categoryLabel = selectedCategory === 'all' ? 'All Safari Media' : selectedCategory;

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <>
      {/* ══════════════════════════════════════
          SEO HEAD TAGS
      ══════════════════════════════════════ */}
      <Helmet>
        {/* Primary */}
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* Open Graph (Facebook, LinkedIn, WhatsApp) */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={PAGE_URL} />
        <meta property="og:site_name"   content={SITE_NAME} />
        <meta property="og:title"       content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:image"       content={HERO_IMAGE} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt"    content="East Africa safari wildlife photography by The Bush Collection" />
        <meta property="og:locale"      content="en_KE" />

        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image"       content={HERO_IMAGE} />
        <meta name="twitter:image:alt"   content="East Africa safari photography | The Bush Collection" />

        {/* Geo / regional signals */}
        <meta name="geo.region"   content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />

        {/* JSON-LD structured data */}
        {structuredData.map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <div className="min-h-screen bg-[#292524]">

        

        {/* ══════════════════════════════════════
            HERO — semantic <header>
        ══════════════════════════════════════ */}
        <header>
          <section
            className="relative h-screen min-h-[640px] overflow-hidden"
            aria-label="Media Center hero: East Africa safari gallery"
          >
            {/* Ken Burns background */}
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.08] }}
              transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            >
              <img
                src={HERO_IMAGE}
                alt="Aerial view of an East Africa safari landscape with wildlife | The Bush Collection"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                width={1920}
                height={1080}
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-b from-[#292524]/70 via-[#292524]/40 to-[#292524]/80" />

            {/* Content — vertically centred in the area below the fixed nav */}
            <div className="absolute inset-0 flex items-center justify-center pt-[80px]">
              <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-center gap-3 mb-8" aria-hidden="true">
                    <div className="w-10 h-[1px] bg-[#c9a961]" />
                    <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Visual Stories</span>
                    <div className="w-10 h-[1px] bg-[#c9a961]" />
                  </div>

                  <h1 className="text-5xl md:text-7xl font-extralight text-white/90 leading-[1.05] mb-6">
                    East Africa Safari{' '}
                    <span className="italic text-[#c9a961]/80">Photos &amp; Videos</span>
                  </h1>

                  <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
                    Explore our curated collection of wildlife photography, landscape images, and safari videos captured across Kenya and Tanzania's most spectacular destinations, from the Masai Mara to the Serengeti.
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block" aria-hidden="true">
              <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
                Est. 1983 · The Bush Collection
              </span>
            </div>
          </section>
        </header>

        {/* ══════════════════════════════════════
            SEARCH + CATEGORY FILTERS
        ══════════════════════════════════════ */}
        <section
          className="relative z-20 -mt-4"
          aria-label="Search and filter safari media"
        >
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#322e2b] border border-white/[0.06] p-6 md:p-8"
            >
              {/* Search */}
              <div className="relative mb-6" ref={searchWrapperRef}>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" aria-hidden="true" />
                  <label htmlFor="media-search" className="sr-only">
                    Search safari photos and videos
                  </label>
                  <input
                    id="media-search"
                    type="search"
                    aria-label="Search safari photos, videos, locations or categories"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search wildlife, landscapes, lodges…"
                    autoComplete="off"
                    className="w-full h-13 pl-12 pr-5 bg-transparent text-white/80 border border-white/[0.08] hover:border-white/[0.15] focus:border-[#c9a961]/40 placeholder:text-white/15 text-sm font-light tracking-wide outline-none transition-all duration-300"
                  />
                </div>

                <AnimatePresence>
                  {searchFocused && (
                    <motion.div
                      role="listbox"
                      aria-label="Browse by category"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#2a2523] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden"
                    >
                      <div className="px-5 py-3 border-b border-white/[0.06]">
                        <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light">Browse by category</p>
                      </div>

                      {categories
                        .filter(c => c !== 'all')
                        .filter(cat => !searchTerm || cat.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            role="option"
                            aria-selected={selectedCategory === cat}
                            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors duration-150 text-left group/item"
                            onClick={() => {
                              setSearchFocused(false);
                              setSearchTerm('');
                              setSelectedCategory(cat);
                              setTimeout(() => mediaGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                            }}
                          >
                            <div className="w-8 h-8 flex-shrink-0 border border-white/[0.08] flex items-center justify-center group-hover/item:border-[#c9a961]/30 transition-colors" aria-hidden="true">
                              <Search className="w-3.5 h-3.5 text-white/20 group-hover/item:text-[#c9a961] transition-colors" />
                            </div>
                            <span className="text-white/50 text-xs tracking-[0.15em] uppercase font-light group-hover/item:text-[#c9a961] transition-colors duration-150">
                              {cat} Safari Media
                            </span>
                          </button>
                        ))}

                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCategory === 'all'}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors duration-150 text-left group/item border-t border-white/[0.06]"
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setTimeout(() => mediaGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                        }}
                      >
                        <div className="w-8 h-8 flex-shrink-0 border border-white/[0.08] flex items-center justify-center group-hover/item:border-[#c9a961]/30 transition-colors" aria-hidden="true">
                          <Sparkles className="w-3.5 h-3.5 text-white/20 group-hover/item:text-[#c9a961] transition-colors" />
                        </div>
                        <span className="text-white/50 text-xs tracking-[0.15em] uppercase font-light group-hover/item:text-[#c9a961] transition-colors duration-150">
                          All Safari Media
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category pills — wrapped in <nav> for semantics */}
              <nav aria-label="Filter media by category">
                <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setTimeout(() => mediaGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                        }}
                        aria-pressed={selectedCategory === cat}
                        aria-label={`Filter by ${cat === 'all' ? 'all categories' : cat}`}
                        className={`h-10 px-5 text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 ${
                          selectedCategory === cat
                            ? 'bg-[#c9a961] text-[#292524]'
                            : 'border border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/60'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FEATURED MEDIA
        ══════════════════════════════════════ */}
        {featuredItems.length > 0 && (
          <section
            className="py-24 bg-[#292524]"
            aria-label="Featured safari photos and videos: Editor's Picks"
          >
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mb-14"
              >
                <div className="flex items-center gap-3 mb-6" aria-hidden="true">
                  <div className="w-8 h-[1px] bg-[#c9a961]" />
                  <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Editor's Picks</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extralight text-white/90 leading-tight">
                  Featured <span className="italic text-[#c9a961]/80">Safari Gallery</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredItems.slice(0, 4).map((item, i) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative cursor-pointer overflow-hidden bg-[#322e2b] border border-white/[0.04] hover:border-[#c9a961]/20 transition-all duration-500"
                    onClick={() => handleMediaClick(item)}
                    aria-label={`View featured ${item.type}: ${item.title}`}
                  >
                    <div className="relative h-72 md:h-80 overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={`${item.title}, ${item.category} safari ${item.type} by The Bush Collection`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        width={600}
                        height={400}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#292524]/90 via-[#292524]/20 to-transparent" aria-hidden="true" />

                      <div className="absolute top-4 left-4" aria-hidden="true">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a961] text-[#292524] text-[9px] tracking-[0.2em] uppercase font-medium">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      </div>

                      {item.type === 'video' && (
                        <div className="absolute top-4 right-4" aria-hidden="true">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-[9px] tracking-[0.15em] uppercase font-light">
                            <Play className="w-3 h-3" /> Video
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-[#292524]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4" aria-hidden="true">
                        <button
                          className="w-12 h-12 border border-white/20 hover:border-[#c9a961]/60 flex items-center justify-center text-white/70 hover:text-[#c9a961] transition-all duration-300"
                          aria-label={item.type === 'video' ? `Play video: ${item.title}` : `View photo: ${item.title}`}
                          tabIndex={-1}
                        >
                          {item.type === 'video' ? <Play className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <button
                          className="w-12 h-12 border border-white/20 hover:border-[#c9a961]/60 flex items-center justify-center text-white/70 hover:text-[#c9a961] transition-all duration-300"
                          aria-label={`Download ${item.title}`}
                          onClick={(e) => { e.stopPropagation(); handleDownload(item.url, item.title); }}
                          tabIndex={-1}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-light text-white mb-1 line-clamp-1">{item.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-xs font-light">{item.category}</span>
                          <time
                            dateTime={isoDate(item.date || item.created_at || item.updated_at)}
                            className="flex items-center gap-1 text-white text-xs font-light"
                          >
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {formatDateSafe(item.date || item.created_at || item.updated_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════
            ALL MEDIA GRID — <main> wraps primary content
        ══════════════════════════════════════ */}
        <main id="main-content">
          <section
            ref={mediaGridRef}
            className="py-24 bg-[#322e2b] scroll-mt-8"
            aria-label={`Full archive: ${categoryLabel}`}
          >
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4" aria-hidden="true">
                    <div className="w-8 h-[1px] bg-[#c9a961]" />
                    <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Full Archive</span>
                  </div>
                  {/*
                    H2 dynamically reflects active category — keeps page relevant
                    to whatever filter is selected; helps users & crawlers.
                  */}
                  <h2 className="text-3xl md:text-4xl font-extralight text-white leading-tight">
                    {selectedCategory === 'all'
                      ? <>All <span className="italic text-[#c9a961]/80">Safari Media</span></>
                      : <><span className="italic text-[#c9a961]/80">{selectedCategory}</span> Gallery</>
                    }
                  </h2>
                </div>
                <p className="text-white text-sm font-light" aria-live="polite" aria-atomic="true">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in collection
                </p>
              </motion.div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-busy="true" aria-label="Loading media items">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-[#292524] border border-white/[0.04] animate-pulse" aria-hidden="true">
                      <div className="h-52 bg-white/[0.03]" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-white/[0.04] w-3/4" />
                        <div className="h-3 bg-white/[0.03] w-full" />
                        <div className="h-3 bg-white/[0.03] w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length > 0 ? (
                /*
                  Each card is an <article> for semantic meaning.
                  Alt text pattern: "[Title] — [Category] safari [type] | The Bush Collection"
                  This feeds Google's image indexing directly.
                */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item, i) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                      className="group cursor-pointer bg-[#292524] border border-white/[0.04] hover:border-[#c9a961]/20 transition-all duration-500"
                      onClick={() => handleMediaClick(item)}
                      aria-label={`View ${item.type}: ${item.title}`}
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={`${item.title}, ${item.category} in East Africa | The Bush Collection safari ${item.type}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          width={400}
                          height={260}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#292524]/70 via-transparent to-transparent" aria-hidden="true" />

                        {item.type === 'video' && (
                          <div className="absolute top-3 left-3" aria-hidden="true">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-[8px] tracking-[0.15em] uppercase font-light">
                              <Play className="w-2.5 h-2.5" /> Video
                            </span>
                          </div>
                        )}

                        {item.featured && (
                          <div className="absolute top-3 right-3" aria-hidden="true">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#c9a961] text-[#292524] text-[8px] tracking-[0.15em] uppercase font-medium">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-[#292524]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center gap-3" aria-hidden="true">
                          <button
                            className="w-10 h-10 border border-white/20 hover:border-[#c9a961]/60 flex items-center justify-center text-white/70 hover:text-[#c9a961] transition-all duration-300"
                            aria-label={item.type === 'video' ? `Play: ${item.title}` : `View: ${item.title}`}
                            tabIndex={-1}
                          >
                            {item.type === 'video' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            className="w-10 h-10 border border-white/20 hover:border-[#c9a961]/60 flex items-center justify-center text-white/70 hover:text-[#c9a961] transition-all duration-300"
                            aria-label={`Download ${item.title}`}
                            onClick={(e) => { e.stopPropagation(); handleDownload(item.url, item.title); }}
                            tabIndex={-1}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-sm font-light text-white mb-2 line-clamp-1 group-hover:text-[#c9a961] transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-white text-xs font-light line-clamp-2 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="h-[1px] bg-white/[0.06] mb-4" aria-hidden="true" />
                        <div className="flex items-center justify-between">
                          <span className="text-white/25 text-[10px] tracking-[0.15em] uppercase font-light">{item.category}</span>
                          <time
                            dateTime={isoDate(item.date || item.created_at || item.updated_at)}
                            className="flex items-center gap-1 text-white/20 text-[10px] font-light"
                          >
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {formatDateSafe(item.date || item.created_at || item.updated_at)}
                          </time>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                  role="status"
                  aria-live="polite"
                >
                  <div className="max-w-lg mx-auto">
                    <div className="mx-auto mb-6 w-12 h-12 border border-white/[0.06] flex items-center justify-center" aria-hidden="true">
                      <ImageIcon className="w-5 h-5 text-white/15" />
                    </div>
                    <h3 className="text-2xl font-extralight text-white mb-3">No media found</h3>
                    <p className="text-white text-sm font-light leading-relaxed mb-8">
                      Try adjusting your search or selecting a different safari category
                    </p>
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                      className="h-12 px-8 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300"
                    >
                      Reset Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        </main>

        {/* ══════════════════════════════════════
            LIGHTBOX DIALOG
        ══════════════════════════════════════ */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          {selectedMedia && (
            <DialogContent
              className="max-w-5xl bg-[#1c1917] border border-white/[0.06] p-0 overflow-hidden"
              aria-label={`Preview: ${selectedMedia.title}`}
            >
              <div>
                <div className="relative bg-black">
                  {selectedMedia.type === 'video' ? (
                    (() => {
                      const embed = getVideoEmbed(selectedMedia.url);
                      if (embed.kind === 'iframe') {
                        return (
                          <div className="relative pt-[56.25%]">
                            <iframe
                              src={embed.src}
                              title={`${selectedMedia.title}, safari video by The Bush Collection`}
                              className="absolute top-0 left-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        );
                      }
                      if (embed.kind === 'video') {
                        return (
                          <video
                            controls
                            src={embed.src}
                            className="w-full h-auto max-h-[70vh] object-contain"
                            aria-label={selectedMedia.title}
                          />
                        );
                      }
                      return (
                        <div className="flex items-center justify-center h-64 text-white/30 text-sm font-light">
                          Unable to preview this video
                        </div>
                      );
                    })()
                  ) : (
                    <img
                      src={selectedMedia.url || selectedMedia.thumbnail}
                      alt={`${selectedMedia.title}, ${selectedMedia.category} | East Africa safari photography by The Bush Collection`}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-light text-white mb-1">{selectedMedia.title}</h3>
                      <div className="flex items-center gap-3 text-white text-xs font-light">
                        <span className="tracking-[0.15em] uppercase">{selectedMedia.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/15" aria-hidden="true" />
                        <time
                          dateTime={isoDate(selectedMedia.date || selectedMedia.created_at || selectedMedia.updated_at)}
                          className="flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          {formatDateSafe(selectedMedia.date || selectedMedia.created_at || selectedMedia.updated_at)}
                        </time>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(selectedMedia.url, selectedMedia.title)}
                      aria-label={`Download ${selectedMedia.title}`}
                      className="h-10 px-5 border border-white/[0.08] hover:border-[#c9a961]/40 text-white/40 hover:text-[#c9a961] text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 flex items-center gap-2 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Download</span>
                    </button>
                  </div>
                  {selectedMedia.description && (
                    <p className="text-white/30 text-sm font-light leading-relaxed">{selectedMedia.description}</p>
                  )}
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ══════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════ */}
        <section
          className="py-24 bg-[#292524] relative overflow-hidden"
          aria-label="Book a safari inspired by our media gallery"
        >
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} aria-hidden="true" />
          <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center justify-center gap-3 mb-8" aria-hidden="true">
                <div className="w-10 h-[1px] bg-[#c9a961]" />
                <span className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Experience Africa</span>
                <div className="w-10 h-[1px] bg-[#c9a961]" />
              </div>

              <h2 className="text-3xl md:text-5xl font-extralight text-white/90 leading-tight mb-5">
                Ready to Book Your <span className="italic text-[#c9a961]/80">East Africa Safari</span>?
              </h2>
              <p className="text-white/30 text-base font-light leading-relaxed mb-10 max-w-xl mx-auto">
                Every photo in this gallery is a destination you can visit. Explore our luxury safari packages across Kenya and Tanzania, or browse our award-winning lodges and camps.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/packages"
                  aria-label="Browse East Africa safari packages"
                  className="h-13 px-10 bg-[#c9a961] hover:bg-[#b8943d] text-[#292524] text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Safari Packages</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/collections"
                  aria-label="View luxury safari lodges and properties"
                  className="h-13 px-10 border border-white/[0.12] hover:border-white/[0.25] text-white/60 hover:text-white/80 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>View Properties</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <footer className="bg-[#1c1917] py-20" aria-label="Site footer">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div>
                <div className="flex items-center gap-3 mb-5" aria-hidden="true">
                  <div className="w-6 h-[1px] bg-[#c9a961]" />
                  <span className="text-[#c9a961] text-[10px] tracking-[0.4em] uppercase font-medium">Media Center</span>
                </div>
                <p className="text-white/25 text-sm font-light leading-relaxed">
                  Award-winning East Africa safari operator since 1983. Browse our wildlife photography and safari video gallery spanning Kenya, Tanzania, and beyond.
                </p>
              </div>

              <nav aria-label="Footer quick links">
                <h4 className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-5">Quick Links</h4>
                <ul className="space-y-3 list-none p-0">
                  <li><Link to="/about"       rel="noopener" className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300">About Us</Link></li>
                  <li><Link to="/collections" rel="noopener" className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300">Safari Lodges &amp; Properties</Link></li>
                  <li><Link to="/packages"    rel="noopener" className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300">Safari Packages</Link></li>
                  <li><Link to="/contact"     rel="noopener" className="text-white/25 hover:text-[#c9a961] text-sm font-light transition-colors duration-300">Contact</Link></li>
                </ul>
              </nav>

              <address className="not-italic">
                <h4 className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium mb-5">Contact</h4>
                <ul className="space-y-3 text-white/25 text-sm font-light list-none p-0">
                  <li><a href="tel:+254700613165" className="hover:text-[#c9a961] transition-colors">+254 700 613165</a></li>
                  <li><a href="mailto:info@thebushcollection.africa" className="hover:text-[#c9a961] transition-colors">info@thebushcollection.africa</a></li>
                  <li>42 Claret Close, Silanga Road, Karen</li>
                  <li>P.O Box 58671-00200, Nairobi, Kenya</li>
                </ul>
              </address>
            </div>

            <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/15 text-xs font-light tracking-wide">
                &copy; {new Date().getFullYear()} The Bush Collection. All rights reserved.
              </p>
              <div className="flex items-center gap-2" aria-hidden="true">
                <div className="w-6 h-[1px] bg-[#c9a961]/30" />
                <span className="text-[#c9a961]/30 text-[8px] tracking-[0.4em] uppercase font-light">Est. 1983</span>
                <div className="w-6 h-[1px] bg-[#c9a961]/30" />
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}