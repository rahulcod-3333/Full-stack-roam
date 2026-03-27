import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, Upload, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAdminHotel, createHotelRoom, getAdminHotels } from "./adminApi";

const emptyHotelForm = { name: "", city: "", photos: "", amenities: "", isActive: true };
const emptyRoomForm = { type: "", basePrice: "", capacity: "", totalCount: "", photos: "", amenities: "" };

const parseTextList = (value) => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
const readFilesAsDataUrls = (files) =>
  Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        })
    )
  );

export default function AdminCreatePage() {
  const navigate = useNavigate();
  const hotelPhotoInputRef = useRef(null);
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  
  const [hotelForm, setHotelForm] = useState(emptyHotelForm);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [hotelUploadedPhotos, setHotelUploadedPhotos] = useState([]);
  const [savingHotel, setSavingHotel] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [uploadingHotelPhotos, setUploadingHotelPhotos] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const hotelList = await getAdminHotels();
      setHotels(hotelList);
      if (hotelList.length > 0) setSelectedHotelId(hotelList[0].id);
    } catch (err) {
      toast.error("Failed to load hotels for room assignment.");
    }
  };

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    setSavingHotel(true);
    try {
      const payload = {
        ...hotelForm,
        photos: [...hotelUploadedPhotos, ...parseTextList(hotelForm.photos)],
        amenities: parseTextList(hotelForm.amenities),
      };
      await createAdminHotel(payload);
      setHotelForm(emptyHotelForm);
      setHotelUploadedPhotos([]);
      toast.success("Hotel created successfully!");
      loadHotels(); // Refresh dropdown list
    } catch (err) {
      toast.error("Failed to create hotel.");
    } finally {
      setSavingHotel(false);
    }
  };

  const handleHotelPhotoUpload = async (event) => {
    const { files } = event.target;

    if (!files?.length) {
      return;
    }

    setUploadingHotelPhotos(true);

    try {
      const uploadedImages = await readFilesAsDataUrls(files);
      setHotelUploadedPhotos((current) => [...current, ...uploadedImages]);
      toast.success(`${uploadedImages.length} photo${uploadedImages.length > 1 ? "s" : ""} added.`);
    } catch (err) {
      toast.error("Photo upload failed.");
    } finally {
      setUploadingHotelPhotos(false);
      event.target.value = "";
    }
  };

  const removeHotelPhoto = (indexToRemove) => {
    setHotelUploadedPhotos((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHotelId) return toast.error("Select a hotel first.");
    setSavingRoom(true);
    try {
      const payload = { 
        ...roomForm, 
        basePrice: Number(roomForm.basePrice), capacity: Number(roomForm.capacity), totalCount: Number(roomForm.totalCount),
        photos: parseTextList(roomForm.photos), amenities: parseTextList(roomForm.amenities) 
      };
      await createHotelRoom(selectedHotelId, payload);
      setRoomForm(emptyRoomForm);
      toast.success("Room created successfully!");
    } catch (err) {
      toast.error("Failed to create room.");
    } finally {
      setSavingRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header */}
      <div className="bg-[#0F172A] text-white px-8 py-6 shadow-lg">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-wide">Inntegrete Workspace</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* --- CREATE HOTEL FORM --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Property</h2>
          <p className="text-slate-500 mb-8 font-medium text-sm">Add a new hotel location to the database.</p>
          
          <form onSubmit={handleHotelSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hotel Name</label>
                <input required value={hotelForm.name} onChange={(e) => setHotelForm({...hotelForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="The Grand Resort" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                <input required value={hotelForm.city} onChange={(e) => setHotelForm({...hotelForm, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="New York" />
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hotel Photos</label>
                  <p className="text-sm text-slate-500">Upload images from laptop or mobile, or add external image URLs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => hotelPhotoInputRef.current?.click()}
                  disabled={uploadingHotelPhotos}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingHotelPhotos ? "Uploading..." : "Upload Photos"}
                </button>
              </div>

              <input
                ref={hotelPhotoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleHotelPhotoUpload}
                className="hidden"
              />

              {hotelUploadedPhotos.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {hotelUploadedPhotos.map((photo, index) => (
                    <div key={`${photo.slice(0, 24)}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <img src={photo} alt={`Hotel upload ${index + 1}`} className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeHotelPhoto(index)}
                        className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-1 text-white transition hover:bg-slate-950"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={hotelForm.photos}
                onChange={(e) => setHotelForm({...hotelForm, photos: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]"
                placeholder="Optional: https://image1.jpg, https://image2.jpg"
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Room</h2>
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
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Add Amenitis</label>
                <input required type="text"  value={roomForm.amenities} onChange={(e) => setRoomForm({...roomForm, amenities: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-400 outline-none" placeholder="10" />
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
