'use client';

import { useState, useEffect } from 'react';
import { addBook, getAuthors } from '@/lib/firestore';
import type { BookInput } from '@/types/book';
import type { ReviewInput } from '@/types/review';
import StarRating from './StarRating';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

interface FormData {
  book: BookInput;
  review: ReviewInput;
}

export default function AddBookModal({ isOpen, onClose, onBookAdded }: AddBookModalProps) {
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
  const [existingAuthors, setExistingAuthors] = useState<string[]>([]);

  // Charger les auteurs existants quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const loadAuthors = async () => {
        try {
          const authors = await getAuthors();
          setExistingAuthors(authors);
        } catch (err) {
          console.error('Erreur lors du chargement des auteurs:', err);
        }
      };
      loadAuthors();
    }
  }, [isOpen]);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
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
      setError(null);
    }
  }, [isOpen]);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Vérifier s'il y a une review à ajouter
      const hasReviewData = formData.review.rating || formData.review.comment?.trim();

      if (hasReviewData) {
        // Nettoyer les données de la review
        const reviewData: ReviewInput = {
          reviewerName: formData.review.reviewerName.trim(),
        };

        // Ajouter rating seulement s'il existe
        if (formData.review.rating) {
          reviewData.rating = formData.review.rating;
        }

        // Ajouter comment seulement s'il existe et n'est pas vide
        if (formData.review.comment?.trim()) {
          reviewData.comment = formData.review.comment.trim();
        }

        await addBook(formData.book, reviewData);
      } else {
        // Ajouter le livre sans review
        await addBook(formData.book);
      }

      onBookAdded();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'ajout du livre. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBookData = {
      ...formData.book,
      [e.target.name]: e.target.value,
    };

    setFormData({
      ...formData,
      book: newBookData,
      // Synchroniser reviewerName avec addedBy
      review: {
        ...formData.review,
        reviewerName: e.target.name === 'addedBy' ? e.target.value : formData.review.reviewerName,
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#fdfaf5] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#d8cfc4]">
        <div className="sticky top-0 bg-[#fdfaf5] border-b-2 border-[#d8cfc4] px-8 py-6 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-bold text-[#3e2c1c] flex items-center gap-3">
            <span className="text-[#8b7355]">📖</span>
            Ajouter un livre
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#b0a79f] hover:text-[#7a6a5a] transition-colors duration-200"
            aria-label="Fermer"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-6 shadow-md">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations du livre */}
            <div className="space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#3e2c1c] pb-2 border-b border-[#d8cfc4]">Informations du livre</h3>

              <div>
                <label htmlFor="title" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                  Titre du livre *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.book.title}
                  onChange={handleBookChange}
                  required
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Ex: Le Petit Prince"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                  Auteur * {existingAuthors.length > 0 && <span className="text-sm font-normal text-[#b0a79f]">(Sélectionnez ou tapez un nouveau)</span>}
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.book.author}
                  onChange={handleBookChange}
                  list="authors-list"
                  required
                  autoComplete="off"
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Ex: Antoine de Saint-Exupéry"
                />
                <datalist id="authors-list">
                  {existingAuthors.map((author) => (
                    <option key={author} value={author} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="addedBy" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                  Ajouté par *
                </label>
                <input
                  type="text"
                  id="addedBy"
                  name="addedBy"
                  value={formData.book.addedBy}
                  onChange={handleBookChange}
                  required
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            {/* Premier avis (optionnel) */}
            <div className="space-y-5 pt-6 border-t-2 border-[#d8cfc4]">
              <h3 className="font-serif text-xl font-bold text-[#3e2c1c] pb-2 border-b border-[#d8cfc4]">
                Votre premier avis <span className="text-sm font-normal text-[#b0a79f]">(optionnel)</span>
              </h3>

              <div>
                <label htmlFor="reviewerName" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                  Votre nom
                </label>
                <input
                  type="text"
                  id="reviewerName"
                  value={formData.review.reviewerName}
                  onChange={(e) => setFormData({
                    ...formData,
                    review: { ...formData.review, reviewerName: e.target.value }
                  })}
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-[#7a6a5a] mb-3">
                  Note
                </label>
                <StarRating
                  value={formData.review.rating}
                  onChange={handleRatingChange}
                  size="lg"
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                  Commentaire
                </label>
                <textarea
                  id="comment"
                  value={formData.review.comment || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    review: { ...formData.review, comment: e.target.value }
                  })}
                  rows={5}
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white resize-none shadow-sm transition-all duration-200"
                  placeholder="Partagez votre avis sur ce livre..."
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 border-2 border-[#d8cfc4] rounded-lg text-[#7a6a5a] hover:text-[#3e2c1c] hover:bg-white hover:border-[#b0a79f] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 disabled:opacity-50 font-semibold text-lg transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#6b4f3a] text-white py-4 px-6 rounded-lg hover:bg-[#5a3f2e] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 disabled:bg-[#b0a79f] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter le livre'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
