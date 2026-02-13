import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Wallet 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Cash Register Component
// ============================================

const EXPENSE_CATEGORIES = [
  'Зарплата',
  'Оренда',
  'Матеріали',
  'Реклама',
  'Інше',
];

export function CashRegister() {
  const { 
    transactions, 
    addTransaction, 
    getDailyRevenue,
    masters,
    isAdmin,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'add'>('overview');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMasterId, setSelectedMasterId] = useState('');

  // Calculate totals
  const today = new Date();
  const todayRevenue = getDailyRevenue(today);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  // Today's transactions
  const todayTransactions = transactions.filter(t => 
    new Date(t.date).toDateString() === today.toDateString()
  );

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addTransaction({
      type: transactionType,
      amount: numAmount,
      category: category || (transactionType === 'income' ? 'Послуги' : 'Інше'),
      description: description || '',
      masterId: selectedMasterId || undefined,
      createdBy: 'admin',
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setSelectedMasterId('');
    setActiveTab('overview');
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Каса</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            Каса
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'bg-violet-500 hover:bg-violet-600' : 'border-white/20 text-white hover:bg-white/10'}
          >
            Огляд
          </Button>
          <Button
            variant={activeTab === 'add' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('add')}
            className={activeTab === 'add' ? 'bg-violet-500 hover:bg-violet-600' : 'border-white/20 text-white hover:bg-white/10'}
          >
            <Plus className="h-4 w-4 mr-1" />
            Додати
          </Button>
        </div>

        {activeTab === 'overview' ? (
          <ScrollArea className="h-[400px]">
            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-500/30 to-green-500/10 p-3 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-1 text-green-400 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Дохід сьогодні</span>
                </div>
                <div className="text-xl font-bold text-white">{todayRevenue} грн</div>
              </div>
              <div className="bg-gradient-to-br from-violet-500/30 to-violet-500/10 p-3 rounded-lg border border-violet-500/30">
                <div className="flex items-center gap-1 text-violet-400 mb-1">
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs">Баланс</span>
                </div>
                <div className={cn(
                  "text-xl font-bold",
                  balance >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {balance} грн
                </div>
              </div>
            </div>

            {/* Total Stats */}
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg mb-4 border border-white/10">
              <div className="text-center">
                <div className="text-xs text-white/50">Всього дохід</div>
                <div className="font-medium text-green-400">+{totalIncome} грн</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/50">Всього витрати</div>
                <div className="font-medium text-red-400">-{totalExpense} грн</div>
              </div>
            </div>

            {/* Today's Transactions */}
            <div>
              <h4 className="text-sm font-medium text-white/70 mb-2">
                Транзакції сьогодні
              </h4>
              {todayTransactions.length === 0 ? (
                <div className="text-center py-4 text-white/40 text-sm">
                  Немає транзакцій
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTransactions.map(transaction => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-2 rounded border border-white/10 bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          transaction.type === 'income' 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {transaction.type === 'income' 
                            ? <TrendingUp className="h-4 w-4" />
                            : <TrendingDown className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {transaction.category}
                          </div>
                          {transaction.description && (
                            <div className="text-xs text-white/50">
                              {transaction.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={cn(
                        "font-medium",
                        transaction.type === 'income' ? "text-green-400" : "text-red-400"
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount} грн
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          /* Add Transaction Form */
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <Label className="text-white/70">Тип операції</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant={transactionType === 'income' ? 'default' : 'outline'}
                  onClick={() => setTransactionType('income')}
                  className={cn(
                    "flex-1",
                    transactionType === 'income' ? "bg-green-500 hover:bg-green-600" : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Дохід
                </Button>
                <Button
                  type="button"
                  variant={transactionType === 'expense' ? 'default' : 'outline'}
                  onClick={() => setTransactionType('expense')}
                  className={cn(
                    "flex-1",
                    transactionType === 'expense' ? "bg-red-500 hover:bg-red-600" : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Витрата
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label className="text-white/70">Сума</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label className="text-white/70">Категорія</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {transactionType === 'income' ? (
                    <SelectItem value="Послуги" className="text-white">Послуги</SelectItem>
                  ) : (
                    EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Master (for income) */}
            {transactionType === 'income' && (
              <div>
                <Label className="text-white/70">Майстер (необов'язково)</Label>
                <Select value={selectedMasterId} onValueChange={setSelectedMasterId}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Оберіть майстра" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {masters.filter(m => m.isActive).map(master => (
                      <SelectItem key={master.id} value={master.id} className="text-white">
                        {master.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div>
              <Label className="text-white/70">Опис (необов'язково)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Додаткова інформація..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <Button 
              onClick={handleSubmit}
              className={cn(
                "w-full",
                transactionType === 'income' 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-red-500 hover:bg-red-600"
              )}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Додати {transactionType === 'income' ? 'дохід' : 'витрату'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
