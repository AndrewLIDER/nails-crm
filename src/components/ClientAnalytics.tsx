import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, User, Phone, Calendar, TrendingUp, 
  Heart, History, Search, Sparkles, DollarSign, 
  Clock, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Client } from '@/types';

// ============================================
// Client Analytics Component
// ============================================

export function ClientAnalytics() {
  const { 
    clients, 
    services, 
    masters, 
    getClientAnalytics, 
    getClientVisits,
    getRecommendedServices,
    canViewClientDetails,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter clients
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  // Get client analytics
  const analytics = selectedClient ? getClientAnalytics(selectedClient.id) : null;
  const visits = selectedClient ? getClientVisits(selectedClient.id) : [];
  const recommendedServices = selectedClient ? getRecommendedServices(selectedClient.id) : [];

  if (!canViewClientDetails) {
    return null;
  }

  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Аналітика клієнтів</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Клієнтська аналітика
          </DialogTitle>
        </DialogHeader>

        {!selectedClient ? (
          /* Client List */
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук за ім'ям або телефоном..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Клієнтів не знайдено</p>
                  </div>
                ) : (
                  filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-violet-500/50 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{client.name}</div>
                          <div className="text-sm text-white/50 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-violet-400">
                          {client.totalVisits} візитів
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/30 ml-auto" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Client Details */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white text-lg font-medium">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">{selectedClient.name}</h3>
                  <div className="text-sm text-white/50 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedClient.phone}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedClient(null)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Назад
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              {/* Stats Cards */}
              {analytics && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-violet-500/30 to-violet-500/10 p-3 rounded-lg border border-violet-500/30">
                    <div className="flex items-center gap-1 text-violet-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Візитів</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.totalVisits}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/30 to-purple-500/10 p-3 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-1 text-purple-400 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Витрачено</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.totalSpent}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/30 to-green-500/10 p-3 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-1 text-green-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">Середній чек</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.round(analytics.averageCheck)}</div>
                  </div>
                </div>
              )}

              {/* Favorite Services */}
              {analytics && analytics.favoriteServices.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/70 flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    Улюблені послуги
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.favoriteServices.map((fs, index) => (
                      <Badge 
                        key={fs.serviceId}
                        variant={index === 0 ? "default" : "secondary"}
                        className={cn(
                          "gap-1",
                          index === 0 && "bg-gradient-to-r from-violet-500 to-purple-500"
                        )}
                      >
                        {fs.serviceName}
                        <span className="opacity-70">({fs.count} разів)</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Services */}
              {recommendedServices.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/70 flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Рекомендовані послуги
                  </h4>
                  <div className="space-y-2">
                    {recommendedServices.map(service => (
                      <div 
                        key={service.id}
                        className="flex items-center justify-between p-2 rounded border border-white/10 bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: service.color }}
                          />
                          <span className="text-sm text-white">{service.name}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{service.price} грн</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visit History */}
              <div>
                <h4 className="text-sm font-medium text-white/70 flex items-center gap-2 mb-2">
                  <History className="h-4 w-4 text-white/50" />
                  Історія відвідувань
                </h4>
                {visits.length === 0 ? (
                  <div className="text-center py-4 text-white/40 text-sm">
                    Немає записів
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visits.map(visit => {
                      const visitServices = services.filter(s => visit.services.includes(s.id));
                      const totalPrice = visitServices.reduce((sum, s) => sum + s.price, 0);
                      const master = masters.find(m => m.id === visit.masterId);
                      
                      return (
                        <div 
                          key={visit.id}
                          className="p-3 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-white/40" />
                              <span className="text-sm text-white">
                                {new Date(visit.startTime).toLocaleDateString('uk-UA')}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs border-white/20"
                              style={{ 
                                borderColor: master?.color,
                                color: master?.color 
                              }}
                            >
                              {master?.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                            <Clock className="h-3 w-3" />
                            {new Date(visit.startTime).getHours().toString().padStart(2, '0')}:
                            {new Date(visit.startTime).getMinutes().toString().padStart(2, '0')} - 
                            {new Date(visit.endTime).getHours().toString().padStart(2, '0')}:
                            {new Date(visit.endTime).getMinutes().toString().padStart(2, '0')}
                          </div>
                          <div className="text-sm text-white/80">
                            {visitServices.map(s => s.name).join(', ')}
                          </div>
                          <div className="text-sm font-medium text-white mt-1">
                            {totalPrice} грн
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
