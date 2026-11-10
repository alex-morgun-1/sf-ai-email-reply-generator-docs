---
layout: default
title: "User Guide"
---

[← Documentation home](./)

# User Guide

For anyone replying to customer email in Salesforce. No setup needed on your side — your
administrator does that once (see the [Setup Guide](setup)).

---

## What the app does

On a record with email activity, the **AI Email Reply Generator** card reads the email
thread, drafts a reply in the tone you pick, and lets you edit it before it goes out.
You are always the one who sends. Nothing is sent automatically.

---

## Generating a reply

### 1. Open the record

Go to the Case (or other record) you want to reply to. Find the **AI Email Reply
Generator** card on the page.

The card loads the most recent inbound email for that record on its own and shows you a
preview: subject, who it is from, who it was addressed to, and how many messages are in
the thread. Check that this is the email you meant to reply to.

If you see *"No inbound emails found for this record"*, there is no inbound email on the
record yet. Click **Enter Email ID manually**, paste an Email Message Id, and click
**Load Email**.

### 2. Pick a tone

Click one of the tone buttons:

| Tone | Good for |
|---|---|
| **Professional** | The default. Neutral business register, safe for most replies. |
| **Friendly** | Warm and conversational — existing relationships, good news. |
| **Empathetic** | Complaints, outages, anything where the customer is frustrated. |
| **Formal** | Contractual, legal or escalated correspondence. |
| **Concise** | Short, direct answers. Confirmations and quick facts. |
| **Custom** | Describe the tone yourself in the box that appears, e.g. "apologetic but firm on policy". |

If you skip this, the default tone your administrator configured is used.

### 3. Pick a prompt template (if offered)

A **Prompt Template** picker appears when your administrator has published more than one.
Templates shape the whole reply, not just its tone — for example **Support Reply** aims
at resolving an issue, while **Sales Reply** aims at moving a deal forward. One is marked
**(Default)**.

### 4. Acknowledge the data disclosure

The first time, a **Data Disclosure** banner names exactly what will be sent to the AI
provider — the message body, plus any of subject, sender name, recipient role and
timestamps your administrator has chosen to include. Click **I Understand, Proceed**.

### 5. Click Generate Reply

The draft appears in an editor below, usually within a few seconds. Longer threads take
longer.

---

## Editing and sending

### Edit the draft

The draft is fully editable rich text. Treat it as a first draft, not a final one — read
it before it goes out. Check in particular:

- **Facts and figures.** Dates, amounts, order numbers and policy details can be wrong or
  invented. The AI only sees the email thread, not your systems.
- **Promises.** Delete anything committing to a date, refund or outcome you have not
  confirmed.
- **Who it is addressed to.** The draft should be written to the customer.
- **Names and greetings.**

### Send

Click **Send Reply**. The reply is saved and sent as a normal Salesforce email, as a reply
on the existing thread, and you get a *"Reply sent successfully!"* confirmation. The card
then clears, ready for the next one.

The AI provider is used **only** to write the text. Sending is done entirely by
Salesforce — the provider is not involved at send time and never sees the sent message.

### Discard

**Discard** clears the editor and your tone choice so you can start over. It does not
unsend anything, and it does not delete a draft record already saved in Salesforce.

### Regenerate

Not happy with a draft? Change the tone or template and click **Generate Reply** again.
The editor is replaced with the new draft, so copy anything you want to keep first.

---

## Draft history

Every generated draft is stored in Salesforce as an **AI Email Reply Draft** record, with
the tone used, the provider and model that produced it, the original text, your edited
text, and a status of **Draft**, **Saved**, **Sent** or **Discarded**.

That means your edits are recorded alongside the original AI output. If your organisation
reviews email quality, this is where to look. Ask your administrator if you need access to
these records.

---

## Good practice

- **Read every draft before sending.** The AI has no access to your order, billing or
  account systems and will sometimes write a confident sentence that is simply wrong.
- **Don't use it for the hardest messages.** Legal notices, terminations, security
  incidents and anything requiring precise liability wording are worth writing yourself.
- **Reply on the record, not from your mail client**, so the thread and the draft history
  stay together.
- **Tell your admin when drafts are consistently off.** Reply quality is mostly a function
  of the prompt template, and templates are editable.

---

## When something goes wrong

| What you see | What it means |
|---|---|
| **Access Not Available** | You have not been assigned the **AI Email Reply User** permission set. Ask your administrator. |
| *AI provider is not configured* | Setup is not finished. This is an administrator task. |
| *No inbound emails found for this record* | No inbound email on this record — use **Enter Email ID manually**. |
| *Unable to generate reply* | Usually a provider or connection problem. Retry once, then tell your administrator. |

Full list, with the admin-side fix for each: [Troubleshooting](troubleshooting).

---

Questions about cost, providers or what data leaves your org: [FAQ](faq).
