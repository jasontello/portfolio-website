(() => {
  const canvas = document.querySelector("[data-hourglass-sand]");

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const durationMs = 60000;
  const noiseCanvas = document.createElement("canvas");
  const noiseContext = noiseCanvas.getContext("2d");
  const state = {
    dpr: 1,
    width: 0,
    height: 0,
    startTime: performance.now(),
    lastRender: 0,
    lastNoise: 0,
    reducedMotion: mediaQuery.matches,
    animationFrame: 0,
    debugProgress: null,
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const easeInOut = (value) => value * value * (3 - 2 * value);
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);
  const mix = (start, end, progress) => start + (end - start) * progress;

  const getProgress = (time = performance.now()) => {
    if (state.debugProgress !== null) {
      return state.debugProgress;
    }

    if (state.reducedMotion) {
      return 0.48;
    }

    return clamp((time - state.startTime) / durationMs);
  };

  const getGeometry = () => {
    const width = state.width;
    const height = state.height;
    const scale = Math.min(width / 720, height / 820);
    const centerX = width * 0.5;
    const topRightY = height * 0.1;
    const topLeftY = topRightY + height * 0.095;
    const neckY = height * 0.47;
    const neckWidth = Math.max(13, 22 * scale);
    const topHalfWidth = Math.min(width * 0.43, height * 0.46);
    const bottomCenterY = height * 0.765;
    const bottomRadiusX = Math.min(width * 0.305, height * 0.29);
    const bottomRadiusY = Math.min(height * 0.245, width * 0.28);

    return {
      centerX,
      topLeftY,
      topRightY,
      neckY,
      neckWidth,
      topLeftX: centerX - topHalfWidth,
      topRightX: centerX + topHalfWidth * 1.05,
      bottomCenterY,
      bottomRadiusX,
      bottomRadiusY,
      streamBottomY: bottomCenterY - bottomRadiusY * 0.65,
      scale,
    };
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    state.width = Math.max(1, Math.round(rect.width));
    state.height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    noiseCanvas.width = 180;
    noiseCanvas.height = Math.max(220, Math.round(180 * (state.height / Math.max(state.width, 1))));
    buildNoise(performance.now(), true);
  };

  const buildNoise = (time, force = false) => {
    if (!force && time - state.lastNoise < 320) {
      return;
    }

    state.lastNoise = time;
    const image = noiseContext.createImageData(noiseCanvas.width, noiseCanvas.height);
    const pulse = Math.sin(time * 0.00045) * 18;

    for (let index = 0; index < image.data.length; index += 4) {
      const grain = Math.random() * 255;
      const value = grain > 205 ? 8 : grain > 150 ? 26 : 54 + pulse;
      image.data[index] = value;
      image.data[index + 1] = value + 4;
      image.data[index + 2] = value + 4;
      image.data[index + 3] = grain > 118 ? 72 : 22;
    }

    noiseContext.putImageData(image, 0, 0);
  };

  const traceTopCone = (geometry) => {
    context.beginPath();
    context.moveTo(geometry.topLeftX, geometry.topLeftY);
    context.lineTo(geometry.topRightX, geometry.topRightY);
    context.lineTo(geometry.centerX + geometry.neckWidth, geometry.neckY);
    context.lineTo(geometry.centerX - geometry.neckWidth, geometry.neckY);
    context.closePath();
  };

  const traceBottomMass = (geometry, progress) => {
    const fill = mix(0.48, 1, easeOut(progress));
    const radiusY = geometry.bottomRadiusY * mix(0.72, 1.02, fill);
    const centerY = geometry.bottomCenterY + geometry.bottomRadiusY * mix(0.18, 0.02, fill);

    context.beginPath();
    context.ellipse(
      geometry.centerX,
      centerY,
      geometry.bottomRadiusX * mix(0.78, 1.06, fill),
      radiusY,
      0,
      0,
      Math.PI * 2
    );
  };

  const drawNoise = (alpha, driftX, driftY) => {
    context.globalAlpha = alpha;
    context.drawImage(noiseCanvas, driftX, driftY, state.width * 1.08, state.height * 1.08);
  };

  const drawTopFog = (geometry, progress, time) => {
    const remaining = 1 - progress;
    const density = easeInOut(remaining);
    const topSurfaceY = mix(geometry.topRightY - state.height * 0.04, geometry.neckY - geometry.neckWidth * 1.8, easeInOut(progress));
    const fadeBand = Math.max(24, state.height * 0.08);
    const gradient = context.createLinearGradient(geometry.centerX, topSurfaceY, geometry.centerX, geometry.neckY);

    gradient.addColorStop(0, `rgba(1, 4, 4, ${0.94 * density})`);
    gradient.addColorStop(0.54, `rgba(5, 11, 12, ${0.78 * density})`);
    gradient.addColorStop(1, `rgba(24, 42, 44, ${0.34 * density})`);

    context.save();
    traceTopCone(geometry);
    context.clip();
    context.beginPath();
    context.rect(0, topSurfaceY - fadeBand, state.width, geometry.neckY - topSurfaceY + fadeBand * 1.35);
    context.clip();
    context.filter = `blur(${Math.max(16, 27 * geometry.scale)}px)`;
    context.fillStyle = gradient;
    traceTopCone(geometry);
    context.fill();
    context.filter = "none";
    drawNoise(0.24 * density, Math.sin(time * 0.0003) * -12, Math.cos(time * 0.0002) * -9);
    context.restore();

    context.save();
    context.globalAlpha = 0.24 * density;
    context.filter = `blur(${Math.max(8, 13 * geometry.scale)}px)`;
    context.fillStyle = "#000";
    context.beginPath();
    context.ellipse(
      geometry.centerX + geometry.bottomRadiusX * 0.1,
      topSurfaceY + fadeBand * 0.14,
      geometry.bottomRadiusX * 1.05,
      fadeBand * 0.34,
      -0.05,
      0,
      Math.PI * 2
    );
    context.fill();
    context.restore();
  };

  const drawBottomFog = (geometry, progress, time) => {
    const density = mix(0.46, 1, easeOut(progress));
    const glow = mix(0.3, 0.13, progress);
    const gradient = context.createRadialGradient(
      geometry.centerX,
      geometry.bottomCenterY - geometry.bottomRadiusY * 0.58,
      geometry.bottomRadiusX * 0.05,
      geometry.centerX,
      geometry.bottomCenterY + geometry.bottomRadiusY * 0.08,
      geometry.bottomRadiusX * 1.02
    );

    gradient.addColorStop(0, `rgba(54, 72, 72, ${glow})`);
    gradient.addColorStop(0.46, `rgba(13, 20, 19, ${0.68 * density})`);
    gradient.addColorStop(1, `rgba(1, 3, 3, ${0.98 * density})`);

    context.save();
    traceBottomMass(geometry, progress);
    context.clip();
    context.filter = `blur(${Math.max(16, 25 * geometry.scale)}px)`;
    context.fillStyle = gradient;
    traceBottomMass(geometry, progress);
    context.fill();
    context.filter = "none";
    drawNoise(0.16 * density, Math.sin(time * 0.00028) * 10, Math.cos(time * 0.00018) * 13);
    context.restore();
  };

  const drawStreamFog = (geometry, progress, time) => {
    const active = clamp((1 - progress) / 0.08);
    const density = mix(0.08, 0.48, active);

    context.save();
    context.globalAlpha = density;
    context.filter = `blur(${Math.max(6, 10 * geometry.scale)}px)`;
    const gradient = context.createLinearGradient(geometry.centerX, geometry.neckY, geometry.centerX, geometry.streamBottomY);
    gradient.addColorStop(0, "rgba(5, 12, 13, 0.78)");
    gradient.addColorStop(0.48, "rgba(40, 66, 68, 0.3)");
    gradient.addColorStop(1, "rgba(5, 8, 8, 0.52)");
    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(geometry.centerX - geometry.neckWidth * 0.32, geometry.neckY);
    context.bezierCurveTo(
      geometry.centerX - geometry.neckWidth * 0.9 + Math.sin(time * 0.001) * 2,
      mix(geometry.neckY, geometry.streamBottomY, 0.35),
      geometry.centerX - geometry.neckWidth * 0.72,
      mix(geometry.neckY, geometry.streamBottomY, 0.78),
      geometry.centerX - geometry.neckWidth * 0.42,
      geometry.streamBottomY
    );
    context.lineTo(geometry.centerX + geometry.neckWidth * 0.42, geometry.streamBottomY);
    context.bezierCurveTo(
      geometry.centerX + geometry.neckWidth * 0.72,
      mix(geometry.neckY, geometry.streamBottomY, 0.78),
      geometry.centerX + geometry.neckWidth * 0.86 + Math.cos(time * 0.0012) * 2,
      mix(geometry.neckY, geometry.streamBottomY, 0.35),
      geometry.centerX + geometry.neckWidth * 0.32,
      geometry.neckY
    );
    context.closePath();
    context.fill();
    context.restore();
  };

  const drawPaperDust = (time) => {
    context.save();
    context.globalCompositeOperation = "multiply";
    context.globalAlpha = 0.07;
    context.drawImage(
      noiseCanvas,
      Math.sin(time * 0.00018) * -8,
      Math.cos(time * 0.00014) * -8,
      state.width * 1.05,
      state.height * 1.05
    );
    context.restore();
  };

  const draw = (time) => {
    if (!state.reducedMotion && time - state.lastRender < 82) {
      state.animationFrame = requestAnimationFrame(draw);
      return;
    }

    state.lastRender = time;
    buildNoise(time);

    const progress = getProgress(time);
    const geometry = getGeometry();
    context.clearRect(0, 0, state.width, state.height);
    drawTopFog(geometry, progress, time);
    drawStreamFog(geometry, progress, time);
    drawBottomFog(geometry, progress, time);
    drawPaperDust(time);

    canvas.dataset.progress = progress.toFixed(3);
    canvas.dataset.durationSeconds = "60";

    if (!state.reducedMotion && progress < 1) {
      state.animationFrame = requestAnimationFrame(draw);
      return;
    }

    state.animationFrame = 0;
  };

  const startDrawing = () => {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
    }

    state.lastRender = 0;
    draw(performance.now());
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
