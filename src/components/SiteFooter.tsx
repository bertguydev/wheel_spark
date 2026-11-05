import Link from "next/link";
import Image from "next/image";

const links = [{ href: "/privacy-policy", label: "Privacy Policy" }];

export function SiteFooter() {
  return <footer className="site-footer" aria-label="Site footer">
    <div className="site-footer-inner">
      <div>
        <Link href="/" className="brand-link" aria-label="SparkyWheel home">
          <Image src="/branding/sparkywheel-logo-header.webp" alt="SparkyWheel" width={576} height={192} className="header-logo" unoptimized />
        </Link>
        <p>Making everyday decisions a little more fun.</p>
      </div>
      <nav aria-label="Footer">{links.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <small>© {new Date().getFullYear()} SparkyWheel</small>
    </div>
  </footer>;
}
