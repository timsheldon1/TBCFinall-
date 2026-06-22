import { useState } from 'react';
import Footer from '@/components/Footer';
import {
  MapPin, Phone, Mail, Clock, Send,
  Calendar, Users, HelpCircle, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import FAQModal from '@/components/FAQModal';
import { subscribeToMailchimp } from '@/lib/mailchimp';
import { API_BASE } from '@/lib/api';
import { motion } from 'framer-motion';

// ─── Shared form styles ──────────────────────────────────────────────────────
const inputCls =
  'w-full bg-tbc-surface border border-white/[0.08] text-white placeholder:text-white/20 ' +
  'focus:border-tbc-gold/40 focus:outline-none rounded-none h-12 px-4 text-sm tracking-wide ' +
  'font-light transition-colors duration-300';
const labelCls = 'text-white/40 text-[9px] tracking-[0.35em] uppercase font-light block mb-2';

const CONTACT_INFO = [
  { icon: Phone,  label: 'Phone',  lines: ['+254 116 072 343'],                                                      sub: 'Mon – Fri, 8 AM – 5 PM EAT' },
  { icon: Mail,   label: 'Email',  lines: ['info@thebushcollection.africa', 'reservations@thebushcollection.africa'], sub: 'We respond within 24 hours' },
  { icon: MapPin, label: 'Office', lines: ['42 Claret Close', 'Silanga Road, Karen'],                                sub: 'By appointment' },
  { icon: Clock,  label: 'Hours',  lines: ['Mon – Fri: 8 AM – 4 PM'],                                               sub: 'Closed on Sundays' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '',
    message: '', travelDates: '', groupSize: '', interests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    const subjectMap: Record<string, string> = {
      general: 'General enquiry', booking: 'Booking Question',
      custom: 'Custom Safari request', group: 'Group booking', support: 'Customer support',
    };
    const groupSizeMap: Record<string, string> = {
      '1': '1 person', '2': '2 people', '3-4': '3-4 people', '5-8': '5-8 people', '9+': '9+ people',
    };
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, '')}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name, email: formData.email,
          phone: formData.phone || undefined,
          subject: subjectMap[formData.subject] || formData.subject || undefined,
          preferredTravelDates: formData.travelDates || undefined,
          groupSize: groupSizeMap[formData.groupSize] || formData.groupSize || undefined,
          safariInterests: formData.interests || undefined,
          message: formData.message, subscribe: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Thank you! We'll get back to you within 24 hours.");
        setFormData({ name: '', email: '', phone: '', subject: '', message: '', travelDates: '', groupSize: '', interests: '' });
      } else {
        toast.error(data.error || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-tbc-ink text-white">

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dfaakg2ds/image/upload/v1774956948/IMG_5999_qasbj1.jpg"
            alt="The Bush Collection — contact our safari specialists"
            className="w-full h-full object-cover object-center"
            fetchPriority="high"
            decoding="sync"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink via-tbc-ink/60 to-tbc-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-tbc-ink/75 via-tbc-ink/20 to-transparent" />
        <div className="absolute inset-6 md:inset-10 border border-white/[0.06] pointer-events-none" />

        {/* Vertical editorial label */}
        <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 z-20" aria-hidden="true">
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
            Safari Specialists · Since 1983
          </span>
        </div>

        {/* Content — anchored to bottom, never higher than nav */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="w-full max-w-7xl mx-auto px-8 md:px-16 pb-20 md:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-10 h-px bg-tbc-gold" />
              <span className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light">
                The Bush Collection · Nairobi
              </span>
            </motion.div>

            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,8vw,7rem)] font-light text-white leading-[0.9] tracking-tight"
              >
                Get in<br />
                <span className="italic text-tbc-gold/90">Touch.</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="text-white/45 text-base md:text-lg font-light leading-relaxed max-w-md mb-10"
            >
              Our team of safari specialists is here to craft your dream African journey —
              from the first inquiry to the final sunset.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              <div className="w-px h-10 bg-gradient-to-b from-tbc-gold/50 to-transparent animate-[scrollbounce_2s_ease-in-out_infinite]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CONTACT INFO STRIP
      ════════════════════════════════════ */}
      <section className="bg-tbc-dark border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.05]">
            {CONTACT_INFO.map(({ icon: Icon, label, lines, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="px-8 py-10 group"
              >
                <div className="w-9 h-9 border border-white/[0.08] flex items-center justify-center mb-5 group-hover:border-tbc-gold/30 transition-colors duration-500">
                  <Icon className="w-4 h-4 text-tbc-gold/60" />
                </div>
                <p className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light mb-3">{label}</p>
                <div className="space-y-0.5 mb-2">
                  {lines.map((line, idx) => (
                    <p key={idx} className="text-white/75 text-sm font-light">{line}</p>
                  ))}
                </div>
                <p className="text-white/28 text-xs font-light">{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FORM + SIDEBAR
      ════════════════════════════════════ */}
      <section className="bg-tbc-earth py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-px bg-tbc-gold" />
              <p className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light">Start Planning</p>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white/90 leading-tight mb-5">
              Send Us a<br />
              <span className="italic text-tbc-gold/85">Message</span>
            </h2>
            <p className="text-white/38 text-base font-light leading-relaxed max-w-xl">
              Whether you're planning a honeymoon safari, a family expedition, or a corporate retreat — we'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

            {/* ── Form (2/3) ── */}
            <motion.form
              onSubmit={handleSubmit}
              className="lg:col-span-2 space-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full Name <span className="text-tbc-gold">*</span></label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email Address <span className="text-tbc-gold">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 ..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Subject</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className={`${inputCls} cursor-pointer appearance-none`}
                    style={{ backgroundColor: '#322e2b' }}
                  >
                    <option value="" disabled>Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="booking">Booking Question</option>
                    <option value="custom">Custom Safari Request</option>
                    <option value="group">Group Booking</option>
                    <option value="support">Customer Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Preferred Travel Dates</label>
                  <input
                    value={formData.travelDates}
                    onChange={e => setFormData({ ...formData, travelDates: e.target.value })}
                    placeholder="e.g., July 2026"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Group Size</label>
                  <select
                    value={formData.groupSize}
                    onChange={e => setFormData({ ...formData, groupSize: e.target.value })}
                    className={`${inputCls} cursor-pointer appearance-none`}
                    style={{ backgroundColor: '#322e2b' }}
                  >
                    <option value="" disabled>Number of travellers</option>
                    <option value="1">Solo traveller</option>
                    <option value="2">2 guests</option>
                    <option value="3-4">3 – 4 guests</option>
                    <option value="5-8">5 – 8 guests</option>
                    <option value="9+">9+ guests</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Safari Interests</label>
                <input
                  value={formData.interests}
                  onChange={e => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g., Big Five, Photography, Cultural experiences"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Message <span className="text-tbc-gold">*</span></label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your dream safari..."
                  rows={6}
                  required
                  className="w-full bg-tbc-surface border border-white/[0.08] text-white placeholder:text-white/20 focus:border-tbc-gold/40 focus:outline-none rounded-none px-4 py-3 text-sm tracking-wide font-light transition-colors duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-3 bg-tbc-gold hover:bg-tbc-gold-dark disabled:opacity-50 text-tbc-earth px-10 py-4 text-[10px] tracking-[0.25em] uppercase font-medium transition-colors duration-300 mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </motion.form>

            {/* ── Sidebar (1/3) ── */}
            <motion.div
              className="space-y-3 lg:sticky lg:top-8 self-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Quick links */}
              <div className="bg-tbc-dark border border-white/[0.06] px-7 py-6">
                <p className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light mb-5">Quick Links</p>
                <div className="divide-y divide-white/[0.05]">
                  {([
                    { icon: Calendar, label: 'Browse Safari Packages', type: 'link', to: '/packages' },
                    { icon: MapPin,   label: 'View Safari Properties', type: 'link', to: '/collections' },
                  ] as const).map(({ icon: Icon, label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 py-3.5 text-white/40 hover:text-white/80 group/row transition-colors duration-200"
                    >
                      <Icon className="w-3.5 h-3.5 text-tbc-gold/45 flex-shrink-0 group-hover/row:text-tbc-gold transition-colors duration-200" />
                      <span className="flex-1 text-sm font-light">{label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0.5 transition-all duration-200" />
                    </Link>
                  ))}
                  <FAQModal
                    trigger={
                      <button className="w-full flex items-center gap-3 py-3.5 text-white/40 hover:text-white/80 group/row transition-colors duration-200">
                        <HelpCircle className="w-3.5 h-3.5 text-tbc-gold/45 flex-shrink-0 group-hover/row:text-tbc-gold transition-colors duration-200" />
                        <span className="flex-1 text-left text-sm font-light">Frequently Asked Questions</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0.5 transition-all duration-200" />
                      </button>
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, subject: 'group' }))}
                    className="w-full flex items-center gap-3 py-3.5 text-white/40 hover:text-white/80 group/row transition-colors duration-200"
                  >
                    <Users className="w-3.5 h-3.5 text-tbc-gold/45 flex-shrink-0 group-hover/row:text-tbc-gold transition-colors duration-200" />
                    <span className="flex-1 text-left text-sm font-light">Request Group Quote</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover/row:opacity-100 group-hover/row:translate-x-0.5 transition-all duration-200" />
                  </button>
                </div>
              </div>

              {/* Emergency line */}
              <div className="bg-tbc-ink border border-white/[0.06] px-7 py-7">
                <div className="flex items-center gap-2.5 mb-4">
                  <Phone className="w-3.5 h-3.5 text-tbc-gold/55" />
                  <p className="text-tbc-gold/55 text-[9px] tracking-[0.3em] uppercase font-light">24 / 7 Emergency Line</p>
                </div>
                <a
                  href="tel:+254116072343"
                  className="text-2xl font-light text-white hover:text-tbc-gold transition-colors duration-300 block mb-3"
                >
                  +254 116 072 343
                </a>
                <p className="text-white/28 text-xs font-light leading-relaxed">
                  For guests on active safari bookings requiring immediate on-ground assistance.
                </p>
              </div>

              {/* Trust points */}
              <div className="bg-tbc-dark border border-white/[0.06] px-7 py-6">
                <p className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light mb-5">Why Choose Us</p>
                <ul className="space-y-3.5">
                  {[
                    '40+ years of safari heritage',
                    '24-hour response guarantee',
                    'Bespoke itinerary crafting',
                    'On-ground support across East Africa',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-white/38 text-sm font-light leading-relaxed">
                      <div className="w-1 h-1 rounded-full bg-tbc-gold/50 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          MAP
      ════════════════════════════════════ */}
      <section className="bg-tbc-dark py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-8 h-px bg-tbc-gold" />
              <p className="text-tbc-gold text-[10px] tracking-[0.4em] uppercase font-light">Find Us</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-white/90 leading-tight mb-3">
              Visit Our <span className="italic text-tbc-gold/80">Office</span>
            </h2>
            <p className="text-white/35 text-sm font-light">
              42 Claret Close · Silanga Road · Karen, Nairobi
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="border border-white/[0.06] overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-tbc-gold z-10" />
            <iframe
              src="https://maps.google.com/maps?width=600&height=400&hl=en&q=The%20Bush%20Collection&t=&z=14&ie=UTF8&iwloc=B&output=embed"
              width="100%"
              height="460"
              loading="lazy"
              title="The Bush Collection office location"
              style={{ display: 'block', border: 'none', filter: 'sepia(40%) contrast(0.9) brightness(0.75)' }}
              allowFullScreen
            />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA
      ════════════════════════════════════ */}
      <section className="relative bg-tbc-ink py-28 md:py-36 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-[20vw] font-light text-white/[0.025] whitespace-nowrap">SAFARI</span>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-tbc-gold/20" />

        <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-5 mb-10">
              <div className="w-12 h-px bg-tbc-gold/30" />
              <span className="text-tbc-gold text-[10px] tracking-[0.45em] uppercase font-light">Ready to Begin?</span>
              <div className="w-12 h-px bg-tbc-gold/30" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white/90 leading-[1.05] mb-8">
              Let's craft your<br />
              <span className="italic text-tbc-gold">perfect safari</span>
            </h2>
            <p className="text-white/38 text-base font-light leading-relaxed max-w-md mx-auto mb-12">
              Our expert team is standing by to create an unforgettable African journey
              tailored exclusively for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+254116072343"
                className="inline-flex items-center justify-center gap-2.5 bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth px-10 py-4 text-[10px] tracking-[0.22em] uppercase font-medium transition-colors duration-300"
              >
                <Phone className="w-3.5 h-3.5" />
                Call +254 116 072 343
              </a>
              <Link
                to="/packages"
                className="inline-flex items-center justify-center gap-2.5 border border-white/[0.12] hover:border-tbc-gold/40 text-white/45 hover:text-white/75 px-10 py-4 text-[10px] tracking-[0.22em] uppercase font-light transition-all duration-300"
              >
                Explore Packages
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ─── Newsletter sub-component ─────────────────────────────────────────────── */
function NewsletterCard({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) return toast.error('Enter a valid email');
    setLoading(true);
    try {
      const res = await subscribeToMailchimp({ email });
      if (res.success) {
        toast.success('Subscribed — check your inbox');
        setEmail('');
        onClose?.();
      } else {
        toast.error(res.error || 'Subscription failed');
      }
    } catch {
      toast.error('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="flex gap-3">
      <input
        placeholder="Your email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="flex-1 bg-tbc-surface border border-white/[0.08] text-white placeholder:text-white/20 focus:border-tbc-gold/40 focus:outline-none px-4 py-2.5 text-sm font-light"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-tbc-gold hover:bg-tbc-gold-dark disabled:opacity-50 text-tbc-earth px-5 py-2.5 text-[10px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 whitespace-nowrap"
      >
        {loading ? '…' : 'Subscribe'}
      </button>
    </form>
  );
}
