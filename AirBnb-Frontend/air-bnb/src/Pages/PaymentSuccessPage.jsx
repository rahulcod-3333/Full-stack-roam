import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Payment Successful!</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Your room has been securely booked. Get ready for an amazing trip!
        </p>
        <Link 
            to="/" 
            className="block w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
        >
            Return to Home
        </Link>
      </div>
    </div>
  );
}