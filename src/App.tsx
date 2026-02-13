import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TimelineGrid } from '@/components/TimelineGrid';
import { AppointmentForm } from '@/components/AppointmentForm';
import { AuthDialog } from '@/components/AuthDialog';
import { ClientAnalytics } from '@/components/ClientAnalytics';
import { CashRegister } from '@/components/CashRegister';
import { NotificationsDialog, NewAppointmentPopup } from '@/components/Notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { 
  Calendar, Users, Sparkles, Menu, X, Edit2, Check, Phone, Clock,
  Hand, Palette, Droplets, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './App.css';

// ============================================
// Main App Component - Nails.S. Studio CRM
// ============================================

function App() {
  const { 
    isGuest, 
    isMaster, 
    isAdmin, 
    currentUser,
    masters,
    services,
    updateService,
    studioPhone,
    setStudioPhone,
    notifications,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'calendar' | 'masters' | 'services'>('calendar');
  
  // Appointment form state for grid click
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [preselectedTime, setPreselectedTime] = useState<string | undefined>();
  const [preselectedMasterId, setPreselectedMasterId] = useState<string | undefined>();
  
  // Notification popup state
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [lastNotification, setLastNotification] = useState<{title: string, message: string} | undefined>();
  
  // Services editing state
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  
  // Phone editing state
  const [editingPhone, setEditingPhone] = useState(false);
  const [editPhoneValue, setEditPhoneValue] = useState(studioPhone);

  // Watch for new notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      const latest = unreadNotifications[0];
      if (latest.type === 'new-appointment') {
        setLastNotification({
          title: latest.title,
          message: latest.message
        });
        setShowNotificationPopup(true);
      }
    }
  }, [notifications]);

  // Format current date
  const todayFormatted = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Handle add appointment from grid
  const handleAddAppointment = (time?: string, masterId?: string) => {
    setPreselectedTime(time);
    setPreselectedMasterId(masterId);
    setAppointmentFormOpen(true);
  };

  // Handle service price update
  const handleUpdatePrice = (serviceId: string) => {
    const price = parseInt(editPrice);
    if (!isNaN(price) && price > 0) {
      updateService(serviceId, { price });
      setEditingService(null);
      setEditPrice('');
    }
  };

  // Handle phone update
  const handleUpdatePhone = () => {
    if (editPhoneValue.trim()) {
      setStudioPhone(editPhoneValue.trim());
      setEditingPhone(false);
    }
  };

  // Get service icon
  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Нарощування':
        return <Hand className="h-5 w-5" />;
      case 'Дизайн':
        return <Palette className="h-5 w-5" />;
      case 'Догляд':
        return <Heart className="h-5 w-5" />;
      case 'Покриття':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* New Appointment Popup */}
      <NewAppointmentPopup 
        isOpen={showNotificationPopup}
        onClose={() => setShowNotificationPopup(false)}
        notification={lastNotification}
      />

      {/* Appointment Form Dialog (from grid click) */}
      <AppointmentForm
        selectedDate={selectedDate}
        preselectedTime={preselectedTime}
        preselectedMasterId={preselectedMasterId}
        open={appointmentFormOpen}
        onOpenChange={setAppointmentFormOpen}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00AEEF] to-[#A886BD] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-[#00AEEF] to-[#A886BD] bg-clip-text text-transparent">
                  Nails.S. Studio
                </h1>
                <p className="text-xs text-gray-500">CRM система</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Button 
                variant={activeView === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('calendar')}
                className={activeView === 'calendar' ? 'bg-[#00AEEF]' : ''}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Календар
              </Button>
              
              {isAdmin && (
                <>
                  <Button 
                    variant={activeView === 'masters' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('masters')}
                    className={activeView === 'masters' ? 'bg-[#00AEEF]' : ''}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Майстри
                  </Button>
                  <Button 
                    variant={activeView === 'services' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('services')}
                    className={activeView === 'services' ? 'bg-[#00AEEF]' : ''}
                  >
                    <Hand className="h-4 w-4 mr-2" />
                    Послуги
                  </Button>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Role Badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  "hidden sm:inline-flex",
                  isAdmin && "border-[#A886BD] text-[#A886BD]",
                  isMaster && "border-[#00AEEF] text-[#00AEEF]",
                  isGuest && "border-gray-400 text-gray-500"
                )}
              >
                {isAdmin ? 'Адмін' : isMaster ? 'Майстер' : 'Гість'}
              </Badge>

              {/* Notifications (for masters) */}
              {isMaster && <NotificationsDialog />}

              {/* Analytics Button */}
              <ClientAnalytics />

              {/* Cash Register (Admin only) */}
              <CashRegister />

              {/* Auth */}
              <AuthDialog />

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <Button 
                variant={activeView === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveView('calendar');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Календар
              </Button>
              
              {isAdmin && (
                <>
                  <Button 
                    variant={activeView === 'masters' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setActiveView('masters');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Майстри
                  </Button>
                  <Button 
                    variant={activeView === 'services' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setActiveView('services');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Hand className="h-4 w-4 mr-2" />
                    Послуги
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Date & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {todayFormatted}
            </h2>
            <p className="text-sm text-gray-500">
              {isGuest 
                ? 'Режим перегляду - деякі функції обмежені' 
                : isMaster 
                  ? `Ви працюєте як ${currentUser?.name}` 
                  : 'Повний доступ до системи'}
            </p>
          </div>
          
          {!isGuest && (
            <AppointmentForm selectedDate={selectedDate} />
          )}
        </div>

        {/* Views */}
        {activeView === 'calendar' && (
          <TimelineGrid 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate}
            onAddAppointment={handleAddAppointment}
          />
        )}

        {activeView === 'masters' && isAdmin && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Майстри студії</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {masters.map(master => (
                <div 
                  key={master.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-[#00AEEF] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: master.color }}
                    >
                      {master.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{master.name}</h4>
                      <Badge variant={master.isActive ? 'default' : 'secondary'}>
                        {master.isActive ? 'Активний' : 'Неактивний'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Графік роботи:</span>
                    </div>
                    <div className="pl-6 space-y-0.5 text-xs">
                      <div>Пн-Пт: {master.schedule.monday.start} - {master.schedule.monday.end}</div>
                      <div>Сб: {master.schedule.saturday.start} - {master.schedule.saturday.end}</div>
                      <div>Нд: Вихідний</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'services' && isAdmin && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Послуги студії</h3>
            <div className="grid gap-3">
              {services.map(service => (
                <div 
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#00AEEF] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${service.color}20`, color: service.color }}
                    >
                      {getServiceIcon(service.category)}
                    </div>
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-500">{service.category} • {service.duration} хв</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingService === service.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 h-8"
                          autoFocus
                        />
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-green-500"
                          onClick={() => handleUpdatePrice(service.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{service.price} грн</span>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-gray-400 hover:text-[#00AEEF]"
                          onClick={() => {
                            setEditingService(service.id);
                            setEditPrice(service.price.toString());
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00AEEF]" />
              <span>Nails.S. Studio CRM</span>
            </div>
            <div className="flex items-center gap-4">
              {editingPhone ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editPhoneValue}
                    onChange={(e) => setEditPhoneValue(e.target.value)}
                    className="w-40 h-7 text-sm"
                    autoFocus
                  />
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="h-7 w-7 text-green-500"
                    onClick={handleUpdatePhone}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button 
                  className="flex items-center gap-1 hover:text-[#00AEEF] transition-colors"
                  onClick={() => setEditingPhone(true)}
                >
                  <Phone className="h-3 w-3" />
                  {studioPhone}
                  <Edit2 className="h-3 w-3 ml-1 opacity-50" />
                </button>
              )}
              <span>|</span>
              <span>© 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
