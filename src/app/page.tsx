import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ChartNoAxesCombined,
  Layers3,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import { Header, Contact, Footer, RevealObserver } from "@/components/site-shell";
import { Orbit } from "@/components/orbit";
import { CareerEntry, ProjectCard, SectionHeading } from "@/components/sections";
import {
  about,
  education,
  experience,
  explorations,
  practice,
  profile,
  type PracticeIcon,
} from "@/lib/content";

const practiceIcons: Record<PracticeIcon, LucideIcon> = {
  layers: Layers3,
  scan: ScanLine,
  chart: ChartNoAxesCombined,
};

export default function Home() {
  const [lead, ...aboutParagraphs] = about;
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow">
                <span className="status-dot" /> MANCHESTER, UK
              </div>
              <h1>
                Alec
                <br />
                Dewell<span className="accent-period">.</span>
                <br />
                <span className="serif-accent">Head of</span>
                <br />
                Product.
              </h1>
              <p>
                I lead product at Oliver James. My work includes deciding where AI is useful and
                helping our teams adopt it.
              </p>
              <div className="hero-actions">
                <a href="#journey" className="button button-primary">
                  My career
                  <ArrowDown size={17} />
                </a>
                <Link href="/work" className="text-link">
                  Portfolio
                  <ArrowUpRight size={17} />
                </Link>
              </div>
              <div className="hero-current">
                <span className="current-line" />
                <div>
                  <span>CURRENTLY</span>
                  <strong>
                    Head of Product <span>@</span> Oliver James
                  </strong>
                </div>
              </div>
            </div>
            <Orbit />
            <div className="hero-bottom">
              <span>CURRENT FOCUS: AI IN CRM</span>
              <a href="#about">
                ABOUT ME <ArrowDown size={14} />
              </a>
            </div>
          </div>
        </section>

        <div className="credentials-strip">
          <div className="container credentials-inner">
            <span>WHERE I’VE WORKED</span>
            {/* Wordmark ornaments (®, sub-labels, arrows) are decorative. */}
            <span className="company-oj">
              oliver james<span aria-hidden="true">RECRUITMENT</span>
            </span>
            <span className="company-bullhorn">
              bullhorn<span aria-hidden="true">®</span>
            </span>
            <span className="company-mb" aria-label="Maxwell Bond">
              MAXWELL<span>BOND</span>
              <i aria-hidden="true">↗</i>
            </span>
            <span className="company-modis">
              modis<span aria-hidden="true">®</span>
            </span>
          </div>
        </div>

        <section className="about-section section-padding" id="about">
          <div className="container">
            <SectionHeading
              number="01"
              label="ABOUT ME"
              aside={<span className="section-aside">BACKGROUND</span>}
            />
            <div className="about-grid" data-reveal>
              <div>
                <h2>
                  About me.
                  <br />
                  <span className="serif-accent">Based in Manchester.</span>
                </h2>
                <div className="about-signature" aria-hidden="true">
                  Alec<span>↗</span>
                </div>
              </div>
              <div className="about-copy">
                <p className="lead">{lead}</p>
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link dark-link"
                >
                  Connect on LinkedIn
                  <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="journey-section section-padding" id="journey">
          <div className="container">
            <SectionHeading
              number="02"
              label="CAREER HISTORY"
              aside={
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="subtle-link"
                >
                  View full profile
                  <ArrowUpRight size={14} />
                </a>
              }
            />
            <div className="journey-intro" data-reveal>
              <h2>
                My career
                <br />
                <span className="serif-accent">so far.</span>
              </h2>
              <p>
                I started in recruitment in 2012.
                <br />
                My first product role followed in 2021.
              </p>
            </div>
            <div className="timeline">
              {experience.map((item) => (
                <CareerEntry key={`${item.company}-${item.period}`} item={item} />
              ))}
            </div>
            <div className="education-note" data-reveal>
              <span className="eyebrow">EDUCATION</span>
              {education.map((entry) => (
                <p key={entry.institution}>
                  {entry.subject} <span>·</span> {entry.institution}{" "}
                  <span className="education-year">{entry.period}</span>
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="practice-section section-padding">
          <div className="container">
            <SectionHeading
              number="03"
              label="WHAT I DO"
              aside={<span className="section-aside">PRODUCT MANAGEMENT</span>}
            />
            <div className="practice-grid" data-reveal>
              <h2>
                My work
                <br />
                <span className="serif-accent">at Oliver James.</span>
              </h2>
              <p>
                I manage our internal products
                <br />
                and lead our work on AI.
              </p>
            </div>
            <div className="practice-list">
              {practice.map(({ icon, title, text, skills }, i) => {
                const Icon = practiceIcons[icon];
                return (
                  <div className="practice-row" key={title} data-reveal>
                    <span className="practice-index">0{i + 1}</span>
                    <Icon size={28} strokeWidth={1.2} aria-hidden="true" />
                    <h3>{title}</h3>
                    <div>
                      <p>{text}</p>
                      <span className="practice-skills">{skills}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="work-section section-padding" id="work">
          <div className="container">
            <SectionHeading
              number="04"
              label="PORTFOLIO"
              aside={
                <span className="work-status">
                  <span /> COMING SOON
                </span>
              }
            />
            <div className="work-intro" data-reveal>
              <div>
                <h2>
                  Projects
                  <br />
                  <span className="serif-accent">coming soon.</span>
                </h2>
                <p>I’ll add projects here as they’re ready to share.</p>
              </div>
              <Link href="/work" className="text-link">
                View portfolio
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="project-grid">
              {explorations.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
