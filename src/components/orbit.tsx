"use client";

import { useId, useState } from "react";

const modes = [
  { label: "Strategy", caption: "I set product priorities with the CIO and COO." },
  { label: "People", caption: "I use research to understand how people work." },
  { label: "Technology", caption: "I build with Python and Copilot Studio." },
];

export function Orbit() {
  const [active, setActive] = useState(0);
  // Unique per instance so the gradient ids never clash. Used only inside url(),
  // which accepts any id characters, so no escaping is needed.
  const id = useId();

  return (
    <div className={`orbit-scene orbit-mode-${active}`}>
      <div className="orbit-coordinate coordinate-top">
        <span className="tiny-cross" aria-hidden="true">
          +
        </span>{" "}
        HOW I WORK
      </div>
      <svg
        className="orbit-svg"
        viewBox="0 0 520 500"
        fill="none"
        role="img"
        aria-label="An abstract sphere with intersecting orbits"
      >
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop stopColor="#dcaa80" stopOpacity=".13" />
            <stop offset="1" stopColor="#dcaa80" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`${id}-ring`}
            x1="70"
            y1="80"
            x2="430"
            y2="420"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f1c4a0" />
            <stop offset=".42" stopColor="#bd8665" stopOpacity=".4" />
            <stop offset="1" stopColor="#f1c4a0" />
          </linearGradient>
        </defs>
        <circle cx="260" cy="250" r="240" fill={`url(#${id}-glow)`} />
        <path
          d="M260 18V482M28 250H492"
          stroke="#e0e6da"
          strokeOpacity=".08"
          strokeDasharray="3 6"
        />
        <circle cx="260" cy="250" r="222" stroke="#e0e6da" strokeOpacity=".07" />
        <image
          className="point-sphere"
          href="/images/point-sphere.svg"
          x="0"
          y="0"
          width="520"
          height="500"
        />
        <g className="orbital-rings" stroke={`url(#${id}-ring)`}>
          <ellipse cx="260" cy="250" rx="234" ry="77" transform="rotate(-35 260 250)" />
          <ellipse
            cx="260"
            cy="250"
            rx="211"
            ry="91"
            transform="rotate(61 260 250)"
            strokeOpacity=".65"
          />
          <ellipse
            cx="260"
            cy="250"
            rx="211"
            ry="91"
            transform="rotate(61 260 250)"
            strokeWidth="10"
            strokeOpacity=".035"
          />
        </g>
        <circle className="orbit-satellite" cx="445" cy="116" r="5" fill="#e6bb98" />
        <circle cx="445" cy="116" r="11" stroke="#e6bb98" strokeOpacity=".25" />
        <circle cx="158" cy="78" r="3.5" fill="#c6d4b3" />
        <path d="M37 402H97L139 360M386 373L422 409H483" stroke="#c8ccb9" strokeOpacity=".3" />
        <text x="29" y="420" fill="#8f958c" fontSize="10" letterSpacing="1.5">
          USER RESEARCH
        </text>
        <text x="390" y="428" fill="#8f958c" fontSize="10" letterSpacing="1.5">
          AI EXPERIMENTS
        </text>
      </svg>
      <div className="orbit-controls" role="group" aria-label="Explore my focus areas">
        {modes.map((mode, i) => (
          <button key={mode.label} onClick={() => setActive(i)} aria-pressed={active === i}>
            <span className="control-dot" />
            {mode.label}
          </button>
        ))}
      </div>
      <p className="orbit-caption" aria-live="polite">
        {modes[active].caption}
      </p>
    </div>
  );
}
