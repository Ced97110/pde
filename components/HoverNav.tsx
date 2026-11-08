"use client";

import { useRef, type PointerEvent, type FocusEvent, type ReactNode } from "react";

interface HoverNavProps {
  className?: string;
  children: ReactNode;
}

// Each direct child is a tab: a thin line glides under the label of the one the pointer or focus is on.
export function HoverNav({ className = "", children }: HoverNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  const moveTo = (target: EventTarget) => {
    const nav = navRef.current;
    const line = lineRef.current;
    if (!nav || !line || !(target instanceof Element)) return;
    const tab = [...nav.children].find((child) => child !== line && child.contains(target));
    const label = tab?.querySelector(".roll");
    if (!label) return;

    const navBox = nav.getBoundingClientRect();
    const box = label.getBoundingClientRect();
    const wasHidden = line.dataset.visible !== "true";
    // Appears in place under the first tab reached, then glides between the next ones.
    if (wasHidden) line.style.transitionProperty = "opacity";
    line.style.setProperty("--line-x", `${box.left - navBox.left}px`);
    line.style.setProperty("--line-width", `${box.width}px`);
    line.dataset.visible = "true";
    if (wasHidden) {
      void line.offsetWidth;
      line.style.transitionProperty = "";
    }
  };

  const hide = () => {
    if (lineRef.current) lineRef.current.dataset.visible = "false";
  };

  const onPointerOver = (event: PointerEvent) => moveTo(event.target);
  const onFocus = (event: FocusEvent) => moveTo(event.target);
  const onBlur = (event: FocusEvent) => {
    if (!navRef.current?.contains(event.relatedTarget as Node | null)) hide();
  };

  return (
    <nav
      ref={navRef}
      onPointerOver={onPointerOver}
      onPointerLeave={hide}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`relative ${className}`}
    >
      {children}
      <span ref={lineRef} className="nav-line" data-visible="false" aria-hidden="true" />
    </nav>
  );
}
