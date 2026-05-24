import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Layout from './layout/Layout';
import ProtectedRoute from './layout/ProtectedRoute';
import HomePage from './pages/HomePage';
import DetailPostPage from './pages/DetailPostPage';
import NotifPage from './pages/NotifPage';
import ProfilePage from './pages/ProfilePage';

const router = createBrowserRouter([
    {
        path: '/auth',
        element: <AuthPage />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true, // Ini akan menjadi halaman utama (/)
                element: <HomePage />,
            },
            {
                path: 'post/:id', // Halaman detail post
                element: <DetailPostPage />,
            },
            // PROTECTED ROUTES (harus ada data user)
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: 'notifications',
                        element: <NotifPage />,
                    },
                    {
                        path: 'profile',
                        element: <ProfilePage />,
                    },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />, // Redirect jika rute tidak ditemukan
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}