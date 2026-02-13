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
  Hand, Palette, Droplets, Heart, Plus, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './App.css';

function App() {
  const { 
    isGuest, isMaster, isAdmin, currentUser, masters, services,
    addMaster, updateMaster, deleteMaster, addService, updateService,
    deleteService, studioPhone, setStudioPhone, notifications,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'calendar' | 'masters' | 'services'>('calendar');
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  
  // Цветовые палитры для светлой темы
  const colorOptions = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

  const todayFormatted = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    // ГЛАВНЫЙ ФОН: Теперь светлый (серый шелк / белый)
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      
      {/* ШАПКА: Светлая с легкой тенью */}
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
                className={cn(activeView === 'calendar' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100')}
              >
                <Calendar className="h-4 w-4 mr-2" /> Календар
              </Button>
              {isAdmin && (
                <>
                  <Button 
                    variant={activeView === 'masters' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView('masters')} 
                    className={cn(activeView === 'masters' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100')}
                  >
                    <Users className="h-4 w-4 mr-2" /> Майстри
                  </Button>
                  <Button 
                    variant={activeView === 'services' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setActiveView('services')} 
                    className={cn(activeView === 'services' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100')}
                  >
                    <Hand className="h-4 w-4 mr-2" /> Послуги
                  </Button>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <Badge className="hidden sm:inline-flex bg-slate-100 text-slate-700 border-slate-200">
                {isAdmin ? 'Адміністратор' : 'Майстер'}
              </Badge>
              <AuthDialog />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{todayFormatted}</h2>
            <p className="text-slate-500">Вітаємо у Nails.S. Studio</p>
          </div>
          {!isGuest && (
            <div className="flex gap-2">
              <AppointmentForm selectedDate={selectedDate} />
            </div>
          )}
        </div>

        {/* КОНТЕНТ: Сетка календаря теперь на белом фоне */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {activeView === 'calendar' && (
            <TimelineGrid 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate} 
              onAddAppointment={() => setAppointmentFormOpen(true)} 
            />
          )}
        </div>

        {activeView === 'masters' && isAdmin && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
             {masters.map(master => (
                <div key={master.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: master.color }}>
                      {master.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{master.name}</h4>
                      <p className="text-xs text-slate-500">Топ-майстер</p>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        )}
      </main>

      {/* ФУТЕР: Светлый */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Nails.S. Studio
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" /> {studioPhone}
            </div>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;