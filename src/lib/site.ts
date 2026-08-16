/**
 * Single source of truth for company, contact and canonical-URL details used
 * across the site — page meta, the footer, the About page and the homepage
 * contact section all import from here instead of hardcoding their own copy.
 * Update a phone number, an email or the domain once, here, instead of
 * hunting through every route file that happens to print it.
 */

export const SITE = {
  /** Short brand mark — logo wordmark, nav, footer. */
  brand: "RANAYARA",
  /** Full display name used in page titles, meta tags and body copy. */
  name: "RANAYARA Engineering",
  /** Registered legal entity — About page address block, structured data. */
  legalName: "Ranayara Engineering Industries Pvt. Ltd.",
  tagline: "Electric mobility, engineered and built in-house.",
  /** Bare host, no protocol/path — combine with `canonicalUrl()` for a link. */
  domain: "ranayara.com",
} as const;

export const CONTACT = {
  emails: ["info@ranayara.com", "sales@ranayara.com"],
  /** The one address shown wherever there's only room for a single email. */
  primaryEmail: "sales@ranayara.com",
  phone: "+91 00000 00000",
} as const;

export const ADDRESS = {
  street: "561 Block M8, 3, Sector 8",
  area: "IMT Manesar, Gurugram",
  region: "Haryana 122503, India",
} as const;

/** Google Maps deep link — opens directions to the Manesar facility. */
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${SITE.legalName}, ${ADDRESS.street}, ${ADDRESS.area}, ${ADDRESS.region}`,
)}`;

/** Shown on the About page's "Certifications & Standards" strip. */
export const CERTIFICATIONS = ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949", "OHSAS 18001"];

/** Shown on the homepage's "Certifications & Partners" strip. */
export const PARTNERS = ["MakeInIndia", "ARAI", "ISO 9001", "BIS", "ICAT", "FAME II"];

/** Builds an absolute canonical URL, e.g. `canonicalUrl("/catalog")` -> "https://ranayara.com/catalog". */
export function canonicalUrl(path = ""): string {
  return `https://${SITE.domain}${path}`;
}
