import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Tajawal } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { FontPreferenceSync } from "@/components/layout/font-preference-sync";
import { ThemePreferenceSync } from "@/components/layout/theme-preference-sync";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";
import { OneSignalInit } from "@/components/providers/onesignal-init";
import { SplashScreen } from "@/components/layout/splash-screen";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/metadata";

// Tajawal is an Arabic-first typeface — Inter (the previous font) has no
// Arabic glyphs, so Arabic text was silently falling back to the OS default.
// Only the weights actually used in the UI are loaded.
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "تطبيق عربي بسيط لقراءة ومتابعة أذكار الصباح والمساء مع عداد تكرار وحفظ للمفضلة، يعمل بدون إنترنت",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColorLight },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColorDark },
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: "ar",
    },
    {
      "@type": "WebApplication",
      name: siteConfig.name,
      url: siteConfig.url,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      inLanguage: "ar",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="light"
      className={cn("font-sans", tajawal.variable)}
    >
      <body className="flex min-h-dvh flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          تخطَّ إلى المحتوى
        </a>

        <TooltipProvider>
          <SplashScreen />
          <AppHeader />
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <AppFooter />
        </TooltipProvider>

        <Toaster
          position="top-center"
          swipeDirections={["top", "left", "right"]}
        />
        <FontPreferenceSync />
        <ThemePreferenceSync />
        <ServiceWorkerRegistration />
        <OneSignalInit />
      </body>
    </html>
  );
}
