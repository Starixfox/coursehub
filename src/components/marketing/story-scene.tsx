"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MarketingCopy } from "./copy";
import "./story-scene.css";

/* Type-only view of the three.js module, same pattern as workflow-3d.tsx:
   nothing here survives compilation, so three stays out of the initial
   payload. */
type Three = typeof import("three");
type Geometry = InstanceType<Three["BufferGeometry"]>;
type Material = InstanceType<Three["Material"]>;
type Texture = InstanceType<Three["Texture"]>;
type MeshT = InstanceType<Three["Mesh"]>;
type GroupT = InstanceType<Three["Group"]>;
type SpriteT = InstanceType<Three["Sprite"]>;
type Vec3 = InstanceType<Three["Vector3"]>;
type QuatT = InstanceType<Three["Quaternion"]>;
type StdMat = InstanceType<Three["MeshPhysicalMaterial"]>;

/* --------------------------------------------------------------- the story --

   One object, five states, scroll as the playhead. The object is a machine
   that assembles itself out of its own scattered parts:

     0 hero        six modules and their work beads drift apart, tumbling
     1 bottleneck  every bead piles onto ONE module: everything waits on you
     2 mapping     the modules swing into a ring, a gold pipe draws through
     3 machine     beads circulate the ring on their own; the gold module is
                   the one stop where a person still decides
     4 payoff      the machine settles smaller and keeps turning, quietly

   The ring is the point: a closed loop that keeps running without you, with
   the human step literally in the loop. Six chunky modules and nine glossy
   beads, not a cloud of confetti: the silhouette has to be readable at a
   glance, which is what makes a Spline-style scene work.

   Everything degrades: without JS, WebGL or with reduced motion the stage
   never gets .is-live, the panels lay out as ordinary stacked sections, and
   the canvas stays hidden. The panel text is always real DOM.
*/

const CHAPTERS = 4; // after the hero
const DWELL = 0.52; // share of each chapter unit spent holding the state
const TOTAL_UNITS = CHAPTERS + DWELL;
const FOV = 34;

const MODULES = 6;
const GOLD_INDEX = 3; // the human-in-the-loop station
const BEADS = 9;
const RING_R = 2.35;
/* One speed for every running chapter. Two different speeds would put the
   same bead at two different points on the ring, and blending between them
   cuts the chord: the beads would drift inside the circle mid-transition. */
const FLOW_SPEED = 0.048;

/* Dark gold-on-glass palette. Bone-white modules and periwinkle beads read
   against the dark atmosphere; gold is the human accent. */
const SHELL = 0xf4f5f8;
const SHELL_DIM = 0x9aa3b5;
const BEAD = 0x7ea2ff;
const GOLD = 0xe3bd6c;
const KEY_LIGHT = 0xffffff;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const wrap01 = (x: number) => ((x % 1) + 1) % 1;

