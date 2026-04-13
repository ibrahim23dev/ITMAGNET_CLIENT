'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ticket, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-white transition-transform group-hover:scale-110">
            <Ticket className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            ITMAGNET
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-white">
            Features
          </Link>
          <Link href="/#solutions" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-white">
            Solutions
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-white">
            Pricing
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="px-6 transition-all">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600 dark:text-slate-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container py-6 flex flex-col gap-4">
          <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2">Features</Link>
          <Link href="/#solutions" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2">Solutions</Link>
          <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2">Pricing</Link>
          <hr className="border-slate-200 dark:border-slate-800" />
          <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2">Log in</Link>
          <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full py-4">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
