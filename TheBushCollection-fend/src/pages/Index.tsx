import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import PropertyCard from '@/components/PropertyCard';
import OptimizedImage from '@/components/OptimizedImage';
import ReviewsSection from '@/components/ReviewsSection';
import Footer from '@/components/Footer';
import { subscribeToMailchimp } from '@/lib/mailchimp';
import { toast } from 'sonner';

// ─── Structured Data for SEO ──────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TouristInformationCenter",
  "name": "The Bush Collection",
  "description": "Luxury bush camps and beach lodges across Kenya and Tanzania. Over 40 years of safari heritage offering exclusive bush camps, coastal retreats, and authentic African wildlife experiences.",
  "url": "https://thebushcollection.africa",
  "telephone": "+254116072343",
  "email": "info@thebushcollection.africa",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "42 Claret Close, Silanga Road, Karen",
    "addressLocality": "Nairobi",
    "postalCode": "00200",
    "addressCountry": "KE"
  },
  "areaServed": ["Kenya", "Tanzania"],
  "knowsAbout": ["luxury bush camps", "safari lodges", "beach lodges", "wildlife safaris", "eco-tourism"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Luxury Bush Camps & Beach Lodges",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "LodgingBusiness",
          "name": "Luxury Bush Camps in Kenya",
          "description": "Exclusive luxury bush camps in Kenya's top safari destinations including Masai Mara, Amboseli, and Laikipia"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "LodgingBusiness",
          "name": "Luxury Bush Camps in Tanzania",
          "description": "Premium bush camps in Tanzania near Serengeti, Ngorongoro Crater, and Selous Game Reserve"
        }
      }
    ]
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What defines a luxury bush camp?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A luxury bush camp combines the raw authenticity of the African wilderness with premium amenities. Expect en-suite tented suites or elevated chalets, gourmet bush dining, private game drives in exclusive concessions, expert naturalist guides, and personalised service — all set within unfenced wilderness far from mass tourism."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a luxury bush camp and a standard safari lodge?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Luxury bush camps are typically smaller, more intimate, and located deeper inside private conservancies or game reserves. They offer exclusivity, lower guest-to-wildlife ratios, and off-road driving access. Standard lodges are often larger with more shared facilities and less personalised guiding experiences."
      }
    },
    {
      "@type": "Question",
      "name": "Which luxury bush camps in Kenya are best for honeymooners?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Bush Collection's intimate bush camps in Kenya offer private plunge pools, sundowner setups, and dedicated butlers — making them ideal for honeymoons. Our camps in the Masai Mara ecosystem and Laikipia plateau are particularly sought after for romantic escapes with direct Big Five sightings."
      }
    },
    {
      "@type": "Question",
      "name": "What luxury bush camps does The Bush Collection offer in Tanzania?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Bush Collection operates and partners with select luxury bush camps in Tanzania positioned for the Great Migration, Ngorongoro Crater, and the remote Southern Circuit. Each camp combines authentic Tanzanian wilderness with the highest standards of comfort and hospitality."
      }
    },
    {
      "@type": "Question",
      "name": "When is the best time to visit a luxury bush camp in East Africa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The peak season for luxury bush camps in Kenya and Tanzania runs from July to October (Great Migration) and January to March (calving season). The 'green season' from November to June offers excellent value, fewer guests, and dramatic landscapes — ideal for photography and birding enthusiasts."
      }
    }
  ]
};

// ─── FAQ Accordion Component ──────────────────────────────────────────────────
const faqs = [
  {
    q: "What defines a luxury bush camp?",
    a: "A luxury bush camp combines the raw authenticity of Africa's wilderness with premium amenities — en-suite tented suites or elevated chalets, gourmet bush dining, private game drives in exclusive conservancies, expert naturalist guides, and deeply personalised service. The key difference is intimacy: small guest numbers, unfenced wilderness, and an unfiltered connection with the natural world."
  },
  {
    q: "What's the difference between a luxury bush camp and a standard safari lodge?",
    a: "Luxury bush camps are smaller, more secluded, and typically situated within private concessions where access is exclusive to camp guests. This means off-road driving, night game drives, and walking safaris that standard lodges cannot offer. The ratio of staff to guests is significantly higher, and every element — from your sundowner location to your dining menu — is personalised."
  },
  {
    q: "Which luxury bush camps in Kenya are best for honeymooners?",
    a: "Our intimate Kenya bush camps in the Masai Mara ecosystem and Laikipia plateau are particularly beloved for honeymoons. Private plunge pools, dedicated butlers, bespoke bush dining under the stars, and secluded suites with direct savannah views make them among the most romantic experiences in East Africa."
  },
  {
    q: "Do your luxury bush camps in Tanzania cover the Great Migration?",
    a: "Yes. The Bush Collection partners with select luxury camps in Tanzania's Northern Circuit, positioned to witness the Great Migration across the Serengeti. We also offer camps near the Ngorongoro Crater and the remote Southern Circuit for guests seeking an entirely crowd-free safari experience."
  },
  {
    q: "When is the best time to visit a luxury bush camp in East Africa?",
    a: "Peak season runs July to October for the Great Migration and January to March for calving season in Tanzania. However, the 'green season' (November to June) is a hidden gem — lush landscapes, significantly fewer guests, compelling rates, and exceptional birdlife. Our team will match you to the ideal camp for your travel dates and interests."
  },
  {
    q: "What is typically included in a luxury bush camp stay?",
    a: "Most stays include all meals, twice-daily game drives, selected beverages, and a dedicated guide. Many of our camps also include walking safaris, cultural visits, and private vehicle options. International flights and visa fees are not included. We provide a full, transparent breakdown before booking."
  }
];

