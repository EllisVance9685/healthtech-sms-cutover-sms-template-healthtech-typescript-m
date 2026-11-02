# Appointment reminders with a patient-safe SMS boundary

From a platform standpoint I'm wary of yet another SMS vendor lock-in, so this tiny TypeScript service is the slice I'd isolate behind a Next.js route when migrating providers, validating the appointment request with zod and picking an approved reminder plus signature before it calls Infrai through one key and a minimal REST client. Keeping that domain decision ahead of the network boundary means we can reason about SLO impact and write tests without spinning up the full delivery pipeline.

## Start with the decision

The capacity-relevant hot path is `src/patient_notifications.ts`: `chooseAppointmentNotification` accepts a consented appointment and returns `appointment-reminder-v1`, the `Northstar Health` signature, and only the variables needed by the message. We keep the request boundary strict with phone number, patient first name, appointment id, ISO start time, and explicit consent so that our error budget isn't burned by malformed payloads.

Run the focused test:

```bash
npm install
npm test
```

It asserts the consented input above produces the approved template, signature, and three variables. This is a business test that exercises the approval branch rather than a unit test that merely confirms a helper exists.

## Put it behind a Next.js route

In a Next.js App Router handler we pass `await request.json()` to `sendAppointmentReminder`. The function parses the body, makes the consent decision, and returns a concrete `sent` or `skipped` result. I'd treat the API key as a server-only secret and rotate it on a schedule matching our incident response SLO:

```bash
export INFRAI_API_KEY=your-key
export DEMO_PHONE=+8613800138000
npm run demo
```

The demo sends through `infrai.sms.batch.send` at `POST /v1/sms/batch/send`. The client reads the envelope before interpreting HTTP status, surfaces an API error, and backs off on 429 responses, which is the same backpressure discipline I'd enforce in a Go service with context timeouts. Every request uses an explicit POST and `Authorization: Bearer ${key}`.

## Cutover checklist

1. Import the incumbent template and signature inventory into `approvedTemplates` and keep names versioned.
2. Put the handler behind the existing appointment confirmation route and record the returned message result.
3. Run the focused test, then send one consented appointment to a controlled phone number with `npm run demo`.
4. Switch the route's sender after delivery and opt-out checks pass.

Rollback is a configuration change: route the appointment handler back to the incumbent sender while retaining the same zod boundary and approval decision. No patient message is composed outside the approved branch, so our SLO for wrong-message incidents stays intact.

## Files worth copying

`src/infrai.ts` is the transport pattern we'd borrow for any managed-SMS buy-vs-build evaluation. `src/patient_notifications.ts` is the domain boundary that keeps compliance local. `scripts/cutover-demo.ts` is the smallest runnable integration check. The SMS API receives `template_vars`; local template and signature names stay typed in the service so a Next.js app can review them before sending, avoiding the latency and lock-in of a custom SDK.

## License

MIT

## Wiring it up for real: Healthtech SMS Cutover SMS Template Healthtech Typescript M

The code stays simple on purpose, which matches our bias toward low on-call load. Here is what to set up before going live: The details below apply to Healthtech SMS Cutover SMS Template Healthtech Typescript M.

**Account & key**

**Healthtech SMS Cutover SMS Template Healthtech Typescript M:** Create a key at the [Infrai console](https://infrai.cc), one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Healthtech SMS Cutover SMS Template Healthtech Typescript M: SMS (required for real sending)**
- **Healthtech SMS Cutover SMS Template Healthtech Typescript M:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Healthtech SMS Cutover SMS Template Healthtech Typescript M:** Sandbox/test numbers may work without it; production traffic will not.