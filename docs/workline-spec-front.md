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

**Camera.** `{ az 1.28, el 0.24, r 15.400, target (0.600, 0.150, 0.000), fov 30, near 0.400, fit FIT_ALL }`. Rig yaw **-0.14**, tilt **+0.02**. Light-to-eye **115.6 degrees**, back-