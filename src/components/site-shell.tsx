// Server components shared by every page. Interactive pieces live in their own
// client components (header, copy-email, reveal-observer) so the static markup
// here ships no JavaScript.
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/content";
import { CopyEmail } from "./copy-email";

export { Header } from "./header";
export { RevealObserver } from "./reveal-observer";

export function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="container" data-reveal>
        <div className="contact-top">
          <span className="eyebrow">
            <span className="status-dot" /> CONTACT
          </span>
          <span className="contact-location">
            MANCHESTER, UK <span aria-hidden="true">↗</span>
          </span>
        </div>
        <div className="contact-main">
          <h2>
            Let’s talk.
            <br />
            <span className="serif-accent">Send me a note.</span>
          </h2>
          <a
            className="contact-arrow"
            href={`mailto:${profile.email}`}
            aria-label="Email Alec Dewell"
          >
            <ArrowUpRight strokeWidth={1.1} />
          </a>
        </div>
        <div className="contact-bottom">
          <p>
            You can reach me by email
            <br />
            or connect with me on LinkedIn.
          </p>
          <div className="email-group">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <CopyEmail email={profile.email} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Rendered on the server only, so the year cannot cause a hydration mismatch. */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link href="/" className="footer-name">
          Alec Dewell<span>Head of Product at Oliver James</span>
        </Link>
        <span className="copyright">© {new Date().getFullYear()} Alec Dewell</span>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
            <ArrowUpRight size={14} />
          </a>
          <a href="#main">
            Back to top
            <ArrowDown className="up-arrow" size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
