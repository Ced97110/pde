"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { submitContact, type ContactActionState } from "@/app/[locale]/contact/actions";
import type { Dictionary } from "@/content/dictionaries";
import { getUnitBySlug, units } from "@/content/units";

interface ContactFormProps {
  dict: Dictionary["contact"];
  defaultGite?: string;
}

const initialState: ContactActionState = { status: "idle" };
const inputClass =
  "border border-line bg-surface px-3 py-2.5 text-foreground outline-none focus:border-accent";

export function ContactFormFromUrl({ dict }: ContactFormProps) {
  const requested = useSearchParams().get("gite");
  const defaultGite = requested ? getUnitBySlug(requested)?.slug : undefined;

  return <ContactForm key={defaultGite} dict={dict} defaultGite={defaultGite} />;
}

export function ContactForm({ dict, defaultGite = "" }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  // Dispatching by hand stops React resetting the form, so a failed send keeps what the guest typed.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      {/* Honeypot field, hidden from real visitors via CSS. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex flex-col gap-1 sm:col-span-2">
        {dict.giteLabel}
        <select name="gite" defaultValue={defaultGite} className={inputClass}>
          <option value="">{dict.giteAny}</option>
          {units.map((unit) => (
            <option key={unit.slug} value={unit.slug}>
              {unit.name}
            </option>
          ))}
        </select>
      </label>

      <Field label={dict.nameLabel} name="name" type="text" autoComplete="name" required />
      <Field label={dict.emailLabel} name="email" type="email" autoComplete="email" required />
      <Field label={dict.phoneLabel} name="phone" type="tel" autoComplete="tel" />
      <Field label={dict.guestsLabel} name="guests" type="number" min={1} max={20} />
      <div className="sm:col-span-2">
        <Field label={dict.datesLabel} name="dates" type="text" />
      </div>

      <label className="flex flex-col gap-1 sm:col-span-2">
        {dict.messageLabel}
        <textarea name="message" required minLength={10} rows={5} className={inputClass} />
      </label>

      <div className="flex flex-col gap-3 sm:col-span-2">
        <button type="submit" disabled={isPending} className="btn btn-primary self-start disabled:opacity-60">
          {isPending ? dict.submitting : dict.submit}
        </button>

        {state.status === "success" && (
          <p className="bg-persienne/10 px-4 py-3 text-persienne" role="status">
            {dict.success}
          </p>
        )}
        {state.status === "error" && (
          <p className="bg-accent/10 px-4 py-3 text-accent" role="alert">
            {dict.error}
          </p>
        )}
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  autoComplete?: string;
}

function Field({ label, ...input }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      {label}
      <input {...input} className={inputClass} />
    </label>
  );
}
