'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, BrainCircuit, Search, Bot, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 overflow-hidden">
          <div className="container relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">AI-First Ticketing System</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] animate-in" style={{ animationDelay: '0.1s' }}>
                Automate Support with <span className="text-primary">Intelligence</span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in" style={{ animationDelay: '0.2s' }}>
                ITMAGNET uses RAG-based AI to classify, summarize, and solve customer tickets instantly. 
                Reduce response times by 80% while keeping your human touch.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-in" style={{ animationDelay: '0.3s' }}>
                <Link href="/auth/register">
                  <Button size="lg" className="rounded-full px-8 py-7 text-lg shadow-xl shadow-primary/20">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/#demo">
                  <Button size="lg" variant="outline" className="rounded-full px-8 py-7 text-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Float Elements */}
            <div className="mt-20 relative animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] opacity-20 blur-2xl"></div>
              <div className="relative glass-morphism rounded-[2.5rem] p-4 lg:p-8 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
                  alt="ITMAGNET Platform" 
                  className="rounded-2xl shadow-2xl border border-white/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-slate-950">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Core Features</h2>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white">Everything you need to scale support</h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BrainCircuit className="h-6 w-6" />,
                  title: "AI Classification",
                  desc: "Automatically categorize and prioritize tickets using deep NLP models."
                },
                {
                  icon: <Search className="h-6 w-6" />,
                  title: "Semantic Search",
                  desc: "Find similar resolved tickets instantly with vector-based RAG search."
                },
                {
                  icon: <Bot className="h-6 w-6" />,
                  title: "Agent Copilot",
                  desc: "AI suggested replies and workflows that learn from your best agents."
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Real-time Automation",
                  desc: "Instant summaries and automated triaging as soon as a ticket arrives."
                },
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  title: "Advanced Analytics",
                  desc: "Deep insights into agent performance and customer satisfaction."
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "Secure & Scalable",
                  desc: "Enterprise-grade security and role-based access control."
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 bg-slate-50 dark:bg-slate-900/50">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24">
          <div className="container">
            <div className="relative rounded-[3rem] bg-primary overflow-hidden p-12 lg:p-20 text-center space-y-8">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white relative z-10">
                Ready to transform your customer support?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto relative z-10">
                Join 500+ companies using ITMAGNET to provide world-class support. 
                Start your 14-day free trial today.
              </p>
              <div className="flex justify-center relative z-10">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-50 px-10 py-7 rounded-full text-lg font-bold shadow-2xl">
                    Create Account Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
