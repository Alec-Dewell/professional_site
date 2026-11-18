import type { ArtType } from "@/lib/content";

/** Decorative illustration for a portfolio collection; hidden from assistive technology. */
export function ProjectArt({ type }: { type: ArtType }) {
  return (
    <div className={`project-art variant-${type}`} aria-hidden="true">
      <div className="art-grid" />
      {type === "orbital" && (
        <div className="mini-system">
          <i />
          <i />
          <i />
          <span />
          <b />
        </div>
      )}
      {type === "grid" && (
        <div className="strategy-grid">
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} />
          ))}
          <span>PRODUCT DISCOVERY</span>
        </div>
      )}
      {type === "steps" && (
        <div className="build-steps">
          <i />
          <i />
          <i />
          <span>PROJECTS COMING SOON</span>
        </div>
      )}
      <span className="art-corner corner-tl">+</span>
      <span className="art-corner corner-br">+</span>
    </div>
  );
}
