import { validLabels, type WheelState } from "./wheel.ts";

// This version is independent of the localStorage schema.
export type SharePayloadV1 = { v: 1; t: string; o: string[] };
export const SHARE_PARAMETER = "wheel";
export const MAX_SHARE_TITLE_LENGTH = 200; // UTF-16 code units, like HTML maxlength.
export const MAX_ENCODED_SHARE_LENGTH = 6_000; // At most 4,500 bytes of decoded JSON.

export function isSharePayload(value: unknown): value is SharePayloadV1 {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return "v" in value && value.v === 1
    && "t" in value && typeof value.t === "string" && value.t.length <= MAX_SHARE_TITLE_LENGTH
    && "o" in value && validLabels(value.o);
}

export function toSharePayload(wheel: WheelState): SharePayloadV1 {
  // Explicit allowlist: IDs, storage metadata and session state never travel.
  return { v: 1, t: wheel.title, o: wheel.options.map(({ label }) => label) };
}

export function fromSharePayload(payload: SharePayloadV1): WheelState {
  return { title: payload.t, options: payload.o.map((label, id) => ({ id, label })) };
}

export type EncodedWheel = { ok: true; data: string } | { ok: false; message: string };

export function encodeWheel(wheel: WheelState): EncodedWheel {
  if (wheel.title.length > MAX_SHARE_TITLE_LENGTH) {
    return { ok: false, message: `Use a title of ${MAX_SHARE_TITLE_LENGTH} characters or fewer to share this wheel.` };
  }
  const payload = toSharePayload(wheel);
  if (!isSharePayload(payload)) {
    return { ok: false, message: "Give each of your 2–20 options a name before sharing." };
  }
  if (payload.t.length + payload.o.reduce((total, label) => total + label.length, 0) > MAX_ENCODED_SHARE_LENGTH) return tooLarge();
  const json = JSON.stringify(payload);
  // Bound work before UTF-8 conversion as well as after encoding.
  if (json.length > MAX_ENCODED_SHARE_LENGTH) return tooLarge();
  const bytes = new TextEncoder().encode(json);
  if (bytes.length > MAX_ENCODED_SHARE_LENGTH * 3 / 4) return tooLarge();
  const data = btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return data.length <= MAX_ENCODED_SHARE_LENGTH ? { ok: true, data } : tooLarge();
}

function tooLarge(): EncodedWheel {
  return { ok: false, message: "This wheel is too long for a share link. Shorten the title or option names and try again." };
}

export function decodeWheel(data: string): WheelState | null {
  // Check size BEFORE decoding or parsing untrusted input.
  if (!data || data.length > MAX_ENCODED_SHARE_LENGTH || !/^[A-Za-z0-9_-]+$/.test(data) || data.length % 4 === 1) return null;
  try {
    const base64 = data.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(base64);
    // Reject noncanonical encodings, including invalid padding bits.
    if (btoa(binary).replace(/=+$/, "") !== base64) return null;
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return isSharePayload(payload) ? fromSharePayload(payload) : null;
  } catch {
    return null;
  }
}

export function sharedWheelFromUrl(href: string): WheelState | null {
  try {
    const url = new URL(href);
    // Bound raw query size before URLSearchParams performs percent decoding.
    if (url.search.length > MAX_ENCODED_SHARE_LENGTH + 1024) return null;
    const values = url.searchParams.getAll(SHARE_PARAMETER);
    return values.length === 1 ? decodeWheel(values[0]) : null;
  } catch {
    return null;
  }
}

export function createShareUrl(wheel: WheelState, currentHref: string): { ok: true; url: string } | { ok: false; message: string } {
  const encoded = encodeWheel(wheel);
  if (!encoded.ok) return encoded;
  try {
    const url = new URL(currentHref);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Unsupported URL");
    url.search = "";
    url.hash = "";
    url.searchParams.set(SHARE_PARAMETER, encoded.data);
    return { ok: true, url: url.href };
  } catch {
    return { ok: false, message: "A share link isn’t available here. Please open SparkyWheel in your browser and try again." };
  }
}

export function withoutSharedWheel(href: string): string {
  const url = new URL(href);
  if (!url.searchParams.has(SHARE_PARAMETER)) return href;
  url.searchParams.delete(SHARE_PARAMETER);
  return url.href;
}
