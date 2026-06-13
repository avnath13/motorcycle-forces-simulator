export function Arrow({ x1, y1, x2, y2, color, width = 3, label, labelDx = 6, labelDy = 0, dash = false }: {
  x1: number; y1: number; x2: number; y2: number; color: string;
  width?: number; label?: string; labelDx?: number; labelDy?: number; dash?: boolean;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 10;
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return null;
  const p1 = [x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42)];
  const p2 = [x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42)];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width}
        strokeLinecap="round" strokeDasharray={dash ? "5 5" : undefined} />
      <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={color} />
      {label && (
        <text x={x2 + labelDx} y={y2 + labelDy} fill={color} fontSize={13}
          fontWeight={600} dominantBaseline="middle">{label}</text>
      )}
    </g>
  );
}

export function Ground({ y, w = 400, x0 = 0 }: { y: number; w?: number; x0?: number }) {
  const ticks = [];
  for (let x = x0; x < x0 + w; x += 16) {
    ticks.push(<line key={x} x1={x} y1={y} x2={x - 7} y2={y + 7} stroke="#2a3340" strokeWidth={1} />);
  }
  return (
    <g>
      <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke="#3a4654" strokeWidth={2} />
      {ticks}
    </g>
  );
}
