export interface Activity {
  id: string;
  title: string;
  role?: string;
  organizer?: string;
  date: string;     
  location?: string;
  description: string;
  type: "hackathon" | "club_event" | "orientation" | "formation";
  instagram?: string;   
  images?: string[];       
}

export const activities: Activity[] = [
  {
    id: "miathon-3",
    title: "MIATHON 3ème Édition",
    organizer: "UMP & CDG Capital & Africa I",
    date: "2026-03",
    location: "Campus du Savoir, Oujda",
    description: "Hackathon de 72h : développement d'une plateforme de veille stratégique et géopolitique.",
    type: "hackathon",
    instagram: "", // https://www.instagram.com/p/XXXXXXXX/
    images: [
  "/images/events/miathon2.jpeg",
  "/images/events/miathon3.jpeg",
  "/images/events/miathon1.jpeg",
],
  },
  {
    id: "rise-her",
    title: "Rise Her",
    role: "Organisatrice / Membre actif",
    organizer: "Nurl AI Club",
    date: "2026-04",
    description: "Événement pour la Journée Internationale de la Femme, centré sur la place des femmes dans la tech.",
    type: "club_event",
    instagram: "",
    images: ["/images/events/orientation.png"],
  },
  {
    id: "forum-entreprises-eniad",
    title: "1ère Édition du Forum Entreprises ENIAD",
    role: "Équipe Communication",
    organizer: "ENIAD",
    date: "2025-10",
    description: "Gestion et animation de la communication autour du premier forum d'entreprises de l'ENIAD.",
    type: "club_event",
    instagram: "",
    images: [],
  },
  // Forum International de l'Étudiant, Journée d'Orientation (Berkane), etc.
];