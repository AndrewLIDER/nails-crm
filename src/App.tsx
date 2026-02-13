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
  Calendar, Users, Sparkles, Phone, Hand, Clock, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './App.css';

function App() {
  const { 
    isGuest, isMaster, isAdmin, currentUser, masters, studioPhone, notifications 
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
    // ГЛАВНЫЙ ФОН ТЕПЕРЬ БЕЛЫЙ (bg-white), ТЕКСТ ТЕМНЫЙ (text-slate-900)
    <div className="min-h-screen bg-white flex flex-col text-slate-900 font-sans">
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

      {/* ШАПКА САЙТА - СВЕТЛАЯ */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nails.S. Studio</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <Button 
              variant="ghost"
              size="sm" 
              onClick={() => setActiveView('calendar')} 
              className={cn("rounded-lg font-bold transition-all", activeView === 'calendar' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:bg-white')}
            >
              <Calendar className="h-4 w-4 mr-2" /> Календар
            </Button>
            {isAdmin && (
              <Button 
                variant="ghost"
                size="sm" 
                onClick={() => setActiveView('masters')} 
                className={cn("rounded-lg font-bold transition-all", activeView === 'masters' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:bg-white')}
              >
                <Users className="h-4 w-4 mr-2" /> Майстри
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 font-bold">
              {isAdmin ? 'Адмін' : 'Майстер'}
            </Badge>
            <AuthDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{todayFormatted}</h2>
            <p className="text-slate-400 font-medium mt-1">
               {isGuest ? 'Режим перегляду' : `Вітаємо, ${currentUser?.name || 'Адмін'}`}
            </p>
          </div>
          {!isGuest && (
            <div className="flex gap-3">
              <AppointmentForm selectedDate={selectedDate} />
            </div>
          )}
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
          {activeView === 'calendar' && (
            <TimelineGrid 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate} 
              onAddAppointment={() => setAppointmentFormOpen(true)} 
            />
          )}

          {/* КАРТОЧКИ МАСТЕРОВ В СВЕТЛОМ СТИЛЕ */}
          {activeView === 'masters' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
              {masters.map((master) => (
                <div key={master.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                    <User className="text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{master.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">Топ-майстер</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-500">Зміна:</span>
                      <span className="font-bold">09:00 - 20:00</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ФУТЕР - СВЕТЛЫЙ */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-black text-slate-900 tracking-tighter">
            <Sparkles className="h-5 w-5 text-violet-600" /> NAILS.S. STUDIO
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 text-slate-600">
              <Phone className="h-4 w-4 text-violet-500" /> {studioPhone}
            </div>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;