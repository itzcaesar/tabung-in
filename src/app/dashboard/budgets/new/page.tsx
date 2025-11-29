'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createBudget, type BudgetState } from '@/lib/actions/budgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBudgetPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<BudgetState, FormData>(
    createBudget,
    {}
  );

  if (state.success) {
    router.push('/dashboard/budgets');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/budgets"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Budgets
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Create Budget</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state.errors?.general && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {state.errors.general.join(', ')}
              </div>
            )}

            <Input
              name="name"
              type="text"
              label="Budget Name"
              placeholder="e.g., Groceries, Entertainment"
              error={state.errors?.name?.join(', ')}
              required
            />

            <Input
              name="amount"
              type="number"
              step="0.01"
              label="Budget Amount"
              placeholder="0.00"
              error={state.errors?.amount?.join(', ')}
              required
            />

            <Select
              name="period"
              label="Period"
              error={state.errors?.period?.join(', ')}
              required
            >
              <option value="">Select period</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>

            <Input
              name="startDate"
              type="date"
              label="Start Date"
              defaultValue={new Date().toISOString().split('T')[0]}
              error={state.errors?.startDate?.join(', ')}
              required
            />

            <Input
              name="alertThreshold"
              type="number"
              min="0"
              max="100"
              label="Alert Threshold (%)"
              placeholder="80"
              defaultValue="80"
              error={state.errors?.alertThreshold?.join(', ')}
            />

            <Input
              name="categoryId"
              type="text"
              label="Category ID (optional)"
              placeholder="Link to a specific category"
              error={state.errors?.categoryId?.join(', ')}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? 'Creating...' : 'Create Budget'}
              </Button>
              <Link href="/dashboard/budgets">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
