# Website deployment

The target is the existing **eve-mcp-com** Worker in the account that
owns **eve-mcp.com**. The website repository never reads or deploys the hosted
MCP server, provisions storage, or handles EVE/OIDC credentials.

## One-time administrator setup

1. In the correct Cloudflare account, create a Worker named
   `eve-mcp-com`. A temporary Hello World Worker is sufficient.
2. In that Worker's **Settings → Domains & Routes**, attach **eve-mcp.com** as
   its Custom Domain. Disable the `workers.dev` URL and preview URLs if they
   are enabled. Ensure the domain is active before the first site deployment.
3. In **Manage Account → Account API Tokens**, create an account-owned token
   named `github-eve-online-mcp-website-production` with scope **Specified
   Workers**, select only **eve-mcp-com**, and choose **Editor**.
4. Add that token as the **CLOUDFLARE_API_TOKEN** secret in this repository's
   GitHub **production** environment. Add **CLOUDFLARE_ACCOUNT_ID** as an
   environment variable containing the owning account's ID. Do not paste the
   token into a commit, issue, or chat.
5. Run **Deploy website** from `main`. After verifying the page and assets,
   optionally set repository variable **PRODUCTION_ENABLED=true**.

## Why these permissions are enough

Cloudflare introduced individual-Worker API token roles on September 15, 2026.
Editor can update and deploy an existing selected Worker but cannot create or
delete Workers. Creation needs product-level Admin, so it is performed once by
the account administrator rather than granted to CI.

Custom Domain management currently does not support per-Worker roles. Changing
domains also needs zone-scoped Workers Routes Write. CI therefore uses
`wrangler versions upload` followed by `wrangler versions deploy`, leaving the
existing domain connection alone. Its token needs no zone, DNS, D1, R2, KV,
account-wide Workers, or Terraform permissions.

Sources: [September 15 announcement](https://developers.cloudflare.com/changelog/post/2026-09-15-granular-worker-permissions/),
[Workers roles, domain limitations, and minimum permissions](https://developers.cloudflare.com/workers/authorization/workers/).

Use an expiry that fits your rotation process. Standard GitHub-hosted runners
have changing egress addresses; add an IP allowlist only if using runners with
known fixed egress. Never grant Admin merely to resolve a deployment error.

## Deployment behavior

`scripts/deploy.mjs` requires a clean checkout, uploads the static assets using
Wrangler, reads the version ID from Wrangler's
structured output, and deploys that exact version at 100%. It never lists all
Workers or zones and never calls a route or DNS API. The locked Wrangler version
is 4.136.3. The output format is documented in
[Wrangler structured output](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/).

There are no routes in `wrangler.jsonc` intentionally. Do not replace the version
commands with a route-managing deployment or add broad discovery calls to the
deployment. Keep the token in this repository only; do not reuse the hosted MCP
deployment token.

Verify the root page, CSS, JavaScript, fonts, logo, Ko-fi link, security headers,
and an unknown path returning 404. Roll back by deploying a previously verified
version of this Worker; no database migration or backend rollback is involved.
