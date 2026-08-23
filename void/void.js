(() => {
  "use strict";

  const canvas = document.querySelector("[data-field]");
  const stage = document.querySelector("[data-stage]");
  const returnLink = document.querySelector("[data-return]");

  if (!(canvas instanceof HTMLCanvasElement) || !(stage instanceof HTMLElement)) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    return;
  }

  const elements = {
    x: document.querySelector("[data-coordinate-x]"),
    y: document.querySelector("[data-coordinate-y]"),
    stateIndex: document.querySelector("[data-state-index]"),
    fieldMode: document.querySelector("[data-field-mode]"),
    stateName: document.querySelector("[data-state-name]"),
    runningNote: document.querySelector("[data-running-note]"),
    fragment: document.querySelector("[data-fragment]"),
    fragmentId: document.querySelector("[data-fragment-id]"),
    fragmentCopy: document.querySelector("[data-fragment-copy]"),
    time: document.querySelector("[data-time]")
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const states = [
    {
      key: "quiet",
      name: "QUIET FIELD",
      mode: "QUIET",
      note: "FIELD IS LISTENING",
      fragment: "Touch the formation to displace its reading."
    },
    {
      key: "register",
      name: "OPEN REGISTER",
      mode: "DISPLACED",
      note: "A TRACE HAS ENTERED",
      fragment: "Coordinates persist after the gesture leaves."
    },
    {
      key: "inverse",
      name: "NEGATIVE FIELD",
      mode: "INVERSE",
      note: "THE GROUND HAS TURNED",
      fragment: "Signal and ground exchange their visible weight."
    }
  ];

  const pointer = {
    x: window.innerWidth * 0.52,
    y: window.innerHeight * 0.48,
    targetX: window.innerWidth * 0.52,
    targetY: window.innerHeight * 0.48,
    active: false
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stateIndex = 0;
  let fragmentCount = 0;
  let frameId = 0;
  let lastTime = 0;
  let lastDrawTime = 0;
  let lastClockSecond = -1;
  let lastPointerInput = 0;
  let fieldTransition = null;
  let visible = !document.hidden;
  const frameInterval = 1000 / 30;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  function palette() {
    const inverse = states[stateIndex].key === "inverse";
    return inverse
      ? { strong: "rgba(238,238,231,0.78)", soft: "rgba(238,238,231,0.22)", faint: "rgba(238,238,231,0.08)", signal: "rgba(210,216,91,0.9)" }
      : { strong: "rgba(17,17,15,0.74)", soft: "rgba(17,17,15,0.20)", faint: "rgba(17,17,15,0.07)", signal: "rgba(183,189,51,0.92)" };
  }

  function seeded(index, offset = 0) {
    const value = Math.sin(index * 91.173 + offset * 17.719) * 43758.5453;
    return value - Math.floor(value);
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);

    const colors = palette();
    const mobile = width < 700;
    const centerX = mobile ? width * 0.57 : width * 0.56;
    const centerY = mobile ? height * 0.43 : height * 0.5;
    const radiusX = Math.min(width * (mobile ? 0.37 : 0.22), mobile ? 155 : 320);
    const radiusY = Math.min(height * (mobile ? 0.31 : 0.39), mobile ? 270 : 400);
    const stateEnergy = stateIndex === 0 ? 0.65 : stateIndex === 1 ? 1.45 : 1.05;
    const drift = reducedMotion.matches ? 0 : time * 0.00018;
    const px = pointer.x - centerX;
    const py = pointer.y - centerY;
    const pointerDistance = Math.max(1, Math.hypot(px / radiusX, py / radiusY));
    const proximity = pointer.active ? Math.max(0, 1 - pointerDistance / 1.35) : 0;
    const rows = mobile ? 46 : 58;
    const columns = mobile ? 26 : 38;
    const total = rows * columns;

    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${mobile ? 7 : 8}px "DM Mono", "SFMono-Regular", monospace`;

    for (let index = 0; index < total; index += 1) {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const u = columns === 1 ? 0 : column / (columns - 1) * 2 - 1;
      const v = rows === 1 ? 0 : row / (rows - 1) * 2 - 1;
      const envelope = Math.pow(Math.max(0, 1 - Math.abs(v)), 0.28);
      const waist = 0.45 + envelope * 0.55;
      const phase = v * 7.2 + drift * 8 + seeded(index, 2) * 0.7;
      const boundary = Math.abs(u) / waist;
      const shell = Math.exp(-Math.pow((boundary - 0.76) * 5.3, 2));
      const inner = Math.exp(-Math.pow(boundary * 1.45, 2)) * 0.33;
      const density = shell + inner;

      if (seeded(index, stateIndex + 4) > density * (0.58 + stateEnergy * 0.2)) {
        continue;
      }

      const ripple = Math.sin(phase + u * 5.5) * (5 + stateEnergy * 3);
      const fold = Math.sin(v * 3.4 - drift * 3) * u * 11 * stateEnergy;
      let x = centerX + u * radiusX * waist + ripple + fold;
      let y = centerY + v * radiusY + Math.cos(phase * 0.75) * 3.5;

      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.max(15, Math.hypot(dx, dy));
      const forceRadius = mobile ? 110 : 150;

      if (pointer.active && distance < forceRadius) {
        const force = Math.pow(1 - distance / forceRadius, 2) * (stateIndex === 1 ? 74 : 48);
        x += dx / distance * force;
        y += dy / distance * force;
      }

      const isSignal = seeded(index, 11) > 0.974 - proximity * 0.035;
      context.fillStyle = isSignal ? colors.signal : density > 0.63 ? colors.strong : colors.soft;
      const glyph = isSignal ? "+" : String((row * 7 + column * 3 + stateIndex) % 10);
      context.fillText(glyph, x, y);
    }

    context.restore();

    context.save();
    context.strokeStyle = colors.faint;
    context.lineWidth = 1;
    const guideLeft = centerX - radiusX - (mobile ? 9 : 28);
    const guideRight = centerX + radiusX + (mobile ? 9 : 28);
    context.beginPath();
    context.moveTo(guideLeft, centerY - radiusY * 0.91);
    context.lineTo(guideLeft, centerY + radiusY * 0.91);
    context.moveTo(guideRight, centerY - radiusY * 0.91);
    context.lineTo(guideRight, centerY + radiusY * 0.91);
    context.stroke();

    for (let mark = -4; mark <= 4; mark += 1) {
      const y = centerY + mark * radiusY * 0.205;
      context.beginPath();
      context.moveTo(guideLeft - 4, y);
      context.lineTo(guideLeft + 4, y);
      context.moveTo(guideRight - 4, y);
      context.lineTo(guideRight + 4, y);
      context.stroke();
    }
    context.restore();
  }

  function updateClock(time) {
    const second = Math.floor(time / 1000);
    if (second === lastClockSecond || !(elements.time instanceof HTMLElement)) {
      return;
    }

    lastClockSecond = second;
    const date = new Date();
    elements.time.textContent = [date.getHours(), date.getMinutes(), date.getSeconds()]
      .map((part) => String(part).padStart(2, "0"))
      .join(":");
  }

  function animate(time) {
    if (!visible) {
      return;
    }

    const delta = Math.min(32, time - lastTime || 16.7);
    lastTime = time;

    if (pointer.active && time - lastPointerInput > 1500) {
      pointer.active = false;
      pointer.targetX = width * 0.52;
      pointer.targetY = height * 0.48;
    }

    const easing = 1 - Math.pow(0.001, delta / 1000);
    pointer.x += (pointer.targetX - pointer.x) * easing * 3.4;
    pointer.y += (pointer.targetY - pointer.y) * easing * 3.4;

    if (time - lastDrawTime >= frameInterval) {
      lastDrawTime = time - (time - lastDrawTime) % frameInterval;
      updateClock(time);
      draw(time);
    }

    frameId = window.requestAnimationFrame(animate);
  }

  function updatePointer(event) {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    pointer.active = true;
    lastPointerInput = performance.now();

    const xPercent = Math.max(0, Math.min(100, event.clientX / width * 100));
    const yPercent = Math.max(0, Math.min(100, event.clientY / height * 100));
    document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    document.documentElement.style.setProperty("--window-shift-x", `${(xPercent - 50) * 0.08}px`);
    document.documentElement.style.setProperty("--window-shift-y", `${(yPercent - 50) * 0.08}px`);

    if (elements.x instanceof HTMLElement) elements.x.textContent = xPercent.toFixed(1).padStart(5, "0");
    if (elements.y instanceof HTMLElement) elements.y.textContent = yPercent.toFixed(1).padStart(5, "0");
  }

  function applyState() {
    const state = states[stateIndex];
    document.body.dataset.state = state.key;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", state.key === "inverse" ? "#11110f" : "#f4f4ef");
    if (elements.stateIndex instanceof HTMLElement) elements.stateIndex.textContent = `${String(stateIndex + 1).padStart(2, "0")} / 03`;
    if (elements.fieldMode instanceof HTMLElement) elements.fieldMode.textContent = state.mode;
    if (elements.stateName instanceof HTMLElement) elements.stateName.textContent = state.name;
    if (elements.runningNote instanceof HTMLElement) elements.runningNote.textContent = state.note;
    if (elements.fragmentCopy instanceof HTMLElement) elements.fragmentCopy.textContent = state.fragment;
    if (elements.fragment instanceof HTMLElement) elements.fragment.classList.add("is-visible");
    if (elements.fragmentId instanceof HTMLElement) elements.fragmentId.textContent = String(fragmentCount).padStart(3, "0");
    stage.setAttribute("aria-label", `${state.name}. Activate to shift the data field to its next editorial state.`);

    if (!reducedMotion.matches && typeof canvas.animate === "function") {
      fieldTransition?.cancel();
      fieldTransition = canvas.animate([
        { opacity: 1, offset: 0 },
        { opacity: 0.28, offset: 0.34 },
        { opacity: 1, offset: 1 }
      ], {
        duration: 720,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)"
      });
    }

    draw(performance.now());
  }

  function shiftState() {
    fragmentCount += 1;
    stateIndex = (stateIndex + 1) % states.length;
    applyState();
  }

  function handleStageClick(event) {
    if (event.target instanceof Element && event.target.closest("a")) {
      return;
    }
    shiftState();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      window.location.href = returnLink instanceof HTMLAnchorElement ? returnLink.href : "../index.html";
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && document.activeElement === stage) {
      event.preventDefault();
      shiftState();
    }
  }

  function handleVisibility() {
    visible = !document.hidden;
    window.cancelAnimationFrame(frameId);
    if (visible && !reducedMotion.matches) {
      lastTime = performance.now();
      lastDrawTime = 0;
      frameId = window.requestAnimationFrame(animate);
    } else {
      draw(performance.now());
    }
  }

  function handleMotionPreference() {
    window.cancelAnimationFrame(frameId);
    if (reducedMotion.matches) {
      draw(0);
    } else if (visible) {
      lastTime = performance.now();
      lastDrawTime = 0;
      frameId = window.requestAnimationFrame(animate);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("pointerdown", updatePointer, { passive: true });
  window.addEventListener("keydown", handleKeydown);
  stage.addEventListener("click", handleStageClick);
  document.addEventListener("visibilitychange", handleVisibility);
  reducedMotion.addEventListener("change", handleMotionPreference);

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(frameId);
    fieldTransition?.cancel();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", updatePointer);
    window.removeEventListener("pointerdown", updatePointer);
    window.removeEventListener("keydown", handleKeydown);
    stage.removeEventListener("click", handleStageClick);
    document.removeEventListener("visibilitychange", handleVisibility);
    reducedMotion.removeEventListener("change", handleMotionPreference);
  }, { once: true });

  document.body.dataset.state = states[0].key;
  resize();
  updateClock(performance.now());

  if (!reducedMotion.matches) {
    frameId = window.requestAnimationFrame(animate);
  }
})();
