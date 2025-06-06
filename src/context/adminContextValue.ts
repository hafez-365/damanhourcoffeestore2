// src/context/adminContextValue.ts
import { createContext, Dispatch, SetStateAction } from 'react';

export interface AdminContextType {
  isAdmin: boolean | null;
  loading: boolean;
  refreshAdminStatus: () => Promise<void>;
  setIsAdmin: Dispatch<SetStateAction<boolean | null>>;
}

export const AdminContext = createContext<AdminContextType>({
  isAdmin: null,
  loading: true,
  refreshAdminStatus: async () => {
    console.warn("refreshAdminStatus called on default context value");
  },
  setIsAdmin: () => {
    console.warn("setIsAdmin called on default context value");
  },
});