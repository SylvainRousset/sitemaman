'use client';

import { useState, useEffect } from 'react';
import type { Wishlist } from '@/types/wishlist';
import { getFavoriteAuthors, addFavoriteAuthor, removeFavoriteAuthor } from '@/lib/firestore-favorites';

interface WishlistListProps {
  items: Wishlist[];
  onEdit: (item: Wishlist) => void;
  onDelete: (id: string) => void;
}

// Fonction pour enlever les accents
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function WishlistList({ items, onEdit, onDelete }: WishlistListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [favoriteAuthors, setFavoriteAuthors] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Alphabet A-Z
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Charger les auteurs favoris au montage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favorites = await getFavoriteAuthors();
        setFavoriteAuthors(favorites);
      } catch (err) {
        console.error('Erreur lors du chargement des favoris:', err);
      }
    };
    loadFavorites();
  }, []);

  // Toggle favori
  const toggleFavorite = async (authorName: string) => {
    try {
      if (favoriteAuthors.includes(authorName)) {
        await removeFavoriteAuthor(authorName);
        setFavoriteAuthors(favoriteAuthors.filter(name => name !== authorName));
      } else {
        await addFavoriteAuthor(authorName);
        setFavoriteAuthors([...favoriteAuthors, authorName]);
      }
    } catch (err) {
      console.error('Erreur lors du toggle favori:', err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-[#d8cfc4] p-12">
        <p className="text-[#7a6a5a] text-xl font-serif">
          Aucun livre souhaité pour le moment. Ajoutez-en un !
        </p>
      </div>
    );
  }

  // Filtrer les livres selon le terme de recherche ou la lettre sélectionnée
  const filteredItems = items.filter((item) => {
    const authorLower = removeAccents(item.author.toLowerCase());

    // Si recherche active : filtre uniquement les auteurs qui commencent par la recherche
    if (searchTerm.trim()) {
      const searchLower = removeAccents(searchTerm.toLowerCase());
      return authorLower.startsWith(searchLower);
    }

    // Sinon si une lettre est sélectionnée : filtre par cette lettre
    if (selectedLetter) {
      return authorLower.startsWith(selectedLetter.toLowerCase());
    }

    // Sinon : afficher tous les livres
    return true;
  });

  // Regrouper les livres filtrés par auteur
  const itemsByAuthor = filteredItems.reduce((acc, item) => {
    if (!acc[item.author]) {
      acc[item.author] = [];
    }
    acc[item.author].push(item);
    return acc;
  }, {} as Record<string, Wishlist[]>);

  // Trier les auteurs alphabétiquement (en ignorant les accents et la casse)
  let sortedAuthors = Object.keys(itemsByAuthor).sort((a, b) =>
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  );

  // Filtrer par favoris si activé
  if (showFavoritesOnly) {
    sortedAuthors = sortedAuthors.filter(author => favoriteAuthors.includes(author));
  }

  const handleEdit = (e: React.MouseEvent, item: Wishlist) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(item);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div>
      <h2 className="font-serif text-4xl font-bold mb-8 text-[#3e2c1c] pb-4 border-b-2 border-[#d8cfc4]">
        Livres souhaités ({items.length})
      </h2>

      {/* Bouton Favoris uniquement */}
      {favoriteAuthors.length > 0 && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 flex items-center gap-2 ${
              showFavoritesOnly
                ? 'bg-[#6b4f3a] text-white shadow-md'
                : 'border-2 border-[#d8cfc4] text-[#7a6a5a] hover:border-[#6b4f3a] hover:text-[#6b4f3a]'
            }`}
          >
            <span className={showFavoritesOnly ? 'text-amber-300' : ''}>⭐</span>
            Favoris uniquement
          </button>
        </div>
      )}

      {/* Index alphabétique */}
      <div className="mb-8 bg-white rounded-2xl shadow-md border border-[#d8cfc4] p-4 sm:p-6">
        <div className="grid grid-cols-7 sm:grid-cols-13 gap-2 sm:gap-3 mb-4">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => {
                setSelectedLetter(letter);
                setSearchTerm('');
              }}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center ${
                selectedLetter === letter
                  ? 'bg-[#6b4f3a] text-white shadow-md'
                  : 'border border-[#d8cfc4] text-[#6b4f3a] hover:bg-[#6b4f3a] hover:text-white hover:border-[#6b4f3a]'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => {
              setSelectedLetter(null);
              setSearchTerm('');
            }}
            className="text-sm text-[#7a6a5a] hover:text-[#3e2c1c] hover:underline font-medium transition-colors duration-200"
          >
            Voir tous les auteurs
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-10 flex justify-center">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg
              className="w-6 h-6 text-[#b0a79f]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedLetter(null);
            }}
            placeholder="Rechercher auteur..."
            className="w-full pl-14 pr-5 py-3 sm:py-4 text-base sm:text-lg bg-white border border-[#d8cfc4] rounded-full focus:outline-none focus:ring-2 focus:ring-[#6b4f3a] focus:border-transparent placeholder:text-[#b0a79f] shadow-sm transition-shadow duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-[#b0a79f] hover:text-[#7a6a5a] transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Résultats */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-[#d8cfc4]">
          <svg
            className="mx-auto h-16 w-16 text-[#b0a79f] mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[#7a6a5a] text-xl font-serif font-medium mb-2">
            Aucun résultat trouvé
          </p>
          <p className="text-[#b0a79f] text-base">
            Essayez avec un autre terme de recherche
          </p>
        </div>
      ) : (
        <>
          {(searchTerm || selectedLetter) && (
            <p className="text-[#7a6a5a] mb-8 text-center text-lg bg-white rounded-full px-6 py-3 shadow-sm border border-[#d8cfc4] inline-block mx-auto w-fit">
              {searchTerm ? (
                <>
                  <span className="font-bold text-[#6b4f3a]">{filteredItems.length}</span> résultat{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''} pour &quot;<span className="font-medium">{searchTerm}</span>&quot;
                </>
              ) : (
                <>
                  <span className="font-bold text-[#6b4f3a]">{sortedAuthors.length}</span> auteur{sortedAuthors.length > 1 ? 's' : ''} commençant par <span className="font-bold text-[#6b4f3a]">{selectedLetter}</span>
                </>
              )}
            </p>
          )}
          <div className="flex justify-center mb-8">
            {(searchTerm || selectedLetter) && (
              <div></div>
            )}
          </div>

          <div className="space-y-12">
            {sortedAuthors.map((author) => {
              const isFavorite = favoriteAuthors.includes(author);

              return (
                <div key={author}>
                  {/* Nom de l'auteur */}
                  <h3 className="font-serif text-2xl font-bold text-[#3e2c1c] uppercase border-b-2 border-[#d8cfc4] pb-3 mb-6 flex items-center gap-3">
                    <span className="text-[#8b7355]">✦</span>
                    {author}
                    <button
                      onClick={() => toggleFavorite(author)}
                      className={`ml-2 transition-all duration-200 hover:scale-110 ${
                        isFavorite ? 'text-amber-500' : 'text-[#b0a79f] hover:text-amber-400'
                      }`}
                      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {isFavorite ? '⭐' : '☆'}
                    </button>
                  </h3>

                {/* Liste des livres de cet auteur */}
                <div className="space-y-4">
                  {itemsByAuthor[author].map((item) => {
                    const formattedDate = item.createdAt.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });

                    return (
                      <div key={item.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-[#d4a373] relative group">
                        {/* Boutons d'action */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            onClick={(e) => handleEdit(e, item)}
                            className="p-2 bg-[#6b4f3a] text-white rounded-lg hover:bg-[#5a3f2e] transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Modifier"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-2 bg-[#c75450] text-white rounded-lg hover:bg-[#b04844] transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Titre du livre */}
                        <div className="pr-24">
                          <h4 className="font-serif text-xl font-semibold text-[#3e2c1c] mb-3">
                            {item.title}
                          </h4>

                          {/* Infos supplémentaires */}
                          <div className="flex items-center gap-4 text-base text-[#7a6a5a]">
                            <span className="text-sm">Ajouté le {formattedDate}</span>
                            <span className="text-[#d8cfc4]">•</span>
                            <span className="text-sm italic text-[#b0a79f]">Par {item.addedBy}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}
