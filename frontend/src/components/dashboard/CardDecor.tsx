import type { ReactElement } from "react";

type DecorVariant = "a" | "b" | "c" | "d" | "e" | "hero";

interface FanProps {
  cx: number;
  cy: number;
  max: number;
  bands: number;
  from?: number;
  to?: number;
  color: string;
  base?: number;
  min?: number;
}

interface CardDecorProps {
  variant?: DecorVariant;
  color?: string;
  className?: string;
}

interface ShapeConfig {
  bands: number;
  max: number;
}

const rad = (deg: number): number => (deg * Math.PI) / 180;

const pt = (
  cx: number,
  cy: number,
  r: number,
  deg: number,
): [number, number] => [
  cx + r * Math.cos(rad(deg)),
  cy + r * Math.sin(rad(deg)),
];

// Concentric striped rings (annular sectors), fading inner→outer.
const Fan = ({
  cx,
  cy,
  max,
  bands,
  from = 180,
  to = 270,
  color,
  base = 0.85,
  min = 0.3,
}: FanProps) => {
  const step = max / bands;
  const out: ReactElement[] = [];

  for (let i = 0; i < bands; i++) {
    const ri = step * i;
    const ro = step * (i + 1);
    const [ax, ay] = pt(cx, cy, ri, from);
    const [bx, by] = pt(cx, cy, ro, from);
    const [ex, ey] = pt(cx, cy, ro, to);
    const [dx, dy] = pt(cx, cy, ri, to);

    const d =
      ri === 0
        ? `M ${cx} ${cy} L ${bx} ${by} A ${ro} ${ro} 0 0 1 ${ex} ${ey} Z`
        : `M ${ax} ${ay} L ${bx} ${by} A ${ro} ${ro} 0 0 1 ${ex} ${ey} L ${dx} ${dy} A ${ri} ${ri} 0 0 0 ${ax} ${ay} Z`;

    const t = bands > 1 ? i / (bands - 1) : 0;
    const opacity = base - t * (base - min);
    out.push(<path key={i} d={d} fill={color} opacity={opacity} />);
  }

  return <g>{out}</g>;
};

// Per-variant band count and radius for subtle variety across cards.
const SHAPES: Record<Exclude<DecorVariant, "hero">, ShapeConfig> = {
  a: { bands: 5, max: 116 },
  b: { bands: 6, max: 128 },
  c: { bands: 4, max: 104 },
  d: { bands: 5, max: 120 },
  e: { bands: 7, max: 132 },
};

export const CardDecor = ({
  variant = "a",
  color = "#bfa23a",
  className,
}: CardDecorProps) => {
  const svg = {
    className,
    viewBox: "0 0 170 170",
    width: "170",
    height: "170",
  };
  const C = 170;

  if (variant === "hero") {
    return (
      <svg {...svg}>
        <Fan
          cx={C}
          cy={C}
          max={124}
          bands={6}
          color="#ffffff"
          base={0.22}
          min={0.05}
        />
      </svg>
    );
  }

  const { bands, max } = SHAPES[variant] || SHAPES.a;

  return (
    <svg {...svg}>
      <Fan cx={C} cy={C} max={max} bands={bands} color={color} />
    </svg>
  );
};
