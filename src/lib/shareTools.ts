import { fmtCurrency } from "./format";
import type { BuilderState, ModelKey, PlanSummary } from "../types/planner";

export const PUBLIC_TOOL_URL = "https://ayisha1113.github.io/paycheck-planner-for-couples/";
const QR_URL = PUBLIC_TOOL_URL;
const PLAN_PARAM = "plan";

type SharedPlanPayload = {
  model: ModelKey;
  state: BuilderState;
};

export function encodeSharedPlan(model: ModelKey, state: BuilderState) {
  const bytes = new TextEncoder().encode(JSON.stringify({ model, state }));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeSharedPlan(value: string | null): SharedPlanPayload | null {
  if (!value) return null;

  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as SharedPlanPayload;

    if (!payload.model || !payload.state?.names || !payload.state.paychecks) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSharedPlanFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return decodeSharedPlan(params.get(PLAN_PARAM));
}

export function createPlanLink(model: ModelKey, state: BuilderState) {
  const url = new URL(window.location.href);
  url.searchParams.set(PLAN_PARAM, encodeSharedPlan(model, state));
  return url.toString();
}

export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  stroke: string,
) {
  ctx.strokeStyle = stroke;
  roundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
      return;
    }
    line = testLine;
  });

  if (line) ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create image."));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function createShareCoverCanvas() {
  const canvas = makeCanvas(1200, 630);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  ctx.fillStyle = "#faf9f6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fillRoundedRect(ctx, 64, 58, 1072, 514, 18, "#ffffff");
  strokeRoundedRect(ctx, 64, 58, 1072, 514, 18, "#dedede");

  ctx.fillStyle = "#ff385c";
  ctx.font = "700 22px Arial, sans-serif";
  ctx.fillText("PAYCHECK PLANNER", 112, 132);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 60px Georgia, serif";
  ctx.fillText("Paycheck Planner", 112, 214);
  ctx.fillText("for Couples", 112, 286);

  ctx.fillStyle = "#55514d";
  ctx.font = "400 30px Arial, sans-serif";
  ctx.fillText("A clearer way to split bills,", 112, 358);
  ctx.fillText("keep personal money,", 112, 400);
  ctx.fillText("and save together.", 112, 442);

  fillRoundedRect(ctx, 700, 138, 338, 76, 8, "#1a1a1a");
  fillRoundedRect(ctx, 730, 250, 278, 42, 8, "#e8f3e8");
  fillRoundedRect(ctx, 730, 306, 278, 42, 8, "#fff0f3");
  fillRoundedRect(ctx, 730, 362, 278, 42, 8, "#fff0f3");
  fillRoundedRect(ctx, 730, 418, 278, 42, 8, "#f7f7f5");

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillText("YOUR MONTHLY PLAN", 728, 184);
  ctx.font = "700 26px Georgia, serif";
  ctx.fillText("$8,000", 925, 186);

  ctx.fillStyle = "#1b6a2a";
  ctx.font = "700 18px Arial, sans-serif";
  ctx.fillText("KEEP", 756, 277);
  ctx.fillText("$800", 932, 277);

  ctx.fillStyle = "#d6003a";
  ctx.fillText("TRANSFER", 756, 333);
  ctx.fillText("$1,700", 912, 333);
  ctx.fillText("SAVE", 756, 389);
  ctx.fillText("$500", 932, 389);

  ctx.fillStyle = "#666666";
  ctx.fillText("LEFTOVER", 756, 445);
  ctx.fillText("$0", 958, 445);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 20px Arial, sans-serif";
  ctx.fillText("Paycheck Planner", 112, 526);

  ctx.fillStyle = "#666666";
  ctx.font = "400 18px Arial, sans-serif";
  ctx.fillText("Built for shared expenses, personal breathing room, and joint goals.", 310, 526);

  return canvas;
}

export async function shareTool() {
  const title = "Paycheck Planner for Couples";
  const text = "Build a clearer paycheck plan for shared bills, personal money, and joint savings.";
  const originalUrl = window.location.href;
  const shouldRestoreUrl = originalUrl !== PUBLIC_TOOL_URL;

  try {
    if (shouldRestoreUrl) {
      window.history.replaceState(window.history.state, "", PUBLIC_TOOL_URL);
    }

    if (navigator.share) {
      await navigator.share({ title, text, url: PUBLIC_TOOL_URL });
      return;
    }

    await copyText(PUBLIC_TOOL_URL);
    const canvas = createShareCoverCanvas();
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, "paycheck-planner-share.png");
  } finally {
    if (shouldRestoreUrl) {
      window.history.replaceState(window.history.state, "", originalUrl);
    }
  }
}

