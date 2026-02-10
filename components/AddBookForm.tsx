'use client';

import { useState } from 'react';
import { addBook } from '@/lib/firestore';
import type { BookInput } from '@/types/book';
import type { ReviewInput } from '@/types/review';
import StarRating from './StarRating';

interface AddBookFormProps {
  onBookAdded: () => void;
}

interface FormData {
  book: BookInput;
  review: ReviewInput;
}

export default function AddBookForm({ onBookAdded }: AddBookFormProps) {
  const [formData, setFormData] = useState<FormData>({
    book: {
      title: '',
      author: '',
      addedBy: '',
    },
    review: {
      reviewerName: '',
      rating: undefined,
      comment: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: au moins une note OU un commentaire pour la review
    if (!formData.review.rating && !formData.review.comment?.trim()) {
      setError('Veuillez ajouter une note et/ou un commentaire');
      return;
    }

    setIsSubmitting(true);

    try {
      // Nettoyer les données de la review
      const reviewData: ReviewInput = {
        reviewerName: formData.review.reviewerName.trim(),
        rating: formData.review.rating || undefined,
        comment: formData.review.comment?.trim() || undefined,
      };

      await addBook(formData.book, reviewData);

      // Réinitialiser le formulaire
      setFormData({
        book: {
          title: '',
          author: '',
          addedBy: '',
        },
        review: {
          reviewerName: '',
          rating: undefined,
          comment: '',
        },
      });

      // Notifier le parent pour rafraîchir la liste
      onBookAdded();
    } catch (err) {
      setError('Erreur lors de l\'ajout du livre. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      book: {
        ...formData.book,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleRatingChange = (rating: number) => {
    setFormData({
      ...formData,
      review: {
        ...formData.review,
        rating: rating,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Ajouter un livre
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du livre */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Informations du livre</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre du livre *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.book.title}
              onChange={handleBookChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Le Petit Prince"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Auteur *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.book.author}
              onChange={handleBookChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Antoine de Saint-Exupéry"
            />
          </div>

          <div>
            <label htmlFor="addedBy" className="block text-sm font-medium text-gray-700 mb-1">
              Ajouté par *
            </label>
            <input
              type="text"
              id="addedBy"
              name="addedBy"
              value={formData.book.addedBy}
              onChange={handleBookChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre prénom"
            />
          </div>
        </div>

        {/* Premier avis */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Votre premier avis</h3>

          <div>
            <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700 mb-1">
              Votre nom *
            </label>
            <input
              type="text"
              id="reviewerName"
              value={formData.review.reviewerName}
              onChange={(e) => setFormData({
                ...formData,
                review: { ...formData.review, reviewerName: e.target.value }
              })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre prénom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optionnel)
            </label>
            <StarRating
              value={formData.review.rating}
              onChange={handleRatingChange}
              size="lg"
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire (optionnel)
            </label>
            <textarea
              id="comment"
              value={formData.review.comment || ''}
              onChange={(e) => setFormData({
                ...formData,
                review: { ...formData.review, comment: e.target.value }
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Partagez votre avis sur ce livre..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSubmitting ? 'Ajout en cours...' : 'Ajouter le livre'}
        </button>
      </form>
    </div>
  );
}
