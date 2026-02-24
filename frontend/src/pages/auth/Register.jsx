import React, { useState } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { UserPlus } from 'lucide-react';

const Register = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({ 
    username: '', phone_number: '', address: '', password: '', confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      await api.post('/register', {
        username: formData.username,
        phone_number: formData.phone_number,
        address: formData.address,
        password: formData.password
      });
      
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        if (switchToLogin) switchToLogin();
      }, 1500);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Registration failed. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-y-auto px-1 custom-scrollbar pb-4">
      <div className="text-center mb-6 shrink-0">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-3">
          <UserPlus size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">Join us to start shopping</p>
      </div>

      {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="flex-1 shrink-0">
        <Input label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose username" required />
        <Input label="Phone Number" type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Enter phone number" required />
        <Input label="Address" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Delivery address" required />
        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create password" required />
        <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />
        
        <div className="mt-6 mb-4">
          <Button type="submit" fullWidth isLoading={loading}>Sign Up</Button>
        </div>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 border-t border-gray-100 pt-4 pb-2 shrink-0">
        Already have an account?{' '}
        <button onClick={switchToLogin} type="button" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
          Sign in here
        </button>
      </div>
    </div>
  );
};

export default Register;