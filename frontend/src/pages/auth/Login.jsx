import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/login', formData);
      // Save token and role to local storage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.user.role);
      
      // Redirect based on role
      if (response.data.user.role === 'Admin') {
        navigate('/admin'); // Đã sửa: Chuyển thẳng tới trang Quản trị
      } else {
        navigate('/'); // Khách hàng bình thường về Trang chủ mua sắm
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed. Please check your credentials!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-xl border border-primary-100 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Please sign in to your account</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Username" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            placeholder="Enter your username" 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Enter your password" 
            required 
          />
          
          <div className="mt-6">
            <Button type="submit" fullWidth isLoading={loading}>Sign In</Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;