// HUMAN blood collection tube: a real Three.js model (glass, blood, ribbed cap, wrapped paper label).
// Proportions measured from src/assets/brief/tube-four-angle-reference.webp (front view, tube outer
// diameter = 130 px there). All model units below use the tube's OUTER RADIUS as 1.0, with y = 0 at the
// lowest point of the glass bottom.
//
// API (relied on by the site integrator):
//   TUBE_TURN_SECONDS, TubeHandle, mountTube(host, opts)

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** One full turn about the tube's own long axis takes this many seconds. */
export const TUBE_TURN_SECONDS = 24;

export type TubeHandle = {
  setAngle(rad: number): void;
  setPlaying(on: boolean): void;
  dispose(): void;
  canvas: HTMLCanvasElement;
};

// ---------------------------------------------------------------------------------------------
// Measured proportions (reference sheet, front view; px -> units: (900 - y) / 65)
// ---------------------------------------------------------------------------------------------
const R_OUT = 1.0; // glass outer radius (130 px diameter)
const R_IN = 0.92; // glass inner radius (wall ~5 px in the photo)
const GLASS_TOP = 10.9; // glass continues up inside the cap
const BLOOD_R = 0.913;
const LIQUID_Y = 9.52; // liquid surface (y ~ 281 px), air gap of ~0.66 below the cap
const CAP_BOTTOM = 10.18; // skirt underside (y = 238 px)
const SKIRT_TOP = 10.68; // ribbed band starts (y = 206 px)
const RIB_TOP = 12.47; // ribs end under the smooth crown band (y = 89 px)
const CAP_TOP = 12.9; // y = 62 px
const LABEL_BOTTOM = 2.415; // y = 743 px
const LABEL_TOP = 8.72; // y = 333 px
const LABEL_R = 1.012; // paper sits just outside the glass
// Label arc measured from the four views: left edge at -49 deg (front view x = 152 px; the left view
// gives -54), right edge at +70 deg (right view x = 560 px). The back view shows no label.
const LABEL_DEG0 = -49;
const LABEL_DEG1 = 70;
const LABEL_THETA0 = THREE.MathUtils.degToRad(LABEL_DEG0);
const LABEL_THETA1 = THREE.MathUtils.degToRad(LABEL_DEG1);
const CAP_R_RIB = 1.19; // groove radius of the ribbed band
const RIB_DEPTH = 0.036; // rib peaks at ~1.226 (159 px)
const RIB_COUNT = 48;
const CAP_R_CROWN = 1.198;
const CAP_R_SKIRT = 1.255;
const MODEL_HEIGHT = CAP_TOP;
const MODEL_RADIUS = CAP_R_SKIRT;

const TILT_Z = THREE.MathUtils.degToRad(12); // lean, top to the left (as in the hero photo)
const TILT_X = THREE.MathUtils.degToRad(6); // a little of the cap top shows
const FLOAT_AMPLITUDE = 0.07; // model units (~3-4 px at typical sizes)
const FLOAT_PERIOD = 7; // seconds
const STILL_ANGLE = THREE.MathUtils.degToRad(22); // front three-quarter for reduced motion
const FONT = "'Hanken Grotesk Variable', 'Hanken Grotesk', 'Helvetica Neue', Arial, sans-serif";

// ---------------------------------------------------------------------------------------------
// Label artwork: drawn once into a canvas
// ---------------------------------------------------------------------------------------------
async function loadFonts(): Promise<void> {
  if (!('fonts' in document)) return;
  const want = Promise.all([
    document.fonts.load(`400 64px 'Hanken Grotesk Variable'`),
    document.fonts.load(`600 64px 'Hanken Grotesk Variable'`),
  ]).then(() => undefined);
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 1500));
  try {
    await Promise.race([want, timeout]);
  } catch {
    /* fall back to the next family in the stack */
  }
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws text along a vertical line (rotated 90 deg clockwise, reading top to bottom), spreading the
 *  letters so the first starts at y0 and the last ends at y1. xBase is the baseline (left of glyphs). */
function drawVerticalSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  xBase: number,
  y0: number,
  y1: number,
): void {
  ctx.save();
  ctx.font = font;
  const letters = Array.from(text);
  const widths = letters.map((l) => ctx.measureText(l).width);
  const total = widths.reduce((a, b) => a + b, 0);
  const gap = letters.length > 1 ? (y1 - y0 - total) / (letters.length - 1) : 0;
  ctx.translate(xBase, y0);
  ctx.rotate(Math.PI / 2);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  let x = 0;
  letters.forEach((l, i) => {
    ctx.fillText(l, x, 0);
    x += widths[i] + gap;
  });
  ctx.restore();
}

function drawHorizontalSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  cx: number,
  baseline: number,
  tracking: number,
): void {
  ctx.save();
  ctx.font = font;
  const letters = Array.from(text);
  const widths = letters.map((l) => ctx.measureText(l).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (letters.length - 1);
  let x = cx - total / 2;
  ctx.textBaseline = 'alphabetic';
  letters.forEach((l, i) => {
    ctx.fillText(l, x, baseline);
    x += widths[i] + tracking;
  });
  ctx.restore();
}

function makeLabelCanvas(): HTMLCanvasElement {
  const arc = (LABEL_THETA1 - LABEL_THETA0) * LABEL_R;
  const height = LABEL_TOP - LABEL_BOTTOM;
  const H = 2048;
  const W = Math.round((H * arc) / height); // ~688: texels stay square on the curved surface
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Helpers: angle (deg, 0 = front centre) -> canvas x; reference-sheet y (px) -> canvas y.
  const xAt = (deg: number) => ((deg - LABEL_DEG0) / (LABEL_DEG1 - LABEL_DEG0)) * W;
  const yAt = (px: number) => ((px - 333) / (743 - 333)) * H;

  // Paper with rounded corners (alpha outside the rounded rectangle).
  const corner = 52;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, corner);
  ctx.fillStyle = '#efe6d6';
  ctx.fill();

  // Subtle paper grain and fibres (deterministic, drawn once).
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const rnd = mulberry32(0x48554d41);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const n = (rnd() - 0.5) * 7;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 0.9));
  }
  ctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, corner);
  ctx.clip();
  ctx.lineCap = 'round';
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const len = 6 + rnd() * 22;
    const a = rnd() * Math.PI;
    ctx.strokeStyle = rnd() > 0.5 ? 'rgba(120,100,70,0.05)' : 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1 + rnd() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  // Very soft vignette toward the paper edge, as printed stock picks up light.
  const vg = ctx.createLinearGradient(0, 0, W, 0);
  vg.addColorStop(0, 'rgba(160,130,95,0.07)');
  vg.addColorStop(0.12, 'rgba(160,130,95,0)');
  vg.addColorStop(0.88, 'rgba(160,130,95,0)');
  vg.addColorStop(1, 'rgba(160,130,95,0.07)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  const ink = '#1f1c19';
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;

  // "HUMAN": large, vertical, letter-spaced. Glyphs span 5..26 deg, y 420..605 px on the sheet.
  const humanCap = xAt(26) - xAt(5); // cap height in canvas px
  const humanSize = humanCap / 0.7;
  drawVerticalSpaced(ctx, 'HUMAN', `600 ${humanSize.toFixed(1)}px ${FONT}`, xAt(5), yAt(420), yAt(605));

  // Column to the left of HUMAN: rule / BLOODWORK / rule, centred on -16 deg.
  const colX = xAt(-16);
  const bwCap = 42;
  const bwSize = bwCap / 0.7;
  drawVerticalSpaced(ctx, 'BLOODWORK', `500 ${bwSize.toFixed(1)}px ${FONT}`, colX - bwCap / 2, yAt(476), yAt(584));
  ctx.lineWidth = 5;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(colX, yAt(420));
  ctx.lineTo(colX, yAt(456));
  ctx.moveTo(colX, yAt(598));
  ctx.lineTo(colX, yAt(652));
  ctx.stroke();

  // "EDTA K2" / "4.0 mL": small, horizontal, near the bottom, centred on the front (0 deg).
  const smallSize = 50;
  drawHorizontalSpaced(ctx, 'EDTA K2', `500 ${smallSize}px ${FONT}`, xAt(0), yAt(697.5), 5);
  drawHorizontalSpaced(ctx, '4.0 mL', `500 ${smallSize}px ${FONT}`, xAt(0), yAt(712.5), 5);

  return canvas;
}

