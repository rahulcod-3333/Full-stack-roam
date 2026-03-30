import API from "../api";

export const getAdminHotels = async () => {
  const response = await API.get("/admin/hotels");
  return response.data;
};

export const createAdminHotel = async (payload) => {
  const response = await API.post("/admin/hotels", payload);
  return response.data;
};

export const updateAdminHotel = async (hotelId, payload) => {
  const response = await API.put(`/admin/hotels/${hotelId}`, payload);
  return response.data;
};

export const deleteAdminHotel = async (hotelId) => {
  await API.delete(`/admin/hotels/${hotelId}`);
};

export const toggleAdminHotelStatus = async (hotelId) => {
  await API.patch(`/admin/hotels/${hotelId}`);
};

export const getHotelBookings = async (hotelId) => {
  const response = await API.get(`/admin/hotels/${hotelId}/bookings`);
  return response.data;
};

export const getHotelReport = async (hotelId, params) => {
  const response = await API.get(`/admin/hotels/${hotelId}/reports`, { params });
  return response.data;
};

export const getHotelRooms = async (hotelId) => {
  const response = await API.get(`/admin/hotels/${hotelId}/rooms`);
  return response.data;
};

export const createHotelRoom = async (hotelId, payload) => {
  const response = await API.post(`/admin/hotels/${hotelId}/rooms`, payload);
  return response.data;
};

export const updateHotelRoom = async (hotelId, roomId, payload) => {
  const response = await API.put(`/admin/hotels/${hotelId}/rooms/${roomId}`, payload);
  return response.data;
};

export const deleteHotelRoom = async (hotelId, roomId) => {
  await API.delete(`/admin/hotels/${hotelId}/rooms/${roomId}`);
};

export const getRoomInventory = async (roomId) => {
  const response = await API.get(`/admin/inventory/rooms/${roomId}`);
  return response.data;
};

export const updateRoomInventory = async (roomId, payload) => {
  await API.patch(`/admin/inventory/rooms/${roomId}`, payload);
};