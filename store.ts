
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, UserRole, User, TaskStatus, Task, Message, Log, AttendanceStatus, LeaveRequest, Notification, TaskPriority, TaskSubmission, EmployeeDocument, AttendanceRecord } from './types';
import dayjs from 'dayjs';

// Seed Data
const SEED_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@company.com',
  password: 'admin', // Default password
  needsPasswordChange: false,
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/200/200',
  isOnline: true,
  department: 'Management',
  lastActiveAt: new Date().toISOString(),
  joinedAt: '2023-01-01T09:00:00Z',
  jobTitle: 'CEO',
  documents: []
};

const SEED_ADMINISTRATOR: User = {
  id: 'admin-2',
  username: 'manager',
  email: 'manager@company.com',
  password: 'manager', // Default password
  needsPasswordChange: false,
  role: UserRole.ADMINISTRATOR,
  avatar: 'https://picsum.photos/202/202',
  isOnline: false,
  department: 'Operations',
  lastActiveAt: new Date().toISOString(),
  joinedAt: '2023-02-15T09:00:00Z',
  jobTitle: 'Operations Manager',
  documents: []
};

const SEED_EMPLOYEE: User = {
  id: 'emp-1',
  username: 'john_doe',
  email: 'john@company.com',
  password: '123', // Default password
  needsPasswordChange: true, // Force change for demo purposes
  role: UserRole.EMPLOYEE,
  avatar: 'https://picsum.photos/201/201',
  isOnline: false,
  department: 'Engineering',
  lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
  joinedAt: '2023-03-10T09:00:00Z',
  jobTitle: 'Software Engineer',
  phone: '555-0123',
  address: '123 Tech Lane, Silicon Valley',
  salary: 85000,
  documents: []
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [SEED_ADMIN, SEED_ADMINISTRATOR, SEED_EMPLOYEE],
      tasks: [],
      columns: [
        { id: TaskStatus.TODO, title: 'To Do' },
        { id: TaskStatus.PROCESSING, title: 'Processing' },
        { id: TaskStatus.DONE, title: 'Done' }
      ],
      messages: [],
      logs: [],
      leaves: [],
      notifications: [],
      attendance: [],
      darkMode: false,

      login: (username, password, role) => {
        const users = get().users;
        const user = users.find(u => 
            u.username === username && 
            u.role === role && 
            (u.password === password) 
        );

        if (user) {
          const now = new Date().toISOString();
          const updatedUsers = users.map(u => u.id === user.id ? { ...u, isOnline: true, lastActiveAt: now } : u);
          
          const newLog: Log = {
            id: generateId(),
            action: 'LOGIN',
            details: `${user.username} logged in.`,
            userId: user.id,
            timestamp: now
          };

          set({ currentUser: { ...user, isOnline: true, lastActiveAt: now }, users: updatedUsers, logs: [newLog, ...get().logs] });
          return true;
        }
        return false;
      },

      logout: () => {
        const currentUser = get().currentUser;
        if (currentUser) {
           const updatedUsers = get().users.map(u => u.id === currentUser.id ? { ...u, isOnline: false } : u);
           const newLog: Log = {
            id: generateId(),
            action: 'LOGOUT',
            details: `${currentUser.username} logged out.`,
            userId: currentUser.id,
            timestamp: new Date().toISOString()
          };
           set({ currentUser: null, users: updatedUsers, logs: [newLog, ...get().logs] });
        }
      },

      changePassword: (newPassword) => {
          const currentUser = get().currentUser;
          if (!currentUser) return;

          const updatedUser = { ...currentUser, password: newPassword, needsPasswordChange: false };
          const updatedUsers = get().users.map(u => u.id === currentUser.id ? updatedUser : u);

          const newLog: Log = {
              id: generateId(),
              action: 'PASSWORD_CHANGE',
              details: `${currentUser.username} changed their password.`,
              userId: currentUser.id,
              timestamp: new Date().toISOString()
          };

          set({ currentUser: updatedUser, users: updatedUsers, logs: [newLog, ...get().logs] });
      },

      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),

      addUser: (userData) => {
        const newUser: User = { 
            ...userData, 
            id: generateId(), 
            isOnline: false, 
            lastActiveAt: undefined,
            needsPasswordChange: true,
            documents: [],
            joinedAt: new Date().toISOString()
        };
        
        const log: Log = {
            id: generateId(),
            action: 'ADD_USER',
            details: `User ${newUser.username} was created.`,
            userId: get().currentUser?.id || 'system',
            timestamp: new Date().toISOString()
        };

        const welcomeMsg: Message = {
            id: generateId(),
            senderId: 'admin-1',
            receiverId: newUser.id,
            content: 'Welcome to the team! Feel free to ask any questions.',
            timestamp: new Date().toISOString(),
            readBy: []
        };
        set(state => ({ 
            users: [...state.users, newUser],
            messages: [...state.messages, welcomeMsg],
            logs: [log, ...state.logs]
        }));
      },

      removeUser: (id) => {
          const userToRemove = get().users.find(u => u.id === id);
          if(!userToRemove) return;

          const log: Log = {
            id: generateId(),
            action: 'REMOVE_USER',
            details: `User ${userToRemove.username} was removed.`,
            userId: get().currentUser?.id || 'system',
            timestamp: new Date().toISOString()
          };

          set(state => ({ 
              users: state.users.filter(u => u.id !== id),
              logs: [log, ...state.logs]
          }));
      },

      updateUser: (id, data) => {
          const user = get().users.find(u => u.id === id);
          if(!user) return;

          // Detect meaningful changes for logging
          let changes: string[] = [];
          if(data.salary && data.salary !== user.salary) changes.push(`salary to ${data.salary}`);
          if(data.role && data.role !== user.role) changes.push(`role to ${data.role}`);
          if(data.department && data.department !== user.department) changes.push(`department to ${data.department}`);
          
          let logsToAdd = [...get().logs];
          if(changes.length > 0) {
             logsToAdd.unshift({
                 id: generateId(),
                 action: 'UPDATE_USER',
                 details: `Updated ${user.username}'s ${changes.join(', ')}.`,
                 userId: get().currentUser?.id || 'system',
                 timestamp: new Date().toISOString()
             });
          }

          set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, ...data } : u),
            currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser,
            logs: logsToAdd
          }));
      },

      addDocument: (userId, doc) => {
          const newDoc: EmployeeDocument = {
              ...doc,
              id: generateId(),
              uploadedAt: new Date().toISOString()
          };
          
          const user = get().users.find(u => u.id === userId);
          if(!user) return;

          const log: Log = {
              id: generateId(),
              action: 'UPLOAD_DOCUMENT',
              details: `Uploaded document "${doc.name}" for ${user.username}.`,
              userId: get().currentUser?.id || 'system',
              timestamp: new Date().toISOString()
          };

          set(state => ({
              users: state.users.map(u => u.id === userId ? { ...u, documents: [...(u.documents || []), newDoc] } : u),
              currentUser: state.currentUser?.id === userId ? { ...state.currentUser!, documents: [...(state.currentUser!.documents || []), newDoc] } : state.currentUser,
              logs: [log, ...state.logs]
          }));
      },

      removeDocument: (userId, docId) => {
          const user = get().users.find(u => u.id === userId);
          if(!user) return;
          const doc = user.documents?.find(d => d.id === docId);

          const log: Log = {
              id: generateId(),
              action: 'REMOVE_DOCUMENT',
              details: `Removed document "${doc?.name || 'Unknown'}" from ${user.username}.`,
              userId: get().currentUser?.id || 'system',
              timestamp: new Date().toISOString()
          };

          set(state => ({
              users: state.users.map(u => u.id === userId ? { ...u, documents: (u.documents || []).filter(d => d.id !== docId) } : u),
              currentUser: state.currentUser?.id === userId ? { ...state.currentUser!, documents: (state.currentUser!.documents || []).filter(d => d.id !== docId) } : state.currentUser,
              logs: [log, ...state.logs]
          }));
      },

      updatePresence: () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        const now = new Date().toISOString();
        const lastActive = currentUser.lastActiveAt ? new Date(currentUser.lastActiveAt).getTime() : 0;
        const timeDiff = new Date().getTime() - lastActive;

        if (timeDiff > 30000 || !currentUser.isOnline) {
             set(state => ({
                currentUser: { ...state.currentUser!, isOnline: true, lastActiveAt: now },
                users: state.users.map(u => u.id === currentUser.id ? { ...u, isOnline: true, lastActiveAt: now } : u)
             }));
        }
      },

      checkInactiveUsers: () => {
          const INACTIVITY_THRESHOLD = 2 * 60 * 1000;
          const now = new Date().getTime();
          const state = get();
          let hasChanges = false;
          const updatedUsers = state.users.map(u => {
              if (u.isOnline && u.lastActiveAt) {
                  const lastActive = new Date(u.lastActiveAt).getTime();
                  if (now - lastActive > INACTIVITY_THRESHOLD) {
                      hasChanges = true;
                      return { ...u, isOnline: false };
                  }
              }
              return u;
          });
          if (hasChanges) set({ users: updatedUsers });
      },

      cleanupOldData: () => {
          const now = dayjs();
          set(state => ({
              logs: state.logs.filter(l => dayjs(l.timestamp).isAfter(now.subtract(7, 'day'))),
              messages: state.messages.filter(m => dayjs(m.timestamp).isAfter(now.subtract(30, 'day')))
          }));
      },

      // Kanban Board Actions
      addColumn: (title) => {
          set(state => ({
              columns: [...state.columns, { id: generateId(), title }]
          }));
      },

      updateColumn: (id, title) => {
          set(state => ({
              columns: state.columns.map(c => c.id === id ? { ...c, title } : c)
          }));
      },

      deleteColumn: (id) => {
          set(state => ({
              columns: state.columns.filter(c => c.id !== id),
              tasks: state.tasks.filter(t => t.status !== id) // Option: Delete tasks or move them? For now, simplistic deletion.
          }));
      },

      setColumns: (columns) => {
          set({ columns });
      },

      addTask: (taskData) => {
        const columns = get().columns;
        const defaultStatus = columns.length > 0 ? columns[0].id : TaskStatus.TODO;
        
        const newTask: Task = {
            ...taskData,
            status: taskData.status || defaultStatus,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            priority: taskData.priority || TaskPriority.MEDIUM,
            checklist: [],
            submissions: []
        };
        const log: Log = {
            id: generateId(),
            action: 'TASK_CREATED',
            details: `Task "${newTask.title}" created.`,
            userId: get().currentUser?.id || 'system',
            timestamp: new Date().toISOString()
        };
        
        if (newTask.assigneeId) {
             const notif: Notification = {
                 id: generateId(),
                 userId: newTask.assigneeId,
                 title: 'New Task Assigned',
                 message: `You have been assigned: ${newTask.title}`,
                 type: 'INFO',
                 isRead: false,
                 timestamp: new Date().toISOString(),
                 link: '/tasks'
             };
             set(state => ({ notifications: [notif, ...state.notifications] }));
        }

        set(state => ({ tasks: [...state.tasks, newTask], logs: [log, ...state.logs] }));
      },

      updateTaskStatus: (taskId, status, notes) => {
        const task = get().tasks.find(t => t.id === taskId);
        if(!task) return;
        
        const columns = get().columns;
        const isLastColumn = columns.length > 0 && columns[columns.length - 1].id === status;

        const updatedTask = { 
            ...task, 
            status, 
            completionNotes: notes || task.completionNotes,
            updatedAt: new Date().toISOString(),
            completedAt: isLastColumn ? new Date().toISOString() : undefined
        };

        const log: Log = {
            id: generateId(),
            action: 'TASK_MOVED',
            details: `Task "${task.title}" moved to ${status}.`,
            userId: get().currentUser?.id || 'system',
            timestamp: new Date().toISOString()
        };

        if (isLastColumn) {
            const admins = get().users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.ADMINISTRATOR);
            const newNotifs = admins.map(admin => ({
                id: generateId(),
                userId: admin.id,
                title: 'Task Completed',
                message: `${get().currentUser?.username} completed task: ${task.title}`,
                type: 'SUCCESS' as const,
                isRead: false,
                timestamp: new Date().toISOString(),
                link: '/tasks'
            }));
            set(state => ({ notifications: [...newNotifs, ...state.notifications] }));
        }

        set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
            logs: [log, ...state.logs]
        }));
      },

      updateTask: (taskId, data) => set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...data, updatedAt: new Date().toISOString() } : t)
      })),

      addTaskSubmission: (taskId, submissionData) => {
          const task = get().tasks.find(t => t.id === taskId);
          const columns = get().columns;
          if (!task) return;
          
          // Move to next column if possible (assumes Processing is 2nd)
          let nextStatus = task.status;
          if (columns.length >= 2 && task.status === columns[0].id) {
              nextStatus = columns[1].id;
          }

          const newSubmission: TaskSubmission = {
              ...submissionData,
              id: generateId(),
              submittedAt: new Date().toISOString()
          };

          const updatedTask: Task = {
              ...task,
              submissions: [...(task.submissions || []), newSubmission],
              status: nextStatus,
              updatedAt: new Date().toISOString()
          };

          const admins = get().users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.ADMINISTRATOR);
            const newNotifs = admins.map(admin => ({
                id: generateId(),
                userId: admin.id,
                title: 'New Work Submission',
                message: `${get().currentUser?.username} added a ${submissionData.type.toLowerCase()} submission to: ${task.title}`,
                type: 'INFO' as const,
                isRead: false,
                timestamp: new Date().toISOString(),
                link: '/tasks'
            }));

          set(state => ({
              tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
              notifications: [...newNotifs, ...state.notifications]
          }));
      },

      deleteTask: (taskId) => set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) })),

      addChecklistItem: (taskId, text) => {
          set(state => ({
              tasks: state.tasks.map(t => {
                  if (t.id === taskId) {
                      return {
                          ...t,
                          checklist: [...(t.checklist || []), { id: generateId(), text, isCompleted: false }]
                      };
                  }
                  return t;
              })
          }));
      },

      toggleChecklistItem: (taskId, itemId) => {
          set(state => ({
              tasks: state.tasks.map(t => {
                  if (t.id === taskId) {
                      return {
                          ...t,
                          checklist: (t.checklist || []).map(item => 
                              item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
                          )
                      };
                  }
                  return t;
              })
          }));
      },

      removeChecklistItem: (taskId, itemId) => {
          set(state => ({
              tasks: state.tasks.map(t => {
                  if (t.id === taskId) {
                      return {
                          ...t,
                          checklist: (t.checklist || []).filter(item => item.id !== itemId)
                      };
                  }
                  return t;
              })
          }));
      },

      sendMessage: (msgData) => {
        const newMsg: Message = {
            ...msgData,
            id: generateId(),
            timestamp: new Date().toISOString(),
            readBy: [msgData.senderId]
        };
        
        let newNotifs: Notification[] = [];
        if (msgData.receiverId !== 'GLOBAL') {
             newNotifs.push({
                 id: generateId(),
                 userId: msgData.receiverId,
                 title: 'New Message',
                 message: `New message from ${get().users.find(u => u.id === msgData.senderId)?.username}`,
                 type: 'INFO',
                 isRead: false,
                 timestamp: new Date().toISOString(),
                 link: '/chat'
             });
        }
        set(state => ({ 
            messages: [...state.messages, newMsg],
            notifications: [...newNotifs, ...state.notifications]
        }));
      },

      markMessagesRead: (senderId, receiverId) => {
          const state = get();
          const currentUser = state.currentUser;
          if(!currentUser) return;
          
          const messages = state.messages;
          let hasUpdates = false;

          const needsUpdate = messages.some(m => {
             const isRelevant = (m.senderId === senderId && m.receiverId === receiverId) || 
                                (m.senderId === senderId && receiverId === 'GLOBAL');
             return isRelevant && !m.readBy.includes(currentUser.id);
          });

          if (!needsUpdate) return;

          const newMessages = messages.map(m => {
              if ((m.senderId === senderId && m.receiverId === receiverId) || 
                  (m.senderId === senderId && receiverId === 'GLOBAL')) {
                  if (!m.readBy.includes(currentUser.id)) {
                      hasUpdates = true;
                      return { ...m, readBy: [...m.readBy, currentUser.id] };
                  }
              }
              return m;
          });

          if (hasUpdates) {
             set({ messages: newMessages });
          }
      },

      addNotification: (notif) => {
          const newNotif: Notification = {
              ...notif,
              id: generateId(),
              isRead: false,
              timestamp: new Date().toISOString()
          };
          set(state => ({ notifications: [newNotif, ...state.notifications] }));
      },

      markNotificationRead: (id) => set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),

      markAllNotificationsRead: () => {
          const currentUser = get().currentUser;
          if(!currentUser) return;
          set(state => ({
              notifications: state.notifications.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n)
          }));
      },

      addLeaveRequest: (req) => {
          const newReq: LeaveRequest = { ...req, id: generateId(), status: 'PENDING' };
          
          const admins = get().users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.ADMINISTRATOR);
          const newNotifs = admins.map(admin => ({
              id: generateId(),
              userId: admin.id,
              title: 'New Leave Request',
              message: `${get().currentUser?.username} requested ${req.type} leave`,
              type: 'WARNING' as const,
              isRead: false,
              timestamp: new Date().toISOString(),
              link: '/leaves'
          }));

          set(state => ({ 
              leaves: [...state.leaves, newReq],
              notifications: [...newNotifs, ...state.notifications]
          }));
      },

      updateLeaveStatus: (id, status) => {
          const leave = get().leaves.find(l => l.id === id);
          set(state => ({
              leaves: state.leaves.map(l => l.id === id ? { ...l, status } : l)
          }));
          
          if (leave) {
              const notif: Notification = {
                 id: generateId(),
                 userId: leave.userId,
                 title: `Leave Request ${status}`,
                 message: `Your leave request has been ${status.toLowerCase()}.`,
                 type: status === 'APPROVED' ? 'SUCCESS' : 'ERROR',
                 isRead: false,
                 timestamp: new Date().toISOString(),
                 link: '/profile'
              };
              set(state => ({ notifications: [notif, ...state.notifications] }));
          }
      },

      // Attendance Actions
      clockIn: (userId) => {
          const today = dayjs().format('YYYY-MM-DD');
          const now = new Date().toISOString();
          const existing = get().attendance.find(a => a.userId === userId && a.date === today);
          
          if (!existing) {
             const newRecord: AttendanceRecord = {
                 id: generateId(),
                 userId,
                 date: today,
                 checkIn: now,
                 status: AttendanceStatus.PRESENT
             };
             
             const log: Log = {
                id: generateId(),
                action: 'CLOCK_IN',
                details: `User clocked in at ${dayjs(now).format('HH:mm')}.`,
                userId: userId,
                timestamp: now
             };

             set(state => ({ 
                 attendance: [newRecord, ...state.attendance],
                 logs: [log, ...state.logs]
             }));
          }
      },

      clockOut: (userId) => {
          const today = dayjs().format('YYYY-MM-DD');
          const now = new Date().toISOString();
          
          const log: Log = {
             id: generateId(),
             action: 'CLOCK_OUT',
             details: `User clocked out at ${dayjs(now).format('HH:mm')}.`,
             userId: userId,
             timestamp: now
          };

          set(state => ({
              attendance: state.attendance.map(a => 
                  a.userId === userId && a.date === today 
                  ? { ...a, checkOut: now } 
                  : a
              ),
              logs: [log, ...state.logs]
          }));
      },

      addAttendanceRecord: (record) => {
          set(state => ({ attendance: [{ ...record, id: generateId() }, ...state.attendance] }));
      },

      exportData: () => {
          const state = get();
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "employee_flow_backup.json");
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
      }

    }),
    {
      name: 'employee-flow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ...state, columns: state.columns || [ { id: 'TODO', title: 'To Do' }, { id: 'PROCESSING', title: 'Processing' }, { id: 'DONE', title: 'Done' } ] }),
      onRehydrateStorage: () => (state) => {
        // Ensure columns exist on rehydrate if old storage version
        if (state && (!state.columns || state.columns.length === 0)) {
            state.columns = [
                { id: 'TODO', title: 'To Do' },
                { id: 'PROCESSING', title: 'Processing' },
                { id: 'DONE', title: 'Done' }
            ];
        }
      }
    }
  )
);
