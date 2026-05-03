'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  };

  return (
    <main className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-16">
      
      {/* 🌌 Animated Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#020617_0%,#020617_100%)]" />

      <motion.div
        className="absolute -top-32 left-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-0 right-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* 🌟 Floating grid glow */}
      <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(circle,rgba(59,130,246,0.15)_1px,transparent_1px)] [background-size:40px_40px]" />

      {/* 🔥 Card */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_40px_140px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
      >
        {/* Glow border */}
        <div className="absolute inset-0 rounded-3xl border border-blue-500/10 pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-300"
        >
          404
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Page Missing
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
        >
          Lost in the system.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-xl text-base text-slate-300 sm:text-lg"
        >
          The page you're looking for doesn’t exist or has been moved. Try navigating back or head to the dashboard.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            onClick={handleGoBack}
            className="group bg-blue-600 text-white hover:bg-blue-500 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Go Back
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <Link href="/">
              <Compass className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </motion.div>

        {/* 🔥 Floating 404 text (background effect) */}
        <motion.div
          className="absolute right-6 bottom-4 text-[120px] font-black text-white/5 select-none"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          404
        </motion.div>
      </motion.section>
    </main>
  );
}