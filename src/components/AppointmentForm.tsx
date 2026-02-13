import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, User, Phone, Calendar, Clock, Sparkles, Hand, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppointmentFormData, Client } from '@/types';

// ============================================
// Appointment Form Component - Create New Booking
// ============================================

interface AppointmentFormProps {
  selectedDate: Date;
  preselectedTime?: string;
  preselectedMasterId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AppointmentForm({ 
  selectedDate, 
  preselectedTime, 
  preselectedMasterId,
  open: controlledOpen,
  onOpenChange
}: AppointmentFormProps) {
  const { 
    masters, 
    services, 
    clients, 
    addAppointment, 
    isTimeSlotAvailable, 
    canEditAppointments,
    getRecommendedServices,
  } = useApp();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  const [step, setStep] = useState<'client' | 'services' | 'time'>('client');
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState(preselectedMasterId || '');
  const [selectedTime, setSelectedTime] = useState(preselectedTime || '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Update when preselected values change
  useEffect(() => {
    if (preselectedMasterId) {
      setSelectedMasterId(preselectedMasterId);
    }
    if (preselectedTime) {
      setSelectedTime(preselectedTime);
    }
  }, [preselectedMasterId, preselectedTime]);

  // Get recommended services for selected client
  const recommendedServices = selectedClient ? getRecommendedServices(selectedClient.id) : [];

  // Calculate total duration and price
  const { totalDuration, totalPrice } = useMemo(() => {
    const selectedServiceObjs = services.filter(s => selectedServices.includes(s.id));
    return {
      totalDuration: selectedServiceObjs.reduce((sum, s) => sum + s.duration, 0),
      totalPrice: selectedServiceObjs.reduce((sum, s) => sum + s.price, 0),
    };
  }, [selectedServices, services]);

  // Generate available time slots
  const availableTimeSlots = useMemo(() => {
    if (!selectedMasterId || totalDuration === 0) return [];
    
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 20;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        if (isTimeSlotAvailable(selectedMasterId, selectedDate, time, totalDuration)) {
          slots.push(time);
        }
      }
    }
    return slots;
  }, [selectedMasterId, selectedDate, totalDuration, isTimeSlotAvailable]);

