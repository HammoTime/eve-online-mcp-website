import { readFileSync } from "node:fs";
import { runInContext } from "node:vm";
import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";

const html = readFileSync(
  new URL("../public/index.html", import.meta.url),
  "utf8",
);
const script = readFileSync(
  new URL("../public/site.js", import.meta.url),
  "utf8",
);
const windows: JSDOM[] = [];
function page(url = "https://eve-mcp.com/", execute = true) {
  const dom = new JSDOM(html, { url, runScripts: "outside-only" });
  windows.push(dom);
  const writeText = vi
    .fn<(text: string) => Promise<void>>()
    .mockResolvedValue();
  Object.defineProperty(dom.window.navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  if (execute) runInContext(script, dom.getInternalVMContext());
  const element = (selector: string) => {
    const found = dom.window.document.querySelector<HTMLElement>(selector);
    if (!found) throw new Error(`Missing website element: ${selector}`);
    return found;
  };
  return { dom, element, writeText };
}
afterEach(() => {
  for (const dom of windows.splice(0)) dom.window.close();
});

describe("website setup and examples", () => {
  it.each([
    "https://eve-mcp.com",
    "https://dev.eve-mcp.com",
    "http://localhost:8877",
  ])("copies local MCP configuration on %s", async (origin) => {
    const { element, writeText } = page(origin);
    const config = element("#mcp-config").textContent ?? "";
    expect(JSON.parse(config)).toEqual({
      mcpServers: {
        "eve-online": { command: "npx", args: ["-y", "eve-online-mcp"] },
      },
    });
    element("#copy-config").click();
    await vi.waitFor(() =>
      expect(element("#copy-status").textContent).toContain(
        "Configuration copied",
      ),
    );
    expect(writeText).toHaveBeenCalledWith(config);
  });

  it("provides honest manual-copy feedback when clipboard access fails or is unavailable", async () => {
    const { dom, element, writeText } = page();
    writeText.mockRejectedValue(new Error("Clipboard denied"));
    element("#copy-config").click();
    await vi.waitFor(() =>
      expect(element("#copy-status").textContent).toBe(
        "Select and copy the configuration above.",
      ),
    );
    Object.defineProperty(dom.window.navigator, "clipboard", {
      value: undefined,
    });
    element("[data-example=skills]").click();
    element("#copy-prompt").click();
    await vi.waitFor(() =>
      expect(element("#prompt-status").textContent).toBe(
        "Select and copy the example question above.",
      ),
    );
  });

  it("filters the capability cards and updates accessible selection", () => {
    const { dom, element } = page();
    element("[data-filter=skills]").click();
    expect(element("[data-filter=skills]").getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(element("[data-filter=all]").getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(
      [...dom.window.document.querySelectorAll<HTMLElement>("[data-category]")]
        .filter((card) => !card.hidden)
        .map((card) => card.dataset.category),
    ).toEqual(["skills"]);
    expect(element("#filter-status").textContent).toBe("Showing 1 capability.");
    element("[data-filter=all]").click();
    expect(
      dom.window.document.querySelectorAll("[data-category][hidden]"),
    ).toHaveLength(0);
    expect(element("#filter-status").textContent).toBe(
      "Showing 6 capabilities.",
    );
  });

  it.each([
    ["market", "Compare Veldspar buy and sell orders in The Forge."],
    ["skills", "What skills am I missing to fly a Nidhoggur?"],
    ["wallet", "Summarize the activity in my available wallet journal."],
    ["route", "Find a route from Jita to Amarr that prefers high security."],
    ["industry", "Which of my industry jobs are still running?"],
  ])(
    "carries the %s example into setup without submitting it",
    async (key, prompt) => {
      const { dom, element, writeText } = page();
      const link = element(`[data-example=${key}]`);
      expect(link.textContent).toContain("Try this example");
      expect(link.getAttribute("href")).toBe("#quickstart");
      link.click();
      expect(element("#selected-example").hidden).toBe(false);
      expect(element("#selected-prompt").textContent).toBe(prompt);
      expect(dom.window.document.activeElement?.id).toBe("quickstart-title");
      expect(writeText).not.toHaveBeenCalled();
      element("#copy-prompt").click();
      await vi.waitFor(() =>
        expect(element("#prompt-status").textContent).toContain(
          "Prompt copied",
        ),
      );
      expect(writeText).toHaveBeenCalledWith(prompt);
      element("[data-example=skills]").click();
      expect(element("#prompt-status").textContent).toBe("");
    },
  );

  it("leaves readable content and valid setup links without JavaScript", () => {
    const { dom, element } = page(undefined, false);
    expect(element(".filters").hidden).toBe(true);
    expect(element("#copy-config").hidden).toBe(true);
    expect(JSON.parse(element("#mcp-config").textContent ?? "")).toHaveProperty(
      "mcpServers.eve-online.command",
      "npx",
    );
    expect(
      dom.window.document.querySelectorAll("[data-category][hidden]"),
    ).toHaveLength(0);
    expect(
      element('a[href="https://www.npmjs.com/package/eve-online-mcp"]')
        .textContent,
    ).toContain("View on npm");
    expect(
      element('a[href="https://github.com/HammoTime/eve-online-mcp"]')
        .textContent,
    ).toContain("View on GitHub");
    for (const link of dom.window.document.querySelectorAll<HTMLAnchorElement>(
      'a[href^="#"]',
    )) {
      expect(
        dom.window.document.getElementById(link.hash.slice(1)),
      ).not.toBeNull();
    }
    expect(
      dom.window.document.querySelectorAll(
        "[style], [onclick], sc-for, sc-if, x-dc, script:not([src])",
      ),
    ).toHaveLength(0);
  });

  it("matches the independently maintained tool catalogue", () => {
    const catalogue = JSON.parse(
      readFileSync(
        new URL("../content/tool-catalog.json", import.meta.url),
        "utf8",
      ),
    ) as { tools: string[] };
    const { dom } = page(undefined, false);
    const shown = [
      ...dom.window.document.querySelectorAll(".capability li code"),
    ].map((item) => item.textContent);
    expect(shown.sort()).toEqual([...catalogue.tools].sort());
    expect(
      Number(dom.window.document.querySelector(".stats dd")?.textContent),
    ).toBe(catalogue.tools.length);
    expect(
      dom.window.document.querySelector('[data-category="universe"]')
        ?.textContent,
    ).toContain("neighborhood");
  });
  it("explains renderer boundaries, local storage and conditional preview without JavaScript", () => {
    const { element } = page(undefined, false);
    const capability = element(
      '[data-category="universe"]',
    ).textContent?.replace(/\s+/g, " ");
    expect(capability).toContain("plan_eve_route");
    expect(capability).toContain("explicit boundary");
    expect(capability).toContain("points of interest");
    expect(capability).toContain("routeId");
    expect(capability).toContain("Raw route arrays are rejected");
    const maps = element("#map-artifacts").textContent?.replace(/\s+/g, " ");
    expect(maps).toContain("original SVG through its MCP resource URI");
    expect(maps).toContain("stored locally");
    expect(maps).toContain(
      "expire after seven days or earlier storage eviction",
    );
    expect(maps).toContain(
      "PNG preview is included when the host adapter succeeds",
    );
    expect(maps).toContain(
      "Preview failures preserve the SVG with an explicit warning",
    );
    const faq = element("#faq").textContent?.replace(/\s+/g, " ");
    expect(faq).toContain(
      "local JSON file protected by filesystem permissions",
    );
    expect(faq).toContain("not encrypted");
    expect(faq).toContain("EVE access tokens stay in server memory");
    expect(faq).toContain(
      "Map rendering needs no EVE login and makes no ESI calls",
    );
  });

  it("promotes the npm modules without service sign-in or remote endpoint links", () => {
    const { dom } = page();
    const notFound = readFileSync(
      new URL("../public/404.html", import.meta.url),
      "utf8",
    );
    for (const content of [html, script, notFound]) {
      expect(content).not.toMatch(
        /hosted|Spark|gemini|Cloudflare|\/account|\/mcp\b/i,
      );
    }
    const links = [
      ...dom.window.document.querySelectorAll<HTMLAnchorElement>("a[href]"),
    ];
    for (const link of links.filter(
      (item) => item.origin !== dom.window.location.origin,
    )) {
      expect([
        "https://github.com/HammoTime/eve-online-mcp",
        "https://www.npmjs.com/package/eve-online-mcp",
        "https://developers.eveonline.com/",
        "https://ko-fi.com/hammotime",
      ]).toContain(`${link.origin}${link.pathname}`);
    }
  });
});
