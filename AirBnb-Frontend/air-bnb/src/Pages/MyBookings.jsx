import React, { useEffect, useState } from 'react'
import { Calendar, MapPin, CreditCard, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import API from '../api';

const MyBookings = () => {
    const [bookings, setBookings] = useState([])
    const [loading , setLoading] = useState(true);
    const user = useSelector((state) => state.auth.user);

    useEffect(()=>{
        fetchBookings();
    } , []);

    const fetchBookings = async()=>{
        try{
            const response = await API.get('/users/myBookings');
            setBookings(response.data)
        }
        catch(err){
            console.error("Error fetching bookings", err);
        }
        finally{
            setLoading(false);
        }
    }

    const handleCancelBooking = async({bookingId})=>{
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try{
            await API.delete(`/booking/${bookingId}/cancel`);
            alert("Booking canceled successfully");
            fetchBookings();

        }
        catch(error){
            console.error("Error cancelling bookings", err);
            alert(err.response?.data?.message || "Could no cancel the booking" );
        }

    };
    const getStatusBadge = (status)=>{
        switch (status) {
            case 'CONFIRMED':
                return <span className='px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wider'>CONFIRMED</span>
            case 'CANCELLED':
                return <span className='px-3 py-1 bg-green-100 text-red-700 rounded-full text-xs font-bold tracking-wider'>CANCELLED</span>
            case 'PENDING PAYMENT':
                return <span className='px-3 py-1 bg-green-100 text-amber-500 rounded-full text-xs font-bold tracking-wider'>PENDING PAYMENT</span>
            default :
                return <span className='px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold tracking-wider'>{status}</span>;
        }
    }


    if(!user){
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Please log in to view your bookings.</div>;
    }
    if(loading){
        return <div className="min-h-screen flex items-center justify-center">Loading your trips...</div>;
    }
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 min-h-screen">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">My Trips</h1>
      <p className="text-slate-500 mb-10 text-lg">Manage your upcoming and past reservations.</p>

      {bookings.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-700 mb-2">No trips booked... yet!</h3>
          <p className="text-slate-500">Time to dust off your bags and start planning your next adventure.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* We reverse the array so the newest bookings show up at the top */}
          {[...bookings].reverse().map((booking) => (
            <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Left Side: Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <h2 className="text-2xl font-bold text-slate-900">{booking.hotel?.name || "Hotel Name"}</h2>
                  {getStatusBadge(booking.bookingStatus)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <span className="font-medium">
                      {booking.checkInDate} &rarr; {booking.checkOutDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Total: ${booking.amount}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                {/* Only allow cancellation if the booking is CONFIRMED */}
                {booking.bookingStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Trip
                  </button>
                )}
                
                {booking.bookingStatus === 'CANCELLED' && (
                  <p className="text-sm text-slate-500 text-center font-medium">
                    This reservation is cancelled.
                  </p>
                )}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default MyBookings
