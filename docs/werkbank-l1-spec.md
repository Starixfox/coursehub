# WERKBANK L1

**The build specification for the object behind the Agora marketing page.**

One machine, 384 mm long, on one fixed WebGL layer, lit by one light, rendered on demand, and 74 percent dark at every stop but one. This document is the front half. Sections A through E.1 below define the render pipeline, the lighting rig, the materials, the geometry and the opening chapter. Sections E.2 through I follow.

**World scale: 1 world unit = 40 millimetres.** The bench is 9.600 units, which is 384 mm. The housing block is 3.700 units, which is 148 mm. Every millimetre figure anywhere in this document is a world figure multiplied by 40, and every world figure is stated to three decimals because 0.001 units is 0.04 mm and that is the resolution at which the chamfers on this object are argued about.

**Naming.** The object is Werkbank L1. Its parts are the **bed**, the **housing**, the **lid**, the **funnel**, the **throat**, the **intake rim**, the **belt**, the **slats**, the **rollers**, the **handle** (boss, stem, grip), the **billet**, the **slabs**, the **tray**, the **status channel** and the **route tube**. It is not a factory, not a line, not a toy and not a boulder. See G.24.

---

## A. RENDER PIPELINE

The whole pipeline is nine statements. Everything expensive in the current build is a statement that is not here.

### A.1 The renderer

```js
const renderer = new THREE.WebGLRenderer({
  canvas,                       // the fixed inset-0 canvas, sibling of <main>
  alpha: true,                  // F.1: the page ground shows through
  antialias: tier >= 1,         // not `!isMobile`
  stencil: false,               // nothing on this page needs a stencil buffer
  depth: true,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x000000, 0);
scene.background = null;
```

`alpha: true` plus a zero-alpha clear plus a null background is the whole of F.1's transparency thesis expressed in three lines. The consequence is load-bearing and it constrains every number below: **`#0a0d14` is the field, and the object can never be darker than the page.** The page ground's linear luminance is 0.004029. Any surface the renderer draws at less than that reads as a hole cut in the page rather than as a dark part, which is why A.4 states a floor and not just a ceiling.

`stencil: false` is not a micro-optimisation, it is a statement that there is no mask, no clip, no portal and no second pass anywhere in this build.

`antialias` is bound to the capability tier and not to `window.matchMedia("(max-width: 760px)")`. A 760 px viewport on a 2023 phone is a tier 2 device and the current build refuses it MSAA; a 1440 px window on a 2016 integrated part is tier 1 and the current build grants it. Both are wrong in the direction that matters, because **the entire read on this page is a two-pixel lit chamfer** and a jagged two-pixel chamfer is not a chamfer.

### A.2 Tone mapping, exposure and colour space

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.80;
// renderer.outputColorSpace is NOT written. three's default is already SRGBColorSpace.
```

**Exposure 0.80, down from the current 1.05.** This is the single highest-leverage number in the document and step 1 exists to judge it on its own.

The argument is not "darker looks more premium". It is arithmetic, and it runs in both directions:

- **At the top.** The gold grip's collar chamfer returns of order (146, 97, 29) linear at the macro stop. At exposure 1.05 the ACES shoulder is already saturated across all three channels well before that, so the chamfer clips to a flat white band with no tint and the one place on the page where gold is allowed to be gold renders as a white scratch. At 0.80 the shoulder still compresses it hard, which is the intent, but the ratio between the channels survives the compression and the band lands warm. **A blown highlight that keeps its hue is the entire visual payoff of chapter 3.**
- **At the bottom.** The housing's unlit flank at the hero stop carries a scene radiance of linear Y 0.0121. Through ACES at 0.80 that resolves to display-linear 0.00231, which sRGB-encodes to **7.6, so RGB 8**. That is E.1's published figure and it is the number that makes the flank read as a dark machined face rather than as nothing. At exposure 1.05 the same radiance lands at RGB 11 and the whole shadow side lifts off the page ground, which is precisely the failure the current build has: nothing on it is actually dark, so nothing on it is actually bright.

The full chain, for anyone who wants to check it rather than believe it: sRGB byte 8 decodes to display-linear 0.002337; the inverse of three's `ACESFilmicToneMapping` at exposure 0.80 puts that at scene-linear 0.01207; A.4's floor is 0.0121. The three numbers agree to three significant figures. Every RGB value quoted in section E was produced by this chain and can be reproduced from it.

**`renderer.outputColorSpace = THREE.SRGBColorSpace` is deleted** (G.15). It has been the three default since r152 and writing it is a statement that the author was not sure. Nothing else about colour is configured: no `colorSpace` on any material (there are no textures), no `LinearSRGBColorSpace` anywhere, no manual conversion.

### A.3 The environment

```js
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new RoomEnvironment();
envRT = pmrem.fromScene(envScene, 0.04);
scene.environment = envRT.texture;
scene.environmentIntensity = 0.285;
envScene.dispose();
pmrem.dispose();
```

Procedural `RoomEnvironment` baked once through PMREM at sigma 0.04. **Zero network requests, zero image decodes, zero HDR files, zero textures** (I.8). It is built at boot, read into a render target, and both the source scene and the generator are disposed in the same tick, so the steady-state cost is one cube render target and nothing else.

**`environmentIntensity = 0.285`, and the number has to be argued because it is 50 percent above the reference's 0.19.**

The reference's object is a 34 mm module: one silhouette, four surfaces, and almost every visible face is either square to the key or square to the camera. Werkbank L1 is 384 mm of bench with a bed, a housing, a cone, a belt and a tray, and at every stop the majority of its visible area is at a grazing angle to a key that sits 115.6, 97.1, 88.6, 59.5 or 104.0 degrees off the eye. **Grazing area is exactly the area an IBL fills and a key cannot.** At 0.19 the bed's outer bands, the housing's downstream flank and the tray's inner walls all fall under the page ground and the object develops holes: it stops reading as one machine and starts reading as five lit fragments floating on a field, which is the exact failure I.1 chapter 0 tests for.

0.285 is the value at which the unlit flank clears the page ground by a factor of three. That is A.4, and A.4 is a measurement, not a preference.

**The IBL is fill, not illumination, and it is not uniform.** Every material carries its own `envMapIntensity`, and those run from **0.22** (`mSeam`, the undercut grooves and the cavity floor: 0.22 x 0.285 = **0.063**, which is a sixteenth of the key's contribution and reads as a genuine black hole) to **1.35** (`mGoldGrip`, because a metal with no diffuse term has nothing but the environment to describe its form when the key is not on it). The full ladder is C.2, and it is modulated per stop by the ATTENTION table in C.3. **The current build's flat "full IBL fill on everything" is what makes it look like a render rather than a photograph:** in a real studio the light falls off, and the way it falls off is what tells you where the object is.

### A.4 The calibration target, and what overrules this document

Step 4 is the calibration pass and it exists because everything above is a prediction.

**Sample the housing's unlit downstream flank at the hero stop, at 1440x900 DPR 1, in scene-linear before tone mapping.**

| quantity | value |
| --- | --- |
| page ground `#0a0d14`, linear Y | **0.004029** |
| pass band, unlit flank linear Y | **0.0121 to 0.0161** |
| as a multiple of the ground | 3.0x to 4.0x |
| resulting sRGB after ACES at 0.80 | RGB 8 to RGB 12 |

Below 3.0x the flank is inside the page's own noise and the object develops holes. Above 4.0x the shadow side is lit, the 74 percent darkness target in I.3 cannot be met without pulling the key, and pulling the key destroys the chamfer reads in I.2. **The band is narrow on purpose. It is the whole art direction expressed as one measurement.**

If it fails, **`scene.environmentIntensity` is the only value permitted to move.** Not the exposure, not `KEY_BASE`, not the material albedos. Write the measured number into `story-stops.ts` with a comment naming what was measured, at what viewport, and on what date. **The measurement overrules this document**, and section E's percentages get annotated to match.

### A.5 Shadows

One shadow map, one pass, hard.

```js
renderer.shadowMap.enabled  = tier >= 1;
renderer.shadowMap.type     = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;          // pushed only inside renderNow, F.7

key.castShadow            = true;
key.shadow.mapSize.set(tier >= 2 ? 2048 : 1024, tier >= 2 ? 2048 : 1024);
key.shadow.camera.left    = -3.500;
key.shadow.camera.right   =  3.500;
key.shadow.camera.top     =  4.600;
key.shadow.camera.bottom  = -4.600;
key.shadow.camera.near    =  4.800;
key.shadow.camera.far     = 15.600;
key.shadow.bias           = -0.00042;
key.shadow.normalBias     =  0.012;
key.shadow.radius         =  1.0;
```

Those six frustum numbers are not guesses. The key sits 10.112 units from its target (B.2). Project the object's envelope, `x` ±4.800, `y` -0.820 to 2.960, `z` ±1.360, onto the light's own basis and it measures **±3.343 across and ±4.432 up**, with a depth extent of **±5.071** along the light axis. The declared frustum is that envelope plus 0.05 to 0.17 of slack in each direction, so a 2048 map spreads 2048 texels over 7.000 units, which is **0.137 mm per texel**. That is finer than the bed's own 1.52 mm chamfer, which is the resolution the contact under the four feet actually needs.

**`PCFShadowMap` with `radius = 1.0`, not `PCFSoftShadowMap` with `radius = 3`.** A soft three-texel kernel under a directional key at 10 units produces a diffuse pool, and a diffuse pool is exactly what the painted `PlaneGeometry(10.5, 3.6)` contact ellipse in the current build already is (G.7). Replacing a painted soft blob with a rendered soft blob is not a change. The point of the real map is the **hard contact under four 9.6 mm milled feet and inside every modelled undercut groove**, because a hard contact edge is the single cheapest cue that an object is resting on something rather than floating over it.

`autoUpdate = false` with `needsUpdate` pushed once inside `renderNow` is what keeps the shadow pass at exactly one per rendered frame and zero per idle frame (I.8).

At tier 0 shadows are off entirely. The object does not float, because the undercut grooves at every seam (D.4, D.6) are modelled geometry and go dark under the IBL whether or not a map exists. **The current build's "0.15 more opacity on the painted ellipse when shadows are off" compensation has no analogue here and is deleted.**

### A.6 Tier, DPR and `setSize`

The tier probe is ported from the reference in shape and in policy: a context probe plus an unmasked-renderer string heuristic, and **the tier only ever lowers cost, never raises it**.

| tier | meaning | dpr | antialias | shadow map | geometry preset |
| --- | --- | --- | --- | --- | --- |
| 2 | discrete or capable integrated | `min(devicePixelRatio, 2)` | on | 2048 | full, ~54,000 tri |
| 1 | weaker integrated, mobile | `min(devicePixelRatio, 1.5)` | on | 1024 | reduced, ~32,500 tri |
| 0 | software rasterizer | `1` | off | none | reduced, ~32,500 tri |
| -1 | no WebGL at all | the fallback SVG, F.10 | | | |

```js
const dprFor = (tier) => {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  if (tier <= 0) return 1;
  if (tier === 1) return Math.min(d, 1.5);
  return d;
};
```

**`isMobile` is deleted as a concept** (G.22 in spirit, and step 10 explicitly). The current build's `window.matchMedia("(max-width: 760px)")` decides DPR, antialias, segment budgets and transmission from a CSS width, which is a proxy for a proxy. The probe measures the thing.

`setSize`:

```js
const applySize = () => {
  let w = canvas.clientWidth, h = canvas.clientHeight;
  // An unstyled canvas reports its default 300 x 150. The DOM contract puts the
  // canvas at fixed inset 0, so if the stylesheet has not landed yet, take the
  // viewport rather than render into a corner and then resize on the next frame.
  if (!w || !h || (w === 300 && h === 150)) { w = innerWidth || 1; h = innerHeight || 1; }
  renderer.setPixelRatio(dprFor(tier));
  renderer.setSize(w, h, false);        // updateStyle FALSE: CSS owns the box
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
};
```

**`updateStyle: false` is mandatory, not stylistic.** The canvas is `position: fixed; inset: 0; width: 100%; height: 100%` and CSS owns that box. If three writes inline `style.width` in CSS pixels, the next viewport change fights the stylesheet and the canvas drifts by a pixel or two at every resize, which on a full-bleed fixed layer is visible as a seam against the document edge.

`applySize` runs on `ResizeObserver`, never on a raw `resize` listener, and it sets the dirty flag rather than rendering, so a drag-resize coalesces into one frame per rAF instead of one per event.

### A.7 What the pipeline never does

Stated as a list so that a future addition has to argue against a written line rather than fill a gap.

- **No post-processing.** No `EffectComposer`, no bloom, no depth of field, no vignette, no chromatic aberration, no film grain in WebGL. The macro's focus effect is real perspective compression at 52 mm (E.4), and the page's grain is one CSS layer at z-index 60.
- **No second render target.** No transmission buffer, because no material transmits. The current build's `transmission: 0.35` window is deleted (G.5) and with it the half-resolution transmission pass.
- **No texture of any kind.** `renderer.info.memory.textures` in the 3D layer is the PMREM target and nothing else. No canvas atlas, no `emissiveMap`, no `alphaMap`, no normal map, no matcap.
- **No second WebGL context and no second rAF loop** (G.17, I.8).
- **No `clock`, no `elapsed`, no `getDelta`** anywhere in the render path (F.8).
- **No `renderer.render` outside `renderNow`.**

---

## B. THE LIGHTING RIG

### B.1 The decision: one light

**One `DirectionalLight`. There is no second light in this scene.** Five of the current six are deleted (G.1) and the sixth is replaced.

The reason is not economy. It is that **a cross-key is the only lighting that produces a legible edge**, and every light you add to a cross-key fills the shadow the cross-key exists to create. The current rig has a hemisphere at 0.5, a blue fill at 0.65, a gold rim at 1.8 and two coloured point lights, and the net effect is that every surface on the object is lit from some direction, so no surface is describing a form. The object reads as a collection of coloured volumes because that is literally what it is.

**The gold rim light is the one that will be defended, and it is the worst of them.** Its comment says it does most of the brand work in the frame. That is the problem stated as a virtue: it makes gold a property of the lighting rather than a property of a material, so the gold appears on the housing, on the tray and on the bed, wherever a back edge happens to face away. Gold on this page appears in exactly four places (I.7) and two of them are metals with F0 = (0.7683, 0.5088, 0.1499). A rim light is a fifth gold that no grep can find.

What replaces the fill is **the IBL at 0.285 with per-material intensity** (A.3). The difference is that an IBL fills by solid angle and by surface orientation, so it falls off, and a directional fill does not.

### B.2 The key

```js
const key = new THREE.DirectionalLight(0xfff1e2, KEY_BASE);   // KEY_BASE = 4.80
key.position.set(-7.300, 7.070, 3.600);
key.target.position.set(0.000, 1.070, 0.000);
key.castShadow = true;                                        // A.5
scene.add(key);
scene.add(key.target);                                        // three requires this
```

| property | value | why |
| --- | --- | --- |
| colour | `0xfff1e2` | 5400 K with a hair of straw. Linear (1.0000, 0.8963, 0.7758). Warm enough that the gold's own hue is reinforced rather than fought, neutral enough that the steel does not go sepia. The current `KEY_WARM` is warmer and it is why the bone-white body currently reads as cream. |
| `KEY_BASE` | **4.800** | the base intensity before `keyScale` and `keyMul`. Never lowered to fix a clipping failure (I.4). |
| position | (-7.300, 7.070, 3.600) | 10.112 units from the target |
| target | (0.000, 1.070, 0.000) | mid-height on the machine's centre line, between the bed deck at 0.000 and the housing top at 1.760 |
| unit vector to light | (-0.72193, 0.59336, 0.35602) | the constant this whole section is about |

**Both the position and the target are fixed in world space for the entire page.** The light never moves, never re-aims, never tracks the camera and never tracks the rig. That is what makes a fourteen-stop camera move read as walking around a lit object instead of as an object rotating under a fixed lamp.

The height matters: 7.070 against a target at 1.070 is **6.000 units of rise over 8.153 units of ground run, an elevation of 36.4 degrees.** Lower and the bed's front-top chamfer takes no light at the hero; higher and the funnel's three turned steps stop being square to the key at chapter 1 and the concentric hairlines collapse into one. It sits from the **upstream left and slightly in front**, which is the same quarter as the reference's key and for the same reason: it puts the machine's working face into the light and its back into black.

### B.3 The rig geometry, and the fourteen angles it produces

The light-to-eye angle is the angle at the subject between the direction to the key and the direction to the camera. For a directional light it is constant across the whole scene, so it is a pure function of the stop's `az` and `el`:

```
eye(az, el) = (cos(el)·sin(az), sin(el), cos(el)·cos(az))
angle       = acos( eye · (-0.72193, 0.59336, 0.35602) )
```

Recomputed from the F.3 stop table and the light record in B.2:

| # | stop | az | el | light-to-eye | class |
| --- | --- | --- | --- | --- | --- |
| 0 | hero | 1.28 | 0.24 | **115.57** | back-key |
| 1 | bottleneck | 0.98 | 0.42 | **97.15** | cross-key |
| 2 | mapping | 1.05 | 0.68 | **88.63** | cross-key, the cleanest on the page |
| 3 | machine | 0.10 | 0.44 | **59.47** | frontal, **the single exception** |
| 4 | payoff | 0.95 | 0.22 | **103.97** | back-key |
| 5 | whofor | 1.10 | 0.30 | 106.56 | back-key |
| 6 | workflows | 2.03 | 0.98 | 87.45 | cross-key, plan |
| 7 | approach | 0.95 | 0.06 | 110.11 | back-key, raking |
| 8 | audit | 0.70 | 0.34 | 89.08 | cross-key |
| 9 | roi | 1.05 | 0.30 | 104.69 | back-key |
| 10 | why | 1.05 | 0.26 | 106.35 | back-key, on nothing |
| 11 | trust | 1.18 | 0.28 | 110.32 | back-key |
| 12 | faq | 1.12 | 0.26 | 109.00 | back-key |
| 13 | contact | 0.66 | 0.36 | 86.68 | cross-key |

Thirteen of fourteen fall inside [86.68, 115.57], comfortably inside I.6.13's [80, 120] window. Exactly one, stop 3, falls outside at 59.47, inside I.6.13's [55, 65] window. **The test passes as authored, which is the point: the stop table and the light record are one design, not two, and moving either without recomputing this table breaks the other.**

Run `I.6.13` on every change to `story-stops.ts`. It is nine lines of `vitest` and it is the cheapest insurance in the build.

**Why stop 3 is allowed to be the exception.** At 59.47 degrees the key is over the camera's shoulder, which is the one arrangement that lights a surface *toward* the viewer instead of across them. Everywhere else on this page that would be a failure, because a frontal key flattens form. At the macro it is the requirement: the gold barrel's collar chamfer has to be facing both the light and the lens at once for the specular to land in frame at all, and a cross-key at that distance puts the blown band on the far side of the barrel where the camera cannot see it. **One frontal frame in fourteen is a decision. Two would be a habit.**

### B.4 `KEY_SCALE`, per stop

`keyScale` is a per-stop scalar, blended between stops by the same `smoothstep` the camera channels use (F.4), so the key ramps with the move rather than stepping at a boundary.

| # | stop | `keyScale` | what it buys |
| --- | --- | --- | --- |
| 0 | hero | **0.62** | the establishing frame is the darkest establishing frame the page can carry. One 384 mm hairline, one 2.48 mm arc, nine rim segments, and nothing else above the IBL floor. |
| 1 | bottleneck | **1.00** | full key. One of the two beats that must read. |
| 2 | mapping | **0.74** | a deliberate 26 percent step down. The chapter's payload is an unlit periwinkle line and the metal has to get out of its way. |
| 3 | machine | **1.00** | the second full-key beat, and the only frame allowed to clip. |
| 4 | payoff | **0.86** | plus the strike, B.5. |
| 5 | whofor | 0.70 | |
| 6 | workflows | 0.66 | a near-plan view puts the bed's whole top face square to the key; 0.66 keeps it off the ceiling. |
| 7 | approach | 0.82 | raking along the belt at el 0.06; the slats need the key. |
| 8 | audit | 0.78 | |
| 9 | roi | 0.80 | |
| 10 | **why** | **0.30** | the absence beat. The camera is in empty space and there is nothing in frame to light. 0.30 exists so that the return at stop 11 is a **lift**, not a resumption. |
| 11 | trust | 0.68 | |
| 12 | faq | 0.60 | |
| 13 | contact | 0.92 | closes on the gold grip behind the CTA. The fourth gold is the button; this is the second. |

Under `prefers-reduced-motion: reduce`, `keyScale` and `keyMul` are **both forced to 1.00** at the parked coordinate (F.9). The parked frame is not a dimmed frame.

### B.5 The strike

The key strikes once, on the frame the fourth slab seats, and then settles below its own resting level. It is the only non-monotone light event on the page and it is a pure function of `coord`.

```js
const seatIn   = (c) => smoothstep(3.62, 3.78, c);   // the strike rises
const seatOut  = (c) => smoothstep(3.78, 4.06, c);   // and settles
const strike   = (c) => seatIn(c) * (1 - seatOut(c));

const keyMul   = (c) => mix(mix(1.000, 1.420, seatIn(c)), 0.720, seatOut(c));

// The strike substitutes the base scale for the stop scale for the duration of
// the hold: a strike that is still being attenuated by its own chapter's
// keyScale is not a strike, it is a bump.
const scaleUsed = (c) => mix(KEY_SCALE_at(c), 1.000, strike(c));

key.intensity = KEY_BASE * scaleUsed(c) * keyMul(c);
```

Two checks, both against E.5:

| moment | `scaleUsed` | `keyMul` | intensity | published |
| --- | --- | --- | --- | --- |
| peak, `c` = 3.78 | 1.000 | 1.420 | 4.800 x 1.000 x 1.420 = **6.816** | 6.816 |
| rest, `c` >= 4.06 | 0.860 | 0.720 | 4.800 x 0.860 x 0.720 = **2.972** | 2.972 |

