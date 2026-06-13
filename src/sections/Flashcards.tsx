import { useState } from "react";
import { DECKS } from "@/data/flashcards";
import { Heading } from "@/components/Sim";

function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function Flashcards() {
  const [deckIdx, setDeckIdx] = useState(0);
  const deck = DECKS[deckIdx];
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: deck.cards.length }, (_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  function reset(i: number, shuf = false) {
    setOrder(shuf ? shuffled(DECKS[i].cards.length) : Array.from({ length: DECKS[i].cards.length }, (_, k) => k));
    setPos(0); setFlipped(false); setKnown(new Set());
  }
  function selectDeck(i: number) { setDeckIdx(i); reset(i); }
  function advance() { setFlipped(false); setPos((p) => p + 1); }
  function grade(isKnown: boolean) {
    if (isKnown) setKnown((s) => new Set(s).add(order[pos]));
    advance();
  }

  const n = order.length;
  const done = pos >= n;
  const card = !done ? deck.cards[order[pos]] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Heading kicker="Revision" title="Flashcards">
        Pick a module, flip each card, and grade yourself. A quick way to lock in the key ideas before the test.
      </Heading>

      <div className="flex flex-wrap gap-1.5">
        {DECKS.map((d, i) => (
          <button key={d.id} onClick={() => selectDeck(i)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${i === deckIdx ? "border-transparent bg-foreground text-[hsl(var(--background))]" : "border-border text-muted-foreground hover:text-foreground"}`}>
            <span className={i === deckIdx ? "opacity-60" : "opacity-40"}>{d.code}</span>{d.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <span className="label-cap">{done ? "Deck complete" : `Card ${pos + 1} / ${n}`}</span>
        <span className="num">{known.size} known</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--hair)" }}>
        <div className="h-full rounded-full" style={{ width: `${(Math.min(pos, n) / n) * 100}%`, background: "var(--yellow)", transition: "width .25s" }} />
      </div>

      {done ? (
        <div className="card-flat flex flex-col items-center gap-3 p-8 text-center">
          <div className="num text-4xl text-foreground">{known.size} / {n}</div>
          <div className="text-sm text-muted-foreground">cards you knew in <b className="text-foreground">{deck.name}</b></div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => reset(deckIdx)} className="rounded-full bg-foreground px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[hsl(var(--background))]">Restart deck</button>
            <button onClick={() => reset(deckIdx, true)} className="rounded-full border border-border px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground">Shuffle &amp; restart</button>
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => setFlipped((f) => !f)} className="block w-full text-left" style={{ perspective: "1200px" }} aria-label="Flip card">
            <div className="relative w-full" style={{ minHeight: 240, transformStyle: "preserve-3d", transition: "transform .5s", transform: flipped ? "rotateY(180deg)" : "none" }}>
              {/* front — question */}
              <div className="card-flat absolute inset-0 flex flex-col justify-between p-6" style={{ backfaceVisibility: "hidden" }}>
                <span className="eyebrow text-muted-foreground">{deck.code} · {deck.name} · Question</span>
                <p className="text-[19px] font-semibold leading-snug text-foreground">{card!.q}</p>
                <span className="label-cap text-[10px] text-muted-foreground">tap to reveal the answer</span>
              </div>
              {/* back — answer */}
              <div className="absolute inset-0 flex flex-col justify-between rounded-[18px] border p-6" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "var(--yellow)", borderColor: "var(--yellow)" }}>
                <span className="eyebrow" style={{ color: "#5c5400" }}>Answer</span>
                <p className="text-[16px] font-medium leading-relaxed" style={{ color: "#111" }}>{card!.a}</p>
                <span className="label-cap text-[10px]" style={{ color: "#5c5400" }}>tap to flip back</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => { setFlipped(false); setPos((p) => Math.max(0, p - 1)); }} disabled={pos === 0}
              className="rounded-full border border-border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition enabled:hover:text-foreground disabled:opacity-40">Prev</button>
            <button onClick={() => reset(deckIdx, true)} className="rounded-full border border-border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition hover:text-foreground">Shuffle</button>
            <div className="ml-auto flex gap-2">
              <button onClick={() => grade(false)} className="rounded-full border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition hover:text-foreground">Review again</button>
              <button onClick={() => grade(true)} className="rounded-full bg-foreground px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--background))] transition active:scale-95">Got it ✓</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
