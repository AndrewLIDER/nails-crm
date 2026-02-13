// ============================================
// Nails.S. Studio CRM - Type Definitions
// ============================================

// User Roles
export type UserRole = 'guest' | 'master' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  masterId?: string; // For master role - links to master profile
  avatar?: string;
}

// Masters
export interface Master {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  schedule: WorkSchedule;
  isActive: boolean;
}

export interface WorkSchedule {
  monday: { start: string; end: string; isWorking: boolean };
  tuesday: { start: string; end: string; isWorking: boolean };
  wednesday: { start: string; end: string; isWorking: boolean };
  thursday: { start: string; end: string; isWorking: boolean };
  friday: { start: string; end: string; isWorking: boolean };
  saturday: { start: string; end: string; isWorking: boolean };
  sunday: { start: string; end: string; isWorking: boolean };
}

// Services
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  color: string;
  category: string;
  isActive: boolean;
}

// Clients
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string; // ISO string for localStorage
  lastVisit?: string; // ISO string for localStorage
  totalVisits: number;
  favoriteServices: string[]; // Service IDs
}

export interface ClientVisit {
  id: string;
  clientId: string;
  date: Date;
  masterId: string;
  services: string[];
  totalPrice: number;
  notes?: string;
}

// Appointments
export type AppointmentStatus = 
  | 'new' 
  | 'confirmed' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  masterId: string;
  services: string[];
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

// Time Slot
export interface TimeSlot {
  time: string;
  masterId: string;
  isAvailable: boolean;
  appointment?: Appointment;
}

// Analytics
export interface ClientAnalytics {
  clientId: string;
  totalVisits: number;
  totalSpent: number;
  averageCheck: number;
  favoriteServices: {
    serviceId: string;
    serviceName: string;
    count: number;
  }[];
  visitHistory: ClientVisit[];
  lastVisitDate?: Date;
}

// Cash Register
export interface CashTransaction {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  masterId?: string;
  appointmentId?: string;
  createdBy: string;
}

// UI State
export interface CalendarView {
  date: Date;
  viewMode: 'day' | 'week';
  selectedMasterId?: string;
}

// Form Data
export interface AppointmentFormData {
  clientName: string;
  clientPhone: string;
  masterId: string;
  services: string[];
  date: string;
  time: string;
  notes?: string;
}

// Constants
export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  'new': '#8B5CF6',        // Violet
  'confirmed': '#10B981',  // Green
  'in-progress': '#F59E0B', // Orange
  'completed': '#06B6D4',  // Cyan
  'cancelled': '#EF4444',  // Red
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  'new': 'Новий',
  'confirmed': 'Підтверджено',
  'in-progress': 'В процесі',
  'completed': 'Виконано',
  'cancelled': 'Скасовано',
};

// Predefined masters
export const DEFAULT_MASTERS: Master[] = [
  {
    id: 'master-1',
    name: 'Вікторія',
    color: '#06B6D4',
    isActive: true,
    schedule: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '18:00', isWorking: true },
      saturday: { start: '10:00', end: '16:00', isWorking: true },
      sunday: { start: '00:00', end: '00:00', isWorking: false },
    }
  },
  {
    id: 'master-2',
    name: 'Світлана',
    color: '#EC4899',
    isActive: true,
    schedule: {
      monday: { start: '10:00', end: '19:00', isWorking: true },
      tuesday: { start: '10:00', end: '19:00', isWorking: true },
      wednesday: { start: '10:00', end: '19:00', isWorking: true },
      thursday: { start: '10:00', end: '19:00', isWorking: true },
      friday: { start: '10:00', end: '19:00', isWorking: true },
      saturday: { start: '11:00', end: '17:00', isWorking: true },
      sunday: { start: '00:00', end: '00:00', isWorking: false },
    }
  },
  {
    id: 'master-3',
    name: 'Юля',
    color: '#8B5CF6',
    isActive: true,
    schedule: {
      monday: { start: '09:00', end: '17:00', isWorking: true },
      tuesday: { start: '09:00', end: '17:00', isWorking: true },
      wednesday: { start: '09:00', end: '17:00', isWorking: true },
      thursday: { start: '09:00', end: '17:00', isWorking: true },
      friday: { start: '09:00', end: '17:00', isWorking: true },
      saturday: { start: '10:00', end: '15:00', isWorking: true },
      sunday: { start: '00:00', end: '00:00', isWorking: false },
    }
  }
];

// Predefined services
export const DEFAULT_SERVICES: Service[] = [
  { id: 'svc-1', name: 'Манікюр класичний', price: 350, duration: 60, color: '#06B6D4', category: 'Манікюр', isActive: true },
  { id: 'svc-2', name: 'Манікюр апаратний', price: 400, duration: 75, color: '#06B6D4', category: 'Манікюр', isActive: true },
  { id: 'svc-3', name: 'Покриття гель-лак', price: 450, duration: 90, color: '#EC4899', category: 'Покриття', isActive: true },
  { id: 'svc-4', name: 'Нарощування нігтів', price: 800, duration: 150, color: '#8B5CF6', category: 'Нарощування', isActive: true },
  { id: 'svc-5', name: 'Корекція нарощених', price: 600, duration: 120, color: '#8B5CF6', category: 'Нарощування', isActive: true },
  { id: 'svc-6', name: 'SPA-догляд', price: 250, duration: 30, color: '#10B981', category: 'Догляд', isActive: true },
  { id: 'svc-7', name: 'Дизайн нігтів', price: 150, duration: 30, color: '#F59E0B', category: 'Дизайн', isActive: true },
  { id: 'svc-8', name: 'Зняття покриття', price: 100, duration: 20, color: '#6B7280', category: 'Додатково', isActive: true },
];

// Time slots (15 min intervals)
export const TIME_SLOTS = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30', '18:45',
  '19:00', '19:15', '19:30', '19:45',
];
