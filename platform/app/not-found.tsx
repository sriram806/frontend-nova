'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.25),transparent_45%),linear-gradient(180deg,rgba(8,10,22,1)_0%,rgba(3,6,20,1)_100%)]" />
      <div className="absolute -top-20 left-8 -z-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-10 -z-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl animate-blob animation-delay-2000" />

      <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-12">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          404
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          Page Missing
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          This page drifted out of orbit.
        </h1>
        <p className="max-w-xl text-base text-slate-300 sm:text-lg">
          The link might be old, the URL may be incorrect, or the page has moved. You can jump back to where you came from or head to the home page.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={handleGoBack}
            className="group bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Go Back
          </Button>

          <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10">
            <Link href="/">
              <Compass className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
