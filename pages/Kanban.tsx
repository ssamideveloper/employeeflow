
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { TaskStatus, Task, UserRole, TaskPriority, KanbanColumn } from '../types';
import { DndContext, closestCorners, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, User as UserIcon, Clock, Link as LinkIcon, Upload, Eye, AlertTriangle, FileText, CheckCircle, XCircle, Flag, ArrowRight, CheckSquare, Lock, File, ChevronsUp, ChevronsDown, Equal, Paperclip, Calendar, Code, Settings, GripVertical, Edit2, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';

// ---- REUSABLE UI COMPONENTS ----

const Label = ({ children, required }: { children?: React.ReactNode, required?: boolean }) => (
    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
        {children} {required && <span className="text-red-500">*</span>}
    </label>
);

const Input = ({ label, required, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
    <div className="w-full">
        {label && <Label required={required}>{label}</Label>}
        <input 
            {...props} 
            className={`w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:border-gray-300 dark:hover:border-dark-600 ${className || ''}`}
        />
    </div>
);

const Select = ({ label, children, required, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) => (
    <div className="w-full">
        {label && <Label required={required}>{label}</Label>}
        <div className="relative">
            <select 
                {...props} 
                className={`w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 appearance-none cursor-pointer shadow-sm hover:border-gray-300 dark:hover:border-dark-600 ${className || ''}`}
            >
                {children}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
        </div>
    </div>
);

const TextArea = ({ label, required, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) => (
    <div className="w-full">
        {label && <Label required={required}>{label}</Label>}
        <textarea 
            {...props} 
            className={`w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none shadow-sm hover:border-gray-300 dark:hover:border-dark-600 ${className || ''}`}
        />
    </div>
);

// ---- KANBAN SUB-COMPONENTS ----

const DroppableColumn = ({ id, title, tasks, children, onAddTask, canEdit, isFirst }: any) => {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div className="flex flex-col rounded-xl w-full md:w-[340px] h-full bg-gray-50/50 dark:bg-dark-900/30 border border-gray-100 dark:border-dark-800/50">
      <div className={`p-3 m-2 rounded-lg border flex items-center justify-between bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700`}>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          {title}
          <span className="bg-gray-100 dark:bg-dark-900 text-[10px] px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 font-bold border border-gray-200 dark:border-dark-600">{tasks.length}</span>
        </h3>
        {canEdit && isFirst && (
          <button onClick={onAddTask} className="text-gray-400 hover:text-primary-600 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded">
            <Plus size={16} />
          </button>
        )}
      </div>
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; isOverlay?: boolean; onClick?: () => void }> = ({ task, isOverlay, onClick }) => {
  const { users, currentUser } = useAppStore();
  
  const isAssignee = task.assigneeId === currentUser?.id;
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.ADMINISTRATOR;
  const canDrag = isAdmin || isAssignee;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !canDrag
  });

  const assignee = users.find(u => u.id === task.assigneeId);
  const hasSubmissions = task.submissions && task.submissions.length > 0;

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getPriorityConfig = (p: TaskPriority) => {
      switch(p) {
          case TaskPriority.HIGH: 
            return { color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: ChevronsUp };
          case TaskPriority.MEDIUM: 
            return { color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Equal };
          case TaskPriority.LOW: 
            return { color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: ChevronsDown };
      }
  };

  const pConfig = getPriorityConfig(task.priority);
  const PriorityIcon = pConfig.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        bg-white dark:bg-dark-900 p-3 rounded-lg border border-l-[3px] border-gray-200 dark:border-dark-700 
        hover:border-primary-300 dark:hover:border-primary-700/50
        group relative transition-all duration-200 select-none
        ${isDragging ? 'opacity-30 ring-2 ring-primary-500' : 'opacity-100'} 
        ${isOverlay ? 'shadow-2xl rotate-2 scale-105 z-50 cursor-grabbing' : 'hover:shadow-md hover:-translate-y-0.5'}
        ${!canDrag && !isOverlay ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg ${pConfig.color}`}></div>
      
      {/* Top Row: Title & Actions */}
      <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">
            {task.title}
          </h4>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-gray-400 hover:text-primary-600 p-0.5 rounded">
                  <Eye size={14} />
              </div>
          </div>
      </div>

      {/* Info Row: Priority Badge & Date */}
      <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${pConfig.bg} ${pConfig.text}`}>
              <PriorityIcon size={10} strokeWidth={3} /> {task.priority}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Calendar size={10} /> {dayjs(task.updatedAt).format('MMM D')}
          </span>
      </div>
      
      {/* Footer: Assignee & Attachments */}
      <div className="flex items-center justify-between border-t border-gray-50 dark:border-dark-800 pt-2 mt-1">
         <div className="flex items-center gap-2">
            {assignee ? (
                <div className="flex items-center gap-1.5">
                    <img src={assignee.avatar} alt="assignee" className="w-5 h-5 rounded-full object-cover border border-gray-100 dark:border-dark-700" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[80px]">{assignee.username}</span>
                </div>
            ) : (
                <span className="text-[10px] text-gray-400 italic">Unassigned</span>
            )}
         </div>
         
         <div className="flex gap-2 text-gray-300">
             {hasSubmissions && <Paperclip size={12} className="text-blue-400" />}
             {!canDrag && !isOverlay && <Lock size={12} />}
         </div>
      </div>
    </div>
  );
};

// ---- COLUMN MANAGEMENT MODAL ----

interface SortableColumnItemProps {
  column: KanbanColumn;
  onDelete: (id: string) => void;
  onUpdate: (id: string, val: string) => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({ column, onDelete, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-gray-50 dark:bg-dark-800 p-3 rounded-lg border border-gray-200 dark:border-dark-700 mb-2">
      <div {...attributes} {...listeners} className="cursor-grab hover:text-primary-600 text-gray-400">
        <GripVertical size={20} />
      </div>
      <input 
        value={column.title}
        onChange={(e) => onUpdate(column.id, e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-white"
        placeholder="Column Name"
      />
      <button onClick={() => onDelete(column.id)} className="text-gray-400 hover:text-red-500 p-1">
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const BoardSettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { columns, addColumn, updateColumn, deleteColumn, setColumns, tasks } = useAppStore();
  const [newColTitle, setNewColTitle] = useState('');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === over?.id);
      setColumns(arrayMove(columns, oldIndex, newIndex));
    }
  };

  const handleDelete = (id: string) => {
      // Prevent deleting if tasks exist in column for safety
      if (tasks.some(t => t.status === id)) {
          alert("Cannot delete column containing tasks. Please move tasks first.");
          return;
      }
      deleteColumn(id);
  };

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if(newColTitle.trim()) {
          addColumn(newColTitle.trim());
          setNewColTitle('');
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-900 w-full max-w-lg rounded-xl p-6 shadow-2xl border border-gray-100 dark:border-dark-800 flex flex-col max-h-[80vh]">
         <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <Settings size={20} className="text-primary-600" /> Manage Columns
             </h2>
             <button onClick={onClose}><XCircle size={24} className="text-gray-400 hover:text-gray-600" /></button>
         </div>

         <div className="flex-1 overflow-y-auto pr-2">
             <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                 <SortableContext items={columns} strategy={verticalListSortingStrategy}>
                     {columns.map(col => (
                         <SortableColumnItem 
                            key={col.id} 
                            column={col} 
                            onDelete={handleDelete} 
                            onUpdate={updateColumn}
                         />
                     ))}
                 </SortableContext>
             </DndContext>
         </div>

         <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-800 flex gap-2">
             <input 
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                placeholder="New Column Name..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm outline-none focus:border-primary-500"
             />
             <button type="submit" disabled={!newColTitle.trim()} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-700 disabled:opacity-50">
                 Add
             </button>
         </form>
      </div>
    </div>
  );
};


// ---- MAIN KANBAN COMPONENT ----

const Kanban = () => {
  const { 
      tasks, updateTaskStatus, addTask, updateTask, deleteTask, addTaskSubmission, 
      users, currentUser, addChecklistItem, toggleChecklistItem, removeChecklistItem,
      columns
  } = useAppStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmDoneOpen, setIsConfirmDoneOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{id: string, status: string} | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', priority: TaskPriority.MEDIUM });
  
  // Submission State
  const [submissionTab, setSubmissionTab] = useState<'TEXT' | 'CODE' | 'PDF'>('TEXT');
  const [subText, setSubText] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subLanguage, setSubLanguage] = useState('javascript');
  const [subFile, setSubFile] = useState<{ name: string, content: string } | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.ADMINISTRATOR;

  useEffect(() => {
    // Re-highlight code blocks when detail modal opens or submissions change
    if (isDetailOpen && window.hljs) {
        setTimeout(() => {
            window.hljs.highlightAll();
        }, 100);
    }
  }, [isDetailOpen, selectedTask?.submissions]);

  // -- HANDLERS --

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
       const newStatus = over.id as string;
       const isLastColumn = columns.length > 0 && newStatus === columns[columns.length - 1].id;
       
       if (isLastColumn) {
           setPendingStatusUpdate({ id: active.id as string, status: newStatus });
           setIsConfirmDoneOpen(true);
       } else {
           updateTaskStatus(active.id as string, newStatus);
       }
    }
    setActiveId(null);
  };

  const confirmDone = () => {
      if(pendingStatusUpdate) {
          updateTaskStatus(pendingStatusUpdate.id, pendingStatusUpdate.status, completionNotes);
      }
      setIsConfirmDoneOpen(false);
      setPendingStatusUpdate(null);
      setCompletionNotes('');
      setIsDetailOpen(false); 
  };

  const handleCreateTask = (e: React.FormEvent) => {
      e.preventDefault();
      addTask({
          title: taskForm.title,
          description: taskForm.description,
          status: columns[0]?.id || 'TODO', // Default to first column
          assigneeId: taskForm.assigneeId || null,
          priority: taskForm.priority,
          createdBy: currentUser?.id || 'unknown'
      });
      setIsCreateOpen(false);
      resetForm();
  };

  const handleUpdateTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedTask) return;
      updateTask(selectedTask.id, {
          title: taskForm.title,
          description: taskForm.description,
          assigneeId: taskForm.assigneeId || null,
          priority: taskForm.priority
      });
      setIsDetailOpen(false);
      resetForm();
  };

  const handleAddSubmission = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTask) return;

      if (submissionTab === 'TEXT') {
          if (!subText.trim()) return;
          addTaskSubmission(selectedTask.id, { type: 'TEXT', content: subText });
          setSubText('');
      } else if (submissionTab === 'CODE') {
          if (!subCode.trim()) return;
          addTaskSubmission(selectedTask.id, { type: 'CODE', content: subCode, language: subLanguage });
          setSubCode('');
      } else if (submissionTab === 'PDF') {
          if (!subFile) return;
          addTaskSubmission(selectedTask.id, { type: 'PDF', content: subFile.content, name: subFile.name });
          setSubFile(null);
      }
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedTask || !newChecklistItem.trim()) return;
      addChecklistItem(selectedTask.id, newChecklistItem);
      setNewChecklistItem('');
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
             setSubFile({ name: file.name, content: ev.target?.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const resetForm = () => {
      setTaskForm({ title: '', description: '', assigneeId: '', priority: TaskPriority.MEDIUM });
      setSubText('');
      setSubCode('');
      setSubFile(null);
      setCompletionNotes('');
      setNewChecklistItem('');
  };

  const openDetail = (task: Task) => {
      setSelectedTask(task);
      setTaskForm({
          title: task.title,
          description: task.description,
          assigneeId: task.assigneeId || '',
          priority: task.priority
      });
      setIsDetailOpen(true);
  };

  const liveSelectedTask = selectedTask ? tasks.find(t => t.id === selectedTask.id) : null;
  const checklistComplete = liveSelectedTask && liveSelectedTask.checklist?.length > 0 
      && liveSelectedTask.checklist.every(i => i.isCompleted);
  const canEdit = isAdmin || liveSelectedTask?.assigneeId === currentUser?.id;
  const isLastColumn = liveSelectedTask && columns.length > 0 && liveSelectedTask.status === columns[columns.length - 1].id;

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
       <div className="flex justify-between items-center px-4 pt-2">
           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Project Board</h2>
           {isAdmin && (
               <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
               >
                   <Settings size={16} /> Manage Board
               </button>
           )}
       </div>

       {/* Create Task Modal */}
       {isCreateOpen && (
           <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white dark:bg-dark-900 w-full max-w-lg rounded-xl p-8 shadow-2xl border border-gray-100 dark:border-dark-800">
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
                       <Plus size={20} className="text-primary-600" /> Create New Task
                   </h2>
                   <form onSubmit={handleCreateTask} className="space-y-5">
                       <Input label="Title" value={taskForm.title} onChange={(e)=>setTaskForm({...taskForm, title: e.target.value})} placeholder="Task Title" required />
                       <TextArea label="Description" value={taskForm.description} onChange={(e)=>setTaskForm({...taskForm, description: e.target.value})} rows={3} placeholder="Details..." />
                       <div className="grid grid-cols-2 gap-5">
                            <Select label="Assignee" value={taskForm.assigneeId} onChange={(e)=>setTaskForm({...taskForm, assigneeId: e.target.value})}>
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                            </Select>
                            <Select label="Priority" value={taskForm.priority} onChange={(e)=>setTaskForm({...taskForm, priority: e.target.value as TaskPriority})}>
                                <option value={TaskPriority.LOW}>Low</option>
                                <option value={TaskPriority.MEDIUM}>Medium</option>
                                <option value={TaskPriority.HIGH}>High</option>
                            </Select>
                       </div>
                       <div className="flex gap-3 justify-end mt-6">
                           <button type="button" onClick={()=>setIsCreateOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                           <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-bold shadow-sm">Create Task</button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       {/* Settings Modal */}
       {isSettingsOpen && <BoardSettingsModal onClose={() => setIsSettingsOpen(false)} />}

       {/* Edit/Detail Modal */}
       {isDetailOpen && liveSelectedTask && (
           <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white dark:bg-dark-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-800 overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="p-6 border-b border-gray-100 dark:border-dark-800 flex justify-between items-start bg-gray-50/80 dark:bg-dark-800/30">
                       <div className="flex-1 mr-6">
                           {isAdmin ? (
                               <input value={taskForm.title} onChange={e=>setTaskForm({...taskForm, title: e.target.value})} className="text-xl font-bold bg-transparent border-b border-transparent focus:border-primary-500 outline-none w-full" />
                           ) : (
                               <h2 className="text-xl font-bold text-gray-900 dark:text-white">{liveSelectedTask.title}</h2>
                           )}
                           <div className="flex items-center gap-3 mt-2">
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${liveSelectedTask.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-200' : liveSelectedTask.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                   {liveSelectedTask.priority}
                               </span>
                               {isLastColumn && (
                                   <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
                                       <CheckCircle size={10} /> DONE
                                   </span>
                               )}
                           </div>
                       </div>
                       <button onClick={()=>setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                   </div>
                   
                   <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {/* LEFT COLUMN: Details & Checklist */}
                       <div className="space-y-6">
                           <div>
                               <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Description</h3>
                               {isAdmin ? <TextArea value={taskForm.description} onChange={e=>setTaskForm({...taskForm, description: e.target.value})} rows={4} /> : <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{liveSelectedTask.description || "No description."}</p>}
                           </div>

                           <div className="bg-gray-50 dark:bg-dark-800/50 rounded-xl p-4 border border-gray-100 dark:border-dark-700">
                               <div className="flex justify-between items-center mb-3">
                                   <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase flex gap-2"><CheckSquare size={14}/> Checklist</h3>
                                   <span className="text-xs text-gray-500">{liveSelectedTask.checklist?.filter(i => i.isCompleted).length || 0} / {liveSelectedTask.checklist?.length || 0}</span>
                               </div>
                               <div className="space-y-2">
                                   {liveSelectedTask.checklist?.map(item => (
                                       <div key={item.id} className="flex items-center gap-2">
                                           <button disabled={!canEdit} onClick={() => toggleChecklistItem(liveSelectedTask.id, item.id)} className={`w-4 h-4 rounded border flex items-center justify-center ${item.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}>{item.isCompleted && <CheckCircle size={10} />}</button>
                                           <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>{item.text}</span>
                                           {canEdit && <button onClick={() => removeChecklistItem(liveSelectedTask.id, item.id)} className="ml-auto text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>}
                                       </div>
                                   ))}
                                   {canEdit && (
                                       <form onSubmit={handleAddChecklistItem} className="flex gap-2 mt-2">
                                           <input 
                                                value={newChecklistItem} 
                                                onChange={e => setNewChecklistItem(e.target.value)} 
                                                placeholder="Add item..." 
                                                className="flex-1 w-full px-4 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400" 
                                           />
                                           <button type="submit" disabled={!newChecklistItem.trim()} className="text-xs font-bold text-primary-600 hover:text-primary-700">ADD</button>
                                       </form>
                                   )}
                               </div>
                           </div>
                           
                           {/* ADMIN EDITING CONTROLS */}
                           {isAdmin && (
                               <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                                   <Select label="Assignee" value={taskForm.assigneeId} onChange={e=>setTaskForm({...taskForm, assigneeId: e.target.value})}>{users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}</Select>
                                   <Select label="Priority" value={taskForm.priority} onChange={e=>setTaskForm({...taskForm, priority: e.target.value as any})}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></Select>
                                   <div className="flex gap-2">
                                       <button onClick={handleUpdateTask} className="flex-1 bg-primary-600 text-white py-2 rounded text-sm font-bold">Save Changes</button>
                                       <button onClick={() => { deleteTask(liveSelectedTask.id); setIsDetailOpen(false); }} className="flex-1 text-red-500 border border-red-200 hover:bg-red-50 py-2 rounded text-sm font-bold">Delete Task</button>
                                   </div>
                               </div>
                           )}
                       </div>

                       {/* RIGHT COLUMN: Submission Area */}
                       <div className="space-y-6 flex flex-col h-full">
                           <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-4 flex-1 flex flex-col">
                               <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                   <Upload size={16} className="text-primary-600" /> Work Submissions
                               </h3>

                               {/* Submission List (View Only) */}
                               <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-gray-50 dark:bg-dark-800/50 p-3 rounded-lg min-h-[150px]">
                                   {liveSelectedTask.submissions && liveSelectedTask.submissions.length > 0 ? (
                                       liveSelectedTask.submissions.map(sub => (
                                           <div key={sub.id} className="bg-white dark:bg-dark-900 p-3 rounded border border-gray-200 dark:border-dark-700 shadow-sm">
                                               <div className="flex justify-between items-start mb-2">
                                                   <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300">{sub.type}</span>
                                                   <span className="text-[10px] text-gray-400">{dayjs(sub.submittedAt).format('MMM D, HH:mm')}</span>
                                               </div>
                                               
                                               {sub.type === 'TEXT' && <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{sub.content}</p>}
                                               
                                               {sub.type === 'LINK' && (
                                                   <a href={sub.content} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1">
                                                       <LinkIcon size={12}/> {sub.content}
                                                   </a>
                                               )}

                                               {sub.type === 'CODE' && (
                                                   <div className="relative group">
                                                       <div className="absolute top-2 right-2 text-[10px] text-gray-500 bg-gray-200 dark:bg-dark-700 px-1.5 rounded opacity-50">{sub.language}</div>
                                                       <pre className="text-xs rounded bg-gray-900 text-gray-100 p-3 overflow-x-auto">
                                                           <code className={`language-${sub.language}`}>{sub.content}</code>
                                                       </pre>
                                                   </div>
                                               )}

                                               {sub.type === 'PDF' && (
                                                   <div className="flex items-center gap-3">
                                                       <FileText size={24} className="text-red-500" />
                                                       <div>
                                                           <p className="text-sm font-medium">{sub.name}</p>
                                                           <a href={sub.content} download={sub.name} className="text-xs text-blue-600 hover:underline">Download PDF</a>
                                                       </div>
                                                   </div>
                                               )}
                                           </div>
                                       ))
                                   ) : (
                                       <p className="text-center text-sm text-gray-400 py-4">No work submitted yet.</p>
                                   )}
                               </div>

                               {/* Add Submission Form */}
                               {canEdit && !isLastColumn && (
                                   <div className="border-t border-gray-100 dark:border-dark-800 pt-4">
                                       <div className="flex gap-2 mb-3">
                                           <button onClick={() => setSubmissionTab('TEXT')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 ${submissionTab === 'TEXT' ? 'bg-gray-200 dark:bg-dark-700' : 'hover:bg-gray-100 dark:hover:bg-dark-800'}`}><FileText size={12}/> Text / Link</button>
                                           <button onClick={() => setSubmissionTab('CODE')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 ${submissionTab === 'CODE' ? 'bg-gray-200 dark:bg-dark-700' : 'hover:bg-gray-100 dark:hover:bg-dark-800'}`}><Code size={12}/> Code</button>
                                           <button onClick={() => setSubmissionTab('PDF')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 ${submissionTab === 'PDF' ? 'bg-gray-200 dark:bg-dark-700' : 'hover:bg-gray-100 dark:hover:bg-dark-800'}`}><File size={12}/> PDF</button>
                                       </div>

                                       <form onSubmit={handleAddSubmission} className="space-y-3">
                                           {submissionTab === 'TEXT' && (
                                               <TextArea value={subText} onChange={e => setSubText(e.target.value)} placeholder="Enter details, explanation, or a link..." rows={3} required />
                                           )}

                                           {submissionTab === 'CODE' && (
                                               <div className="space-y-2">
                                                   <Select 
                                                        value={subLanguage} 
                                                        onChange={e => setSubLanguage(e.target.value)} 
                                                        className="!py-2 !text-xs"
                                                   >
                                                       <option value="javascript">JavaScript</option>
                                                       <option value="typescript">TypeScript</option>
                                                       <option value="python">Python</option>
                                                       <option value="html">HTML</option>
                                                       <option value="css">CSS</option>
                                                       <option value="sql">SQL</option>
                                                       <option value="json">JSON</option>
                                                   </Select>
                                                   <TextArea value={subCode} onChange={e => setSubCode(e.target.value)} placeholder="Paste code here..." rows={4} className="font-mono text-xs" required />
                                               </div>
                                           )}

                                           {submissionTab === 'PDF' && (
                                               <div className="border-2 border-dashed border-gray-300 dark:border-dark-700 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                                                   <input type="file" accept="application/pdf" onChange={handlePDFUpload} className="hidden" id="pdf-upload" />
                                                   <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                                                       <Upload size={24} className="text-gray-400 mb-2"/>
                                                       <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                           {subFile ? subFile.name : "Click to upload PDF"}
                                                       </span>
                                                   </label>
                                               </div>
                                           )}

                                           <button 
                                               type="submit" 
                                               className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm mt-2"
                                           >
                                               <Check size={16} /> Confirm & Add Submission
                                           </button>
                                       </form>
                                   </div>
                               )}
                           </div>

                           {/* Complete Task Button */}
                           {canEdit && !isLastColumn && (
                               <button 
                                   onClick={() => { 
                                       // Find the last column ID to move to Done
                                       const lastId = columns.length > 0 ? columns[columns.length - 1].id : '';
                                       setPendingStatusUpdate({ id: liveSelectedTask.id, status: lastId }); 
                                       setIsConfirmDoneOpen(true); 
                                   }} 
                                   className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                               >
                                   Complete Task <ArrowRight size={18}/>
                               </button>
                           )}
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* Confirm Done Modal */}
       {isConfirmDoneOpen && (
           <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-dark-800">
                   <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Complete Task?</h3>
                   <p className="text-sm text-gray-500 mb-4">Are you sure you want to move this task to Done?</p>
                   <TextArea label="Final Notes (Optional)" value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} />
                   <div className="flex gap-2 mt-4">
                       <button onClick={()=>setIsConfirmDoneOpen(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                       <button onClick={confirmDone} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md">Confirm Completion</button>
                   </div>
               </div>
           </div>
       )}

       {/* Kanban Board Area */}
       <DndContext 
          collisionDetection={closestCorners}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
       >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full min-w-fit p-4 flex gap-6">
            {columns.map((column, index) => (
                <DroppableColumn 
                  key={column.id}
                  id={column.id} 
                  title={column.title} 
                  tasks={tasks.filter(t => t.status === column.id)}
                  onAddTask={()=>setIsCreateOpen(true)}
                  canEdit={isAdmin}
                  isFirst={index === 0}
                >
                  {tasks.filter(t => t.status === column.id).map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => openDetail(task)} />
                  ))}
                </DroppableColumn>
            ))}
            {columns.length === 0 && (
                <div className="w-full flex items-center justify-center text-gray-400">
                    <p>No columns defined. Admin should configure the board.</p>
                </div>
            )}
          </div>
        </div>

        {createPortal(
          <DragOverlay>
            {activeId ? (
              <TaskCard task={tasks.find(t => t.id === activeId)!} isOverlay />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default Kanban;
