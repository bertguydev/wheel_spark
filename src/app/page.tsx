import { WheelExperience } from "@/components/WheelExperience";
import { SparkAccent } from "@/components/Brand";
export default function Home() {
  return (
    <div className="brand-shell isolate">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-white focus:p-3">Skip to wheel</a>
      <div aria-hidden="true" className="edge-shape edge-shape-left" />
      <div aria-hidden="true" className="edge-shape edge-shape-right" />
      <header className="site-header">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Full navigation restores the saved wheel when leaving a shared link. */}
        <a href="/" className="wordmark" aria-label="SparkyWheel home">Sparky<span>Wheel</span><SparkAccent className="ml-2 h-6 w-6 text-brand-coral" /></a>
        <nav aria-label="Main"><a href="#options" className="header-link">Edit options</a></nav>
      </header>
      <main id="main" className="mx-auto max-w-[1100px] px-4 pb-5 sm:px-8" tabIndex={-1}>
        <div className="hero">
          <div className="eyebrow">A little spark of possibility</div>
          <h1>Can&apos;t decide?<span>Give it a spin.</span></h1>
          <p>A free, easy-to-use decision wheel for food, teams, names and more.</p>
        </div>
        <WheelExperience />
        <p className="footer-note">Every option. An equal chance. A little more fun.</p>
      </main>
    </div>
  );
}