// ---------------------------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------------------------
type Ring = { y: number; r: number; rib: number; shade: number };

/** Builds one smooth strip of rings around the y axis. Rings must run counter-clockwise in the
 *  (r, y) plane (up the outside, inward across a top, outward across a bottom) to face outward.
 *  `rib` adds the vertical rib relief; `shade` is written as a vertex colour. */
function ringStrip(rings: Ring[], segments: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  for (const ring of rings) {
    for (let k = 0; k < segments; k++) {
      const phi = (k / segments) * Math.PI * 2;
      const relief = Math.pow(Math.abs(Math.sin((phi * RIB_COUNT) / 2)), 0.35);
      const r = ring.r + ring.rib * RIB_DEPTH * relief;
      pos.push(r * Math.sin(phi), ring.y, r * Math.cos(phi));
      col.push(ring.shade, ring.shade, ring.shade);
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    for (let k = 0; k < segments; k++) {
      const k1 = (k + 1) % segments;
      const a = i * segments + k;
      const b = i * segments + k1;
      const c = (i + 1) * segments + k;
      const d = (i + 1) * segments + k1;
      idx.push(a, b, d, a, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function mergeStrips(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  let offset = 0;
  for (const p of parts) {
    const P = p.getAttribute('position');
    const N = p.getAttribute('normal');
    const C = p.getAttribute('color');
    for (let i = 0; i < P.count; i++) {
      pos.push(P.getX(i), P.getY(i), P.getZ(i));
      nor.push(N.getX(i), N.getY(i), N.getZ(i));
      col.push(C.getX(i), C.getY(i), C.getZ(i));
    }
    const I = p.getIndex();
    if (I) for (let i = 0; i < I.count; i++) idx.push(I.getX(i) + offset);
    offset += P.count;
    p.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

function capGeometry(): THREE.BufferGeometry {
  const S = RIB_COUNT * 6; // a vertex exactly in every groove
  const ribBase = CAP_R_RIB;
  const skirtShade = 0.72;
  const strips: Ring[][] = [
    // Underside annulus (dark), meeting the glass.
    [
      { y: CAP_BOTTOM, r: R_OUT + 0.004, rib: 0, shade: 0.28 },
      { y: CAP_BOTTOM, r: CAP_R_SKIRT - 0.04, rib: 0, shade: 0.4 },
    ],
    // Skirt / lip: smooth band with rounded edges, slightly darker.
    [
      { y: CAP_BOTTOM, r: CAP_R_SKIRT - 0.04, rib: 0, shade: skirtShade * 0.85 },
      { y: CAP_BOTTOM + 0.012, r: CAP_R_SKIRT - 0.012, rib: 0, shade: skirtShade },
      { y: CAP_BOTTOM + 0.04, r: CAP_R_SKIRT, rib: 0, shade: skirtShade },
      { y: SKIRT_TOP - 0.04, r: CAP_R_SKIRT, rib: 0, shade: skirtShade },
      { y: SKIRT_TOP - 0.012, r: CAP_R_SKIRT - 0.01, rib: 0, shade: skirtShade },
      { y: SKIRT_TOP, r: CAP_R_SKIRT - 0.03, rib: 0, shade: skirtShade },
    ],
    // Ledge from the skirt in to the ribs.
    [
      { y: SKIRT_TOP, r: CAP_R_SKIRT - 0.03, rib: 0, shade: 0.85 },
      { y: SKIRT_TOP, r: ribBase, rib: 1, shade: 0.85 },
    ],
    // Ribbed band, rounding off into the crown.
    [
      { y: SKIRT_TOP, r: ribBase, rib: 1, shade: 1 },
      { y: RIB_TOP - 0.06, r: ribBase, rib: 1, shade: 1 },
      { y: RIB_TOP - 0.02, r: ribBase, rib: 0.6, shade: 1 },
      { y: RIB_TOP, r: CAP_R_CROWN - 0.004, rib: 0, shade: 1 },
    ],
    // Smooth crown band with a soft top fillet and flat top.
    [
      { y: RIB_TOP, r: CAP_R_CROWN - 0.004, rib: 0, shade: 1 },
      { y: RIB_TOP + 0.01, r: CAP_R_CROWN, rib: 0, shade: 1 },
      { y: CAP_TOP - 0.09, r: CAP_R_CROWN, rib: 0, shade: 1 },
      { y: CAP_TOP - 0.035, r: CAP_R_CROWN - 0.022, rib: 0, shade: 1 },
      { y: CAP_TOP - 0.008, r: CAP_R_CROWN - 0.06, rib: 0, shade: 1 },
      { y: CAP_TOP, r: CAP_R_CROWN - 0.1, rib: 0, shade: 1 },
      { y: CAP_TOP, r: CAP_R_CROWN - 0.16, rib: 0, shade: 1 },
      { y: CAP_TOP, r: 0, rib: 0, shade: 1 },
    ],
    // Stopper face seen from below through the air gap (inside the glass).
    [
      { y: CAP_BOTTOM + 0.16, r: 0, rib: 0, shade: 0.22 },
      { y: CAP_BOTTOM + 0.16, r: R_IN - 0.004, rib: 0, shade: 0.22 },
    ],
  ];
  return mergeStrips(strips.map((s) => ringStrip(s, S)));
}

function glassGeometry(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  const steps = 16;
  // Outer hemisphere, outer wall, rim, inner wall, inner hemisphere: one closed CCW profile.
  for (let i = 0; i <= steps; i++) {
    const t = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(1e-4, R_OUT * Math.cos(t)), R_OUT + R_OUT * Math.sin(t)));
  }
  pts.push(new THREE.Vector2(R_OUT, 3), new THREE.Vector2(R_OUT, 6), new THREE.Vector2(R_OUT, 9));
  pts.push(new THREE.Vector2(R_OUT, GLASS_TOP - 0.02), new THREE.Vector2(R_OUT - 0.02, GLASS_TOP));
  pts.push(new THREE.Vector2(R_IN + 0.02, GLASS_TOP), new THREE.Vector2(R_IN, GLASS_TOP - 0.02));
  pts.push(new THREE.Vector2(R_IN, 9), new THREE.Vector2(R_IN, 6), new THREE.Vector2(R_IN, 3));
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(1e-4, R_IN * Math.cos(t)), R_OUT - R_IN * Math.sin(t)));
  }
  pts[0].x = 0;
  pts[pts.length - 1].x = 0;
  return new THREE.LatheGeometry(pts, 96);
}

function bloodGeometry(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  const steps = 14;
  const cy = R_OUT + 0.035; // glass bottom is a little thicker than the wall
  for (let i = 0; i <= steps; i++) {
    const t = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(BLOOD_R * Math.cos(t), cy + BLOOD_R * Math.sin(t)));
  }
  pts.push(new THREE.Vector2(BLOOD_R, 4), new THREE.Vector2(BLOOD_R, 8));
  // Concave meniscus: climbs the wall, flattens quickly toward the centre.
  const climb = 0.075;
  pts.push(new THREE.Vector2(BLOOD_R, LIQUID_Y + climb));
  const m = 8;
  for (let i = 1; i <= m; i++) {
    const s = i / m;
    const r = BLOOD_R * (1 - s * 0.32);
    const y = LIQUID_Y + climb * Math.pow(1 - s, 2.4);
    pts.push(new THREE.Vector2(r, y));
  }
  pts.push(new THREE.Vector2(BLOOD_R * 0.35, LIQUID_Y), new THREE.Vector2(0, LIQUID_Y));
  pts[0].x = 0;
  return new THREE.LatheGeometry(pts, 80);
}

function labelGeometry(): THREE.BufferGeometry {
  const cols = 72;
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= cols; i++) {
    const u = i / cols;
    const th = LABEL_THETA0 + u * (LABEL_THETA1 - LABEL_THETA0);
    const s = Math.sin(th);
    const c = Math.cos(th);
    for (const [y, v] of [
      [LABEL_BOTTOM, 0],
      [LABEL_TOP, 1],
    ] as const) {
      pos.push(LABEL_R * s, y, LABEL_R * c);
      nor.push(s, 0, c);
      uv.push(u, v);
    }
  }
  for (let i = 0; i < cols; i++) {
    const a = i * 2;
    const b = (i + 1) * 2;
    const c = a + 1;
    const d = b + 1;
    idx.push(a, b, d, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

// ---------------------------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------------------------
function glassMaterial(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.035,
    transmission: 1,
    ior: 1.5,
    thickness: 0.07,
    attenuationColor: new THREE.Color(0xfff4e6),
    attenuationDistance: 6,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    specularIntensity: 1,
    envMapIntensity: 1.2,
  });
  // The page behind the canvas is black: keep the glass alpha at least as strong as its own
  // reflections so highlights composite correctly over the transparent clear.
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `#include <opaque_fragment>
      gl_FragColor.a = max( gl_FragColor.a, clamp( max( max( outgoingLight.r, outgoingLight.g ), outgoingLight.b ), 0.0, 1.0 ) );`,
    );
  };
  return m;
}

