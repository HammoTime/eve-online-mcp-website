# EVE Online MCP website

This is an independent Git repository for the public website at eve-mcp.com.
Do not introduce dependencies, submodules, generated schemas, build steps, secrets,
or deployment jobs from the MCP server repositories. Product claims are maintained
as editorial content with source links in docs/content-evidence.md.

Use the Docker/devcontainer workflow for installs, formatting, builds, and tests.
Run npm run validate before committing. Run the actionlint version in CI after
workflow changes. Preserve keyboard access, no-JavaScript content, truthful data
limits, ordinary EVE lettering, local fonts, and the Ko-fi destination.

Deployment updates versions of the existing eve-mcp-com Worker only.
Never add route, DNS, account-wide, database, or MCP permissions to the CI token.
Creating the Worker and attaching its custom domain are separate administrator
setup steps. Keep credentials out of files, logs, and chat.
