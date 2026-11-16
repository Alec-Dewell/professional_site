import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Footer, Header } from "@/components/site-shell";

export default function NotFound() {
  return <><Header work/><main id="main" className="not-found container"><span className="eyebrow">404</span><h1>Page not found.<br/><span className="serif-accent">Try the homepage.</span></h1><p>That address doesn’t match a page on this site.</p><Link className="button button-primary" href="/">Back to home<ArrowUpRight size={18}/></Link></main><Footer/></>;
}
