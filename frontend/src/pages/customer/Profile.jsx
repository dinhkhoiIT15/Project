import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UserCircle, Lock, Save } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({ username: '', phone_number: '', address: '' });
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setProfileData({ username: res.data.user.username, phone_number: res.data.user.phone_number || '', address: res.data.user.address || '' });
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/profile', { phone_number: profileData.phone_number, address: profileData.address });
      addToast('Profile info updated successfully!', 'success');
    } catch (err) { addToast('Failed to update profile.', 'error'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) { addToast('Passwords do not match!', 'error'); return; }
    setLoading(true);
    try {
      await api.put('/user/change-password', { old_password: passwordData.old_password, new_password: passwordData.new_password });
      addToast('Password changed successfully!', 'success');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) { addToast(err.response?.data?.message || 'Error changing password.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
        <h1 className="text-3xl font-black mb-8 flex items-center text-gray-800"><UserCircle className="mr-3 text-primary-600" size={32} /> My Account</h1>
        <div className="bg-surface rounded-2xl shadow-sm border overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-64 bg-gray-50 border-r p-6 space-y-2">
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'profile' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}><UserCircle className="mr-2" size={18} /> Profile Info</button>
            <button onClick={() => setActiveTab('password')} className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'password' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}><Lock className="mr-2" size={18} /> Security</button>
          </div>
          <div className="flex-1 p-10">
            {activeTab === 'profile' ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-2xl font-black text-gray-800 mb-6">Personal Information</h2>
                <Input label="Username" value={profileData.username} disabled />
                <Input label="Phone Number" value={profileData.phone_number} onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})} placeholder="090..." />
                <Input label="Address" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} placeholder="Shipping address..." />
                <Button type="submit" isLoading={loading} className="px-10 py-3 font-black"><Save className="mr-2" size={18} /> Save Changes</Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h2 className="text-2xl font-black text-gray-800 mb-6">Change Password</h2>
                <Input label="Current Password" type="password" value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} required />
                <Input label="New Password" type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} required />
                <Input label="Confirm New Password" type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} required />
                <Button type="submit" isLoading={loading} className="px-10 py-3 font-black"><Lock className="mr-2" size={18} /> Update Password</Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;