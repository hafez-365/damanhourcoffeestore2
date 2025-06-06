
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickMessages = [
    "أريد الاستفسار عن الأسعار",
    "ما هي أنواع القهوة المتوفرة؟",
    "أريد طلب قهوة دمنهور الخاصة",
    "هل يوجد توصيل لمنطقتي؟",
    "أريد الاستفادة من العرض الخاص"
  ];

  const sendMessage = (message: string) => {
    const whatsappUrl = `https://wa.me/+201229204276?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      {/* WhatsApp Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>

      {/* Quick Messages Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-40 bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-4 w-80 max-w-[calc(100vw-3rem)]">
          <div className="text-center mb-4">
            <div className="bg-green-500 text-white p-2 rounded-lg mb-2">
              <MessageCircle className="mx-auto" size={24} />
            </div>
            <h3 className="font-bold text-green-800">تواصل معنا عبر واتساب</h3>
            <p className="text-sm text-gray-600">اختر رسالة سريعة أو اكتب رسالتك</p>
          </div>

          <div className="space-y-2 mb-4">
            {quickMessages.map((message, index) => (
              <button
                key={index}
                onClick={() => sendMessage(message)}
                className="w-full text-right p-3 bg-gray-50 hover:bg-green-50 rounded-lg text-sm border border-gray-200 hover:border-green-300 transition-all duration-200"
              >
                {message}
              </button>
            ))}
          </div>

          <button
            onClick={() => sendMessage("مرحباً، أريد الاستفسار عن قهوة دمنهور")}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-center transition-all duration-200"
          >
            ابدأ محادثة جديدة
          </button>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
