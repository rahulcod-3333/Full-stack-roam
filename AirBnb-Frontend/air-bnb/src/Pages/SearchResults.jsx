import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../PropertyCard/PropertyCard';
import API from '../api';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city'); // Grabs "Malibu" from the URL
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!city) return;
      
      try {
        setLoading(true);
        // Call the endpoint we just made in Step 1!
        const response = await API.get(`/hotels/searchbar?city=${city}`);
        
        // Map the backend Java DTOs to the React PropertyCard format (just like Home.jsx)
        const mappedProperties = response.data.map(hotel => ({
          id: hotel.id,
          title: hotel.name, 
          location: hotel.city, 
          images: hotel.photos && hotel.photos.length > 0 
                  ? [hotel.photos[0]] 
                  : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070"], 
          rating: 4.8,
          price_per_night: hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0].basePrice : 150,
          rooms: hotel.rooms || [],
        }));
        
        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [city]); // Re-run if the city changes

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Search results for "{city}"
        </h1>
        <p className="text-slate-500 mb-10 font-medium">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No matches found</h3>
            <p className="text-slate-500">Try searching for a different city like "Malibu" or "Aspen".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
