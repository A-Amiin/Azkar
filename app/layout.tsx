import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import NextScript from "next/script";
import "./globals.css";
import { Tajawal } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";
import { SplashScreen } from "@/components/layout/splash-screen";
import { InstallPwaPrompt } from "@/components/shared/install-pwa-prompt";
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
  description: "تطبيق عربي لقراءة ومتابعة أذكار الصباح والمساء",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColorLight },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColorDark },
  ],
};

// Applies .dark before first paint based on the OS preference, so there is
// no flash of the wrong theme. Runs via next/script's beforeInteractive
// strategy (fetched/executed before hydration, the framework-sanctioned
// place for exactly this kind of theme-flash-prevention script). No manual
// toggle exists yet, so this is the only place dark mode gets applied.
const themeInitScript = `
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
`;

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
    <html lang="ar" dir="rtl" className={cn("font-sans", tajawal.variable)}>
      <body>
        <NextScript id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </NextScript>
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
          <InstallPwaPrompt />
          <main id="main-content">{children}</main>
          <AppFooter />
        </TooltipProvider>

        <Toaster position="top-center" />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
