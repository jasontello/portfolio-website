document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link-fx");

  navLinks.forEach((link) => {
    const text = (link.textContent || "").trim();
    link.textContent = "";

    const original = document.createElement("span");
    original.className = "nav-word nav-word--original";

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

    link.appendChild(original);
    link.appendChild(clone);
  });

  initResumeModal();
  initProjectModal();
  initCurrentPageLinks();
  initNameFaceReaction();
  initSandboxTransition();
  initBizznestThumbAnimation();
  initFullscreenLayout();
  initSpotifyTopTracks();
  initCaseStudyReveal();
});

const PROJECTS = [
  {
    id: "funfetti-events",
    title: "Funfetti Events Website Redesign",
    role: "UX and visual redesign, front-end development",
    focus: "Customer journeys, accessible interaction, and planning tools",
    summary: "A responsive portfolio redesign concept created with permission for a real Northern California event-planning and party-rental business.",
    challenge: "How could the company’s useful information become a clearer, more memorable customer journey that still feels right for both playful celebrations and professional events?",
    approach: "I organized the concept around four customer goals: understand the services, browse previous setups, estimate rental needs, and contact the business for an exact quote.",
    outcome: "The redesign concept combines a more distinctive visual system with clearer navigation, accessible interactions, and a dedicated estimator. It is a portfolio exploration and does not replace the company’s current official website.",
    highlights: [
      "Responsive navigation, custom illustration, and animated gallery",
      "Accessible lightbox, focus states, and reduced-motion support",
      "Guided and manual event-rental estimator modes",
      "Synchronized answers and prepared quote-request email"
    ],
    image: "./images/projects/funfetti-events/case-study.png",
    imageAlt: "Funfetti Events illustrated celebration scene",
    video: "./images/projects/funfetti-events/demo.mp4",
    caseStudy: "./funfetti-events-case-study.html",
    live: "https://jasontello.github.io/funfetti-events-redesign/",
    github: "https://github.com/jasontello/funfetti-events-redesign"
  },
  {
    id: "open-source-sj",
    title: "Open Source San José Redesign",
    role: "UI/UX design and front-end development",
    focus: "Civic tech, accessibility, and responsive design",
    summary: "A homepage redesign created for the BizzNEST Design Assessment while preserving the organization’s civic-tech identity.",
    challenge: "How can a content-heavy civic organization feel easier to navigate while keeping its community-first personality visible?",
    approach: "I rebuilt the hierarchy around clearer navigation, stronger project storytelling, accessible menus, and a mobile-first reading flow.",
    outcome: "The redesign gives projects, sponsors, events, and location details a clearer rhythm. The final page feels more focused while remaining recognizably Open Source San José.",
    highlights: [
      "Accessible desktop and mobile navigation",
      "Animated code-rain with reduced-motion support",
      "Interactive project presentation",
      "Redesigned hero, sponsor, location, and footer sections"
    ],
    image: "./images/projects/open-source-san-jose/case-study.png",
    imageAlt: "Open Source San José redesigned homepage",
    video: "./images/projects/open-source-san-jose/demo.mp4",
    caseStudy: "./open-source-san-jose-case-study.html",
    live: "https://jasontello.github.io/BizzNestDesignAssessment/",
    github: "https://github.com/jasontello/BizzNestDesignAssessment"
  },
  {
    id: "rainbow-lab",
    title: "Rainbow Lab",
    role: "Interaction design and front-end development",
    focus: "Color systems, interaction, and visual exploration",
    summary: "An interactive color tool that makes a large rainbow field useful for inspecting palettes and individual colors.",
    challenge: "How can a dense color system stay expressive while giving users clear, practical ways to inspect and compare colors?",
    approach: "I paired the animated color field with a color finder, relationship palettes, a detailed picker, and readable color values.",
    outcome: "Rainbow Lab turns a visual experiment into a working color reference. Users can explore relationships, adjust a selection, inspect its values, and copy colors without leaving the composition.",
    highlights: [
      "Interactive color finder and color-wheel picker",
      "Monochromatic and relationship palette browsing",
      "RGB, RGBA, and CMYK color values",
      "Eyedropper, brightness adjustment, and copyable swatches"
    ],
    image: "./images/projects/rainbow-lab/case-study.jpg",
    imageAlt: "Rainbow Lab interactive color field",
    video: "./images/projects/rainbow-lab/demo.mp4?v=2",
    live: "https://jasontello.github.io/rainbow-square-lab/",
    github: "https://github.com/jasontello/rainbow-square-lab"
  },
  {
    id: "bizznest-linktree",
    title: "BizzNEST Linktree Assessment",
    role: "UI design and front-end development",
    focus: "Responsive layout, theming, and interaction",
    summary: "A responsive personal links page designed and built for the BizzNEST Senior Associate assessment.",
    challenge: "How can a familiar link-in-bio page become more expressive while staying quick to scan and easy to use?",
    approach: "I designed two views from one shared content system: a focused vertical list and an editorial bento grid, with light and dark themes.",
    outcome: "The result is a compact portfolio gateway that adapts to user preference without duplicating content. Layout and theme transitions keep each change clear and deliberate.",
    highlights: [
      "List and bento-grid layout modes",
      "Light and dark theme transition",
      "Shared data across both presentations",
      "Responsive desktop and mobile layouts"
    ],
    image: "./images/projects/bizznest/case-study.jpg",
    imageAlt: "BizzNEST Linktree assessment homepage",
    video: "./images/projects/bizznest/demo.mp4",
    live: "https://jasontello.github.io/bizznest-linktree-assessment/",
    github: "https://github.com/jasontello/bizznest-linktree-assessment"
  }
];

