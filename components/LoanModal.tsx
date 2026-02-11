'use client';

import { useState, useEffect } from 'react';
import type { Book } from '@/types/book';

interface LoanModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onLoan: (bookId: string, loanedTo: string) => Promise<void>;
  onReturn: (bookId: string) => Promise<void>;
}

export default function LoanModal({ isOpen, book, onClose, onLoan, onReturn }: LoanModalProps) {
  const [loanedToName, setLoanedToName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setLoanedToName('');
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

  const handleLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onLoan(book.id, loanedToName);
      onClose();
    } catch (err) {
      setError('Erreur lors du prêt du livre. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!book) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onReturn(book.id);
      onClose();
    } catch (err) {
      setError('Erreur lors du retour du livre. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !book) return null;

  const isLoaned = book.loanedTo && book.loanedAt;
  const loanedDate = book.loanedAt
    ? book.loanedAt.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#fdfaf5] rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn border border-[#d8cfc4]">
        <div className="bg-[#fdfaf5] border-b-2 border-[#d8cfc4] px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-serif text-3xl font-bold text-[#3e2c1c] flex items-center gap-3">
            <span className="text-[#8b7355]">📚</span>
            {isLoaned ? 'Livre prêté' : 'Prêter le livre'}
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

          <div className="mb-6">
            <p className="text-[#7a6a5a] text-lg mb-2">
              <span className="font-semibold text-[#3e2c1c]">{book.title}</span>
            </p>
            <p className="text-[#b0a79f] italic">{book.author}</p>
          </div>

          {isLoaned ? (
            <div className="space-y-6">
              <div className="bg-[#fff9f0] border-l-4 border-[#d4a373] p-6 rounded-lg">
                <p className="text-[#3e2c1c] mb-2">
                  <span className="font-semibold">Prêté à :</span> {book.loanedTo}
                </p>
                <p className="text-[#7a6a5a] text-sm">
                  Depuis le {loanedDate}
                </p>
              </div>

              <button
                onClick={handleReturn}
                disabled={isSubmitting}
                className="w-full bg-[#6b4f3a] text-white py-4 px-6 rounded-lg hover:bg-[#5a3f2e] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 disabled:bg-[#b0a79f] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg"
              >
                {isSubmitting ? 'Enregistrement...' : 'Marquer comme rendu'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoan} className="space-y-6">
              <div>
                <label htmlFor="loanedTo" className="block text-base font-semibold text-[#7a6a5a] mb-2">
                  Prêté à *
                </label>
                <input
                  type="text"
                  id="loanedTo"
                  value={loanedToName}
                  onChange={(e) => setLoanedToName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 text-lg border border-[#d8cfc4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent bg-white shadow-sm transition-all duration-200"
                  placeholder="Nom de la personne"
                />
              </div>

              <div className="flex gap-4 pt-4">
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
          )}
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
