import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SinglePage from './pages/SinglePage';
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
                element: <SinglePage />,
            },
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
    {
        path: '*',
        element: <Navigate to="/" replace />, // Redirect jika rute tidak ditemukan
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}