**Note the substitution and do not remove it.** Without it the peak is 4.800 x 0.860 x 1.420 = 5.862, and E.5's published 6.816 becomes wrong. The substitution is what makes a strike a strike: for 0.16 of a coordinate unit the key is at its own base and the chapter's attenuation is lifted, and then it drops to 72 percent of a scale that was already 86 percent, so the resting payoff frame is **dimmer than the frame that preceded the strike**. That drop is the whole gesture. A strike that returns to where it started is a flicker.

Because both windows are `smoothstep` on `coord`, **scrubbing back un-strikes it exactly**, which is what I.5 tests.

### B.6 What casts and what receives

Shadow assignment is not "everything true". Every `castShadow` is one more object in the shadow pass and every one of them has to earn a contact.

| part | `castShadow` | `receiveShadow` | why |
| --- | --- | --- | --- |
| bed plates (3) | no | **yes** | the ground truth surface. Everything lands here. |
| T-slot channel walls and floors | no | **yes** | the slot floors are where the hard contact is most legible |
| skirt rails, parting slab | no | yes | |
| feet (4) | **yes** | no | the four hard contacts under the bench. This is the whole reason the map exists. |
| housing body | **yes** | yes | |
| lid | **yes** | no | at chapter 2 the lifted lid throws a rectangle onto the cavity below it, and that shadow is what tells you the lid is 34 mm up rather than painted |
| funnel, throat, rim | **yes** | yes | |
| belt band | no | **yes** | |
| slats | no | no | 34 casters for a 0.44 mm chamfer is 34 objects of shadow-pass cost for nothing |
| rollers | no | no | |
| handle boss, stem | **yes** | yes | |
| grip | **yes** | no | |
| billet | **yes** | no | the billet's shadow inside the funnel throat at chapter 1 is what seats it |
| slabs | **yes** | **yes** | they stack, and a stack without inter-slab contact is a stack of decals |
| tray | no | **yes** | |
| status channel, route tube | no | no | both are `MeshBasicMaterial`, both are `toneMapped: false` |

**Twelve casters, ten receivers.** The reference ships zero of each and paints nothing; we add exactly the set that replaces the painted ellipse and stops there.

### B.7 Which edge carries the read, per chapter

This is the table I.1's remedy (b) points at. **Each chapter has exactly one named edge, and if the greyscale thumbnail test fails, this edge's chamfer radius is what moves, not the key and not the environment.**

| chapter | the edge that carries the read | radius | material | computed px at 1440x900 DPR 1 |
| --- | --- | --- | --- | --- |
| 0 hero | the bed's front-top chamfer, one unbroken 384 mm run | 0.038 | `mBedTop`, roughness 0.345 | **2.75** |
| 1 bottleneck | the funnel's three step fillets, concentric, at radius 1.280 / 1.000 / 0.720 | 0.014 | `mFunnel`, roughness 0.344 | **1.58**, rescued by count |
| 2 mapping | the lid's chamfer, the full 124 x 79 mm perimeter at once | 0.062 | `mLid`, roughness 0.345 | **4.67** |
| 3 entry | the slats' leading chamfer, eight of them in frame | 0.011 | `mSlat`, roughness 0.258 | **2.03** |
| 3 terminal | the grip's collar chamfer, plus five knurl root fillets | 0.030 / 0.004 | `mGoldGrip`, roughness 0.220 | **19.5** / **2.60** |
| 4 payoff | four slab chamfers, one clean 17.7-degree band each | 0.026 | `mSlab`, roughness 0.320 | **1.33**, and it fails I.2 as authored |

The widths come from I.2's own formula, `px = radius · 2·atan(roughness) · (viewportHeight / frameHeight) · DPR`, and **the roughness values in C.2 were chosen to produce them, not the other way round.** That is why `mBedTop` and `mLid` sit at 0.345 while `mFunnel` sits at 0.344: a surface-ground flat and a single-point-turned cone are genuinely different finishes, and one thousandth of roughness is the difference between the published 1.58 px and 1.59 px on the chapter 1 row. The document states four decimals because at this scale the fourth decimal is visible.

**What stays in shadow, per chapter, stated as an instruction rather than an outcome:**

| chapter | lit | black, deliberately |
| --- | --- | --- |
| 0 hero | the bed's front-top chamfer; 40 percent of the lid's fillet arc; 9 of 24 rim segments | the entire belt, both housing flanks, the tray's interior, the whole downstream half of the bed's top face |
| 1 bottleneck | the funnel's inner cone and its three steps; 11 of 24 rim segments | the billet (this is the point), the lid seen edge-on, the belt, the handle, the tray, everything downstream of x 0.000 |
| 2 mapping | the lid's chamfer perimeter, floating; the bed's top face at 0.74 key | the opened cavity at env 0.063; both T-slot channels; the housing's interior walls; the funnel's outside |
| 3 entry | eight slat chamfers; one passing slab's top chamfer | the belt band between the slats, the stem's flat, the bed below |
| 3 terminal | the grip's collar chamfer and five knurl threads | everything else in the 24.0 mm frame |
| 4 payoff | four slab chamfers; the 384 mm status channel | the intake at attention 0.40; the empty funnel mouth; the housing; the bed's upstream half |

---

## C. MATERIALS

### C.1 THE OVERRIDE: metalness is not zero, and this is deliberate

**`docs/agora-rebuild-spec.md` section F.3 states, as an anti-slop hard constraint: "`metalness === 0` on every part **including the gold**. Grep for `metalness` and confirm every hit is `0`." The comment at `story-machine.tsx:523-525` restates it: "this is candy gold, a coloured plastic with a clearcoat, not a metal. A metallic gold under a room environment goes muddy against a dark page and reads as chrome."**

**That rule is overridden by this document. It is not being forgotten, it is being reversed, with the reason stated so that the next engineer does not fix it back.**

The rule was written to solve a real problem and it solved it the wrong way. The problem is that a metal with `metalness: 1` and a weak, uniform environment has almost nothing to reflect, so it goes dark and colourless: muddy, exactly as the comment says. The rule's diagnosis was correct. Its remedy, forcing every surface to be a dielectric, has three consequences that this build cannot survive:

1. **A dielectric's specular is white.** At `metalness: 0` three uses F0 = 0.04 achromatic for every material regardless of `color`. The gold's highlight is therefore a *white* highlight sitting on a yellow diffuse. That is what plastic is, and it is why the current object reads as moulded. Gold's entire identity is that its specular is coloured: F0 = its own linear albedo, (0.7683, 0.5088, 0.1499). **You cannot make gold at `metalness: 0` under any light, at any exposure, with any amount of clearcoat.** The rule bans the one thing that would work.
2. **The clearcoat that was added to compensate makes it worse, nine times over** (G.4). A clearcoat is a second specular lobe with a white F0 layered on top of the first, so every clearcoated part on the object now carries two white highlights instead of one. Nine parts carry the pair.
3. **The emissive that was added to compensate for that** (`GOLD_EMISSIVE = 0x6a4c12` at intensity 0.12) is light the material did not earn, it is not affected by the key, it does not go dark when the object turns away, and it is therefore the single clearest tell of a cheap 3D scene (G.6).

**The actual fix is the one the reference used: keep the metal, and fix the environment.** `metalness: 1.00` plus a real PMREM-baked `RoomEnvironment` plus a per-material `envMapIntensity` of 1.35 gives the gold something to reflect, and then it is gold: F0 coloured, specular tinted, dark where the environment is dark, blown warm where the key hits. E.4's whole payoff, a 0.52 mm arc of blown gold at 19.5 device pixels that never clips to magenta and never loses its tint, is arithmetically unreachable at `metalness: 0`.

**So:** the grep in `agora-rebuild-spec.md` F.3 is deleted along with the rule, and the vocabulary that justified it goes with it (G.24). Step 12 updates that document to say so.

### C.2 The seventeen materials

Every material is `MeshPhysicalMaterial` except the two unlit exceptions (`mChannel`, `mRoute`), which are `MeshBasicMaterial` with `toneMapped: false`. **There are no textures, no maps of any kind, no emissive, no clearcoat, no sheen, no transmission and no `flatShading` anywhere in this table.** `envMapIntensity` is the authored base; the value actually written each frame is `base x ATTENTION[stop][station]` per C.3.

| # | name | station | hex | metal | rough | env | the finish it is |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `mBedTop` | bed | `#5b6068` | 0.90 | **0.345** | 0.72 | surface-ground cast-iron bench top, oiled. Carries the 384 mm front chamfer at 2.75 px. |
| 2 | `mBedSide` | bed | `#4e525a` | 0.90 | 0.470 | 0.60 | the same iron, bead-blasted on the vertical faces and the feet. Rougher than the top because a ground face and a blasted face are not the same face. |
| 3 | `mSeam` | (inherits) | `#050608` | 0.00 | 0.950 | **0.22** | the undercut. Every parting line, every T-slot floor, the lid's underside pocket, the cavity floor. 0.22 x 0.285 = **0.063** effective, a sixteenth of the key, so it is a genuine hole and not a dark grey. |
| 4 | `mHousing` | housing | `#2a2e34` | 0.85 | **0.440** | 0.58 | Type II anodise, matte, on the housing flanks and the handle stem. Reads RGB 9 on the stem's flat at the macro. |
| 5 | `mLid` | housing | `#31363d` | 0.85 | **0.345** | 0.66 | the same anodise, then skimmed. The lid's top face and its 0.062 chamfer are the only lapped surface on the housing, which is why the perimeter lights at once at chapter 2 and the flanks do not. |
| 6 | `mFunnel` | intake | `#646a73` | 0.92 | **0.344** | 0.78 | single-point-turned tool steel, `side: DoubleSide` because the cone's inside wall is the whole of chapter 1. One thousandth smoother than `mBedTop`: see B.7. |
| 7 | `mThroat` | intake | `#4a4f57` | 0.92 | 0.400 | 0.52 | the hardened sleeve inside the throat. Darker and rougher so the billet has something to be dark against without competing with the steps. |
| 8 | `mGoldRim` | intake | **`#e3bd6c`** | **1.00** | 0.260 | 1.20 | **GOLD 1 of 4.** 24 segments. Slightly rougher than the grip so eleven of them spread into a travelling arc rather than eleven point flashes. |
| 9 | `mGoldGrip` | handle | **`#e3bd6c`** | **1.00** | **0.220** | **1.35** | **GOLD 2 of 4.** Polished, knurled. F0 = linear (0.7683, 0.5088, 0.1499). The one material on the page permitted to clip. |
| 10 | `mBelt` | belt | `#101318` | 0.00 | 0.780 | **0.30** | filled nitrile. Effective env at the hero is 0.30 x 0.44 = **0.132** and it genuinely disappears; at the macro it is 0.30 x 1.00 and reads RGB 11. |
| 11 | `mSlat` | belt | `#6d727a` | 0.88 | **0.258** | 0.62 | ground hardened-steel slats. The roughness is set by I.2's chapter 3 entry row: 0.258 yields exactly 2.03 px on a 0.011 chamfer, against a 2.00 floor. |
| 12 | `mRoller` | belt | `#585d65` | 0.90 | 0.380 | 0.55 | turned drum, radius 0.150 = the belt's half-height exactly (I.6.10). |
| 13 | `mBillet` | stock | `#54585f` | 0.20 | **0.880** | 0.52 | hot-rolled stock with mill scale on it. **At 0.880 its peak specular return is of order 0.09 linear against the funnel fillets' 3.0.** It physically cannot hold a highlight from any camera position, which is how the reader reads *stuck* from an absence of light rather than from a caption. |
| 14 | `mSlab` | tray | `#77797a` | 0.90 | **0.320** | 0.70 | the finished part: milled flat, deburred, 0.026 chamfer all round. **F0 average 0.1896.** The one material that visibly *can* do what `mBillet` cannot, in the same frame, under the same light. |
| 15 | `mTray` | tray | `#4b4f57` | 0.88 | 0.520 | 0.48 | folded and blasted sheet. Deliberately duller than the slabs it holds: at the payoff the four chamfers must be the brightest objects in the frame, and a bright tray would take that. |
| 16 | `mChannel` | (none) | **`#e3bd6c`** | `MeshBasicMaterial`, `transparent`, `depthWrite: false`, `toneMapped: false` | | | **GOLD 3 of 4.** The status channel. Opacity is `clamp01(0.10 + 0.72 · smoothstep(2.55, 3.60, c))` per F.8 and nothing else about it animates. `toneMapped: false` so a 0.82 opacity hairline is 0.82 of `#e3bd6c` on screen and not 0.82 of whatever ACES did to it. |
| 17 | `mRoute` | (none) | **`#7ea2ff`** | `MeshBasicMaterial`, `transparent`, `depthWrite: false`, `toneMapped: false` | | | **PERIWINKLE 1 of 2.** The route tube, drawn by `setDrawRange` per F.8. |

**Remedies, in the order they are permitted (I.4):**

- If the payoff frame exceeds the 0.15 percent clip cap, raise `mSlab` roughness from 0.320 toward 0.360 in steps of 0.005 and re-measure. Only if that fails, lower `mSlab` metalness from 0.90 toward 0.80.
- If the macro terminal frame exceeds it, lower `mGoldGrip` `envMapIntensity` from 1.35 in steps of 0.05 to a floor of **1.15**. Below 1.15 the metal has nothing to reflect and goes muddy, which is the failure C.1 exists to prevent.
- **Never lower `KEY_BASE`. Never raise `toneMappingExposure`. Never touch a material's hex.**

### C.3 ATTENTION: the per-station environment ramp

Every material belongs to one of seven **stations**. Each frame, each material's `envMapIntensity` is written as:

```js
mat.envMapIntensity = ENV_BASE[mat] * blend(ATTENTION, coord, station);
```

where `blend` is the same `smoothstep(0, 1, coord - i)` the camera channels use (F.4), so the ramp moves with the camera rather than stepping at a boundary. `mSeam` follows whichever station it is a part of.

**This is the tuning knob for I.1 and I.3, and it is the only one.** If a chapter's greyscale thumbnail fails, raise the ATTENTION value of the station that carries the read. If a stop's darkness percentage falls outside its band, move the ATTENTION row for that stop. **Never the light, never the exposure.**

| # | stop | intake | bed | housing | belt | handle | tray | stock |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | hero | 0.52 | **1.00** | 0.48 | **0.44** | 0.40 | **0.40** | 0.46 |
| 1 | bottleneck | **1.00** | 0.42 | 0.38 | **0.34** | **0.34** | **0.34** | 1.00 |
| 2 | mapping | 0.66 | 0.62 | **1.00** | 0.44 | 0.36 | 0.36 | 0.30 |
| 3 | machine | 0.30 | 0.40 | 0.42 | **1.00** | **1.00** | 0.52 | 0.86 |
| 4 | payoff | **0.40** | 0.66 | 0.44 | 0.72 | 0.62 | **1.00** | 1.00 |
| 5 | whofor | 0.60 | 0.72 | 0.60 | 0.60 | 0.50 | 0.58 | 0.62 |
| 6 | workflows | 0.58 | 0.86 | 0.62 | 0.70 | 0.48 | 0.56 | 0.60 |
| 7 | approach | 0.34 | 0.62 | 0.44 | **1.00** | 0.58 | 0.50 | 0.72 |
| 8 | audit | **0.94** | 0.46 | 0.42 | 0.36 | 0.34 | 0.34 | 0.40 |
| 9 | roi | 0.30 | 0.52 | 0.36 | 0.54 | 0.44 | **1.00** | 0.90 |
| 10 | why | 0.28 | 0.28 | 0.28 | 0.28 | 0.28 | 0.28 | 0.28 |
| 11 | trust | 0.62 | 0.74 | 0.62 | 0.58 | 0.52 | 0.60 | 0.60 |
| 12 | faq | 0.54 | 0.66 | 0.54 | 0.52 | 0.46 | 0.52 | 0.52 |
| 13 | contact | 0.30 | 0.40 | 0.44 | 0.46 | **1.00** | 0.36 | 0.34 |

**Floor 0.28, ceiling 1.00.** Nothing is ever ramped above its authored base, so C.2's table is a genuine ceiling and no station can surprise you by getting brighter than the material says it can. Nothing is ever ramped to zero, because a station at zero is a hole in the machine and the hero frame's whole job is that this is one machine.

Three published values are load-bearing and must not drift:

- `belt` at stop 0 is **0.44**, so `mBelt` effective env is 0.30 x 0.44 = **0.132** (E.1).
- `belt` at stop 3 is **1.00**, so `mBelt` effective env is **0.30** and it reads RGB 11 (E.4).
- `housing` at stop 2 is **1.00**, so `mSeam` on the cavity floor is 0.22 x 1.00 x 0.285 = **0.063** (E.3).

And one is the payoff's whole point: `intake` at stop 4 is **0.40** against 1.00 at stop 1, so the 24 rim segments return **under half** of what they did at chapter 1 and the mouth has visibly gone quiet without anything having moved (E.5).

### C.4 What is not in the material system

- **No `emissive`, no `emissiveIntensity`, no `emissiveMap`, anywhere.** `grep -cE "emissive" story-machine.tsx` returns 0 (step 5).
- **No `clearcoat`, no `clearcoatRoughness`.** Same grep, same 0.
- **No `sheen`, no `sheenColor`, no `sheenRoughness`.**
- **No `transmission`, no `thickness`, no `ior`, no `attenuationColor`.**
- **No `instanceColor`.** The current build lerps the finished blocks 35 percent toward `#efd49b` on the payoff. A part does not change colour when it is finished; it changes *finish*, and `mSlab` at roughness 0.320 against `mBillet` at 0.880 is that difference stated as a material rather than as a tint.
- **No `flatShading` and no `computeVertexNormals`.** Every geometry in D is built by a three primitive that already carries correct normals, and calling `computeVertexNormals` on any of them replaces a correct smoothing group with an averaged one and softens the exact chamfers this document is about. I.6.11 greps for both.
- **No `vertexColors`, no `AlphaMap`, no `side: DoubleSide`** except `mFunnel`, which needs it because the cone is open and chapter 1 is a shot of its inside wall.

---

## D. GEOMETRY AND CRAFT

This is the section that stops it reading as three.js primitives. It is also the longest step in section H, and I.10 says out loud that if the schedule will not carry it done properly, do not start step 1.

**The thesis, in one sentence: nothing on this object is a shape, everything is a shape plus the operation that made it.** A bed is a plate plus a ground top face plus a chamfer plus two T-slots plus an undercut parting line plus four feet. A lid is a plate plus a spigot plus four counterbores plus a machined pocket you can only see once it is lifted. **A primitive with a rounded corner is a toy; a primitive with a named machining operation on every edge is a part.** The difference costs about 18,000 triangles and it is the whole build.

### D.0 The radius and segment ladder

**`BOX_SEG`, `BODY_SEG` and `SMALL_SEG` are deleted** (G.22). A uniform segment budget spends the same tessellation on a 0.004 knurl fillet as on a 0.062 lid chamfer, which simultaneously wastes triangles on the small feature and facets the large one. Segments are a function of radius:

| feature class | radius range | `RoundedBoxGeometry` segments, tier 2 | tier 1 | on this object |
| --- | --- | --- | --- | --- |
| structural chamfer | >= 0.050 | **8** | 5 | lid 0.062 |
| primary chamfer | 0.030 to 0.049 | **6** | 4 | bed top 0.038, grip collar 0.030 |
| secondary chamfer | 0.012 to 0.029 | **4** | 3 | slab 0.026, funnel step 0.014 |
| hairline fillet | < 0.012 | **3** | 2 | slat 0.011, knurl root 0.004 |

Lathed and revolved parts carry their own radial counts, and they are the largest single line in the budget because a faceted cone is a faceted cone at every stop:

| part | radial segments, tier 2 | tier 1 |
| --- | --- | --- |
| funnel cone and its three steps | **96** | 48 |
| grip barrel | 48 | 32 |
| throat sleeve, feed duct | 32 | 24 |
| rollers, boss, counterbores, feet | 32 | 24 |
| one intake rim segment | 12 | 8 |
| route tube | 8 sides, 96 length | 6, 64 |

Tier 1 drops each class by one step with a floor of 2. **There is no `isMobile` branch and no media query anywhere in the geometry: the preset comes off the tier probe** (step 10).

### D.1 The master dimension table

All figures in world units. 1 unit = 40 mm.

| | x | y | z |
| --- | --- | --- | --- |
| bench overall | -4.800 to 4.800 (**9.600 = 384 mm**) | -0.820 to 2.960 (3.780) | -1.360 to 1.360 (2.720) |
| bed plate | ±4.800 | **-0.440** to **0.000** | ±1.360 |
| skirt | ±4.800 | -0.740 to -0.440 | ±1.360 |
| feet (4) | ±4.180 | -0.820 to -0.740 | ±1.100 |
| housing body | -2.100 to 1.600 (**3.700 = 148 mm**) | **0.000** to **1.760** | ±1.1875 (2.375) |
| lid | -1.800 to 1.300 (**3.100 = 124 mm**) | **1.760** to 1.940 | ±0.9875 (**1.975 = 79 mm**) |
| funnel apex | -2.900 | **1.680** | 0.000 |
| funnel mouth | radius **1.280** (**2.560 = 102.4 mm**) | **2.960** | |
| intake rim | mean radius 1.280, 24 segments | top face **2.960** | |
| belt | **-1.200** to **2.920** | **0.000** to 0.300, slats to **0.360** | ±0.760 |
| grip barrel axis | **1.860** | **1.830** | 0.680 to end face **1.090** |
| tray | **3.300** to **4.660** | 0.000, floor top **0.140**, walls to 1.040 | ±0.680 |

**The five planes that are asserted, and where each appears** (I.6.3):

| plane | count | the two or three parts whose position expression contains it |
| --- | --- | --- |
| **-0.440** | 3 | bed plate underside; skirt rail top face; parting slab top face |
| **0.000** | 4 | bed deck top face; belt band underside; housing body underside; tray base underside |
| **1.760** | 2 | housing body top face; lid underside |
| **1.640** | 2 | lid spigot bottom face (the rebate floor); the four counterbore seats |
| **0.140** | 3 | tray base top face; slot 0 bottom; slab 0 underside |

