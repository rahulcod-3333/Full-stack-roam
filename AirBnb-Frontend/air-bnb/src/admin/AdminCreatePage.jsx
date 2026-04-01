import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowLeft } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAdminHotel, createHotelRoom, getAdminHotels } from "./adminApi";

const emptyHotelForm = { name: "", city: "", photos: "", amenities: "", isActive: true };
const emptyRoomForm = { type: "", basePrice: "", capacity: "", totalCount: "", photos: "", amenities: "" };

const parseTextList = (value) => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

export default function AdminCreatePage() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  
  const [hotelForm, setHotelForm] = useState(emptyHotelForm);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [savingHotel, setSavingHotel] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const hotelList = await getAdminHotels();
      setHotels(hotelList);
      if (hotelList.length > 0) setSelectedHotelId(hotelList[0].id);
    } catch (err) {
      console.error("Load hotels error:", err);
    }
  };

  const handleHotelImageUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;

      toast.info("Uploading hotel image...", {autoClose: 2000});
      try{
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "roam_app");
        const res = await fetch("https://api.cloudinary.com/v1_1/dbkg94t7a/image/upload", {
          method: "POST",
          body: data
        });
        const uploadedImage = await res.json();
        const currentPhotos = hotelForm.photos;
        const newPhotos = currentPhotos ? `${currentPhotos},\n${uploadedImage.secure_url}` : uploadedImage.secure_url;
        setHotelForm({...hotelForm, photos: newPhotos});
        toast.success("Hotel image uploaded successfully!");
      } catch (err) {
        console.error("Image upload error:", err);
      }
  };

  const handleRoomImageUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;

      toast.info("Uploading room image...", {autoClose: 2000});
      try{
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "roam_app");
        const res = await fetch("https://api.cloudinary.com/v1_1/dbkg94t7a/image/upload", {
          method: "POST",
          body: data
        });
        const uploadedImage = await res.json();
        const currentPhotos = roomForm.photos;
        const newPhotos = currentPhotos ? `${currentPhotos},\n${uploadedImage.secure_url}` : uploadedImage.secure_url;
        setRoomForm({...roomForm, photos: newPhotos});
        toast.success("Room image uploaded successfully!");
      } catch (err) {
        toast.error("Failed to upload image.");
        console.error("Image upload error:", err);
      }
  };

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    setSavingHotel(true);
    try {
      const payload = {
        ...hotelForm,
        active: hotelForm.isActive,
        photos: parseTextList(hotelForm.photos), 
        amenities: parseTextList(hotelForm.amenities),
      };
      await createAdminHotel(payload);
      setHotelForm(emptyHotelForm);
      toast.success("Hotel created successfully!");
      loadHotels(); // Silently refreshes the dropdown list so you can assign rooms to it instantly!
    } catch (err) {
      toast.error("Failed to create hotel.");
      console.error("Hotel creation error:", err);
    } finally {
      setSavingHotel(false);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHotelId) return toast.error("Select a hotel first.");
    setSavingRoom(true);
    try {
      const payload = { 
        ...roomForm, 
        basePrice: Number(roomForm.basePrice), 
        capacity: Number(roomForm.capacity), 
        totalCount: Number(roomForm.totalCount),
        photos: parseTextList(roomForm.photos), 
        amenities: parseTextList(roomForm.amenities) 
      };
      await createHotelRoom(selectedHotelId, payload);
      setRoomForm(emptyRoomForm);
      toast.success("Room created successfully! You can add another.");
    } catch (err) {
      toast.error("Failed to create room.");
      console.error("Room creation error:", err);
    } finally {
      setSavingRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans mt-12">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="max-w-300 mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* --- CREATE HOTEL FORM --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/admin')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Create New Property</h2>
              <p className="text-slate-500 font-medium text-sm">Add a new hotel location to the database.</p>
            </div>
          </div>
          
          <form onSubmit={handleHotelSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hotel Name</label>
                <input required value={hotelForm.name} onChange={(e) => setHotelForm({...hotelForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none" placeholder="The Grand Resort" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                <input required value={hotelForm.city} onChange={(e) => setHotelForm({...hotelForm, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none" placeholder="New York" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">Photos URLs</label>
                <label className="cursor-pointer bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold px-3 py-1 rounded-lg transition">
                  + Upload Image File
                  <input type="file" accept="image/*" className="hidden" onChange={handleHotelImageUpload} />
                </label>
              </div>
              <textarea 
                value={hotelForm.photos} 
                onChange={(e) => setHotelForm({...hotelForm, photos: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none min-h-[100px]" 
                placeholder="https://image1.jpg, https://image2.jpg" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amenities (Comma separated)</label>
              <input value={hotelForm.amenities} onChange={(e) => setHotelForm({...hotelForm, amenities: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="WiFi, Pool, Spa" />
            </div>
            <button type="submit" disabled={savingHotel} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition flex justify-center mt-6">
              {savingHotel ? 'Creating...' : 'Register Property'}
            </button>
          </form>
        </div>

        {/* --- CREATE ROOM FORM --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 mt-[72px]">Create New Room</h2>
          <p className="text-slate-500 mb-8 font-medium text-sm">Assign a new room type to an existing property.</p>
          
          <form onSubmit={handleRoomSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign to Property</label>
              <select value={selectedHotelId} onChange={(e) => setSelectedHotelId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none bg-white">
                <option value="" disabled>Select a property...</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room Type</label>
                <input required value={roomForm.type} onChange={(e) => setRoomForm({...roomForm, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="Ocean View Suite" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Price ($)</label>
                <input required type="number" min="1" value={roomForm.basePrice} onChange={(e) => setRoomForm({...roomForm, basePrice: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="150" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Capacity</label>
                <input required type="number" min="1" value={roomForm.capacity} onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="2" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Rooms of this Type</label>
                <input required type="number" min="1" value={roomForm.totalCount} onChange={(e) => setRoomForm({...roomForm, totalCount: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="10" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Add Amenities</label>
                <input required type="text" value={roomForm.amenities} onChange={(e) => setRoomForm({...roomForm, amenities: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="WiFi, Balcony" />
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Room Photos URLs</label>
                  <label className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-3 py-1 rounded-lg transition">
                    + Upload Image File
                    <input type="file" accept="image/*" className="hidden" onChange={handleRoomImageUpload} />
                  </label>
                </div>
                <textarea 
                  value={roomForm.photos} 
                  onChange={(e) => setRoomForm({...roomForm, photos: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none min-h-[80px]" 
                  placeholder="https://room1.jpg" 
                />
              </div>

            </div>
            <button type="submit" disabled={savingRoom} className="w-full py-4 bg-red-400 text-white font-bold rounded-xl hover:bg-red-500 transition flex justify-center mt-6">
              {savingRoom ? 'Creating...' : 'Register Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}