import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/content/contact-schema";

const validInput = {
  name: "Marie Dupont",
  email: "marie@example.com",
  phone: "",
  dates: "",
  guests: "4",
  message: "Bonjour, je souhaite réserver Sapotille en juillet.",
  company: "",
};

describe("contactFormSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = contactFormSchema.safeParse({ ...validInput, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("flags a filled-in honeypot field even though the schema itself allows it", () => {
    const result = contactFormSchema.safeParse({ ...validInput, company: "spambot" });
    expect(result.success).toBe(false);
  });

  it("accepts a known gîte and rejects an unknown one", () => {
    expect(contactFormSchema.safeParse({ ...validInput, gite: "carambole" }).success).toBe(true);
    expect(contactFormSchema.safeParse({ ...validInput, gite: "bungalow" }).success).toBe(false);
  });

  it("coerces the guests field from a form string to a number", () => {
    const result = contactFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.guests).toBe(4);
    }
  });
});
