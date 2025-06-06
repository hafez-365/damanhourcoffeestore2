// src/context/AdminContext.tsx
import React, {
  useEffect,
  useState,
  ReactNode,
  useCallback, // تم التأكد من استيراد useCallback
} from "react";
import { useAuth } from "@/hooks/useAuth"; // افترض أن useAuth يعمل بشكل صحيح ويوفر 'user'
import { checkUserAdminStatus } from "@/lib/authUtils"; // افترض أن هذه الدالة موجودة وتعمل
import { AdminContext } from './adminContextValue'; // استيراد السياق من الملف الجديد

// AdminProvider هو المكون الوحيد المصدر من هذا الملف الآن
export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdminState, setIsAdminState] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // دالة للتحقق من حالة الأدمن، مغلفة بـ useCallback
  const refreshAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdminState(false);
      setLoading(false);
      console.log("AdminProvider: No user, isAdmin set to false.");
      return;
    }

    console.log("AdminProvider: User detected (id:", user.id, "), refreshing admin status...");
    setLoading(true);
    try {
      const status = await checkUserAdminStatus(user.id);
      setIsAdminState(status);
      console.log("AdminProvider: Admin status refreshed, isAdmin:", status);
    } catch (error) {
      console.error("AdminProvider: Failed to check admin status:", error);
      setIsAdminState(false); // في حالة الخطأ، افترض أنه ليس أدمن
    } finally {
      setLoading(false);
    }
  }, [user]); // اعتماديات useCallback هي user.

  // التحقق عند تغيّر المستخدم أو عند تحميل refreshAdminStatus (وهو الآن مستقر)
  useEffect(() => {
    console.log("AdminProvider: useEffect triggered due to change in user or refreshAdminStatus.");
    refreshAdminStatus();
  }, [user, refreshAdminStatus]); // تم إضافة refreshAdminStatus إلى قائمة الاعتمادات

  return (
    <AdminContext.Provider // استخدام AdminContext المستورد
      value={{
        isAdmin: isAdminState,
        loading,
        refreshAdminStatus, // الدالة المغلفة بـ useCallback
        setIsAdmin: setIsAdminState,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

// لا يوجد أي exports أخرى في هذا الملف (تم حذف export useAdmin من هنا)