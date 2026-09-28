"use client";

import { useEffect, useRef } from "react";
import type { SpinAnimation, WheelOption } from "@/lib/wheel";

const COLORS = ["var(--coral)", "var(--butter)", "var(--sage)", "var(--sky)", "var(--lavender)", "var(--mint)", "var(--peach)"];

function point(angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [200 + 190 * Math.cos(radians), 200 + 190 * Math.sin(radians)];
}

export function Wheel({
  options,
  spin,
  onFinish,
}: {
  options: WheelOption[];
  spin: SpinAnimation | null;
  onFinish: () => void;
}) {
  const rotor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spin || !rotor.current) return;
    const animation = rotor.current.animate(
      [
        { transform: `rotate(${spin.from}deg)` },
        { transform: `rotate(${spin.to}deg)` },
      ],
      { duration: spin.duration, easing: "cubic-bezier(0.12, 0.75, 0.12, 1)", fill: "both" },
    );
    let active = true;
    animation.finished.then(() => {
      if (active) onFinish();
    }).catch(() => {
      // Cancellation on unmount or replacement must not report a winner.
    });
    return () => {
      active = false;
      animation.cancel();
    };
  }, [spin, onFinish]);

  useEffect(() => {
    const element = rotor.current;
    if (!element) return;
    // Measure in SVG units so wide characters and mobile font sizes stay
    // inside the radial label area without shrinking every short label.
    function fitLabels() {
      element?.querySelectorAll<SVGTextElement>("text").forEach((label) => {
        label.removeAttribute("textLength");
        label.removeAttribute("lengthAdjust");
        if (label.getComputedTextLength() > 112) {
          label.setAttribute("textLength", "112");
          label.setAttribute("lengthAdjust", "spacingAndGlyphs");
        }
      });
    }
    const observer = new ResizeObserver(fitLabels);
    observer.observe(element);
    fitLabels();
    // Re-fit once the brand font finishes loading.
    let active = true;
    void document.fonts.ready.then(() => { if (active) fitLabels(); });
    return () => { active = false; observer.disconnect(); };
  }, [options]);

  const segmentAngle = 360 / options.length;
  return (
    <div className="wheel-container relative mx-auto w-full max-w-[480px] overflow-hidden pt-3" aria-label="Decision wheel; the pointer is at the top">
      <div aria-hidden="true" className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <svg width="28" height="34" viewBox="0 0 28 34">
          <path d="M5 2 H23 Q27 2 25 7 L16 29 Q14 34 12 29 L3 7 Q1 2 5 2 Z" fill="var(--coral)" stroke="var(--surface)" strokeWidth="2" />
        </svg>
      </div>
      <div ref={rotor} style={{ transform: `rotate(${spin?.to ?? 0}deg)` }}>
        <svg viewBox="0 0 400 400" className="block h-auto w-full" role="img" aria-label={`Decision wheel with ${options.length} equal options`}>
          <title>{options.map((option) => option.label || "Unnamed option").join(", ")}</title>
          {options.map((option, index) => {
            const start = index * segmentAngle;
            const end = start + segmentAngle;
            const [x1, y1] = point(start);
            const [x2, y2] = point(end);
            const middle = start + segmentAngle / 2;
            const characters = Array.from(option.label.trim() || "Unnamed");
            const limit = options.length >= 10 ? 12 : 16;
            const label = characters.length > limit ? characters.slice(0, limit - 1).join("") + "…" : characters.join("");
            return (
              <g key={option.id}>
                <path d={`M200 200 L${x1} ${y1} A190 190 0 0 1 ${x2} ${y2} Z`} fill={COLORS[index === options.length - 1 && index % COLORS.length === 0 ? 2 : index % COLORS.length]} stroke="var(--surface)" strokeWidth="2">
                  <title>{option.label || "Unnamed option"}</title>
                </path>
                <g transform={`rotate(${middle - 90} 200 200)`}>
                  <text x="326" y="200" textAnchor="middle" dominantBaseline="middle" fill="var(--wheel-ink)" className="wheel-label" fontWeight="600" transform={middle > 180 ? "rotate(180 326 200)" : undefined}>
                    {label}
                  </text>
                </g>
              </g>
            );
          })}
          <circle cx="200" cy="200" r="19" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
          <circle cx="200" cy="200" r="192" fill="none" stroke="var(--surface)" strokeWidth="7" />
        </svg>
      </div>
    </div>
  );
}
