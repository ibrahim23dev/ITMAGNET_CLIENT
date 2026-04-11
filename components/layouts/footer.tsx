'use client';

import Link from 'next/link';
import { Ticket, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <Ticket className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                ITMAGNET
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The AI-first customer ticket management platform designed for modern support teams. 
              Efficiency meets intelligence.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Product</h3>
            <ul className="space-y-4">
              <li><Link href="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">AI Classification</Link></li>
              <li><Link href="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Semantic Search</Link></li>
              <li><Link href="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Agent Workflow</Link></li>
              <li><Link href="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/docs" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/help" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/status" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Status</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6">Newsletter</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Subscribe to get the latest AI insights and product updates.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 ITMAGNET AI. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}