import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ActivityCard } from "@/components/ActivityCard";
import { activities } from "rag_systeme/data/activities";

export const metadata: Metadata = {
  title: "Activités | Soukayna Betahi",
  description:
    "Hackathons, événements de club, formations et engagement associatif de Soukayna Betahi.",
};

export default function ActivitesPage() {
  const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <main className="pb-20 pt-28">
        <div className="section">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-(--muted) transition-colors hover:text-(--accent)"
          >
            <ArrowLeft size={16} />
            Retour au portfolio
          </Link>

          <h1 className="mb-4 text-3xl font-bold sm:text-5xl">
            Activités &{" "}
            <span className="text-gradient-shimmer">Certifications</span>
          </h1>
          <p className="mb-12 max-w-2xl text-base text-(--muted) sm:text-lg">
            Hackathons, événements de club, formations et engagement associatif.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((a) => (
              <ActivityCard key={a.id} a={a} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}