import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../utils/api';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Team Member',
    company_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (data: typeof formData) => {
    try {
      const response = await register(data);
      const { user, token } = response.data.data;
      setUser(user, token);
      toast.success('Registration successful!');
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Your Account</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <AuthForm
          formType="register"
          initialData={formData}
          onSubmit={handleSubmit}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;