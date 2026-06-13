type Props = { lean?: number; height?: number; danger?: boolean; className?: string; cx?: number; groundY?: number; hangOff?: number; facing?: "toward" | "away" };

// Rear (from-behind) view: we see the rider's BACK and the back of the helmet,
// hands forward on the bars (grips + mirrors poke out each side). Pivots about the contact patch.
export default function BikeRearPro({ lean = 0, height = 150, danger = false, className, cx = 200, groundY = 250, facing = "toward" }: Props) {
  const ho = (Math.abs(lean) / 45) * 16 * Math.sign(lean);
  const headY = groundY - height - 13;
  const barY = groundY - height * 0.7;
  return (
    <svg viewBox="0 0 400 280" className={className} width="100%">
      <g style={{ transformOrigin: `${cx}px ${groundY}px`, transform: `rotate(${lean}deg)` }}>
        {/* rear tyre */}
        <path d={`M ${cx - 13} ${groundY} q 0 ${-height * 0.6} 13 ${-height * 0.6} q 13 0 13 ${height * 0.6} z`} fill="#1a1a1a" />
        <ellipse cx={cx} cy={groundY} rx={14} ry={4.5} fill={danger ? "#e23b3b" : "var(--ink)"} />
        {/* swingarm / hugger + rear number plate + tail light (all face us) */}
        <rect x={cx - 28} y={groundY - height * 0.66} width={56} height={16} rx={6} fill="#2a2a2a" />
        <rect x={cx - 15} y={groundY - height * 0.64} width={30} height={13} rx={2} fill="#eaeaea" />
        <path d={`M ${cx - 24} ${groundY - height * 0.74} h 48 l -6 9 h -36 z`} fill="#d6d6d6" />
        <rect x={cx - 20} y={groundY - height * 0.74} width={40} height={5} rx={2} fill="#e23b3b" />
        {/* subframe up to seat */}
        <path d={`M ${cx - 15} ${groundY - height * 0.92} h 30 l -3 ${height * 0.22} h -24 z`} fill="#1d1d1d" />

        {/* handlebars: a bar across with grips + mirror stalks, behind the rider's hands */}
        <g stroke="#9aa3ad" strokeWidth={4} strokeLinecap="round">
          <line x1={cx - 14} y1={barY} x2={cx - 44} y2={barY - 4} />
          <line x1={cx + 14} y1={barY} x2={cx + 44} y2={barY - 4} />
          {/* mirror stalks angling up/out */}
          <line x1={cx - 40} y1={barY - 3} x2={cx - 50} y2={barY - 16} strokeWidth={3} />
          <line x1={cx + 40} y1={barY - 3} x2={cx + 50} y2={barY - 16} strokeWidth={3} />
        </g>
        <circle cx={cx - 50} cy={barY - 17} r={4.5} fill="#2a2a2a" />
        <circle cx={cx + 50} cy={barY - 17} r={4.5} fill="#2a2a2a" />
        {/* grips (dark) at the bar ends */}
        <rect x={cx - 48} y={barY - 5} width={9} height={9} rx={3} fill="#15161b" />
        <rect x={cx + 39} y={barY - 5} width={9} height={9} rx={3} fill="#15161b" />

        {/* rider, from behind */}
        <g transform={`translate(${ho},0)`}>
          {/* arms reaching down-and-out to the grips */}
          <path d={`M ${cx - 16} ${groundY - height + 18} L ${cx - 42} ${barY - 2}`} stroke="#2c354a" strokeWidth={10} strokeLinecap="round" />
          <path d={`M ${cx + 16} ${groundY - height + 18} L ${cx + 42} ${barY - 2}`} stroke="#2c354a" strokeWidth={10} strokeLinecap="round" />
          {/* back / torso (leathers) */}
          <path d={`M ${cx - 22} ${groundY - height} q 22 -26 44 0 l -5 ${height * 0.34} q -17 10 -34 0 z`} fill="#33373c" stroke="#23262b" strokeWidth={1.5} />
          {/* torso detail: spine seam if we see the back, zip + collar if we see the front */}
          {facing === "away" ? (
            <>
              <line x1={cx} y1={groundY - height - 2} x2={cx} y2={groundY - height * 0.66} stroke="#23262b" strokeWidth={1.5} />
              <path d={`M ${cx - 20} ${groundY - height + 4} q 20 -10 40 0`} fill="none" stroke="#23262b" strokeWidth={1.5} />
            </>
          ) : (
            <>
              <line x1={cx} y1={groundY - height - 4} x2={cx} y2={groundY - height * 0.62} stroke="#1f2937" strokeWidth={2} />
              <path d={`M ${cx - 16} ${groundY - height + 2} l 16 6 l 16 -6`} fill="none" stroke="#1f2937" strokeWidth={2} />
            </>
          )}
          {/* helmet — visor visible = facing you; smooth back = facing away */}
          <circle cx={cx} cy={headY} r={16} fill="#eaeaea" stroke="#c4c4c4" strokeWidth={1.5} />
          {facing === "away" ? (
            <>
              <path d={`M ${cx - 13} ${headY + 2} q 13 6 26 0`} fill="none" stroke="#b4b4b4" strokeWidth={2} />
              <path d={`M ${cx - 6} ${headY - 15} q 6 -3 12 0 l -1 5 q -5 2 -10 0 z`} fill="#cfcfcf" />
            </>
          ) : (
            <>
              {/* prominent dark visor across the front */}
              <path d={`M ${cx - 14} ${headY - 4} q 14 -7 28 0 l 0 11 q -14 7 -28 0 z`} fill="#161e28" stroke="#0c1118" strokeWidth={1} />
              <path d={`M ${cx - 11} ${headY - 3} q 11 -4 22 0`} fill="none" stroke="#4a6786" strokeWidth={2} opacity={0.7} />
              {/* chin bar */}
              <path d={`M ${cx - 12} ${headY + 9} q 12 5 24 0`} fill="none" stroke="#c4c4c4" strokeWidth={3} />
            </>
          )}
        </g>
      </g>
    </svg>
  );
}
