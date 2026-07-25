import { INTEGRATIONS } from "@/lib/integrations";

export default function Orbit() {
  const n = INTEGRATIONS.length;
  const radius = 130;
  return (
    <div className="relative h-80 w-80">
      <div className="absolute inset-8 rounded-full border border-black/5" />
      <div className="absolute inset-16 rounded-full border border-black/5" />
      <div className="absolute inset-0 animate-[spin_28s_linear_infinite]">
        {INTEGRATIONS.map((it, i) => {
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div
              key={it.id}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
            >
              <div className="animate-[spin_28s_linear_infinite_reverse]">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${it.className}`}
                  title={it.label}
                >
                  {it.letter}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
      </div>
    </div>
  );
}
