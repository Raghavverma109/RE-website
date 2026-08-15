import { Link } from "@tanstack/react-router";
import { categories } from "@/content";

/**
 * "All | <category>" filter nav. Each pill is a real link to its own URL
 * (/catalog or /catalog/$category) — there is no separate client filter state
 * to keep in sync with what's shown.
 */
export function CategoryPills({ activeCategorySlug }: { activeCategorySlug?: string }) {
  const pillClass = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-brand text-white" : "bg-secondary text-charcoal hover:bg-brand/10"
    }`;

  return (
    <div className="flex flex-wrap gap-3">
      <Link to="/catalog" className={pillClass(activeCategorySlug === undefined)}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          to="/catalog/$category"
          params={{ category: c.slug }}
          className={pillClass(activeCategorySlug === c.slug)}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
