'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createTransaction, type TransactionState } from '@/lib/actions/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTransactionPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<TransactionState, FormData>(
    createTransaction,
    {}
  );

  if (state.success) {
    router.push('/dashboard/transactions');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </Link>
        <h1 className="text-3xl font-bold text-foreground">New Transaction</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state.errors?.general && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {state.errors.general.join(', ')}
              </div>
            )}

            <Select
              name="type"
              label="Type"
              error={state.errors?.type?.join(', ')}
              required
            >
              <option value="">Select type</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </Select>

            <Input
              name="amount"
              type="number"
              step="0.01"
              label="Amount"
              placeholder="0.00"
              error={state.errors?.amount?.join(', ')}
              required
            />

            <Input
              name="description"
              type="text"
              label="Description"
              placeholder="What was this for?"
              error={state.errors?.description?.join(', ')}
            />

            <Input
              name="date"
              type="date"
              label="Date"
              defaultValue={new Date().toISOString().split('T')[0]}
              error={state.errors?.date?.join(', ')}
              required
            />

            <Input
              name="accountId"
              type="text"
              label="Account ID"
              placeholder="Enter account ID"
              error={state.errors?.accountId?.join(', ')}
              required
            />

            <Input
              name="categoryId"
              type="text"
              label="Category ID (optional)"
              placeholder="Enter category ID"
              error={state.errors?.categoryId?.join(', ')}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? 'Creating...' : 'Create Transaction'}
              </Button>
              <Link href="/dashboard/transactions">
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
