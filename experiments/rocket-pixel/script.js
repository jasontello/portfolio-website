const stage = document.querySelector("#poster-stage");
const posterArt = document.querySelector(".poster-art");
const replayButton = document.querySelector("#replay-button");
const takeover = document.querySelector("#cloud-takeover");
const cloudMosaic = document.querySelector("#cloud-mosaic");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const cloudSource = {
  x: 484,
  y: 943,
  width: 518,
  height: 418,
};

const continuationSource = {
  width: 4059,
  height: 4711,
  seedX: 2075,
  seedY: 2787,
  seedWidth: 518,
  seedHeight: 418,
};

let mosaicTimer;
let sceneOpen = false;

function updateControl(label) {
  replayButton.textContent = label;
  stage.setAttribute("aria-label", `${label} the cloud launch scene`);
}

function getCloudStartRect() {
  const posterRect = posterArt.getBoundingClientRect();

  return {
    left: posterRect.left + (cloudSource.x / 1200) * posterRect.width,
    top: posterRect.top + (cloudSource.y / 1558) * posterRect.height,
    width: (cloudSource.width / 1200) * posterRect.width,
    height: (cloudSource.height / 1558) * posterRect.height,
  };
}

function seededNumber(row, column, salt = 0) {
  const value = Math.sin(row * 91.73 + column * 47.21 + salt * 13.37) * 43758.5453;
  return value - Math.floor(value);
}

function getContinuationMetrics(cloudRect) {
  const scaleX = cloudRect.width / continuationSource.seedWidth;
  const scaleY = cloudRect.height / continuationSource.seedHeight;
  const width = continuationSource.width * scaleX;
  const height = continuationSource.height * scaleY;

  return {
    width,
    height,
    left: cloudRect.left - continuationSource.seedX * scaleX,
    top: cloudRect.top - continuationSource.seedY * scaleY,
  };
}

function getPieceClip(row, column) {
  const direction = Math.floor(seededNumber(row, column, 4) * 4);

  return [
    "inset(0 100% 0 0)",
    "inset(0 0 0 100%)",
    "inset(100% 0 0 0)",
    "inset(0 0 100% 0)",
  ][direction];
}

