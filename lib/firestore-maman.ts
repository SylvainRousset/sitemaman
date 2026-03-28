import { normalizeAuthor } from './author-utils';
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
const booksCollection = collection(db, 'books-maman');

export async function addBook(
  bookData: BookInput,
  firstReview?: ReviewInput
): Promise<string> {
  try {
    const hasReview = firstReview && (firstReview.rating || firstReview.comment?.trim());

    const bookRef = await addDoc(booksCollection, {
      ...bookData,
      createdAt: Timestamp.now(),
      averageRating: hasReview && firstReview.rating ? firstReview.rating : 0,
      totalReviews: hasReview ? 1 : 0,
    });

    if (hasReview) {
      const reviewsRef = collection(db, 'books-maman', bookRef.id, 'reviews');
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
        genre: data.genre || undefined,
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

export async function getAuthors(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(booksCollection);
    const authorsMap = new Map<string, string>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.author) {
        const key = normalizeAuthor(data.author);
        if (!authorsMap.has(key)) {
          authorsMap.set(key, data.author.trim());
        }
      }
    });

    return Array.from(authorsMap.values()).sort((a, b) =>
      a.localeCompare(b, 'fr', { sensitivity: 'base' })
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des auteurs:', error);
    throw new Error('Impossible de récupérer les auteurs');
  }
}

export async function getBookById(bookId: string): Promise<Book | null> {
  try {
    const docRef = doc(db, 'books-maman', bookId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        author: data.author,
        genre: data.genre || undefined,
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

export async function updateBook(
  bookId: string,
  title: string,
  author: string,
  genre?: string
): Promise<void> {
  try {
    const bookRef = doc(db, 'books-maman', bookId);
    await updateDoc(bookRef, { title, author, genre: genre ?? null });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    throw new Error('Impossible de mettre à jour le livre');
  }
}

export async function deleteBook(bookId: string): Promise<void> {
  try {
    const reviewsRef = collection(db, 'books-maman', bookId, 'reviews');
    const reviewsSnap = await getDocs(reviewsRef);

    const deletePromises = reviewsSnap.docs.map(reviewDoc =>
      deleteDoc(reviewDoc.ref)
    );
    await Promise.all(deletePromises);

    const bookRef = doc(db, 'books-maman', bookId);
    await deleteDoc(bookRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    throw new Error('Impossible de supprimer le livre');
  }
}

async function recalculateAverageRating(bookId: string): Promise<void> {
  try {
    const reviewsRef = collection(db, 'books-maman', bookId, 'reviews');
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

    const bookRef = doc(db, 'books-maman', bookId);
    await updateDoc(bookRef, { averageRating, totalReviews });
  } catch (error) {
    console.error('Erreur lors du recalcul de la moyenne:', error);
    throw new Error('Impossible de recalculer la moyenne');
  }
}

export async function addReview(bookId: string, reviewData: ReviewInput): Promise<string> {
  try {
    const reviewsRef = collection(db, 'books-maman', bookId, 'reviews');
    const docRef = await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await recalculateAverageRating(bookId);

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis:', error);
    throw new Error('Impossible d\'ajouter l\'avis');
  }
}

export async function getReviews(bookId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, 'books-maman', bookId, 'reviews');
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

export async function updateReview(
  bookId: string,
  reviewId: string,
  reviewData: ReviewInput
): Promise<void> {
  try {
    const reviewRef = doc(db, 'books-maman', bookId, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: Timestamp.now(),
    });

    await recalculateAverageRating(bookId);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avis:', error);
    throw new Error('Impossible de mettre à jour l\'avis');
  }
}

export async function deleteReview(bookId: string, reviewId: string): Promise<void> {
  try {
    const reviewRef = doc(db, 'books-maman', bookId, 'reviews', reviewId);
    await deleteDoc(reviewRef);

    await recalculateAverageRating(bookId);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    throw new Error('Impossible de supprimer l\'avis');
  }
}

export async function loanBook(bookId: string, loanedTo: string): Promise<void> {
  try {
    const bookRef = doc(db, 'books-maman', bookId);
    await updateDoc(bookRef, {
      loanedTo: loanedTo.trim(),
      loanedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erreur lors du prêt du livre:', error);
    throw new Error('Impossible de prêter le livre');
  }
}

export async function returnBook(bookId: string): Promise<void> {
  try {
    const bookRef = doc(db, 'books-maman', bookId);
    await updateDoc(bookRef, {
      loanedTo: null,
      loanedAt: null,
    });
  } catch (error) {
    console.error('Erreur lors du retour du livre:', error);
    throw new Error('Impossible de marquer le livre comme rendu');
  }
}
