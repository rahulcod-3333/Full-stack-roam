import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";
import heropage from "../assets/heropage.jpg";
import SearchBar from '../Search/SearchBar';
import PropertyCard from '../PropertyCard/PropertyCard';
import API from '../api';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [sectionTitle, setSectionTitle] = useState("Featured Properties");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [roomData , setRoomData] = useState([])
  const images = [img1, img2, img3, img4, img5];
  const heroTitleRef = useRef(null);
  const heroCopyRef = useRef(null);
  const heroCardsRef = useRef([]);
  const searchSectionRef = useRef(null);
  const featuredIntroRef = useRef(null);
  const featuredGridRef = useRef(null);

  const mapHotelData = (hotel) => ({
    id: hotel.id,
    title: hotel.name,
    location: hotel.city,
    images: hotel.photos && hotel.photos.length > 0
      ? [hotel.photos[0]]
      : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070"],
    
    price_per_night: hotel.rooms && hotel.rooms.length > 0
      ? hotel.rooms[0].basePrice
      : "unavailable",
    rooms: hotel.rooms,
  });

  const loadFeaturedProperties = async () => {
    try {
      setLoading(true);
      const response = await API.get('/hotels/all');
      setProperties(response.data.map(mapHotelData));
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapRoomData = (room, roomHotelMap = new Map()) => ({
    id: room.id,
    hotelId: room.hotelId ?? roomHotelMap.get(String(room.id)) ?? null,
    type: room.type,
    title: room.type,
    location: "Room",
    ameneties: room.amenities,
    images: room.photos && room.photos.length > 0
      ? [room.photos[0]]
      : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070"],
    
    price_per_night: room.basePrice || "unavailable"
  });

  const loadFeaturedRooms = async () => {
    try {
      setLoading(true);
      const [roomsResponse, hotelsResponse] = await Promise.all([
        API.get('/allRooms'),
        API.get('/hotels/all')
      ]);

      const rooms = Array.isArray(roomsResponse.data) ? roomsResponse.data : [];
      const hotels = Array.isArray(hotelsResponse.data) ? hotelsResponse.data : [];
      const roomHotelMap = new Map();
      hotels.forEach((hotel) => {
        hotel.rooms?.forEach((room) => {
          roomHotelMap.set(String(room.id), hotel.id);
        });
      });

      setRoomData(rooms.map((room) => mapRoomData(room, roomHotelMap)));
      setSectionTitle("Featured Rooms");
      setIsSearchMode(false);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };



  const executeSearch = async (location) => {
    if (!location || location.trim() === '') {
      loadFeaturedProperties();
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(`/hotels/searchbar?city=${location}`);
      setProperties(response.data.map(mapHotelData));
      setSectionTitle(`Search Results for "${location}"`);
      setIsSearchMode(true);
      document.getElementById('properties-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error("Search failed:", error);
      setProperties([]);
      setSectionTitle(`No results found for "${location}"`);
      setIsSearchMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedProperties();
    loadFeaturedRooms();

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);

    const ctx = gsap.context(() => {
      gsap.from(heroTitleRef.current, {
        y: 56,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(heroCopyRef.current, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: "power2.out",
      });

      gsap.from(heroCardsRef.current, {
        y: 32,
        opacity: 0,
        duration: 0.8,
        delay: 0.35,
        stagger: 0.12,
        ease: "power2.out",
      });

      gsap.from(searchSectionRef.current, {
        scrollTrigger: {
          trigger: searchSectionRef.current,
          start: "top 82%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(featuredIntroRef.current, {
        scrollTrigger: {
          trigger: featuredIntroRef.current,
          start: "top 84%",
        },
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".featured-property-card", {
        scrollTrigger: {
          trigger: featuredGridRef.current,
          start: "top 84%",
        },
        y: 36,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
      });
    });

    return () => {
      clearInterval(interval);
      ctx.revert();
    };
  }, []);

  const heroHighlights = [
    {
      title: "Handpicked destinations",
      description: "A more selective collection with stronger presentation, cleaner layouts, and dependable inventory.",
    },
    {
      title: "Verified comfort",
      description: "Reliable essentials, sharp interiors, and guest-first stays that feel consistent before and after booking.",
    },
    {
      title: "Seamless planning",
      description: "Search, shortlist, and reserve in a calmer interface built to feel premium instead of busy.",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          src={heropage}
          alt="Hero Background"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.28)_0%,rgba(15,23,42,0.48)_38%,rgba(15,23,42,0.68)_100%)]"></div>
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/30 to-transparent"></div>
        <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-red-400/20 blur-3xl"></div>

        <div className="relative z-10 px-4 pb-10 pt-28 sm:px-6 md:pt-32">
          <div className="mx-auto flex max-w-6xl flex-col gap-14">
            <div className="max-w-4xl">
              <div
                ref={heroCopyRef}
                className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur-md"
              >
                <span className="h-2 w-2 rounded-full bg-red-400"></span>
                Curated stays for modern travel
              </div>

              <h1
                ref={heroTitleRef}
                className="flex items-center text-5xl font-extralight leading-none text-white sm:text-7xl md:text-8xl lg:text-[8.5rem]"
              >
                <span className="mr-4 sm:mr-6 md:mr-10">R</span>
                <span className="relative mb-0 mr-1 inline-block h-14 w-14 overflow-hidden rounded-full border-2 border-white/20 align-middle sm:mb-3 sm:mr-2 sm:h-20 sm:w-20 md:mb-4 md:mr-3 md:h-24 md:w-24 lg:-mb-2 lg:mr-6 lg:h-[110px] lg:w-[110px]">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt=""
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                        index === currentImage ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                </span>
                <span>A M</span>
              </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              {heroHighlights.map((item, index) => (
                <div
                  key={item.title}
                  ref={(element) => {
                    heroCardsRef.current[index] = element;
                  }}
                  className="rounded-[28px] border border-white/18 bg-white/10 p-6 backdrop-blur-md shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                      0{index + 1}
                    </span>
                    <span className="h-px w-14 bg-white/25"></span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={searchSectionRef} className="relative -mt-10 px-4 pb-8 md:-mt-14 md:pb-12">
        <div className="mx-auto w-full max-w-6xl rounded-4xl border border-slate-200 bg-white px-4 py-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:px-6 md:px-8 md:py-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Search your destinations</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                Find a stay 
              </h2>
            </div>
          </div>
          <SearchBar onSearch={executeSearch} />
        </div>
      </section>

      <section className="px-4 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12" id="properties-grid">
        <div className="mx-auto max-w-7xl">
          <div
            ref={featuredIntroRef}
            className="mb-8 grid gap-5 rounded-4xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:mb-10 md:grid-cols-[1.2fr_0.8fr] md:p-8"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                {isSearchMode ? "Search Collection" : "Signature Collection"}
              </p>
              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  Feature Properties
                </h2>
                {isSearchMode && (
                  <button
                    onClick={loadFeaturedProperties}
                    className="w-fit rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    Clear Search
                  </button>
                )}
              </div>
             
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                
              </div>
            </div>
          </div>
          <div className='flex-col' >
          {loading ? (
            <div className="py-20 text-center">
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center">
              <p className="text-center text-slate-600">
                No properties available right now. Try adjusting your search.
              </p>
            </div>
          ) : (
            <div ref={featuredGridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
              {(isSearchMode ? properties : properties.slice(0, 6)).map((hotel) => (
                <div key={hotel.id} className="featured-property-card">
                  <PropertyCard
                    // FIX: Pass the correct mapped variable!
                    price={hotel.price_per_night} 
                    property={hotel}
                    isFavorite={favorites.has(hotel.id)}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12">
        <div className="mx-auto max-w-7xl">
          <div
            ref={featuredIntroRef}
            className="mb-8 grid gap-5 rounded-4xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:mb-10 md:grid-cols-[1.2fr_0.8fr] md:p-8"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                Featured Collection
              </p>
              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  Featured Rooms
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
            
            </div>
          </div>
          <div className='flex-col'>
            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto h-12 w-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>
              </div>
            ) : roomData.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <p className="text-center text-slate-600">
                  No rooms available right now. Try adjusting your search.
                </p>
              </div>
            ) : (
              <div ref={featuredGridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
                {roomData.slice(0, 6).map((room) => (
                  <div key={room.id} className="featured-property-card">
                    <PropertyCard
                      // FIX: Pass the correct mapped variable!
                      price={room.price_per_night} 
                      property={room}
                      hotelId={room.hotelId}
                      cardType="room"
                      isFavorite={favorites.has(room.id)}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
