import { create } from 'zustand';

// Count Digunakan di Layout.tsx dan NotifPage.tsx 
interface NotifState {
    unreadCount: number;
    setUnreadCount: (count: number | ((prev: number) => number)
    ) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
    unreadCount: 0,
    setUnreadCount: (count) =>
        set((state) => ({
            unreadCount:
                typeof count === "function"
                    ? count(state.unreadCount)
                    : count,
        }))
}));