import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class names, resolving Tailwind conflicts.
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

// Human-friendly relative time, e.g. "3 hours ago".
export const timeAgo = (date: string | number | Date): string => {
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const units: readonly [string, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }

  return "just now";
};

// Format seconds as "1m 30s".
export const formatDuration = (seconds: number = 0): string => {
  if (!seconds) return "0s";

  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);

  return m ? `${m}m ${s}s` : `${s}s`;
};

// Format Date
export const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Profile Initials e.g. John Doe => JD
export const initials = (name: string = ""): string => {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Convert a #rrggbb (or #rgb) hex to an rgba() string.
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  if (typeof hex !== "string") return `rgba(99,102,241,${alpha})`;

  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");

  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return `rgba(99,102,241,${alpha})`;

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Lighten (positive) or darken (negative) a hex color by a percentage.
export const shade = (hex: string, percent: number = -15): string => {
  if (typeof hex !== "string") return hex;

  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");

  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return hex;

  const amt = Math.round(2.55 * percent);
  const clamp = (v: number): number => Math.max(0, Math.min(255, v));

  const r = clamp(((num >> 16) & 255) + amt);
  const g = clamp(((num >> 8) & 255) + amt);
  const b = clamp((num & 255) + amt);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Trigger a browser download for a text blob.
export const downloadBlob = (
  content: BlobPart,
  filename: string,
  type: string = "text/plain",
): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
