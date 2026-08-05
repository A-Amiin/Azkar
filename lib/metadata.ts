import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const siteConfig = {
  name: SITE_NAME,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://azkar.example.com",
  locale: "ar_AR",
  // Browser-chrome tint (<meta name="theme-color">, manifest theme_color) —
  // matches --primary in each mode.
  themeColorLight: "#2D6A4F", // --dark-emerald
  themeColorDark: "#52B788", // --mint-leaf
  // Manifest background_color — must match the app's actual --background
  // in each mode so there's no flash between the native splash and first
  // paint.
  backgroundColorLight: "#D8F3DC", // --frosted-mint
  backgroundColorDark: "#081C15", // --evergreen
} as const;

interface BuildMetadataOptions {
  title: string;
  description: string;
  /** Path relative to `siteConfig.url`, e.g. "/morning". */
  path: string;
}

/** Merges a route's title/description/canonical path with the app-wide
 *  Open Graph and Twitter defaults, so every route stays visually and
 *  structurally consistent without repeating boilerplate. */
export function buildMetadata({
  title,
  description,
  path,
}: BuildMetadataOptions): Metadata {
  const url = new URL(path, siteConfig.url).toString();

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
