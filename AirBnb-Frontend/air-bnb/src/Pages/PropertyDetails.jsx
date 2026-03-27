import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import API from '../api';

const PropertyDetails = () => {

    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchHotel = async () => {
            try {
                const res = await API.get(`/hotels/${id}/info`);
                setHotel(res.data)
                console.log(res.data)

            }
            catch (err) {
                console.error("Failed to load" + err);

            }
            finally {
                setLoading(false);
            }
        }
        fetchHotel();
    }, [id]);
    if (loading || !hotel) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading property details...</p>
            </div>
        );
    }
    const fallbackImages = [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070"
    ];
    const hotelImages = hotel.photos?.length > 0 ? hotel.photos : fallbackImages;
    const gridImages = [0, 1].map(index => hotelImages[index] || fallbackImages[index]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-24">

            {/* --- HEADER SECTION --- */}

            <div className="">
                <h1 className="text-4xl font-extrabold text-slate-900">{hotel.name}</h1>
                <div className="flex items-center space-x-2 text-slate-600 mt-2 font-medium">
                    <span>{hotel.city}</span>
                </div>
                {hotel.amenities?.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity, index) => (
                            <span
                                key={`${amenity}-${index}`}
                                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600"
                            >
                                {amenity}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* --- IMAGE GALLERY --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 h-[400px] rounded-3xl overflow-hidden">

                <img
                    src={hotelImages[0] || fallbackImages[0]}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    alt="Hotel"
                />

                <div className="grid grid-cols-2 gap-4">
                    {gridImages.map((imgSrc, index) => (
                        <img
                            key={index}
                            src={imgSrc}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            alt={`Room view ${index + 1}`}
                        />
                    ))}
                </div>

            </div>
            {/* --- CONTENT SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Info & Rooms */}
                <div className="lg:col-span-2 space-y-10">


                    <div>
                        <h3 className="text-2xl font-bold mb-6">Available Rooms</h3>
                        <div className="space-y-6">

                            {hotel.rooms?.length > 0 ? hotel.rooms.map((room) => (
                                <div key={room.id} className="border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl transition-shadow bg-white">
                                    <div className="w-full md:w-auto">
                                        <h4 className="font-bold text-xl text-slate-900">{room.type}</h4>
                                        <p className="text-red-500 font-semibold mt-1">Base Price: ${room.basePrice} / night</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                            <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                                                Capacity: {room.capacity ?? 'N/A'} guests
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                                                Rooms: {room.totalCount ?? 'N/A'}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
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
                                    <Link
                                        to={`/property/${id}/room/${room.id}`}
                                        className="w-full md:w-auto text-center px-8 py-3.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all active:scale-95 shadow-lg"
                                    >
                                        View Room
                                    </Link>
                                </div>
                            )) : <p className="text-slate-500 italic">No rooms available right now.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default PropertyDetails;
