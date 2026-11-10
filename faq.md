[← Documentation home](./)

# Frequently Asked Questions

---

## The basics

### What does the app do?

It reads the email thread on a Salesforce record, generates a reply draft in a tone you
choose, and lets you edit it before sending. You always review and send; nothing goes out
automatically.

### What does it cost?

The app is **free** — unlimited replies, all tones, unlimited prompt templates, and
support, at $0.

You pay your AI provider directly for the API usage, under your own account with them.
There is no billing relationship with MDS LLC and no usage cap imposed by the app.

### Which Salesforce editions are supported?

Enterprise, Unlimited and Developer, with Lightning Experience enabled.

### Does it work in Salesforce Classic?

No. The app is built from Lightning Web Components and requires Lightning Experience.

### Does it work on mobile?

Yes — it is Lightning mobile compatible, on record pages in the Salesforce mobile app.

### Which objects does it work on?

Any Lightning record page that has email activity. Cases are the primary use case. It can
also be placed on a Home or App page, where you supply an Email Message Id manually.

---

## AI providers and keys

### Which AI providers are supported?

OpenAI, Anthropic, Google and xAI. You bring your own account and API key for one of them.
Azure OpenAI and self-hosted OpenAI-compatible endpoints can also work, since the callout
goes through a standard Salesforce Named Credential.

### Which models does it use by default?

| Provider | Default model |
|---|---|
| OpenAI | `gpt-4o` |
| Anthropic | `claude-haiku-4-5` |
| Google | `gemini-2.5-flash` |
| xAI | `grok-3-fast` |

Your administrator can set any model identifier your provider account can call.

### Can I use more than one provider at once?

No. One **AI Reply Config** record is active at a time, so the whole org uses one provider
and model. You can switch at any time by activating a different config record.

### Why do I need my own API key? Why not buy AI from you?

The BYOK model means your email content goes from your org straight to a provider you
already have a contract with, under your own terms, pricing and data-retention settings.
MDS LLC operates no infrastructure in the path, so there is no vendor in the middle to
trust, audit or breach.

### Where is my API key stored?

In a Salesforce **External Credential**, encrypted and managed by Salesforce. It is never
stored in the package's code or metadata, never logged, and the app cannot read it back —
Salesforce injects it into the outbound request. See the [Setup Guide](setup.md).

### Does Salesforce Einstein work as a provider?

Not currently.

---

## Data and privacy

### What data is sent to the AI provider?

By default, **only the message bodies of the email thread and your tone selection.**

Four options, all **off** by default, let an administrator add more context:

| Option | Adds |
|---|---|
| Include Sender in Prompt | Sender name and address |
| Include Recipient in Prompt | Recipient address |
| Include Subject in Prompt | The subject line |
| Include Timestamp in Prompt | Message dates and times |

Before generating, the component shows a disclosure banner naming exactly what will be
sent, based on how your org is configured.

### Does MDS LLC see my data?

No. The app runs entirely inside your Salesforce org, and the AI callout goes from your
org directly to your provider. MDS LLC operates no servers, APIs or databases for this
product and is **not** a data processor or sub-processor. See the
[Privacy Policy](PRIVACY_POLICY.md).

### Will my email content be used to train AI models?

That depends on your agreement with your AI provider, not on this app. Most providers
exclude API traffic from training by default on paid business tiers — check your
provider's data-usage terms and, if needed, their zero-retention options.

### Is email content sent to the AI provider when a reply is sent?

No. The provider is used only to write the draft text. Sending is done entirely by
Salesforce's native email, and the provider is not involved at send time.

### Where are drafts stored?

In your org, as **AI Email Reply Draft** records. Each holds the tone, the provider and
model used, the original AI text, your edited text, and a status of Draft, Saved, Sent or
Discarded. They are ordinary Salesforce records, subject to your sharing rules, backup and
retention.

### Can I delete draft history?

Yes — they are standard custom object records. Delete them manually, or with a scheduled
job or data retention tool, like any other object.

### Is the app GDPR-compatible?

No personal data is persisted outside your Salesforce org by the app, and MDS LLC receives
none. Your obligations for the content you send to your AI provider are governed by your
agreement with that provider. See the [Privacy Policy](PRIVACY_POLICY.md).

### Has it passed the Salesforce Security Review?

The package is built to Salesforce ISV security requirements — CRUD and FLS enforced, no
dynamic SOQL, callouts only through Named Credentials, no external scripts. The
[Security Policy](SECURITY_POLICY.md) covers development practices and vulnerability
response. For review documentation, contact
[omorgun@morgunsolutions.com](mailto:omorgun@morgunsolutions.com).

---

## Using it

### Which tones are available?

Professional, Friendly, Empathetic, Formal, Concise, and Custom — where the user describes
the tone in their own words. See the [User Guide](user-guide.md).

### Can I customise how replies are written?

Yes, through prompt templates. Three ship with the package (General, Support, Sales) and
administrators can add more. See [Prompt templates](setup.md#prompt-templates).

### Can it write in languages other than English?

The interface is English. Replies follow the email thread and your prompt template, so the
model will usually reply in the thread's language, and you can make that explicit by
adding a language instruction to a template. There is no translated UI yet.

### Will it invent facts?

It can. The model sees only the email thread — not your orders, billing or account data —
so dates, amounts and policy details may be wrong or fabricated. Always read a draft
before sending. The [User Guide](user-guide.md) lists what to check.

### Can it send replies automatically?

No, by design. A person picks the tone, reviews the draft and clicks send.

### Is there a limit on how many replies we can generate?

Not from the app. Your limits are your AI provider's rate limits and credit, plus
Salesforce's own callout limits.

---

## Installing and removing

### How long does setup take?

About 10 minutes for an administrator who has an API key ready. See the
[Setup Guide](setup.md).

### Does it change any of our existing data or objects?

No. The package adds its own components, one custom object for drafts, two custom metadata
types, permission sets, and Named and External Credentials. It does not modify standard
objects or existing data.

### What happens if we uninstall?

Uninstall from **Setup → Installed Packages**. Salesforce removes the package's components.
Follow Salesforce's standard prompts about retaining or discarding the package's data if
you want to keep draft records. Revoke the API key in your provider's console afterwards.

### How do we get support?

Email [omorgun@morgunsolutions.com](mailto:omorgun@morgunsolutions.com), target response
two business days. [Troubleshooting](troubleshooting.md) lists the details worth including.
