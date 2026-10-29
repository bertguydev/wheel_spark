import { ToolsNavigation } from "@/components/ToolsNavigation";
import type { Metadata } from "next";
import { SparkAccent } from "@/components/Brand";
import { YesNoExperience } from "@/components/YesNoExperience";
import "./yes-no.css";

const title = "Yes or No Wheel – Random Yes or No Picker | SparkyWheel";
const description = "Can't decide? Spin the SparkyWheel Yes or No Wheel for a random answer. Get Yes or No with equal probability, or choose Quick Answer for a little help from Sparky.";
const url = "https://sparkywheel.com/yes-or-no-wheel";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url, siteName: "SparkyWheel", locale: "en_US", title, description },
  twitter: { card: "summary", title, description },
};

export default function YesOrNoWheelPage() {
  return (
    <div className="brand-shell isolate yes-no-page">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-20 focus:bg-white focus:p-3">Skip to wheel</a>
      <div aria-hidden="true" className="edge-shape edge-shape-left" />
      <div aria-hidden="true" className="edge-shape edge-shape-right" />
      <header className="site-header">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Full navigation restores the destination tool's saved session. */}
        <a href="/" className="wordmark" aria-label="SparkyWheel home">Sparky<span>Wheel</span><SparkAccent className="ml-2 h-6 w-6 text-brand-coral" /></a>
        <ToolsNavigation yesNo />
      </header>
      <main id="main" className="mx-auto max-w-[1180px] px-4 pb-5 sm:px-8" tabIndex={-1}>
        <div className="hero food-hero">
          <h1>Yes or No <span>Wheel</span></h1>
          <p>Can&apos;t decide? Spin the wheel and let SparkyWheel choose Yes or No for you.</p>
        </div>
        <YesNoExperience classroom={
          <section className="classroom-helper" aria-labelledby="classroom-heading">
            <h2 id="classroom-heading"><svg aria-hidden="true" viewBox="0 0 28 28"><path d="m2 10 12-6 12 6-12 6Zm5 3v7q7 5 14 0v-7M3 11v10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>A Quick Classroom Decision Helper</h2>
            <p>Use SparkyWheel to make simple, low-stakes classroom choices without slowing down your lesson. Ask a yes-or-no question, then spin the wheel for a little excitement or choose Quick Answer for a fast result.</p>
            <div className="classroom-examples">
              <h3>Try these classroom questions:</h3>
              <ul>
                <li>Should we start with a warm-up activity?</li>
                <li>Should our next review question be a team challenge?</li>
                <li>Should we take a two-minute movement break?</li>
                <li>Should we read the next chapter today?</li>
              </ul>
            </div>
            <p className="classroom-note">Best for playful choices and activities—not grading, student discipline, or decisions requiring fairness beyond a random choice.</p>
          </section>
        } />
        <div className="home-guide">
          <section aria-labelledby="yes-no-about">
            <h2 id="yes-no-about">Can&apos;t decide? Let the wheel choose</h2>
            <p>Get a random answer for everyday decisions: should we order takeout, watch another episode, or go out tonight? Think of a yes-or-no question, then spin or choose Quick Answer. It&apos;s a playful way to pick, not serious advice.</p>
          </section>
          <section aria-labelledby="yes-no-how">
            <h2 id="yes-no-how">How the Yes or No Wheel works</h2>
            <ol>
              <li>Think of a yes-or-no question.</li>
              <li>Spin the wheel, or choose Quick Answer.</li>
              <li>SparkyWheel randomly chooses Yes or No.</li>
              <li>Spin again whenever you have another decision.</li>
            </ol>
            <p>Watch Sparky&apos;s speech bubble for your answer. Quick Answer adds a brief moment of anticipation without spinning the wheel.</p>
          </section>
          <section aria-labelledby="yes-no-random">
            <h2 id="yes-no-random">Is the Yes or No Wheel random?</h2>
            <p>Both actions use the browser&apos;s cryptographic random number generator to select an answer with equal probability. Yes and No each have a 50% chance. Previous answers do not influence the next selection, so repeated answers are possible.</p>
          </section>
          <section aria-labelledby="yes-no-faq">
            <h2 id="yes-no-faq">Frequently asked questions</h2>
            <h3>Does Yes or No have a better chance of winning?</h3>
            <p>No. Each has an equal chance on this two-option wheel.</p>
            <h3>What does Quick Answer do?</h3>
            <p>It selects Yes or No using the same equal-probability logic as Spin. A brief loading indicator appears before Sparky reveals the answer.</p>
            <h3>Can I customize the choices?</h3>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Open the saved general wheel with a full navigation. */}
            <p>This page keeps things simple with Yes and No. To add your own choices, use the <a className="header-link" href="/">general SparkyWheel random picker</a>.</p>
            <h3>Can I share my Yes or No Wheel?</h3>
            <p>Yes. Share This Wheel sends a link to this Yes-or-No Wheel page. The answer is not included; each visitor starts with a fresh wheel and waving Sparky.</p>
          </section>
          <section aria-labelledby="yes-no-general">
            <h2 id="yes-no-general">More choices?</h2>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Reload the destination's saved wheel. */}
            <p>Open the <a className="header-link" href="/">general SparkyWheel random picker</a> for your next decision.</p>
            <p>Decided to order food? Use the <a className="header-link" href="/food-wheel">Food Wheel</a> to choose a meal or cuisine.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
