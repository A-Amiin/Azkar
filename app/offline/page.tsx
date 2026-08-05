import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { PageHeading } from "@/components/shared/page-heading";
import { NAV_ITEMS } from "@/lib/constants";

// This page is intentionally excluded from robots.ts / the sitemap — it's
// a service-worker offline fallback, not real content worth indexing.
export const metadata: Metadata = {
  title: "غير متصل بالإنترنت",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center">
      <WifiOff aria-hidden="true" className="size-12 text-muted-foreground" />
      <PageHeading
        title="لا يوجد اتصال بالإنترنت"
        description="هذه الصفحة لم تُحفَّظ بعد لتصفّحها بدون إنترنت. الصفحات التي زُرتها من قبل ما زالت متاحة:"
      />
      <ul className="flex flex-wrap justify-center gap-2">
        {NAV_ITEMS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex min-h-11 items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
