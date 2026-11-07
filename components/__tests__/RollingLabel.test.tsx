import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { RollingLabel } from "../RollingLabel";

beforeAll(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

describe("RollingLabel", () => {
  it("exposes the label once to assistive technology", () => {
    render(<button><RollingLabel text="Nos gîtes" /></button>);
    expect(screen.getByRole("button", { name: "Nos gîtes" })).toBeInTheDocument();
  });

  it("renders two hidden copies of every character, spaces included", () => {
    const { container } = render(<RollingLabel text="Nos gîtes" />);
    const letters = container.querySelectorAll('[aria-hidden="true"] .roll-letter');
    expect(letters).toHaveLength("Nos gîtes".length);
    expect(letters[3].textContent).toBe("  ");
    expect(letters[4].textContent).toBe("gg");
  });
});
