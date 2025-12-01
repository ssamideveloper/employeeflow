
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { UserRole, LeaveRequest } from '../types';
import { CheckCircle, XCircle, Clock, Calendar, FileText, Plus, Filter } from 'lucide-react';
import dayjs from 'dayjs';

const Leaves = () => {
  const { currentUser, leaves, users, addLeaveRequest, updateLeaveStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<'REQUEST' | 'HISTORY' | 'MANAGE'>('REQUEST');
  
  // Form State
  const [leaveType, setLeaveType] = useState<'Vacation' | 'Sick' | 'WFH'>('Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === 'ADMINISTRATOR';

  // Shared Input Styles
  const inputClasses = "w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-dark-600";
  const selectClasses = "w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 appearance-none shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-dark-600";

  // Determine default tab based on role
  React.useEffect(() => {
    if (isAdmin && activeTab === 'REQUEST') {
      setActiveTab('MANAGE');
    }
  }, [isAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !startDate || !endDate || !reason) return;

    addLeaveRequest({
      userId: currentUser.id,
      type: leaveType,
      startDate,
      endDate,
      reason
    });

    // Reset form
    setStartDate('');
    setEndDate('');
    setReason('');
    setActiveTab('HISTORY'); // Switch to history view
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const myLeaves = leaves.filter(l => l.userId === currentUser?.id).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const allLeaves = leaves.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Calendar className="text-primary-600" /> Leave Management
        </h2>
        
        <div className="flex bg-white dark:bg-dark-900 rounded-lg p-1 border border-gray-200 dark:border-dark-800 shadow-sm">
           {!isAdmin && (
             <>
               <button 
                 onClick={() => setActiveTab('REQUEST')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'REQUEST' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
               >
                 New Request
               </button>
               <button 
                 onClick={() => setActiveTab('HISTORY')}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'HISTORY' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
               >
                 My History
               </button>
             </>
           )}
           {isAdmin && (
             <button 
                onClick={() => setActiveTab('MANAGE')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'MANAGE' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
             >
                Manage Requests
                {pendingLeaves.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingLeaves.length}</span>}
             </button>
           )}
        </div>
      </div>

      {/* --- EMPLOYEE: SUBMIT REQUEST --- */}
      {activeTab === 'REQUEST' && !isAdmin && (
        <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
            <Plus size={20} className="text-primary-600"/> Submit Leave Request
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Leave Type</label>
                <div className="relative">
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className={selectClasses}
                  >
                    <option value="Vacation">Vacation</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="WFH">Work From Home</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">End Date</label>
                <input 
                  type="date" 
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Reason</label>
              <textarea 
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a brief reason for your request..."
                className={inputClasses}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-dark-800 flex justify-end">
               <button 
                 type="submit"
                 className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2"
               >
                 <FileText size={18} /> Submit Request
               </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EMPLOYEE: MY HISTORY --- */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                   {myLeaves.length > 0 ? myLeaves.map(leave => (
                     <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{leave.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {dayjs(leave.startDate).format('MMM D')} - {dayjs(leave.endDate).format('MMM D, YYYY')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{leave.reason}</td>
                        <td className="px-6 py-4 text-right">
                           <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(leave.status)}`}>
                             {leave.status}
                           </span>
                        </td>
                     </tr>
                   )) : (
                     <tr><td colSpan={4} className="p-8 text-center text-gray-500">No leave requests found.</td></tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* --- ADMIN: MANAGE REQUESTS --- */}
      {activeTab === 'MANAGE' && isAdmin && (
        <div className="space-y-8">
           {/* Pending Requests */}
           <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-gray-100 dark:border-dark-800 bg-orange-50/50 dark:bg-orange-900/10 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Clock size={18} className="text-orange-500"/> Pending Requests
                  </h3>
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full dark:bg-orange-900/30 dark:text-orange-400">Action Required</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-dark-800">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                       {pendingLeaves.length > 0 ? pendingLeaves.map(leave => {
                         const user = users.find(u => u.id === leave.userId);
                         return (
                           <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   {user && <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />}
                                   <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.username || 'Unknown'}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{leave.type}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {dayjs(leave.startDate).format('MMM D')} - {dayjs(leave.endDate).format('MMM D')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{leave.reason}</td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => updateLeaveStatus(leave.id, 'APPROVED')}
                                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors" title="Approve"
                                    >
                                       <CheckCircle size={20} />
                                    </button>
                                    <button 
                                      onClick={() => updateLeaveStatus(leave.id, 'REJECTED')}
                                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Reject"
                                    >
                                       <XCircle size={20} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                         );
                       }) : (
                         <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending requests.</td></tr>
                       )}
                    </tbody>
                 </table>
               </div>
           </div>

           {/* History Log */}
           <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-gray-100 dark:border-dark-800">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200">Request History</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-dark-800">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                       {allLeaves.filter(l => l.status !== 'PENDING').map(leave => {
                         const user = users.find(u => u.id === leave.userId);
                         return (
                           <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   {user && <img src={user.avatar} className="w-6 h-6 rounded-full" alt="" />}
                                   <span className="text-sm text-gray-600 dark:text-gray-300">{user?.username}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{leave.type}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {dayjs(leave.startDate).format('MMM D')} - {dayjs(leave.endDate).format('MMM D')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getStatusColor(leave.status)}`}>
                                   {leave.status}
                                 </span>
                              </td>
                           </tr>
                         );
                       })}
                    </tbody>
                 </table>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