function initProjectModal() {
  const modal = document.querySelector(".project-modal");
  const panel = document.querySelector(".project-modal__panel");
  const story = document.querySelector("[data-project-story]");
  const triggers = document.querySelectorAll("[data-project-open]");
  const closeButtons = document.querySelectorAll("[data-project-close]");
  const previousButton = document.querySelector("[data-project-previous]");
  const nextButton = document.querySelector("[data-project-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentIndex = 0;
  let lastTrigger = null;

  if (!modal || !panel || !story || !triggers.length) {
    return;
  }

  const fields = {
    index: modal.querySelector("[data-project-index]"),
    title: modal.querySelector("[data-project-title]"),
    summary: modal.querySelector("[data-project-summary]"),
    role: modal.querySelector("[data-project-role]"),
    focus: modal.querySelector("[data-project-focus]"),
    video: modal.querySelector("[data-project-video]"),
    challenge: modal.querySelector("[data-project-challenge]"),
    approach: modal.querySelector("[data-project-approach]"),
    outcome: modal.querySelector("[data-project-outcome]"),
    highlights: modal.querySelector("[data-project-highlights]"),
    caseStudy: modal.querySelector("[data-project-case-study]"),
    live: modal.querySelector("[data-project-live]"),
    github: modal.querySelector("[data-project-github]")
  };

  const renderProject = (index) => {
    currentIndex = (index + PROJECTS.length) % PROJECTS.length;
    const project = PROJECTS[currentIndex];

    fields.index.textContent = String(currentIndex + 1).padStart(2, "0");
    fields.title.textContent = project.title;
    fields.summary.textContent = project.summary;
    fields.role.textContent = project.role;
    fields.focus.textContent = project.focus;
    fields.video.pause();
    fields.video.poster = project.image;
    fields.video.setAttribute("aria-label", `${project.imageAlt} demonstration`);

    if (fields.video.getAttribute("src") !== project.video) {
      fields.video.src = project.video;
      fields.video.load();
    }

    fields.video.currentTime = 0;

    if (!reduceMotion && modal.classList.contains("is-open")) {
      fields.video.play().catch(() => {});
    }
    fields.challenge.textContent = project.challenge;
    fields.approach.textContent = project.approach;
    fields.outcome.textContent = project.outcome;
    if (project.caseStudy) {
      fields.caseStudy.href = project.caseStudy;
      fields.caseStudy.hidden = false;
    } else {
      fields.caseStudy.removeAttribute("href");
      fields.caseStudy.hidden = true;
    }
    fields.live.href = project.live;
    fields.github.href = project.github;
    fields.highlights.replaceChildren(
      ...project.highlights.map((highlight) => {
        const item = document.createElement("li");
        item.textContent = highlight;
        return item;
      })
    );

    story.scrollTop = 0;
  };

  const openModal = (projectId, trigger) => {
    const projectIndex = PROJECTS.findIndex((project) => project.id === projectId);

    if (projectIndex === -1) {
      return;
    }

    lastTrigger = trigger;
    renderProject(projectIndex);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-project-open");

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      if (!reduceMotion) {
        fields.video.play().catch(() => {});
      }
      modal.querySelector(".project-modal__close")?.focus();
    });
  };

  const closeModal = () => {
    fields.video.pause();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-project-open");

    window.setTimeout(() => {
      modal.hidden = true;
      lastTrigger?.focus();
    }, reduceMotion ? 0 : 280);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger.dataset.projectOpen, trigger);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  previousButton?.addEventListener("click", () => renderProject(currentIndex - 1));
  nextButton?.addEventListener("click", () => renderProject(currentIndex + 1));

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "ArrowLeft") {
      renderProject(currentIndex - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      renderProject(currentIndex + 1);
      return;
    }

    if (event.key === "Tab") {
      const focusable = [...modal.querySelectorAll("button, a[href], [tabindex='0']")]
        .filter((element) => !element.hasAttribute("disabled"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
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

  const renderTracks = (tracks, updatedAt) => {
    if (!trackListContainer) {
      return;
    }

    trackListContainer.replaceChildren();

    const list = document.createElement("ol");
    list.className = "top-tracks__list";

    tracks.slice(0, 3).forEach((track, index) => {
      const item = document.createElement("li");
      item.className = "top-track";

      const number = document.createElement("span");
      number.className = "top-track__number";
      number.textContent = String(index + 1).padStart(2, "0");

      const artwork = document.createElement("img");
      artwork.className = "top-track__artwork";
      artwork.src = track.albumImage || "./images/walltexture.jpg";
      artwork.alt = track.album ? `${track.album} album cover` : "";
      artwork.loading = "lazy";

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
      item.append(number, artwork, details);
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
      caseLink.setAttribute("aria-label", `${track.name} by ${getArtists(track)} on Spotify`);

      const artwork = document.createElement("img");
      artwork.className = "shelf-cd__artwork";
      artwork.src = track.albumImage || "./images/walltexture.jpg";
      artwork.alt = "";
      artwork.loading = "lazy";

      caseLink.append(artwork);
      shelfContainer.append(caseLink);
    });
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
