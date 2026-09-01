import CategoryPropertiesPage from '@/components/CategoryPropertiesPage';

export default function BushProperties() {
  return (
    <CategoryPropertiesPage
      category="bush"
      path="/bush-properties"
      seoTitle="Bush Properties in Kenya & Tanzania | Luxury Safari Camps & Lodges | The Bush Collection"
      seoDescription="Explore our handpicked bush properties across Kenya and Tanzania — luxury tented camps and lodges in the Serengeti, Ngorongoro Crater and Tarangire. Book direct with The Bush Collection."
      ogImage="https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958649/Mwazaro_Feb-110_iusor2.jpg"
      heroImage="https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958649/Mwazaro_Feb-110_iusor2.jpg"
      heroImageAlt="Bush properties in Kenya and Tanzania — luxury safari camp, The Bush Collection"
      eyebrow="The Bush Collection"
      h1Main="Bush"
      h1Accent="Properties"
      introHeading="Bush Properties Across Kenya & Tanzania"
      introParagraphs={[
        'Our bush properties sit within some of East Africa\'s most productive wildlife corridors — from the Serengeti\'s endless plains to the volcanic highlands of Ngorongoro and the baobab-studded plains of Tarangire. Each bush property in our collection is deliberately small and privately run, so you share the wilderness with a handful of guests, not a convoy of vehicles.',
        'Every bush property we work with gives guests access to private conservancies and concessions, meaning off-road game tracking, night drives, and walking safaris led by professional naturalist guides — experiences that simply aren\'t possible from a public-access lodge.',
        'Whether you\'re chasing the Great Migration, tracking the Big Five, or looking for a secluded honeymoon camp deep in the bush, our team matches you to the right bush property for your dates, budget, and interests.',
      ]}
      faqs={[
        {
          q: 'What are the best bush properties in Kenya and Tanzania?',
          a: 'The Bush Collection\'s bush properties span the Serengeti, Ngorongoro Crater and Tarangire in Tanzania, each chosen for exclusive conservancy access, small guest numbers, and proximity to major wildlife migrations. Our team can recommend the right bush property based on when you\'re travelling and what you want to see.',
        },
        {
          q: 'How much do bush properties cost per night?',
          a: 'Rates vary by property, season, and room category — most of our bush properties start from around $150–$300 per person per night on a full-board basis, rising for peak Great Migration season (July–October). Contact us for a transparent, bespoke quote.',
        },
        {
          q: 'What is included when I book a bush property with The Bush Collection?',
          a: 'Most bush property stays include full-board accommodation, twice-daily game drives with an expert guide, bush walks where permitted, airstrip or road transfers, and park or conservancy fees. We\'ll confirm exactly what\'s included for your chosen property before you book.',
        },
        {
          q: 'What is the best time of year to visit a bush property in East Africa?',
          a: 'July to October is peak season for the Great Migration in the Serengeti and Masai Mara ecosystem. January to March is calving season in the southern Serengeti and Ngorongoro area. The Bush Collection operates bush properties year-round and can tailor your dates to what you most want to see.',
        },
      ]}
      emptyStateNote="Our bush property listings are updating — contact us and our team will match you to the right camp."
    />
  );
}
