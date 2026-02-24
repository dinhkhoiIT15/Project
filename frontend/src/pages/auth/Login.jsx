import React, { useState } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { LogIn } from 'lucide-react';

const Login = ({ onLoginSuccess, switchToRegister }) => {
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
      
      // Lưu thông tin vào local storage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('username', response.data.user.username); 
      
      // Kích hoạt hàm xử lý thành công được truyền từ Navbar
      if (onLoginSuccess) {
        onLoginSuccess(response.data.user.role);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Login failed. Please check your credentials!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-3">
          <LogIn size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">Please sign in to your account</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1">
        <Input label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter username" required />
        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required />
        
        <div className="mt-6">
          <Button type="submit" fullWidth isLoading={loading}>Sign In</Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-4 pb-2">
        Don't have an account?{' '}
        <button onClick={switchToRegister} type="button" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
          Sign up now
        </button>
      </div>
    </div>
  );
};

export default Login;