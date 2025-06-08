import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface SecuritySettingsProps {
  onUpdatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  onEnableTwoFactor?: () => Promise<void>;
  twoFactorEnabled?: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onUpdatePassword,
  onEnableTwoFactor,
  twoFactorEnabled,
}) => {
  const { toast } = useToast();
  const [isEnabling2FA, setIsEnabling2FA] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await onUpdatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({
        title: "تم التحديث",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
    }
  };

  const handleEnable2FA = async () => {
    if (!onEnableTwoFactor) return;
    setIsEnabling2FA(true);
    try {
      await onEnableTwoFactor();
      toast({
        title: "تم التفعيل",
        description: "تم تفعيل المصادقة الثنائية بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تفعيل المصادقة الثنائية",
        variant: "destructive",
      });
    } finally {
      setIsEnabling2FA(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              error={errors.currentPassword?.message}
            />
          </div>

          <div>
            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              error={errors.newPassword?.message}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            "تغيير كلمة المرور"
          )}
        </Button>
      </form>

      {onEnableTwoFactor && (
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">المصادقة الثنائية</h3>
          <p className="text-sm text-gray-600 mb-4">
            المصادقة الثنائية تضيف طبقة حماية إضافية لحسابك
          </p>
          <Button
            variant={twoFactorEnabled ? "outline" : "default"}
            onClick={handleEnable2FA}
            disabled={isEnabling2FA || twoFactorEnabled}
          >
            {isEnabling2FA ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التفعيل...
              </>
            ) : twoFactorEnabled ? (
              "المصادقة الثنائية مفعلة"
            ) : (
              "تفعيل المصادقة الثنائية"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}; 