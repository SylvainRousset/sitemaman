import type { Review } from '@/types/review';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
}

export default function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const formattedDate = review.createdAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isUpdated = review.updatedAt.getTime() !== review.createdAt.getTime();

  return (
    <div className="bg-white rounded-xl border-l-4 border-[#8b7355] shadow-md hover:shadow-lg transition-all duration-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="font-serif text-lg font-bold text-[#3e2c1c]">{review.reviewerName}</p>
          <p className="text-sm text-[#7a6a5a] mt-1">
            {formattedDate}
            {isUpdated && <span className="italic ml-1">(modifié)</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(review)}
            className="text-sm text-[#6b4f3a] hover:text-[#5a3f2e] font-semibold hover:underline transition-colors duration-200"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="text-sm text-[#c75450] hover:text-[#b04844] font-semibold hover:underline transition-colors duration-200"
          >
            Supprimer
          </button>
        </div>
      </div>

      {review.rating && (
        <div className="mb-4">
          <StarRating value={review.rating} readonly size="sm" />
        </div>
      )}

      {review.comment && (
        <p className="text-[#3e2c1c] leading-relaxed text-base">{review.comment}</p>
      )}
    </div>
  );
}
