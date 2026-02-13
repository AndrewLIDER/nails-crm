import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TimelineGrid } from '@/components/TimelineGrid';
import { AppointmentForm } from '@/components/AppointmentForm';
import { AuthDialog } from '@/components/AuthDialog';
import { ClientAnalytics } from '@/components/ClientAnalytics';
import { CashRegister } from '@/components/CashRegister';
import { NotificationsDialog, NewAppointmentPopup } from '@/components/Notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Users, Sparkles, Phone, Hand
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './App.css';

function App() {
  const { 
    isGuest, isMaster, isAdmin, currentUser, studioPhone, notifications
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'calendar' | 'masters' | 'services'>('calendar');
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [lastNotification, setLastNotification] = useState<{title: string, message: string} | undefined>();

  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      const latest = unreadNotifications[0];
      if (latest.type === 'new-appointment') {
        setLastNotification({ title: latest.title, message: latest.message });
        setShowNotificationPopup(true);
      }
    }
  }, [notifications]);

  const todayFormatted = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      <NewAppointmentPopup 
        isOpen={showNotificationPopup} 
        onClose={() => setShowNotificationPopup(false)} 
        notification={lastNotification} 
      />
      
      <AppointmentForm
        selectedDate={selectedDate}
        open={appointmentFormOpen}
        onOpenChange={setAppointmentFormOpen}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center border border-violet-200">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Nails.S. Studio</h1>
                <p className="text-xs text-slate-500">Система керування</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Button 
                variant={activeView === 'calendar' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveView('calendar')} 
                className={cn(activeView === 'calendar' ? 'bg-violet-600 text-white hover:bg-violet-700' : 'text-slate-600 hover:bg-slate-100')}
              >
                <Calendar className="h-4 w-4 mr-2" /> Календар
              </Button>
              {isAdmin && (
                <>
                  <Button 
                    variant={activeView === 'masters' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView('masters')} 
                    className={cn(activeView === 'masters' ? 'bg-violet-600 text-white hover:bg-violet-700' : 'text-slate-600 hover:bg-slate-100')}
                  >
                    <Users className="h-4 w-4 mr-2" /> Майстри
                  </Button>
                  <Button 
                    variant={activeView === 'services' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView('services')} 
                    className={cn(activeView === 'services' ? 'bg-violet-600 text-white hover:bg-violet-700' : 'text-slate-600 hover:bg-slate-100')}
                  >
                    <Hand className="h-4 w-4 mr-2" /> Послуги
                  </Button>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <Badge className="hidden sm:inline-flex bg-slate-100 text-slate-700 border-slate-200">
                {isAdmin ? 'Адмін' : isMaster ? 'Майстер' : 'Гість'}
              </Badge>
              {isMaster && <NotificationsDialog />}
              <ClientAnalytics />
              <CashRegister />
              <AuthDialog />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{todayFormatted}</h2>
            <p className="text-slate-500">
               {isGuest ? 'Режим перегляду' : `Вітаємо, ${currentUser?.name || 'Адмін'}`}
            </p>
          </div>
          {!isGuest && (
            <div className="flex gap-2">
              <AppointmentForm selectedDate={selectedDate} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {activeView === 'calendar' && (
            <TimelineGrid 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate} 
              onAddAppointment={() => setAppointmentFormOpen(true)} 
            />
          )}

          {(activeView === 'masters' || activeView === 'services') && isAdmin && (
            <div className="p-20 text-center text-slate-400">
              Розділ знаходиться в стадії оновлення
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Sparkles className="h-4 w-4 text-violet-600" /> Nails.S. Studio
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1"><Phone className="h-4 w-4" /> {studioPhone}</div>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;