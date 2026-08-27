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
type Vec3 = InstanceType<Three["Vector3"]>;
type QuatT = InstanceType<Three["Quaternion"]>;

/* --------------------------------------------------------------- the story --

   One persistent scene, five states, scroll as the playhead:

     0 chaos      loose cloud of task tiles drifting, no order        (hero)
     1 bottleneck every tile queues on lines converging on one node   (you)
     2 mapping    a thread draws itself, tiles snap onto it in order
     3 machine    the chain runs: tiles and packets flow through it
     4 payoff     the machine settles into a small, tidy, running core

   The stage is a tall scroll region with a sticky viewport inside it. Scroll
   progress maps to a continuous chapter coordinate (dwell on each chapter,
   eased transitions between them, exactly like the packet timing in
   workflow-3d.tsx). Instance targets are computed per layout and blended per
   frame; chapter 3's targets are dynamic (flow along the path), so blending is
   done against freshly computed targets every frame rather than baked arrays.

   Everything degrades: without JS, WebGL or with reduced motion the stage
   never gets .is-live, the panels lay out as ordinary stacked sections, and
   the canvas stays hidden. The panel text is always real DOM.
*/

const CHAPTERS = 4; // after the hero
const DWELL = 0.52; // share of each chapter unit spent holding the state
const TOTAL_UNITS = CHAPTERS + DWELL;
const FOV = 34;

/* Dark gold-on-glass palette: light tiles and slabs read against the dark
   atmosphere; gold is the human accent, periwinkle blue the AI/data accent. */
const SLATE = 0x475066;
const PAPER_TILE = 0xfffdf6;
const SLAB = 0xe8eaf2;
const ACCENT = 0x7ea2ff;
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

/* RoundedBoxGeometry extends BoxGeometry, whose attribute map is the narrow
   one that Mesh/InstancedMesh constructors expect. */
