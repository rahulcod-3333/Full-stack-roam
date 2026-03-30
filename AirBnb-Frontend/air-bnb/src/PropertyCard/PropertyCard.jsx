import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import API from '../api';

export default function PropertyCard({
  property,
  hotelId,
  price,
  isFavorite = false,
  onFavoriteChange,
  compact = false,
  cardType = "hotel"
}) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const isRoomCard = cardType === "room";
  const targetHotelId = isRoomCard
    ? (hotelId ?? property.hotelId ?? null)
    : (hotelId ?? property.hotelId ?? property.id);
  const cardLink = isRoomCard
    ? (targetHotelId ? `/property/${targetHotelId}/room/${property.id}` : '#')
    : `/property/${targetHotelId}`;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!targetHotelId) {
      alert('Hotel information is missing for this room.');
      return;
    }

    if (!user) {
      alert('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (favorite) {
        await API.delete(`/favourites/${user.id}/${targetHotelId}`);
        setFavorite(false);
      } else {
        await API.post(`/favourites`, {
          userId: user.id,
          hotelId: targetHotelId 
        });
        setFavorite(true);
      }
      if (onFavoriteChange) onFavoriteChange();
    } catch (err) {
      console.error('Error updating favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  let displayPrice = "Price unavailable";

  if (property.rooms && property.rooms.length > 0) {
    const prices = property.rooms
      .map((room) => room.basePrice)
      .filter((item) => item !== undefined && item !== null);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      displayPrice = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
    }
  } 
  else if (price && price !== "unavailable") {
    displayPrice = `$${price}`;
  }

  const roomList = Array.isArray(property.rooms) ? property.rooms : [];
  const totalRoomValues = roomList
    .map((room) => Number(room?.totalCount))
    .filter((value) => Number.isFinite(value) && value > 0);
  const propertyRoomCount = totalRoomValues.reduce((sum, value) => sum + value, 0);
  const roomTypeCount = roomList.length;

  return (
    <Link to={cardLink} className="block">
      <article className={`overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] ${compact ? "rounded-[22px]" : "rounded-[28px]"}`}>
        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
          <img
            src={property.images?.[0] || property.photos?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070"}
            alt={property.title || property.type || "Property"}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/50 to-transparent"></div>

          {property.rating && (
            <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{property.rating}</span>
            </div>
          )}

          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/92 shadow-sm"
          >
            <Heart
              className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-slate-700'
                }`}
            />
          </button>
        </div>

        <div className={compact ? "space-y-3 p-4" : "space-y-4 p-5"}>
          <div className="space-y-2">
            {property.location && (
               <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                 {property.location}
               </div>
            )}
            <div>
              <h3 className={compact ? "text-base font-semibold leading-6 text-slate-900" : "text-lg font-semibold leading-7 text-slate-900"}>
                {property.title || property.type || property.name}
              </h3>
            </div>
          </div>

          {!compact && property.rooms && (
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Room Types</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{roomTypeCount || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inventory</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{propertyRoomCount || 'N/A'}</p>
              </div>
            </div>
          )}

          <div className={`flex items-end justify-between border-t border-slate-100 ${compact ? "pt-3" : "pt-4"}`}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Price</p>
              <div className="mt-1">
                <span className={compact ? "text-lg font-semibold text-slate-900" : "text-xl font-semibold text-slate-900"}>{displayPrice}</span>
                <span className="text-sm text-slate-500"> / night</span>
              </div>
            </div>
            <div className={compact ? "rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700" : "rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"}>
              View stay
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
