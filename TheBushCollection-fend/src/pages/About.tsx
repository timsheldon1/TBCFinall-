import Footer from '@/components/Footer';
import { Eye, Target, BookOpen, Handshake, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '40+',       label: 'Years of Heritage'       },
  { value: 'Kenya',     label: 'East African Destination' },
  { value: 'Tanzania',  label: 'East African Destination' },
  { value: '4.5★',      label: 'Average Guest Rating'    },
];

const TEAM = [
  {
    name: 'Andre Du Plessis',
    role: 'Founder & Proud Owner',
    image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1772024009/Andre_Pic_wyfgwy.png',
    bio: 'Safari enthusiast with 40+ years of African travel experience.',
    featured: true,
  },
  {
    name: 'Paul Muchiri, MBA CPA',
    role: 'General Manager',
    image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1772015030/Paul_jguahv.png',
    bio: 'Experienced hospitality leader providing strategic leadership and ensuring exceptional service standards across all properties.',
  },
  {
    name: 'James Mwangi',
    role: 'Head of IT',
    image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1769681709/James_wfhj6t.jpg',
    bio: 'Designs personalized itineraries and ensures every guest receives attentive, tailored service from inquiry to return.',
  },
  {
    name: 'Linda Otieno',
    role: 'Head of Reservations & Sales',
    image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1771577013/linda2_k2ipao.jpg',
    bio: 'Passionate hotelier dedicated to creating memorable guest experiences while driving sales growth and operational excellence.',
  },
  {
    name: 'Molly Obondi',
    role: 'Sales & Reservations',
    image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1769681709/Molly_uutxyb.jpg',
    bio: 'With a genuine love for hospitality, takes pride in connecting guests with the perfect stay experience.',
  },
  {
    name: 'Christine Mutie',
    role: 'Procurement Officer',
    image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1769681710/Christine_z6qwzi.jpg',
    bio: 'Sources best-in-class suppliers and manages procurement to ensure high-quality, reliable logistics across all experiences.',
  },
  {
    name: 'Timsheldon Oure',
    role: 'IT Support & Web Development',
    image: 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1769681709/Tim_ueubsn.jpg',
    bio: 'Keeps the website and systems running smoothly so the team can focus on delivering outstanding safari experiences.',
  },
];

const VALUES = [
  {
    n: '01',
    title: 'Community Partnerships',
    body: 'All of our properties — now and in the future — are founded in partnership with local communities. This is critical for the long-term preservation of our primary asset: our wildlife.',
  },
  {
    n: '02',
    title: 'Educating the Next Generation',
    body: 'Each of our properties is required to enter into educating the next generation of conservationists, nurturing those who will protect these landscapes for decades to come.',
  },
  {
    n: '03',
    title: 'Direct Community Impact',
    body: 'All donor funding goes directly to schools and communities — because we believe education is at the forefront of conservation and lasting change.',
  },
  {
    n: '04',
    title: 'Recognised Programmes',
    body: 'We maintain externally recognised conservation and community programmes that hold us to the highest standards of environmental and social responsibility.',
  },
];

