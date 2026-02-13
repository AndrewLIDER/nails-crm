import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Lock, LogOut, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Authentication Dialog Component
// ============================================

const USER_OPTIONS = [
  { id: 'admin', name: 'Адміністратор', role: 'admin' as const, color: '#8B5CF6', icon: Shield },
  { id: 'viktoria', name: 'Вікторія', role: 'master' as const, color: '#06B6D4', icon: Sparkles },
  { id: 'svitlana', name: 'Світлана', role: 'master' as const, color: '#EC4899', icon: Sparkles },
  { id: 'yulia', name: 'Юля', role: 'master' as const, color: '#10B981', icon: Sparkles },
];

export function AuthDialog() {
  const { currentUser, login, logout, isAuthenticated, isAdmin } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedUser) {
      setError('Оберіть користувача');
      return;
    }
    
    const userName = USER_OPTIONS.find(u => u.id === selectedUser)?.name || '';
    const success = login(userName, password);
    
    if (success) {
      setIsOpen(false);
      setSelectedUser(null);
      setPassword('');
      setError('');
    } else {
      setError('Невірний пароль');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // If authenticated, show user info and logout
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-white">{currentUser?.name}</div>
          <div className="text-xs text-white/50">
            {isAdmin ? 'Адміністратор' : 'Майстер'}
          </div>
        </div>
        <Avatar 
          className="cursor-pointer border-2"
          style={{ borderColor: isAdmin ? '#8B5CF6' : '#06B6D4' }}
          onClick={handleLogout}
        >
          <AvatarFallback 
            className="text-white"
            style={{ backgroundColor: isAdmin ? '#8B5CF6' : '#06B6D4' }}
          >
            {currentUser?.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="text-white/50 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 border-white/20 text-white hover:bg-white/10",
            !isAuthenticated && "border-dashed border-white/30"
          )}
        >
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Увійти</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-sm bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            Вхід в систему
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label className="text-white/70">Оберіть користувача</Label>
            <div className="grid grid-cols-2 gap-2">
              {USER_OPTIONS.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user.id);
                    setError('');
                  }}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all",
                    selectedUser === user.id
                      ? "border-violet-500 bg-violet-500/20 ring-2 ring-violet-500/30"
                      : "border-white/10 hover:border-violet-500/50 hover:bg-white/5"
                  )}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                  >
                    <user.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-white/50">
                      {user.role === 'admin' ? 'Адмін' : 'Майстер'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Password Input */}
          {selectedUser && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="password" className="text-white/70">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Введіть пароль"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>
              <p className="text-xs text-white/40">
                Пароль: {selectedUser === 'admin' ? 'admin123' : `${USER_OPTIONS.find(u => u.id === selectedUser)?.name.toLowerCase()}123`}
              </p>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/30">
              {error}
            </div>
          )}

          <Button 
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
            disabled={!selectedUser || !password}
          >
            Увійти
          </Button>

          {/* Guest Info */}
          <div className="text-center text-xs text-white/40 pt-2 border-t border-white/10">
            <p>Зараз ви переглядаєте як Гість</p>
            <p>Деякі функції обмежені</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
