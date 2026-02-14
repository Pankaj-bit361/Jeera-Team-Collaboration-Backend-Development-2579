import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const inviteCodeParam = searchParams.get('code');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    orgName: '',
    inviteCode: inviteCodeParam || '',
  });
  const [mode, setMode] = useState(inviteCodeParam ? 'join' : 'create'); // 'create' or 'join'
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Clean up payload based on mode
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    if (mode === 'create') {
      payload.orgName = formData.orgName;
    } else {
      payload.inviteCode = formData.inviteCode;
    }

    const success = await signup(payload);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <SafeIcon name="UserPlus" className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            New Organization
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'join' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Join with Code
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {mode === 'create' && (
            <div className="pt-2 border-t border-gray-100 mt-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiIcons.FiBriefcase} className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="orgName"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Acme Corp"
                  value={formData.orgName}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiIcons.FiKey} className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="inviteCode"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase tracking-widest"
                  placeholder="ABCD123"
                  value={formData.inviteCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full mt-4" loading={loading}>
            {mode === 'create' ? 'Create Account & Org' : 'Join Organization'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;