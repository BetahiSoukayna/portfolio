// src/sections/Hero.tsx
"use client";

import { HeroChat } from "@/components/HeroChat";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Partie gauche - Texte */}
            <div className="space-y-6">
               <span className="inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-500 border border-purple-500/20">
              ETUDIANTE INGÉNIEUR EN INTELLIGENCE ARTIFICIELLE
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Bonjour, je suis <br />
              <span className="text-gradient-shimmer">
                Soukayna Betahi
              </span>
            </h1>
            
            <p className="text-lg text-(--muted) max-w-xl leading-relaxed">
              Étudiante Ingénieur en IA à l&apos;ENIAD, passionnée par la création 
              de solutions innovantes en Machine Learning, Deep Learning et 
              développement d&apos;applications intelligentes.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="rounded-lg px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--gradient-end) 100%)'
                }}
              >
                Voir mes projets
              </a>
              <a
                href="#contact"
                className="rounded-lg border border-(--card-border) px-6 py-3 font-medium transition-all hover:border-blue-500 hover:text-blue-500"
              >
                Me contacter
              </a>
            </div>
            
            {/* Badge Disponibilité */}
            <div className="rounded-lg bg-green-500/10 px-4 py-2 border border-green-500/20 inline-block">
              <p className="text-sm font-medium text-green-500">DISPONIBLE POUR</p>
              <p className="text-sm text-(--muted)">Stage PFE </p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroChat />
          </div>
        </div>
      </div>
    </section>
  );
}