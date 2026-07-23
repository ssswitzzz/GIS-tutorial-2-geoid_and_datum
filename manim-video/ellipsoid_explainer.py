from __future__ import annotations

import math
import numpy as np
from manim import *

# Resolution and frame_rate driven by manim.cfg (default 480p 15fps for fast preview)
config.background_color = "#F9F4E9"

CN_FONT = "Source Han Serif CN"
PAPER = "#F9F4E9"
PAPER_LIGHT = "#FFFDF6"
INK = "#29342F"
SAGE = "#4F745D"
BLUE = "#315F6D"
AMBER = "#A77748"
CLAY = "#8F4E3E"
MUTED = "#69736D"
GRID = "#C7CEC7"

# 00:02:17.400 -> 00:04:05.033, exactly 3229 frames at 30 fps (107.633 s).
DURATION = 3229 / 30


def cn(text: str, size: float, color: str = INK, weight: str = "SEMIBOLD", **kwargs) -> Text:
    return Text(text, font=CN_FONT, weight=weight, font_size=size, color=color, **kwargs)


def latex(text: str, size: float, color: str = INK) -> MathTex:
    return MathTex(text, font_size=size, color=color)


def geoid_curve_point(theta: float, center: np.ndarray, width: float = 4.8, height: float = 4.4) -> np.ndarray:
    """Computes exact (x, y, 0) point on the irregular geoid parametric curve."""
    r = 1.0 + 0.065 * math.sin(3 * theta + 0.4) + 0.04 * math.sin(7 * theta - 0.8)
    x = center[0] + (width * 0.5) * r * math.cos(theta)
    y = center[1] + (height * 0.5) * r * math.sin(theta)
    return np.array([x, y, 0.0])


def geoid_inward_normal(theta: float, width: float = 4.8, height: float = 4.4) -> np.ndarray:
    """Computes exact unit inward normal vector to the geoid parametric curve."""
    eps = 1e-4
    p_minus = geoid_curve_point(theta - eps, np.zeros(3), width, height)
    p_plus = geoid_curve_point(theta + eps, np.zeros(3), width, height)
    tangent = (p_plus - p_minus) / (2 * eps)
    normal = np.array([-tangent[1], tangent[0], 0.0])
    norm = np.linalg.norm(normal)
    return normal / norm if norm > 1e-6 else np.array([-math.cos(theta), -math.sin(theta), 0.0])


def irregular_geoid(
    width: float = 4.8,
    height: float = 4.4,
    color: str = CLAY,
    fill_opacity: float = 0.13,
) -> VMobject:
    """Creates a smooth VMobject loop representing the irregular geoid."""
    points = [geoid_curve_point(th, np.zeros(3), width, height) for th in np.linspace(0, TAU, 200)]
    shape = VMobject(stroke_color=color, stroke_width=3.5, fill_color=color, fill_opacity=fill_opacity)
    shape.set_points_smoothly(points + [points[0]])
    return shape


def smooth_ellipse(width: float = 5.2, height: float = 4.2, color: str = BLUE, fill_opacity: float = 0.10, stroke_width: float = 3.8) -> Ellipse:
    return Ellipse(
        width=width,
        height=height,
        stroke_color=color,
        stroke_width=stroke_width,
        fill_color=color,
        fill_opacity=fill_opacity,
    )


def make_card(
    title: str,
    title_color: str,
    items: list[VMobject | str],
    tag_text: str | None = None,
    tag_color: str = SAGE,
    width: float = 5.6,
    height: float = 4.5,
) -> VGroup:
    """Helper to build perfectly aligned information cards with background frame and optional highlight badge."""
    bg = RoundedRectangle(
        width=width,
        height=height,
        corner_radius=0.14,
        stroke_color=title_color,
        stroke_width=1.8,
        fill_color=PAPER_LIGHT,
        fill_opacity=0.96,
    )

    t_mob = cn(title, 24, title_color)
    divider = Line(LEFT * (width * 0.38), RIGHT * (width * 0.38), color=title_color, stroke_width=1.4)

    content_group = VGroup(t_mob, divider)

    for item in items:
        if isinstance(item, str):
            content_group.add(cn(item, 19, INK))
        else:
            content_group.add(item)

    if tag_text:
        tag_bg = RoundedRectangle(
            width=width * 0.88,
            height=0.52,
            corner_radius=0.08,
            stroke_color=tag_color,
            fill_color=tag_color,
            fill_opacity=0.12,
        )
        tag_t = cn(tag_text, 17, tag_color)
        tag_t.move_to(tag_bg)
        tag = VGroup(tag_bg, tag_t)
        content_group.add(tag)

    content_group.arrange(DOWN, buff=0.18)
    content_group.move_to(bg)

    return VGroup(bg, content_group)


