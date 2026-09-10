import type { CSSProperties } from "react";

export const CHART = {
  teal: "#0c8b7c",
  tealLight: "#34b8a3",
  tealDark: "#0b6f63",
  gold: "#c79235",
  goldLight: "#e0b765",
  slate: "#64748b",
  slateLight: "#9aa6b8",
  ink: "#334155",
} as const;

export const CHART_PALETTE: readonly string[] = [
  CHART.teal,
  CHART.gold,
  CHART.slate,
  CHART.tealLight,
  CHART.tealDark,
  CHART.goldLight,
  "#b45309",
  CHART.slateLight,
];

export const tooltipStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 12px 40px -8px rgba(16,24,40,0.22)",
};

export interface DeviceInfo {
  browser: "Edge" | "Chrome" | "Firefox" | "Safari" | "Other";
  os: "Windows" | "macOS" | "Android" | "iOS" | "Linux" | "Other";
}

export function deviceFromUA(ua: string = ""): DeviceInfo {
  const browser: DeviceInfo["browser"] = /Edg/.test(ua)
    ? "Edge"
    : /Chrome/.test(ua)
      ? "Chrome"
      : /Firefox/.test(ua)
        ? "Firefox"
        : /Safari/.test(ua)
          ? "Safari"
          : "Other";

  const os: DeviceInfo["os"] = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iOS/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Other";

  return { browser, os };
}
