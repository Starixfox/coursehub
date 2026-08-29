# AGORA SITE REBUILD: THE BUILD SPECIFICATION

Repo `C:\GitHub\coursehub`. Next.js 16 static export, React 19, three r0.184, gsap 3.15, lenis 1.3.
This document supersedes every prior concept doc. Where it contradicts an input, this document wins.

Global rules for every line of code and copy in this spec: no em dashes; Dutch and English both ship; `prefers-reduced-motion` is honoured everywhere; nothing in `site-atmosphere.tsx` changes.

---

# A. THE 3D SCENE

New file: `C:\GitHub\coursehub\src\components\marketing\story-machine.tsx`
Consumed by: `C:\GitHub\coursehub\src\components\marketing\story-scene.tsx` (shell only, see A.11)
Old file kept but unused: `hero-shader.tsx`. Old builder deleted: everything below line 200 of `story-scene.tsx`.

## A.0 The object, in one sentence

A fat rounded toy machine on a plinth: a lumpy boulder of work drops through a gold-rimmed funnel into a bone-white engine block, and neat identical slabs travel out along a conveyor, slow down under one gold handle a person still holds, and stack themselves in a tray.

## A.1 The four decisions that override the winning concept

All three judges convicted the winning concept of the same crime, so these are not optional.

1. **The hero is NOT an exploded view.** Chapter 0 shows the machine fully assembled, at its home positions, switched off. Parts held apart in space is the exact read that got version one rejected, and it cannot be the first frame. The only thing off the machine in chapter 0 is the pile, which is arriving.
2. **The mapping chapter is NOT a second exploded view.** The machine holds together. Exactly two parts lift (hopper +0.55, tray +0.28), the rig tips 6 degrees toward camera, and a gold line draws the route through the intact object. Chapters 0 and 2 must be distinguishable as silhouettes, not as captions.
3. **The fov is FIXED at 34 for the entire scroll.** No 32/36/33 swing. Pressure in the bottleneck comes from camera distance (8.10) and height (2.85), never from opening the lens. `updateProjectionMatrix()` is called on resize only.
4. **Reverse-scroll purity is a hard rule.** Every transform is a pure function of the damped `coord`. The only things allowed to read `elapsed` are: roller spin, belt map offset, block travel phase, lever rocking, camera breathing, and rig breathing. The hero `hopperRing` idle yaw from the concept doc is deleted; it violated the concept's own motion rule.

## A.2 Renderer, environment, budget

```
renderer = new WebGLRenderer({ canvas, alpha: true, antialias: !isMobile,
                               powerPreference: "high-performance" })
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2))
renderer.outputColorSpace     = SRGBColorSpace
renderer.toneMapping          = ACESFilmicToneMapping
renderer.toneMappingExposure  = 1.05
renderer.shadowMap.enabled    = shadowsOn      // see A.9
renderer.shadowMap.type       = PCFSoftShadowMap
renderer.shadowMap.autoUpdate = false
scene.background = null                        // the site shader shows through
```

Environment: `RoomEnvironment` through `PMREMGenerator` at 256, assigned to `scene.environment` only. `pmrem.dispose()` immediately after `fromScene`. The generated texture is disposed on unmount.

`envMapIntensity` per material family: bone shell 0.50, gold 0.60, deck and belt 0.35, grey (rollers, tray) 0.50, pile 0.40.

No post-processing. No bloom. No `GridHelper`, no `AxesHelper`, no wireframe, no `flatShading` anywhere.

Triangle budget: desktop 29k, hard cap 35k. Mobile preset 17k (rounded-box segments 5, icosphere detail 2, tube radial 6, lathe radial 32, torus 32x12). Draw calls: 16 desktop, 15 mobile (no transmission pass).

## A.3 Part list, final

Sixteen entries: 13 lit meshes, one unlit shadow plane, one unlit line, one instanced pair counted once. All colors are hex ints in code.

| # | name | geometry | dimensions and home | material |
|---|---|---|---|---|
| 1 | `deck` | `RoundedBoxGeometry(9.4, 0.45, 2.9, 6, 0.20)` | top face y = -1.295, home p(1.15, -1.52, 0) | `MeshPhysical` 0x141a28, roughness 0.62, metalness 0, clearcoat 0.20, clearcoatRoughness 0.60, env 0.35, `receiveShadow` |
| 2 | `contactShadow` | `PlaneGeometry(10.5, 3.6)`, rotation.x -Math.PI/2 | p(1.15, -1.74, 0) | `MeshBasic` 0x000000, `alphaMap` = 256px canvas radial gradient (centre alpha 0.85, zero at rim, scaled 1.0 x 0.62 in y for a stretched ellipse), transparent, `depthWrite false`, `toneMapped false`, opacity per chapter |
| 3 | `belt` | `RoundedBoxGeometry(4.8, 0.44, 1.40, 6, 0.22)` | spans x -1.20 to 3.60, top y = -0.80, home p(1.20, -1.02, 0) | `MeshPhysical` 0x1d2536, roughness 0.72, metalness 0, clearcoat 0.12, env 0.35. **No map.** |
| 4 | `beltTop` | `PlaneGeometry(4.72, 1.32)`, rotation.x -Math.PI/2 | y = belt.y + 0.232 (0.012 proud of the belt top face), parented to `belt` at local (0, 0.232, 0) | `MeshStandard` 0x2b344a, roughness 0.68, `map` = 512x128 canvas chevrons, `repeat(6,1)`, `wrapS = RepeatWrapping`, `emissiveMap` = same canvas, `emissive` 0xe3bd6c, `emissiveIntensity` 0 to 0.35, `polygonOffset: true, polygonOffsetFactor: -1` |
| 5 | `rollers` | `CylinderGeometry(0.30, 0.30, 1.55, 32, 1)`, `InstancedMesh` count 2, parent group `rotation.x = Math.PI/2` | instance 0 p(-1.20, -1.02, 0), instance 1 p(3.60, -1.02, 0) | `MeshPhysical` 0xc3ccdf, roughness 0.40, metalness 0, clearcoat 0.40, clearcoatRoughness 0.35, env 0.50 |
| 6 | `body` | `RoundedBoxGeometry(3.0, 2.20, 1.90, 8, 0.46)` | bottom face y = -0.78, rests on belt top, home p(-1.75, 0.32, 0) | `MeshPhysical` 0xf4f5f8, roughness 0.34, metalness 0, clearcoat 0.55, clearcoatRoughness 0.38, sheen 0.28, sheenColor 0xcfd8ff, sheenRoughness 0.60, env 0.50, `castShadow` |
| 7 | `window` | `RoundedBoxGeometry(1.40, 0.95, 0.10, 5, 0.09)` | z 1.04, i.e. 0.09 proud of the body front face at 0.95, home p(-1.75, 0.45, 1.04) | `MeshPhysical` 0x0d1220, roughness 0.22, metalness 0, transmission 0.35 (desktop) / 0 (mobile), thickness 0.25, ior 1.35, clearcoat 1.0, emissive 0x7ea2ff, emissiveIntensity per chapter |
| 8 | `hopper` | `LatheGeometry(profile, 48)`, 12 profile points from (0.50, -0.65) out to (1.25, 0.55) then a quarter arc to (1.20, 0.65), smooth normals | spans y 1.30 to 2.60, sinks 0.12 into the body top at 1.42, home p(-1.75, 1.95, 0) | same bone shell as `body`, `side: DoubleSide`, `castShadow` |
| 9 | `hopperRing` | `TorusGeometry(1.25, 0.11, 16, 48)`, rotation.x -Math.PI/2 | outer r 1.36, home p(-1.75, 2.56, 0) | candy gold: `MeshPhysical` 0xe3bd6c, roughness 0.28, **metalness 0**, clearcoat 0.70, clearcoatRoughness 0.25, emissive 0x6a4c12, emissiveIntensity 0.12, env 0.60 |
| 10 | `lever` | `CapsuleGeometry(0.13, 0.90, 8, 16)`, pivot moved to the lower cap by translating the geometry +0.58 in y | total 1.16, home p(1.55, -1.295, 0.92) with the geometry offset, rest rotation z +8 deg. **Relocated to mid-belt** so blocks visibly pass under it | candy gold, `castShadow` |
| 11 | `leverPad` | `CylinderGeometry(0.30, 0.34, 0.10, 24)` | p(1.55, -1.245, 0.92), a 0.10 collar seating the lever on the deck so it is not a stick pushed into a plane | candy gold, `receiveShadow` |
| 12 | `cup` | `LatheGeometry` 9-point profile, r 0.26, height 0.42, wall visible inside; plus `TorusGeometry(0.17, 0.055, 10, 24)` handle merged into one geometry with `mergeGeometries` | home p(2.20, -1.085, 1.02) | bone shell but roughness 0.30, with a gold `hopperRing`-material band merged as the rim ring (`TorusGeometry(0.26, 0.035, 8, 24)` at the lip), `castShadow`. **This is the human anchor, see A.4** |
| 13 | `pile` | `IcosahedronGeometry(1.0, 3)`, non-indexed, plus one **morph target** (see A.5) | base r 1.0, scaled 0.55 to 1.35 by chapter | `MeshPhysical` 0x8e98ad, roughness 0.58, metalness 0, clearcoat 0.18, clearcoatRoughness 0.55, env 0.40, `morphTargets` implied, `castShadow` |
| 14 | `blocks` | `RoundedBoxGeometry(0.90, 0.26, 0.90, 5, 0.10)`, `InstancedMesh` count 4 | parked at p(4.75, -0.74 + i*0.28, 0) | `MeshPhysical` 0xf4f5f8, roughness 0.30, metalness 0, clearcoat 0.50, clearcoatRoughness 0.35, `castShadow`; `instanceColor` lerped 35 percent toward 0xefd49b on payoff |
| 15 | `tray` | `RoundedBoxGeometry(1.60, 0.36, 1.40, 6, 0.15)` | rests on the deck top, home p(4.75, -1.10, 0) | `MeshPhysical` 0xc3ccdf, roughness 0.40, metalness 0, clearcoat 0.40, clearcoatRoughness 0.35, `receiveShadow` |
| 16 | `planLine` | `TubeGeometry(CatmullRomCurve3([...]), 96, 0.035, 8, false)` | curve through (-1.75, 2.60, 0), (-1.75, 1.10, 0), (-1.30, -0.40, 0), (-0.25, -0.72, 0), (1.55, -0.66, 0), (2.60, -0.72, 0), (4.10, -0.72, 0), (4.75, -0.86, 0). Note the deliberate rise at x 1.55: the route bumps up over the human station | `MeshBasic` 0xe3bd6c, transparent, `toneMapped false`, `depthWrite false`, revealed with `geometry.setDrawRange` |

