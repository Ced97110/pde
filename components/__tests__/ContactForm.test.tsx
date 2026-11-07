import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactForm } from "@/components/ContactForm";
import { fr } from "@/content/dictionaries/fr";

vi.mock("@/app/[locale]/contact/actions", () => ({
  submitContact: vi.fn(async (state: unknown) => state),
}));

describe("ContactForm", () => {
  it("renders every field from the dictionary", () => {
    render(<ContactForm dict={fr.contact} />);

    expect(screen.getByLabelText(fr.contact.nameLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(fr.contact.emailLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(fr.contact.messageLabel)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: fr.contact.submit })).toBeInTheDocument();
  });

  it("marks the name, email and message fields as required", () => {
    render(<ContactForm dict={fr.contact} />);

    expect(screen.getByLabelText(fr.contact.nameLabel)).toBeRequired();
    expect(screen.getByLabelText(fr.contact.emailLabel)).toBeRequired();
    expect(screen.getByLabelText(fr.contact.messageLabel)).toBeRequired();
  });
});
