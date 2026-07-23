---
name: manim-execution
description: Standard execution, visual design guidelines, Manim Community syntax rules, layout standards, and physical accuracy guidelines for rendering Manim scenes in this workspace using uv.
---

# Manim Execution & Design Guidelines

## Environment & Execution Directives
- **ALWAYS** execute Python scripts and Manim renders using `uv run python` or `uv run manim` (or `..\.venv\Scripts\manim.exe`).
- **NEVER** call external or global system Python binaries directly.
- **Render Commands**:
  - High quality 1080p render: `uv run manim -qh scene.py SceneClassName`
  - Fast preview render: `uv run manim -ql scene.py SceneClassName`

---

## 🎨 Visual Design & Color System (Editorial Paper Style)
Maintain an elegant, publication-ready Academic/Editorial paper visual style:
- **Background**: Paper Cream `#F9F4E9` with subtle background grid (`#C7CEC7`, opacity 0.18) and subtle contour curves.
- **Text / Ink**: Deep Charcoal `#29342F`.
- **Palette**:
  - Primary Accent Blue: `#315F6D`
  - Warm Amber: `#A77748`
  - Sage Green: `#4F745D`
  - Clay Red: `#8F4E3E`
  - Muted Grey: `#69736D`
  - Card Fill: `#FFFDF6` with 96% opacity.

---

## ✍️ Typography & Font Hierarchy Rules
1. **Font Choice**: Use `Source Han Serif CN` (`思源宋体 CN`) for all Chinese text (`weight="SEMIBOLD"`).
2. **Title Font Sizes**:
   - Main Slide / Section Titles: **32pt – 36pt** (Never use 44pt–50pt titles to avoid top-edge crowding).
   - Card Headers: **24pt – 26pt**.
   - Body Text: **18pt – 20pt**.
   - Math Formulas: **28pt – 34pt**.
3. **CRITICAL LaTeX MathTex Rules**:
   - **NEVER put Chinese characters inside `MathTex` or `latex(...)` strings** (e.g. `latex(r"\text{中文}")` causes DVI LaTeX compilation errors without ctex).
   - **Correct Pattern**: Separate math formulas and Chinese text using `VGroup(latex(r"\vec{g} \perp", 28, AMBER), cn("水准面", 20, AMBER)).arrange(RIGHT, buff=0.08)`.
4. **Color Syntax Constraint in Manim Community**:
   - **NEVER** pass `"rgba(r,g,b,a)"` strings to `fill_color` or `stroke_color` (triggers `ValueError: Color rgba not found`).
   - **Correct Pattern**: Pass hex string `fill_color="#315F6D"` and opacity as a separate parameter `fill_opacity=0.12`.

---

## 📐 Layout & Composition Standards
1. **Top-Left Header Badge**:
   - Standardize top-left section marker: `Circle(radius=0.22, stroke_color=BLUE)` + section number (`02`, `02.1`) + title `cn(..., 32, INK)` placed around `[-3.6, 3.45, 0]`.
2. **Eliminate Floating Edge Texts**:
   - Never slap floating text boxes randomly along screen edges ("凸起/凹陷/扰动" or giant floating English words). Use integrated callout cards or aligned badges.
3. **Explanation Cards**:
   - Card dimensions: Width `5.4 - 5.8`, Height `4.2 - 4.6`, Corner Radius `0.12`.
   - Ensure interior badge boxes (e.g., bottom pill badges) have generous width (`4.8 - 5.2`) so text never overflows border lines.

---

## 📐 Geometric & Physical Realism Standards
1. **Perpendicularity / Surface Normals**:
   - Gravity vectors ($\vec{g}$) must be strictly normal to equipotential surfaces (Geoid).
   - Calculate exact unit inward normal vectors $\vec{n}_{\text{in}}$ using parametric derivatives of the curve, and attach right-angle perpendicular marks ($\perp$).
2. **3D Revolutions / Sweeps**:
   - When generating surfaces of revolution (e.g. Ellipsoid), draw a **true 2D Ellipse** (never a semi-circle!), and animate 360° rotation around the minor axis with projected meridians and parallel latitude circles.
3. **Tangent / Best-Fit Alignment (参心坐标系)**:
   - For local reference ellipsoids, show the datum shift vector $\vec{\Delta r}$ moving $O_{\text{Ref}}$ away from $O_{\text{Mass}}$, so that the reference ellipsoid curve is **strictly tangent/aligned** with the Geoid surface in the target region, highlighted with glowing arcs.

---

## ⏱️ Timing & Smoothness
- Always use `rate_func=smooth` for all transition animations.
- Match animation cue timestamps strictly with audio/SRT timelines.
