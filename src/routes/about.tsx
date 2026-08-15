import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Building2,
  Handshake,
  Leaf,
  Lightbulb,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StatCounter } from "@/components/stat-counter";
import { CompanyCard } from "@/components/about/company-card";
import { ValueCard } from "@/components/about/value-card";
import { Timeline } from "@/components/about/timeline";
import { hasImage, image } from "@/lib/media";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const HERO_IMAGE_KEY = "products/ev/bestiva.webp";
const LOCATION_MAP_KEY = "site/location.webp";

/**
 * Fades the map into the page instead of ending it on a hard edge.
 *
 * Stacked mobile-first: the map sits above the copy, so it dissolves downward.
 * From `lg` the map moves beside the copy, so the fade rotates to the left edge
 * — the side facing the text — and the downward fade is switched off.
 *
 * Tune the percentages to move where the image starts becoming transparent;
 * tune the rgba alphas to change how opaque it is at that point.
 */
const MAP_FADE = [
  "[mask-image:linear-gradient(to_bottom,#000_0%,#000_60%,rgba(0,0,0,0.35)_85%,transparent_100%)]",
  "lg:[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.25)_16%,rgba(0,0,0,0.8)_40%,#000_58%)]",
].join(" ");

/**
 * Pulls the map out to the physical right edge of the viewport from `lg`.
 *
 * Two things sit between the grid cell and that edge: the container's own
 * `sm:px-8` gutter, and — once the window is wider than the 1320px container —
 * half the leftover space. The negative margin cancels both. The section's
 * `overflow-hidden` absorbs the scrollbar width that `100vw` includes on some
 * browsers, so this can never introduce a horizontal scrollbar.
 */
const MAP_BLEED_RIGHT = "lg:mr-[calc(-2rem_-_max(0px,(100vw_-_1320px)_/_2))]";

const location = {
  company: "Ranayara Engineering Industries Pvt. Ltd.",
  street: "561 Block M8, 3, Sector 8",
  area: "IMT Manesar, Gurugram",
  region: "Haryana 122503, India",
  email: "sales@ranayar.com",
  phone: "+91 00000 00000",
};

/** Google Maps deep link — opens directions to the Manesar facility. */
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${location.company}, ${location.street}, ${location.area}, ${location.region}`,
)}`;

const stats = [
  { target: 5, suffix: "+", label: "Years of Experience" },
  { target: 2000, suffix: "+", label: "Projects Delivered" },
  { target: 500, suffix: "+", label: "Happy Clients" },
  { target: 12, suffix: "", label: "Countries Served" },
];

const groupCompanies: { name: string; location?: string }[] = [
  { name: "Ranayara Engineering Industries Pvt Limited", location: "IMT Manesar" },
  { name: "Ranayara Engineering Industries Pvt Limited", location: "Noida" },
  { name: "Ranayara Engineering Industries Pvt Limited", location: "Pune" },
  { name: "Ranayara Engineering Industries Pvt Limited", location: "Pitampur, Indore" },
  { name: "Ranayara Infrastructure and Rama Construction Pvt Limited" },
  { name: "Ranayara Electrical Vehicle Motor Pvt Limited" },
  { name: "Ranayara Alkaline Mineral Water Pvt Limited" },
];

const coreValues = [
  {
    icon: ShieldCheck,
    title: "Quality First",
    desc: "Uncompromising commitment to quality in every product and service we deliver.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "Continuously evolving our solutions to meet tomorrow's challenges today.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    desc: "Building a greener future through eco-friendly products and practices.",
  },
  {
    icon: Handshake,
    title: "Integrity",
    desc: "Honest, transparent dealings that build lasting relationships.",
  },
];

const journey = [
  {
    year: "2022",
    title: "Foundation",
    desc: "Ranayara Engineering Industries established with focus on precision tooling.",
  },
  { year: "2023", title: "Expansion", desc: "Opened new facilities in Noida, Pune, and Pitampur." },
  {
    year: "2024",
    title: "Electrification",
    desc: "Launched the Ranayara Electric Vehicle Motor division and began in-house battery pack development.",
  },
  {
    year: "2025",
    title: "Lineup",
    desc: "Introduced the BESTIVA passenger E-Auto and expanded the charging and service network.",
  },
  {
    year: "2026",
    title: "Growth",
    desc: "Scaling EV production across facilities, with fleet partners live nationwide.",
  },
];

