
import React, { useState, useRef } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { UserRole, EmployeeDocument } from '../types';
import { Mail, Phone, MapPin, Briefcase, Calendar, Download, Trash2, Plus, Upload, Clock, FileText, CheckCircle, AlertTriangle, TrendingUp, Activity, Printer } from 'lucide-react';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, tasks, logs, attendance, addDocument, removeDocument, currentUser, updateUser, columns } = useAppStore();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const employee = users.find(u => u.id === id);
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.ADMINISTRATOR;

  if (!employee) return <Navigate to="/employees" />;

  // Derived Data
  const lastColumnId = columns.length > 0 ? columns[columns.length - 1].id : '';
  const empTasks = tasks.filter(t => t.assigneeId === employee.id);
  const completedTasks = empTasks.filter(t => t.status === lastColumnId).length;
  const pendingTasks = empTasks.filter(t => t.status !== lastColumnId).length;
  const completionRate = empTasks.length > 0 ? Math.round((completedTasks / empTasks.length) * 100) : 0;
  
  const empLogs = logs.filter(l => l.userId === employee.id).slice(0, 20);
  const empAttendance = attendance.filter(a => a.userId === employee.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Chart Data
  const performanceData = [
      { name: 'Tasks', completed: completedTasks, pending: pendingTasks }
  ];

  const attendanceChartData = empAttendance.slice(0, 7).reverse().map(a => ({
      date: dayjs(a.date).format('ddd'),
      hours: a.checkOut ? dayjs(a.checkOut).diff(dayjs(a.checkIn), 'hour', true) : 0
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
             const base64 = ev.target?.result as string;
             addDocument(employee.id, {
                 name: file.name,
                 type: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
                 url: base64
             });
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-sm font-medium ${activeTab === id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
      >
          <Icon size={16} /> {label}
      </button>
  );

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
        {/* Header Section */}
        <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
            <div className="relative flex flex-col md:flex-row items-end gap-6 pt-12 px-4">
                <img 
                    src={employee.avatar} 
                    alt={employee.username} 
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-900 shadow-lg object-cover bg-white"
                />
                <div className="flex-1 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {employee.username}
                        <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold tracking-wide uppercase border border-blue-200 dark:border-blue-800">
                            {employee.role}
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1"><Briefcase size={14}/> {employee.jobTitle || 'No Title'}</span>
                        <span className="flex items-center gap-1"><MapPin size={14}/> {employee.address || 'No Address'}</span>
                        <span className="flex items-center gap-1"><Calendar size={14}/> Joined {dayjs(employee.joinedAt).format('MMM YYYY')}</span>
                    </p>
                </div>
                <div className="flex gap-3 mb-2">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                        <Printer size={16}/> Print Profile
                    </button>
                    <button onClick={() => navigate('/employees')} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                        Back to List
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Contact & Stats */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Contact Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600"><Mail size={16}/></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Email</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{employee.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600"><Phone size={16}/></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Phone</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600"><Briefcase size={16}/></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Department</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.department || 'General'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Performance Snapshot</h3>
                    <div className="h-48">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} layout="vertical" barSize={20}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="completed" fill="#22c55e" radius={[0, 4, 4, 0]} name="Completed" stackId="a" />
                                <Bar dataKey="pending" fill="#f97316" radius={[0, 4, 4, 0]} name="Pending" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                            <p className="text-xs text-gray-500">Success Rate</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-500">{pendingTasks}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Column: Tabs */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="flex border-b border-gray-200 dark:border-dark-800 px-2 overflow-x-auto">
                        <TabButton id="OVERVIEW" label="Overview" icon={Activity} />
                        <TabButton id="ATTENDANCE" label="Attendance" icon={Clock} />
                        <TabButton id="DOCUMENTS" label="Documents" icon={FileText} />
                        <TabButton id="ACTIVITY" label="Activity Log" icon={TrendingUp} />
                    </div>

                    <div className="p-6">
                        {activeTab === 'OVERVIEW' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">About</h3>
                                <div className="p-4 bg-gray-50 dark:bg-dark-800/50 rounded-xl border border-gray-100 dark:border-dark-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {employee.username} works as a {employee.jobTitle} in the {employee.department} department. 
                                        Current status is <span className={employee.isOnline ? "text-green-600 font-bold" : "text-gray-500 font-bold"}>{employee.isOnline ? "Online" : "Offline"}</span>.
                                    </p>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Recent Work</h3>
                                <div className="space-y-3">
                                    {empTasks.slice(0, 5).map(task => (
                                        <div key={task.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${task.status === lastColumnId ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                                                    <p className="text-xs text-gray-500">{dayjs(task.updatedAt).fromNow()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-dark-700 rounded text-gray-600 dark:text-gray-300">
                                                {columns.find(c => c.id === task.status)?.title || 'Unknown'}
                                            </span>
                                        </div>
                                    ))}
                                    {empTasks.length === 0 && <p className="text-gray-500 text-sm">No tasks assigned.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'ATTENDANCE' && (
                            <div className="space-y-6">
                                <div className="h-64">
                                     <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">Weekly Hours</h4>
                                     <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={attendanceChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                                            <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-dark-800">
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check In</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Check Out</th>
                                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                                            {empAttendance.map(record => (
                                                <tr key={record.id}>
                                                    <td className="px-4 py-3 text-sm">{dayjs(record.date).format('MMM D, YYYY')}</td>
                                                    <td className="px-4 py-3 text-sm text-green-600 font-mono">{dayjs(record.checkIn).format('HH:mm')}</td>
                                                    <td className="px-4 py-3 text-sm text-red-500 font-mono">{record.checkOut ? dayjs(record.checkOut).format('HH:mm') : '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-700 dark:text-gray-300">
                                                        {record.checkOut ? dayjs(record.checkOut).diff(dayjs(record.checkIn), 'hour', true).toFixed(1) + 'h' : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {empAttendance.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No attendance records.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'DOCUMENTS' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 dark:text-white">Employee Documents</h3>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-primary-700 transition-colors"
                                        >
                                            <Upload size={14} /> Upload New
                                        </button>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {employee.documents?.map(doc => (
                                        <div key={doc.id} className="p-4 border border-gray-200 dark:border-dark-700 rounded-xl flex items-start gap-4 hover:shadow-md transition-shadow group relative">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
                                                {doc.type === 'PDF' ? <FileText size={20}/> : <Download size={20}/>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{doc.name}</p>
                                                <p className="text-xs text-gray-500">{dayjs(doc.uploadedAt).format('MMM D, YYYY')}</p>
                                                <a href={doc.url} download={doc.name} className="text-xs text-blue-600 hover:underline mt-1 inline-block">Download</a>
                                            </div>
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => { if(confirm('Delete document?')) removeDocument(employee.id, doc.id); }}
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {(!employee.documents || employee.documents.length === 0) && (
                                        <div className="col-span-full py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-dark-700 rounded-xl">
                                            <p>No documents uploaded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'ACTIVITY' && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-4">Activity Timeline</h3>
                                <div className="relative border-l-2 border-gray-100 dark:border-dark-800 ml-3 space-y-6">
                                    {empLogs.map(log => (
                                        <div key={log.id} className="relative pl-6">
                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-dark-700 border-2 border-white dark:border-dark-900"></div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">{log.action}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{dayjs(log.timestamp).format('MMM D, HH:mm')}</p>
                                        </div>
                                    ))}
                                    {empLogs.length === 0 && <p className="pl-6 text-sm text-gray-500">No recent activity recorded.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EmployeeDetail;
