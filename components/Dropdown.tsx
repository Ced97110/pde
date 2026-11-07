"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

// Long enough to cross the gap between the label and its panel.
const HOVER_CLOSE_DELAY = 150;

const canHover = (): boolean => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

interface DropdownProps {
  label: ReactNode;
  ariaLabel?: string;
  align?: "left" | "right";
  className?: string;
  summaryClassName?: string;
  // Replaces the default narrow column, for a panel laid out differently.
  panelClassName?: string;
  // Opens on hover with a mouse. Touch screens and keyboards keep the click.
  openOnHover?: boolean;
  children: ReactNode;
}

// Built on <details> so it still opens without JavaScript; the script only adds the ways to close it.
export function Dropdown({
  label,
  ariaLabel,
  align = "right",
  className = "",
  summaryClassName = "",
  panelClassName = "w-48 flex-col gap-1",
  openOnHover = false,
  children,
}: DropdownProps) {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const openedByHover = useRef(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const close = () => {
    openedByHover.current = false;
    if (detailsRef.current) detailsRef.current.open = false;
  };

  const onPointerEnter = () => {
    const details = detailsRef.current;
    if (!openOnHover || !details || !canHover()) return;
    window.clearTimeout(closeTimer.current);
    if (details.open) return;
    details.open = true;
    openedByHover.current = true;
  };

  const onPointerLeave = () => {
    if (!openedByHover.current) return;
    closeTimer.current = window.setTimeout(close, HOVER_CLOSE_DELAY);
  };

  // A click on a menu the pointer already opened keeps it open, instead of toggling it shut.
  const onSummaryClick = (event: MouseEvent) => {
    if (!openedByHover.current) return;
    event.preventDefault();
    openedByHover.current = false;
  };

  // Closes after a navigation only: running on mount would shut a menu opened before hydration.
  const shownPath = useRef(pathname);
  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    close();
  }, [pathname]);

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
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <details
      ref={detailsRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={`dropdown relative ${className}`}
    >
      <summary onClick={onSummaryClick} aria-label={ariaLabel} className={`flex cursor-pointer list-none items-center gap-1.5 py-2 ${summaryClassName}`}>
        {label}
        <svg className="dropdown-chevron" width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
          <path d="M.5.5 4 4 7.5.5" stroke="currentColor" />
        </svg>
      </summary>
      <div
        onClick={close}
        className={`absolute top-full z-10 mt-2 flex rounded border border-line bg-surface p-2 text-foreground shadow-lg ${panelClassName} ${
          align === "left" ? "left-0" : "right-0"
        }`}
      >
        {children}
      </div>
    </details>
  );
}
