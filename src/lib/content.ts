/**
 * Single source of truth for the career facts shown on the site AND given to
 * the AI career chat (see src/lib/server/career-context.ts). Update facts here
 * only, so the website and the digital twin cannot drift apart.
 */

export const profile = {
  name: "Alec Dewell",
  role: "Head of Product & AI Transformation Lead",
  location: "Manchester, UK",
  email: "alecdewell@gmail.com",
  linkedin: "https://www.linkedin.com/in/alecdewell/",
};

export type CareerEntry = {
  company: string;
  role: string;
  /** Human-readable range, e.g. "Apr 2021 to Jul 2024". The first year is shown on the timeline. */
  period: string;
  current?: boolean;
  summary: string;
  description: string;
  details: string[];
  tags: string[];
};

export const experience: CareerEntry[] = [
  {
    company: "Oliver James",
    role: "Head of Product",
    period: "Nov 2025 to present",
    current: true,
    summary: "Responsible for product and AI strategy.",
    description:
      "I lead the product team at Oliver James. Our product managers cover the front and middle office, with separate ownership of analytics. A dedicated AI Product Owner works alongside the team.",
    details: [
      "Developing our AI-in-CRM strategy and assessing whether to build or buy each capability.",
      "Owning the product operating model and measuring the value of our work. I also build agents and work with Pendo.",
    ],
    tags: ["Product leadership", "AI strategy"],
  },
  {
    company: "Oliver James",
    role: "Senior Product Manager",
    period: "Nov 2024 to Nov 2025",
    summary: "Leading a team across five products.",
    description:
      "I returned to Oliver James to lead a team of three. We looked after five products, three of which ran on Salesforce.",
    details: [
      "Defined the product strategy and helped other teams with discovery.",
      "Advised on change management and encouraged adoption of our products.",
    ],
    tags: ["Team leadership", "Salesforce"],
  },
  {
    company: "Bullhorn",
    role: "Product Manager",
    period: "Jul 2024 to Nov 2024",
    summary: "Working on Bullhorn for Salesforce.",
    description:
      "I worked with three Product Owners across Europe and a US leadership team. It was a short stint, but it helped me understand the kind of team I work best in.",
    details: [],
    tags: ["Enterprise software", "International collaboration"],
  },
  {
    company: "Oliver James",
    role: "Product Manager → Senior Product Manager",
    period: "Apr 2021 to Jul 2024",
    summary: "Setting up the product management function.",
    description:
      "I established product management for our internal front-office software. This covered a customised Salesforce platform and applications built by our own developers. I became Senior Product Manager in April 2024.",
    details: [
      "Set product strategy and owned the front-office roadmap. Worked with users globally to understand what needed improving.",
      "Used product analytics to guide priorities and coordinated releases with our development partner.",
    ],
    tags: ["Product management", "User research"],
  },
  {
    company: "Modis · Oliver James · Maxwell Bond",
    role: "Principal Consultant",
    period: "Sep 2012 to Apr 2021",
    summary: "Nearly nine years in recruitment.",
    description:
      "I worked in recruitment consulting at Modis, Oliver James and Maxwell Bond before taking my first product management role in 2021.",
    details: [],
    tags: ["Recruitment", "Consulting"],
  },
];

/** First four-digit year in a period string, used as the timeline label. */
export function startYear(period: string) {
  return period.match(/\d{4}/)?.[0] ?? "";
}

/**
 * Clarifications that prevent the AI from conflating similar roles. They sit
 * next to the data they describe so they are updated together.
 */
export const careerClarifications = [
  "There are two separate Senior Product Manager roles: a promotion in April 2024 before Bullhorn, and the role Alec returned to at Oliver James in November 2024.",
  "Alec became Head of Product in November 2025.",
];

export const education = [
  {
    institution: "The University of Sheffield",
    subject: "Chemical & Biological Engineering",
    period: "2008–2011",
  },
  {
    institution: "Design Thinkers Academy London",
    subject: "Service Blueprinting",
    period: "2022",
  },
];

/** About-me paragraphs; the first is shown as the lead. Also given to the AI. */
export const about = [
  "I spent nearly nine years in recruitment. I took my first product management role in 2021.",
  "At Oliver James, I set up the product management function for our internal software. Much of it runs on Salesforce, alongside applications built by our own developers.",
  "Today I lead the product team and our AI strategy. I work with the CIO and COO on roadmaps, with responsibility for how we prioritise work and measure its value.",
  "I still spend time building things myself. I work with Python and Copilot Studio alongside my responsibilities as Head of Product.",
];

/** Extra professional facts the AI may use; not currently displayed on the page. */
export const additionalFacts = [
  "Established Jira Product Discovery boards to support product management.",
  "Uses Scrum and Kanban where appropriate for delivery.",
];

export type PracticeIcon = "layers" | "scan" | "chart";

export const practice: { icon: PracticeIcon; title: string; text: string; skills: string }[] = [
  {
    icon: "layers",
    title: "Product management.",
    text: "I set product strategy and own the roadmaps for our internal software. I also lead the product team.",
    skills: "PRODUCT STRATEGY / TEAM LEADERSHIP",
  },
  {
    icon: "scan",
    title: "AI implementation.",
    text: "I assess where AI could help our business and work through the build-versus-buy decision. I also test agents myself.",
    skills: "AI STRATEGY / AGENT BUILDS",
  },
  {
    icon: "chart",
    title: "Product research.",
    text: "I use user research and Pendo to understand what needs improving. After a release, I look at adoption to see whether the change has helped.",
    skills: "USER RESEARCH / PRODUCT ANALYTICS",
  },
];

export type ArtType = "orbital" | "grid" | "steps";

export const explorations: {
  slug: string;
  number: string;
  type: string;
  title: string;
  description: string;
  art: ArtType;
  tags: string[];
}[] = [
  {
    slug: "ai-in-practice",
    number: "01",
    type: "AI & AUTOMATION",
    title: "AI experiments.",
    description: "Experiments with agents and AI in everyday work. Details to follow.",
    art: "orbital",
    tags: ["Agents", "Applied AI"],
  },
  {
    slug: "product-thinking",
    number: "02",
    type: "PRODUCT MANAGEMENT",
    title: "Product notes.",
    description: "Notes on product management, with examples of how I approach discovery.",
    art: "grid",
    tags: ["Discovery", "Strategy"],
  },
  {
    slug: "building-in-public",
    number: "03",
    type: "SOFTWARE",
    title: "Software projects.",
    description: "Small applications and prototypes I can share. First entries to follow.",
    art: "steps",
    tags: ["Applications", "Prototypes"],
  },
];
