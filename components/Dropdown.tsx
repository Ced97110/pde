"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

interface DropdownProps {
  label: ReactNode;
  ariaLabel?: string;
  align?: "left" | "right";
  className?: string;
  summaryClassName?: string;
  children: ReactNode;
}

// Built on <details> so it still opens without JavaScript; the script only adds the ways to close it.
export function Dropdown({ label, ariaLabel, align = "right", className = "", summaryClassName = "", children }: DropdownProps) {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  useEffect(close, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !detailsRef.current?.open) return;
      close();
      detailsRef.current.querySelector("summary")?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={detailsRef} className={`dropdown relative ${className}`}>
      <summary aria-label={ariaLabel} className={`flex cursor-pointer list-none items-center gap-1.5 py-2 ${summaryClassName}`}>
        {label}
        <svg className="dropdown-chevron" width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
          <path d="M.5.5 4 4 7.5.5" stroke="currentColor" />
        </svg>
      </summary>
      <div
        onClick={close}
        className={`absolute top-full z-10 mt-2 flex w-48 flex-col gap-1 rounded border border-line bg-surface p-2 text-foreground shadow-lg ${
          align === "left" ? "left-0" : "right-0"
        }`}
      >
        {children}
      </div>
    </details>
  );
}
