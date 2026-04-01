import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CalendarRange, DoorOpen, LogOut, Plus, Search, MapPin } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import API from "../api";
import { getAdminHotels, getHotelBookings, getHotelReport, getRoomInventory } from "./adminApi";

const formatMoney = (value) => value ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value)) : "NA";
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-US", { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : "NA";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [totalPlatformRooms, setTotalPlatformRooms] = useState(0); 
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState(null);
  const [inventories, setInventories] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const selectedHotel = useMemo(() => hotels.find((h) => h.id === selectedHotelId) ?? null, [hotels, selectedHotelId]);
  
  // FIX: Wrapped rooms in useMemo to stop the infinite loop!
  const rooms = useMemo(() => selectedHotel?.rooms || [], [selectedHotel]);
  
  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId) ?? null, [rooms, selectedRoomId]);

  // 1. Initial Load
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const hotelList = await getAdminHotels();
        const sortedHotels = hotelList.reverse(); // Newest first
        setHotels(sortedHotels);
        if (sortedHotels.length > 0) setSelectedHotelId(sortedHotels[0].id);

        const roomsResponse = await API.get('/allRooms');
        const globalRoomCount = roomsResponse.data.reduce((acc, room) => acc + (room.totalCount || 0), 0);
        setTotalPlatformRooms(globalRoomCount);
      } catch (err) {
        toast.error("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // 2. Load Hotel Data when Hotel changes
  useEffect(() => {
    const loadHotelWorkspace = async (hotelId) => {
      try {
        const [bookingList, hotelReport] = await Promise.all([
          getHotelBookings(hotelId),
          getHotelReport(hotelId, {}),
        ]);
        setBookings(bookingList);
        setReport(hotelReport);
      } catch (err) {
        toast.error("Failed to load hotel workspace.");
      }
    };

    if (selectedHotelId) loadHotelWorkspace(selectedHotelId);
  }, [selectedHotelId]);

  // 3. Update Selected Room when Rooms array changes
  useEffect(() => {
    if (rooms.length === 0) {
      setSelectedRoomId(null);
      setInventories((prev) => prev.length === 0 ? prev : []); // Safe state update
      return;
    }

    setSelectedRoomId((currentRoomId) =>
      rooms.some((room) => room.id === currentRoomId) ? currentRoomId : rooms[0].id
    );
  }, [rooms]);

  // 4. Load Inventory when Selected Room changes
  useEffect(() => {
    const loadRoomInventory = async (roomId) => {
      setInventoryLoading(true);
      try {
        const inventoryList = await getRoomInventory(roomId);
        setInventories(Array.isArray(inventoryList) ? inventoryList : []);
      } catch (err) {
        setInventories([]);
        toast.error("Failed to load room inventory.");
      } finally {
        setInventoryLoading(false);
      }
    };

    if (!selectedRoomId) {
      setInventories((prev) => prev.length === 0 ? prev : []); // Safe state update
      return;
    }

    loadRoomInventory(selectedRoomId);
  }, [selectedRoomId]);

  const getStatusColor = (status) => {
    const s = status?.toUpperCase() || 'NEW';
    if (['CONFIRMED', 'PAID', 'COMPLETED'].includes(s)) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (['CANCELLED'].includes(s)) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const getBookingRemark = (status) => {
    const s = status?.toUpperCase() || 'NEW';
    if (['CONFIRMED', 'PAID', 'COMPLETED', 'CHECKED_IN'].includes(s)) return <span className="font-bold text-emerald-600">Non-Pending (Secured)</span>;
    if (['CANCELLED'].includes(s)) return <span className="font-bold text-slate-400">Voided</span>;
    return <span className="font-bold text-amber-500 animate-pulse">Pending Action</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* --- DARK HEADER SECTION --- */}
      <div className="bg-[#0F172A] text-white px-8 pb-32 pt-20 rounded-b-[40px] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1400px] mx-auto">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Good morning, Admin!</h1>
            <p className="text-slate-400">Here is what's happening at your properties today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-4 py-3 rounded-2xl">
              <CalendarRange className="w-5 h-5" />
              <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
            </div>

            <button onClick={() => navigate('/admin/create')} className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-semibold transition shadow-lg shadow-red-500/30">
              <Plus className="w-5 h-5" />
              New Property/Room
            </button>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD CONTENT --- */}
      <div className="max-w-[1400px] mx-auto px-8 -mt-20 relative z-10 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-100 text-black p-6 rounded-3xl shadow-lg flex flex-col justify-between hover:-translate-y-1 transition duration-300">
            <Building2 className="w-8 h-8 mb-4 opacity-80" />
            <div>
              <p className="text-slate-500 font-medium text-sm">Total Properties</p>
              <h3 className="text-4xl font-bold mt-1">{hotels.length}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl  shadow-lg flex flex-col justify-between hover:-translate-y-1 transition duration-300">
            <p className="text-slate-500 font-medium text-sm">Platform Total Rooms</p>
            <div className="flex items-end gap-3 mt-4">
              <h3 className="text-4xl font-bold text-slate-900">{totalPlatformRooms}</h3>
              <span className="text-sm font-medium text-slate-400 mb-1">units</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl  shadow-lg flex flex-col justify-between hover:-translate-y-1 transition duration-300">
            <p className="text-slate-500 font-medium text-sm">Total Bookings</p>
            <div className="flex items-end gap-3 mt-4">
              <h3 className="text-4xl font-bold text-slate-900">{report?.bookingCounts || bookings.length}</h3>
              <span className="text-sm font-medium text-slate-400 mb-1">all time</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl  shadow-lg flex flex-col justify-between hover:-translate-y-1 transition duration-300">
            <p className="text-slate-500 font-medium text-sm">Total Revenue</p>
            <div className="flex items-end gap-3 mt-4">
              <h3 className="text-3xl font-bold text-slate-900">{formatMoney(report?.totalRevenue)}</h3>
            </div>
          </div>
        </div>

        {/* --- PROPERTIES DIRECTORY --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">My Properties Directory</h2>
            <span className="text-sm text-slate-500 font-medium">Click a property to manage it</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {hotels.length === 0 ? (
              <p className="text-slate-400 col-span-full">No properties found. Please click "New Property" to start.</p>
            ) : (
              hotels.map(hotel => (
                <div key={hotel.id} onClick={() => setSelectedHotelId(hotel.id)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedHotelId === hotel.id ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-slate-100 hover:border-violet-300 hover:bg-slate-50'}`}>
                  <h3 className="font-bold text-slate-900 truncate mb-1">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    {hotel.city}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Recent Bookings Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Guest Bookings</h2>
                <p className="text-sm text-slate-500 mt-1">Showing reservations for: <span className="font-bold text-violet-600">{selectedHotel?.name}</span></p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                    <th className="pb-4 font-semibold px-4">Booking ID</th>
                    <th className="pb-4 font-semibold px-4">Guest Info</th>
                    <th className="pb-4 font-semibold px-4">Dates</th>
                    <th className="pb-4 font-semibold px-4">Status</th>
                    <th className="pb-4 font-semibold px-4">Remark</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-bold text-slate-900">#{booking.id}</td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-900">{booking.user?.name || "Guest User"}</p>
                        <p className="text-xs text-slate-500">{booking.user?.email || "No email provided"}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-800 font-medium">{formatDate(booking.checkInDate)}</p>
                        <p className="text-xs text-slate-400">to {formatDate(booking.checkOutDate)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-widest border ${getStatusColor(booking.bookingStatus)}`}>
                          {booking.bookingStatus || "NEW"}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getBookingRemark(booking.bookingStatus)}</td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-medium">No bookings found for this property yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Rooms Inventory List */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-full">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Room Inventory</h2>
                  <p className="text-sm text-slate-500">Rooms at <span className="font-bold text-violet-600">{selectedHotel?.name}</span></p>
                </div>
                {rooms.length > 0 && (
                  <select
                    value={selectedRoomId ?? ""}
                    onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                    className="min-w-[180px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.type}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2">
                {rooms.length === 0 ? (
                   <div className="text-center py-8">
                     <p className="text-slate-500 text-sm mb-4">No rooms added to this property.</p>
                     <button onClick={() => navigate('/admin/create')} className="text-xs font-bold text-violet-600 bg-violet-50 px-4 py-2 rounded-lg hover:bg-violet-100 transition">Add a Room</button>
                   </div>
                ) : (
                  rooms.map((room, idx) => {
                    const colors = ['bg-[#0F172A]', 'bg-violet-400', 'bg-red-400', 'bg-emerald-400', 'bg-blue-400'];
                    const isSelected = room.id === selectedRoomId;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition ${isSelected ? 'border-violet-500 bg-violet-50 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                            <span className="font-bold text-slate-800">{room.type}</span>
                          </div>
                          <span className="font-black text-slate-900">${room.basePrice}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 ml-6">
                          <span>Capacity: {room.capacity} Guests</span>
                          <span className="font-semibold px-2 py-1 bg-slate-100 rounded-md">Total Count: {room.totalCount}</span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Daily Inventory Table</h3>
                    <p className="text-sm text-slate-500">
                      {selectedRoom ? `${selectedRoom.type} availability for the next 365 days` : "Select a room to inspect inventory"}
                    </p>
                  </div>
                  {inventories.length > 0 && (
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                      {inventories.length} days
                    </span>
                  )}
                </div>

                {inventoryLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
                  </div>
                ) : inventories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                    No inventory rows found for this room.
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-100">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Total</th>
                          <th className="px-4 py-3 font-semibold">Booked</th>
                          <th className="px-4 py-3 font-semibold">Reserved</th>
                          <th className="px-4 py-3 font-semibold">Available</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventories.map((inventory) => {
                          const available = Math.max(
                            0,
                            (inventory.totalCount ?? 0) - (inventory.bookedCount ?? 0) - (inventory.reservedCount ?? 0)
                          );

                          return (
                            <tr key={inventory.id ?? inventory.date} className="border-t border-slate-100">
                              <td className="px-4 py-3 font-medium text-slate-800">{formatDate(inventory.date)}</td>
                              <td className="px-4 py-3 text-slate-600">{inventory.totalCount ?? 0}</td>
                              <td className="px-4 py-3 text-slate-600">{inventory.bookedCount ?? 0}</td>
                              <td className="px-4 py-3 text-slate-600">{inventory.reservedCount ?? 0}</td>
                              <td className="px-4 py-3 font-semibold text-slate-900">{available}</td>
                              <td className="px-4 py-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${inventory.closed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {inventory.closed ? "Closed" : "Open"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}