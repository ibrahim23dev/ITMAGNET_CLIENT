'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { setCookie } from '@/lib/cookies';
import { Ticket, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.register({ name, email, password, role: 'customer' });
      const token = response.data.data.accessToken;
      setToken(token);
      setCookie('itmagnet_access_token', token, 1);
      router.push('/dashboard');
    } catch (err) {
      setError('Unable to create account. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Design/Features */}
      <div className="hidden lg:flex relative bg-primary overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="relative max-w-md space-y-12 text-white">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Start your journey with AI-powered support.
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Unlock the full potential of your support team with ITMAGNET's advanced automation tools.
            </p>
          </div>

          <div className="space-y-6">
            {[
              "Automated Ticket Classification",
              "RAG-based Semantic Search",
              "AI Response Suggestions",
              "Real-time Analytics Dashboard"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <span className="text-lg font-medium">{text}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <p className="text-sm italic">
              "Joining ITMAGNET was the best decision for our customer success team. We've seen a 300% increase in productivity."
            </p>
            <p className="mt-4 font-bold text-sm">— Michael Chen, Director of CX</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
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
                Create Account
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Join ITMAGNET today and experience the future of support.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <Input 
                required
                className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border-none px-4"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Jane Doe" 
              />
            </div>
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
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
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
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>

          <p className="text-xs text-center text-slate-400 leading-relaxed px-4">
            By clicking "Create Account", you agree to our 
            <Link href="/terms" className="underline mx-1">Terms of Service</Link> 
            and 
            <Link href="/privacy" className="underline mx-1">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
