export const COLORS = [
  { name: "Ink", value: "#111111" }, { name: "Chalk", value: "#FFFFFF" },
  { name: "Cherry", value: "#dc5047" }, { name: "Sage", value: "#7e9a82" },
  { name: "Sky", value: "#7fa8c9" }, { name: "Marigold", value: "#e0a72e" },
];
export const FONTS = ["Sour Gummy Bold", "Gochi Hand", "Cherry Bomb One", "Darumadrop One", "Permanent Marker", "Jua", "Jaro", "Caveat Brush", "Poppins ExtraBold", "Bungee"] as const;
export type FontId = typeof FONTS[number] | "Block" | "Soft" | "Classic" | "East Sea Dokdo";
export const SPECS = { maxWidth: 80, maxHeight: 30, baseDepth: 3, faceDepth: 2, holeDiameter: 5, ringCenterX: 2.1, ringWall: 1.6, ringIconGap: 1.2, iconTextGap: 2.2, targetTextHeight: 16, iconSize: 6.24, minFeature: 0.8, outline: 3, margin: 3 };

export type DesignConfig = {
  name: string; font: FontId; baseColor: string; topColor: string;
  icon: "star" | "heart" | "flower" | "cat" | "paw" | "cloud" | "file" | "thunder" | "bow-tie" | "crown" | "upload"; iconDataUrl?: string; iconAssetId?: string;
  iconScale?: number;
  avatarSelection?: import("./avatar").AvatarSelection;
  iconContours?: Array<{group:number;hole:boolean;points:Array<{x:number;y:number}>}>; templateVersion: "1";
};

export function iconPlacement(iconScale = 1) {
  const safeScale = Math.min(1.5, Math.max(0.7, iconScale));
  const radius = SPECS.iconSize * safeScale;
  const iconLeft = SPECS.ringCenterX + SPECS.holeDiameter / 2 + SPECS.ringWall + SPECS.ringIconGap;
  return {
    scale: safeScale,
    centerX: iconLeft + radius,
    textX: iconLeft + radius * 2 + SPECS.iconTextGap,
  };
}

export function layoutFor(name: string, iconScale = 1) {
  const safe = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 10) || "NAME";
  const placement = iconPlacement(iconScale);
  const naturalTextWidth = Math.max(11, safe.length * 9.15);
  const fixedWidth = placement.textX + 4;
  const natural = fixedWidth + naturalTextWidth + SPECS.margin * 2;
  const scale = Math.min(1, SPECS.maxWidth / natural);
  return { safe, scale, textHeight: SPECS.targetTextHeight * scale, width: Math.min(SPECS.maxWidth, Math.max(48, natural * scale)), height: 23, minFeature: 1.05 * scale };
}
