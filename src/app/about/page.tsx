import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About SparkyWheel | Free Decision Wheels",
  description: "Meet SparkyWheel, a free browser-based tool for everyday decisions. Discover our story and create, spin, and share wheels without signing up.",
  alternates: { canonical: "https://sparkywheel.com/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand-link" aria-label="SparkyWheel home">
          <Image src="/branding/sparkywheel-logo-header.webp" alt="SparkyWheel" width={576} height={192} className="header-logo" unoptimized />
        </Link>
      </header>
      <main id="main" className={styles.page}>
        <header className={styles.intro}>
          <h1>About SparkyWheel</h1>
          <p>SparkyWheel is an independent project with free decision wheels for everyday choices. Pick something for dinner, choose a classroom activity, or break a tie with friends. Open a wheel in your browser, give it a spin, and see where it lands.</p>
        </header>

        <div className={styles.story}>
          <section>
            <h2>It started with a yes or no</h2>
            <p>SparkyWheel started with a familiar question at home: &quot;What should we do?&quot; When deciding wasn&apos;t easy, a simple idea came to mind: why not let a wheel choose?</p>
            <p>What began as a simple yes-or-no wheel grew into something more. By letting people add their own choices, that little wheel could help with all kinds of everyday decisions.</p>
          </section>
          <section>
            <h2>A little less debating, a little more doing</h2>
            <p>Sometimes you&apos;d be happy with any of the options. You just need one to get started.</p>
            <p>A teacher can spin to choose the class warm-up, students can pick a discussion prompt, and a family can decide what to play on game night.</p>
            <p>Watching the wheel land is half the fun.</p>
          </section>
        </div>

        <section>
          <h2>Pick a wheel or make your own</h2>
          <div className={styles.cards}>
            <div className={styles.card}>
              <h3>Bring your own choices.</h3>
              <p>Create a random wheel with 2–20 options and share a link so someone else can spin it, too.</p>
            </div>
            <div className={styles.card}>
              <h3>Start with a ready-made wheel.</h3>
              <p>Try the <Link href="/food-wheel">Food Wheel</Link> for a meal idea or the <Link href="/yes-or-no-wheel">Yes or No Wheel</Link> for a quick answer.</p>
            </div>
            <div className={styles.card}>
              <h3>Jump right in.</h3>
              <p>No downloads, no accounts, and no complicated setup. Just open a wheel and start spinning on your phone, tablet, or computer.</p>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={styles.next}>
            <h2>What&apos;s next?</h2>
            <p>SparkyWheel is still growing. We&apos;re paying attention to how people use our wheels at home, in classrooms, and with friends.</p>
            <p>Those everyday experiences will help shape the tools we build next and the ways we make SparkyWheel even easier to use.</p>
            <p><strong>Got a choice in mind? Sparky is ready when you are!</strong></p>
          </div>
          <div className={styles.action}>
            <div className={styles.mascot} aria-hidden="true">
              <Image src="/mascots/yes-no/sparky-init.webp" alt="" width={600} height={500} unoptimized />
              {/* The closing copy already conveys Sparky's invitation. */}
              <div className={styles.bubble}>
                <svg viewBox="0 0 300 145" preserveAspectRatio="none" focusable="false">
                  <path d="M150 6C65 3 15 15 14 59L5 83L25 81C43 110 86 127 158 126C253 127 292 109 293 65C296 22 248 6 150 6Z" />
                </svg>
                <strong>Ready when<br />you are!</strong>
              </div>
            </div>
            <Link href="/" className="button button-primary">Spin the wheel</Link>
          </div>
        </section>
      </main>
    </>
  );
}
