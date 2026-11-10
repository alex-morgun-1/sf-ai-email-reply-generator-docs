[← Documentation home](./)

# Setup Guide

For Salesforce administrators. One-time setup, about 10 minutes.

Until an AI provider API key is configured, users who open the component see
*"AI provider is not configured."* Steps 1–7 clear that; steps 8–10 roll the app out to
your team.

---

## Before you start

| You need | Notes |
|---|---|
| Salesforce Enterprise, Unlimited or Developer edition | Lightning Experience is required; Salesforce Classic is not supported |
| System Administrator access | Setup touches Named Credentials, Permission Sets and Custom Metadata |
| An account with a supported AI provider | OpenAI, Anthropic, Google or xAI |
| An API key from that provider | You pay the provider directly for usage — see the [FAQ](faq.md) |

The app ships with the AI provider endpoints already configured. You never need to create
or edit a Named Credential URL.

---

## Step 1 — Install the package

Install from the AppExchange listing and choose **Install for All Users**, or install for
admins only if you prefer to grant access gradually with permission sets.

In a managed package, all components appear with the `aiemailreply` namespace prefix —
for example `aiemailreply__AI_Email_Reply_Admin`. That is expected.

## Step 2 — Assign yourself the admin permission set

Do this before you open the app, or you will see an **Admin Access Required** screen.

1. **Setup → Users → Permission Sets**.
2. Click **AI Email Reply Admin**.
3. **Manage Assignments → Add Assignment**.
4. Select your own user and click **Assign**.

## Step 3 — Open the app

1. Click the **App Launcher** (grid icon, top left).
2. Search for **AI Email Reply Generator** and open it.

You land on **Admin Settings**, which shows connection status, a Setup Guide section, your
current provider settings, prompt templates and available tones.

## Step 4 — Add your API key

Your key is stored in an External Credential, managed by Salesforce. It is never written
into the app's code or metadata, and the app itself cannot read it back.

1. **Setup → Named Credentials → External Credentials** tab.
2. Open the External Credential for your provider from the table below.
3. Under **Principals**, edit the listed principal.
4. Under **Authentication Parameters**, replace the `CONFIGURE_IN_SETUP` placeholder with
   your real key, using the header and value format for your provider.
5. **Save**.

| Provider | External Credential | Principal | Header | Value to enter |
|---|---|---|---|---|
| OpenAI | AI Email Reply OpenAI | `OpenAI_Principal` | `Authorization` | `Bearer sk-proj-…` |
| Anthropic | AI Email Reply Anthropic | `Anthropic_Principal` | `x-api-key` | your key, **with no `Bearer` prefix** |
| Google | AI Email Reply Google | `Google_Principal` | `Authorization` | `Bearer …` |
| xAI | AI Email Reply xAI | `XAI_Principal` | `Authorization` | `Bearer …` |

Anthropic is the exception: its header is `x-api-key` and the value is the bare key.
Adding `Bearer ` in front of an Anthropic key causes a 401 at **Test Connection**.

Configure only the provider you intend to use. The other three can stay on their
placeholder values.

## Step 5 — Grant access to the External Credential

Salesforce does not allow editing a managed package's permission sets in your org, so
callout access is granted through a small permission set of your own.

1. **Setup → Permission Sets → New**.
2. Label it something like **AI Email Reply API Access**. **Save**.
3. On the permission set, find **External Credential Principal Access** and click **Edit**.
4. Move the principal for your provider — for example
   `aiemailreply__AI_Email_Reply_ExtCred_OpenAI - OpenAI_Principal` — from **Available** to
   **Enabled**. **Save**.
5. Assign this permission set to yourself and to every user who will generate replies.

This grants nothing but the ability to call the provider endpoint that already ships with
the package.

## Step 6 — Choose your provider and model

1. **Setup → Custom Metadata Types → AI Reply Config → Manage Records**.
2. The package ships one record per provider. Open the one for your provider and set
   **Is Active** on it; clear **Is Active** on the others, so exactly one record is active.
3. Check **Provider** and **Model**.

