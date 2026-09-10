import type { ReactElement } from "react";
import { hexToRgba, shade } from "@/lib/utils";
import type { ArtStyle } from "@/lib/themes";

type ShapeType = "leaf" | "half" | "circle" | "square" | "ring";

interface VariantConfig {
  seed: number;
  weights: Record<ShapeType, number>;
}

interface FormArtPanelProps {
  accent?: string;
  variant?: ArtStyle;
  className?: string;
  cols?: number;
  rows?: number;
}

const U = 100;

// Deterministic PRNG to ensure stable output across renders without flickers.
const rng = (seed: number): (() => number) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const seedFrom = (str: string): number => {
  let s = 0;
  for (let i = 0; i < str.length; i++) {
    s = (s * 31 + str.charCodeAt(i)) >>> 0;
  }
  return s;
};

// Quarter-circle "leaf" (a 90° sector) for each pivot corner of a cell.
const leafPath = (x: number, y: number, pivot: number): string => {
  switch (pivot) {
    case 0:
      return `M ${x} ${y} L ${x + U} ${y} A ${U} ${U} 0 0 1 ${x} ${y + U} Z`;
    case 1:
      return `M ${x + U} ${y} L ${x + U} ${y + U} A ${U} ${U} 0 0 1 ${x} ${y} Z`;
    case 2:
      return `M ${x + U} ${y + U} L ${x} ${y + U} A ${U} ${U} 0 0 1 ${x + U} ${y} Z`;
    default:
      return `M ${x} ${y + U} L ${x} ${y} A ${U} ${U} 0 0 1 ${x + U} ${y + U} Z`;
  }
};

// Half-disc sitting on one edge, bulging into the cell.
const halfPath = (x: number, y: number, edge: number): string => {
  const R = U / 2;
  switch (edge) {
    case 0:
      return `M ${x} ${y + U} A ${R} ${R} 0 0 0 ${x + U} ${y + U} Z`;
    case 1:
      return `M ${x} ${y} A ${R} ${R} 0 0 1 ${x} ${y + U} Z`;
    case 2:
      return `M ${x} ${y} A ${R} ${R} 0 0 1 ${x + U} ${y} Z`;
    default:
      return `M ${x + U} ${y} A ${R} ${R} 0 0 0 ${x + U} ${y + U} Z`;
  }
};

const VARIANTS: Record<ArtStyle, VariantConfig> = {
  arcs: {
    seed: 11,
    weights: { leaf: 3, half: 4, circle: 3, square: 1, ring: 2 },
  },
  fans: {
    seed: 23,
    weights: { leaf: 6, half: 2, circle: 2, square: 1, ring: 1 },
  },
  grid: {
    seed: 31,
    weights: { leaf: 2, half: 2, circle: 2, square: 4, ring: 1 },
  },
  waves: {
    seed: 43,
    weights: { leaf: 3, half: 5, circle: 2, square: 1, ring: 1 },
  },
  blocks: {
    seed: 51,
    weights: { leaf: 2, half: 2, circle: 3, square: 4, ring: 1 },
  },
  scatter: {
    seed: 67,
    weights: { leaf: 3, half: 2, circle: 4, square: 1, ring: 2 },
  },
};

const buildPool = (weights: Record<ShapeType, number>): ShapeType[] => {
  const pool: ShapeType[] = [];
  for (const [shape, n] of Object.entries(weights) as [ShapeType, number][]) {
    for (let i = 0; i < n; i++) {
      pool.push(shape);
    }
  }
  return pool;
};

export const FormArtPanel = ({
  accent = "#0c8b7c",
  variant = "fans",
  className,
  cols = 4,
  rows = 7,
}: FormArtPanelProps) => {
  const v = VARIANTS[variant] || VARIANTS.fans;
  const rand = rng(seedFrom(accent) ^ (v.seed * 2654435761));
  const pool = buildPool(v.weights);

  const tones = [
    hexToRgba(accent, 0.85),
    hexToRgba(accent, 0.55),
    hexToRgba(accent, 0.32),
    hexToRgba(shade(accent, -24), 0.7),
  ];

  const tiles: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * U;
      const y = r * U;
      const shape = pool[Math.floor(rand() * pool.length)];
      const color = tones[Math.floor(rand() * tones.length)];
      const rot = Math.floor(rand() * 4);
      const key = `${r}-${c}`;

      if (shape === "square") {
        tiles.push(
          <rect key={key} x={x} y={y} width={U} height={U} fill={color} />,
        );
      } else if (shape === "circle") {
        tiles.push(
          <circle
            key={key}
            cx={x + U / 2}
            cy={y + U / 2}
            r={U / 2}
            fill={color}
          />,
        );
      } else if (shape === "ring") {
        tiles.push(
          <circle
            key={key}
            cx={x + U / 2}
            cy={y + U / 2}
            r={U / 2 - 9}
            fill="none"
            stroke={color}
            strokeWidth={18}
          />,
        );
      } else if (shape === "half") {
        tiles.push(<path key={key} d={halfPath(x, y, rot)} fill={color} />);
      } else {
        tiles.push(<path key={key} d={leafPath(x, y, rot)} fill={color} />);
      }
    }
  }

  return (
    <div
      className={className}
      style={{ backgroundColor: hexToRgba(accent, 0.05) }}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${cols * U} ${rows * U}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect
          x="0"
          y="0"
          width={cols * U}
          height={rows * U}
          fill={hexToRgba(accent, 0.05)}
        />
        {tiles}
      </svg>
    </div>
  );
};
