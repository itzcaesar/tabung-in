'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login, type AuthState } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {});

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground">
            <Wallet className="h-7 w-7 text-background" />
          </div>
          <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
          <CardDescription>Masuk ke akun Tabung.in kamu</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.errors?.general && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {state.errors.general.join(', ')}
              </div>
            )}
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
              placeholder="Masukkan kata sandi"
              error={state.errors?.password?.join(', ')}
              required
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Sedang masuk...' : 'Masuk'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-foreground hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
