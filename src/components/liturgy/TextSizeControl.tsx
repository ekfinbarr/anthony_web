import { useCallback, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [0.9, 1, 1.12, 1.25, 1.4];
const STORAGE_KEY = "liturgy-text-scale";

/** Reading text size, remembered on this device (handy on a phone during Mass). */
export function useTextScale() {
  const [index, setIndex] = useState(() => {
    const saved = Number(typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : NaN);
    return Number.isInteger(saved) && saved >= 0 && saved < STEPS.length ? saved : 1;
  });

  const change = useCallback((delta: number) => {
    setIndex((current) => {
      const next = Math.min(STEPS.length - 1, Math.max(0, current + delta));
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return {
    scale: STEPS[index],
    canDecrease: index > 0,
    canIncrease: index < STEPS.length - 1,
    decrease: () => change(-1),
    increase: () => change(1),
  };
}

type Props = ReturnType<typeof useTextScale> & { className?: string };

const TextSizeControl = ({ canDecrease, canIncrease, decrease, increase, className }: Props) => (
  <div
    role="group"
    aria-label="Text size"
    className={cn("inline-flex items-center rounded-full border border-church-charcoal/15 bg-white p-0.5 shadow-sm", className)}
  >
    <button
      type="button"
      onClick={decrease}
      disabled={!canDecrease}
      aria-label="Smaller text"
      className="flex h-8 w-8 items-center justify-center rounded-full text-church-charcoal/70 transition-colors hover:bg-church-stone disabled:opacity-30"
    >
      <Minus className="h-3.5 w-3.5" />
    </button>
    <span className="px-1 font-serif text-sm font-semibold text-church-charcoal/70" aria-hidden="true">
      Aa
    </span>
    <button
      type="button"
      onClick={increase}
      disabled={!canIncrease}
      aria-label="Larger text"
      className="flex h-8 w-8 items-center justify-center rounded-full text-church-charcoal/70 transition-colors hover:bg-church-stone disabled:opacity-30"
    >
      <Plus className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default TextSizeControl;
