import React, { Suspense, lazy, useMemo, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminProvider } from "@/context/AdminContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CartProvider } from './context/CartProvider';
import { HelmetProvider } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { registerServiceWorker } from '@/lib/serviceWorker';

// Define loading components directly in the file
const LoadingSpinner = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center h-screen">
    <Loader2 className="h-12 w-12 animate-spin" />
    {message && <p className="mt-4 text-lg">{message}</p>}
  </div>
);

const RouteLoading = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const PrefetchPages = () => null;

// Lazy-loaded page components
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Settings = lazy(() => import('./pages/Settings'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Auth = lazy(() => import('./pages/Auth'));
const PrivacyAndTerms = lazy(() => import('./pages/PrivacyAndTerms'));
const DeleteData = lazy(() => import('./pages/DeleteData'));
const Admin = lazy(() => import('./pages/Admin'));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppRoutes = () => {
  const { loading } = useAdmin();

  if (loading) {
    return <LoadingSpinner message="جاري التحقق من صلاحيات الدخول..." />;
  }

  return (
    <>
      <PrefetchPages />
      <Routes>
        <Route path="/" element={<Suspense fallback={<RouteLoading />}><Index /></Suspense>} />
        <Route path="/auth" element={<Suspense fallback={<RouteLoading />}><Auth /></Suspense>} />
        <Route path="/cart" element={<Suspense fallback={<RouteLoading />}><Cart /></Suspense>} />
        <Route path="/orders" element={<Suspense fallback={<RouteLoading />}><Orders /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<RouteLoading />}><Settings /></Suspense>} />
        <Route path="/feedback" element={<Suspense fallback={<RouteLoading />}><Feedback /></Suspense>} />
        <Route path="/PrivacyAndTerms" element={<Suspense fallback={<RouteLoading />}><PrivacyAndTerms /></Suspense>} />
        <Route path="/delete-data" element={<Suspense fallback={<RouteLoading />}><DeleteData /></Suspense>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<LoadingSpinner message="جاري تحميل لوحة التحكم..." />}>
                <Admin />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Suspense fallback={<RouteLoading />}><NotFound /></Suspense>} />
      </Routes>
    </>
  );
};

const App = () => {
  const queryClient = useMemo(() => createQueryClient(), []);
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider delayDuration={300}>
          <AdminProvider>
            <CartProvider>
              <Toaster />
              <Sonner position="top-center" richColors />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </CartProvider>
          </AdminProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default React.memo(App);