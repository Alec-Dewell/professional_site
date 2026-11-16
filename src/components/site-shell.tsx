"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Copy, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

export function Header({ work = false }: { work?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  const links = [{ label: "About", href: work ? "/#about" : "#about" }, { label: "Career", href: work ? "/#journey" : "#journey" }, { label: "Portfolio", href: work ? "/work" : "#work" }];
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header"><div className="container header-inner">
      <Link href="/" className="brand" aria-label="Alec Dewell home"><span className="brand-mark">ad<span>↗</span></span><span className="brand-name">Alec Dewell<span>PRODUCT & AI</span></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <Link href={link.href} key={link.label} aria-current={work && link.label === "Portfolio" ? "page" : undefined}>{link.label}</Link>)}</nav>
      <a className="header-contact" href={`mailto:${profile.email}`}>Let’s talk <ArrowUpRight size={16}/></a>
      <button className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{links.map(link => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={20}/></Link>)}<a href={`mailto:${profile.email}`} onClick={() => setOpen(false)}>Let’s talk<ArrowUpRight size={20}/></a></nav>}
    </header>
  </>;
}

export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }); }, { threshold: 0.07 });
    document.querySelectorAll("[data-reveal]").forEach(el => { el.classList.add("will-reveal"); observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  return null;
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => { if (copied) { const timeout = setTimeout(() => setCopied(false), 2500); return () => clearTimeout(timeout); } }, [copied]);
  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <section className="contact-section" id="contact"><div className="container" data-reveal>
    <div className="contact-top"><span className="eyebrow"><span className="status-dot"/> CONTACT</span><span className="contact-location">MANCHESTER, UK <span>↗</span></span></div>
    <div className="contact-main"><h2>Let’s talk.<br/><span className="serif-accent">Send me a note.</span></h2><a className="contact-arrow" href={`mailto:${profile.email}`} aria-label="Email Alec Dewell"><ArrowUpRight strokeWidth={1.1}/></a></div>
    <div className="contact-bottom"><p>You can reach me by email<br/>or connect with me on LinkedIn.</p><div className="email-group"><a href={`mailto:${profile.email}`}>{profile.email}</a><button aria-label={copied ? "Email address copied" : "Copy email address"} onClick={copyEmail}>{copied ? <Check size={18}/> : <Copy size={18}/>}</button><span className="copy-status" role="status">{copied ? "Email copied" : copyError ? "Please select the email to copy it." : ""}</span></div></div>
  </div></section>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><Link href="/" className="footer-name">Alec Dewell<span>Head of Product at Oliver James</span></Link><span className="copyright">© {new Date().getFullYear()} Alec Dewell</span><div className="footer-links"><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={14}/></a><a href="#main">Back to top<ArrowDown className="up-arrow" size={14}/></a></div></div></footer>;
}
