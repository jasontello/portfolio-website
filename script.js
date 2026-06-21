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
  initSandboxTransition();
  initBizznestThumbAnimation();
});

const PROJECTS = [
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
    video: "./images/projects/rainbow-lab/demo.mp4",
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
    live: "https://jasontello.github.io/BizzNestDesignAssessment/",
    github: "https://github.com/jasontello/BizzNestDesignAssessment"
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
  const trigger = document.querySelector(".sandbox-trigger");
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let navigating = false;

  if (!trigger) {
    return;
  }

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

function initResumeModal() {
  const trigger = document.querySelector(".resume-trigger");
  const modal = document.querySelector(".resume-modal");
  const panel = document.querySelector(".resume-modal__panel");
  const closeButtons = document.querySelectorAll("[data-resume-close]");
  const gsap = window.gsap;

  if (!trigger || !modal || !panel) {
    return;
  }

  const openModal = () => {
    modal.hidden = false;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");

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
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
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

  trigger.addEventListener("click", openModal);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}
