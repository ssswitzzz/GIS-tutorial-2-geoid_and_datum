---
name: video-motion-design
description: Standard motion design principles, Remotion React composition rules, typography, visual hierarchy, asset safety, and render configuration for high-end educational video production.
---

# Video Motion Design Guidelines (Remotion & Web Motion)

## 🎨 Visual Design System & Aesthetics
- **Never Build Basic MVPs**: Educational motion graphics should have a stunning, state-of-the-art visual presentation that wows the viewer at first glance.
- **Color Palette & Theme**:
  - Maintain a curated, harmonious color scheme matching the course subject (e.g. Editorial Paper & Geodetic Theme: `#F9F4E9` Paper background, `#29342F` Charcoal ink, `#315F6D` Slate blue, `#A77748` Amber, `#4F745D` Sage green, `#8F4E3E` Clay red).
  - Use subtle background textures, grid lines (`opacity: 0.18`), and soft contour curves.
- **Typography & Font Hierarchy**:
  - Prefer modern serif typography (e.g. `Source Han Serif CN` / `思源宋体 CN`) for academic/editorial titles and subtitles.
  - **Refined Title Font Sizes**: Avoid oversized titles that crowd the top edge. Keep main scene headers modest (around 32px – 36px) and section badges around 20px – 24px.
  - Use structured text cards, badges, and pill tags rather than un-styled floating text.
- **No Unnecessary English / Parenthetical Annotations**:
  - Do NOT append gratuitous bracketed English translations or annotations to UI titles, card labels, or section headers (e.g. write `空间直角坐标系` or `大地经度 L`, NOT `空间直角坐标系 (Spatial Rectangular Coordinate System)` or `大地经度 (Geodetic Longitude)`).
  - Keep all UI text and labels in clean, concise Chinese unless explicitly requested by the user or when rendering LaTeX math variables (e.g. $X, Y, Z, L, B, H$).

---

## 🎬 Remotion Motion Composition Rules
1. **Easing & Micro-Animations**:
   - Use smooth spring physics (`spring({ fps, frame, config: { damping: 200 } })`) or cubic bezier easing (`interpolate(frame, [0, 30], [0, 1], { easing: Easing.out(Easing.cubic) })`).
   - Avoid abrupt jumps; ensure clean enter/exit transitions (`FadeIn`, `SlideIn`, `ScaleIn`).
2. **Layout & Alignment**:
   - Maintain clear visual separation between animated 3D/2D graphics and explanation cards (e.g. Left graphic column, Right text/card column).
   - Never slap un-aligned text labels onto floating object boundaries.
3. **Asset & Video Safety in Remotion**:
   - Handle `<Video />` and `<Img />` error boundaries cleanly to prevent `HTMLVideoElement.errorHandler` media playback crashes.
   - Always verify asset paths (`staticFile(...)`) and ensure media files exist before referencing.

---

## ⚙️ Render Settings & Encoding Best Practices
1. **Resolution & Frame Rate**:
   - Standard resolution: 1080p (`1920x1080`).
   - Frame rate: 30 fps (or 60 fps for ultra-smooth motion graphics).
2. **Encoding Parameters**:
   - **Codec**: H.264 (`h264`) for maximum compatibility.
   - **CRF (Constant Rate Factor)**: Set CRF to `18 - 20` for high-clarity 1080p output.
   - **Pixel Format**: `yuv420p` for standard hardware player playback.
3. **Parameter Trade-offs**:
   - **CRF vs Bitrate**: Lower CRF value = higher quality & larger file size. CRF 18 is visually lossless for web/course publishing.
   - **Preset**: Use `medium` or `slow` for optimum compression efficiency.
