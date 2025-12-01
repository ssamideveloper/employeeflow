
import React, { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Download, Calendar, Camera, Upload, Phone, MapPin, Save, Edit2, X } from 'lucide-react';
import dayjs from 'dayjs';

const Profile = () => {
  const { currentUser, exportData, updateUser, leaves } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');
  
  // Editable State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      phone: '',
      address: ''
  });

  useEffect(() => {
      if (currentUser) {
          setFormData({
              phone: currentUser.phone || '',
              address: currentUser.address || ''
          });
      }
  }, [currentUser]);

  const handleSaveContactInfo = () => {
      if (currentUser) {
          updateUser(currentUser.id, {
              phone: formData.phone,
              address: formData.address
          });
          setIsEditing(false);
      }
  };

  // Helper to resize image to avoid LocalStorage limits
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // Resize to max 200x200
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
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress quality
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      if (file.size > 5000000) { // 5MB limit
        setUploadError("File is too large. Please upload an image under 5MB.");
        return;
      }
      try {
        const base64Image = await processImage(file);
        updateUser(currentUser.id, { avatar: base64Image });
        setUploadError('');
      } catch (err) {
        setUploadError("Failed to process image.");
      }
    }
  };

  if (!currentUser) return null;

  const myLeaves = leaves.filter(l => l.userId === currentUser.id).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const inputClasses = "w-full px-3 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm p-8 text-center col-span-1">
             <div className="relative inline-block group">
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 dark:border-dark-800 mx-auto shadow-md" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 shadow-lg border-2 border-white dark:border-dark-900 transition-transform hover:scale-105"
                  title="Upload Picture"
                >
                   <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
             </div>
             {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
             <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">{currentUser.username}</h1>
             <p className="text-gray-500 text-sm mb-3">{currentUser.email}</p>
             <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full">
                 {currentUser.role}
             </span>
          </div>

          <div className="md:col-span-2 space-y-6">
             {/* Contact Info Section */}
             <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm p-6">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Contact Information</h3>
                     {!isEditing ? (
                         <button 
                            onClick={() => setIsEditing(true)} 
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded transition-colors"
                         >
                             <Edit2 size={16} />
                         </button>
                     ) : (
                         <div className="flex gap-2">
                             <button onClick={() => setIsEditing(false)} className="p-1.5 text-gray-400 hover:text-red-500"><X size={18} /></button>
                             <button onClick={handleSaveContactInfo} className="p-1.5 text-green-600 hover:text-green-700"><Save size={18} /></button>
                         </div>
                     )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Phone size={12}/> Phone Number</label>
                         {isEditing ? (
                             <input 
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                className={inputClasses}
                                placeholder="Enter phone number"
                             />
                         ) : (
                             <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.phone || 'Not set'}</p>
                         )}
                     </div>
                     <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><MapPin size={12}/> Address</label>
                         {isEditing ? (
                             <input 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                className={inputClasses}
                                placeholder="Enter address"
                             />
                         ) : (
                             <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.address || 'Not set'}</p>
                         )}
                     </div>
                 </div>
             </div>

             <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Calendar size={20} className="text-primary-600"/> Leave History
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-800">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date Range</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                            {myLeaves.slice(0, 5).map(leave => (
                                <tr key={leave.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{leave.type}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{dayjs(leave.startDate).format('MMM D')} - {dayjs(leave.endDate).format('MMM D, YYYY')}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getStatusColor(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {myLeaves.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-sm text-gray-500">No leave history.</td></tr>}
                        </tbody>
                    </table>
                </div>
             </div>

             <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm p-6">
                 <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Data Management</h3>
                 <p className="text-sm text-gray-500 mb-4">Download a full backup of the company data (LocalStorage dump).</p>
                 <button 
                   onClick={exportData}
                   className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                 >
                   <Download size={18} /> Export Data JSON
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;
