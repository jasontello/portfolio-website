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
  const loader = document.querySelector(".intro-loader");
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!loader || !gsap || reduceMotion) {
    document.body.classList.add("page-loaded");
    return;
  }

  gsap.set(".boot-loader__screen", { autoAlpha: 0 });
  gsap.set(".boot-loader__frame", {
    autoAlpha: 0,
    scaleX: 0.82,
    scaleY: 0.72,
    transformOrigin: "center"
  });
  gsap.set(".boot-loader__ring", {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    scale: 0.55,
    rotation: -90
  });
  gsap.set(".boot-loader__panel", {
    autoAlpha: 0,
    clipPath: "inset(0 100% 0 0)"
  });

  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      document.body.classList.add("page-loaded");
    }
  });

  timeline
    .addLabel("boot")
    .to(".boot-loader__screen", { autoAlpha: 1, duration: 0.45 }, "boot")
    .to(".boot-loader__frame", { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.55 }, "boot+=0.12")
    .to(".boot-loader__ring", {
      autoAlpha: 1,
      scale: 1,
      rotation: 260,
      duration: 0.9,
      ease: "expo.out"
    }, "boot+=0.34")
    .addLabel("system", "+=0.95")
    .to(".boot-loader__panel", {
      autoAlpha: 1,
      clipPath: "inset(0 0% 0 0)",
      duration: 0.55,
      ease: "power2.inOut"
    }, "system")
    .to(".boot-loader__ring", { rotation: "+=220", duration: 0.55, ease: "power2.inOut" }, "system")
    .to(".boot-loader__screen", {
      backgroundColor: "#f4f4f1",
      color: "#080808",
      duration: 0.18,
      ease: "none"
    }, "system+=0.52")
    .to(".boot-loader__panel", {
      backgroundColor: "#050505",
      color: "#edf5f1",
      duration: 0.18,
      ease: "none"
    }, "system+=0.52")
    .to(".boot-loader__screen", {
      autoAlpha: 0,
      y: -20,
      duration: 0.55,
      ease: "power2.in"
    }, "+=0.65");
}
