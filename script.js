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
  initSandboxTransition();
  initBizznestThumbAnimation();
});

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
