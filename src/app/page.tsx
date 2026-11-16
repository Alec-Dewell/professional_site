import { ArrowDown, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Layers3, ScanLine } from "lucide-react";
import { Header, Contact, Footer, RevealObserver } from "@/components/site-shell";
import { Orbit } from "@/components/orbit";
import { ProjectArt } from "@/components/project-art";
import { experience, explorations, profile } from "@/lib/content";

export default function Home() {
  return <>
    <Header/>
    <main id="main">
      <section className="hero"><div className="container hero-grid">
        <div className="hero-copy"><div className="eyebrow hero-eyebrow"><span className="status-dot"/> MANCHESTER, UK</div>
          <h1>Alec<br/>Dewell<span className="accent-period">.</span><br/><span className="serif-accent">Head of</span><br/>Product.</h1>
          <p>I lead product at Oliver James. My work includes deciding where AI is useful and helping our teams adopt it.</p>
          <div className="hero-actions"><a href="#journey" className="button button-primary">My career<ArrowDown size={17}/></a><a href="/work" className="text-link">Portfolio<ArrowUpRight size={17}/></a></div>
          <div className="hero-current"><span className="current-line"/><div><span>CURRENTLY</span><strong>Head of Product <span>@</span> Oliver James</strong></div></div>
        </div>
        <Orbit/>
        <div className="hero-bottom"><span>CURRENT FOCUS: AI IN CRM</span><a href="#about">ABOUT ME <ArrowDown size={14}/></a></div>
      </div></section>

      <div className="credentials-strip"><div className="container credentials-inner"><span>WHERE I’VE WORKED</span><span className="company-oj">oliver james<span>RECRUITMENT</span></span><span className="company-bullhorn">bullhorn<span>®</span></span><span className="company-mb">MAXWELL<span>BOND</span><i>↗</i></span><span className="company-modis">modis<span>®</span></span></div></div>

      <section className="about-section section-padding" id="about"><div className="container">
        <div className="section-heading" data-reveal><span className="eyebrow"><span className="section-number">01 /</span> ABOUT ME</span><span className="section-aside">BACKGROUND</span></div>
        <div className="about-grid" data-reveal><div><h2>About me.<br/><span className="serif-accent">Based in Manchester.</span></h2><div className="about-signature">Alec<span>↗</span></div></div><div className="about-copy"><p className="lead">I spent nearly nine years in recruitment. I took my first product management role in 2021.</p><p>At Oliver James, I set up the product management function for our internal software. Much of it runs on Salesforce, alongside applications built by our own developers.</p><p>Today I lead the product team and our AI strategy. I work with the CIO and COO on roadmaps, with responsibility for how we prioritise work and measure its value.</p><p>I still spend time building things myself. I work with Python and Copilot Studio alongside my responsibilities as Head of Product.</p><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-link dark-link">Connect on LinkedIn<ArrowUpRight size={17}/></a></div></div>
      </div></section>

      <section className="journey-section section-padding" id="journey"><div className="container">
        <div className="section-heading" data-reveal><span className="eyebrow"><span className="section-number">02 /</span> CAREER HISTORY</span><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="subtle-link">View full profile<ArrowUpRight size={14}/></a></div>
        <div className="journey-intro" data-reveal><h2>My career<br/><span className="serif-accent">so far.</span></h2><p>I started in recruitment in 2012.<br/>My first product role followed in 2021.</p></div>
        <div className="timeline">{experience.map((item, i) => <details key={`${item.company}-${i}`} className={`career-entry ${item.current ? "current-role" : ""}`} open={item.current || undefined} data-reveal>
          <summary><span className="career-year">{item.year}<span className="timeline-node"/></span><span className="career-title-group"><span className="career-company">{item.company}{item.current && <span className="now-badge"><span/>NOW</span>}</span><span className="career-title">{item.role}</span><span className="career-period-mobile">{item.period}</span></span><span className="career-period">{item.period}</span><span className="expand-icon" aria-hidden="true"/></summary>
          <div className="career-body"><h3>{item.summary}</h3><p>{item.description}</p>{item.details.length > 0 && <ul>{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul>}<div className="tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
        </details>)}</div>
        <div className="education-note" data-reveal><span className="eyebrow">EDUCATION</span><p>Chemical & Biological Engineering <span>·</span> The University of Sheffield <span className="education-year">2008–2011</span></p><p>Service Blueprinting <span>·</span> Design Thinkers Academy London <span className="education-year">2022</span></p></div>
      </div></section>

      <section className="practice-section section-padding"><div className="container">
        <div className="section-heading" data-reveal><span className="eyebrow"><span className="section-number">03 /</span> WHAT I DO</span><span className="section-aside">PRODUCT MANAGEMENT</span></div>
        <div className="practice-grid" data-reveal><h2>My work<br/><span className="serif-accent">at Oliver James.</span></h2><p>I manage our internal products<br/>and lead our work on AI.</p></div>
        <div className="practice-list">{[
          { icon: Layers3, title: "Product management.", text: "I set product strategy and own the roadmaps for our internal software. I also lead the product team.", skills: "PRODUCT STRATEGY / TEAM LEADERSHIP" },
          { icon: ScanLine, title: "AI implementation.", text: "I assess where AI could help our business and work through the build-versus-buy decision. I also test agents myself.", skills: "AI STRATEGY / AGENT BUILDS" },
          { icon: ChartNoAxesCombined, title: "Product research.", text: "I use user research and Pendo to understand what needs improving. After a release, I look at adoption to see whether the change has helped.", skills: "USER RESEARCH / PRODUCT ANALYTICS" },
        ].map(({ icon: Icon, title, text, skills }, i) => <div className="practice-row" key={title} data-reveal><span className="practice-index">0{i + 1}</span><Icon size={28} strokeWidth={1.2}/><h3>{title}</h3><div><p>{text}</p><span className="practice-skills">{skills}</span></div></div>)}</div>
      </div></section>

      <section className="work-section section-padding" id="work"><div className="container">
        <div className="section-heading" data-reveal><span className="eyebrow"><span className="section-number">04 /</span> PORTFOLIO</span><span className="work-status"><span/> COMING SOON</span></div>
        <div className="work-intro" data-reveal><div><h2>Projects<br/><span className="serif-accent">coming soon.</span></h2><p>I’ll add projects here as they’re ready to share.</p></div><a href="/work" className="text-link">View portfolio<ArrowUpRight size={18}/></a></div>
        <div className="project-grid">{explorations.map(project => <a key={project.slug} href={`/work#${project.slug}`} className="project-card" data-reveal><ProjectArt type={project.art}/><div className="project-meta"><span>{project.type}</span><ArrowUpRight size={20}/></div><h3>{project.title}</h3><p>{project.description}</p><span className="coming-soon">COMING SOON<ArrowRight size={13}/></span></a>)}</div>
      </div></section>
      <Contact/>
    </main>
    <Footer/><RevealObserver/>
  </>;
}