**Fillet rule, enforced:** every rounded box carries a radius of at least 18 percent of its smallest dimension. `body` is 0.46 on 1.90 = 24 percent. `belt` is 0.22 on 0.44 = 50 percent. `blocks` 0.10 on 0.26 = 38 percent. A 0.05 radius anywhere is a build failure.

**Size floor, with the one stated exception:** no part is smaller than 0.90 units in its longest dimension, except `cup` (0.60) and `leverPad` (0.68). Both are exempt on purpose: the cup is the human-scale object and the pad exists only to seat the lever. At the payoff camera the cup subtends at least 22 CSS px at 1440x900; verify once with the dev NDC guard in A.10.

## A.4 The cup: why it exists

Three judges independently named the same missing piece: the human beat is a lever bolted to the machine, and a lever is a component, not a person. The cup is the smallest object in the scene, it is on screen in all five chapters, it never travels more than 0.95 units, and it is the only object that is not part of the machine. It reads as somebody's desk on the factory floor.

Its whole story: on the deck beside the lever at hero, shoved to the deck edge and tipped 9 degrees during the bottleneck, back on its mark and level from mapping onward, and warmed by the gold output light at payoff. It is never mentioned in copy. It does not need to be.

## A.5 The pile: morph targets, not shader displacement

The concept doc's `onBeforeCompile` displacement is deleted. Displacing along the normal without recomputing normals lights flat under clearcoat, and it was the only unpredictable geometry in the build.

Build both states on the CPU at construction:

```
const base = new IcosahedronGeometry(1.0, 3).toNonIndexed()   // smooth, r 1.0
const lumpy = base.clone()
// displace: for each vertex v, v += normalize(v) * 0.22 * fbm3(v * 1.8)
// fbm3 = 3 octaves of a small hand-written value-noise, seeded 1337, module scope
lumpy.computeVertexNormals()

base.morphAttributes.position = [ deltaPositionAttribute(lumpy, base) ]
base.morphAttributes.normal   = [ deltaNormalAttribute(lumpy, base) ]
pileMat.morphTargets = true   // implicit in r0.184, set flatShading false explicitly
```

`pile.morphTargetInfluences[0] = uLump`, animated 1.0 (lumpy backlog) to 0.12 (resolved mass). Correct normals in both end states and every state between, at zero per-frame cost. Both geometries are disposed on unmount.

A second, separate deformation on the pile: `uSquash`, applied as a non-uniform scale on the pile mesh, `scale.set(sx, sy, sx)` where the volume is preserved by `sx = 1 / sqrt(sy)`. In the bottleneck `sy = 0.72`, so the boulder visibly flattens where it presses on the funnel mouth. This is the soft-body cue every judge asked for.

## A.6 The five chapters, exact keyframes

All positions are local to the `rig` group. Rotations are Euler degrees, converted at build time to `Quaternion` keys and slerped. Scales are uniform unless three components are given.

### Chapter 0: hero. "One machine, cold, and something is on its way in."

```
deck          p(1.15, -1.52, 0)      r(0,0,0)        s1
contactShadow p(1.15, -1.74, 0)      s1.05           opacity 0.42
belt          p(1.20, -1.02, 0)      r(0,0,0)        beltTop emissive 0, map frozen
rollers       p(-1.20,-1.02,0) / p(3.60,-1.02,0)     not spinning
body          p(-1.75, 0.32, 0)      r(0,0,0)        s1
window        p(-1.75, 0.45, 1.04)   r(0,0,0)        emissiveIntensity 0
hopper        p(-1.75, 1.95, 0)      r(0,0,0)        s1
hopperRing    p(-1.75, 2.56, 0)      r(-90,0,0)      s1        (no idle yaw)
lever         p(1.55, -1.295, 0.92)  r(0,0,8)
leverPad      p(1.55, -1.245, 0.92)
cup           p(2.20, -1.085, 1.02)  r(0,12,0)
tray          p(4.75, -1.10, 0)
blocks        scale 0
pile          p(-2.95, 3.30, -0.35)  s0.62   uLump 1.0  uSquash 1.0
planLine      opacity 0, drawRange 0
RIG           r(0,-18,0)  p(0,0,0)  s1.00
CAMERA        pos(2.60, 1.55, 12.10)  lookAt(0.75, 0.10, 0)  fov 34
```
Idle: the whole rig breathes as one, `rig.rotation.y += sin(elapsed * 0.09) * 0.0024 rad` and `rig.position.y += sin(elapsed * 0.22) * 0.035`. **No per-part bobbing.** Per-part phases are what turned the last build into suspended debris.

Viewer understands: that is one machine, it is switched off, and a lump of something is coming.

### Chapter 1: bottleneck. "It jams."

```
deck          p(1.15, -1.52, 0)      r(0,0,-1)
contactShadow p(1.15, -1.74, 0)      s1.00           opacity 0.58
belt          p(1.20, -1.10, 0)      r(0,0,-4)       sagging, beltTop emissive 0
rollers       p(-1.20,-1.06,0) / p(3.60,-1.14,0)     stationary
body          p(-1.75, 0.16, 0)      r(0,0,-2.5)     pressed 0.16 below home
window        p(-1.75, 0.29, 0.99)   r(0,0,-2.5)     emissiveIntensity 0
hopper        p(-1.75, 1.78, 0)      r(0,0,-2.5)     s(1.06, 0.86, 1.06)
hopperRing    p(-1.75, 2.34, 0)      r(-90,0,7)      knocked off level
lever         p(1.55, -1.295, 0.92)  r(0,0,-48)      slumped, nobody is holding it
cup           p(2.55, -1.085, 1.22)  r(0,26,9)       shoved toward the deck edge
tray          p(4.75, -1.10, 0)      empty
blocks        scale 0
pile          p(-1.75, 2.86, 0)      s1.35   uLump 1.0  uSquash sy 0.72
planLine      opacity 0
RIG           r(0,-26,0)  p(0,-0.06,0)  s1.00
CAMERA        pos(-0.35, 2.85, 8.10)  lookAt(-1.65, 1.30, 0)  fov 34
```
The pile at s1.35 overhangs a 2.50-wide funnel mouth it cannot fit through, and flattens against it. The whole content of the frame is one chain of compression: pile presses funnel, funnel presses body, body presses belt, belt sags. Belt and tray fall out of the bottom of the frame, which itself says nothing is moving down there.

### Chapter 2: mapping. "The route gets drawn through the machine."

```
deck          p(1.15, -1.52, 0)      r(0,0,0)
contactShadow p(1.15, -1.74, 0)      s1.02           opacity 0.46
belt          p(1.20, -1.02, 0)      r(0,0,0)        beltTop emissive 0.10
rollers       home                                    stationary
body          p(-1.75, 0.32, 0)      r(0,0,0)        the reference, does not move
window        p(-1.75, 0.45, 1.04)   emissiveIntensity 0.25  (waking)
hopper        p(-1.75, 2.50, 0)      r(0,0,0)        LIFTED +0.55, the only lift on the object
hopperRing    p(-1.75, 3.11, 0)      r(-90,0,0)      rides with the hopper, level
lever         p(1.55, -1.295, 0.92)  r(0,0,8)        back at rest
cup           p(2.20, -1.085, 1.02)  r(0,12,0)       back on its mark
tray          p(4.75, -0.82, 0)      LIFTED +0.28
blocks        scale 0
pile          p(-1.75, 3.62, 0)      s0.90   uLump 1.0 -> 0.15 across this leg   uSquash 1.0
planLine      drawRange 0 -> full, opacity 0 -> 0.85
RIG           r(0,-8,0)  r.x(+6)  p(0,0,0)  s0.94
CAMERA        pos(1.05, 3.25, 11.30)  lookAt(0.90, -0.20, 0)  fov 34
```
Two parts lift and the rest of the machine holds together. That is the difference from chapter 0 and it is a shape difference, not a caption: the funnel floats above an intact body with a gold line running from its mouth, down through the machine, over the human station, and into the raised tray. The boulder visibly smooths from lumpy to clean as the route is drawn.

### Chapter 3: machine. "It runs, and one gold handle is still yours."

```
deck          p(1.15, -1.52, 0)
contactShadow p(1.15, -1.74, 0)      s1.00           opacity 0.55
belt          p(1.20, -1.02, 0)      beltTop map.offset.x scrolling, emissiveIntensity 0.35
rollers       home, spinning at beltSpeed / r = 1.40 / 0.30 = 4.67 rad/s
body          p(-1.75, 0.32, 0)      r(0,0,0)
window        p(-1.75, 0.45, 1.04)   emissiveIntensity 1.10
hopper        p(-1.75, 1.95, 0)
hopperRing    p(-1.75, 2.56, 0)      r(-90,0,0)
lever         p(1.55, -1.295, 0.92)  rocking -8 to +14 deg at 0.55 Hz, eased sine
cup           p(2.20, -1.085, 1.02)  r(0,12,0)       still, level
tray          p(4.75, -1.10, 0)
pile          p(-1.75, 2.62, 0)      scale 0.90 -> 0.0 across coord 2.60 to 3.50,
                                     sinking 0.50 into the funnel with a
                                     1.10 / 0.82 / 1.10 squash as it enters
blocks        four instances on the travel loop, see A.7
planLine      opacity 0.85 -> 0 over the first 35 percent of this leg
RIG           r(0,-14,0)  p(0,0,0)  s1.00
CAMERA        pos(1.50, 0.80, 10.30)  lookAt(1.35, -0.18, 0)  fov 34
```
Camera is nearly at belt height so the travelling blocks cross the frame horizontally. The motion is unmissable and it is left to right, the direction the whole silhouette already implies.

### Chapter 4: payoff. "Nobody is standing over it, and the intake is empty."

```
deck          p(1.15, -1.52, 0)
contactShadow p(1.15, -1.74, 0)      s0.95           opacity 0.60   (tighter and darker)
belt          beltTop scroll at 45 percent, emissiveIntensity 0.18
rollers       spinning at 45 percent: idle = 1 - 0.55 * smoothstep(coord, 3.5, 4.0)
body          p(-1.75, 0.32, 0)
window        emissiveIntensity 0.55  (calm, not eager)
hopper        p(-1.75, 1.95, 0)      mouth EMPTY and deliberately in frame
hopperRing    p(-1.75, 2.56, 0)
lever         r(0,0,6), still, no rocking
cup           p(2.20, -1.085, 1.02)  r(0,-6,0)       walked back, turned slightly to camera
tray          p(4.75, -1.10, 0)
pile          scale 0
blocks        all four parked at p(4.75, -0.74 + i*0.28, 0), yaw alternating +3 / -3 deg,
              instanceColor lerped 35 percent toward 0xefd49b
planLine      opacity 0
RIG           r(0,-22,0)  p(0, +0.15, 0)  s0.92, breathing +/- 0.14 deg at 0.09 Hz
CAMERA        pos(3.70, 1.85, 13.60)  lookAt(1.85, -0.10, 0)  fov 34
```
The last frame proves the claim twice: **presence** (four finished slabs stacked and warm) and **absence** (the funnel mouth is empty, the backlog is gone). Both are in frame, which is why the camera pulls back to 13.60 rather than closing on the tray.

