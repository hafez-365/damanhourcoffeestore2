import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NotificationSettingsProps {
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    orderUpdates: boolean;
    promotionalEmails: boolean;
  };
  onUpdate: (settings: NotificationSettingsProps['settings']) => Promise<void>;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleChange = (key: keyof typeof settings) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(localSettings);
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات الإشعارات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الإعدادات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications">إشعارات البريد الإلكتروني</Label>
          <Switch
            id="emailNotifications"
            checked={localSettings.emailNotifications}
            onCheckedChange={() => handleChange('emailNotifications')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="pushNotifications">إشعارات الموقع</Label>
          <Switch
            id="pushNotifications"
            checked={localSettings.pushNotifications}
            onCheckedChange={() => handleChange('pushNotifications')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="orderUpdates">تحديثات الطلبات</Label>
          <Switch
            id="orderUpdates"
            checked={localSettings.orderUpdates}
            onCheckedChange={() => handleChange('orderUpdates')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="promotionalEmails">رسائل ترويجية</Label>
          <Switch
            id="promotionalEmails"
            checked={localSettings.promotionalEmails}
            onCheckedChange={() => handleChange('promotionalEmails')}
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
          "حفظ التغييرات"
        )}
      </Button>
    </form>
  );
}; 