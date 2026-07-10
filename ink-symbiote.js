const MAX_INK_BLOBS = 36;
const INK_POSITION_SCALE = 0.68;
const INK_RADIUS_SCALE = 0.72;

const inkBlobBlueprint = [
  { x: -0.03, y: 0.03, r: 0.092, seed: 0.11, pull: 0.9 },
  { x: 0.05, y: 0.02, r: 0.084, seed: 0.42, pull: 0.84 },
  { x: -0.06, y: -0.07, r: 0.082, seed: 0.73, pull: 0.86 },
  { x: 0.06, y: -0.08, r: 0.074, seed: 0.31, pull: 0.82 },
  { x: -0.12, y: 0.06, r: 0.063, seed: 0.52, pull: 1.04 },
  { x: 0.12, y: 0.06, r: 0.058, seed: 0.93, pull: 0.96 },
  { x: -0.11, y: -0.14, r: 0.053, seed: 0.24, pull: 1.08 },
  { x: 0.0, y: -0.16, r: 0.061, seed: 0.64, pull: 1.02 },
  { x: 0.14, y: -0.16, r: 0.05, seed: 0.82, pull: 1.02 },
  { x: -0.2, y: 0.02, r: 0.054, seed: 0.35, pull: 1.12 },
  { x: -0.25, y: 0.11, r: 0.065, seed: 0.57, pull: 1.2 },
  { x: -0.3, y: 0.0, r: 0.048, seed: 0.15, pull: 1.26 },
  { x: -0.22, y: -0.11, r: 0.047, seed: 0.76, pull: 1.18 },
  { x: 0.25, y: 0.1, r: 0.078, seed: 0.67, pull: 1.14 },
  { x: 0.3, y: 0.03, r: 0.064, seed: 0.28, pull: 1.08 },
  { x: 0.34, y: -0.08, r: 0.047, seed: 0.49, pull: 1.16 },
  { x: 0.18, y: -0.02, r: 0.043, seed: 0.88, pull: 1.08 },
  { x: -0.12, y: 0.22, r: 0.038, seed: 0.2, pull: 1.34 },
  { x: 0.01, y: 0.24, r: 0.034, seed: 0.61, pull: 1.32 },
  { x: 0.14, y: 0.21, r: 0.036, seed: 0.95, pull: 1.28 },
  { x: -0.18, y: 0.31, r: 0.027, seed: 0.07, pull: 1.45 },
  { x: 0.43, y: 0.16, r: 0.049, seed: 0.38, pull: 1.36 },
  { x: 0.5, y: 0.04, r: 0.041, seed: 0.72, pull: 1.38 },
  { x: -0.02, y: -0.29, r: 0.024, seed: 0.18, pull: 1.5 },
  { x: -0.11, y: -0.24, r: 0.027, seed: 0.81, pull: 1.44 },
  { x: 0.06, y: -0.25, r: 0.023, seed: 0.46, pull: 1.48 },
  { x: -0.17, y: -0.01, r: 0.036, seed: 0.56, pull: 1.16 },
  { x: -0.02, y: 0.13, r: 0.052, seed: 0.97, pull: 0.92 },
  { x: 0.07, y: 0.14, r: 0.044, seed: 0.36, pull: 0.94 },
  { x: 0.01, y: -0.03, r: 0.057, seed: 0.69, pull: 0.84 },
  { x: -0.33, y: 0.08, r: 0.034, seed: 0.26, pull: 1.32 },
  { x: 0.22, y: -0.2, r: 0.029, seed: 0.9, pull: 1.42 },
  { x: -0.39, y: 0.16, r: 0.028, seed: 0.13, pull: 1.4 },
  { x: 0.0, y: 0.34, r: 0.025, seed: 0.78, pull: 1.46 },
  { x: 0.13, y: -0.29, r: 0.02, seed: 0.51, pull: 1.55 },
  { x: -0.23, y: -0.24, r: 0.021, seed: 0.04, pull: 1.52 }
];

