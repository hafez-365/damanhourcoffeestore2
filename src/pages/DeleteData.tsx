import React from 'react';
import { Helmet } from 'react-helmet-async';

const DeleteData = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-amber-50 px-6 py-12 flex items-center justify-center">
      <Helmet>
        <title>حذف بيانات المستخدم - قهوة دمنهور</title>
      </Helmet>

      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">🗑️ حذف بيانات المستخدم</h1>
        <p className="text-amber-700 leading-loose mb-4">
          نحن نحترم خصوصيتك وحقوقك المتعلقة بمعلوماتك الشخصية. إذا كنت ترغب في حذف بياناتك من نظامنا، يرجى اتباع التعليمات التالية:
        </p>

        <h2 className="text-xl font-semibold text-amber-800 mb-2">🔐 كيف يتم حذف البيانات؟</h2>
        <ul className="list-disc list-inside text-amber-700 space-y-2 mb-4">
          <li>
            إذا كنت مسجلًا لدينا، يمكنك إرسال طلب حذف إلى البريد الإلكتروني:
            <br />
            <strong className="text-amber-900">hafez911kk@gmail.com</strong>
          </li>
          <li>يرجى التأكد من ذكر عنوان بريدك الإلكتروني المستخدم في التسجيل.</li>
          <li>سيتم معالجة طلبك خلال <strong>7 أيام عمل</strong> وسيتم إعلامك عند اكتمال الحذف.</li>
        </ul>

        <h2 className="text-xl font-semibold text-amber-800 mb-2">📌 ملاحظات مهمة:</h2>
        <ul className="list-disc list-inside text-amber-700 space-y-2 mb-4">
          <li>بعد حذف البيانات، لن تتمكن من استرجاع الحساب.</li>
          <li>إذا كانت هناك عمليات شراء قيد التنفيذ، فقد يتم تأجيل الحذف لحين إتمامها.</li>
          <li>قد نحتفظ ببعض البيانات المطلوبة قانونيًا لفترة محددة قبل إزالتها نهائيًا.</li>
        </ul>

        <p className="text-amber-700 mt-6">
          إذا كان لديك أي استفسار، لا تتردد في التواصل معنا عبر البريد الإلكتروني أعلاه.
        </p>
      </div>
    </div>
  );
};

export default DeleteData;
