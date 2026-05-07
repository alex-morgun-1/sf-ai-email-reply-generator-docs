# Architecture & Data Flow — AI Email Reply Generator

> **Company**: MDS LLC
> **Last Updated**: May 7, 2026

---

## 1. High-Level Architecture

The AI Email Reply Generator is a 100% native Salesforce Lightning application. It consists of four LWC components, ten Apex classes, one custom object, two Custom Metadata Types, and four Named Credentials. No external servers or ISV-hosted infrastructure exist.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Customer's Salesforce Org                                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Lightning UI Layer (LWC)                                    │   │
│  │                                                              │   │
│  │  aiEmailReplyGenerator ─── toneSelector                      │   │
│  │         │                  draftEditor                       │   │
│  │         │                                                    │   │
│  │  aiReplyAdminConfig (Admin Panel)                            │   │
│  └─────────┼────────────────────────────────────────────────────┘   │
│            │ @AuraEnabled Apex calls                                │
│  ┌─────────┼────────────────────────────────────────────────────┐   │
│  │  Apex Controller Layer                                       │   │
│  │                                                              │   │
│  │  AIEmailReplyController    AIReplyAdminController            │   │
│  └─────────┼──────────────────────┼─────────────────────────────┘   │
│            │                      │                                 │
│  ┌─────────┼──────────────────────┼─────────────────────────────┐   │
│  │  Apex Service Layer                                          │   │
│  │                                                              │   │
│  │  EmailContextService     AIReplyConfigService                │   │
│  │  AIEmailReplyService     AIProviderCalloutService            │   │
│  │  AIEmailDraftService                                         │   │
│  └─────────┼────────────────────────────────────────────────────┘   │
│            │                                                        │
│  ┌─────────┼────────────────────────────────────────────────────┐   │
│  │  Data Layer                                                  │   │
│  │                                                              │   │
│  │  EmailMessage (standard)    AI_Email_Reply_Draft__c          │   │
│  │  Case (standard)            AI_Email_Reply_Config__mdt       │   │
│  │                             AI_Email_Reply_Prompt_Template__mdt│  │
│  └─────────┼────────────────────────────────────────────────────┘   │
│            │                                                        │
│  ┌─────────┼────────────────────────────────────────────────────┐   │
│  │  Callout Layer                                               │   │
│  │                                                              │   │
│  │  Named Credential: AI_Email_Reply_Provider (OpenAI)        │   │
│  │  Named Credential: AI_Email_Reply_Anthropic               │   │
│  │  Named Credential: AI_Email_Reply_Google                  │   │
│  │  Named Credential: AI_Email_Reply_XAI                     │   │
│  │  External Credential: AI_Email_Reply_ExtCred              │   │
│  │  (Customer-configured API key, shared)                    │   │
│  └─────────┼────────────────────────────────────────────────────┘   │
│            │                                                        │
└────────────┼────────────────────────────────────────────────────────┘
             │ HTTPS (TLS 1.2+)
             ▼
┌────────────────────────────────┐
│  Customer's AI Provider                │
│  (OpenAI / Anthropic / Google / xAI)   │
│  Customer-owned API key                │
└────────────────────────────────┘
```

---

## 2. Data Flow — Reply Generation

```
User clicks "Generate Reply"
        │
        ▼
[1] aiEmailReplyGenerator LWC
    ├─ Checks: disclosureAccepted? (blocks if not)
    ├─ Sends: emailMessageId, selectedTone, selectedTemplateName
    │
    ▼