const inkVertexShaderSource = `
  attribute vec2 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const inkFragmentShaderSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  #define MAX_BLOBS 36

  uniform vec2 uResolution;
  uniform float uTime;
  uniform int uBlobCount;
  uniform vec4 uBlobs[MAX_BLOBS];
  uniform vec2 uFlows[MAX_BLOBS];

  void main() {
    vec2 uv = (gl_FragCoord.xy - (uResolution * 0.5)) / min(uResolution.x, uResolution.y);
    float field = 0.0;
    float glint = 0.0;
    vec2 gradient = vec2(0.0);

    for (int i = 0; i < MAX_BLOBS; i += 1) {
      if (i < uBlobCount) {
        vec4 blob = uBlobs[i];
        vec2 flow = uFlows[i];
        vec2 offset = uv - blob.xy;
        float speed = clamp(length(flow) * 8.0, 0.0, 1.0);
        vec2 direction = normalize(flow + vec2(0.00031, -0.00027));
        float along = dot(offset, direction);
        vec2 acrossVector = offset - direction * along;
        along /= 1.0 + speed * 1.15;
        float across = length(acrossVector) * (1.0 + speed * 0.26);
        float distanceSquared = along * along + across * across + 0.00005;
        float amount = (blob.z * blob.z) / distanceSquared;

        field += amount;
        gradient += -2.0 * blob.z * blob.z * offset / (distanceSquared * distanceSquared + 0.000001);
        glint += amount * blob.w;
      }
    }

    float body = smoothstep(1.2, 1.54, field);
    float feather = smoothstep(0.76, 1.2, field) * 0.08;
    float alpha = clamp(max(body * 0.97, feather * (1.0 - body)), 0.0, 0.97);

    if (alpha < 0.004) {
      discard;
    }

    vec2 normalXY = normalize(gradient + vec2(0.0001)) * -0.54;
    vec3 normal = normalize(vec3(normalXY, 0.84));
    vec3 light = normalize(vec3(-0.42, 0.72, 0.58));
    vec3 view = vec3(0.0, 0.0, 1.0);
    float diffuse = clamp(dot(normal, light), 0.0, 1.0);
    float specular = pow(clamp(dot(reflect(-light, normal), view), 0.0, 1.0), 34.0);
    float secondary = pow(clamp(dot(reflect(normalize(vec3(0.62, -0.28, 0.5)), normal), view), 0.0, 1.0), 52.0);
    float veining = (sin(glint * 0.22 + uv.x * 8.0 - uv.y * 7.0 + uTime * 0.35) * 0.5 + 0.5) * body;
    float rim = pow(clamp(1.0 - normal.z, 0.0, 1.0), 1.65) * body;

    vec3 color = vec3(0.014, 0.017, 0.019);
    color += vec3(0.04, 0.047, 0.05) * diffuse * body;
    color += vec3(0.13, 0.14, 0.135) * specular * body;
    color += vec3(0.052, 0.056, 0.052) * secondary * body;
    color += vec3(0.018, 0.02, 0.02) * veining * 0.1;
    color -= vec3(0.012) * rim;

    gl_FragColor = vec4(color, alpha);
  }
`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function createInkShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createInkProgram(gl) {
  const vertexShader = createInkShader(gl, gl.VERTEX_SHADER, inkVertexShaderSource);
  const fragmentShader = createInkShader(gl, gl.FRAGMENT_SHADER, inkFragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function createInkBlobs() {
  return inkBlobBlueprint.map((blob, index) => ({
    ...blob,
    centerX: blob.x * INK_POSITION_SCALE * 0.16,
    centerY: blob.y * INK_POSITION_SCALE * 0.16,
    phase: blob.seed * Math.PI * 12 + index * 0.41,
    r: blob.r * INK_RADIUS_SCALE,
    vx: 0,
    vy: 0,
    x: blob.x * INK_POSITION_SCALE,
    y: blob.y * INK_POSITION_SCALE
  }));
}

const inkSymbioteInstances = [];

function InkSymbiote(root) {
  const wrapper = document.createElement("div");
  const canvas = document.createElement("canvas");
  const frameRef = { current: 0 };
  const previewMode = root.hasAttribute("data-ink-preview");
  const blobs = createInkBlobs();

  if (previewMode) {
    const previewLobes = [
      { x: -0.16, y: 0.05 },
      { x: -0.04, y: 0.15 },
      { x: 0.13, y: 0.1 },
      { x: 0.18, y: -0.05 },
      { x: 0.05, y: -0.16 },
      { x: -0.12, y: -0.14 }
    ];
    const previewDropletIndices = [20, 23, 25, 31, 34, 35];

    blobs.forEach((blob, index) => {
      const lobe = previewLobes[index % previewLobes.length];
      const dropletIndex = previewDropletIndices.indexOf(index);

      blob.centerX = lobe.x + blob.centerX * 0.75;
      blob.centerY = lobe.y + blob.centerY * 0.75;
      blob.r *= 1.5;
      blob.x = blob.centerX;
      blob.y = blob.centerY;
      blob.previewDroplet = dropletIndex !== -1;
      blob.previewDropletDelay = dropletIndex * 0.15;
      blob.previewDropletDistance = 0.28 + (dropletIndex % 3) * 0.045;
      blob.previewDropletSpeed = 0.065 + dropletIndex * 0.003;
      blob.previewDropletAngle = (dropletIndex / previewDropletIndices.length) * Math.PI * 2;
    });
  }

  const pointer = {
    down: false,
    downStrength: 0,
    lastX: 0,
    lastY: 0,
    pointerId: null,
    pulse: 0,
    pulseX: 0,
    pulseY: 0,
    strength: 0,
    targetStrength: 0,
    velocityX: 0,
    velocityY: 0,
    x: 0,
    y: 0
  };
  let reduceMotion = false;
  let animationFrame = 0;
  let centerReturn = previewMode;
  let resizeObserver = null;

  wrapper.className = "ink-symbiote";
  wrapper.setAttribute("aria-hidden", "true");
  canvas.className = "ink-symbiote-canvas";
  wrapper.appendChild(canvas);
  root.appendChild(wrapper);

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false
  });
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!gl) {
    wrapper.classList.add("ink-symbiote--unsupported");
    return { destroy: () => wrapper.remove() };
  }

  const program = createInkProgram(gl);

  if (!program) {
    wrapper.classList.add("ink-symbiote--unsupported");
    return { destroy: () => wrapper.remove() };
  }

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const resolutionLocation = gl.getUniformLocation(program, "uResolution");
  const timeLocation = gl.getUniformLocation(program, "uTime");
  const blobCountLocation = gl.getUniformLocation(program, "uBlobCount");
  const blobsLocation = gl.getUniformLocation(program, "uBlobs[0]");
  const flowsLocation = gl.getUniformLocation(program, "uFlows[0]");
  const buffer = gl.createBuffer();
  const blobData = new Float32Array(MAX_INK_BLOBS * 4);
  const flowData = new Float32Array(MAX_INK_BLOBS * 2);
  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

  const getCanvasPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    const minDimension = Math.max(1, Math.min(rect.width, rect.height));

    return {
      x: (event.clientX - rect.left - rect.width / 2) / minDimension,
      y: (rect.height / 2 - (event.clientY - rect.top)) / minDimension
    };
  };

  const movePointer = (event) => {
    const point = getCanvasPoint(event);

    pointer.velocityX = point.x - pointer.lastX;
    pointer.velocityY = point.y - pointer.lastY;
    pointer.lastX = point.x;
    pointer.lastY = point.y;
    pointer.targetStrength = 1;
    pointer.x = point.x;
    pointer.y = point.y;
  };

  const handlePointerDown = (event) => {
    if (reduceMotion || event.button !== 0 || event.isPrimary === false) {
      return;
    }

    event.preventDefault();
    const point = getCanvasPoint(event);

    pointer.down = true;
    pointer.pointerId = event.pointerId;
    pointer.pulse = 1;
    pointer.pulseX = point.x;
    pointer.pulseY = point.y;
    pointer.targetStrength = 1;
    pointer.lastX = point.x;
    pointer.lastY = point.y;
    pointer.x = point.x;
    pointer.y = point.y;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can be unavailable after the pointer has already ended.
    }
  };

  const handlePointerMove = (event) => {
    if (reduceMotion) {
      return;
    }

    if (pointer.down && pointer.pointerId !== event.pointerId) {
      return;
    }

    if (pointer.down) {
      event.preventDefault();
    }

    movePointer(event);
  };

  const handlePointerRelease = (event) => {
    if (!pointer.down || pointer.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    if (typeof event.currentTarget.releasePointerCapture === "function") {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Capture may already have been released by the browser.
      }
    }

    pointer.down = false;
    pointer.pointerId = null;
    pointer.pulse = Math.max(pointer.pulse, 0.56);
  };

  const handlePointerLeave = () => {
    pointer.down = false;
    pointer.pointerId = null;
    pointer.targetStrength = 0;
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const render = (now) => {
    if (document.hidden) {
      animationFrame = 0;
      frameRef.current = 0;
      return;
    }

    const time = now * 0.001;
    const nextStrength = pointer.targetStrength;
    const nextDownStrength = pointer.down ? 1 : 0;

    pointer.targetStrength = pointer.down ? 1 : pointer.targetStrength;
    pointer.strength += (nextStrength - pointer.strength) * 0.11;
    pointer.downStrength += (nextDownStrength - pointer.downStrength) * 0.18;
    pointer.velocityX *= 0.82;
    pointer.velocityY *= 0.82;
    pointer.pulse *= 0.915;

    blobs.forEach((blob, index) => {
      const driftX =
        Math.sin(time * (0.32 + blob.seed * 0.12) + blob.phase) * blob.r * 0.16 +
        Math.sin(time * 0.17 + blob.phase * 1.7) * 0.004;
      const driftY =
        Math.cos(time * (0.28 + blob.seed * 0.11) + blob.phase * 0.82) * blob.r * 0.16 +
        Math.sin(time * 0.21 + blob.phase) * 0.004;
      const pointerDx = pointer.x - blob.x;
      const pointerDy = pointer.y - blob.y;
      const pointerDistance = Math.hypot(pointerDx, pointerDy);
      const hoverReach = 0.24 + blob.r * 1.1;
      const hover = Math.pow(1 - clamp(pointerDistance / hoverReach, 0, 1), 2);
      const hoverPull = hover * pointer.strength * (0.18 + blob.pull * 0.08);
      const downPull = hover * pointer.downStrength * (0.2 + blob.pull * 0.06);
      const pulseDx = blob.x - pointer.pulseX;
      const pulseDy = blob.y - pointer.pulseY;
      const pulseDistance = Math.max(0.001, Math.hypot(pulseDx, pulseDy));
      const pulseReach = 0.28 + blob.r;
      const pulseInfluence = Math.pow(1 - clamp(pulseDistance / pulseReach, 0, 1), 2);
      const pulsePush = pointer.pulse * pulseInfluence * (0.04 + blob.pull * 0.014);

      let targetX = blob.x + driftX;
      let targetY = blob.y + driftY;
      const isPreviewDroplet = previewMode && blob.previewDroplet;

      if (isPreviewDroplet) {
        const dropletCycle = (time * blob.previewDropletSpeed + blob.previewDropletDelay) % 1;
        const dropletExcursion = Math.pow(Math.sin(Math.PI * dropletCycle), 2.35);
        const dropletAngle = blob.previewDropletAngle + dropletCycle * Math.PI * 2;
        const dropletDistance = blob.previewDropletDistance * dropletExcursion;

        targetX = blob.centerX + Math.cos(dropletAngle) * dropletDistance;
        targetY = blob.centerY + Math.sin(dropletAngle) * dropletDistance * 0.72;
      }

      targetX += pointerDx * (hoverPull + downPull);
      targetY += pointerDy * (hoverPull + downPull);
      targetX += (pulseDx / pulseDistance) * pulsePush;
      targetY += (pulseDy / pulseDistance) * pulsePush;

      if (centerReturn && !isPreviewDroplet) {
        targetX += (blob.centerX - blob.x) * 0.32;
        targetY += (blob.centerY - blob.y) * 0.32;
      }

      const centerStiffness = centerReturn ? 0.012 : 0;
      const previewDropletStiffness = isPreviewDroplet ? 0.055 : 0;
      const stiffness = reduceMotion ? 1 : 0.038 + hover * 0.03 + pointer.downStrength * 0.022 + centerStiffness + previewDropletStiffness;
      const damping = reduceMotion ? 0 : centerReturn ? 0.74 : 0.82;

      blob.vx = (blob.vx + (targetX - blob.x) * stiffness) * damping;
      blob.vy = (blob.vy + (targetY - blob.y) * stiffness) * damping;
      blob.x += blob.vx;
      blob.y += blob.vy;

      const pulseScale = 1 + pulseInfluence * pointer.pulse * 0.1 + hover * pointer.downStrength * 0.08;
      const breathing = reduceMotion ? 0 : Math.sin(time * (0.72 + blob.seed * 0.18) + blob.phase) * 0.025;
      const dataIndex = index * 4;
      const flowIndex = index * 2;

      blobData[dataIndex] = blob.x;
      blobData[dataIndex + 1] = blob.y;
      blobData[dataIndex + 2] = blob.r * (pulseScale + breathing);
      blobData[dataIndex + 3] = blob.seed * 6.283 + Math.sin(time * 0.24 + blob.phase) * 0.8;
      flowData[flowIndex] = blob.vx + pointer.velocityX * hover * 0.22;
      flowData[flowIndex + 1] = blob.vy + pointer.velocityY * hover * 0.22;
    });

    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, time);
    gl.uniform1i(blobCountLocation, blobs.length);
    gl.uniform4fv(blobsLocation, blobData);
    gl.uniform2fv(flowsLocation, flowData);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!reduceMotion) {
      animationFrame = window.requestAnimationFrame(render);
      frameRef.current = animationFrame;
    }
  };

  const restart = () => {
    window.cancelAnimationFrame(animationFrame);
    window.cancelAnimationFrame(frameRef.current);
    reduceMotion = motionQuery.matches;
    resizeCanvas();
    render(performance.now());
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(frameRef.current);
      animationFrame = 0;
      frameRef.current = 0;
      return;
    }

    restart();
  };

  const beginReturnToCenter = () => {
    pointer.down = false;
    pointer.pointerId = null;
    pointer.pulse = 0;
    pointer.targetStrength = 0;
    pointer.strength = 0;
    pointer.downStrength = 0;
    pointer.velocityX = 0;
    pointer.velocityY = 0;
    pointer.x = 0;
    pointer.y = 0;
    if (reduceMotion) {
      centerReturn = false;
      blobs.forEach((blob) => {
        blob.x = blob.centerX;
        blob.y = blob.centerY;
        blob.vx = 0;
        blob.vy = 0;
      });
    } else {
      centerReturn = true;
    }

    if (!animationFrame) {
      restart();
    }
  };

  const stopReturnToCenter = () => {
    centerReturn = false;

    blobs.forEach((blob) => {
      blob.vx = 0;
      blob.vy = 0;
    });
  };

  canvas.addEventListener("pointercancel", handlePointerRelease);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerenter", movePointer);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerRelease);
  resizeObserver = new ResizeObserver(restart);
  resizeObserver.observe(canvas);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  motionQuery.addEventListener("change", restart);
  restart();

  return {
    beginReturnToCenter,
    stopReturnToCenter,
    destroy() {
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", restart);
      canvas.removeEventListener("pointercancel", handlePointerRelease);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerenter", movePointer);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerRelease);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      wrapper.remove();
    }
  };
}

