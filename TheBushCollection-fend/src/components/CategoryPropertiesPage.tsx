import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight, ArrowUpRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import slugify from '@/lib/slugify';
import { useBackendProperties, Property } from '@/hooks/useBackendProperties';
import { usePageSEO } from '@/hooks/usePageSEO';
import Footer from '@/components/Footer';

const cdnImage = (url: string, width: number) =>
  url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);

const safeCapitalize = (str: unknown): string => {
  if (typeof str !== 'string' || !str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

interface FaqItem {
  q: string;
  a: string;
}

interface CategoryPropertiesPageProps {
  category: 'bush' | 'beach';
  path: '/bush-properties' | '/beach-properties';
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  heroImage: string;
  heroImageAlt: string;
  eyebrow: string;
  h1Main: string;
  h1Accent: string;
  introHeading: string;
  introParagraphs: string[];
  faqs: FaqItem[];
  emptyStateNote: string;
}

export default function CategoryPropertiesPage({
  category,
  path,
  seoTitle,
  seoDescription,
  ogImage,
  heroImage,
  heroImageAlt,
  eyebrow,
  h1Main,
  h1Accent,
  introHeading,
  introParagraphs,
  faqs,
  emptyStateNote,
}: CategoryPropertiesPageProps) {
  const { properties, loading, error } = useBackendProperties();

  const matches = properties.filter(
    (p) => ((p.category || 'bush').toLowerCase() === category) &&
      !(p.location || '').toLowerCase().includes('nairobi'),
  );

  const canonical = `https://thebushcollection.africa${path}`;

  usePageSEO({
    title: seoTitle,
    description: seoDescription,
    canonical,
    ogImage,
  });

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: seoTitle,
    itemListElement: matches.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://thebushcollection.africa/property/${p.slug || slugify(p.name || '') || p.id}`,
      name: p.name,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thebushcollection.africa' },
      { '@type': 'ListItem', position: 2, name: h1Main, item: canonical },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-tbc-earth">

        {/* ── Hero ── */}
        <section
          className="relative h-[70vh] min-h-[520px] overflow-hidden bg-tbc-earth -mt-[80px]"
          aria-labelledby="category-hero-heading"
        >
          <img
            src={cdnImage(heroImage, 1920)}
            alt={heroImageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
            decoding="sync"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tbc-earth via-tbc-earth/40 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-tbc-earth/70 via-tbc-earth/15 to-transparent" aria-hidden="true" />

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end pt-[80px]" style={{ top: '80px' }}>
            <div className="max-w-7xl w-full mx-auto px-8 md:px-16 pb-16 md:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-[1px] bg-tbc-gold" aria-hidden="true" />
                  <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light">
                    {eyebrow}
                  </p>
                </div>
                <h1
                  id="category-hero-heading"
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight text-white leading-[0.95] mb-6"
                >
                  {h1Main}
                  <br />
                  <span className="italic text-tbc-gold/90">{h1Accent}</span>
                </h1>
                <p className="text-white text-base md:text-lg font-light leading-relaxed max-w-xl">
                  {seoDescription}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Intro copy (keyword-rich, crawlable body text) ── */}
        <section className="py-20 md:py-28 bg-tbc-ink" aria-labelledby="category-intro-heading">
          <div className="max-w-4xl mx-auto px-8 md:px-16">
            <h2
              id="category-intro-heading"
              className="text-3xl md:text-4xl font-extralight text-white/90 leading-tight mb-8"
            >
              {introHeading}
            </h2>
            {introParagraphs.map((para, i) => (
              <p key={i} className="text-white/50 text-base font-light leading-[1.9] mb-5">
                {para}
              </p>
            ))}
            <Link
              to="/collections"
              className="group inline-flex items-center gap-3 text-tbc-gold/70 hover:text-tbc-gold text-sm tracking-[0.2em] uppercase font-light transition-all duration-300 mt-2"
            >
              View Our Full Collection
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ── Property grid ── */}
        <section className="bg-tbc-dark py-20 md:py-28" aria-label={`${h1Main} listings`}>
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-tbc-surface h-[420px]" />
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <p className="text-tbc-gold text-xs tracking-[0.3em] uppercase mb-3">Could not load properties</p>
                <p className="text-white/35 text-sm">{error}</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-white/40 text-sm font-light">{emptyStateNote}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {matches.map((property, index) => (
                  <PropertyTile key={property.id} property={property} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 md:py-28 bg-tbc-earth" aria-labelledby="category-faq-heading">
          <div className="max-w-3xl mx-auto px-8 md:px-16">
            <h2 id="category-faq-heading" className="text-3xl md:text-4xl font-extralight text-white/90 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              {faqs.map((f, i) => (
                <div key={i} className="border-b border-white/[0.06] pb-8">
                  <h3 className="text-white/85 text-lg font-light mb-3">{f.q}</h3>
                  <p className="text-white/45 text-sm font-light leading-[1.8]">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-20 md:pb-28 bg-tbc-earth">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <div className="border border-white/[0.06] bg-tbc-dark p-10 md:p-16 text-center">
              <p className="text-tbc-gold text-[10px] tracking-[0.5em] uppercase font-light mb-5">
                Speak To Our Team
              </p>
              <h3 className="text-3xl md:text-4xl font-light text-white/90 mb-5">
                Let Us Help You Choose the Right Property
              </h3>
              <p className="text-white/35 text-sm font-light leading-relaxed max-w-lg mx-auto mb-10">
                With 40 years of on-the-ground experience, our team can recommend the perfect {category === 'bush' ? 'bush property' : 'beach property'} for your dates, group size, and interests.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button className="bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth rounded-none px-10 py-5 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300">
                    Plan My Stay
                    <ArrowRight className="ml-3 w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
                <a
                  href="tel:+254700613165"
                  className="inline-flex items-center justify-center gap-2 border border-white/[0.1] hover:border-tbc-gold/30 text-white/40 hover:text-white/70 px-10 py-5 text-xs tracking-[0.2em] uppercase font-light transition-all duration-300"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

/* ── Property tile ─────────────────────────────────────────────────────── */

function PropertyTile({ property, index }: { property: Property; index: number }) {
  const slug = property.slug || slugify(property.name || '') || property.id;
  const price = property.price_from || property.basePricePerNight || property.price || 0;
  const imageUrl = property.images?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: 0.05 * index }}
    >
      <Link to={`/property/${slug}`} className="block group">
        <div className="relative h-64 overflow-hidden bg-tbc-surface">
          {imageUrl ? (
            <img
              src={cdnImage(imageUrl, 700)}
              alt={`${property.name}, ${safeCapitalize(property.type || 'property')} in ${property.location}`}
              className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width={700}
              height={256}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10 text-sm font-light">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink/60 via-transparent to-transparent" />
        </div>
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3 h-3 text-tbc-gold/60 flex-shrink-0" aria-hidden="true" />
            <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-light">
              {property.location}
            </span>
          </div>
          <h3 className="text-xl font-light text-white/90 mb-3 group-hover:text-tbc-gold transition-colors duration-300">
            {property.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3 text-tbc-gold fill-tbc-gold" aria-hidden="true" />
              <span className="text-white/50 text-xs font-light">{property.rating}</span>
            </div>
            <span className="text-tbc-gold text-lg font-light tabular-nums">
              From ${price}
              <span className="text-white/25 text-xs font-light ml-1">/night</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
