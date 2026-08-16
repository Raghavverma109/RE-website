import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { image } from "@/lib/media";
import { SITE } from "@/lib/site";

const navLinks: { id: string; label: string; to?: "/catalog" | "/about" | "/gallery" }[] = [
  { id: "about", label: "About", to: "/about" },
  { id: "ev", label: "Models" },
  { id: "charging", label: "Charging" },
  { id: "catalog", label: "Catalog", to: "/catalog" },
  // Its own page now, not the homepage anchor — the homepage only teases it.
  { id: "gallery", label: "Gallery", to: "/gallery" },
  { id: "contact", label: "Contact" },
];

function LogoMark({ logoSrc, scrolled }: { logoSrc: string; scrolled: boolean }) {
  return (
    <>
      <img
        src={logoSrc}
        alt={SITE.name}
        width={56}
        height={56}
        className="h-14 w-14 object-contain"
      />
      <div className="min-w-0">
        <div
          className={`font-display text-xl font-bold leading-none ${scrolled ? "text-ink" : "text-white"}`}
        >
          {SITE.brand}
        </div>
        <div
          className={`text-xs font-medium uppercase tracking-[0.2em] ${scrolled ? "text-charcoal" : "text-white/70"}`}
        >
          Engineering
        </div>
      </div>
    </>
  );
}

/**
 * Site-wide header — used on the homepage and every catalog page.
 *
 * Nav items other than "Catalog" are same-page anchors that only exist on the
 * homepage ("/"). When already there, clicking one smooth-scrolls to it, same
 * as before; from any other page it navigates home first and jumps to the
 * anchor once there, since e.g. #ev doesn't exist on a catalog page.
 */
export function SiteHeader() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const logoSrc = image("site/ra-logo.webp");

  // Same-page anchor links (Models, Charging, Contact) only exist on the
  // homepage, so there's no route to compare against — track which of their
  // sections is currently in view instead, the same way a scroll-spy nav does.
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveAnchor(null);
      return;
    }

    const anchorIds = navLinks.filter((l) => !l.to).map((l) => l.id);
    const sections = anchorIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveAnchor(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [location.pathname]);

  const isLinkActive = (l: (typeof navLinks)[number]) =>
    l.to ? location.pathname === l.to : location.pathname === "/" && activeAnchor === l.id;

  // Most pages just go solid after a small scroll. A page can opt into staying
  // transparent for longer — e.g. over a dark hero followed by a dark section —
  // by rendering a zero-height `#header-transparent-until` marker at the point
  // where the header should switch, instead of only sizing that hero to 30px.
  useEffect(() => {
    const zone = document.getElementById("header-transparent-until");

    const onScroll = () => {
      if (zone) {
        const headerHeight = headerRef.current?.offsetHeight ?? 80;
        setScrolled(zone.getBoundingClientRect().bottom <= headerHeight);
      } else {
        setScrolled(window.scrollY > 30);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location.pathname]);

  const goToSection = (id: string) => {
    setNavOpen(false);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate({ to: "/", hash: id, hashScrollIntoView: { behavior: "smooth", block: "start" } });
    }
  };

  const isHome = location.pathname === "/";

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 shadow-sm backdrop-blur-md"
          : "border-b border-white/10 bg-white/5 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8">
        {isHome ? (
          <a href="#top" className="flex items-center gap-3">
            <LogoMark logoSrc={logoSrc} scrolled={scrolled} />
          </a>
        ) : (
          <Link to="/" hash="top" className="flex items-center gap-3">
            <LogoMark logoSrc={logoSrc} scrolled={scrolled} />
          </Link>
        )}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => {
            const active = isLinkActive(l);
            const linkClassName = `relative pb-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-current after:transition-transform after:duration-300 ${
              scrolled ? "text-charcoal hover:text-brand" : "text-white/90 hover:text-white"
            } ${active ? (scrolled ? "text-brand after:scale-x-100" : "text-white after:scale-x-100") : ""}`;

            return l.to ? (
              <Link key={l.id} to={l.to} aria-current={active ? "page" : undefined} className={linkClassName}>
                {l.label}
              </Link>
            ) : (
              <button
                key={l.id}
                onClick={() => goToSection(l.id)}
                aria-current={active ? "page" : undefined}
                className={linkClassName}
              >
                {l.label}
              </button>
            );
          })}
          <button
            onClick={() => goToSection("contact")}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-accent"
          >
            Enquire <ArrowRight className="h-4 w-4" />
          </button>
        </nav>
        <button
          className={scrolled ? "text-ink md:hidden" : "text-white md:hidden"}
          onClick={() => setNavOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {navOpen && (
        <div className="border-t border-black/5 bg-white md:hidden">
          <div className="flex flex-col px-5 py-4">
            {navLinks.map((l) => {
              const active = isLinkActive(l);
              const linkClassName = `border-b border-black/5 py-3 pl-3 -ml-3 text-left text-sm font-medium transition-colors ${
                active
                  ? "border-l-2 border-l-brand bg-brand/5 font-semibold text-brand"
                  : "border-l-2 border-l-transparent text-charcoal"
              }`;

              return l.to ? (
                <Link
                  key={l.id}
                  to={l.to}
                  onClick={() => setNavOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={linkClassName}
                >
                  {l.label}
                </Link>
              ) : (
                <button
                  key={l.id}
                  onClick={() => goToSection(l.id)}
                  aria-current={active ? "page" : undefined}
                  className={linkClassName}
                >
                  {l.label}
                </button>
              );
            })}
            <button
              onClick={() => goToSection("contact")}
              className="mt-4 rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Enquire Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