**These are not comments, they are the same float literal typed into two or three different position expressions,** and the unit test greps for the count. A seam that is described as touching and is actually 0.004 apart is a lit hairline the art direction did not ask for, and at 109 px per unit at the hero stop that is half a device pixel of white in a frame that is 74 percent black. It is the single most visible class of error on this object.

### D.2 The bed: three plates

`RoundedBoxGeometry` x 3, split by the two T-slots so that the top face reads as **three bands** rather than one slab (E.3).

- **centre plate** 9.600 x 0.440 x 1.720, `z` ±0.860. Carries the housing, the belt and the tray.
- **outer plates** 9.600 x 0.440 x 0.412, `z` 0.948 to 1.360 and -1.360 to -0.948. Merged into one draw call.
- **Top-face chamfer radius 0.038** (1.52 mm) on all four top edges of all three plates, at 6 segments per D.0.

The front long edge of the front outer plate is **the single longest bright line the page ever shows**: one unbroken 384 mm run at **2.75 device pixels** at the hero stop. Nothing may interrupt it. No fastener, no label, no boss, no logo, no break. That constraint is why the four feet are inboard at `x` ±4.180 and why the skirt end rails butt rather than lap.

Material: `mBedTop` on the top faces and the chamfer, `mBedSide` on the four vertical faces. Two materials on one plate is one extra draw call the budget does not have, so **the split is done by geometry groups on a single merged buffer**, not by two meshes. `receiveShadow` on all three.

### D.3 The T-slot channels

Two, running the full 9.600 length, centred at `z` = ±0.904. They are the reason the bed reads as a machine bed and not as a shelf, and at chapter 2 they are **two dead-black horizontals cutting the bed into three bands** at 88.6 degrees, which is exactly what a plan view of a machine bed looks like.

| feature | value | mm |
| --- | --- | --- |
| mouth width | 0.088 | 3.52 |
| mouth depth | 0.140 | 5.60 |
| throat width | 0.152 | 6.08 |
| total depth | 0.220 | 8.80 |
| mouth edge break | 0.006 | 0.24 |

Modelled as a real T: two mouth walls down to `y` -0.140, then the undercut shoulders, then the throat walls and the floor at `y` -0.220. Floors and undercut faces are **`mSeam` at env 0.22**, so at 0.063 effective they are genuinely black and the slot has depth rather than being a painted stripe. Merged into one draw call, `receiveShadow` on.

### D.4 The skirt, the parting slab, the feet

The bed does not sit on the ground. It sits on a skirt, the skirt is parted from the plate by an undercut, and the whole thing stands on four milled feet. This is the assembly that **replaces the painted contact ellipse** (G.7).

- **Skirt rails**, four, from `y` -0.740 to -0.440, 0.120 thick. Side rails run at `z` = ±1.300 from `x` **-4.460 to 4.460**. End rails run at `x` = ±4.630 and span the full depth, **butting the side rails at exactly ±4.460** with zero overlap and zero gap (I.6.4). Merged, one call.
- **Parting slab**, 9.552 x 0.016 x 2.672, **inset 0.024 on both axes** (I.6.5), top face at `y` **-0.440**. `mSeam`. It is 0.64 mm of shadow between the plate and the skirt, and it is the reason the bench reads as two machined parts bolted together rather than one extruded block. **It is not a drawn line. It is a recessed slab that goes dark because it is recessed.**
- **Feet**, four, Ø0.240 x 0.080, at (±4.180, ., ±1.100), bottom faces at `y` **-0.820**, which is the object's lowest point and the low bound of `FIT_ALL` exactly. `InstancedMesh`, count 4, `castShadow`. **These four are the only casters that matter at the hero stop**, and their four hard contacts under a 384 mm bench are what sit the object on the page.

### D.5 The housing body

3.700 x 1.760 x 2.375, spanning `x` -2.100 to 1.600, sitting on the deck at `y` **0.000**, top face at `y` **1.760**. 148 x 70.4 x 95 mm.

- **Corner radius 0.028** on the four vertical edges, **chamfer 0.020** on the bottom edge where it meets the deck. Both small: this is a fabricated housing, not a moulding, and a large radius on a 148 mm block reads as plastic.
- **Lid rebate**, 3.140 x 0.120 x 2.015, cut into the top face down to `y` **1.640**. The lid's spigot drops into it. The rebate's 0.300 end lands and 0.200 side lands are what the four counterbores go into.
- **The engine mouth**, on the +x face at `x` 1.600: an opening 1.640 wide x 0.480 tall from `y` 0.000 to 0.480, with a 0.040 chamfer all round its perimeter and a 0.060 return flange. The belt runs out of it. **This is the mouth slab 0 has nosed 33 mm out of at chapter 3** (E.4), and the 33 mm is 0.825 units of slab travel past `x` 1.600.
- **Four counterbores**, Ø0.180 x 0.120 deep, seats at `y` **1.640**, at (`x` -1.950 and 1.450, `z` ±0.940). `InstancedMesh`, count 4. Their walls are `mSeam` and their seats are `mHousing`, so at chapter 2 they are four small black discs in the lid land: **the cheapest possible proof that the lid comes off with a tool and not with a hand.**
- **The cavity**, from the rebate floor at 1.640 down to a floor plate whose top face is at `y` 0.900, internal 3.040 x 1.915. Walls and floor are all `mSeam`. At chapter 2 it is **0.740 units, 29.6 mm, of genuine hole under a bright floating rectangle**, at effective env 0.063.

### D.6 The lid

3.100 x 0.180 x 1.975, underside at `y` **1.760**, top face at `y` 1.940. **124 x 79 mm, and the perimeter of that rectangle is the whole of chapter 2's light.**

- **Chamfer radius 0.062** (2.48 mm) on the full top perimeter, at 8 segments per D.0. At 88.6 degrees with the camera nearly overhead this lights **all the way round at once at 4.67 device pixels**, which is the only closed bright shape anywhere on the page. At the hero stop, seen from 115.6 degrees, the same chamfer takes a band across roughly 40 percent of its perimeter, which is the front-left fillet arc E.1 names.
- **Spigot** 3.040 x 0.120 x 1.915, descending from the underside at 1.760 to **1.640**. A 0.012 relief groove runs round its root so the lid seats on its land and not on its spigot, which is what a located lid does.
- **Underside pocket**, 2.900 x 0.100 x 1.775, `mSeam`. Only visible once the lid lifts 0.860 along its own up-normal, which is the point: chapter 2 shows you an *inside*, and an inside that is a flat plate is not an inside.
- `castShadow` on. At chapter 2 the lifted lid throws a hard rectangle onto the cavity 34 mm below it, and that shadow is what states the lift is real rather than painted.

### D.7 The funnel: three turned steps

A **45.000-degree** cone of revolution with its apex at (-2.900, **1.680**, 0.000), lathed at 96 radial segments, `mFunnel`, `side: DoubleSide`.

| step | radius | height `y` | fillet radius | as mm |
| --- | --- | --- | --- | --- |
| 1, the mouth lip | **1.280** | **2.960** | 0.014 | Ø102.4 |
| 2 | **1.000** | **2.680** | 0.014 | Ø80.0 |
| 3 | **0.720** | **2.400** | 0.014 | Ø57.6 |

Each step is a real turned shoulder: a 0.030-wide horizontal land, a 0.014 root fillet, then the 45-degree wall resumes. **Because the cone is 45 degrees and the key sits at 36.4 degrees of elevation, all three shoulders are square to the light at chapter 1 and each throws its own concentric hairline.** That is why the intake reads as a turned cone with three passes on it rather than as a smooth horn, and it is why the chapter 1 read survives at 1.58 px per fillet: it is rescued by **count**, not by width.

Below step 3 the cone continues uninterrupted to radius 0.200 at `y` 1.880 and meets the throat sleeve.

**The funnel group's pivot is the throat sleeve's register shoulder at `y` 1.6475**, not the world origin and not the bed deck. That matters: the chapter 1 Y scale of 1.000 to 0.988 lowers the mouth lip, which stands 1.3125 units above the pivot, by 0.01575 units, and 0.01575 units is **0.63 mm**. A real compression of a real amount, and the pivot is why. The 1.4-degree rim tilt is applied at the same node, about the same shoulder.

### D.8 The throat sleeve and the billet seat

- **Throat sleeve**, a hardened bush, bore Ø0.400 (16 mm), outer Ø0.520, from `y` 1.880 down to `y` 0.360 where the feed duct takes over. `mThroat`, 32 radial segments. A 0.024 entry chamfer at its top.
- **Feed duct**, Ø0.520, from `y` 0.360 into the housing's upstream face at `x` -2.100. 32 segments.

**The billet seat.** The billet is a sphere of base radius **0.29939** resting in a cone of half-angle 45.000 degrees whose apex is at `y` 1.680. The sphere's centre is therefore at

```
seatY = coneApexY + billetRadius / sin(coneHalfAngle)
      = 1.680 + 0.29939 / 0.70710678
      = 1.680 + 0.4234002
      = 2.1034002        ->  2.1034
```

which is E.2's published seat height to four decimal places, and I.6.2 asserts it. The contact circle is at radius 0.29939 x cos 45 = 0.21170, at `y` 1.89170.

**The radius is 0.29939 and not 0.300, and that is deliberate.** 0.300 puts the seat at 2.10426. The seat height is the number the camera is aimed at, the number the drop animation lands on, and the number I.6.2 asserts, so **the radius yields to it**, not the other way round. 0.29939 units is 11.976 mm, which is a 24 mm bar to any tolerance a bench cares about.

The billet's Ø23.95 mm against the throat's Ø16.0 mm bore is why it does not go through. That ratio is the entire content of chapter 1 and it is arithmetic, not staging.

### D.9 The intake rim: 24 gold segments

The **first gold**. A ring of 24 discrete machined segments, `InstancedMesh`, `mGoldRim`, seated in a 0.112 wide x 0.060 deep rebate in the funnel's top lip with their top faces flush at `y` **2.960**.

| quantity | value |
| --- | --- |
| segment count | 24 |
| mean radius | **1.280** |
| pitch at the lit radius 1.276 | 2 pi (1.276) / 24 = 0.334056 |
| segment arc | 0.319896 |
| **gap** | **0.014160** (I.6.9 asserts 0.01416 +/- 0.0002) |
| lit chamfer band | 0.052 tall, at radius 1.276 |
| one lit face at stop 1 | 0.319896 x 0.052 units = **54.6 x 8.9 device px** |

**They are 24 separate parts with 24 real gaps, not a `TorusGeometry` with a gold material on it.** A torus lights as one continuous ring and reads as a decorative bezel. Twenty-four segments light as an *arc* whose length is a function of where the camera is: nine of them at the hero, eleven at chapter 1, and at the payoff the same 24 at attention 0.40 returning under half of what they did, which is how the mouth visibly goes quiet without anything moving. **The gap is what makes it a count instead of a glow.**

The 0.567 mm gaps also do the one thing a bezel cannot: they let the black funnel show through the ring at every angle, so the rim never closes into a solid bright shape and never competes with the lid's closed rectangle at chapter 2.

### D.10 The belt: band, 34 slats, 2 rollers

- **Band** 4.120 x 0.300 x 1.520, spanning `x` **-1.200 to 2.920** and `z` ±0.760, which is `FIT_BELT` exactly. `mBelt`, `receiveShadow`. Edge radius 0.014.
- **Rollers**, two, radius **0.150**, length 1.520, axes along `z`, centres at `x` -1.050 and 2.770. **The radius equals the band's half-height exactly** (I.6.10), so the band wraps them with no step and no interpenetration, and `rollerRotation = slatTravel / 0.150` radians is then geometrically true rather than approximately true. `InstancedMesh`, count 2, 32 segments.
- **Slats**, 34, `InstancedMesh`, `mSlat`. Cross-section 0.088 x 0.060 x 1.480, standing 0.060 proud of the band so their tops are at `y` **0.360**, which is `FIT_BELT`'s upper bound. **Leading-edge chamfer radius 0.011** (0.44 mm), 3 segments.

**Pitch 0.114** (4.56 mm). 34 x 0.114 = 3.876, against a roller-centre span of 3.820, so the run is always fully populated with one slat's worth of overhang tucked behind the downstream roller. That is why F.8's wrap is `modulo 0.114` and not modulo the loop length: **every slat sits at `x0 + i x 0.114`, and the only thing that moves is one shared sub-pitch offset.** One `Matrix4` write per slat per frame, no accumulation, and reverse scroll is bit-identical because the offset is `f(tau)` and nothing else.

At the chapter 3 entry frame eight of the 34 are in shot, each taking its 0.44 mm hairline at **2.03 device pixels**. At the wide stops the same chamfer computes well under the 2.00 px floor and the slats are **designed to read as a striped band rather than as individual ticks**. I.2 records that honestly rather than calling it a pass.

### D.11 The slabs, and their travel

Five, `InstancedMesh`, `mSlab`. **1.140 x 0.180 x 1.140** with a **0.026 chamfer** on all twelve edges at 4 segments. 45.6 x 7.2 x 45.6 mm.

Position is a pure function of the belt clock `T = tau x 8.261`, in three phases, with no state carried between frames:

```
EMIT  = [ 4.900, 9.400, 13.100, 16.400, 21.900 ]     // belt-travel units
CARRY = 2.240                                         // mouth to tray lip
DROP  = 0.360                                         // lip to seated

s_i = T - EMIT[i]
if s_i <= 0            : hidden  (scale 0, no draw)
if 0 < s_i <= CARRY    : x = 1.600 + s_i          y = 0.450          z = 0
if CARRY < s_i         : v = clamp01((s_i - CARRY) / DROP)
                         x = mix(3.840, 3.980, v)
                         y = mix(0.450, 0.140 + 0.220 * i, power2In(v))
                         z = 0
```

`power2In` on the drop, not `power2Out`, so the slab **lands** rather than floats down. It is the same reasoning as the reference's closing 15 percent on `power4In`: a part that seats with weight is engineered, a part that eases to rest is animated.

Slot bottoms are **0.140 + n x 0.220** for n in 0..3 (I.6.7), so seated tops land at 0.320, 0.540, 0.760 and 0.980, each with 0.040 of clearance to the slot above it. Slab 3 seats at `c` = 3.70, which is **the frame the key strikes on** (B.5). Slab 4's `EMIT` is set so that at `c` = 4.06 it is still on the belt: four seated, one travelling, which is E.5's frame.

### D.12 The handle: boss, stem, knurled grip

The **second gold**, and the only object on the machine shaped for a hand.

- **Boss** Ø0.520 x 0.100, on the deck at (1.860, 0.000 to 0.100, 0.940). A 0.020 chamfer at its top edge and a 0.024 fillet at its root, because a post pushed into a plane is the tell that a build did not model its own joints. `mHousing`.
- **Stem** 0.180 x 1.730 x 0.180, from `y` 0.100 to **1.830**, `mHousing` at roughness 0.440. It rocks **-0.11 rad** about `x` across `smoothstep(2.55, 3.05, c)`. At the macro its flat reads **RGB 9** and it is the darkest large object in the terminal frame, which is what lets a 19.5 px gold band land at 253.
- **Grip barrel**, radius **0.170**, so **Ø0.340 = 13.6 mm**, axis along +z at (`x` 1.860, `y` 1.830), running from `z` 0.680 to an outboard end face at `z` **1.090**. 48 radial segments. `mGoldGrip`.
- **Collar chamfer radius 0.030** (1.2 mm) around the outboard end face.
- **Knurl**: five grooves, straight not diamond, pitch 0.060, depth 0.012, **root fillet radius 0.004** (0.16 mm), band from `z` 0.740 to 1.040. `InstancedMesh`, count 5. Each takes a 0.25 mm lit arc at **2.60 device pixels** at the terminal frame, so **the barrel reads as five parallel gold threads**.
- **Turn**: `1.05 * smoothstep(2.55, 3.05, c)` radians about its own +z axis. 1.05 rad is 60.16 degrees.

**`GRIP_MACRO` is computed from the geometry, never typed.** It is the 45-degree point of the collar chamfer at top dead centre:

```
x = axisX                                        = 1.860
y = axisY + (R - c) + c * cos(45 deg)
  = 1.830 + (0.170 - 0.030) + 0.030 * 0.70710678 = 1.9912132
z = endZ  -  c  + c * sin(45 deg)
  = 1.090 - 0.030 + 0.0212132                    = 1.0812132
```

which is **(1.8600, 1.9912, 1.0812)** to four decimals, the stop 3 target in F.3, and I.6.1 asserts it. **If the collar chamfer radius changes and that test is not updated, the macro camera is aiming at nothing** and the single brightest frame on the page renders a blank barrel.

`FIT_HANDLE` pads the barrel by 0.180 above and 0.100 below deliberately, so that on a portrait phone the fit solve can never crop the collar's specular arc out of frame at stop 13.

### D.13 The tray: five plates

Outer 1.360 x 1.360 in plan, centred at (**3.980**, ., 0.000), which is stop 9's target exactly. `mTray`.

- **Base plate** 1.360 x 0.140 x 1.360, underside at `y` **0.000**, top face at `y` **0.140**.
- **Back wall and two side walls**, 0.060 thick, top at `y` 1.040.
- **Front wall low**, top at `y` 0.560, so the stack is visible over it from the payoff's low camera at el 0.22. **A four-sided box at full height would hide the four chamfers that are the payoff's entire read.**
- **Base seam**: a 0.012 undercut groove where the four walls meet the base plate, `mSeam`, all the way round. It is what makes the tray a fabrication rather than a hollowed cube.
- **Pocket** 1.240 x 1.240 against a 1.140 slab: **0.050 of clearance per side on both axes** (I.6.6). Machined pocket clearance is a real number and a tray whose parts fit with zero gap is a tray nobody made.
- **Slot ledges**, eight, 0.030 proud of the side walls, bottoms at 0.140 + n x 0.220. Merged, one call, `mSeam` on their undersides so each seated slab has a dark line under it.

### D.14 The status channel and the route tube

**The third gold.** Four bars of cross-section 0.012 x 0.014, let into the bed's top shoulder at `y` -0.024, forming a rectangle of outer extent 9.600 x 2.720. `mChannel`, `MeshBasicMaterial`, `toneMapped: false`, merged into one draw call.

- long bars: 9.572 each, end bars 2.692 each
- **corner breaks 0.014 at all four corners** (I.6.8), which is 0.56 mm and is visible as four dark ticks in an otherwise unbroken line at the payoff
- the long run is **9.600 units = 384 mm**, the longest gold line on the page
- opacity only: `clamp01(0.10 + 0.72 * smoothstep(2.55, 3.60, c))`. It does not move, pulse, chase or breathe.

**The route tube.** `PERIWINKLE 1 of 2`. An **explicit nine-point polyline**, not a `CatmullRomCurve3` and not `planCurve` (G.10), swept as a `TubeGeometry` at radius **0.011** (0.44 mm), 96 length segments, 8 sides.

```
(-2.900, 2.960, 0.000)   the mouth
(-2.900, 2.104, 0.000)   the seat
(-2.900, 1.400, 0.000)   down the throat
(-2.100, 1.100, 0.000)   into the block
(-1.050, 0.900, 0.000)   through the cavity
( 1.600, 0.420, 0.000)   out of the engine mouth
( 1.860, 0.420, 0.400)   past the handle
( 3.300, 0.400, 0.000)   over the tray lip
( 3.980, 0.320, 0.000)   seated
```

Drawn by `setDrawRange(0, floor(96 * clamp01((c - 2.06) / 0.78)) * 6)`. **A draw range on a static index buffer, not a dash offset, not a shader, not a re-tessellation.** It is the cheapest possible line-draw and it is exactly reversible.

The seventh waypoint's `z` of 0.400 is the only excursion off the centre line on the whole route, and it exists so that the blue line visibly **goes past the gold handle** rather than through it. That single number is what makes E.3's sentence, "past the gold handle", true in the render rather than only in the caption.

### D.15 The triangle budget, and where it is spent

34 draw calls at every tier (I.8). The list below is the authored budget; **step 6 replaces each row with the measured count and I.6.12 asserts agreement within 2 percent.**

| # | draw call | tier 2 | tier 1 |
| --- | --- | --- | --- |
| 1 | bed centre plate | 1,152 | 768 |
| 2 | bed outer plates (2, merged) | 1,536 | 960 |
| 3 | T-slot channels (2, merged) | 1,440 | 1,024 |
| 4 | skirt rails (4, merged) | 1,280 | 832 |
| 5 | parting slab | 96 | 96 |
| 6 | feet, instanced x4 | 768 | 384 |
| 7 | housing body | 1,728 | 1,152 |
| 8 | engine mouth surround | 960 | 576 |
| 9 | cavity floor | 128 | 128 |
| 10 | cavity walls (4, merged) | 576 | 352 |
| 11 | counterbores, instanced x4 | 1,024 | 640 |
| 12 | lid plate | 2,560 | 1,536 |
| 13 | lid spigot | 768 | 448 |
| 14 | lid underside pocket | 512 | 320 |
| 15 | **funnel cone, three steps** | **10,368** | **6,336** |
| 16 | funnel outer skirt | 1,536 | 768 |
| 17 | throat sleeve | 1,024 | 640 |
| 18 | feed duct | 768 | 384 |
| 19 | **intake rim, instanced x24** | **6,912** | **3,840** |
| 20 | rim seat ring | 768 | 384 |
| 21 | belt band | 1,152 | 832 |
| 22 | **slats, instanced x34** | **5,440** | **3,264** |
| 23 | rollers, instanced x2 | 768 | 448 |
| 24 | billet | 1,280 | 320 |
| 25 | slabs, instanced x5 | 2,400 | 1,800 |
| 26 | tray base | 512 | 320 |
| 27 | tray walls (4, merged) | 1,024 | 768 |
| 28 | tray slot ledges (8, merged) | 576 | 384 |
| 29 | handle boss | 512 | 256 |
| 30 | handle stem | 640 | 384 |
| 31 | grip barrel | 1,536 | 896 |
| 32 | knurl grooves, instanced x5 | 1,600 | 960 |
| 33 | status channel (4 bars, merged) | 96 | 96 |
| 34 | route tube | 384 | 256 |
| | **total** | **53,824** | **32,552** |

