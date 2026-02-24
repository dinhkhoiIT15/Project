import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { UserCircle, Lock, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  
  // States cho tab Profile
  const [profileData, setProfileData] = useState({ username: '', phone_number: '', address: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // States cho tab Password
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfileData({
        username: res.data.user.username,
        phone_number: res.data.user.phone_number || '',
        address: res.data.user.address || ''
      });
    } catch (err) {
      console.error("Fetch profile error", err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await api.put('/user/profile', {
        phone_number: profileData.phone_number,
        address: profileData.address
      });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setProfileMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setProfileMsg({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ text: 'New passwords do not match!', type: 'error' });
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put('/user/change-password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to change password.', type: 'error' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
          <UserCircle className="mr-3 text-primary-600" size={32} /> Account Settings
        </h1>

        <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar Menu bên trong Profile */}
          <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <UserCircle className="w-5 h-5 mr-3" /> Profile Info
              </button>
              <button 
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'password' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Lock className="w-5 h-5 mr-3" /> Security
              </button>
            </nav>
          </div>

          {/* Khu vực Form Nội dung */}
          <div className="flex-1 p-8">
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Information</h2>
                {profileMsg.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profileMsg.type === 'success' ? <CheckCircle className="mr-2" /> : null} {profileMsg.text}
                  </div>
                )}
                <form onSubmit={handleProfileUpdate}>
                  <Input label="Username (Read-only)" value={profileData.username} disabled className="opacity-60 bg-gray-100" />
                  <Input label="Phone Number" value={profileData.phone_number} onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})} placeholder="Enter phone number" />
                  <Input label="Delivery Address" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} placeholder="Enter default delivery address" />
                  <div className="mt-8">
                    <Button type="submit" isLoading={loadingProfile} className="flex items-center">
                      <Save className="w-5 h-5 mr-2" /> Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h2>
                {passwordMsg.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {passwordMsg.type === 'success' ? <CheckCircle className="mr-2" /> : null} {passwordMsg.text}
                  </div>
                )}
                <form onSubmit={handlePasswordChange}>
                  <Input label="Current Password" type="password" value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} required />
                  <Input label="New Password" type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} required />
                  <Input label="Confirm New Password" type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} required />
                  <div className="mt-8">
                    <Button type="submit" isLoading={loadingPassword} className="flex items-center">
                      <Lock className="w-5 h-5 mr-2" /> Update Password
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;