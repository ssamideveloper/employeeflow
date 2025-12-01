
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Send, Hash, Lock } from 'lucide-react';
import { UserRole } from '../types';
import dayjs from 'dayjs';

const Chat = () => {
  const { users, messages, currentUser, sendMessage, markMessagesRead } = useAppStore();
  const [selectedContactId, setSelectedContactId] = useState<string>('GLOBAL'); // 'GLOBAL' or user ID
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const contacts = users.filter(u => u.id !== currentUser?.id);
  
  // Filter messages for current view
  const currentMessages = messages.filter(m => {
    if (selectedContactId === 'GLOBAL') {
        return m.receiverId === 'GLOBAL';
    }
    // Private chat logic
    return (m.senderId === currentUser?.id && m.receiverId === selectedContactId) ||
           (m.senderId === selectedContactId && m.receiverId === currentUser?.id);
  });

  const unreadCount = currentMessages.reduce((acc, m) => {
     if (m.senderId === selectedContactId && !m.readBy.includes(currentUser?.id || '')) {
         return acc + 1;
     }
     return acc;
  }, 0);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages.length, selectedContactId]);

  // Mark messages as read using stable primitive dependencies
  useEffect(() => {
    if (unreadCount > 0 && selectedContactId !== 'GLOBAL' && currentUser) {
        // Use a timeout to ensure we don't conflict with render cycle
        const timer = setTimeout(() => {
            markMessagesRead(selectedContactId, currentUser.id);
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [unreadCount, selectedContactId, currentUser?.id, markMessagesRead]);

  // Permission: Only Admin and Administrator can post in Global
  const canPost = selectedContactId !== 'GLOBAL' || (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.ADMINISTRATOR);

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim() || !currentUser || !canPost) return;

      sendMessage({
          senderId: currentUser.id,
          receiverId: selectedContactId,
          content: inputText,
      });
      setInputText('');
  };

  const getUnreadCount = (senderId: string) => {
      if (!currentUser) return 0;
      return messages.filter(m => 
          m.senderId === senderId && 
          m.receiverId === currentUser.id && 
          !m.readBy.includes(currentUser.id)
      ).length;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 shadow-sm overflow-hidden animate-fade-in-up">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-dark-800 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-dark-800 bg-gray-50 dark:bg-dark-800/50">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Messages</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div 
                    onClick={() => setSelectedContactId('GLOBAL')}
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors ${selectedContactId === 'GLOBAL' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                        <Hash size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-sm">General Announcement</p>
                        <p className="text-xs text-gray-500">Company-wide</p>
                    </div>
                </div>
                
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">Direct Messages</p>
                {contacts.map(user => {
                    const unread = getUnreadCount(user.id);
                    return (
                        <div 
                            key={user.id}
                            onClick={() => setSelectedContactId(user.id)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors ${selectedContactId === user.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        >
                            <div className="relative">
                                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                                {user.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-dark-900"></span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-sm truncate">{user.username}</p>
                                    {unread > 0 && <span className="bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unread}</span>}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{user.role === UserRole.ADMIN ? 'Owner' : user.role === UserRole.ADMINISTRATOR ? 'Administrator' : 'Employee'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/50 dark:bg-dark-950/50">
            <div className="p-4 border-b border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-900 flex items-center gap-3">
                 {selectedContactId === 'GLOBAL' ? (
                     <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600"><Hash size={16}/></div>
                 ) : (
                     <img src={users.find(u => u.id === selectedContactId)?.avatar} className="w-8 h-8 rounded-full" alt="" />
                 )}
                 <h3 className="font-semibold">
                     {selectedContactId === 'GLOBAL' ? 'General Announcement' : users.find(u => u.id === selectedContactId)?.username}
                 </h3>
                 {selectedContactId === 'GLOBAL' && !canPost && (
                     <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded flex items-center gap-1">
                         <Lock size={10} /> Read Only
                     </span>
                 )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {currentMessages.map(msg => {
                    const isMe = msg.senderId === currentUser?.id;
                    const sender = users.find(u => u.id === msg.senderId);
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMe && <img src={sender?.avatar} className="w-8 h-8 rounded-full self-end mb-1" alt="" />}
                                <div>
                                    {!isMe && selectedContactId === 'GLOBAL' && <p className="text-[10px] text-gray-500 ml-1 mb-0.5">{sender?.username}</p>}
                                    <div className={`p-3 rounded-2xl ${isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-tl-sm'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                    <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {dayjs(msg.timestamp).format('HH:mm')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {currentMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                        {selectedContactId === 'GLOBAL' ? (
                            <>
                                <Hash size={32} className="opacity-20" />
                                <p>No announcements yet.</p>
                            </>
                        ) : (
                            <>
                                <Send size={32} className="opacity-20" />
                                <p>No messages yet. Start the conversation!</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 flex gap-2">
                <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={canPost ? "Type a message..." : "Only Admins can post announcements."}
                    disabled={!canPost}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-800 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                    type="submit" 
                    disabled={!canPost || !inputText.trim()}
                    className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    </div>
  );
};

export default Chat;
