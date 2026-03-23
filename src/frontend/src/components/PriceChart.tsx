import type { PriceStat } from "../backend";

interface PriceChartProps {
  data: PriceStat[];
}

export function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const prices = sorted.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const width = 320;
  const height = 100;
  const padX = 8;
  const padY = 10;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = sorted.map((d, i) => {
    const x = padX + (i / (sorted.length - 1 || 1)) * chartW;
    const y = padY + chartH - ((d.price - minPrice) / priceRange) * chartH;
    return { x, y, year: Number(d.year), price: d.price };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = [
    `M ${points[0].x} ${height - padY}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${height - padY}`,
    "Z",
  ].join(" ");

  const formatPrice = (p: number) =>
    p >= 1000000
      ? `$${(p / 1000000).toFixed(1)}M`
      : `$${Math.round(p / 1000)}K`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-24"
        role="img"
        aria-label="Price history chart"
      >
        <title>Price history chart</title>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.54 0.08 205)"
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor="oklch(0.54 0.08 205)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="oklch(0.54 0.08 205)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <circle
            key={p.year}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="oklch(0.54 0.08 205)"
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        {points.map((p) => (
          <span key={p.year}>{p.year}</span>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatPrice(minPrice)}</span>
        <span>{formatPrice(maxPrice)}</span>
      </div>
    </div>
  );
}
