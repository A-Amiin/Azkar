import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Tajawal } from "next/font/google";
import { cn } from "@/lib/utils";

// Tajawal is an Arabic-first typeface — Inter (the previous font) has no
// Arabic glyphs, so Arabic text was silently falling back to the OS default.
// Only the weights actually used in the UI are loaded.
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "أذكار الصباح والمساء",
  description: "تطبيق لقراءة ومتابعة أذكار الصباح والمساء",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", tajawal.variable)}>
      <body>{children}</body>
    </html>
  );
}
