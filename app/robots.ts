import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

// Required under output: "export".
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/offline/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
