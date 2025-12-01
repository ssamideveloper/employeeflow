
import React from 'react';
import { useAppStore } from '../store';
import { UserRole, TaskPriority } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle, AlertCircle, Calendar, Flag, Link as LinkIcon, Briefcase } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Dashboard = () => {
  const { currentUser, tasks, users, logs, leaves, columns } = useAppStore();
  const isEmployee = currentUser?.role === UserRole.EMPLOYEE;
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === 'ADMINISTRATOR';

  // Metrics based on Column Indices
  const firstColumnId = columns.length > 0 ? columns[0].id : '';
  const lastColumnId = columns.length > 0 ? columns[columns.length - 1].id : '';
  
  const myTasks = tasks.filter(t => isEmployee ? t.assigneeId === currentUser?.id : true);
  
  const todoCount = myTasks.filter(t => t.status === firstColumnId).length;
  const doneCount = myTasks.filter(t => t.status === lastColumnId).length;
  const processingCount = myTasks.filter(t => t.status !== firstColumnId && t.status !== lastColumnId).length;
  const totalTasks = myTasks.length;

  const chartData = [
    { name: columns.length > 0 ? columns[0].title : 'To Do', value: todoCount, color: '#94a3b8' },
    { name: 'In Progress', value: processingCount, color: '#3b82f6' },
    { name: columns.length > 0 ? columns[columns.length - 1].title : 'Done', value: doneCount, color: '#22c55e' },
  ];

  const priorityData = [
    { name: 'High', value: myTasks.filter(t => t.priority === TaskPriority.HIGH).length, color: '#ef4444' },
    { name: 'Medium', value: myTasks.filter(t => t.priority === TaskPriority.MEDIUM).length, color: '#f97316' },
    { name: 'Low', value: myTasks.filter(t => t.priority === TaskPriority.LOW).length, color: '#22c55e' },
  ];

  // Recent Completed Tasks (Tasks in the last column)
  const recentSubmissions = tasks
    .filter(t => t.status === lastColumnId && t.submissions && t.submissions.length > 0)
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    .slice(0, 5);

  // Leave Stats (Admin Only)
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;
  const approvedToday = leaves.filter(l => l.status === 'APPROVED' && dayjs(l.startDate).isSame(dayjs(), 'day')).length;
  const approvedThisWeek = leaves.filter(l => l.status === 'APPROVED' && dayjs(l.startDate).isAfter(dayjs().startOf('week'))).length;
  const approvedThisMonth = leaves.filter(l => l.status === 'APPROVED' && dayjs(l.startDate).isAfter(dayjs().startOf('month'))).length;

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-100 dark:border-dark-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={totalTasks} icon={Calendar} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
        <StatCard title={columns.length > 0 ? columns[0].title : "To Do"} value={todoCount} icon={AlertCircle} color="text-slate-600" bg="bg-slate-50 dark:bg-slate-900/20" />
        <StatCard title="In Progress" value={processingCount} icon={Clock} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard title={columns.length > 0 ? columns[columns.length - 1].title : "Completed"} value={doneCount} icon={CheckCircle} color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-100 dark:border-orange-900/50 flex flex-col justify-center">
               <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Pending Leaves</span>
               <div className="flex items-center gap-3">
                  <Briefcase className="text-orange-500" size={24} />
                  <span className="text-2xl font-bold text-orange-800 dark:text-orange-200">{pendingLeaves}</span>
               </div>
           </div>
           <div className="md:col-span-3 bg-white dark:bg-dark-900 p-5 rounded-xl border border-gray-100 dark:border-dark-800 shadow-sm flex items-center justify-between">
               <div className="flex flex-col">
                   <span className="text-sm font-semibold text-gray-500 mb-1">Approved Leaves (Today)</span>
                   <span className="text-xl font-bold">{approvedToday}</span>
               </div>
               <div className="w-px h-10 bg-gray-100 dark:bg-dark-800"></div>
               <div className="flex flex-col">
                   <span className="text-sm font-semibold text-gray-500 mb-1">This Week</span>
                   <span className="text-xl font-bold">{approvedThisWeek}</span>
               </div>
               <div className="w-px h-10 bg-gray-100 dark:bg-dark-800"></div>
               <div className="flex flex-col">
                   <span className="text-sm font-semibold text-gray-500 mb-1">This Month</span>
                   <span className="text-xl font-bold">{approvedThisMonth}</span>
               </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-100 dark:border-dark-800 shadow-sm lg:col-span-2 flex flex-col h-[300px]">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Clock className="text-primary-600" size={20} /> Task Status Distribution
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip 
                    cursor={{fill: 'transparent'}} 
                    contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#fff' 
                    }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-100 dark:border-dark-800 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Flag className="text-orange-500" size={20} /> Tasks by Priority
            </h3>
            <div className="flex-1 w-full relative min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {priorityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{totalTasks}</span>
                </div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
                {priorityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        {item.name}
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions (Admin) / My Recent (Employee) */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-100 dark:border-dark-800 shadow-sm flex flex-col">
           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <CheckCircle className="text-green-500" size={20} /> Recent Completions
           </h3>
           <div className="overflow-x-auto">
               <table className="w-full">
                   <thead className="bg-gray-50 dark:bg-dark-800">
                       <tr>
                           <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-left">Task</th>
                           <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-left">Assignee</th>
                           <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-left">Submitted</th>
                           <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Action</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
                       {recentSubmissions.length > 0 ? (
                           recentSubmissions.map(task => {
                               const assignee = users.find(u => u.id === task.assigneeId);
                               return (
                                   <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                                       <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{task.title}</td>
                                       <td className="px-4 py-3">
                                           <div className="flex items-center gap-2">
                                               {assignee && <img src={assignee.avatar} className="w-6 h-6 rounded-full" alt="" />}
                                               <span className="text-sm text-gray-600 dark:text-gray-300">{assignee?.username || 'Unassigned'}</span>
                                           </div>
                                       </td>
                                       <td className="px-4 py-3 text-xs text-gray-500">
                                           {dayjs(task.completedAt).fromNow()}
                                       </td>
                                       <td className="px-4 py-3 text-right">
                                           {task.submissions && task.submissions.length > 0 && (
                                               <a 
                                                 href={task.submissions[0].content} 
                                                 target="_blank" 
                                                 rel="noopener noreferrer"
                                                 className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                               >
                                                   <LinkIcon size={12} /> View Work
                                               </a>
                                           )}
                                       </td>
                                   </tr>
                               );
                           })
                       ) : (
                           <tr>
                               <td colSpan={4} className="p-8 text-center text-gray-500">No recently completed tasks with submissions.</td>
                           </tr>
                       )}
                   </tbody>
               </table>
           </div>
        </div>

        {/* Live Feed - ONLY VISIBLE TO ADMINS/ADMINISTRATORS */}
        {!isEmployee && (
            <div className="bg-white dark:bg-dark-900 p-6 rounded-xl border border-gray-100 dark:border-dark-800 shadow-sm flex flex-col h-[400px]">
            <h3 className="text-lg font-semibold mb-4">Live Activity</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {logs.map(log => (
                <div key={log.id} className="flex gap-3 items-start animate-fade-in-up">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                    <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{dayjs(log.timestamp).fromNow()}</p>
                    </div>
                </div>
                ))}
                {logs.length === 0 && <p className="text-gray-400 text-sm text-center mt-10">No recent activity.</p>}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
