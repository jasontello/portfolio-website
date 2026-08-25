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
        <div>
          <p class="portfolio-agent__index">INDEX / READY</p>
          <h2 id="portfolio-agent-title">Portfolio Index</h2>
        </div>
        <button class="portfolio-agent__close" type="button">Close</button>
      </header>

      <div class="portfolio-agent__body">
        <div class="portfolio-agent__context-row">
          <span>CONTEXT</span>
          <strong data-agent-context>GLOBAL</strong>
        </div>

        <section class="portfolio-agent__welcome" data-agent-welcome>
          <p data-agent-welcome-copy>Loading the approved portfolio index.</p>
          <div class="portfolio-agent__starters" data-agent-starters aria-label="Suggested questions"></div>
        </section>

        <section class="portfolio-agent__result" data-agent-result aria-live="polite" aria-busy="false" hidden>
          <p class="portfolio-agent__question" data-agent-question></p>
          <section class="portfolio-agent__diagnostic" data-agent-diagnostic hidden aria-label="Portfolio search progress">
            <p class="portfolio-agent__diagnostic-label">PACKET ROUTE</p>
            <ol class="portfolio-agent__diagnostic-stages">
              <li class="portfolio-agent__diagnostic-stage" data-agent-stage data-status="waiting">
                <span class="portfolio-agent__stage-index">01</span>
                <span class="portfolio-agent__stage-name">Parse query</span>
                <span class="portfolio-agent__stage-time">018 ms</span>
                <span class="portfolio-agent__stage-status">WAIT</span>
              </li>
              <li class="portfolio-agent__diagnostic-stage" data-agent-stage data-status="waiting">
                <span class="portfolio-agent__stage-index">02</span>
                <span class="portfolio-agent__stage-name">Scan index</span>
                <span class="portfolio-agent__stage-time">042 ms</span>
                <span class="portfolio-agent__stage-status">WAIT</span>
              </li>
              <li class="portfolio-agent__diagnostic-stage" data-agent-stage data-status="waiting">
                <span class="portfolio-agent__stage-index">03</span>
                <span class="portfolio-agent__stage-name">Rank match</span>
                <span class="portfolio-agent__stage-time">063 ms</span>
                <span class="portfolio-agent__stage-status">WAIT</span>
              </li>
              <li class="portfolio-agent__diagnostic-stage" data-agent-stage data-status="waiting">
                <span class="portfolio-agent__stage-index">04</span>
                <span class="portfolio-agent__stage-name">Ground answer</span>
                <span class="portfolio-agent__stage-time">--- ms</span>
                <span class="portfolio-agent__stage-status">WAIT</span>
              </li>
            </ol>
            <img class="portfolio-agent__diagnostic-pet" src="${new URL("images/portfolio-assistant/index-thinking.png", portfolioAssistantBase)}" alt="" aria-hidden="true">
            <div class="portfolio-agent__diagnostic-preview" aria-hidden="true">
              <p>Resolving answer</p>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="portfolio-agent__diagnostic-source-preview" aria-hidden="true">
              <p>Sources</p>
              <span>Preparing source 01</span>
              <span>Preparing source 02</span>
            </div>
            <p class="sr-only" data-agent-progress-live></p>
          </section>
          <div class="portfolio-agent__answer-block">
            <p class="portfolio-agent__answer-meta" data-agent-answer-meta>ANSWER</p>
            <p class="portfolio-agent__answer" data-agent-answer></p>
          </div>
          <div class="portfolio-agent__sources" data-agent-sources hidden>
            <p>Sources</p>
            <div data-agent-source-list></div>
          </div>
          <a class="portfolio-agent__match" data-agent-match href="./index.html" hidden>
            <span class="portfolio-agent__match-meta">MATCH / 01</span>
            <span class="portfolio-agent__match-content">
              <img data-agent-match-image src="" alt="">
              <span>
                <strong data-agent-match-title></strong>
                <span data-agent-match-label></span>
              </span>
            </span>
          </a>
        </section>
      </div>

      <form class="portfolio-agent__form" data-agent-form>
        <label for="portfolio-agent-query">Ask a question</label>
        <div class="portfolio-agent__input-row">
          <input id="portfolio-agent-query" data-agent-input name="question" type="text" maxlength="500" autocomplete="off" placeholder="Projects, process, experience...">
          <button type="submit">Ask</button>
        </div>
        <p class="portfolio-agent__helper" data-agent-helper>Answers use approved portfolio material only.</p>
      </form>
    </aside>
  `;

  document.body.appendChild(root);

  const launcher = root.querySelector(".portfolio-agent__launcher");
  const panel = root.querySelector(".portfolio-agent__panel");
  const closeButton = root.querySelector(".portfolio-agent__close");
  const form = root.querySelector("[data-agent-form]");
  const input = root.querySelector("[data-agent-input]");
  const contextLabel = root.querySelector("[data-agent-context]");
  const welcome = root.querySelector("[data-agent-welcome]");
  const welcomeCopy = root.querySelector("[data-agent-welcome-copy]");
  const starters = root.querySelector("[data-agent-starters]");
  const result = root.querySelector("[data-agent-result]");
  const questionOutput = root.querySelector("[data-agent-question]");
  const answerMeta = root.querySelector("[data-agent-answer-meta]");
  const answerOutput = root.querySelector("[data-agent-answer]");
  const diagnostic = root.querySelector("[data-agent-diagnostic]");
  const diagnosticStages = Array.from(root.querySelectorAll("[data-agent-stage]"));
  const progressLive = root.querySelector("[data-agent-progress-live]");
  const sources = root.querySelector("[data-agent-sources]");
  const sourceList = root.querySelector("[data-agent-source-list]");
  const matchLink = root.querySelector("[data-agent-match]");
  const matchImage = root.querySelector("[data-agent-match-image]");
  const matchTitle = root.querySelector("[data-agent-match-title]");
  const matchLabel = root.querySelector("[data-agent-match-label]");
  const helper = root.querySelector("[data-agent-helper]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let knowledge = null;
  let activeContext = getPortfolioAssistantContext();
  let returnFocus = null;
  let activeSequence = 0;

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
    contextLabel.textContent = context?.label || "GLOBAL";
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

  function renderSources(entry) {
    sourceList.replaceChildren();
    const sourceItems = entry?.sources || [];
    sources.hidden = sourceItems.length === 0;

    sourceItems.forEach((source, index) => {
      const link = document.createElement("a");
      link.href = new URL(source.href, portfolioAssistantBase);
      link.textContent = `${String(index + 1).padStart(2, "0")} / ${source.label}`;
      sourceList.appendChild(link);
    });

    if (entry?.project) {
      if (entry.project.image) {
        matchLink.href = new URL(entry.project.href, portfolioAssistantBase);
        matchImage.src = new URL(entry.project.image, portfolioAssistantBase);
        matchImage.alt = "";
        matchTitle.textContent = entry.project.title || entry.project.label;
        matchLabel.textContent = entry.project.label;
        matchLink.hidden = false;
      } else {
        matchLink.hidden = true;
      }
    } else {
      matchLink.hidden = true;
    }
  }

  function showAnswer(question, entry) {
    const sourceCount = entry?.sources?.length || 0;
    questionOutput.textContent = question;
    diagnostic.hidden = true;
    root.dataset.diagnosticStage = "complete";
    answerOutput.textContent = entry?.answer || knowledge?.assistant?.fallback || "Honestly, I don't have that information in the portfolio, so I don't want to make something up.";
    answerMeta.textContent = sourceCount > 0
      ? `ANSWER / GROUNDED IN ${sourceCount} ${sourceCount === 1 ? "SOURCE" : "SOURCES"}`
      : "ANSWER / INSUFFICIENT INFORMATION";
    renderSources(entry);
    welcome.hidden = true;
    result.hidden = false;
    result.setAttribute("aria-busy", "false");
    helper.textContent = sourceCount > 0
      ? "Open a source to inspect the supporting portfolio material."
      : "Try asking about my projects, experience, education, tools, or experiments.";
    root.dataset.state = "presenting";
  }

  function wait(duration) {
    return new Promise((resolve) => window.setTimeout(resolve, duration));
  }

  function resetDiagnosticStages() {
    diagnosticStages.forEach((stage) => {
      stage.dataset.status = "waiting";
      stage.querySelector(".portfolio-agent__stage-status").textContent = "WAIT";
    });
    root.dataset.diagnosticStage = "0";
  }

  async function runDiagnosticSequence(sequence, question, entry) {
    const stageNames = ["Parsing question", "Scanning portfolio index", "Ranking portfolio matches", "Grounding answer in sources"];
    const stageDelay = 410;

    for (let index = 0; index < diagnosticStages.length; index += 1) {
      if (sequence !== activeSequence) return;

      diagnosticStages.forEach((stage, stageIndex) => {
        if (stageIndex < index) {
          stage.dataset.status = "complete";
          stage.querySelector(".portfolio-agent__stage-status").textContent = "DONE";
        } else if (stageIndex === index) {
          stage.dataset.status = "active";
          stage.querySelector(".portfolio-agent__stage-status").textContent = "LIVE";
        } else {
          stage.dataset.status = "waiting";
          stage.querySelector(".portfolio-agent__stage-status").textContent = "WAIT";
        }
      });

      root.dataset.diagnosticStage = String(index + 1);
      progressLive.textContent = stageNames[index];

      if (!reduceMotion.matches) {
        await wait(index === diagnosticStages.length - 1 ? 620 : stageDelay);
      }
    }

    if (sequence !== activeSequence) return;
    diagnosticStages.forEach((stage) => {
      stage.dataset.status = "complete";
      stage.querySelector(".portfolio-agent__stage-status").textContent = "DONE";
    });
    progressLive.textContent = "Portfolio answer ready";
    showAnswer(question, entry);
  }

  function submitQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed) {
      helper.textContent = "Enter a question about Jason's portfolio.";
      input.focus();
      return;
    }

    input.value = trimmed;
    const sequence = activeSequence + 1;
    activeSequence = sequence;
    root.dataset.state = "thinking";
    welcome.hidden = true;
    result.hidden = false;
    result.setAttribute("aria-busy", "true");
    questionOutput.textContent = trimmed;
    resetDiagnosticStages();
    diagnostic.hidden = false;
    answerMeta.textContent = "PROCESSING / APPROVED INDEX";
    answerOutput.textContent = "Checking the approved portfolio index.";
    root.querySelector(".portfolio-agent__answer-block").hidden = true;
    sources.hidden = true;
    matchLink.hidden = true;
    helper.textContent = "Tracing the question through approved portfolio material.";

    const entry = findEntry(trimmed);
    runDiagnosticSequence(sequence, trimmed, entry).then(() => {
      if (sequence === activeSequence) {
        root.querySelector(".portfolio-agent__answer-block").hidden = false;
      }
    });
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
