import BikeRearPro from "@/components/BikeRearPro";

// "Behind the rider" view: the same bike + rider (from behind, facing away),
// leaning with you, on the plain diagram stage — no road, so it blends cleanly.
export function FpvView({ leanDeg, steer, speedKmh, phase }: { leanDeg: number; steer: number; speedKmh: number; phase: number }) {
  void steer;
  const moving = speedKmh > 3;
  // subtle perspective guide lines + scrolling ticks to convey forward motion (monochrome)
  const guides = [];
  if (moving) {
    const n = 6;
    const off = (phase * 0.12) % 1;
    for (let i = 0; i < n; i++) {
      const f = (i + off) / n;
      const t = f * f;
      const y = 250 - t * 150;
      const spread = 150 * (1 - t) + 6;
      const op = (0.28 - t * 0.22) * Math.min(1, speedKmh / 30);
      guides.push(<line key={"l" + i} x1={200 - spread} y1={y} x2={200 - spread * 1.04} y2={y - 10} stroke="#8a8a8a" strokeWidth={2} opacity={op} />);
      guides.push(<line key={"r" + i} x1={200 + spread} y1={y} x2={200 + spread * 1.04} y2={y - 10} stroke="#8a8a8a" strokeWidth={2} opacity={op} />);
    }
  }
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 400 280" className="absolute inset-0 h-full w-full">
        {/* faint horizon / vanishing guides, stage-toned */}
        <line x1={40} y1={250} x2={196} y2={104} stroke="#9a9a9a" strokeWidth={1} opacity={0.18} />
        <line x1={360} y1={250} x2={204} y2={104} stroke="#9a9a9a" strokeWidth={1} opacity={0.18} />
        {guides}
      </svg>
      <div className="pointer-events-none absolute left-1/2" style={{ bottom: "-8%", top: "6%", width: "70%", transform: "translateX(-50%)" }}>
        <BikeRearPro lean={leanDeg} height={150} facing="away" />
      </div>
    </div>
  );
}
