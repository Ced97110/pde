"use server";

import { contactFormSchema } from "@/content/contact-schema";
import { sendContactEmail } from "@/lib/email";

export interface ContactActionState {
  status: "idle" | "success" | "error";
}

export async function submitContact(
  _previousState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactFormSchema.safeParse({
    gite: formData.get("gite") ?? "",
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    dates: formData.get("dates"),
    guests: formData.get("guests") || undefined,
    message: formData.get("message"),
    company: formData.get("company"),
  });

  if (!parsed.success || parsed.data.company) {
    return { status: "error" };
  }

  try {
    await sendContactEmail(parsed.data);
    return { status: "success" };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact form submission failed:", reason);
    return { status: "error" };
  }
}