[2] AIEmailReplyController.generateReply()  ← @AuraEnabled
    │
    ├──► [3] EmailContextService.getEmailThread()
    │         ├─ SOQL: EmailMessage WHERE Id = :emailMessageId
    │         │        (WITH SECURITY_ENFORCED)
    │         ├─ SOQL: EmailMessage WHERE ParentId = :parentId
    │         │        (full thread retrieval)
    │         └─ Returns: subject, bodies, sender/recipient, timestamps
    │
    ├──► [4] AIReplyConfigService.getActiveConfig()
    │         ├─ SOQL: AI_Email_Reply_Config__mdt WHERE Is_Active__c = true
    │         └─ Returns: provider, model, temperature, max_tokens,
    │                     include_sender, include_recipient, include_timestamp
    │
    ├──► [5] AIReplyConfigService.getPromptTemplate()
    │         ├─ SOQL: AI_Email_Reply_Prompt_Template__mdt
    │         └─ Returns: template body with {tone} and {emailThread} placeholders
    │
    ├──► [6] AIEmailReplyService.assemblePrompt()
    │         ├─ Sanitizes email content (prompt injection mitigation)
    │         ├─ Wraps content in delimiters: ---BEGIN/END EMAIL THREAD---
    │         ├─ Applies config toggles (sender/recipient/timestamp)
    │         └─ Returns: assembled prompt string
    │
    └──► [7] AIProviderCalloutService.callProvider()
              ├─ Resolves Named Credential by provider:
              │     openai   → callout:AI_Email_Reply_Provider
              │     anthropic → callout:AI_Email_Reply_Anthropic
              │     google   → callout:AI_Email_Reply_Google/<model>:generateContent
              │     xai      → callout:AI_Email_Reply_XAI
              ├─ Builds provider-specific HTTP request body
              ├─ HTTPS POST to customer's AI provider
              ├─ Delegates response parsing to AIProviderResponseParser
              └─ Returns: AI-generated reply text
        │
        ▼
[8] AIEmailReplyController returns reply to LWC
        │
        ▼
[9] draftEditor displays generated text for review/editing
```

---

## 3. Data Flow — Email Sending

```
User clicks "Send Reply"
        │
        ▼
[1] aiEmailReplyGenerator LWC
    ├─ Sends: draftContent (edited text), emailMessageId
    │
    ▼
