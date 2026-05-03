export type ToastType = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type Listener = (toast: ToastItem) => void;

const listeners = new Set<Listener>();

function normalizeMessage(message: unknown): string {
  if (typeof message === 'string') {
    return message;
  }

  if (message instanceof Error) {
    return message.message;
  }

  if (message && typeof message === 'object' && 'message' in message) {
    const nestedMessage = (message as { message?: unknown }).message;
    if (typeof nestedMessage === 'string') {
      return nestedMessage;
    }
  }

  if (message === undefined || message === null) {
    return 'Something went wrong.';
  }

  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

function emit(type: ToastType, message: unknown) {
  const toast: ToastItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    message: normalizeMessage(message),
  };

  listeners.forEach((listener) => listener(toast));
}

export const toast = {
  success: (message: unknown) => emit('success', message),
  error: (message: unknown) => emit('error', message),
  info: (message: unknown) => emit('info', message),
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
