import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Globe, Award, Heart, Camera, Compass, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    { icon: Users, label: 'Happy Travelers', value: '1,000+' },
    { icon: Globe, label: 'Destinations', value: '5+' },
    { icon: Award, label: 'Years Experience', value: '2+' },
    { icon: Star, label: 'Average Rating', value: '4.9' }
  ];

  const team = [
    {
      name: 'Andre Du Plessis',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      bio: 'Safari enthusiast with 20+ years of African travel experience'
    },
    {
      name: 'Paul',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      bio: 'Expert in luxury travel and wildlife conservation'
    },
    {
      name: 'Linda',
      role: 'Local Guide Coordinator',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Born in Kenya, passionate about sharing African culture'
    },
    {
      name: 'Paul',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Born in Kenya, passionate about sharing African culture'
    },
    {
      name: 'Moly',
      role: 'Local Guide Coordinator',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Born in Kenya, passionate about sharing African culture'
    },
    {
      name: 'Christine',
      role: 'Procurement Officer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Born in Kenya, passionate about sharing African culture'
    },
    {
      name: 'Timsheldon',
      role: 'IT Support Officer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Born in Kenya, passionate about sharing African culture'
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  // Text morphing variants
  const textVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  const values = [
    {
      icon: Heart,
      title: 'Conservation First',
      description: 'We support local conservation efforts and sustainable tourism practices that protect wildlife and ecosystems.'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Our tours directly benefit local communities through employment, cultural exchange, and economic development.'
    },
    {
      icon: Camera,
      title: 'Authentic Experiences',
      description: 'We create genuine, immersive experiences that connect you with the real Africa beyond typical tourist attractions.'
    },
    {
      icon: Shield,
      title: 'Safety & Quality',
      description: 'Your safety is our priority. We maintain the highest standards in accommodations, transportation, and guides.'
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="relative py-24 bg-gradient-to-r from-green-800 to-blue-800 text-white"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            variants={letterVariants}
            initial="hidden"
            animate="visible"
          >
            {'About Safari Tours'.split('').map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Creating unforgettable African safari experiences for over 2 years. We're passionate about wildlife, conservation, and sharing the magic of Africa with the world.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <Link to="/packages">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 px-8 py-3">
                  Explore Our Packages
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={staggerItem}>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-green-800 px-8 py-3">
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ icon: Icon, label, value }, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm"
                variants={staggerItem}
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
                <div className="text-gray-600">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInLeft}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {'Our Story'.split('').map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="inline-block"
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
              </motion.h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  Founded in 2023 by safari enthusiast Andre, The Bush Collection began as a small operation with a big dream: to share the incredible wildlife and landscapes of Africa with travelers from around the world.
                </motion.p>
                <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  What started as guided tours for friends and family has grown into one of Africa's most trusted safari companies. We've maintained our commitment to authentic experiences, conservation, and supporting local communities every step of the way.
                </motion.p>
                <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  Today, we work with local guides, conservation organizations, and communities across Tanzania and Kenya to create life-changing experiences that benefit both travelers and the places they visit.
                </motion.p>
              </div>
              <motion.div
                className="mt-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={staggerItem}>
                  <Badge className="bg-green-100 text-green-800 mr-2">Conservation Partner</Badge>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <Badge className="bg-blue-100 text-blue-800 mr-2">Community Focused</Badge>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <Badge className="bg-orange-100 text-orange-800">Award Winning</Badge>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInRight}
            >
              <img
                src="/images/PNG-LOGO (1).png"
                alt="Safari landscape"
                className="rounded-lg shadow-lg"
              />
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex items-center">
                  <Compass className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">2+ Years</div>
                    <div className="text-sm text-gray-600">Safari Experience</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <motion.section
        className="py-16 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {'Our Values'.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Everything we do is guided by our commitment to conservation, community, and creating authentic experiences
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
          >
            {values.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <Icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600">{description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {'Meet Our Team'.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  className="inline-block"
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Passionate professionals dedicated to creating your perfect safari experience
            </motion.p>
          </motion.div>

          {/* Founder & CEO - Centered at top */}
          <motion.div
            className="flex justify-center mb-12"
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
              }}
              transition={{ duration: 0.3 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow max-w-sm">
                <CardContent className="p-6">
                  <img
                    src={team[0].image}
                    alt={team[0].name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{team[0].name}</h3>
                  <p className="text-orange-600 font-medium mb-3">{team[0].role}</p>
                  <p className="text-gray-600 text-sm">{team[0].bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Auto-scrolling team members */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex animate-scroll"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {/* Original team members */}
              {team.slice(1).map((member, index) => (
                <motion.div
                  key={`original-${index}`}
                  variants={staggerItem}
                  className="min-w-[280px] flex-shrink-0 mx-4"
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-orange-600 font-medium mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {/* Duplicated team members for seamless loop */}
              {team.slice(1).map((member, index) => (
                <motion.div
                  key={`duplicate-${index}`}
                  variants={staggerItem}
                  className="min-w-[280px] flex-shrink-0 mx-4"
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-orange-600 font-medium mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Conservation Section */}
      <motion.section
        className="py-16 bg-green-600 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInLeft}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {'Conservation Partnership'.split('').map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="inline-block"
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
              </motion.h2>
              <motion.div
                className="space-y-4 text-green-100"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.p variants={staggerItem}>
                  We believe that tourism should benefit wildlife and local communities. That's why we partner with conservation organizations and donate 5% of our profits to wildlife protection initiatives.
                </motion.p>
                <motion.p variants={staggerItem}>
                  Our tours are designed to minimize environmental impact while maximizing positive contributions to conservation efforts and local economies.
                </motion.p>
              </motion.div>
              <motion.div
                className="mt-8 flex flex-wrap gap-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={staggerItem}>
                  <Badge className="bg-white text-green-600">Carbon Neutral Tours</Badge>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <Badge className="bg-white text-green-600">Local Community Support</Badge>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <Badge className="bg-white text-green-600">Wildlife Protection</Badge>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInRight}
            >
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop"
                alt="Wildlife conservation"
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {'Ready for Your African Adventure?'.split('').map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 mb-8"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Join thousands of travelers who have experienced the magic of Africa with us
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={staggerItem}>
              <Link to="/packages">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 px-8 py-3">
                  View Safari Packages
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={staggerItem}>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Plan Custom Safari
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900 text-white py-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={staggerItem}>
              <h3 className="text-xl font-bold mb-4">Safari Tours</h3>
              <p className="text-gray-400 mb-4">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </motion.div>

            <motion.div variants={staggerItem}>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/packages" className="hover:text-white">Safari Packages</Link></li>
                <li><Link to="/collections" className="hover:text-white">Properties</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </motion.div>

            <motion.div variants={staggerItem}>
              <h4 className="font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tanzania</li>
                <li>Kenya</li>
              </ul>
            </motion.div>

            <motion.div variants={staggerItem}>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+254 116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p>&copy; 2024 The Bush Collection. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}