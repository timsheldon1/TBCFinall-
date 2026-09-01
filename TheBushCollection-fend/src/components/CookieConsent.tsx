import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { loadGTM } from '@/utils/gtm';

const STORAGE_KEY = 'cookie-consent';

export const openCookieSettings = () => {
  window.dispatchEvent(new Event('open-cookie-settings'));
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'accepted') {
      loadGTM();
    } else if (stored !== 'rejected') {
      setVisible(true);
    }

    const reopen = () => setVisible(true);
    window.addEventListener('open-cookie-settings', reopen);
    return () => window.removeEventListener('open-cookie-settings', reopen);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    loadGTM();
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[100] bg-[#0e0c0a]/97 backdrop-blur-md border-t border-white/[0.08] px-6 py-6 md:px-10"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <p className="text-white/60 text-sm font-light leading-relaxed max-w-2xl">
          We use cookies for essential site functionality and, with your permission, for
          analytics that help us understand how the site is used. Analytics cookies are only
          set if you accept.{' '}
          <Link to="/privacy-policy" className="text-tbc-gold hover:text-tbc-gold-dark underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={reject}
            className="rounded-none border-white/20 text-white/60 bg-transparent hover:bg-white/5 hover:text-white text-xs tracking-[0.15em] uppercase font-light px-6"
          >
            Necessary Only
          </Button>
          <Button
            onClick={accept}
            className="rounded-none bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth text-xs tracking-[0.15em] uppercase font-medium px-6"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
