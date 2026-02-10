import type { Book } from '@/types/book';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
}

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  const formattedDate = book.createdAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(book);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(book.id);
  };

  return (
    <Link href={`/books/${book.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 relative">
        {/* Boutons d'action */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 pr-20">
          {book.title}
        </h3>

        <p className="text-gray-600 mb-3">
          par <span className="font-medium">{book.author}</span>
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>Ajouté par {book.addedBy}</span>
          <span>{formattedDate}</span>
        </div>

        {book.averageRating && book.averageRating > 0 ? (
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-gray-700 font-medium">
              {book.averageRating.toFixed(1)} / 5
            </span>
            {book.totalReviews && book.totalReviews > 0 && (
              <span className="text-gray-500 text-sm ml-2">
                ({book.totalReviews} avis)
              </span>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">Pas encore d'avis</p>
        )}
      </div>
    </Link>
  );
}
