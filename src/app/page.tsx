import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Projects } from "@/sections/Projects";
import { Skills } from "@/sections/Skills";
import { Other } from "@/sections/Other";

export const metadata: Metadata = {
  title: "SB",
  description:
    "Découvrez le portfolio de Soukayna Betahi, ses projets, ses compétences et son parcours en intelligence artificielle.",
};

export default function HomePage() {
  return (
    <>
      <main className="pb-20 pt-16">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Other />
      </main>
      <Footer />
    </>
  );
}
