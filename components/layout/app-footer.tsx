import Link from "next/link";
import { RouteAwareFooter } from "@/components/layout/route-aware-footer";
import { Separator } from "@/components/ui/separator";
import { getEveningAzkar, getMorningAzkar } from "@/data/azkar";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";

export function AppFooter() {
  const morning = getMorningAzkar();
  const evening = getEveningAzkar();
  const year = new Date().getFullYear();

  const copyright = `© ${year} ${SITE_NAME}`;

  const fullFooter = (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <nav aria-label="روابط التذييل">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {NAV_ITEMS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-foreground hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Separator />

        <p>
          مصدر أذكار الصباح:{" "}
          <a
            href={morning.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            {morning.title}
          </a>
          {" · "}
          مصدر أذكار المساء:{" "}
          <a
            href={evening.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            {evening.title}
          </a>
        </p>

        <p>{copyright}</p>
      </div>
    </footer>
  );

  const copyrightFooter = (
    <footer className="border-t border-border bg-card">
      <p className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        {copyright}
      </p>
    </footer>
  );

  return (
    <RouteAwareFooter
      fullFooter={fullFooter}
      copyrightFooter={copyrightFooter}
    />
  );
}
