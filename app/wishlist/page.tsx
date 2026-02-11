'use client';

import { useEffect, useState } from 'react';

// Forcer le rendu dynamique pour charger les données Firebase
export const dynamic = 'force-dynamic';

import { getWishlist, deleteWishlist } from '@/lib/firestore-wishlist';
import type { Wishlist } from '@/types/wishlist';
import AddWishlistModal from '@/components/AddWishlistModal';
import EditWishlistModal from '@/components/EditWishlistModal';
import WishlistList from '@/components/WishlistList';

export default function WishlistPage() {
  const [items, setItems] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Wishlist | null>(null);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedItems = await getWishlist();
      setItems(fetchedItems);
    } catch (err) {
      setError('Erreur lors du chargement de la wishlist');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleItemAdded = () => {
    fetchWishlist();
  };

  const handleItemUpdated = () => {
    fetchWishlist();
  };

  const handleEdit = (item: Wishlist) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre de la wishlist ?')) {
      return;
    }

    try {
      await deleteWishlist(id);
      fetchWishlist();
    } catch (err) {
      setError('Erreur lors de la suppression du livre');
      console.error(err);
    }
  };

  return (
    <div>
      {/* Titre de la page */}
      <div className="mb-10">
        <h1 className="font-serif text-5xl font-bold text-[#3e2c1c] mb-4 flex items-center gap-4">
          <span className="text-[#d4a373]">⭐</span>
          Livres à acheter
        </h1>
        <p className="text-[#7a6a5a] text-lg font-serif">
          Votre liste de livres souhaités
        </p>
      </div>

      {/* Bouton d'ajout de souhait */}
      <div className="mb-10">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-[#6b4f3a] text-white py-5 px-8 rounded-xl hover:bg-[#5a3f2e] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 transition-all duration-200 font-semibold text-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-serif">Ajouter un souhait</span>
        </button>
      </div>

      {/* Modal d'ajout */}
      <AddWishlistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={handleItemAdded}
      />

      {/* Modal d'édition */}
      <EditWishlistModal
        isOpen={isEditModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onItemUpdated={handleItemUpdated}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-md">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-4 border-[#6b4f3a]"></div>
          <p className="mt-6 text-[#7a6a5a] text-lg font-medium">Chargement de la wishlist...</p>
        </div>
      ) : (
        <WishlistList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
