'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Book } from '@/types/book';
import type { Review, ReviewInput } from '@/types/review';
import {
  getBookById,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
} from '@/lib/firestore';
import StarRating from '@/components/StarRating';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [fetchedBook, fetchedReviews] = await Promise.all([
        getBookById(bookId),
        getReviews(bookId),
      ]);

      if (!fetchedBook) {
        setError('Livre introuvable');
        return;
      }

      setBook(fetchedBook);
      setReviews(fetchedReviews);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData: ReviewInput) => {
    try {
      if (editingReview) {
        await updateReview(bookId, editingReview.id, reviewData);
        setEditingReview(null);
      } else {
        await addReview(bookId, reviewData);
      }
      await fetchBookDetails();
      setShowReviewForm(false);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleReviewEdit = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      await deleteReview(bookId, reviewId);
      await fetchBookDetails();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'avis');
      console.error(err);
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  if (isLoading) {
    return (
      <div>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-4 border-[#6b4f3a]"></div>
          <p className="mt-6 text-[#7a6a5a] text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div>
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-md">
          <p className="font-medium">{error || 'Livre introuvable'}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#6b4f3a] text-white py-3 px-6 rounded-lg hover:bg-[#5a3f2e] transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    );
  }

  const formattedDate = book.createdAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#6b4f3a] hover:text-[#5a3f2e] mb-8 font-semibold text-lg transition-colors duration-200"
      >
        ← Retour à la bibliothèque
      </Link>

      {/* Informations du livre */}
      <div className="bg-white rounded-2xl shadow-xl border border-[#d8cfc4] p-8 mb-10">
        <h1 className="font-serif text-4xl font-bold text-[#3e2c1c] mb-3">{book.title}</h1>
        <p className="text-2xl text-[#7a6a5a] mb-4 flex items-center gap-2">
          <span className="text-[#8b7355]">✍️</span>
          par {book.author}
        </p>
        <p className="text-base text-[#b0a79f] mb-6">
          Ajouté par <span className="font-medium text-[#7a6a5a]">{book.addedBy}</span> le {formattedDate}
        </p>

        {book.averageRating && book.averageRating > 0 ? (
          <div className="mt-6 pt-6 border-t-2 border-[#d8cfc4]">
            <p className="text-base font-semibold text-[#7a6a5a] mb-3">Note moyenne:</p>
            <StarRating value={book.averageRating} readonly size="lg" />
          </div>
        ) : (
          <p className="text-[#b0a79f] italic mt-6 pt-6 border-t-2 border-[#d8cfc4]">Pas encore de note</p>
        )}
      </div>

      {/* Formulaire d'avis */}
      <div className="mb-10">
        {!showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full bg-[#6b4f3a] text-white py-4 px-6 rounded-xl hover:bg-[#5a3f2e] transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-2xl">+</span>
            <span className="font-serif">Laisser un avis</span>
          </button>
        )}

        {showReviewForm && (
          <ReviewForm
            onSubmit={handleReviewSubmit}
            initialData={
              editingReview
                ? {
                    reviewerName: editingReview.reviewerName,
                    rating: editingReview.rating,
                    comment: editingReview.comment,
                  }
                : undefined
            }
            onCancel={handleCancelReview}
          />
        )}
      </div>

      {/* Liste des avis */}
      <ReviewList
        reviews={reviews}
        onReviewEdit={handleReviewEdit}
        onReviewDelete={handleReviewDelete}
      />
    </div>
  );
}
