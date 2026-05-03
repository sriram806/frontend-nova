import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Nova | AI Skill Learning Platform',
  description: 'AI skill learning, exams, roadmaps, and interview prep in one premium workspace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