## A.7 Block travel, with a monotonicity proof

Four instances. Phase is the only time-driven quantity: `phase_i = wrap01(elapsed * 0.30 + i * 0.25)`.

Position along the belt comes from a **precomputed arc-length table**, built once at construction, never re-derived per frame:

```
speed(x) = 1.40 * (1 - 0.65 * exp(-((x - 1.55) / 0.55) ** 2))
```

`x` runs from the body exit at -0.25 to the tray at 4.75. Build a 128-entry cumulative-time table by integrating `dt = dx / speed(x)`, normalise to [0,1], and store `x` as a function of phase. Then `x = sampleTable(phase)` is a pure lookup.

**Proof it cannot reverse:** `speed(x) >= 1.40 * (1 - 0.65) = 0.49 > 0` for all x, because `exp(-t^2) <= 1`. The cumulative-time integral is therefore strictly increasing, so its inverse is strictly increasing, so `x(phase)` is strictly monotonic. A block can never visibly stutter backwards against a belt scrolling forwards. The minimum speed of 0.49 against the belt's 1.40 means at the human station a block travels at 35 percent of belt speed, which reads as a person considering something rather than a dropped frame.

Envelope per block:
- scale 0 to 1 over phase 0.00 to 0.08, spawning at p(-0.25, -0.66, 0).
- y holds at -0.66 (riding the belt top at -0.80 plus half the block height 0.13, plus 0.01 clearance) until phase 0.94.
- over phase 0.94 to 1.00 it drops 0.20 into the tray and lands with a 1.06 / 0.88 / 1.06 squash decaying over 180ms of its own phase.
- scale returns to 0 at phase 1.00 as it wraps. **Blocks appear and disappear by scale only, never by opacity.**

Gate: the first block only spawns once `coord > 2.85`, so nothing is produced before the machine has closed and lit. Below that coordinate all four instance matrices are zero-scaled.

## A.8 Transitions, staggers and overlaps

**Driver, unchanged from the shipped `story-scene.tsx`:** `CHAPTERS = 4`, `DWELL = 0.52`, `TOTAL_UNITS = 4.52`, `chapterCoord(p)` with a cubic `easeInOut` applied to the 0.48 of each unit that travels, then `coord = MathUtils.damp(coord, target, 9, dt)`. `k = Math.min(floor(coord), CHAPTERS - 1)`, `f = coord - k`.

Interpolation: `Vector3.lerpVectors` for position and scale, `Quaternion.slerp` for rotation from per-chapter Euler keys. Every scratch `Vector3`, `Quaternion`, `Euler`, `Matrix4` and `Color` lives at module or closure scope. **Zero allocations inside the frame loop.**

**Per-part stagger.** Do not move all sixteen parts on one curve. Each part gets `s_i` and is driven by:

```
f_i = easeOutCubic(clamp01((f - s_i) / (1 - s_i)))
```

| part | s_i | | part | s_i |
|---|---|---|---|---|
| deck | 0.00 | | hopper | 0.15 |
| pile | 0.00 | | hopperRing | 0.17 |
| belt, beltTop | 0.03 | | lever, leverPad | 0.19 |
| rollers | 0.06 | | cup | 0.21 |
| body | 0.09 | | blocks | 0.22 |
| window | 0.11 | | contactShadow | 0.02 |
| tray | 0.13 | | | |

The spine (deck, belt, body) leads; decoration trails. The eye always follows the largest mass and never loses the object mid-move.

**What stays anchored.** `deck` never leaves p(1.15, -1.5x, 0) and never rotates more than 1 degree. `body` never leaves the middle third of the frame. `belt` stays within 0.42 units of its home height. Because those three hold, every other move reads as a part moving relative to a machine rather than a scene reshuffling.

**Overlaps, leg by leg.**

- **Hero to bottleneck.** The pile moves first (starts at f 0.00, lands at f 0.62). The machine only begins compressing at f 0.35. Cause visibly precedes effect. The cup slides to the deck edge over f 0.40 to 0.85, last of all, which is what sells the impact as a shove.
- **Bottleneck to mapping.** The `DWELL` hold lets the squash sit for half a beat before anything releases. Then the pile lifts off (f 0.00 to 0.40) while `planLine` draws (`drawRange` from f 0.15 to f 0.90) so the route is on screen before the hopper finishes rising. `uLump` runs 1.0 to 0.15 over f 0.30 to 0.85. `uSquash` releases over f 0.00 to 0.25.
- **Mapping to machine.** `planLine` fades over f 0.00 to 0.35 while hopper and tray descend over f 0.10 to 0.75. Window emissive and the periwinkle point light ramp on `smoothstep(coord, 2.55, 2.95)` so the machine lights up exactly as the last part seats.
- **Machine to payoff.** Nothing travels except the camera and the rig scale. The belt eases to 45 percent, the lever settles from rocking to a fixed +6 deg over f 0.00 to 0.45, the cup rotates back over f 0.20 to 0.70, and the gold point light fades in over `smoothstep(coord, 3.40, 3.90)`.

**Rules.**
- Never cross-fade opacity on a primary form. Forms always travel physically.
- Only `planLine`, the window emissive, the belt emissive and the two accent lights change intensity.
- Continuous rotation is allowed on exactly one thing, the rollers, and only while `running > 0`.

## A.9 Lighting rig

Six lights. No more, no fewer.

1. `HemisphereLight(0xbcd0ff, 0x0a0d14, 0.50)`. Fills undersides so nothing goes to pure black against the dark page.
2. **Key.** `DirectionalLight(0xfff6e6, 2.40)` at (-5.0, 7.0, 6.5), target at (0.20, 0.10, 0). `castShadow`, `mapSize 1024`, camera left -6 right 6 top 4.5 bottom -3, near 1 far 22, `bias -0.0006`, `normalBias 0.02`, `radius 3`.
3. **Fill.** `DirectionalLight(0x8ea6ff, 0.65)` at (6.5, -1.5, 4.5). Keeps the shadow side blue rather than grey.
4. **Rim.** `DirectionalLight(0xe3bd6c, 1.80)` at (5.5, 3.0, -6.5). Gold edge from behind. This separates the bone forms from the dark page and does most of the brand work.
5. **Screen practical.** `PointLight(0x7ea2ff, 0, 6, 2)` at (-1.75, 0.45, 1.60). Intensity `3.20 * smoothstep(coord, 2.55, 2.95)`, settling to 1.60 on payoff.
6. **Output practical.** `PointLight(0xe3bd6c, 0, 5, 2)` at (4.75, -0.45, 0.90). Intensity `1.60 * smoothstep(coord, 3.40, 3.90)`. The last frame is the warmest frame in the story.

Shadow casters: `body`, `hopper`, `lever`, `cup`, `pile`, `blocks`. Shadow receivers: `deck`, `tray`. Nothing else.

`shadowsOn = !isMobile && (navigator.hardwareConcurrency ?? 8) > 4 && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096`. When false, skip the real shadow entirely and add 0.15 to the `contactShadow` opacity in every chapter.

`shadowMap.needsUpdate = true` only on frames where `|coord - lastShadowCoord| > 0.004`. The map is therefore static through the `DWELL` holds and through pure idle.

## A.10 Camera

`PerspectiveCamera(34, aspect, 0.1, 200)`. **fov never animates.**

Position keys, sampled from a `CatmullRomCurve3` with `curveType "catmullrom"`, `tension 0.5`:

```
(2.60, 1.55, 12.10)   (-0.35, 2.85, 8.10)   (1.05, 3.25, 11.30)
(1.50, 0.80, 10.30)   (3.70, 1.85, 13.60)
```

LookAt targets, interpolated **linearly** on the same coordinate (a curve through the targets overshoots behind the object and flips the view):

```
(0.75, 0.10, 0)   (-1.65, 1.30, 0)   (0.90, -0.20, 0)
(1.35, -0.18, 0)  (1.85, -0.10, 0)
```

**Camera lag.** Sample the curve at `camCoord = max(0, coord - 0.06)`, not at `coord`. The form starts changing before the camera commits, which reads as an operator reacting to the subject instead of a rig on rails. One line, large payoff.

The arc in plain terms: start wide and slightly right, sweep left and rise steeply into the jammed funnel, lift higher and swing back to centre to read the plan from above, drop low and push in to belt height for the running shot, pull back and around to the right for the finished stack. One continuous move, never a cut.

**Breathing.** After sampling, always add `sin(elapsed * 0.32) * 0.06` to `camera.position.y` and `sin(elapsed * 0.21) * 0.08` to `camera.position.z`, including during `DWELL` holds, so a paused scroll never looks frozen.

**Pointer parallax.** `pointer: fine` only. `targetPX / targetPY` damped at 4/s, applied as an orbit offset around the current lookAt target, max 0.55 in x and 0.30 in y. Never on touch.

**Viewport framing.**

```
aspectFit = clamp(1.75 / aspect, 1, 1.45)
```
Push the sampled position away from its lookAt target along the view vector by `aspectFit`.
- viewport height < 820 CSS px: subtract 0.35 from every `lookAt.y` so the object clears the chapter cards.
- viewport width < 768: `rig.rotation.y = chapterYaw - 8 deg`, `rig.scale *= 0.88`, camera z multiplied by a further **1.28**, and by **1.12** on top of that when `aspect < 0.75`. `lookAt.y` raised by 0.55 rather than lowered. Pointer parallax off.

**Dev-time framing guard** (stripped by `process.env.NODE_ENV !== "production"`): at each of the five camera keys, project the bounding spheres of `body` and `tray` into NDC and assert both sit inside the middle 78 percent of the frame. Run it once on mount at the current viewport. It costs nothing at runtime and it is the only thing that prevents the classic ship-blocker of the object cropping on a 13 inch laptop or a 390px portrait.

## A.11 Scroll wiring: what drives what

**The 3D scene does not use GSAP ScrollTrigger.** This is a deliberate decision, not an omission.

Lenis (`smooth-scroll.tsx`, `autoRaf: true, lerp: 0.115`) already smooths the wheel while keeping native scroll position. Stacking `ScrollTrigger` `scrub` on top of Lenis and then `MathUtils.damp(coord, target, 9, dt)` on top of that is three smoothing passes in series: the scene would lag the scrollbar by several hundred milliseconds and feel like mush. `ScrollTrigger` also cannot express the `DWELL` hold cleanly without a stepped ease.

