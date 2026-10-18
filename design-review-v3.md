# Dimensioned concept revision

All geometry in `src/applicator.js` is specified in millimetres. The display scene uses a uniform scale; individual parts are never stretched between views.

## v4 head revision (default)

The v3 flat head (11 mm long, Ø19 mm, flat face) read as a cap on a tube. v4 replaces it; v3 remains selectable on the page for comparison.

- Head tapers from Ø19 mm at the body joint (0.13 mm radius per mm) and is cut by a 20° bevel plane. Head length 22.4 mm; bevel face about 13.8 × 13.8 mm.
- The bevel normal faces the contact area, so the camera sits flush on the face: the optical axis is 1.7° off the bevel normal.
- Camera is a 3.9 mm-class endoscope module with LED ring (Ø6 mm bezel, Ø3.9 × 4 mm envelope). Camera-to-tip axis offset 6 mm (v3: 9 mm).
- Working distance drops from about 24 mm to about 15 mm; nominal overall length stays 126 mm. The cotton covers more of the frame at this distance. Aiming at the near cotton edge is still the intended use.
- Clearances checked in `verify-model.mjs`: bezel to face edge 1.56 mm, collar to face edge 1.22 mm, bezel to collar 0.83 mm, camera envelope to head inner wall 0.49 mm.
- Body diameter is unchanged at 20 mm; slimming it needs a different battery and board layout.

## Defined targets (v3 baseline)

- Grip diameter 20 mm; nominal overall length 126 mm; shell thickness 1.2 mm.
- Cotton envelope 7.5 × 12 mm; insertion spigot 6 mm, stop shoulder and clean gripping collar.
- Separate curved button surface sits 0.04 mm below the cylinder envelope. Face grooves are shallow geometry, with 0.3 mm demonstration travel and an internal switch envelope.
- Camera module is angled toward the cotton contact target. Assumed vertical field of view 60°, aspect ratio 1.5; approximately 24 mm working distance.
- Battery envelope 10 × 36 × 7 mm; main board 11 × 29 × 1 mm; camera envelope 5 × 7 × 4 mm. These are packaging targets, not verified commercial parts.
- Hollow shell, internal rails, charging-board envelope, removable two-screw tail cap, and centered USB-C aperture.

## Verified digitally

Run `node verify-model.mjs` to check the contact target and surrounding 10 × 10 mm patch lie inside the assumed camera frame; the button does not protrude; main internal box envelopes fit the shell radius; views and color changes preserve component geometry.

The Fit & optics inset renders the same model from the virtual device camera. It is a geometric visualization, not captured footage or an optical performance claim. The actual contact point is covered by the cotton; surrounding skin and the tip edge are the useful visible references.

## Physical checks still required

1. Select actual camera, LED, battery, switches and connector; replace packaging envelopes with supplier models. Validate sensor focus, illumination, thermal behavior and image transmission.
2. Make 18/20/22 mm grip mockups with representative mass. Test pen and palm grips at the back of the head, left/right hands, different hand sizes, wet hands and gloves. The blue grip band is a study location, not an ergonomic validation.
3. Test cartridge insertion/pull force, anti-rotation and wear; complete the retention geometry and cleaning/sealing design.
4. Detail switch guides, travel, return mechanism and seal. The displayed face texture is a shallow prototype proposal, not a claim of tactile effectiveness.
5. Resolve cap screw threads/inserts, carrier extraction sequence, cable disconnection, connector tolerances, electrical clearances and interference through full CAD.
6. Test wiping/cleaning and ointment compatibility. Do not infer these from the render.

The result remains a dimensioned Three.js concept, not a production CAD assembly or manufacturing release.
