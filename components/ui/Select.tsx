"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const focusRing =
  "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#de674840]";

export type SelectOption<T extends string | number> = {
  label: string;
  value: T;
};

type SelectProps<T extends string | number> = {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  align?: "left" | "right";
  triggerClassName?: string;
};

export function Select<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  align = "left",
  triggerClassName,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={
          triggerClassName ??
          `flex h-9 items-center justify-between gap-2 rounded-lg border border-[#dcd8d0] bg-white pl-2.5 pr-2 text-xs text-[#383c3b] ${focusRing}`
        }
      >
        <span>{selected?.label ?? value}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 mt-1.5 min-w-full overflow-hidden rounded-lg border border-[#ddd9d1] bg-white py-1 shadow-lg ${align === "right" ? "right-0" : "left-0"}`}
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-xs whitespace-nowrap ${
                  option.value === value ? "font-semibold text-[#292e2d]" : "text-[#5b5e5a]"
                } hover:bg-[#faf9f6]`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
                {option.value === value ? <Check size={13} aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
