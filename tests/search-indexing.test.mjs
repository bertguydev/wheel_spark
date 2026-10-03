import test from "node:test";
import assert from "node:assert/strict";
import sitemap from "../src/app/sitemap.ts";
import robots from "../src/app/robots.ts";

const urls = [
  "https://sparkywheel.com/",
  "https://sparkywheel.com/food-wheel",
  "https://sparkywheel.com/yes-or-no-wheel",
  "https://sparkywheel.com/drawing-ideas-wheel",
];

test("sitemap lists exactly the public canonical tool URLs", () => {
  assert.deepEqual(sitemap().map(entry => entry.url), urls);
});

test("robots allows normal crawling and advertises the production sitemap", () => {
  assert.deepEqual(robots(), {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://sparkywheel.com/sitemap.xml",
  });
});

test("built indexing endpoints serialize correctly and every listed page is indexable", { skip: !process.env.SPARKYWHEEL_TEST_URL }, async () => {
  const base = process.env.SPARKYWHEEL_TEST_URL;
  const response = await fetch(new URL("/sitemap.xml", base));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/xml/);
  const xml = await response.text();
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.ok(xml.trim().endsWith("</urlset>"));
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(locations, urls);
  assert.equal((xml.match(/<url>/g) ?? []).length, urls.length);

  const robotsResponse = await fetch(new URL("/robots.txt", base));
  assert.equal(robotsResponse.status, 200);
  assert.match(robotsResponse.headers.get("content-type"), /text\/plain/);
  assert.equal((await robotsResponse.text()).replaceAll("\r\n", "\n").trim(), "User-Agent: *\nAllow: /\n\nSitemap: https://sparkywheel.com/sitemap.xml");

  for (const url of locations) {
    const page = await fetch(new URL(new URL(url).pathname, base), { redirect: "manual" });
    assert.equal(page.status, 200, url);
    assert.doesNotMatch(page.headers.get("x-robots-tag") ?? "", /noindex/i);
    const html = await page.text();
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    assert.ok(canonical, url);
    // Next serializes the origin-only canonical without a trailing slash.
    assert.equal(new URL(canonical[1]).href, url);
    assert.match(html, /<meta name="robots" content="index, follow"/);
  }
});
