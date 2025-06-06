import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    toast({
      title: "صفحة غير موجودة",
      description: `الصفحة المطلوبة (${location.pathname}) غير موجودة`,
      variant: "destructive",
    });
  }, [location.pathname, toast]);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h1 className="text-9xl font-bold text-amber-600 mb-4">404</h1>
          <p className="text-2xl text-gray-700 mb-6">
            عذرًا، الصفحة التي تبحث عنها غير موجودة
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800"
            >
              العودة للصفحة السابقة
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;