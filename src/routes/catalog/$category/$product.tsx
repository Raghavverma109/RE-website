import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowRight, CircuitBoard } from "lucide-react";
import { getProduct, getRelatedProducts } from "@/content";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogBreadcrumb } from "@/components/catalog/breadcrumb";
import { Img } from "@/components/media/img";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { image } from "@/lib/media";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export const Route = createFileRoute("/catalog/$category/$product")({
  loader: ({ params }) => {
    const found = getProduct(params.category, params.product);
    if (!found) throw notFound();
    return {
      category: found.category,
      product: found.product,
      related: getRelatedProducts(params.category, params.product),
    };
  },
  head: ({ loaderData }) => {
    const { category, product } = loaderData ?? {};
    if (!category || !product) return {};
    const description =
      product.desc ??
      product.specs?.join(", ") ??
      `${product.name} — ${category.name} by RANAYARA Engineering.`;
    const canonicalUrl = `https://ranayar.com/catalog/${category.slug}/${product.slug}`;
    const primaryImage = product.media[0] ? image(product.media[0].key) : undefined;

    return {
      meta: [
        { title: `${product.name} — RANAYARA ${category.name}` },
        { name: "description", content: description },
        { property: "og:title", content: product.name },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(primaryImage ? [{ property: "og:image", content: primaryImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description,
            category: category.name,
            ...(primaryImage ? { image: primaryImage } : {}),
          }),
        },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { category, product, related } = Route.useLoaderData();
  useSmoothScroll();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = product.media[activeImageIndex] ?? product.media[0];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <div className="reveal">
          <CatalogBreadcrumb
            trail={[
              { label: "Catalog", to: "/catalog" },
              {
                label: category.name,
                to: "/catalog/$category",
                params: { category: category.slug },
              },
              { label: product.name },
            ]}
          />
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="reveal">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-secondary">
              {activeImage ? (
                <Img
                  key={activeImage.key}
                  media={activeImage}
                  priority
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <CircuitBoard className="h-16 w-16 text-brand/30" />
                </div>
              )}
            </div>
            {product.media.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {product.media.map((m, i) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`Show photo ${i + 1} of ${product.media.length}`}
                    aria-current={i === activeImageIndex}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition-all ${
                      i === activeImageIndex
                        ? "ring-brand"
                        : "ring-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Img media={m} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="reveal">
            {product.tag && (
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
                {product.tag}
              </div>
            )}
            <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>
            {product.desc && <p className="mt-6 text-lg text-charcoal">{product.desc}</p>}
            {product.specs && product.specs.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 gap-3">
                {product.specs.map((s) => (
                  <li
                    key={s}
                    className="rounded-xl border border-black/5 bg-secondary px-4 py-3 text-sm text-charcoal"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/"
              hash="contact"
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-accent"
            >
              Request specs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="reveal font-display text-2xl font-bold text-ink">
              More from {category.name}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <div key={p.slug} className="reveal">
                  <CatalogCard categorySlug={category.slug} product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
