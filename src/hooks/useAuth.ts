import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// تعريف واجهة ExtendedUser بدون التوسع من User
export interface ExtendedUser {
  id: string;
  role?: string | null;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  email?: string | null; // سيتم تعبئته من الجلسة
}

export const useAuth = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchUserProfile = useCallback(async (userId: string): Promise<ExtendedUser | null> => {
    console.log("useAuth: fetchUserProfile CALLED for userId:", userId);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && status !== 406) {
        console.error("useAuth: fetchUserProfile Supabase error (non-406):", error);
        return null;
      }
      if (!data && status === 406) {
        console.log("useAuth: fetchUserProfile - No profile found (status 406).");
        return null;
      }
      if (!data && !error) {
        console.warn("useAuth: fetchUserProfile - No data and no error.");
        return null;
      }
      
      console.log("useAuth: fetchUserProfile successful. Profile data:", data);
      return {
        id: data.id,
        role: data.role || null,
        full_name: data.full_name || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postal_code || null,
        country: data.country || null,
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
        // لا نعيد email لأنه غير موجود في الجدول
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("useAuth: CATCH in fetchUserProfile:", err.message);
      } else {
        console.error("useAuth: CATCH in fetchUserProfile: Unknown error", err);
      }
      return null;
    }
  }, []);

  const updateUserSessionAndProfile = useCallback(async (currentSession: Session | null) => {
    console.log("useAuth: updateUserSessionAndProfile CALLED. Session:", currentSession);

    if (currentSession?.user) {
      const profile = await fetchUserProfile(currentSession.user.id);

      const newUser: ExtendedUser = {
        ...profile,
        id: currentSession.user.id,
        email: currentSession.user.email || null, // أخذ البريد الإلكتروني من الجلسة
      };

      setUser((prevUser) => {
        if (prevUser?.id === newUser.id && 
            prevUser.role === newUser.role &&
            prevUser.full_name === newUser.full_name &&
            prevUser.phone === newUser.phone) {
          return prevUser;
        }
        return newUser;
      });

      setSession((prevSession) => {
        if (
          prevSession?.access_token === currentSession.access_token &&
          prevSession?.user?.id === currentSession.user.id
        ) {
          return prevSession;
        }
        return currentSession;
      });
    } else {
      setUser(null);
      setSession(null);
      console.log("useAuth: No user in session, user set to null.");
    }

    setLoading(false);
    console.log("useAuth: setLoading(false) in updateUserSessionAndProfile.");
  }, [fetchUserProfile]);

  useEffect(() => {
    console.log("useAuth: Main useEffect RUNNING to set up listener.");
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, sessionFromListener) => {
        console.log(`useAuth: onAuthStateChange TRIGGERED. Event: ${event}`, sessionFromListener);
        updateUserSessionAndProfile(sessionFromListener);
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("useAuth: Initial getSession() in useEffect resolved. Session:", initialSession);
      updateUserSessionAndProfile(initialSession);
    }).catch(error => {
      console.error("useAuth: Error in initial getSession() promise:", error);
      updateUserSessionAndProfile(null);
    });

    return () => {
      console.log("useAuth: Unsubscribing from onAuthStateChange.");
      authListener?.subscription?.unsubscribe();
    };
  }, [updateUserSessionAndProfile]);

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    console.log(`useAuth: signInWith${provider} CALLED`);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`useAuth: CATCH in signInWith${provider}:`, err.message);
      } else {
        console.error(`useAuth: CATCH in signInWith${provider}: Unknown error`, err);
      }
      throw err;
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
          address: updates.address,
          city: updates.city,
          postal_code: updates.postal_code,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // تحديث حالة المستخدم المحلية
      const newUser: ExtendedUser = {
        ...user,
        ...updates
      };
      setUser(newUser);

      return updatedAuthData.user;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("useAuth: CATCH in updateUserProfile:", err.message);
        toast({
          title: "خطأ في تحديث الملف الشخصي",
          description: err.message,
          variant: "destructive"
        });
        throw err;
      } else {
        console.error("useAuth: CATCH in updateUserProfile: Unknown error", err);
        toast({
          title: "خطأ في تحديث الملف الشخصي",
          description: "حدث خطأ غير معروف",
          variant: "destructive"
        });
        throw new Error("Unknown error");
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("useAuth: signIn CALLED with email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("useAuth: signIn - AFTER supabase.auth.signInWithPassword. Result data:", data, "Error:", error);

      if (error) {
        if (error.status === 400 && error.message === "Invalid login credentials") {
          toast({
            title: "بيانات الدخول غير صحيحة",
            description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            variant: "destructive"
          });
        } else {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message,
            variant: "destructive"
          });
        }
        throw error;
      }
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("useAuth: CATCH in signIn function:", err.message);
      } else {
        console.error("useAuth: CATCH in signIn function: Unknown error", err);
      }
      throw err;
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    console.log("useAuth: signUp CALLED with email:", email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: 'https://damanhourcoffee.netlify.app/auth/callback'
        },
      });

      console.log("useAuth: signUp - Result data:", data, "Error:", error);

      if (error) {
        toast({
          title: "خطأ في إنشاء الحساب",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      if (data.user && !data.session) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.",
          variant: "default"
        });
      }

      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("useAuth: CATCH in signUp function:", err.message);
        toast({
          title: "خطأ في إنشاء الحساب",
          description: err.message,
          variant: "destructive"
        });
      } else {
        console.error("useAuth: CATCH in signUp function: Unknown error", err);
        toast({
          title: "خطأ في إنشاء الحساب",
          description: "حدث خطأ غير معروف",
          variant: "destructive"
        });
      }
      throw err;
    }
  };

  const signOut = async () => {
    console.log("useAuth: signOut CALLED");
    try {
      const { error } = await supabase.auth.signOut();
      console.log("useAuth: signOut - Error:", error);

      if (error) {
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      setUser(null);
      setSession(null);
      console.log("useAuth: signOut successful");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("useAuth: CATCH in signOut function:", err.message);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: err.message,
          variant: "destructive"
        });
      } else {
        console.error("useAuth: CATCH in signOut function: Unknown error", err);
        toast({
          title: "خطأ في تسجيل الخروج",
          description: "حدث خطأ غير معروف",
          variant: "destructive"
        });
      }
      throw err;
    }
  };

  console.log("useAuth: HOOK RENDER/RE-RENDER. User:", user, "Session:", session, "Loading:", loading);

  return {
    user,
    session,
    loading,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    updateUserProfile
  };
};