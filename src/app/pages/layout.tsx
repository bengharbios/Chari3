import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import AppShell from '@/components/layout/AppShell';
import ChatWidget from '@/components/chat/ChatWidget';
import React from 'react';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Header />
      <main className="flex-1 w-full min-h-screen flex flex-col">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <ChatWidget />
    </AppShell>
  );
}
