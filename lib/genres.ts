export const GENRES = ['Roman', 'Policier', 'Cosy Murder', 'Science Fiction', 'Autre'] as const;
export type Genre = typeof GENRES[number];

interface GenreStyle {
  border: string;
  badge: string;
}

export const GENRE_STYLES: Record<string, GenreStyle> = {
  'Roman':           { border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700' },
  'Policier':        { border: 'border-red-400',    badge: 'bg-red-100 text-red-700' },
  'Cosy Murder':     { border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  'Science Fiction': { border: 'border-green-400',  badge: 'bg-green-100 text-green-700' },
  'Autre':           { border: 'border-purple-400', badge: 'bg-purple-100 text-purple-700' },
};

export function getGenreStyle(genre?: string): GenreStyle {
  if (!genre || !GENRE_STYLES[genre]) {
    return { border: 'border-[#8b7355]', badge: 'bg-gray-100 text-gray-500' };
  }
  return GENRE_STYLES[genre];
}
