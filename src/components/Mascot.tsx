import Image from "next/image";

export type MascotState = "default" | "celebrating" | "cool" | "nerdy" | "thinking" | "confused" | "peeking" | "sleepy";
type MascotAsset = { src: string; width: number; height: number };
// Register only finalized assets. Empty slots render nothing, not broken images.
const assets: Partial<Record<MascotState, MascotAsset>> = {};

export function Mascot({ state }: { state: MascotState }) {
  const asset = assets[state];
  if (!asset) return null;
  return <Image {...asset} alt="" aria-hidden="true" className="mascot mx-auto" />;
}
