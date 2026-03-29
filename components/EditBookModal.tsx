'use client';

import { useState, useEffect } from 'react';
import {
  updateBook as updateBookDefault,
  getAuthors as getAuthorsDefault,
  addReview as addReviewDefault,
  getReviews as getReviewsDefault,
  updateReview as updateReviewDefault,
} from '@/lib/firestore';
import type { Book } from '@/types/book';
import type { Review, ReviewInput } from '@/types/review';
import { GENRES } from '@/lib/genres';
import StarRating from './StarRating';
import AuthorAutocomplete from './AuthorAutocomplete';

interface EditBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onBookUpdated: () => void;
  updateBookFn?: (bookId: string, title: string, author: string, genre?: string, addedBy?: string) => Promise<void>;
  getAuthorsFn?: () => Promise<string[]>;
  addReviewFn?: (bookId: string, reviewData: ReviewInput) => Promise<string>;
  getReviewsFn?: (bookId: string) => Promise<Review[]>;
  updateReviewFn?: (bookId: string, reviewId: string, reviewData: ReviewInput) => Promise<void>;
}

const emptyReview: ReviewInput = { reviewerName: '', rating: undefined, comment: '' };

export default function EditBookModal({
  isOpen, book, onClose, onBookUpdated,
  updateBookFn, getAuthorsFn, addReviewFn, getReviewsFn, updateReviewFn,
}: EditBookModalProps) {
  const updateBook = updateBookFn ?? updateBookDefault;
  const getAuthors = getAuthorsFn ?? getAuthorsDefault;
  const addReview = addReviewFn ?? addReviewDefault;
  const getReviews = getReviewsFn ?? getReviewsDefault;
  const updateReview = updateReviewFn ?? updateReviewDefault;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [newReview, setNewReview] = useState<ReviewInput>(emptyReview);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [reviewEdits, setReviewEdits] = useState<Record<string, ReviewInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAuthors, setExistingAuthors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAuthors().then(setExistingAuthors).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setGenre(book.genre || '');
      setAddedBy(book.addedBy || '');
      setNewReview(emptyReview);
      setError(null);
      // Charger les avis existants
      if (book.totalReviews && book.totalReviews > 0) {
        getReviews(book.id).then((reviews) => {
          setExistingReviews(reviews);
          const edits: Record<string, ReviewInput> = {};
          reviews.forEach(r => {
            edits[r.id] = { reviewerName: r.reviewerName, rating: r.rating, comment: r.comment || '' };
          });
          setReviewEdits(edits);
        }).catch(console.error);
      } else {
        setExistingReviews([]);
        setReviewEdits({});
      }
    }
  }, [book]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleReviewEdit = (reviewId: string, field: keyof ReviewInput, value: string | number | undefined) => {
    setReviewEdits(prev => ({ ...prev, [reviewId]: { ...prev[reviewId], [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!book) return;
    setIsSubmitting(true);
    try {
      await updateBook(book.id, title.trim(), author.trim(), genre || undefined, addedBy.trim() || undefined);

      // Mettre à jour les avis existants modifiés
      await Promise.all(
        existingReviews.map((r) => {
          const edit = reviewEdits[r.id];
          if (!edit) return Promise.resolve();
          return updateReview(book.id, r.id, {
            reviewerName: edit.reviewerName || r.reviewerName,
            rating: edit.rating,
            comment: edit.comment,
          });
        })
      );

      // Ajouter un nouvel avis si rempli
      const hasNewReview = newReview.rating || newReview.comment?.trim();
      if (hasNewReview) {
        const reviewData: ReviewInput = { reviewerName: (newReview.reviewerName || addedBy).trim() };
        if (newReview.rating) reviewData.rating = newReview.rating;
        if (newReview.comment?.trim()) reviewData.comment = newReview.comment.trim();
        await addReview(book.id, reviewData);
      }

      onBookUpdated();
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification du livre. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen || !book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#fdfaf5] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#d8cfc4]">

        {/* Header */}
        <div className="sticky top-0 bg-[#fdfaf5] border-b-2 border-[#d8cfc4] px-8 py-6 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-bold text-[#3e2c1c] flex items-center gap-3">
            <span className="text-[#8b7355]">✏️</span>
            Modifier le livre
          </h2>
          <button type="button" onClick={onClose} className="text-[#b0a79f] hover:text-[#7a6a5a] transition-colors duration-200" aria-label="Fermer">
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

            {/* Auteur */}
            <div>
              <AuthorAutocomplete
                value={author}
                onChange={setAuthor}
                authors={existingAuthors}
                required
                label={<>Auteur * {existingAuthors.length > 0 && <span className="text-sm font-normal text-[#b0a79f]">(Sélectionnez ou tapez)</span>}</>}
                labelClassName="block text-base font-semibold text-[#7a6a5a] mb-2"
                className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
            </div>

            {/* Titre */}
            <div className="space-y-4 pt-2 border-t border-[#d8cfc4]">
              <h3 className="font-serif text-xl font-bold text-[#3e2c1c] pb-2 border-b border-[#d8cfc4]">Titre</h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                placeholder="Ex: Le Petit Prince"
              />
            </div>

            {/* Genre et Ajouté par */}
            <div className="space-y-5 pt-2 border-t border-[#d8cfc4]">
              <div>
                <label className="block text-base font-semibold text-[#7a6a5a] mb-2">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                >
                  <option value="">-- Choisir un genre --</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-[#7a6a5a] mb-2">Ajouté par *</label>
                <input
                  type="text"
                  value={addedBy}
                  onChange={(e) => {
                    setAddedBy(e.target.value);
                    setNewReview(r => ({ ...r, reviewerName: e.target.value }));
                  }}
                  required
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            {/* Avis existants */}
            {existingReviews.length > 0 && (
              <div className="space-y-5 pt-6 border-t-2 border-[#d8cfc4]">
                <h3 className="font-serif text-xl font-bold text-[#3e2c1c] pb-2 border-b border-[#d8cfc4]">
                  Avis existants
                </h3>
                {existingReviews.map((r) => {
                  const edit = reviewEdits[r.id] ?? { reviewerName: r.reviewerName, rating: r.rating, comment: r.comment || '' };
                  return (
                    <div key={r.id} className="bg-[#f5f0ea] rounded-xl p-5 space-y-4 border border-[#d8cfc4]">
                      <div>
                        <label className="block text-sm font-semibold text-[#7a6a5a] mb-1.5">Nom</label>
                        <input
                          type="text"
                          value={edit.reviewerName}
                          onChange={(e) => handleReviewEdit(r.id, 'reviewerName', e.target.value)}
                          className="w-full px-4 py-2.5 text-base border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#7a6a5a] mb-2">Note</label>
                        <StarRating
                          value={edit.rating}
                          onChange={(val) => handleReviewEdit(r.id, 'rating', val)}
                          size="md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#7a6a5a] mb-1.5">Commentaire</label>
                        <textarea
                          value={edit.comment || ''}
                          onChange={(e) => handleReviewEdit(r.id, 'comment', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 text-base border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white resize-none shadow-sm transition-all duration-200"
                          placeholder="Commentaire..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Nouvel avis (optionnel) */}
            <div className="space-y-5 pt-6 border-t-2 border-[#d8cfc4]">
              <h3 className="font-serif text-xl font-bold text-[#3e2c1c] pb-2 border-b border-[#d8cfc4]">
                Ajouter un avis <span className="text-sm font-normal text-[#b0a79f]">(optionnel)</span>
              </h3>

              <div>
                <label className="block text-base font-semibold text-[#7a6a5a] mb-2">Votre nom</label>
                <input
                  type="text"
                  value={newReview.reviewerName}
                  onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-[#7a6a5a] mb-3">Note</label>
                <StarRating value={newReview.rating} onChange={(r) => setNewReview({ ...newReview, rating: r })} size="lg" />
              </div>

              <div>
                <label className="block text-base font-semibold text-[#7a6a5a] mb-2">Commentaire</label>
                <textarea
                  value={newReview.comment || ''}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
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
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
