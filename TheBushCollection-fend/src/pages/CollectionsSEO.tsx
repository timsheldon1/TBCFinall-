/**
 * CollectionsSEO.tsx
 * Rendered inside the Collections page route to set per-page metadata
 * and structured data.
 *
 * WHY: Google needs crawlable metadata, structured data, and canonical
 * signals to index this page correctly and surface it for safari queries.
 * Title/description/canonical/OG tags are applied via usePageSEO, which
 * mutates the existing static tags from index.html in place — rendering
 * competing <meta>/<link> elements (e.g. via react-helmet) only appends
 * duplicates alongside the static ones, since this is a CSR app and React
 * never hydrates <head>.
 */

import { usePageSEO } from '@/hooks/usePageSEO';

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
  const canonical = 'https://thebushcollection.africa/collections';
  const ogImage =
    'https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958648/Mwazaro_Feb-23_npdrys.jpg';

  usePageSEO({ title, description, canonical, ogImage });

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
      url: 'https://thebushcollection.africa',
      telephone: '+254700613165',
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
        item: 'https://thebushcollection.africa',
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
    <>
      {/* ── Preconnect / Preload — no static equivalent in index.html,
           so plain JSX tags are safe; React 19 hoists them into <head>. ── */}
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <link
        rel="preload"
        as="image"
        href="https://res.cloudinary.com/dfaakg2ds/image/upload/f_auto,q_auto,w_1920/v1774958648/Mwazaro_Feb-23_npdrys.jpg"
        fetchPriority="high"
      />

      {/* ── Structured Data ─────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristDestinationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};
