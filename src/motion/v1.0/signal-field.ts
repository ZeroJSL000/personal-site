/**
 * Home motion v1.0 — frozen 2026-09-16.
 * Canonical copy: this file. Do not change unless a new version is requested.
 */
type Particle = {
  noiseX: number;
  noiseY: number;
  targetX: number;
  targetY: number;
  radius: number;
  alpha: number;
  phase: number;
  depth: number;
};

type Candle = {
  x: number;
  width: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  up: boolean;
};

type Chart = {
  candles: Candle[];
  buyIndex: number;
  sellIndex: number;
};

type SignalField = {
  destroy: () => void;
  setProgress: (value: number) => void;
};

const TAU = Math.PI * 2;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function smoothstep(from: number, to: number, value: number) {
  const x = clamp((value - from) / Math.max(to - from, 0.0001));
  return x * x * (3 - 2 * x);
}

/** Deterministic 0–1 pseudo-random value. */
function n(i: number, salt = 1) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A deterministic but market-like OHLC series.
 * It includes gaps, volatility clusters, pullbacks and unequal wicks so the
 * finished chart reads like price action instead of a decorative staircase.
 */
function headerClearance() {
  const header = document.querySelector("header");
  return header?.getBoundingClientRect().height ?? 72;
}

function chartBand(width: number, height: number) {
  // Draft left–right and relative span. Top sits below the sticky nav with
  // room for the S marker; bottom stays above the hero copy.
  const top = headerClearance() + 34;
  const draftSpan = height * (width < 560 ? 0.425 : 0.475);
  const copyFloor = height * (width < 560 ? 0.46 : 0.5);
  const bottom = Math.min(top + draftSpan, copyFloor);
  return {
    left: width * (width < 560 ? 0.06 : 0.075),
    right: width * 0.95,
    top,
    bottom,
  };
}

function buildChart(width: number, height: number): Chart {
  const count = width < 560 ? 22 : width < 900 ? 30 : 38;
  const { left, right, top, bottom } = chartBand(width, height);
  const gap = (right - left) / count;
  const bodyWidth = Math.max(4, Math.min(14, gap * 0.58));

  const raw: Array<{
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
  }> = [];

  let previousClose = 100;

  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(count - 1, 1);
    const trend = 100 + t * 17;
    const cycle = Math.sin(t * Math.PI * 4.1 - 0.55) * 3.2;
    const microCycle = Math.sin(t * Math.PI * 9.4 + 0.8) * 1.15;
    const pullback = -6.5 * Math.exp(-Math.pow((t - 0.36) / 0.1, 2));
    const rally = 4.8 * Math.exp(-Math.pow((t - 0.76) / 0.14, 2));
    const lateProfitTaking = -4.2 * Math.exp(-Math.pow((t - 0.97) / 0.065, 2));
    const target = trend + cycle + microCycle + pullback + rally + lateProfitTaking;

    const gapMove = (n(i, 2) - 0.5) * (0.65 + n(i, 3) * 0.8);
    const open = previousClose + gapMove;
    const volatility = 0.85 + n(i, 4) * 1.6 + Math.abs(Math.sin(t * Math.PI * 3.2)) * 0.55;
    const close = open * 0.36 + target * 0.64 + (n(i, 5) - 0.5) * volatility;
    const body = Math.abs(close - open);
    const upperWick = 0.45 + n(i, 6) * (1.2 + volatility * 0.42);
    const lowerWick = 0.45 + n(i, 7) * (1.15 + volatility * 0.4);
    const high = Math.max(open, close) + upperWick;
    const low = Math.min(open, close) - lowerWick;
    const volume = 0.28 + n(i, 8) * 0.5 + Math.min(0.35, body * 0.08);

    raw.push({ open, close, high, low, volume });
    previousClose = close;
  }

  const minimum = Math.min(...raw.map((candle) => candle.low));
  const maximum = Math.max(...raw.map((candle) => candle.high));
  const padding = Math.max(1, (maximum - minimum) * 0.07);
  const priceMin = minimum - padding;
  const priceMax = maximum + padding;
  const mapPrice = (price: number) =>
    bottom - ((price - priceMin) / Math.max(priceMax - priceMin, 0.001)) * (bottom - top);

  const candles = raw.map((candle, index): Candle => ({
    x: left + gap * (index + 0.5),
    width: bodyWidth,
    open: mapPrice(candle.open),
    close: mapPrice(candle.close),
    high: mapPrice(candle.high),
    low: mapPrice(candle.low),
    volume: clamp(candle.volume),
    up: candle.close >= candle.open,
  }));

  const buyStart = Math.floor(count * 0.23);
  const buyEnd = Math.floor(count * 0.5);
  let buyIndex = buyStart;
  for (let i = buyStart + 1; i <= buyEnd; i += 1) {
    if (candles[i]!.low > candles[buyIndex]!.low) buyIndex = i;
  }

  const sellStart = Math.max(buyIndex + 5, Math.floor(count * 0.62));
  const sellEnd = Math.min(count - 2, Math.floor(count * 0.9));
  let sellIndex = sellStart;
  for (let i = sellStart + 1; i <= sellEnd; i += 1) {
    if (candles[i]!.high < candles[sellIndex]!.high) sellIndex = i;
  }

  return { candles, buyIndex, sellIndex };
}

