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
import type { Wishlist, WishlistInput } from '@/types/wishlist';

// Collection reference
const wishlistCollection = collection(db, 'wishlist');

/**
 * Ajouter un livre à la wishlist
 */
export async function addWishlist(data: WishlistInput): Promise<string> {
  try {
    const docRef = await addDoc(wishlistCollection, {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la wishlist:', error);
    throw new Error('Impossible d\'ajouter à la wishlist');
  }
}

/**
 * Récupérer tous les livres de la wishlist (triés par auteur)
 */
export async function getWishlist(): Promise<Wishlist[]> {
  try {
    const q = query(wishlistCollection, orderBy('author', 'asc'));
    const querySnapshot = await getDocs(q);

    const wishlist: Wishlist[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      wishlist.push({
        id: doc.id,
        title: data.title,
        author: data.author,
        addedBy: data.addedBy,
        createdAt: data.createdAt.toDate(),
      });
    });

    return wishlist;
  } catch (error) {
    console.error('Erreur lors de la récupération de la wishlist:', error);
    throw new Error('Impossible de récupérer la wishlist');
  }
}

/**
 * Récupérer un livre de la wishlist par son ID
 */
export async function getWishlistById(id: string): Promise<Wishlist | null> {
  try {
    const docRef = doc(db, 'wishlist', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        author: data.author,
        addedBy: data.addedBy,
        createdAt: data.createdAt.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    throw new Error('Impossible de récupérer le livre');
  }
}

/**
 * Mettre à jour un livre de la wishlist
 */
export async function updateWishlist(
  id: string,
  title: string,
  author: string
): Promise<void> {
  try {
    const docRef = doc(db, 'wishlist', id);
    await updateDoc(docRef, {
      title,
      author,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw new Error('Impossible de mettre à jour le livre');
  }
}

/**
 * Supprimer un livre de la wishlist
 */
export async function deleteWishlist(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'wishlist', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw new Error('Impossible de supprimer le livre');
  }
}

/**
 * Récupérer la liste unique des auteurs de la wishlist (triés alphabétiquement)
 */
export async function getWishlistAuthors(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(wishlistCollection);
    const authorsSet = new Set<string>();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.author) {
        authorsSet.add(data.author);
      }
    });

    return Array.from(authorsSet).sort();
  } catch (error) {
    console.error('Erreur lors de la récupération des auteurs:', error);
    throw new Error('Impossible de récupérer les auteurs');
  }
}
