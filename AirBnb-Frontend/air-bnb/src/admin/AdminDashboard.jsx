import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Added for redirection!
import {
  Building2,
  CalendarRange,
  DoorOpen,
  LogOut,
  Plus,
  Search,
  WalletCards,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAdminHotels,
  getHotelBookings,
  getHotelReport,
  getHotelRooms,
} from "./adminApi";

const formatMoney = (value) => value ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value)) : "NA";
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-US", { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : "NA";

export default function AdminDashboard() {
  const navigate = useNavigate(); // <-- Setup navigation
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  
  // Dashboard Data
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState(null);

  const selectedHotel = useMemo(() => hotels.find((h) => h.id === selectedHotelId) ?? null, [hotels, selectedHotelId]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedHotelId) loadHotelWorkspace(selectedHotelId);
  }, [selectedHotelId]);

  const loadDashboardData = async () => {
    try {
      const hotelList = await getAdminHotels();
      setHotels(hotelList);
      if (hotelList.length > 0) setSelectedHotelId(hotelList[0].id);
    } catch (err) {
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const loadHotelWorkspace = async (hotelId) => {
    try {
      const [roomList, bookingList, hotelReport] = await Promise.all([
        getHotelRooms(hotelId),
        getHotelBookings(hotelId),
        getHotelReport(hotelId, {}),
      ]);
      setRooms(roomList);
      setBookings(bookingList);
      setReport(hotelReport);
    } catch (err) {
      toast.error("Failed to load hotel workspace.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'text-emerald-600 bg-emerald-50';
      case 'RESERVED': return 'text-violet-600 bg-violet-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* --- DARK HEADER SECTION --- */}
      <div className="bg-[#0F172A] text-white px-8 pb-32 pt-6 rounded-b-[40px] shadow-lg">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">Inntegrete</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button className="text-white bg-white/10 px-4 py-2 rounded-full">Dashboard</button>
            <button className="hover:text-white transition">Guests</button>
            <button className="hover:text-white transition">Reservations</button>
            <button className="hover:text-white transition">Rooms</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-800 rounded-full px-4 py-2 border border-slate-700">
              <span className="text-sm text-slate-400 mr-2">Property:</span>
              <select 
                value={selectedHotelId || ''} 
                onChange={(e) => setSelectedHotelId(Number(e.target.value))}
                className="bg-transparent text-white outline-none text-sm font-semibold cursor-pointer"
              >
                {hotels.map(h => <option key={h.id} value={h.id} className="text-black">{h.name}</option>)}
              </select>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full transition"><Search className="w-5 h-5 text-slate-300" /></button>
            <button className="p-2 hover:bg-slate-800 rounded-full transition"><LogOut className="w-5 h-5 text-slate-300" /></button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Good morning, Admin!</h1>
            <p className="text-slate-400">Here is what's happening at {selectedHotel?.name || "your properties"} today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-4 py-3 rounded-2xl">
              <CalendarRange className="w-5 h-5" />
              <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
            </div>

            {/* --- REDIRECT BUTTON --- */}
            <button 
              onClick={() => navigate('/admin/create')} 
              className="flex items-center gap-2 bg-red-400 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition shadow-lg shadow-red-500/30"
            >
              <Plus className="w-5 h-5" />
              New Create
            </button>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD CONTENT --- */}
      <div className="max-w-[1400px] mx-auto px-8 -mt-20 relative z-10 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-emerald-400 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between hover:-translate-y-1 transition duration-300">
            <DoorOpen className="w-8 h-8 mb-4 opacity-80" />
            <div>
              <p className="text-emerald-50 font-medium text-sm">Total Properties</p>
              <h3 className="text-4xl font-bold mt-1">{hotels.length}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <p className="text-slate-500 font-medium text-sm">Total Rooms</p>
            <div className="flex items-end gap-3 mt-4">
              <h3 className="text-4xl font-bold text-slate-900">{rooms.reduce((acc, room) => acc + (room.totalCount || 0), 0)}</h3>
              <span className="text-sm font-medium text-slate-400 mb-1">units</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <p className="text-slate-500 font-medium text-sm">Total Bookings</p>
            <div className="flex items-end gap-3 mt-4">
              <h3 className="text-4xl font-bold text-slate-900">{report?.bookingCounts || 0}</h3>
              <span className="text-sm font-medium text-slate-400 mb-1">all time</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <p className="text-slate-500 font-medium text-sm">Total Revenue</p>
            <div className="flex items-end gap-3 mt-4">
              <h3 className="text-3xl font-bold text-slate-900">{formatMoney(report?.totalRevenue)}</h3>
            </div>
          </div>
        </div>

        {/* Main Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Recent Bookings Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
                <p className="text-sm text-slate-500 mt-1">Latest guest reservations list</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-sm text-slate-400">
                    <th className="pb-4 font-medium px-4">Booking ID</th>
                    <th className="pb-4 font-medium px-4">Guest Info</th>
                    <th className="pb-4 font-medium px-4">Room Type</th>
                    <th className="pb-4 font-medium px-4">Check In</th>
                    <th className="pb-4 font-medium px-4">Check Out</th>
                    <th className="pb-4 font-medium px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bookings.slice(0, 7).map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-semibold text-slate-900">#{booking.id}</td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-900">{booking.user?.name || "Guest User"}</p>
                        <p className="text-xs text-slate-500">{booking.user?.email || "No email provided"}</p>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">{booking.room?.type || "Standard"}</td>
                      <td className="py-4 px-4 text-slate-600">{formatDate(booking.checkInDate)}</td>
                      <td className="py-4 px-4 text-slate-600">{formatDate(booking.checkOutDate)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getStatusColor(booking.bookingStatus)}`}>
                          {booking.bookingStatus || "NEW"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-500">No recent bookings found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Charts / Breakdown */}
          <div className="space-y-6">
            
            {/* Simple Bar Chart UI */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Revenue Flow</h2>
                  <p className="text-sm text-slate-500">Monthly breakdown overview</p>
                </div>
                <WalletCards className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="flex items-end justify-between h-40 gap-4">
                <div className="w-full bg-[#0F172A] rounded-t-xl h-[80%] relative group cursor-pointer transition-all hover:opacity-90"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition">Jan</span></div>
                <div className="w-full bg-pink-500 rounded-t-xl h-[100%] relative group cursor-pointer transition-all hover:opacity-90"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition">Feb</span></div>
                <div className="w-full bg-violet-200 rounded-t-xl h-[40%] relative group cursor-pointer transition-all hover:opacity-90"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition">Mar</span></div>
              </div>
            </div>

            {/* Top Category UI */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900">Top Categories</h2>
              <p className="text-sm text-slate-500 mb-6">Most booked room types</p>
              
              <div className="space-y-4">
                {rooms.slice(0, 3).map((room, idx) => {
                  const colors = ['bg-[#0F172A]', 'bg-violet-400', 'bg-pink-100'];
                  return (
                    <div key={room.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                        <span className="font-semibold text-slate-700">{room.type}</span>
                      </div>
                      <span className="font-bold text-slate-900">${room.basePrice}/nt</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}