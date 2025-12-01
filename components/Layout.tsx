
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store';
import { UserRole, TaskStatus } from '../types';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate, matchPath } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CheckSquare, MessageSquare, 
  Settings, LogOut, Sun, Moon, Bell, Menu, FileText, UserCircle, CheckCircle, List, Trash2, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages imports
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import EmployeeDetail from '../pages/EmployeeDetail';
import Kanban from '../pages/Kanban';
import Chat from '../pages/Chat';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import AuditLogs from '../pages/AuditLogs';
import Leaves from '../pages/Leaves';
import Attendance from '../pages/Attendance'; // Fixed relative import
import AIAssistant from './AIAssistant';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface LayoutProps {
  children?: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, active, badgeCount }: any) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 relative ${active ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {badgeCount > 0 && (
      <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badgeCount}
      </span>
    )}
  </Link>
);

const NotificationCenter = () => {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleNotificationClick = (notif: any) => {
      markNotificationRead(notif.id);
      if(notif.link) {
          navigate(notif.link);
          setIsOpen(false);
      }
  };

  return (
    <div className="relative" ref={wrapperRef}>
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 dark:text-gray-400 relative transition-colors"
       >
         <Bell size={20} />
         {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-900 animate-pulse"></span>}
       </button>

       <AnimatePresence>
         {isOpen && (
            <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-900 rounded-xl shadow-2xl border border-gray-100 dark:border-dark-800 z-50 overflow-hidden"
            >
               <div className="p-4 border-b border-gray-100 dark:border-dark-800 flex justify-between items-center bg-gray-50 dark:bg-dark-800/50">
                   <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                   {unreadCount > 0 && (
                       <button onClick={markAllNotificationsRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                           Mark all read
                       </button>
                   )}
               </div>
               <div className="max-h-[400px] overflow-y-auto">
                   {myNotifications.length === 0 ? (
                       <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
                   ) : (
                       myNotifications.map(notif => (
                           <div 
                              key={notif.id} 
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-4 border-b border-gray-50 dark:border-dark-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                           >
                               <div className="flex justify-between items-start gap-2">
                                   <div className="flex-1">
                                       <h4 className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
                                           {notif.title}
                                       </h4>
                                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                                       <p className="text-[10px] text-gray-400 mt-2">{dayjs(notif.timestamp).fromNow()}</p>
                                   </div>
                                   {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5"></div>}
                               </div>
                           </div>
                       ))
                   )}
               </div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

const ForcePasswordChangeModal = () => {
    const { changePassword, logout } = useAppStore();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 4) {
            setError("Password must be at least 4 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        changePassword(newPassword);
    };

    const inputClasses = "w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm";

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-dark-800">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security Update Required</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        For your security, you must change your auto-generated password before continuing.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">New Password</label>
                        <input 
                            type="password" 
                            className={inputClasses} 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Confirm Password</label>
                        <input 
                            type="password" 
                            className={inputClasses} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm new password"
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs text-center bg-red-50 dark:bg-red-900/10 p-2 rounded">{error}</p>}

                    <button 
                        type="submit" 
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-primary-500/30 transition-all mt-2"
                    >
                        Update Password & Continue
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={logout}
                        className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-medium py-2"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

const ProtectedLayout = () => {
  const { currentUser, logout, darkMode, toggleDarkMode, updatePresence, checkInactiveUsers, cleanupOldData, messages, users } = useAppStore();
  const location = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState<{ pageContext: string, selectedEmployee?: any }>({ pageContext: 'DASHBOARD' });
  
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.ADMINISTRATOR;

  // Calculate unread messages for badge
  const unreadMessagesCount = messages.filter(m => {
     if (m.senderId === currentUser?.id) return false; 
     if (m.receiverId === 'GLOBAL') {
         return !m.readBy.includes(currentUser?.id || '');
     }
     return m.receiverId === currentUser?.id && !m.readBy.includes(currentUser?.id);
  }).length;

  useEffect(() => {
    if (!currentUser) return;
    cleanupOldData();
    updatePresence();
    const heartbeatInterval = setInterval(updatePresence, 30000);
    const presenceCheckInterval = setInterval(checkInactiveUsers, 60000);
    const handleStorageChange = (e: StorageEvent) => {
       if (e.key === 'employee-flow-storage') {
           useAppStore.persist.rehydrate();
       }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(presenceCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, cleanupOldData, updatePresence, checkInactiveUsers]);

  // Update AI Context based on Route
  useEffect(() => {
      const matchProfile = matchPath('/employees/:id', location.pathname);
      
      if (matchProfile && matchProfile.params.id) {
          const emp = users.find(u => u.id === matchProfile.params.id);
          setAiContext({ pageContext: 'EMPLOYEE_PROFILE', selectedEmployee: emp });
      } else if (location.pathname === '/') {
          setAiContext({ pageContext: 'DASHBOARD' });
      } else {
          setAiContext({ pageContext: location.pathname.toUpperCase() });
      }
  }, [location.pathname, users]);

  if (!currentUser) return <Navigate to="/login" />;

  if (currentUser.needsPasswordChange) {
      return <ForcePasswordChangeModal />;
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <aside className="w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 flex flex-col hidden md:flex z-10 relative">
        <div className="p-6 border-b border-gray-100 dark:border-dark-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">EF</div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">EmployeeFlow</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</p>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/tasks" icon={CheckSquare} label="Tasks Board" active={location.pathname === '/tasks'} />
          <SidebarItem to="/chat" icon={MessageSquare} label="Messages" active={location.pathname === '/chat'} badgeCount={unreadMessagesCount} />
          <SidebarItem to="/leaves" icon={FileText} label="Leave Requests" active={location.pathname === '/leaves'} />
          <SidebarItem to="/attendance" icon={CheckCircle} label="Attendance" active={location.pathname === '/attendance'} />

          {isAdmin && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-4 px-4">Admin</p>
              <SidebarItem to="/employees" icon={Users} label="Employees" active={location.pathname === '/employees' || location.pathname.startsWith('/employees/')} />
              <SidebarItem to="/logs" icon={List} label="Audit Logs" active={location.pathname === '/logs'} />
            </>
          )}

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-4 px-4">Settings</p>
          <SidebarItem to="/profile" icon={UserCircle} label="My Profile" active={location.pathname === '/profile'} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-dark-800">
           <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-dark-950 transition-colors relative">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
               {location.pathname === '/' ? 'Overview' : location.pathname.startsWith('/employees/') ? 'Employee Profile' : location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.slice(2)}
             </h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <NotificationCenter />

            <div className="h-8 w-px bg-gray-200 dark:bg-dark-800 mx-1"></div>

            <div className="flex items-center gap-3">
              <img src={currentUser.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-dark-700" />
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-900 dark:text-white">{currentUser.username}</p>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{currentUser.role === UserRole.ADMIN ? 'Owner' : currentUser.role === UserRole.ADMINISTRATOR ? 'Admin' : 'Employee'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
               <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<Kanban />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaves" element={<Leaves />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/employees" element={isAdmin ? <Employees /> : <Navigate to="/" />} />
                <Route path="/employees/:id" element={isAdmin ? <EmployeeDetail /> : <Navigate to="/" />} />
                <Route path="/logs" element={isAdmin ? <AuditLogs /> : <Navigate to="/" />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsAiOpen(true)}
          className="absolute bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-20 flex items-center gap-2 group"
        >
          <span className="text-xl">✨</span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">Ask AI</span>
        </button>

        <AIAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} contextData={aiContext} />

      </main>
    </div>
  );
};

const Layout = () => {
  const { darkMode } = useAppStore();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </HashRouter>
  );
};

export default Layout;
