import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { openCookieSettings } from '@/components/CookieConsent';

const LAST_UPDATED = '14 July 2026';

export default function PrivacyPolicy() {
  usePageSEO({
    title: 'Privacy Policy | The Bush Collection',
    description: 'How The Bush Collection collects, uses, and protects your personal information when you browse our site, book a stay, or contact us.',
    canonical: 'https://thebushcollection.africa/privacy-policy',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <article className="max-w-3xl mx-auto px-6 md:px-8 pt-32 pb-24">
        <p className="text-xs tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 mb-3">
          Last updated {LAST_UPDATED}
        </p>
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
          This policy explains what personal information The Bush Collection ("we," "us")
          collects through thebushcollection.africa, why we collect it, who we share it
          with, and the choices you have. It's written in plain language rather than legal
          boilerplate, and it describes what this site actually does, not a generic template.
        </p>

        <div className="prose prose-gray dark:prose-invert prose-headings:font-light prose-a:text-tbc-gold prose-a:no-underline hover:prose-a:underline max-w-none space-y-10">

          <section>
            <h2>Who we are</h2>
            <p>
              The Bush Collection is based at 42 Claret Close, Silanga Road, Karen, Nairobi,
              P.O. Box 58671-00200, Kenya. For any privacy question, contact us at{' '}
              <a href="mailto:info@thebushcollection.africa">info@thebushcollection.africa</a>{' '}
              or <a href="tel:+254700613165">+254 700 613165</a>.
            </p>
          </section>

          <section>
            <h2>Information we collect</h2>
            <p>We collect information you give us directly, and a small amount collected automatically.</p>
            <h3>Account information</h3>
            <p>If you create an account: your full name, email address, and a password (which we store as a salted cryptographic hash; we never store or can see your actual password).</p>
            <h3>Booking information</h3>
            <p>When you request or make a booking: first and last name, email, phone number, check-in/check-out dates, number of guests, special requests, and, if requested, airport transfer flight details. Payment itself is handled by PesaPal (see "Third parties" below); we do not receive or store your card or mobile money details.</p>
            <h3>Contact and enquiry forms</h3>
            <p>Name, email, phone number, subject, message, travel dates, group size, and travel interests, if you use our contact form.</p>
            <h3>Newsletter</h3>
            <p>Your email address, if you subscribe. We use Mailchimp to send newsletters; see "Third parties" below.</p>
            <h3>Automatically collected information</h3>
            <p>If you accept analytics cookies, Google Analytics collects your IP address (in truncated/anonymized form), browser and device type, pages visited, and general location. This only happens after you accept via the cookie banner (see "Cookies" below).</p>
          </section>

          <section>
            <h2>How we use your information</h2>
            <ul>
              <li>To create and manage your account</li>
              <li>To process and confirm bookings, and to communicate with you about them</li>
              <li>To respond to enquiries submitted through our contact form or chatbot</li>
              <li>To send booking confirmations, password resets, and other transactional emails</li>
              <li>To send newsletters, only to people who have actively subscribed</li>
              <li>To understand how the site is used and improve it, only where you've consented to analytics cookies</li>
            </ul>
            <p>We do not sell your personal information to anyone.</p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              We use a small number of strictly necessary cookies/local storage entries required
              for the site to function (for example, keeping you signed in). These load
              automatically and can't be switched off, because the site can't work without them.
            </p>
            <p>
              We also use Google Analytics and Google Tag Manager to understand site usage,
              but only if you accept this when prompted by the cookie banner on your first
              visit. If you choose "Necessary Only," none of these load, no analytics cookies
              are set, and no usage data is sent to Google.
            </p>
            <p>
              You can change your choice at any time:{' '}
              <button
                type="button"
                onClick={openCookieSettings}
                className="text-tbc-gold hover:underline font-normal"
              >
                open cookie settings
              </button>.
            </p>
          </section>

          <section>
            <h2>Third parties we share information with</h2>
            <p>We work with a small number of service providers who process data on our behalf. We don't allow them to use your data for their own purposes.</p>
            <ul>
              <li><strong>PesaPal:</strong> processes payments for bookings. Your card or mobile money details are handled directly by PesaPal; we never see or store them.</li>
              <li><strong>Mailchimp:</strong> sends our newsletter, if you've subscribed.</li>
              <li><strong>Google Analytics &amp; Google Tag Manager:</strong> site usage analytics, only after you accept cookies.</li>
              <li><strong>Cloudinary:</strong> hosts the images and video shown on this site (does not process your personal data).</li>
              <li><strong>Hosting and database providers</strong> (our servers and database): store the information described above so the site and your account can function.</li>
            </ul>
            <p>We may also disclose information if required by law, or to protect the rights, safety, or property of The Bush Collection or others.</p>
          </section>

          <section>
            <h2>How long we keep your information</h2>
            <p>
              We keep account and booking information for as long as your account is active
              and for a reasonable period afterward for accounting, legal, and dispute-resolution
              purposes. Newsletter subscriber data is kept until you unsubscribe. You can request
              deletion at any time (see "Your rights" below).
            </p>
          </section>

          <section>
            <h2>Security</h2>
            <p>
              The site is served over HTTPS. Passwords are hashed with bcrypt before storage,
              so we cannot retrieve your actual password even if we wanted to. Login sessions use
              short-lived access tokens. No online system is perfectly secure, but we take
              reasonable, industry-standard steps to protect your information.
            </p>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>
              Under Kenya's Data Protection Act (2019), you have the right to access, correct,
              or request deletion of your personal information, and to object to or restrict
              certain processing. If you're located in the EU/UK, equivalent rights apply under
              GDPR/UK GDPR. To exercise any of these, email{' '}
              <a href="mailto:info@thebushcollection.africa">info@thebushcollection.africa</a>.
              You can also lodge a complaint with Kenya's Office of the Data Protection Commissioner.
            </p>
          </section>

          <section>
            <h2>International data transfers</h2>
            <p>
              Some of the service providers listed above (Google, Mailchimp, our hosting
              provider) may process data outside Kenya. Where this happens, we rely on those
              providers' own safeguards and standard contractual protections for international
              transfers.
            </p>
          </section>

          <section>
            <h2>Children's privacy</h2>
            <p>This site is not directed at children, and we don't knowingly collect personal information from anyone under 18.</p>
          </section>

          <section>
            <h2>Changes to this policy</h2>
            <p>We may update this policy from time to time. The "last updated" date at the top will always reflect the most recent version.</p>
          </section>

          <section>
            <h2>Contact us</h2>
            <p>
              Questions about this policy or your data: <a href="mailto:info@thebushcollection.africa">info@thebushcollection.africa</a>,{' '}
              <a href="tel:+254700613165">+254 700 613165</a>, or 42 Claret Close, Silanga Road, Karen, Nairobi.
            </p>
          </section>

          <p className="text-sm text-gray-400 dark:text-gray-500 pt-6 border-t border-gray-200 dark:border-gray-800">
            This policy is provided as a good-faith description of our actual data practices
            and is not a substitute for independent legal advice. See also our{' '}
            <Link to="/terms-of-service" className="underline">Terms of Service</Link>.
          </p>
        </div>
      </article>
      <Footer />
    </div>
  );
}
