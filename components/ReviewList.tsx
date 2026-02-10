import type { Review } from '@/types/review';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  reviews: Review[];
  onReviewEdit: (review: Review) => void;
  onReviewDelete: (reviewId: string) => void;
}

export default function ReviewList({ reviews, onReviewEdit, onReviewDelete }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-[#d8cfc4]">
        <p className="text-[#7a6a5a] text-xl font-serif">
          Aucun avis pour le moment. Soyez le premier à en laisser un !
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-3xl font-bold mb-8 text-[#3e2c1c] pb-3 border-b-2 border-[#d8cfc4] flex items-center gap-3">
        <span className="text-[#8b7355]">💬</span>
        Avis ({reviews.length})
      </h2>

      <div className="space-y-5">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onEdit={onReviewEdit}
            onDelete={onReviewDelete}
          />
        ))}
      </div>
    </div>
  );
}
