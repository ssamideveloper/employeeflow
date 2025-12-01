
import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { UserRole, TaskStatus } from '../types';
import { Trash2, UserPlus, Search, Clock, Eye, X, CheckCircle, Shield, Briefcase, User as UserIcon, Lock, Copy, Download, FileText, Printer, Upload, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Employees = () => {
  const { users, currentUser, addUser, removeUser, logs, tasks } = useAppStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = currentUser?.role === UserRole.ADMIN;
  const isAdministrator = currentUser?.role === UserRole.ADMINISTRATOR;

  const inputClasses = "w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-dark-600";

  // Filter Logic
  const filteredUsers = users.filter(u => {
      const matchesSearch = (u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const isNotMe = u.id !== currentUser?.id;
      
      if (isOwner) return matchesSearch && isNotMe;
      if (isAdministrator) return matchesSearch && isNotMe && u.role !== UserRole.ADMIN;
      return false; 
  });

  const generateStrongPassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await processImage(file);
          setAvatarPreview(base64);
      }
  };

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!avatarPreview) {
          alert("Please upload a profile picture for the employee.");
          return;
      }

      const roleToCreate = isOwner ? newRole : UserRole.EMPLOYEE;
      const autoPassword = generateStrongPassword();

      addUser({
          username: newUsername,
          email: newEmail,
          password: autoPassword,
          role: roleToCreate,
          department: newDept || 'General',
          avatar: avatarPreview,
          needsPasswordChange: true 
      });

      setCreatedUserCredentials({
          username: newUsername,
          email: newEmail,
          password: autoPassword,
          role: roleToCreate
      });

      setIsModalOpen(false);
      
      setNewUsername('');
      setNewEmail('');
      setNewDept('');
      setNewRole(UserRole.EMPLOYEE);
      setAvatarPreview('');
  };

  const handleDownloadCredentials = () => {
    if (!createdUserCredentials) return;
    
    const content = `
EMPLOYEEFLOW - NEW USER CREDENTIALS
===================================
Date Created: ${new Date().toLocaleString()}

First Name/Username: ${createdUserCredentials.username}
Email:               ${createdUserCredentials.email}
Password:            ${createdUserCredentials.password}
Role:                ${createdUserCredentials.role}

* IMPORTANT: Please change your password upon first login.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdUserCredentials.username}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLastAction = (userId: string) => {
      const userLog = logs.find(l => l.userId === userId);
      if (!userLog) return { action: 'No activity', time: '' };
      return { 
          action: userLog.action, 
          details: userLog.details,
          time: userLog.timestamp 
      };
  };

  const canRemove = (targetUser: any) => {
      if (isOwner) return true;
      if (isAdministrator && targetUser.role === UserRole.EMPLOYEE) return true;
      return false;
  };

  const confirmRemoveUser = () => {
      if (deleteConfirmation) {
          removeUser(deleteConfirmation);
          setDeleteConfirmation(null);
      }
  };

  const handleExportListCSV = () => {
      const headers = ['ID', 'Username', 'Email', 'Role', 'Department', 'Status', 'Last Active'];
      const rows = users.map(u => [
          u.id, u.username, u.email, u.role, u.department, u.isOnline ? 'Online' : 'Offline', u.lastActiveAt || 'Never'
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "employees_list.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${inputClasses}`}
              />
          </div>
          <div className="flex gap-2">
              <button 
                  onClick={handleExportListCSV}
                  className="bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-dark-600 px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-all font-medium text-sm"
              >
                  <FileText size={18} /> Export List
              </button>
              <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all font-medium text-sm"
              >
                  <UserPlus size={18} /> Add User
              </button>
          </div>
       </div>

       <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-dark-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Last Activity</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                        {filteredUsers.map(user => {
                            const lastAction = getLastAction(user.id);
                            return (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                                                {user.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-900 rounded-full"></span>}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                    {user.username}
                                                </div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === UserRole.ADMINISTRATOR ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                <Briefcase size={12} /> Administrator
                                            </span>
                                        ) : user.role === UserRole.ADMIN ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                <Shield size={12} /> Owner
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <UserIcon size={12} /> Employee
                                            </span>
                                        )}
                                        <div className="text-[10px] text-gray-400 mt-1 pl-1">{user.department}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isOnline ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                Online
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                                Offline
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-900 dark:text-gray-200 truncate max-w-[150px]">
                                                {lastAction.action === 'No activity' ? 'No recent activity' : lastAction.action}
                                            </span>
                                            {lastAction.time && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Clock size={12} /> {dayjs(lastAction.time).fromNow()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => navigate(`/employees/${user.id}`)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors"
                                            title="View Full Profile"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {canRemove(user) && (
                                            <button 
                                                onClick={() => setDeleteConfirmation(user.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                title="Remove User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
           </div>
           {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-500">No matching staff found.</div>}
       </div>

       {/* Add User Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-dark-800 animate-fade-in-up">
                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                       <UserPlus className="text-primary-600"/> Add New User
                   </h2>
                   <form onSubmit={handleAddUser} className="space-y-4">
                       
                       <div className="flex justify-center mb-4">
                           <div 
                               onClick={() => fileInputRef.current?.click()}
                               className="w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-800 border-2 border-dashed border-gray-300 dark:border-dark-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors overflow-hidden group relative"
                           >
                               {avatarPreview ? (
                                   <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                   <>
                                       <Upload size={20} className="text-gray-400 group-hover:text-primary-500" />
                                       <span className="text-[10px] text-gray-500 mt-1">Upload Photo</span>
                                   </>
                               )}
                               <input 
                                   type="file" 
                                   ref={fileInputRef} 
                                   onChange={handleAvatarSelect} 
                                   accept="image/*" 
                                   className="hidden" 
                               />
                           </div>
                       </div>

                       <div>
                           <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Username</label>
                           <input value={newUsername} onChange={e=>setNewUsername(e.target.value)} className={inputClasses} required placeholder="e.g. sarah_smith" />
                       </div>
                       <div>
                           <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Email</label>
                           <input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} className={inputClasses} required placeholder="sarah@company.com" />
                       </div>
                       <div>
                           <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Department</label>
                           <input value={newDept} onChange={e=>setNewDept(e.target.value)} className={inputClasses} placeholder="e.g. Sales" />
                       </div>
                       
                       {isOwner && (
                           <div>
                               <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Role</label>
                               <div className="grid grid-cols-2 gap-3">
                                   <div 
                                     onClick={() => setNewRole(UserRole.EMPLOYEE)}
                                     className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${newRole === UserRole.EMPLOYEE ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800'}`}
                                   >
                                       <UserIcon size={20} />
                                       <span className="text-xs font-bold">Employee</span>
                                   </div>
                                   <div 
                                     onClick={() => setNewRole(UserRole.ADMINISTRATOR)}
                                     className={`cursor-pointer p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${newRole === UserRole.ADMINISTRATOR ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800'}`}
                                   >
                                       <Briefcase size={20} />
                                       <span className="text-xs font-bold">Administrator</span>
                                   </div>
                               </div>
                           </div>
                       )}

                       <div className="flex gap-3 justify-end mt-6 pt-2 border-t border-gray-100 dark:border-dark-800">
                           <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors font-medium text-sm">Cancel</button>
                           <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md font-bold text-sm">Create & Generate Password</button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       {/* Delete Confirmation Modal */}
       {deleteConfirmation && (
           <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white dark:bg-dark-900 w-full max-w-sm rounded-xl p-6 shadow-2xl border border-gray-100 dark:border-dark-800 animate-fade-in-up text-center">
                   <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <AlertTriangle size={32} />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                       Are you sure you want to permanently delete this user? This action cannot be undone.
                   </p>
                   <div className="flex gap-3">
                       <button 
                           onClick={() => setDeleteConfirmation(null)}
                           className="flex-1 py-2.5 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
                       >
                           Cancel
                       </button>
                       <button 
                           onClick={confirmRemoveUser}
                           className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors shadow-md"
                       >
                           Delete
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* Credentials Generated Modal */}
       {createdUserCredentials && (
           <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-dark-800 animate-fade-in-up text-center">
                   <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CheckCircle size={32} />
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Created!</h2>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                       Please download or share these credentials securely.
                   </p>

                   <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-xl text-left space-y-3 mb-6 border border-gray-200 dark:border-dark-700">
                       <div>
                           <span className="text-xs font-bold text-gray-400 uppercase">Role</span>
                           <p className="font-semibold text-primary-600">{createdUserCredentials.role}</p>
                       </div>
                       <div>
                           <span className="text-xs font-bold text-gray-400 uppercase">Username</span>
                           <p className="font-medium">{createdUserCredentials.username}</p>
                       </div>
                       <div>
                           <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                           <p className="font-medium">{createdUserCredentials.email}</p>
                       </div>
                       <div className="pt-2 border-t border-gray-200 dark:border-dark-700">
                           <span className="text-xs font-bold text-gray-400 uppercase">Auto-Generated Password</span>
                           <div className="flex justify-between items-center bg-white dark:bg-dark-900 p-2 rounded-lg border border-gray-200 dark:border-dark-700 mt-1">
                               <p className="font-mono text-lg font-bold tracking-wide text-gray-800 dark:text-white">
                                   {createdUserCredentials.password}
                               </p>
                           </div>
                           <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
                               <Lock size={10} /> User will be forced to change this on first login.
                           </p>
                       </div>
                   </div>

                   <div className="flex gap-3">
                        <button 
                            onClick={handleDownloadCredentials}
                            className="flex-1 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Download size={16} /> Download
                        </button>
                        <button 
                            onClick={() => setCreatedUserCredentials(null)}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg text-sm"
                        >
                            Done
                        </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default Employees;
