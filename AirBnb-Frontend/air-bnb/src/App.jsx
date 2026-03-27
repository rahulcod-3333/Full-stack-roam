import React, { useState } from 'react'
import './App.css'
import LoadingPage from './LoadingPage/LoadingPage'
import Home from './Pages/Home';
import {  BrowserRouter, Route, Routes } from 'react-router-dom';
import PropertyDetails from './Pages/PropertyDetails';
import RoomDetails from './Pages/RoomDetails';
import PaymentSuccess from './Pages/PaymentSuccessPage';
import MyBookings from './Pages/MyBookings';
import SearchResults from './Pages/SearchResults';
import Navbar from './Navbar/Navbar';
import Favourites from './Pages/Favourites';
import AdminDashboard from './admin/AdminDashboard';
import AdminCreatePage from './admin/AdminCreatePage';
function App() {
 const [isLoading , setIsloading ] = useState(false)
  return (
    <BrowserRouter>
      {isLoading ? (
        <LoadingPage onFinish={() => setIsloading(false)} />
      ) : (
        <>
        
        <Navbar/>
      
        <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/property/:id" element={<PropertyDetails/>}/>
        <Route path="/property/:id/room/:roomId" element={<RoomDetails/>}/>
        <Route path="/payment/success" element={<PaymentSuccess/>} />
        <Route path="/profile" element={<MyBookings/>} />
        <Route path="/searchbar" element={<SearchResults />} />
        <Route path='/favourites' element={<Favourites/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path="/admin/create" element={<AdminCreatePage />} />
        </Routes>
        
      

        </>
        )}
        
      </BrowserRouter>
  
  );
};

export default App
