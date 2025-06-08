import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  // تنسيق المبلغ بدون كسور عشرية
  const formattedAmount = Math.round(amount).toLocaleString('ar-EG');
  return `${formattedAmount} ج.م`;
};
