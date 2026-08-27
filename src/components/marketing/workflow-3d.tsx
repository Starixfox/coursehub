"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import type { MarketingCopy } from "./copy";
import "./workflow-3d.css";

/* Type-only view of the three.js module. Nothing here survives compilation, so
   three is never pulled into the server bundle or the initial JS payload. */
type Three = typeof import("three");
type Geometry = InstanceType<Three["BufferGeometry"]>;
type Material = InstanceType<Three["Material"]>;
type Texture = InstanceType<Three["Texture"]>;
type MeshT = InstanceType<Three["Mesh"]>;
type SpriteT = InstanceType<Three["Sprite"]>;
type GroupT = InstanceType<Three["Group"]>;
type PointLightT = InstanceType<Three["PointLight"]>;

/* --------------------------------------------------------------- scene plan --

   Five cards hang above a single rail, in the reading order of the workflow:

     trigger -> agent -> agent -> agent -> action

   Emissive packets slide along the rail, pause at each card while it "works",
   then move on. The card nearest the packet lights up (its own point light
   brightens, its halo swells, it lifts a little) and dims again as the packet
   leaves. Nothing is labelled: the motion alone should say that work enters on
   one side, passes through specialised steps, and leaves the other side done.
*/

const NODES = 5;
const HOPS = NODES - 1;
const SPACING = 3.0;
const RAIL_Y = -1.05;
const GROUND_Y = -1.62;
const CYCLE = 9; // seconds for one packet to cross the whole chain
const DWELL = 0.44; // share of each hop spent waiting at the card
const PACKET_PHASES = [0, 1 / 3, 2 / 3];
const FOV = 32;
const PITCH = 0.26; // camera elevation, radians

/* Half extents of everything in the chain, used to frame the camera. */
const HALF_X = 7.2;
const HALF_Y = 1.5;
const HALF_Z = 0.9;
const CENTER_Y = -0.35;
const CENTER_Z = 0.5;

/* Palette, straight from the marketing.css tokens. */
const INK = 0x1c1c17;
const INK_LINE = 0x5a564b;
const RAIL = 0xa49e8b;
const ACCENT = 0x2b44e7;
const GOLD = 0xc3a054;
const GREEN = 0x1f7a4d;
const PAPER_LIGHT = 0xfffdf6;

/* The cycle is measured in "slot units": each of the HOPS segments is one unit
   (DWELL waiting at its source card, then 1 - DWELL travelling), plus one
   trailing dwell so the final Action card gets held on exactly as long as the
   others. Without that trailing slot the last card is never a segment source
   and never lights up. */
const TOTAL_UNITS = HOPS + DWELL;

/* A packet grows in and shrinks out inside the first and last dwells, so it is
   always at full scale while actually travelling. Must stay below DWELL. */
const FADE_UNITS = 0.3;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

