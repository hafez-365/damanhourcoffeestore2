import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;  // عنصر React واحد
  requiredRole?: string;         // دور معين (مثلاً 'admin') أو undefined لأي مستخدم مسجل
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>...جاري التحقق من الدخول</div>;
  }

  if (!user) {
    // إذا لم يكن المستخدم مسجلاً الدخول، يوجه إلى صفحة تسجيل الدخول
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // إذا دور المستخدم لا يطابق المطلوب، يعيد التوجيه للصفحة الرئيسية
    return <Navigate to="/" replace />;
  }

  // السماح بالوصول إذا تحقق الشرطان أعلاه
  return children;
};

export default ProtectedRoute;
