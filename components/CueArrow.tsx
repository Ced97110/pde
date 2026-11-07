interface CueArrowProps {
  className: string;
}

// A thin arrow under a gîte's name, pointing to its page. The link is already named after the gîte.
export function CueArrow({ className }: CueArrowProps) {
  return (
    <span className={`cue-arrow block ${className}`} aria-hidden="true">
      <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
        <path d="M0 5h30M26 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </span>
  );
}
