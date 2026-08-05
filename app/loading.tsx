import { Skeleton } from "@/components/ui/skeleton";

/** Route-transition fallback. Under this app's static export, client-side
 *  navigations are near-instant (no data fetching — content is inlined at
 *  build time), so this mostly acts as a safety net on slow devices rather
 *  than a primary UX driver. */
export default function Loading() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    </section>
  );
}
