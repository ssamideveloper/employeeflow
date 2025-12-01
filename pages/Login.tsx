
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, ArrowRight, Briefcase, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [error, setError] = useState('');
  const login = useAppStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password, role)) {
      navigate('/');
    } else {
      setError(`Invalid credentials for ${role} role.`);
    }
  };

  const getRoleLabel = () => {
    if (role === UserRole.ADMIN) return 'Owner/Admin';
    if (role === UserRole.ADMINISTRATOR) return 'Administrator';
    return 'Employee';
  };

  const inputClasses = "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-dark-600";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-dark-800"
      >
        <div className="bg-primary-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl text-white mb-4">
            <Shield size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">EmployeeFlow</h1>
          <p className="text-primary-100 text-sm">Enterprise Management System</p>
        </div>

        <div className="p-8">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Portal</label>
          <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setRole(UserRole.ADMIN)}
              className={`py-2 text-[10px] sm:text-xs font-bold rounded-md transition-all flex flex-col items-center gap-1 ${role === UserRole.ADMIN ? 'bg-white dark:bg-dark-700 shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              title="Owner/Admin"
            >
              <Shield size={14} /> Admin
            </button>
            <button
              onClick={() => setRole(UserRole.ADMINISTRATOR)}
              className={`py-2 text-[10px] sm:text-xs font-bold rounded-md transition-all flex flex-col items-center gap-1 ${role === UserRole.ADMINISTRATOR ? 'bg-white dark:bg-dark-700 shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              title="Administrator"
            >
              <Briefcase size={14} /> Administrator
            </button>
            <button
              onClick={() => setRole(UserRole.EMPLOYEE)}
              className={`py-2 text-[10px] sm:text-xs font-bold rounded-md transition-all flex flex-col items-center gap-1 ${role === UserRole.EMPLOYEE ? 'bg-white dark:bg-dark-700 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              title="Employee"
            >
              <User size={14} /> Employee
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username ({getRoleLabel()})</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClasses}
                  placeholder={`Enter ${role.toLowerCase()} username`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs text-center bg-red-50 dark:bg-red-900/10 p-2 rounded">{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
            <p>Default Credentials:</p>
            <p>Admin: <strong>admin</strong> / <strong>admin</strong></p>
            <p>Administrator: <strong>manager</strong> / <strong>manager</strong></p>
            <p>Employee: <strong>john_doe</strong> / <strong>123</strong></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
