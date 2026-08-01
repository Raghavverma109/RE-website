import { image } from "@/lib/media";

/** Site-wide footer — used on the homepage and every catalog page. */
export function SiteFooter() {
  const logoSrc = image("site/ra-logo.webp");

  return (
    <footer className="bg-ink pb-10 pt-16 text-white/70">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="RANAYARA"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <div>
                <div className="font-display text-base font-bold text-white">RANAYARA</div>
                <div className="text-[10px] uppercase tracking-[0.2em]">Engineering</div>
              </div>
            </div>
            <p className="mt-5 text-sm">
              Electric mobility, robotics and electronics — engineered in-house.
            </p>
          </div>
          <FooterCol
            title="Products"
            items={["RAFANDER Motiva", "RAFANDER", "E-Cart Loader", "E-Lion", "BESTIVA"]}
          />
          <FooterCol
            title="Company"
            items={["About", "Capabilities", "Gallery", "Careers", "Contact"]}
          />
          <FooterCol
            title="Divisions"
            items={["Electric Vehicles", "Robotics & Automation", "Electronics / EMS"]}
          />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row">
          <div>© {new Date().getFullYear()} RANAYARA Engineering. All rights reserved.</div>
          <div>Made with precision in India.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white">
        {title}
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i} className="transition-colors hover:text-white">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
