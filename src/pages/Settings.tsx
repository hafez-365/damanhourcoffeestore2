
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Save, Coffee } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    id: '',
    full_name: '',
    phone: '',
    address: '',
    city: 'دمنهور',
    country: 'مصر',
    postal_code: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
      } else {
        // Create new profile if doesn't exist
        setProfile(prev => ({ ...prev, id: user?.id || '' }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات الشخصية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ بياناتك بنجاح",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openGoogleMaps = () => {
    const address = `${profile.address}, ${profile.city}, ${profile.country}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-amber-700" size={64} />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            يجب تسجيل الدخول أولاً
          </h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Coffee className="mx-auto mb-4 text-amber-700 animate-spin" size={48} />
          <p className="text-xl text-amber-700">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <User className="mx-auto mb-4 text-amber-700" size={48} />
          <h1 className="text-3xl font-bold text-amber-900">الإعدادات الشخصية</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4">معلومات الحساب</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-amber-800 font-medium mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-amber-800 font-medium mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label className="block text-amber-800 font-medium mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+201234567890"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4">عنوان التوصيل</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-amber-800 font-medium mb-2">
                  العنوان
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="أدخل عنوانك التفصيلي"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-800 font-medium mb-2">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-amber-800 font-medium mb-2">
                    الدولة
                  </label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-800 font-medium mb-2">
                  الرمز البريدي
                </label>
                <input
                  type="text"
                  value={profile.postal_code}
                  onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="12345"
                />
              </div>

              <button
                onClick={openGoogleMaps}
                className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin size={20} />
                <span>عرض الموقع على الخريطة</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-4 space-x-reverse">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex-1 flex items-center justify-center space-x-2 space-x-reverse bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-bold disabled:opacity-50"
            >
              <Save size={20} />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
            </button>

            <button
              onClick={signOut}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
