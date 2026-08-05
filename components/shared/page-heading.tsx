interface PageHeadingProps {
  title: string;
  description?: string;
}

/** The single <h1> for whichever route renders it — every route must have
 *  exactly one, and this is the only place that renders one. */
export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