| Provider | Config record | Provider value | Default model | Endpoint used |
|---|---|---|---|---|
| OpenAI | Default OpenAI Config | `openai` | `gpt-4o` | `api.openai.com/v1/chat/completions` |
| Anthropic | Default Anthropic Config | `anthropic` | `claude-haiku-4-5` | `api.anthropic.com/v1/messages` |
| Google | Default Google Config | `google` | `gemini-2.5-flash` | `generativelanguage.googleapis.com/v1beta/openai/chat/completions` |
| xAI | Default XAI Config | `xai` | `grok-3-fast` | `api.x.ai/v1/chat/completions` |

**Model** must be a model identifier your provider account can actually call. A model name
that is retired, misspelled, or outside your plan fails at **Test Connection**.

## Step 7 — Test the connection

Go back to **Admin Settings** and click **Test Connection**. It checks both that the key
authenticates and that the model name is valid for your provider.

If it fails, see [Troubleshooting](troubleshooting.md).

## Step 8 — Give your team access

Assign both of these to each end user:

- **AI Email Reply User** — use the component and generate replies.
- Your **AI Email Reply API Access** permission set from step 5 — without it, that user's
  replies fail even though yours work.

Assign **AI Email Reply Admin** only to admins who should change configuration.

## Step 9 — Add the component to your pages

1. Open any **Case** record.
2. Click the **gear icon (⚙) → Edit Page**.
3. In **Components**, search for **AI Email Reply Generator**.
4. Drag it onto the layout — a right sidebar or its own tab works well.
5. **Save**, then **Activation** if the page is not yet active, and choose a scope:
   **Org Default**, **App Default**, or app/record type/profile for finer control.
6. **Save**, then **Back**.

The component needs email activity for context, so Case record pages are the primary use
case. It can also go on a Home or App page via **Setup → Lightning App Builder → New**.

## Step 10 — Sandboxes and trial orgs only: email deliverability

In a sandbox or trial org, sending often fails silently because the org's email
deliverability is restricted by default.

1. **Setup → Email → Deliverability**.
2. Set **Access Level** to **All Email**.
3. Enable **Use a substitute email address for unverified domains**.
4. **Save** and retry.

Production orgs normally need no change here.

---

## Optional configuration

### Generation settings

On the active **AI Reply Config** record:

| Setting | What it does | Default |
|---|---|---|
| Default Tone | Tone used when the user does not pick one | `Professional` |
| Max Tokens | Caps the length of the generated reply | `1024` |
| Temperature | Higher is more varied, lower is more predictable (0.0–1.0) | `0.7` |

### What goes into the prompt

Four checkboxes control how much of the email metadata is sent to the AI provider. **All
four are off by default**, so out of the box only the message bodies and your tone choice
leave the org.

| Setting | Adds to the prompt |
|---|---|
| Include Sender in Prompt | Sender name and address (From) |
| Include Recipient in Prompt | Recipient address (To) |
| Include Subject in Prompt | The subject line |
| Include Timestamp in Prompt | Message dates and times |

Turn one on only if it measurably improves replies for your use case. See the
[Privacy Policy](PRIVACY_POLICY.md).

### Prompt templates

**Setup → Custom Metadata Types → Prompt Template → Manage Records**. Three ship with the
package: **General Reply**, **Support Reply** and **Sales Reply**.

Templates support two merge fields:

| Merge field | Replaced with |
|---|---|
| `{tone}` | The tone the user selected |
| `{emailThread}` | The formatted, sanitized email thread |

In the formatted thread, each message is labelled `[CUSTOMER]` (inbound) or `[AGENT]`
(previously sent by your team). If you write your own template, keep a role block
immediately after `{emailThread}` and before your instructions, or the AI may address the
reply to the wrong person:

```
Role context:
- [CUSTOMER] messages were sent by the person you are assisting.
- [AGENT] messages were previously sent by the support agent.
- Write your reply FROM the Agent, addressed TO the Customer.
```

All three built-in templates already include it.

---

Next: the [User Guide](user-guide.md) for your team, or the [FAQ](faq.md).
