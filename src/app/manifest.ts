import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SparkyWheel",
    short_name: "SparkyWheel",
    start_url: "/",
    display: "browser",
    background_color: "#fcf7ee",
    theme_color: "#fcf7ee",
    icons: [
      { src: "/branding/sparkywheel-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/branding/sparkywheel-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
