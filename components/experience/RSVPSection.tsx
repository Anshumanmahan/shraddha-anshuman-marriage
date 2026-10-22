"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CornerFlourish, Divider, LotusCrest } from "@/components/motifs/Ornaments";
import { AvatarGuide } from "@/components/ui/AvatarGuide";
import { Reveal } from "@/components/ui/Reveal";
import { EASE_SILK, scaleIn } from "@/lib/motion";
import {
  RSVPError,
  hasRepliedLocally,
  submitRSVP,
  validateRSVP,
  type Attendance,
  type RSVPErrors,
} from "@/lib/rsvp";
import { weddingConfig } from "@/wedding.config";
import { cn } from "@/lib/cn";

/* ==================================================================
   RSVP
   A request from the couple, not a form to be filled. Three steps —
   answer, details, thank you — with the fewest fields that still let
   the family plan.

   Every network detail lives behind submitRSVP() in lib/rsvp.ts.
   ================================================================== */

type Step = "choose" | "form" | "done";

const { rsvp } = weddingConfig;

const EMPTY = { name: "", guests: 1, phone: "", message: "" };

export function RSVPSection() {
  const [step, setStep] = useState<Step>("choose");
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<RSVPErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  /* Whether this browser has replied before is external state that never
     changes mid-session, and is unknowable on the server — which is
     exactly what useSyncExternalStore is for. An effect here would just
     be a cascading render. */
  const repliedBefore = useSyncExternalStore(
    () => () => {},
    hasRepliedLocally,
    () => false,
  );

  /* Move focus with the guest, so keyboard and screen-reader users are
     not left behind on the step that just disappeared. */
  useEffect(() => {
    if (step === "form") nameRef.current?.focus();
    if (step === "done") doneRef.current?.focus();
  }, [step]);

  const choose = (choice: Attendance) => {
    setAttendance(choice);
    setErrors({});
    setSubmitError(null);
    setStep("form");
  };

  const attending = attendance === "yes";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const payload = {
      name: values.name,
      attendance,
      guests: attending ? values.guests : undefined,
      phone: attending ? values.phone : undefined,
      message: values.message,
    };

    const found = validateRSVP(payload, rsvp.maxGuests);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      nameRef.current?.form
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await submitRSVP(payload);
      setStep("done");
    } catch (error) {
      setSubmitError(
        error instanceof RSVPError
          ? error.message
          : "Something went wrong. Please try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-heading"
      className="ground-deep grain grain-dark vignette relative overflow-hidden px-5 py-24 sm:px-8 md:py-32"
    >
      <div className="relative z-[2] mx-auto flex max-w-2xl flex-col items-center">
        <AvatarGuide who="both" tone="light" size="sm" className="mb-9" />

        <Reveal as="span" className="eyebrow text-gold-soft/75">
          An Invitation to You
        </Reveal>

        <Reveal delay={0.08}>
          <h2
            id="rsvp-heading"
            className="display mt-5 text-center text-[clamp(2rem,8.5vw,3.4rem)] leading-tight text-gold-pale"
          >
            {rsvp.heading}
          </h2>
        </Reveal>

        <Reveal delay={0.14} className="mt-6 w-full max-w-[220px]">
          <Divider tone="var(--color-gold-soft)" className="w-full opacity-80" />
        </Reveal>

        <Reveal
          as="p"
          delay={0.2}
          className="mt-6 max-w-[42ch] text-center text-[0.98rem] leading-relaxed text-gold-pale/75"
        >
          {rsvp.subheading}
        </Reveal>

        {/* ---- The card ---- */}
        <Reveal variants={scaleIn} delay={0.26} className="mt-12 w-full">
          <div className="frame-gold relative rounded-[2px] bg-ivory px-5 py-10 shadow-[0_50px_100px_-60px_rgba(0,0,0,0.85)] sm:px-10 sm:py-12">
            <CornerFlourish className="absolute left-3 top-3 h-10 w-10 opacity-50" />
            <CornerFlourish className="absolute right-3 top-3 h-10 w-10 -scale-x-100 opacity-50" />
            <CornerFlourish className="absolute bottom-3 left-3 h-10 w-10 -scale-y-100 opacity-50" />
            <CornerFlourish className="absolute bottom-3 right-3 h-10 w-10 -scale-100 opacity-50" />

            <AnimatePresence mode="wait" initial={false}>
              {step === "choose" && (
                <Panel key="choose">
                  <h3 className="display text-center text-[clamp(1.4rem,6vw,2rem)] text-burgundy">
                    Will you be joining us?
                  </h3>

                  {repliedBefore && (
                    <p className="mt-4 text-center text-[0.82rem] text-ink-faint">
                      You have already replied from this device. Sending another
                      reply is perfectly fine if something has changed.
                    </p>
                  )}

                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => choose("yes")}
                    >
                      Yes, I&rsquo;ll Be There
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => choose("no")}
                    >
                      Sorry, I Can&rsquo;t Make It
                    </button>
                  </div>
                </Panel>
              )}

              {step === "form" && (
                <Panel key="form">
                  <form onSubmit={onSubmit} noValidate>
                    <fieldset disabled={submitting} className="contents">
                      <legend className="sr-only">
                        {attending
                          ? "Your details for attending"
                          : "Let us know you cannot attend"}
                      </legend>

                      <p className="display text-center text-[clamp(1.3rem,5.5vw,1.85rem)] text-burgundy">
                        {attending
                          ? "Wonderful — tell us who to expect."
                          : "We will miss you."}
                      </p>

                      <div className="mt-9 flex flex-col gap-6">
                        <Field
                          id="rsvp-name"
                          label="Your Name"
                          error={errors.name}
                        >
                          <input
                            ref={nameRef}
                            id="rsvp-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            className="field"
                            placeholder="Full name"
                            value={values.name}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={
                              errors.name ? "rsvp-name-error" : undefined
                            }
                            onChange={(e) =>
                              setValues((v) => ({ ...v, name: e.target.value }))
                            }
                          />
                        </Field>

                        {attending && (
                          <div className="grid gap-6 sm:grid-cols-2">
                            <Field
                              id="rsvp-guests"
                              label="Number of Guests"
                              error={errors.guests}
                            >
                              <select
                                id="rsvp-guests"
                                name="guests"
                                className="field"
                                value={values.guests}
                                aria-invalid={Boolean(errors.guests)}
                                aria-describedby={
                                  errors.guests ? "rsvp-guests-error" : undefined
                                }
                                onChange={(e) =>
                                  setValues((v) => ({
                                    ...v,
                                    guests: Number(e.target.value),
                                  }))
                                }
                              >
                                {Array.from(
                                  { length: rsvp.maxGuests },
                                  (_, i) => i + 1,
                                ).map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </Field>

                            <Field
                              id="rsvp-phone"
                              label="Phone Number"
                              error={errors.phone}
                            >
                              <input
                                id="rsvp-phone"
                                name="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                className="field"
                                placeholder="+91 00000 00000"
                                value={values.phone}
                                aria-invalid={Boolean(errors.phone)}
                                aria-describedby={
                                  errors.phone ? "rsvp-phone-error" : undefined
                                }
                                onChange={(e) =>
                                  setValues((v) => ({
                                    ...v,
                                    phone: e.target.value,
                                  }))
                                }
                              />
                            </Field>
                          </div>
                        )}

                        <Field
                          id="rsvp-message"
                          label="A Note for Us (Optional)"
                          error={errors.message}
                        >
                          <textarea
                            id="rsvp-message"
                            name="message"
                            rows={3}
                            className="field resize-y"
                            placeholder="Anything you would like us to know"
                            value={values.message}
                            aria-invalid={Boolean(errors.message)}
                            aria-describedby={
                              errors.message ? "rsvp-message-error" : undefined
                            }
                            onChange={(e) =>
                              setValues((v) => ({
                                ...v,
                                message: e.target.value,
                              }))
                            }
                          />
                        </Field>
                      </div>

                      {submitError && (
                        <p
                          role="alert"
                          className="mt-6 rounded-[2px] border border-maroon/40 bg-maroon/8 px-4 py-3 text-center text-[0.88rem] text-maroon"
                        >
                          {submitError}
                        </p>
                      )}

                      <div className="mt-9 flex flex-col items-center gap-4">
                        <button type="submit" className="btn w-full sm:w-auto">
                          {submitting ? "Sending…" : "Send My Reply"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep("choose")}
                          className="eyebrow text-ink-faint underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
                        >
                          Change my answer
                        </button>
                      </div>
                    </fieldset>
                  </form>
                </Panel>
              )}

              {step === "done" && (
                <Panel key="done">
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ duration: 1, ease: EASE_SILK, delay: 0.1 }}
                    >
                      <LotusCrest className="h-12 w-20 opacity-90" />
                    </motion.div>

                    <p
                      ref={doneRef}
                      tabIndex={-1}
                      className="display mt-6 text-[clamp(1.9rem,8vw,2.8rem)] text-burgundy outline-none"
                    >
                      Thank You
                    </p>

                    <div className="mt-6 w-full max-w-[180px]">
                      <Divider className="w-full opacity-75" />
                    </div>

                    <p
                      aria-live="polite"
                      className="mt-6 max-w-[34ch] text-[1rem] leading-relaxed text-ink-soft"
                    >
                      {attending
                        ? "Your reply is with us. We look forward to celebrating together."
                        : "Thank you for letting us know. You will be in our thoughts on the day."}
                    </p>

                    <p className="display mt-8 text-[1.1rem] italic text-gold-deep">
                      {weddingConfig.groom.name} &amp; {weddingConfig.bride.name}
                    </p>
                  </div>
                </Panel>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        {rsvp.contactPhone && (
          <Reveal as="p" delay={0.3} className="mt-8 text-center text-[0.85rem] text-gold-pale/60">
            Prefer to call? {rsvp.contactPhone}
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: EASE_SILK }}
    >
      {children}
    </motion.div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={cn("field-error")}>
          {error}
        </p>
      )}
    </div>
  );
}
