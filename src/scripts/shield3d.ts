// A point-cloud version of the shield mark, drawn with raw WebGL (no library).
// It assembles from scattered points on load, can be dragged to rotate, and
// drifts apart as the page scrolls: the approved model slowly stops matching
// what was approved. Returns false when WebGL is unavailable.

type Pt = [x: number, y: number, z: number, size: number, kind: number];
// kind: 0 ink, 1 accent, 2 orbit ring (x = angle, y = radius), 3 on-accent

const S = 1 / 160;
const P = (x: number, y: number): [number, number] => [(x - 200) * S, -(y - 200) * S];

function cubic(a: number[], b: number[], c: number[], d: number[], t: number) {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]);
}

// Shield outline from ShieldMark.astro, as a dense polyline.
function outline(): [number, number][] {
  const pts: number[][] = [];
  const line = (a: number[], b: number[], n: number) => { for (let i = 0; i < n; i++) pts.push([a[0] + (b[0] - a[0]) * (i / n), a[1] + (b[1] - a[1]) * (i / n)]); };
  const curve = (a: number[], b: number[], c: number[], d: number[], n: number) => { for (let i = 0; i < n; i++) pts.push(cubic(a, b, c, d, i / n)); };
  line([200, 44], [320, 88], 60);
  line([320, 88], [320, 196], 60);
  curve([320, 196], [320, 270], [268, 326], [200, 356], 120);
  curve([200, 356], [132, 326], [80, 270], [80, 196], 120);
  line([80, 196], [80, 88], 60);
  line([80, 88], [200, 44], 60);
  return pts.map(([x, y]) => P(x, y));
}

// Resample a closed polyline to n evenly spaced points.
function resample(poly: [number, number][], n: number) {
  const seg: number[] = [];
  let total = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(d);
    total += d;
  }
  const out: [number, number][] = [];
  let i = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (k / n) * total;
    while (acc + seg[i] < target) { acc += seg[i]; i++; }
    const t = (target - acc) / (seg[i] || 1);
    const a = poly[i], b = poly[(i + 1) % poly.length];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

function inside(poly: [number, number][], x: number, y: number) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function buildPoints(): Pt[] {
  const pts: Pt[] = [];
  const shape = outline();
  const rim = resample(shape, 360);
  const D = 0.1;
  rim.forEach(([x, y], i) => {
    pts.push([x, y, D, 2.6, 0]);
    pts.push([x, y, -D, 2.2, 0]);
    if (i % 6 === 0) for (let k = 1; k < 4; k++) pts.push([x, y, D - (2 * D * k) / 4, 1.8, 0]);
  });

  // A faint grain inside the shield, so it reads as a solid object.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 520; k++) {
    const x = rnd() * 1.6 - 0.8, y = rnd() * 2 - 1;
    if (inside(shape, x, y)) pts.push([x, y, (rnd() - 0.5) * 2 * D, 1.3, 0]);
  }

  const nodes = [[140, 126], [200, 100], [260, 126], [290, 198], [250, 270], [200, 304], [150, 270], [110, 198]].map(([x, y]) => P(x, y));
  const core = P(200, 200);
  const edges: [number[], number[]][] = [
    ...nodes.map((n, i) => [n, nodes[(i + 1) % nodes.length]] as [number[], number[]]),
    ...[0, 2, 3, 4, 6, 7].map((i) => [nodes[i], core] as [number[], number[]]),
  ];
  edges.forEach(([a, b]) => {
    const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 70);
    for (let i = 1; i < n; i++) pts.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n, 0.02, 2, 0]);
  });
  nodes.forEach(([x, y]) => {
    pts.push([x, y, 0.04, 9, 0]);
    for (let a = 0; a < 10; a++) pts.push([x + Math.cos((a / 10) * 6.283) * 0.06, y + Math.sin((a / 10) * 6.283) * 0.06, 0.04, 2.2, 0]);
  });

  // Core node: a solid accent disc with an on-accent check drawn on top.
  for (let x = -0.2; x <= 0.2; x += 0.022) {
    for (let y = -0.2; y <= 0.2; y += 0.022) {
      if (x * x + y * y <= 0.04) pts.push([core[0] + x, core[1] + y, 0.06, 4.4, 1]);
    }
  }
  const check = [P(184, 201), P(196, 213), P(218, 188)];
  for (let s = 0; s < 2; s++) {
    const a = check[s], b = check[s + 1];
    for (let i = 0; i <= 24; i++) pts.push([a[0] + ((b[0] - a[0]) * i) / 24, a[1] + ((b[1] - a[1]) * i) / 24, 0.09, 5, 3]);
  }

  // Dashed orbit ring, computed in the shader so it can turn.
  for (let i = 0; i < 300; i++) if (i % 5 < 3) pts.push([(i / 300) * 6.283, 1.1, 0, 2.4, 2]);
  return pts;
}

