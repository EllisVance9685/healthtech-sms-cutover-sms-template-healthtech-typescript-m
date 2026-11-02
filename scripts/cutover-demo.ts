import { sendAppointmentReminder } from "../src/patient_notifications.js";

const phone = process.env.DEMO_PHONE;
if (!phone) throw new Error("DEMO_PHONE is required");
const result = await sendAppointmentReminder({ phone, patientFirstName: "Mina", appointmentId: "apt-204", startsAt: "2026-11-04T09:30:00.000Z", consented: true });
console.log(JSON.stringify(result, null, 2));