class EllipsoidExplainer(Scene):
    def wait_until(self, target: float) -> None:
        remaining = target - self.time
        if remaining > 1 / config.frame_rate:
            self.wait(remaining)

    def cue(self, target: float, *animations: Animation, run_time: float = 0.75, **kwargs) -> None:
        self.wait_until(target)
        self.play(*animations, run_time=run_time, rate_func=smooth, **kwargs)

    def paper_background(self) -> VGroup:
        grid = VGroup()
        for x in np.arange(-8.0, 8.1, 0.8):
            grid.add(Line([x, -4.5, 0], [x, 4.5, 0], color=GRID, stroke_width=1).set_opacity(0.18))
        for y in np.arange(-4.8, 4.9, 0.8):
            grid.add(Line([-8.2, y, 0], [8.2, y, 0], color=GRID, stroke_width=1).set_opacity(0.18))
        contours = VGroup(
            CubicBezier([-7.7, 2.75, 0], [-4.5, 3.65, 0], [-2.5, 2.05, 0], [0.2, 2.75, 0]),
            CubicBezier([-7.8, 2.15, 0], [-4.5, 3.05, 0], [-2.4, 1.55, 0], [0.4, 2.2, 0]),
            CubicBezier([0.0, -3.15, 0], [2.5, -2.35, 0], [4.6, -3.6, 0], [8.0, -2.65, 0]),
            CubicBezier([0.0, -3.75, 0], [2.6, -2.95, 0], [4.8, -4.1, 0], [8.1, -3.2, 0]),
        ).set_stroke(BLUE, width=1.4, opacity=0.15)
        return VGroup(grid, contours)

    def top_header(self, index: str, title: str) -> VGroup:
        """Clean top-left header safely positioned inside screen margins (UL corner)."""
        circle = Circle(radius=0.22, stroke_color=BLUE, stroke_width=1.8, fill_color=PAPER_LIGHT, fill_opacity=0.96)
        number = latex(rf"\mathrm{{{index}}}", 20, BLUE).move_to(circle)
        label = cn(title, 30, INK).next_to(circle, RIGHT, buff=0.22)
        header = VGroup(circle, number, label)
        header.move_to([-6.5, 3.35, 0]).align_to([-6.5, 3.35, 0], LEFT)
        return header

    def construct(self) -> None:
        self.add(self.paper_background())

        # =========================================================================
        # BEAT 1 (0.000s -> 15.800s / Subtitle 64-71):
        # 内部质量分布不均匀 ➔ 大地水准面仍然无法用公式表达
        # =========================================================================
        header1 = self.top_header("02", "从大地水准面继续：寻找数学表达")

        geoid_center = np.array([-3.2, -0.25, 0])
        geoid_b1 = irregular_geoid(4.8, 4.4, CLAY, 0.15).move_to(geoid_center)
        geoid_label = VGroup(
            cn("大地水准面", 28, INK),
            latex(r"\mathrm{(GEOID)}", 22, CLAY),
        ).arrange(DOWN, buff=0.06).move_to(geoid_center)

        self.cue(0.0, Write(header1[0]), Write(header1[1]), Write(header1[2]), Create(geoid_b1), Write(geoid_label), run_time=0.85)

        # Uneven mass distribution dots
        mass_dots = VGroup(
            Dot(geoid_center + np.array([-0.7, 0.6, 0]), radius=0.55, color=CLAY).set_opacity(0.35),
            Dot(geoid_center + np.array([0.6, -0.5, 0]), radius=0.72, color=AMBER).set_opacity(0.38),
            Dot(geoid_center + np.array([-0.1, -0.7, 0]), radius=0.45, color="#C86E45").set_opacity(0.4),
        )
        mass_label = VGroup(
            latex(r"\rho_1 \neq \rho_2 \neq \rho_3", 32, CLAY),
            cn("内部质量分布不均匀", 22, CLAY),
        ).arrange(DOWN, buff=0.08).move_to(geoid_center)

        self.cue(2.0, LaggedStart(*[FadeIn(d, scale=0.5) for d in mass_dots], lag_ratio=0.12), run_time=0.7)
        self.cue(3.433, FadeOut(geoid_label, shift=UP * 0.15), Write(mass_label), run_time=0.65)

        # Gravity vectors g perpendicular (normal) to the geoid surface
        gravity_arrows = VGroup()
        perp_marks = VGroup()
        angles = np.linspace(0, TAU, 10, endpoint=False)
        for th in angles:
            p_surface = geoid_curve_point(th, geoid_center, 4.8, 4.4)
            n_in = geoid_inward_normal(th, 4.8, 4.4)
            p_start = p_surface - n_in * 0.9
            p_end = p_surface + n_in * 0.1
            arr = Arrow(p_start, p_end, buff=0, color=AMBER, stroke_width=2.5, max_tip_length_to_length_ratio=0.2)
            gravity_arrows.add(arr)

            tangent_dir = np.array([-n_in[1], n_in[0], 0])
            arm1 = Line(p_surface, p_surface - tangent_dir * 0.12, color=AMBER, stroke_width=1.5)
            arm2 = Line(p_surface - tangent_dir * 0.12, p_surface - tangent_dir * 0.12 - n_in * 0.12, color=AMBER, stroke_width=1.5)
            perp_marks.add(VGroup(arm1, arm2))

        field_title = VGroup(
            latex(r"\vec{g} \perp \mathrm{Surface}", 28, AMBER),
            cn("重力线处处垂直于水准面", 20, AMBER),
        ).arrange(DOWN, buff=0.06).move_to([3.4, 2.15, 0])

        self.cue(7.233, LaggedStart(*[GrowArrow(a) for a in gravity_arrows], lag_ratio=0.06), Create(perp_marks), Write(field_title), run_time=1.0)

        # Right side limitation summary card
        b1_card = make_card(
            title="物理曲面的计算困境",
            title_color=CLAY,
            items=[
                "• 重力线随质量不均产生偏折",
                "• 曲面呈现不规则凹凸起伏",
                latex(r"S(x,y,z) \neq \mathrm{Formula}", 28, INK),
            ],
            tag_text="⚠️ 无法在计算机中建立解析几何公式",
            tag_color=CLAY,
            width=5.6,
            height=4.3,
        ).move_to([3.4, -0.65, 0])

        self.cue(8.833, Create(b1_card[0]), LaggedStart(*[Write(item) for item in b1_card[1]], lag_ratio=0.15), run_time=0.85)

        # =========================================================================
        # BEAT 2 (15.800s -> 42.700s / Subtitle 72-81):
        # 磨平起伏 ➔ 2D 椭圆 3D 旋转生成三维旋转椭球体
        # =========================================================================
        header2 = self.top_header("02", "第二级逼近：旋转椭球体")

        # Target smooth ellipse for morphing
        ellipse_target = smooth_ellipse(5.4, 3.9, BLUE, fill_opacity=0.12, stroke_width=3.8).move_to(geoid_center)

        # Clean transition 1 -> 2: header1 fades out UP, header2 enters with Write(). geoid_b1 stays on screen.
        self.cue(
            15.8,
            FadeOut(header1, shift=UP * 0.2),
            FadeOut(VGroup(mass_dots, mass_label, gravity_arrows, perp_marks, field_title, b1_card), shift=DOWN * 0.15),
            Write(header2[0]), Write(header2[1]), Write(header2[2]),
            run_time=0.85,
        )

        # At 23.5s, geoid_b1 morphs seamlessly into ellipse_target! No sudden appearance or strange callouts.
        self.cue(23.5, ReplacementTransform(geoid_b1, ellipse_target), run_time=1.4)

        # Real 2D Ellipse revolving 360° around minor axis Z to form 3D Ellipsoid
        z_axis = Line([-3.2, -2.6, 0], [-3.2, 2.1, 0], color=INK, stroke_width=2.2)
        x_axis = Line([-6.0, -0.25, 0], [-0.4, -0.25, 0], color=INK, stroke_width=1.8).set_opacity(0.5)

        # Semi-major axis a and semi-minor axis b
        arrow_a = DoubleArrow([-3.2, -0.25, 0], [-0.5, -0.25, 0], buff=0, color=BLUE, stroke_width=3.0)
        label_a = VGroup(latex("a", 30, BLUE), cn("长半轴", 18, BLUE)).arrange(RIGHT, buff=0.06).next_to(arrow_a, UP, buff=0.06)

        arrow_b = DoubleArrow([-3.2, -0.25, 0], [-3.2, 1.7, 0], buff=0, color=SAGE, stroke_width=3.0)
        label_b = VGroup(latex("b", 36, SAGE), cn("短半轴 (极半径)", 18, SAGE)).arrange(RIGHT, buff=0.08).next_to(arrow_b, RIGHT, buff=0.08)

        self.cue(32.1, Create(z_axis), Create(x_axis), GrowArrow(arrow_a), Write(label_a), GrowArrow(arrow_b), Write(label_b), run_time=1.1)

        # Rotation sweep animation: 2D Ellipse revolving 360 degrees around Z axis
        rot_arc = Arc(radius=0.9, start_angle=-PI / 3, angle=5 * PI / 3, color=AMBER, stroke_width=3.5).add_tip(tip_length=0.16).move_to([-3.2, 1.5, 0])
        rot_label = VGroup(cn("绕极轴旋转 360°", 20, AMBER), latex(r"\mathbf{\omega}", 24, AMBER)).arrange(RIGHT, buff=0.1).next_to(rot_arc, RIGHT, buff=0.1)

        # Generate 3D wireframe meridians and latitudes
        meridians = VGroup()
        for phi in np.linspace(0, PI, 8, endpoint=False):
            w_projected = max(0.2, 5.4 * abs(math.cos(phi)))
            meridians.add(
                Ellipse(width=w_projected, height=3.9, stroke_color=BLUE, stroke_width=1.4).set_fill(opacity=0).set_stroke(opacity=0.25).move_to(geoid_center)
            )

        latitudes = VGroup()
        for y_off in np.linspace(-1.4, 1.4, 6):
            r_lat = 2.7 * math.sqrt(max(0.0, 1.0 - (y_off / 1.95) ** 2))
            latitudes.add(
                Ellipse(width=2 * r_lat, height=0.32, stroke_color=SAGE, stroke_width=1.2).set_fill(opacity=0).set_stroke(opacity=0.3).move_to([-3.2, -0.25 + y_off, 0])
            )

        # Right side mathematical card for Ellipsoid
        b2_card = make_card(
            title="旋转椭球体 (Ellipsoid)",
            title_color=BLUE,
            items=[
                latex(r"\frac{x^2+y^2}{a^2} + \frac{z^2}{b^2} = 1", 32, INK),
                VGroup(latex(r"\alpha = \frac{a-b}{a}", 26, AMBER), cn(" (扁率 Flatness)", 18, AMBER)).arrange(RIGHT, buff=0.08),
                "✨ 表面完全光滑规整",
                "✨ 几何关系严密，可精确定位",
            ],
            tag_text="📐 测绘学建立大地坐标系的基础",
            tag_color=BLUE,
            width=5.6,
            height=4.5,
        ).move_to([3.4, -0.4, 0])

        self.cue(35.1, Create(rot_arc), Write(rot_label), LaggedStart(*[Create(m) for m in meridians], lag_ratio=0.06), run_time=1.2)
        self.cue(38.65, LaggedStart(*[Create(l) for l in latitudes], lag_ratio=0.06), Create(b2_card[0]), LaggedStart(*[Write(item) for item in b2_card[1]], lag_ratio=0.15), run_time=1.0)

        # =========================================================================
        # BEAT 3 (42.700s -> 59.533s / Subtitle 82-89):
        # 怎么寻找最合适的椭圆？ ── 测绘学家 200 年来的两类拟合思路
        # =========================================================================
        header3 = self.top_header("02", "如何寻找最合适的椭球面？")
        sub3 = cn("测绘学家几百年来探索出的两类经典拟合思路", 22, MUTED).next_to(header3, DOWN, buff=0.12).align_to(header3, LEFT)

        card_g_intro = make_card(
            title="思路 01 • 全球平均拟合",
            title_color=BLUE,
            items=[
                "中心与地心重合 (地心坐标系)",
                "追求在全球范围内整体误差最小",
                "现代卫星测绘与 GPS / 北斗基础",
            ],
            tag_text="🌐 WGS-84 / CGCS2000",
            tag_color=BLUE,
            width=5.4,
            height=3.8,
        ).move_to([-3.2, -0.5, 0])

        card_l_intro = make_card(
            title="思路 02 • 局部最佳拟合",
            title_color=AMBER,
            items=[
                "中心脱离地心，向特定国家/区域贴合",
                "追求本国/本区域内误差最小",
                "历史传统测量与经典参心坐标系",
            ],
            tag_text="📍 北京54 / 西安80",
            tag_color=AMBER,
            width=5.4,
            height=3.8,
        ).move_to([3.4, -0.5, 0])

        # Transition 2 -> 3
        self.cue(
            42.7,
            FadeOut(header2, shift=UP * 0.2),
            FadeOut(
                VGroup(ellipse_target, z_axis, x_axis, arrow_a, label_a, arrow_b, label_b, rot_arc, rot_label, meridians, latitudes, b2_card),
                shift=DOWN * 0.15,
            ),
            Write(header3[0]), Write(header3[1]), Write(header3[2]),
            Write(sub3),
            run_time=0.85,
        )
        self.cue(48.533, Create(card_g_intro[0]), LaggedStart(*[Write(item) for item in card_g_intro[1]], lag_ratio=0.15), run_time=0.8)
        self.cue(53.5, Create(card_l_intro[0]), LaggedStart(*[Write(item) for item in card_l_intro[1]], lag_ratio=0.15), run_time=0.8)

        # =========================================================================
        # BEAT 4 (59.533s -> 85.133s / Subtitle 90-99):
        # 拟合方式一：全球平均拟合 (Geocentric / Least Squares Fitting)
        # Completely removed short tick lines per user request!
        # =========================================================================
        header4 = self.top_header("02.1", "全球平均拟合 (地心椭球体)")

        globe_center = np.array([-3.2, -0.25, 0])
        global_geoid = irregular_geoid(4.8, 4.4, CLAY, 0.12).move_to(globe_center)
        global_ell = smooth_ellipse(5.0, 4.2, BLUE, fill_opacity=0.10).move_to(globe_center)

        center_dot = Dot(globe_center, radius=0.09, color=BLUE)
        center_label = VGroup(
            cn("椭球中心 ≡ 地球质心 O", 20, BLUE),
            latex(r"(O_{\text{Ellipsoid}} = O_{\text{Mass}})", 20, BLUE),
        ).arrange(DOWN, buff=0.05).next_to(center_dot, DOWN, buff=0.15)

        # Realistic Satellite Model & Orbit
        orbit_line = Circle(radius=2.65, stroke_color=BLUE, stroke_width=1.2).set_fill(opacity=0).set_stroke(opacity=0.25).move_to(globe_center)
        sat_pos = globe_center + np.array([2.65 * math.cos(1.15), 2.65 * math.sin(1.15), 0])

        # Realistic GNSS Satellite with dual solar wings, gold bus, antenna dish & signal beam
        dir_vec = globe_center - sat_pos
        dir_vec = dir_vec / np.linalg.norm(dir_vec)
        wing_dx = -dir_vec[1] * 0.26
        wing_dy = dir_vec[0] * 0.26

        panel_left = Polygon(
            sat_pos + np.array([wing_dx * 0.3, wing_dy * 0.3, 0]) + dir_vec * 0.08,
            sat_pos + np.array([wing_dx * 1.3, wing_dy * 1.3, 0]) + dir_vec * 0.08,
            sat_pos + np.array([wing_dx * 1.3, wing_dy * 1.3, 0]) - dir_vec * 0.08,
            sat_pos + np.array([wing_dx * 0.3, wing_dy * 0.3, 0]) - dir_vec * 0.08,
            stroke_color=BLUE, stroke_width=1.5, fill_color="#2c4d59", fill_opacity=0.95
        )
        panel_right = Polygon(
            sat_pos - np.array([wing_dx * 0.3, wing_dy * 0.3, 0]) + dir_vec * 0.08,
            sat_pos - np.array([wing_dx * 1.3, wing_dy * 1.3, 0]) + dir_vec * 0.08,
            sat_pos - np.array([wing_dx * 1.3, wing_dy * 1.3, 0]) - dir_vec * 0.08,
            sat_pos - np.array([wing_dx * 0.3, wing_dy * 0.3, 0]) - dir_vec * 0.08,
            stroke_color=BLUE, stroke_width=1.5, fill_color="#2c4d59", fill_opacity=0.95
        )
        sat_bus = Square(side_length=0.22, stroke_color=AMBER, fill_color="#1e2623", fill_opacity=1, stroke_width=2).move_to(sat_pos)
        sat_dish = Circle(radius=0.07, stroke_color=AMBER, stroke_width=2, fill_color=PAPER_LIGHT, fill_opacity=0.9).move_to(sat_pos + dir_vec * 0.15)
        sat_beam = DashedLine(sat_pos + dir_vec * 0.22, globe_center + dir_vec * 0.8, dash_length=0.08, color=SAGE, stroke_width=2)

        satellite_group = VGroup(orbit_line, panel_left, panel_right, sat_bus, sat_dish, sat_beam)

        b4_card = make_card(
            title="最小二乘法全球拟合",
            title_color=BLUE,
            items=[
                "• 基于全地球卫星测轨与重力场数据",
                latex(r"\sum_{i=1}^{n} v_i^2 = \min", 32, AMBER),
                "• 使全球高程异常平方和总体最小",
            ],
            tag_text="🌐 表征全球整体平均形状【总地球椭球】",
            tag_color=SAGE,
            width=5.6,
            height=4.3,
        ).move_to([3.4, -0.4, 0])

        # Transition 3 -> 4
        self.cue(
            59.533,
            FadeOut(header3, shift=UP * 0.2),
            FadeOut(sub3, shift=UP * 0.2),
            FadeOut(VGroup(card_g_intro, card_l_intro), shift=DOWN * 0.15),
            Write(header4[0]), Write(header4[1]), Write(header4[2]),
            Create(global_geoid),
            Create(global_ell),
            run_time=0.9,
        )
        self.cue(64.3, Create(orbit_line), FadeIn(VGroup(panel_left, panel_right, sat_bus, sat_dish)), Create(sat_beam), run_time=1.0)
        self.cue(66.7, Create(center_dot), Write(center_label), run_time=1.0)
        self.cue(73.5, Create(b4_card[0]), LaggedStart(*[Write(item) for item in b4_card[1]], lag_ratio=0.15), run_time=0.9)

        # =========================================================================
        # BEAT 5 (85.133s -> 107.633s / Subtitle 100-110):
        # Local Best Fit (Reference Ellipsoid / 参心坐标系)
        # Ellipsoid shifts UPPER-LEFT toward target region for geometrically correct tangency.
        # Uses a smaller ellipsoid (4.4×3.9) so the "local fit" concept is visually clear.
        # Green highlight drawn at the ACTUAL tangency zone (theta 2.5-3.5, left side).
        # =========================================================================
        header5 = self.top_header("02.2", "局部最佳拟合 (参考椭球体)")

        local_center = np.array([-3.2, -0.25, 0])
        local_geoid = irregular_geoid(4.8, 4.4, CLAY, 0.15).move_to(local_center)

        # Earth Geocenter O
        mass_center_dot = Dot(local_center, radius=0.09, color=INK)
        mass_label = cn("地球质心 O", 18, INK).next_to(mass_center_dot, DL, buff=0.08)

        # Initial Reference Ellipsoid centered at Geocenter O — intentionally SMALLER
        # than the geoid so the "local fit" concept is immediately visible: it cannot
        # wrap the whole geoid, but it CAN hug one region perfectly.
        ref_ellipsoid = smooth_ellipse(4.4, 3.9, AMBER, fill_opacity=0.12, stroke_width=3.5).move_to(local_center)


        target_region_label = VGroup(
            RoundedRectangle(width=2.8, height=0.48, corner_radius=0.08, stroke_color=CLAY, fill_color=PAPER_LIGHT, fill_opacity=0.95),
            cn("目标区域 (如本国领土)", 16, CLAY),
        )
        target_region_label[1].move_to(target_region_label[0])
        # Position the label just above the highlighted arc on the left side
        target_region_label.move_to([-3.5, 1.3, 0])

        # Transition 4 -> 5
        self.cue(
            85.133,
            FadeOut(header4, shift=UP * 0.2),
            FadeOut(VGroup(global_geoid, global_ell, satellite_group, center_dot, center_label, b4_card), shift=DOWN * 0.15),
            Write(header5[0]), Write(header5[1]), Write(header5[2]),
            Create(local_geoid),
            Create(ref_ellipsoid),
            Create(mass_center_dot),
            Write(mass_label),

            Write(target_region_label),
            run_time=0.9,
        )

        # Shift vector: UPPER-LEFT, toward the target region.
        # Computed via least-squares fitting so the ellipsoid surface closely
        # matches the geoid in theta ∈ [2.6, 3.4] (≈155°–195°, the left side).
        shift_vec = np.array([-0.20, 0.32, 0])
        target_center = local_center + shift_vec

        datum_center_dot = Dot(target_center, radius=0.09, color=AMBER)
        datum_label = cn("参心 O_ref (中心偏置)", 18, AMBER).next_to(datum_center_dot, UR, buff=0.08)
        shift_arrow = Arrow(local_center, target_center, buff=0.04, color=CLAY, stroke_width=3, max_tip_length_to_length_ratio=0.25)

        self.cue(92.266, GrowArrow(shift_arrow), Create(datum_center_dot), Write(datum_label), run_time=0.9)

        # Animate the ellipsoid shifting to the new center, hugging the left side
        self.cue(
            94.366,
            ref_ellipsoid.animate.move_to(target_center).set_stroke(AMBER, width=4.0).set_fill(AMBER, opacity=0.15),
            run_time=1.1,
        )

        # Elegant contact zone visualization: thin dashed contour along the geoid
        # surface where it nearly coincides with the shifted ellipsoid.
        contact_thetas = np.linspace(2.5, 3.5, 35)
        contact_pts = [geoid_curve_point(th, local_center, 4.8, 4.4) for th in contact_thetas]

        # Thin dashed contour along the geoid at the contact zone
        tangent_highlight = DashedVMobject(
            VMobject(stroke_color=SAGE, stroke_width=3.0).set_points_smoothly(contact_pts),
            num_dashes=18,
        ).set_opacity(0.85)

        # A glow path for ShowPassingFlash emphasis after dashed line appears
        glow_path = VMobject(stroke_color=SAGE, stroke_width=10).set_points_smoothly(contact_pts)

        # Clean text label with subtle underline instead of white-filled box
        contact_label_text = cn("本国区域曲面大致贴合", 17, SAGE)
        contact_label_line = Line(
            contact_label_text.get_left() + DOWN * 0.12,
            contact_label_text.get_right() + DOWN * 0.12,
            stroke_color=SAGE, stroke_width=1.5,
        ).set_opacity(0.5)
        contact_tag = VGroup(contact_label_text, contact_label_line).move_to([-5.5, 2.0, 0])

        # Right side detail card for Reference Ellipsoid
        b5_card = make_card(
            title="参心局部最佳拟合",
            title_color=AMBER,
            items=[
                "• 无卫星时代（经典大地测量法）",
                "• 将椭球中心从地心平移偏置 (参心)",
                latex(r"\sum_{i \in \Omega} v_i^2 = \min", 32, SAGE),
            ],
            tag_text="📍 专属于特定国家/区域【参考椭球体】",
            tag_color=AMBER,
            width=5.6,
            height=4.3,
        ).move_to([3.4, -0.4, 0])

        self.cue(98.7, Create(tangent_highlight), Write(contact_tag), run_time=1.0)
        # Glow sweep along the contact zone + card appears
        self.cue(100.666, Create(b5_card[0]), LaggedStart(*[Write(item) for item in b5_card[1]], lag_ratio=0.15), ShowPassingFlash(glow_path, time_width=0.4), run_time=0.9)

        self.wait_until(DURATION)