async function loadQrImage(text: string, size: number) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&data=${encodeURIComponent(text)}`;

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("QR image failed to load."));
    img.src = src;
  });
}

function drawPlanCard(
  ctx: CanvasRenderingContext2D,
  block: PlanSummary["blocks"][number],
  x: number,
  y: number,
  width: number,
) {
  const rowHeight = 54;
  const height = 118 + Math.max(block.steps.length, 1) * rowHeight;
  fillRoundedRect(ctx, x, y, width, height, 10, "#ffffff");
  strokeRoundedRect(ctx, x, y, width, height, 10, "#dedede");

  ctx.save();
  roundedRect(ctx, x, y, width, height, 10);
  ctx.clip();
  ctx.fillStyle = block.who === "a" ? "#ff385c" : "#1a1a1a";
  ctx.fillRect(x, y, width, 4);
  ctx.restore();

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 30px Georgia, serif";
  ctx.fillText(block.title, x + 28, y + 52);
  ctx.font = "400 17px Arial, sans-serif";
  ctx.fillStyle = "#999999";
  ctx.fillText(`Take-home ${fmtCurrency(block.gross)}`, x + 28, y + 82);

  const steps = block.steps.length ? block.steps : [{ label: "No action this paycheck", amount: 0, kind: "surplus" }];
  steps.forEach((step, index) => {
    const rowY = y + 100 + index * rowHeight;
    const isKeep = step.kind === "keep";
    const isTransfer = step.kind === "transfer";
    fillRoundedRect(ctx, x + 20, rowY, width - 40, 42, 6, isKeep ? "#f1f0ed" : isTransfer ? "#fff0f3" : "#f7f7f5");

    ctx.fillStyle = isKeep ? "#55514d" : isTransfer ? "#d6003a" : "#666666";
    ctx.font = "400 19px Arial, sans-serif";
    ctx.fillText(step.label, x + 36, rowY + 28);
    ctx.textAlign = "right";
    ctx.font = "700 19px Arial, sans-serif";
    ctx.fillText(fmtCurrency(step.amount), x + width - 42, rowY + 28);
    ctx.textAlign = "left";
  });

  return height;
}

export async function savePlanImage(plan: PlanSummary, state: BuilderState) {
  const cardWidth = 1056;
  const rowGap = 22;
  const blockHeights = plan.blocks.map((block) => 118 + Math.max(block.steps.length, 1) * 54);
  const gridHeight = blockHeights.reduce((sum, height) => sum + height, 0) + Math.max(0, blockHeights.length - 1) * rowGap;
  const canvas = makeCanvas(1200, 400 + gridHeight + 260);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  ctx.fillStyle = "#faf9f6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff385c";
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillText("YOUR MONTHLY PLAN", 72, 78);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 48px Georgia, serif";
  ctx.fillText(`${state.names.a} & ${state.names.b}'s paycheck plan`, 72, 136);

  ctx.fillStyle = "#666666";
  ctx.font = "400 22px Arial, sans-serif";
  ctx.fillText("Follow these steps each time you get paid this month.", 72, 176);

  fillRoundedRect(ctx, 72, 220, 1056, 150, 10, "#1a1a1a");
  const statWidth = 1056 / plan.stats.length;
  plan.stats.forEach((stat, index) => {
    const x = 100 + index * statWidth;
    ctx.fillStyle = "#999999";
    ctx.font = "700 13px Arial, sans-serif";
    ctx.fillText(stat.label.toUpperCase(), x, 262);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 28px Georgia, serif";
    ctx.fillText(stat.value, x, 304);
    if (stat.sub) {
      ctx.fillStyle = "rgba(255,255,255,0.58)";
      ctx.font = "400 15px Arial, sans-serif";
      drawWrappedText(ctx, stat.sub, x, 332, statWidth - 34, 22);
    }
  });

  let y = 410;
  plan.blocks.forEach((block, index) => {
    const height = drawPlanCard(ctx, block, 72, y, cardWidth);
    y += height + (index === plan.blocks.length - 1 ? 0 : rowGap);
  });

  y += 40;
  fillRoundedRect(ctx, 72, y, 1056, 200, 10, "#ffffff");
  strokeRoundedRect(ctx, 72, y, 1056, 200, 10, "#dedede");

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 28px Georgia, serif";
  ctx.fillText("Paycheck Planner for Couples", 108, y + 56);
  ctx.fillStyle = "#666666";
  ctx.font = "400 20px Arial, sans-serif";
  drawWrappedText(ctx, "A clearer way to split bills, keep personal money, and save together.", 108, y + 96, 620, 30);

  const date = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());
  ctx.font = "700 16px Arial, sans-serif";
  ctx.fillStyle = "#999999";
  ctx.fillText(`Saved ${date}`, 108, y + 160);

  try {
    const qr = await loadQrImage(QR_URL, 220);
    ctx.drawImage(qr, 924, y + 26, 144, 144);
  } catch {
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "700 15px Arial, sans-serif";
    drawWrappedText(ctx, QR_URL, 850, y + 78, 248, 24);
  }

  ctx.fillStyle = "#666666";
  ctx.font = "700 13px Arial, sans-serif";
  ctx.fillText("SCAN TO BUILD YOUR OWN", 888, y + 184);

  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, "paycheck-planner-result.png");
}

const QR_SIZE = 33;
const QR_DATA_CODEWORDS = 80;
const QR_EC_CODEWORDS = 20;

