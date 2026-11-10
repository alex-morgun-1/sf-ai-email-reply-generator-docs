# AI Email Reply Generator

**Draft high-quality email replies in Salesforce in seconds, in the tone you choose.**

AI Email Reply Generator is a 100% native Salesforce Lightning app. It reads the email
thread on a record, generates a reply draft with the AI provider of your choice, and lets
your team review, edit and send it without leaving Lightning Experience.

The app uses a **Bring Your Own Key (BYOK)** model: you connect your own AI provider
account, and the request goes from your Salesforce org directly to that provider. MDS LLC
runs no servers and never receives your data.

---

## Start here

| Guide | What it covers |
|---|---|
| [Setup Guide](setup.md) | One-time admin setup — install, API key, permission sets, adding the component to your pages |
| [User Guide](user-guide.md) | Day-to-day use — generating a reply, choosing a tone, editing, sending, draft history |
| [FAQ](faq.md) | Providers, cost, what data is sent to the AI, supported editions, languages |
| [Troubleshooting](troubleshooting.md) | Error messages and what to do about them |

New install? Work through the [Setup Guide](setup.md) first — the app will not generate
replies until an AI provider API key is configured.

---

## At a glance

| | |
|---|---|
| **Works on** | Case, and any Lightning record page with email activity |
| **AI providers** | OpenAI, Anthropic, Google, xAI (your own account and key) |
| **Tones** | Professional, Friendly, Empathetic, Formal, Concise, or your own |
| **Editions** | Enterprise, Unlimited, Developer |
| **Requires** | Lightning Experience, and an API key from a supported AI provider |
| **Email sending** | Native Salesforce email — reply text is the only thing the AI provider sees |

---

## Policies

- [Privacy Policy](PRIVACY_POLICY.md) — what data the app handles, and why MDS LLC is not a data processor
- [Security Policy](SECURITY_POLICY.md) — development practices, vulnerability response, and breach response

---

## Support

| | |
|---|---|
| Email | [omorgun@morgunsolutions.com](mailto:omorgun@morgunsolutions.com) |
| Response target | 2 business days |
| Publisher | MDS LLC |

When you write in, it helps to include your Salesforce edition, the AI provider and model
you configured, and the exact error text. [Troubleshooting](troubleshooting.md) lists the
details worth gathering first.
