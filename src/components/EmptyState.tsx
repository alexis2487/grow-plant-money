import type { ReactNode } from "react";

export function EmptyState({
  emoji = "🌱",
  title,
  description,
  action,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
