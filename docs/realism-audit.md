# Duo appearance audit — 2026-09-10

References: https://www.apple.com.cn/iphone-duo/ and https://www.apple.com.cn/iphone-duo/specs/.

- Fetched the current official glTF from the URL in `public/assets/model/attribution.json`. Parsed contents equal the shipped model: geometry, animation, UVs and material definitions match. Download SHA-256: `30cab0c2102ecf050a5e07bdbe2ef36d1edfc522779abfc3434296792843bb4c`.
- Source mesh bounds agree with published width/height within 2%, allowing protruding buttons: unfolded 165.21 × 117.68 mm, folded 85.16 × 117.68 mm. Published body dimensions: unfolded 164.6 × 117.8 × 5.2 mm; folded 84.1 × 117.8 × 11.3 mm. Full model depth includes camera protrusions, so it must not be compared directly to nominal body thickness.
- The original hinge animation deforms the model continuously, returns to the same closed shape, and retains arbitrary drag angles. Inner and outer display UV corners project upright and unmirrored.
- Corrected the prior matte treatment: Apple specifies nano-texture on the inner display. Removed artificial bump noise and screen-material overrides; preserved the original inner clearcoat/roughness maps and outer glass material. The simulated inner app surface retains a faint texture without blur or desaturation; outer app surfaces have no matte overlay.
- Restored exposure to the official scene's value of 1 and display emission to the glTF source value of 1.
- Type checking, production build and all eight regression tests passed. Browser inspection was attempted twice but the in-app browser connection timed out before a screenshot could be obtained; visual and interaction QA could not be completed in this audit.

Limits: independent Three.js lighting is not Apple's complete rendering pipeline; Apple-specific coat/specular extensions are not all supported by GLTFLoader. Night-sky model coloration remains an approximation (official reference photos are available). Interactive apps are simulations. This is an official-model-based presentation, not a calibrated physical or photometric replica of a real device.

## Follow-up matte calibration

The user requested another adjustment after the source-material restoration. The inner display now uses a renderer-specific clearcoat roughness of 0.68, clearcoat intensity of 0.7 and environment intensity of 0.7. Its original clearcoat coverage map remains intact; the roughness map is not used in this calibration. No bump noise, white tint, blur or emission changes are applied. The simulated app display uses a low-opacity, neutral soft-light microtexture instead of a white overlay. Outer glass remains unchanged. This calibration is a visual approximation, not an Apple-specified optical measurement.
