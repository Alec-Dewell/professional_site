"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

/**
 * Site header. The current page is derived from the URL, so pages that are not
 * in the navigation (such as the 404 page) never claim to be "Portfolio".
 */
export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const links = [
    { label: "About", href: onHome ? "#about" : "/#about", current: false },
    { label: "Career", href: onHome ? "#journey" : "/#journey", current: false },
    { label: "Portfolio", href: onHome ? "#work" : "/work", current: pathname === "/work" },
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              ad<span>↗</span>
            </span>
            <span className="brand-name">
              Alec Dewell <span>PRODUCT & AI</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <Link
                href={link.href}
                key={link.label}
                aria-current={link.current ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <a className="header-contact" href={`mailto:${profile.email}`}>
            Let’s talk <ArrowUpRight size={16} />
          </a>
          <button
            className="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={link.current ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
                <ArrowUpRight size={20} />
              </Link>
            ))}
            <a href={`mailto:${profile.email}`} onClick={() => setOpen(false)}>
              Let’s talk
              <ArrowUpRight size={20} />
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
