import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// تعريف واجهة ExtendedUser بدون التوسع من User
export interface ExtendedUser {
  id: string;
  role?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface SignUpMetadata {
  full_name?: string;
  phone?: string;
  address?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchUserProfile = useCallback(async (userId: string): Promise<ExtendedUser | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (!data) {
        console.warn("No profile found for user:", userId);
        return null;
      }

      return {
        id: data.id,
        role: data.role || null,
        full_name: data.full_name || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        email_verified: data.email_verified || false,
        phone_verified: data.phone_verified || false,
        avatar_url: data.avatar_url || null,
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
      };
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      return null;
    }
  }, []);

  const updateUserSessionAndProfile = useCallback(async (currentSession: Session | null) => {
    try {
      if (!currentSession?.user) {
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      // تحديث الجلسة فوراً
      setSession(currentSession);

      // إنشاء كائن المستخدم الأولي من بيانات الجلسة
      const initialUser: ExtendedUser = {
        id: currentSession.user.id,
        email: currentSession.user.email || null,
      };
      setUser(initialUser);
      
      // تحديث حالة التحميل بعد تعيين البيانات الأولية
      setLoading(false);

      // جلب البيانات الإضافية من الملف الشخصي
      const profile = await fetchUserProfile(currentSession.user.id);
      
      if (profile) {
        setUser(prev => ({
          ...prev,
          ...profile,
        }));
      }
    } catch (err) {
      console.error("Error in updateUserSessionAndProfile:", err);
      setLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    // تحقق من الجلسة الحالية عند تحميل التطبيق
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        updateUserSessionAndProfile(initialSession);
      }
    }).catch(error => {
      console.error("Error in initial getSession:", error);
      if (mounted) {
        setLoading(false);
      }
    });

    // إعداد مستمع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange((event, sessionFromListener) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN') {
        updateUserSessionAndProfile(sessionFromListener);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setLoading(false);
      } else {
        updateUserSessionAndProfile(sessionFromListener);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [updateUserSessionAndProfile]);

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        toast({
          title: `خطأ في تسجيل الدخول باستخدام ${provider}`,
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data;
    } catch (err) {
      console.error(`Error in signInWith${provider}:`, err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      if (data?.user) {
        // إنشاء الملف الشخصي
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: metadata?.full_name,
            phone: metadata?.phone,
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // حذف المستخدم إذا فشل إنشاء الملف الشخصي
          await supabase.auth.admin.deleteUser(data.user.id);
          throw profileError;
        }
      }

      return data;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<ExtendedUser>) => {
    if (!user) throw new Error("User not authenticated");

    try {
      // تحديث بيانات المستخدم في auth (user_metadata)
      const { data: updatedAuthData, error: authError } = await supabase.auth.updateUser({
        data: {
          ...user,
          full_name: updates.full_name,
          phone: updates.phone,
        }
      });

      if (authError) throw authError;

      // تحديث البيانات الإضافية في جدول profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          role: updates.role,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // تحديث حالة المستخدم المحلية
      setUser(prev => prev ? { ...prev, ...updates } : null);

      return updatedAuthData;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateUserProfile,
  };
};