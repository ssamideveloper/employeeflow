
export enum UserRole {
  ADMIN = 'ADMIN',
  ADMINISTRATOR = 'ADMINISTRATOR',
  EMPLOYEE = 'EMPLOYEE',
}

// Keep for default ID references, but usage should be permissive
export enum TaskStatus {
  TODO = 'TODO',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string; // 'PDF', 'IMAGE', etc.
  url: string; // Base64
  uploadedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  needsPasswordChange?: boolean; 
  role: UserRole;
  avatar: string;
  isOnline: boolean;
  department?: string;
  lastActiveAt?: string;
  
  // Extended Profile Fields
  jobTitle?: string;
  phone?: string;
  address?: string;
  salary?: number;
  joinedAt?: string;
  documents?: EmployeeDocument[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export type SubmissionType = 'LINK' | 'TEXT' | 'CODE' | 'PDF';

export interface TaskSubmission {
  id: string;
  type: SubmissionType;
  content: string; 
  name?: string; 
  language?: string; 
  submittedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // Changed from TaskStatus to string for dynamic columns
  priority: TaskPriority;
  assigneeId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  checklist: ChecklistItem[];
  completedAt?: string;
  completionNotes?: string; 
  submissions: TaskSubmission[]; 
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  readBy: string[];
}

export interface Log {
  id: string;
  action: string;
  details: string;
  userId: string;
  timestamp: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'Vacation' | 'Sick' | 'WFH';
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
}

export interface Notification {
  id: string;
  userId: string; 
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  timestamp: string;
  link?: string; 
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: AttendanceStatus;
}

// Global declaration for Highlight.js injected in index.html
declare global {
  interface Window {
    hljs: any;
  }
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  columns: KanbanColumn[];
  messages: Message[];
  logs: Log[];
  leaves: LeaveRequest[];
  notifications: Notification[];
  attendance: AttendanceRecord[];
  darkMode: boolean;
  
  // Actions
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  changePassword: (newPassword: string) => void;
  toggleDarkMode: () => void;
  
  // Admin Actions
  addUser: (user: Omit<User, 'id' | 'isOnline' | 'documents'>) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  addDocument: (userId: string, doc: Omit<EmployeeDocument, 'id' | 'uploadedAt'>) => void;
  removeDocument: (userId: string, docId: string) => void;
  
  // Presence Actions
  updatePresence: () => void;
  checkInactiveUsers: () => void;
  cleanupOldData: () => void;
  
  // Kanban Board Actions
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  setColumns: (columns: KanbanColumn[]) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'checklist' | 'submissions'>) => void;
  updateTaskStatus: (taskId: string, status: string, notes?: string) => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
  addTaskSubmission: (taskId: string, submission: Omit<TaskSubmission, 'id' | 'submittedAt'>) => void;
  deleteTask: (taskId: string) => void;
  
  // Checklist Actions
  addChecklistItem: (taskId: string, text: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;
  
  // Chat Actions
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'readBy'>) => void;
  markMessagesRead: (senderId: string, receiverId: string) => void;

  // Notification Actions
  addNotification: (notif: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Leave Actions
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;

  // Attendance Actions
  clockIn: (userId: string) => void;
  clockOut: (userId: string) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;

  // Utils
  exportData: () => void;
}
