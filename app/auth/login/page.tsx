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
  const setToken = useAuthStore((state) => state.setToken);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const token = response.data.data.accessToken;
      setToken(token);
      setCookie('itmagnet_access_token', token, 1);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
              <Ticket className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome Back
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Enter your credentials to access your support dashboard.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <Input 
                type="email" 
                required
                className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border-none px-4"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@company.com" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input 
                type="password" 
                required
                className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border-none px-4"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-bold text-primary hover:underline">
                Register now
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side: Design/Image */}
      <div className="hidden lg:flex relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-600/30 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          alt="Dashboard Preview"
        />
        <div className="relative max-w-lg space-y-6 text-center animate-in">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Empower your support team with AI Intelligence
          </h2>
          <p className="text-slate-300 text-lg italic">
            "ITMAGNET has completely transformed how we handle customer inquiries. The AI suggestions are eerily accurate."
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full border-2 border-primary bg-slate-700 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Sarah" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm">Sarah Jenkins</p>
              <p className="text-slate-400 text-xs">Head of Support, TechFlow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