function easeInOut(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Continuous chapter coordinate (0..CHAPTERS) for stage progress p (0..1). */
function chapterCoord(p: number): number {
  const x = clamp01(p) * TOTAL_UNITS;
  if (x >= CHAPTERS + DWELL * 0.5) return CHAPTERS;
  const i = Math.floor(x);
  const f = x - i;
  if (i >= CHAPTERS) return CHAPTERS;
  if (f <= DWELL) return i;
  return i + easeInOut((f - DWELL) / (1 - DWELL));
}

/** Deterministic LCG so layouts are stable across mounts. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * The scroll story. Renders the hero as chapter zero plus the four story
 * panels; owns the sticky stage and the canvas.
 */
export function StoryScene({
  copy,
  hero,
}: {
  copy: MarketingCopy;
  hero: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    const heroEl = heroRef.current;
    if (!stage || !sticky || !canvas || !heroEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const probe = document.createElement("canvas");
    const supported = Boolean(
      probe.getContext("webgl2") ?? probe.getContext("webgl"),
    );
    if (!supported) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    Promise.all([
      import("three"),
      import("three/examples/jsm/geometries/RoundedBoxGeometry.js"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
    ])
      .then(([THREE, rbox, room]) => {
        if (cancelled) return;
        teardown = build(
          THREE,
          rbox.RoundedBoxGeometry,
          room.RoomEnvironment,
          stage,
          sticky,
          canvas,
          heroEl,
          panelRefs.current,
          () => setLive(true),
        );
      })
      .catch(() => {
        /* decorative; the static panels stay */
      });

    return () => {
      cancelled = true;
      if (teardown) teardown();
      setLive(false);
    };
  }, []);

  return (
    <div
      className={`st-stage${live ? " is-live" : ""}`}
      ref={stageRef}
      id="how"
    >
      <p className="st-visually-hidden">{copy.story.aria}</p>
      <div className="st-sticky" ref={stickyRef}>
        <canvas ref={canvasRef} className="st-canvas" aria-hidden="true" />

        {/* Chapter zero: the hero. */}
        <div className="st-panel st-panel--hero" ref={heroRef}>
          {hero}
        </div>

        {copy.story.chapters.map((ch, i) => (
          <div
            key={ch.id}
            className={`st-panel st-panel--ch st-panel--${i % 2 === 0 ? "right" : "left"}`}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
          >
            <div className="st-card">
              <span className="st-kicker">{ch.kicker}</span>
              <h2 className="st-title">{ch.title}</h2>
              <p className="st-body">{ch.body}</p>
              {i === copy.story.chapters.length - 1 ? (
                <a href="#contact" className="mk-btn mk-btn--primary st-cta">
                  {copy.story.ctaButton}
                  <span className="mk-btn__arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ builder */

type RoundedBoxCtor = new (
  w: number,
  h: number,
  d: number,
  segments: number,
  radius: number,
) => InstanceType<Three["BoxGeometry"]>;
type RoomEnvCtor = new () => InstanceType<Three["Scene"]>;

type ModuleRec = {
  group: GroupT;
  inset: MeshT;
  insetMat: StdMat;
  bodyMat: StdMat;
  glow: SpriteT | null;
  seed: number;
  pulse: number;
};

function build(
  THREE: Three,
  RoundedBox: RoundedBoxCtor,
  RoomEnv: RoomEnvCtor,
  stage: HTMLDivElement,
  sticky: HTMLDivElement,
  canvas: HTMLCanvasElement,
  heroEl: HTMLDivElement,
  panels: (HTMLDivElement | null)[],
  onReady: () => void,
): () => void {
  const { MathUtils } = THREE;

  let renderer: InstanceType<Three["WebGLRenderer"]>;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
  } catch {
    return () => {};
  }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

  const geometries: Geometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];
  const keep = <T extends Geometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const keepMat = <T extends Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  /* Soft studio reflections. This is most of the "Spline look": the forms are
     lit by a room, not by hard lamps. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnv();
  const envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  pmrem.dispose();

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  /* How far off-centre the object sits so the text panel gets a clear side. */
  const SIDE = isMobile ? 0.5 : 2.55;

  const rng = makeRng(20260827);

  /* ------------------------------------------------------------------- rig */
  const rig = new THREE.Group();
  scene.add(rig);

  /* Soft radial sprite, generated in code, used for the gold station's halo
     and the beads' glow. */
  const radial = (() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.4, "rgba(255,255,255,0.45)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    textures.push(tex);
    return tex;
  })();

  /* -------------------------------------------------------- ring geometry --
     A circle of module stations, tilted into a comfortable three-quarter
     view. The tilt is baked into the cached positions and orientations so
     every chapter can place the ring wherever it needs it. */
  const tilt = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-0.34, 0.24, 0.05),
  );

  const ringLocalPos: Vec3[] = [];
  const ringLocalQuat: QuatT[] = [];
  const curvePoints: Vec3[] = [];
  for (let i = 0; i < MODULES; i++) {
    const a = (i / MODULES) * Math.PI * 2 - Math.PI / 2;
    const p = new THREE.Vector3(
      Math.cos(a) * RING_R,
      Math.sin(a) * RING_R,
      0,
    ).applyQuaternion(tilt);
    ringLocalPos.push(p);
    curvePoints.push(p.clone());
    /* Lie tangent to the circle, face stays toward the viewer. */
    const q = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(0, 0, a + Math.PI / 2))
      .premultiply(tilt);
    ringLocalQuat.push(q);
  }

  const ringCurve = new THREE.CatmullRomCurve3(
    curvePoints,
    true,
    "catmullrom",
    0.5,
  );

  /* ------------------------------------------------------------- materials --
     Physical materials with a clearcoat: thick, soft, slightly candied. */
  const shellMat = keepMat(
    new THREE.MeshPhysicalMaterial({
      color: SHELL,
      roughness: 0.36,
      metalness: 0.02,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
      envMapIntensity: 0.9,
    }),
  );
  const goldMat = keepMat(
    new THREE.MeshPhysicalMaterial({
      color: GOLD,
      roughness: 0.22,
      metalness: 0.45,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.15,
    }),
  );
  const beadMat = keepMat(
    new THREE.MeshPhysicalMaterial({
      color: BEAD,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      emissive: BEAD,
      emissiveIntensity: 0.22,
      envMapIntensity: 1.1,
    }),
  );
  const pipeMat = keepMat(
    new THREE.MeshPhysicalMaterial({
      color: GOLD,
      roughness: 0.28,
      metalness: 0.5,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1,
    }),
  );

  /* ------------------------------------------------------------ geometries */
  const bodyGeo = keep(new RoundedBox(1.52, 1.06, 0.52, 5, 0.2));
  const insetGeo = keep(new RoundedBox(0.94, 0.5, 0.08, 3, 0.06));
  const beadGeo = keep(new THREE.SphereGeometry(0.25, 32, 24));

  /* ------------------------------------------------------------- the pipe --
     Drawn on across the mapping chapter via drawRange. */
  const pipeGeo = keep(new THREE.TubeGeometry(ringCurve, 260, 0.075, 14, true));
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  const pipeIndexCount = pipeGeo.index ? pipeGeo.index.count : 0;
  pipe.geometry.setDrawRange(0, 0);
  rig.add(pipe);

  /* ---------------------------------------------------------- the modules */
  const modules: ModuleRec[] = [];
  for (let i = 0; i < MODULES; i++) {
    const isGold = i === GOLD_INDEX;
    const group = new THREE.Group();
    rig.add(group);

    const body = new THREE.Mesh(bodyGeo, isGold ? goldMat : shellMat);
    group.add(body);

    /* Its own inset material so each station can light up on its own. */
    const insetMat = keepMat(
      new THREE.MeshPhysicalMaterial({
        color: isGold ? 0xfdf0d2 : BEAD,
        roughness: 0.25,
        metalness: 0.1,
        clearcoat: 0.8,
        emissive: isGold ? GOLD : BEAD,
        emissiveIntensity: 0.1,
        envMapIntensity: 0.8,
      }),
    );
    const inset = new THREE.Mesh(insetGeo, insetMat);
    inset.position.set(0, 0.02, 0.27);
    group.add(inset);

    let glow: SpriteT | null = null;
    if (isGold) {
      const glowMat = keepMat(
        new THREE.SpriteMaterial({
          map: radial,
          color: GOLD,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      glow = new THREE.Sprite(glowMat);
      glow.scale.set(3.6, 3.0, 1);
      glow.position.set(0, 0, -0.5);
      group.add(glow);
    }

    modules.push({
      group,
      inset,
      insetMat,
      bodyMat: isGold ? goldMat : shellMat,
      glow,
      seed: rng() * Math.PI * 2,
      pulse: 0,
    });
  }

  /* ------------------------------------------------------------- the beads */
  const beads: MeshT[] = [];
  const beadSeeds: number[] = [];
  for (let i = 0; i < BEADS; i++) {
    const m = new THREE.Mesh(beadGeo, beadMat);
    rig.add(m);
    beads.push(m);
    beadSeeds.push(rng() * Math.PI * 2);
  }

  /* --------------------------------------------------------------- layouts --
     Chapter 0 and 1 are hand-placed; 2 to 4 are the ring at different
     offsets and scales. Each chapter centres the object on the side opposite
     its text panel. */

  /* Hero: a loose orbital cluster, biased to the right of frame. */
  const heroPos: Vec3[] = [];
  const heroQuat: QuatT[] = [];
  for (let i = 0; i < MODULES; i++) {
    const a = (i / MODULES) * Math.PI * 2 + 0.5;
    const r = 1.5 + rng() * 1.35;
    heroPos.push(
      new THREE.Vector3(
        Math.cos(a) * r * 1.15,
        Math.sin(a) * r * 0.9,
        (rng() - 0.5) * 1.8,
      ),
    );
    heroQuat.push(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          (rng() - 0.5) * 0.9,
          (rng() - 0.5) * 1.1,
          (rng() - 0.5) * 0.7,
        ),
      ),
    );
  }
  const heroBead: Vec3[] = [];
  for (let i = 0; i < BEADS; i++) {
    const a = (i / BEADS) * Math.PI * 2;
    const r = 2.2 + rng() * 1.3;
    heroBead.push(
      new THREE.Vector3(
        Math.cos(a) * r * 1.2,
        Math.sin(a) * r * 0.85,
        (rng() - 0.5) * 2.2,
      ),
    );
  }

  /* Bottleneck: the gold module alone at the bottom carrying a heap of
     beads, the other five queued behind it waiting their turn. */
  const GOLD_STACK = new THREE.Vector3(0, -1.15, 0.35);
  const queuePos: Vec3[] = [];
  const queueQuat: QuatT[] = [];
  {
    let slot = 0;
    for (let i = 0; i < MODULES; i++) {
      if (i === GOLD_INDEX) {
        queuePos.push(GOLD_STACK.clone());
        queueQuat.push(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0.06, 0.1, 0)),
        );
        continue;
      }
      /* A receding diagonal queue up and back to the right. */
      queuePos.push(
        new THREE.Vector3(
          0.62 + slot * 0.66,
          0.28 + slot * 0.72,
          -0.5 - slot * 0.75,
        ),
      );
      queueQuat.push(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.04, -0.34, -0.05),
        ),
      );
      slot++;
    }
  }
  /* The heap: beads stacked in a rough pyramid on the gold module. */
  const heapPos: Vec3[] = [];
  for (let i = 0; i < BEADS; i++) {
    const row = i < 4 ? 0 : i < 7 ? 1 : 2;
    const inRow = i < 4 ? i : i < 7 ? i - 4 : i - 7;
    const count = row === 0 ? 4 : row === 1 ? 3 : 2;
    heapPos.push(
      new THREE.Vector3(
        GOLD_STACK.x + (inRow - (count - 1) / 2) * 0.5,
        GOLD_STACK.y + 0.72 + row * 0.46,
        GOLD_STACK.z + (rng() - 0.5) * 0.34,
      ),
    );
  }

  /* Chapter centres. On desktop the object alternates sides so it is always
     opposite the text panel. On a phone there is no room to sit beside
     anything, so it separates vertically instead: low under the hero copy,
     high above the chapter cards, which sit at the bottom of the screen. */
  const centres = isMobile
    ? [
        new THREE.Vector3(0.2, -5.5, 0),
        new THREE.Vector3(0, 3.2, 0),
        new THREE.Vector3(0, 3.4, 0),
        new THREE.Vector3(0, 3.2, 0),
        new THREE.Vector3(0, 3.2, 0),
      ]
    : [
        new THREE.Vector3(SIDE, 0.15, 0),
        new THREE.Vector3(-SIDE, 0.1, 0),
        /* Chapter two lifts: the beads waiting below the ring's entry need
           room inside the frame while the pipe draws itself on. */
        new THREE.Vector3(SIDE, 0.5, 0),
        new THREE.Vector3(-SIDE, 0, 0),
        new THREE.Vector3(SIDE * 1.05, -0.1, 0),
      ];
  const chapterScale = isMobile
    ? [0.72, 0.85, 0.85, 0.85, 0.7]
    : [1, 1, 1, 1, 0.76];

  /* Where waiting beads stand before the machine runs: a tidy holding cluster
     just outside the ring's entry point, three abreast, rather than a long
     tail that runs off the bottom of the frame. */
  const entry = ringCurve.getPointAt(0, new THREE.Vector3());
  const entryOut = entry.clone().normalize();
  const ringNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(tilt);
  const entrySide = new THREE.Vector3()
    .crossVectors(ringNormal, entryOut)
    .normalize();
  const waitPos: Vec3[] = [];
  for (let i = 0; i < BEADS; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    waitPos.push(
      entry
        .clone()
        .addScaledVector(entryOut, 0.62 + row * 0.44)
        .addScaledVector(entrySide, (col - 1) * 0.52),
    );
  }

  /* ------------------------------------------------------------------ light */
  scene.add(new THREE.AmbientLight(KEY_LIGHT, 0.35));
  const key = new THREE.DirectionalLight(KEY_LIGHT, 2.1);
  key.position.set(-4.5, 6.5, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb9c6ff, 0.7);
  fill.position.set(6, -2, 5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(GOLD, 1.5);
  rim.position.set(6, 3.5, -6);
  scene.add(rim);

  /* --------------------------------------------------------------- camera --
     The object moves in world space, so the camera only breathes: a little
     height and distance per chapter. */
  const camKeys = [
    { pos: new THREE.Vector3(0, 0.25, 11.2), tgt: new THREE.Vector3(0, 0, 0) },
    { pos: new THREE.Vector3(0, 0.7, 10.6), tgt: new THREE.Vector3(0, -0.15, 0) },
    { pos: new THREE.Vector3(0, 0.45, 11.0), tgt: new THREE.Vector3(0, 0, 0) },
    { pos: new THREE.Vector3(0, 0.3, 10.4), tgt: new THREE.Vector3(0, 0, 0) },
    { pos: new THREE.Vector3(0, 0.85, 12.8), tgt: new THREE.Vector3(0, -0.1, 0) },
  ];

  /* --------------------------------------------------------------- pointer */
  const fine = window.matchMedia("(pointer: fine)").matches;
  let targetPX = 0;
  let targetPY = 0;
  let curPX = 0;
  let curPY = 0;
  const onPointer = (e: PointerEvent) => {
    targetPX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.5;
    targetPY = ((e.clientY / window.innerHeight) * 2 - 1) * -0.28;
  };
  if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

  /* ----------------------------------------------------------------- sizing */
  let aspectFit = 1;
  const frame = () => {
    const w = sticky.clientWidth;
    const h = sticky.clientHeight;
    if (w === 0 || h === 0) return;
    const aspect = w / h;
    camera.aspect = aspect;
    /* Narrow viewports push the camera back so the ring still fits. */
    aspectFit = MathUtils.clamp(1.75 / aspect, 1, 2.2);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(w, h, false);
  };
  frame();

  /* ---------------------------------------------------------------- scroll */
  let rawProgress = 0;
  let coord = 0; // damped chapter coordinate
  const readScroll = () => {
    const rect = stage.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    rawProgress = span > 0 ? clamp01(-rect.top / span) : 0;
  };
  window.addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  /* ------------------------------------------------------------------ loop */
  const posA = new THREE.Vector3();
  const posB = new THREE.Vector3();
  const quatA = new THREE.Quaternion();
  const quatB = new THREE.Quaternion();
  const scratch = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;

  /** Where module i sits in chapter k, in local (pre-centre) space. */
  const moduleTarget = (k: number, i: number, outPos: Vec3, outQuat: QuatT) => {
    if (k <= 0) {
      outPos.copy(heroPos[i]);
      outQuat.copy(heroQuat[i]);
      return;
    }
    if (k === 1) {
      outPos.copy(queuePos[i]);
      outQuat.copy(queueQuat[i]);
      return;
    }
    outPos.copy(ringLocalPos[i]);
    outQuat.copy(ringLocalQuat[i]);
  };

  /** Where bead i sits in chapter k, in local (pre-centre) space. */
  const beadTarget = (k: number, i: number, outPos: Vec3) => {
    if (k <= 0) {
      outPos.copy(heroBead[i]);
      return;
    }
    if (k === 1) {
      outPos.copy(heapPos[i]);
      return;
    }
    if (k === 2) {
      /* Held just outside the entry, waiting for the machine to exist. */
      outPos.copy(waitPos[i]);
      return;
    }
    ringCurve.getPointAt(wrap01(elapsed * FLOW_SPEED + i / BEADS), outPos);
  };

  const setPanel = (el: HTMLElement | null, vis: number, dir: number) => {
    if (!el) return;
    const v = clamp01(vis);
    el.style.opacity = String(v);
    el.style.transform = `translate3d(0, ${(1 - v) * dir * 28}px, 0)`;
    el.style.visibility = v <= 0.01 ? "hidden" : "visible";
    el.style.pointerEvents = v > 0.5 ? "auto" : "none";
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    /* The first rAF timestamp can predate the performance.now() taken in
       start(), so clamp dt at zero or elapsed runs backwards. */
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    elapsed += dt;

    const target = chapterCoord(rawProgress);
    coord = MathUtils.damp(coord, target, 9, dt);
    const c = coord;
    const k = Math.min(Math.floor(c), CHAPTERS - 1);
    const f = clamp01(c - k);

    /* Where the whole object sits, and how big, this frame. */
    scratch.lerpVectors(centres[k], centres[k + 1], f);
    const objScale = MathUtils.lerp(chapterScale[k], chapterScale[k + 1], f);

    /* Drift: big and loose while the parts are scattered, still once the
       machine is assembled. */
    const drift = MathUtils.lerp(0.14, 0.02, clamp01((c - 1) / 1.2));

    /* Which stations are lit, and how strongly the machine reads as "on". */
    const assembled = MathUtils.smoothstep(c, 1.6, 2.4);
    const running = MathUtils.smoothstep(c, 2.5, 3.0);

    /* Modules ------------------------------------------------------------ */
    for (let i = 0; i < MODULES; i++) {
      const m = modules[i];
      moduleTarget(k, i, posA, quatA);
      moduleTarget(k + 1, i, posB, quatB);
      posA.lerp(posB, f);
      quatA.slerp(quatB, f);

      /* A slow bob, plus a tumble while the parts are still loose. */
      posA.x += Math.sin(elapsed * 0.42 + m.seed) * drift;
      posA.y += Math.sin(elapsed * 0.36 + m.seed * 1.7) * drift;
      posA.z += Math.cos(elapsed * 0.4 + m.seed * 2.3) * drift * 0.7;

      m.group.position.copy(posA).add(scratch);
      m.group.quaternion.copy(quatA);

      /* Pulse when a bead is passing this station. */
      m.pulse = MathUtils.damp(m.pulse, 0, 5, dt);
      const s = objScale * (1 + m.pulse * 0.06) * (i === GOLD_INDEX ? 1.12 : 1);
      m.group.scale.setScalar(s);

      const lit = i === GOLD_INDEX ? assembled : assembled * 0.75;
      m.insetMat.emissiveIntensity = 0.08 + lit * 0.6 + m.pulse * 1.4;
      if (m.glow) {
        (m.glow.material as InstanceType<Three["SpriteMaterial"]>).opacity =
          assembled * (0.16 + m.pulse * 0.4);
      }
    }

    /* Beads -------------------------------------------------------------- */
    for (let i = 0; i < BEADS; i++) {
      beadTarget(k, i, posA);
      beadTarget(k + 1, i, posB);
      posA.lerp(posB, f);

      const w = beadSeeds[i];
      posA.x += Math.sin(elapsed * 0.5 + w) * drift * 0.7;
      posA.y += Math.sin(elapsed * 0.44 + w * 1.6) * drift * 0.7;

      beads[i].position.copy(posA).add(scratch);
      beads[i].scale.setScalar(objScale);

      /* Light the station a bead is currently sitting at. */
      if (c > 2.4) {
        for (let j = 0; j < MODULES; j++) {
          const d = beads[i].position.distanceTo(modules[j].group.position);
          if (d < 0.85) {
            const hit = 1 - d / 0.85;
            if (hit > modules[j].pulse) modules[j].pulse = hit * running;
          }
        }
      }
    }
    beadMat.emissiveIntensity = 0.16 + running * 0.5;

    /* The pipe draws itself on across the mapping chapter. */
    const draw = MathUtils.smoothstep(c, 1.55, 2.35);
    pipe.geometry.setDrawRange(
      0,
      Math.floor(pipeIndexCount * easeInOut(draw)),
    );
    pipe.position.copy(scratch);
    pipe.scale.setScalar(objScale);
    pipe.rotation.y = Math.sin(elapsed * 0.1) * 0.03;

    /* Camera: blend keyframes, add a little pointer parallax. */
    curPX = MathUtils.damp(curPX, targetPX, 3, dt);
    curPY = MathUtils.damp(curPY, targetPY, 3, dt);
    camPos.lerpVectors(camKeys[k].pos, camKeys[k + 1].pos, f);
    camTgt.lerpVectors(camKeys[k].tgt, camKeys[k + 1].tgt, f);
    camPos.z *= aspectFit;
    camPos.x += curPX;
    camPos.y += curPY;
    camera.position.copy(camPos);
    camera.lookAt(camTgt);

    /* Panels: hero fades over the first half chapter, each chapter panel is
       a bell around its own coordinate. */
    setPanel(heroEl, 1 - MathUtils.smoothstep(c, 0.12, 0.55), -1);
    for (let i = 0; i < CHAPTERS; i++) {
      const centre = i + 1;
      const d = Math.abs(c - centre);
      let vis = 1 - MathUtils.smoothstep(d, 0.3, 0.55);
      if (i === CHAPTERS - 1 && c >= centre) vis = 1; // the close stays up
      setPanel(panels[i], vis, c < centre ? 1 : -1);
    }

    renderer.render(scene, camera);
  };

  let onScreen = false;
  const start = () => {
    if (raf === 0 && onScreen && !document.hidden) {
      /* A page loaded in a hidden tab gets no ResizeObserver delivery, so the
         canvas may still be unsized when it first becomes visible. */
      if (canvas.width <= 300) frame();
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      if (onScreen) start();
      else stop();
    },
    { threshold: 0 },
  );
  io.observe(stage);

  const onVisibility = () => {
    if (document.hidden) stop();
    else {
      frame();
      readScroll();
      start();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  const ro = new ResizeObserver(() => {
    frame();
    readScroll();
  });
  ro.observe(sticky);

  onScreen = true;
  renderer.render(scene, camera);
  start();
  onReady();

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("scroll", readScroll);
    if (fine) window.removeEventListener("pointermove", onPointer);

    scene.clear();
    rig.clear();
    envRT.dispose();
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    for (const t of textures) t.dispose();
    renderer.dispose();
    try {
      renderer.forceContextLoss();
    } catch {
      /* the context dies with the canvas anyway */
    }
  };
}
