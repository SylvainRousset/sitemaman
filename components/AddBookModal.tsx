'use client';

import { useState, useEffect } from 'react';
import { addBook as addBookDefault, getAuthors as getAuthorsDefault, getBooks as getBooksDefault } from '@/lib/firestore';
import type { Book, BookInput } from '@/types/book';
import type { ReviewInput } from '@/types/review';
import { GENRES } from '@/lib/genres';
import { removeAccents } from '@/lib/author-utils';
import StarRating from './StarRating';
import AuthorAutocomplete from './AuthorAutocomplete';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
  addBookFn?: (bookData: BookInput, firstReview?: ReviewInput) => Promise<string>;
  getAuthorsFn?: () => Promise<string[]>;
  getBooksFn?: () => Promise<Book[]>;
}

const emptyReview: ReviewInput = { reviewerName: '', rating: undefined, comment: '' };

export default function AddBookModal({ isOpen, onClose, onBookAdded, addBookFn, getAuthorsFn, getBooksFn }: AddBookModalProps) {
  const addBook = addBookFn ?? addBookDefault;
  const getAuthors = getAuthorsFn ?? getAuthorsDefault;
  const getBooks = getBooksFn ?? getBooksDefault;

  const [titles, setTitles] = useState<string[]>(['']);
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [review, setReview] = useState<ReviewInput>(emptyReview);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingAuthors, setExistingAuthors] = useState<string[]>([]);
  const [existingBooks, setExistingBooks] = useState<Book[]>([]);

  const isSingleTitle = titles.length === 1;

  useEffect(() => {
    if (isOpen) {
      getAuthors().then(setExistingAuthors).catch(console.error);
      getBooks().then(setExistingBooks).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTitles(['']);
      setAuthor('');
      setGenre('');
      setAddedBy('');
      setReview(emptyReview);
      setError(null);
      setSubmitProgress(null);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const findDuplicate = (title: string): Book | undefined => {
    if (!title.trim()) return undefined;
    const normalized = removeAccents(title.trim().toLowerCase());
    return existingBooks.find(b => removeAccents(b.title.toLowerCase()) === normalized);
  };

  const handleAddTitle = () => setTitles([...titles, '']);

  const handleRemoveTitle = (index: number) => {
    setTitles(titles.filter((_, i) => i !== index));
  };

  const handleTitleChange = (index: number, value: string) => {
    const updated = [...titles];
    updated[index] = value;
    setTitles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validTitles = titles.map(t => t.trim()).filter(Boolean);
    if (validTitles.length === 0) {
      setError('Veuillez entrer au moins un titre.');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress({ done: 0, total: validTitles.length });

    try {
      for (let i = 0; i < validTitles.length; i++) {
        const bookData: BookInput = { title: validTitles[i], author: author.trim(), addedBy: addedBy.trim() };
        if (genre) bookData.genre = genre;

        // Avis uniquement pour le premier titre si mode titre unique
        const hasReview = isSingleTitle && (review.rating || review.comment?.trim());
        if (hasReview) {
          const reviewData: ReviewInput = { reviewerName: (review.reviewerName || addedBy).trim() };
          if (review.rating) reviewData.rating = review.rating;
          if (review.comment?.trim()) reviewData.comment = review.comment.trim();
          await addBook(bookData, reviewData);
        } else {
          await addBook(bookData);
        }

        setSubmitProgress({ done: i + 1, total: validTitles.length });
      }

      onBookAdded();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'ajout. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(null);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const validCount = titles.filter(t => t.trim()).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#fdfaf5] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#d8cfc4]">

        {/* Header */}
        <div className="sticky top-0 bg-[#fdfaf5] border-b-2 border-[#d8cfc4] px-8 py-6 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-bold text-[#3e2c1c] flex items-center gap-3">
            <span className="text-[#8b7355]">📖</span>
            Ajouter {titles.length > 1 ? `${titles.length} livres` : 'un livre'}
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
                label={<>Auteur * {existingAuthors.length > 0 && <span className="text-sm font-normal text-[#b0a79f]">(Sélectionnez ou tapez un nouveau)</span>}</>}
                labelClassName="block text-base font-semibold text-[#7a6a5a] mb-2"
                className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
            </div>

            {/* Titres */}
            <div className="space-y-4 pt-2 border-t border-[#d8cfc4]">
              <h3 className="font-serif text-xl font-bold text-[#3e2c1c] pb-2 border-b border-[#d8cfc4]">
                Titre{titles.length > 1 ? 's' : ''}
              </h3>

              <div className="space-y-3">
                {titles.map((title, index) => {
                  const duplicate = findDuplicate(title);
                  return (
                    <div key={index}>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 flex items-center gap-2">
                          {titles.length > 1 && (
                            <span className="text-sm font-bold text-[#b0a79f] w-5 text-right shrink-0">{index + 1}.</span>
                          )}
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => handleTitleChange(index, e.target.value)}
                            required={index === 0}
                            className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white shadow-sm transition-all duration-200 ${duplicate ? 'border-amber-400 focus:ring-amber-400' : 'border-[#d8cfc4] focus:ring-[#6b4f3a]'}`}
                            placeholder={index === 0 ? 'Ex: Le Petit Prince' : `Titre ${index + 1}...`}
                            autoFocus={index === titles.length - 1 && index > 0}
                          />
                        </div>
                        {titles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTitle(index)}
                            className="p-2 text-[#b0a79f] hover:text-[#c75450] hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Supprimer ce titre"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {duplicate && (
                        <p className="mt-1.5 ml-1 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">⚠️</span>
                          <span>Ce livre existe déjà : <span className="font-semibold">&laquo;{duplicate.title}&raquo;</span> de <span className="font-semibold">{duplicate.author}</span>, ajouté par {duplicate.addedBy}.</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddTitle}
                className="flex items-center gap-2 text-[#6b4f3a] hover:text-[#5a3f2e] font-semibold text-base transition-colors duration-200 mt-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un autre titre
              </button>
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
                    setReview(r => ({ ...r, reviewerName: e.target.value }));
                  }}
                  required
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            {/* Avis (seulement si titre unique) */}
            {isSingleTitle && (
              <div className="space-y-5 pt-6 border-t-2 border-[#d8cfc4]">
                <h3 className="font-serif text-xl font-bold text-[#3e2c1c] pb-2 border-b border-[#d8cfc4]">
                  Votre premier avis <span className="text-sm font-normal text-[#b0a79f]">(optionnel)</span>
                </h3>

                <div>
                  <label className="block text-base font-semibold text-[#7a6a5a] mb-2">Votre nom</label>
                  <input
                    type="text"
                    value={review.reviewerName}
                    onChange={(e) => setReview({ ...review, reviewerName: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-[#7a6a5a] mb-3">Note</label>
                  <StarRating value={review.rating} onChange={(r) => setReview({ ...review, rating: r })} size="lg" />
                </div>

                <div>
                  <label className="block text-base font-semibold text-[#7a6a5a] mb-2">Commentaire</label>
                  <textarea
                    value={review.comment || ''}
                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white resize-none shadow-sm transition-all duration-200"
                    placeholder="Partagez votre avis sur ce livre..."
                  />
                </div>
              </div>
            )}

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
                {isSubmitting && submitProgress
                  ? `Ajout en cours... (${submitProgress.done}/${submitProgress.total})`
                  : validCount > 1
                    ? `Ajouter ${validCount} livres`
                    : 'Ajouter le livre'}
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
