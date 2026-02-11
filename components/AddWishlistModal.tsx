'use client';

import { useState, useEffect } from 'react';
import { addWishlist, getWishlistAuthors } from '@/lib/firestore-wishlist';
import { getAuthors } from '@/lib/firestore';
import type { WishlistInput } from '@/types/wishlist';
import AuthorAutocomplete from './AuthorAutocomplete';

interface AddWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

export default function AddWishlistModal({ isOpen, onClose, onItemAdded }: AddWishlistModalProps) {
  const [formData, setFormData] = useState<WishlistInput>({
    title: '',
    author: '',
    addedBy: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAuthors, setExistingAuthors] = useState<string[]>([]);

  // Charger les auteurs existants (de la wishlist ET des livres) quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const loadAuthors = async () => {
        try {
          const [wishlistAuthors, bookAuthors] = await Promise.all([
            getWishlistAuthors(),
            getAuthors()
          ]);
          // Combiner et dédupliquer les auteurs
          const allAuthors = Array.from(new Set([...wishlistAuthors, ...bookAuthors])).sort();
          setExistingAuthors(allAuthors);
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
        title: '',
        author: '',
        addedBy: '',
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
      await addWishlist({
        title: formData.title.trim(),
        author: formData.author.trim(),
        addedBy: formData.addedBy.trim(),
      });
      onItemAdded();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'ajout du souhait. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
            <span className="text-[#8b7355]">⭐</span>
            Ajouter un souhait
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                Titre du livre *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                placeholder="Ex: Le Petit Prince"
              />
            </div>

            <div>
              <AuthorAutocomplete
                value={formData.author}
                onChange={(value) => handleChange({ target: { name: 'author', value } } as any)}
                authors={existingAuthors}
                required
                label={
                  <>
                    Auteur * {existingAuthors.length > 0 && <span className="text-sm font-normal text-[#b0a79f]">(Sélectionnez ou tapez un nouveau)</span>}
                  </>
                }
                labelClassName="block text-base font-semibold text-[#7a6a5a] mb-2"
                className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="addedBy" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                Ajouté par *
              </label>
              <input
                type="text"
                id="addedBy"
                name="addedBy"
                value={formData.addedBy}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                placeholder="Votre prénom"
              />
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
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter le souhait'}
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
