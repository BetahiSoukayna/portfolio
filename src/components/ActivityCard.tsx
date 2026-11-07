import { Activity } from "rag_systeme/data/activities";
import { ImageCarousel } from "./ImageCarousel";

export function ActivityCard({ a }: { a: Activity }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
      {a.images && a.images.length > 0 && (
        <ImageCarousel images={a.images} alt={a.title} />
      )}

      <div className="space-y-2 p-4">
        <p className="text-xs text-black/50 dark:text-white/50">
          {a.date}{a.location ? ` · ${a.location}` : ""}
        </p>
        <h3 className="font-semibold">{a.title}</h3>
        {a.role && <p className="text-sm font-medium">{a.role}{a.organizer ? ` — ${a.organizer}` : ""}</p>}
        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">{a.description}</p>

        {a.instagram && (
          <a
            href={a.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Voir le post Instagram ↗
          </a>
        )}
      </div>
    </article>
  );
}