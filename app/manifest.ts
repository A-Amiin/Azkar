import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "أذكار",
    description: "تطبيق عربي لقراءة ومتابعة أذكار الصباح والمساء، يعمل بدون إنترنت",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    background_color: siteConfig.backgroundColorLight,
    theme_color: siteConfig.themeColorLight,
    icons: [
      { src: "/icon/icon-32", sizes: "32x32", type: "image/png", purpose: "any" },
      { src: "/icon/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon/icon-512-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
