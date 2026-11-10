[← Documentation home](./)

# Troubleshooting

Grouped by what you see on screen. Most items are administrator tasks; the
[Setup Guide](setup.md) has the step-by-step for each one.

---

## Quick checklist

Most problems in a fresh install are one of these five:

1. The API key still says `CONFIGURE_IN_SETUP` on the External Credential.
2. An Anthropic key was entered with a `Bearer ` prefix — Anthropic uses `x-api-key` with
   the bare key.
3. The user has no **External Credential Principal Access** (step 5 of setup) — this is
   why it often works for the admin and fails for everyone else.
4. No **AI Reply Config** record has **Is Active** set, or more than one does.
5. The **Model** name is retired, misspelled, or not enabled on the provider account.

---

## Setup and access

### "Admin Access Required" when opening the app

The **AI Email Reply Admin** permission set is not assigned to you.
**Setup → Users → Permission Sets → AI Email Reply Admin → Manage Assignments → Add
Assignment**.

### "Access Not Available" on the component

That user is missing the **AI Email Reply User** permission set. Assign it, and also
assign the API access permission set from step 5 of setup.

### It works for me as admin, but my users get errors

Almost always **External Credential Principal Access**. Create or reuse an unmanaged
permission set, enable the principal for your provider on it (for example
`aiemailreply__AI_Email_Reply_ExtCred_OpenAI - OpenAI_Principal`), and assign it to every
user who generates replies. Managed package permission sets cannot grant this in your org
— see [step 5](setup.md).

### I can't find the component in Lightning App Builder

Search for **AI Email Reply Generator** in the **Components** panel, under Custom.
If it is absent, the package is not installed in that org, or you are in Salesforce
Classic — Lightning Experience is required.

---

## Configuration

### "AI provider is not configured"

Setup is incomplete. Check, in this order:

1. The API key on the External Credential for your provider is a real key, not
   `CONFIGURE_IN_SETUP`.
2. Exactly one **AI Reply Config** record has **Is Active** checked.
3. The **Provider** value on that record is one of `openai`, `anthropic`, `google`, `xai`.

### "No active AI Reply configuration found"

No **AI Reply Config** record has **Is Active** checked.
**Setup → Custom Metadata Types → AI Reply Config → Manage Records**, open the record for
your provider and check **Is Active**. Leave it checked on exactly one record.

### "Unsupported AI provider"

The **Provider** field holds something the app does not recognise. It must be exactly
`openai`, `anthropic`, `google` or `xai` — lower case, no spaces, no display name like
"OpenAI (GPT-4o)".

### "No default prompt template found" / "Unable to load prompt templates"

The prompt template metadata is missing or none is marked as default.
**Setup → Custom Metadata Types → Prompt Template → Manage Records** — you should see
**General Reply**, **Support Reply** and **Sales Reply**. If the list is empty, reinstall
or upgrade the package. If templates exist but none is default, mark one.

### "Unable to load available tones"

The user cannot read the **Tone** field on **AI Email Reply Draft**. Confirm the **AI
Email Reply User** permission set is assigned and was not overridden by a restrictive
profile or permission set group.

---

## Connection and provider errors

### Test Connection fails

Work through these in order:

| Check | Detail |
|---|---|
| Key format | OpenAI, Google and xAI: `Bearer <key>` in the `Authorization` parameter. Anthropic: the bare key in `x-api-key`, no `Bearer`. |
| Key validity | Paste the key into your provider's own console or test call. Revoked and expired keys are a common cause. |
| Billing | Most providers reject calls on accounts with no payment method or a spent credit balance. |
| Model name | It must exist and be enabled for your account. Retired model names fail here. |
| Principal access | The permission set from [step 5](setup.md) must be assigned to you too. |
| Provider match | The active config's **Provider** must match the credential you actually filled in. Filling in the OpenAI key while `anthropic` is the active provider fails. |

### "Could not reach the AI provider. Check your Named Credential configuration and network connectivity."

The callout did not complete. Usually one of:

- The provider is having an outage — check their status page.
- The Named Credential's **Callout Status** was disabled, or its URL was edited. The
  shipped URLs are correct and should be left alone:
  `api.openai.com/v1/chat/completions`, `api.anthropic.com/v1/messages`,
  `generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
  `api.x.ai/v1/chat/completions`.
- A long thread timed out. Try a shorter thread to confirm.

### "AI provider error: ..." (with provider text)

This is your provider's own message, passed through. Common ones:

| Provider says | Cause |
|---|---|
| 401 / invalid API key | Wrong, revoked or malformed key — check the `Bearer` rule above |
| 404 / model not found | Model name wrong or not enabled on your account |
| 429 / rate limit | Too many requests, or you are out of credit — check your provider usage page |
| context length exceeded | The email thread is too long for the model — reply to a shorter thread, or lower **Max Tokens** |

### Replies are slow

Generation time is the provider's, not Salesforce's. A faster model
(`claude-haiku-4-5`, `gemini-2.5-flash`, `grok-3-fast`) is noticeably quicker than a large
one. Lowering **Max Tokens** also helps.

---

## Email thread problems

### "No inbound emails found for this record"

The record has no inbound email to reply to. Either reply from a record that does, or
click **Enter Email ID manually** and supply an Email Message Id.

### "Unable to load email thread" / "Email message not found for Id"

The Email Message Id is wrong, the record was deleted, or the user cannot read
**EmailMessage**. Check the user's access to EmailMessage and to the parent record.

### "Unable to load emails for this record"

Usually record-level access: the user cannot see the parent record or its email activity.
Check sharing rules and the object's field-level security.

---

## Sending problems

### Sending appears to work but no email arrives (sandbox, trial or review org)

Email deliverability is restricted in non-production orgs by default.

1. **Setup → Email → Deliverability**.
2. **Access Level** → **All Email**.
3. Enable **Use a substitute email address for unverified domains**.
4. **Save** and retry.

### "Unable to send reply" / "Original email not found. Cannot send reply."

The original email the reply was threading onto is gone or not visible to the user. Check
that the EmailMessage still exists and the sender has access to it. In production, also
confirm the org's email deliverability and the sending user's email settings.

### "Unable to save draft"

The user cannot create **AI Email Reply Draft** records. Confirm the **AI Email Reply
User** permission set is assigned and not overridden.

---

## Reply quality

Quality problems are configuration, not bugs. In rough order of impact:

| Symptom | Try |
|---|---|
| Reply addressed to the wrong person | Your custom prompt template is missing the role-context block — see [Prompt templates](setup.md#prompt-templates) |
| Replies too long or too short | Adjust **Max Tokens**, or use the **Concise** tone |
| Replies too generic | Use a more specific template, or turn on **Include Subject in Prompt** |
| Replies too unpredictable | Lower **Temperature** (0.3–0.5) |
| Invented facts, dates or amounts | Expected behaviour of any LLM — the model sees only the email thread. Edit before sending; see the [User Guide](user-guide.md) |
| Wrong language | Add an explicit language instruction to your prompt template |

---

## Before contacting support

Send [omorgun@morgunsolutions.com](mailto:omorgun@morgunsolutions.com):

- Salesforce edition, and whether it is production, sandbox or a trial org
- Package version
- Configured provider and model
- The exact error text, including anything after *"AI provider error:"*
- Whether **Test Connection** succeeds
- Whether it fails for all users or only some

Please do not send API keys, passwords or customer email content.