The wiring that ships, unchanged from what works today:

```
window.addEventListener("scroll", readScroll, { passive: true })
// readScroll: rect = stage.getBoundingClientRect()
//             travel = rect.height - sticky.offsetHeight
//             rawProgress = clamp01(-rect.top / travel)
```

Sticky pin comes from CSS (`.st-stage.is-live { height: 640vh }` plus `.st-sticky { position: sticky; top: 0; height: 100dvh }`), not from a JS pin. A CSS sticky pin cannot desync from Lenis, cannot leave a scroll-jacked gap on resize, and needs no `scrollerProxy`.

**Where GSAP ScrollTrigger IS used, and nowhere else:** two non-pinning, fully reversible scrubs on the page, both defined in `src/components/marketing/scroll-fx.ts` (new file):

1. `nav-progress`: scrubs a 1px gold hairline across the bottom of `.mk-nav` from `scaleX(0)` to `scaleX(1)` over document scroll. `scrub: 0.4`.
2. `approach-draw`: scrubs the `stroke-dashoffset` of the gold pipeline SVG in `approach-pipeline.tsx` from full to zero as that section crosses the viewport. `scrub: 0.6`, `start: "top 75%"`, `end: "bottom 65%"`.

Neither pins. Neither mutates the scene graph. Both are killed on unmount with `ScrollTrigger.getAll().forEach(t => t.kill())` scoped by id.

## A.12 Reduced motion, no WebGL, no JS

- `matchMedia("(prefers-reduced-motion: reduce)")` matches: **never add `.is-live`.** The sticky pin is off, the five chapters lay out as ordinary stacked DOM sections with their real text. Build the scene once, set `coord = 3.0` exactly (the machine chapter, the most legible and most positive state), disable belt scroll, roller spin, lever rocking, block travel, camera breathing, rig breathing and pointer parallax, force `shadowMap.needsUpdate = true`, render **exactly one frame**, then stop and never request another. The canvas becomes a still image of the running machine, with all four blocks placed at fixed phases 0.15, 0.40, 0.65, 0.90.
- WebGL2 unavailable but WebGL1 present: same single-frame path, transmission forced to 0.
- WebGL unavailable at all: canvas stays `display: none` (already the CSS default outside `.is-live`), panels stack.
- No JS: `<noscript>` style already forces `.rv { opacity: 1 }`. Panels render as real DOM. Nothing is lost but the theatre.

## A.13 Frame loop and render-on-demand

```
dt = min((now - last) / 1000, 0.05)      // a returning tab must not jump
```

Render only when at least one of these is true:
- `|coord - target| > 0.0004` (the damp is still settling),
- scroll input arrived within the last 400ms,
- an always-on animation is actually running: `running > 0` (rollers, belt, blocks), or the rig or camera breathing is active.

In practice during a hero dwell with no scroll input the loop still renders because camera breathing is always on. That is intentional and it is the cheapest possible always-on frame (no shadow update, no matrix churn beyond the camera). During reduced motion nothing renders after frame one.

`IntersectionObserver` on the stage: `cancelAnimationFrame` when it leaves the viewport, restart on entry. `document.visibilitychange` to hidden also stops the loop.

## A.14 Teardown

On unmount, in this order:
1. `cancelAnimationFrame`
2. `io.disconnect()`, `ro.disconnect()`
3. remove `scroll`, `pointermove`, `visibilitychange` listeners
4. `scene.traverse` disposing every geometry (including the morph source `lumpy`), material, texture
5. dispose the two canvases (`beltCanvas.width = beltCanvas.height = 0`, same for the shadow gradient canvas)
6. dispose the PMREM render target
7. `renderer.dispose()` then `renderer.forceContextLoss()` inside a `try/catch`

## A.15 Performance targets

60fps on an M1 MacBook Air at 1440x900 DPR 2. At least 45fps on a 2021 midrange Android at DPR 1.5. First frame under 120ms after mount on a warm cache; PMREM generation at 256 is the only real cost, roughly 25ms.

---

# B. THE PAGE

## B.0 The disease and the cure

Today every section below the hero is the same object:

```
<section className="mk-section" id="x">
  <div className="mk-container">
    <Reveal><div className="mk-section-head"><h2/><p className="mk-lede"/></div></Reveal>
    <Reveal delay={0.08}><Component/></Reveal>
  </div>
</section>
```

Eleven times. Same container width, same padding, same head block, same 18px fade-up at 0.8s with a 0.08s delay. That repetition, not any individual choice, is what makes the page read as generated. Nine of the eleven `mk-section-head` blocks are deleted below. Every remaining section opens differently.

Three structural devices carry the page, all lifted from the Vertex forensics and re-tinted for dark gold:

**1. The double-rail frame.** New wrapper inside `.mkt`:

```html
<div class="mk-frame">          <!-- width min(100% - 2rem, 74rem), margin-inline auto -->
  <div class="mk-frame__rail">  <!-- border-inline 1px solid var(--mk-rail) -->
    <div class="mk-frame__rail mk-frame__rail--inner"> <!-- margin-inline 0.5rem, same border -->
      ... every section ...
```
Two hairlines per side, 8px apart. Every section is visibly inside a measured frame. The nav sits at `max-width: 68rem`, deliberately narrower than the rails, so it reads as inset rather than misaligned.

**2. Hatched spacer strips.** A real element between sections, seven of them:

```html
<div class="mk-rule" aria-hidden="true"></div>
```
```css
.mk-rule {
  height: 2.5rem;
  border-block: 1px dashed var(--mk-rail);
  background-image: repeating-linear-gradient(
    315deg, rgba(255,255,255,0.045) 0 1px, transparent 0 50%);
  background-size: 10px 10px;
}
@media (min-width: 768px) { .mk-rule { height: 3rem; } }
```
This decouples separation from padding, which is what lets section heights vary wildly without the page feeling arrhythmic.

**3. Crosshair corner marks.** At the four corners of every major grid block:

```css
.mk-mark {
  position: absolute; width: 12px; height: 12px;
  -webkit-mask-image: radial-gradient(circle, #000 15%, transparent 100%);
          mask-image: radial-gradient(circle, #000 15%, transparent 100%);
  translate: calc(-50% - 0.5px) calc(-50% - 0.5px);
}
.mk-mark::before, .mk-mark::after {
  content: ""; position: absolute; inset: 0; margin: auto;
  background: var(--mk-mark);
}
.mk-mark::before { height: 1px; }
.mk-mark::after  { width: 1px; }
.mk-mark--tr { translate: calc(50% + 0.5px) calc(-50% - 0.5px); }
.mk-mark--bl { translate: calc(-50% - 0.5px) calc(50% + 0.5px); }
.mk-mark--br { translate: calc(50% + 0.5px) calc(50% + 0.5px); }
```
The `+0.5px` is the entire point: it lands the cross exactly on the hairline. Nobody generating a template adds registration marks.

**Section height variance is a requirement, not an accident.** Target rendered heights at 1440px: story 640vh, who 420px, workflows 1180px, approach 1520px, audit 760px, roi 880px, why 1240px, trust 940px, faq 700px, cta 480px. Nothing is a uniform 700px band.

**Uppercase is deleted from marketing chrome.** `.mk-eyebrow` (11px, 650, 0.1em, uppercase, gold) is removed from five sections. Uppercase survives in exactly one register: 11px mono data labels inside product-panel chrome. Marketing voice never shouts; product chrome does.

---

## Section 1: Fixed backdrop (`site-atmosphere.tsx`)

