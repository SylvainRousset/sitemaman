import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { FavoriteAuthor } from '@/types/favorite';

// Collection reference
const favoritesCollection = collection(db, 'favoriteAuthors');

/**
 * Ajouter un auteur aux favoris
 */
export async function addFavoriteAuthor(authorName: string): Promise<string> {
  try {
    // Vérifier si l'auteur n'est pas déjà en favori
    const existing = await getFavoriteAuthor(authorName);
    if (existing) {
      return existing.id;
    }

    const docRef = await addDoc(favoritesCollection, {
      name: authorName,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    throw new Error('Impossible d\'ajouter aux favoris');
  }
}

/**
 * Retirer un auteur des favoris
 */
export async function removeFavoriteAuthor(authorName: string): Promise<void> {
  try {
    const favorite = await getFavoriteAuthor(authorName);
    if (favorite) {
      const q = query(favoritesCollection, where('name', '==', authorName));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error);
    throw new Error('Impossible de retirer des favoris');
  }
}

/**
 * Récupérer un auteur favori par son nom
 */
async function getFavoriteAuthor(authorName: string): Promise<FavoriteAuthor | null> {
  try {
    const q = query(favoritesCollection, where('name', '==', authorName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        createdAt: data.createdAt.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du favori:', error);
    return null;
  }
}

/**
 * Récupérer tous les auteurs favoris
 */
export async function getFavoriteAuthors(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(favoritesCollection);
    const favorites: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      favorites.push(data.name);
    });

    return favorites;
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    throw new Error('Impossible de récupérer les favoris');
  }
}

/**
 * Vérifier si un auteur est en favori
 */
export async function isAuthorFavorite(authorName: string): Promise<boolean> {
  try {
    const favorite = await getFavoriteAuthor(authorName);
    return favorite !== null;
  } catch (error) {
    console.error('Erreur lors de la vérification du favori:', error);
    return false;
  }
}
