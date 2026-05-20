import { create } from 'zustand';

// Definisikan interface Notification berdasarkan skema Prisma kamu
export interface Notification {
    id: number;
    user_id: number;
    actor_id: number;
    type: 'LIKE' | 'COMMENT' | 'REPLY'; // Sesuaikan dengan enum NotificationType kamu
    post_id: number | null;
    comment_id: number | null;
    is_read: boolean;
    created_at: string;
    // Jika kamu meng-include data actor saat fetch dari backend:
    actor?: {
        username: string;
        avatar_url: string | null;
    };
}

interface NotifState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;

    // Actions
    setNotifications: (notifs: Notification[]) => void;
    addNotification: (notif: Notification) => void;
    markAsRead: (notifId: number) => void;
    markAllAsRead: () => void;
    setLoading: (status: boolean) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    setNotifications: (notifs) => set({
        notifications: notifs,
        unreadCount: notifs.filter(n => !n.is_read).length
    }),

    addNotification: (notif) => set((state) => {
        const updatedNotifs = [notif, ...state.notifications];
        return {
            notifications: updatedNotifs,
            unreadCount: notif.is_read ? state.unreadCount : state.unreadCount + 1
        };
    }),

    markAsRead: (notifId) => set((state) => {
        const updatedNotifs = state.notifications.map((n) =>
            n.id === notifId ? { ...n, is_read: true } : n
        );
        return {
            notifications: updatedNotifs,
            unreadCount: Math.max(0, state.unreadCount - 1)
        };
    }),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
    })),

    setLoading: (status) => set({ isLoading: status })
}));