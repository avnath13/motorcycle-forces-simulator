export function Ctrl({ label, value, min, max, step, unit = "", onChange, fmt, hint }: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; onChange: (v: number) => void; fmt?: (v: number) => string; hint?: string;
}) {
  return (
    <div className="my-3.5">
      <div className="mb-2 flex justify-between text-[12px]">
        <span className="label-cap text-muted-foreground">{label}</span>
        <span className="num text-foreground">{fmt ? fmt(value) : value}{unit}</span>
      </div>
      <input type="range" className="mono-range w-full" value={value} min={min} max={max} step={step}
        onChange={(e) => onChange(+e.target.value)} />
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
      {items.map(([c, l]) => (
        <span key={l} className="flex items-center gap-1.5">
          <i className="inline-block h-[3px] w-3.5 rounded" style={{ background: c }} />{l}
        </span>
      ))}
    </div>
  );
}
