# EVE Online MCP website

The independent public website for [EVE Online MCP](https://www.npmjs.com/package/eve-online-mcp),
intended for **https://eve-mcp.com/**. It contains the 21st.dev-inspired redesign,
ordinary-lettered SVG branding, setup examples, and [Ko-fi support](https://ko-fi.com/hammotime).

This repository has no MCP server dependency, Git submodule, database, OAuth
configuration, Terraform state, or shared deployment job. It publishes static
HTML, CSS, JavaScript, SVGs, and locally served fonts to its own Cloudflare Worker,
`eve-online-website-prod`. Product claims are editorial content, not generated
from a running server. See [content evidence](docs/content-evidence.md).

## Develop and verify

Open the devcontainer, then run:

```sh
npm ci
npm run dev
```

The preview listens on port 8877. Before committing, run `npm run validate` for
formatting, lint, TypeScript checks, website interaction tests, and a Wrangler
version-upload dry run. CI runs the same checks in Docker plus actionlint.

The site remains readable without JavaScript. JavaScript adds filters, example
selection, and clipboard actions. Tool lists and FAQs use native disclosure
elements. Public assets contain no remote scripts, analytics, or hosted-service
connection settings.

## Production

Follow [Cloudflare and GitHub setup](docs/deployment.md). Create the Worker and
attach its domain once, then use an account-owned API token with **Editor** access
to **only this Worker**. GitHub publishes versions without managing routes or DNS.

The **Deploy website** workflow supports manual runs from `main`. Set the
repository variable `PRODUCTION_ENABLED=true` after the first successful manual
deployment to publish automatically after successful main-branch CI. Deployments
are serialized and reject superseded revisions. Production secrets are used only
by the publishing step.

The root domain belongs to this repository. Future hosted MCP production must use
a separate hostname and Worker; it must not claim `eve-mcp.com`.

## Design and licensing

The composition adapts the [21st.dev DevTool Landing Page](https://21st.dev/@mokshithgujjeti/components/dev-tool-landing-page)
reference into dependency-free page code. The logo uses ordinary EVE lettering
and an original orbital emblem. This is an independent community project, with
no claim of endorsement by Fenris Creations.

Code is AGPL-3.0-only. Font licenses are included under `public/fonts/`.