[2] AIEmailReplyController.sendReply()  ← @AuraEnabled
    │
    ├──► Messaging.SingleEmailMessage
    │    ├─ Sets: toAddress (original sender's FromAddress)
    │    ├─ Sets: subject (Re: original subject)
    │    ├─ Sets: htmlBody (edited draft content)
    │    ├─ Sets: whatId (parent Case record)
    │    └─ Sends via: Messaging.sendEmail()
    │         └─ Native Salesforce email delivery (no AI provider involved)
    │
    └──► [3] Draft status updated to "Sent" in AI_Email_Reply_Draft__c
```

> **Key point**: Email delivery uses Salesforce's native `Messaging.sendEmail()` API. No data passes through the AI provider at send time.

---

## 4. Data Flow — Draft Persistence (Internal)

> **Note**: There is no user-facing "Save Draft" button. Draft records are created automatically when a reply is sent, to maintain an audit trail of AI-generated content.

```
User clicks "Send Reply"
        │
        ▼
[1] handleSend() in aiEmailReplyGenerator LWC
    ├─ Calls saveDraftInternal() (automatic, not user-initiated)
    │
    ▼
[2] AIEmailReplyController.saveDraft()  ← @AuraEnabled
    │
    ├──► Security.stripInaccessible(AccessType.CREATABLE, records)
    ├──► INSERT/UPDATE AI_Email_Reply_Draft__c
    │    ├─ Original_Email_Id__c
    │    ├─ Related_Record_Id__c
    │    ├─ Tone__c
    │    ├─ Generated_Text__c (original AI output)
    │    ├─ Edited_Text__c (user-modified version)
    │    ├─ Status__c (Sent)
    │    ├─ AI_Provider__c, AI_Model__c, Token_Count__c
    │    ├─ Prompt_Template__c
    │    └─ Created_By_User__c
    │
    └──► Sharing model = Private (only OwnerId can view)
```

---

## 5. Authentication & Credential Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Salesforce Org                                              │
│                                                              │
│  External Credential: AI_Email_Reply_ExtCred                 │
│  ├─ Type: Custom / Protocol: Custom                          │
│  └─ Parameter: ApiKey (AuthHeader, masked, encrypted)        │
│         │ (shared across all 4 Named Credentials)            │
│         ▼                                                    │
│  Named Credential: AI_Email_Reply_Provider   (OpenAI)        │
│  Named Credential: AI_Email_Reply_Anthropic  (Anthropic)     │
│  Named Credential: AI_Email_Reply_Google     (Google Gemini) │
│  Named Credential: AI_Email_Reply_XAI        (xAI)           │
│  ├─ Endpoint: https://<customer-configured>/...              │
│  ├─ Auth: Generated from External Credential                 │
│  └─ HTTPS enforced; resolved at runtime by resolveNamedCredential()│
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │  Authorization: Bearer <customer-api-key>
          │  Content-Type: application/json
          ▼
┌───────────────────────────────────────┐
│  AI Provider API (Customer's account) │
│  OpenAI / Anthropic / Google / xAI    │
└───────────────────────────────────────┘
```

**Security controls:**

- API key never appears in Apex code or debug logs.
- Named Credentials generate the Authorization header automatically via External Credential merge field.
- `resolveNamedCredential()` applies the managed namespace prefix (`aiemailreply__`) automatically when running in the packaged context.
- Customer configures both the endpoint URL and API key via Salesforce Setup UI.
- The `AI_Email_Reply_ExtCred` ships with placeholder value `CONFIGURE_IN_SETUP`.

---

## 6. Security Boundaries

| Boundary             | Description                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| **Salesforce Org**   | All app logic, data storage, and UI run within the customer's org             |
| **Named Credential** | Single controlled exit point for external callouts (HTTPS only)               |
| **AI Provider**      | External — customer's own account, customer's own API key                     |
| **MDS LLC**          | No data access — ISV code runs in customer's org, no phone-home, no telemetry |

---

## 7. Component Inventory

### LWC Components

| Component               | Purpose                                                                   | Placement                                |
| ----------------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| `aiEmailReplyGenerator` | Main orchestrator — email loading, generation, send                       | Case record pages, App Pages, Home Pages |
| `toneSelector`          | Tone picker (Professional, Friendly, Empathetic, Formal, Concise, Custom) | Child of aiEmailReplyGenerator           |
| `draftEditor`           | Rich text editor for reviewing/editing AI drafts                          | Child of aiEmailReplyGenerator           |
| `aiReplyAdminConfig`    | Admin panel — config display, connection test, setup wizard               | Dedicated Admin App Page                 |

### Apex Classes

| Class                        | Layer      | Purpose                                                                  |
| ---------------------------- | ---------- | ------------------------------------------------------------------------ |
| `AIEmailReplyController`     | Controller | @AuraEnabled methods for LWC (generate, send, get email)                 |
| `AIReplyAdminController`     | Controller | @AuraEnabled methods for admin panel (config, test connection)           |
| `EmailContextService`        | Service    | Queries EmailMessage records and assembles email thread context          |
| `AIReplyConfigService`       | Service    | Reads CMDT configuration and prompt templates                            |
| `AIEmailReplyService`        | Service    | Assembles prompts, sanitizes input, orchestrates generation              |
| `AIProviderCalloutService`   | Service    | Performs HTTP callout via Named Credential; delegates parsing to parser  |
| `AIProviderResponseParser`   | Service    | Parses HTTP responses from all 4 provider formats into standard objects  |
| `AIEmailDraftService`        | Service    | CRUD operations on AI_Email_Reply_Draft\_\_c                             |
| `AIReplyLogger`              | Utility    | Centralized logging — logs only `e.getMessage()` at `LoggingLevel.ERROR` |
| `PostInstallHandler`         | Installer  | Post-install script — creates unmanaged `AI_Email_Reply_API_Access` permission set and assigns it to installing user |

### Data Objects

| Object                                | Type                 | Sharing |
| ------------------------------------- | -------------------- | ------- |
| `AI_Email_Reply_Draft__c`             | Custom Object        | Private |
| `AI_Email_Reply_Config__mdt`          | Custom Metadata Type | —       |
| `AI_Email_Reply_Prompt_Template__mdt` | Custom Metadata Type | —       |

### Credentials

| Name                        | Type                              | Provider      |
| --------------------------- | --------------------------------- | ------------- |
| `AI_Email_Reply_Provider`   | Named Credential                  | OpenAI (default) |
| `AI_Email_Reply_Anthropic`  | Named Credential                  | Anthropic     |
| `AI_Email_Reply_Google`     | Named Credential                  | Google Gemini |
| `AI_Email_Reply_XAI`        | Named Credential                  | xAI (Grok)    |
| `AI_Email_Reply_ExtCred`    | External Credential (Custom auth) | All providers |

### Post-Install Behavior

On package installation, `PostInstallHandler` runs automatically and:

1. Creates an unmanaged Permission Set named `AI_Email_Reply_API_Access` (if it does not already exist).
2. Assigns it to the installing user.
3. The admin must then manually add External Credential principal access to this Permission Set via Salesforce Setup → External Credential Principal Access — as guided by the in-app Setup Wizard.
