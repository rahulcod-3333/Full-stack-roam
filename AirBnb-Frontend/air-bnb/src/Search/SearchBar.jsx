import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

// Added onSearch prop here
export default function SearchBar({ onSearch }) {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Pass the data up to Home.jsx instead of navigating away!
    if (onSearch) {
      onSearch(location, guests);
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-2 md:p-3 rounded-full shadow-xl border border-slate-200 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto w-full">
      
      {/* Location */}
      <div className="flex-1 w-full md:w-auto flex items-center px-4 py-2 hover:bg-slate-50 rounded-full transition-colors group sticky cursor-text">
        <MapPin className="w-5 h-5 text-red-500 mr-3 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col w-full">
          <label className="text-xs font-bold text-slate-800 tracking-wider">Where</label>
          <input 
            type="text" 
            placeholder="Search destinations" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-600 placeholder:text-slate-400 text-sm font-medium"
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-10 bg-slate-200"></div>

      {/* Guests */}
      <div className="flex-1 w-full md:w-auto flex items-center px-4 py-2 hover:bg-slate-50 rounded-full transition-colors group">
        <Users className="w-5 h-5 text-red-500 mr-3 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col w-full">
          <label className="text-xs font-bold text-slate-800 tracking-wider">Who</label>
          <input 
            type="number" 
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-600 text-sm font-medium"
          />
        </div>
      </div>

      {/* Search Button */}
      <button 
        type="submit"
        className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white p-4 md:px-8 md:py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
      >
        <Search className="w-5 h-5" />
        <span className="font-bold">Search</span>
      </button>
    </form>
  );
}
