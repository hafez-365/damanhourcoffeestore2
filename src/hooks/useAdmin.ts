// src/hooks/useAdmin.ts
import { useContext } from 'react';
import { AdminContext, AdminContextType } from '@/context/adminContextValue'; // تأكد أن المسار صحيح

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider. Make sure your component is wrapped by AdminProvider.");
  }
  return context;
};