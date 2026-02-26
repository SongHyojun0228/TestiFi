import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** tailwind 클래스 병합 유틸 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
