export type ShareOutcome = "shared" | "cancelled" | "copied" | "manual";
type ShareBrowser = {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

export async function copyWheelLink(url: string, browser: ShareBrowser): Promise<ShareOutcome> {
  try {
    if (!browser.clipboard?.writeText) return "manual";
    await browser.clipboard.writeText(url);
    return "copied";
  } catch {
    return "manual";
  }
}

export async function shareWheelLink(url: string, title: string, browser: ShareBrowser): Promise<ShareOutcome> {
  try {
    if (typeof browser.share === "function") {
      await browser.share({ title: title.trim() || "SparkyWheel", text: "Give my SparkyWheel a spin!", url });
      return "shared";
    }
  } catch (error) {
    // Dismissing the native sheet is not a failure and must not copy silently.
    if (error instanceof Error && error.name === "AbortError") return "cancelled";
    // Native sharing can be blocked by browser policy; copying can still work.
  }
  return copyWheelLink(url, browser);
}
