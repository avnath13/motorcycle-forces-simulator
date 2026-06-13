type Props = { dive?: number; squat?: number; pitch?: number; motion?: number; throttle?: number; brake?: number; className?: string };

function Wheel({ x, y, r }: { x: number; y: number; r: number }) {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72 + 15) * Math.PI) / 180;
    return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * (r - 15)} y2={y + Math.sin(a) * (r - 15)} stroke="#b8b8b8" strokeWidth={3.5} strokeLinecap="round" />;
  });
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#1a1a1a" />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#000" strokeWidth={1.5} />
      <circle cx={x} cy={y} r={r - 13} fill="#e8e8e8" />
      <circle cx={x} cy={y} r={r - 13} fill="none" stroke="#c9c9c9" strokeWidth={1} />
      {spokes}
      <circle cx={x} cy={y} r={6} fill="#2b2b2b" />
    </g>
  );
}

// faces right (front wheel on the right) — axles match section overlay coords
export default function BikeSidePro({ dive = 0, squat = 0, pitch = 0, motion = 0, brake = 0, className }: Props) {
  const R = 46;
  const rear = { x: 76, y: 152 }, front = { x: 308, y: 152 };
  const d = dive * 14, s = squat * 7;
  const head = { x: 268, y: 70 + d };
  return (
    <svg viewBox="0 0 384 224" className={className} width="100%">
      <ellipse cx={192} cy={203} rx={170} ry={7} fill="#000" opacity={0.06} />
      {motion > 0 && <g opacity={Math.min(1, motion)}>
        {[120, 150, 180].map((y, i) => <line key={i} x1={6 - i * 4} y1={y} x2={40 + motion * 26} y2={y} stroke="#9a9a9a" strokeWidth={2.5} strokeLinecap="round" opacity={0.5 - i * 0.12} />)}
      </g>}
      <g style={{ transformOrigin: `${rear.x}px ${rear.y}px`, transform: `rotate(${-pitch}deg)` }}>
        {/* swingarm */}
        <polygon points={`${rear.x},${rear.y - 4 + s} 150,${rear.y - 14 + s} 152,${rear.y - 6 + s} ${rear.x},${rear.y + 4 + s}`} fill="#2c2c2c" />
        {/* motor / battery */}
        <polygon points="150,128 206,128 200,164 158,164" fill="#262626" />
        {[166, 178, 190].map((mx) => <line key={mx} x1={mx} y1={134} x2={mx} y2={158} stroke="#3d3d3d" strokeWidth={2} />)}
        {/* main beam */}
        <polygon points="142,128 232,108 238,120 168,140" fill="#cdcdcd" />
        {/* tail rising (rear-left) */}
        <polygon points="60,108 132,120 138,132 78,140 64,128" fill="#e6e6e6" />
        <polygon points="60,108 74,116 70,128 64,128" fill="#d2d2d2" />
        <rect x={56} y={110} width={9} height={6} rx={1} fill="#e23b3b" />
        {/* seat */}
        <polygon points="132,120 152,118 144,134 126,134" fill="#1d1d1d" />
        <polygon points="78,128 132,120 132,128 84,138" fill="#1d1d1d" />
        {/* tank (toward front/right) */}
        <polygon points="168,140 232,108 270,116 262,138 196,150 172,148" fill="#efefef" />
        <polygon points="192,132 240,116 262,120 214,134" fill="#f6f6f6" />
        {/* USD forks (front-right, raked) */}
        <line x1={head.x} y1={head.y} x2={front.x} y2={front.y - d} stroke="#2a2a2a" strokeWidth={7} strokeLinecap="round" />
        <line x1={head.x - 8} y1={head.y + 2} x2={front.x - 8} y2={front.y - d} stroke="#454545" strokeWidth={4} strokeLinecap="round" />
        {/* headlight cowl upper-right */}
        <polygon points={`${head.x},${head.y} ${head.x + 18},${head.y - 14} ${head.x + 30},${head.y} ${head.x + 14},${head.y + 12}`} fill="#dcdcdc" />
        <circle cx={head.x + 22} cy={head.y - 2} r={4.5} fill="#2a2a2a" />
        {/* handlebar: clip-on with grip the rider holds + a mirror */}
        <line x1={head.x} y1={head.y + 1} x2={head.x - 26} y2={head.y - 7} stroke="#9aa3ad" strokeWidth={4.5} strokeLinecap="round" />
        <rect x={head.x - 35} y={head.y - 12} width={13} height={9} rx={3} fill="#15161b" />
        <line x1={head.x - 10} y1={head.y - 4} x2={head.x - 5} y2={head.y - 20} stroke="#9aa3ad" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={head.x - 4} cy={head.y - 22} r={4} fill="#2a2a2a" />
        {/* brake disc hint on front */}
        {brake > 0 ? <circle cx={front.x} cy={front.y - d} r={R - 22} fill="none" stroke="#e23b3b" strokeWidth={2} opacity={0.4 + brake * 0.5} /> : null}
        {/* front mudguard */}
        <path d={`M${front.x - 14} ${front.y - 26 - d} q 16 -7 30 0`} fill="none" stroke="#1f1f1f" strokeWidth={6} strokeLinecap="round" />
        <g style={{ transform: `translateY(${-d}px)` }}><Wheel x={front.x} y={front.y} r={R} /></g>
      </g>
      <Wheel x={rear.x} y={rear.y} r={R} />
    </svg>
  );
}