  // Reset form
  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setSelectedClient(null);
    setSelectedServices([]);
    setSelectedMasterId(preselectedMasterId || '');
    setSelectedTime(preselectedTime || '');
    setNotes('');
    setError('');
    setStep('client');
  };

  // Handle client selection from existing clients
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientName(client.name);
    setClientPhone(client.phone);
  };

  // Toggle service selection
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Введіть ім\'я та телефон клієнта');
      return;
    }
    if (selectedServices.length === 0) {
      setError('Оберіть хоча б одну послугу');
      return;
    }
    if (!selectedMasterId) {
      setError('Оберіть майстра');
      return;
    }
    if (!selectedTime) {
      setError('Оберіть час');
      return;
    }

    const formData: AppointmentFormData = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      masterId: selectedMasterId,
      services: selectedServices,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      notes: notes.trim(),
    };

    const result = addAppointment(formData);
    if (result) {
      setIsOpen(false);
      resetForm();
    } else {
      setError('Цей час вже зайнятий. Оберіть інший.');
    }
  };

  // Filter clients by phone search
  const filteredClients = clients.filter(c => 
    c.phone.includes(clientPhone) || c.name.toLowerCase().includes(clientName.toLowerCase())
  );

  // Get service icon
  const getServiceIcon = (category: string) => {
    if (category === 'Нарощування') {
      return <Hand className="h-4 w-4" />;
    } else if (category === 'Дизайн') {
      return <Palette className="h-4 w-4" />;
    }
    return <Sparkles className="h-4 w-4" />;
  };

  if (!canEditAppointments) {
    return null;
  }

  // If controlled (from grid click), don't show trigger button
  if (controlledOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Новий запис
            </DialogTitle>
          </DialogHeader>
          {renderFormContent()}
        </DialogContent>
      </Dialog>
    );
  }

  function renderFormContent() {
    return (
      <>
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-4">
          {['client', 'services', 'time'].map((s, i) => (
            <React.Fragment key={s}>
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  step === s 
                    ? "bg-violet-500 text-white" 
                    : i < ['client', 'services', 'time'].indexOf(step)
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-white/50"
                )}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="flex-1 h-0.5 bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-2 rounded text-sm mb-4 border border-red-500/30">
            {error}
          </div>
        )}

        <ScrollArea className="max-h-[60vh]">
          {/* Step 1: Client Info */}
          {step === 'client' && (
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 text-white/70">
                  <Phone className="h-4 w-4 text-violet-400" />
                  Телефон
                </Label>
                <Input
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    setSelectedClient(null);
                  }}
                  placeholder="+380 XX XXX XXXX"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 text-white/70">
                  <User className="h-4 w-4 text-violet-400" />
                  Ім'я клієнта
                </Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Введіть ім'я"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Existing clients list */}
              {filteredClients.length > 0 && (
                <div>
                  <Label className="text-white/50 text-sm">Знайдені клієнти:</Label>
                  <div className="space-y-2 mt-2">
                    {filteredClients.slice(0, 3).map(client => (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className={cn(
                          "w-full text-left p-2 rounded border transition-colors",
                          selectedClient?.id === client.id
                            ? "border-violet-500 bg-violet-500/20"
                            : "border-white/10 hover:border-violet-500/50 bg-white/5"
                        )}
                      >
                        <div className="font-medium text-white">{client.name}</div>
                        <div className="text-sm text-white/50">{client.phone}</div>
                        {client.totalVisits > 0 && (
                          <div className="text-xs text-violet-400">
                            Візитів: {client.totalVisits}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => setStep('services')} 
                className="w-full bg-violet-500 hover:bg-violet-600"
                disabled={!clientName.trim() || !clientPhone.trim()}
              >
                Далі
              </Button>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 'services' && (
            <div className="space-y-4">
              {/* Recommended services */}
              {recommendedServices.length > 0 && (
                <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 p-3 rounded-lg border border-violet-500/30">
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Рекомендовані послуги
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recommendedServices.map(service => (
                      <Badge
                        key={service.id}
                        variant={selectedServices.includes(service.id) ? "default" : "secondary"}
                        className="cursor-pointer"
                        style={selectedServices.includes(service.id) ? { backgroundColor: service.color } : {}}
                        onClick={() => toggleService(service.id)}
                      >
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  Оберіть послуги
                </Label>
                <div className="space-y-2">
                  {services.filter(s => s.isActive).map(service => (
                    <div
                      key={service.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedServices.includes(service.id)
                          ? "border-violet-500 bg-violet-500/20"
                          : "border-white/10 hover:border-white/30 bg-white/5"
                      )}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                          className="border-white/30 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                        />
                        <div className="flex items-center gap-2">
                          <div style={{ color: service.color }}>
                            {getServiceIcon(service.category)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{service.name}</div>
                            <div className="text-sm text-white/50">{service.duration} хв</div>
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-white">{service.price} грн</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedServices.length > 0 && (
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>Тривалість:</span>
                    <span className="font-medium text-white">{totalDuration} хв</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1 text-white/70">
                    <span>Вартість:</span>
                    <span className="font-medium text-white">{totalPrice} грн</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('client')} className="flex-1 border-white/20 text-white hover:bg-white/10">
                  Назад
                </Button>
                <Button 
                  onClick={() => setStep('time')} 
                  className="flex-1 bg-violet-500 hover:bg-violet-600"
                  disabled={selectedServices.length === 0}
                >
                  Далі
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Time & Master */}
          {step === 'time' && (
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <Calendar className="h-4 w-4 text-violet-400" />
                  Дата
                </Label>
                <div className="p-2 bg-white/10 rounded text-sm text-white">
                  {selectedDate.toLocaleDateString('uk-UA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <User className="h-4 w-4 text-violet-400" />
                  Майстер
                </Label>
                <Select value={selectedMasterId} onValueChange={setSelectedMasterId}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Оберіть майстра" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {masters.filter(m => m.isActive).map(master => (
                      <SelectItem key={master.id} value={master.id} className="text-white">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: master.color }}
                          />
                          {master.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-white/70">
                  <Clock className="h-4 w-4 text-violet-400" />
                  Час (тривалість: {totalDuration} хв)
                </Label>
                {availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "p-2 text-sm rounded border transition-colors",
                          selectedTime === time
                            ? "border-violet-500 bg-violet-500 text-white"
                            : "border-white/10 hover:border-violet-500/50 bg-white/5 text-white"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/50 text-center py-4">
                    Немає доступного часу на цю дату
                  </div>
                )}
              </div>

              <div>
                <Label className="text-white/70">Примітки</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Додаткова інформація..."
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Final Summary */}
              <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 p-3 rounded-lg border border-violet-500/30">
                <div className="text-sm font-medium text-white mb-2">Підсумок:</div>
                <div className="text-sm space-y-1 text-white/70">
                  <div>Клієнт: <span className="text-white">{clientName}</span></div>
                  <div>Послуг: <span className="text-white">{selectedServices.length}</span></div>
                  <div>Майстер: <span className="text-white">{masters.find(m => m.id === selectedMasterId)?.name}</span></div>
                  <div>Час: <span className="text-white">{selectedTime}</span></div>
                  <div className="font-medium text-white">Всього: {totalPrice} грн</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('services')} className="flex-1 border-white/20 text-white hover:bg-white/10">
                  Назад
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
                  disabled={!selectedMasterId || !selectedTime}
                >
                  Записати
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 text-white"
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Новий запис
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            Новий запис
          </DialogTitle>
        </DialogHeader>
        {renderFormContent()}
      </DialogContent>
    </Dialog>
  );
}
