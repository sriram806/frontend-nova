'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
    
    const socketInstance = io(`${gatewayUrl}/ws/dashboard`, {
      auth: { token: user.id }, // Using userId as token for simplicity as per socket.service.ts
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Admin socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Admin socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('notification:created', (payload) => {
      console.log('New notification received:', payload);
      toast.info(payload.title || 'New Notification', {
        description: payload.message,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
