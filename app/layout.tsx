import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "أذكار الصباح والمساء",
  description: "تطبيق لقراءة ومتابعة أذكار الصباح والمساء",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", inter.variable)}>
      <body>{children}</body>
    </html>
  );
}
