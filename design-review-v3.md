# Dimensioned concept revision

All geometry in `src/applicator.js` is specified in millimetres. The display scene uses a uniform scale; individual parts are never stretched between views.

## Defined targets

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
