const portfolioAssistantBase = new URL(".", document.currentScript?.src || document.baseURI);

document.addEventListener("DOMContentLoaded", initPortfolioAssistant);

function initPortfolioAssistant() {
  if (document.querySelector("[data-portfolio-assistant]")) {
    return;
  }

  const root = document.createElement("div");
  root.className = "portfolio-agent";
  root.dataset.portfolioAssistant = "";
  root.dataset.open = "false";
  root.dataset.state = "idle";
  root.innerHTML = `
    <button class="portfolio-agent__launcher" type="button" aria-expanded="false" aria-controls="portfolio-agent-panel">
      <span class="portfolio-agent__launcher-label" aria-hidden="true">ASK ABOUT JASON</span>
      <span class="portfolio-agent__pet" aria-hidden="true">
        <img class="portfolio-agent__pet-image portfolio-agent__pet-image--idle" src="${new URL("images/portfolio-assistant/index-idle.png", portfolioAssistantBase)}" alt="">
        <span class="portfolio-agent__pet-wave" style="--portfolio-agent-wave-sprite: url('${new URL("images/portfolio-assistant/index-hover-wave-strip.png", portfolioAssistantBase)}')"></span>
        <img class="portfolio-agent__pet-image portfolio-agent__pet-image--thinking" src="${new URL("images/portfolio-assistant/index-thinking.png", portfolioAssistantBase)}" alt="">
      </span>
      <span class="sr-only">Open the portfolio assistant</span>
    </button>

    <aside class="portfolio-agent__panel" id="portfolio-agent-panel" aria-hidden="true" aria-labelledby="portfolio-agent-title">
      <header class="portfolio-agent__header">
        <h2 id="portfolio-agent-title">Ask Jason</h2>
        <button class="portfolio-agent__close" type="button">Close</button>
      </header>

      <div class="portfolio-agent__body">
        <section class="portfolio-agent__welcome" data-agent-welcome>
          <p data-agent-welcome-copy>Loading the approved portfolio index.</p>
          <div class="portfolio-agent__starters" data-agent-starters aria-label="Suggested questions"></div>
        </section>

        <section class="portfolio-agent__result" data-agent-result aria-live="polite" aria-busy="false" hidden>
          <p class="portfolio-agent__question" data-agent-question></p>
          <section class="portfolio-agent__thinking-scene" data-agent-thinking hidden aria-label="Thinking through the portfolio">
            <div class="portfolio-agent__thought-orbit" aria-hidden="true">
              <img class="portfolio-agent__thought-orbit-image" src="${new URL("images/portfolio-assistant/thought-orbit-inactive.png", portfolioAssistantBase)}" alt="">
              <img class="portfolio-agent__thought-active" src="${new URL("images/portfolio-assistant/thought-grid-active.png", portfolioAssistantBase)}" alt="">
              <img class="portfolio-agent__thinking-pet" src="${new URL("images/portfolio-assistant/index-thinking.png", portfolioAssistantBase)}" alt="">
            </div>
            <p class="portfolio-agent__thinking-label">Thinking through the portfolio...</p>
            <p class="sr-only" data-agent-progress-live></p>
          </section>
          <div class="portfolio-agent__answer-block">
            <p class="portfolio-agent__answer" data-agent-answer></p>
          </div>
          <details class="portfolio-agent__sources" data-agent-sources hidden>
            <summary data-agent-sources-summary>View sources</summary>
            <div data-agent-source-list></div>
          </details>
        </section>
      </div>

      <form class="portfolio-agent__form" data-agent-form>
        <label class="sr-only" for="portfolio-agent-query">Ask Jason a question</label>
        <div class="portfolio-agent__input-row">
          <input id="portfolio-agent-query" data-agent-input name="question" type="text" maxlength="500" autocomplete="off" placeholder="Ask about Jason's work...">
          <button type="submit" aria-label="Send question">Send</button>
        </div>
        <p class="sr-only" data-agent-helper aria-live="polite">Answers use approved portfolio material only.</p>
      </form>
    </aside>
  `;

  document.body.appendChild(root);

  const launcher = root.querySelector(".portfolio-agent__launcher");
  const panel = root.querySelector(".portfolio-agent__panel");
  const closeButton = root.querySelector(".portfolio-agent__close");
  const form = root.querySelector("[data-agent-form]");
  const input = root.querySelector("[data-agent-input]");
  const welcome = root.querySelector("[data-agent-welcome]");
  const welcomeCopy = root.querySelector("[data-agent-welcome-copy]");
  const starters = root.querySelector("[data-agent-starters]");
  const result = root.querySelector("[data-agent-result]");
  const questionOutput = root.querySelector("[data-agent-question]");
  const answerOutput = root.querySelector("[data-agent-answer]");
  const thinkingScene = root.querySelector("[data-agent-thinking]");
  const progressLive = root.querySelector("[data-agent-progress-live]");
  const sources = root.querySelector("[data-agent-sources]");
  const sourceSummary = root.querySelector("[data-agent-sources-summary]");
  const sourceList = root.querySelector("[data-agent-source-list]");
  const helper = root.querySelector("[data-agent-helper]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let knowledge = null;
  let activeContext = getPortfolioAssistantContext();
  let returnFocus = null;
  let activeSequence = 0;
  let activeRequestController = null;
  const assistantEndpoint = window.PORTFOLIO_ASSISTANT_API_URL
    || document.querySelector('meta[name="portfolio-assistant-endpoint"]')?.content
    || new URL("api/portfolio-assistant", portfolioAssistantBase).href;
  const visitorId = getVisitorId();

  panel.inert = true;

  function getPortfolioAssistantContext() {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes("funfetti-events-case-study")) return "funfetti";
    if (path.includes("open-source-san-jose-case-study")) return "open-source-san-jose";
    if (path.includes("bizznest-personal-links-builder")) return "bizznest";
    if (path.includes("music")) return "music";
    if (path.includes("design-system")) return "style-guide";
    if (path.includes("sandbox") || path.includes("/void/")) return "experiments";
    if (hash === "#experiments" || document.body.dataset.workFilter === "experiments") return "experiments";
    if (path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("index.html")) return "home";
    return "global";
  }

  function updateContext() {
    activeContext = getPortfolioAssistantContext();
    const context = knowledge?.contexts?.[activeContext] || knowledge?.contexts?.global;
    renderStarters(context?.starters || []);
  }

  function renderStarters(items) {
    starters.replaceChildren();

    items.slice(0, 3).forEach((question) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "portfolio-agent__starter";
      button.textContent = question;
      button.addEventListener("click", () => submitQuestion(question));
      starters.appendChild(button);
    });
  }

  function setOpen(nextOpen) {
    root.dataset.open = String(nextOpen);
    launcher.setAttribute("aria-expanded", String(nextOpen));
    panel.setAttribute("aria-hidden", String(!nextOpen));
    panel.inert = !nextOpen;
    document.body.classList.toggle("portfolio-agent-open", nextOpen);

    if (nextOpen) {
      returnFocus = document.activeElement;
      window.requestAnimationFrame(() => input.focus());
      return;
    }

    root.dataset.state = "idle";
    const focusTarget = returnFocus instanceof HTMLElement ? returnFocus : launcher;
    focusTarget.focus({ preventScroll: true });
  }

  function normalizeQuery(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function keywordMatches(query, keyword) {
    const normalizedKeyword = normalizeQuery(keyword);
    if (!normalizedKeyword) return false;
    if (normalizedKeyword.includes(" ")) return query.includes(normalizedKeyword);
    return query.split(" ").includes(normalizedKeyword);
  }

  function findEntry(query) {
    if (!knowledge?.entries?.length) return null;
    const normalized = normalizeQuery(query);
    let best = null;
    let bestScore = 0;

    knowledge.entries.forEach((entry) => {
      let score = 0;
      entry.keywords.forEach((keyword) => {
        if (keywordMatches(normalized, keyword)) {
          score += keyword.includes(" ") ? 3 : 1;
        }
      });

      if (score > 0 && entry.contexts?.includes(activeContext)) {
        score += 2;
      }

      if (score > bestScore) {
        best = entry;
        bestScore = score;
      }
    });

    return bestScore > 0 ? best : null;
  }

  function getVisitorId() {
    const storageKey = "portfolio-assistant-visitor";
    const generated = window.crypto?.randomUUID?.()
      || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    try {
      const existing = window.sessionStorage.getItem(storageKey);
      if (existing) return existing;
      window.sessionStorage.setItem(storageKey, generated);
    } catch {
      // A session-only identifier is optional when storage is unavailable.
    }

    return generated;
  }

  function localAnswer(entry) {
    return {
      answer: entry?.answer || knowledge?.assistant?.fallback || "Honestly, I don't have that information in the portfolio, so I don't want to make something up.",
      sources: entry?.sources || [],
      project: entry?.project || null,
      insufficientEvidence: !entry,
      mode: "local"
    };
  }

  function validAssistantAnswer(payload) {
    return payload
      && typeof payload.answer === "string"
      && Array.isArray(payload.sources)
      && payload.sources.every((source) => (
        source
        && typeof source.label === "string"
        && typeof source.href === "string"
      ));
  }

  async function requestAssistantAnswer(question, fallbackEntry, controller) {
    const timeout = window.setTimeout(() => controller.abort(), 13500);

    try {
      const response = await fetch(assistantEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context: activeContext,
          visitorId
        }),
        credentials: "omit",
        referrerPolicy: "strict-origin-when-cross-origin",
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`Portfolio assistant failed with ${response.status}`);
      const payload = await response.json();
      if (!validAssistantAnswer(payload)) throw new Error("Portfolio assistant returned an invalid answer");
      return payload;
    } catch {
      return localAnswer(fallbackEntry);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function renderSources(answer) {
    sourceList.replaceChildren();
    const sourceItems = answer?.sources || [];
    sources.hidden = sourceItems.length === 0;
    sources.open = false;
    sourceSummary.textContent = `View ${sourceItems.length} ${sourceItems.length === 1 ? "source" : "sources"}`;

    sourceItems.forEach((source) => {
      const link = document.createElement("a");
      link.href = new URL(source.href, portfolioAssistantBase);
      link.textContent = source.label;
      sourceList.appendChild(link);
    });
  }

  function showAnswer(question, answer) {
    const sourceCount = answer?.sources?.length || 0;
    questionOutput.textContent = question;
    thinkingScene.hidden = true;
    root.dataset.thinkingPhase = "complete";
    root.dataset.answerMode = answer?.mode || "local";
    answerOutput.textContent = answer?.answer || knowledge?.assistant?.fallback || "Honestly, I don't have that information in the portfolio, so I don't want to make something up.";
    renderSources(answer);
    welcome.hidden = true;
    result.hidden = false;
    result.setAttribute("aria-busy", "false");
    root.querySelector(".portfolio-agent__answer-block").hidden = false;
    helper.textContent = sourceCount > 0
      ? "Answer ready. Supporting portfolio sources are available."
      : "The portfolio does not include enough information for that question.";
    root.dataset.state = "presenting";
  }

  function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  async function runThinkingSequence(sequence, question, answerPromise) {
    const thinkingMessages = [
      "Considering the question",
      "Reviewing the portfolio",
      "Connecting the strongest match",
      "Writing the answer"
    ];
    const phaseDelay = 410;

    for (let index = 0; index < thinkingMessages.length; index += 1) {
      if (sequence !== activeSequence) return;

      root.dataset.thinkingPhase = String(index + 1);
      progressLive.textContent = thinkingMessages[index];

      if (!reduceMotion.matches) {
        await wait(index === thinkingMessages.length - 1 ? 620 : phaseDelay);
      }
    }

    const answer = await answerPromise;
    if (sequence !== activeSequence) return;
    progressLive.textContent = "Portfolio answer ready";
    showAnswer(question, answer);
  }

  function submitQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed) {
      helper.textContent = "Enter a question about Jason's portfolio.";
      input.focus();
      return;
    }

    input.value = "";
    const sequence = activeSequence + 1;
    activeSequence = sequence;
    root.dataset.state = "thinking";
    welcome.hidden = true;
    result.hidden = false;
    result.setAttribute("aria-busy", "true");
    questionOutput.textContent = trimmed;
    root.dataset.thinkingPhase = "1";
    thinkingScene.hidden = false;
    answerOutput.textContent = "Checking the approved portfolio index.";
    root.querySelector(".portfolio-agent__answer-block").hidden = true;
    sources.hidden = true;
    helper.textContent = "Thinking through Jason's portfolio.";

    activeRequestController?.abort();
    activeRequestController = new AbortController();
    const entry = findEntry(trimmed);
    const answerPromise = requestAssistantAnswer(trimmed, entry, activeRequestController);
    runThinkingSequence(sequence, trimmed, answerPromise);
  }

  launcher.addEventListener("click", () => setOpen(root.dataset.open !== "true"));
  closeButton.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuestion(input.value);
  });

  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;

    if (event.key === "/" && !isTyping && root.dataset.open !== "true") {
      event.preventDefault();
      setOpen(true);
    }
  });

  document.querySelectorAll("[data-work-filter-button]").forEach((button) => {
    button.addEventListener("click", () => window.requestAnimationFrame(updateContext));
  });
  window.addEventListener("hashchange", updateContext);

  fetch(new URL("data/portfolio-assistant-knowledge.json?v=portfolio-agent-3", portfolioAssistantBase))
    .then((response) => {
      if (!response.ok) throw new Error(`Portfolio index failed with ${response.status}`);
      return response.json();
    })
    .then((data) => {
      knowledge = data;
      welcomeCopy.textContent = data.assistant.welcome;
      updateContext();
      helper.textContent = "Answers use approved portfolio material only.";
    })
    .catch(() => {
      welcomeCopy.textContent = "The approved portfolio index is unavailable right now.";
      helper.textContent = "You can still browse the portfolio normally.";
      form.querySelector("button[type='submit']").disabled = true;
      input.disabled = true;
    });
}
