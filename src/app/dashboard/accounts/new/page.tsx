'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount, type AccountState } from '@/lib/actions/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewAccountPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    createAccount,
    {}
  );

  if (state.success) {
    router.push('/dashboard/accounts');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Add Account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
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
              label="Account Name"
              placeholder="e.g., Main Checking, Savings"
              error={state.errors?.name?.join(', ')}
              required
            />

            <Select
              name="type"
              label="Account Type"
              error={state.errors?.type?.join(', ')}
              required
            >
              <option value="">Select type</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
              <option value="investment">Investment</option>
            </Select>

            <Input
              name="balance"
              type="number"
              step="0.01"
              label="Initial Balance"
              placeholder="0.00"
              error={state.errors?.balance?.join(', ')}
            />

            <Select
              name="currency"
              label="Currency"
              error={state.errors?.currency?.join(', ')}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </Select>

            <Input
              name="color"
              type="color"
              label="Color (optional)"
              defaultValue="#8b5cf6"
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? 'Creating...' : 'Create Account'}
              </Button>
              <Link href="/dashboard/accounts">
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
