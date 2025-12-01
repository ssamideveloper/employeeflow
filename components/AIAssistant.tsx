
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { generateAIResponse } from '../services/geminiService';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: any;
}

interface AIMessage {
  role: 'user' | 'ai';
  text: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, contextData }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'ai', text: 'Hello! I am your EmployeeFlow assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { currentUser, tasks } = useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Call Gemini with enhanced context
    const aiResponse = await generateAIResponse(userMsg, {
      user: currentUser,
      tasks: tasks.filter(t => t.assigneeId === currentUser.id),
      pageContext: contextData?.pageContext,
      selectedEmployee: contextData?.selectedEmployee
    });

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setLoading(false);
  };

  const inputClasses = "flex-1 px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm hover:border-gray-400 dark:hover:border-dark-600";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-dark-800"
          >
            <div className="p-4 border-b border-gray-200 dark:border-dark-800 flex items-center justify-between bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h3 className="font-bold">AI Assistant</h3>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-950" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 shrink-0">
                      <Bot size={18} />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-dark-800 p-3 rounded-2xl rounded-tl-sm">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-dark-800 bg-white dark:bg-dark-900 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={contextData?.pageContext === 'EMPLOYEE_PROFILE' ? "Ask about this employee..." : "Ask about tasks, productivity..."}
                className={inputClasses}
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-primary-600 text-white p-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