function useCountUp(end: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (end === 0) { setCount(0); return; }
    const duration = 1800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, active]);
  return count;
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-white/[0.07]">
      {faqs.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-start justify-between gap-6 py-6 text-left group"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className={`text-base font-light leading-snug transition-colors duration-300 ${open === i ? 'text-tbc-gold' : 'text-white/80 group-hover:text-white'}`}>
              {item.q}
            </span>
            <span className="flex-shrink-0 mt-0.5">
              {open === i
                ? <Minus className="w-4 h-4 text-tbc-gold" />
                : <Plus className="w-4 h-4 text-white/30 group-hover:text-tbc-gold transition-colors duration-300" />
              }
            </span>
          </button>
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open === i ? 'max-h-96 pb-6' : 'max-h-0'}`}>
            <p className="text-white/50 text-sm font-light leading-relaxed pr-8">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index() {
  const { properties, loading, error } = useBackendProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [propertyCategoryView, setPropertyCategoryView] = useState<'bush' | 'beach' | 'all'>('beach');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const propertiesSectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const carouselData = useMemo(() => [
    {
      place: 'Mwazaro Beach Lodge',
      subtitle: 'South Coast, Kenya',
      title: 'Witness The',
      title2: 'Dolphins',
      description: 'Wake to the sound of the Indian Ocean, stroll along 300 metres of untouched beach and mangroves, and feel the true rhythm of coastal Kenya.',
      image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1768894027/pset55ygysk9ktfmpxrq_jcwj9s.jpg'
    },
    {
      place: 'Mwazaro Beach Lodge',
      subtitle: 'South Coast, Kenya',
      title: 'Explore The',
      title2: 'Water Wilderness',
      description: 'Dive into a unique aquatic landscape where the lagoon meets ocean. Kayak, snorkel or simply drift into calm as the tides spin their magic.',
      image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1774516537/MB-6689_luajpg.jpg'
    },
    {
      place: 'Mwazaro Beach Lodge',
      subtitle: 'South Coast, Kenya',
      title: 'Experience The',
      title2: 'Magic of The Beach',
      description: 'A rare blend of tranquility and adventure. As the Indian Ocean meets lush mangroves, this lodge is your gateway to Kenya\'s wildlife and coastal charm.',
      image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1774957089/IMG_6442_ghwuwk.jpg'
    },
    {
      place: 'Mwazaro Beach Lodge',
      subtitle: 'South Coast, Kenya',
      title: 'Discover The',
      title2: 'Secret Coastline',
      description: 'Where the turquoise waters of the Indian Ocean meet the serene beauty of untouched nature a sanctuary for the soul.',
      image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958649/Mwazaro_Feb-110_iusor2.jpg'
    }
  ], []);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 1200);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % carouselData.length);
  }, [currentSlide, carouselData.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + carouselData.length) % carouselData.length);
  }, [currentSlide, carouselData.length, goToSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [carouselData.length]);

  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    carouselData.forEach((s) => {
      const img = new Image();
      img.src = s.image;
      imgs.push(img);
    });
    return () => {
      imgs.forEach(i => { try { i.src = ''; } catch (e) { void e; } });
    };
  }, [carouselData]);

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      (property.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const isNairobiHotel =
      property.location?.toLowerCase().includes('nairobi') ||
      property.name?.toLowerCase().includes('nairobi');
    return matchesSearch && matchesType && !isNairobiHotel;
  });

  const normalizedCategory = (value?: string) => (value || 'bush').toLowerCase();
  const bushProperties = filteredProperties.filter(p => normalizedCategory(p.category) === 'bush');
  const beachProperties = filteredProperties.filter(p => normalizedCategory(p.category) === 'beach');

  const propertyTypes = [
    ...new Set(
      properties
        .map(p => p.type)
        .filter((type): type is string => type !== null && type !== undefined && typeof type === 'string')
    ),
  ];

  const displayProperties = propertyCategoryView === 'all'
    ? filteredProperties
    : propertyCategoryView === 'bush'
      ? bushProperties
      : beachProperties;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.25 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const countYears     = useCountUp(40,                    statsVisible);
  const countBush      = useCountUp(bushProperties.length, statsVisible);
  const countBeach     = useCountUp(beachProperties.length, statsVisible);
  const countStars     = useCountUp(5,                     statsVisible);

  return (
    <>
      {/* ── Structured Data JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Semantic page wrapper ── */}
      <main className="min-h-screen bg-tbc-earth">


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO — Cinematic Full-Viewport
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
  className="relative h-screen min-h-[720px] overflow-hidden bg-tbc-earth -mt-[80px]"
  aria-label="Hero — Luxury Bush Camps & Beach Lodges in Kenya and Tanzania"
>
          {carouselData.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-[1.4s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              aria-hidden={index !== currentSlide}
            >
              <OptimizedImage
                src={slide.image}
                alt={`${slide.place} — luxury bush camp and beach lodge on ${slide.subtitle}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                placeholder="/placeholder-image.png"
              />
            </div>
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-tbc-earth/60 via-[#292524]/20 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-tbc-earth/90 via-transparent to-transparent z-[1]" />
          <div className="absolute inset-6 md:inset-10 border border-white/[0.08] rounded-sm z-[2] pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-28 px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto w-full">
            {/* Staggered text — remounts on each slide change */}
            <div key={currentSlide}>
              <div
                className="flex items-center gap-3 mb-6 animate-fadeInUp"
                style={{ animationDelay: '0ms' }}
              >
                <div className="w-8 h-[1px] bg-tbc-gold" aria-hidden="true" />
                <span className="text-tbc-gold text-xs tracking-[0.3em] uppercase font-light">{carouselData[currentSlide].place}</span>
                <span className="text-white/30 text-xs" aria-hidden="true">·</span>
                <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-light">{carouselData[currentSlide].subtitle}</span>
              </div>

              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight leading-[0.9] mb-6 tracking-tight animate-fadeInUp"
                style={{ animationDelay: '160ms' }}
              >
                <span className="block text-white/90 font-light">{carouselData[currentSlide].title}</span>
                <span className="block text-tbc-gold italic font-extralight">{carouselData[currentSlide].title2}</span>
              </h1>

              <div
                className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 max-w-full animate-fadeInUp"
                style={{ animationDelay: '320ms' }}
              >
                <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-xl">
                  {carouselData[currentSlide].description}
                </p>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Link to="/collections">
                    <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-8 py-6 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:tracking-[0.2em]">
                      Explore
                      <ArrowRight className="ml-3 w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link to="/book">
                    <Button className="bg-transparent hover:bg-white/10 text-white border border-white/20 hover:border-white/40 rounded-none px-8 py-6 text-sm tracking-[0.15em] uppercase font-light transition-all duration-300">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-2" aria-hidden="true">
            <span className="text-[8px] tracking-[0.4em] uppercase text-white/20 font-light">Scroll</span>
            <div className="w-px h-10 bg-white/10 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-tbc-gold/60 to-transparent animate-scrollLine" />
            </div>
          </div>

          {/* Slide Navigation */}
          <div className="absolute bottom-8 left-8 md:left-16 lg:left-24 z-20 flex items-center gap-6">
            <button onClick={prevSlide} className="text-white/40 hover:text-white transition-colors duration-300" aria-label="Previous slide">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3" role="tablist" aria-label="Carousel slides">
              {carouselData.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  aria-selected={index === currentSlide}
                  onClick={() => goToSlide(index)}
                  className="relative h-[2px] transition-all duration-700 overflow-hidden"
                  style={{ width: index === currentSlide ? '48px' : '16px' }}
                  aria-label={`Slide ${index + 1}`}
                >
                  <div className="absolute inset-0 bg-white/20" />
                  {index === currentSlide && (
                    <div className="absolute inset-0 bg-tbc-gold origin-left animate-slideProgress" />
                  )}
                </button>
              ))}
            </div>
            <button onClick={nextSlide} className="text-white/40 hover:text-white transition-colors duration-300" aria-label="Next slide">
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-white/20 text-xs tracking-widest ml-2 font-light" aria-live="polite" aria-atomic="true">
              {String(currentSlide + 1).padStart(2, '0')} / {String(carouselData.length).padStart(2, '0')}
            </span>
          </div>

          <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 z-20" aria-hidden="true">
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/15 font-light [writing-mode:vertical-lr] rotate-180">
              The Bush Collection Est. Heritage Since 1983
            </span>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PRESS / TRUST STRIP
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-5 bg-tbc-ink border-b border-white/[0.04]" aria-label="Press and recognition">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
              <span className="text-white/20 text-[9px] tracking-[0.5em] uppercase font-light flex-shrink-0">
                As Seen In
              </span>
              <div className="w-px h-5 bg-white/[0.06] hidden sm:block flex-shrink-0" aria-hidden="true" />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-8 gap-y-2">
                {[
                  'Condé Nast Traveller',
                  'Safari Awards',
                  'Lonely Planet',
                  'Forbes Travel Guide',
                  'National Geographic',
                ].map(name => (
                  <span
                    key={name}
                    className="text-white/22 text-[11px] font-light tracking-[0.18em] uppercase hover:text-white/45 transition-colors duration-300 cursor-default"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            BRAND STATEMENT — SEO-enriched with keyword context
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative py-24 md:py-32 bg-tbc-earth overflow-hidden" aria-labelledby="brand-heading">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-transparent to-tbc-gold/30" aria-hidden="true" />

          <div className="max-w-5xl mx-auto px-8 md:px-16 text-center">
            <p className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light mb-8">Our Promise</p>
            <h2 id="brand-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white/90 leading-[1.2] mb-8">
              Experience the best <span className="italic text-tbc-gold">luxury bush camps</span> in Kenya &amp; Tanzania.
            </h2>
            <p className="text-lg text-white/80 mb-4">
              The Bush Collection brings together <strong className="font-normal text-white/90">exceptional luxury bush camps and beach lodges</strong> in optimal locations across East Africa, delivering safari hospitality with <span className="italic text-tbc-gold">heartfelt warmth</span>.
            </p>
            <p className="text-base text-white/55 font-light leading-relaxed max-w-3xl mx-auto">
              From the sweeping savannahs of the <strong className="font-normal text-white/70">Amboseli</strong> to the pristine coastlines of the <strong className="font-normal text-white/70">Kenya South Coast</strong>, each of our properties is chosen for its setting, its wildlife density, and its commitment to authentic, low-impact luxury.
            </p>

            <div className="flex items-center justify-center gap-4 mt-10">
              <div className="w-12 h-[1px] bg-tbc-gold/30" aria-hidden="true" />
              <span className="text-white/40 text-xs tracking-[0.3em] uppercase font-light">40+ Years of Safari Heritage</span>
              <div className="w-12 h-[1px] bg-tbc-gold/30" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SEARCH — Minimal Inline Bar
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-12 bg-tbc-surface border-y border-white/[0.06]" aria-label="Search properties">
          <div className="max-w-6xl mx-auto px-8 md:px-16">
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div className="flex-1 relative" ref={searchWrapperRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 z-10" aria-hidden="true" />
                <Input
                  placeholder="Search luxury bush camps, beach lodges, or destinations..."
                  className="pl-11 h-14 bg-white/[0.03] text-white border-white/[0.08] hover:border-white/[0.15] focus:border-tbc-gold/40 placeholder:text-white/25 rounded-none text-sm tracking-wide transition-colors duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  aria-label="Search destinations or properties"
                />

                {searchFocused && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#2a2523] border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden" role="listbox" aria-label="Browse by category">
                    <div className="px-5 py-3 border-b border-white/[0.06]">
                      <p className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-light">Browse by category</p>
                    </div>
                    {(['beach', 'bush', 'all'] as const).map((cat) => {
                      const label = cat === 'all' ? 'All Properties' : cat === 'beach' ? 'Beach Lodges' : 'Luxury Bush Camps';
                      const desc = cat === 'all'
                        ? `${filteredProperties.length} exceptional destinations`
                        : cat === 'beach'
                          ? `${beachProperties.length} coastal retreats`
                          : `${bushProperties.length} luxury safari lodges`;
                      const isActive = propertyCategoryView === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          className={`w-full flex items-center gap-4 px-5 py-4 transition-colors duration-150 text-left group/item ${
                            isActive ? 'bg-tbc-gold/10' : 'hover:bg-white/[0.04]'
                          }`}
                          onClick={() => {
                            setSearchFocused(false);
                            setPropertyCategoryView(cat);
                            setTimeout(() => {
                              propertiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                        >
                          <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border ${
                            isActive ? 'border-tbc-gold/40 bg-tbc-gold/10' : 'border-white/[0.08] bg-white/[0.02]'
                          }`} aria-hidden="true">
                            <span className={`text-xs font-light uppercase ${isActive ? 'text-tbc-gold' : 'text-white/30'}`}>
                              {cat === 'all' ? '✦' : cat === 'beach' ? '🏖' : '🌿'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-light tracking-wide ${
                              isActive ? 'text-tbc-gold' : 'text-white/80 group-hover/item:text-tbc-gold'
                            } transition-colors duration-150`}>
                              {label}
                            </p>
                            <p className="text-white/30 text-xs font-light mt-0.5">{desc}</p>
                          </div>
                          {isActive && (
                            <span className="text-[8px] tracking-[0.2em] uppercase text-tbc-gold/60 font-light flex-shrink-0">Active</span>
                          )}
                          <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all duration-200 ${
                            isActive ? 'text-tbc-gold/40' : 'text-white/15 group-hover/item:text-tbc-gold group-hover/item:translate-x-0.5'
                          }`} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative md:w-52" ref={typeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  className="w-full h-14 px-5 bg-white/[0.03] text-white/70 border border-white/[0.08] hover:border-white/[0.15] rounded-none text-sm tracking-wide focus:outline-none focus:border-tbc-gold/40 transition-colors duration-300 flex items-center justify-between"
                  aria-expanded={typeDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span>
                    {selectedType === 'all'
                      ? 'All Types'
                      : selectedType && typeof selectedType === 'string'
                        ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
                        : 'Unknown'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${typeDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {typeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-tbc-surface border border-white/[0.1] shadow-xl shadow-black/40 max-h-60 overflow-y-auto" role="listbox">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedType === 'all'}
                      className={`w-full text-left px-5 py-3 text-sm tracking-wide transition-colors duration-150 ${
                        selectedType === 'all'
                          ? 'bg-tbc-gold/20 text-tbc-gold'
                          : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                      }`}
                      onClick={() => { setSelectedType('all'); setTypeDropdownOpen(false); }}
                    >
                      All Types
                    </button>
                    {propertyTypes.map((type, index) => (
                      <button
                        type="button"
                        key={type || `type-${index}`}
                        role="option"
                        aria-selected={selectedType === type}
                        className={`w-full text-left px-5 py-3 text-sm tracking-wide transition-colors duration-150 ${
                          selectedType === type
                            ? 'bg-tbc-gold/20 text-tbc-gold'
                            : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                        }`}
                        onClick={() => { setSelectedType(type); setTypeDropdownOpen(false); }}
                      >
                        {type && typeof type === 'string' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LUXURY BUSH CAMPS — Editorial Intro Strip
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-24 bg-[#1e1b18] border-b border-white/[0.05]" aria-labelledby="bush-camps-heading">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light mb-5">The Bush Experience</p>
                <h2 id="bush-camps-heading" className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white/90 leading-tight mb-6">
                  Luxury Bush Camps <br className="hidden md:block" />
                  <span className="italic text-tbc-gold">in Kenya &amp; Tanzania</span>
                </h2>
                <p className="text-white/60 text-base font-light leading-relaxed mb-5">
                  Our <strong className="font-normal text-white/80">luxury bush camps</strong> sit within some of East Africa's most productive wildlife corridors — from the famous Amboseli to the Serengeti's endless plains. Each camp is deliberately small, typically hosting fewer than 20 guests at a time.
                </p>
                <p className="text-white/50 text-sm font-light leading-relaxed mb-8">
                  Exclusive conservancy access means private game drives, off-road tracking, and walking safaris led by Kenya Wildlife Service-certified guides. You won't share your sundowner with a convoy of 30 vehicles.
                </p>

                {/* Long-tail keyword feature pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    'Luxury bush camps Kenya',
                    'Tanzania bush camps',
                    'Honeymoon beach lodges',
                    'Bush camps Amboseli',
                    'Private bush camps East Africa',
                    'Affordable luxury beach lodges',
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] tracking-[0.15em] uppercase font-light text-tbc-gold/60 border border-tbc-gold/20 px-3 py-1.5 hover:border-tbc-gold/40 hover:text-tbc-gold transition-colors duration-300 cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  to="/collections"
                  className="group inline-flex items-center gap-3 text-tbc-gold/70 hover:text-tbc-gold text-sm tracking-[0.2em] uppercase font-light transition-all duration-300"
                  aria-label="View all luxury bush camps"
                >
                  View Bush Camps
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              </div>

              {/* Stats Grid — numbers count up when scrolled into view */}
              <div className="grid grid-cols-2 gap-4" ref={statsRef}>
                {[
                  { count: countYears,  suffix: '+', label: 'Years of Safari Heritage', sub: 'Est. 1983' },
                  { count: countBush,   suffix: '+', label: 'Luxury Bush Camps',        sub: 'Kenya & Tanzania' },
                  { count: countBeach,  suffix: '+', label: 'Beach Lodges',             sub: 'Indian Ocean Coast' },
                  { count: countStars,  suffix: '',  label: 'Star Hospitality',         sub: 'Award-winning service' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/[0.03] border border-white/[0.07] p-6 group hover:border-tbc-gold/30 transition-colors duration-500"
                  >
                    <p className="text-3xl md:text-4xl font-extralight text-tbc-gold mb-2 leading-none tabular-nums">
                      {stat.count}{stat.suffix}
                    </p>
                    <p className="text-white/70 text-sm font-light leading-snug mb-1">{stat.label}</p>
                    <p className="text-white/30 text-xs font-light tracking-wide">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            EDITORIAL BREAK — Full-bleed atmospheric image
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative h-[55vh] md:h-[65vh] overflow-hidden" aria-label="Safari atmosphere">
          <img
            src="https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958649/Mwazaro_Feb-110_iusor2.jpg"
            alt="Luxury bush camp — East African wilderness"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          {/* layered gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-tbc-ink/40 via-transparent to-tbc-ink/70" />
          <div className="absolute inset-0 bg-tbc-ink/25" />

          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <div>
              <div className="w-px h-12 bg-tbc-gold/30 mx-auto mb-8" aria-hidden="true" />
              <blockquote>
                <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-white/90 leading-[1.15] tracking-tight max-w-4xl mx-auto">
                  Not a resort. Not a hotel.{' '}
                  <em className="text-tbc-gold not-italic">Something wilder.</em>
                </p>
              </blockquote>
              <div className="w-px h-12 bg-tbc-gold/30 mx-auto mt-8" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PROPERTIES — Editorial Grid
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28 bg-tbc-earth scroll-mt-8" ref={propertiesSectionRef} aria-labelledby="properties-heading">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
              <div>
                <p className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light mb-4">The Collection</p>
                <h2 id="properties-heading" className="text-4xl md:text-5xl font-extralight text-white/90 leading-tight">
                  {propertyCategoryView === 'all'
                    ? 'All Properties'
                    : propertyCategoryView === 'bush'
                      ? 'Luxury Bush Camps'
                      : 'Beach Lodges'}
                </h2>
                <p className="text-white/45 text-base font-light mt-3">
                  {propertyCategoryView === 'all'
                    ? `${filteredProperties.length} exceptional destinations — luxury bush camps & beach lodges`
                    : propertyCategoryView === 'bush'
                      ? `${bushProperties.length} luxury bush camps across Kenya & Tanzania`
                      : `${beachProperties.length} coastal retreats on the Indian Ocean`}
                </p>
              </div>

              <div className="flex items-stretch gap-2" role="tablist" aria-label="Filter properties by category">
                {([
                  { id: 'beach', label: 'Beach',      count: beachProperties.length },
                  { id: 'bush',  label: 'Bush Camps', count: bushProperties.length  },
                  { id: 'all',   label: 'All',        count: filteredProperties.length },
                ] as const).map(({ id, label, count }) => {
                  const active = propertyCategoryView === id;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPropertyCategoryView(id)}
                      className={`flex flex-col items-center px-6 py-3 border transition-all duration-300 ${
                        active
                          ? 'bg-tbc-gold border-tbc-gold text-tbc-earth'
                          : 'border-white/[0.1] text-white/40 hover:border-white/25 hover:text-white/70'
                      }`}
                    >
                      <span className={`text-xs tracking-[0.15em] uppercase font-light leading-none ${active ? 'text-tbc-earth' : ''}`}>
                        {label}
                      </span>
                      <span className={`text-[10px] mt-1 font-light tabular-nums ${active ? 'text-tbc-earth/70' : 'text-white/25'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Loading properties">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-sm overflow-hidden animate-pulse">
                    <div className="h-56 bg-white/[0.06]" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                      <div className="h-3 bg-white/[0.06] rounded w-1/2" />
                      <div className="h-3 bg-white/[0.06] rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-tbc-gold text-sm tracking-[0.2em] uppercase mb-3">Could not load properties</p>
                <p className="text-white/50 text-sm">{error}</p>
              </div>
            ) : displayProperties.length > 0 ? (
              <div role="list" aria-label={`${propertyCategoryView === 'bush' ? 'Luxury bush camps' : propertyCategoryView === 'beach' ? 'Beach lodges' : 'All properties'}`}>
                {/* ── Hero row: asymmetric 7/5 split ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-px">
                  <div
                    id={`property-${displayProperties[0].id || displayProperties[0]._id}`}
                    className={displayProperties.length === 1 ? 'lg:col-span-12' : 'lg:col-span-7'}
                    role="listitem"
                  >
                    <PropertyCard
                      property={displayProperties[0]}
                      index={0}
                      className="min-h-[480px] lg:min-h-[560px]"
                    />
                  </div>
                  {displayProperties[1] && (
                    <div
                      id={`property-${displayProperties[1].id || displayProperties[1]._id}`}
                      className="lg:col-span-5"
                      role="listitem"
                    >
                      <PropertyCard
                        property={displayProperties[1]}
                        index={1}
                        className="min-h-[480px] lg:min-h-[560px]"
                      />
                    </div>
                  )}
                </div>

                {/* ── Remaining: tight 3-column editorial grid ── */}
                {displayProperties.length > 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px mt-px">
                    {displayProperties.slice(2).map((property, i) => (
                      <div
                        key={property.id || property._id}
                        id={`property-${property.id || property._id}`}
                        role="listitem"
                      >
                        <PropertyCard
                          property={property}
                          index={i + 2}
                          className="min-h-[400px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/40 text-sm tracking-[0.2em] uppercase font-light mb-2">No properties found</p>
                <p className="text-white/30 text-sm font-light">Try adjusting your search criteria</p>
              </div>
            )}

            <div className="flex justify-center mt-16">
              <Link
                to="/collections"
                className="group flex items-center gap-3 text-tbc-gold/70 hover:text-tbc-gold text-sm tracking-[0.2em] uppercase font-light transition-all duration-300"
                aria-label="View full collection of luxury bush camps and beach lodges"
              >
                View Full Collection
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <ReviewsSection />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FAQ — What defines a luxury bush camp?
            (Targets FAQ rich snippets + long-tail keywords)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28 bg-[#1e1b18] border-y border-white/[0.05]" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-8 md:px-16">
            <div className="mb-14 text-center">
              <p className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light mb-5">Common Questions</p>
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-extralight text-white/90 leading-tight">
                What defines a <span className="italic text-tbc-gold">luxury bush camp?</span>
              </h2>
              <p className="text-white/45 text-base font-light mt-4 max-w-xl mx-auto">
                Everything you need to know about choosing and booking a luxury bush camp in East Africa.
              </p>
            </div>
            <FaqAccordion />
            <div className="mt-12 flex justify-center">
              <Link
                to="/faq"
                className="group inline-flex items-center gap-3 text-tbc-gold/60 hover:text-tbc-gold text-sm tracking-[0.2em] uppercase font-light transition-all duration-300"
              >
                More Questions
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PARTNERS — Clean Minimal Strip
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 bg-tbc-surface border-y border-white/[0.06] overflow-hidden" aria-label="Our travel platform partners">
          <div className="max-w-7xl mx-auto px-8 md:px-16 mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light mb-3">Trusted Worldwide</p>
                <h2 className="text-3xl md:text-4xl font-extralight text-white/90">Our Partners</h2>
              </div>
              <p className="text-white/40 text-sm font-light max-w-sm">
                Listed on the world's leading travel platforms
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-tbc-surface to-transparent z-10" aria-hidden="true" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-tbc-surface to-transparent z-10" aria-hidden="true" />

            <div className="flex animate-scroll" aria-hidden="true">
              {[0, 1].map((setIndex) => (
                <div key={setIndex} className="flex items-center gap-12 px-6 min-w-max">
                  {[
                    { name: 'Booking.com', color: '#003580', letter: 'B' },
                    { name: 'Expedia', color: '#FFCB05', letter: 'E' },
                    { name: 'TripAdvisor', color: '#34E0A1', letter: 'T' },
                    { name: 'Airbnb', color: '#FF5A5F', letter: 'A' },
                    { name: 'Hotels.com', color: '#D32F2F', letter: 'H' },
                    { name: 'Agoda', color: '#FF6B00', letter: 'G' },
                  ].map((partner) => (
                    <div
                      key={`${setIndex}-${partner.name}`}
                      className="flex items-center justify-center h-16 px-10 bg-white/[0.04] border border-white/[0.06] rounded-sm hover:bg-white/[0.08] transition-all duration-500 group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: partner.color }}
                        >
                          {partner.letter}
                        </div>
                        <span className="text-sm font-light tracking-wide text-white/50 group-hover:text-white/80 transition-colors">{partner.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CTA — Editorial Statement
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-28 md:py-36 bg-tbc-earth relative" aria-labelledby="cta-heading">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} aria-hidden="true" />
          <div className="max-w-4xl mx-auto text-center px-8 md:px-16 relative z-10">
            <p className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light mb-8">Begin Your Journey</p>
            <h2 id="cta-heading" className="text-4xl sm:text-5xl md:text-6xl font-extralight text-white/90 leading-[1.15] mb-8">
              Ready for Your <br className="hidden sm:block" />
              <span className="italic text-tbc-gold">Luxury Bush Camp Adventure?</span>
            </h2>
            <p className="text-white/50 text-lg font-light leading-relaxed max-w-2xl mx-auto mb-12">
              Book your dream luxury bush camp or beach lodge today and create memories that will last a lifetime. Let us craft the perfect East African safari for you — from private Masai Mara camps to secluded Tanzania lodges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book">
                <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300">
                  Start Booking
                  <ArrowRight className="ml-3 w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button className="bg-transparent hover:bg-white/5 text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase font-light transition-all duration-300">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            NEWSLETTER STRIP — inline, above footer
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <NewsletterStrip />

        <Footer />
      </main>
    </>
  );
}

// ─── Newsletter Form ──────────────────────────────────────────────────────────
function NewsletterForm({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) return toast.error('Enter a valid email');
    setLoading(true);
    try {
      const res = await subscribeToMailchimp({ email });
      if (res.success) {
        const status = res.mailchimp_status || (res.data as { status?: string } | undefined)?.status;
        if (status === 'pending') {
          toast.info('Please check your email to confirm your subscription');
        } else {
          toast.success('Subscribed — check your inbox for updates');
        }
        setEmail('');
        if (onClose) onClose();
      } else {
        toast.error(res.error || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      toast.error('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative bg-tbc-earth border border-tbc-gold/30 rounded-none p-10 text-center shadow-2xl shadow-black/50">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2" aria-hidden="true">
          <div className="w-10 h-10 bg-tbc-gold flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-tbc-earth" />
          </div>
        </div>

        <p className="text-tbc-gold text-xs tracking-[0.3em] uppercase font-light mb-2 mt-2">Stay Connected</p>
        <h3 className="text-2xl font-extralight text-white mb-2">Subscribe to Our Newsletter</h3>
        <p className="text-sm text-white/30 font-light mb-8">Exclusive luxury bush camp deals, travel tips, and safari updates delivered to your inbox.</p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-3">
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="bg-white/[0.03] border-white/[0.08] text-white rounded-none h-12 placeholder:text-white/25 text-sm tracking-wide"
            aria-label="Email address for newsletter"
          />
          <Button type="submit" className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-6 h-12 text-sm tracking-[0.1em] uppercase font-medium" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>

        <p className="text-[10px] text-white/15 mt-6 tracking-wide font-light">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </div>
  );
}

// ─── Newsletter Strip (inline, above footer) ──────────────────────────────────
function NewsletterStrip() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return toast.error('Enter a valid email');
    setBusy(true);
    try {
      const res = await subscribeToMailchimp({ email });
      if (res.success) {
        const status = res.mailchimp_status || (res.data as { status?: string } | undefined)?.status;
        toast[status === 'pending' ? 'info' : 'success'](
          status === 'pending'
            ? 'Check your email to confirm your subscription'
            : 'Subscribed — safari updates incoming'
        );
        setEmail('');
      } else {
        toast.error(res.error || 'Subscription failed');
      }
    } catch {
      toast.error('Subscription failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="py-20 md:py-24 bg-tbc-dark border-t border-white/[0.06]" aria-label="Newsletter subscription">
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5" aria-hidden="true">
              <div className="w-6 h-px bg-tbc-gold/40" />
              <span className="text-tbc-gold text-xs tracking-[0.4em] uppercase font-light">Stay Connected</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extralight text-white/90 mb-4 leading-tight">
              The Bush Collection{' '}
              <span className="italic text-tbc-gold">Journal</span>
            </h2>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-md">
              Exclusive safari deals, new camp openings, seasonal travel tips, and wildlife updates — straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/[0.04] border-white/[0.1] text-white rounded-none h-12 placeholder:text-white/20 text-sm tracking-wide focus:border-tbc-gold/40"
              aria-label="Email address"
            />
            <Button
              type="submit"
              disabled={busy}
              className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none h-12 px-8 text-xs tracking-[0.15em] uppercase font-medium transition-colors duration-200 flex-shrink-0"
            >
              {busy ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </form>
        </div>

        <p className="text-white/15 text-[10px] tracking-wide font-light mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}