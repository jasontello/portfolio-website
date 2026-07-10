const codeRainCanvas = document.querySelector(".code-rain-canvas");

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link-fx");

  navLinks.forEach((link) => {
    const text = (link.textContent || "").trim();
    renderSplitText(link, text);
  });

  initResumeModal();
  initCurrentPageLinks();
  initNameFaceReaction();
  initSandboxTransition();
  initBizznestThumbAnimation();
  initFullscreenLayout();
  initSpotifyTopTracks();
  initCaseStudyReveal();
});

function renderSplitText(element, text) {
  element.textContent = "";
  element.setAttribute("aria-label", text);

  const original = document.createElement("span");
  original.className = "nav-word nav-word--original";
  original.setAttribute("aria-hidden", "true");

  const clone = document.createElement("span");
  clone.className = "nav-word nav-word--clone";
  clone.setAttribute("aria-hidden", "true");

  text.split("").forEach((char, index) => {
    const topChar = document.createElement("span");
    topChar.className = "char";
    topChar.style.setProperty("--char-index", String(index));
    topChar.textContent = char === " " ? "\u00A0" : char;

    const bottomChar = topChar.cloneNode(true);

    original.appendChild(topChar);
    clone.appendChild(bottomChar);
  });

  element.append(original, clone);
}

