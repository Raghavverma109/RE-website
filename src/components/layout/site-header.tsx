import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { image } from "@/lib/media";

const navLinks: { id: string; label: string; to?: "/catalog" | "/about" | "/gallery" }[] = [
  { id: "about", label: "About", to: "/about" },
  { id: "ev", label: "EV" },
  { id: "robotics", label: "Robotics" },
  { id: "ems", label: "Electronics" },
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
        alt="RANAYARA Engineering"
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
      />
      <div className="min-w-0">
        <div
          className={`font-display text-base font-bold leading-none ${scrolled ? "text-ink" : "text-white"}`}
        >
          RANAYARA
        </div>
        <div
          className={`text-[10px] font-medium uppercase tracking-[0.2em] ${scrolled ? "text-charcoal" : "text-white/70"}`}
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
  const location = useLocation();
  const navigate = useNavigate();
  const logoSrc = image("site/ra-logo.webp");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {navLinks.map((l) =>
            l.to ? (
              <Link
                key={l.id}
                to={l.to}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? "text-charcoal hover:text-brand" : "text-white/90 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ) : (
              <button
                key={l.id}
                onClick={() => goToSection(l.id)}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? "text-charcoal hover:text-brand" : "text-white/90 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ),
          )}
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
            {navLinks.map((l) =>
              l.to ? (
                <Link
                  key={l.id}
                  to={l.to}
                  onClick={() => setNavOpen(false)}
                  className="border-b border-black/5 py-3 text-left text-sm font-medium text-charcoal"
                >
                  {l.label}
                </Link>
              ) : (
                <button
                  key={l.id}
                  onClick={() => goToSection(l.id)}
                  className="border-b border-black/5 py-3 text-left text-sm font-medium text-charcoal"
                >
                  {l.label}
                </button>
              ),
            )}
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