export function initSignalField(canvas: HTMLCanvasElement): SignalField {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return { destroy() {}, setProgress() {} };

  const ctx = context;
  const reduced = prefersReducedMotion();
  let width = 0;
  let height = 0;
  let dpr = 1;
  let targetProgress = reduced ? 1 : 0;
  let renderedProgress = targetProgress;
  let pointerX = -1000;
  let pointerY = -1000;
  let pointerVelocityX = 0;
  let pointerVelocityY = 0;
  let pointerInside = false;
  let previousPointerX = -1000;
  let previousPointerY = -1000;
  let previousPointerTime = performance.now();
  let running = false;
  let frame = 0;
  let lastFrameTime = performance.now();
  let particles: Particle[] = [];
  let chart: Chart = { candles: [], buyIndex: 0, sellIndex: 0 };
  let visible = true;

  const assignTarget = (particleIndex: number) => {
    const candles = chart.candles;
    const candle = candles[particleIndex % Math.max(candles.length, 1)];
    if (!candle) return { x: width / 2, y: height / 3 };

    const mode = n(particleIndex, 21);
    const bodyTop = Math.min(candle.open, candle.close);
    const bodyBottom = Math.max(candle.open, candle.close);
    const bodyHeight = Math.max(3, bodyBottom - bodyTop);

    if (mode < 0.34) {
      return {
        x: candle.x + (n(particleIndex, 22) - 0.5) * 1.4,
        y: mix(candle.high, candle.low, n(particleIndex, 23)),
      };
    }

    if (mode < 0.7) {
      const edge = n(particleIndex, 24) > 0.5 ? -1 : 1;
      return {
        x: candle.x + edge * candle.width * 0.48 + (n(particleIndex, 25) - 0.5) * 1.2,
        y: bodyTop + n(particleIndex, 26) * bodyHeight,
      };
    }

    return {
      x: candle.x + (n(particleIndex, 27) - 0.5) * candle.width * 0.84,
      y: bodyTop + n(particleIndex, 28) * bodyHeight,
    };
  };

  const seed = () => {
    const count = reduced ? 160 : width < 560 ? 180 : width < 900 ? 240 : 320;
    particles = Array.from({ length: count }, (_, index) => {
      const target = assignTarget(index);
      return {
        noiseX: n(index, 30) * width,
        noiseY: n(index, 31) * height,
        targetX: target.x,
        targetY: target.y,
        radius: 0.65 + n(index, 32) * 1.45,
        alpha: 0.28 + n(index, 33) * 0.58,
        phase: n(index, 34) * TAU,
        depth: 0.45 + n(index, 35) * 0.9,
      };
    });
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    chart = buildChart(width, height);
    seed();
    lastFrameTime = performance.now();
    draw(lastFrameTime);
  };

  const drawGrid = (progress: number) => {
    const alpha = smoothstep(0.2, 0.58, progress) * 0.16;
    if (alpha <= 0.001) return;

    const { left, right, top, bottom } = chartBand(width, height);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(175, 205, 210, ${alpha})`;
    ctx.setLineDash([2, 8]);
    for (let i = 0; i < 5; i += 1) {
      const y = mix(top, bottom, i / 4);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const updateAndDrawParticles = (time: number, delta: number, progress: number) => {
    const gather = smoothstep(0.14, 0.67, progress);
    const settle = smoothstep(0.5, 0.86, progress);
    const particleFade = mix(1, 0.14, settle);

    ctx.save();
    ctx.fillStyle = "rgb(212, 237, 241)";

    for (const particle of particles) {
      if (!reduced) {
        const angle =
          Math.sin(particle.noiseX * 0.007 + time * 0.00072 + particle.phase) * 1.5 +
          Math.cos(particle.noiseY * 0.009 - time * 0.00056 + particle.phase * 0.7) * 1.15;
        const speed = (24 + particle.depth * 33) * mix(1, 0.12, gather);
        particle.noiseX += Math.cos(angle) * speed * delta;
        particle.noiseY += Math.sin(angle) * speed * delta;

        if (pointerInside && gather < 0.92) {
          const dx = particle.noiseX - pointerX;
          const dy = particle.noiseY - pointerY;
          const distance = Math.max(1, Math.hypot(dx, dy));
          if (distance < 170) {
            const influence = Math.pow(1 - distance / 170, 2) * (1 - gather);
            particle.noiseX += (-dy / distance) * influence * 72 * delta;
            particle.noiseY += (dx / distance) * influence * 72 * delta;
            particle.noiseX += pointerVelocityX * influence * 0.018;
            particle.noiseY += pointerVelocityY * influence * 0.018;
          }
        }

        const horizontalPad = 16;
        const verticalPad = 16;
        if (particle.noiseX < -horizontalPad) particle.noiseX = width + horizontalPad;
        if (particle.noiseX > width + horizontalPad) particle.noiseX = -horizontalPad;
        if (particle.noiseY < -verticalPad) particle.noiseY = height + verticalPad;
        if (particle.noiseY > height + verticalPad) particle.noiseY = -verticalPad;
      }

      const shimmer = Math.sin(time * 0.0026 + particle.phase) * 0.7 * settle;
      const x = mix(particle.noiseX, particle.targetX + shimmer, gather);
      const y = mix(particle.noiseY, particle.targetY, gather);
      const radius = mix(particle.radius, Math.max(0.55, particle.radius * 0.72), gather);

      ctx.globalAlpha = particle.alpha * particleFade;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawCandles = (progress: number) => {
    const reveal = smoothstep(0.3, 0.76, progress);
    if (reveal <= 0.001) return;

    const candles = chart.candles;
    const { bottom } = chartBand(width, height);
    const volumeBaseline = bottom + height * 0.105;
    const maxVolumeHeight = height * 0.075;

    ctx.save();
    ctx.lineCap = "round";

    candles.forEach((candle, index) => {
      const local = smoothstep(index / candles.length - 0.055, index / candles.length + 0.045, reveal);
      if (local <= 0.001) return;

      const upStroke = `rgba(108, 218, 180, ${0.9 * local})`;
      const downStroke = `rgba(244, 127, 122, ${0.86 * local})`;
      const stroke = candle.up ? upStroke : downStroke;
      const fill = candle.up
        ? `rgba(108, 218, 180, ${0.3 * local})`
        : `rgba(244, 127, 122, ${0.27 * local})`;

      const bodyTop = Math.min(candle.open, candle.close);
      const bodyBottom = Math.max(candle.open, candle.close);
      const bodyMid = (bodyTop + bodyBottom) / 2;
      const halfBody = Math.max(1.5, (bodyBottom - bodyTop) / 2) * local;
      const wickTop = mix(bodyMid, candle.high, local);
      const wickBottom = mix(bodyMid, candle.low, local);

      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, Math.min(1.45, candle.width * 0.12));
      ctx.beginPath();
      ctx.moveTo(candle.x, wickTop);
      ctx.lineTo(candle.x, wickBottom);
      ctx.stroke();

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.rect(candle.x - candle.width / 2, bodyMid - halfBody, candle.width, halfBody * 2);
      ctx.fill();
      ctx.stroke();

      const volumeHeight = (5 + candle.volume * maxVolumeHeight) * local;
      ctx.fillStyle = candle.up
        ? `rgba(108, 218, 180, ${0.12 * local})`
        : `rgba(244, 127, 122, ${0.11 * local})`;
      ctx.fillRect(
        candle.x - candle.width * 0.36,
        volumeBaseline - volumeHeight,
        candle.width * 0.72,
        volumeHeight,
      );
    });

    ctx.restore();
  };

  const drawMarker = (
    candle: Candle,
    label: "B" | "S",
    above: boolean,
    reveal: number,
    color: string,
  ) => {
    if (reveal <= 0.001) return;

    const radius = width < 560 ? 11 : 13;
    const anchorY = above ? candle.high : candle.low;
    const gap = radius + 16;
    let markerY = anchorY + (above ? -gap : gap);
    const ceiling = headerClearance() + radius + 6;
    if (above) markerY = Math.max(ceiling, markerY);

    const overshoot = 1 + Math.sin(reveal * Math.PI) * 0.12;

    ctx.save();
    ctx.globalAlpha = reveal;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(candle.x, anchorY + (above ? -2 : 2));
    ctx.lineTo(candle.x, markerY + (above ? radius : -radius));
    ctx.stroke();

    ctx.translate(candle.x, markerY);
    ctx.scale(overshoot, overshoot);
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(8, 16, 20, 0.92)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = color;
    ctx.font = `600 ${width < 560 ? 10 : 11}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0.5);
    ctx.restore();
  };

  const drawTradeSignals = (progress: number) => {
    const buy = chart.candles[chart.buyIndex];
    const sell = chart.candles[chart.sellIndex];
    if (!buy || !sell) return;

    const buyReveal = smoothstep(0.7, 0.79, progress);
    const sellReveal = smoothstep(0.82, 0.92, progress);
    drawMarker(buy, "B", false, buyReveal, "rgb(101, 214, 228)");
    drawMarker(sell, "S", true, sellReveal, "rgb(255, 177, 103)");
  };

  const draw = (time: number) => {
    const delta = Math.min(0.034, Math.max(0.001, (time - lastFrameTime) / 1000));
    lastFrameTime = time;

    if (reduced) renderedProgress = 1;
    else {
      const damping = 1 - Math.exp(-delta * 18);
      renderedProgress += (targetProgress - renderedProgress) * damping;
      if (Math.abs(targetProgress - renderedProgress) < 0.0002) {
        renderedProgress = targetProgress;
      }
    }

    ctx.clearRect(0, 0, width, height);
    drawGrid(renderedProgress);
    updateAndDrawParticles(time, delta, renderedProgress);
    drawCandles(renderedProgress);
    drawTradeSignals(renderedProgress);
  };

  const tick = (time: number) => {
    if (!running) return;
    draw(time);
    frame = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (reduced || running || !visible) return;
    running = true;
    lastFrameTime = performance.now();
    frame = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(frame);
  };

  const onPointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const now = performance.now();
    const nextX = event.clientX - rect.left;
    const nextY = event.clientY - rect.top;
    if (pointerInside) {
      const elapsed = Math.max(16, now - previousPointerTime);
      pointerVelocityX = ((nextX - previousPointerX) / elapsed) * 16.67;
      pointerVelocityY = ((nextY - previousPointerY) / elapsed) * 16.67;
    } else {
      pointerVelocityX = 0;
      pointerVelocityY = 0;
    }
    pointerX = nextX;
    pointerY = nextY;
    previousPointerX = nextX;
    previousPointerY = nextY;
    previousPointerTime = now;
    pointerInside = true;
  };

  const onLeave = () => {
    pointerInside = false;
    pointerVelocityX = 0;
    pointerVelocityY = 0;
    previousPointerX = -1000;
    previousPointerY = -1000;
  };

  const host = canvas.parentElement ?? canvas;
  host.addEventListener("pointermove", onPointer, { passive: true });
  host.addEventListener("pointerleave", onLeave);

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    },
    { threshold: 0.04 },
  );
  io.observe(canvas);

  window.addEventListener("resize", resize, { passive: true });
  resize();
  if (!reduced) start();
  else draw(0);

  return {
    setProgress(value: number) {
      targetProgress = reduced ? 1 : clamp(value);
      if (reduced || !running) draw(performance.now());
    },
    destroy() {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
    },
  };
}