function initInkCursor() {
  const finePointer = window.matchMedia("(pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!finePointer.matches || reduceMotion.matches) {
    return;
  }

  const cursor = document.createElement("span");
  cursor.className = "ink-cursor";
  cursor.setAttribute("aria-hidden", "true");

  const trailLayer = document.createElement("span");
  trailLayer.className = "ink-cursor-trail-layer";
  trailLayer.setAttribute("aria-hidden", "true");
  document.body.append(trailLayer, cursor);
  document.body.classList.add("has-ink-cursor");

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let previousX = targetX;
  let previousY = targetY;
  let lastTrailX = targetX;
  let lastTrailY = targetY;
  let lastTrailTime = 0;
  let lastPressBurstTime = 0;
  let isVisible = false;
  let isRunning = false;
  let activeDrops = 0;
  const maxDrops = 42;

  const isInteractive = (target) => (
    target instanceof Element &&
    Boolean(target.closest("a, button, input, textarea, select, label, [role='button'], [tabindex]:not([tabindex='-1'])"))
  );

  const isProjectSurface = (target) => (
    target instanceof Element &&
    Boolean(target.closest(".work-card, .sandbox-project-card, .case-study-actions a, .project-modal__links a, .spotify-board__link, .music-shelf a"))
  );

  const isTextSurface = (target) => (
    target instanceof Element &&
    Boolean(target.closest("p, h1, h2, h3, h4, strong, dt, dd, figcaption, li"))
  );

  const syncMood = (target) => {
    const interactive = isInteractive(target);
    const projectSurface = isProjectSurface(target);
    const textSurface = isTextSurface(target);

    cursor.classList.toggle("is-over-interactive", interactive);
    cursor.classList.toggle("is-over-card", projectSurface);
    cursor.classList.toggle("is-over-text", textSurface && !interactive);
  };

  const releaseInk = (x, y, speed = 0, burst = false) => {
    if (activeDrops >= maxDrops) {
      const oldestDrop = trailLayer.firstElementChild;

      if (oldestDrop) {
        oldestDrop.remove();
        activeDrops -= 1;
      }
    }

    const drop = document.createElement("span");
    const size = Math.max(4, Math.min(18, (burst ? 10 : 5) + speed * 0.045 + Math.random() * 7));
    const driftX = (Math.random() - 0.5) * (burst ? 42 : 18);
    const driftY = (Math.random() - 0.5) * (burst ? 34 : 16);
    const duration = Math.round((burst ? 820 : 620) + Math.random() * 360);

    drop.className = "ink-cursor-drop";
    drop.style.setProperty("--x", `${x + (Math.random() - 0.5) * 8}px`);
    drop.style.setProperty("--y", `${y + (Math.random() - 0.5) * 8}px`);
    drop.style.setProperty("--size", `${size}px`);
    drop.style.setProperty("--drift-x", `${driftX}px`);
    drop.style.setProperty("--drift-y", `${driftY}px`);
    drop.style.setProperty("--rotate", `${Math.round(Math.random() * 120 - 60)}deg`);
    drop.style.setProperty("--duration", `${duration}ms`);
    trailLayer.append(drop);
    activeDrops += 1;

    window.setTimeout(() => {
      drop.remove();
      activeDrops = Math.max(0, activeDrops - 1);
    }, duration + 120);
  };

  const render = () => {
    currentX += (targetX - currentX) * 0.24;
    currentY += (targetY - currentY) * 0.24;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    if (isVisible) {
      window.requestAnimationFrame(render);
      return;
    }

    isRunning = false;
  };

  const start = () => {
    if (!isRunning) {
      isRunning = true;
      window.requestAnimationFrame(render);
    }
  };

  const show = (event) => {
    const now = window.performance.now();
    const oldTargetX = targetX;
    const oldTargetY = targetY;
    const speed = Math.hypot(event.clientX - oldTargetX, event.clientY - oldTargetY);
    const trailDistance = Math.hypot(event.clientX - lastTrailX, event.clientY - lastTrailY);

    previousX = oldTargetX;
    previousY = oldTargetY;
    targetX = event.clientX;
    targetY = event.clientY;

    if (!isVisible) {
      currentX = targetX;
      currentY = targetY;
      isVisible = true;
      cursor.classList.add("is-visible");
    }

    if (speed > 2 && trailDistance > 7 && now - lastTrailTime > 24) {
      releaseInk(event.clientX - (event.clientX - previousX) * 0.24, event.clientY - (event.clientY - previousY) * 0.24, speed);
      lastTrailX = event.clientX;
      lastTrailY = event.clientY;
      lastTrailTime = now;
    }

    syncMood(event.target);
    start();
  };

  const hide = () => {
    isVisible = false;
    cursor.classList.remove("is-visible", "is-over-interactive", "is-over-card", "is-over-text", "is-pressed");
  };

  const press = () => {
    const now = window.performance.now();

    if (now - lastPressBurstTime < 90) {
      return;
    }

    lastPressBurstTime = now;
    cursor.classList.add("is-pressed");

    for (let index = 0; index < 7; index += 1) {
      releaseInk(targetX, targetY, 18 + index * 2, true);
    }
  };

  const releasePress = () => {
    cursor.classList.remove("is-pressed");
  };

  document.addEventListener("mousemove", show);
  document.addEventListener("mouseleave", hide);
  document.addEventListener("mouseover", (event) => {
    syncMood(event.target);
  });
  document.addEventListener("pointerdown", press);
  document.addEventListener("mousedown", press);
  document.addEventListener("pointerup", releasePress);
  document.addEventListener("mouseup", releasePress);
  window.addEventListener("blur", hide);
}

function initSandboxTransition() {
  const triggers = document.querySelectorAll(".sandbox-trigger");
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let navigating = false;

  if (!triggers.length) {
    return;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (
        navigating ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
      navigating = true;

      const destination = trigger.href;
      const navigate = () => {
        window.location.href = destination;
      };

      document.body.classList.add("is-page-exiting");

      if (gsap && !reduceMotion) {
        gsap.to(".main-navigation, .main-content", {
          autoAlpha: 0,
          duration: 0.42,
          ease: "power2.inOut",
          onComplete: navigate
        });
        return;
      }

      window.setTimeout(navigate, reduceMotion ? 0 : 420);
    });
  });
}

function initCurrentPageLinks() {
  const currentLinks = document.querySelectorAll(".nav-link-fx[href]");
  const currentPath = normalizePath(window.location.pathname);

  currentLinks.forEach((link) => {
    const linkPath = normalizePath(new URL(link.href, window.location.href).pathname);

    if (linkPath !== currentPath) {
      return;
    }

    link.addEventListener("click", (event) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
    });
  });
}

