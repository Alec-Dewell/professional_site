import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Header, Footer, Contact, RevealObserver } from "@/components/site-shell";
import { ProjectArt } from "@/components/project-art";
import { explorations, profile } from "@/lib/content";

export const metadata: Metadata = { title: "Portfolio", description: "Alec Dewell’s project portfolio. No published projects yet; the first entries will be added when they’re ready." };

export default function WorkPage() {
  return <><Header work/><main id="main"><section className="work-page-hero container"><a href="/" className="subtle-link"><ArrowLeft size={15}/>Back to home</a><div className="eyebrow"><span className="section-number">PORTFOLIO /</span> COMING SOON</div><h1>My project<br/><span className="serif-accent">portfolio.</span></h1><div className="work-page-intro"><p>There are no published projects here yet. I’ll add them when they’re ready to share.</p><span className="work-status"><span/> FIRST ENTRIES COMING SOON</span></div></section>
    <section className="work-collection container" aria-label="Future portfolio collections">{explorations.map(project => <article className="collection-entry" id={project.slug} key={project.slug} data-reveal><ProjectArt type={project.art}/><div><div className="project-meta"><span>{project.number} / {project.type}</span><span className="coming-soon">COMING SOON</span></div><h2>{project.title}</h2><p>{project.description}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><p className="collection-note">No entries published yet.</p></div></article>)}</section>
    <aside className="work-follow container"><p>You can find me on LinkedIn.</p><a className="text-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">View my profile<ArrowUpRight size={17}/></a></aside>
    <Contact/></main><Footer/><RevealObserver/></>;
}
