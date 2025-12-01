
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, Filter, FileText } from 'lucide-react';
import dayjs from 'dayjs';

const AuditLogs = () => {
  const { logs, users } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const actions = Array.from(new Set(logs.map(l => l.action)));

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'System/Unknown';
  };

  const inputClasses = "w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm hover:border-gray-300 dark:hover:border-dark-600";
  const selectClasses = "w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 appearance-none shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-dark-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileText className="text-primary-600" /> System Audit Logs
        </h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${inputClasses}`}
            />
          </div>
          
          <div className="relative">
             <select 
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className={`pl-4 pr-10 ${selectClasses}`}
             >
                <option value="ALL">All Actions</option>
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
             </select>
             <Filter className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap font-mono">
                    {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                    {getUserName(log.userId)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-dark-800 rounded text-gray-600 dark:text-gray-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                 <tr>
                     <td colSpan={4} className="p-8 text-center text-gray-500">No logs found matching your criteria.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
