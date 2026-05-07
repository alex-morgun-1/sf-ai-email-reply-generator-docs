# Sensitive Data Inventory — AI Email Reply Generator

> **Company**: MDS LLC
> **Last Updated**: April 24, 2026

---

## 1. Overview

This document inventories all PII and sensitive data that the AI Email Reply Generator processes or stores within the customer's Salesforce org, and data transmitted to external systems.

---

## 2. Data Processed (In-Memory, Not Stored by App)

These data elements are read from standard Salesforce objects during reply generation. They exist in-memory during processing and are not persisted by the app beyond what Salesforce natively stores.

| Data Element             | Source Object.Field        | Contains PII?                  | Transmitted to AI Provider?                    | Configurable?                |
| ------------------------ | -------------------------- | ------------------------------ | ---------------------------------------------- | ---------------------------- |
| Email subject            | `EmailMessage.Subject`     | Potentially                    | **Yes** — always included                      | No                           |
| Email body (full thread) | `EmailMessage.TextBody`    | **Yes** — may contain any data | **Yes** — always included (core functionality) | No                           |
| Sender email address     | `EmailMessage.FromAddress` | **Yes**                        | Yes — if enabled                               | Yes (`Include_Sender__c`)    |
| Sender name              | `EmailMessage.FromName`    | **Yes**                        | Yes — if enabled                               | Yes (`Include_Sender__c`)    |
| Recipient email address  | `EmailMessage.ToAddress`   | **Yes**                        | Yes — if enabled                               | Yes (`Include_Recipient__c`) |
| CC addresses             | `EmailMessage.CcAddress`   | **Yes**                        | **No** — read for context only                 | N/A                          |
| Message timestamps       | `EmailMessage.MessageDate` | No                             | Yes — if enabled                               | Yes (`Include_Timestamp__c`) |
| Message direction        | `EmailMessage.Incoming`    | No                             | **Yes** — always included                      | No                           |
| Parent record ID         | `EmailMessage.ParentId`    | No                             | **No**                                         | N/A                          |

---

## 3. Data Stored by the App

The app automatically creates a draft record when a reply is sent, to maintain an audit trail of AI-generated content. This data persists in the customer's org until deleted.

### AI_Email_Reply_Draft\_\_c

| Field             | API Name               | Data Type      | Contains PII?                                                        | Description                                  |
| ----------------- | ---------------------- | -------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Draft Number      | `Name` (auto-number)   | Text           | No                                                                   | Auto-generated identifier (DRAFT-0000001)    |
| Original Email ID | `Original_Email_Id__c` | Text           | No                                                                   | Reference to source EmailMessage record      |
| Related Record ID | `Related_Record_Id__c` | Text           | No                                                                   | Reference to parent record (e.g., Case)      |
| Tone              | `Tone__c`              | Text           | No                                                                   | Selected tone (Professional, Friendly, etc.) |
| Generated Text    | `Generated_Text__c`    | Long Text Area | **Potentially** — contains AI-generated reply based on email content | Original AI output                           |
| Edited Text       | `Edited_Text__c`       | Long Text Area | **Potentially** — user-modified version                              | User's edited version of the draft           |
| Status            | `Status__c`            | Picklist       | No                                                                   | Sent                                         |
| AI Provider       | `AI_Provider__c`       | Text           | No                                                                   | Provider used (openai, anthropic)            |
| AI Model          | `AI_Model__c`          | Text           | No                                                                   | Model used (gpt-4o, claude-3, etc.)          |
| Token Count       | `Token_Count__c`       | Number         | No                                                                   | Tokens consumed for generation               |
| Prompt Template   | `Prompt_Template__c`   | Text           | No                                                                   | Template name used                           |
| Created By User   | `Created_By_User__c`   | Text           | **Yes** — user identifier                                            | User who created the draft                   |

**Sharing model**: Private — only the record owner can view their drafts. Admins with `AI_Email_Reply_Admin` permission set have `viewAllRecords` / `modifyAllRecords`.

---

## 4. Data Transmitted to External Systems

### Destination: Customer's AI Provider (via Named Credential)

| Data Element                    | Purpose                            | Retention by AI Provider                                |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| Email subject                   | Context for reply generation       | Governed by customer's agreement with their AI provider |
| Email body (full thread)        | Primary input for reply generation | Governed by customer's agreement with their AI provider |
| Sender address (if enabled)     | Personalization of reply           | Governed by customer's agreement with their AI provider |
| Recipient address (if enabled)  | Context for reply                  | Governed by customer's agreement with their AI provider |
| Message timestamps (if enabled) | Temporal context                   | Governed by customer's agreement with their AI provider |
| Selected tone                   | Reply style instruction            | Governed by customer's agreement with their AI provider |
| Prompt template text            | AI instructions                    | Governed by customer's agreement with their AI provider |

**MDS LLC does not control data retention at the AI provider.** The customer's agreement with their chosen provider governs how transmitted data is processed, stored, and retained.

---

## 5. Data NOT Collected or Transmitted

The following data is explicitly **not** collected, stored, or transmitted by the app:

- Salesforce user credentials or session tokens
- API keys (stored in External Credentials, never accessed by app code)
- Org metadata or configuration beyond the app's own CMDTs
- Data from objects other than EmailMessage and the app's own custom object
- Telemetry, analytics, or usage data to MDS LLC
- CC/BCC addresses are not sent to the AI provider

---

## 6. Data Residency

- **Stored data** (drafts, config): Resides in the customer's Salesforce org, subject to the customer's Salesforce data residency settings.
- **Transmitted data**: Routed to the AI provider endpoint configured by the customer. Data residency depends on the customer's choice of AI provider and endpoint region.
- **MDS LLC infrastructure**: None. No ISV-hosted servers, databases, or storage.
