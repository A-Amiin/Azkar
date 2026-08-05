import Link from "next/link";
import { Sunrise, Sunset, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/shared/page-heading";

const HOME_CARDS = [
  {
    href: "/morning",
    title: "أذكار الصباح",
    description: "ابدأ يومك بأذكار الصباح مع عداد تكرار ومتابعة للتقدم.",
    icon: Sunrise,
  },
  {
    href: "/evening",
    title: "أذكار المساء",
    description: "اختم يومك بأذكار المساء مع عداد تكرار ومتابعة للتقدم.",
    icon: Sunset,
  },
  {
    href: "/favorites",
    title: "المفضلة",
    description: "الأذكار التي أضفتها إلى المفضلة، في مكان واحد.",
    icon: Heart,
  },
] as const;

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-10 sm:py-12">
      <PageHeading
        title="أذكار الصباح والمساء"
        description="اقرأ، عُدَّ، واحفظ أذكارك اليومية — بدون إنترنت وبدون تعقيد."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {HOME_CARDS.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group focus-visible:outline-none">
            <Card className="h-full transition-colors group-hover:bg-accent group-focus-visible:ring-2 group-focus-visible:ring-ring">
              <CardHeader className="items-center text-center">
                <Icon aria-hidden="true" className="mb-2 size-8 text-primary" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
