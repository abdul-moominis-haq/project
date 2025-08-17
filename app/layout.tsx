import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatBot } from '@/components/ui/chatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartAgri - Smart Farming Management System',
  description: 'Intelligent farming management platform with IoT integration, weather monitoring, and AI-powered recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ChatBot />
        </AuthProvider>
      </body>
    </html>
  );
}