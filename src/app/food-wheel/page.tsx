import { ToolsNavigation } from "@/components/ToolsNavigation";
import type { Metadata } from "next";
import { SparkAccent } from "@/components/Brand";
import { WheelExperience } from "@/components/WheelExperience";
import { FOOD_TOOL } from "@/lib/wheel-tools";

const title = "Food Wheel – What Should I Eat? | SparkyWheel";
const description = "Can't decide what to eat? Spin the SparkyWheel Food Wheel for a random meal idea, or customize the choices with your own favorites.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://sparkywheel.com/food-wheel" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "https://sparkywheel.com/food-wheel", siteName: "SparkyWheel", locale: "en_US", title, description },
  twitter: { card: "summary", title, description },
};

export default function FoodWheelPage() {
  return (
    <div className="brand-shell isolate">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-white focus:p-3">Skip to wheel</a>
      <div aria-hidden="true" className="edge-shape edge-shape-left" />
      <div aria-hidden="true" className="edge-shape edge-shape-right" />
      <header className="site-header">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Full navigation restores the destination tool's saved session. */}
        <a href="/" className="wordmark" aria-label="SparkyWheel home">Sparky<span>Wheel</span><SparkAccent className="ml-2 h-6 w-6 text-brand-coral" /></a>
        <ToolsNavigation food />
      </header>
      <main id="main" className="mx-auto max-w-[1100px] px-4 pb-5 sm:px-8" tabIndex={-1}>
        <div className="hero food-hero">
          <div className="eyebrow">A little help with mealtime</div>
          <h1>What Should I Eat? <span>Spin the Food Wheel</span></h1>
          <p>Ten meal ideas, one easy decision. Spin now, or edit the choices and try a food preset.</p>
        </div>
        <WheelExperience tool={FOOD_TOOL} />
        <p className="footer-note">Your food favorites, saved separately from your general wheel.</p>
        <div className="home-guide">
          <section aria-labelledby="about-food">
            <h2 id="about-food">What is the Food Wheel?</h2>
            <p>The Food Wheel randomly chooses a meal idea when you can&apos;t decide what to eat. It starts with pizza, tacos, burgers, pasta, stir-fry, curry, burritos, noodle soup, baked potatoes, and grain bowls. Keep the choices that sound good to you and spin.</p>
          </section>
          <section aria-labelledby="food-how">
            <h2 id="food-how">How to use the Food Wheel</h2>
            <ol>
              <li>Start with the dinner ideas or choose a preset in the options panel.</li>
              <li>Add, remove, or edit foods to keep 2–20 choices you would enjoy.</li>
              <li>Spin the wheel and let SparkyWheel pick a meal idea.</li>
              <li>Use Share to send your customized wheel to friends or family.</li>
            </ol>
            <p>Try Dinner Ideas for meal types, Takeout / Cuisines for a cuisine choice, or Quick Meals for simple meal ideas. Switch freely between built-in presets. If you customize the title or choices, presets and Restore defaults ask before replacing them.</p>
          </section>
          <section aria-labelledby="food-customize">
            <h2 id="food-customize">Make it your own</h2>
            <p>Replace the defaults with favorite meals, cuisines, household favorites, or takeout and restaurant choices you already have in mind. The wheel chooses from your list; it does not find nearby restaurants. Remove anything that doesn&apos;t suit your preferences or dietary needs before spinning.</p>
          </section>
          <section aria-labelledby="food-faq">
            <h2 id="food-faq">Food Wheel questions</h2>
            <h3>How does the Food Wheel choose?</h3>
            <p>Every entry has an equal chance on each spin, using your browser&apos;s secure random number generator. The same choice can win again.</p>
            <h3>Can I add my own food choices?</h3>
            <p>Yes. Edit the title and any choice, or add and remove entries to keep between 2 and 20 options. Each entry needs a name before you spin.</p>
            <h3>Can I use the wheel for dinner ideas?</h3>
            <p>Yes. Dinner Ideas is the starting preset. You can also make a wheel of meals your household already likes, or use Takeout / Cuisines to narrow down tonight&apos;s order.</p>
            <h3>Can I share my Food Wheel?</h3>
            <p>Yes. Share creates a Food Wheel link containing your title and choices. Viewing or spinning a shared wheel does not replace the visitor&apos;s saved food choices. Editing it or applying a preset makes it their own Food Wheel.</p>
            <h3>Does my Food Wheel stay saved?</h3>
            <p>Your Food Wheel saves automatically in this browser when local storage is available, separately from the general wheel. It does not sync between devices, and clearing site data removes it. A share link lets you open those choices elsewhere.</p>
          </section>
          <section aria-labelledby="general-wheel">
            <h2 id="general-wheel">Deciding something else?</h2>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Reload the destination's saved wheel. */}
            <p>Use the <a className="header-link" href="/">general SparkyWheel random picker</a> for names, games, or any other choices.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
