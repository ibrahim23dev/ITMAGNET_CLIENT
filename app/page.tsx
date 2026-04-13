'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, BrainCircuit, Search, Bot, Zap, BarChart3, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI-First Ticketing System
              </div>

              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
                Support tickets that <span className="text-blue-600">resolve themselves</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                ITMAGNET uses intelligent RAG-based AI to automatically classify, 
                summarize, and suggest solutions for customer tickets — helping your team respond faster and smarter.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/auth/register">
                  <Button size="lg" className="px-9 py-7 text-base font-medium rounded-xl">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="px-9 py-7 text-base font-medium rounded-xl">
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 text-sm text-slate-500 pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>80% faster response</span>
                </div>
                <div>14-day free trial</div>
                <div>No credit card needed</div>
              </div>
            </div>

            {/* Hero Image / Mockup */}
            <div className="mt-16 md:mt-20 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2400" 
                alt="ITMAGNET Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-blue-600 font-medium tracking-wider text-sm">FEATURES</p>
              <h2 className="text-4xl font-semibold text-slate-900 dark:text-white mt-3">
                Built for speed. Powered by intelligence.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BrainCircuit className="h-6 w-6" />,
                  title: "Smart Ticket Classification",
                  desc: "AI automatically detects issue type, urgency, and department with high accuracy."
                },
                {
                  icon: <Search className="h-6 w-6" />,
                  title: "Semantic Search & Knowledge Base",
                  desc: "Instantly find similar past tickets and solutions using vector search."
                },
                {
                  icon: <Bot className="h-6 w-6" />,
                  title: "AI Copilot for Agents",
                  desc: "Real-time reply suggestions and next-step recommendations while chatting."
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Automatic Triaging & Summarization",
                  desc: "Tickets are summarized and assigned the moment they are created."
                },
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  title: "Performance Analytics",
                  desc: "Clear insights on resolution time, team productivity, and AI impact."
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "Enterprise Security",
                  desc: "Role-based access, audit trails, and full data privacy compliance."
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 hover:shadow-md bg-white dark:bg-slate-900"
                >
                  <div className="text-blue-600 mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-[15.5px] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-semibold mb-6">
              Ready to modernize your support team?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
              Join companies that are already using ITMAGNET to deliver faster and better customer support.
            </p>
            
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-base rounded-xl">
                Create Account — It's Free to Start
              </Button>
            </Link>
            
            <p className="text-xs text-slate-500 mt-6">
              14 days full access • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}