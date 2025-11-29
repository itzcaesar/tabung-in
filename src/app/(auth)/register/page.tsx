'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { register, type AuthState } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(register, {});

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground">
            <Wallet className="h-7 w-7 text-background" />
          </div>
          <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>Mulai kelola keuanganmu hari ini</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.errors?.general && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {state.errors.general.join(', ')}
              </div>
            )}
            <Input
              name="name"
              type="text"
              label="Nama"
              placeholder="Nama lengkap"
              error={state.errors?.name?.join(', ')}
              required
            />
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="email@contoh.com"
              error={state.errors?.email?.join(', ')}
              required
            />
            <Input
              name="password"
              type="password"
              label="Kata Sandi"
              placeholder="Minimal 8 karakter"
              error={state.errors?.password?.join(', ')}
              required
              minLength={8}
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Membuat akun...' : 'Buat Akun'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-foreground hover:underline">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
