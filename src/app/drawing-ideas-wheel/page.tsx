import type { Metadata } from "next";
import { SparkAccent } from "@/components/Brand";
import { ToolsNavigation } from "@/components/ToolsNavigation";
import { WheelExperience } from "@/components/WheelExperience";
import { DRAWING_TOOL } from "@/lib/wheel-tools";

const title = "Drawing Ideas Wheel – What Should I Draw? | SparkyWheel";
const description = "Not sure what to draw? Spin the SparkyWheel Drawing Ideas Wheel for a random drawing prompt, or choose from easy, animal, and creative drawing ideas.";
const url = "https://sparkywheel.com/drawing-ideas-wheel";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url, siteName: "SparkyWheel", locale: "en_US", title, description },
  twitter: { card: "summary", title, description },
};

export default function DrawingIdeasWheelPage() {
  return (
    <div className="brand-shell isolate drawing-page">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-white focus:p-3">Skip to wheel</a>
      <div aria-hidden="true" className="edge-shape edge-shape-left" />
      <div aria-hidden="true" className="edge-shape edge-shape-right" />
      <header className="site-header">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Full navigation restores the destination tool's saved session. */}
        <a href="/" className="wordmark" aria-label="SparkyWheel home">Sparky<span>Wheel</span><SparkAccent className="ml-2 h-6 w-6 text-brand-coral" /></a>
        <ToolsNavigation drawing />
      </header>
      <main id="main" className="mx-auto max-w-[1100px] px-4 pb-5 sm:px-8" tabIndex={-1}>
        <div className="hero food-hero">
          <h1>What Should I Draw? <span>Spin the Drawing Ideas Wheel</span></h1>
          <p>Need some inspiration? Spin the wheel for a random drawing idea, or choose a prompt collection to match your mood.</p>
        </div>
        <WheelExperience tool={DRAWING_TOOL} />
        <div className="home-guide">
          <section aria-labelledby="drawing-about">
            <h2 id="drawing-about">What should I draw?</h2>
            <p>When you want to draw but don&apos;t know where to start, let the wheel pick a prompt. The Creative Mix starts with 14 ideas, from a cozy treehouse to a robot cooking dinner. Use the included ideas or replace them with your own in the options panel.</p>
          </section>
          <section aria-labelledby="drawing-collections">
            <h2 id="drawing-collections">Choose your drawing ideas</h2>
            <p><strong>Easy Ideas</strong> offers straightforward subjects for practice, like a coffee mug, houseplant, or cozy cabin. <strong>Animals</strong> ranges from foxes and owls to axolotls and capybaras. <strong>Imagination</strong> adds playful scenes: a ghost afraid of the dark, a pirate spaceship, or a tiny city inside a bottle.</p>
            <p>Choose a collection and press Use preset. Switch freely between built-in collections. If you&apos;ve customized the title or prompts, confirm before replacing them, or Cancel to keep your work. Restore defaults brings back Creative Mix.</p>
          </section>
          <section aria-labelledby="drawing-how">
            <h2 id="drawing-how">How to use the Drawing Ideas Wheel</h2>
            <ol>
              <li>Spin the default wheel or choose a prompt set.</li>
              <li>Let SparkyWheel choose an idea.</li>
              <li>Draw your interpretation.</li>
              <li>Spin again for another prompt.</li>
              <li>Customize the wheel with your own ideas if you like.</li>
            </ol>
          </section>
          <section aria-labelledby="drawing-interpret">
            <h2 id="drawing-interpret">Make the prompt your own</h2>
            <p>Picked &ldquo;Frog wearing a crown&rdquo;? Choose its expression, setting, colors, and story. Draw a quick doodle, a detailed sketch, or something in your own style. The prompt is a starting point; you decide what the drawing looks like. Longer labels are shortened on the wheel, but the full selected prompt appears in the result.</p>
          </section>
          <section aria-labelledby="drawing-faq">
            <h2 id="drawing-faq">Frequently asked questions</h2>
            <h3>What should I draw when I have no ideas?</h3>
            <p>Spin Creative Mix for a ready-made starting point, or choose a collection to suit your mood.</p>
            <h3>Are the drawing prompts random?</h3>
            <p>The prompt lists are curated. Each spin randomly selects an entry with equal probability. Earlier results do not influence the next spin, so a prompt can repeat.</p>
            <h3>Can beginners use the Drawing Ideas Wheel?</h3>
            <p>Yes. Try Easy Ideas for familiar subjects, and keep your drawing as simple as you like.</p>
            <h3>Can I add my own drawing prompts?</h3>
            <p>Yes. Edit the title and prompts, or add and remove entries to keep 2–20 choices. Your drawing wheel saves automatically in this browser when local storage is available, separately from the other tools.</p>
            <h3>Can I share my Drawing Ideas Wheel?</h3>
            <p>Yes. Share Wheel makes a link containing your title and full prompts on this page. Viewing or spinning the link leaves the recipient&apos;s saved wheel alone. Editing it or applying a collection adopts it only as their Drawing Ideas Wheel.</p>
          </section>
          <section aria-labelledby="drawing-more">
            <h2 id="drawing-more">Picking something else?</h2>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Reload the destination's saved wheel. */}
            <p>Use the <a className="header-link" href="/">general SparkyWheel random picker</a> for your other ideas and decisions.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
