import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { OfflineIndicator } from "@/components/shared/offline-indicator";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BrandMark size={28} />
          <span className="text-sm sm:text-base">{SITE_NAME}</span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <OfflineIndicator />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
