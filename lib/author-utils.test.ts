import { describe, it, expect } from 'vitest';
import { removeAccents, normalizeAuthor, groupBooksByAuthor } from './author-utils';

// --- removeAccents ---
describe('removeAccents', () => {
  it('enlève les accents', () => {
    expect(removeAccents('éàüîç')).toBe('eauic');
  });

  it('ne modifie pas une chaîne sans accents', () => {
    expect(removeAccents('Perry Anne')).toBe('Perry Anne');
  });
});

// --- normalizeAuthor ---
describe('normalizeAuthor', () => {
  it('met en minuscules', () => {
    expect(normalizeAuthor('PERRY ANNE')).toBe('perry anne');
  });

  it('enlève les espaces en début et fin', () => {
    expect(normalizeAuthor('  Perry Anne  ')).toBe('perry anne');
  });

  it('réduit les espaces multiples', () => {
    expect(normalizeAuthor('Perry  Anne')).toBe('perry anne');
  });

  it('enlève les accents', () => {
    expect(normalizeAuthor('Éléonore Dupont')).toBe('eleonore dupont');
  });

  it('combinaison casse + accents + espaces', () => {
    expect(normalizeAuthor('  ÉLÉONORE   Dupont  ')).toBe('eleonore dupont');
  });
});

// --- groupBooksByAuthor ---
describe('groupBooksByAuthor', () => {
  const makeBook = (author: string, title: string) => ({ author, title });

  it('regroupe deux livres du même auteur (même casse)', () => {
    const books = [
      makeBook('Perry Anne', 'Livre A'),
      makeBook('Perry Anne', 'Livre B'),
    ];
    const result = groupBooksByAuthor(books);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['perry anne'].books).toHaveLength(2);
  });

  it('regroupe malgré des différences de casse', () => {
    const books = [
      makeBook('Perry Anne', 'Livre A'),
      makeBook('perry anne', 'Livre B'),
      makeBook('PERRY ANNE', 'Livre C'),
    ];
    const result = groupBooksByAuthor(books);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['perry anne'].books).toHaveLength(3);
  });

  it('regroupe malgré des espaces multiples', () => {
    const books = [
      makeBook('Perry Anne', 'Livre A'),
      makeBook('Perry  Anne', 'Livre B'),
    ];
    const result = groupBooksByAuthor(books);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['perry anne'].books).toHaveLength(2);
  });

  it('regroupe malgré des espaces en début/fin', () => {
    const books = [
      makeBook('Perry Anne', 'Livre A'),
      makeBook('  Perry Anne  ', 'Livre B'),
    ];
    const result = groupBooksByAuthor(books);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('regroupe malgré des accents différents', () => {
    const books = [
      makeBook('Éléonore Dupont', 'Livre A'),
      makeBook('Eleonore Dupont', 'Livre B'),
    ];
    const result = groupBooksByAuthor(books);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['eleonore dupont'].books).toHaveLength(2);
  });

  it('garde deux auteurs distincts séparés', () => {
    const books = [
      makeBook('Perry Anne', 'Livre A'),
      makeBook('Christie Agatha', 'Livre B'),
    ];
    const result = groupBooksByAuthor(books);
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('le displayName est celui du premier livre (trimé)', () => {
    const books = [
      makeBook('  Perry Anne  ', 'Livre A'),
      makeBook('perry anne', 'Livre B'),
    ];
    const result = groupBooksByAuthor(books);
    expect(result['perry anne'].displayName).toBe('Perry Anne');
  });

  it('fonctionne avec une liste vide', () => {
    expect(groupBooksByAuthor([])).toEqual({});
  });

  it('fonctionne avec un seul livre', () => {
    const books = [makeBook('Perry Anne', 'Livre A')];
    const result = groupBooksByAuthor(books);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['perry anne'].books[0].title).toBe('Livre A');
  });
});

// --- Simulation déduplication getAuthors ---
describe('déduplication auteurs (logique getAuthors)', () => {
  function deduplicateAuthors(rawNames: string[]): string[] {
    const map = new Map<string, string>();
    rawNames.forEach((name) => {
      const key = normalizeAuthor(name);
      if (!map.has(key)) map.set(key, name.trim());
    });
    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, 'fr', { sensitivity: 'base' })
    );
  }

  it('déduplique les noms identiques', () => {
    const result = deduplicateAuthors(['Perry Anne', 'Perry Anne']);
    expect(result).toHaveLength(1);
  });

  it('déduplique les noms en casse différente', () => {
    const result = deduplicateAuthors(['Perry Anne', 'perry anne', 'PERRY ANNE']);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('Perry Anne');
  });

  it('déduplique les noms avec espaces multiples', () => {
    const result = deduplicateAuthors(['Perry Anne', 'Perry  Anne']);
    expect(result).toHaveLength(1);
  });

  it('garde deux auteurs distincts', () => {
    const result = deduplicateAuthors(['Perry Anne', 'Christie Agatha']);
    expect(result).toHaveLength(2);
  });

  it('trie alphabétiquement', () => {
    const result = deduplicateAuthors(['Christie Agatha', 'Perry Anne', 'Baudelaire Charles']);
    expect(result[0]).toMatch(/baudelaire/i);
    expect(result[1]).toMatch(/christie/i);
    expect(result[2]).toMatch(/perry/i);
  });

  it('garde le premier nom rencontré comme displayName', () => {
    const result = deduplicateAuthors(['Halen Corben', 'halen corben']);
    expect(result[0]).toBe('Halen Corben');
  });
});