**Changes: none.** The live four-layer shader (Swirl #0b1018/#132419 + ChromaFlow base #0a0d14 dir #c9a66b + FlutedGlass + FilmGrain 0.05, opacity 0.85) stays exactly as it is. Everything else on the page composites on top of it. `hero-shader.tsx` stays unused and is not imported anywhere.

One addition only, in `marketing.css`: the frame rails must be legible against it, so `--mk-rail` is defined at `rgba(227, 189, 108, 0.16)` and not at a white alpha. A gold hairline over a gold-tinted shader stays coherent; a white one reads as a foreign grid.

---

## Section 2: Nav (`site-nav.tsx`)

**Skeleton.**
```html
<header class="mk-nav">
  <nav class="mk-nav__inner">          <!-- max-width 68rem, height 64px -->
    <a class="mk-nav__brand"><AgoraLogo size={104}/></a>
    <ul class="mk-nav__links">…4 links…</ul>
    <div class="mk-nav__end">
      <a class="mk-nav__lang">NL</a>
      <a class="mk-btn mk-btn--sm mk-btn--paper">Plan een gesprek</a>
    </div>
  </nav>
  <span class="mk-nav__progress" aria-hidden="true"></span>
</header>
```

**Breaks the column:** `max-width: 68rem` against the page frame's 74rem, so the nav sits visibly *inside* the rails. Deliberate inset, and it is the first signal on the page that somebody measured something.

**Surface:** `background: rgba(10, 13, 20, 0.72)`, `backdrop-filter: blur(20px) saturate(160%)`, `border-bottom: 1px solid rgba(255,255,255,0.06)`. Note the border is weaker than every other hairline on the page (`--mk-line` is 0.10), so the header recedes. Links are `--mk-text-mut` and only go `--mk-text-hi` on hover, 150ms.

**Motion:** the `mk-nav__progress` hairline, 1px, `background: var(--mk-accent)`, `transform-origin: left`, `scaleX` scrubbed by the ScrollTrigger from A.11. That is the only nav motion. No hide-on-scroll-down. No shrink-on-scroll.

**Changes from today:** add the progress hairline; drop nav width from full container to 68rem; weaken the bottom border from 0.10 to 0.06.

---

## Section 3: StoryScene (hero + 4 chapters)

**Skeleton:** unchanged shell, new 3D. `story-scene.tsx` keeps `.st-stage`, `.is-live`, `.st-sticky`, `.st-canvas`, the hero panel, the four chapter panels, the `IntersectionObserver` and `story-scene.css`. Only the builder is swapped: `import { buildMachine } from "./story-machine"`.

**Breaks the column:** it is the only full-bleed section on the page. `.st-stage` sits *outside* `mk-frame__rail`, edge to edge, at 640vh. The rails resume below it. That single escape is what makes the frame read as intentional rather than as a box everything happens to be in.

**Hero panel composition,** in the copy block only (the machine owns the rest of the frame):
```
pill badge (one only, on the whole page)
  ↓ 20px
h1, serif, clamp(2.6rem, 6vw, 4.2rem), line-height 1.0, letter-spacing -1.5px, max 18ch per line
  ↓ 20px
lede, 18px/1.56, max-width 34rem (about 75ch)
  ↓ 32px
two buttons, 40px tall, gold primary + glass ghost
  ↓ 20px
note, 13px, --mk-text-faint
```
The pill: `rounded-full`, `border 1px solid var(--mk-line)`, `background rgba(255,255,255,0.05)`, `padding: 4px 12px 4px 8px` (asymmetric, a 12px gold dot sits left), 12px/500, `--mk-text-mut`, **sentence case**. This is the only eyebrow on the entire page.

**Surface:** chapter cards keep the canonical glass exactly as in `story-scene.css`. One change: the card gets a `.mk-mark` at each corner in `--mk-mark` at 0.30 alpha, so the cards read as measured plates rather than floating blobs.

**Motion:** the scene is the signature moment (see D). Panels fade on the bell curve already implemented in `setPanel`. No `Reveal` anywhere inside this section.

**Changes from today:** builder swapped; hero h1 copy changed; chapter copy changed (see B.14); corner marks added; the pill badge replaces `st-hero__badge` styling with the sentence-case recipe above.

---

## Section 4: Who it's for

**Today:** `mk-section > mk-container > Reveal(head) > Reveal(WhoFor)`. Kill it.

**New skeleton.** The shortest section on the page, roughly 420px, and the only one that is a single horizontal band:

```html
<section class="mk-band" id="who">
  <p class="mk-band__lead">Built for the people who are the bottleneck.</p>
  <ul class="mk-band__grid">   <!-- grid-template-columns: repeat(5, 1fr) -->
    <li><span class="mk-band__n">01</span><h3>Consultants</h3><p>…</p></li>
    …5 cells…
  </ul>
</section>
```

**Breaks the column:** no `h2`, no `mk-section-head`, no lede. It opens with a single 24px sentence sitting on a left hairline (`border-left: 1px solid var(--mk-accent); padding-left: 16px`) and then a five-across lattice where the **container paints the dividers**, not the children:

```css
.mk-band__grid {
  display: grid; grid-template-columns: repeat(5, 1fr);
  border: 1px solid var(--mk-line);
}
.mk-band__grid > li { padding: 22px 18px 26px; }
.mk-band__grid > li:not(:first-child) { border-left: 1px solid var(--mk-line); }
@media (max-width: 900px) { .mk-band__grid { grid-template-columns: repeat(2, 1fr); }
  .mk-band__grid > li:nth-child(odd) { border-left: none; }
  .mk-band__grid > li:nth-child(n+3) { border-top: 1px solid var(--mk-line); } }
```
Cells butt directly against each other on single shared hairlines. No card gaps, no double borders, no shadows.

**Surface:** flat. Zero glass in this section. It is the one place on the page where nothing is elevated, which is what makes the glass elsewhere mean something. Cell hover: `background: rgba(255,255,255,0.04)`, 150ms, nothing else.

**Motion:** none on the grid. The lead sentence only: `clip-path` wipe from `inset(0 100% 0 0)` to `inset(0 0 0 0)` over 520ms `--mk-ease` on first intersection. No fade-up.

**Changes:** delete `who-for.css` card treatment; delete the `mk-section-head`; delete both `Reveal` wrappers; number the cells 01 to 05 in Space Grotesk 600, 12px, `--mk-text-faint`.

---

## Section 5: Workflows (5 tabs) — the product panel

This is the largest structural change on the page and the highest-leverage steal from Vertex.

**Today:** five tabs whose panels are text and bullets.
**New:** five tabs whose panels are **one large fake application window** showing a workflow run. One panel visible at a time. Everything premium happens inside that single frame.

**Skeleton.**
```html
<section class="mk-runs" id="workflows">
  <div class="mk-runs__head">           <!-- grid: 7fr / 5fr, aligned to baseline -->
    <h2 class="mk-h2">Five workflows we build most often.</h2>
    <p class="mk-lede">…</p>
  </div>
  <div class="mk-runs__tabs" role="tablist">…5 chips…</div>
  <article class="mk-run" role="tabpanel">
    <header class="mk-run__bar">        <!-- 44px -->
      <span class="mk-run__dot"></span> <!-- 8px, rotate 45deg, rounded 2px, var(--mk-ok) -->
      <span class="mk-run__name">Lead intake → CRM</span>
      <span class="mk-run__sep">·</span>
      <span class="mk-run__meta">running · 6 steps</span>
    </header>
    <div class="mk-run__body">          <!-- grid-template-columns: 300px 1fr;
                                             grid-template-rows: auto 1fr -->
      <div class="mk-run__steps">…6 step rows…</div>
      <dl class="mk-run__kv">…5 rows, grid-template-columns: 108px 1fr, each h 32px…</dl>
      <div class="mk-run__bento">       <!-- grid-template-columns: 176fr 176fr 218fr;
                                             grid-template-rows: 120px 120px; gap: 7px -->
        <div class="mk-run__tile mk-run__tile--ai">Summary</div>  <!-- col-span 2 -->
        <div class="mk-run__tile">Trigger</div>
        <div class="mk-run__tile">Next run</div>
        <div class="mk-run__tile">Connection</div>
        <div class="mk-run__tile">Current step</div>
      </div>
    </div>
  </article>
</section>
```

**Breaks the column:** the head is a 7fr/5fr split with the lede baseline-aligned to the bottom of the h2, and the panel then runs wider than the head, edge to edge inside the rails. The section breaks its own column, which is exactly the Vertex hero move.

**Surface, with border alpha decaying by depth:**
- shell: `border: 1px solid rgba(255,255,255,0.15)`, `border-radius: 16px`, `background: var(--mk-glass-grad), rgba(255,255,255,0.055)`, `backdrop-filter: blur(40px) saturate(180%)`, `box-shadow: var(--mk-glass-inset), 0 4px 6px -1px rgba(0,0,0,0.40), 0 2px 4px -2px rgba(0,0,0,0.30)`
- titlebar and internal tiles: `rgba(255,255,255,0.10)`
- exactly **one** tile carries a tint, the AI Summary tile: `linear-gradient(55deg, rgba(126,162,255,0.10) 0%, rgba(126,162,255,0.03) 35%, transparent 70%)`. No badge, no border colour change. The tint alone marks it.
- 16px radius is used here and on the story cards and nowhere else on the page. Buttons 8px, chips 10px, tiles 12px. The largest radius is the rarest.

**Field-type-specific rendering, which is what makes fake UI stop looking fake:**
- a step name renders as plain text at 14px/500
- a duration renders in `--mk-mono` at 12px, `--mk-text-faint`, `font-variant-numeric: tabular-nums`
- a connected tool renders as a 16px `border-radius: 5px` swatch in `rgba(52,217,123,0.14)` plus its name with a `border-bottom: 1px solid var(--mk-line)`
- a webhook or cron value renders as a bordered mono pill: `border: 1px solid rgba(126,162,255,0.35)`, `color: var(--mk-ai)`, `padding: 1px 6px`, `border-radius: 6px`
- the human step renders with a gold left rule, `border-left: 2px solid var(--mk-accent)`, and the label "you approve" in 11px uppercase mono

Different data types must look different. This is the only place uppercase survives on the page.

**Step list paper-stack illusion**, under the last visible step:
```html
<div class="mk-run__stack" aria-hidden="true">
  <i style="inset: auto 20px -4px 20px; height: 34px"></i>
  <i style="inset: auto 12px -2px 12px; height: 34px; background: rgba(255,255,255,0.04)"></i>
</div>
```
Two decoy divs behind the real row so the list looks like it continues beneath. Steps are separated by a 13px vertical tick (`margin-left: 9.5px; width: 1px; height: 13px; background: var(--mk-line); border-radius: 999px`), a timeline connector, not a divider.

**Motion:** the tab swap is a **rotating queue, not a crossfade and not a slide.** All five panels exist; the head of the array is `position: relative` and in flow, the rest are `position: absolute; inset-inline: 0` and parked. On tab change the array rotates. Each panel carries `transform-origin: center top` so the enter reads as a card being dealt onto a stack. Enter: `opacity 0 → 1` over 200ms plus `scale(0.985) → 1` and `translateY(-6px) → 0` over 320ms `--mk-ease`. Exit: opacity only, 160ms. Nothing else in the section animates.

**Changes:** `workflow-tabs.tsx` rewritten around the panel; `mk-tabs` chip styles reworked to `h-8, border-radius: 10px, ring-inset`; the five copy entries extended with `steps[]`, `kv[]` and `bento[]` shapes in `copy.ts` (EN and NL).

---

## Section 6: Approach (5-step pipeline)

**Today:** head, then `ApproachPipeline`, then five `mk-approach__row` blocks each in its own `Reveal` with `delay = i * 0.04`. That cascade is the single most template-looking motion on the page.

**New skeleton.** The tallest section (about 1520px), and the only one with a **sticky rail**:

```html
<section class="mk-approach" id="approach">
  <div class="mk-approach__grid">    <!-- grid-template-columns: 2fr 3fr, gap 4rem -->
    <div class="mk-approach__rail">  <!-- position: sticky; top: 96px; height: fit-content -->
      <h2 class="mk-h2">How we work.</h2>
      <ol class="mk-approach__nav">  <!-- 5 items, 2px left border transparent → gold -->
        <li><span>01</span> Audit</li> …
      </ol>
      <svg class="mk-approach__pipe">…the gold path…</svg>
    </div>
    <div class="mk-approach__body">  <!-- 5 blocks, each min-height 260px -->
      <article><h3/><p/><ul class="mk-approach__out">…deliverables…</ul></article> …
    </div>
  </div>
</section>
```

**Breaks the column:** a 2:3 asymmetric split with a sticky left rail. This is the only sticky element below the fold and the only two-column reading layout on the page. The rail's active item is marked by a 2px left border flipping from `transparent` to `var(--mk-accent)`, driven by an `IntersectionObserver` on the five body blocks, not by scroll math.

**Surface:** completely flat, no glass, no cards. Body blocks are separated by `border-top: 1px dashed var(--mk-rail)` and nothing else. The deliverables list uses 20px round chips at `background: var(--mk-accent-softer)` with a gold check glyph at 65 percent opacity, never a green tick.

**Motion:** the gold SVG pipe draws via the `approach-draw` ScrollTrigger from A.11 (`stroke-dasharray` = path length, `stroke-dashoffset` scrubbed to 0). Rail items transition `border-color` and `color` at 200ms. **The five body blocks have no entrance animation at all.** They are already the payload; animating them in sequence is exactly the cascade being removed.

**Changes:** delete all six `Reveal` wrappers in this section; convert `approach-pipeline.tsx` output to a single continuous SVG path with a real `pathLength`; add the sticky rail and its observer; add `copy.approach.steps[i].outputs: string[]`.

---

## Section 7: Audit (4 steps)

**New shape: the spacer-aligned comparison grid.** Never a `<table>`.

```css
.mk-audit__grid {
  display: grid;
  grid-template-columns: 168px repeat(4, 1fr);
  column-gap: 1.5rem;
}
.mk-audit__row  { display: flex; align-items: center; height: 3.5rem;
                  border-top: 1px solid var(--mk-line); }
.mk-audit__row:last-child { height: calc(3.5rem + 1px); border-bottom: 1px solid var(--mk-line); }
.mk-audit__spacer { height: 6rem; }          /* aria-hidden, matches the label rail header */
```
Every row is exactly 56px. The last row absorbs the extra border pixel with `calc(3.5rem + 1px)` so all five columns end flush. Each of the four step columns opens with `<div aria-hidden class="mk-audit__spacer">` matching the 96px label header.

The column headers sit in their own `position: sticky; top: 64px; z-index: 20` block with `background: rgba(10,13,20,0.90)` and `backdrop-filter: blur(12px)`, so scrolling the rows never loses which step is which.

**Breaks the column:** a 168px label rail against four equal columns is the only fixed-plus-fluid grid on the page, and the sticky header is the only pinned chrome below the nav.

**Surface:** flat, hairlines only. Included markers are 20px `border-radius: 999px` chips at `background: var(--mk-accent-softer); color: rgba(227,189,108,0.80)`. No green, no red, no icons in coloured circles.

**Motion:** none, beyond the sticky header's `backdrop-filter` doing its job. Row hover: `background: rgba(255,255,255,0.03)`.

**Changes:** `audit-steps.tsx` and `audit-steps.css` rewritten around the grid; delete the `mk-eyebrow`; keep the h2 but move it into the 168px rail at 18px/500 rather than 3rem display, so the section opens quietly after the loud one above it.

---

## Section 8: ROI calculator

**Breaks the column:** true asymmetry, the only left-aligned unbalanced block on the page. `padding: 3rem 1.5rem 18rem` at desktop (up to 288px of bottom padding), with a full-width SVG area chart absolutely filling the block and the input cluster pinned **top left** at `max-width: 32rem` of a 74rem block. Forty percent content, sixty percent chart.

**Chart:** one `path` fill from `rgba(227,189,108,0.14)` to `rgba(227,189,108,0)` plus a `1.5px` stroke in `var(--mk-accent)`. This is the only saturated shape of any size on the page, and it earns it because it is data.

**Numbers:** every output figure uses `font-variant-numeric: tabular-nums`, Space Grotesk 700, `line-height: 1`, and hangs off a left hairline (`border-left: 1px solid rgba(255,255,255,0.40); padding-left: 14px`). They read as instrument readouts.

**The zero-shift toggle** (hours saved per week / per month), stolen verbatim in structure:
```css
.mk-toggle       { background: rgba(255,255,255,0.06); border-radius: 12px; padding: 2px; }
.mk-toggle__thumb{ position: absolute; height: 100%; width: calc((100% - 2px) / 2);
                   border-radius: 10px; background: rgba(255,255,255,0.10);
                   box-shadow: var(--mk-glass-inset);
                   transition: transform 500ms cubic-bezier(0.45,0,0.55,1); }
.mk-toggle[data-on="month"] .mk-toggle__thumb { transform: translateX(calc(100% + 2px)); }
```
Both number variants live in ONE `inline-grid` cell (`grid-column: 1; grid-row: 1`) and crossfade at 200ms, so switching shifts nothing by a pixel. 500ms is reserved for this one slide and nothing else on the site.

**Changes:** `roi-calculator.tsx` gains the toggle and the chart; the `mk-section-head--row` is deleted and replaced by a 24px sentence plus the numbers; `mk-eyebrow` deleted.

---

## Section 9: Why us (12-col grid)

**New shape: a subgrid bento, and the pull statement is inside it.**

```css
.mk-why {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-block: 1px dashed var(--mk-rail);
}
.mk-why__cell { padding: 2rem; }
.mk-why__cell--statement { grid-column: 1 / -1; padding: 5rem 2rem; }
.mk-why__pair { grid-column: span 2; grid-row: span 2;
                display: grid; grid-template-rows: subgrid; gap: 2rem; }
.mk-why__cell:nth-child(odd)   { border-right: 1px solid var(--mk-line); }
.mk-why__cell:nth-child(-n+4)  { border-bottom: 1px solid var(--mk-line); }
```

`grid-template-rows: subgrid` is the load-bearing property: the visual and the caption in each half-width cell align to shared rows, so captions sit on the same baseline even when the blocks above them differ in height. That is the difference between a bento and a pile.

The statement row (the existing `statementParts` with three `<em>` spans) becomes a full-width row **inside** the grid, at 5rem vertical padding, with a dot-grid texture layer behind it:
```css
.mk-why__cell--statement::before {
  content: ""; position: absolute; inset: 0; opacity: 0.03;
  background-image: radial-gradient(circle, #e8eaf2 1px, transparent 1px);
  background-size: 22px 22px;
}
```
Social proof and positioning woven into the feature story instead of quarantined in its own band.

**Breaks the column:** full-bleed inside the rails with dashed top and bottom, span-2/row-span-2 cells rather than equal tiles, and a full-width statement row breaking the 4-up rhythm twice.

**Motion:** none. Cell hover `background: rgba(255,255,255,0.03)`, 150ms.

**Changes:** delete both `Reveal` wrappers; delete `mk-section-head`; the h2 becomes the first line of the statement row rather than a separate head; `mk-why__num` moves to `--mk-mono` 11px `--mk-text-faint`.

---

## Section 10: Trust (principles + founder)

**Breaks the column:** the only section that uses `mk-container--narrow` (50rem) and the only one with a portrait-shaped block. A 2-column split at `grid-template-columns: 13rem 1fr`: a 208px founder plate on the left, principles as a numbered list on the right.

**Surface:** the founder plate is the one place on the page with a **square-cornered** glass surface: `border: 1px solid var(--mk-line); background: rgba(255,255,255,0.05); backdrop-filter: blur(20px) saturate(160%); border-radius: 0`. Against a page where everything else is 8/10/12/16px rounded, square corners on the one biographical surface reads as deliberate. This is the Vertex contact-form move.

**Content honesty guard:** references. Saudi Opportunity Hub is an own product and must be labelled as such. Concept demos are labelled unpaid concept work. Yemaya Zeilcharter is never cited. `midnightspace.com` is never cited; the URL is `midnightspaceconsultancy.com`. Experience is presented as junior, never senior. The engineer must not invent client logos, counts, or testimonials to fill this section.

**Motion:** none.

**Changes:** delete `mk-eyebrow` and the lede; the h2 shrinks to 24px/500 and moves inside the right column above the list.

---

## Section 11: FAQ (8 items)

**New shape: not an accordion on desktop.** A docs-style split.

```css
.mk-faq { display: grid; grid-template-columns: 2fr 3fr; gap: 3rem; }
.mk-faq__nav { position: sticky; top: 96px; height: fit-content; }
.mk-faq__nav a { display: flex; gap: 8px; font-size: 14px;
                 border-left: 2px solid transparent; padding: 8px 0 8px 16px;
                 color: var(--mk-text-mut); transition: color 200ms var(--mk-ease),
                                                        border-color 200ms var(--mk-ease); }
.mk-faq__nav a[aria-current="true"] { color: var(--mk-text-hi);
                                      border-left-color: var(--mk-accent); font-weight: 500; }
```
Three category headings in the rail, all eight answers rendered **open** in the right column. Content is scannable and indexable. Under 860px it collapses to `<details>` elements with `.mk-faq__nav` becoming a sticky `top: 64px` pill row with `backdrop-filter: blur(12px)`.

**Breaks the column:** a 2:3 split immediately before the CTA, breaking the centred rhythm one last time.

**Changes:** `details/summary` kept only as the mobile branch; add `copy.faq.items[].group` so the rail has categories; delete the `Reveal`.

---

## Section 12: Final CTA

**Breaks the column:** the only full-bleed escape besides the story and the footer. `min-height: 26rem`, content pinned to the top of the block, and a decorative assembly pushed 384px below the fold behind it:

```html
<div class="mk-cta__orbit" aria-hidden="true">   <!-- inset-inline 0; bottom: -24rem -->
  <div class="mk-cta__ring" style="--r: 752px"></div>
  <div class="mk-cta__ring" style="--r: 544px"></div>
  <div class="mk-cta__ring" style="--r: 336px"></div>
</div>
```
```css
.mk-cta__orbit { -webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%);
                         mask-image: linear-gradient(to bottom, transparent, #000 30%); }
.mk-cta__ring  { width: var(--r); height: var(--r); border-radius: 999px;
                 border: 1px solid var(--mk-rail);
                 box-shadow: inset 0 2px 8px rgba(0,0,0,0.35); }
```
Only the top arc of the outermost ring enters the frame. Each ring carries integration chips positioned with `transform: rotate(Ndeg) translateX(calc(var(--r) / 2 - 20px))` wrapped in a counter-rotate so the chip stays upright. Outer ring 7 chips at 360/7 = 51.4286deg steps; middle 4; inner 2. Adjacent rings rotate in **opposite** directions, `--duration: 34s` outer, 26s middle, 20s inner, `animation: mk-orbit var(--duration) linear infinite`.

This gives the section depth without a hero image, a video, or a gradient blob. Under `prefers-reduced-motion` the rings render static and the chips keep their positions.

**Surface:** no glass. The CTA button is the gold `mk-btn--paper` and it is the only saturated gold button on the page besides the nav's.

**Changes:** add the orbit assembly; delete the `mk-eyebrow`; the title keeps its `<em>` gold word.

---

## Section 13: Footer

**Breaks the column:** the only true `#050810` full-bleed slab on the page, edge to edge, `min-height: 40svh`, escaping both rails. After 11,000px of translucent glass over a live shader, a hard opaque terminal punctuation.

```css
.mk-footer { background: #050810; border-top: 1px solid rgba(255,255,255,0.08); }
.mk-footer__links { columns: 3; column-gap: 0; }
@media (min-width: 1100px) { .mk-footer__links { columns: 5; } }
.mk-footer__links > div { break-inside: avoid; padding: 0 1rem 1.75rem 0; }
```
CSS multi-column rather than a grid, so uneven link lists flow and pack instead of leaving ragged empty cells. Column headers are set in the **serif** at 14px/400 in `--mk-text-faint`: the editorial voice signs off in miniature at the very bottom.

Link count discipline: 14 to 18 links total. Not 70. This is a five-person-adjacent consultancy, not Vercel, and a fake deep-IA footer is itself a template tell.

**Changes:** flatten the background to opaque `#050810`; serif the column headers; multi-column the link block; keep `AgoraLogo` at 148.

---

## B.14 Copy deltas (`copy.ts`)

Five new hero and chapter strings per language, in the existing `copy.story.chapters` shape.

**Hero (EN):** `h1Plain: "Turn repetitive work into"`, `h1Serif: "automated workflows."`
**Hero (NL):** `h1Plain: "Zet repetitief werk om in"`, `h1Serif: "geautomatiseerde workflows."`

| id | EN kicker / title | NL kicker / title |
|---|---|---|
| bottleneck | Today / "The work keeps arriving faster than you can clear it." | Vandaag / "Het werk blijft sneller binnenkomen dan je het wegwerkt." |
| mapping | Step one / "First we map every step, then we design the workflow around it." | Stap een / "Eerst brengen we elke stap in kaart, daarna bouwen we de workflow eromheen." |
| machine | Step two / "The workflow runs on its own, with you still in the loop." | Stap twee / "De workflow draait vanzelf, met jou nog steeds in de lus." |
| payoff | The outcome / "Your work keeps getting done without you doing it." | Het resultaat / "Je werk gebeurt gewoon door, zonder dat jij het doet." |

**NL line-length check, mandatory:** at 390px viewport the chapter card is `min(100% - 2.5rem, 27rem)` = 350px wide with 2.1rem side padding = 283px of text. `.st-title` must clamp to `1.32rem` below 420px or "geautomatiseerde workflows" and "binnenkomen" will orphan. Verify all four NL titles render in at most three lines at 390px before merging.

---

# C. DESIGN SYSTEM DELTA

All additions to `C:\GitHub\coursehub\src\app\marketing.css`, inside the existing `.mkt` block. **Nothing existing is removed.** The palette, the glass recipe, the ease and the durations stay exactly as they are.

```css
.mkt {
  /* ============ NEW: the drafting-sheet frame ============================ */
  --mk-rail:        rgba(227, 189, 108, 0.16);  /* the two vertical hairlines
                                                   and every dashed divider */
  --mk-rail-solid:  rgba(255, 255, 255, 0.10);  /* alias of --mk-line, for
                                                   "this is a real object" edges */
  --mk-mark:        rgba(227, 189, 108, 0.30);  /* crosshair corner marks */
  --mk-hatch:       rgba(255, 255, 255, 0.045); /* the 315deg spacer hatch */
  --mk-hatch-size:  10px;
  --mk-frame-w:     74rem;      /* outer rail width  */
  --mk-frame-gap:   0.5rem;     /* inner rail inset, 8px at lg */
  --mk-nav-w:       68rem;      /* deliberately inside the rails */

  /* ============ NEW: the editorial serif ================================= */
  --mk-serif-face:  var(--font-mk-serif), Georgia, "Times New Roman", serif;
  /* Newsreader, weights 400;500;600, subsets latin, display swap,
     variable --font-mk-serif, added in src/app/layout.tsx.
     ZONE RULE: serif carries h1 and every section h2 and NOTHING else.
     Space Grotesk drops to h3, h4, numbers and step labels.
     Inter carries all body, labels and buttons.
     Geist Mono carries run ids, durations, cron strings and webhook URLs. */

  /* ============ NEW: optical tracking ladder ============================= */
  --mk-track-60:   -0.025em;    /* 60px+  display */
  --mk-track-48:   -0.021em;    /* 48px   section h2 on the big moments */
  --mk-track-36:   -0.017em;    /* 36px   section h2 default */
  --mk-track-24:   -0.012em;    /* 24px   card and rail titles */
  --mk-track-18:   -0.009em;    /* 18px   lede */
  --mk-track-12:    0;          /* 12px   micro-labels, explicitly reset */

  /* ============ NEW: elevation ladder (dark, black-tinted) =============== */
  --mk-elev-chip:  inset 0 0 0 1px rgba(255,255,255,0.10),
                   0 1px 3px rgba(0,0,0,0.40), 0 1px 2px -1px rgba(0,0,0,0.30);
  --mk-elev-panel: inset 0 1px 0 rgba(255,255,255,0.10),
                   0 4px 6px -1px rgba(0,0,0,0.40), 0 2px 4px -2px rgba(0,0,0,0.30);
  --mk-elev-top:   0 20px 25px -5px rgba(0,0,0,0.55), 0 8px 10px -6px rgba(0,0,0,0.40);

  /* ============ NEW: radius scale, concentric-aware ====================== */
  --mk-radius-chip:  10px;   /* tab chips, toggle thumb                    */
  --mk-radius-tile:  12px;   /* bento tiles inside the run panel           */
  --mk-radius-panel: 16px;   /* ONLY the run panel and the story cards     */
  --mk-radius-btn:    8px;   /* every button                               */
  /* Concentric rule: a 15px outer with 2.5px padding takes a 10px inner
     child (15 - 5 = 10). Do not nest two equal radii. */

  /* ============ NEW: motion additions =================================== */
  --mk-ease-inout:  cubic-bezier(0.45, 0, 0.55, 1);  /* the toggle slide only */
  --mk-slow:        320ms;   /* one-shot entrances                          */
  --mk-slide:       500ms;   /* RESERVED: the ROI billing toggle, nothing else */
  --mk-stagger:      40ms;   /* max sibling stagger anywhere on the page     */

  /* ============ NEW: mono micro-label ================================== */
  --mk-label-size:  11px;
  --mk-label-track: 0.10em;
}
```

**Type role reassignment**, applied where the classes already live:

```css
.mkt .mk-h1 { font-family: var(--mk-serif-face); font-weight: 600;
               font-size: clamp(2.6rem, 6vw, 4.2rem); line-height: 1.0;
               letter-spacing: var(--mk-track-60); }
.mkt .mk-h2 { font-family: var(--mk-serif-face); font-weight: 600;
               font-size: clamp(1.9rem, 4vw, 2.25rem); line-height: 1.11;
               letter-spacing: var(--mk-track-36); }
.mkt .mk-h2--moment { font-size: clamp(2.1rem, 4.6vw, 3rem); line-height: 1.0;
               letter-spacing: var(--mk-track-48); }   /* CTA and Why only */
.mkt h3, .mkt .mk-approach__title, .mkt .st-title,
.mkt .mk-why__title { font-family: var(--mk-display); }
.mkt .mk-num, .mkt .mk-stat-val { font-family: var(--mk-display);
               font-variant-numeric: tabular-nums; line-height: 1; }
.mkt .mk-label { font-family: var(--mk-mono); font-size: var(--mk-label-size);
               font-weight: 500; letter-spacing: var(--mk-label-track);
               text-transform: uppercase; color: var(--mk-text-faint); }
```

**Deletions:**
- `.mk-eyebrow` keeps its definition (one hero pill still uses a sentence-case variant) but its five section usages are removed from `marketing-page.tsx`. Add `.mk-eyebrow--pill` for the hero: `text-transform: none; letter-spacing: 0; font-size: 12px; font-weight: 500; color: var(--mk-text-mut);` in a `border-radius: 999px` shell.
- `.mk-section-head` and `.mk-section-head--row` survive only in Workflows. Both usages elsewhere are deleted.
- `.rv` fade-up is deleted as a default (see D).

Weights across the whole page are limited to **400, 500, 600, 700**. Contrast comes from size and family, never from weight.

---

# D. MOTION SYSTEM

## D.1 The one signature moment

**The story machine, and nothing else.** 640vh of scroll, one sticky viewport, one object that jams, gets mapped, runs and settles. Every other motion on the page is whisper level. A page with two signature moments has none.

Consequence: the Approach section does not get a pinned scrub. The Why grid does not get a stagger cascade. The Trust section does not get a counter animation. If a second thing on the page makes you look at it, delete that thing.

## D.2 Named easings and durations

| token | value | used for |
|---|---|---|
| `--mk-ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | everything except the toggle |
| `--mk-ease-inout` | `cubic-bezier(0.45, 0, 0.55, 1)` | the ROI toggle thumb only |
| `--mk-fast` | 160ms | colour, background, border, opacity |
| `--mk-base` | 220ms | box-shadow, transform |
| `--mk-slow` | 320ms | one-shot entrances |
| `--mk-slide` | 500ms | the ROI toggle thumb, reserved |

House rule, applied to every interactive element: colour properties run at `--mk-fast`, box-shadow runs at `--mk-base`, in the same declaration. Depth trails colour slightly. That single asymmetry is most of what makes hover feel considered.

## D.3 Hover grammar, by tier

Strict. Nothing improvises.

- **Content cards** (story chapter cards, run panel): `translateY(-2px)` plus one step up the shadow ladder plus `border-color: var(--mk-accent)`.
- **Buttons**: `translateY(-1px)` plus a deeper shadow. No scale.
- **Icon and inline buttons**: `scale(1.04)` plus `background: var(--mk-accent-softer)`. **No lift.**
- **Glass chrome** (tabs, chips, lang toggle): no transform at all, only a white-alpha step, 0.06 to 0.12 fill and 0.18 to 0.30 border.
- **Grid cells and table rows**: a flat `rgba(255,255,255,0.03)` tint. Nothing else.
- **Active on everything**: `transform: translateY(1px) scale(0.99)`.

## D.4 Entrances: what is explicitly forbidden

**Uniform fade-up on every element is banned.** `.rv { opacity: 0; transform: translateY(18px) }` with `transition: 0.8s` applied to eleven sections in a row, with `delay = i * 0.04` cascades inside them, is the single loudest AI tell on the current page and it is removed.

The `Reveal` component stays in the codebase but is used in **exactly two places**: the Workflows head and the Trust founder plate. Everywhere else the entrance is either nothing, or a section-specific gesture:

| section | entrance |
|---|---|
| Who it's for | lead sentence `clip-path: inset(0 100% 0 0)` wipe, 520ms `--mk-ease`. Grid: none. |
| Workflows | head `Reveal` once. Panel swap: rotating queue, `transform-origin: center top`, 320ms. |
| Approach | pipe `stroke-dashoffset` scrubbed. Blocks: none. |
| Audit | none. Sticky header blur only. |
| ROI | chart path `stroke-dashoffset` drawn once on intersection, 900ms `--mk-ease`. Numbers: none. |
| Why | none. |
| Trust | founder plate `Reveal` once. Principles: none. |
| FAQ | none. Rail active-state `border-color` only. |
| CTA | rings begin rotating on intersection, no entrance. |
| Footer | none. |

Maximum sibling stagger anywhere on the page is `--mk-stagger` (40ms), and it may be used on at most **four** siblings. A five-item 40ms cascade is a cascade; four is a beat.

## D.5 Always-on motion budget

Exactly three things move without user input, and no more:
1. the story machine (rollers, belt, blocks, camera breathing) and only while the stage is on screen,
2. the CTA orbit rings,
3. the nav progress hairline, which is scroll-driven so it is not really always-on.

Everything on the page stops under `prefers-reduced-motion: reduce`. That is enforced at the token layer:

```css
@media (prefers-reduced-motion: reduce) {
  .mkt { --mk-fast: 0ms; --mk-base: 0ms; --mk-slow: 0ms; --mk-slide: 0ms;
         --mk-stagger: 0ms; --mk-ease: linear; --mk-ease-inout: linear; }
  .mkt .rv { opacity: 1; transform: none; transition: none; }
  .mkt .mk-cta__ring { animation: none; }
  .mkt .mk-run { transition: none; }
}
```
Every component that uses the tokens is fixed by that one block. Per-component overrides are only needed for the three keyframe animations named above.

---

# E. BUILD ORDER

Fourteen steps. The site renders and deploys after every single one. No step depends on a later step.

**1. Tokens.** Add the new custom properties from section C to `src/app/marketing.css` inside `.mkt`. Add nothing that consumes them yet.
*Verify:* `npm run build` succeeds; the page looks byte-identical to before.

**2. Serif font.** Add `Newsreader` to `src/app/layout.tsx` (`variable: "--font-mk-serif"`, `weight: ["400","500","600"]`, `subsets: ["latin"]`, `display: "swap"`), append its class to the `<html>` className list.
*Verify:* `getComputedStyle(document.documentElement).getPropertyValue("--font-mk-serif")` is non-empty. Nothing visually changes yet.

**3. Type roles.** Point `.mk-h1` and `.mk-h2` at `--mk-serif-face` with the new sizes and tracking; add `.mk-label`, `.mk-num`, `.mk-h2--moment`.
*Verify:* headings render in the serif at 1440px and at 390px, no orphans in the NL h1, no layout shift after font swap (check `size-adjust` is not needed by measuring the fallback).

**4. The frame and the rules.** Add `.mk-frame`, `.mk-frame__rail`, `.mk-rule`, `.mk-mark` to `marketing.css`. Wrap `<main>`'s children in the frame in `marketing-page.tsx` and drop seven `<div class="mk-rule"/>` between sections. Let `.st-stage` and `.mk-footer` escape the frame with `margin-inline: calc(50% - 50vw); width: 100vw`.
*Verify:* two hairlines run down each margin at 1440px, the story and footer go edge to edge, no horizontal scrollbar at 320px.

**5. Nav.** Narrow `.mk-nav__inner` to `--mk-nav-w`, weaken the bottom border to 0.06, add the progress hairline element.
*Verify:* the nav is visibly inside the rails; no ScrollTrigger yet, hairline sits at `scaleX(0)`.

**6. `scroll-fx.ts`.** New file with the two ScrollTrigger scrubs (`nav-progress`, `approach-draw`), registered from a client component mounted once in `marketing-page.tsx`, with a `ScrollTrigger.getAll()` kill on unmount and an early return under reduced motion.
*Verify:* the nav hairline tracks scroll; scrolling up reverses it exactly; no console warnings from Lenis.

**7. Kill the scaffold.** Delete nine `mk-section-head` blocks and all but two `Reveal` wrappers from `marketing-page.tsx`. Delete five `mk-eyebrow` usages. Add `.mk-eyebrow--pill` for the hero.
*Verify:* the page is uglier and flatter but complete; no orphaned CSS selectors reported by a quick `grep` for each removed class.

**8. Who it's for.** Rewrite `who-for.tsx` and `who-for.css` as the flat five-cell lattice with container-painted dividers and the clip-path lead.
*Verify:* five cells at 1440, two at 900, one at 480; single hairlines everywhere, no doubled borders.

**9. Why, Audit, FAQ, Trust, Footer.** These are pure CSS-and-markup sections with no new dependencies. Do them in one pass: subgrid bento for Why, spacer-aligned grid for Audit, docs-split for FAQ, square glass plate for Trust, multi-column opaque footer.
*Verify each independently:* Why captions share a baseline across cells of different height; Audit's four columns end flush on the last row; FAQ collapses to `<details>` under 860px; footer is opaque `#050810` full bleed.

**10. ROI.** Add the toggle, the `inline-grid` zero-shift digits, `tabular-nums`, the left-hairline numbers, and the asymmetric chart block.
*Verify:* toggling billing shifts nothing by a pixel (record a screenshot diff of the surrounding layout); the chart draws once on intersection and never again.

**11. CTA orbit.** Add the three rings, the chips, the counter-rotate wrappers and the top mask.
*Verify:* only the top arc enters the frame at 1440x900 and at 390x844; chips stay upright; rings freeze under reduced motion.

**12. Workflows run panel.** Rewrite `workflow-tabs.tsx` around the fake application window, extend `copy.ts` with `steps[]`, `kv[]`, `bento[]` in EN and NL, add the rotating queue.
*Verify:* one panel visible at a time, `transform-origin: center top` on the enter, mono values render with `tabular-nums`, the AI tile is the only tinted surface, arrow keys move between tabs and `aria-selected` follows.

**13. `story-machine.tsx`.** Build the new scene in isolation behind a temporary query-string flag (`?machine=1`) so the shipped story keeps rendering while it is built. Implement in this order, verifying each: geometry and materials at chapter 3 only → lighting → the five keyframes with no stagger → the stagger table → blocks and the arc-length table → planLine → cup and lever → reduced-motion single frame → NDC framing guard → teardown.
*Verify at each stage:* `renderer.info.render.triangles` under 35k, `renderer.info.render.calls` at most 16, no per-frame allocations (record a 10s Chrome memory timeline and confirm a flat sawtooth-free line).

**14. Swap and delete.** Point `story-scene.tsx` at `buildMachine`, remove the flag, delete the old builder body (everything below the React shell), delete `hero-shader.tsx`, and update the four chapter copy entries in both languages.
*Verify:* full scroll pass at 1440x900, 1280x800, 768x1024 and 390x844; scroll up from the payoff to the hero and confirm every state is identical to the way down; `prefers-reduced-motion` renders the still machine frame; disable WebGL in devtools and confirm the panels stack with real text.

---

# F. ANTI-SLOP CHECKLIST

Run every item before shipping. Any single failure is a ship blocker.

## The 3D

1. No `GridHelper`, no `AxesHelper`, no `wireframe: true`, no `flatShading: true` on any curved form.
2. No default `0xffffff MeshStandardMaterial` anywhere. Every material is `MeshPhysicalMaterial` (or the two named `MeshBasic` unlit exceptions) with a chosen colour.
3. `metalness === 0` on every part **including the gold**. Grep for `metalness` and confirm every hit is `0`.
4. No light at intensity 1 sitting at (10, 10, 10). Six lights, all with the positions and intensities in A.9.
5. No bloom, no post-processing pass, no lens flare.
6. No two coplanar faces. The window sits 0.09 proud of the body; `beltTop` sits 0.012 proud with `polygonOffset`. Verify by orbiting to a grazing angle at each chapter and looking for z-fighting shimmer.
7. Every rounded box radius is at least 18 percent of its smallest dimension. No 0.05 radius on a 2-unit box anywhere.
8. No part smaller than 0.90 units in its longest dimension except `cup` and `leverPad`, both documented exceptions.
9. **No particles.** Zero. If a `for` loop is creating more than four of anything, it is wrong.
10. Exactly one thing rotates continuously (the rollers) and only while `running > 0`.
11. The hero frame is the machine **assembled**. Screenshot chapter 0, desaturate it, scale it to 120px, and confirm you can say "stuff goes in the top, stuff comes out the side" out loud.
12. Chapters 0 and 2 are distinguishable as silhouettes at 120px greyscale. If they are not, the mapping lift is too small.
13. Scroll to the payoff, then scroll all the way back to the hero. Every intermediate frame must be identical to the downward pass. Any drift means something time-driven leaked into a transform.
14. Pause mid-scroll for ten seconds. The frame must breathe, not freeze and not spin.
15. `renderer.info.render.calls` at most 16, `triangles` under 35k, measured at chapter 3.
16. A ten-second Chrome memory profile during a full scroll shows no allocation sawtooth.
17. Unmount the component (client-side route change) and confirm the WebGL context count in `chrome://gpu` does not grow.

## The page

18. `grep -c "mk-section-head" marketing-page.tsx` returns 1.
19. `grep -c "<Reveal" marketing-page.tsx` returns 2.
20. `grep -c "mk-eyebrow" marketing-page.tsx` returns 1, and that one is the hero pill.
21. Count uppercase text nodes outside the run panel. The answer must be zero.
22. No two consecutive sections use the same container width.
23. Section heights measured in document order vary by more than 3x between the shortest and the tallest.
24. There is exactly one pill badge on the whole page.
25. No section uses a lucide-style icon in a coloured circle. Every illustration is either real UI or nothing.
26. Gold appears on fewer than 6 percent of lit pixels. Specifically: gold is **not** in the h1, **not** on every button, **not** on every icon. It is the rails, the crosshairs, the chart stroke, the FAQ active rail, one word per heading, and the primary CTA.
27. Glass is used on the story cards and the run panel and nowhere else. No glassmorphism as decoration.
28. No nested glass. A glass surface never contains another glass surface.
29. Every card radius is concentric with its padding. No 12px child inside a 12px parent.
30. No value on the page is a round 4/8/16 multiple everywhere. There must be hand-nudged values in the run panel: `gap: 7px`, `176fr 176fr 218fr`, `margin-left: 9.5px`, `height: 13px`, `calc(3.5rem + 1px)`.
31. Numbers everywhere carry `font-variant-numeric: tabular-nums`.
32. Toggling the ROI billing period shifts no pixel of surrounding layout.
33. No horizontal scrollbar at 320px, 390px, 768px, 1024px, 1440px, 1920px.
34. `prefers-reduced-motion: reduce`: nothing on the page moves except nothing. The story canvas is a single still frame of the running machine, the orbit rings are frozen, no `.rv` element is transparent.
35. JavaScript disabled: all five story panels render with real text, all eight FAQ answers are readable, the page is fully navigable.

## Content

36. No fabricated client logos, counts, testimonials or case studies.
37. Saudi Opportunity Hub is labelled as an own product. Concept demos are labelled unpaid concept work.
38. Yemaya Zeilcharter appears nowhere.
39. The domain everywhere is `midnightspaceconsultancy.com`. `midnightspace.com` appears nowhere.
40. The contact address everywhere is `j.guzman@midnightspaceconsultancy.com`. `hello@agora.be` appears nowhere.
41. Experience is presented as junior. No copy implies a senior track record or a team larger than it is.
42. No em dashes in any string in `copy.ts` (EN or NL), in any CSS comment, or in any TSX comment. `grep -rn "—" src/` returns nothing.
43. Every NL chapter title renders in at most three lines at 390px.
44. Every NL string has an EN counterpart and vice versa; `copy.ts` type-checks with no optional fields added to paper over a gap.