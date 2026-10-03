import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // List only public canonical pages, never shared or customized wheel URLs.
  return [
    { url: "https://sparkywheel.com/" },
    { url: "https://sparkywheel.com/food-wheel" },
    { url: "https://sparkywheel.com/yes-or-no-wheel" },
    { url: "https://sparkywheel.com/drawing-ideas-wheel" },
  ];
}
