'use client';

import { useState } from 'react';
import type { Review, ReviewInput } from '@/types/review';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  onSave: (reviewId: string, data: ReviewInput) => Promise<void>;
  onDelete: (reviewId: string) => void;
}

export default function ReviewCard({ review, onSave, onDelete }: ReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(review.reviewerName);
  const [editRating, setEditRating] = useState<number | undefined>(review.rating);
  const [editComment, setEditComment] = useState(review.comment || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = review.createdAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isUpdated = review.updatedAt.getTime() !== review.createdAt.getTime();

  const handleSave = async () => {
    if (!editName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }
    if (!editRating && !editComment.trim()) {
      setError('Veuillez ajouter une note et/ou un commentaire');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const data: ReviewInput = { reviewerName: editName.trim() };
      if (editRating) data.rating = editRating;
      if (editComment.trim()) data.comment = editComment.trim();
      await onSave(review.id, data);
      setIsEditing(false);
    } catch {
      setError('Erreur lors de la sauvegarde. Réessayez.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(review.reviewerName);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
    setError(null);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-[#fdfaf5] rounded-xl border-l-4 border-[#6b4f3a] shadow-lg p-6 transition-all duration-200">
        <p className="font-serif text-base font-bold text-[#8b7355] uppercase tracking-wide mb-4">
          Modifier l'avis
        </p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#7a6a5a] mb-1">Nom</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 text-base border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm"
              placeholder="Votre prénom"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#7a6a5a] mb-2">Note</label>
            <StarRating value={editRating} onChange={setEditRating} size="lg" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#7a6a5a] mb-1">Commentaire</label>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 text-base border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white resize-none shadow-sm"
              placeholder="Partagez votre avis..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-[#6b4f3a] text-white py-3 px-5 rounded-lg hover:bg-[#5a3f2e] disabled:bg-[#b0a79f] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base shadow-md hover:shadow-lg"
            >
              {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-3 border-2 border-[#d8cfc4] rounded-lg text-[#7a6a5a] hover:text-[#3e2c1c] hover:border-[#b0a79f] disabled:opacity-50 font-semibold text-base transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-l-4 border-[#8b7355] shadow-md hover:shadow-lg transition-all duration-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="font-serif text-lg font-bold text-[#3e2c1c]">{review.reviewerName}</p>
          <p className="text-sm text-[#7a6a5a] mt-1">
            {formattedDate}
            {isUpdated && <span className="italic ml-1 text-[#b0a79f]">(modifié)</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(true)}
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
