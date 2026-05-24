import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuthStore();
    // verifikasi pakai jwt token di backend
    if (!isAuthenticated) {

        // Bisa beri notif dulu, anda perlu login (sesuai app yg dimiliki)
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
}