function bloodMaterial(): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#4a0307'),
    roughness: 0.2,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    specularIntensity: 0.8,
    specularColor: new THREE.Color(0xffffff),
    envMapIntensity: 0.6,
  });
  // Translucency cheat: red light scattering out at thin edges and through the rounded bottom.
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uGlow = { value: new THREE.Color('#c8120a').multiplyScalar(0.55) };
    shader.uniforms.uBottomGlow = { value: new THREE.Color('#e0240c').multiplyScalar(1.1) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vLocalY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocalY = position.y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vLocalY;\nuniform vec3 uGlow;\nuniform vec3 uBottomGlow;')
      .replace(
        '#include <opaque_fragment>',
        `float tubeNdv = clamp( dot( normalize( normal ), normalize( vViewPosition ) ), 0.0, 1.0 );
        float tubeRim = pow( 1.0 - tubeNdv, 2.0 );
        float tubeLow = 1.0 - smoothstep( 0.0, 1.5, vLocalY );
        outgoingLight += uGlow * tubeRim + uBottomGlow * tubeLow * ( 0.25 + 0.75 * tubeRim );
        #include <opaque_fragment>`,
      );
  };
  return m;
}

// ---------------------------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------------------------
function webgl2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  try {
    if (typeof WebGL2RenderingContext === 'undefined') return null;
    return canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
}

