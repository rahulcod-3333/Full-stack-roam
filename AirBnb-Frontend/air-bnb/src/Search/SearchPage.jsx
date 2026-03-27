import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../PropertyCard/PropertyCard';
import SearchBar from './SearchBar';



export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [filters, setFilters] = useState({
    property_type: searchParams.get('property_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    loadProperties();
    if (user) {
      loadFavorites();
    }
  }, [searchParams]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const location = searchParams.get('location');
      const guests = searchParams.get('guests');
      
      if (location) params.append('location', location);
      if (guests) params.append('guests', guests);
      if (filters.property_type) params.append('property_type', filters.property_type);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);

      const response = await axios.get(`${API}/properties?${params.toString()}`);
      setProperties(response.data);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API}/favorites/${user.id}`);
      setFavorites(new Set(response.data.map(f => f.hotelId)));
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const applyFilters = () => {
    loadProperties();
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            defaultValues={{
              location: searchParams.get('location') || '',
              guests: searchParams.get('guests') || ''
            }}
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {searchParams.get('location') ? `Stays in ${searchParams.get('location')}` : 'All properties'}
            </h1>
            <p className="text-slate-600">{properties.length} properties found</p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-300 rounded-full hover:border-slate-400 transition-colors"
            data-testid="filters-button"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl space-y-4 animate-fade-in" data-testid="filters-panel">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
                <select
                  value={filters.property_type}
                  onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="property-type-filter"
                >
                  <option value="">All types</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="cabin">Cabin</option>
                  <option value="beach_house">Beach House</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                  placeholder="$0"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="min-price-filter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                  placeholder="$1000"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="max-price-filter"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setFilters({ property_type: '', min_price: '', max_price: '' });
                  setShowFilters(false);
                }}
                className="px-6 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 font-medium transition-colors"
                data-testid="clear-filters-button"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="px-8 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 font-semibold transition-all active:scale-95"
                data-testid="apply-filters-button"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-600 text-lg mb-4">No properties found matching your criteria.</p>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {properties.map((hotel) => (
              <PropertyCard
                key={hotel.id}
                property={hotel}
                isFavorite={favorites.has(hotel.id)}
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
