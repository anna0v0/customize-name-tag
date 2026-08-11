export const COLORS = [
  { name: "Ink", value: "#1e1f22" }, { name: "Chalk", value: "#f4f0e7" },
  { name: "Cherry", value: "#dc5047" }, { name: "Sage", value: "#7e9a82" },
  { name: "Sky", value: "#7fa8c9" }, { name: "Marigold", value: "#e0a72e" },
];
export const FONTS = ["Gochi Hand", "Block", "Soft", "Classic", "Permanent Marker", "Jua", "Jaro", "Poppins ExtraBold"] as const;
export const SPECS = { maxWidth: 80, maxHeight: 30, baseDepth: 3, faceDepth: 2, holeDiameter: 5, targetTextHeight: 16, minFeature: 0.8, outline: 3.5, margin: 3.5 };

export type DesignConfig = {
  name: string; font: typeof FONTS[number]; baseColor: string; topColor: string;
  icon: "star" | "heart" | "flower" | "upload"; iconDataUrl?: string; templateVersion: "1";
};

export function layoutFor(name: string) {
  const safe = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 10) || "NAME";
  const naturalTextWidth = Math.max(11, safe.length * 9.15);
  const fixedWidth = 27;
  const natural = fixedWidth + naturalTextWidth + SPECS.margin * 2;
  const scale = Math.min(1, SPECS.maxWidth / natural);
  return { safe, scale, textHeight: SPECS.targetTextHeight * scale, width: Math.min(SPECS.maxWidth, Math.max(48, natural * scale)), height: 23, minFeature: 1.05 * scale };
}
