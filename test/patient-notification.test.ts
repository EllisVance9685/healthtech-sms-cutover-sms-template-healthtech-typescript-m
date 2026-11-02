import test from "node:test";
import assert from "node:assert/strict";
import { chooseAppointmentNotification } from "../src/patient_notifications.js";

test("a consented appointment selects the approved reminder and signature", () => {
  const decision = chooseAppointmentNotification({ phone: "+8613800138000", patientFirstName: "Mina", appointmentId: "apt-204", startsAt: "2026-11-04T09:30:00.000Z", consented: true });
  assert.deepEqual(decision, { template: "appointment-reminder-v1", signature: "Northstar Health", variables: { firstName: "Mina", appointmentId: "apt-204", startsAt: "2026-11-04T09:30:00.000Z" } });
});
