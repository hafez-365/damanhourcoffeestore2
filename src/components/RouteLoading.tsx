import React from 'react';
import { Loader2 } from 'lucide-react';

const RouteLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-amber-600 mx-auto" />
        <p className="mt-4 text-amber-800">جاري التحميل...</p>
      </div>
    </div>
  );
};

export default RouteLoading; 