**Where it goes, and why that is the right place:**

- **The funnel is 19 percent of the whole budget**, and it is the single biggest line. It is a 96-segment lathe with three real turned shoulders, and it fills half the frame height at chapter 1 seen from the inside. A faceted cone at that scale is not a cone, and chapter 1 is one of the two beats that must read.
- **The intake rim is 13 percent**, spent on 24 discrete parts rather than one torus, for the reason in D.9.
- **The slats are 10 percent**, spent on 34 leading chamfers of 0.011 that carry the chapter 3 entry read at 2.03 px against a 2.00 floor.
- Together those three lines are **42 percent of the budget and they carry three of the six named reads in B.7.** Everything else on the object is under 2,600 triangles.
- **Tier 1 saves 21,272 triangles, 40 percent, and loses no named read.** Every reduction is a radial or segment step, never a deleted feature: the funnel still has three shoulders, the rim still has 24 gaps, every slat still has its chamfer. **A tier that deletes a feature is a different object, and the greyscale test in I.1 is run at both.**

---

## E. THE FIVE CHAPTERS

Five narrative beats over stops 0 to 4. Stops 5 to 13 are the rest of the document and they carry no story; they are framings, and their only requirements are the darkness floor in I.3 and the light-to-eye window in I.6.13.

**Every chapter is recorded the same way and in the same order**, so that two chapters can be compared line for line and E.6's differentiation matrix can be checked rather than believed:

1. **Camera.** The stop record verbatim from F.3, then the rig's own yaw and tilt, then the light-to-eye angle from B.3 and its class, then the frame height in world units and the px per unit that follows from it.
2. **What fills the frame.**
3. **What the light does**, naming every lit edge, its width in device pixels, and what is deliberately black.
4. **Designed darkness**, as a percentage of frame pixels below RGB 40.
5. **What the viewer understands**, in plain sentences, with no reference to the machinery above.

Frame height is `2 * r * tan(fov / 2)` at the authored `r`, and px per unit is `viewportHeight / frameHeight` at **1440x900 DPR 1**, which is the reference viewport for every number in this section and in I.2. Where the fit solve in F.6 raises `r` on a narrower aspect, the frame height rises with it and the device-pixel widths fall; that is measured per viewport in I.3 and I.2, not restated here.

**The darkness percentages below are designed targets, not requirements.** I.3 measures them, records the measured value in `story-stops.ts` with its date and viewport, and if a stop falls outside its band the knob is the ATTENTION row in C.3 and nothing else. **Where a measurement and this section disagree, the measurement wins and this section gets annotated.**

One arithmetic note, stated here rather than left to be discovered: **the five chapter records were authored before the stop table was finalised and one of them no longer reproduces.** Recompute all five with the formula above as the first act of step 11, write the results into `story-stops.ts`, and annotate any row that has moved. A chapter record whose frame height cannot be recomputed from its own `r` and `fov` is a caption, and this document does not ship captions.

---

### E.1 Chapter 0, HERO

The establishing frame, and the only one that has to state the whole object at once. Everything after it is a detail of something the reader has already seen, which is why this is the frame the greyscale test asks "one machine or several separate objects" about, and why it is the frame most likely to fail: **at 62 percent of frame width and 74 percent darkness, five separately lit fragments and one continuous machine look identical until the bed's chamfer runs all the way from one to the other.** That single 384 mm line is doing more work than any other decision in this document.

**Camera.** `{ az 1.28, el 0.24, r 15.400, target (0.600, 0.150, 0.000), fov 30, near 0.400, fit FIT_ALL }`. Rig yaw **-0.14**, tilt **+0.02**. Light-to-eye **115.6 degrees**, back-key. Frame height 8.253 units, 109.0 px per unit.

**What fills the frame.** The full 9.600-unit bench at 60 percent of the frame width with air on both sides. The billet hangs at (-2.900, 5.400, 0.000), above the funnel, out of the machine's own shadow frustum. Nothing is happening yet.

**What the light does.** Only three things catch it. The bed's front-top chamfer takes one unbroken 384 mm hairline at 2.75 device pixels wide, which is the longest single bright line the page ever shows. The housing lid's front-left fillet arc takes a 2.48 mm band across roughly 40 percent of its perimeter. Nine of the 24 intake rim segments light in a travelling gold arc.

Everything else is at the IBL floor. The belt at effective env 0.132 sits within one code of the page ground and genuinely disappears. The housing flanks sit at diffuse only, roughly RGB 8. The tray at attention 0.40 falls to roughly RGB 16. The billet is lit by the IBL alone and reads at roughly RGB 24: visible, barely, and completely without highlight, because at roughness 0.88 it cannot do anything else. `keyScale` 0.62.

**Designed darkness: 74 percent of frame pixels below RGB 40.**

**What the viewer understands.** There is one long precise machine, not five objects. Work is on its way in and has not landed. Nothing has happened yet.

---

### E.2 Chapter 1, BOTTLENECK

**Camera.** `{ az 0.98, el 0.42, r 9.200, target (-2.900, 1.900, 0.000), fov 32, near 0.300, fit FIT_INTAKE }`. Rig yaw **-0.30**, tilt 0.00. Light-to-eye **97.1 degrees**, clean cross-key. Frame height 5.276 units, 170.6 px per unit.

The rig yaw moves from -0.14 to -0.30 while the camera azimuth swings 0.30 radians the other way, so the beat reads as **the instrument presenting its intake to a fixed light**, not as a camera pan. That is one extra lerped channel and it is the difference between a shot and a turntable.

**What fills the frame.** The funnel's 2.560-unit mouth fills half the frame height. The belt runs off frame right. The camera target has travelled 3.500 units left along the line.

**What the light does.** The funnel's three machined steps are square to the key and each throws its own concentric hairline at radius 1.280, 1.000 and 0.720, so the intake reads as a turned cone with three passes on it. Eleven of the 24 rim segments light, each as a 54.6 x 8.9 pixel lit face: **the most gold visible on the page outside the macro.**

The billet sits seated in the throat at y 2.1034 and is the only dark object inside a bright shape. At roughness 0.88 its peak return is of order 0.09 linear against the step fillets' 3.0 linear: **RGB 26 against RGB 250, in the same frame, under the same light.**

The lid is edge-on and takes almost nothing. Belt, handle and tray are all at attention 0.34 and have fallen out of the picture. `keyScale` 1.00, the full key, because this is one of the two beats that must read.

The funnel scales 1.000 to 0.988 in Y across the chapter, a real 0.63 mm compression, and the rim tilts 1.4 degrees off level. Both pure functions of `coord`.

**Designed darkness: 71 percent below RGB 40.** The second brightest chapter, because a lit cone is a large lit area.

**What the viewer understands.** The work arrived and it will not go through. The thing that is stuck is a dull lump and the thing it is stuck in is precise and expensive. This is the problem, and it is at the front of the machine.

The reader reads **stuck** from an *absence* of specular, which costs no light at all. That is the mechanism that makes a 71 percent dark frame legible.

---

### E.3 Chapter 2, MAPPING

**Camera.** `{ az 1.05, el 0.68, r 14.800, target (-1.400, 1.600, 0.000), fov 30, near 0.400, fit FIT_ALL }`. Rig yaw -0.06, tilt **+0.10**. Light-to-eye **88.6 degrees**, the cleanest cross-key on the page. High three-quarter, almost a plan view. Frame height 7.931 units, 113.5 px per unit.

**What fills the frame.** The lid lifts 0.860 along its own up-normal on power2Out over window 0.00 to 0.52 of the chapter. The funnel and its rim lift 0.340 over window 0.18 to 0.68. Everything else is anchored. **Non-uniform, overlapping windows**, so the lid is fully clear before the funnel has finished, which reads as engineering rather than as an accordion. Simultaneously the billet is lifted out and away to y 6.400 and off frame.

**What the light does.** This is the only frame on the page where a **closed** bright shape appears. At 88.6 degrees with the camera nearly overhead, the housing lid's entire 124 x 79 mm chamfer perimeter lights at once as an unbroken rectangle of hairline at 4.67 device pixels wide, floating 34 mm above the machine.

Directly under it the opened cavity floor is `mSeam` at env 0.22 x 0.285 = 0.063 and is a genuine black hole. A bright rectangle hovering over nothing.

`keyScale` drops to **0.74**, a deliberate 26 percent step down, because the chapter's payload is an unlit periwinkle line and the metal has to get out of its way. The two T-slot channels are square to the rake and read as two more dead-black horizontals cutting the bed into three bands. The route line draws left to right as a 0.44 mm periwinkle hairline through the black cavity and along the belt.

**Designed darkness: 76 percent below RGB 40.** The darkest chapter on the page, and the one that carries the most information.

**What the viewer understands.** This is the route the work takes, and I am being shown it because the machine has been **opened** rather than described. The blue line goes in at the left, through the block, along the belt, past the gold handle, into the tray. That is the whole workflow in one frame, and it is a diagram made of light rather than a diagram drawn on top.

---

### E.4 Chapter 3, MACHINE

**Camera. This is a real dolly, not a cut.** `r` interpolates 4.600 to 1.300 and `fov` 30 to 26 across the chapter's own unit of scroll, both pure functions of `coord`.

Stop table entry is the terminal frame: `{ az 0.10, el 0.44, r 1.300, target GRIP_MACRO = (1.8600, 1.9912, 1.0812), fov 26, near 0.030, fit FIT_NONE }`. Rig yaw -0.12. Light-to-eye **59.5 degrees**: the single deliberate exception on the page, key over the camera's shoulder.

- Entry frame at r 4.600, fov 30: frame height 2.465 units = **98.6 mm**. Shows the grip, the stem, eight belt slats running underneath, and one finished slab passing.
- Terminal frame at r 1.300, fov 26: frame height 0.6003 units = **24.0 mm**. The 13.6 mm gold barrel crosses the middle and its upper collar chamfer takes the top third.

**No blur pass, no render target, no post process.** Real perspective compression at 52 mm from a 1.2 mm chamfer does what a depth-of-field pass would have done, at zero cost.

**What the light does.** At the entry frame the eight slats each take their 0.44 mm hairline at 2.03 device pixels and the passing slab at roughness 0.32 throws a clean band: a running line with a control over it.

As the camera pushes in, the gold takes over. At metalness 1.00, roughness 0.22 and F0 equal to the linear albedo (0.7683, 0.5088, 0.1499), peak specular on the collar chamfer is of order (146, 97, 29) linear, which lands near (253, 250, 240) through ACES at 0.80. **A genuinely blown gold band, 0.52 mm of arc, 19.5 device pixels, that never clips to magenta and never loses its tint.** The five knurl grooves each take a 0.25 mm arc at 2.60 pixels, so the barrel reads as five parallel gold threads.

Below the grip the belt at env 0.30 stays at roughly RGB 11, and the stem, sharing the housing anodize at roughness 0.44, stays at roughly RGB 9 on its flat. `keyScale` 1.00, the second full-key beat.

**The causal beat happens here.** The belt slows to 1.43 percent of nominal at c 2.75, the grip turns 60 degrees across c 2.55 to 3.05, and the belt resumes. Slab 0 has nosed 33 mm out of the engine mouth and is sitting still, waiting. The status channel ramps 0.10 to 0.82 across this chapter: **the line comes on.**

**Designed darkness: 79 percent below RGB 40 at the entry frame, 58 percent at the terminal frame.** The terminal frame is the brightest single frame on the page and the only one allowed to be.

**What the viewer understands.** The line was stopped. One gold thing on it is shaped for a hand. The hand turned it and the line moved. Knurling exists on exactly one class of object, so the reader understands without a caption and without translation that **a human is still deciding here**, and, crucially, that the machine waited for them.

---

### E.5 Chapter 4, PAYOFF

**Camera.** `{ az 0.95, el 0.22, r 17.200, target (2.900, 0.350, 0.000), fov 34, near 0.500, fit FIT_OUTPUT }`. Rig yaw -0.24, tilt 0.00. Light-to-eye **104.0 degrees**, back-key. Frame height 10.845 units, 83.0 px per unit.

Low and pulled back at the **output** end, so the tray is near and the intake is 384 mm away at the far left of the frame. Across the five chapters the camera target has travelled from x 0.600 to -2.900 to -1.400 to 1.860 to 2.900: **the reader has been walked from one end of the machine to the other in one continuous move.**

**What fills the frame.** Four finished slabs seated in the tray, one still travelling on the belt, an empty dark intake at the far left, and 384 mm of gold hairline.

**What the light does.** Four slab chamfers at roughness 0.32 and F0 average 0.1896 each take one clean 17.7-degree specular band, and they are the brightest objects in the frame. The chamfer at radius 0.026 with a 35.4-degree lit arc is `0.026 x 0.6178 = 0.01606` units = **1.33 device pixels** at this framing, and it is the one read on the page that runs close to the floor: the acceptance test in I.2 checks it explicitly and the remedy, if it fails, is to raise slab chamfer radius to 0.032, never to raise the key.

The intake at the far left has fallen to attention 0.40, so the 24 gold rim segments return under half of what they did at chapter 1 and **the mouth has visibly gone quiet**. The billet is not in the scene at all.

The status channel is at 0.82 and runs the full 384 mm as an unbroken `#e3bd6c` hairline with four visible 0.56 mm corner breaks: the longest gold line on the page.

`keyScale` 0.86 with a strike: `keyMul` holds at 1.42 over `smoothstep(3.62, 3.78, c)` as the fourth slab seats, peak intensity **6.816**, then settles to 0.72 over `smoothstep(3.78, 4.06, c)`, resting intensity **2.972**. The strike is a pure function of `coord`, so scrubbing back un-strikes it exactly.

**Designed darkness: 73 percent below RGB 40.**

**What the viewer understands.** Four clean finished things where there used to be one dull lump. The intake is empty and dark. The line is lit and running and nobody is standing at it, but the gold handle is still there and still turned to where the reader left it. **The machine did not remove the person while nobody was watching.**

That is the sentence "the work gets done without you" rendered as a photograph rather than written as a claim, and it is the last narrative frame before the page continues.

---

### E.6 The five-chapter differentiation matrix

Run this before shipping. **If any two rows share both an anatomy and a light class, one chapter is wrong and must be rebuilt, not restyled.**

| chapter | anatomy | copy alignment | word budget | light class | entrance gesture | density |
| --- | --- | --- | --- | --- | --- | --- |
| 0 hero | full bleed, copy block hard left, object right 62 percent | left | 46 | back-key 115.6 | masked line rise, once, then banned | low |
| 1 bottleneck | copy right column 24em, object left | right | 38 | cross-key 97.1 | horizontal slide, xPercent -1.8 | **highest** |
| 2 mapping | the only symmetric composition: copy top-left, marker bottom-left, empty centre | split | 44 | cross-key 88.6 | mask wipe left to right | high |
| 3 machine | one 22em column pinned hard left, 82 percent of frame to the render | left | **26, lowest** | **frontal 59.5, the exception** | scale 1.045 to 1.000, scrubbed | low |
| 4 payoff | copy bottom-centre, low, under the tray | centre | 31 | back-key 104.0 | rotationX -82 to 0, origin 50% 100% | medium |

Every headline under 7 words. Count them. Vertical rise is used exactly once, on load, and is then banned for the rest of the page.

---

## F. CAMERA AND SCROLL ARCHITECTURE

### F.1 THE DECISION: retire the sticky stage, build the long take

**Decided. Not offered as an option.**

The current architecture is a `.st-stage.is-live` at `height: 640vh` with a `position: sticky` inner box, a canvas that lives inside that stage, an IntersectionObserver because the canvas genuinely leaves the viewport, and a single global `rawProgress = clamp01(-rect.top / (rect.height - sticky.offsetHeight))`. It rebuilds the object to Sentinel standard and then hands off to a normal page after chapter five. That matches the finish and misses the concept.

**Rev A: one canvas at `position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0`, a sibling of `<main>` and placed before it, behind the entire document from the hero to the CTA. Fourteen stops. No opaque background between the hero and the CTA.**

**State the cost of that up front.** Today the canvas lives inside a 640vh stage and is IntersectionObserver-gated, so the renderer's active span is about **41 percent of the document**. Fixed at `inset: 0` from hero to CTA it becomes about **94 percent**: a **2.3x increase in frames rendered per full-page scroll**. At 34 draw calls, roughly 54,000 triangles, one shadow pass, zero textures and zero network requests, that is affordable, and render-on-demand (F.7) means the at-rest cost is still zero. But it is a real 2.3x and it is stated here rather than implied away by the phrase "one canvas".

#### F.1.1 The transparency rule, restated so it can be enforced

The first draft of this section claimed transparency is achieved by **never writing a background**, with a six-case allow-list. That claim was wrong on the facts and it contradicted G.21 in this same document, which explicitly keeps panel fills. Both are fixed here.

Measured on the live tree, excluding the two dead files named below, `marketing.css` plus the ten co-located section files carry **64 `background*` declarations**. Of those: **7 are opaque**, **26 are literal `rgba()`**, **23 resolve through a `var(--mk-*)` token** and are therefore invisible to any regex over literal colours, 2 are explicit `transparent`, and the rest are gradients and multi-line shorthands. The old allow-list covered about six of them; section G deletes maybe eight more. Roughly forty were unaccounted for. **A grep cannot enforce this rule and never could.**

Also: `flow-compare.css` has zero importers and contributes another **12** `background` declarations. Every raw `grep -c "background"` number is inflated by exactly that much, which is one more reason the old gate was not measuring what it claimed to measure.

So the rule is restated in terms a script can resolve:

1. **No opaque background on any element between the hero and the CTA.** One exception: `.mk-footer` at `#050810`, which is below the long take and is deliberately terminal punctuation.
2. **A translucent fill is allowed at alpha at most 0.12.** Panels keep their fill and their 1px border and lose the blur, exactly as G.21 says. This is now consistent with G.21 instead of contradicting it.
3. **Every fill is declared through a token, and the token's own declaration states its alpha in a comment at the token.** No literal `rgba()` in a rule body inside the long-take region.

The gate is then a **script, not a grep**: load the page, resolve every custom property through `getComputedStyle`, compute the effective alpha of every `background*` declaration in the long-take subtree, and fail on any alpha above 0.12 outside the exception list. That is machine-runnable and it sees through tokens. **I.7 calls for that script.**

`alpha: true` plus `setClearColor(0x000000, 0)` plus `scene.background = null` means `#0a0d14` **is** the field, and the object can never be brighter than its own lit surfaces.

#### F.1.2 The four surfaces the old allow-list missed, decided explicitly

- **`.mk-footer` at `#050810`** (`marketing.css:1078`). Opaque, correct as it stands, simply never listed. It is the single exception in rule 1 and it stays.
- **`.mk-why__cell--statement::before`** (`marketing.css:929-937`), a `radial-gradient` dot grid in `#e8eaf2` at `opacity: 0.03`. **Keep it.** Stop 10 is the absence beat: the object is 11.000 units above the frame and gone, and the dot grid is the only thing in frame. Deleting it leaves an empty rectangle where the spec's best idea is supposed to be. Effective alpha 0.03, passes rule 2.
- **The pure white button.** Correction to the record: the review that found this called it `.mk-btn--paper`. It is not. `.mk-btn--paper` is `var(--mk-accent)` gold (`marketing.css:571`) and is the fourth gold of I.7; it is the only button in the final CTA (`marketing-page.tsx:184`). The `#ffffff` one is **`.mk-btn--primary`** (`marketing.css:562`), and it appears **five** times inside the long take: the hero pair at stop 0, the story CTA (`story-scene.tsx:237`), the ROI CTA (`roi-calculator.tsx:409`), and twice in the nav (`site-nav.tsx:72, 109`).

  **Decision: `.mk-btn--primary` keeps `#ffffff`, and it is banned from the CTA section.** G.2's argument does not transfer, and here is why, because this is the one that will be re-litigated. The bone-white body was a **lit surface, inside the render, occupying tens of percent of frame area at every stop, competing with the key for the whole page**. The button is unlit DOM at a fixed 150 x 46 px, which is **0.53 percent** of a 1440x900 frame. It is also the page's only unambiguous "this is the action" affordance, and removing the affordance to protect a histogram is the wrong trade. The bound is I.3's existing cap of 12 percent of pixels above RGB 200, which 0.53 percent clears by a factor of twenty.

  The ban matters more than the colour: **stop 13 has exactly one bright element and it is gold.** `.mk-btn--paper` already carries that action, so no white button is permitted in `#contact`. That preserves "the fourth gold" as the closing image.

  Two consequences chased down: **I.4's clip test is scoped to the canvas**, not to the composited page, or a 0.53 percent white button fails a 0.15 percent cap that was written about ACES and gold. **I.3's darkness test is scoped to the composited page**, because the design percentages in section E describe what the viewer sees and under the long take the canvas is the page ground. Both scopes are now stated at those tests.
- **The two ROI slider thumbs at `#fff`** (`roi-calculator.css:385, 399`). **Change both to `var(--mk-text)` (`#e8eaf2`).** These are not an affordance the way a CTA is, they are 18px circles inside a panel at stop 9, they carry no action word, and `#e8eaf2` is already the page's brightest text colour and the dot grid's colour. There is no argument for pure white on a 254 px² disc. Combined area 0.04 percent, so this is a craft call, not a histogram call, and it is made on craft grounds.

**On the skip link.** The old allow-list named "the skip link". **This codebase has none**; that line was written against the reference site and was never true here. Verified: zero matches for a skip-link pattern in `marketing.css`, `layout.tsx` or any marketing component. **Decision: add one**, `.mk-skip`, visually hidden until `:focus-visible`, first child of `.mkt`, target `<main>`. It is an accessibility gap independent of this work, it is four lines, and it belongs to the same commit that hoists the canvas because that commit is what puts a fixed layer at `z-index: 0` under the whole document. Its focused state paints an opaque background and it is the second exception to rule 1, listed at the token.

### F.2 What is NOT ported: ScrollTrigger

