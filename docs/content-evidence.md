# Website content and design evidence

Reviewed 2026-09-23. The website promotes the published local EVE Online MCP
package. It is maintained and deployed independently of both server repositories.

## Product sources

- Package and setup: https://github.com/HammoTime/eve-online-mcp and
  https://www.npmjs.com/package/eve-online-mcp.
- Map output, local storage, expiry, and conditional PNG previews:
  https://github.com/HammoTime/eve-online-mcp/blob/main/docs/cartography.md.
- The 16 displayed tool names were checked against the shared server at revision
  `25a38c5b1f1477b3a8e76f228d07ab3bb7e5eb0c` during extraction.
  `content/tool-catalog.json` records that editorial snapshot. Website tests check
  presentation against the snapshot; they do not query, build, or import a server.
  Review the current published package before changing capability claims.

Public queries need no character login. Protected character reads require EVE
consent and scopes. Game access is read-only, while map rendering creates local
artifacts. Market results report freshness and coverage; combat history is delayed
and incomplete. Routes and maps do not establish live safety. Skill plans report
prerequisites and estimated missing skill points, not training duration or fitting
viability. Local refresh credentials use filesystem-protected plaintext storage;
access tokens stay in server memory. These limits remain visible in the page.

## Design source

Retrieved through the authenticated 21st.dev connector:
[DevTool Landing Page by Mokshith Gujjeti](https://21st.dev/@mokshithgujjeti/components/dev-tool-landing-page),
demo 20298. Its split hero, code panel, and feature-card composition informed the
static HTML/CSS redesign. No React or animation runtime was added.

The approved SVG emblem uses an original orbital design and ordinary EVE lettering.
Archivo and IBM Plex Mono are served locally with their license notices. Native
HTML details elements provide expandable tool lists and FAQs. The orbital graphic
is illustrative, not live telemetry. The donation destination is
https://ko-fi.com/hammotime; support is voluntary and does not unlock features.

## Checks

The independent website tests cover configuration copying and clipboard failures,
filters, example selection, no-JavaScript links, editorial tool counts, map/storage
limits, and the donation destination. Local browser checks cover desktop and mobile
layout. These checks do not establish acceptance of a package release or a hosted
MCP deployment.
