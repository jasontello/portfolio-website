(() => {
  const gallery = document.querySelector("[data-sandbox-gallery]");
  const track = document.querySelector("[data-sandbox-track]");
  const previousButton = document.querySelector("[data-sandbox-prev]");
  const nextButton = document.querySelector("[data-sandbox-next]");
  const slides = Array.from(document.querySelectorAll(".sandbox-installation"));

  if (!gallery || !track || !previousButton || !nextButton || slides.length === 0) {
    return;
  }

  let activeIndex = 0;
  const hashToIndex = new Map([
    ["#ink", 0],
    ["#poster", 1]
  ]);

  const setSlide = (nextIndex, shouldUpdateHash = true) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);

    activeIndex = clampedIndex;
    gallery.dataset.sandboxSlide = String(activeIndex);
    document.body.dataset.sandboxSlide = String(activeIndex);
    track.style.transform = `translate3d(${-activeIndex * 100}vw, 0, 0)`;
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;

    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
    });

    if (shouldUpdateHash) {
      const nextHash = activeIndex === 0 ? "#ink" : "#poster";

      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", nextHash);
      }
    }
  };

  previousButton.addEventListener("click", () => setSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => setSlide(activeIndex + 1));

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSlide(activeIndex - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setSlide(activeIndex + 1);
    }
  });

  window.addEventListener("hashchange", () => {
    setSlide(hashToIndex.get(window.location.hash) || 0, false);
  });

  setSlide(hashToIndex.get(window.location.hash) || 0, false);
})();
