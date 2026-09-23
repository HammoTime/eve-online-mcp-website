const config = document.getElementById("mcp-config");
const copyConfig = document.getElementById("copy-config");
const copyStatus = document.getElementById("copy-status");

async function copyText(text, status, success, fallback) {
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = success;
  } catch {
    status.textContent = fallback;
  }
}

if (config && copyConfig && copyStatus) {
  copyConfig.hidden = false;
  copyConfig.addEventListener("click", () =>
    copyText(
      config.textContent,
      copyStatus,
      "Configuration copied. Add it to your MCP client’s settings.",
      "Select and copy the configuration above.",
    ),
  );
}

const filters = document.querySelector(".filters");
const filterStatus = document.getElementById("filter-status");
if (filters && filterStatus) {
  const buttons = filters.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  filters.hidden = false;
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      for (const item of buttons)
        item.setAttribute("aria-pressed", String(item === button));
      let count = 0;
      for (const card of cards) {
        card.hidden = category !== "all" && card.dataset.category !== category;
        if (!card.hidden) count += 1;
      }
      filterStatus.textContent = `Showing ${count} ${count === 1 ? "capability" : "capabilities"}.`;
    });
  }
}

const selectedExample = document.getElementById("selected-example");
const selectedPrompt = document.getElementById("selected-prompt");
const promptStatus = document.getElementById("prompt-status");
const copyPrompt = document.getElementById("copy-prompt");
const quickstartTitle = document.getElementById("quickstart-title");
if (
  selectedExample &&
  selectedPrompt &&
  promptStatus &&
  copyPrompt &&
  quickstartTitle
) {
  for (const link of document.querySelectorAll("[data-example]")) {
    link.addEventListener("click", () => {
      const article = link.closest("article");
      const question = article?.querySelector("h3, .terminal-question");
      if (!question) return;
      selectedPrompt.textContent = question.textContent
        .trim()
        .replace(/^[“›]\s*|”$/g, "")
        .replace(/\s+/g, " ")
        .trim();
      selectedExample.hidden = false;
      promptStatus.textContent = "";
      quickstartTitle.focus({ preventScroll: true });
    });
  }
  copyPrompt.addEventListener("click", () =>
    copyText(
      selectedPrompt.textContent,
      promptStatus,
      "Prompt copied. Use it in your assistant after connecting the server.",
      "Select and copy the example question above.",
    ),
  );
}
