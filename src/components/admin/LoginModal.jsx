import React, { useState } from "react";
import { X, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectShowLoginModal,
  setShowLoginModal,
  login,
} from "../../store/slices/adminSlice";
import { useNavigate } from "react-router-dom";

import { CONTACT_INFO } from "../../utils/constants";

const LoginModal = () => {
  const showLoginModal = useSelector(selectShowLoginModal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!showLoginModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === CONTACT_INFO.EMAIL) {
      dispatch(login(email));
      setError("");
      setEmail("");
      navigate("/admin-dashboard"); // Navigate to admin dashboard
    } else {
      setError("البريد الإلكتروني غير صحيح");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative animate-fade-in shadow-2xl">
        <button
          onClick={() => dispatch(setShowLoginModal(false))}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-sans">
            تسجيل الدخول
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all text-left text-gray-900 bg-white"
              dir="ltr"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