function initNameFaceReaction() {
  let resetTimer;

  document.querySelectorAll("[data-face-trigger] .name-face").forEach((face) => {
    if (face.dataset.faceReaction) {
      const reactionImage = new Image();
      reactionImage.src = face.dataset.faceReaction;
    }
  });

  const showReaction = (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest("[data-face-trigger]");

    if (!trigger) {
      return;
    }

    const face = trigger.querySelector(".name-face");
    const normalSrc = face?.dataset.faceNormal || face?.getAttribute("src");
    const reactionSrc = face?.dataset.faceReaction;

    if (!face || !normalSrc || !reactionSrc) {
      return;
    }

    window.clearTimeout(resetTimer);
    face.src = reactionSrc;
    trigger.classList.add("is-reacting");

    resetTimer = window.setTimeout(() => {
      face.src = normalSrc;
      trigger.classList.remove("is-reacting");
    }, 850);
  };

  document.addEventListener("pointerdown", showReaction);
  document.addEventListener("mousedown", showReaction);
  document.addEventListener("click", showReaction);
}

function normalizePath(pathname) {
  const withoutTrailingSlash = pathname.replace(/\/+$/, "");

  if (!withoutTrailingSlash || withoutTrailingSlash === "/index.html") {
    return "/index.html";
  }

  return withoutTrailingSlash;
}

function initFullscreenLayout() {
  const toggles = document.querySelectorAll("[data-fullscreen-toggle]");
  const navigation = document.querySelector(".main-navigation");
  const contentNav = document.querySelector(".content-nav");
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  const storageKey = "portfolioContentFullscreen";

  if (!toggles.length || !navigation || !contentNav) {
    return;
  }

  localStorage.removeItem("portfolioSidebarWidth");

  const isStoredActive = () => localStorage.getItem(storageKey) === "true";

  const setToggleState = (isActive) => {
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(isActive));
      toggle.setAttribute("aria-label", isActive ? "Exit fullscreen layout" : "Enter fullscreen layout");
    });
  };

  const applyState = (isActive, shouldStore = true) => {
    const canUseFullscreen = desktopQuery.matches;
    const nextState = canUseFullscreen && isActive;

    document.documentElement.classList.toggle("is-content-fullscreen", nextState);
    document.body.classList.toggle("is-content-fullscreen", nextState);
    navigation.toggleAttribute("inert", nextState);
    navigation.setAttribute("aria-hidden", String(nextState));
    contentNav.toggleAttribute("inert", !nextState);
    contentNav.setAttribute("aria-hidden", String(!nextState));
    setToggleState(nextState);

    if (shouldStore) {
      localStorage.setItem(storageKey, String(isActive));
    }
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextState = !document.body.classList.contains("is-content-fullscreen");
      applyState(nextState);
    });
  });

  const syncFromStorage = () => {
    applyState(isStoredActive(), false);
  };

  window.addEventListener("resize", syncFromStorage);
  syncFromStorage();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("is-fullscreen-restoring");
    });
  });
}

