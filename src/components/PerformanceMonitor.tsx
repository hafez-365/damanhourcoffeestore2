// src/components/PerformanceMonitor.tsx
import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/analytics';

// تعريف أنواع مفصلة لأداء المدخلات
interface PerformancePaintEntry extends PerformanceEntry {
  name: 'first-paint' | 'first-contentful-paint';
  entryType: 'paint';
  startTime: number;
}

interface PerformanceResourceEntry extends PerformanceEntry {
  entryType: 'resource';
  duration: number;
}

interface PerformanceLongTaskEntry extends PerformanceEntry {
  entryType: 'longtask';
  duration: number;
}

// نوع الحماية للتحقق من وجود الخصائص
function isPerformancePaintEntry(entry: PerformanceEntry): entry is PerformancePaintEntry {
  return entry.entryType === 'paint' && 
         (entry.name === 'first-paint' || entry.name === 'first-contentful-paint');
}

const PerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // تتبع مقاييس الأداء الأساسية
      const perfObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (isPerformancePaintEntry(entry)) {
            console.log(`First Contentful Paint: ${entry.startTime}ms`);
            reportWebVitals('FCP', entry.startTime);
          }
        });
      });
      
      perfObserver.observe({ type: 'paint', buffered: true });

      // تتبع أخطاء الأداء
      const errorObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.error('Performance error:', entry);
          
          // استخراج القيمة الرقمية بشكل آمن
          const value = 'duration' in entry ? Number(entry.duration) : 0;
          reportWebVitals('PERF_ERROR', value);
        });
      });
      
      errorObserver.observe({ type: 'resource', buffered: true });
      errorObserver.observe({ type: 'longtask', buffered: true });

      return () => {
        perfObserver.disconnect();
        errorObserver.disconnect();
      };
    }
  }, []);

  return null;
};

export default PerformanceMonitor;