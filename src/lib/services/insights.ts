import { db } from '@/lib/db';
import { transactions, budgets, goals, bills, accounts, categories } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'success' | 'tip' | 'info';
  category: 'spending' | 'budget' | 'savings' | 'trend' | 'bill' | 'general';
  title: string;
  description: string;
  priority: number; // 1-10, higher = more important
  actionable?: {
    label: string;
    href: string;
  };
}

interface TransactionData {
  type: string;
  amount: string;
  date: Date;
  categoryId: string | null;
  category?: { name: string; type: string } | null;
}

interface BudgetData {
  id: string;
  name: string;
  amount: string;
  period: string;
  spent: number;
  categoryId: string | null;
}

interface GoalData {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: Date | null;
  status: string;
}

interface BillData {
  id: string;
  name: string;
  amount: string;
  dueDate: Date;
  status: string;
}

// Get current month date range
function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startOfMonth, endOfMonth };
}

// Get last month date range
function getLastMonthRange() {
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  return { startOfLastMonth, endOfLastMonth };
}

export async function generateFinancialInsights(userId: string): Promise<FinancialInsight[]> {
  const insights: FinancialInsight[] = [];
  const { startOfMonth, endOfMonth } = getCurrentMonthRange();
  const { startOfLastMonth, endOfLastMonth } = getLastMonthRange();

  try {
    // Fetch all required data
    const [
      currentMonthTransactions,
      lastMonthTransactions,
      userBudgets,
      userGoals,
      userBills,
      userAccounts,
    ] = await Promise.all([
      db.query.transactions.findMany({
        where: and(
          eq(transactions.userId, userId),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        ),
        with: { category: true },
      }),
      db.query.transactions.findMany({
        where: and(
          eq(transactions.userId, userId),
          gte(transactions.date, startOfLastMonth),
          lte(transactions.date, endOfLastMonth)
        ),
        with: { category: true },
      }),
      db.query.budgets.findMany({
        where: and(eq(budgets.userId, userId), eq(budgets.isActive, true)),
      }),
      db.query.goals.findMany({
        where: and(eq(goals.userId, userId), eq(goals.status, 'aktif')),
      }),
      db.query.bills.findMany({
        where: and(eq(bills.userId, userId), eq(bills.status, 'aktif')),
      }),
      db.query.accounts.findMany({
        where: eq(accounts.userId, userId),
      }),
    ]);

    // Calculate metrics
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const currentExpense = currentMonthTransactions
      .filter(t => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastIncome = lastMonthTransactions
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const lastExpense = lastMonthTransactions
      .filter(t => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = userAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

    // 1. SPENDING TREND INSIGHTS
    if (lastExpense > 0) {
      const expenseChange = ((currentExpense - lastExpense) / lastExpense) * 100;
      
      if (expenseChange > 20) {
        insights.push({
          id: 'spending-increase',
          type: 'warning',
          category: 'spending',
          title: 'Pengeluaran Meningkat',
          description: `Pengeluaran bulan ini ${expenseChange.toFixed(0)}% lebih tinggi dari bulan lalu. Perhatikan pola pengeluaranmu.`,
          priority: 8,
          actionable: {
            label: 'Lihat Transaksi',
            href: '/dashboard/transactions',
          },
        });
      } else if (expenseChange < -15) {
        insights.push({
          id: 'spending-decrease',
          type: 'success',
          category: 'spending',
          title: 'Pengeluaran Menurun! 🎉',
          description: `Bagus! Pengeluaran bulan ini ${Math.abs(expenseChange).toFixed(0)}% lebih rendah dari bulan lalu.`,
          priority: 5,
        });
      }
    }

    // 2. INCOME VS EXPENSE RATIO
    if (currentIncome > 0) {
      const savingsRate = ((currentIncome - currentExpense) / currentIncome) * 100;
      
      if (savingsRate < 0) {
        insights.push({
          id: 'negative-cashflow',
          type: 'warning',
          category: 'spending',
          title: 'Pengeluaran Melebihi Pemasukan',
          description: `Kamu sudah menghabiskan ${Math.abs(savingsRate).toFixed(0)}% lebih banyak dari pemasukanmu bulan ini. Kurangi pengeluaran!`,
          priority: 10,
          actionable: {
            label: 'Atur Anggaran',
            href: '/dashboard/budgets',
          },
        });
      } else if (savingsRate < 20) {
        insights.push({
          id: 'low-savings',
          type: 'tip',
          category: 'savings',
          title: 'Tingkatkan Tabunganmu',
          description: `Kamu hanya menabung ${savingsRate.toFixed(0)}% dari pemasukan. Idealnya, sisihkan minimal 20% untuk tabungan.`,
          priority: 6,
          actionable: {
            label: 'Buat Goal Tabungan',
            href: '/dashboard/goals',
          },
        });
      } else if (savingsRate >= 30) {
        insights.push({
          id: 'good-savings',
          type: 'success',
          category: 'savings',
          title: 'Tabunganmu Luar Biasa! 💰',
          description: `Keren! Kamu menabung ${savingsRate.toFixed(0)}% dari pemasukanmu bulan ini.`,
          priority: 4,
        });
      }
    }

    // 3. BUDGET INSIGHTS
    for (const budget of userBudgets) {
      // Calculate spent amount for this budget
      const budgetTransactions = currentMonthTransactions.filter(
        t => t.type === 'pengeluaran' && 
        (budget.categoryId ? t.categoryId === budget.categoryId : true)
      );
      const spent = budgetTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const budgetAmount = Number(budget.amount);
      const percentUsed = (spent / budgetAmount) * 100;

      if (percentUsed >= 100) {
        insights.push({
          id: `budget-exceeded-${budget.id}`,
          type: 'warning',
          category: 'budget',
          title: `Anggaran "${budget.name}" Terlampaui`,
          description: `Kamu sudah menghabiskan ${percentUsed.toFixed(0)}% dari anggaran. Hindari pengeluaran tambahan di kategori ini.`,
          priority: 9,
          actionable: {
            label: 'Kelola Anggaran',
            href: '/dashboard/budgets',
          },
        });
      } else if (percentUsed >= 80) {
        insights.push({
          id: `budget-warning-${budget.id}`,
          type: 'warning',
          category: 'budget',
          title: `Anggaran "${budget.name}" Hampir Habis`,
          description: `Kamu sudah menggunakan ${percentUsed.toFixed(0)}% dari anggaran. Sisa: Rp ${(budgetAmount - spent).toLocaleString('id-ID')}.`,
          priority: 7,
        });
      }
    }

    // 4. GOALS INSIGHTS
    for (const goal of userGoals) {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      const progress = (current / target) * 100;

      if (goal.deadline) {
        const daysUntilDeadline = Math.ceil(
          (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const remaining = target - current;
        const monthlyNeeded = remaining / Math.max(1, daysUntilDeadline / 30);

        if (daysUntilDeadline <= 30 && progress < 80) {
          insights.push({
            id: `goal-deadline-${goal.id}`,
            type: 'warning',
            category: 'savings',
            title: `Deadline "${goal.name}" Mendekat`,
            description: `Kurang ${daysUntilDeadline} hari lagi. Kamu perlu menabung Rp ${monthlyNeeded.toLocaleString('id-ID')} untuk mencapai target.`,
            priority: 8,
            actionable: {
              label: 'Update Goal',
              href: '/dashboard/goals',
            },
          });
        }
      }

      if (progress >= 90 && progress < 100) {
        insights.push({
          id: `goal-almost-${goal.id}`,
          type: 'info',
          category: 'savings',
          title: `"${goal.name}" Hampir Tercapai! 🎯`,
          description: `Tinggal sedikit lagi! Kamu sudah mencapai ${progress.toFixed(0)}% dari target.`,
          priority: 5,
        });
      }
    }

    // 5. BILL REMINDERS
    const now = new Date();
    for (const bill of userBills) {
      const dueDate = new Date(bill.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        insights.push({
          id: `bill-overdue-${bill.id}`,
          type: 'warning',
          category: 'bill',
          title: `Tagihan "${bill.name}" Terlambat`,
          description: `Tagihan sudah lewat ${Math.abs(daysUntilDue)} hari. Segera bayar untuk menghindari denda.`,
          priority: 10,
          actionable: {
            label: 'Lihat Tagihan',
            href: '/dashboard/bills',
          },
        });
      } else if (daysUntilDue <= 3) {
        insights.push({
          id: `bill-due-soon-${bill.id}`,
          type: 'warning',
          category: 'bill',
          title: `Tagihan "${bill.name}" Segera Jatuh Tempo`,
          description: `Jatuh tempo dalam ${daysUntilDue} hari. Siapkan pembayaran Rp ${Number(bill.amount).toLocaleString('id-ID')}.`,
          priority: 9,
          actionable: {
            label: 'Bayar Sekarang',
            href: '/dashboard/bills',
          },
        });
      } else if (daysUntilDue <= 7) {
        insights.push({
          id: `bill-reminder-${bill.id}`,
          type: 'info',
          category: 'bill',
          title: `Pengingat: "${bill.name}"`,
          description: `Jatuh tempo dalam ${daysUntilDue} hari (${dueDate.toLocaleDateString('id-ID')}).`,
          priority: 6,
        });
      }
    }

    // 6. CATEGORY SPENDING ANALYSIS
    const categorySpending = new Map<string, number>();
    currentMonthTransactions
      .filter(t => t.type === 'pengeluaran' && t.category)
      .forEach(t => {
        const catName = t.category?.name || 'Lainnya';
        categorySpending.set(catName, (categorySpending.get(catName) || 0) + Number(t.amount));
      });

    // Find highest spending category
    let highestCategory = '';
    let highestAmount = 0;
    categorySpending.forEach((amount, category) => {
      if (amount > highestAmount) {
        highestAmount = amount;
        highestCategory = category;
      }
    });

    if (highestCategory && currentExpense > 0) {
      const percentage = (highestAmount / currentExpense) * 100;
      if (percentage > 40) {
        insights.push({
          id: 'high-category-spending',
          type: 'tip',
          category: 'spending',
          title: `Pengeluaran Terbesar: ${highestCategory}`,
          description: `${percentage.toFixed(0)}% pengeluaranmu ada di kategori "${highestCategory}". Pertimbangkan untuk mengurangi di area ini.`,
          priority: 5,
          actionable: {
            label: 'Lihat Breakdown',
            href: '/dashboard/reports',
          },
        });
      }
    }

    // 7. GENERAL TIPS
    if (userBudgets.length === 0) {
      insights.push({
        id: 'no-budget',
        type: 'tip',
        category: 'general',
        title: 'Buat Anggaran Pertamamu',
        description: 'Anggaran membantu mengontrol pengeluaran. Mulai dengan kategori yang sering kamu gunakan.',
        priority: 4,
        actionable: {
          label: 'Buat Anggaran',
          href: '/dashboard/budgets',
        },
      });
    }

    if (userGoals.length === 0) {
      insights.push({
        id: 'no-goals',
        type: 'tip',
        category: 'general',
        title: 'Tetapkan Target Tabungan',
        description: 'Punya goal keuangan? Buat target tabungan untuk membantu mencapainya.',
        priority: 3,
        actionable: {
          label: 'Buat Goal',
          href: '/dashboard/goals',
        },
      });
    }

    // Sort by priority (highest first)
    insights.sort((a, b) => b.priority - a.priority);

    // Limit to top 10 insights
    return insights.slice(0, 10);

  } catch (error) {
    console.error('Failed to generate insights:', error);
    return [];
  }
}
