import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, Users } from 'lucide-react';
import GuestModal from '../components/GuestModel/GuestModal';
import API from '../api';

const RoomDetails = () => {
  const { id, roomId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guest, setGuest] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await API.get(`/hotels/${id}/info`);
        const hotelData = {
          ...(res.data?.hotel || {}),
          rooms: res.data?.rooms || [],
        };
        const matchedRoom = hotelData.rooms.find((item) => String(item.id) === String(roomId));
        setHotel(hotelData);
        setRoom(matchedRoom || null);
      } catch (err) {
        console.error("Failed to load room details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [id, roomId]);

  const handleBooking = async () => {
    if (!user) {
      alert("please login to book a room!");
      return;
    }
    if (!checkIn || !checkOut) {
      alert("pls make a booking first to access this");
      return;
    }
    setBookingLoading(true);

    try {
      const initPayload = {
        hotelId: Number(id),
        roomId: Number(roomId),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomsCount: 1
      };
      const initRes = await API.post('/booking/init', initPayload);
      setCurrentBookingId(initRes.data.id);
      setShowGuestModal(true);
    } catch (err) {
      console.error("booking init failed", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Booking failed";
      alert(typeof backendMessage === "string" ? backendMessage : JSON.stringify(backendMessage));
    } finally {
      setBookingLoading(false);
    }
  };

  const processPaymentAndGuest = async (guestDataArray) => {
    setBookingLoading(true);
    try {
      await API.post(`/booking/addGuests/${currentBookingId}`, guestDataArray);
      const paymentRes = await API.post(`/booking/${currentBookingId}/payment`);
      window.location.href = paymentRes.data.SessionURl;
    } catch (err) {
      console.error("Payment setUp failed ", err);
      alert(err.response?.data?.message || "Failed to process guests or payment.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading room details...</p>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Room not found</h2>
        <p className="mt-2 text-slate-500">The selected room is unavailable or no longer exists.</p>
        <Link
          to={`/property/${id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to property
        </Link>
      </div>
    );
  }

  const fallbackImages = [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070"
  ];
  const roomImages = room.photos?.length > 0 ? room.photos : fallbackImages;
  const gridImages = [1, 2, 3, 4].map((index) => roomImages[index] || fallbackImages[index - 1]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <Link
        to={`/property/${id}`}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {hotel.name}
      </Link>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{hotel.name}</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">{room.type}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
            Capacity: {room.capacity ?? 'N/A'} guests
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
            Inventory: {room.totalCount ?? 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 h-[400px] rounded-3xl overflow-hidden">
        <img
          src={roomImages[0] || fallbackImages[0]}
          className="w-full h-full object-cover"
          alt={room.type}
        />

        <div className="grid grid-cols-2 gap-4">
          {gridImages.map((imgSrc, index) => (
            <img
              key={index}
              src={imgSrc}
              className="w-full h-full object-cover"
              alt={`${room.type} view ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">Room Amenities</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {(room.amenities?.length ? room.amenities : ['No amenities listed']).map((amenity, index) => (
                <span
                  key={`${room.id}-${amenity}-${index}`}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="sticky top-28 border border-slate-200 rounded-3xl p-6 shadow-2xl bg-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Select Dates
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent transition-all">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Check-in</label>
                  <input
                    type="date"
                    className="w-full outline-none text-slate-900 bg-transparent font-medium"
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent transition-all">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Check-out</label>
                  <input
                    type="date"
                    className="w-full outline-none text-slate-900 bg-transparent font-medium"
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent transition-all">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max={room.capacity || undefined}
                  value={guest}
                  onChange={(e) => setGuest(e.target.value)}
                  className="w-full outline-none text-slate-900 bg-transparent font-medium"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-2xl font-semibold text-slate-900">${room.basePrice} <span className="text-sm font-normal text-slate-500">/ night</span></p>
                <p className="mt-3 text-sm text-slate-500">
                  Select your dates and proceed with guest details and payment for this room.
                </p>
              </div>

              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="w-full px-8 py-3.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
              >
                {bookingLoading ? 'Processing...' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <GuestModal
        isOpen={showGuestModal}
        isClose={() => setShowGuestModal(false)}
        guestCount={Number(guest)}
        onSubmit={processPaymentAndGuest}
        loading={bookingLoading}
      />
    </div>
  );
};

export default RoomDetails;
