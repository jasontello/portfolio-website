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
    document.body.classList.add("site-visible", "page-loaded");
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
  gsap.set(".boot-loader__gif", {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    y: 12,
    scale: 0.92
  });
  gsap.set(".boot-loader__ambient", {
    autoAlpha: 0,
    y: 24,
    scale: 0.78,
    rotation: -2
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
    .to(".boot-loader__ambient--horse", { x: 34, y: -8, duration: 2, ease: "sine.inOut" }, "loading+=1.05")
    .to(".boot-loader__ambient--wave", { x: 18, y: -12, duration: 1.85, ease: "sine.inOut" }, "loading+=1.05")
    .to(".boot-loader__ambient--bloom", { x: -16, y: 14, duration: 2, ease: "sine.inOut" }, "loading+=1.05")
    .to(".boot-loader__ring", {
      rotation: "+=150",
      duration: 0.55,
      ease: "power3.out"
    }, "loading+=2.05")
    .addLabel("reveal", "+=0.2")
    .add(() => {
      document.body.classList.add("site-visible");
    }, "reveal")
    .to(loader, {
      xPercent: 100,
      duration: 0.9,
      ease: "power3.inOut"
    }, "reveal+=0.05");
}