The current file argues this correctly and it stays: Lenis smooths the wheel, a ScrollTrigger pin against Lenis needs a `scrollerProxy` that can desync, and CSS position rules cannot. The reference reached the same conclusion from the other end, refusing Lenis specifically so it could use a native pin.

Consequence: `anticipatePin`, `pinSpacing` and `refreshPriority` have no analogue and no need for one. The chaining below is **arithmetic, not a plugin**.

Also not ported: the reference's fixed 2200px pin length. A viewport multiple is the right unit for a bilingual page across a 13-inch laptop and a 27-inch monitor.

### F.3 The fourteen stops

One record per stop: `{ id, az, el, r, tx, ty, tz, fov, near, yaw, tilt, fit }`. Position every frame:

```
pos = tgt + r * (cos(el) * sin(az), sin(el), cos(el) * cos(az))
camera.up.set(0, 1, 0)
camera.lookAt(tgt)
```

**Polar about the target, not linear between eye points**, so blending two stops sweeps an **arc** around the machine instead of cutting a chord through it. That single decision is what makes it read as a camera move rather than a lerp, and it is what the current `CatmullRomCurve3` at `story-machine.tsx:1177` cannot do: a curve through five eye points overshoots behind the object between chapters 1 and 2 and flips the view inside out, which is exactly why the existing build had to interpolate its targets linearly to compensate.

| # | id | section | az | el | r | target | fov | near | yaw | tilt | fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | hero | `.st-hero` | 1.28 | 0.24 | 15.400 | (0.600, 0.150, 0) | 30 | 0.400 | -0.14 | 0.02 | ALL |
| 1 | bottleneck | chapter 2 | 0.98 | 0.42 | 9.200 | (-2.900, 1.900, 0) | 32 | 0.300 | -0.30 | 0.00 | INTAKE |
| 2 | mapping | chapter 3 | 1.05 | 0.68 | 14.800 | (-1.400, 1.600, 0) | 30 | 0.400 | -0.06 | 0.10 | ALL |
| 3 | machine | chapter 4 | 0.10 | 0.44 | 1.300 | GRIP_MACRO | 26 | 0.030 | -0.12 | 0.00 | NONE |
| 4 | payoff | chapter 5 | 0.95 | 0.22 | 17.200 | (2.900, 0.350, 0) | 34 | 0.500 | -0.24 | 0.00 | OUTPUT |
| 5 | whofor | `#who` | 1.10 | 0.30 | 22.000 | (0.000, 0.400, 0) | 32 | 0.600 | -0.18 | 0.00 | ALL |
| 6 | workflows | `#workflows` | **2.03** | 0.98 | 17.000 | (0.200, 0.300, 0) | 30 | 0.500 | 0.00 | 0.00 | ALL |
| 7 | approach | `#approach` | 0.95 | 0.06 | 6.600 | (0.900, 0.320, 0) | 30 | 0.200 | -0.10 | 0.00 | BELT |
| 8 | audit | `#audit` | 0.70 | 0.34 | 8.400 | (-2.900, 1.700, 0) | 30 | 0.300 | 0.08 | 0.02 | INTAKE |
| 9 | roi | `#roi` | 1.05 | 0.30 | 7.200 | (3.980, 0.560, 0) | 30 | 0.250 | -0.20 | 0.00 | TRAY |
| 10 | **why** | `#why` | 1.05 | 0.26 | 7.600 | **(3.820, 11.000, 0)** | 34 | 0.500 | -0.20 | 0.00 | NONE |
| 11 | trust | `#trust` | 1.18 | 0.28 | 19.600 | (0.400, 0.150, 0) | 32 | 0.600 | -0.16 | 0.00 | ALL |
| 12 | faq | `#faq` | 1.12 | 0.26 | 16.800 | (0.900, 0.100, 0) | 30 | 0.500 | -0.12 | 0.00 | ALL |
| 13 | contact | `#contact` | 0.66 | 0.36 | 3.400 | (1.860, 1.830, 0.700) | 28 | 0.100 | -0.10 | 0.00 | HANDLE |

**Stop 10 is the absence beat.** The target rises to y 11.000 while the camera keeps its azimuth and elevation, so at a frame height of 4.647 units the object is far below frame and **gone**. It is not a canvas fade and not a crossfade: it is the camera physically in empty space, still the same shot. It is the single most reference-faithful idea on the page and it costs one row in this table. `keyScale` 0.30 there, so the return at stop 11 is a lift.

The selector for stop 5 is **`#who`**, not `#who-for`. The section id is `who` (`who-for.tsx:51`); only the component file is called `who-for`. A driver keyed on `#who-for` silently loses one of the nine section windows and the whole walk after it shifts.

**Stop 13 closes on the gold grip behind the CTA.** The reader's last frame is the one control a human holds, with the one action they can take rendered in the same colour over it. That is deliberate and it is the fourth gold. **Stop 13 does not use the standard window and cannot**: `#contact`'s top is 13336px while `documentHeight - innerHeight` is 13253px, so its top can never reach the viewport top and a `top top` end condition is unreachable by 83px. The special case is in F.5.2. No white button is permitted in `#contact` (F.1.2), so the closing frame carries exactly one bright element and it is gold.

### F.4 Blending

```
i = min(floor(coord), 12)
f = smoothstep(0, 1, coord - i)
mix every channel: az, el, r, tx, ty, tz, fov, near, yaw, tilt
```

Smoothstep has zero derivative at both ends, so camera velocity is zero at every stop and there is no kink crossing one. **The whole fourteen-stop path is C1 continuous with no spline, no control points and no overshoot.** Twenty lines, no dependencies.

`fov` and `near` are interpolated too, and `updateProjectionMatrix()` is pushed only on frames where either actually changed.

`w[i]` per-stop weights are also produced by the blender (`w2`, `w3` in the reference), used to gate any effect that must exist only near one stop. The lid lift is gated to `w2` so it cannot leak into any other chapter.

**Object yaw is separate from camera azimuth.** `rig.rotation.set(tilt, yaw, 0)` with the table above. Between hero and bottleneck the camera swings 0.30 radians while the machine turns 0.16 the other way.

### F.5 The driver: clamped per-section windows, solved every frame, one temporal filter

**Delete the single global `rawProgress`, `DWELL = 0.52` and `TOTAL_UNITS = 4.52`** (`story-scene.tsx:50-51, 60-67, 271-278`).

Each of the fourteen anchors carries `data-stop="N"`: `.st-hero` is 0, the four chapter panels are 1 to 4, and the nine document sections are 5 to 13.

#### F.5.0 Why the obvious window is wrong, with the measurement

The first draft ran every section's window from `top bottom` to `top top`, **one viewport of scroll, always**. That is only well defined if every gap between consecutive anchor tops is at least one viewport, and on this page it is not. Measured at **1440x900**, gaps between consecutive `[data-stop]` section tops:

| boundary | gap | overlap at vh 900 |
| --- | --- | --- |
| who to workflows | 446 px | **454 px** |
| audit to roi | 806 px | 94 px |
| trust to faq | 771 px | 129 px |
| faq to contact | 820 px | 80 px |

Four of the eight section-to-section boundaries overlap at a 900px viewport. **At a 1440px-tall window, seven of the eight overlap, the worst by 994px.**

In an overlap band two windows are both live, both write `coord` in the same frame, and the result is last-writer-wins. The later section wins, so the camera is dragged backwards toward the earlier stop by the earlier writer and forwards by the later one, **every frame**. That is not a subtle artefact. It is a visible snap on every frame in a band up to a full viewport wide, at seven of eight boundaries, on the most common desktop size.

#### F.5.1 Clamped windows, and `coord` as a pure function of `scrollY`

Two changes, and they are the same change.

**First, clamp every window to the gap it has.** Window `k` still ends exactly where it ended, at anchor `k`'s top reaching the viewport top. Only its length changes:

```
top[k]      = anchor k's absolute document Y, measured once and on every ResizeObserver fire
len[k]      = min(innerHeight, top[k] - top[k-1])     // the clamp
winEnd[k]   = top[k]
winStart[k] = top[k] - len[k]                          // >= top[k-1] = winEnd[k-1], always
```

Read from the other end this is the same statement the review made: **each window is `min(viewportHeight, nextSectionTop - thisSectionTop)`.** Indexed by the stop it arrives at, the gap is `top[k] - top[k-1]`; indexed by the stop it leaves, it is `nextSectionTop - thisSectionTop`. Same set of windows, and `winStart[k] >= winEnd[k-1]` by construction, so **no two windows ever overlap and no frame has two writers.**

**Second, stop writing `coord` and start solving it.** F.5's original text already described a walker that solves `coord` directly from `window.scrollY`, but only for deep links and refresh. **Make it the only path.** Every frame:

```
coordFor(scrollY):
  if (scrollY <= winStart[1]) return 0
  for k = 1 .. 12:
    if (scrollY < winStart[k]) return k - 1                 // the hold, between two windows
    if (scrollY < winEnd[k]) {
      p = (scrollY - winStart[k]) / len[k]
      return (k - 1) + smoothstep(p)                        // smoothstep(p) = p * p * (3 - 2 * p)
    }
  return coordFinal(scrollY)                                // F.5.2
```

Fourteen comparisons, no allocation, no listener state, no per-section observer, no `enter`/`leave` bookkeeping at all. Between one window's end and the next one's start the loop returns an integer, so **the hold while you read a section's body is free and falls out of the geometry**, exactly as before.

**Delete the leave / leave-back snap language entirely.** The original text said "on leave, `coord = to`; on leave-back, `coord = from`". That is direction-dependent by construction, and I.5 demands byte-identical frames at the same `scrollY` in both directions. Both cannot hold. They do not need to: **a clamped window ends exactly at `to` and starts exactly at `from`, so boundaries snap for free, from arithmetic, in both directions, with no branch that knows which way you are going.** This is the fix for I.5 defect (a) and it is a deletion, not an addition.

#### F.5.2 The final stop, which is otherwise unreachable

`#contact`'s top is **13336px**. `documentHeight - innerHeight` is **13253px**. An **83px shortfall**: `#contact`'s top can never reach the viewport top, `winEnd[13]` is past the end of the scrollable range, and **`coord` never reaches 13**. The spec's own closing image, the fourth gold at stop 13, never renders. Worse, on `/nl`, where copy runs 15 to 20 percent longer, the document may grow enough to squeak past, which would make the ending **locale-dependent** and contradict I.9's requirement that `/` and `/nl` produce identical camera timing.

Stops 12 to 13 therefore get their own window, defined against the end of the document rather than against a position the document may not be tall enough to produce:

```
maxScroll  = documentHeight - innerHeight
finalStart = max(top[12], top[13] - innerHeight)     // #contact top entering the viewport bottom,
                                                     // never before window 12 has finished
finalEnd   = maxScroll

coordFinal(scrollY):
  if (finalEnd <= finalStart) return 13
  return 12 + smoothstep(clamp01((scrollY - finalStart) / (finalEnd - finalStart)))
```

Four lines and one guard. At 1440x900: `top[12]` is 12516, `top[13] - 900` is 12436, so `finalStart` is **12516** and the closing transition runs **737px**, 82 percent of a viewport. `coord` reaches exactly **13.000** at `scrollY === maxScroll`, on every locale and every viewport height, because both ends are pinned to the document rather than to the section. The `max(top[12], ...)` term is load-bearing: without it the final window would start 80px before window 12 ends and reintroduce exactly the overlap F.5.1 just removed.

The degenerate guard fires only if the CTA is so close to the bottom that `maxScroll <= top[12]`, in which case `coord` is 13 for the whole tail. That is the correct behaviour and it is still a pure function of `scrollY`.

**Not solved by `min-height: 100dvh` on the CTA.** That would make the ending reachable by making the CTA a full-viewport panel, which is a different design with a different composition. The window is the thing that is wrong, so the window is the thing that changes.

#### F.5.3 What the clamp actually buys, stated honestly

The original claim was "a transition costs exactly one viewport of scroll regardless of how tall the section is". That is now false at four of eight boundaries. The true claim:

**A transition costs `min(one viewport, the gap to the next anchor)`.**

- At every boundary with at least one viewport of gap, timing is **completely decoupled from copy length**, which is the property that matters on a bilingual page where the Dutch runs 15 to 20 percent longer. At 1440x900 that is four of the eight section-to-section boundaries.
- At the other four it **degrades gracefully**: the move is shorter, still smoothstepped, still C1 continuous, still identical forwards and backwards, still ending exactly on the stop. A 446px move instead of a 900px move is a faster camera, not a broken one.
- The failure mode it replaces was not "slightly fast". It was a per-frame backwards snap.

The number of full-length boundaries is viewport-dependent and will change: at 1440px of height only one of the eight clears. **Measure the fourteen anchor gaps in step 8 and record them in `story-stops.ts` with the viewport and the date.** The five chapter-panel gaps are set by `story-scene.css`, which step 8 rewrites, so they do not exist to be measured until that step; sizing them at one viewport or more is a free choice there and should be taken.

**Adding or cutting a section remains a local edit**, and now it is also a safe one: a new section with a short gap clamps itself instead of corrupting its neighbour.

#### F.5.4 The one temporal filter

```
coord = MathUtils.damp(coord, coordFor(scrollY), 9, dt)      // dt clamped to [0, 0.05]
```

Lambda 9 closes about 86 percent per 100 ms, the same neighbourhood as the reference's 0.32 s `quickTo`, and `damp` is frame-rate correct and needs no GSAP.

**Delete the cubic `easeInOut` inside `chapterCoord`.** Today there are three filters in series: Lenis, that cubic, and this damp. That is precisely the stacking the file's own comment at `story-scene.tsx:33` says it dropped ScrollTrigger to avoid. Lenis stays, `damp` stays, the cubic goes. The `smoothstep` in `coordFor` and the `smoothstep` in the stop blender are not filters; they are shape functions on an already-filtered scalar.

**Epsilon dedupe, corrected.** The original text said `if (Math.abs(next - sent) < 0.0004) return;` at both layers. **That early return is a bug**, and it is I.5 defect (b). The damp stops being pushed before it reaches its target, so the scene rests at a value up to 0.0004 short of the target on each layer, in whichever direction it approached from, and up to **0.0008 apart** between the two approaches. The dirty flag then freezes that difference **permanently**, because nothing is left to push it.

That is not below the noise floor. At stop 3 the camera dollies `r` from **4.600 to 1.300** across one chapter unit, so 0.0004 of `coord` is **0.0013 of `r`**, which is enough to flip an 8-bit value on the **2.60 px** knurl root fillet at DPR 2. I.5 asks for byte-identical PNGs. This alone would fail it.

The fix is to land on the target instead of stopping near it, at both layers:

```
// driver side
if (Math.abs(next - sent) < 0.0004) { sent = next; damped = target; push(next); return; }

// scene side, in set(v)
if (v === state.coord) return;                                    // exact: a settled frame costs nothing
if (Math.abs(v - state.coord) < 0.0004) { state.coord = v; state.dirty = true; requestFrame(); return; }
```

Two lines each. Only **exact equality** returns early, so the at-rest cost is still zero and F.7's dirty flag still works, but the resting value is now exactly `coordFor(scrollY)`. **The resting state becomes a true function of `scrollY`**, which is what I.5 is actually asserting.

**Deep link, refresh and resize are not special cases any more.** `coord` is solved from `window.scrollY` on every frame, so a deep link lands on its stop by arithmetic. On load, on `ResizeObserver` fire and on scene-ready, re-measure `top[]`, then set damp current and damp target to the same solved value so the filter collapses to an instant set. Never wait for a scroll crossing a deep link will never produce.

### F.6 Fit envelopes: per-stop, not global

The bench is 384 mm long against a 148 mm block: roughly 6.5:1. **One global bounding box on a portrait phone fits it to a strip.** Each stop declares which subset of the object it is about.

| name | min | max |
| --- | --- | --- |
| `FIT_ALL` | (-4.800, -0.820, -1.360) | (4.800, 2.960, 1.360) |
| `FIT_INTAKE` | (-4.480, 0.000, -1.100) | (-1.320, 2.960, 1.100) |
| `FIT_BELT` | (-1.200, 0.000, -0.760) | (2.920, 0.360, 0.760) |
| `FIT_HANDLE` | (1.600, 1.560, 0.380) | (2.120, 2.180, 1.180) |
| `FIT_TRAY` | (3.300, -0.100, -0.680) | (4.660, 1.100, 0.680) |
| `FIT_OUTPUT` | (0.800, -0.100, -0.900) | (4.800, 1.200, 0.900) |
| `FIT_NONE` | fit disabled | |

Closed form, maximised over the eight corners, `FIT_W = 0.80`:

```
r_h = depth + |lateral| / (FIT_W * tan(fov / 2) * aspect)
r_v = depth + |vertical| / (FIT_W * tan(fov / 2))
r = max over 8 corners of max(r_h, r_v)
```

Applied only where `fit` is not `NONE`. Stops 3 and 10 carry `NONE` because they are framed on a detail or on nothing and must not be pushed back to fit a box they are not about.

**This replaces every hand-tuned breakpoint in `story-scene.css` and every `splitPushGain` / `liftGain` correction.**

### F.7 Render on demand, and it finally returns false

```
renderNow():  applyState(coord); shadowMap.needsUpdate = tier >= 1; render(); dirty = false
onFrame():    rafId = 0; if (disposed || !supported || hidden || !dirty) return; renderNow()
requestFrame(): if (rafId || disposed || !supported || hidden) return; rafId = rAF(onFrame)
set(v):       if (v === state.coord) return; state.coord = v; dirty = true; requestFrame()
```

`set()` carries **no epsilon early return**. See F.5.4: an epsilon early return here is what makes the resting frame depend on approach direction and permanently freezes a difference of up to 0.0008 in `coord`, which is 0.0013 of `r` at stop 3 and enough to fail I.5 on the knurl fillet. Exact equality is the only short circuit, and it is sufficient: once the damp has landed, `set()` receives the same float forever and costs nothing.

`shouldRender` is deleted as a concept and replaced by the dirty flag. **Delete the unconditional trailing `return true` and the comment above it that says "from here the answer is always yes"** (`story-machine.tsx:369` and the implementation it describes). With no time term, at rest the honest answer is no, and the reward is **zero GPU work** on a permanent compositor layer.

**Delete the `IntersectionObserver` and the `offscreen` flag. Keep `visibilitychange`.**

Correction to the first draft, which said the IO "becomes a cheap redundancy, keep it". It does not become a redundancy. **Under `position: fixed; inset: 0` the observed element is the viewport, so the IO can never report anything but intersecting, `offscreen` is never true, and both guards it appears in are dead code.** That is a different thing from a redundancy, and the difference matters: a live-looking gate in a render path that cannot ever fire is how the next engineer concludes the pause still works, stops looking for the real reason a frame rendered, and ships a regression. Delete the observer, delete the `offscreen` flag, delete both guard terms.

`visibilitychange` stays and is the real gate. It covers the background tab, which is the case that actually happens.

### F.8 No time term anywhere

`update(coord: number, elapsed: number, dt: number)` becomes `update(coord: number)`. Every animated quantity is positional:

| quantity | function |
| --- | --- |
| belt clock | `tau = c - 0.4600 * smoothstep(2.40, 3.10, c)` |
| slat travel | `tau * 8.261`, wrapped modulo 0.114 |
| roller rotation | `slatTravel / 0.150` radians |
| billet drop and lift | piecewise power2In of `c` |
| slab positions | `f(tau)` per D.11 |
| handle turn | `1.05 * smoothstep(2.55, 3.05, c)` |
| stem rock | `-0.11 * smoothstep(2.55, 3.05, c)` |
| lid lift | `0.860 * power2Out(seg(c, 2.00, 2.52)) * w2` |
| route draw range | `floor(96 * clamp01((c - 2.06) / 0.78)) * 6` |
| status channel opacity | `clamp01(0.10 + 0.72 * smoothstep(2.55, 3.60, c))` |
| station env ramps | `ENV_BASE_i * blend(ATTENTION[·][i])` |
| key strike | `keyMul(c)` per B.5 |

**No `elapsed`, no `clock.getDelta()`, no breathing, no bob, no spring, no accumulation.** This is what makes reverse scroll bit-identical rather than merely similar, it is what makes render-on-demand possible at all, and it is what makes the object read as a machined thing on a bench. Cheap 3D announces itself by never being still.

`MathUtils.damp` is history-dependent but it **converges**: the resting frame at any scroll position is identical and the difference dies out in a few hundred milliseconds. A breathing term never converges. That distinction is the whole reason one is allowed and the other is not.

### F.9 Reduced motion and the short-viewport bail-out

**`PARKED = { coord: 3.70 }`.** One frame, rendered once, no rAF ever queued after it. `keyScale` and `keyMul` both forced to 1.00. A `matchMedia` change listener flips it live in both directions, and the reduced path exercises the identical render code with a substituted state rather than branching around it.

**The parked canvas is not fixed.** Correction to the first draft, which parked the canvas at `position: fixed; inset: 0` like the animated one. That combination is the worst contrast case on the page and it would be permanent: **one static frame behind the entire document, with `backdrop-filter` stripped from every panel (G.21) and the atmosphere scrim deleted (G.17)**, so every panel from hero to CTA reads its text over an unchanging, unblurred, unscrimmed render. Today the reduced-motion canvas is an inline block scoped to the story region with nothing behind the rest of the page, which is strictly better, and it is better precisely because the three mitigations that make the animated version legible (the frame changes, the panel evacuates the frame region the camera is using, the composition is designed per stop) are all absent when the frame never changes.

**Under `prefers-reduced-motion: reduce` the canvas keeps today's mount: non-fixed, inline, scoped to the story region.** `data-stop` anchors outside that region are inert because nothing reads them. The render code is byte-identical; **only the mount point differs**, which is the same principle F.9 already states: a substituted state rather than a branch around the renderer. The first-paint fallback of F.10 follows the canvas: fixed when the canvas is fixed, inline and scoped when it is not, so the two never disagree about where the picture is.

F.9's reasoning for coord 3.70 is unchanged and stands.

