import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Clock, User, Phone, GripVertical, 
  AlertCircle, ChevronLeft, ChevronRight, Trash2,
  Sparkles, Palette, Hand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';
import { STATUS_COLORS, STATUS_LABELS, TIME_SLOTS } from '@/types';

// ============================================
// Timeline Grid Component - Main Calendar View
// ============================================

interface TimelineGridProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddAppointment?: (time?: string, masterId?: string) => void;
}

export function TimelineGrid({ selectedDate, onDateChange, onAddAppointment }: TimelineGridProps) {
  const {
    masters,
    services,
    isGuest,
    isMaster,
    isAdmin,
    currentUser,
    canEditAppointments,
    moveAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsForDate,
    getAppointmentsForMaster,
  } = useApp();

  const [dragOverSlot, setDragOverSlot] = useState<{ masterId: string; time: string } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // Filter masters based on role
  const visibleMasters = isAdmin 
    ? masters 
    : masters.filter(m => m.id === currentUser?.masterId);

  // Get appointments for selected date
  const dayAppointments = getAppointmentsForDate(selectedDate);
  
  // Get appointments for current master (for mobile view)
  const masterAppointments = isMaster && currentUser?.masterId
    ? getAppointmentsForMaster(currentUser.masterId, selectedDate)
    : [];

  // Helper: Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('uk-UA', options);
  };

  // Helper: Get appointment for slot
  const getAppointmentForSlot = (masterId: string, time: string): Appointment | undefined => {
    return dayAppointments.find(appt => {
      if (appt.masterId !== masterId) return false;
      const apptStart = `${new Date(appt.startTime).getHours().toString().padStart(2, '0')}:${new Date(appt.startTime).getMinutes().toString().padStart(2, '0')}`;
      return apptStart === time;
    });
  };

  // Helper: Check if slot is occupied by ongoing appointment
  const isSlotOccupied = (masterId: string, time: string): boolean => {
    const [slotHour, slotMin] = time.split(':').map(Number);
    const slotMinutes = slotHour * 60 + slotMin;

    return dayAppointments.some(appt => {
      if (appt.masterId !== masterId || appt.status === 'cancelled') return false;
      
      const startHour = new Date(appt.startTime).getHours();
      const startMin = new Date(appt.startTime).getMinutes();
      const startMinutes = startHour * 60 + startMin;
      
      const endHour = new Date(appt.endTime).getHours();
      const endMin = new Date(appt.endTime).getMinutes();
      const endMinutes = endHour * 60 + endMin;
      
      return slotMinutes > startMinutes && slotMinutes < endMinutes;
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    if (!canEditAppointments) {
      e.preventDefault();
      return;
    }
    
    if (isMaster && appointment.masterId !== currentUser?.masterId) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('appointmentId', appointment.id);
  };

  const handleDragEnd = () => {
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, masterId: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ masterId, time });
  };

  const handleDrop = (e: React.DragEvent, masterId: string, time: string) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData('appointmentId');
    
    if (appointmentId) {
      const success = moveAppointment(appointmentId, masterId, time);
      if (!success) {
        alert('Цей час вже зайнятий!');
      }
    }
    
    handleDragEnd();
  };

  // Status change handler
  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    updateAppointment(appointmentId, { status: newStatus });
  };

  // Delete handler
  const handleDelete = (appointmentId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цей запис?')) {
      deleteAppointment(appointmentId);
    }
  };

  // Navigation handlers
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Handle add appointment click
  const handleAddClick = (time: string, masterId: string) => {
    if (onAddAppointment) {
      onAddAppointment(time, masterId);
    }
  };

  // Get service names for appointment
  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds
      .map(id => services.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Get service duration
  const getServiceDuration = (serviceIds: string[]) => {
    return serviceIds.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      return sum + (service?.duration || 0);
    }, 0);
  };

  // Get service icon
  const getServiceIcon = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return <Sparkles className="h-3 w-3" />;
    
    if (service.category === 'Нарощування') {
      return <Hand className="h-3 w-3" />;
    } else if (service.category === 'Дизайн') {
      return <Palette className="h-3 w-3" />;
    }
    return <Sparkles className="h-3 w-3" />;
  };

  // Mobile view for masters - list of appointments
  if (isMaster && !isAdmin) {
    return (
      <div className="flex flex-col h-full bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-violet-600/30 to-purple-600/30">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousDay} className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20">
              Сьогодні
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextDay} className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-sm font-semibold text-white">
            {formatDate(selectedDate)}
          </h2>
        </div>

        {/* Mobile List View */}
        <div className="flex-1 overflow-auto p-4">
          {masterAppointments.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">На сьогодні записів немає</p>
              <p className="text-sm">Відпочивайте або додайте новий запис</p>
            </div>
          ) : (
            <div className="space-y-3">
              {masterAppointments
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map(appointment => (
                <div
                  key={appointment.id}
                  className="bg-white/10 rounded-xl border border-white/20 p-4 active:scale-[0.98] transition-transform"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowAppointmentDialog(true);
                  }}
                >
                  {/* Time & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-violet-400" />
                      <span className="font-semibold text-lg text-white">
                        {new Date(appointment.startTime).getHours().toString().padStart(2, '0')}:
                        {new Date(appointment.startTime).getMinutes().toString().padStart(2, '0')}
                      </span>
                      <span className="text-white/40">-</span>
                      <span className="text-white/60">
                        {new Date(appointment.endTime).getHours().toString().padStart(2, '0')}:
                        {new Date(appointment.endTime).getMinutes().toString().padStart(2, '0')}
                      </span>
                    </div>
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: STATUS_COLORS[appointment.status],
                        color: 'white'
                      }}
                    >
                      {STATUS_LABELS[appointment.status]}
                    </Badge>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {appointment.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{appointment.clientName}</div>
                      <div className="text-sm text-white/60 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {appointment.clientPhone}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex items-center gap-2 text-sm text-white/70 bg-white/5 rounded-lg p-2">
                    {getServiceIcon(appointment.services[0])}
                    <span className="truncate">{getServiceNames(appointment.services)}</span>
                    <span className="text-white/40 ml-auto">{getServiceDuration(appointment.services)} хв</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Detail Dialog */}
        <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
          <DialogContent className="max-w-md bg-slate-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Деталі запису</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                {/* Client Info */}
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-violet-400" />
                    <span className="font-medium">{selectedAppointment.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Phone className="h-4 w-4" />
                    <span>{selectedAppointment.clientPhone}</span>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="text-sm font-medium text-white/70 mb-2">Послуги:</h4>
                  <div className="space-y-1">
                    {selectedAppointment.services.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="flex justify-between text-sm">
                          <span className="text-white/80">{service.name}</span>
                          <span className="font-medium text-white">{service.price} грн</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-medium">
                    <span className="text-white/70">Разом:</span>
                    <span className="text-white">
                      {selectedAppointment.services.reduce((sum, id) => {
                        const s = services.find(svc => svc.id === id);
                        return sum + (s?.price || 0);
                      }, 0)} грн
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-white/50" />
                  <span className="text-white/80">
                    {new Date(selectedAppointment.startTime).getHours().toString().padStart(2, '0')}:
                    {new Date(selectedAppointment.startTime).getMinutes().toString().padStart(2, '0')} - 
                    {new Date(selectedAppointment.endTime).getHours().toString().padStart(2, '0')}:
                    {new Date(selectedAppointment.endTime).getMinutes().toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Status & Actions */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div>
                    <label className="text-sm font-medium text-white/70">Статус:</label>
                    <Select 
                      value={selectedAppointment.status} 
                      onValueChange={(value) => handleStatusChange(selectedAppointment.id, value as AppointmentStatus)}
                    >
                      <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-white">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: STATUS_COLORS[key as AppointmentStatus] }}
                              />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      handleDelete(selectedAppointment.id);
                      setShowAppointmentDialog(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Видалити запис
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Desktop/Admin Grid View
  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-violet-600/30 to-purple-600/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousDay} className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday} className="h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20">
            Сьогодні
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextDay} className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-sm font-semibold text-white">
          {formatDate(selectedDate)}
        </h2>
        <div className="text-xs text-white/60">
          {isGuest ? 'Режим перегляду' : isAdmin ? 'Адміністратор' : 'Майстер'}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto" ref={gridRef}>
        <div className="min-w-[600px]">
          {/* Master Headers */}
          <div className="flex sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
            <div className="w-16 flex-shrink-0 bg-white/5 border-r border-white/10 p-2 text-xs font-medium text-white/60 text-center">
              Час
            </div>
            {visibleMasters.map(master => (
              <div 
                key={master.id} 
                className="flex-1 min-w-[140px] p-2 text-center border-r border-white/10"
                style={{ backgroundColor: `${master.color}15` }}
              >
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: master.color }}
                >
                  {master.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-white/80">{master.name}</span>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="relative">
            {TIME_SLOTS.map((time, index) => (
              <div key={time} className="flex border-b border-white/5">
                {/* Time Label */}
                <div className={cn(
                  "w-16 flex-shrink-0 border-r border-white/10 p-1 text-xs text-center flex items-center justify-center",
                  index % 2 === 0 ? "bg-white/10 font-medium text-white/80" : "bg-white/5 text-white/50"
                )}>
                  {time}
                </div>

                {/* Master Columns */}
                {visibleMasters.map(master => {
                  const appointment = getAppointmentForSlot(master.id, time);
                  const occupied = isSlotOccupied(master.id, time);
                  const isDragOver = dragOverSlot?.masterId === master.id && dragOverSlot?.time === time;

                  // Skip rendering if occupied by ongoing appointment
                  if (occupied && !appointment) {
                    return (
                      <div 
                        key={`${master.id}-${time}`}
                        className="flex-1 min-w-[140px] border-r border-white/5 bg-white/5"
                      />
                    );
                  }

                  return (
                    <div
                      key={`${master.id}-${time}`}
                      className={cn(
                        "flex-1 min-w-[140px] border-r border-white/5 min-h-[50px] relative transition-colors",
                        isDragOver && "bg-violet-500/20 border-violet-500/50",
                        !appointment && !isGuest && canEditAppointments && "hover:bg-white/5 cursor-pointer"
                      )}
                      onDragOver={(e) => handleDragOver(e, master.id, time)}
                      onDrop={(e) => handleDrop(e, master.id, time)}
                      onDragLeave={() => setDragOverSlot(null)}
                    >
                      {appointment ? (
                        <div
                          draggable={canEditAppointments && (isAdmin || appointment.masterId === currentUser?.masterId)}
                          onDragStart={(e) => handleDragStart(e, appointment)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "absolute inset-1 rounded-md p-2 text-xs shadow-lg border-l-4 cursor-pointer transition-transform hover:scale-[1.02]",
                            canEditAppointments && (isAdmin || appointment.masterId === currentUser?.masterId) && "cursor-move"
                          )}
                          style={{ 
                            backgroundColor: `${STATUS_COLORS[appointment.status]}30`,
                            borderLeftColor: STATUS_COLORS[appointment.status],
                            minHeight: 'calc(100% - 8px)',
                            zIndex: 10
                          }}
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAppointmentDialog(true);
                          }}
                        >
                          {/* Drag Handle */}
                          {canEditAppointments && (isAdmin || appointment.masterId === currentUser?.masterId) && (
                            <div className="absolute top-1 right-1 text-white/40 hover:text-white/70">
                              <GripVertical className="h-3 w-3" />
                            </div>
                          )}

                          {/* Status Badge */}
                          <Badge 
                            className="text-[8px] px-1 py-0 mb-1"
                            style={{ 
                              backgroundColor: STATUS_COLORS[appointment.status],
                              color: 'white'
                            }}
                          >
                            {STATUS_LABELS[appointment.status]}
                          </Badge>

                          {/* Client Info - Hidden for guests */}
                          {!isGuest ? (
                            <>
                              <div className="font-medium text-white truncate">
                                {appointment.clientName}
                              </div>
                              <div className="flex items-center gap-1 text-white/60 mt-0.5">
                                <Phone className="h-2.5 w-2.5" />
                                <span className="truncate">{appointment.clientPhone}</span>
                              </div>
                              <div className="flex items-center gap-1 text-white/60 mt-0.5">
                                {getServiceIcon(appointment.services[0])}
                                <span className="truncate">
                                  {getServiceNames(appointment.services)}
                                </span>
                              </div>
                              <div className="text-white/40 mt-0.5">
                                {getServiceDuration(appointment.services)} хв
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-white/40 font-medium">Зайнято</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Empty Slot - Click to add (for authorized users) */
                        !isGuest && canEditAppointments && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            onClick={() => handleAddClick(time, master.id)}
                          >
                            <span className="text-white/30 text-lg">+</span>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Detail Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Деталі запису</DialogTitle>
          </DialogHeader>
          {selectedAppointment && !isGuest && (
            <div className="space-y-4">
              {/* Client Info */}
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-violet-400" />
                  <span className="font-medium">{selectedAppointment.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Phone className="h-4 w-4" />
                  <span>{selectedAppointment.clientPhone}</span>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-2">Послуги:</h4>
                <div className="space-y-1">
                  {selectedAppointment.services.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <div key={serviceId} className="flex justify-between text-sm">
                        <span className="text-white/80">{service.name}</span>
                        <span className="font-medium text-white">{service.price} грн</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-medium">
                  <span className="text-white/70">Разом:</span>
                  <span className="text-white">
                    {selectedAppointment.services.reduce((sum, id) => {
                      const s = services.find(svc => svc.id === id);
                      return sum + (s?.price || 0);
                    }, 0)} грн
                  </span>
                </div>
              </div>

              {/* Time & Master */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/50" />
                  <span className="text-white/80">
                    {new Date(selectedAppointment.startTime).getHours().toString().padStart(2, '0')}:
                    {new Date(selectedAppointment.startTime).getMinutes().toString().padStart(2, '0')} - 
                    {new Date(selectedAppointment.endTime).getHours().toString().padStart(2, '0')}:
                    {new Date(selectedAppointment.endTime).getMinutes().toString().padStart(2, '0')}
                  </span>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  {masters.find(m => m.id === selectedAppointment.masterId)?.name}
                </Badge>
              </div>

              {/* Status & Actions */}
              {canEditAppointments && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div>
                    <label className="text-sm font-medium text-white/70">Статус:</label>
                    <Select 
                      value={selectedAppointment.status} 
                      onValueChange={(value) => handleStatusChange(selectedAppointment.id, value as AppointmentStatus)}
                    >
                      <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-white">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: STATUS_COLORS[key as AppointmentStatus] }}
                              />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        handleDelete(selectedAppointment.id);
                        setShowAppointmentDialog(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Видалити
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {isGuest && (
            <div className="text-center py-4 text-white/50">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Увійдіть для перегляду деталей</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
