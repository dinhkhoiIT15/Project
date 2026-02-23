import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    phone_number: '', 
    address: '', 
    password: '', 
    confirmPassword: '' 
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
      // Gửi đầy đủ dữ liệu khớp với models.py
      await api.post('/register', {
        username: formData.username,
        phone_number: formData.phone_number,
        address: formData.address,
        password: formData.password
      });
      
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Registration failed. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-xl border border-primary-100 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join us to start shopping</p>
        </div>

        {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{errorMsg}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <Input label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
          <Input label="Phone Number" type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Enter your phone number" required />
          <Input label="Address" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Enter your delivery address" required />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required />
          <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
          
          <div className="mt-6">
            <Button type="submit" fullWidth isLoading={loading}>Sign Up</Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;