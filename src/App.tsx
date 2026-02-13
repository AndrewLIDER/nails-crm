import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TimelineGrid } from '@/components/TimelineGrid';
import { AppointmentForm } from '@/components/AppointmentForm';
import { AuthDialog } from '@/components/AuthDialog';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Sparkles, Phone, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import './App.css';

function App() {
  const { isGuest, isAdmin, studioPhone } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'calendar' | 'masters' | 'services'>('calendar');
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900 font-sans">
      <AppointmentForm
        selectedDate={selectedDate}
        open={appointmentFormOpen}
        onOpenChange={setAppointmentFormOpen}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase">Nails.S. Studio</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <Button 
              variant="ghost" size="sm" onClick={() => setActiveView('calendar')} 
              className={cn("rounded-lg font-bold", activeView === 'calendar' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500')}
            >
              <Calendar className="h-4 w-4 mr-2" /> Календар
            </Button>
            {isAdmin && (
              <Button 
                variant="ghost" size="sm" onClick={() => setActiveView('masters')} 
                className={cn("rounded-lg font-bold", activeView === 'masters' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500')}
              >
                <Users className="h-4 w-4 mr-2" /> Майстри
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <AuthDialog />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 capitalize">{todayFormatted}</h2>
            <p className="text-slate-400 font-medium">Світла тема Nails.S. Studio</p>
          </div>
          {!isGuest && (
            <div className="flex gap-3">
              <AppointmentForm selectedDate={selectedDate} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {activeView === 'calendar' ? (
            <TimelineGrid 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate} 
              onAddAppointment={() => setAppointmentFormOpen(true)} 
            />
          ) : (
            <div className="p-20 text-center text-slate-300">
               <Hand className="h-12 w-12 mx-auto mb-4 opacity-20" />
               <p className="font-bold uppercase tracking-widest">Розділ оновлюється</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm font-bold text-slate-400">
          <div className="flex items-center gap-2 text-slate-900">
             <Sparkles className="h-4 w-4 text-violet-600" /> NAILS.S. STUDIO
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4" /> {studioPhone}</div>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;