'use client';

import { useState, useRef, useEffect } from 'react';

interface AuthorAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  authors: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  labelClassName?: string;
}

// Fonction pour enlever les accents
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function AuthorAutocomplete({
  value,
  onChange,
  authors,
  placeholder = 'Ex: Antoine de Saint-Exupéry',
  required = false,
  className = '',
  label,
  labelClassName = '',
}: AuthorAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filtrer les auteurs qui commencent par la valeur tapée
  useEffect(() => {
    if (value.trim()) {
      const searchValue = removeAccents(value.toLowerCase());
      const filtered = authors.filter(author =>
        removeAccents(author.toLowerCase()).startsWith(searchValue)
      );
      setFilteredAuthors(filtered);
    } else {
      setFilteredAuthors([]);
    }
  }, [value, authors]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectAuthor = (author: string) => {
    onChange(author);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (value.trim() && filteredAuthors.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        required={required}
        autoComplete="off"
        className={className}
        placeholder={placeholder}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && filteredAuthors.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#d8cfc4] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAuthors.map((author, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectAuthor(author)}
              className="w-full px-4 py-3 text-left hover:bg-[#fdfaf5] transition-colors duration-150 border-b border-[#f5f0e8] last:border-b-0 text-[#3e2c1c]"
            >
              {author}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
