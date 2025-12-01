
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { UserRole, AttendanceStatus } from '../types';
import { Clock, Calendar, CheckCircle, XCircle, User as UserIcon, LogIn, LogOut, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Attendance = () => {
    const { currentUser, attendance, users, clockIn, clockOut } = useAppStore();
    const [viewMode, setViewMode] = useState<'DAILY' | 'MONTHLY'>('DAILY');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    
    const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.ADMINISTRATOR;

    // Derived Data
    const today = dayjs().format('YYYY-MM-DD');
    const myTodayRecord = attendance.find(a => a.userId === currentUser?.id && a.date === today);
    const isClockedIn = !!myTodayRecord && !myTodayRecord.checkOut;
    const isClockedOut = !!myTodayRecord && !!myTodayRecord.checkOut;

    // Admin Data
    const dailyRecords = attendance.filter(a => a.date === selectedDate);
    const presentCount = dailyRecords.length;
    const absentCount = users.length - presentCount;

    // Monthly Data (Mock aggregation for chart)
    const monthlyData = Array.from({ length: 7 }, (_, i) => {
        const date = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD');
        const count = attendance.filter(a => a.date === date).length;
        return { date: dayjs(date).format('ddd'), present: count };
    });

    const handleClockAction = () => {
        if (!currentUser) return;
        if (isClockedIn) {
            clockOut(currentUser.id);
        } else if (!myTodayRecord) {
            clockIn(currentUser.id);
        }
    };

    const inputClasses = "w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-dark-600";

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Clock className="text-primary-600" /> Attendance Tracker
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Employee Clock-In Card */}
                <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-dark-700 shadow-inner relative">
                        <Clock size={40} className="text-primary-600" />
                        {isClockedIn && <span className="absolute top-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {dayjs().format('h:mm A')}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">{dayjs().format('dddd, MMMM D, YYYY')}</p>
                    
                    {isClockedOut ? (
                        <div className="bg-gray-100 dark:bg-dark-800 text-gray-500 px-6 py-3 rounded-lg font-bold w-full">
                            Shift Completed
                        </div>
                    ) : (
                        <button
                            onClick={handleClockAction}
                            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                                isClockedIn 
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                                : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
                            }`}
                        >
                            {isClockedIn ? <><LogOut size={20}/> Clock Out</> : <><LogIn size={20}/> Clock In</>}
                        </button>
                    )}

                    <div className="mt-6 w-full space-y-3">
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Check In</span>
                             <span className="font-mono font-medium text-gray-900 dark:text-white">
                                 {myTodayRecord ? dayjs(myTodayRecord.checkIn).format('HH:mm') : '--:--'}
                             </span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Check Out</span>
                             <span className="font-mono font-medium text-gray-900 dark:text-white">
                                 {myTodayRecord?.checkOut ? dayjs(myTodayRecord.checkOut).format('HH:mm') : '--:--'}
                             </span>
                         </div>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="md:col-span-2 bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Today's Overview</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Present</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{presentCount}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700">
                            <p className="text-xs text-gray-500 font-bold uppercase">Absent/Not In</p>
                            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{absentCount}</p>
                        </div>
                    </div>
                    
                    <h4 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">Who's Working Now</h4>
                    <div className="flex flex-wrap gap-2">
                        {dailyRecords.filter(r => !r.checkOut).map(record => {
                            const user = users.find(u => u.id === record.userId);
                            if(!user) return null;
                            return (
                                <div key={user.id} className="flex items-center gap-2 pl-1 pr-3 py-1 bg-gray-50 dark:bg-dark-800 rounded-full border border-gray-200 dark:border-dark-700">
                                    <img src={user.avatar} className="w-6 h-6 rounded-full" alt={user.username} />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{user.username}</span>
                                </div>
                            );
                        })}
                        {dailyRecords.filter(r => !r.checkOut).length === 0 && (
                            <p className="text-sm text-gray-400 italic">No one currently clocked in.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Controls & Logs */}
            {isAdmin && (
                <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-dark-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2 bg-gray-100 dark:bg-dark-800 p-1 rounded-lg">
                            <button 
                                onClick={() => setViewMode('DAILY')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'DAILY' ? 'bg-white dark:bg-dark-700 shadow text-primary-600' : 'text-gray-500'}`}
                            >
                                Daily Log
                            </button>
                            <button 
                                onClick={() => setViewMode('MONTHLY')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'MONTHLY' ? 'bg-white dark:bg-dark-700 shadow text-primary-600' : 'text-gray-500'}`}
                            >
                                Trends
                            </button>
                        </div>
                        {viewMode === 'DAILY' && (
                             <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-1.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                             />
                        )}
                    </div>

                    <div className="p-0">
                        {viewMode === 'DAILY' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-dark-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Check In</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                                        {users.filter(u => u.role === UserRole.EMPLOYEE).map(user => {
                                            const record = dailyRecords.find(r => r.userId === user.id);
                                            return (
                                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                                                                <p className="text-xs text-gray-500">{user.department}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-mono text-green-600">
                                                        {record ? dayjs(record.checkIn).format('HH:mm') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-mono text-red-500">
                                                        {record?.checkOut ? dayjs(record.checkOut).format('HH:mm') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-right text-gray-700 dark:text-gray-300">
                                                        {record?.checkOut ? dayjs(record.checkOut).diff(dayjs(record.checkIn), 'hour', true).toFixed(1) + 'h' : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="h-80 p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                                        <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Employees Present" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
