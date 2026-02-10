'use client';

import { useState } from 'react';
import type { ReviewInput } from '@/types/review';
import StarRating from './StarRating';

interface ReviewFormProps {
  onSubmit: (reviewData: ReviewInput) => Promise<void>;
  initialData?: ReviewInput;
  onCancel?: () => void;
}

export default function ReviewForm({ onSubmit, initialData, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewInput>(
    initialData || {
      reviewerName: '',
      rating: undefined,
      comment: '',
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: au moins une note OU un commentaire
    if (!formData.rating && !formData.comment?.trim()) {
      setError('Veuillez ajouter une note et/ou un commentaire');
      return;
    }

    if (!formData.reviewerName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }

    setIsSubmitting(true);

    try {
      // Nettoyer les données avant envoi - ne pas inclure les champs vides
      const dataToSubmit: ReviewInput = {
        reviewerName: formData.reviewerName.trim(),
      };

      // Ajouter rating seulement s'il existe
      if (formData.rating) {
        dataToSubmit.rating = formData.rating;
      }

      // Ajouter comment seulement s'il existe et n'est pas vide
      if (formData.comment?.trim()) {
        dataToSubmit.comment = formData.comment.trim();
      }

      await onSubmit(dataToSubmit);

      // Réinitialiser le formulaire uniquement si ce n'est pas une édition
      if (!initialData) {
        setFormData({
          reviewerName: '',
          rating: undefined,
          comment: '',
        });
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'avis. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData({
      ...formData,
      rating: rating,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#d8cfc4] p-8">
      <h3 className="font-serif text-2xl font-bold mb-6 text-[#3e2c1c] pb-3 border-b-2 border-[#d8cfc4]">
        {initialData ? 'Modifier l\'avis' : 'Laisser un avis'}
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-6 shadow-md">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reviewerName" className="block text-base font-semibold text-[#7a6a5a] mb-2">
            Votre nom *
          </label>
          <input
            type="text"
            id="reviewerName"
            value={formData.reviewerName}
            onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
            required
            className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
            placeholder="Votre prénom"
          />
        </div>

        <div>
          <label className="block text-base font-semibold text-[#7a6a5a] mb-3">
            Note (optionnel)
          </label>
          <StarRating
            value={formData.rating}
            onChange={handleRatingChange}
            size="lg"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-base font-semibold text-[#7a6a5a] mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            id="comment"
            value={formData.comment || ''}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={5}
            className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white resize-none shadow-sm transition-all duration-200"
            placeholder="Partagez votre avis sur ce livre..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#6b4f3a] text-white py-4 px-6 rounded-lg hover:bg-[#5a3f2e] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 disabled:bg-[#b0a79f] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'Envoi en cours...' : initialData ? 'Mettre à jour' : 'Publier l\'avis'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-4 border-2 border-[#d8cfc4] rounded-lg text-[#7a6a5a] hover:text-[#3e2c1c] hover:bg-white hover:border-[#b0a79f] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 disabled:opacity-50 font-semibold text-lg transition-all duration-200"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
