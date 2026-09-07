import { create } from 'zustand';

import { createId } from '@/lib/utils';

export type ToastTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id' | 'tone' | 'duration'> & Partial<Pick<Toast, 'tone' | 'duration'>>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const MAX_VISIBLE = 4;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = createId('toast');
    const entry: Toast = {
      id,
      tone: toast.tone ?? 'default',
      duration: toast.duration ?? (toast.tone === 'danger' ? 8000 : 4500),
      title: toast.title,
      description: toast.description,
      action: toast.action,
    };
    set((state) => ({ toasts: [...state.toasts, entry].slice(-MAX_VISIBLE) }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/**
 * Imperative helper so services and mutation callbacks can raise a toast
 * without needing hooks.
 */
export const toast = {
  show: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description }),
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: 'danger' }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: 'warning' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: 'info' }),
  withAction: (title: string, action: ToastAction, description?: string) =>
    useToastStore.getState().push({ title, description, action, duration: 9000 }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
