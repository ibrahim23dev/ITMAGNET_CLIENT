'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { setCookie } from '@/lib/cookies';
import { Ticket, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  // ✅ FIX: both needed
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      // 🔥 IMPORTANT FIX START
      const { accessToken, refreshToken, user } = response;

      // save token
      setToken(accessToken, refreshToken);

      // save cookie (optional but ok)
      setCookie('itmagnet_access_token', accessToken, 7);

      // 🔥 SAVE USER (MAIN FIX)
      setUser({
        id: user.id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      console.log("✅ LOGIN USER:", user);
      // 🔥 IMPORTANT FIX END

      router.push('/dashboard');

    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* LEFT */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-800">
        <div className="w-full max-w-md space-y-8">

          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>

            <div className="flex h-12 w-12 items-center justify-center bg-primary text-white">
              <Ticket className="h-7 w-7" />
            </div>

            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-slate-500">Login to your dashboard</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
          </form>

        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex items-center justify-center bg-slate-900 text-white">
        <h2 className="text-3xl font-bold">ITMAGNET Dashboard</h2>
      </div>

    </div>
  );
}