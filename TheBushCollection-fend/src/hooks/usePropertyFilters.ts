import { useMemo } from 'react';
import { Property } from './useBackendProperties';

interface PropertyFilters {
  searchTerm: string;
  selectedType: string;
  selectedLocation: string;
}

export function usePropertyFilters(properties: Property[], filters: PropertyFilters) {
  const { searchTerm, selectedType, selectedLocation } = filters;

  const propertyTypes = useMemo(
    () => [...new Set(properties.map(p => p.type || p.category).filter(Boolean))] as string[],
    [properties],
  );

  const filteredProperties = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return properties.filter(p => {
      const matchesSearch =
        !term ||
        (p.name || '').toLowerCase().includes(term) ||
        (p.location || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term);
      const pType = p.type || p.category || '';
      const matchesType = selectedType === 'all' || pType === selectedType;
      const matchesLocation =
        selectedLocation === 'all' ||
        (p.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [properties, searchTerm, selectedType, selectedLocation]);

  const nonNairobiProperties = useMemo(
    () => filteredProperties.filter(p => !(p.location || '').toLowerCase().includes('nairobi')),
    [filteredProperties],
  );

  const nairobiHotels = useMemo(
    () => filteredProperties.filter(p => (p.location || '').toLowerCase().includes('nairobi')),
    [filteredProperties],
  );

  const safariLocations = useMemo(
    () => [...new Set(nonNairobiProperties.map(p => p.location).filter(Boolean))] as string[],
    [nonNairobiProperties],
  );

  return { propertyTypes, filteredProperties, nonNairobiProperties, nairobiHotels, safariLocations };
}
