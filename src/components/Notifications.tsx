import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, Check, Sparkles, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Notifications Component
// ============================================

interface NewAppointmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notification?: {
    title: string;
    message: string;
  };
}

export function NewAppointmentPopup({ isOpen, onClose, notification }: NewAppointmentPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-300 border border-violet-500/30">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center animate-bounce">
            <Bell className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-white">{notification.title}</h3>
        <p className="text-white/70 text-center mb-6">{notification.message}</p>
        <Button 
          onClick={onClose}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
        >
          <Check className="h-4 w-4 mr-2" />
          Зрозуміло
        </Button>
      </div>
    </div>
  );
}

export function NotificationsDialog() {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearNotifications, 
    unreadNotificationsCount,
    isMaster 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  if (!isMaster) return null;

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-white/10 border-white/20 text-white hover:bg-white/20">
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[80vh] bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-violet-400" />
              Сповіщення
            </div>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearNotifications}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-1" />
                Очистити
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Немає сповіщень</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "bg-white/10 rounded-xl border p-4 transition-all",
                    notification.read 
                      ? "border-white/10 opacity-60" 
                      : "border-violet-500/30 shadow-lg shadow-violet-500/10"
                  )}
                >
                  {/* Date centered */}
                  <div className="text-center text-xs text-white/40 mb-2">
                    {formatDate(notification.date)}
                  </div>

                  {/* Content */}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      notification.type === 'new-appointment'
                        ? "bg-gradient-to-r from-violet-500 to-purple-500"
                        : "bg-white/10"
                    )}>
                      {notification.type === 'new-appointment' ? (
                        <Sparkles className="h-5 w-5 text-white" />
                      ) : (
                        <Bell className="h-5 w-5 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{notification.title}</h4>
                      <p className="text-sm text-white/60 mt-1">{notification.message}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <Badge 
                      variant={notification.read ? "secondary" : "default"}
                      className={cn(
                        "text-xs",
                        !notification.read && "bg-violet-500"
                      )}
                    >
                      {notification.read ? 'Прочитано' : 'Нове'}
                    </Badge>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-white/50 hover:text-white hover:bg-white/10"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Прочитати
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
