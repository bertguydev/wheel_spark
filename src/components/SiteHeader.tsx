import Image from "next/image";
import { ToolsNavigation } from "@/components/ToolsNavigation";

export function SiteHeader({ tool }: { tool?: "food" | "yes-no" | "drawing" }) {
  return (
    <header className="site-header">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Full navigation restores the homepage's saved wheel session. */}
      <a href="/" className="brand-link" aria-label="SparkyWheel home">
        <Image
          src="/branding/sparkywheel-logo-header.webp"
          alt="SparkyWheel — Quirky Sparky beside a colorful wheel"
          width={576}
          height={192}
          sizes="(max-width: 360px) 120px, (max-width: 480px) 144px, 192px"
          preload
          unoptimized
          className="header-logo"
        />
      </a>
      <ToolsNavigation food={tool === "food"} yesNo={tool === "yes-no"} drawing={tool === "drawing"} />
    </header>
  );
}