const certifications = ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949", "OHSAS 18001"];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Ranayara Group — Electric Vehicle Manufacturer" },
      {
        name: "description",
        content:
          "India's electric mobility manufacturer, engineering and building electric two-, three- and cargo vehicles in-house — from battery pack to charge port.",
      },
      { property: "og:title", content: "About Ranayara Group" },
      {
        property: "og:description",
        content: "India's electric mobility manufacturer — your trusted EV fleet partner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ranayar.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  useSmoothScroll();
  const heroHasImage = hasImage(HERO_IMAGE_KEY);
  const mapHasImage = hasImage(LOCATION_MAP_KEY);

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />

      {/* HERO */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink text-white">
        {heroHasImage ? (
          <img
            src={image(HERO_IMAGE_KEY)}
            alt=""
            width={1535}
            height={1024}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-brand/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-brand/60" />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 py-32 sm:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl">
              About Ranayara Group – Electric Vehicle Manufacturer
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/70">
              India's electric mobility manufacturer, with 5+ years engineering electric two-,
              three- and cargo vehicles from the ground up — battery, motor and body, all
              designed and built in-house.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8 md:grid-cols-4">
            {stats.map((s) => (
              <StatCounter
                key={s.label}
                target={s.target}
                suffix={s.suffix}
                label={s.label}
                className="text-center"
                valueClassName="text-white"
                labelClassName="text-white/80"
              />
            ))}
          </div>
        </div>
      </section>

      {/* GROUP COMPANIES */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <div className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
          Our Group
        </div>
        <h2 className="reveal font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Our Group Companies
        </h2>
        <p className="reveal mt-5 max-w-2xl text-lg text-charcoal">
          Ranayara Group comprises multiple specialized companies across India, each focused on
          delivering excellence in their respective domains.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groupCompanies.map((c, i) => (
            <div key={`${c.name}-${c.location ?? i}`} className="reveal">
              <CompanyCard name={c.name} location={c.location} />
            </div>
          ))}
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <div className="reveal rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Our Vision
            </div>
            <p className="text-lg leading-relaxed text-charcoal">
              To be India's preferred electric mobility partner, driving the shift to clean,
              affordable transport for personal, fleet and cargo use.
            </p>
          </div>
          <div className="reveal rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Our Mission
            </div>
            <p className="text-lg leading-relaxed text-charcoal">
              To engineer and build electric vehicles that earn their place on Indian roads —
              reliable range, low cost of ownership, and service that keeps fleets moving.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <h2 className="reveal font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Our Core Values
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((v) => (
            <div key={v.title} className="reveal">
              <ValueCard icon={v.icon} title={v.title} desc={v.desc} />
            </div>
          ))}
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="reveal mb-12 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Our Journey
          </h2>
          <Timeline items={journey} />
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="border-y border-black/5 bg-white py-14">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <h2 className="reveal mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-charcoal">
            Certifications & Standards
          </h2>
          <div className="reveal grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-4">
            {certifications.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-widest text-charcoal/50 transition-colors hover:text-brand"
              >
                <Award className="h-5 w-5" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="location" className="overflow-hidden bg-secondary">
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-4 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8 lg:py-0 lg:pb-20">
          {/* Copy sits directly on the section — no panel, so the faded edge of
              the map is what separates the two halves. */}
          <div className="reveal relative z-10 lg:order-1">
            <div className="my-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Find Us
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
              Head Office &amp; Manufacturing Facility
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-charcoal sm:text-lg">
              Our IMT Manesar campus brings design, tooling and manufacturing together under one
              roof, on the Delhi–Gurugram industrial corridor.
            </p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
              <LocationRow icon={MapPin} label="Address">
                <address className="not-italic leading-relaxed">
                  {location.company}
                  <br />
                  {location.street}
                  <br />
                  {location.area}
                  <br />
                  {location.region}
                </address>
              </LocationRow>
              <LocationRow icon={Building2} label="Facility">
                Office &amp; manufacturing plant
              </LocationRow>
              <LocationRow icon={Mail} label="Email">
                <a href={`mailto:${location.email}`} className="transition-colors hover:text-brand">
                  {location.email}
                </a>
              </LocationRow>
              <LocationRow icon={Phone} label="Phone">
                <a
                  href={`tel:${location.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-brand"
                >
                  {location.phone}
                </a>
              </LocationRow>
            </dl>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </a>
              <Link
                to="/"
                hash="contact"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                Send an enquiry
              </Link>
            </div>
          </div>

          {/* Below `lg` this is lifted out of the grid flow and fills the
              section as a watermark behind the copy. From `lg` it drops back
              into the second column, where the negative margin cancels the
              container gutter plus the space outside the 1320px container so
              the artwork ends flush against the screen, and `justify-end` keeps
              it pinned there once the height cap makes the square narrower than
              its column. */}
          <div
            className={`absolute inset-0 z-0 lg:relative lg:inset-auto lg:order-2 lg:flex lg:justify-end ${MAP_BLEED_RIGHT}`}
          >
            {mapHasImage ? (
              <img
                src={image(LOCATION_MAP_KEY)}
                alt="Map showing the Ranayara Engineering facility at IMT Manesar, Gurugram, Haryana"
                width={2048}
                height={2048}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover opacity-[0.09] lg:aspect-square lg:h-[clamp(420px,44vw,660px)] lg:w-auto lg:object-contain lg:opacity-100 ${MAP_FADE}`}
              />
            ) : (
              <div
                aria-hidden
                className={`h-full w-full bg-size-[100%_100%,44px_44px,44px_44px] bg-[radial-gradient(circle_at_60%_45%,rgba(47,128,237,0.22),transparent_58%),linear-gradient(to_right,rgba(26,26,26,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,26,26,0.05)_1px,transparent_1px)] opacity-25 lg:aspect-square lg:h-[clamp(420px,44vw,660px)] lg:w-auto lg:opacity-100 ${MAP_FADE}`}
              />
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/** One icon + label + value row inside the location panel's definition list. */
function LocationRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal/60">
          {label}
        </dt>
        <dd className="mt-1.5 text-sm text-ink">{children}</dd>
      </div>
    </div>
  );
}
