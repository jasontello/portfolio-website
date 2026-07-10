(() => {
  const canvas = document.querySelector("[data-hourglass-sand]");

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const durationMs = 60000;
  const resetPauseMs = 1400;
  const noiseCanvas = document.createElement("canvas");
  const noiseContext = noiseCanvas.getContext("2d");
  const state = {
    animationFrame: 0,
    debugProgress: null,
    dpr: 1,
    height: 0,
    lastNoise: 0,
    lastRender: 0,
    reducedMotion: mediaQuery.matches,
    startTime: performance.now(),
    width: 0,
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const easeInOut = (value) => value * value * (3 - 2 * value);
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);
  const mix = (start, end, progress) => start + (end - start) * progress;
  const requestedProgress = new URLSearchParams(window.location.search).get("hourglassProgress");

  if (requestedProgress !== null && Number.isFinite(Number(requestedProgress))) {
    state.debugProgress = clamp(Number(requestedProgress));
  }

  const getProgress = (time = performance.now()) => {
    if (state.debugProgress !== null) {
      return state.debugProgress;
    }

    if (state.reducedMotion) {
      return 0.5;
    }

    const cycleTime = (time - state.startTime) % (durationMs + resetPauseMs);

    if (cycleTime >= durationMs) {
      return 1;
    }

    return clamp(cycleTime / durationMs);
  };

  const getGeometry = () => {
    const width = state.width;
    const height = state.height;
    const centerX = width * 0.5;
    const topY = height * 0.075;
    const neckY = height * 0.5;
    const bottomY = height * 0.925;
    const chamberHeight = (bottomY - topY) * 0.5;
    const halfWidth = Math.min(width * 0.41, chamberHeight * 0.94);
    const scale = Math.min(width / 720, height / 820);
    const neckHalfWidth = Math.max(4.5, 8 * scale);

    return {
      bottomY,
      centerX,
      chamberHeight,
      halfWidth,
      neckHalfWidth,
      neckY,
      scale,
      topY,
    };
  };

  const traceTopChamber = (geometry) => {
    const { centerX, halfWidth, neckHalfWidth, neckY, topY } = geometry;

    context.beginPath();
    context.moveTo(centerX - halfWidth, topY + geometry.chamberHeight * 0.055);
    context.quadraticCurveTo(centerX, topY - geometry.chamberHeight * 0.04, centerX + halfWidth, topY);
    context.bezierCurveTo(
      centerX + halfWidth * 0.72,
      topY + geometry.chamberHeight * 0.27,
      centerX + neckHalfWidth * 2.4,
      neckY - geometry.chamberHeight * 0.12,
      centerX + neckHalfWidth,
      neckY
    );
    context.lineTo(centerX - neckHalfWidth, neckY);
    context.bezierCurveTo(
      centerX - neckHalfWidth * 2.4,
      neckY - geometry.chamberHeight * 0.12,
      centerX - halfWidth * 0.74,
      topY + geometry.chamberHeight * 0.3,
      centerX - halfWidth,
      topY + geometry.chamberHeight * 0.055
    );
    context.closePath();
  };

  const traceBottomChamber = (geometry) => {
    const { bottomY, centerX, halfWidth, neckHalfWidth, neckY } = geometry;

    context.beginPath();
    context.moveTo(centerX - neckHalfWidth, neckY);
    context.bezierCurveTo(
      centerX - neckHalfWidth * 2.4,
      neckY + geometry.chamberHeight * 0.12,
      centerX - halfWidth * 0.98,
      bottomY - geometry.chamberHeight * 0.26,
      centerX - halfWidth * 0.72,
      bottomY - geometry.chamberHeight * 0.06
    );
    context.quadraticCurveTo(centerX, bottomY + geometry.chamberHeight * 0.035, centerX + halfWidth * 0.72, bottomY - geometry.chamberHeight * 0.06);
    context.bezierCurveTo(
      centerX + halfWidth * 0.98,
      bottomY - geometry.chamberHeight * 0.26,
      centerX + neckHalfWidth * 2.4,
      neckY + geometry.chamberHeight * 0.12,
      centerX + neckHalfWidth,
      neckY
    );
    context.closePath();
  };

  const buildNoise = (time, force = false) => {
    if (!force && time - state.lastNoise < 240) {
      return;
    }

    state.lastNoise = time;
    const image = noiseContext.createImageData(noiseCanvas.width, noiseCanvas.height);

    for (let index = 0; index < image.data.length; index += 4) {
      const grain = Math.random();
      const value = grain > 0.88 ? 4 : grain > 0.56 ? 20 : 48;
      image.data[index] = value;
      image.data[index + 1] = value + 3;
      image.data[index + 2] = value + 2;
      image.data[index + 3] = grain > 0.42 ? 78 : 24;
    }

    noiseContext.putImageData(image, 0, 0);
  };

  const drawNoise = (alpha, time) => {
    context.save();
    context.globalAlpha = alpha;
    context.globalCompositeOperation = "multiply";
    context.drawImage(
      noiseCanvas,
      Math.sin(time * 0.00021) * -12,
      Math.cos(time * 0.00017) * -9,
      state.width * 1.08,
      state.height * 1.08
    );
    context.restore();
  };

  const drawTopMass = (geometry, progress, time) => {
    const remaining = 1 - progress;
    const density = easeInOut(remaining);
    const surfaceY = mix(
      geometry.topY - geometry.chamberHeight * 0.015,
      geometry.neckY - geometry.neckHalfWidth * 1.1,
      easeInOut(progress)
    );
    const gradient = context.createLinearGradient(geometry.centerX, surfaceY, geometry.centerX, geometry.neckY);

    gradient.addColorStop(0, `rgba(2, 4, 4, ${0.95 * density})`);
    gradient.addColorStop(0.5, `rgba(6, 11, 11, ${0.88 * density})`);
    gradient.addColorStop(1, `rgba(32, 43, 42, ${0.5 * density})`);

    context.save();
    traceTopChamber(geometry);
    context.clip();
    context.filter = `blur(${Math.max(9, 15 * geometry.scale)}px)`;
    context.fillStyle = gradient;
    context.fillRect(
      geometry.centerX - geometry.halfWidth - 30,
      surfaceY - 20,
      geometry.halfWidth * 2 + 60,
      geometry.neckY - surfaceY + 42
    );
    context.filter = "none";
    context.beginPath();
    context.rect(0, surfaceY - 12, state.width, geometry.neckY - surfaceY + 24);
    context.clip();
    drawNoise(0.3 * density, time);
    context.restore();

    if (remaining > 0.015) {
      context.save();
      context.globalAlpha = 0.3 * density;
      context.filter = `blur(${Math.max(5, 8 * geometry.scale)}px)`;
      context.fillStyle = "#050707";
      context.beginPath();
      context.ellipse(
        geometry.centerX + Math.sin(time * 0.00034) * 4,
        surfaceY,
        geometry.halfWidth * mix(0.92, 0.08, progress),
        Math.max(4, geometry.chamberHeight * 0.03),
        -0.025,
        0,
        Math.PI * 2
      );
      context.fill();
      context.restore();
    }

    return surfaceY;
  };

  const drawBottomMass = (geometry, progress, time) => {
    const fill = easeOut(progress);
    const surfaceY = mix(
      geometry.bottomY + geometry.chamberHeight * 0.02,
      geometry.neckY + geometry.neckHalfWidth * 1.35,
      fill
    );
    const gradient = context.createLinearGradient(geometry.centerX, surfaceY, geometry.centerX, geometry.bottomY);

    gradient.addColorStop(0, `rgba(31, 43, 42, ${0.46 + fill * 0.24})`);
    gradient.addColorStop(0.42, `rgba(8, 13, 13, ${0.66 + fill * 0.28})`);
    gradient.addColorStop(1, `rgba(1, 3, 3, ${0.82 + fill * 0.16})`);

    context.save();
    traceBottomChamber(geometry);
    context.clip();
    context.filter = `blur(${Math.max(9, 15 * geometry.scale)}px)`;
    context.fillStyle = gradient;
    context.fillRect(
      geometry.centerX - geometry.halfWidth - 30,
      surfaceY - 16,
      geometry.halfWidth * 2 + 60,
      geometry.bottomY - surfaceY + 44
    );
    context.filter = "none";
    context.beginPath();
    context.rect(0, surfaceY - 10, state.width, geometry.bottomY - surfaceY + 24);
    context.clip();
    drawNoise(0.34 * fill, time + 640);
    context.restore();

    if (progress > 0.008) {
      context.save();
      context.globalAlpha = 0.18 + fill * 0.24;
      context.filter = `blur(${Math.max(5, 8 * geometry.scale)}px)`;
      context.fillStyle = "#111817";
      context.beginPath();
      context.ellipse(
        geometry.centerX + Math.cos(time * 0.00029) * 3,
        surfaceY,
        geometry.halfWidth * (0.045 + Math.sin(Math.PI * fill) * 0.88),
        Math.max(4, geometry.chamberHeight * 0.026),
        0.018,
        0,
        Math.PI * 2
      );
      context.fill();
      context.restore();
    }

    return surfaceY;
  };

  const drawStream = (geometry, progress, bottomSurfaceY, time) => {
    if (progress >= 0.997) {
      return;
    }

    const streamEndY = Math.max(geometry.neckY + geometry.neckHalfWidth * 2, bottomSurfaceY - 2);
    const streamWidth = Math.max(1.4, geometry.neckHalfWidth * 0.36);
    const sway = Math.sin(time * 0.0021) * geometry.neckHalfWidth * 0.22;
    const gradient = context.createLinearGradient(geometry.centerX, geometry.neckY, geometry.centerX, streamEndY);

    gradient.addColorStop(0, "rgba(2, 5, 5, 0.86)");
    gradient.addColorStop(0.54, "rgba(22, 32, 31, 0.48)");
    gradient.addColorStop(1, "rgba(3, 6, 6, 0.68)");

    context.save();
    context.globalAlpha = clamp((1 - progress) / 0.025);
    context.filter = `blur(${Math.max(1.8, 3.5 * geometry.scale)}px)`;
    context.strokeStyle = gradient;
    context.lineWidth = streamWidth;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(geometry.centerX, geometry.neckY - 1);
    context.bezierCurveTo(
      geometry.centerX + sway,
      mix(geometry.neckY, streamEndY, 0.34),
      geometry.centerX - sway * 0.52,
      mix(geometry.neckY, streamEndY, 0.72),
      geometry.centerX,
      streamEndY
    );
    context.stroke();
    context.restore();

    context.save();
    context.globalAlpha = 0.2 + Math.sin(time * 0.005) * 0.04;
    context.filter = `blur(${Math.max(5, 8 * geometry.scale)}px)`;
    context.fillStyle = "#151d1c";
    context.beginPath();
    context.ellipse(
      geometry.centerX,
      streamEndY,
      geometry.halfWidth * mix(0.035, 0.12, progress),
      geometry.chamberHeight * 0.018,
      0,
      0,
      Math.PI * 2
    );
    context.fill();
    context.restore();
  };

  const drawAmbientDust = (geometry, progress, time) => {
    context.save();
    context.fillStyle = "#0c1110";

    for (let index = 0; index < 34; index += 1) {
      const seed = Math.sin((index + 1) * 91.73) * 43758.5453;
      const unit = seed - Math.floor(seed);
      const drift = (time * (0.000012 + unit * 0.000016) + unit * 7) % 1;
      const x = geometry.centerX + (unit - 0.5) * geometry.halfWidth * 2.15;
      const y = mix(geometry.topY, geometry.bottomY, drift);
      const proximity = 1 - clamp(Math.abs(x - geometry.centerX) / (geometry.halfWidth * 1.2));

      context.globalAlpha = 0.018 + proximity * 0.035 * (0.65 + Math.sin(index + progress * Math.PI) * 0.2);
      context.beginPath();
      context.arc(x, y, 0.4 + unit * 1.1, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  };

  const draw = (time) => {
    if (!state.reducedMotion && time - state.lastRender < 34) {
      state.animationFrame = requestAnimationFrame(draw);
      return;
    }

    state.lastRender = time;
    buildNoise(time);

    const progress = getProgress(time);
    const geometry = getGeometry();
    context.clearRect(0, 0, state.width, state.height);
    drawTopMass(geometry, progress, time);
    const bottomSurfaceY = drawBottomMass(geometry, progress, time);
    drawStream(geometry, progress, bottomSurfaceY, time);
    drawAmbientDust(geometry, progress, time);

    canvas.dataset.progress = progress.toFixed(3);
    canvas.dataset.durationSeconds = "60";

    if (!state.reducedMotion && state.debugProgress === null) {
      state.animationFrame = requestAnimationFrame(draw);
      return;
    }

    state.animationFrame = 0;
  };

  const startDrawing = () => {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
    }

    state.animationFrame = 0;
    state.lastRender = 0;
    draw(performance.now());
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    state.width = Math.max(1, Math.round(rect.width));
    state.height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    noiseCanvas.width = 190;
    noiseCanvas.height = Math.max(240, Math.round(190 * (state.height / Math.max(state.width, 1))));
    buildNoise(performance.now(), true);
  };

  const restart = () => {
    state.startTime = performance.now();
    state.debugProgress = null;
    startDrawing();
  };

  const setProgress = (progress) => {
    state.debugProgress = clamp(progress);
    startDrawing();
  };

  resize();
  startDrawing();

  window.__hourglassSand = {
    durationMs,
    getProgress,
    restart,
    setProgress,
  };

  window.addEventListener("resize", () => {
    resize();
    startDrawing();
  });

  mediaQuery.addEventListener("change", (event) => {
    state.reducedMotion = event.matches;
    resize();
    startDrawing();
  });
})();
