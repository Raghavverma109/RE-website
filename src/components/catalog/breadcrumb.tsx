import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  to?: "/catalog" | "/catalog/$category";
  params?: Record<string, string>;
};

/** `Catalog › EV › BESTIVA` — the last crumb (current page) is never a link. */
export function CatalogBreadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-charcoal">
      {trail.map((crumb, i) => (
        <span key={crumb.label} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-charcoal/40" />}
          {crumb.to ? (
            <Link
              to={crumb.to}
              params={crumb.params}
              className="transition-colors hover:text-brand"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
