declare module 'socket.io-client' {
  export type Socket = {
    connected: boolean;
    on: (event: string, listener: (payload: any) => void) => void;
    disconnect: () => void;
  };

  export function io(url: string, options?: Record<string, unknown>): Socket;
}
