export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeAuthor(name: string): string {
  return removeAccents(name.trim().toLowerCase()).replace(/\s+/g, ' ');
}

/**
 * Regroupe une liste de livres par auteur normalisé.
 * Retourne un Record<clé normalisée, { displayName, books }>.
 */
export function groupBooksByAuthor<T extends { author: string }>(
  books: T[]
): Record<string, { displayName: string; books: T[] }> {
  const result: Record<string, { displayName: string; books: T[] }> = {};
  books.forEach((book) => {
    const key = normalizeAuthor(book.author);
    if (!result[key]) {
      result[key] = { displayName: book.author.trim(), books: [] };
    }
    result[key].books.push(book);
  });
  return result;
}
