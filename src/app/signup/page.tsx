'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Verifie ton email</h1>
          <p className="text-sm text-zinc-500">
            Un lien de confirmation a ete envoye a <strong>{email}</strong>.
            Clique dessus pour activer ton compte.
          </p>
          <Link href="/login" className="text-sm text-zinc-900 dark:text-zinc-100 font-medium hover:underline mt-4 inline-block">
            Retour a la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center mx-auto mb-4">
            <span className="text-white dark:text-zinc-900 font-bold text-lg">L</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Creer un compte</h1>
          <p className="text-sm text-zinc-500 mt-1">Commence a organiser tes idees</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              id="fullName"
              label="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Thomas Bobillier"
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
            />
            <Input
              id="password"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              S'inscrire
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-4">
          Deja un compte ?{' '}
          <Link href="/login" className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
