import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
  address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل").optional(),
  governorate: z.string().min(2, "المحافظة مطلوبة").optional(),
  city: z.string().min(2, "المدينة مطلوبة").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  user: {
    full_name: string;
    email: string;
    phone: string;
    address?: string;
    governorate?: string;
    city?: string;
  };
  onUpdate: (data: ProfileFormData) => Promise<void>;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      governorate: user.governorate || 'دمنهور',
      city: user.city || 'دمنهور',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await onUpdate(data);
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات الملف الشخصي بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المعلومات",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">الاسم</Label>
          <Input
            id="full_name"
            {...register("full_name")}
            error={errors.full_name?.message}
          />
        </div>

        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            disabled
          />
        </div>

        <div>
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            error={errors.phone?.message}
            placeholder="01xxxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="address">العنوان</Label>
          <Input
            id="address"
            {...register("address")}
            error={errors.address?.message}
            placeholder="العنوان بالتفصيل"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="governorate">المحافظة</Label>
            <Input
              id="governorate"
              {...register("governorate")}
              error={errors.governorate?.message}
            />
          </div>

          <div>
            <Label htmlFor="city">المدينة</Label>
            <Input
              id="city"
              {...register("city")}
              error={errors.city?.message}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          "حفظ التغييرات"
        )}
      </Button>
    </form>
  );
}; 