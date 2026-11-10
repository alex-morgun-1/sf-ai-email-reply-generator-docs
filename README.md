# sf-ai-email-reply-generator-docs

**Source** for the customer-facing documentation of **AI Email Reply Generator**, the
Salesforce AppExchange managed package by MDS LLC.

Published at **<https://morgunsolutions.com/sf-ai-email-generator/docs/>** and linked from
the AppExchange listing.

## How publishing works

The Markdown here is the source of truth. `scripts/build-site.py` renders it to plain
static HTML and writes it into a checkout of the **`AlexMorgun-MDS/mds-website`**
repository, which owns the `morgunsolutions.com` apex domain on GitHub Pages:

```
sf-ai-email-reply-generator-docs/*.md
        │  scripts/build-site.py  (pandoc)
        ▼
mds-website/sf-ai-email-generator/docs/*.html   →  morgunsolutions.com/sf-ai-email-generator/docs/
```

An apex domain can serve only one GitHub Pages site, and `mds-website` already holds it —
so documentation served from a path under that domain has to live inside that repository.
The generated pages are self-contained and carry their own `docs.css`; they do not touch
the marketing site's `index.html` or `styles.css`, and they add no Jekyll config, so a
change to the docs cannot break the rest of the site.

### Publishing a change

```bash
git clone git@github.com:AlexMorgun-MDS/mds-website.git ../mds-website   # once
```

```bash
python3 scripts/build-site.py ../mds-website
```

Then commit and push `../mds-website`. The path argument may be omitted if the checkout
sits next to this repository. Requires `pandoc` (`brew install pandoc`).

## Layout

| Path | Purpose |
|---|---|
| `*.md` | The documentation. Edit these. |
| `templates/docs.css` | Stylesheet, copied into the output as-is |
| `scripts/build-site.py` | Renderer — page list, nav, link rewriting, HTML shell |
| `*.html` | Redirects from the retired GitHub Pages URLs. Not generated; leave them. |

The old site at `alex-morgun-1.github.io/sf-ai-email-reply-generator-docs` stays alive
only to redirect: those URLs were public during the security review, and the privacy
policy URL in particular was given to Salesforce. `_config.yml` excludes the Markdown from
that build so it cannot collide with the redirect pages.

## What belongs here

Only documentation a customer or prospect should read: installation, usage, FAQ,
troubleshooting, and the public policies.

## What does not belong here

**Everything here is published publicly.** Nothing internal goes in it:

- Security review submission material — architecture internals, sensitive data
  inventories, scanner reports, false positive and scope-out statements, test scenarios.
  Those live in the private `sf-ai-email-reply-generator-security-review` repository, and
  authoritatively in the main repo's `docs/`.
- Internal engineering docs, release plans, readiness checklists, partner business plans.
  Those stay in the main `sf-ai-email-reply-generator` repository, with the code.
- Test code and automation. That belongs with the code.
- Credentials of any kind — org passwords, API keys, review org logins. Ever.

`PRIVACY_POLICY.md` and `SECURITY_POLICY.md` are mirrored from the main repo's `docs/`,
which is the source of truth for them. Edit them there first, then copy them here.