function easeInOut(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Continuous node index (0 to HOPS) for a packet at cycle progress p. */
function chainPosition(p: number): number {
  const x = clamp01(p) * TOTAL_UNITS;
  if (x >= HOPS) return HOPS; // parked on the last card
  const i = Math.floor(x);
  const f = x - i;
  if (f <= DWELL) return i;
  return i + easeInOut((f - DWELL) / (1 - DWELL));
}

/**
 * Packet scale (0 to 1) at cycle progress p, in the same unit space as
 * chainPosition, so the fade brackets the journey instead of overlapping the
 * final hop.
 */
function packetVisibility(p: number): number {
  const x = clamp01(p) * TOTAL_UNITS;
  return clamp01(Math.min(x / FADE_UNITS, (TOTAL_UNITS - x) / FADE_UNITS));
}

/**
 * The hero workflow scene.
 *
 * Same recipe as `hero-shader.tsx`: the WebGL layer is imported lazily inside
 * an effect, guarded by prefers-reduced-motion, and the CSS/DOM version stays
 * in place as the fallback. Here the fallback is the 2D chip flow, which is
 * server-rendered, keeps the box at its final height (so the swap costs no
 * layout shift) and remains in the accessibility tree once the canvas is live.
 */
export function Workflow3D({ copy }: { copy: MarketingCopy["hero"] }): ReactElement {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    /* Guard 1: motion preference. The 2D flow simply stays. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Guard 2: WebGL availability, probed on a throwaway canvas so the real
       one is left untouched for the renderer. */
    const probe = document.createElement("canvas");
    const supported = Boolean(
      probe.getContext("webgl2") ?? probe.getContext("webgl"),
    );
    if (!supported) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    import("three")
      .then((THREE) => {
        if (cancelled) return;
        teardown = build(THREE, stage, canvas, () => setLive(true));
      })
      .catch(() => {
        /* the scene is decorative; the 2D flow stays */
      });

    return () => {
      cancelled = true;
      if (teardown) teardown();
      setLive(false);
    };
  }, []);

  return (
    <div className={`mk-flow-frame mk-w3d rv is-in${live ? " is-live" : ""}`}>
      <div className="mk-flow-frame__bar">
        <span>{copy.flowName}</span>
        <span className="mk-flow-frame__status">{copy.flowStatus}</span>
      </div>

      <div className="mk-w3d__stage" ref={stageRef}>
        <canvas ref={canvasRef} className="mk-w3d__canvas" aria-hidden="true" />

        {/* The 2D flow is the fallback and the accessible description of the
            scene. It is never removed from the DOM: when the canvas takes over
            it fades to zero opacity but keeps its box and stays readable to
            screen readers. */}
        <div className="mk-w3d__flat">
          <div
            className="mk-flow mk-flow--responsive"
            role="group"
            aria-label={copy.flowAria}
          >
            <div className="mk-chip">
              <span className="mk-chip__role">{copy.roleTrigger}</span>
              <span className="mk-chip__label">{copy.trigger}</span>
            </div>
            <div className="mk-conn" style={{ "--d": "0s" } as React.CSSProperties} />
            <div
              className="mk-chip mk-chip--agent"
              style={{ "--d": "0.33s" } as React.CSSProperties}
            >
              <span className="mk-chip__role">{copy.roleAgent}</span>
              <span className="mk-chip__label">{copy.agents[0]}</span>
            </div>
            <div
              className="mk-conn"
              style={{ "--d": "0.55s" } as React.CSSProperties}
            />
            <div
              className="mk-chip mk-chip--agent"
              style={{ "--d": "0.88s" } as React.CSSProperties}
            >
              <span className="mk-chip__role">{copy.roleAgent}</span>
              <span className="mk-chip__label">{copy.agents[1]}</span>
            </div>
            <div
              className="mk-conn"
              style={{ "--d": "1.1s" } as React.CSSProperties}
            />
            <div
              className="mk-chip mk-chip--agent"
              style={{ "--d": "1.43s" } as React.CSSProperties}
            >
              <span className="mk-chip__role">{copy.roleAgent}</span>
              <span className="mk-chip__label">{copy.agents[2]}</span>
            </div>
            <div
              className="mk-conn"
              style={{ "--d": "1.65s" } as React.CSSProperties}
            />
            <div className="mk-chip mk-chip--action">
              <span className="mk-chip__role">{copy.roleAction}</span>
              <span className="mk-chip__label">{copy.action}</span>
            </div>
          </div>
          {live ? <p className="mk-w3d__desc">{copy.scene3dAria}</p> : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ builder --

   Everything below runs once, client side, after three has resolved. It returns
   a single teardown function that cancels the frame loop, drops every listener
   and observer, and disposes every geometry, material and texture it created.
*/
function build(
  THREE: Three,
  stage: HTMLDivElement,
  canvas: HTMLCanvasElement,
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
    /* context creation can still fail on blocklisted drivers */
    return () => {};
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
  const center = new THREE.Vector3(0, CENTER_Y, CENTER_Z);

  /* Disposal registers. Nothing is created that is not pushed here. */
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

  /* A soft radial falloff, generated in code. Used for both the card halos and
     the contact shadows, so a single texture covers every soft edge. */
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
      g.addColorStop(0.45, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    textures.push(tex);
    return tex;
  })();

  /* ------------------------------------------------------------- materials --
     One material per role, not one per node. The five cards share a single
     body material and a single beveled geometry. */
  const cardMat = keepMat(
    new THREE.MeshStandardMaterial({
      color: INK,
      roughness: 0.44,
      metalness: 0.08,
    }),
  );
  const railMat = keepMat(
    new THREE.MeshStandardMaterial({
      color: RAIL,
      roughness: 0.5,
      metalness: 0.2,
    }),
  );
  const lineMat = keepMat(new THREE.MeshBasicMaterial({ color: INK_LINE }));
  const roleMats = [
    keepMat(new THREE.MeshBasicMaterial({ color: GOLD })), // trigger
    keepMat(new THREE.MeshBasicMaterial({ color: ACCENT })), // agent
    keepMat(new THREE.MeshBasicMaterial({ color: GREEN })), // action
  ];
  const packetMat = keepMat(new THREE.MeshBasicMaterial({ color: ACCENT }));
  const glowMat = keepMat(
    new THREE.SpriteMaterial({
      map: radial,
      color: ACCENT,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
  );
  const shadowMat = keepMat(
    new THREE.MeshBasicMaterial({
      map: radial,
      color: 0x191813,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    }),
  );

  /* ------------------------------------------------------------ geometries --
     Built once, shared by every instance that needs them. */
  const cardGeo = (() => {
    const w = 1.0;
    const h = 0.675;
    const r = 0.16;
    const shape = new THREE.Shape();
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 2,
      curveSegments: 10,
    });
    geo.translate(0, 0, -0.1); // centre the slab on its own z axis
    return keep(geo);
  })();

  const barGeo = keep(new THREE.BoxGeometry(1, 0.075, 0.03));
  const strutGeo = keep(new THREE.CylinderGeometry(0.02, 0.02, 1, 6));
  const packetGeo = keep(new THREE.SphereGeometry(0.11, 16, 12));
  const shadowGeo = keep(new THREE.PlaneGeometry(1, 1));

  /* ------------------------------------------------------------------- rig --
     The whole chain lives in one group so the framing code can yaw it as a
     unit and the camera can stay on a simple orbit. */
  const rig = new THREE.Group();
  scene.add(rig);

  const nodePositions: InstanceType<Three["Vector3"]>[] = [];
  const railPoints: InstanceType<Three["Vector3"]>[] = [];
  for (let i = 0; i < NODES; i++) {
    const x = (i - 2) * SPACING;
    const z = 1.0 - 0.25 * (i - 2) * (i - 2); // shallow arc, bowed toward the viewer
    nodePositions.push(new THREE.Vector3(x, 0, z));
    railPoints.push(new THREE.Vector3(x, RAIL_Y, z));
  }

  const curve = new THREE.CatmullRomCurve3(railPoints, false, "catmullrom", 0.5);
  const railGeo = keep(new THREE.TubeGeometry(curve, 180, 0.035, 8, false));
  rig.add(new THREE.Mesh(railGeo, railMat));

  type NodeRec = {
    group: GroupT;
    light: PointLightT;
    glow: SpriteT;
    shadow: MeshT;
    baseScale: number;
    phase: number;
    act: number;
  };

  const nodes: NodeRec[] = [];

  for (let i = 0; i < NODES; i++) {
    const isEnd = i === 0 || i === NODES - 1;
    const baseScale = isEnd ? 0.85 : 1;
    const roleMat = i === 0 ? roleMats[0] : i === NODES - 1 ? roleMats[2] : roleMats[1];

    const group = new THREE.Group();
    group.position.copy(nodePositions[i]);
    group.scale.setScalar(baseScale);
    rig.add(group);

    /* Card body. Shared geometry, shared material. */
    group.add(new THREE.Mesh(cardGeo, cardMat));

    /* Role stripe across the top of the face, then two neutral hairlines so
       the card reads as a record rather than a blank block. */
    const role = new THREE.Mesh(barGeo, roleMat);
    role.position.set(0, 0.42, 0.166);
    role.scale.x = 1.15;
    group.add(role);

    const line1 = new THREE.Mesh(barGeo, lineMat);
    line1.position.set(-0.13, 0.06, 0.164);
    line1.scale.set(0.9, 0.34, 0.6);
    group.add(line1);

    const line2 = new THREE.Mesh(barGeo, lineMat);
    line2.position.set(-0.3, -0.2, 0.164);
    line2.scale.set(0.56, 0.34, 0.6);
    group.add(line2);

    /* Halo behind the card. Partly hidden by the card itself, so activation
       reads as a rim of light rather than a blob. */
    const glow = new THREE.Sprite(glowMat);
    glow.position.set(0, 0, -0.4);
    glow.scale.set(1.4, 1.1, 1);
    group.add(glow);

    /* The activation light. Five small point lights, animated, are what makes
       a card "light up as the packet arrives": the neighbouring cards catch a
       little of it too, which is exactly the falloff we want. */
    const light = new THREE.PointLight(ACCENT, 0.5, 6, 2);
    light.position.set(0, 0.1, 1.0);
    group.add(light);

    /* Strut down to the rail. Static, so the card visibly floats above it. */
    const strut = new THREE.Mesh(strutGeo, railMat);
    const top = -0.675 * baseScale;
    const len = top - RAIL_Y;
    strut.position.set(
      nodePositions[i].x,
      RAIL_Y + len / 2,
      nodePositions[i].z,
    );
    strut.scale.y = len;
    rig.add(strut);

    /* Contact shadow on the ground plane. */
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(nodePositions[i].x, GROUND_Y, nodePositions[i].z);
    shadow.scale.set(2.9 * baseScale, 1.7 * baseScale, 1);
    rig.add(shadow);

    nodes.push({
      group,
      light,
      glow,
      shadow,
      baseScale,
      phase: i * 1.19,
      act: 0,
    });
  }

  /* ----------------------------------------------------------- the packets --
     Each packet is a crisp dot plus a soft halo, both sharing one geometry and
     one material across all three. */
  const packets: MeshT[] = [];
  const halos: SpriteT[] = [];
  for (let k = 0; k < PACKET_PHASES.length; k++) {
    const dot = new THREE.Mesh(packetGeo, packetMat);
    rig.add(dot);
    packets.push(dot);
    const halo = new THREE.Sprite(glowMat);
    halo.scale.set(0.9, 0.9, 1);
    rig.add(halo);
    halos.push(halo);
  }

  /* ------------------------------------------------------------------ light --
     Cool key from the front left, gold rim from behind the right shoulder,
     paper-warm ambient so the ink slabs never go flat black. */
  scene.add(new THREE.AmbientLight(PAPER_LIGHT, 0.95));
  const key = new THREE.DirectionalLight(PAPER_LIGHT, 2.3);
  key.position.set(-5, 7, 9);
  scene.add(key);
  const rim = new THREE.DirectionalLight(GOLD, 2.9);
  rim.position.set(7, 3, -6);
  scene.add(rim);

  /* ---------------------------------------------------------------- framing --
     The chain is yawed more as the box gets narrower, so a portrait viewport
     sees it running into depth instead of squeezed edge to edge. Distance is
     solved from the real half extents, which means the scene always fits, at
     any aspect, without hand-tuned breakpoints. */
  let yaw = -0.2;
  let dist = 13;

  const frame = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (w === 0 || h === 0) return;
    const aspect = w / h;

    const t = MathUtils.clamp((aspect - 0.9) / (2.4 - 0.9), 0, 1);
    yaw = MathUtils.lerp(-0.95, -0.18, t);
    rig.rotation.y = yaw;

    /* Turn each card back toward the viewer by part of the rig yaw, so even a
       strong angle keeps the faces readable. */
    for (const n of nodes) n.group.rotation.y = -yaw * 0.55;

    const c = Math.abs(Math.cos(yaw));
    const s = Math.abs(Math.sin(yaw));
    const hx = HALF_X * c + HALF_Z * s;
    const hz = HALF_X * s + HALF_Z * c;

    const vFov = FOV * MathUtils.DEG2RAD;
    const tanV = Math.tan(vFov / 2);
    const tanH = tanV * aspect;
    dist = Math.max(HALF_Y / tanV, hx / tanH) * 1.14 + hz;

    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
  };
  frame();

  /* --------------------------------------------------------------- parallax --
     A couple of degrees, damped, and only where there is a real pointer. */
  const fine = window.matchMedia("(pointer: fine)").matches;
  let targetYaw = 0;
  let targetPitch = 0;
  let curYaw = 0;
  let curPitch = 0;

  const onPointer = (e: PointerEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetYaw = MathUtils.clamp(nx, -1, 1) * 0.1;
    targetPitch = MathUtils.clamp(ny, -1, 1) * -0.055;
  };
  if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

  /* ------------------------------------------------------------------- loop */
  const camDir = new THREE.Vector3();
  const scratch = new THREE.Vector3();
  const act = new Float32Array(NODES);

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += dt;

    act.fill(0);

    for (let k = 0; k < packets.length; k++) {
      const p = (elapsed / CYCLE + PACKET_PHASES[k]) % 1;
      const u = chainPosition(p);
      curve.getPoint(u / HOPS, scratch);

      /* Scale, not opacity, does the fade: the packets share one material. */
      const vis = packetVisibility(p);
      packets[k].position.copy(scratch);
      packets[k].scale.setScalar(vis);
      halos[k].position.copy(scratch);
      halos[k].scale.set(0.9 * vis, 0.9 * vis, 1);

      for (let i = 0; i < NODES; i++) {
        const d = Math.abs(u - i);
        if (d >= 0.6) continue;
        const a = MathUtils.smoothstep(1 - d / 0.6, 0, 1) * vis;
        if (a > act[i]) act[i] = a;
      }
    }

    for (let i = 0; i < NODES; i++) {
      const n = nodes[i];
      n.act = MathUtils.damp(n.act, act[i], 8, dt);
      const float = Math.sin(elapsed * 0.55 + n.phase) * 0.06;
      n.group.position.y = float + n.act * 0.07;
      n.group.rotation.z = Math.sin(elapsed * 0.4 + n.phase) * 0.012;
      n.group.scale.setScalar(n.baseScale * (1 + n.act * 0.03));
      n.light.intensity = 0.5 + n.act * 7.5;
      const g = 0.55 + n.act * 0.8;
      n.glow.scale.set(1.4 * g, 1.1 * g, 1);
      const sh = n.baseScale * (1 - float * 0.5);
      n.shadow.scale.set(2.9 * sh, 1.7 * sh, 1);
    }

    curYaw = MathUtils.damp(curYaw, targetYaw, 3, dt);
    curPitch = MathUtils.damp(curPitch, targetPitch, 3, dt);
    const pitch = PITCH + curPitch;
    camDir.set(
      Math.sin(curYaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(curYaw) * Math.cos(pitch),
    );
    camera.position.copy(center).addScaledVector(camDir, dist);
    camera.lookAt(center);

    renderer.render(scene, camera);
  };

  let onScreen = false;
  const start = () => {
    if (raf === 0 && onScreen && !document.hidden) {
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

  /* Off-screen means no work at all. */
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
    else start();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const ro = new ResizeObserver(() => frame());
  ro.observe(stage);

  /* First frame drawn before the fade-in, so the canvas never appears empty. */
  onScreen = true;
  camera.position.set(0, 3, dist);
  camera.lookAt(center);
  renderer.render(scene, camera);
  start();
  onReady();

  /* --------------------------------------------------------------- teardown */
  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    if (fine) window.removeEventListener("pointermove", onPointer);

    scene.clear();
    rig.clear();
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    for (const t of textures) t.dispose();
    renderer.dispose();
    try {
      renderer.forceContextLoss();
    } catch {
      /* not fatal: the context is going away with the canvas anyway */
    }
  };
}
