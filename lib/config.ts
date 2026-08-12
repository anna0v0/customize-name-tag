export const COLORS = [
  { name: "Ink", value: "#1e1f22" }, { name: "Chalk", value: "#f4f0e7" },
  { name: "Cherry", value: "#dc5047" }, { name: "Sage", value: "#7e9a82" },
  { name: "Sky", value: "#7fa8c9" }, { name: "Marigold", value: "#e0a72e" },
];
export const FONTS = ["Sour Gummy Bold", "Gochi Hand", "Cherry Bomb One", "Darumadrop One", "Permanent Marker", "Jua", "Jaro", "Caveat Brush", "Poppins ExtraBold", "Bungee"] as const;
export type FontId = typeof FONTS[number] | "Block" | "Soft" | "Classic" | "East Sea Dokdo";
export const SPECS = { maxWidth: 80, maxHeight: 30, baseDepth: 3, faceDepth: 2, holeDiameter: 5, targetTextHeight: 16, iconSize: 6.24, minFeature: 0.8, outline: 3, margin: 3 };

export type DesignConfig = {
  name: string; font: FontId; baseColor: string; topColor: string;
  icon: "star" | "heart" | "flower" | "cat" | "paw" | "cloud" | "file" | "thunder" | "upload"; iconDataUrl?: string; iconAssetId?: string;
  iconScale?: number;
  avatarSelection?: import("./avatar").AvatarSelection;
  iconContours?: Array<{group:number;hole:boolean;points:Array<{x:number;y:number}>}>; templateVersion: "1";
};

export function layoutFor(name: string) {
  const safe = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 10) || "NAME";
  const naturalTextWidth = Math.max(11, safe.length * 9.15);
  const fixedWidth = 27;
  const natural = fixedWidth + naturalTextWidth + SPECS.margin * 2;
  const scale = Math.min(1, SPECS.maxWidth / natural);
  return { safe, scale, textHeight: SPECS.targetTextHeight * scale, width: Math.min(SPECS.maxWidth, Math.max(48, natural * scale)), height: 23, minFeature: 1.05 * scale };
}
