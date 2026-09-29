import { WheelExperience } from "@/components/WheelExperience";
import { SparkAccent } from "@/components/Brand";
import type { Metadata } from "next";

const title = "Random Wheel Spinner – Spin the Wheel | SparkyWheel";
const description = "Create a custom random wheel, add your choices, spin, and let SparkyWheel pick for you. Free, fast, customizable, and easy to share.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://sparkywheel.com/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://sparkywheel.com/",
    siteName: "SparkyWheel",
    locale: "en_US",
    title,
    description,
  },
  twitter: { card: "summary", title, description },
};

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
          <h1>Free Random <span>Wheel Spinner</span></h1>
          <p>Add your choices, spin the wheel, and let SparkyWheel pick for you.</p>
        </div>
        <WheelExperience />
        <p className="footer-note">Every option. An equal chance. A little more fun.</p>
        <div className="home-guide">
          <section aria-labelledby="about-wheel">
            <h2 id="about-wheel">What is SparkyWheel?</h2>
            <p>SparkyWheel is a free, customizable random wheel spinner that helps you choose between options. Use it as a random picker when you need a quick decision or want to give everyone an equal chance.</p>
          </section>
          <section aria-labelledby="how-to-spin">
            <h2 id="how-to-spin">How to use the wheel</h2>
            <ol>
              <li>Add or edit your choices in the options panel.</li>
              <li>Customize your wheel with an optional title and 2–20 options.</li>
              <li>Press Spin to start the wheel.</li>
              <li>Wait for the wheel to stop and reveal the randomly chosen option.</li>
              <li>Use Share to send your wheel to someone else if you like.</li>
            </ol>
          </section>
          <section aria-labelledby="wheel-ideas">
            <h2 id="wheel-ideas">Ways to use SparkyWheel</h2>
            <p>Choose what to eat, pick a name, or decide between ideas with a group. A spin-the-wheel tool can also help you choose classroom activities, take turns in games, or pick a winner for a small giveaway. Add each choice once to give it the same chance as every other choice.</p>
          </section>
          <section aria-labelledby="wheel-faq">
            <h2 id="wheel-faq">Frequently asked questions</h2>
            <h3>Is SparkyWheel free?</h3>
            <p>Yes. You can create, spin, and share a wheel for free, without an account.</p>
            <h3>Can I customize the wheel?</h3>
            <p>Yes. Add an optional title, edit the option names, and add or remove options to keep between 2 and 20 choices.</p>
            <h3>Is the wheel random?</h3>
            <p>Yes. Each spin uses your browser&apos;s secure random number generator to select an option. Every entry has an equal chance on each spin, so the same entry can win more than once.</p>
            <h3>Can I share my wheel?</h3>
            <p>Yes. Share creates a link containing your wheel&apos;s title and options. Opening a shared wheel does not replace a visitor&apos;s saved wheel unless they edit its title or options, which makes it their own.</p>
            <h3>Does SparkyWheel work on mobile?</h3>
            <p>Yes. You can edit, spin, and share wheels in a modern browser on your phone, tablet, or desktop.</p>
            <h3>Will my wheel be saved?</h3>
            <p>Your own wheel is saved automatically in this browser when local storage is available. It does not sync across devices, and clearing your browser&apos;s site data removes it. Keep a share link if you want to open the same choices elsewhere.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
