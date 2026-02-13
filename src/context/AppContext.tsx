import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { 
  User, Master, Client, Service, Appointment, 
  ClientAnalytics, CashTransaction, AppointmentFormData
} from '@/types';
import { 
  DEFAULT_MASTERS, DEFAULT_SERVICES
} from '@/types';

// ============================================
// Authentication & App State Context with LocalStorage
// ============================================

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'new-appointment' | 'status-change' | 'system';
  appointmentId?: string;
}

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (name: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  
  // Role checks
  isGuest: boolean;
  isMaster: boolean;
  isAdmin: boolean;
  canViewClientDetails: boolean;
  canEditAppointments: boolean;
  canViewAllMasters: boolean;
  canManageSettings: boolean;
  
  // Data
  masters: Master[];
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  transactions: CashTransaction[];
  notifications: Notification[];
  studioPhone: string;
  
  // Actions - Appointments
  addAppointment: (data: AppointmentFormData) => Appointment | null;
  updateAppointment: (id: string, data: Partial<Appointment>) => boolean;
  deleteAppointment: (id: string) => boolean;
  moveAppointment: (id: string, newMasterId: string, newTime: string) => boolean;
  
  // Actions - Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits' | 'favoriteServices'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => boolean;
  getClientAnalytics: (clientId: string) => ClientAnalytics | null;
  getClientVisits: (clientId: string) => Appointment[];
  getRecommendedServices: (clientId: string) => Service[];
  
  // Actions - Masters (CRUD)
  addMaster: (master: Omit<Master, 'id'>) => Master;
  updateMaster: (id: string, data: Partial<Master>) => boolean;
  deleteMaster: (id: string) => boolean;
  
  // Actions - Services (CRUD)
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (id: string, data: Partial<Service>) => boolean;
  deleteService: (id: string) => boolean;
  
  // Studio settings
  setStudioPhone: (phone: string) => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadNotificationsCount: number;
  
  // Cash register
  addTransaction: (transaction: Omit<CashTransaction, 'id' | 'date'>) => void;
  getDailyRevenue: (date: Date) => number;
  
  // Utils
  getAppointmentsForDate: (date: Date) => Appointment[];
  getAppointmentsForMaster: (masterId: string, date: Date) => Appointment[];
  isTimeSlotAvailable: (masterId: string, date: Date, time: string, duration: number, excludeAppointmentId?: string) => boolean;
  calculateEndTime: (startTime: string, duration: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Demo users
const DEMO_USERS: User[] = [
  { id: 'user-admin', name: 'Адміністратор', role: 'admin' },
  { id: 'user-viktoria', name: 'Вікторія', role: 'master', masterId: 'master-1' },
  { id: 'user-svitlana', name: 'Світлана', role: 'master', masterId: 'master-2' },
  { id: 'user-yulia', name: 'Юля', role: 'master', masterId: 'master-3' },
];

// Simple password check
const PASSWORDS: Record<string, string> = {
  'Адміністратор': 'admin123',
  'Вікторія': 'viktoria123',
  'Світлана': 'svitlana123',
  'Юля': 'yulia123',
};

// LocalStorage keys
const STORAGE_KEYS = {
  MASTERS: 'nails_crm_masters',
  SERVICES: 'nails_crm_services',
  CLIENTS: 'nails_crm_clients',
  APPOINTMENTS: 'nails_crm_appointments',
  TRANSACTIONS: 'nails_crm_transactions',
  NOTIFICATIONS: 'nails_crm_notifications',
  STUDIO_PHONE: 'nails_crm_studio_phone',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data state with LocalStorage
  const [masters, setMasters] = useState<Master[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTERS);
      return saved ? JSON.parse(saved) : DEFAULT_MASTERS;
    }
    return DEFAULT_MASTERS;
  });
  
  const [services, setServices] = useState<Service[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
    }
    return DEFAULT_SERVICES;
  });
  
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        return parsed.map((a: any) => ({
          ...a,
          startTime: new Date(a.startTime),
          endTime: new Date(a.endTime),
          createdAt: new Date(a.createdAt),
        }));
      }
    }
    return [];
  });
  
  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({ ...t, date: new Date(t.date) }));
      }
    }
    return [];
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [studioPhone, setStudioPhoneState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.STUDIO_PHONE) || '+380 67 123 4567';
    }
    return '+380 67 123 4567';
  });

  // Save to LocalStorage on changes
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MASTERS, JSON.stringify(masters)); }, [masters]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STUDIO_PHONE, studioPhone); }, [studioPhone]);

  // Initialize with guest role
  useEffect(() => {
    if (!currentUser) {
      setCurrentUser({ id: 'guest', name: 'Гість', role: 'guest' });
    }
  }, []);

  // Auth functions
  const login = useCallback((name: string, password: string): boolean => {
    if (PASSWORDS[name] === password) {
      const user = DEMO_USERS.find(u => u.name === name);
      if (user) {
        setCurrentUser(user);
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser({ id: 'guest', name: 'Гість', role: 'guest' });
  }, []);

  // Role checks
  const isGuest = currentUser?.role === 'guest';
  const isMaster = currentUser?.role === 'master';
  const isAdmin = currentUser?.role === 'admin';
  
  const canViewClientDetails = isMaster || isAdmin;
  const canEditAppointments = isMaster || isAdmin;
  const canViewAllMasters = isAdmin;
  const canManageSettings = isAdmin;

  // Helper: Generate ID
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Helper: Calculate end time
  const calculateEndTime = useCallback((startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }, []);

  // Helper: Parse time to minutes
  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Check if time slot is available
  const isTimeSlotAvailable = useCallback((
    masterId: string, 
    date: Date, 
    time: string, 
    duration: number,
    excludeAppointmentId?: string
  ): boolean => {
    const dateStr = date.toDateString();
    const startMinutes = timeToMinutes(time);
    const endMinutes = startMinutes + duration;

    const conflictingAppointment = appointments.find(appt => {
      if (appt.masterId !== masterId) return false;
      if (appt.id === excludeAppointmentId) return false;
      if (appt.status === 'cancelled') return false;
      
      const apptDateStr = new Date(appt.startTime).toDateString();
      if (apptDateStr !== dateStr) return false;
      
      const apptStart = timeToMinutes(`${new Date(appt.startTime).getHours().toString().padStart(2, '0')}:${new Date(appt.startTime).getMinutes().toString().padStart(2, '0')}`);
      const apptEnd = timeToMinutes(`${new Date(appt.endTime).getHours().toString().padStart(2, '0')}:${new Date(appt.endTime).getMinutes().toString().padStart(2, '0')}`);
      
      return (startMinutes < apptEnd && endMinutes > apptStart);
    });

    return !conflictingAppointment;
  }, [appointments]);

  // Add appointment
  const addAppointment = useCallback((data: AppointmentFormData): Appointment | null => {
    const serviceObjects = services.filter(s => data.services.includes(s.id));
    const totalDuration = serviceObjects.reduce((sum, s) => sum + s.duration, 0);
    
    const dateObj = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    
    // Check availability
    if (!isTimeSlotAvailable(data.masterId, dateObj, data.time, totalDuration)) {
      return null;
    }

    const endTime = new Date(dateObj);
    endTime.setMinutes(endTime.getMinutes() + totalDuration);

    const newAppointment: Appointment = {
      id: generateId(),
      clientId: generateId(),
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      masterId: data.masterId,
      services: data.services,
      startTime: dateObj,
      endTime,
      status: 'new',
      notes: data.notes,
      createdAt: new Date(),
      createdBy: currentUser?.id || 'guest',
    };

    setAppointments(prev => [...prev, newAppointment]);
    
    // Add notification for the master
    const masterName = masters.find(m => m.id === data.masterId)?.name || 'Майстер';
    const newNotification: Notification = {
      id: generateId(),
      title: 'Новий запис!',
      message: `${data.clientName} записався на ${data.time} до ${masterName}. Послуг: ${data.services.length}`,
      date: new Date().toISOString(),
      read: false,
      type: 'new-appointment',
      appointmentId: newAppointment.id,
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Update or create client
    setClients(prev => {
      const existingClient = prev.find(c => c.phone === data.clientPhone);
      const now = new Date().toISOString();
      if (existingClient) {
        return prev.map(c => 
          c.phone === data.clientPhone 
            ? { ...c, lastVisit: now, totalVisits: c.totalVisits + 1 }
            : c
        );
      } else {
        const newClient: Client = {
          id: generateId(),
          name: data.clientName,
          phone: data.clientPhone,
          createdAt: now,
          lastVisit: now,
          totalVisits: 1,
          favoriteServices: data.services,
        };
        return [...prev, newClient];
      }
    });

    return newAppointment;
  }, [services, isTimeSlotAvailable, currentUser, masters]);

  // Update appointment
  const updateAppointment = useCallback((id: string, data: Partial<Appointment>): boolean => {
    setAppointments(prev => 
      prev.map(appt => appt.id === id ? { ...appt, ...data } : appt)
    );
    return true;
  }, []);

  // Delete appointment
  const deleteAppointment = useCallback((id: string): boolean => {
    setAppointments(prev => prev.filter(appt => appt.id !== id));
    return true;
  }, []);

  // Move appointment (drag & drop)
  const moveAppointment = useCallback((id: string, newMasterId: string, newTime: string): boolean => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return false;

    const serviceObjects = services.filter(s => appointment.services.includes(s.id));
    const totalDuration = serviceObjects.reduce((sum, s) => sum + s.duration, 0);
    
    const newDate = new Date(appointment.startTime);
    const [hours, minutes] = newTime.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);

    if (!isTimeSlotAvailable(newMasterId, newDate, newTime, totalDuration, id)) {
      return false;
    }

    const newEndTime = new Date(newDate);
    newEndTime.setMinutes(newEndTime.getMinutes() + totalDuration);

    setAppointments(prev =>
      prev.map(appt =>
        appt.id === id
          ? { ...appt, masterId: newMasterId, startTime: newDate, endTime: newEndTime }
          : appt
      )
    );
    return true;
  }, [appointments, services, isTimeSlotAvailable]);

  // Add client
  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt' | 'totalVisits' | 'favoriteServices'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      totalVisits: 0,
      favoriteServices: [],
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  // Update client
  const updateClient = useCallback((id: string, data: Partial<Client>): boolean => {
    setClients(prev =>
      prev.map(client => client.id === id ? { ...client, ...data } : client)
    );
    return true;
  }, []);

  // ===== MASTERS CRUD =====
  const addMaster = useCallback((masterData: Omit<Master, 'id'>): Master => {
    const newMaster: Master = {
      ...masterData,
      id: `master-${generateId()}`,
    };
    setMasters(prev => [...prev, newMaster]);
    return newMaster;
  }, []);

  const updateMaster = useCallback((id: string, data: Partial<Master>): boolean => {
    setMasters(prev =>
      prev.map(master => master.id === id ? { ...master, ...data } : master)
    );
    return true;
  }, []);

  const deleteMaster = useCallback((id: string): boolean => {
    setMasters(prev => prev.filter(master => master.id !== id));
    // Also delete all appointments for this master
    setAppointments(prev => prev.filter(appt => appt.masterId !== id));
    return true;
  }, []);

  // ===== SERVICES CRUD =====
  const addService = useCallback((serviceData: Omit<Service, 'id'>): Service => {
    const newService: Service = {
      ...serviceData,
      id: `svc-${generateId()}`,
    };
    setServices(prev => [...prev, newService]);
    return newService;
  }, []);

  const updateService = useCallback((id: string, data: Partial<Service>): boolean => {
    setServices(prev =>
      prev.map(service => service.id === id ? { ...service, ...data } : service)
    );
    return true;
  }, []);

  const deleteService = useCallback((id: string): boolean => {
    setServices(prev => prev.filter(service => service.id !== id));
    return true;
  }, []);

  // Get client analytics
  const getClientAnalytics = useCallback((clientId: string): ClientAnalytics | null => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const clientAppointments = appointments.filter(a => a.clientId === clientId && a.status !== 'cancelled');
    const totalSpent = clientAppointments.reduce((sum, a) => {
      const apptServices = services.filter(s => a.services.includes(s.id));
      return sum + apptServices.reduce((sSum, s) => sSum + s.price, 0);
    }, 0);

    // Calculate favorite services
    const serviceCount: Record<string, number> = {};
    clientAppointments.forEach(a => {
      a.services.forEach(sId => {
        serviceCount[sId] = (serviceCount[sId] || 0) + 1;
      });
    });

    const favoriteServices = Object.entries(serviceCount)
      .map(([serviceId, count]) => ({
        serviceId,
        serviceName: services.find(s => s.id === serviceId)?.name || 'Unknown',
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      clientId,
      totalVisits: clientAppointments.length,
      totalSpent,
      averageCheck: clientAppointments.length > 0 ? totalSpent / clientAppointments.length : 0,
      favoriteServices,
      visitHistory: [],
      lastVisitDate: client.lastVisit ? new Date(client.lastVisit) : undefined,
    };
  }, [clients, appointments, services]);

  // Get client visits
  const getClientVisits = useCallback((clientId: string): Appointment[] => {
    return appointments
      .filter(a => a.clientId === clientId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [appointments]);

  // Get recommended services
  const getRecommendedServices = useCallback((clientId: string): Service[] => {
    const analytics = getClientAnalytics(clientId);
    if (!analytics || analytics.favoriteServices.length === 0) {
      return services.slice(0, 3);
    }
    return analytics.favoriteServices
      .map(fs => services.find(s => s.id === fs.serviceId))
      .filter(Boolean) as Service[];
  }, [getClientAnalytics, services]);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.filter(n => !n.read));
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Studio phone
  const setStudioPhone = useCallback((phone: string) => {
    setStudioPhoneState(phone);
  }, []);

  // Cash register
  const addTransaction = useCallback((transaction: Omit<CashTransaction, 'id' | 'date'>) => {
    const newTransaction: CashTransaction = {
      ...transaction,
      id: generateId(),
      date: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  const getDailyRevenue = useCallback((date: Date): number => {
    const dateStr = date.toDateString();
    return transactions
      .filter(t => t.type === 'income' && new Date(t.date).toDateString() === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Get appointments for date
  const getAppointmentsForDate = useCallback((date: Date): Appointment[] => {
    const dateStr = date.toDateString();
    return appointments.filter(a => 
      new Date(a.startTime).toDateString() === dateStr && 
      a.status !== 'cancelled'
    );
  }, [appointments]);

  // Get appointments for master
  const getAppointmentsForMaster = useCallback((masterId: string, date: Date): Appointment[] => {
    const dateStr = date.toDateString();
    return appointments.filter(a => 
      a.masterId === masterId && 
      new Date(a.startTime).toDateString() === dateStr &&
      a.status !== 'cancelled'
    );
  }, [appointments]);

  const value = useMemo(() => ({
    currentUser,
    login,
    logout,
    isAuthenticated: currentUser?.role !== 'guest',
    isGuest,
    isMaster,
    isAdmin,
    canViewClientDetails,
    canEditAppointments,
    canViewAllMasters,
    canManageSettings,
    masters,
    services,
    clients,
    appointments,
    transactions,
    notifications,
    studioPhone,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    moveAppointment,
    addClient,
    updateClient,
    getClientAnalytics,
    getClientVisits,
    getRecommendedServices,
    addMaster,
    updateMaster,
    deleteMaster,
    addService,
    updateService,
    deleteService,
    setStudioPhone,
    markNotificationAsRead,
    clearNotifications,
    unreadNotificationsCount,
    addTransaction,
    getDailyRevenue,
    getAppointmentsForDate,
    getAppointmentsForMaster,
    isTimeSlotAvailable,
    calculateEndTime,
  }), [
    currentUser, login, logout, isGuest, isMaster, isAdmin,
    canViewClientDetails, canEditAppointments, canViewAllMasters, canManageSettings,
    masters, services, clients, appointments, transactions, notifications, studioPhone,
    addAppointment, updateAppointment, deleteAppointment, moveAppointment,
    addClient, updateClient, getClientAnalytics, getClientVisits, getRecommendedServices,
    addMaster, updateMaster, deleteMaster, addService, updateService, deleteService,
    setStudioPhone, markNotificationAsRead, clearNotifications, unreadNotificationsCount,
    addTransaction, getDailyRevenue, getAppointmentsForDate, getAppointmentsForMaster,
    isTimeSlotAvailable, calculateEndTime,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
