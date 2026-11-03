# SparkyWheel brand assets

- `sparkywheel-logo.png`: untouched supplied master. Keep this original for social/promotional use.
- `sparkywheel-logo-horizontal.png`: transparent horizontal adaptation made with ImageGen from the master; not a layered/vector export or a pixel-exact extraction. Preserve the master as the source of truth.
- `sparkywheel-logo-header.webp`: 576 × 192 web derivative, quality 90, alpha preserved. Rendered at 192 × 64, 144 × 48, or 120 × 40 inside a 44px minimum tap area. Uses the same pre-sized Next Image/unoptimized approach as the existing Cloudflare mascot assets.
- `sparkywheel-icon.png`: simplified ImageGen adaptation of Sparky's yellow silhouette and smiling face, with wheel, limbs and wordmark omitted for small-size use.
- `sparkywheel-icon-{16,32,48,180,192,512}.png`: Lanczos-resized icon exports.
- App Router `favicon.ico`: 16/32/48px frames. `icon.png`: 32px. `apple-icon.png`: 180px. App manifest declares 192/512px icons with purpose any (not maskable).

The supplied flattened PNG has overlapping illustration/wordmark elements, so the adaptations are not mathematically exact separations. A layered original or approved vector horizontal lockup would be the best long-term master for strict brand reproduction. No original asset or Yes/No mascot state was overwritten.

## Adaptation prompts (built-in ImageGen)
Horizontal: Rearrange existing mascot plus wheel to the left of the original SparkyWheel wordmark, centered vertically, transparent compact horizontal composition. Preserve original mascot identity, expression, pose, lettering style, colors and underline. No extra elements, new text or redesign.
Icon: Extract the original yellow star silhouette and friendly eyes, eyebrows and open smile; omit wheel, arms, legs, lettering and sparks. Center on transparent square with safe padding and retain original colors/shading.
