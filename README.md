# sf-ai-email-reply-generator-docs

Customer-facing documentation for **AI Email Reply Generator**, the Salesforce AppExchange
managed package by MDS LLC. Published with GitHub Pages at:

**<https://alex-morgun-1.github.io/sf-ai-email-reply-generator-docs/>**

These URLs are linked from the AppExchange listing, so treat them as stable — renaming a
page breaks the listing.

| File | Published at |
|---|---|
| `index.md` | `/` |
| `setup.md` | `/setup` |
| `user-guide.md` | `/user-guide` |
| `faq.md` | `/faq` |
| `troubleshooting.md` | `/troubleshooting` |
| `PRIVACY_POLICY.md` | `/PRIVACY_POLICY` |
| `SECURITY_POLICY.md` | `/SECURITY_POLICY` |

## What belongs here

Only documentation a customer or prospect should read: how to install it, how to use it,
FAQ, troubleshooting, and the public policies.

## What does not belong here

**This repository is public.** Nothing internal goes in it:

- Security review submission material — architecture internals, sensitive data
  inventories, scanner reports, false positive and scope-out statements, test scenarios.
  These live in the private `sf-ai-email-reply-generator-security-review` repository, and
  authoritatively in the main repo's `docs/`.
- Internal engineering docs, release plans, readiness checklists, partner business plans.
  These stay in the main `sf-ai-email-reply-generator` repository, with the code.
- Test code and automation. That belongs with the code.
- Credentials of any kind — org passwords, API keys, review org logins. Ever.

`PRIVACY_POLICY.md` and `SECURITY_POLICY.md` are mirrored from the main repo's `docs/`,
which is the source of truth. Edit them there first, then copy them here.

## Local preview

```bash
bundle exec jekyll serve
```
