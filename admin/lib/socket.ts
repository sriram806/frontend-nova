'use client';

type JobSocketPayload = {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: unknown;
  error?: string;
  type?: string;
  userId?: string;
};

type DashboardSocketOptions = {
  token: string;
  onEvent: (eventName: string, payload: JobSocketPayload) => void;
};

type SocketLike = {
  connected: boolean;
  on: (event: string, listener: (payload: JobSocketPayload) => void) => void;
  disconnect: () => void;
};

let dashboardSocket: SocketLike | null = null;

export async function connectDashboardSocket(options: DashboardSocketOptions): Promise<SocketLike | null> {
  if (dashboardSocket?.connected) {
    return dashboardSocket;
  }

  try {
    const socketClient = await import('socket.io-client');
    const socket = socketClient.io(
      `${process.env.NEXT_PUBLIC_WS_BASE_URL ?? process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'http://localhost:4000'}/ws/dashboard`,
      {
        transports: ['websocket'],
        withCredentials: true,
        auth: {
          token: options.token,
        },
      }
    );

    ['job:completed', 'job:failed', 'resume:completed', 'resume:failed', 'roadmap:completed', 'roadmap:failed', 'jobs:completed', 'jobs:failed'].forEach(
      (eventName) => {
        socket.on(eventName, (payload: JobSocketPayload) => options.onEvent(eventName, payload));
      }
    );

    dashboardSocket = socket as SocketLike;
    return dashboardSocket;
  } catch {
    return null;
  }
}

export function disconnectDashboardSocket() {
  dashboardSocket?.disconnect();
  dashboardSocket = null;
}
