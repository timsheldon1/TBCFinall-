import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviews } from '@/hooks/useReviews';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import { Star, ArrowRight, ArrowLeft, Quote, Pen } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Minimal local Review type (supabase-types removed)
type Review = {
  id?: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  created_at?: string;
  is_featured?: boolean;
  users?: { full_name?: string | null; email?: string } | null;
};

export default function ReviewsSection() {
  const { reviews, loading, error } = useReviews();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const REVIEWS_PER_PAGE = 3;

  // Filter for featured reviews or show first few
  const featuredReviews = reviews.filter(review => review.is_featured);
  const displayReviews = featuredReviews.length > 0 ? featuredReviews : reviews;
  const totalPages = Math.ceil(displayReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = displayReviews.slice(
    currentPage * REVIEWS_PER_PAGE,
    (currentPage + 1) * REVIEWS_PER_PAGE
  );

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const closeDialog = () => setIsDialogOpen(false);

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 0));

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <section className="py-28 md:py-36 bg-[#292524] overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center">
            <div className="relative mx-auto w-14 h-14 mb-8">
              <div className="absolute inset-0 border border-[#c9a961]/20 animate-ping" />
              <div className="absolute inset-3 border border-[#c9a961]/40 animate-pulse" />
            </div>
            <p className="text-white/25 text-[10px] tracking-[0.5em] uppercase font-light">Loading Reviews</p>
          </div>
        </div>
      </section>
    );
  }

  /* ── ERROR STATE ── */
  if (error) {
    return (
      <section className="py-28 md:py-36 bg-[#292524] overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16 text-center">
          <div className="w-[1px] h-10 bg-[#c9a961]/30 mx-auto mb-8" />
          <p className="text-[#c9a961] text-[10px] tracking-[0.4em] uppercase font-light mb-3">Something Went Wrong</p>
          <p className="text-white/35 text-sm font-light">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-28 md:py-36 bg-[#292524] overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Top gold line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-[#c9a961]/20" />

      <div className="max-w-7xl mx-auto px-8 md:px-16 relative z-10">
        {/* ── EDITORIAL HEADER ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-[#c9a961]" />
                <p className="text-[#c9a961] text-[10px] tracking-[0.5em] uppercase font-medium">Guest Voices</p>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white/90 leading-[1.05] mb-6">
                What Our Guests<br />
                <span className="italic text-[#c9a961]/80">Say About Us</span>
              </h2>
              <p className="text-white/35 text-sm md:text-base font-light leading-relaxed max-w-lg">
                Authentic stories from travellers who've experienced the magic of East Africa with us.
              </p>
            </motion.div>
          </div>

          {/* Stats + CTA cluster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col items-start lg:items-end gap-6"
          >
            {/* Average rating display */}
            {reviews.length > 0 && (
              <div className="flex items-end gap-4">
                <span className="text-5xl md:text-6xl font-extralight text-[#c9a961] leading-none">{averageRating}</span>
                <div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(Number(averageRating)) ? 'text-[#c9a961] fill-[#c9a961]' : 'text-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-light">
                    {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </p>
                </div>
              </div>
            )}

            {/* Write review button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="group flex items-center gap-3 text-[#c9a961] hover:text-[#c9a961]/80 transition-all duration-300">
                  <span className="w-10 h-10 border border-[#c9a961]/30 group-hover:border-[#c9a961]/60 flex items-center justify-center transition-all duration-300 group-hover:bg-[#c9a961]/5">
                    <Pen className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] tracking-[0.25em] uppercase font-medium group-hover:tracking-[0.35em] transition-all duration-500">Share Your Experience</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#292524] border-white/[0.08] text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extralight text-white">Share Your Safari Experience</DialogTitle>
                  <DialogDescription className="text-white/40 text-sm font-light">
                    Tell future travelers about your adventure. Your feedback helps us improve our safaris.
                  </DialogDescription>
                </DialogHeader>
                <ReviewForm
                  onSuccess={closeDialog}
                  onCancel={closeDialog}
                />
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* ── REVIEWS GRID ── */}
        {paginatedReviews.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                ref={scrollRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ReviewCard review={review} showUser={true} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-6 mt-16"
              >
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${
                    currentPage === 0
                      ? 'border-white/[0.04] text-white/10 cursor-not-allowed'
                      : 'border-white/[0.08] text-white/40 hover:border-[#c9a961]/30 hover:text-[#c9a961]'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-2 h-2 transition-all duration-300 ${
                        i === currentPage
                          ? 'bg-[#c9a961] scale-125'
                          : 'bg-white/15 hover:bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${
                    currentPage === totalPages - 1
                      ? 'border-white/[0.04] text-white/10 cursor-not-allowed'
                      : 'border-white/[0.08] text-white/40 hover:border-[#c9a961]/30 hover:text-[#c9a961]'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 border border-white/[0.06] flex items-center justify-center mx-auto mb-8">
              <Quote className="w-5 h-5 text-[#c9a961]/40" />
            </div>
            <p className="text-white/30 text-sm font-light mb-2">No reviews yet.</p>
            <p className="text-white/20 text-xs font-light">Be the first to share your safari experience.</p>
          </motion.div>
        )}
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-t from-transparent to-[#c9a961]/20" />
    </section>
  );
}
