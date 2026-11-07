import { Github, Linkedin, Mail, type LucideIcon } from "lucide-react";

export interface Social {
  name: string;
  url: string;
  icon: LucideIcon;
}

export const socials: Social[] = [
  {
    name: "GitHub",
    url: "github.com/BetahiSoukayna",
    icon: Github,
  },
  {
    name: "LinkedIn",
    url: "linkedin.com/in/soukayna-betahi-53400135a",
    icon: Linkedin,
  },
  {
    name: "Email",
    url: "soukaynabetahi12@gmail.com",
    icon: Mail,
  },
];

export const siteConfig = {
  name: "Betahi Soukayna",
  title: "AI-Engenering student",
  description: "I Transform Ideas into Reality with Code and Creativity",
};
