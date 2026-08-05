import { Heart, House, Sunrise, Sunset, type LucideIcon } from "lucide-react";

export const SITE_NAME = "أذكار الصباح والمساء";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "الرئيسية", icon: House },
  { href: "/morning", label: "أذكار الصباح", icon: Sunrise },
  { href: "/evening", label: "أذكار المساء", icon: Sunset },
  { href: "/favorites", label: "المفضلة", icon: Heart },
];