export async function mountTube(
  host: HTMLElement,
  opts: { reducedMotion?: boolean; pixelRatioCap?: number; angle?: number } = {},
): Promise<TubeHandle | null> {
  let reduced = opts.reducedMotion === true;
  const pixelRatioCap = opts.pixelRatioCap ?? 1.75;

  const canvas = document.createElement('canvas');
  const gl = webgl2Context(canvas);
  if (!gl) return null;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true, premultipliedAlpha: true });
  } catch {
    return null;
  }

  await loadFonts();

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);

  // Three's transmission pass clears its buffer to translucent white when the canvas is transparent,
  // which would turn the glass milky over a black page. Clear it to transparent black instead.
  const baseSetClearColor = renderer.setClearColor.bind(renderer);
  let inRender = false;
  renderer.setClearColor = ((color: THREE.ColorRepresentation, alpha?: number) => {
    if (inRender && alpha === 0.5) return baseSetClearColor(0x000000, 0);
    return baseSetClearColor(color, alpha);
  }) as typeof renderer.setClearColor;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // Darken the room shell so the studio reads as black, and add two tall warm strip softboxes
  // behind the tube: they draw the amber edge lines on the glass, blood and cap.
  room.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.isMeshStandardMaterial) mat.color.setScalar(mat.side === THREE.BackSide ? 0.12 : 0.25);
    }
  });
  const stripGeo = new THREE.BoxGeometry(1, 1, 1);
  for (const [x, z, k] of [
    [9, -7, 26],
    [-9, -6, 16],
  ] as const) {
    const strip = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.62, 0.26).multiplyScalar(k) }));
    strip.position.set(x, 4, z);
    strip.scale.set(1.4, 34, 1.4);
    room.add(strip);
  }
  const envRT = pmrem.fromScene(room, 0.03);
  room.dispose();
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.5;

  // Lights: warm amber key, warm rims from behind, gentle fill.
  const key = new THREE.DirectionalLight(0xffc98a, 2.4);
  key.position.set(-4, 5, 6);
  const rimR = new THREE.DirectionalLight(0xffa640, 3.2);
  rimR.position.set(5, 2.5, -4);
  const rimL = new THREE.DirectionalLight(0xff9a3c, 2.0);
  rimL.position.set(-5, 1.5, -3.5);
  const fill = new THREE.HemisphereLight(0xfff0dc, 0x1a0f08, 0.35);
  scene.add(key, rimR, rimL, fill);

  // Hierarchy: float -> tilt -> spin (own long axis) -> model (centred on its mid height).
  const floatGroup = new THREE.Group();
  const tiltGroup = new THREE.Group();
  tiltGroup.rotation.set(TILT_X, 0, TILT_Z, 'ZXY');
  const spin = new THREE.Group();
  const model = new THREE.Group();
  model.position.y = -MODEL_HEIGHT / 2;
  scene.add(floatGroup);
  floatGroup.add(tiltGroup);
  tiltGroup.add(spin);
  spin.add(model);

  // Glass
  const glass = new THREE.Mesh(glassGeometry(), glassMaterial());
  glass.renderOrder = 2;
  model.add(glass);

  // Blood
  const blood = new THREE.Mesh(bloodGeometry(), bloodMaterial());
  model.add(blood);

  // Fine bubbles along the meniscus (one instanced draw call).
  const bubbleCount = 22;
  const bubbles = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 10, 8),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#7a0d10'),
      roughness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.4,
    }),
    bubbleCount,
  );
  {
    const rnd = mulberry32(7);
    const mtx = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < bubbleCount; i++) {
      const s = 0.018 + rnd() * 0.035;
      const phi = rnd() * Math.PI * 2;
      const r = BLOOD_R - s * 0.9 - rnd() * 0.05;
      const y = LIQUID_Y + 0.05 + rnd() * 0.02;
      mtx.compose(new THREE.Vector3(r * Math.sin(phi), y, r * Math.cos(phi)), q, new THREE.Vector3(s, s * 0.8, s));
      bubbles.setMatrixAt(i, mtx);
    }
    bubbles.instanceMatrix.needsUpdate = true;
  }
  model.add(bubbles);

  // Label
  const labelCanvas = makeLabelCanvas();
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  labelTex.minFilter = THREE.LinearMipmapLinearFilter;
  labelTex.magFilter = THREE.LinearFilter;
  labelTex.generateMipmaps = true;
  labelTex.needsUpdate = true;
  const label = new THREE.Mesh(
    labelGeometry(),
    new THREE.MeshPhysicalMaterial({
      map: labelTex,
      alphaTest: 0.5,
      roughness: 0.78,
      metalness: 0,
      sheen: 0.25,
      sheenColor: new THREE.Color(0xfff3e0),
      sheenRoughness: 0.8,
      envMapIntensity: 0.6,
    }),
  );
  model.add(label);

  // Cap
  const cap = new THREE.Mesh(
    capGeometry(),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#5e1220'),
      vertexColors: true,
      roughness: 0.5,
      metalness: 0,
      specularIntensity: 0.22,
      clearcoat: 0.12,
      clearcoatRoughness: 0.45,
      envMapIntensity: 0.22,
    }),
  );
  model.add(cap);

  // Camera: fixed, fitted to the tilted model's bounds (spin about the long axis does not change them).
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 200);
  const boundPts: THREE.Vector3[] = [];
  {
    tiltGroup.updateMatrixWorld(true);
    const tiltM = new THREE.Matrix4().makeRotationFromEuler(tiltGroup.rotation);
    for (const y of [-MODEL_HEIGHT / 2, MODEL_HEIGHT / 2]) {
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        boundPts.push(new THREE.Vector3(MODEL_RADIUS * Math.sin(a), y, MODEL_RADIUS * Math.cos(a)).applyMatrix4(tiltM));
      }
    }
  }
  const fitCamera = (aspect: number) => {
    camera.aspect = aspect;
    const margin = 0.88; // keep ~6% clear on every side
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * margin;
    const tanH = tanV * aspect;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of boundPts) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    let dist = 0;
    for (const p of boundPts) {
      const fy = FLOAT_AMPLITUDE;
      dist = Math.max(dist, p.z + Math.abs(p.x - cx) / tanH, p.z + (Math.abs(p.y - cy) + fy) / tanV);
    }
    camera.position.set(cx, cy, dist);
    camera.lookAt(cx, cy, 0);
    camera.near = Math.max(0.1, dist - 10);
    camera.far = dist + 10;
    camera.updateProjectionMatrix();
  };

  // State
  let angle = opts.angle ?? (reduced ? STILL_ANGLE : 0);
  let clock = 0;
  let playing = !reduced;
  let inView = true;
  let docVisible = document.visibilityState !== 'hidden';
  let rafId = 0;
  let last = 0;
  let disposed = false;

  const pose = () => {
    spin.rotation.y = -angle; // +angle brings the tube's right side toward the camera
    floatGroup.position.y = reduced ? 0 : FLOAT_AMPLITUDE * Math.sin((clock / FLOAT_PERIOD) * Math.PI * 2);
  };
  const renderFrame = () => {
    if (disposed) return;
    pose();
    inRender = true;
    try {
      renderer.render(scene, camera);
    } finally {
      inRender = false;
    }
  };

  const resize = () => {
    if (disposed) return;
    const w = Math.max(1, Math.round(host.clientWidth));
    const h = Math.max(1, Math.round(host.clientHeight));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    renderer.setSize(w, h, false);
    fitCamera(w / h);
    if (!rafId) renderFrame();
  };

  const shouldRun = () => !disposed && !reduced && playing && inView && docVisible;
  const tick = (now: number) => {
    rafId = 0;
    if (!shouldRun()) return;
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    clock += dt;
    angle = (angle + (dt * Math.PI * 2) / TUBE_TURN_SECONDS) % (Math.PI * 2);
    renderFrame();
    rafId = requestAnimationFrame(tick);
  };
  const updateLoop = () => {
    if (shouldRun()) {
      if (!rafId) {
        last = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) inView = e.isIntersecting;
      updateLoop();
    },
    { threshold: 0 },
  );
  io.observe(host);
  const onVisibility = () => {
    docVisible = document.visibilityState !== 'hidden';
    updateLoop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onContextLost = (e: Event) => {
    e.preventDefault();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  // Compile every shader before the first frame without blocking the page where the browser allows it
  // (KHR_parallel_shader_compile), so the tube's arrival never stalls scrolling.
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    /* falls back to compiling on the first render */
  }
  if (disposed) return null;
  resize();
  renderFrame();
  updateLoop();

  return {
    canvas,
    setAngle(rad: number) {
      angle = rad;
      renderFrame();
    },
    setPlaying(on: boolean) {
      playing = on;
      if (on) reduced = false; // reduced motion switched off while the page is open
      updateLoop();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) m.dispose();
        }
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
      });
      labelTex.dispose();
      envRT.dispose();
      pmrem.dispose();
      scene.environment = null;
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
