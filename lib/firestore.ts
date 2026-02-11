import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Book, BookInput } from '@/types/book';
import type { Review, ReviewInput } from '@/types/review';

// Collection reference
const booksCollection = collection(db, 'books');

/**
 * Ajouter un nouveau livre avec une première review optionnelle
 */
export async function addBook(
  bookData: BookInput,
  firstReview?: ReviewInput
): Promise<string> {
  try {
    // Vérifier si la review contient des données
    const hasReview = firstReview && (firstReview.rating || firstReview.comment?.trim());

    // 1. Créer le livre
    const bookRef = await addDoc(booksCollection, {
      ...bookData,
      createdAt: Timestamp.now(),
      averageRating: hasReview && firstReview.rating ? firstReview.rating : 0,
      totalReviews: hasReview ? 1 : 0,
    });

    // 2. Ajouter la première review si elle existe
    if (hasReview) {
      const reviewsRef = collection(db, 'books', bookRef.id, 'reviews');
      await addDoc(reviewsRef, {
        ...firstReview,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    return bookRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    throw new Error('Impossible d\'ajouter le livre');
  }
}

/**
 * Récupérer tous les livres (triés par auteur alphabétiquement)
 */
export async function getBooks(): Promise<Book[]> {
  try {
    const q = query(booksCollection, orderBy('author', 'asc'));
    const querySnapshot = await getDocs(q);

    const books: Book[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      books.push({
        id: doc.id,
        title: data.title,
        author: data.author,
        addedBy: data.addedBy,
        createdAt: data.createdAt.toDate(),
        averageRating: data.averageRating || 0,
        totalReviews: data.totalReviews || 0,
        loanedTo: data.loanedTo || null,
        loanedAt: data.loanedAt ? data.loanedAt.toDate() : null,
      });
    });

    return books;
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    throw new Error('Impossible de récupérer les livres');
  }
}

/**
 * Récupérer la liste unique des auteurs (triés alphabétiquement)
 */
export async function getAuthors(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(booksCollection);
    const authorsSet = new Set<string>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.author) {
        authorsSet.add(data.author);
      }
    });

    // Trier en ignorant les accents et la casse
    return Array.from(authorsSet).sort((a, b) =>
      a.localeCompare(b, 'fr', { sensitivity: 'base' })
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des auteurs:', error);
    throw new Error('Impossible de récupérer les auteurs');
  }
}

/**
 * Récupérer un livre par son ID
 */
export async function getBookById(bookId: string): Promise<Book | null> {
  try {
    const docRef = doc(db, 'books', bookId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        author: data.author,
        addedBy: data.addedBy,
        createdAt: data.createdAt.toDate(),
        averageRating: data.averageRating || 0,
        totalReviews: data.totalReviews || 0,
        loanedTo: data.loanedTo || null,
        loanedAt: data.loanedAt ? data.loanedAt.toDate() : null,
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    throw new Error('Impossible de récupérer le livre');
  }
}

/**
 * Mettre à jour un livre (titre et auteur)
 */
export async function updateBook(
  bookId: string,
  title: string,
  author: string
): Promise<void> {
  try {
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      title,
      author,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    throw new Error('Impossible de mettre à jour le livre');
  }
}

/**
 * Supprimer un livre et toutes ses reviews
 */
export async function deleteBook(bookId: string): Promise<void> {
  try {
    // Supprimer toutes les reviews d'abord
    const reviewsRef = collection(db, 'books', bookId, 'reviews');
    const reviewsSnap = await getDocs(reviewsRef);

    const deletePromises = reviewsSnap.docs.map(reviewDoc =>
      deleteDoc(reviewDoc.ref)
    );
    await Promise.all(deletePromises);

    // Puis supprimer le livre
    const bookRef = doc(db, 'books', bookId);
    await deleteDoc(bookRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    throw new Error('Impossible de supprimer le livre');
  }
}

/**
 * Recalculer la moyenne des notes d'un livre
 */
async function recalculateAverageRating(bookId: string): Promise<void> {
  try {
    const reviewsRef = collection(db, 'books', bookId, 'reviews');
    const reviewsSnap = await getDocs(reviewsRef);

    let totalRating = 0;
    let ratingCount = 0;
    let totalReviews = 0;

    reviewsSnap.forEach((doc) => {
      const data = doc.data();
      totalReviews++;
      if (data.rating) {
        totalRating += data.rating;
        ratingCount++;
      }
    });

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error('Erreur lors du recalcul de la moyenne:', error);
    throw new Error('Impossible de recalculer la moyenne');
  }
}

/**
 * Ajouter un avis
 */
export async function addReview(bookId: string, reviewData: ReviewInput): Promise<string> {
  try {
    const reviewsRef = collection(db, 'books', bookId, 'reviews');
    const docRef = await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Recalculer la moyenne
    await recalculateAverageRating(bookId);

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis:', error);
    throw new Error('Impossible d\'ajouter l\'avis');
  }
}

/**
 * Récupérer tous les avis d'un livre
 */
export async function getReviews(bookId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, 'books', bookId, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        bookId: bookId,
        reviewerName: data.reviewerName,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return reviews;
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    throw new Error('Impossible de récupérer les avis');
  }
}

/**
 * Mettre à jour un avis
 */
export async function updateReview(
  bookId: string,
  reviewId: string,
  reviewData: ReviewInput
): Promise<void> {
  try {
    const reviewRef = doc(db, 'books', bookId, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: Timestamp.now(),
    });

    // Recalculer la moyenne
    await recalculateAverageRating(bookId);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avis:', error);
    throw new Error('Impossible de mettre à jour l\'avis');
  }
}

/**
 * Supprimer un avis
 */
export async function deleteReview(bookId: string, reviewId: string): Promise<void> {
  try {
    const reviewRef = doc(db, 'books', bookId, 'reviews', reviewId);
    await deleteDoc(reviewRef);

    // Recalculer la moyenne
    await recalculateAverageRating(bookId);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    throw new Error('Impossible de supprimer l\'avis');
  }
}

/**
 * Prêter un livre
 */
export async function loanBook(bookId: string, loanedTo: string): Promise<void> {
  try {
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      loanedTo: loanedTo.trim(),
      loanedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erreur lors du prêt du livre:', error);
    throw new Error('Impossible de prêter le livre');
  }
}

/**
 * Marquer un livre comme rendu
 */
export async function returnBook(bookId: string): Promise<void> {
  try {
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      loanedTo: null,
      loanedAt: null,
    });
  } catch (error) {
    console.error('Erreur lors du retour du livre:', error);
    throw new Error('Impossible de marquer le livre comme rendu');
  }
}
