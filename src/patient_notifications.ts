import { z } from "zod";
import { infrai } from "./infrai.js";

export const appointmentInput = z.object({
  phone: z.string().min(7),
  patientFirstName: z.string().min(1),
  appointmentId: z.string().min(1),
  startsAt: z.string().datetime(),
  consented: z.literal(true),
});

type Appointment = z.infer<typeof appointmentInput>;
const approvedTemplates = { appointmentReminder: "appointment-reminder-v1" } as const;

export function chooseAppointmentNotification(input: Appointment): { template: string; signature: string; variables: Record<string, string> } | null {
  if (!input.consented) return null;
  return {
    template: approvedTemplates.appointmentReminder,
    signature: "Northstar Health",
    variables: { firstName: input.patientFirstName, appointmentId: input.appointmentId, startsAt: input.startsAt },
  };
}

export async function sendAppointmentReminder(raw: unknown) {
  const input = appointmentInput.parse(raw);
  const message = chooseAppointmentNotification(input);
  if (!message) return { status: "skipped" as const, reason: "consent_required" as const };
  const payload = { messages: [{ to: input.phone, template_vars: message.variables }] };
  const result = await infrai.sms.batch.send(payload);
  return { status: "sent" as const, template: message.template, signature: message.signature, result };
}