Why 3.70: at that coordinate the camera is 78 percent of the way from the macro to the payoff (r 13.77, the whole line in frame), the handle is turned, the gate is open, the belt is running, the status channel is at 0.82, **two slabs are seated in the tray and three are on the belt**. It is the single frame that states the most of the story, which is what a park should be.

**Below 660 px of viewport height** the fixed canvas is not mounted at all and the document lays out as ordinary stacked sections with the chapter cards inline. The reasoning is the reference's: a fixed shot holds the composition still for its whole scroll distance, so anything that does not fit in one viewport is not merely cropped, it is unreachable. The current response is `@media (max-width: 1399px) and (max-height: 899px)` dropping hero elements to make room, which hides the symptom.

### F.10 First-paint fallback

A sub-2KB inline SVG line drawing of the bench ships in the HTML at `position: fixed; inset: 0; z-index: 0; opacity: 1; transition: opacity 0.9s linear`, so it is visible on **first paint** and there is never an empty box before the WebGL context is up. It is removed by a CSS rule, `.scene-ready .st-fallback { opacity: 0; visibility: hidden; }`, with the class added to `<html>` by the scene's own ready callback. Not by JS opacity, so a failed teardown leaves a drawing rather than a blank.

`.scene-failed` on `<html>` keeps the fallback permanently and hides the canvas. `webglcontextlost` is `preventDefault`ed into the fail path; `webglcontextrestored` rebuilds.

**The fallback's mount follows the canvas's mount.** Under reduced motion the canvas is inline and scoped to the story region (F.9), so the fallback is too. The two must never disagree about where the picture is, or a reduced-motion reader gets a full-page line drawing behind a scoped render.

### F.11 Failure is never an invisible page

Three independent nets, ported verbatim in shape:

1. `Promise.race([document.fonts.ready, wait(1500)])` before any measurement.
2. `setTimeout(() => { if (!built) { revealAll(); build(); } }, 4200)`.
3. The whole of `build()` inside a try/catch whose catch is `revealAll()`.

Nothing on this page is allowed to stay invisible because motion failed.

### F.12 Blast radius, in files

The first draft of this section implied roughly 15 files. **The real number is 27 to 31**: 3 rewritten, 12 modified, 6 deleted, 5 new, plus this document, is 27 by the list below, and 31 if the unit tests split further and `package-lock.json` is counted. (It was 28 to 32 before `next.config.ts` came off the list; see the note under Modified.) The undercount came from one wrong assumption: that a stylesheet could be "audited only". Under the new model every panel on the page overlaps a live full-viewport WebGL layer, so every `backdrop-filter` on the page is now a per-panel readback of that layer and every one of them is an edit, not an audit. The corrected list follows. Where a count is stated it is measured, not estimated.

**Rewritten (3):**
- `src/components/marketing/story-machine.tsx` (1821 lines now, roughly 1500 after)
- `src/components/marketing/story-scene.tsx` (395 now, roughly 260 after; becomes the long-take host, no stage)
- `src/components/marketing/story-scene.css` (318 now, roughly 150 after; loses the entire `.is-live` stage system, every breakpoint correction, and its 2 `backdrop-filter` sites)

**Modified (12):**
- `src/components/marketing/marketing-page.tsx` (canvas hoisted out of `StoryScene` to a sibling of `<main>`; `data-stop` added to nine sections; `<SiteAtmosphere />` and the `.mk-atmos` wrapper removed; fallback SVG mounted; skip link added)
- `src/app/marketing.css` (ground becomes a flat token, grain added at z-index 60, `.mk-atmos` block and its `::after` scrim deleted, `--mk-accent-glow` and `--mk-accent-ring` deleted with their consumers, **4 `backdrop-filter` sites stripped**, the nav decision below, skip-link rule added, every surviving fill moved behind an alpha-annotated token per F.1.1)
- `src/components/marketing/site-nav.tsx` **and its rules in `marketing.css`.** Listed as Untouched in the first draft, which was wrong twice over. See "The nav" below.
- `src/components/marketing/audit-steps.css` (**1 blur site**, plus its now-redundant `backdrop-filter: none` reset at 271-272)
- `src/components/marketing/faq-section.css` (**1 blur site**)
- `src/components/marketing/trust-section.css` (**1 blur site**, `blur(20px) saturate(160%)`)
- `src/components/marketing/workflow-tabs.css` (**1 blur site**, plus the file header comment at line 15 that calls the shell "the only backdrop-filter on the page", which was never true and is about to be false in the other direction)
- `src/components/marketing/roi-calculator.css` (the two `#fff` slider thumbs at 385 and 399 become `var(--mk-text)`, per F.1.2)
- `src/components/marketing/cta-orbit.css` (the orbit is paused when stop 13 is not the active stop, per I.8)
- `src/components/marketing/copy.ts` (chapter markers per 0.11, EN and NL. **The file is 72,749 bytes and the edit is purely additive**: new keys only, no existing string touched, no restructuring. Said explicitly because a 72KB file in a diff invites a cleanup pass that this change must not carry.)
- `package.json` (drop `shaders`)
- `docs/agora-rebuild-spec.md` (vocabulary purge, step 12)

**`next.config.ts` is NOT in the blast radius. Do not touch it.** The first draft of this document asserted the build succeeds "under static export" and the amendment pass raised that as a question to be decided before step 1. It has been decided, by measuring the build, and **there was nothing to decide: the premise was simply wrong.** `next.config.ts` is 133 bytes with an empty config object and no `output` field, and that is correct as it stands. This is a **hybrid Next.js app**: `/` and `/_not-found` prerender as static, while `/account`, `/admin/*`, `/api/media/*`, `/api/stripe/*`, `/auth/callback`, `/catalog`, `/catalog/[slug]`, `/creator/*` and `/dashboard` are dynamic, with proxy middleware in front. Adding `output: "export"` would not be a one-word change; it would **break the build**, because route handlers and middleware cannot exist under `output: "export"` at all. The marketing site is the static island in an otherwise dynamic application, and it stays that way.

**Measured, so the scope is not re-argued:** the marketing page carries **10 real `backdrop-filter` sites across six stylesheets** (4 in `marketing.css`, 2 in `story-scene.css`, 1 each in `audit-steps.css`, `faq-section.css`, `trust-section.css`, `workflow-tabs.css`), **11 declarations counting the `none` reset**, and **20 lines counting the `-webkit-` twins**. `globals.css:78` has a twelfth but it is outside the marketing tree. Correction to the review, which said 13.

**The nav, and it is a deliberate decision, not a drive-by repair.**

`.mk-nav__inner` carries `backdrop-filter: var(--mk-glass-blur-heavy)`, which is **`blur(60px) saturate(180%)`**. Under the new model that is a 60px blur readback of a live full-page WebGL layer, on an element pinned at the top of the viewport, **for the entire scroll**. It is the single most expensive surviving element on the page by a wide margin, and unlike a section panel it is never scrolled away from.

There is also a **verified pre-existing bug** underneath it. `.mk-nav` at `marketing.css:624` declares `position: fixed; top: 12px; z-index: 110`. But `SiteNav` renders `<header className="mk-nav">` (`site-nav.tsx:55`) as a direct child of `.mkt`, and `marketing.css:254` declares `.mkt > main, .mkt > footer, .mkt > header { position: relative; z-index: 1 }`. **`.mkt > header` is specificity (0,1,1); `.mk-nav` is (0,1,0).** The more specific rule wins regardless of source order, so `header.mk-nav` computes to **`position: relative; z-index: 1`**. **The nav is not floating today.** It scrolls away with the document, which is why nobody has noticed the blur cost.

That is a trap. Whoever notices the nav scrolling away will "fix" it by raising `.mk-nav`'s specificity, and will thereby silently reinstate a permanent 60px blur readback over the live canvas, at the top of the viewport, on every frame of a 13,000px scroll. **So decide it here, in writing, rather than leaving a latent repair:**

1. **The bug is not fixed as part of this work.** The nav stays `position: relative`. It is the correct behaviour under the long take anyway: a nav that scrolls away leaves the closing frames uncluttered, and stop 13 in particular gets its one bright element (the gold `.mk-btn--paper`) with no white nav pill above it.
2. **`.mk-nav__inner` loses `backdrop-filter` regardless**, like every other panel (G.21). It keeps its fill and its 1px border.
3. **A comment goes at `marketing.css:254` and at `marketing.css:624`** naming the specificity conflict, stating that the computed result is `relative; z-index: 1`, and stating that making the nav fixed again requires first deleting the blur and re-running I.8. A silent conflict becomes a documented decision.
4. If a later brief genuinely wants a floating nav, that is a separate change with its own performance budget, and it starts by reading point 3.