const CONSERVATION = [
  { icon: BookOpen,  title: 'Education First',      text: 'Funding flows directly to schools and communities to nurture future conservationists.' },
  { icon: Handshake, title: 'Local Partnerships',   text: 'Every property is built on a foundation of deep collaboration with surrounding communities.' },
  { icon: Shield,    title: 'Recognised Standards', text: 'Externally recognised programmes ensure full accountability to the highest environmental standards.' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function About() {
  const allTeam  = TEAM.slice(1);
  const doubled  = [...allTeam, ...allTeam]; // seamless marquee loop

  return (
    <div className="min-h-screen bg-tbc-ink text-white">

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay loop muted playsInline
        >
          <source src="/images/16.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink via-tbc-ink/60 to-tbc-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-tbc-ink/70 via-tbc-ink/20 to-transparent" />
        <div className="absolute inset-6 md:inset-10 border border-white/[0.06] pointer-events-none" />

        <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 z-20" aria-hidden="true">
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/10 font-light [writing-mode:vertical-lr] rotate-180">
            The Bush Collection · Est. 1983
          </span>
        </div>

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
                Est. 1983 · East Africa
              </span>
            </motion.div>

            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-[clamp(3rem,8vw,7rem)] font-light text-white leading-[0.9] tracking-tight"
              >
                Experience is<br />
                <span className="italic text-tbc-gold/90">Everything.</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="text-white/45 text-base md:text-lg font-light leading-relaxed max-w-lg mb-10"
            >
              Spanning Kenya and Tanzania, The Bush Collection brings together affordable lodges
              and camps in optimal locations — delivering exceptional hospitality with heartfelt warmth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/packages">
                <button className="h-12 px-8 bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-200">
                  Explore Packages
                </button>
              </Link>
              <Link to="/contact">
                <button className="h-12 px-8 border border-white/25 text-white/60 hover:border-white/50 hover:text-white text-[10px] tracking-[0.2em] uppercase font-light transition-all duration-200">
                  Get in Touch
                </button>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════ */}
      <section className="bg-tbc-dark border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.05]">
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="px-8 py-12 text-center"
              >
                <p className="text-4xl md:text-5xl font-light text-white mb-3">{value}</p>
                <p className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHO WE ARE
      ════════════════════════════════════ */}
      <section className="bg-tbc-earth py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-px bg-tbc-gold" />
                <span className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light">Our Heritage</span>
              </div>
              <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white/90 leading-[0.95] tracking-tight mb-10">
                Who<br />
                <span className="italic text-white/60">We Are.</span>
              </h2>
              <div className="space-y-5 text-white/45 font-light leading-relaxed text-[15px] max-w-xl">
                <p>
                  A family-developed safari brand with{' '}
                  <span className="text-white/75">deep heritage in tourism and conservation</span>{' '}
                  in East Africa. Our business is derived from over 40 years of safari camp and lodge hospitality, with additional experience in the luxury destination sector.
                </p>
                <p>
                  Our venture comes at a time when the safari sector has never been so popular, with a{' '}
                  <span className="text-white/75">record number of travellers</span>{' '}
                  visiting East Africa.
                </p>
                <p>
                  We welcome independent brands that share our service ethic — developing{' '}
                  <span className="italic text-white/60">'tourism-conservation partnerships'</span>{' '}
                  that make a lasting difference.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                {['40+ Years Heritage', 'Family Brand', 'Conservation Partnerships'].map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/[0.1] text-white/35 text-[9px] tracking-[0.3em] uppercase font-light px-4 py-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Image / logo */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative"
            >
              <div className="relative overflow-hidden bg-tbc-surface p-10 md:p-14">
                <img
                  src="https://res.cloudinary.com/dfaakg2ds/image/upload/v1777961427/LOGO_oifllk.png"
                  alt="The Bush Collection"
                  className="w-full"
                />
                <div className="absolute inset-0 border border-white/[0.05] pointer-events-none" />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-tbc-dark border border-white/[0.08] px-7 py-5">
                <p className="text-white text-2xl font-light leading-none mb-1">40+</p>
                <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase font-light">Years Safari Heritage</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          VISION & MISSION
      ════════════════════════════════════ */}
      <section className="bg-tbc-ink py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">

          <div className="flex items-center gap-4 mb-16">
            <div className="w-8 h-px bg-tbc-gold" />
            <span className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light">What We Stand For</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/[0.06]">
            {[
              {
                label: 'Vision',
                Icon: Eye,
                text: 'To be the preferred choice for travelers seeking comfort, authenticity and unforgettable experiences in every destination we serve.',
              },
              {
                label: 'Mission',
                Icon: Target,
                text: 'To provide exceptional, personalized experiences in comfortable, welcoming environments, where every guest feels at home and connected to the beauty of nature.',
              },
            ].map(({ label, Icon, text }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`px-12 py-16 ${i === 0 ? 'border-b md:border-b-0 md:border-r border-white/[0.06]' : ''}`}
              >
                <div className="w-10 h-10 border border-white/[0.1] flex items-center justify-center mb-8">
                  <Icon className="w-4 h-4 text-tbc-gold/60" />
                </div>
                <p className="text-tbc-gold text-[9px] tracking-[0.45em] uppercase font-light mb-5">Our {label}</p>
                <p className="text-white/70 text-xl md:text-2xl font-light leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════
          FOUNDER QUOTE
      ════════════════════════════════════ */}
      <section className="bg-tbc-dark py-24 md:py-36 relative overflow-hidden">
        {/* Oversized quotation mark watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[clamp(10rem,25vw,22rem)] font-light text-white/[0.025] leading-none">"</span>
        </div>

        <div className="max-w-4xl mx-auto px-8 md:px-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="w-10 h-px bg-tbc-gold mx-auto mb-12" />
            <blockquote className="text-[clamp(1.2rem,2.8vw,1.9rem)] font-light text-white/60 italic leading-relaxed mb-12">
              "It is essential to me that the communities we collaborate with are actively engaged
              in safeguarding our wildlife, viewing it as a{' '}
              <span className="text-white not-italic">valuable opportunity</span>{' '}
              rather than a mere commodity."
            </blockquote>
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/60 font-light tracking-wide">Andre du Plessis</p>
              <p className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light">Founder &amp; Proud Owner</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════
          OUR VALUES
      ════════════════════════════════════ */}
      <section className="bg-tbc-earth py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">

          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-tbc-gold" />
            <span className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light">What Drives Us</span>
          </div>
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white/90 leading-[0.95] tracking-tight mb-16">
            Expressing Our <span className="italic text-white/55">Values.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {VALUES.map(({ n, title, body }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={[
                  'border-t border-white/[0.06] py-10',
                  i % 2 === 0 ? 'md:pr-16 md:border-r md:border-r-white/[0.06]' : 'md:pl-16',
                  i >= 2 ? 'border-b border-b-white/[0.06]' : '',
                ].join(' ')}
              >
                <span className="text-tbc-gold/20 text-[3.5rem] font-light leading-none tabular-nums block mb-5">
                  {n}
                </span>
                <h3 className="text-white/75 text-lg font-light mb-3">{title}</h3>
                <p className="text-white/35 text-sm font-light leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════
          TEAM
      ════════════════════════════════════ */}
      <section className="bg-tbc-ink py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16 mb-14">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-tbc-gold" />
            <span className="text-white/25 text-[9px] tracking-[0.4em] uppercase font-light">The People Behind the Brand</span>
          </div>
          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light text-white/90 leading-[0.95] tracking-tight">
            Meet Our <span className="italic text-white/55">Team.</span>
          </h2>
        </div>

        {/* Founder — full-width feature */}
        <div className="max-w-7xl mx-auto px-8 md:px-16 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 border border-white/[0.06] group"
          >
            <div className="relative h-[380px] md:h-auto overflow-hidden">
              <img
                src={TEAM[0].image}
                alt={TEAM[0].name}
                className="w-full h-full object-cover object-top transition-transform duration-[1.4s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink/60 to-transparent" />
            </div>
            <div className="md:col-span-2 bg-tbc-dark flex flex-col justify-center px-10 md:px-16 py-12">
              <span className="text-tbc-gold text-[9px] tracking-[0.45em] uppercase font-light mb-5">
                {TEAM[0].role}
              </span>
              <h3 className="text-3xl md:text-4xl font-light text-white/90 mb-6">{TEAM[0].name}</h3>
              <p className="text-white/40 font-light leading-relaxed max-w-md">{TEAM[0].bio}</p>
            </div>
          </motion.div>
        </div>

        {/* Rest of team — auto-scrolling marquee */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-tbc-ink to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-tbc-ink to-transparent z-10 pointer-events-none" />

          <div className="flex animate-scroll" style={{ width: 'max-content' }}>
            {doubled.map((member, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] mx-3 group relative overflow-hidden">
                <div className="relative h-[340px] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tbc-ink via-tbc-ink/20 to-transparent" />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-tbc-ink/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-light mb-2">{member.role}</p>
                    <p className="text-white/70 text-xs font-light leading-relaxed">{member.bio}</p>
                  </div>
                </div>
                <div className="bg-tbc-dark border-t border-white/[0.06] px-5 py-4">
                  <p className="text-white/70 text-sm font-light">{member.name}</p>
                  <p className="text-white/25 text-[9px] tracking-[0.25em] uppercase font-light mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CONSERVATION
      ════════════════════════════════════ */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://www.azolifesciences.com/image-handler/ts/20220215094450/ri/1000/src/images/Article_Images/ImageForArticle_714_16449362895935733.jpg"
            alt="Wildlife conservation — The Bush Collection"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-tbc-ink/85" />
        <div className="absolute inset-6 md:inset-10 border border-white/[0.04] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-px bg-tbc-gold" />
                <span className="text-tbc-gold text-[9px] tracking-[0.4em] uppercase font-light">
                  Conservation &amp; Community
                </span>
              </div>
              <h2 className="text-[clamp(2.2rem,4.5vw,4rem)] font-light text-white/90 leading-[0.95] tracking-tight mb-10">
                Tourism-Conservation<br />
                <span className="italic text-white/55">Partnerships.</span>
              </h2>
              <div className="space-y-5 text-white/45 font-light leading-relaxed text-[15px]">
                <p>
                  All of our properties — now and in the future — are{' '}
                  <span className="text-white/75">founded in partnership with local communities</span>.
                  This is critical for the long-term preservation of our primary asset: our wildlife.
                </p>
                <p>
                  In 2025, each of our properties will be required to enter into{' '}
                  <span className="text-white/75">educating the next generation of conservationists</span>.
                  All donor funding goes directly to schools and communities — because we believe
                  education is at the forefront of conservation.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                {['Community Partnerships', 'Education First', 'Wildlife Protection', 'Recognised Programmes'].map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/[0.1] text-white/35 text-[9px] tracking-[0.3em] uppercase font-light px-4 py-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="space-y-0 border border-white/[0.06]"
            >
              {CONSERVATION.map(({ icon: Icon, title, text }, i) => (
                <div
                  key={title}
                  className={`flex gap-6 px-8 py-8 ${i < CONSERVATION.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                >
                  <div className="w-10 h-10 border border-white/[0.1] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-tbc-gold/60" />
                  </div>
                  <div>
                    <h4 className="text-white/70 font-light text-base mb-2">{title}</h4>
                    <p className="text-white/35 text-sm font-light leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA
      ════════════════════════════════════ */}
      <section className="bg-tbc-dark py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none" aria-hidden="true">
          <span className="text-[clamp(6rem,15vw,14rem)] font-light text-white/[0.025] leading-none tracking-widest uppercase">
            SAFARI
          </span>
        </div>
        <div className="max-w-3xl mx-auto px-8 md:px-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <div className="w-10 h-px bg-tbc-gold mx-auto mb-10" />
            <h2 className="text-[clamp(2rem,4.5vw,3.8rem)] font-light text-white/90 leading-[0.95] tracking-tight mb-6">
              Ready for Your<br />
              <span className="italic text-tbc-gold/80">African Adventure?</span>
            </h2>
            <p className="text-white/40 font-light text-base md:text-lg leading-relaxed mb-12 max-w-xl mx-auto">
              Join travellers from around the world who have experienced the magic of East Africa
              with a brand built on 40 years of heritage, authenticity, and heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/packages">
                <button className="h-12 px-10 bg-tbc-gold hover:bg-tbc-gold-dark text-tbc-earth text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-200">
                  View Safari Packages
                </button>
              </Link>
              <Link to="/contact">
                <button className="h-12 px-10 border border-white/25 text-white/55 hover:border-white/50 hover:text-white text-[10px] tracking-[0.2em] uppercase font-light transition-all duration-200">
                  Plan Custom Safari
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
