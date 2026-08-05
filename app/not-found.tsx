import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { PageHeading } from "@/components/shared/page-heading";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center">
      <Compass aria-hidden="true" className="size-12 text-muted-foreground" />
      <PageHeading
        title="الصفحة غير موجودة"
        description="الرابط الذي وصلت إليه غير صحيح أو لم يعد متاحًا."
      />
      <Link href="/" className={buttonVariants()}>
        العودة إلى الرئيسية
      </Link>
    </section>
  );
}