**Deleted (6):**
- `src/components/marketing/site-atmosphere.tsx`
- `src/components/marketing/hero-shader.tsx` (orphaned, zero importers, verified)
- `src/components/marketing/workflow-3d.tsx` (orphaned, zero importers, verified)
- `src/components/marketing/workflow-3d.css` (76 lines, orphaned the moment `workflow-3d.tsx` goes; missing from the first draft's list)
- `src/components/marketing/flow-compare.tsx` (192 lines, **already orphaned, zero importers**, missing from the first draft entirely)
- `src/components/marketing/flow-compare.css` (411 lines, already orphaned. **It alone accounts for 12 of the raw `background` hits**, so every `grep -c "background"` number quoted about this page, including the one in the first draft of F.1, was inflated by dead code.)

**New (5):**
- `src/components/marketing/story-stops.ts` (pure data and pure math, safe at module scope: the stop table, ATTENTION, KEY_SCALE, the fit envelopes, `smoothstep`, `clamp01`, `power2Out`, `power4In` written inline so the scene file never depends on GSAP; plus the measured anchor gaps, darkness percentages and calibration numbers written in as dated comments per the closing note)
- `src/components/marketing/story-fallback.tsx` (the inline SVG poster)
- `tests/unit/story-stops.test.ts` (I.2 device-pixel arithmetic, I.6.13 light-to-eye angles, the window-clamp and overlap assertions from F.5.1, the F.5.2 final-window solve)
- `tests/unit/story-geometry.test.ts` (I.6.1 through I.6.12)
- `tests/e2e/long-take.spec.ts` (I.3, I.4, I.5, I.7's alpha-resolving script, I.8, I.9)

The repo already has `@playwright/test` ^1.61.0, `vitest` ^4.1.9, `playwright.config.ts`, `vitest.config.ts`, `tests/e2e/` and `tests/unit/`, so this is new files in existing harnesses, not new tooling.

**Genuinely untouched:** every route, every auth/admin/creator/dashboard page, `scroll-fx.tsx` (Lenis stays as-is), `smooth-scroll.tsx`, `reveal.tsx`, `set-html-lang.tsx`, `agora-logo.tsx`, `approach-section.css`, `approach-pipeline.css`, `who-for.css`, all copy content, all Supabase/Stripe code. Four stylesheets survive the audit unmodified, not ten.

---

## G. WHAT IS DELETED

Unsentimental. More is deleted than added. Each item names the file and the reason.

1. **Five of the six lights.** `story-machine.tsx:1119` `HemisphereLight(HEMI_SKY, HEMI_GROUND, 0.5)`, `:1139` fill `DirectionalLight(FILL_BLUE, 0.65)`, `:1145` rim `DirectionalLight(GOLD, 1.8)`, `:1149` `screenLight` PointLight, `:1153` `outputLight` PointLight. **The rim light is the worst of them and it is the one that will be defended**, because the comment says it does most of the brand work in the frame. That is exactly the problem: it makes gold a lighting effect rather than a material, and it fills the precise back edges a cross-key exists to leave black.

2. **The bone-white body colour `0xf4f5f8`.** Deleted outright, not dimmed. Linear albedo 0.90 means the diffuse alone sits near RGB 200 no matter what the light does. There is no exposure at which it is not the brightest thing on the site.

3. **The rule "metalness is 0 on every single part INCLUDING the gold"** and its comment (`story-machine.tsx:523-525`). Candy gold at metalness 0 has a white dielectric specular and cannot look like gold under any light.

4. **Every clearcoat and clearcoatRoughness pair**, nine of them (`:533-534, :543, :552-553, :562-563, :582-583, :597, :608-609, :619-620`). A clearcoat is a second specular lobe with a white F0 on top of the material.

5. **The window panel** (`:799-822`, `RoundedBoxGeometry(1.4, 0.95, 0.1, SMALL_SEG, 0.09)`) and its `WIN_EMISSIVE = [0, 0, 0.25, 1.1, 0.55]`. A glowing screen on a machine is a UI decoration, and at 1.1 it is the second brightest object in the current frame. The information it carried moves to the DOM window over the canvas, where all typography belongs.

6. **All emissive everywhere.** `GOLD_EMISSIVE = 0x6a4c12` (`:115, :584-585`), `BELT_EMISSIVE = [0, 0, 0.1, 0.35, 0.18]` (`:755`), `beltTex` and the `emissiveMap` on `beltTopMat` (`:737-745`), `SCREEN` emissive. Emissive is light you did not have to earn.

7. **The painted contact shadow** (`:638-680`, `PlaneGeometry(10.5, 3.6)` plus the "0.15 more opacity when shadows are off" compensation). Replaced by one real shadow map, four milled feet, and modelled undercut grooves at every seam.

8. **The camera breathing term and every use of `elapsed`.** `:1373` the 0.55 Hz swing, `:1403` `BLOCK_PHASE_RATE` wrap, `:1519` the 0.09 Hz split drift, `:1537` `rig.position.y += Math.sin(elapsed * 0.22) * 0.035`, `:1548-1549` `sCamPos.y += sin(elapsed * 0.32) * 0.06` and `sCamPos.z += sin(elapsed * 0.21) * 0.08`, and the comment at `:1546` defending them. This is the change that makes reverse scroll exact, which is a stated hard constraint the current build silently violates.

9. **`shouldRender`'s unconditional trailing `return true`** and the comment "Camera and rig breathing are always on ... from here the answer is always yes."

10. **The `CatmullRomCurve3` camera path** (`:1177`) and the linear target interpolation that exists only to stop it flipping the view inside out. Both symptoms of the same wrong primitive. Also `planCurve` at `:1081` is replaced by an explicit polyline for the route tube.

11. **The cubic `easeInOut` inside `chapterCoord`** (`story-scene.tsx:60-67`). The second of three stacked smoothing passes and the one to cut.

12. **The pointermove parallax.** `story-machine.tsx:1199-1208` `targetPX`, `targetPY` at 0.55 and -0.3, and the `curPX`/`curPY` damps at `:1551-1552`. It is a second writer on the camera that scroll does not control, so a frame cannot be reproduced on reverse scroll while the mouse has moved. It is also the single most common tell of a template WebGL hero.

13. **`RIG_SCALE = [1.0, 1.0, 0.94, 1.0, 0.92]`** (`:1170`) and its application at `:1539`. A scale change inside a continuous shot is a cut you can feel.

14. **The entire `COPY_SPLIT` machinery.** `:173` the array, `:1216-1227` `splitPushGain` and `liftGain`, `:1496-1501`, `:1529-1536`, `:1668-1681` the setters. Roughly 120 lines of composition rescue that only existed because a bright centred object had to dodge centred copy. Once the object is dark and each section's anatomy evacuates the frame region the camera is using, it is not needed.

15. **`renderer.outputColorSpace = THREE.SRGBColorSpace`** (`:419`). Redundant with the three default.

16. **`DWELL = 0.52` and `TOTAL_UNITS = 4.52`** (`story-scene.tsx:50-51`). The hold now falls out of the driver geometry.

17. **`SiteAtmosphere`** (`site-atmosphere.tsx`, mounted at `marketing-page.tsx:50`) and the `.mk-atmos__shader` block. A four-layer animated shader is a second WebGL context and a second rAF loop competing with the long take, and it paints a background where the reference thesis requires none. The `.mk-atmos` CSS gradient at `marketing.css:230` goes with it, **and so does the `.mk-atmos::after` scrim at `marketing.css:239-249`** (`rgba(0,0,0,0.18)` to `0.42`, top to bottom), which exists only to keep glass text clear of the shader's brightest moments. The ground becomes a flat `--mk-bg` plus the grain layer.

    **This deletion is the first hunk of step 8, not step 9.** See H, "Why the atmosphere dies inside step 8". Between an atmosphere that is still mounted and a canvas that is `alpha: true` with `setClearColor(0x000000, 0)`, the machine renders straight over an animated gold swirl, on two always-alive full-viewport WebGL contexts.

18. **`HeroShader`** (`hero-shader.tsx`) and **`Workflow3D`** (`workflow-3d.tsx`, 22.9 KB). Both already orphaned with zero importers. Free deletions, verified.

19. **The `shaders` dependency** (`package.json`, `^2.5.124`). Its only two consumers are items 17 and 18. `grep -r "shaders/react" src/` must return nothing before this line is removed.

20. **`--mk-accent-glow: rgba(227, 189, 108, 0.3)` and `--mk-accent-ring: rgba(227, 189, 108, 0.4)`** (`marketing.css:41-42`) and every rule that consumes them. Coloured box-shadows are banned outright: `grep -nE "box-shadow:[^;]*(227|189|108|126|162|255)" src/` must return zero hits with a colour that is not black or white-alpha.

    **Both consumers, named, so neither is discovered as a build break.** There are exactly two.
    - `--mk-accent-ring` is consumed by the focus ring at `marketing.css:205`, `box-shadow: 0 0 0 3px var(--mk-accent-ring)`. Already replaced: I.7 requires `:focus-visible { outline: 1px solid var(--mk-text) }`.
    - `--mk-accent-glow` is consumed by **`.mkt ::selection` at `marketing.css:190`**, which the first draft missed. Deleting the token without this leaves selected text with no highlight at all, which is an accessibility regression, not a tidy-up. **Decision: selection loses the gold.** It becomes `background: var(--mk-line-strong)` (white at alpha 0.18) with `color: var(--mk-text-hi)`. Gold appears exactly four times on this page and each occurrence is numbered (I.7); a transient text highlight cannot be a fifth without breaking the count, and it has no claim to be the machine's material. A translucent white selection on a dark ground is correct and says nothing.

21. **`backdrop-filter` on any panel that overlaps the canvas, which under the long take is all of them.** A `backdrop-filter` over a full-bleed fixed WebGL layer forces a readback of that layer per painted panel, and it visibly smears the one thing the page is about. **All 10 sites**, measured: `marketing.css:588-589` (`.mk-btn--ghost`), `:617-618`, `:649-650` (`.mk-nav__inner`, the expensive one, see F.12), `:774-775`; `story-scene.css:86-87, 199-200`; `audit-steps.css:132-133` plus the now-redundant `none` reset at `:271-272`; `faq-section.css:211-212`; `trust-section.css:52-53`; `workflow-tabs.css:122-123` plus its file-header claim at line 15 that the shell is "the only backdrop-filter on the page". Twenty lines counting the `-webkit-` twins.

    **Panels keep their fill and their 1px border; they lose the blur.** That is not a contradiction of F.1, and the first draft of F.1 made it look like one. F.1.1 rule 2 allows a translucent fill at alpha at most 0.12, declared through an alpha-annotated token. `--mk-glass-bg` is `rgba(255, 255, 255, 0.08)` and passes as it stands; it only needs its alpha stated at the token. **No stylesheet on this page is "audited only" for this item.** See F.12.

22. **Uniform segment budgets.** `BOX_SEG = isMobile ? 5 : 6`, `BODY_SEG = isMobile ? 5 : 8`, `SMALL_SEG = 5` (`:480-482`). Replaced by a per-part radius and segment ladder (D.0).

23. **The five-key-per-part scale arrays where all five keys are `s3(1)`.** Twelve of sixteen parts carry five identical Vector3 allocations for nothing.

24. **The vocabulary.** "Lumpy boulder", "candy gold", "chunky toy factory line", "bone", "toy". Every occurrence in `story-machine.tsx`, `docs/agora-rebuild-spec.md` and any comment. If the brief calls the object a toy, the build makes one.

---

## H. BUILD ORDER

Twelve steps. Each is independently verifiable. Steps 1 through 6 happen inside the existing sticky stage, so the visual work is judged before the structural migration; step 8 is the migration, done as one atomic change.

**Correction to the first draft, which claimed "each ships" and "the site is never broken between steps".** That claim is false and the document already admits it: step 2's own verify block says **"It will look wrong"**. Materials do not land until step 5 and geometry is rebuilt part by part across 6a to 6h, so for roughly **eleven consecutive commits** the hero object is visibly half-old and half-new: one light on candy-plastic materials, then correct materials on old geometry, then a bed rebuilt to Sentinel standard sitting under a funnel that is not. Every one of those commits compiles and deploys. **None of them is presentable**, and I.10 rules out partial credit in as many words.

The honest claim:

> **The site always builds. It is not presentable between step 2 and step 6h.**

Therefore: **steps 2 through 6h run on a branch and merge as one.** Each sub-step stays its own commit, because the commit boundaries are what make the geometry work reviewable and revertable part by part, but the branch does not reach the deployed site until 6h is done and step 5's materials are on all of it. Nothing is gained by shipping a half-rebuilt machine and the schedule is not shortened by it.

**Steps 1, 7, 8, 9 and 10 are genuinely independently shippable**, and step 1 in particular must be, because it is a one-line exposure change that has to be judged alone.

---

**Step 1. Exposure and colour space.**
Change `toneMappingExposure` 1.05 to **0.80**. Delete `renderer.outputColorSpace`. Nothing else.
*Verify:* the page loads, the object is visibly darker and warmer in the shadows, `npm run build` passes, `npm run typecheck` passes. Screenshot the five chapters and keep them as the "before" set for step 4.
*Time:* 10 minutes. This is the highest-leverage change in the document and it must be judged in isolation.

**Step 2. One light.**
Delete the HemisphereLight, the fill, the rim and both PointLights. Add the single `DirectionalLight(0xfff1e2, 4.80)` at (-7.300, 7.070, 3.600) targeting (0, 1.070, 0). Wire `KEY_SCALE` and `keyMul`. Delete `screenLight.intensity` and `outputLight.intensity` writes at `:1360-1361`.
*Verify:* `grep -c "Light(" story-machine.tsx` returns exactly 1. The object is now mostly black with a bright edge on the deck. It will look wrong, because the materials are still candy plastic. That is expected and it is why this step is separate.

**Step 3. Environment and shadows.**
Set `scene.environmentIntensity = 0.285`. Set the shadow camera per A.5. Wire `probeTier` and `dprFor`; delete the `isMobile` DPR and antialias guesses. Set `shadowMap.needsUpdate` inside `renderNow` only.
*Verify:* on a tier 2 machine, `renderer.info.render.calls` in the console is stable and the four feet cast hard contact shadows. Force tier 0 in the probe and confirm the page still renders and the grooves carry contact.

**Step 4. THE CALIBRATION PASS.**
Take histograms of all five chapter frames at 1440x900 DPR 1 and 390x844 DPR 2. Sample the housing's unlit flank at the hero stop.
*Pass criterion:* unlit flank linear Y between **0.0121 and 0.0161** (3.0x to 4.0x the page ground).

***Measure against the flat `#0a0d14` ground, not against the gradient-plus-shader stack.*** The pass criterion is a **ratio** against "the page ground", and the page ground during this step is still `.mk-atmos`: a three-stop `linear-gradient(135deg, #0c1118, #0a0d14, #060810)` with a gold radial over it, the `SiteAtmosphere` shader at `opacity: 0.85` on top of that, and a black scrim from 0.18 to 0.42 over all of it. That is not a ground, it is a moving average, and a ratio measured against it is a number about the atmosphere. It would then be written into source with a date under the rule "the measurement overrules this document", and it would be wrong from step 8 onward.

So for the duration of this step: temporarily set the ground to a flat `#0a0d14` (comment out `.mk-atmos`, or set `body { background: #0a0d14 }` and hide the atmosphere layer), take the measurement, restore. **The measurement is against 0.004028 linear Y**, which is what `#0a0d14` is, and which is what the ground actually becomes after step 8.

The arithmetic confirms the criterion was authored against the flat ground and not against the shader: `#0a0d14` is sRGB (10, 13, 20), linearising to (0.003035, 0.004025, 0.006986), so Y = **0.004028**. Then 3.0x is **0.01208** and 4.0x is **0.01611**, which is the printed band **0.0121 to 0.0161** to three significant figures. Measuring through the atmosphere would move the denominator and quietly invalidate a band that is already correct.

Note in the source comment that the flat ground was substituted for the measurement, so the next reader knows the number was not taken through a shader.
*If it fails,* `scene.environmentIntensity` is the **only** value permitted to move. Write the measured number into the source with a comment naming what was measured, at what viewport, and on what date. **The measurement overrules this document.**
*Verify:* the comment exists, the number in code matches the measurement, and the design targets in section E are annotated with the measured percentages.

**Step 5. Materials.**
Replace all seventeen materials per C.2. Delete every clearcoat pair, every emissive, the window panel and its `WIN_EMISSIVE`, `BELT_EMISSIVE`, `GOLD_EMISSIVE`, `beltTex`. Delete the painted contact shadow plane. Wire the ATTENTION table and the per-station env ramp.
*Verify:* `grep -cE "clearcoat|emissive" story-machine.tsx` returns 0. The billet visibly cannot hold a highlight from any scroll position; the slabs visibly can. Re-run the step 4 histogram and re-annotate. Check the clip criterion from I.4 on the payoff frame; if it exceeds 0.15 percent, tune `mSlab` roughness per C.2 and re-measure.

**Step 6. Geometry, part by part, in this order.**
Each sub-step is a separate commit and the page renders after every one.
6a. Bed three plates, T-slot channels and floors, skirt rails, parting slab, feet.
6b. Housing body, lid, counterbores, cavity floor.
6c. Funnel with three steps, throat sleeve, segmented intake rim.
6d. Belt band, 34 slats, 2 lathe rollers.
6e. Handle boss, stem, knurled grip. Compute `GRIP_MACRO` from the geometry and assert it in a unit test.
6f. Billet with the seeded displacement; verify the seat height 2.1034 against the sphere-in-cone solution.
6g. Tray five plates with the low front wall, base seam, five slabs.
6h. Status channel four bars with corner breaks, route tube.
*Verify after each:* `grep -E "computeVertexNormals|flatShading"` returns nothing; triangle counts match D.15 within 2 percent; every stated seam plane appears as the same numeral in both parts' position expressions.

**Step 7. Driver purity.**
Change `update(coord, elapsed, dt)` to `update(coord)`. Delete every `elapsed` use, the breathing, the pointermove parallax and its listeners, `RIG_SCALE`, the `CatmullRomCurve3`, the COPY_SPLIT machinery and its three setters. Replace `shouldRender` with the dirty flag; delete the trailing `return true`. Wire the belt clock `tau`, the causal gate, and slab emission.
Also apply the **epsilon correction** of F.5.4 here, on the scene side: `set(v)` short-circuits on **exact equality only**, never on `|v - state.coord| < 0.0004`. It is two lines and it belongs in this step because it is a purity fix, not a driver-geometry fix.
*Verify:* the reverse-scroll purity test in I.5 passes for the first time, **run against the sticky stage as it exists at this step**, with the 1200 ms settle wait. Idle CPU in the Performance panel drops to zero after the damp settles. `grep -c "elapsed" story-machine.tsx` returns 0. The window-overlap and final-stop halves of I.5 cannot pass until step 8, because the windows do not exist yet; run everything else.

**Step 8. THE LONG-TAKE MIGRATION. One atomic change.**

***Hunk 1, and it is first: delete `SiteAtmosphere`, the `.mk-atmos` wrapper, the `.mk-atmos` gradient and the `.mk-atmos::after` scrim, and set the ground to flat `--mk-bg`.*** Only then hoist the canvas.

**Why the atmosphere dies inside step 8.** The first draft put the migration at step 8 and the `SiteAtmosphere` deletion at step 9. Between those two commits the page carries **two fixed, always-alive, full-viewport WebGL contexts**, and because the new canvas is `alpha: true` with `setClearColor(0x000000, 0)` and `scene.background = null`, **the atmosphere shows straight through it: the machine renders over an animated gold swirl.** That is the worst-looking commit in the plan and simultaneously the peak GPU cost of the entire project, sitting in the deployed site for however long step 9 takes.

It also invalidates step 4. Step 4's pass criterion is a ratio against "the page ground", measured while `.mk-atmos` is still mounted, and the closing note then enshrines that number in source with a date under the rule "the measurement overrules this document". Ship the ordering as first drafted and the calibration constant is a number about a shader that no longer exists. Step 4 now substitutes the flat ground for its measurement; this step makes the substitution permanent, and the two must not be separated by a released commit.

Then, in the same commit: create `story-stops.ts` with the fourteen-stop table, the fit envelopes, ATTENTION and KEY_SCALE. Hoist the canvas out of `StoryScene` to a fixed `inset: 0; z-index: 0` sibling of `<main>` in `marketing-page.tsx`. Add `data-stop` to the nine document sections and the five chapter panels. Replace `rawProgress`/`chapterCoord` with the clamped-window solver of F.5.1 and the final-stop window of F.5.2. Delete `DWELL`, `TOTAL_UNITS`, the `IntersectionObserver` and its `offscreen` guards (F.7), the `.st-stage.is-live` system and every breakpoint correction in `story-scene.css`. Mount the fallback SVG. Add the skip link. Add the short-viewport bail-out. Wire the reduced-motion mount per F.9: **non-fixed and scoped to the story region**, same render code, different mount point.

*Verify:* exactly **one** WebGL context and **one** rAF loop on the page, checked in the console, at every point in this commit's history that is reachable by `git checkout` on the branch. Scroll from hero to CTA with no jump and no cut; the object is behind every section; **no backwards snap at any boundary**, checked specifically at who/workflows, audit/roi, trust/faq and faq/contact, which are the four measured overlaps of F.5.0. `coord` reaches exactly 13.000 at `scrollY === maxScroll`. Deep-linking to `#roi` lands on stop 9 immediately. `/nl` produces the identical camera timing despite longer copy, **and reaches stop 13**. Record the fourteen measured anchor gaps into `story-stops.ts` with viewport and date.

**This step is the one that can be reverted cleanly, so it is one commit and nothing else rides in it.** The atmosphere deletion is not "something else riding in it": it is the hunk that makes the commit revertable at all, because reverting it must restore a page with exactly one background, and either ordering that splits the two produces a revert target with zero or two.

**Step 9. Chrome and CSS.**
Delete `HeroShader`, `Workflow3D`, `workflow-3d.css`, `flow-compare.tsx`, `flow-compare.css` and the `shaders` dependency. (`SiteAtmosphere` and `.mk-atmos` are already gone: step 8, hunk 1.) Grain layer at z-index 60. Delete `--mk-accent-glow` and `--mk-accent-ring`, and handle both consumers per G.20: the focus ring becomes `outline: 1px solid var(--mk-text)`, and `.mkt ::selection` becomes `var(--mk-line-strong)`. Strip `backdrop-filter` from all 10 sites. Move every surviving fill behind an alpha-annotated token per F.1.1. Change the two ROI slider thumbs to `var(--mk-text)`. Pause `.mk-cta__orbit` when stop 13 is not active (I.8). Add the nav specificity comments at `marketing.css:254` and `:624` per F.12. Number every gold and periwinkle occurrence at its point of use. Add the periwinkle scroll hairline. Add the per-chapter markers in EN and NL, additively, without touching any existing string in the 72,749-byte `copy.ts`.
*Verify:* the accent grep in I.7 returns exactly four numbered golds and two periwinkles; the I.7 alpha-resolving script passes; `grep -r "shaders/react" src/` returns nothing; `grep -rn "backdrop-filter" src/components/marketing/ src/app/marketing.css` returns nothing; `npm run build` is smaller than before.

**Step 10. Mobile and tier presets.**
Wire the mobile geometry preset off the tier probe, not a media query. Test at 390x844, 375x812 and 768x1024, and with a forced tier 0.
*Verify:* triangle count at tier 1 is roughly 32,500; the fit envelopes hold the bench in frame in portrait at every stop; the short-viewport bail-out fires below 660 px of height.

**Step 11. Acceptance.**
Run every test in section I. Record the results. Any FAIL is a blocker, not a note.
**I.1 is a human study and it gates this step.** Six non-developer viewers, three per round, two rounds, half a day of wall-clock time, and none of them may have seen the build. **Book them during step 6.** Everything else in section I runs on this machine; this one runs on other people's calendars, and it is the only line item that can slip the release by a week for reasons that have nothing to do with the code.
**I.2 has already run**, at build time, as items 14 and 15 of the I.6 vitest block. Confirm `WAIVERS` holds exactly one entry.

**Step 12. Vocabulary and documentation.**
Purge the toy vocabulary from every comment and from `docs/agora-rebuild-spec.md`. **In the same pass, correct that file's static-export premise**, which is where this document inherited it from: the app is hybrid, `/` and `/nl` are prerendered, and `output: "export"` would break the build. Leaving it uncorrected means the next reader finds two documents agreeing on a wrong fact. Write the measured calibration numbers, the recomputed light-to-eye table and the measured darkness percentages into `story-stops.ts` as comments, each with its measurement date. Update `docs/` to say that this document is the spec and that where the code disagrees with it the code has usually corrected it in writing.

---

## I. ACCEPTANCE TESTS

Run every line before shipping. **Any FAIL is a blocker, not a note.**

**How each test actually runs**, corrected from the first draft, which filed all of I.1 through I.5 under "automated with `@playwright/test`":

| test | how it runs | where it lives |
| --- | --- | --- |
| I.1 greyscale thumbnails | **a human study.** Playwright produces the thumbnails; people answer the questions. Not automatable, and calling it automated is how it gets skipped. | `tests/e2e/long-take.spec.ts` captures; the study is scheduled |
| I.2 device-pixel floor | **pure arithmetic** over constants from the stop and material tables. Nothing is measured from a rendered frame. Moved into I.6. | `tests/unit/story-stops.test.ts` |
| I.3 darkness | Playwright, **full-page screenshot** (the composited page, see F.1.2) | `tests/e2e/long-take.spec.ts` |
| I.4 clipping | Playwright, **canvas only** via `toDataURL` (see F.1.2) | `tests/e2e/long-take.spec.ts` |
| I.5 reverse-scroll purity | Playwright, canvas only | `tests/e2e/long-take.spec.ts` |
| I.6 geometry, arithmetic | `vitest`, node, no browser | `tests/unit/story-*.test.ts` |
| I.7 accent and alpha | greps plus a **DOM script that resolves tokens** | `tests/e2e/long-take.spec.ts` |
| I.8 performance | manual with the Performance panel, plus asserted counters | Playwright for the counters |
| I.9 build and routes | `npm` scripts plus Playwright | both |
| I.10 the last two | human review | review |

`@playwright/test` ^1.61.0, `vitest` ^4.1.9, `playwright.config.ts`, `vitest.config.ts`, `tests/e2e/` and `tests/unit/` all already exist in the repo.

### I.1 THE GREYSCALE THUMBNAIL TEST (the primary legibility gate). A HUMAN STUDY, NOT AN AUTOMATED TEST

For each of the five chapters, capture the frame at 1440x900 DPR 1, downsample to **160 px wide**, and desaturate to greyscale. Show each thumbnail on its own, with no copy and no context, to a person who has not seen the build.

| chapter | question they must answer correctly | pass criterion |
| --- | --- | --- |
| 0 hero | "Is this one machine or several separate objects?" | says one machine |
| 1 bottleneck | "Is something stuck? Where?" | says yes, and points at the funnel mouth |
| 2 mapping | "Has something been opened?" | says yes, and identifies the lifted plate as a lid |
| 3 machine | "Is there something here a person would touch?" | points at the knurled barrel |
| 4 payoff | "Which end is the finished work at?" | points at the tray, right side |

**Three of three independent viewers must answer correctly, per chapter, with no prompting beyond the question.** Test at least three viewers who are not developers.

If a chapter fails, the remedy is **never** to raise the key or the environment. It is, in order of preference: (a) raise the ATTENTION value of the station that carries the read, (b) increase the chamfer radius of the specific edge named in B.7 for that chapter, (c) re-aim the stop. Record which remedy was used.

Repeat the full test at 160 px from a 390x844 DPR 2 capture. Same criterion.

**Budget it, because it is a human study and it will otherwise be discovered on the day of step 11.**

- **Six willing people**, not three. Three per round, and the second round needs **fresh** viewers: a person who has already been asked "is something stuck?" about chapter 1 cannot answer it independently a second time at a different viewport, and re-using them turns the mobile round into a recall test.
- **Half a day**, wall-clock: capture and downsample the ten thumbnails, brief and run five open questions per viewer with no prompting, record answers verbatim, then reconcile.
- Nobody who has read this document, seen the build, or written any of its code may be a viewer.
- **This is a step 11 blocker.** Schedule the six people during step 6, not after step 10. Nothing else in section I depends on another person's calendar, and this one gates the release.
- Playwright's contribution is the capture only: render each stop at the two viewports, downsample to 160 px wide, desaturate, write to disk. Everything after that is people.

### I.2 The device-pixel floor for every named reading edge. A VITEST UNIT TEST, RUN AT BUILD TIME

**Reclassified.** The first draft filed this under "automated with `@playwright/test`", which implied a browser and a rendered frame. It needs neither: **every input is a constant from the stop table and the material table, and nothing here is measured from a pixel.** It is arithmetic. It therefore runs in `vitest`, in node, at build time, as **item 14 of the I.6 block**, in `tests/unit/story-stops.test.ts`. The table stays here rather than being physically relocated, because section E.5 and I.4 both cite "I.2" by name and those references must keep resolving.

Running it at build time is not a formality. These constants are exactly the ones a later geometry tweak changes without thinking (I.6.1 makes the same point about `GRIP_MACRO`), and a floor violation that surfaces at build is a five-minute fix where the same violation surfacing in the I.1 human study costs another six people and half a day.

For each chapter, compute the lit-arc width in device pixels at 1440x900 DPR 1:

```
px = radius * (2 * atan(roughness)) * (viewportHeight / frameHeight) * DPR
```

| chapter | edge | radius | computed | floor | status |
| --- | --- | --- | --- | --- | --- |
| 0 | bed front chamfer | 0.038 | 2.75 px | 2.00 | PASS |
| 1 | funnel step fillet | 0.014 | 1.58 px | 2.00 | **see note** |
| 2 | lid chamfer | 0.062 | 4.67 px | 2.00 | PASS |
| 3 entry | slat leading chamfer | 0.011 | 2.03 px | 2.00 | PASS, marginal |
| 3 terminal | grip collar chamfer | 0.030 | 19.5 px | 2.00 | PASS |
| 3 terminal | knurl root fillet | 0.004 | 2.60 px | 2.00 | PASS |
| 4 | slab chamfer | 0.026 | 1.33 px | 2.00 | **FAIL as authored** |

**THE TABLE ABOVE IS THE PRE-REMEDY STATE. IT IS NOT A PASSING BASELINE.**

Stated flatly because the table is printed with a `status` column and four PASSes in it, which reads like a green run. It is not. **As authored, this test ships two FAILs**: chapter 1 at **1.58 px** against a 2.00 floor, and chapter 4 at **1.33 px** against the same floor. Do not copy this table into `story-stops.ts` as the expected values and do not record it as a step 11 result. It is the statement of the problem, and the remedies below are the work.

**Two known failures with mandated remedies, and they must be applied and re-measured, not waived:**

- **Chapter 1**, the funnel step fillet at 1.58 px. It is rescued by *count*, not by width: three concentric fillets at three different radii, plus eleven rim segment faces at 54.6 x 8.9 px in the same frame. Remedy if the greyscale test still fails: raise the step fillet radius from 0.014 to 0.019, which yields 2.14 px.
- **Chapter 4**, the slab chamfer at 1.33 px. Remedy: raise the slab chamfer radius from 0.026 to **0.032**, which yields 1.64 px, and if the greyscale test still fails, to 0.040, which yields 2.05 px. Do not raise the key.

**Note what that ladder means now that this is a build-time assertion: 0.032 yields 1.64 px, which is still below the 2.00 floor.** The intermediate rung passes the human gate but not the arithmetic one. That is not a contradiction to be resolved by lowering the floor; it is the reason the assertion is written with an explicit waiver list rather than as a bare comparison:

```
for each named reading edge:
  assert computedPx(edge) matches the table to 2 decimals      // arithmetic regression guard
  assert computedPx(edge) >= 2.00  OR  edge is in WAIVERS       // the floor
```

`WAIVERS` is a literal array in `story-stops.ts`, and **every entry carries a reason string and a date**. Exactly one entry is legitimate at rest: **the belt slats at 0.79 px** at stops 0, 5, 6, 11 and 12, which are designed to read as a striped band (see the paragraph below). Any other entry is a temporary rung on a remedy ladder, and its reason string must cite the passing I.1 result that justifies it, by date and by viewer count. **`WAIVERS` must contain exactly one entry at step 11.** An empty reason string is a failing test, not a note.

**Also record, honestly, where a read is collective rather than individual.** The belt slats at stops 0, 5, 6, 11 and 12 compute at 0.79 px and are *designed* to read as a striped band. That is not a failure; it is a documented intent, and the greyscale test at those stops asks about the band, not the ticks.

### I.3 Darkness measurement, per chapter, per viewport

Capture each of the fourteen stops at 1440x900 DPR 1 and 390x844 DPR 2. Compute the percentage of pixels whose greyscale value is below RGB 40.

**Scope: the composited page, not the canvas.** A full-page screenshot, not `canvas.toDataURL`. The designed percentages in section E describe what the viewer sees, and under the long take the canvas *is* the page ground, so DOM copy, panel fills and the grain are all part of the frame being judged. This matters for the "above RGB 200" check below: `.mk-btn--primary` at `#ffffff` contributes about **0.53 percent** of a 1440x900 frame per instance (F.1.2), which is inside the 12 percent cap by a factor of twenty but is not zero and must not be discovered as a surprise. **I.4 is the opposite scope**, canvas only, and the reason is given there.

Stop 13 is capturable only because of the final-stop window in F.5.2. If the harness cannot reach `coord` 13.000, the bug is the window, not the capture.

| stop | designed | acceptable band |
| --- | --- | --- |
| 0 hero | 74 % | 68 to 80 |
| 1 bottleneck | 71 % | 65 to 78 |
| 2 mapping | 76 % | 70 to 82 |
| 3 machine entry | 79 % | 72 to 85 |
| 3 machine terminal | 58 % | 50 to 66 |
| 4 payoff | 73 % | 66 to 80 |
| 5 to 13 | not specified | must not fall below 62 % except stop 3 |

**The designed numbers in section E are annotations, not requirements.** Write the measured values into `story-stops.ts` next to each stop, with the measurement date and viewport. If a stop falls outside its band, the tuning knob is the ATTENTION row for that stop, never the light and never the exposure.

**Additional check:** no stop other than 3-terminal may have more than 12 percent of pixels above RGB 200.

### I.4 Clipping

**Scope: the canvas only**, via `canvas.toDataURL("image/png")`. This is a render test: it is about ACES, about `mGoldGrip`'s `envMapIntensity` and about `mSlab`'s roughness, and every remedy it names is a material change. Measured over the composited page instead, a single `.mk-btn--primary` at `#ffffff` is 0.53 percent of the frame and fails a 0.15 percent cap on its own, which would be a true measurement of the wrong thing. **I.3 is the opposite scope**, composited page, and the reason is given there.

At every one of the fourteen stops, at both viewports, the percentage of canvas pixels at 255 in **any** channel must be **below 0.15 percent**.

Expected offenders: the gold grip collar at stop 3-terminal, and the slab chamfers at stop 4. Both are intentional and both are bounded by arc length. If either exceeds the cap, apply the remedy in C.2 (`mSlab` roughness, then metalness) or reduce `mGoldGrip` `envMapIntensity` from 1.35 in steps of 0.05 to a floor of 1.15. **Never lower `KEY_BASE`.**

Also assert: no pixel **in the canvas** has a hue that ACES pushed toward magenta, checked as `max(R,G,B) === B && B - G > 30 && R > G` over the gold regions. Zero pixels. (ACES is a renderer stage; DOM pixels never pass through it, so page scope would be meaningless here as well.)

### I.5 THE REVERSE-SCROLL PURITY TEST

The stated hard constraint, and the current build silently violates it.

**Procedure.**
1. Load the page at 1440x900, DPR 1, with animations enabled and Lenis active.
2. Scroll from `scrollY = 0` to `scrollY = documentHeight - innerHeight` in **60 equal steps**. At each step, wait for `requestIdleCallback` plus **1200 ms** so the `damp` has fully settled, then capture the canvas via `toDataURL("image/png")` and record `scrollY`.

   **1200 ms is the default, and the first draft's 700 ms is deleted, because 700 fails on its own arithmetic.** At lambda 9, the residual after `t` seconds is `e^(-9t)`. At 700 ms that is `e^(-6.3)` = about **1.8e-3** of the step, and for a full unit step that lands right on the 4e-4 neighbourhood the epsilon operates in. A test whose settle wait is the same order as its own tolerance measures the wait, not the code. At 1200 ms the residual is `e^(-10.8)` = about **2.0e-5**, a factor of twenty clear.
3. Scroll back from bottom to top through the **same 60 scrollY values in reverse order**, with the same settle wait, capturing again.
4. Compare frame *i* from the descent against the frame at the identical `scrollY` from the ascent.

**Pass criterion: byte-identical PNGs at all 60 positions. Not "perceptually similar". Identical.**

**Three defects that would have failed this test structurally, all fixed before it is run:**

- **(a)** F.5's original "on leave, `coord = to`; on leave-back, `coord = from`" was direction-dependent by construction, and no amount of settling makes a direction-dependent write produce identical frames in both directions. Deleted: a clamped window ends exactly at `to` and starts exactly at `from`, so boundaries snap from arithmetic. See F.5.1.
- **(b)** The epsilon early return in the dedupe left the resting value up to 0.0008 of `coord` from the target, in whichever direction it approached from, and the dirty flag then froze that difference permanently. At stop 3 that is 0.0013 of `r`, enough to flip an 8-bit value on the 2.60 px knurl root fillet at DPR 2. Fixed: land on the target, only exact equality short-circuits. See F.5.4 and F.7.
- **(c)** The 700 ms settle wait was inside its own tolerance. Fixed above.

If any pair still differs, the diff localises the offending term. Common causes, in order of likelihood: a surviving `elapsed` reference, a `wrap01` that accumulates rather than recomputes, a non-monotone belt clock, an `InstancedMesh` matrix written incrementally instead of from `f(coord)`, or a surviving epsilon early return in `set()`. **Do not extend the settle wait past 1200 ms to make a diff go away.** If 1200 ms is not enough, the resting state is not a function of `scrollY` and that is the finding.

**Assert the driver directly as well, and this one is cheap.** In `vitest`: for 2000 values of `scrollY` across `[0, maxScroll]`, `coordFor(scrollY)` must be monotone non-decreasing, must equal exactly `k` at every `winEnd[k]`, must equal exactly `k - 1` at every `winStart[k]`, must equal exactly 13.000 at `maxScroll`, and **no two windows may overlap**: `winStart[k] >= winEnd[k-1]` for every k, plus `finalStart >= winEnd[12]`. That last assertion is the one that catches F.5.0 coming back, and it runs in milliseconds without a browser.

**Second half of the test: the belt never reverses within a forward scroll.** Sample `tau(c)` at 2000 points across `c` in [0, 13]. Assert `tau(c[i+1]) >= tau(c[i])` for every i. The minimum derivative is 0.0143 at c 2.75; assert it is positive.

**Third half: the parked frame is reachable and stable.** With `prefers-reduced-motion: reduce`, capture the canvas twice, 5 seconds apart, with no interaction. Byte-identical, and `performance.getEntriesByType` shows no rAF activity in between.

Also assert the mount, per F.9: under reduced motion `getComputedStyle(canvas).position` is **not** `fixed`, and the canvas's bounding box is inside the story region rather than the viewport. A parked frame behind the whole document is the page's worst permanent contrast case, and it is a one-line CSS regression away at all times.

### I.6 Geometry and craft assertions (unit tests, `vitest`)

Run against the built geometry, in node, with no browser.

1. `GRIP_MACRO` recomputed from the grip's own barrel radius, chamfer radius and axis position equals `(1.8600, 1.9912, 1.0812)` to 4 decimal places. **If the chamfer changes and this test is not updated, the macro camera is aiming at nothing.**
2. Billet seat height, recomputed as `coneApexY + billetRadius / sin(coneHalfAngle)`, equals **2.1034** to 4 decimals.
3. Every stated touching plane appears as the identical float in both parts' position expressions: `-0.440` three times, `0.000` four times, `1.760` twice, `1.640` twice, `0.140` three times.
4. Skirt end rails butt side rails at exactly `±4.460`: zero overlap, zero gap.
5. Parting slab inset is `0.024` on both axes.
6. Tray pocket clearance is `0.050` per side on both axes.
7. Slab slot bottoms are `0.140 + n * 0.220` for n in 0..3.
8. Status channel corner breaks are `0.014` at all four corners.
9. Rim segment gap is `0.01416 ± 0.0002`.
10. Roller radius equals belt half-height exactly (`0.150`).
11. `grep -E "computeVertexNormals|flatShading"` over `story-machine.tsx` returns nothing.
12. Triangle counts per part match D.15 within 2 percent.
13. Recompute all fourteen light-to-eye angles from the stop table and `L`. **Thirteen must fall in [80, 120] degrees; exactly one (stop 3) may fall outside, and it must be in [55, 65].**
14. **The whole of I.2**, which is arithmetic over the stop and material tables and belongs here: the computed device-pixel width of every named reading edge, matched to the table to 2 decimals, then floored at 2.00 px with the `WAIVERS` list. The table printed in I.2 is the **pre-remedy** state and must not be used as the expected values. `WAIVERS` must contain exactly one entry (the belt slats) at step 11.
15. **The driver, per the vitest block at the end of I.5**: window monotonicity, exact integers at every window boundary, exactly 13.000 at `maxScroll`, and **zero overlap between any two windows**. Run it against the anchor tops measured at 1440x900, 1440x1440 and 390x844, because the overlap defect of F.5.0 is viewport-dependent and only bites at some heights.

### I.7 The accent grep, and the background alpha script

```
grep -nE "e3bd6c|E3BD6C|mk-accent" src/ --include=*.tsx --include=*.ts --include=*.css
grep -nE "7ea2ff|7EA2FF|mk-ai" src/ --include=*.tsx --include=*.ts --include=*.css
```

Within the long-take region (hero through CTA):
- **Exactly four gold sites**, each carrying a `/* GOLD n of 4 */` comment: `mGoldRim`, `mGoldGrip`, `mChannel`, the primary CTA fill.
- **Exactly two periwinkle sites**, each numbered: `mRoute`, the scroll progress hairline.
- **Zero gold** on any heading, eyebrow, card border, focus ring, hover glow, section label, gradient text or coloured box-shadow.
- `:focus-visible` uses `outline: 1px solid var(--mk-text)`. Assert the accent tokens appear in no `outline` declaration.

Additionally:
```
grep -rnE "box-shadow:[^;]*(rgba\(2[0-9]{2}|rgba\(1[0-9]{2})" src/     # must be empty
grep -rn "backdrop-filter" src/components/marketing/ src/app/marketing.css   # must be empty, all 10 sites
grep -rn "shaders/react" src/                                          # must be empty
```

**The background gate is a script, not a grep.** The first draft's `grep -rn "radial-gradient\|linear-gradient" src/app/marketing.css` cannot enforce F.1: **23 of the live background declarations resolve through a `var(--mk-*)` token** and are invisible to any regex over literal colours, another 26 are literal `rgba()` that a gradient grep never sees, and the raw counts are inflated by 12 declarations in the zero-importer `flow-compare.css`. See F.1.1 for the full measurement.

Run this in the page instead, as part of `tests/e2e/long-take.spec.ts`:

```
for every element between the hero and the CTA:
  s = getComputedStyle(el)                         // resolves every custom property for us
  for each background layer in s.backgroundColor and s.backgroundImage:
    a = effective alpha (1.0 for an opaque hex or a named colour;
        the alpha channel for rgba/hsla; multiplied by s.opacity of the
        element and of every ancestor up to .mkt)
    FAIL unless a <= 0.12 or el matches an entry in ALLOW
```

`ALLOW` is a literal list in the test file, and it is short. **Exactly two entries** at rest:

| element | value | why |
| --- | --- | --- |
| `.mk-footer` | `#050810`, alpha 1.0 | below the long take, deliberately terminal (F.1.2) |
| `.mk-skip:focus-visible` | opaque | a focused skip link must be legible; it exists only while focused (F.1.2) |

Anything else at alpha above 0.12 is a FAIL with the element named, and adding an entry to `ALLOW` requires a reason string in the same commit. Note the two surfaces that pass without an entry and are expected to: `.mk-why__cell--statement::before` at effective alpha **0.03**, and every panel fill through `--mk-glass-bg` at **0.08**.

Assert separately that **`.mk-btn--primary` does not appear inside `#contact`** (F.1.2). Stop 13 carries exactly one bright element and it is the fourth gold.

### I.8 Performance

| metric | tier 2 | tier 1 | tier 0 |
| --- | --- | --- | --- |
| triangles drawn | ~54,000 | ~32,500 | ~32,500 |
| draw calls | 34 | 34 | 34 |
| shadow passes per frame | 1 | 1 | 0 |
| **GPU work at rest, 3D layer** | **0** | **0** | **0** |
| frame time while scrolling | under 8 ms | under 16.6 ms | under 16.6 ms |
| WebGL contexts on the page | **1** | 1 | 1 |
| rAF loops on the page | **1** | 1 | 1 |
| textures in the 3D layer | **0** | 0 | 0 |
| network requests by the 3D layer | **0** | 0 | 0 |

**The at-rest number is the one that matters and it is the one to check first.** Scroll to a chapter, stop, wait two seconds, and confirm the Performance panel shows no scripting and no GPU activity **from the 3D layer**. If it does, `shouldRender`'s trailing `return true` survived, or a time term survived, and I.5 will fail too.

**The row is scoped to the 3D layer, because page-wide it is false, and it is false at the closing frame.** `.mk-cta__orbit` runs **16 permanent compositor animations**: three `mk-orbit` ring rotations plus thirteen counter-rotations, one per integration chip, all `linear infinite`, all `transform`, all on their own layers (`cta-orbit.tsx`, `cta-orbit.css:62, 105`). They never stop. `#contact` is **stop 13**, the last frame the reader sees and the one the whole document builds to, so the one place the page most wants to be still is the one place it never is.

**Decision: pause the orbit when stop 13 is not the active stop, and this is the better fix, not the cheaper one.** `.mk-cta__orbit { animation-play-state: paused }` by default, released to `running` by a class the driver sets when `coord >= 12`. Cost: one class toggle in an existing driver. Benefit: the sixteen animations are inert for 94 percent of the scroll instead of running behind every other section's copy, which is also where they were costing the most and being seen the least. The orbit still moves where it was designed to move.

The row therefore reads: **3D layer at rest is zero, everywhere. Page at rest is zero everywhere except stop 13, where sixteen compositor animations run by design.** `cta-orbit.css:131-141` already stops them under reduced motion, so that path is unaffected.

Tier 1 target hardware: a 2019 laptop with integrated graphics, 1440x900 at DPR 1.5, which is a 2160x1350 drawing buffer.

### I.9 Build and route integrity

- `npm run build` succeeds.
- **`/` and `/nl` both appear in the route table as `○ (Static) prerendered as static content`.** That is the assertion, and it is the one that matters: it is what makes the module-scope rule below binding.
- **The dynamic routes and the middleware are unaffected.** `/account`, `/admin/*`, `/api/media/*`, `/api/stripe/*`, `/auth/callback`, `/catalog`, `/catalog/[slug]`, `/creator/*` and `/dashboard` all still build as `ƒ`, and the proxy middleware still builds. This work touches the marketing island only; if a marketing change moves a dynamic route's mode, something has been imported across the boundary.
- **No assertion about export mode, because there is none.** The first draft asserted the build succeeds "under static export". It is a **hybrid app**, not a static export, and `output: "export"` would break it outright (route handlers and middleware cannot exist under it). See F.12. **`docs/agora-rebuild-spec.md` carries the same wrong premise and must not be read as corroborating it.**
- `npm run typecheck` clean.
- `npm run lint` clean.
- `grep -rnE "window\.|document\.|navigator\.|matchMedia" src/components/marketing/story-*.tsx` shows **zero module-scope hits**. Every one must be inside a function body, a `useEffect`, or a guarded lazy import.

  **State the reason, not just the rule, because the reason is what stops someone deleting the guard.** `/` and `/nl` are **prerendered at build time**: their module scope is evaluated in node, where `window`, `document`, `navigator` and `matchMedia` do not exist. A module-scope touch is a build failure, not a runtime warning. This is the real constraint and it is unchanged by the export-mode correction above.

  It is also why `story-stops.ts` is specified as pure data and pure math (F.12): it is the one file in this work that is *safe* at module scope, and it is safe because it never reaches for the DOM. Everything else in the long take, the renderer, the `ResizeObserver`, the anchor measurement, the `matchMedia` reduced-motion listener of F.9, the `visibilitychange` gate of F.7, lives inside an effect. **Do not "simplify" any of these guards on the belief that the marketing page is client-only. It is not. It is the prerendered part of a hybrid app.**
- `/` and `/nl` both render, both produce identical camera timing at identical scroll fractions, and the chapter markers are translated. **Assert explicitly that both reach `coord` 13.000 at `scrollY === maxScroll`.** As first drafted this was locale-dependent: `#contact`'s top is 83px past `documentHeight - innerHeight` on `/`, so stop 13 was unreachable, while `/nl`'s 15 to 20 percent longer copy might have grown the document enough to squeak past. The two locales would then have had **different endings**, which is exactly what this line exists to forbid. F.5.2 removes the dependency by pinning the final window to `maxScroll`; this assertion is what keeps it removed.
- With JavaScript disabled: the fallback SVG is visible, every section is readable, no element is stuck at opacity 0.
- With `prefers-reduced-motion: reduce`: one parked frame at coord 3.70, no rAF after the first, all copy visible, and **the canvas is not `position: fixed`** but scoped to the story region as it is today (F.9). A parked frame behind the entire document, with the blur stripped from every panel and the atmosphere scrim gone, is the page's worst contrast case and would be permanent for the reader who most needs it not to be.
- Below 660 px viewport height: the canvas is not mounted, sections stack, the page is fully readable.
- Kill the WebGL context via `WEBGL_lose_context` in the console: `.scene-failed` appears, the fallback SVG returns, no console error escapes to the user, the page remains fully readable.

### I.10 The last two, and they are the hardest

**Nothing to hide behind.** With zero shadows in CSS, zero gradients, zero glows, zero emissive, zero clearcoat and zero imagery in the 3D layer, every element is fully exposed. This direction has the least tolerance for sloppy execution and **it will look cheaper than the current decorated page if it is built at 90 percent.** There is no partial credit. If the schedule will not carry steps 5 and 6 done properly, do not start step 1.

**Name the claim.** For every moving element on the page, state in one sentence which product claim it is making. The five permitted sentences are:

1. Work arrives whether you are ready or not.
2. This is where it stops.
3. Here is the route it actually takes.
4. A person is still deciding, and the machine waits for them.
5. It got done without you.

Walk every animated quantity in F.8 and assign it one of those five. The billet drop is 1. The billet seated in the throat is 2. The lid lift and the route draw are 3. The belt plateau, the handle turn and the belt resume are 4. The slab emission, the tray stack and the status channel are 5.

**If a reviewer cannot name the claim a moving element is making, that element gets cut.** Not softened, not moved: cut.

---

## CLOSING NOTE FOR THE ENGINEER

The reference's most transferable habit is not any number in it. It is that when the code disagreed with its own spec, the code won **in writing, with the measurement stated**. The macro dolly moved from 0.06 to 0.32 and the caption moved with it. Four published contrast ratios were re-measured in the browser and all four were wrong, so the stylesheet says so at the point of use. An ink token was demoted out of text use with the reason stated.

Do that here. Steps 4, 5 and 11 will produce numbers that disagree with section E and possibly with A.4 and C.2. **When they do, the measurement goes into the source with a comment naming what was measured, at what viewport, and on what date, and this document is annotated to match.** A build that tells you exactly what its numbers are worth is the build you trust.

---

## REVISION NOTE: WHAT BUILDABILITY REVIEW CHANGED, AND WHY

This document has been through buildability review and the habit above has already been applied to it once. Eight things changed. They are listed here so the next reader does not re-litigate a decision that was made against a measurement, and so nobody restores the first draft's version of any of them believing it was the considered one.

| # | what was wrong | what it is now |
| --- | --- | --- |
| 1 | F.5's windows were `top bottom` to `top top`, one viewport each. **Seven of eight boundaries overlapped at a 1440px viewport height, the worst by 994px**, and in an overlap band two drivers wrote `coord` in the same frame: a backwards snap every frame. | Windows clamped to `min(viewport, gap)`. `coord` is solved from `scrollY` every frame by walking the clamped windows. The selling point is restated honestly: a transition costs `min(one viewport, the gap)`. **F.5.0 to F.5.3.** |
| 2 | Stop 13 was unreachable. `#contact` top 13336px against `maxScroll` 13253px, an **83px shortfall**, so "the fourth gold" never rendered, and on `/nl` it might have, making the ending locale-dependent. | The final stop gets its own window, `max(top[12], top[13] - innerHeight)` to `maxScroll`. Four lines and a guard. **F.5.2.** Not solved by `min-height: 100dvh` on the CTA, which would change the design. |
| 3 | F.1 claimed transparency comes from "never writing a background", with a six-case allow-list, and contradicted G.21 in the same document. **64 live background declarations, 7 opaque, 26 literal `rgba()`, 23 behind tokens and invisible to any regex.** | An auditable rule: no opaque fill hero to CTA except the footer; translucent fills at alpha at most 0.12; every fill through an alpha-annotated token. The gate is a token-resolving script, not a grep. Four missed surfaces decided explicitly. **F.1.1, F.1.2, I.7.** |
| 4 | H ran the long-take migration at step 8 and the `SiteAtmosphere` deletion at step 9, leaving **two always-alive full-viewport WebGL contexts** with the machine rendering over an animated gold swirl, and invalidating step 4's calibration ratio. | The atmosphere deletion is **hunk 1 of step 8**. Step 4 measures against the flat `#0a0d14` ground (Y = 0.004028), which is what its own 3.0x to 4.0x band was authored against. **H steps 4, 8, 9; G.17.** |
| 5 | Reverse-scroll purity had three defects: a direction-dependent leave/leave-back snap, an epsilon early return that froze a 0.0008 difference permanently (0.0013 of `r` at stop 3), and a 700 ms settle wait inside its own tolerance. | Snap language deleted (the clamp makes it free), epsilon lands on the target instead of stopping near it, settle wait is 1200 ms. **F.5.1, F.5.4, F.7, I.5.** |
| 6 | F.9 parked the reduced-motion canvas at `fixed; inset: 0` behind the whole document, with panel blur stripped and the scrim deleted: the page's worst contrast case, permanently, for the reader who most needs it not to be. | Under reduced motion the canvas keeps today's mount: non-fixed, scoped to the story region. Identical render code, different mount point. The fallback SVG follows it. **F.9, F.10, I.5, I.9.** |
| 7 | F.12 implied 15 files, listed ten stylesheets as "audited only", listed `site-nav.tsx` as Untouched, and omitted four files entirely. | 27 to 31 files, with the real list, the 10 measured `backdrop-filter` sites, the new test files, and the **nav specificity bug** (`.mkt > header` at (0,1,1) beats `.mk-nav` at (0,1,0), so the nav is not floating today) recorded as a deliberate decision rather than left as a latent repair. **F.12.** |
| 8 | H claimed every step ships while step 2's own verify block said "It will look wrong". I.1 was filed as automated when it is a human study. I.2 was filed as a browser test when it is arithmetic, and its printed table ships two known FAILs. | "The site always builds; it is not presentable between steps 2 and 6h", and 2 through 6h merge as one branch. I.1 is relabelled, budgeted at six people and half a day, and made a step 11 blocker. I.2 moves into the I.6 vitest block, with its table marked pre-remedy. **H preamble, I preamble, I.1, I.2, I.6.14, I.6.15.** |

Three numbers from the review were themselves corrected against the tree, in the same spirit: the marketing page has **10** `backdrop-filter` sites, not 13; there are **64** live background declarations, not 66; and the pure white button is **`.mk-btn--primary`**, not `.mk-btn--paper`, which is gold and is the fourth gold. All three corrections are recorded at their point of use.

**And one premise was retired outright.** Both the first draft of this document and the amendment pass treated "the build succeeds under static export" as a requirement to be satisfied, the amendment pass by raising `next.config.ts` as a decision to be made before step 1. Measuring the build settled it: **this is a hybrid Next.js app, not a static export.** `/` and `/_not-found` prerender; `/account`, `/admin/*`, `/api/*`, `/auth/callback`, `/catalog`, `/catalog/[slug]`, `/creator/*` and `/dashboard` are dynamic, behind proxy middleware. `output: "export"` would break the build, because route handlers and middleware cannot exist under it. **`next.config.ts` is out of the blast radius and must not be touched.**

The constraint that the wrong premise was standing in for is unchanged and still binding, and it is now stated for the right reason at I.9: **`/` and `/nl` are prerendered at build time, so nothing may touch `window`, `document`, `navigator` or `matchMedia` at module scope.** Stated that way it is much harder to "simplify" the guards later on the belief that the marketing page is client-only.

**`docs/agora-rebuild-spec.md` carries the same static-export premise and is wrong in the same way.** It is not corroboration. It is the source of the error, and step 12 already has that file open for the vocabulary purge; correct the premise in the same pass.