const VERT = `
attribute vec3 aT; attribute vec3 aS; attribute vec3 aP;
uniform float uTime, uBuild, uDrift, uDpr, uScale; uniform vec2 uRot;
uniform vec3 uInk, uAccent, uOn;
varying vec3 vCol; varying float vA;
void main() {
  float seed = aP.z;
  vec3 tgt = aT;
  if (aP.y > 1.5 && aP.y < 2.5) {
    float a = aT.x + uTime * 0.12;
    tgt = vec3(cos(a) * aT.y, sin(a) * aT.y * 0.3, sin(a) * aT.y * 0.95);
  }
  float t = clamp((uBuild - seed * 0.55) / 0.45, 0.0, 1.0);
  t = 1.0 - pow(1.0 - t, 3.0);
  vec3 p = mix(aS, tgt, t);
  p.xy += 0.004 * vec2(sin(uTime * 1.3 + seed * 40.0), cos(uTime * 1.1 + seed * 30.0));
  float m = step(0.62, fract(seed * 7.31));
  vec3 dir = normalize(vec3(sin(seed * 91.0), cos(seed * 57.0), sin(seed * 13.0)) + 0.001);
  p += m * uDrift * (dir * (0.25 + 0.6 * fract(seed * 3.7)) + 0.06 * vec3(sin(uTime + seed * 9.0), cos(uTime * 0.8 + seed * 7.0), 0.0));
  float cy = cos(uRot.x), sy = sin(uRot.x);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cx = cos(uRot.y), sx = sin(uRot.y);
  p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
  float persp = 2.8 / (2.8 - p.z);
  gl_Position = vec4(p.xy * persp * uScale, 0.0, 1.0);
  gl_PointSize = aP.x * uDpr * persp * (0.9 + 0.1 * uScale / 0.8);
  vCol = aP.y > 2.5 ? uOn : (aP.y > 0.5 && aP.y < 1.5 ? uAccent : uInk);
  vA = (0.5 + 0.5 * clamp((p.z + 1.2) / 2.4, 0.0, 1.0)) * (1.0 - m * clamp(uDrift, 0.0, 1.0) * 0.55) * t;
}`;
const FRAG = `
precision mediump float;
varying vec3 vCol; varying float vA;
void main() { gl_FragColor = vec4(vCol * vA, vA); }`;

function hexToRgb(v: string): [number, number, number] {
  const h = v.trim().replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export interface Shield3D { setDrift: (d: number) => void; }

export function mountShield3D(canvas: HTMLCanvasElement): Shield3D | null {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const pts = buildPoints();
  const data = new Float32Array(pts.length * 9);
  pts.forEach(([x, y, z, size, kind], i) => {
    const o = i * 9;
    const r = 1.6 + Math.random() * 1.6, a = Math.random() * 6.283, b = Math.acos(Math.random() * 2 - 1);
    data.set([x, y, z, Math.cos(a) * Math.sin(b) * r, Math.sin(a) * Math.sin(b) * r, Math.cos(b) * r, size, kind, Math.random()], o);
  });
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  (['aT', 'aS', 'aP'] as const).forEach((name, i) => {
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 36, i * 12);
  });
  const U = Object.fromEntries(['uTime', 'uBuild', 'uDrift', 'uDpr', 'uScale', 'uRot', 'uInk', 'uAccent', 'uOn'].map((n) => [n, gl.getUniformLocation(prog, n)]));
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const setColors = () => {
    const cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(U.uInk, hexToRgb(cs.getPropertyValue('--ink')));
    gl.uniform3fv(U.uAccent, hexToRgb(cs.getPropertyValue('--accent')));
    gl.uniform3fv(U.uOn, hexToRgb(cs.getPropertyValue('--on-accent')));
  };
  setColors();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setColors);

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  // Rotation: idle sway, pointer tilt and drag with inertia.
  let spin = 0, pitch = 0.08, vel = 0, tiltX = 0, tiltY = 0, dragging = false, lastX = 0, drift = 0, driftNow = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    vel = dx * 0.008;
    spin += vel;
  });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', (e) => {
      tiltX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      tiltY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    }, { passive: true });
  }

  let visible = true, raf = 0;
  const t0 = performance.now();
  const frame = (now: number) => {
    raf = 0;
    const t = (now - t0) / 1000;
    if (!dragging) {
      // Let a flick spin it, then settle back to facing the viewer.
      vel *= 0.95;
      spin += vel;
      const home = Math.round(spin / 6.2832) * 6.2832;
      if (Math.abs(vel) < 0.02) spin += (home - spin) * 0.03;
    }
    driftNow += (drift - driftNow) * 0.06;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uBuild, Math.min(1.2, t / 2.2));
    gl.uniform1f(U.uDrift, driftNow);
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform1f(U.uScale, 0.8);
    gl.uniform2f(U.uRot, spin + Math.sin(t * 0.35) * 0.42 + tiltX, pitch + tiltY + Math.sin(t * 0.4) * 0.04);
    gl.drawArrays(gl.POINTS, 0, pts.length);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }).observe(canvas);
  document.addEventListener('visibilitychange', start);
  start();

  return { setDrift: (d) => { drift = d; start(); } };
}
