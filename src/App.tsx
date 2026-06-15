import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider, ThemeToggle } from "@/theme";
import { RideProvider, useRide } from "@/sim/RideContext";
import { Hud } from "@/components/Hud";
import { RideControls } from "@/components/RideControls";
import { ConditionsPanel, isDefaultConditions } from "@/components/Conditions";
import { SoundController } from "@/components/SoundController";
import AtRest from "@/sections/AtRest";
import SlowSpeed from "@/sections/SlowSpeed";
import Steering from "@/sections/Steering";
import Cornering from "@/sections/Cornering";
import Braking from "@/sections/Braking";
import Throttle from "@/sections/Throttle";
import TractionCircle from "@/sections/TractionCircle";
import UKTest from "@/sections/UKTest";
import Flashcards from "@/sections/Flashcards";

const tabs = [
  { id: "rest", code: "01", name: "Static", full: "At Rest", el: <AtRest />, ride: false },
  { id: "slow", code: "02", name: "Low-Speed", full: "Slow Speed & Friction Zone", el: <SlowSpeed />, ride: true },
  { id: "steer", code: "03", name: "Steering", full: "Steering Dynamics", el: <Steering />, ride: true },
  { id: "corner", code: "04", name: "Cornering", full: "Cornering & Lean", el: <Cornering />, ride: true },
  { id: "brake", code: "05", name: "Braking", full: "Braking & Transfer", el: <Braking />, ride: true },
  { id: "throttle", code: "06", name: "Drive", full: "Throttle & Traction", el: <Throttle />, ride: true },
  { id: "traction", code: "07", name: "Grip Budget", full: "Traction Circle", el: <TractionCircle />, ride: true },
  { id: "uktest", code: "08", name: "UK Test", full: "UK Mod 1 Manoeuvres", el: <UKTest />, ride: true },
  { id: "cards", code: "09", name: "Flashcards", full: "Flashcards · Revision", el: <Flashcards />, ride: false },
];

function HeaderBtn({ active, onClick, label, dot, children }: { active?: boolean; onClick: () => void; label: string; dot?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label}
      className={`relative flex h-9 items-center gap-1.5 rounded-lg border px-2.5 transition ${active ? "border-transparent bg-foreground text-[hsl(var(--background))]" : "border-border text-muted-foreground hover:text-foreground"}`}>
      {children}
      <span className="hidden label-cap text-[10px] font-semibold sm:inline">{label}</span>
      {dot && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background: "var(--yellow)" }} />}
    </button>
  );
}

function Shell() {
  const [active, setActive] = useState("rest");
  const [panel, setPanel] = useState<null | "about" | "cond">(null);
  const [sound, setSound] = useState(false);
  const { config } = useRide();
  const tab = tabs.find((t) => t.id === active)!;
  const condDirty = !isDefaultConditions(config);

  return (
    <div className="min-h-screen pb-32">
      <SoundController enabled={sound} />
      <header className="sticky top-0 z-20 border-b border-border bg-[hsl(var(--background)/0.85)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--background))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17h7l4-6h-6"/><path d="M14 11l2-3h3"/></svg>
            </div>
            <div className="leading-tight">
              <div className="num text-[15px] tracking-tight text-foreground">MOTODYN<span style={{ color: "#9a9a9a" }}>·</span>SIM</div>
              <div className="hidden label-cap text-[9px] text-muted-foreground sm:block">Real-time Motorcycle Dynamics</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HeaderBtn active={panel === "cond"} dot={condDirty} label="Conditions" onClick={() => setPanel((p) => (p === "cond" ? null : "cond"))}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 14a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.5-1.5A4 4 0 1 1 18 14z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/></svg>
            </HeaderBtn>
            <HeaderBtn active={sound} label="Sound" onClick={() => setSound((v) => !v)}>
              {sound ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>
                     : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>}
            </HeaderBtn>
            <HeaderBtn active={panel === "about"} label="About" onClick={() => setPanel((p) => (p === "about" ? null : "about"))}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/></svg>
            </HeaderBtn>
            <ThemeToggle />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {tabs.map((t) => {
            const on = active === t.id;
            return (
              <button key={t.id} onClick={() => { setActive(t.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`group flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 transition ${on ? "border-transparent bg-foreground text-[hsl(var(--background))]" : "border-border text-muted-foreground hover:text-foreground"}`}>
                <span className={`num text-[10px] ${on ? "opacity-60" : "opacity-40"}`}>{t.code}</span>
                <span className="label-cap text-[11px] font-semibold">{t.name}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5">
        {panel === "about" && (
          <div className="card-flat mb-4 flex items-start gap-3 p-3.5">
            <p className="flex-1 text-[12px] leading-relaxed text-muted-foreground">
              <span className="label-cap mr-1.5 text-foreground">Disclaimer</span>
              Educational real-time simulation — a simplified dynamics model for intuition, not engineering-exact. Concepts from established rider-training and motorcycle-dynamics sources. Ride within your limits and get proper instruction.
            </p>
            <button onClick={() => setPanel(null)} aria-label="Close" className="rounded-md px-2 py-0.5 text-muted-foreground transition hover:text-foreground">✕</button>
          </div>
        )}
        {panel === "cond" && <ConditionsPanel onClose={() => setPanel(null)} />}

        <div className="mb-4 flex items-baseline gap-3">
          <span className="num text-2xl text-muted-foreground/40">{tab.code}</span>
          <h1 className="label-cap text-lg font-bold tracking-tight text-foreground">{tab.full}</h1>
        </div>
        {tab.ride && <Hud />}
        {tab.el}
      </main>

      {tab.ride && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-[hsl(var(--card)/0.92)] backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <p className="mb-2 text-[11px] leading-snug text-muted-foreground"><b className="text-foreground">Ride with the buttons below, or the keyboard.</b> <span className="hidden sm:inline">Right hand: <b className="text-foreground">&uarr;</b> throttle, <b className="text-foreground">&darr;/Space</b> brake &middot; Left hand: <b className="text-foreground">A/D</b> lean, <b className="text-foreground">Q/E</b> gears, <b className="text-foreground">Shift</b> clutch (hold to feather). Gear changes auto-blip the clutch. </span>Turn on <b className="text-foreground">Assist</b> for auto-clutch (no stalling).</p>
            <RideControls />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RideProvider>
        <Shell />
        <Analytics />
      </RideProvider>
    </ThemeProvider>
  );
}