function buildCloudMosaic({ instant = false } = {}) {
  const cloudRect = getCloudStartRect();
  const continuation = getContinuationMetrics(cloudRect);
  const baseSize = Math.max(72, Math.min(148, Math.round(Math.min(window.innerWidth, window.innerHeight) / 7)));
  const columns = Math.ceil(window.innerWidth / baseSize);
  const rows = Math.ceil(window.innerHeight / baseSize);
  const cellWidth = window.innerWidth / columns;
  const cellHeight = window.innerHeight / rows;
  const occupied = Array.from({ length: rows }, () => Array(columns).fill(false));
  const fragment = document.createDocumentFragment();
  let longestDelay = 0;

  cloudMosaic.replaceChildren();
  takeover.style.setProperty("--cloud-bg-width", `${continuation.width}px`);
  takeover.style.setProperty("--cloud-bg-height", `${continuation.height}px`);
  takeover.style.setProperty("--cloud-bg-x", `${continuation.left}px`);
  takeover.style.setProperty("--cloud-bg-y", `${continuation.top}px`);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (occupied[row][column]) continue;

      const canGrowRight = column + 1 < columns && !occupied[row][column + 1];
      const canGrowDown = row + 1 < rows && !occupied[row + 1][column];
      const widthChance = seededNumber(row, column, 1);
      const heightChance = seededNumber(row, column, 2);
      const spanColumns = canGrowRight && widthChance > 0.46 ? 2 : 1;
      const canGrowBlock = canGrowDown
        && (spanColumns === 1 || !occupied[row + 1][column + 1]);
      const spanRows = canGrowBlock && heightChance > 0.58 ? 2 : 1;

      for (let markRow = row; markRow < row + spanRows; markRow += 1) {
        for (let markColumn = column; markColumn < column + spanColumns; markColumn += 1) {
          occupied[markRow][markColumn] = true;
        }
      }

      const piece = document.createElement("span");
      const left = column * cellWidth;
      const top = row * cellHeight;
      const width = Math.min(window.innerWidth - left, cellWidth * spanColumns);
      const height = Math.min(window.innerHeight - top, cellHeight * spanRows);
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const cloudCenterX = cloudRect.left + cloudRect.width / 2;
      const cloudCenterY = cloudRect.top + cloudRect.height / 2;
      const distance = Math.hypot(centerX - cloudCenterX, centerY - cloudCenterY);
      const maxDistance = Math.hypot(window.innerWidth, window.innerHeight);
      const looseDistanceWeight = (distance / maxDistance) * 310;
      const irregularWeight = seededNumber(row, column, 3) * 720;
      const delay = instant ? 0 : Math.round(60 + looseDistanceWeight + irregularWeight);

      longestDelay = Math.max(longestDelay, delay);
      piece.className = "cloud-piece";
      if (instant) piece.classList.add("is-instant");
      piece.style.left = `${left}px`;
      piece.style.top = `${top}px`;
      piece.style.width = `${width + 0.5}px`;
      piece.style.height = `${height + 0.5}px`;
      piece.style.backgroundImage = 'url("assets/cloud-continuation-fine-screen-v2.png")';
      piece.style.backgroundSize = `${continuation.width}px ${continuation.height}px`;
      piece.style.backgroundPosition = `${continuation.left - left}px ${continuation.top - top}px`;
      piece.style.setProperty("--piece-delay", `${delay}ms`);
      piece.style.setProperty("--piece-clip", getPieceClip(row, column));
      fragment.append(piece);
    }
  }

  const anchor = document.createElement("span");
  anchor.className = "cloud-anchor";
  anchor.style.left = `${cloudRect.left}px`;
  anchor.style.top = `${cloudRect.top}px`;
  anchor.style.width = `${cloudRect.width}px`;
  anchor.style.height = `${cloudRect.height}px`;
  anchor.style.backgroundImage = 'url("assets/cloud-anchor-preserved-v2.png")';
  fragment.append(anchor);

  cloudMosaic.append(fragment);
  return longestDelay + 460;
}

function revealRocket() {
  takeover.classList.add("rocket-ready");
  updateControl("Replay");
  takeover.focus({ preventScroll: true });
}

function enterClouds() {
  if (sceneOpen) return;

  sceneOpen = true;

  takeover.hidden = false;
  takeover.setAttribute("aria-hidden", "false");
  takeover.classList.remove("mosaic-complete", "rocket-ready");
  document.body.classList.add("scene-open");
  stage.disabled = true;

  if (motionQuery.matches) {
    buildCloudMosaic({ instant: true });
    takeover.classList.add("mosaic-complete");
    revealRocket();
    return;
  }

  const buildDuration = buildCloudMosaic();
  mosaicTimer = window.setTimeout(() => {
    takeover.classList.add("mosaic-complete");
    revealRocket();
    mosaicTimer = undefined;
  }, buildDuration);
}

function leaveClouds() {
  if (!sceneOpen) return;

  window.clearTimeout(mosaicTimer);
  mosaicTimer = undefined;
  sceneOpen = false;
  takeover.classList.remove("mosaic-complete", "rocket-ready");
  cloudMosaic.replaceChildren();
  takeover.hidden = true;
  takeover.setAttribute("aria-hidden", "true");
  takeover.setAttribute("tabindex", "-1");
  document.body.classList.remove("scene-open");
  stage.disabled = false;
  updateControl("Enter");
  stage.focus({ preventScroll: true });
}

stage.addEventListener("click", enterClouds);
replayButton.addEventListener("click", enterClouds);
takeover.addEventListener("click", leaveClouds);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    leaveClouds();
    return;
  }

  if ((event.key === " " || event.code === "Space") && !sceneOpen && document.activeElement === stage) {
    event.preventDefault();
    enterClouds();
  }
});

window.addEventListener("resize", () => {
  if (!sceneOpen) return;

  window.clearTimeout(mosaicTimer);
  mosaicTimer = undefined;
  buildCloudMosaic({ instant: true });
  takeover.classList.add("mosaic-complete");
  if (!takeover.classList.contains("rocket-ready")) revealRocket();
});
