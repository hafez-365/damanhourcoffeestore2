import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { formatCurrency } from "@/utils/currencyUtils";

// تعريف أنواع البيانات
type UserAddress = {
  id: string;
  user_id: string;
  governorate: string;
  city: string;
  street: string;
  notes?: string | null;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
};

type CartItem = {
  cartItemId: string;
  productId: number;
  name_ar: string;
  description_ar: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
};

// نوع جديد لبيانات السلة المسترجعة من Supabase
type SupabaseCartItem = {
  id: string;
  quantity: number;
  products: {
    id: number;
    name_ar: string;
    description_ar: string | null;
    price: number;
    image_url: string | null;
  } | null;
};

// نوع لبيانات المنتج
type ProductData = {
  id: number;
  name_ar: string;
  description_ar: string | null;
  price: number;
  image_url: string | null;
};

const Cart = () => {
  const { user, loading: checkingSession } = useAuth();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<UserAddress>>({
    governorate: "",
    city: "",
    street: "",
    notes: "",
    is_default: false,
  });

  // جلب عناصر السلة من Supabase
  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setCartLoading(false);
      return;
    }

    setCartLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          products:product_id (
            id,
            name_ar,
            description_ar,
            price,
            image_url
          )
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      if (!data) {
        setCartItems([]);
        return;
      }

      // تحويل البيانات إلى هيكل CartItem بدون استخدام any
      const items: CartItem[] = data.map((item) => {
        const productsData = Array.isArray(item.products)
          ? (item.products[0] as ProductData)
          : (item.products as ProductData | null);

        return {
          cartItemId: item.id,
          productId: productsData?.id || 0,
          name_ar: productsData?.name_ar || "منتج غير متوفر",
          description_ar: productsData?.description_ar || null,
          price: productsData?.price || 0,
          image_url: productsData?.image_url || null,
          quantity: item.quantity,
        };
      });

      setCartItems(items);

      // حساب المجموع الكلي
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setTotalPrice(total);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      toast({
        title: "خطأ في تحميل سلة التسوق",
        description: "تعذر تحميل محتويات سلة التسوق",
        variant: "destructive",
      });
    } finally {
      setCartLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user, fetchCartItems]);

  // جلب عناوين المستخدم من Supabase
  const fetchUserAddresses = useCallback(async () => {
    if (!user) return;

    setIsLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // التحقق من صحة البيانات
      const validAddresses = (data || [])
        .filter(
          (address) =>
            address &&
            address.id &&
            address.user_id &&
            address.governorate &&
            address.city &&
            address.street
        )
        .map((address) => ({
          id: address.id,
          user_id: address.user_id,
          governorate: address.governorate,
          city: address.city,
          street: address.street,
          notes: address.notes || null,
          is_default: address.is_default || false,
          created_at: address.created_at,
          updated_at: address.updated_at,
        }));

      setUserAddresses(validAddresses);

      // تحديد العنوان الافتراضي أو الأول
      const defaultAddress =
        validAddresses.find((addr) => addr.is_default) || validAddresses[0];
      setSelectedAddress(defaultAddress || null);
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch addresses:", err);
      toast({
        title: "خطأ في تحميل العناوين",
        description: "تعذر تحميل عناوين الشحن الخاصة بك",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user, fetchUserAddresses]);

  // تحديث كمية العنصر في السلة
  const updateQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      if (!user || newQuantity < 1) return;

      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", cartItemId);

        if (error) throw error;

        // تحديث الحالة المحلية
        setCartItems((prevItems) => {
          return prevItems.map((item) => {
            if (item.cartItemId === cartItemId) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          });
        });

        // إعادة حساب المجموع الكلي
        setTotalPrice((prev) => {
          const item = cartItems.find((i) => i.cartItemId === cartItemId);
          if (item) {
            return prev - item.price * item.quantity + item.price * newQuantity;
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to update quantity:", error);
        toast({
          title: "خطأ في التحديث",
          description: "حدث خطأ أثناء تحديث الكمية",
          variant: "destructive",
        });
      }
    },
    [user, cartItems, toast]
  );

  // حذف عنصر من السلة
  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", cartItemId);

        if (error) throw error;

        // تحديث الحالة المحلية
        setCartItems((prevItems) => {
          const itemToRemove = prevItems.find(
            (item) => item.cartItemId === cartItemId
          );
          if (itemToRemove) {
            setTotalPrice(
              (prev) => prev - itemToRemove.price * itemToRemove.quantity
            );
          }
          return prevItems.filter((item) => item.cartItemId !== cartItemId);
        });

        toast({
          title: "تم الحذف",
          description: "تمت إزالة المنتج من السلة",
        });
      } catch (error) {
        console.error("Failed to remove item:", error);
        toast({
          title: "خطأ في الحذف",
          description: "حدث خطأ أثناء إزالة المنتج من السلة",
          variant: "destructive",
        });
      }
    },
    [user, toast]
  );

  // إفراغ السلة بالكامل
  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setCartItems([]);
      setTotalPrice(0);

      toast({
        title: "تم إفراغ السلة",
        description: "تمت إزالة جميع العناصر من سلة التسوق",
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast({
        title: "خطأ في إفراغ السلة",
        description: "حدث خطأ أثناء محاولة إفراغ السلة",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // إضافة عنوان جديد
  const addNewAddress = useCallback(async () => {
    if (!user) return;

    setIsAddingAddress(true);
    try {
      // التحقق من البيانات
      if (!newAddress.governorate || !newAddress.city || !newAddress.street) {
        throw new Error("الرجاء ملء جميع الحقول المطلوبة");
      }

      const { data, error } = await supabase
        .from("user_addresses")
        .insert({
          governorate: newAddress.governorate,
          city: newAddress.city,
          street: newAddress.street,
          notes: newAddress.notes || null,
          is_default: newAddress.is_default || false,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // التحقق من صحة البيانات
      if (
        !data ||
        !data.id ||
        !data.user_id ||
        !data.governorate ||
        !data.city ||
        !data.street
      ) {
        throw new Error("استجابة غير صالحة من الخادم");
      }

      const newAddressData: UserAddress = {
        id: data.id,
        user_id: data.user_id,
        governorate: data.governorate,
        city: data.city,
        street: data.street,
        notes: data.notes || null,
        is_default: data.is_default || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setUserAddresses((prev) => [...prev, newAddressData]);
      setSelectedAddress(newAddressData);
      setShowAddressForm(false);
      setNewAddress({
        governorate: "",
        city: "",
        street: "",
        notes: "",
        is_default: false,
      });

      toast({
        title: "تمت إضافة العنوان",
        description: "تم إضافة عنوان الشحن الجديد بنجاح",
      });
    } catch (error) {
      const err = error as Error;
      console.error("Failed to add address:", err);
      toast({
        title: "خطأ في إضافة العنوان",
        description: err.message || "حدث خطأ أثناء إضافة العنوان",
        variant: "destructive",
      });
    } finally {
      setIsAddingAddress(false);
    }
  }, [user, newAddress, toast]);

  // حذف عنوان
  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!user) return;

      setIsDeletingAddress(true);
      setAddressToDelete(addressId);
      try {
        const { error } = await supabase
          .from("user_addresses")
          .delete()
          .eq("id", addressId);

        if (error) throw error;

        // تحديث الحالة المحلية
        setUserAddresses((prev) =>
          prev.filter((address) => address.id !== addressId)
        );

        // إذا كان العنوان المحذوف هو المحدد، نحدد عنوانًا آخر
        if (selectedAddress?.id === addressId) {
          const newSelected =
            userAddresses.find((addr) => addr.id !== addressId) || null;
          setSelectedAddress(newSelected);
        }

        toast({
          title: "تم حذف العنوان",
          description: "تم حذف عنوان الشحن بنجاح",
        });
      } catch (error) {
        console.error("Failed to delete address:", error);
        toast({
          title: "خطأ في حذف العنوان",
          description: "حدث خطأ أثناء حذف العنوان",
          variant: "destructive",
        });
      } finally {
        setIsDeletingAddress(false);
        setAddressToDelete(null);
      }
    },
    [user, selectedAddress, userAddresses, toast]
  );

  // تأكيد الطلب
  const checkout = useCallback(async () => {
    if (cartItems.length === 0 || !user) return;

    if (!selectedAddress) {
      toast({
        title: "عنوان الشحن مطلوب",
        description: "يرجى اختيار أو إضافة عنوان شحن لإتمام الطلب",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: "pending",
          payment_status: "pending",
          shipping_address: {
            governorate: selectedAddress.governorate,
            city: selectedAddress.city,
            street: selectedAddress.street,
            notes: selectedAddress.notes,
          },
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order || !order.id) throw new Error("فشل في إنشاء الطلب");

      // إضافة عناصر الطلب
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // حذف جميع عناصر السلة من قاعدة البيانات
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      // تحديث الحالة المحلية
      setCartItems([]);
      setTotalPrice(0);

      toast({
        title: "تم تأكيد الطلب",
        description: "سيتم التواصل معك قريباً لتأكيد التفاصيل",
      });

      // إعادة توجيه إلى صفحة الطلب
      window.location.href = `/orders/${order.id}`;
    } catch (error) {
      const err = error as Error;
      console.error("Checkout error:", err);
      toast({
        title: "خطأ في تأكيد الطلب",
        description: err.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, user, totalPrice, selectedAddress, toast]);

  // مكون عنصر السلة
  const CartItemComponent = React.memo(
    ({
      item,
      updateQuantity,
      removeFromCart,
    }: {
      item: CartItem;
      updateQuantity: (id: string, quantity: number) => Promise<void>;
      removeFromCart: (id: string) => Promise<void>;
    }) => {
      const [isUpdating, setIsUpdating] = useState(false);
      const [isRemoving, setIsRemoving] = useState(false);

      const handleUpdate = async (newQuantity: number) => {
        setIsUpdating(true);
        try {
          await updateQuantity(item.cartItemId, newQuantity);
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          setIsUpdating(false);
        }
      };

      const handleRemove = async () => {
        setIsRemoving(true);
        try {
          await removeFromCart(item.cartItemId);
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          setIsRemoving(false);
        }
      };

      return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 space-x-reverse w-full sm:w-auto">
            <img
              src={item.image_url || "/placeholder-image.png"}
              alt={item.name_ar || ""}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/placeholder-image.png")}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-amber-900 truncate">
                {item.name_ar}
              </h3>
              {item.description_ar && (
                <p className="text-amber-700 text-sm line-clamp-2">
                  {item.description_ar}
                </p>
              )}
              <p className="text-amber-900 font-bold mt-1">
                {formatCurrency(item.price || 0)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2 space-x-reverse bg-amber-50 rounded-lg px-2">
              <button
                onClick={() => handleUpdate(Math.max(1, item.quantity - 1))}
                className="p-1 sm:p-2 hover:bg-amber-100 rounded-lg disabled:opacity-50"
                disabled={item.quantity <= 1 || isUpdating}
                aria-label="تقليل الكمية"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Minus size={16} />
                )}
              </button>
              <span className="px-2 sm:px-3 py-1 min-w-[30px] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdate(item.quantity + 1)}
                className="p-1 sm:p-2 hover:bg-amber-100 rounded-lg disabled:opacity-50"
                disabled={isUpdating}
                aria-label="زيادة الكمية"
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </div>

            <button
              onClick={handleRemove}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-4 disabled:opacity-50"
              disabled={isRemoving}
              aria-label="إزالة من السلة"
            >
              {isRemoving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          </div>
        </div>
      );
    }
  );

  // حالات التحميل
  if (checkingSession || cartLoading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
      >
        <Helmet>
          <title>جاري التحميل - سلة التسوق</title>
          <meta
            name="description"
            content="جاري تحميل محتويات سلة التسوق الخاصة بك"
          />
        </Helmet>
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <Loader2
            className="mx-auto mb-4 text-amber-700 animate-spin"
            size={48}
          />
          <p className="text-xl text-amber-700">جاري تحميل سلة المشتريات...</p>
        </div>
      </div>
    );
  }

  // حالة عدم تسجيل الدخول
  if (!user) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
      >
        <Helmet>
          <title>تسجيل الدخول مطلوب - سلة التسوق</title>
          <meta
            name="description"
            content="سجل الدخول لإدارة سلة التسوق الخاصة بك"
          />
        </Helmet>
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <ShoppingCart className="mx-auto mb-4 text-amber-700" size={64} />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            يجب تسجيل الدخول أولاً
          </h2>
          <p className="text-gray-600 mb-6">
            سجل الدخول لإدارة سلة المشتريات الخاصة بك
          </p>
          <a
            href="/auth"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            aria-label="تسجيل الدخول"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50"
    >
      <Helmet>
        <title>سلة التسوق - قهوة دمنهور</title>
        <meta
          name="description"
          content="إدارة مشترياتك وتأكيد طلباتك من متجر قهوة دمنهور"
        />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <ShoppingCart className="mx-auto mb-4 text-amber-700" size={48} />
          <h1 className="text-3xl font-bold text-amber-900">سلة التسوق</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-xl text-gray-600 mb-4">سلة التسوق فارغة</p>
            <a
              href="/"
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
              aria-label="تصفح المنتجات"
            >
              تصفح المنتجات
            </a>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowClearCartDialog(true)}
                className="text-red-600 hover:text-red-800 flex items-center"
                aria-label="إفراغ السلة"
              >
                <Trash2 size={20} className="mr-1" />
                إفراغ السلة
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <CartItemComponent
                  key={item.cartItemId}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                <MapPin className="mr-2" size={24} />
                عنوان الشحن
              </h2>

              {/* قائمة العناوين */}
              {isLoadingAddresses ? (
                <div className="text-center py-6">
                  <Loader2
                    className="mx-auto animate-spin text-amber-700"
                    size={32}
                  />
                  <p className="mt-2">جاري تحميل العناوين...</p>
                </div>
              ) : (
                <>
                  {userAddresses.length > 0 ? (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {userAddresses.map((address) => (
                          <div
                            key={address.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors relative
                              ${
                                selectedAddress?.id === address.id
                                  ? "border-amber-600 bg-amber-50"
                                  : "border-gray-200 hover:border-amber-400"
                              }`}
                            onClick={() => setSelectedAddress(address)}
                          >
                            {/* زر حذف العنوان */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddressToDelete(address.id);
                              }}
                              className="absolute top-2 left-2 p-1 text-red-500 hover:text-red-700"
                              aria-label="حذف العنوان"
                              disabled={
                                isDeletingAddress &&
                                addressToDelete === address.id
                              }
                            >
                              {isDeletingAddress &&
                              addressToDelete === address.id ? (
                                <Loader2 className="animate-spin" size={20} />
                              ) : (
                                <X size={20} />
                              )}
                            </button>

                            <div className="font-medium">
                              {address.governorate} - {address.city}
                            </div>
                            <div className="text-gray-600 mt-1">
                              {address.street}
                            </div>
                            {address.notes && (
                              <div className="text-sm text-gray-500 mt-1">
                                ملاحظات: {address.notes}
                              </div>
                            )}
                            {address.is_default && (
                              <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                                العنوان الافتراضي
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4">لا توجد عناوين مسجلة</p>
                  )}

                  {/* زر إضافة عنوان جديد */}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-amber-700 hover:text-amber-900 font-medium mb-6"
                  >
                    + إضافة عنوان جديد
                  </button>

                  {/* نموذج إضافة عنوان جديد */}
                  {showAddressForm && (
                    <div className="bg-amber-50 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-amber-900 mb-3">
                        إضافة عنوان جديد
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            المحافظة
                          </label>
                          <input
                            type="text"
                            value={newAddress.governorate || ""}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                governorate: e.target.value,
                              })
                            }
                            placeholder="أدخل المحافظة"
                            className="w-full p-2 border border-amber-300 rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            المدينة
                          </label>
                          <input
                            type="text"
                            value={newAddress.city || ""}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            placeholder="أدخل المدينة"
                            className="w-full p-2 border border-amber-300 rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            العنوان التفصيلي
                          </label>
                          <input
                            type="text"
                            value={newAddress.street || ""}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                street: e.target.value,
                              })
                            }
                            placeholder="أدخل العنوان التفصيلي"
                            className="w-full p-2 border border-amber-300 rounded-lg"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          ملاحظات (اختياري)
                        </label>
                        <textarea
                          value={newAddress.notes || ""}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              notes: e.target.value,
                            })
                          }
                          placeholder="ملاحظات إضافية للعنوان"
                          className="w-full p-2 border border-amber-300 rounded-lg"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="defaultAddress"
                          checked={newAddress.is_default || false}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              is_default: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <label
                          htmlFor="defaultAddress"
                          className="text-sm text-gray-700"
                        >
                          تعيين كعنوان افتراضي
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setNewAddress({
                              governorate: "",
                              city: "",
                              street: "",
                              notes: "",
                              is_default: false,
                            });
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={addNewAddress}
                          disabled={isAddingAddress}
                          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                        >
                          {isAddingAddress ? (
                            <>
                              <Loader2
                                className="animate-spin inline mr-2"
                                size={16}
                              />
                              جاري الإضافة...
                            </>
                          ) : (
                            "حفظ العنوان"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-amber-900">
                  المجموع الكلي:
                </span>
                <span className="text-2xl font-bold text-amber-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={checkout}
                  disabled={isCheckingOut || !selectedAddress}
                  className={`flex-1 py-3 rounded-lg font-bold transition-colors flex items-center justify-center ${
                    isCheckingOut || !selectedAddress
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  aria-label="تأكيد الطلب"
                >
                  {isCheckingOut && (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  )}
                  {isCheckingOut ? "جاري معالجة الطلب..." : "تأكيد الطلب"}
                </button>
                <a
                  href="/"
                  className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-bold text-center"
                  aria-label="متابعة التسوق"
                >
                  متابعة التسوق
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={showClearCartDialog}
        onCancel={() => setShowClearCartDialog(false)}
        onConfirm={async () => {
          try {
            await clearCart();
            setShowClearCartDialog(false);
          } catch (error) {
            console.error("Failed to clear cart:", error);
          }
        }}
        title="إفراغ سلة التسوق"
        message="هل أنت متأكد من رغبتك في إفراغ سلة التسوق بالكامل؟"
        confirmText="نعم، إفراغ السلة"
        cancelText="إلغاء"
      />

      {/* حوار تأكيد حذف العنوان */}
      <ConfirmationDialog
        open={!!addressToDelete}
        onCancel={() => setAddressToDelete(null)}
        onConfirm={() => deleteAddress(addressToDelete!)}
        title="حذف عنوان الشحن"
        message="هل أنت متأكد من رغبتك في حذف هذا العنوان؟"
        confirmText="نعم، احذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default React.memo(Cart);
