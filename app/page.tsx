'use client';

import { useEffect, useState } from 'react';

// Forcer le rendu dynamique pour charger les données Firebase
export const dynamic = 'force-dynamic';
import { getBooks, deleteBook } from '@/lib/firestore';
import type { Book } from '@/types/book';
import AddBookModal from '@/components/AddBookModal';
import EditBookModal from '@/components/EditBookModal';
import BookList from '@/components/BookList';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      setError('Erreur lors du chargement des livres');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookAdded = () => {
    fetchBooks();
  };

  const handleBookUpdated = () => {
    fetchBooks();
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre et tous ses avis ?')) {
      return;
    }

    try {
      await deleteBook(bookId);
      fetchBooks();
    } catch (err) {
      setError('Erreur lors de la suppression du livre');
      console.error(err);
    }
  };

  return (
    <div>
      {/* Bouton d'ajout de livre */}
      <div className="mb-10">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-[#6b4f3a] text-white py-5 px-8 rounded-xl hover:bg-[#5a3f2e] focus:outline-none focus:ring-2 focus:ring-[#8b7355] focus:ring-offset-2 transition-all duration-200 font-semibold text-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-serif">Ajouter un livre</span>
        </button>
      </div>

      {/* Modal d'ajout */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />

      {/* Modal d'édition */}
      <EditBookModal
        isOpen={isEditModalOpen}
        book={selectedBook}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBook(null);
        }}
        onBookUpdated={handleBookUpdated}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-md">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-4 border-[#6b4f3a]"></div>
          <p className="mt-6 text-[#7a6a5a] text-lg font-medium">Chargement des livres...</p>
        </div>
      ) : (
        <BookList
          books={books}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
