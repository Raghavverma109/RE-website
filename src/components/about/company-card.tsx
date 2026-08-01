import { Building2, MapPin } from "lucide-react";

/**
 * One group company entry. `location` is optional — three of the seven group
 * companies were given without one, and the card must not show an empty line.
 */
export function CompanyCard({ name, location }: { name: string; location?: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
        <Building2 className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-semibold leading-snug text-ink">{name}</h3>
      {location && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-charcoal">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {location}
        </div>
      )}
    </div>
  );
}
