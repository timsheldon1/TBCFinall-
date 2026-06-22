/**
 * CollectionsSEO.tsx
 * Drop this inside your Collections page route component or use
 * react-helmet-async / @vite-plugin-ssr head management.
 *
 * WHY: Google needs crawlable metadata, structured data, and canonical
 * signals to index this page correctly and surface it for safari queries.
 */

import { Helmet } from 'react-helmet-async';

interface CollectionsSEOProps {
  propertyCount?: number;
  destinationCount?: number;
}

export const CollectionsSEO = ({
  propertyCount = 20,
  destinationCount = 10,
}: CollectionsSEOProps) => {
  const title =
    'Luxury Safari Collections | Lodges, Camps & Retreats in East Africa | The Bush Collection';
  const description =
    `Discover ${propertyCount} handpicked luxury safari lodges, tented camps and boutique retreats across ${destinationCount} destinations in Kenya and Tanzania. ` +
    `Curated by The Bush Collection since 1983 — authentic East African safari experiences for discerning travellers.`;
  const canonical = 'https://www.thebushcollection.africa/collections';
  const ogImage =
    'https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958648/Mwazaro_Feb-23_npdrys.jpg';

  // ── Structured Data ───────────────────────────────────────────────────────

  /** CollectionPage + ItemList — tells Google this is a curated list */
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Luxury Safari Collections — The Bush Collection',
    description,
    url: canonical,
    provider: {
      '@type': 'TravelAgency',
      name: 'The Bush Collection',
      url: 'https://www.thebushcollection.africa',
      telephone: '+254116072343',
      email: 'info@thebushcollection.africa',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '42 Claret Close, Silanga Road, Karen',
        addressLocality: 'Nairobi',
        postalCode: '00200',
        addressCountry: 'KE',
      },
      foundingDate: '1983',
    },
  };

  /** BreadcrumbList — adds breadcrumbs to SERP snippets */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.thebushcollection.africa',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Safari Collections',
        item: canonical,
      },
    ],
  };

  /** TouristDestination — for East Africa / Kenya / Tanzania targeting */
  const touristDestinationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: 'East Africa Safari Destinations',
    description:
      'Iconic safari landscapes spanning the Masai Mara, Amboseli, Laikipia, Tsavo, Serengeti and the Kenya Coast.',
    includesAttraction: [
      { '@type': 'TouristAttraction', name: 'Masai Mara National Reserve', address: { addressCountry: 'KE' } },
      { '@type': 'TouristAttraction', name: 'Amboseli National Park', address: { addressCountry: 'KE' } },
      { '@type': 'TouristAttraction', name: 'Laikipia Plateau', address: { addressCountry: 'KE' } },
      { '@type': 'TouristAttraction', name: 'Serengeti National Park', address: { addressCountry: 'TZ' } },
    ],
  };

  /** FAQPage — captures featured snippet / People Also Ask real estate */
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best time to go on safari in Kenya?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'The peak wildlife viewing season in Kenya runs from July to October during the Great Migration in the Masai Mara. ' +
            'The dry season (June–October and January–February) offers excellent game viewing across all parks. ' +
            'The Bush Collection operates year-round and can tailor your itinerary to the season.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I choose the right safari lodge in Kenya?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Choosing a lodge depends on your desired ecosystem, travel style, and budget. ' +
            'The Bush Collection curates properties across bush, beach, and highland destinations — ' +
            'our team can match you to the right camp based on your interests, whether that\'s the Great Migration, ' +
            'Big Five encounters, or private conservancy exclusivity.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is included in a luxury safari package?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Most luxury safari packages include full-board accommodation, twice-daily game drives with expert guides, ' +
            'bush walks, airstrip transfers, and park fees. Rates vary by property — contact The Bush Collection ' +
            'for a bespoke itinerary with transparent pricing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to stay in Nairobi before my safari?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Most international flights arrive at Jomo Kenyatta International Airport in Nairobi. ' +
            'Spending one night in Nairobi allows you to rest, adjust to the time zone, and depart early ' +
            'on a scheduled or charter flight to your safari destination. The Bush Collection recommends ' +
            'partner hotels near the airport and Karen for pre-safari stays.',
        },
      },
    ],
  };

  return (
    <Helmet>
      {/* ── Primary ─────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

      {/* ── Open Graph ──────────────────────────────── */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Luxury safari lodge at Mwazaro, Kenya coast — The Bush Collection" />
      <meta property="og:site_name" content="The Bush Collection" />
      <meta property="og:locale" content="en_GB" />

      {/* ── Twitter Card ────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="East Africa luxury safari lodge — The Bush Collection" />

      {/* ── Preconnect / Preload ─────────────────────
           WHY: Reduces LCP by resolving DNS and TLS for Cloudinary
           before the hero image fetch starts.                       */}
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <link
        rel="preload"
        as="image"
        href="https://res.cloudinary.com/dfaakg2ds/image/upload/f_auto,q_auto,w_1920/v1774958648/Mwazaro_Feb-23_npdrys.jpg"
        fetchpriority="high"
      />

      {/* ── Structured Data ─────────────────────────── */}
      <script type="application/ld+json">
        {JSON.stringify(collectionPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(touristDestinationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};