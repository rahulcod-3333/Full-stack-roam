import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, Heart, Menu, X, LogOut, ShieldCheck } from "lucide-react";
import AuthModal from "../AuthModal/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/AuthSlice";
import ProfileSidebar from "../components/GuestModel/Sidebar";

export default function Navbar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarIsOpen , setSideBarOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isHomePage = location.pathname === "/";
  const isAnimatedNavbar = isHomePage;
  const showScrolledStyle = !isAnimatedNavbar || isScrolled;

  const hasHotelManagerAccess = (() => {
    if (!token) {
      return false;
    }

    try {
      const payload = token.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const parsed = JSON.parse(window.atob(normalized));
      return String(parsed?.roles ?? "").includes("HOTEL_MANAGER");
    } catch (error) {
      console.error("Unable to decode token roles", error);
      return false;
    }
  })();

  useEffect(() => {
    if (!isAnimatedNavbar) {
      setIsScrolled(true);
      return undefined;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAnimatedNavbar]);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    setSideBarOpen(false);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const headerClasses = showScrolledStyle
    ? "bg-white border-b border-slate-200 shadow-sm py-0"
    : "bg-transparent border-transparent py-2";

  const headerAnimationClasses = isAnimatedNavbar
    ? "transition-all duration-300 ease-in-out"
    : "";

  const logoIconClasses = isAnimatedNavbar
    ? "w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300"
    : "w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center shadow-md";

  const logoTextClasses = showScrolledStyle
    ? "text-red-500"
    : "text-white drop-shadow-md";

  const navItemBaseClasses = isAnimatedNavbar
    ? "transition-all duration-200"
    : "";

  const navItemClasses = showScrolledStyle
    ? `text-slate-700 hover:bg-slate-100 ${navItemBaseClasses}`
    : `text-white hover:bg-white/20 ${navItemBaseClasses}`;

  const loginButtonClasses = showScrolledStyle
    ? `text-slate-700 hover:bg-slate-100 ${navItemBaseClasses}`
    : `text-white hover:bg-white/20 ${navItemBaseClasses}`;

  const logoutButtonClasses = showScrolledStyle
    ? `bg-slate-100 hover:bg-slate-200 text-slate-700 ${navItemBaseClasses}`
    : `bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm ${navItemBaseClasses}`;

  const signUpButtonClasses = isAnimatedNavbar
    ? "px-7 py-2.5 rounded-full bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
    : "px-7 py-2.5 rounded-full bg-red-500 text-white font-semibold shadow-sm";

  const mobileButtonClasses = showScrolledStyle
    ? "text-slate-800 hover:bg-slate-100"
    : "text-white hover:bg-white/20";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${headerAnimationClasses} ${headerClasses}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className={logoIconClasses}>
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-semibold tracking-tight ${isAnimatedNavbar ? "transition-colors duration-300" : ""} ${logoTextClasses}`}>
                Roam
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {hasHotelManagerAccess && (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full ${navItemClasses}`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-medium">Admin</span>
                    </Link>
                  )}

                  <Link
                    to="/favourites"
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-full ${navItemClasses}`}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Favorites</span>
                  </Link>

                  <button
                    onClick={() => setSideBarOpen(true)}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-full ${navItemClasses}`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-full ${logoutButtonClasses}`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuth("login")}
                    className={`px-6 py-2.5 rounded-full font-medium ${loginButtonClasses}`}
                  >
                    Login
                  </button>

                  <button
                    onClick={() => openAuth("register")}
                    className={signUpButtonClasses}
                  >
                    Sign up
                  </button>
                </>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl ${isAnimatedNavbar ? "transition" : ""} ${mobileButtonClasses}`}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className={`md:hidden mt-2 space-y-3 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 ${isAnimatedNavbar ? "animate-fade-in" : ""}`}>
              {user ? (
                <>
                  {hasHotelManagerAccess && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 transition"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <Link
                    to="/favourites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 transition"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Favorites</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 transition"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuth("login")}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 transition"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => openAuth("register")}
                    className="w-full text-left px-4 py-3 rounded-xl bg-red-500 text-white transition hover:bg-red-600"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}

      <ProfileSidebar
      isOpen={isSidebarIsOpen}
      onClose={()=>setSideBarOpen(false)}
      />

    </>
  );
}
