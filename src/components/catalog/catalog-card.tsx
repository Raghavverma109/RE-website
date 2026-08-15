import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { Img } from "@/components/media/img";
import type { Product } from "@/content";

/**
 * One product tile — used in the catalog grid and in "related products".
 *
 * Products without a photo render an icon tile instead of <Img>, matching the
 * icon-tile pattern already used by the homepage's capability cards — not a
 * new visual language for products that happen to lack media.
 */
export function CatalogCard({ categorySlug, product }: { categorySlug: string; product: Product }) {
  const media = product.media[0];

  return (
    <Link
      to="/catalog/$category/$product"
      params={{ category: categorySlug, product: product.slug }}
      className="speed-lines group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
        {media ? (
          <Img
            media={media}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <Zap className="h-10 w-10 text-brand/30" />
          </div>
        )}
      </div>
      <div className="p-5">
        {product.tag && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
            {product.tag}
          </div>
        )}
        <h3 className="font-display text-lg font-semibold text-ink">{product.name}</h3>
        {product.desc && <p className="mt-1 text-sm text-charcoal">{product.desc}</p>}
      </div>
    </Link>
  );
}
