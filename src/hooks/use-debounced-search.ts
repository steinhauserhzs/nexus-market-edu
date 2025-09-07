import { useState, useEffect, useMemo } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedSearch(
  initialValue: string = '',
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, delay);

  const searchProps = useMemo(() => ({
    value: searchTerm,
    onChange: (value: string) => setSearchTerm(value),
    placeholder: "Buscar...",
  }), [searchTerm]);

  const reset = () => setSearchTerm('');

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    searchProps,
    reset,
    isSearching: searchTerm !== debouncedSearchTerm,
  };
}