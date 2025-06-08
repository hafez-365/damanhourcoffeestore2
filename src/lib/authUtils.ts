import { supabase } from '@/integrations/supabase/client';
import { User, AuthError, Session } from '@supabase/supabase-js';

// تعريف الأنواع
interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
  role?: string;
}

interface SignUpResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * تسجيل الدخول باستخدام البريد وكلمة المرور
 * 
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @returns {Promise<User>} بيانات المستخدم المسجل
 * @throws {AuthError} عند حدوث خطأ
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data?.user) {
    throw new AuthError('فشل تسجيل الدخول', 500);
  }

  return data.user;
};

/**
 * إنشاء حساب جديد مع إدراج بيانات المستخدم في جدول profiles
 * 
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @param {ProfileData} profileData - بيانات الملف الشخصي
 * @returns {Promise<SignUpResult>} نتيجة عملية التسجيل
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  profileData: ProfileData
): Promise<SignUpResult> => {
  const result: SignUpResult = { user: null, session: null, error: null };

  try {
    // تنسيق رقم الهاتف
    const formattedPhone = profileData.phone ? 
      (profileData.phone.startsWith('0') ? 
      `+2${profileData.phone}` : 
      `+${profileData.phone}`) : undefined;

    // 1. إنشاء حساب المصادقة
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      phone: formattedPhone,
      options: {
        data: {
          full_name: profileData.full_name,
          address: profileData.address,
          role: profileData.role || 'customer'
        }
      }
    });

    if (authError) {
      throw authError;
    }

    if (!data?.user) {
      throw new AuthError('لم يتم إنشاء المستخدم بنجاح', 500);
    }

    // 2. إدراج بيانات إضافية في جدول profiles
    const userId = data.user.id;
    
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: profileData.full_name,
      email: email,
      phone: formattedPhone,
      address: profileData.address,
      role: profileData.role || 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      console.error("خطأ في إنشاء الملف الشخصي:", profileError);
      // لا نريد إيقاف عملية التسجيل إذا فشل إنشاء الملف الشخصي
      // لأن الـ trigger سيقوم بإنشائه
    }

    result.user = data.user;
    result.session = data.session;
    return result;
  } catch (error) {
    if (error instanceof AuthError) {
      result.error = error;
    } else {
      const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء إنشاء الحساب";
      result.error = new AuthError(message, 500);
    }
    return result;
  }
};

/**
 * التحقق مما إذا كان المستخدم أدمن
 * 
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<boolean>} حالة الأدمن
 */
export const checkUserAdminStatus = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return false;
    }
    
    return data.role === "admin";
  } catch (error) {
    console.error("خطأ في التحقق من حالة الأدمن:", error);
    return false;
  }
};

/**
 * تسجيل الخروج
 * 
 * @returns {Promise<boolean>} نجاح العملية
 */
export const signOut = async (): Promise<boolean> => {
  const { error } = await supabase.auth.signOut();
  return !error;
};

/**
 * الحصول على بيانات ملف المستخدم
 * 
 * @param {string} userId - معرف المستخدم
 * @returns {Promise<ProfileData | null>} بيانات الملف الشخصي
 */
export const getUserProfile = async (userId: string): Promise<ProfileData | null> => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, address, role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ProfileData;
  } catch (error) {
    console.error("خطأ في الحصول على بيانات المستخدم:", error);
    return null;
  }
};