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

  runBootIntro();
});

function runBootIntro() {
  const introStorageKey = "portfolioIntroPlayed";
  const loader = document.querySelector(".intro-loader");
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const introAlreadyPlayed = getSessionFlag(introStorageKey);

  if (!loader || !gsap || reduceMotion || introAlreadyPlayed) {
    document.body.classList.add("site-visible", "page-loaded");
    if (loader) {
      loader.style.display = "none";
    }
    return;
  }

  gsap.set(".boot-loader__screen", { autoAlpha: 0 });
  gsap.set(".boot-loader__ring", {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    scale: 0.55,
    rotation: -90
  });
  gsap.set(".boot-loader__ambient", {
    autoAlpha: 0,
    y: 24,
    scale: 0.78,
    rotation: -2
  });
  gsap.set(".boot-loader__gif", {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    y: 12,
    scale: 0.92
  });

  const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;
  const segmentColumns = isSmallScreen ? 5 : 7;
  const segmentRows = isSmallScreen ? 7 : 5;
  const revealSegments = createRevealSegments(
    loader.querySelector(".boot-loader__segments"),
    segmentColumns,
    segmentRows
  );

  gsap.set(".boot-loader__segments", { autoAlpha: 0 });
  gsap.set(revealSegments, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    transformOrigin: "50% 50%"
  });

  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      setSessionFlag(introStorageKey);
      document.body.classList.add("page-loaded");
    }
  });

  timeline
    .addLabel("boot")
    .to(".boot-loader__screen", { autoAlpha: 1, duration: 0.45 }, "boot")
    .to(".boot-loader__ring", {
      autoAlpha: 1,
      scale: 1,
      rotation: 260,
      duration: 0.9,
      ease: "expo.out"
    }, "boot+=0.34")
    .to(".boot-loader__gif", {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.45,
      ease: "power3.out"
    }, "boot+=0.42")
    .addLabel("loading", "boot+=0.98")
    .to(".boot-loader__ambient", {
      autoAlpha: 0.74,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.36,
      stagger: {
        each: 0.32,
        from: "start"
      },
      ease: "back.out(1.8)"
    }, "loading")
    .to(".boot-loader__ring", {
      rotation: "+=1440",
      duration: 2.05,
      ease: "none"
    }, "loading")
    .to(".boot-loader__ambient--rabbit", { x: -24, y: 12, duration: 1.9, ease: "sine.inOut" }, "loading+=1.05")
    .to(".boot-loader__ring", {
      rotation: "+=150",
      duration: 0.55,
      ease: "power3.out"
    }, "loading+=2.05")
    .addLabel("reveal", "+=0.2")
    .add(() => {
      document.body.classList.add("site-visible");
    }, "reveal")
    .to(".boot-loader__ring, .boot-loader__gif, .boot-loader__ambient", {
      autoAlpha: 0,
      scale: 0.84,
      duration: 0.18,
      ease: "power2.out"
    }, "reveal")
    .set(".intro-loader, .boot-loader__screen", {
      backgroundColor: "rgba(0, 0, 0, 0)"
    }, "reveal+=0.16")
    .set(".boot-loader__segments", {
      autoAlpha: 1
    }, "reveal+=0.16")
    .to(revealSegments, {
      autoAlpha: 0,
      x: (index, target) => {
        const column = Number(target.dataset.column);
        return (column - (segmentColumns - 1) / 2) * 18;
      },
      y: (index, target) => {
        const row = Number(target.dataset.row);
        return (row - (segmentRows - 1) / 2) * 18;
      },
      scaleX: () => gsap.utils.random(0.72, 0.94),
      scaleY: () => gsap.utils.random(0.72, 0.94),
      rotation: () => gsap.utils.random(-2.5, 2.5),
      duration: 0.82,
      stagger: {
        amount: 0.68,
        from: "random"
      },
      ease: "power3.inOut"
    }, "reveal+=0.18")
    .to(loader, {
      autoAlpha: 0,
      duration: 0.2,
      ease: "none"
    }, "reveal+=1.05");
}

function createRevealSegments(container, columns, rows) {
  if (!container) {
    return [];
  }

  container.textContent = "";
  container.style.setProperty("--segment-columns", String(columns));
  container.style.setProperty("--segment-rows", String(rows));

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < columns * rows; index += 1) {
    const segment = document.createElement("span");
    segment.className = "boot-loader__segment";
    segment.dataset.column = String(index % columns);
    segment.dataset.row = String(Math.floor(index / columns));
    fragment.appendChild(segment);
  }

  container.appendChild(fragment);
  return Array.from(container.children);
}

function getSessionFlag(key) {
  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function setSessionFlag(key) {
  try {
    window.sessionStorage.setItem(key, "true");
  } catch {
    // Storage can be blocked in private browsing; the intro can still run safely.
  }
}
