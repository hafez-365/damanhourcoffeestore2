import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // هنا يمكنك إضافة منطق إرسال الرسالة إلى الخادم
      await new Promise(resolve => setTimeout(resolve, 1000)); // محاكاة طلب الشبكة

      toast({
        title: "تم إرسال رسالتك",
        description: "سنقوم بالرد عليك في أقرب وقت ممكن",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "يرجى المحاولة مرة أخرى لاحقاً",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Helmet>
        <title>اتصل بنا | قهوة دمنهور</title>
        <meta name="description" content="تواصل معنا للاستفسارات والطلبات الخاصة" />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-amber-900 text-center mb-8">اتصل بنا</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-amber-900 mb-6">معلومات التواصل</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-amber-900">العنوان</h3>
                    <p className="text-amber-700">شارع الجمهورية، دمنهور، البحيرة</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-amber-900">الهاتف</h3>
                    <p className="text-amber-700" dir="ltr">+20 123 456 7890</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-amber-900">البريد الإلكتروني</h3>
                    <p className="text-amber-700">info@damanhourcoffee.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Clock className="h-6 w-6 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-amber-900">ساعات العمل</h3>
                    <p className="text-amber-700">من السبت إلى الخميس: 9 صباحاً - 10 مساءً</p>
                    <p className="text-amber-700">الجمعة: 2 مساءً - 10 مساءً</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">خدمة العملاء</h2>
              <p className="text-amber-700">
                فريق خدمة العملاء لدينا متاح للرد على استفساراتكم وتقديم المساعدة.
                لا تترددوا في التواصل معنا في أي وقت.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold text-amber-900 mb-6">أرسل لنا رسالة</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-amber-900 mb-2">الاسم</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-amber-900 mb-2">البريد الإلكتروني</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-amber-900 mb-2">رقم الهاتف</label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-amber-900 mb-2">الرسالة</label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال الرسالة'
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact; 