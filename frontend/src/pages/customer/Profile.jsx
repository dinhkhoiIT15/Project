import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { User, Lock } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({ username: '', phone_number: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setProfileData({
          username: res.data.user.username,
          phone_number: res.data.user.phone_number || '',
          address: res.data.user.address || ''
        });
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/profile', { phone_number: profileData.phone_number, address: profileData.address });
      addToast('Profile updated!', 'success');
    } catch (err) { addToast('Error updating profile', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>Account Settings</Breadcrumbs.Item>
        </Breadcrumbs>

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          <div className="w-full md:w-64 space-y-1">
            <h3 className="px-3 text-xs font-bold text-[#6e7781] uppercase mb-2">User Settings</h3>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors ${activeTab === 'profile' ? 'bg-white border border-[#d0d7de] text-[#1f2328] border-l-4 border-l-[#0969da]' : 'text-[#6e7781] hover:bg-[#f6f8fa]'}`}><User className="w-4 h-4 mr-3" /> Public Profile</button>
            <button onClick={() => setActiveTab('password')} className={`w-full flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors ${activeTab === 'password' ? 'bg-white border border-[#d0d7de] text-[#1f2328] border-l-4 border-l-[#0969da]' : 'text-[#6e7781] hover:bg-[#f6f8fa]'}`}><Lock className="w-4 h-4 mr-3" /> Password & Security</button>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="border border-[#d0d7de] rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="bg-[#f6f8fa] p-4 border-b border-[#d0d7de]">
                <h2 className="font-bold text-[#1f2328]">{activeTab === 'profile' ? 'Public Profile' : 'Change Password'}</h2>
              </div>
              <div className="p-6">
                {activeTab === 'profile' ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <Input label="Username" value={profileData.username} disabled />
                    <Input label="Phone Number" value={profileData.phone_number} onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})} />
                    <Input label="Shipping Address" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} />
                    <Button type="submit" isLoading={loading}>Update Profile</Button>
                  </form>
                ) : (
                  <form className="space-y-4">
                     <Input label="Old Password" type="password" />
                     <Input label="New Password" type="password" />
                     <Button>Update Password</Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;