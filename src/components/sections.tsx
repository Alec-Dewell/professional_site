// Presentational building blocks for the home and portfolio pages.
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProjectArt } from "./project-art";
import { startYear, type CareerEntry as CareerEntryData, explorations } from "@/lib/content";

export function SectionHeading({
  number,
  label,
  aside,
}: {
  number: string;
  label: string;
  aside: ReactNode;
}) {
  return (
    <div className="section-heading" data-reveal>
      <span className="eyebrow">
        <span className="section-number">{number} /</span> {label}
      </span>
      {aside}
    </div>
  );
}

export function CareerEntry({ item }: { item: CareerEntryData }) {
  return (
    <details
      className={`career-entry ${item.current ? "current-role" : ""}`}
      open={item.current || undefined}
      data-reveal
    >
      <summary>
        <span className="career-year">
          {startYear(item.period)}
          <span className="timeline-node" />
        </span>
        <span className="career-title-group">
          <span className="career-company">
            {item.company}
            {item.current && (
              <span className="now-badge">
                <span />
                NOW
              </span>
            )}
          </span>
          <span className="career-title">{item.role}</span>
          <span className="career-period-mobile">{item.period}</span>
        </span>
        <span className="career-period">{item.period}</span>
        <span className="expand-icon" aria-hidden="true" />
      </summary>
      <div className="career-body">
        <h3>{item.summary}</h3>
        <p>{item.description}</p>
        {item.details.length > 0 && (
          <ul>
            {item.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
        <Tags tags={item.tags} />
      </div>
    </details>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

export function ProjectCard({ project }: { project: (typeof explorations)[number] }) {
  return (
    <Link href={`/work#${project.slug}`} className="project-card" data-reveal>
      <ProjectArt type={project.art} />
      <div className="project-meta">
        <span>{project.type}</span>
        <ArrowUpRight size={20} />
      </div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <span className="coming-soon">
        COMING SOON
        <ArrowRight size={13} />
      </span>
    </Link>
  );
}