function createQrModules(text: string) {
  const modules: (boolean | null)[][] = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(null));
  const reserved: boolean[][] = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false));

  const setModule = (row: number, col: number, value: boolean, reserve = true) => {
    if (row < 0 || col < 0 || row >= QR_SIZE || col >= QR_SIZE) return;
    modules[row][col] = value;
    if (reserve) reserved[row][col] = true;
  };

  const finder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r += 1) {
      for (let c = -1; c <= 7; c += 1) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || cc < 0 || rr >= QR_SIZE || cc >= QR_SIZE) continue;
        const active =
          r >= 0 &&
          r <= 6 &&
          c >= 0 &&
          c <= 6 &&
          (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        setModule(rr, cc, active);
      }
    }
  };

  finder(0, 0);
  finder(0, QR_SIZE - 7);
  finder(QR_SIZE - 7, 0);

  for (let i = 8; i < QR_SIZE - 8; i += 1) {
    setModule(6, i, i % 2 === 0);
    setModule(i, 6, i % 2 === 0);
  }

  for (let r = -2; r <= 2; r += 1) {
    for (let c = -2; c <= 2; c += 1) {
      const dist = Math.max(Math.abs(r), Math.abs(c));
      setModule(26 + r, 26 + c, dist !== 1);
    }
  }

  setModule(QR_SIZE - 8, 8, true);
  for (let i = 0; i < 9; i += 1) {
    setModule(8, i, false);
    setModule(i, 8, false);
    setModule(8, QR_SIZE - 1 - i, false);
    setModule(QR_SIZE - 1 - i, 8, false);
  }

  const codewords = createQrCodewords(text);
  const bits = codewords.flatMap((codeword) =>
    Array.from({ length: 8 }, (_, bit) => ((codeword >>> (7 - bit)) & 1) === 1),
  );

  let bitIndex = 0;
  let upward = true;
  for (let col = QR_SIZE - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    for (let offset = 0; offset < QR_SIZE; offset += 1) {
      const row = upward ? QR_SIZE - 1 - offset : offset;
      for (let pair = 0; pair < 2; pair += 1) {
        const c = col - pair;
        if (reserved[row][c]) continue;
        const rawBit = bits[bitIndex] ?? false;
        modules[row][c] = rawBit !== ((row + c) % 2 === 0);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }

  addFormatInfo(modules);
  return modules.map((row) => row.map(Boolean));
}

function createQrCodewords(text: string) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const bits: number[] = [];
  const pushBits = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
  };

  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  bytes.forEach((byte) => pushBits(byte, 8));
  const maxBits = QR_DATA_CODEWORDS * 8;
  pushBits(0, Math.min(4, maxBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
  }

  let pad = 0xec;
  while (data.length < QR_DATA_CODEWORDS) {
    data.push(pad);
    pad = pad === 0xec ? 0x11 : 0xec;
  }

  return [...data, ...reedSolomon(data, QR_EC_CODEWORDS)];
}

function addFormatInfo(modules: (boolean | null)[][]) {
  const bits = getFormatBits();
  const set = (row: number, col: number, index: number) => {
    modules[row][col] = ((bits >>> index) & 1) === 1;
  };

  for (let i = 0; i < 15; i += 1) {
    if (i < 6) set(i, 8, i);
    else if (i < 8) set(i + 1, 8, i);
    else set(QR_SIZE - 15 + i, 8, i);

    if (i < 8) set(8, QR_SIZE - i - 1, i);
    else if (i < 9) set(8, 15 - i, i);
    else set(8, 15 - i - 1, i);
  }

  modules[QR_SIZE - 8][8] = true;
}

function getFormatBits() {
  let data = (1 << 3) | 0;
  data <<= 10;
  const generator = 0b10100110111;
  while (bitLength(data) - bitLength(generator) >= 0) {
    data ^= generator << (bitLength(data) - bitLength(generator));
  }
  return ((((1 << 3) | 0) << 10) | data) ^ 0b101010000010010;
}

function bitLength(value: number) {
  let length = 0;
  while (value !== 0) {
    length += 1;
    value >>>= 1;
  }
  return length;
}

function reedSolomon(data: number[], degree: number) {
  const generator = rsGenerator(degree);
  const result = Array(degree).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    generator.forEach((coefficient, index) => {
      result[index] ^= gfMul(coefficient, factor);
    });
  });

  return result;
}

function rsGenerator(degree: number) {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    poly = polyMultiply(poly, [1, gfPow(2, i)]);
  }
  return poly.slice(1);
}

function polyMultiply(a: number[], b: number[]) {
  const result = Array(a.length + b.length - 1).fill(0);
  a.forEach((av, ai) => {
    b.forEach((bv, bi) => {
      result[ai + bi] ^= gfMul(av, bv);
    });
  });
  return result;
}

function gfPow(value: number, power: number) {
  let result = 1;
  for (let i = 0; i < power; i += 1) result = gfMul(result, value);
  return result;
}

function gfMul(a: number, b: number) {
  let result = 0;
  while (b > 0) {
    if (b & 1) result ^= a;
    a <<= 1;
    if (a & 0x100) a ^= 0x11d;
    b >>= 1;
  }
  return result;
}
