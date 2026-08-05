import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

// Required under output: "export".
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "monthly", priority: 1 },
    { path: "/morning/", changeFrequency: "yearly", priority: 0.9 },
    { path: "/evening/", changeFrequency: "yearly", priority: 0.9 },
    { path: "/favorites/", changeFrequency: "monthly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency,
    priority,
  }));
}
