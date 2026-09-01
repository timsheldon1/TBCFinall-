import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { openCookieSettings } from '@/components/CookieConsent';

export default function Footer() {
  return (
    <footer className="bg-tbc-dark border-t border-white/[0.06]" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <h2 className="text-tbc-gold text-sm tracking-[0.25em] uppercase font-light mb-6">The Bush Collection</h2>
            <p className="text-white/40 text-sm font-light leading-relaxed">
              Creating unforgettable{' '}
              <strong className="font-normal text-white/50">luxury bush camp</strong> and beach lodge
              experiences across Africa's most spectacular destinations for over 40 years.
            </p>
          </div>

          <nav aria-label="Site navigation">
            <h3 className="text-white/60 text-xs tracking-[0.2em] uppercase font-light mb-6">Navigate</h3>
            <ul className="space-y-3">
              {[
                { to: '/about',        label: 'About Us' },
                { to: '/packages',     label: 'Safari Packages' },
                { to: '/collections',  label: 'Luxury Bush Camps' },
                { to: '/contact',      label: 'Contact' },
                { to: '/faq',          label: 'FAQ' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/40 hover:text-tbc-gold text-sm font-light transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-white/60 text-xs tracking-[0.2em] uppercase font-light mb-6">Destinations</h3>
            <ul className="space-y-3">
              {[
                { to: '/bush-properties',  label: 'Bush Properties' },
                { to: '/beach-properties', label: 'Beach Properties' },
                { to: '/collections',      label: 'Luxury Bush Camps Tanzania' },
                { to: '/collections',      label: 'Masai Mara Safari Camps' },
                { to: '/collections',      label: 'Serengeti Bush Camps' },
              ].map(dest => (
                <li key={dest.label}>
                  <Link
                    to={dest.to}
                    className="text-white/40 hover:text-tbc-gold text-sm font-light transition-colors duration-300"
                  >
                    {dest.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <address className="not-italic">
            <h3 className="text-white/60 text-xs tracking-[0.2em] uppercase font-light mb-6">Contact</h3>
            <ul className="space-y-3 text-white/40 text-sm font-light">
              <li>
                <a href="tel:+254700613165" className="hover:text-tbc-gold transition-colors duration-300 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  +254 700 613165
                </a>
              </li>
              <li>
                <a href="mailto:info@thebushcollection.africa" className="hover:text-tbc-gold transition-colors duration-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  info@thebushcollection.africa
                </a>
              </li>
              <li>42 Claret Close, Silanga Road, Karen</li>
              <li>P.O BOX 58671-00200, Nairobi</li>
            </ul>
          </address>
        </div>

        <div className="border-t border-white/[0.06] mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/30 text-xs tracking-wide font-light">
            &copy; {new Date().getFullYear()} The Bush Collection. All rights reserved.{' '}
            Luxury bush camps &amp; beach lodges in Kenya and Tanzania.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-white/30 hover:text-tbc-gold text-xs font-light transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-white/30 hover:text-tbc-gold text-xs font-light transition-colors duration-300">
              Terms of Service
            </Link>
            <button
              type="button"
              onClick={openCookieSettings}
              className="text-white/30 hover:text-tbc-gold text-xs font-light transition-colors duration-300"
            >
              Cookie Settings
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-[1px] bg-tbc-gold/30" aria-hidden="true" />
            <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-light">Experience is Everything</span>
            <div className="w-8 h-[1px] bg-tbc-gold/30" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
}
