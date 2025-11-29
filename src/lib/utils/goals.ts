// Utility functions for goals calculations

export interface SavingsSimulation {
  dailyAmount: number;
  daysToGoal: number;
  weeksToGoal: number;
  monthsToGoal: number;
  targetDate: Date;
  isOnTrack: boolean;
}

export function calculateSavingsSimulation(
  targetAmount: number,
  currentAmount: number,
  dailySavings: number,
  deadline?: Date | null
): SavingsSimulation {
  const remaining = targetAmount - currentAmount;
  
  if (remaining <= 0 || dailySavings <= 0) {
    return {
      dailyAmount: dailySavings,
      daysToGoal: 0,
      weeksToGoal: 0,
      monthsToGoal: 0,
      targetDate: new Date(),
      isOnTrack: true,
    };
  }

  const daysToGoal = Math.ceil(remaining / dailySavings);
  const weeksToGoal = Math.ceil(daysToGoal / 7);
  const monthsToGoal = Math.ceil(daysToGoal / 30);
  
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToGoal);

  let isOnTrack = true;
  if (deadline) {
    const deadlineDate = new Date(deadline);
    isOnTrack = targetDate <= deadlineDate;
  }

  return {
    dailyAmount: dailySavings,
    daysToGoal,
    weeksToGoal,
    monthsToGoal,
    targetDate,
    isOnTrack,
  };
}

export function calculateRequiredDailySavings(
  targetAmount: number,
  currentAmount: number,
  deadline: Date
): number {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 0) return remaining;
  
  return Math.ceil(remaining / daysRemaining);
}
