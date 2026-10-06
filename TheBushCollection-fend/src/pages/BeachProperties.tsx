import CategoryPropertiesPage from '@/components/CategoryPropertiesPage';

export default function BeachProperties() {
  return (
    <CategoryPropertiesPage
      category="beach"
      path="/beach-properties"
      seoTitle="Beach Properties in Kenya | Luxury Coastal Lodges & Villas | The Bush Collection"
      seoDescription="Discover our beach properties on Kenya's Indian Ocean coast and Zanzibar: luxury coastal lodges and villas in Shimoni and Kwale. Book direct with The Bush Collection."
      ogImage="https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958648/Mwazaro_Feb-23_npdrys.jpg"
      heroImage="https://res.cloudinary.com/dfaakg2ds/image/upload/v1774958648/Mwazaro_Feb-23_npdrys.jpg"
      heroImageAlt="Beach properties on Kenya's Indian Ocean coast: luxury coastal lodge, The Bush Collection"
      eyebrow="The Bush Collection"
      h1Main="Beach"
      h1Accent="Properties"
      introHeading="Beach Properties on Kenya's Coast & Zanzibar"
      introParagraphs={[
        'Our beach properties sit along 300 metres of untouched Indian Ocean coastline in Shimoni and Kwale, and on the white sands of Zanzibar, a short drive or flight from Mombasa and Diani. Each beach property in our collection is family-run and intimate, built around tranquil mangrove-lined coastline rather than crowded resort strips.',
        'A beach property with The Bush Collection means genuine coastal hospitality: sea-view suites, a private stretch of beach, and easy access to snorkelling, kayaking, dolphin watching, and dhow sailing on the reef just offshore.',
        'Many guests combine a bush property safari with a stay at one of our beach properties. Resting on the coast after days in the bush is one of the most popular ways to end a Kenya or Tanzania trip.',
      ]}
      faqs={[
        {
          q: 'What are the best beach properties in Kenya?',
          a: 'The Bush Collection\'s beach properties are set along the South Coast in Shimoni and Kwale, offering 300 metres of pristine beach, mangrove forests, and a short transfer from Mombasa and Diani airports. Our team can recommend the right beach property based on your travel dates and interests.',
        },
        {
          q: 'Can I combine a bush property safari with a beach property stay?',
          a: 'Yes, this is one of our most popular itineraries. Guests typically spend 4–7 nights at a bush property on safari, then fly or drive to one of our beach properties on the Kenya coast or Zanzibar for a few nights of rest before departure.',
        },
        {
          q: 'How do I get to a beach property from Nairobi or Mombasa?',
          a: 'Most beach properties on the Kenya South Coast are reached via a short flight or road transfer from Mombasa, itself a short domestic flight from Nairobi. Our team arranges all transfers as part of your booking.',
        },
        {
          q: 'What is the best time of year to visit a beach property in Kenya?',
          a: 'The Kenya coast is warm and swimmable year-round. The driest, sunniest months are December to March and July to October, the same peak windows as safari season, making it easy to combine a bush property and beach property in one trip.',
        },
      ]}
      emptyStateNote="Our beach property listings are updating. Contact us and our team will match you to the right lodge."
    />
  );
}
