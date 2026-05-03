"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const isServerOpen = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SERVER_OPEN !== undefined
  ? process.env.NEXT_PUBLIC_SERVER_OPEN === 'true'
  : true;

export default function HomeRedirect() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isServerOpen) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated && user?.role === 'admin') {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  return null;
}
