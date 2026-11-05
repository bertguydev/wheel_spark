import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { privacySections } from "@/lib/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy | SparkyWheel",
  description: "How SparkyWheel handles wheel entries, browser storage, shared links and hosting information, and the choices available to you.",
  alternates: { canonical: "https://sparkywheel.com/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicy() {
  return <main id="main" className="privacy-page">
    <Link href="/" className="brand-link" aria-label="SparkyWheel home">
      <Image src="/branding/sparkywheel-logo-header.webp" alt="SparkyWheel" width={576} height={192} className="header-logo" unoptimized />
    </Link>
    <article>
      <h1>Privacy Policy</h1>
      <p className="privacy-effective">Effective date: <time dateTime="2026-11-05">November 5, 2026</time>.</p>
      {privacySections.map(([title, text]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{text.split(/(privacy@sparkywheel\.com|https:\/\/www\.cloudflare\.com\/privacypolicy\/)/).map((part, index) => {
            if (part === "privacy@sparkywheel.com") return <a key={index} href={`mailto:${part}`}>{part}</a>;
            if (part === "https://www.cloudflare.com/privacypolicy/") return <a key={index} href={part}>Cloudflare Privacy Policy</a>;
            return part;
          })}</p>
        </section>
      ))}
    </article>
  </main>;
}