function initResumeModal() {
  const triggers = document.querySelectorAll(".resume-trigger");
  const modal = document.querySelector(".resume-modal");
  const panel = document.querySelector(".resume-modal__panel");
  const closeButtons = document.querySelectorAll("[data-resume-close]");
  const gsap = window.gsap;
  let lastTrigger = null;

  if (!triggers.length || !modal || !panel) {
    return;
  }

  const setExpanded = (value) => {
    triggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", String(value));
    });
  };

  const openModal = (trigger) => {
    lastTrigger = trigger;
    const frame = modal.querySelector(".resume-modal__frame[data-resume-src]");

    if (frame && !frame.dataset.resumeLoaded) {
      frame.src = frame.dataset.resumeSrc;
      frame.dataset.resumeLoaded = "true";
    }

    modal.hidden = false;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setExpanded(true);

    if (gsap) {
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: 24, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
      );
      gsap.fromTo(
        ".resume-modal__backdrop",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.28, ease: "none" }
      );
    }

    const closeButton = modal.querySelector(".resume-modal__close");
    if (closeButton) {
      closeButton.focus();
    }
  };

  const closeModal = () => {
    const finishClose = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      modal.hidden = true;
      setExpanded(false);
      lastTrigger?.focus();
    };

    if (gsap && modal.classList.contains("is-open")) {
      gsap.to(panel, {
        autoAlpha: 0,
        y: 18,
        scale: 0.985,
        duration: 0.24,
        ease: "power2.in",
        onComplete: finishClose
      });
      gsap.to(".resume-modal__backdrop", {
        autoAlpha: 0,
        duration: 0.18,
        ease: "none"
      });
      return;
    }

    finishClose();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function initSpotifyTopTracks() {
  const trackListContainer = document.querySelector("[data-spotify-top-tracks]");
  const shelfContainer = document.querySelector("[data-spotify-shelf-cases]");
  const shelfPlayer = document.querySelector("[data-spotify-shelf-player]");
  const shelfEmbed = document.querySelector("[data-spotify-shelf-embed]");
  const shelfPlayerTitle = document.querySelector("[data-spotify-shelf-title]");
  const shelfPlayerMeta = document.querySelector("[data-spotify-shelf-meta]");
  const shelfPlayerLink = document.querySelector("[data-spotify-shelf-link]");

  if (!trackListContainer && !shelfContainer) {
    return;
  }

  const renderStatus = (container, message, className) => {
    if (!container) {
      return;
    }

    container.replaceChildren();
    const status = document.createElement("p");
    status.className = className;
    status.textContent = message;
    container.append(status);
  };

  const getArtists = (track) => Array.isArray(track.artists) ? track.artists.join(", ") : "";
  const getSpotifyTrackId = (track) => {
    if (track.id) {
      return track.id;
    }

    const match = track.spotifyUrl?.match(/\/track\/([^/?]+)/);
    return match ? match[1] : "";
  };

  const setShelfPlayerText = (element, text, animate = true) => {
    if (!element) {
      return;
    }

    const settleText = () => {
      element.classList.remove("shelf-selection-fx", "is-swapping");
      element.textContent = text;
      element.setAttribute("aria-label", text);
    };

    window.clearTimeout(element.shelfSelectionTimer);

    if (!animate) {
      settleText();
      return;
    }

    element.classList.add("shelf-selection-fx");
    element.classList.remove("is-swapping");
    renderSplitText(element, text);

    window.requestAnimationFrame(() => {
      element.classList.add("is-swapping");
    });

    element.shelfSelectionTimer = window.setTimeout(settleText, 720);
  };

  const showShelfPlayer = (track, options = {}) => {
    if (!shelfPlayer || !shelfEmbed || !track.spotifyUrl) {
      return false;
    }

    const trackId = getSpotifyTrackId(track);

    if (!trackId) {
      return false;
    }

    const artists = getArtists(track);
    const title = track.name || "Spotify track";

    shelfPlayer.hidden = false;
    shelfPlayer.classList.add("is-visible");
    shelfEmbed.src = `https://open.spotify.com/embed/track/${encodeURIComponent(trackId)}?utm_source=generator`;
    shelfEmbed.title = `Spotify player for ${title}`;

    setShelfPlayerText(shelfPlayerTitle, title, options.animate !== false);
    setShelfPlayerText(
      shelfPlayerMeta,
      artists ? `${artists}${track.album ? ` · ${track.album}` : ""}` : track.album || "",
      options.animate !== false
    );

    if (shelfPlayerLink) {
      shelfPlayerLink.href = track.spotifyUrl;
    }

    return true;
  };

  const syncActiveShelfTrack = (track) => {
    if (!shelfContainer) {
      return;
    }

    const selectedTrackId = getSpotifyTrackId(track);
    let matchingShelfCase = null;

    shelfContainer.querySelectorAll(".shelf-cd.is-active").forEach((item) => {
      item.classList.remove("is-active");
    });

    shelfContainer.querySelectorAll(".shelf-cd").forEach((item) => {
      const itemTrackId = getSpotifyTrackId({ spotifyUrl: item.href });

      if (itemTrackId && itemTrackId === selectedTrackId) {
        matchingShelfCase = item;
      }
    });

    matchingShelfCase?.classList.add("is-active");
  };

  const renderTracks = (tracks, updatedAt) => {
    if (!trackListContainer) {
      return;
    }

    trackListContainer.replaceChildren();

    const list = document.createElement("ol");
    list.className = "top-tracks__list";

    tracks.slice(0, 10).forEach((track, index) => {
      const item = document.createElement("li");
      item.className = "top-track";

      const number = document.createElement("span");
      number.className = "top-track__number";
      number.textContent = String(index + 1).padStart(2, "0");

      const artworkButton = document.createElement("button");
      artworkButton.className = "top-track__artwork-button";
      artworkButton.type = "button";
      artworkButton.setAttribute("aria-label", `Play ${track.name} by ${getArtists(track)} in the Spotify player`);
      artworkButton.addEventListener("click", () => {
        if (showShelfPlayer(track)) {
          syncActiveShelfTrack(track);
        }
      });

      const artwork = document.createElement("img");
      artwork.className = "top-track__artwork";
      artwork.src = track.albumImage || "./images/walltexture.jpg";
      artwork.alt = track.album ? `${track.album} album cover` : "";
      artwork.loading = "lazy";
      artworkButton.append(artwork);

      const details = document.createElement("div");
      details.className = "top-track__details";

      const title = document.createElement("a");
      title.className = "top-track__title";
      title.href = track.spotifyUrl;
      title.target = "_blank";
      title.rel = "noreferrer";
      title.textContent = track.name;

      const artist = document.createElement("p");
      artist.className = "top-track__artist";
      artist.textContent = getArtists(track);

      const album = document.createElement("p");
      album.className = "top-track__album";
      album.textContent = track.album;

      details.append(title, artist, album);
      item.append(number, artworkButton, details);
      list.append(item);
    });

    const meta = document.createElement("p");
    meta.className = "top-tracks__meta";
    meta.textContent = updatedAt ? `Updated ${formatSpotifyDate(updatedAt)}` : "Spotify short-term top tracks";

    trackListContainer.append(list, meta);
  };

  const renderShelf = (tracks) => {
    if (!shelfContainer) {
      return;
    }

    shelfContainer.replaceChildren();

    tracks.slice(0, 3).forEach((track, index) => {
      const caseLink = document.createElement("a");
      caseLink.className = `shelf-cd shelf-cd--${index + 1}`;
      caseLink.href = track.spotifyUrl;
      caseLink.target = "_blank";
      caseLink.rel = "noreferrer";
      caseLink.setAttribute("aria-label", `Play ${track.name} by ${getArtists(track)} on Spotify`);
      caseLink.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        if (!showShelfPlayer(track)) {
          return;
        }

        event.preventDefault();
        syncActiveShelfTrack(track);
      });

      const artwork = document.createElement("img");
      artwork.className = "shelf-cd__artwork";
      artwork.src = track.albumImage || "./images/walltexture.jpg";
      artwork.alt = "";
      artwork.loading = "lazy";

      caseLink.append(artwork);
      shelfContainer.append(caseLink);
    });

    const firstTrack = tracks[0];
    const firstCase = shelfContainer.querySelector(".shelf-cd");

    if (firstTrack && showShelfPlayer(firstTrack, { animate: false }) && firstCase) {
      syncActiveShelfTrack(firstTrack);
    }
  };

  fetch("./data/spotify-top-tracks.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Top tracks data is not available.");
      }

      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data.tracks) || data.tracks.length === 0) {
        renderStatus(trackListContainer, "Spotify sync is ready, but no top tracks have been published yet.", "top-tracks__status");
        renderStatus(shelfContainer, "Spotify sync is ready.", "music-shelf__status");
        return;
      }

      renderTracks(data.tracks, data.updatedAt);
      renderShelf(data.tracks);
    })
    .catch(() => {
      renderStatus(trackListContainer, "Spotify top tracks will appear here after the first sync.", "top-tracks__status");
      renderStatus(shelfContainer, "Top tracks will appear here after Spotify sync.", "music-shelf__status");
    });
}

function formatSpotifyDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function initCaseStudyReveal() {
  const page = document.querySelector(".case-study-page");

  if (!page) {
    return;
  }

  const revealItems = page.querySelectorAll(`
    .case-study-hero__meta,
    .case-study-hero__intro,
    .case-study-figure--wide,
    .case-study-section,
    .case-study-media-grid > *,
    .case-study-feature-grid > *,
    .case-study-audit-list > *,
    .case-study-flow-steps > *,
    .case-study-list > li
  `);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!revealItems.length || reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  revealItems.forEach((item, index) => {
    item.classList.add("case-study-reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12
  });

  revealItems.forEach((item) => observer.observe(item));
}

function initCodeRain(canvas) {
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const characters = "01{}<>/\\[]#+=_OSJSANJOSETECHCIVICDATA".split("");
  const columnWidth = 22;
  let columns = [];
  let animationFrame = null;
  let frame = 0;

  function getCanvasSize() {
    const rect = canvas.getBoundingClientRect();

    return {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height)
    };
  }

  function resize() {
    const { width, height } = getCanvasSize();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const columnCount = Math.ceil(width / columnWidth);
    columns = Array.from({ length: columnCount }, (_, index) => ({
      x: index * columnWidth,
      y: Math.random() * -height,
      speed: 0.8 + Math.random() * 1.8,
      length: 7 + Math.floor(Math.random() * 15),
      alpha: 0.08 + Math.random() * 0.14,
    }));
  }

  function drawColumn(column) {
    for (let i = 0; i < column.length; i += 1) {
      const character = characters[Math.floor(Math.random() * characters.length)];
      const y = column.y - i * 22;
      const fade = 1 - i / column.length;
      const isLead = i === 0;

      context.fillStyle = isLead
        ? `rgba(245, 252, 255, ${column.alpha * 1.2})`
        : `rgba(57, 159, 211, ${column.alpha * fade})`;
      context.fillText(character, column.x, y);
    }
  }

  function draw({ animate }) {
    const { width, height } = getCanvasSize();

    context.fillStyle = "rgba(34, 34, 34, 0.22)";
    context.fillRect(0, 0, width, height);
    context.font = "16px 'DM Mono', 'Roboto Mono', monospace";
    context.textAlign = "center";
    context.textBaseline = "top";

    columns.forEach((column) => {
      drawColumn(column);

      if (animate) {
        column.y += column.speed;
        if (column.y - column.length * 22 > height) {
          column.y = Math.random() * -260;
          column.speed = 0.8 + Math.random() * 1.8;
          column.length = 7 + Math.floor(Math.random() * 15);
          column.alpha = 0.08 + Math.random() * 0.14;
        }
      }
    });
  }

  function tick() {
    frame += 1;
    if (frame % 2 === 0) {
      draw({ animate: true });
    }
    animationFrame = window.requestAnimationFrame(tick);
  }

  function start() {
    window.cancelAnimationFrame(animationFrame);
    context.clearRect(0, 0, canvas.width, canvas.height);
    resize();

    if (prefersReducedMotion.matches) {
      draw({ animate: false });
      return;
    }

    tick();
  }

  window.addEventListener("resize", start);
  prefersReducedMotion.addEventListener("change", start);
  start();
}

function initBizznestThumbAnimation() {
  const logo = document.querySelector(".bizznest-thumb__logo");
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!logo) {
    return;
  }

  if (!gsap || reduceMotion) {
    logo.style.opacity = "1";
    logo.style.transform = "scale(1)";
    return;
  }

  gsap.set(logo, {
    autoAlpha: 0,
    scale: 0.9
  });

  gsap.timeline({
    repeat: -1,
    repeatDelay: 0.25,
    defaults: { ease: "power3.out" }
  })
    .to(logo, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.55
    })
    .to(logo, {
      autoAlpha: 1,
      scale: 1,
      duration: 1.15,
      ease: "none"
    })
    .to(logo, {
      autoAlpha: 0,
      scale: 0.96,
      duration: 0.42,
      ease: "power2.in"
    })
    .to({}, { duration: 0.48 });
}

if (codeRainCanvas) {
  initCodeRain(codeRainCanvas);
}
