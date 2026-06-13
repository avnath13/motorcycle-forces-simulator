import { useState } from "react";
import BikeRearPro from "@/components/BikeRearPro";
import BikeSidePro from "@/components/BikeSidePro";
import { Arrow } from "@/components/Arrow";
import { Ctrl } from "@/components/Ctrl";
import { Gauge } from "@/components/Gauge";
import { StageFrame, GaugeRow, Tile, Chip, Deck, Heading, Note , TryThis } from "@/components/Sim";
import { staticLoads, deg } from "@/lib/physics";

export default function AtRest() {
  const [cog, setCog] = useState(75);
  const [bias, setBias] = useState(50);
  const [lean, setLean] = useState(0);
  const [mass, setMass] = useState(250);

  const rear = { x: 76, y: 152 }, front = { x: 308, y: 152 }, L = front.x - rear.x, gy = 198;
  const frontFrac = bias / 100;
  const cogX = rear.x + frontFrac * L;
  const cogY = gy - (cog / 120) * 92 - 8;
  const { W, Nf, Nr } = staticLoads(mass, frontFrac * L, L);
  const hPx = (cog / 120) * 150 + 40;
  const tipDeg = deg(Math.atan2(22, hPx));
  const margin = tipDeg - lean;
  const danger = margin <= 0;
  const tone = margin > 8 ? "good" : margin > 0 ? "warn" : "bad";
  const balTxt = margin > 8 ? "Stable" : margin > 0 ? "Near tipping" : "Toppling";
  const cgx = 200 + Math.sin((lean * Math.PI) / 180) * hPx;
  const cgy = 250 - Math.cos((lean * Math.PI) / 180) * hPx;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <GaugeRow>
          <Gauge value={(Nf / W) * 100} max={100} label="Front load" unit="%" />
          <Gauge value={(Nr / W) * 100} max={100} label="Rear load" unit="%" color="#8a8a8a" />
          <Gauge value={lean} max={35} label="Lean" unit="deg" redlineFrom={tipDeg} color={danger ? "#e23b3b" : "hsl(var(--primary))"} />
        </GaugeRow>
        <StageFrame label="Side · weight distribution" aspect="384 / 224">
          <div className="relative h-full w-full">
            <BikeSidePro className="absolute inset-0" />
            <svg viewBox="0 0 384 224" className="absolute inset-0 h-full w-full">
              <Arrow x1={cogX} y1={cogY} x2={cogX} y2={cogY + 74} color="#111111" label="W" />
              <Arrow x1={front.x} y1={gy} x2={front.x} y2={gy - (Nf / W) * 78} color="#8a8a8a" label="Nf" labelDy={-4} />
              <Arrow x1={rear.x} y1={gy} x2={rear.x} y2={gy - (Nr / W) * 78} color="#8a8a8a" label="Nr" labelDy={-4} />
              <circle cx={cogX} cy={cogY} r={6} fill="#111111" />
              <text x={cogX + 9} y={cogY - 6} fill="#111111" fontSize={12} fontWeight={700}>CoG</text>
            </svg>
          </div>
        </StageFrame>
        <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
          <StageFrame label="Rear · balance" aspect="400 / 280">
            <div className="relative h-full w-full">
              <BikeRearPro lean={lean} height={hPx} danger={danger} className="absolute inset-0" />
              <svg viewBox="0 0 400 280" className="absolute inset-0 h-full w-full">
                <line x1={178} y1={250} x2={222} y2={250} stroke="#b59000" strokeWidth={4} strokeLinecap="round" />
                <Arrow x1={cgx} y1={cgy} x2={cgx} y2={cgy + 56} color="#111111" />
                <line x1={cgx} y1={cgy} x2={cgx} y2={250} stroke="#7a7a7a" strokeWidth={1} strokeDasharray="4 4" />
                <text x={200} y={22} textAnchor="middle" fill="#7a7a7a" fontSize={12} className="font-mono">tips @ ~{tipDeg.toFixed(0)}°</text>
              </svg>
            </div>
          </StageFrame>
          <div className="grid grid-cols-2 content-start gap-2">
            <Tile label="Front" value={Math.round(Nf) + "N"} />
            <Tile label="Rear" value={Math.round(Nr) + "N"} />
            <Tile label="Total W" value={Math.round(W) + "N"} />
            <Tile label="Status" value={<Chip tone={tone}>{balTxt}</Chip>} />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Heading kicker="Module 01 · Statics" title="At rest: a balancing act">
          Standing still, two forces dominate. Weight pulls the mass down through the centre of gravity; the ground pushes up through the two contact patches. They cancel — but must also balance like a see-saw.
        </Heading>
        <TryThis>Raise <b className="text-foreground">CoG height</b> and increase <b className="text-foreground">Lean</b> — the bike topples at a smaller angle (the lean redline drops). Then slide <b className="text-foreground">weight position</b> toward the front and watch the front-wheel load gauge climb.</TryThis>
        <Deck title="Inputs">
          <Ctrl label="Centre-of-gravity height" value={cog} min={30} max={120} step={1} unit=" cm" onChange={setCog} hint="Raises or lowers the centre of mass. Higher = the bike topples at a smaller lean angle." />
          <Ctrl label="Weight position (rear → front)" value={bias} min={20} max={80} step={1} unit=" % front" onChange={setBias} hint="Shifts load between the wheels. Toward the front loads the front tyre more." />
          <Ctrl label="Lean from vertical" value={lean} min={0} max={35} step={1} unit="°" onChange={setLean} hint="Tilts the bike sideways. Past the tip angle the centre of mass leaves the contact patch and it falls." />
          <Ctrl label="Bike + rider mass" value={mass} min={150} max={400} step={5} unit=" kg" onChange={setMass} hint="Total weight. Scales both wheel loads up or down." />
        </Deck>
        <Deck title="Read-out">
          <Note>Most bikes carry slightly more weight on the front. Luggage or a pillion shifts the CoG up and back, raising the balance point so the bike feels top-heavy at a standstill. The higher the CoG, the smaller the lean needed to topple — watch the lean redline drop as you raise it.</Note>
        </Deck>
      </div>
    </div>
  );
}
