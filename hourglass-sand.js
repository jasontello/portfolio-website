(() => {
  const root = document.querySelector("[data-hourglass-game]");
  const canvas = document.querySelector("[data-hourglass-sand]");
  if (!root || !canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  const timeOutput = root.querySelector("[data-hourglass-time]");
  const accuracyOutput = root.querySelector("[data-hourglass-accuracy]");
  const instructionOutput = root.querySelector("[data-hourglass-instruction]");
  const statusOutput = root.querySelector("[data-hourglass-status]");
  const pauseButton = root.querySelector("[data-hourglass-pause]");
  const restartButton = root.querySelector("[data-hourglass-restart]");
  const pauseLabel = pauseButton.querySelector("span");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const noiseCanvas = document.createElement("canvas");
  const noiseContext = noiseCanvas.getContext("2d");
  const durationMs = 60000;
  const frameInterval = 1000 / 30;
  const params = new URLSearchParams(window.location.search);
  const progressParam = params.get("hourglassProgress");
  const tiltParam = params.get("hourglassTilt");
  const requestedProgress = progressParam === null ? NaN : Number(progressParam);
  const requestedTilt = tiltParam === null ? NaN : Number(tiltParam);

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function mix(start, end, progress) {
    return start + (end - start) * progress;
  }

  function easeInOut(value) {
    return value * value * (3 - 2 * value);
  }

  function easeOut(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  const state = {
    accuracyTotal: 0,
    animationFrame: 0,
    cleaned: false,
    debugProgress: Number.isFinite(requestedProgress) ? clamp(requestedProgress) : null,
    dpr: 1,
    elapsedMs: Number.isFinite(requestedProgress) ? clamp(requestedProgress) * durationMs : 0,
    height: 0,
    keyDirection: 0,
    lastRender: 0,
    lastTick: 0,
    lastNoise: 0,
    lastTimeText: "",
    phase: Number.isFinite(requestedProgress) ? (clamp(requestedProgress) >= 1 ? "finished" : "preview") : "ready",
    pointerActive: false,
    pointerId: null,
    reducedMotion: reduceMotion.matches,
    scoreWeight: 0,
    tilt: Number.isFinite(requestedTilt) ? clamp(requestedTilt, -1, 1) : 0,
    tiltTarget: Number.isFinite(requestedTilt) ? clamp(requestedTilt, -1, 1) : 0,
    width: 0,
  };

  function getProgress() {
    return state.debugProgress === null ? clamp(state.elapsedMs / durationMs) : state.debugProgress;
  }

  function getGeometry() {
    const width = state.width;
    const height = state.height;
    const centerX = width * 0.5;
    const topY = height * 0.07;
    const neckY = height * 0.46;
    const bottomY = height * 0.93;
    const chamberHeight = Math.min((neckY - topY) * 1.08, (bottomY - neckY) * 0.92);
    const halfWidth = Math.min(width * 0.34, chamberHeight * 1.03);
    const scale = Math.min(width / 820, height / 920);
    const neckHalfWidth = Math.max(4, 7 * scale);
    const gateY = neckY + chamberHeight * 0.16;
    const gateTravel = halfWidth * 0.33;
    const gameTime = state.debugProgress === null ? state.elapsedMs : state.debugProgress * durationMs;
    const gateOffset = state.reducedMotion ? 0 : Math.sin(gameTime * 0.00105) * gateTravel + Math.sin(gameTime * 0.00031) * gateTravel * 0.24;
    return {
      bottomY,
      centerX,
      chamberHeight,
      gateCenterX: centerX + gateOffset,
      gateHalfGap: Math.max(15, halfWidth * 0.075),
      gateY,
      halfWidth,
      neckHalfWidth,
      neckY,
      scale,
      topY,
    };
  }

  function traceTopChamber(g) {
    context.beginPath();
    context.moveTo(g.centerX - g.halfWidth, g.topY + g.chamberHeight * 0.04);
    context.quadraticCurveTo(g.centerX, g.topY - g.chamberHeight * 0.035, g.centerX + g.halfWidth, g.topY);
    context.bezierCurveTo(g.centerX + g.halfWidth * 0.7, g.topY + g.chamberHeight * 0.26, g.centerX + g.neckHalfWidth * 2.5, g.neckY - g.chamberHeight * 0.1, g.centerX + g.neckHalfWidth, g.neckY);
    context.lineTo(g.centerX - g.neckHalfWidth, g.neckY);
    context.bezierCurveTo(g.centerX - g.neckHalfWidth * 2.5, g.neckY - g.chamberHeight * 0.1, g.centerX - g.halfWidth * 0.72, g.topY + g.chamberHeight * 0.28, g.centerX - g.halfWidth, g.topY + g.chamberHeight * 0.04);
    context.closePath();
  }

  function traceBottomChamber(g) {
    context.beginPath();
    context.moveTo(g.centerX - g.neckHalfWidth, g.neckY);
    context.bezierCurveTo(g.centerX - g.neckHalfWidth * 2.2, g.neckY + g.chamberHeight * 0.13, g.centerX - g.halfWidth * 0.96, g.bottomY - g.chamberHeight * 0.28, g.centerX - g.halfWidth * 0.74, g.bottomY - g.chamberHeight * 0.05);
    context.quadraticCurveTo(g.centerX, g.bottomY + g.chamberHeight * 0.035, g.centerX + g.halfWidth * 0.74, g.bottomY - g.chamberHeight * 0.05);
    context.bezierCurveTo(g.centerX + g.halfWidth * 0.96, g.bottomY - g.chamberHeight * 0.28, g.centerX + g.neckHalfWidth * 2.2, g.neckY + g.chamberHeight * 0.13, g.centerX + g.neckHalfWidth, g.neckY);
    context.closePath();
  }

  function buildNoise(time, force = false) {
    if (!force && (state.reducedMotion || time - state.lastNoise < 190)) return;
    state.lastNoise = time;
    const image = noiseContext.createImageData(noiseCanvas.width, noiseCanvas.height);
    for (let index = 0; index < image.data.length; index += 4) {
      const grain = Math.random();
      const value = grain > 0.9 ? 2 : grain > 0.58 ? 18 : 48;
      image.data[index] = value;
      image.data[index + 1] = value + 3;
      image.data[index + 2] = value + 2;
      image.data[index + 3] = grain > 0.4 ? 84 : 18;
    }
    noiseContext.putImageData(image, 0, 0);
  }

  function drawNoise(alpha, time) {
    context.save();
    context.globalAlpha = alpha;
    context.globalCompositeOperation = "multiply";
    context.drawImage(noiseCanvas, state.reducedMotion ? 0 : Math.sin(time * 0.00021) * -10, state.reducedMotion ? 0 : Math.cos(time * 0.00017) * -8, state.width * 1.06, state.height * 1.06);
    context.restore();
  }

  function drawTopMass(g, progress, time) {
    const remaining = 1 - progress;
    const density = easeInOut(remaining);
    const surfaceY = mix(g.topY - g.chamberHeight * 0.02, g.neckY - g.neckHalfWidth * 1.2, easeInOut(progress));
    const gradient = context.createLinearGradient(g.centerX, surfaceY, g.centerX, g.neckY);
    gradient.addColorStop(0, `rgba(7, 9, 9, ${0.78 * density})`);
    gradient.addColorStop(0.42, `rgba(2, 4, 4, ${0.96 * density})`);
    gradient.addColorStop(1, `rgba(25, 31, 30, ${0.68 * density})`);
    context.save();
    traceTopChamber(g);
    context.clip();
    context.filter = `blur(${Math.max(7, 12 * g.scale)}px)`;
    context.fillStyle = gradient;
    context.fillRect(g.centerX - g.halfWidth - 30, surfaceY - 18, g.halfWidth * 2 + 60, g.neckY - surfaceY + 36);
    context.filter = "none";
    context.beginPath();
    context.rect(0, surfaceY - 14, state.width, g.neckY - surfaceY + 26);
    context.clip();
    drawNoise(0.39 * density, time);
    context.restore();
  }

  function drawBottomMass(g, progress, time) {
    const fill = easeOut(progress);
    const surfaceY = mix(g.bottomY + g.chamberHeight * 0.025, g.neckY + g.neckHalfWidth * 1.45, fill);
    const pileOffset = state.tilt * g.halfWidth * 0.08;
    const gradient = context.createLinearGradient(g.centerX, surfaceY, g.centerX, g.bottomY);
    gradient.addColorStop(0, `rgba(26, 34, 33, ${0.48 + fill * 0.2})`);
    gradient.addColorStop(0.4, `rgba(7, 10, 10, ${0.72 + fill * 0.22})`);
    gradient.addColorStop(1, `rgba(1, 2, 2, ${0.88 + fill * 0.1})`);
    context.save();
    traceBottomChamber(g);
    context.clip();
    context.filter = `blur(${Math.max(8, 13 * g.scale)}px)`;
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(g.centerX + pileOffset, g.bottomY - g.chamberHeight * 0.02, g.halfWidth * (0.58 + fill * 0.35), g.bottomY - surfaceY + g.chamberHeight * 0.05, state.tilt * -0.025, Math.PI, Math.PI * 2);
    context.lineTo(g.centerX + g.halfWidth, g.bottomY + 30);
    context.lineTo(g.centerX - g.halfWidth, g.bottomY + 30);
    context.closePath();
    context.fill();
    context.filter = "none";
    context.beginPath();
    context.rect(0, surfaceY - 16, state.width, g.bottomY - surfaceY + 40);
    context.clip();
    drawNoise(0.38 * Math.max(0.12, fill), time + 510);
    context.restore();
    return surfaceY;
  }

  function getStreamX(g) {
    return g.centerX + state.tilt * g.halfWidth * 0.46;
  }

  function getHitQuality(g) {
    return clamp(1 - Math.abs(getStreamX(g) - g.gateCenterX) / (g.gateHalfGap * 2.6));
  }

  function drawGate(g, quality) {
    const lineLength = g.halfWidth * 0.24;
    const leftEdge = g.gateCenterX - g.gateHalfGap;
    const rightEdge = g.gateCenterX + g.gateHalfGap;
    context.save();
    context.strokeStyle = `rgba(9, 12, 12, ${0.72 + quality * 0.18})`;
    context.lineWidth = Math.max(1.4, 2.2 * g.scale);
    context.lineCap = "square";
    context.beginPath();
    context.moveTo(leftEdge - lineLength, g.gateY);
    context.lineTo(leftEdge, g.gateY);
    context.moveTo(rightEdge, g.gateY);
    context.lineTo(rightEdge + lineLength, g.gateY);
    context.stroke();
    context.globalAlpha = 0.16;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(rightEdge + lineLength, g.gateY + 2);
    context.bezierCurveTo(rightEdge + lineLength + g.halfWidth * 0.18, g.gateY + g.chamberHeight * 0.12, g.centerX + g.halfWidth * 0.68, g.bottomY - g.chamberHeight * 0.18, g.centerX + g.halfWidth * 0.68, g.bottomY - g.chamberHeight * 0.02);
    context.stroke();
    context.restore();
  }

  function drawStream(g, progress, bottomSurfaceY, time) {
    if (progress >= 0.999) return;
    const streamX = getStreamX(g);
    const streamEndY = Math.max(g.gateY + 20, bottomSurfaceY - 2);
    const quality = getHitQuality(g);
    const missDirection = Math.sign(streamX - g.gateCenterX) || 1;
    const impactX = quality > 0.2 ? streamX : streamX + missDirection * g.gateHalfGap * 0.8;
    const gradient = context.createLinearGradient(g.centerX, g.neckY, impactX, streamEndY);
    gradient.addColorStop(0, "rgba(3, 5, 5, 0.9)");
    gradient.addColorStop(0.58, "rgba(20, 27, 26, 0.58)");
    gradient.addColorStop(1, "rgba(3, 6, 6, 0.74)");
    context.save();
    context.filter = `blur(${Math.max(1.1, 2.4 * g.scale)}px)`;
    context.strokeStyle = gradient;
    context.lineWidth = Math.max(1.4, g.neckHalfWidth * 0.44);
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(g.centerX, g.neckY - 2);
    context.bezierCurveTo(mix(g.centerX, streamX, 0.34), mix(g.neckY, g.gateY, 0.45), mix(g.centerX, streamX, 0.78), g.gateY - 24, streamX, g.gateY);
    context.bezierCurveTo(streamX + Math.sin(time * 0.003) * 2, mix(g.gateY, streamEndY, 0.36), impactX - state.tilt * 3, mix(g.gateY, streamEndY, 0.76), impactX, streamEndY);
    context.stroke();
    context.restore();
    context.save();
    context.fillStyle = "#101514";
    for (let index = 0; index < 30; index += 1) {
      const seed = Math.sin((index + 1) * 83.17) * 43758.5453;
      const unit = seed - Math.floor(seed);
      const travel = (unit + time * (0.00055 + unit * 0.00026)) % 1;
      const y = mix(g.neckY, streamEndY, travel);
      const bend = clamp((y - g.neckY) / Math.max(1, g.gateY - g.neckY));
      const x = mix(g.centerX, impactX, clamp(bend * 0.88)) + (unit - 0.5) * 7;
      context.globalAlpha = 0.17 + unit * 0.34;
      context.beginPath();
      context.arc(x, y, 0.45 + unit * 0.9, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
    drawGate(g, quality);
  }

  function drawAmbientDust(g, time) {
    if (state.reducedMotion) return;
    context.save();
    context.fillStyle = "#0c1110";
    for (let index = 0; index < 28; index += 1) {
      const seed = Math.sin((index + 1) * 91.73) * 43758.5453;
      const unit = seed - Math.floor(seed);
      const drift = (time * (0.000012 + unit * 0.000015) + unit * 7) % 1;
      const x = g.centerX + (unit - 0.5) * g.halfWidth * 2.2;
      const y = mix(g.topY, g.bottomY, drift);
      context.globalAlpha = 0.015 + (1 - clamp(Math.abs(x - g.centerX) / g.halfWidth)) * 0.04;
      context.beginPath();
      context.arc(x, y, 0.4 + unit, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function updateOutputs() {
    const remaining = Math.max(0, Math.ceil((durationMs - state.elapsedMs) / 1000));
    const timeText = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    const accuracy = state.scoreWeight > 0
      ? (state.accuracyTotal / state.scoreWeight) * 100
      : state.phase === "preview"
        ? getHitQuality(getGeometry()) * 100
        : null;
    if (timeText !== state.lastTimeText) {
      timeOutput.textContent = timeText;
      state.lastTimeText = timeText;
    }
    accuracyOutput.textContent = accuracy === null ? "--.-%" : `${accuracy.toFixed(1)}%`;
    root.dataset.gamePhase = state.phase;
    if (state.phase === "ready") {
      instructionOutput.textContent = "Press, click, or tap to begin.";
      pauseLabel.textContent = "pause";
      pauseButton.disabled = true;
    } else if (state.phase === "paused") {
      instructionOutput.textContent = "Paused. Press P to continue.";
      pauseLabel.textContent = "resume";
      pauseButton.disabled = false;
    } else if (state.phase === "finished") {
      instructionOutput.textContent = "Time settled. Press R to try again.";
      pauseLabel.textContent = "pause";
      pauseButton.disabled = true;
    } else {
      instructionOutput.textContent = "Tilt left or right to guide the sand.";
      pauseLabel.textContent = "pause";
      pauseButton.disabled = state.phase === "preview";
    }
  }

  function render(time) {
    buildNoise(time);
    const progress = getProgress();
    const geometry = getGeometry();
    context.clearRect(0, 0, state.width, state.height);
    drawTopMass(geometry, progress, time);
    const bottomSurfaceY = drawBottomMass(geometry, progress, time);
    drawStream(geometry, progress, bottomSurfaceY, time);
    drawAmbientDust(geometry, time);
    updateOutputs();
    canvas.dataset.progress = progress.toFixed(3);
    canvas.dataset.tilt = state.tilt.toFixed(3);
    canvas.dataset.phase = state.phase;
  }

  function announce(message) {
    statusOutput.textContent = message;
  }

  function tick(time) {
    if (state.cleaned) return;
    const delta = state.lastTick ? Math.min(100, time - state.lastTick) : 0;
    state.lastTick = time;
    if (state.phase === "running") {
      state.elapsedMs = Math.min(durationMs, state.elapsedMs + delta);
      const geometry = getGeometry();
      const tiltEase = state.reducedMotion ? 1 : 1 - Math.pow(0.001, delta / 1000);
      state.tilt = mix(state.tilt, state.tiltTarget, tiltEase);
      const quality = getHitQuality(geometry);
      state.accuracyTotal += quality * delta;
      state.scoreWeight += delta;
      if (state.elapsedMs >= durationMs) {
        state.phase = "finished";
        announce(`Round complete. Accuracy ${((state.accuracyTotal / Math.max(1, state.scoreWeight)) * 100).toFixed(1)} percent.`);
      }
    }
    if (!state.lastRender || time - state.lastRender >= (state.reducedMotion ? 200 : frameInterval)) {
      state.lastRender = time;
      render(time);
    }
    state.animationFrame = state.phase === "running" ? requestAnimationFrame(tick) : 0;
  }

  function requestTick() {
    if (!state.animationFrame && !state.cleaned) {
      state.lastTick = 0;
      state.animationFrame = requestAnimationFrame(tick);
    }
  }

  function start() {
    if (state.phase !== "ready") return;
    state.phase = "running";
    announce("Round started. Guide the sand through the moving gate.");
    updateOutputs();
    requestTick();
  }

  function restart() {
    state.accuracyTotal = 0;
    state.debugProgress = null;
    state.elapsedMs = 0;
    state.lastTimeText = "";
    state.phase = "ready";
    state.scoreWeight = 0;
    state.tilt = 0;
    state.tiltTarget = 0;
    announce("Gravity Keeper is ready.");
    render(performance.now());
  }

  function togglePause() {
    if (state.phase === "ready") return start();
    if (state.phase === "running") {
      state.phase = "paused";
      announce("Round paused.");
      updateOutputs();
    } else if (state.phase === "paused" && state.debugProgress === null) {
      state.phase = "running";
      announce("Round resumed.");
      updateOutputs();
      requestTick();
    }
  }

  function setTiltFromPointer(event) {
    const rect = root.getBoundingClientRect();
    state.tiltTarget = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2.25, -1, 1);
    if (state.reducedMotion) {
      state.tilt = state.tiltTarget;
      render(performance.now());
    }
  }

  function handlePointerDown(event) {
    if (event.target.closest("a, button")) return;
    root.focus({ preventScroll: true });
    state.pointerActive = true;
    state.pointerId = event.pointerId;
    root.setPointerCapture?.(event.pointerId);
    setTiltFromPointer(event);
    start();
  }

  function handlePointerMove(event) {
    if (!state.pointerActive || event.pointerId !== state.pointerId) return;
    setTiltFromPointer(event);
  }

  function handlePointerUp(event) {
    if (event.pointerId !== state.pointerId) return;
    state.pointerActive = false;
    state.pointerId = null;
    root.releasePointerCapture?.(event.pointerId);
  }

  function handleKeyDown(event) {
    if (event.target.closest("a, button") && !["p", "P", "r", "R"].includes(event.key)) return;
    if (["ArrowLeft", "a", "A"].includes(event.key)) {
      event.preventDefault();
      state.keyDirection = -1;
      state.tiltTarget = -1;
      start();
    } else if (["ArrowRight", "d", "D"].includes(event.key)) {
      event.preventDefault();
      state.keyDirection = 1;
      state.tiltTarget = 1;
      start();
    } else if ([" ", "Enter"].includes(event.key)) {
      event.preventDefault();
      start();
    } else if (["p", "P"].includes(event.key)) {
      event.preventDefault();
      togglePause();
    } else if (["r", "R"].includes(event.key)) {
      event.preventDefault();
      restart();
    } else if (event.key === "Escape") {
      window.location.href = "./index.html#experiments";
    }
  }

  function handleKeyUp(event) {
    if ((state.keyDirection === -1 && ["ArrowLeft", "a", "A"].includes(event.key)) || (state.keyDirection === 1 && ["ArrowRight", "d", "D"].includes(event.key))) {
      state.keyDirection = 0;
      state.tiltTarget = 0;
    }
  }

  function handleVisibility() {
    if (document.hidden && state.phase === "running") {
      state.phase = "paused";
      announce("Round paused because the page is hidden.");
      updateOutputs();
    }
  }

  function handleMotionChange(event) {
    state.reducedMotion = event.matches;
    root.dataset.reducedMotion = String(event.matches);
    render(performance.now());
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    state.width = Math.max(1, Math.round(rect.width));
    state.height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    noiseCanvas.width = 190;
    noiseCanvas.height = Math.max(230, Math.round(190 * (state.height / Math.max(state.width, 1))));
    buildNoise(performance.now(), true);
    render(performance.now());
  }

  function cleanup() {
    if (state.cleaned) return;
    state.cleaned = true;
    cancelAnimationFrame(state.animationFrame);
    resizeObserver.disconnect();
    root.removeEventListener("pointerdown", handlePointerDown);
    root.removeEventListener("pointermove", handlePointerMove);
    root.removeEventListener("pointerup", handlePointerUp);
    root.removeEventListener("pointercancel", handlePointerUp);
    root.removeEventListener("keydown", handleKeyDown);
    root.removeEventListener("keyup", handleKeyUp);
    pauseButton.removeEventListener("click", togglePause);
    restartButton.removeEventListener("click", restart);
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("pagehide", cleanup);
    reduceMotion.removeEventListener("change", handleMotionChange);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  root.addEventListener("pointerdown", handlePointerDown);
  root.addEventListener("pointermove", handlePointerMove);
  root.addEventListener("pointerup", handlePointerUp);
  root.addEventListener("pointercancel", handlePointerUp);
  root.addEventListener("keydown", handleKeyDown);
  root.addEventListener("keyup", handleKeyUp);
  pauseButton.addEventListener("click", togglePause);
  restartButton.addEventListener("click", restart);
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("pagehide", cleanup);
  reduceMotion.addEventListener("change", handleMotionChange);
  root.dataset.reducedMotion = String(state.reducedMotion);
  resize();
  requestTick();

  window.__hourglassGame = {
    durationMs,
    finish() {
      state.debugProgress = null;
      state.elapsedMs = durationMs;
      state.phase = "finished";
      render(performance.now());
    },
    getState() {
      return {
        accuracy: state.scoreWeight > 0 ? state.accuracyTotal / state.scoreWeight : null,
        elapsedMs: state.elapsedMs,
        phase: state.phase,
        tilt: state.tilt,
      };
    },
    restart,
    setProgress(progress) {
      state.debugProgress = clamp(progress);
      state.elapsedMs = state.debugProgress * durationMs;
      state.phase = "preview";
      render(performance.now());
    },
  };
})();