window.InkSymbiote = InkSymbiote;
window.inkSymbioteInstances = inkSymbioteInstances;

document.querySelectorAll("[data-ink-symbiote]").forEach((root) => {
  const instance = InkSymbiote(root);

  inkSymbioteInstances.push(instance);
  root.inkSymbiote = instance;
});

document.querySelectorAll("[data-ink-return]").forEach((button) => {
  let activeCenterMouseHold = false;
  let activeCenterKeyHold = false;

  const beginCenterHold = (event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    activeCenterMouseHold = true;

    inkSymbioteInstances.forEach((instance) => {
      if (typeof instance.beginReturnToCenter === "function") {
        instance.beginReturnToCenter();
      }
    });
  };

  const stopCenterHold = () => {
    if (!activeCenterMouseHold) {
      return;
    }

    activeCenterMouseHold = false;

    inkSymbioteInstances.forEach((instance) => {
      if (typeof instance.stopReturnToCenter === "function") {
        instance.stopReturnToCenter();
      }
    });
  };

  const handleCenterKeyDown = (event) => {
    if (event.repeat || (event.key !== " " && event.key !== "Enter")) {
      return;
    }

    event.preventDefault();
    activeCenterKeyHold = true;
    inkSymbioteInstances.forEach((instance) => {
      if (typeof instance.beginReturnToCenter === "function") {
        instance.beginReturnToCenter();
      }
    });
  };

  const handleCenterKeyUp = (event) => {
    if (event.key !== " " && event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    activeCenterKeyHold = false;
    inkSymbioteInstances.forEach((instance) => {
      if (typeof instance.stopReturnToCenter === "function") {
        instance.stopReturnToCenter();
      }
    });
  };

  button.addEventListener("mousedown", beginCenterHold);
  button.addEventListener("keydown", handleCenterKeyDown);
  button.addEventListener("keyup", handleCenterKeyUp);
  window.addEventListener("blur", () => {
    if (activeCenterMouseHold) {
      stopCenterHold();
    }

    if (activeCenterKeyHold) {
      activeCenterKeyHold = false;
      inkSymbioteInstances.forEach((instance) => {
        if (typeof instance.stopReturnToCenter === "function") {
          instance.stopReturnToCenter();
        }
      });
    }
  });
  window.addEventListener("mouseup", stopCenterHold);
});
