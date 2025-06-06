import React, { useState } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  priceFilter: string;
  setPriceFilter: (value: string) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  resetFilters: () => void;
  resultCount: number;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  setSearchTerm,
  priceFilter,
  setPriceFilter,
  ratingFilter,
  setRatingFilter,
  resetFilters,
  resultCount,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleReset = () => {
    resetFilters();
    setShowModal(false);
  };

  return (
    <div className="mb-6">
      {/* شريط البحث وزر الفلتر */}
      <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="ابحث عن منتجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
              aria-label="مسح البحث"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
          aria-label="فتح فلاتر البحث"
        >
          <Filter size={18} />
          <span className="hidden sm:inline">تصفية</span>
        </button>
      </div>

      {/* نافذة الفلتر المنبثقة */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* رأس النافذة */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-amber-800">تصفية النتائج</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-amber-50 text-amber-600"
                aria-label="إغلاق النافذة"
              >
                <X size={24} />
              </button>
            </div>

            {/* محتوى الفلاتر */}
            <div className="p-4 space-y-6">
              {/* فلتر السعر */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">السعر</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'الكل' },
                    { value: 'low', label: 'أقل من 80 ج' },
                    { value: 'medium', label: '80-100 ج' },
                    { value: 'high', label: 'أكثر من 100 ج' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPriceFilter(option.value)}
                      className={`py-2 px-3 rounded-lg border transition-colors ${
                        priceFilter === option.value
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* فلتر التقييم */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">التقييم</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'all', label: 'الكل' },
                    { value: '4.5', label: '4.5+ نجوم' },
                    { value: '4.0', label: '4+ نجوم' },
                    { value: '3.0', label: '3+ نجوم' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRatingFilter(option.value)}
                      className={`py-2 px-3 rounded-lg border transition-colors ${
                        ratingFilter === option.value
                          ? 'border-amber-500 bg-amber-50 text-amber-800'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* تذييل النافذة */}
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {resultCount} نتيجة
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                  إعادة تعيين
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  تطبيق الفلاتر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;