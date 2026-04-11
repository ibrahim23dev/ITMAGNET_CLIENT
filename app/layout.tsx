import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/providers';

export const metadata: Metadata = {
  title: 'ITMAGNET | AI Ticket Management',
  description: 'AI-first customer ticket management platform for agents, admins, and customers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
