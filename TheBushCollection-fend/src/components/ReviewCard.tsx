
import { Star, Quote } from 'lucide-react';
import { useState } from 'react';

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

interface ReviewCardProps {
  review: Review;
  showUser?: boolean;
}

export default function ReviewCard({ review, showUser = true }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const COMMENT_LIMIT = 150;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < rating ? 'text-[#c9a961] fill-[#c9a961]' : 'text-white/10'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = review.users?.full_name || (review.users?.email ? review.users.email.split('@')[0] : 'Anonymous');

  return (
    <div className="group h-full bg-[#322e2b] border border-white/[0.04] hover:border-[#c9a961]/15 transition-all duration-700 p-8 md:p-9 flex flex-col relative overflow-hidden">
      {/* Hover glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a961]/0 to-transparent group-hover:via-[#c9a961]/20 transition-all duration-700" />

      {/* Featured indicator */}
      {review.is_featured && (
        <div className="absolute top-0 right-8">
          <div className="bg-[#c9a961] text-[#292524] text-[8px] tracking-[0.3em] uppercase font-medium px-3 py-1">
            Featured
          </div>
        </div>
      )}

      {/* Quote icon */}
      <div className="mb-6">
        <Quote className="w-5 h-5 text-[#c9a961]/25" />
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-5">
        {renderStars(review.rating)}
        <span className="text-white/25 text-[10px] tracking-wide font-light ml-2">{review.rating}.0</span>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="text-lg md:text-xl font-extralight text-white/90 leading-tight mb-4">
          {review.title}
        </h4>
      )}

      {/* Comment */}
      {review.comment && (
        <div className="flex-1 mb-6">
          <p className="text-white/35 text-sm font-light leading-[1.8]">
            {expanded || review.comment.length <= COMMENT_LIMIT
              ? review.comment
              : review.comment.slice(0, COMMENT_LIMIT) + '...'}
          </p>
          {review.comment.length > COMMENT_LIMIT && (
            <button
              className="text-[#c9a961] text-[10px] tracking-[0.15em] uppercase font-medium hover:text-[#c9a961]/70 transition-colors mt-3"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Divider + User */}
      <div className="mt-auto pt-6 border-t border-white/[0.05]">
        <div className="flex items-center justify-between">
          {showUser && (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 bg-[#c9a961]/10 border border-[#c9a961]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] tracking-wide font-medium text-[#c9a961]">
                  {getInitials(review.users?.full_name || (review.users?.email?.split('@')[0] ?? null))}
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm font-light leading-none mb-1">
                  {displayName}
                </p>
                {review.created_at && (
                  <p className="text-white/20 text-[10px] tracking-wide font-light">
                    {formatDate(review.created_at)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
