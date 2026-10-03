import { ToolsNavigation } from "@/components/ToolsNavigation";
import type { Metadata } from "next";
import { SparkAccent } from "@/components/Brand";
import { WheelExperience } from "@/components/WheelExperience";
import { YES_NO_TOOL } from "@/lib/wheel-tools";

const title = "Yes or No Wheel – Random Yes or No Picker | SparkyWheel";
const description = "Can't decide? Spin the SparkyWheel Yes or No Wheel for a random answer. Choose between Yes and No, or customize the wheel for your decision.";
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
      <main id="main" className="mx-auto max-w-[1100px] px-4 pb-5 sm:px-8" tabIndex={-1}>
        <div className="hero food-hero">
          <h1>Yes or No <span>Wheel</span></h1>
          <p>Can&apos;t decide? Spin the wheel and let SparkyWheel choose Yes or No for you.</p>
        </div>
        <WheelExperience tool={YES_NO_TOOL} />
        <div className="home-guide">
          <section aria-labelledby="yes-no-about">
            <h2 id="yes-no-about">Can&apos;t decide? Let the wheel choose</h2>
            <p>Get a random answer for everyday decisions: should we order takeout, watch another episode, or go out tonight? Wondering whether to start that project or choose option A or B? Assign your choices to Yes and No, then spin. It&apos;s a playful way to pick, not serious advice.</p>
          </section>
          <section aria-labelledby="yes-no-how">
            <h2 id="yes-no-how">How the Yes or No Wheel works</h2>
            <ol>
              <li>Think of a yes-or-no question.</li>
              <li>Spin the wheel.</li>
              <li>SparkyWheel randomly chooses Yes or No.</li>
              <li>Spin again whenever you have another decision.</li>
            </ol>
            <p>Want a third answer? Choose Yes / No / Maybe in the options panel. Choose Yes / No to return to two answers. Switching asks before replacing customized choices.</p>
          </section>
          <section aria-labelledby="yes-no-random">
            <h2 id="yes-no-random">Is the Yes or No Wheel random?</h2>
            <p>Each spin uses the browser&apos;s random number generator to select an entry with equal probability. With the default two choices, Yes and No each have a 50% chance. Previous spins do not influence the next selection, so repeated answers are possible.</p>
          </section>
          <section aria-labelledby="yes-no-faq">
            <h2 id="yes-no-faq">Frequently asked questions</h2>
            <h3>Does Yes or No have a better chance of winning?</h3>
            <p>No. Each has an equal chance on the default wheel.</p>
            <h3>Can I add Maybe?</h3>
            <p>Yes. Choose Yes / No / Maybe for three equally likely answers, each with a one-in-three chance.</p>
            <h3>Can I customize the choices?</h3>
            <p>Yes. Use the existing editor to change the title or choices and keep 2–20 entries. Your wheel saves automatically in this browser when local storage is available, independently of the general wheel and Food Wheel.</p>
            <h3>Can I share my Yes or No Wheel?</h3>
            <p>Yes. Share Wheel creates a link with your title and choices on this page. Viewing or spinning it does not overwrite the recipient&apos;s saved wheel. Editing it or choosing an answer mode adopts it only for this page.</p>
          </section>
          <section aria-labelledby="yes-no-general">
            <h2 id="yes-no-general">More choices?</h2>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Reload the destination's saved wheel. */}
            <p>Open the <a className="header-link" href="/">general SparkyWheel random picker</a> for your next decision.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