type RoundedBoxCtor = new (
  w: number,
  h: number,
  d: number,
  segments: number,
  radius: number,
) => InstanceType<Three["BoxGeometry"]>;
type RoomEnvCtor = new () => InstanceType<Three["Scene"]>;

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
      antialias: window.devicePixelRatio < 2,
    });
  } catch {
    return () => {};
  }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);

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

  /* Soft studio reflections: the Spline look is mostly environment light. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnv();
  const envRT = pmrem.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  pmrem.dispose();

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const N = isMobile ? 44 : 68;

  /* ------------------------------------------------------------------- rig */
  const rig = new THREE.Group();
  scene.add(rig);

  /* The path the workflow lives on: a shallow S left to right. */
  const path = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-4.6, 0.25, 0.5),
      new THREE.Vector3(-2.3, -0.2, -0.5),
      new THREE.Vector3(0, 0.2, 0.45),
      new THREE.Vector3(2.3, -0.15, -0.5),
      new THREE.Vector3(4.6, 0.3, 0.35),
    ],
    false,
    "catmullrom",
    0.6,
  );

  /* --------------------------------------------------------------- layouts */
  const rng = makeRng(20260827);
  const tmpV = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const tmpE = new THREE.Euler();
  const tmpM = new THREE.Matrix4();
  const tangent = new THREE.Vector3();

  type Layout = { pos: Vec3[]; quat: QuatT[]; scale: number[] };
  const mkLayout = (): Layout => ({ pos: [], quat: [], scale: [] });

  const L0 = mkLayout(); // chaos cloud
  const L1 = mkLayout(); // bottleneck queues
  const L2 = mkLayout(); // mapped onto the thread
  const L4 = mkLayout(); // settled core
  const pathU: number[] = []; // base position of each tile along the path
  const seeds: number[] = [];

  /* The bottleneck node sits left of centre (its chapter panel is on the
     right); the hero chaos cloud sits right of centre (the hero copy is on
     the left). */
  const YOU_POS = new THREE.Vector3(-0.6, 0, 0.25);
  const GOLD_U = 0.45; // the human-in-the-loop station, mid-chain, clear of the chapter panel
  const STATION_US = [0.05, 0.25, GOLD_U, 0.72, 0.95];

  /* Queue directions for the bottleneck: six near-planar lanes converging on
     YOU, two tiles abreast, so the queues read as queues from the camera. */
  const lanes = [
    new THREE.Vector3(1, 0.15, 0.1),
    new THREE.Vector3(-1, 0.2, -0.1),
    new THREE.Vector3(0.45, 0.85, 0.15),
    new THREE.Vector3(-0.5, -0.8, 0.1),
    new THREE.Vector3(0.85, -0.5, -0.15),
    new THREE.Vector3(-0.9, 0.55, 0.12),
  ].map((v) => v.normalize());

  for (let i = 0; i < N; i++) {
    seeds.push(rng() * Math.PI * 2);

    /* L0: ellipsoid shell biased right, clear of the hero copy on the left. */
    {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = 2.1 + rng() * 1.9;
      let x = 2.0 + r * Math.sin(phi) * Math.cos(theta) * 1.3;
      if (x < 0.45) x = 0.45 + (0.45 - x) * 0.55;
      L0.pos.push(
        new THREE.Vector3(
          x,
          r * Math.cos(phi) * 0.8,
          r * Math.sin(phi) * Math.sin(theta) * 0.75,
        ),
      );
      tmpE.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      L0.quat.push(new THREE.Quaternion().setFromEuler(tmpE));
      L0.scale.push(0.75 + rng() * 0.6);
    }

    /* L1: tiles queue two abreast along one of six lanes toward YOU. */
    {
      const lane = lanes[i % lanes.length];
      const slot = Math.floor(i / lanes.length);
      const rank = Math.floor(slot / 2);
      const side = slot % 2 === 0 ? 1 : -1;
      const perp = new THREE.Vector3(-lane.y, lane.x, 0).normalize();
      const dist = 1.25 + rank * 0.58 + rng() * 0.08;
      tmpV
        .copy(lane)
        .multiplyScalar(dist)
        .addScaledVector(perp, side * 0.3)
        .add(YOU_POS);
      L1.pos.push(tmpV.clone());
      /* Face the centre, standing upright: ordered but impatient. */
      tmpM.lookAt(L1.pos[i], YOU_POS, new THREE.Vector3(0, 1, 0));
      L1.quat.push(new THREE.Quaternion().setFromRotationMatrix(tmpM));
      L1.scale.push(0.78 + rng() * 0.2);
    }

    /* L2: evenly spread along the thread, oriented to its tangent. */
    {
      const u = 0.02 + (i / (N - 1)) * 0.96;
      pathU.push(u);
      path.getPointAt(u, tmpV);
      const side = i % 2 === 0 ? 1 : -1;
      L2.pos.push(
        tmpV.clone().add(new THREE.Vector3(0, side * 0.34 + 0.05, 0)),
      );
      path.getTangentAt(u, tangent);
      tmpM.lookAt(
        new THREE.Vector3(0, 0, 0),
        tangent.clone().negate(),
        new THREE.Vector3(0, 1, 0),
      );
      L2.quat.push(new THREE.Quaternion().setFromRotationMatrix(tmpM));
      L2.scale.push(0.62);
    }

    /* L4: a tidy core, tiles packed into a small rounded block grid. */
    {
      const per = 4;
      const layer = Math.floor(i / (per * per));
      const rem = i % (per * per);
      const row = Math.floor(rem / per);
      const col = rem % per;
      L4.pos.push(
        new THREE.Vector3(
          (col - (per - 1) / 2) * 0.5,
          (row - (per - 1) / 2) * 0.36 + 0.1,
          (layer - 1.5) * 0.34,
        ),
      );
      L4.quat.push(new THREE.Quaternion());
      L4.scale.push(0.52);
    }
  }

  /* ------------------------------------------------------------- materials */
  const tileGeo = keep(new RoundedBox(0.52, 0.36, 0.09, 3, 0.045));
  const tileMat = keepMat(
    new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.05,
    }),
  );
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, N);
  tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const r = (i * 2654435761) % 100;
    if (r < 55) col.set(PAPER_TILE);
    else if (r < 76) col.set(SLATE);
    else if (r < 91) col.set(ACCENT);
    else col.set(GOLD);
    tiles.setColorAt(i, col);
  }
  rig.add(tiles);

  /* YOU: the node everything waits on; later the human-in-the-loop station. */
  const youGeo = keep(new RoundedBox(0.9, 0.62, 0.18, 4, 0.08));
  const youMat = keepMat(
    new THREE.MeshStandardMaterial({
      color: GOLD,
      roughness: 0.28,
      metalness: 0.35,
    }),
  );
  const you = new THREE.Mesh(youGeo, youMat);
  rig.add(you);

  /* Stations: the mapped steps of the workflow. */
  const stationGeo = keep(new RoundedBox(0.78, 0.54, 0.16, 4, 0.07));
  const stationMat = keepMat(
    new THREE.MeshStandardMaterial({
      color: SLAB,
      roughness: 0.32,
      metalness: 0.08,
    }),
  );
  const stations: MeshT[] = [];
  const stationPos: Vec3[] = [];
  for (let s = 0; s < STATION_US.length; s++) {
    if (STATION_US[s] === GOLD_U) {
      stations.push(you); // the gold station IS the you-node, arrived in place
      stationPos.push(path.getPointAt(GOLD_U, new THREE.Vector3()));
      continue;
    }
    const m = new THREE.Mesh(stationGeo, stationMat);
    rig.add(m);
    stations.push(m);
    stationPos.push(path.getPointAt(STATION_US[s], new THREE.Vector3()));
  }

  /* The thread. drawRange turns it into a draw-on animation. */
  const TUBE_SEGS = 220;
  const tubeGeo = keep(new THREE.TubeGeometry(path, TUBE_SEGS, 0.04, 8, false));
  const tubeMat = keepMat(
    new THREE.MeshStandardMaterial({
      color: GOLD,
      roughness: 0.3,
      metalness: 0.5,
    }),
  );
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  const tubeIndexCount = tubeGeo.index ? tubeGeo.index.count : 0;
  tube.geometry.setDrawRange(0, 0);
  rig.add(tube);

  /* Packets: the work moving through the machine. */
  const packetGeo = keep(new THREE.SphereGeometry(0.09, 16, 12));
  const packetMat = keepMat(
    new THREE.MeshStandardMaterial({
      color: ACCENT,
      emissive: ACCENT,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    }),
  );
  const packets: MeshT[] = [];
  for (let k = 0; k < 3; k++) {
    const m = new THREE.Mesh(packetGeo, packetMat);
    rig.add(m);
    packets.push(m);
  }

  /* ------------------------------------------------------------------ light */
  scene.add(new THREE.AmbientLight(KEY_LIGHT, 0.32));
  const key = new THREE.DirectionalLight(KEY_LIGHT, 1.9);
  key.position.set(-5, 7, 9);
  scene.add(key);
  const rim = new THREE.DirectionalLight(GOLD, 2.1);
  rim.position.set(7, 3, -6);
  scene.add(rim);

  /* --------------------------------------------------------------- camera --
     One keyframe per chapter; the coordinate blends between neighbours. */
  const camKeys = [
    { pos: new THREE.Vector3(0.7, 0.3, 9.4), tgt: new THREE.Vector3(0.55, 0, 0) },
    { pos: new THREE.Vector3(-0.9, 1.7, 8.8), tgt: new THREE.Vector3(-0.55, 0, 0) },
    { pos: new THREE.Vector3(1.6, 1.4, 8.8), tgt: new THREE.Vector3(0.8, 0, 0) },
    { pos: new THREE.Vector3(-0.4, 1.1, 9.6), tgt: new THREE.Vector3(-0.7, 0, 0) },
    { pos: new THREE.Vector3(0.2, 1.9, 12.4), tgt: new THREE.Vector3(0.9, -0.1, 0) },
  ];

  /* --------------------------------------------------------------- pointer */
  const fine = window.matchMedia("(pointer: fine)").matches;
  let targetPX = 0;
  let targetPY = 0;
  let curPX = 0;
  let curPY = 0;
  const onPointer = (e: PointerEvent) => {
    targetPX = ((e.clientX / window.innerWidth) * 2 - 1) * 0.55;
    targetPY = ((e.clientY / window.innerHeight) * 2 - 1) * -0.3;
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
    /* Narrow viewports push the camera back so the machine still fits. */
    aspectFit = MathUtils.clamp(1.75 / aspect, 1, 2.1);
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
  const scratch = new THREE.Vector3();
  const posA = new THREE.Vector3();
  const posB = new THREE.Vector3();
  const quatA = new THREE.Quaternion();
  const quatB = new THREE.Quaternion();
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;

  /** Target for instance i at integer layout k, written into pos/quat/scale. */
  const layoutTarget = (
    k: number,
    i: number,
    outPos: Vec3,
    outQuat: QuatT,
  ): number => {
    if (k <= 0) {
      outPos.copy(L0.pos[i]);
      outQuat.copy(L0.quat[i]);
      return L0.scale[i];
    }
    if (k === 1) {
      outPos.copy(L1.pos[i]);
      outQuat.copy(L1.quat[i]);
      return L1.scale[i];
    }
    if (k === 2) {
      outPos.copy(L2.pos[i]);
      outQuat.copy(L2.quat[i]);
      return L2.scale[i];
    }
    if (k === 3) {
      /* The machine: tiles flow along the thread. */
      const u = wrap01(pathU[i] + elapsed * 0.022);
      path.getPointAt(u, outPos);
      const side = i % 2 === 0 ? 1 : -1;
      outPos.y += side * 0.3 + 0.05;
      path.getTangentAt(u, tangent);
      tmpM.lookAt(scratch.set(0, 0, 0), tangent.clone().negate(), up);
      outQuat.setFromRotationMatrix(tmpM);
      return 0.58;
    }
    outPos.copy(L4.pos[i]);
    outQuat.copy(L4.quat[i]);
    return L4.scale[i];
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
    coord = MathUtils.damp(coord, target, 6, dt);
    const c = coord;
    const k = Math.min(Math.floor(c), CHAPTERS - 1);
    const f = clamp01(c - k);

    /* Wobble amplitude: big in chaos, calm in the machine. */
    const wobble = MathUtils.lerp(0.16, 0.02, clamp01(c / 2.4));

    for (let i = 0; i < N; i++) {
      const sA = layoutTarget(k, i, posA, quatA);
      const sB = layoutTarget(k + 1, i, posB, quatB);
      posA.lerp(posB, f);
      quatA.slerp(quatB, f);
      const s = MathUtils.lerp(sA, sB, f);

      const w = seeds[i];
      posA.x += Math.sin(elapsed * 0.5 + w) * wobble;
      posA.y += Math.sin(elapsed * 0.4 + w * 1.7) * wobble;
      posA.z += Math.cos(elapsed * 0.45 + w * 2.3) * wobble * 0.6;

      tmpM.compose(posA, quatA, scratch.set(s, s, s));
      tiles.setMatrixAt(i, tmpM);
    }
    tiles.instanceMatrix.needsUpdate = true;
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;

    /* YOU node: hidden in chaos, centre of the bottleneck, then glides onto
       the thread as the human-in-the-loop station and stays. */
    const youIn = MathUtils.smoothstep(c, 0.45, 1.0);
    const youToStation = MathUtils.smoothstep(c, 1.55, 2.3);
    you.position.lerpVectors(
      YOU_POS,
      stationPos[STATION_US.indexOf(GOLD_U)],
      easeInOut(youToStation),
    );
    you.position.y += Math.sin(elapsed * 0.6) * 0.045;
    const youScale = youIn * 1.25 * (1 + Math.sin(elapsed * 1.1) * 0.02);
    you.scale.setScalar(Math.max(0.0001, youScale));
    you.rotation.y = MathUtils.lerp(0.35, 0, youToStation);

    /* Stations grow in while the thread draws. */
    const mapIn = MathUtils.smoothstep(c, 1.6, 2.35);
    for (let s = 0; s < stations.length; s++) {
      if (stations[s] === you) continue;
      const local = clamp01(mapIn * 1.6 - s * 0.12);
      const sc = easeInOut(local) * 0.999 + 0.0001;
      stations[s].scale.setScalar(sc);
      stations[s].position.copy(stationPos[s]);
      stations[s].position.y += Math.sin(elapsed * 0.55 + s * 1.3) * 0.04;
      path.getTangentAt(STATION_US[s], tangent);
      tmpM.lookAt(scratch.set(0, 0, 0), tangent.clone().negate(), up);
      stations[s].quaternion.setFromRotationMatrix(tmpM);
    }

    /* Thread draw-on. */
    const draw = MathUtils.smoothstep(c, 1.5, 2.25);
    tube.geometry.setDrawRange(0, Math.floor(tubeIndexCount * easeInOut(draw)));

    /* Packets appear once the machine runs. */
    const packetIn = MathUtils.smoothstep(c, 2.55, 3.0);
    for (let p = 0; p < packets.length; p++) {
      const u = wrap01(elapsed * 0.07 + p / packets.length);
      path.getPointAt(u, packets[p].position);
      packets[p].position.y += 0.02;
      packets[p].scale.setScalar(Math.max(0.0001, packetIn));
    }

    /* Payoff: the whole rig settles smaller and drifts right of centre so the
       closing words own the left. */
    const settle = MathUtils.smoothstep(c, 3.1, 3.9);
    const rigScale = MathUtils.lerp(1, 0.68, easeInOut(settle));
    rig.scale.setScalar(rigScale);
    rig.position.set(
      MathUtils.lerp(0, 1.5, easeInOut(settle)),
      MathUtils.lerp(0, -0.25, easeInOut(settle)),
      0,
    );
    rig.rotation.y = Math.sin(elapsed * 0.12) * 0.04;

    /* Camera: blend keyframes, add pointer parallax. */
    curPX = MathUtils.damp(curPX, targetPX, 3, dt);
    curPY = MathUtils.damp(curPY, targetPY, 3, dt);
    camPos.lerpVectors(camKeys[k].pos, camKeys[k + 1].pos, f);
    camTgt.lerpVectors(camKeys[k].tgt, camKeys[k + 1].tgt, f);
    camPos.multiplyScalar(aspectFit);
    camPos.x += curPX;
    camPos.y += curPY;
    camera.position.copy(camPos);
    camera.lookAt(camTgt);

    /* Panels: hero fades over the first half chapter, each chapter panel is a
       bell around its own coordinate. */
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
    tiles.dispose();
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
