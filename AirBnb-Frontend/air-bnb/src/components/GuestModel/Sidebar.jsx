import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { X, User, Heart, CalendarDays, LogOut, Settings, Save, LoaderCircle } from 'lucide-react';
import { logout, updateProfileSuccess } from '../../redux/AuthSlice';
import API from '../../api';

const initialProfileForm = {
  name: '',
  dateOfBirth: '',
  gender: '',
};

const ProfileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
    });
  }, [user, isOpen]);

  const handleNavigation = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigate('/');
    window.location.reload();
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        name: profileForm.name.trim() || null,
        dateOfBirth: profileForm.dateOfBirth || null,
        gender: profileForm.gender || null,
      };

      await API.patch('/users/profile', payload);
      const refreshedProfile = await API.get('/users/profile');
      dispatch(updateProfileSuccess(refreshedProfile.data));
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Could not update your profile.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{user?.name || 'Guest User'}</h2>
              <p className="text-slate-500 text-sm font-medium line-clamp-1">{user?.email || 'Sign in to book'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-red-500 transition-colors"
            >
              <CalendarDays className="w-5 h-5" />
              My Trips
            </button>

            <button
              onClick={() => handleNavigation('/favourites')}
              className="w-full flex items-center gap-4 px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-red-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              My Favourites
            </button>

            <button
              onClick={() => {
                setIsEditingProfile((current) => !current);
                setFeedback({ type: '', message: '' });
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 font-medium rounded-xl transition-colors ${
                isEditingProfile
                  ? 'bg-red-50 text-red-500'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-red-500'
              }`}
            >
              <Settings className="w-5 h-5" />
              Edit Profile
            </button>
          </div>

          <div className="px-4 pt-5">
            <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Profile settings</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Account details</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Update the basic profile fields used by your booking account.
              </p>

              {feedback.message && (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
                    feedback.type === 'error'
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, name: event.target.value }))
                    }
                    disabled={!isEditingProfile || isSavingProfile}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-300 disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Date of birth</span>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, dateOfBirth: event.target.value }))
                    }
                    disabled={!isEditingProfile || isSavingProfile}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-300 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Gender</span>
                  <select
                    value={profileForm.gender}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, gender: event.target.value }))
                    }
                    disabled={!isEditingProfile || isSavingProfile}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-300 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={!isEditingProfile || isSavingProfile}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-white bg-slate-900 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSavingProfile ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Saving profile
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 font-bold bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
