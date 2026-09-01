import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';

const LAST_UPDATED = '14 July 2026';

export default function TermsOfService() {
  usePageSEO({
    title: 'Terms of Service | The Bush Collection',
    description: 'The terms governing bookings, payments, cancellations, and use of thebushcollection.africa.',
    canonical: 'https://thebushcollection.africa/terms-of-service',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <article className="max-w-3xl mx-auto px-6 md:px-8 pt-32 pb-24">
        <p className="text-xs tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 mb-3">
          Last updated {LAST_UPDATED}
        </p>
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">
          Terms of Service
        </h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
          These terms govern your use of thebushcollection.africa and any booking you make
          through it. By using this site or making a booking, you agree to them.
        </p>

        <div className="prose prose-gray dark:prose-invert prose-headings:font-light prose-a:text-tbc-gold prose-a:no-underline hover:prose-a:underline max-w-none space-y-10">

          <section>
            <h2>Who we are</h2>
            <p>
              The Bush Collection, 42 Claret Close, Silanga Road, Karen, Nairobi, P.O. Box
              58671-00200, Kenya. Contact:{' '}
              <a href="mailto:info@thebushcollection.africa">info@thebushcollection.africa</a>,{' '}
              <a href="tel:+254700613165">+254 700 613165</a>.
            </p>
          </section>

          <section>
            <h2>What we do</h2>
            <p>
              We curate and facilitate bookings for luxury safari camps, lodges, and beach
              properties across Kenya and Tanzania. Some properties are owned and operated
              directly by The Bush Collection; others are independently owned properties we
              partner with. Property pages on this site indicate details specific to that
              property; where anything on a property's own terms conflicts with these terms,
              the property-specific information takes precedence for that booking.
            </p>
          </section>

          <section>
            <h2>Accounts</h2>
            <p>
              You're responsible for keeping your login credentials confidential and for all
              activity under your account. Provide accurate information when creating an
              account or making a booking — inaccurate guest or contact details can delay or
              jeopardize your booking.
            </p>
          </section>

          <section>
            <h2>Bookings and payment</h2>
            <p>
              Prices are shown in USD unless stated otherwise and are per the terms displayed
              at the time of booking. A booking is only confirmed once payment (or the
              required deposit) has been received.
            </p>
            <p>
              Unless a property's specific terms state otherwise, bookings are secured with a{' '}
              <strong>30% deposit</strong>, with the remaining <strong>70% balance</strong>{' '}
              due before check-in as shown at checkout. Payments are processed by PesaPal;
              we do not directly handle or store your card or mobile money details.
            </p>
          </section>

          <section>
            <h2>Cancellations and refunds</h2>
            <p>Unless a specific property's listing states a different policy, cancellations are handled as follows:</p>
            <ul>
              <li><strong>Within 24 hours of booking:</strong> 100% refund</li>
              <li><strong>14 or more days before check-in:</strong> 75% refund</li>
              <li><strong>7–13 days before check-in:</strong> 50% refund</li>
              <li><strong>Less than 48 hours before check-in, or no-show:</strong> no refund</li>
            </ul>
            <p>
              To cancel, use the{' '}
              <Link to="/cancellation-request">cancellation request</Link> page. Requests are
              typically reviewed within 24–48 hours.
            </p>
          </section>

          <section>
            <h2>Acceptable use</h2>
            <p>
              Don't use this site to make fraudulent bookings, scrape or copy its content, or
              interfere with its normal operation. We may cancel bookings or suspend accounts
              we reasonably believe involve fraud or misuse.
            </p>
          </section>

          <section>
            <h2>Intellectual property</h2>
            <p>
              The text, images, logos, and design of this site belong to The Bush Collection
              or our licensors. You may not reproduce or redistribute them without permission,
              beyond normal personal browsing and sharing of individual pages.
            </p>
          </section>

          <section>
            <h2>Travel is inherently unpredictable</h2>
            <p>
              Safari and coastal travel involve wildlife, weather, and remote locations that
              are outside anyone's control. We work with reputable properties and partners,
              but we can't guarantee specific wildlife sightings, weather conditions, or that
              every element of an itinerary will proceed exactly as planned. We're not liable
              for delays, changes, or losses caused by circumstances beyond our reasonable
              control, including weather, wildlife behavior, third-party transport, or events
              at an independently-operated partner property.
            </p>
          </section>

          <section>
            <h2>Limitation of liability</h2>
            <p>
              To the extent permitted by Kenyan law, The Bush Collection's total liability to
              you for any claim arising from your booking is limited to the amount you paid
              for that booking. We're not liable for indirect or consequential losses.
              Nothing in these terms limits liability that cannot be limited under Kenyan law.
            </p>
          </section>

          <section>
            <h2>Governing law</h2>
            <p>These terms are governed by the laws of Kenya, and any dispute is subject to the exclusive jurisdiction of the courts of Nairobi.</p>
          </section>

          <section>
            <h2>Changes to these terms</h2>
            <p>We may update these terms from time to time. The "last updated" date above reflects the most recent version. Continued use of the site after changes means you accept the updated terms.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about these terms: <a href="mailto:info@thebushcollection.africa">info@thebushcollection.africa</a>,{' '}
              <a href="tel:+254700613165">+254 700 613165</a>, or 42 Claret Close, Silanga Road, Karen, Nairobi.
            </p>
          </section>

          <p className="text-sm text-gray-400 dark:text-gray-500 pt-6 border-t border-gray-200 dark:border-gray-800">
            These terms are provided as a good-faith, plain-language description of how
            bookings work on this site and are not a substitute for independent legal advice.
            See also our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </article>
      <Footer />
    </div>
  );
}
