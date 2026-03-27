import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { X, User } from 'lucide-react';

const GuestModal = ({ isOpen, isClose, guestCount, onSubmit, loading }) => {
  const user = useSelector((state) => state.auth.user);
  const [guestData, setGuestData] = useState([]);

  useEffect(() => {
    if (isOpen) { // form is open 
      const initialGuests = Array.from({ length: guestCount }, (_, index) => {
        if (index === 0 && user) {
          return { name: user.name, age: '', gender: 'NOT_SPECIFIED' };
        }
        return { name: '', age: '', gender: 'NOT_SPECIFIED' };
      });
      setGuestData(initialGuests)
    }
  }, [isOpen, guestCount, user])

  if (!isOpen) return null;

  const handleInputChange = (index, field, value) => {
    const updateGuests = [...guestData];
    updateGuests[index][field] = value;
    setGuestData(updateGuests);
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(guestData);
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">

        <button onClick={isClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-700" />
        </button>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Guest Details</h2>
        <p className="text-slate-500 mb-8 font-medium">Please provide the details for all {guestCount} guest(s) staying.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {guestData.map((guest, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-red-500" />
                Guest {index + 1} {index === 0 && <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full ml-2">Primary (You)</span>}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={guest.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none"
                    placeholder="John Doe"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DOB</label>
                  <input
                    type="date"
                    required
                    min="1"
                    value={guest.age}
                    onChange={(e) => handleInputChange(index, 'age', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none"
                    placeholder="25"
                  />
                </div>

                {/* Gender */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                  <select
                    value={guest.gender}
                    onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none bg-white"
                  >
                    <option value="NOT_SPECIFIED">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-4">
            <button type="button" onClick={isClose} className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition shadow-lg flex items-center gap-2"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GuestModal
