import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api';
import PropertyCard from '../PropertyCard/PropertyCard';

export default function Favourites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // This will now hit your updated backend and return an array of Hotel objects!
      const res = await API.get('/favourites'); 
      setFavorites(res.data);
      console.log(favorites)
    } catch (err) {
      console.error("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  // When a user un-hearts a property on this page, we remove it from the list instantly
  const handleFavoriteRemoved = () => {
    fetchFavorites(); // Refresh the list
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Please log in</h2>
        <p className="text-slate-500">You need an account to view your saved properties.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 flex items-center gap-3">
          
          Your Favourites
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Every property you've fallen in love with, saved in one place.</p>
      </div>

      {favorites.length === 0 ? (
        /* --- EMPTY STATE UI --- */
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-red-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-2">No favorites yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            As you search, click the heart icon on any property to save it here for your next big adventure.
          </p>
          <Link 
            to="/"
            className="px-8 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          >
            <Search className="w-5 h-5" />
            Start Exploring
          </Link>
        </div>
      ) : (
        /* --- GRID UI --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((hotel) => (
            <PropertyCard 
              key={hotel.id} 
              property={hotel} 
              isFavorite={true} // They are all favorites on this page!
              onFavoriteChange={handleFavoriteRemoved} // If they un-heart it, refresh the list
            />
          ))}
        </div>
      )}
    </div>
  );
}
