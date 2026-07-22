from __future__ import annotations

import math
import numpy as np
from manim import *

config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30
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

# 00:04:07.800 -> 00:05:29.800, exactly 2460 frames at 30 fps (82.000 s).
DURATION = 2460 / 30


def cn(text: str, size: float, color: str = INK, weight: str = "SEMIBOLD", **kwargs) -> Text:
    return Text(text, font=CN_FONT, weight=weight, font_size=size, color=color, **kwargs)


def latex(text: str, size: float, color: str = INK) -> MathTex:
    return MathTex(text, font_size=size, color=color)


def make_arrow_item(left_text: str, right_text: str, color: str = INK, size: float = 19) -> VGroup:
    """Helper to cleanly render 'Text -> Text' without unicode font fallback bugs."""
    t1 = cn(left_text, size, color)
    arr = latex(r"\rightarrow", size + 2, color)
    t2 = cn(right_text, size, color)
    return VGroup(t1, arr, t2).arrange(RIGHT, buff=0.10)


def geoid_curve_point(theta: float, center: np.ndarray, width: float = 4.8, height: float = 4.2) -> np.ndarray:
    """Computes exact (x, y, 0) point on the irregular geoid parametric curve."""
    r = 1.0 + 0.065 * math.sin(3 * theta + 0.4) + 0.04 * math.sin(7 * theta - 0.8)
    x = center[0] + (width * 0.5) * r * math.cos(theta)
    y = center[1] + (height * 0.5) * r * math.sin(theta)
    return np.array([x, y, 0.0])


def irregular_geoid_2d(
    center: np.ndarray = ORIGIN,
    width: float = 4.8,
    height: float = 4.2,
    color: str = CLAY,
    fill_opacity: float = 0.14,
) -> VMobject:
    """Creates a clean smooth 2D VMobject curve representing the irregular geoid."""
    points = [geoid_curve_point(th, center, width, height) for th in np.linspace(0, TAU, 200)]
    shape = VMobject(stroke_color=color, stroke_width=3.2, fill_color=color, fill_opacity=fill_opacity)
    shape.set_points_smoothly(points + [points[0]])
    return shape


def smooth_ellipsoid_2d(
    center: np.ndarray = ORIGIN,
    width: float = 5.0,
    height: float = 4.1,
    color: str = BLUE,
    fill_opacity: float = 0.12,
    stroke_width: float = 3.5,
) -> VGroup:
    """Clean representation of an oblate ellipsoid with equator and polar axis."""
    ellipse = Ellipse(
        width=width,
        height=height,
        stroke_color=color,
        stroke_width=stroke_width,
        fill_color=color,
        fill_opacity=fill_opacity,
    ).move_to(center)

    equator = DashedLine(
        center + LEFT * (width * 0.5),
        center + RIGHT * (width * 0.5),
        color=color,
        stroke_width=2.0,
        dash_length=0.12,
    ).set_opacity(0.6)

    polar_axis = DashedLine(
        center + DOWN * (height * 0.55),
        center + UP * (height * 0.55),
        color=color,
        stroke_width=2.0,
        dash_length=0.12,
    ).set_opacity(0.6)

    return VGroup(ellipse, equator, polar_axis)


def make_spatial_axes_2d(
    origin: np.ndarray = np.array([-3.2, -0.4, 0]),
    scale: float = 2.4,
    color: str = BLUE,
    label_prefix: str = "",
) -> VGroup:
    """Creates a high-end, elegant 3D Isometric Spatial Cartesian Coordinate System with a subtle isometric base grid floor."""
    z_dir = np.array([0, 1.0, 0]) * scale
    x_dir = np.array([-0.866, -0.5, 0]) * scale
    y_dir = np.array([0.866, -0.5, 0]) * scale

    iso_grid = VGroup()
    grid_color = color
    for i in np.linspace(-1.2, 1.2, 7):
        p1 = origin + y_dir * i - x_dir * 1.2
        p2 = origin + y_dir * i + x_dir * 1.2
        iso_grid.add(Line(p1, p2, color=grid_color, stroke_width=1.0).set_opacity(0.18))

        p3 = origin + x_dir * i - y_dir * 1.2
        p4 = origin + x_dir * i + y_dir * 1.2
        iso_grid.add(Line(p3, p4, color=grid_color, stroke_width=1.0).set_opacity(0.18))

    z_axis = Arrow(origin, origin + z_dir, color=color, stroke_width=3.2, max_tip_length_to_length_ratio=0.15)
    x_axis = Arrow(origin, origin + x_dir, color=color, stroke_width=3.2, max_tip_length_to_length_ratio=0.15)
    y_axis = Arrow(origin, origin + y_dir, color=color, stroke_width=3.2, max_tip_length_to_length_ratio=0.15)

    z_lbl = latex(rf"Z_{{{label_prefix}}}" if label_prefix else r"Z", 22, color).next_to(z_axis.get_end(), RIGHT, buff=0.12)
    x_lbl = latex(rf"X_{{{label_prefix}}}" if label_prefix else r"X", 22, color).next_to(x_axis.get_end(), LEFT, buff=0.12)
    y_lbl = latex(rf"Y_{{{label_prefix}}}" if label_prefix else r"Y", 22, color).next_to(y_axis.get_end(), DR, buff=0.08)

    origin_dot = Dot(origin, radius=0.09, color=color)
    origin_ring = Circle(radius=0.18, stroke_color=color, stroke_width=1.5).set_opacity(0.6).move_to(origin)
    o_lbl = latex(rf"O_{{{label_prefix}}}" if label_prefix else r"O", 20, color).next_to(origin_ring, DL, buff=0.08)

    return VGroup(iso_grid, z_axis, x_axis, y_axis, z_lbl, x_lbl, y_lbl, origin_dot, origin_ring, o_lbl)


def make_card(
    title: str,
    title_color: str,
    items: list[VMobject | str],
    tag_text: str | None = None,
    tag_color: str = SAGE,
    width: float = 5.8,
    height: float = 4.6,
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


class DatumExplainer(Scene):
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
        # BEAT 1 (0.000s -> 15.633s / Subtitles 112-119):
        # 椭球面确定了形状，但不知道放在哪里 ➔ 第三级逼近：大地基准面
        # =========================================================================
        header1 = self.top_header("03", "第三级逼近：大地基准面")

        center_b1 = np.array([-3.2, -0.3, 0])
        floating_ellipsoid = smooth_ellipsoid_2d(center_b1, 5.0, 4.1, BLUE, fill_opacity=0.12)

        locator_icon = VGroup(
            Dot(center_b1, radius=0.10, color=CLAY),
            Circle(radius=0.24, stroke_color=CLAY, stroke_width=2.0).move_to(center_b1),
        )
        locator_label = cn("椭球中心空间位置未定", 17, CLAY).next_to(locator_icon, DOWN, buff=0.15)

        item1 = make_arrow_item("• 1st 逼近: 地球自然表面 ", " 球体", INK, 18)
        item2 = make_arrow_item("• 2nd 逼近: 大地水准面 ", " 旋转椭球 (形状)", INK, 18)

        b1_card = make_card(
            title="地球形状的第三级逼近",
            title_color=BLUE,
            items=[
                item1,
                item2,
                cn("• 3rd 逼近: 大地基准面", 18, CLAY, weight="SEMIBOLD"),
                "• 解决核心问题：确定椭球的空间位置与姿态",
            ],
            tag_text="📍 确定椭球中心位置与自转轴指向",
            tag_color=CLAY,
            width=5.8,
            height=4.5,
        ).move_to([3.4, -0.4, 0])

        self.cue(
            0.0,
            Write(header1[0]), Write(header1[1]), Write(header1[2]),
            Create(floating_ellipsoid),
            FadeIn(locator_icon, scale=0.7),
            Write(locator_label),
            run_time=0.95,
        )
        self.cue(5.5, Create(b1_card[0]), LaggedStart(*[Write(item) for item in b1_card[1]], lag_ratio=0.15), run_time=0.85)

        self.cue(
            8.5,
            floating_ellipsoid.animate.shift(UP * 0.2 + RIGHT * 0.15),
            locator_icon.animate.shift(UP * 0.2 + RIGHT * 0.15),
            locator_label.animate.shift(UP * 0.2 + RIGHT * 0.15),
            run_time=1.2,
        )
        self.cue(
            12.0,
            floating_ellipsoid.animate.shift(DOWN * 0.2 + LEFT * 0.15),
            locator_icon.animate.shift(DOWN * 0.2 + LEFT * 0.15),
            locator_label.animate.shift(DOWN * 0.2 + LEFT * 0.15),
            run_time=1.2,
        )

        # =========================================================================
        # BEAT 2 (15.633s -> 29.866s / Subtitles 120-127):
        # 确定椭球中心在空间中的位置、旋转轴的方向 ➔ 空间直角坐标系
        # =========================================================================
        header2 = self.top_header("03", "基准面两要素：空间位置与定向")

        b2_origin = np.array([-3.2, -0.4, 0.0])
        spatial_axes = make_spatial_axes_2d(b2_origin, scale=2.3, color=BLUE)
        aligned_ellipsoid = smooth_ellipsoid_2d(b2_origin, 5.0, 4.1, BLUE, fill_opacity=0.12)

        pos_start = b2_origin + np.array([-2.2, -0.8, 0])
        pos_vec = Arrow(pos_start, b2_origin, color=AMBER, stroke_width=3, max_tip_length_to_length_ratio=0.20)
        pos_label = latex(r"\mathbf{r}_0 (X_0, Y_0, Z_0)", 19, AMBER).next_to(pos_start, LEFT, buff=0.1)

        rot_axis_label = cn("椭球旋转轴 ∥ 地球自转轴", 16, CLAY).next_to(spatial_axes[4], RIGHT, buff=0.15)

        b2_card_item2 = VGroup(
            cn("短轴 ", 18, CLAY),
            latex(r"b \parallel \boldsymbol{\omega}", 19, CLAY),
            cn(" (自转轴)", 18, CLAY),
        ).arrange(RIGHT, buff=0.06)

        b2_card = make_card(
            title="大地基准面的核心要素",
            title_color=BLUE,
            items=[
                "1. 椭球中心空间位置:",
                latex(r"O_{\mathrm{ellipsoid}} = (X_0, Y_0, Z_0)", 21, AMBER),
                "2. 旋转轴空间指向:",
                b2_card_item2,
                "3. 建立三维空间直角坐标系 O-XYZ",
            ],
            tag_text="📐 空间直角坐标系",
            tag_color=SAGE,
            width=5.8,
            height=4.6,
        ).move_to([3.4, -0.4, 0])

        self.cue(
            15.633,
            FadeOut(header1, shift=UP * 0.15),
            FadeOut(floating_ellipsoid, shift=DOWN * 0.15),
            FadeOut(locator_icon), FadeOut(locator_label),
            FadeOut(b1_card, shift=DOWN * 0.15),
            run_time=0.5,
        )

        self.cue(
            16.2,
            Write(header2[0]), Write(header2[1]), Write(header2[2]),
            Create(spatial_axes),
            Create(aligned_ellipsoid),
            run_time=0.9,
        )
        self.cue(19.0, GrowArrow(pos_vec), Write(pos_label), run_time=0.8)
        self.cue(21.5, Write(rot_axis_label), run_time=0.8)
        self.cue(24.5, Create(b2_card[0]), LaggedStart(*[Write(item) for item in b2_card[1]], lag_ratio=0.15), run_time=0.85)

        # =========================================================================
        # BEAT 3 (29.866s -> 61.633s / Subtitles 128-141):
        # 经典参心坐标系：寻找大地原点 (陕西省泾阳县永乐镇) ➔ 西安80参心坐标系
        # VISUALLY 100% PERFECT TANGENT OVERLAP (SHIFTED LEFT & UP TO KISS THE STAR MARKER EXACTLY)!
        # =========================================================================
        header3 = self.top_header("03.1", "经典参心坐标系：西安80坐标系")

        geoid_center = np.array([-3.2, -0.3, 0.0])
        geoid_b3 = irregular_geoid_2d(geoid_center, 4.8, 4.2, CLAY, 0.14)

        origin_th = 2.45
        origin_pt = geoid_curve_point(origin_th, geoid_center, 4.8, 4.2)

        origin_star = Star(n=5, outer_radius=0.18, inner_radius=0.08, color=AMBER, fill_color=AMBER, fill_opacity=1.0).move_to(origin_pt)
        origin_pulse = Circle(radius=0.28, stroke_color=AMBER, stroke_width=2).move_to(origin_pt)

        origin_tag = VGroup(
            RoundedRectangle(width=3.2, height=0.68, corner_radius=0.08, stroke_color=AMBER, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            VGroup(
                cn("📍 国家大地原点", 16, AMBER),
                cn("陕西省泾阳县永乐镇", 14, INK),
            ).arrange(DOWN, buff=0.04),
        )
        origin_tag[1].move_to(origin_tag[0])
        origin_tag.move_to([-4.6, -1.8, 0])

        # SHIFTED LEFT & UP SO THE TOP-LEFT EDGE OF REF_ELLIPSOID OVERLAPS AND TOUCHES TANGENT EXACTLY AT ORIGIN_PT!
        ref_center = np.array([-2.98, 0.08, 0])
        ref_ellipsoid = smooth_ellipsoid_2d(ref_center, 5.0, 4.1, AMBER, fill_opacity=0.12)
        ref_spatial_axes = make_spatial_axes_2d(ref_center, scale=1.6, label_prefix="80", color=AMBER)

        # Highlight green tangent glow curve right on the shared contact arc
        tangent_pts = [geoid_curve_point(th, geoid_center, 4.8, 4.2) for th in np.linspace(2.28, 2.62, 25)]
        tangent_glow = VMobject(stroke_color=SAGE, stroke_width=7.5).set_opacity(0.95)
        tangent_glow.set_points_smoothly(tangent_pts)

        tangent_tag = VGroup(
            RoundedRectangle(width=3.2, height=0.48, corner_radius=0.08, stroke_color=SAGE, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            cn("✨ 大地水准面与参考椭球面相切", 15, SAGE),
        )
        tangent_tag[1].move_to(tangent_tag[0])
        tangent_tag.move_to([-4.5, 2.5, 0])

        b3_card_line4 = VGroup(
            latex(r"O_{\mathrm{ref}}:\ ", 19, AMBER),
            cn("参心空间直角坐标系 ", 18, AMBER),
            latex(r"(X_{80}, Y_{80}, Z_{80})", 17, AMBER),
        ).arrange(RIGHT, buff=0.04)

        b3_card = make_card(
            title="西安80参心坐标系",
            title_color=AMBER,
            items=[
                "• 无卫星时代 (经典三角测量)",
                "• 大地原点: 陕西省泾阳县永乐镇",
                "• 拟合方式: 椭球面在原点与水准面相切",
                b3_card_line4,
                "• 特点: 参心偏置，保障本国测绘精准",
            ],
            tag_text="📍 参心坐标系",
            tag_color=AMBER,
            width=5.8,
            height=4.6,
        ).move_to([3.4, -0.4, 0])

        self.cue(
            29.866,
            FadeOut(header2, shift=UP * 0.15),
            FadeOut(spatial_axes, shift=DOWN * 0.15),
            FadeOut(aligned_ellipsoid, shift=DOWN * 0.15),
            FadeOut(VGroup(pos_vec, pos_label, rot_axis_label), shift=DOWN * 0.15),
            FadeOut(b2_card, shift=DOWN * 0.15),
            run_time=0.5,
        )

        self.cue(
            30.5,
            Write(header3[0]), Write(header3[1]), Write(header3[2]),
            Create(geoid_b3),
            run_time=0.9,
        )

        self.cue(35.0, Create(origin_star), Create(origin_pulse), Write(origin_tag), run_time=0.9)

        self.cue(
            41.0,
            Create(ref_ellipsoid),
            Create(ref_spatial_axes),
            Create(tangent_glow),
            Write(tangent_tag),
            run_time=1.1,
        )

        self.cue(48.5, Create(b3_card[0]), LaggedStart(*[Write(item) for item in b3_card[1]], lag_ratio=0.15), run_time=0.9)

        self.cue(
            54.0,
            origin_pulse.animate.scale(1.4).set_opacity(0.0),
            Circumscribe(origin_tag, color=AMBER, fade_out=True),
            run_time=1.0,
        )

        # =========================================================================
        # BEAT 4 (61.633s -> 82.000s / Subtitles 142-150):
        # 现代卫星定位 ➔ 椭球中心与地球质心重合 ➔ 地心空间直角坐标系 (WGS-84 / CGCS2000)
        # =========================================================================
        header4 = self.top_header("03.2", "现代地心坐标系：WGS-84 & CGCS2000")

        geocenter = np.array([-3.2, -0.3, 0.0])
        global_geoid = irregular_geoid_2d(geocenter, 4.8, 4.2, CLAY, 0.12)
        geocentric_ellipsoid = smooth_ellipsoid_2d(geocenter, 5.0, 4.1, BLUE, fill_opacity=0.12)

        geocentric_axes = make_spatial_axes_2d(geocenter, scale=2.3, color=BLUE)

        mass_dot = Dot(geocenter, radius=0.10, color=BLUE)
        mass_card_bg = RoundedRectangle(width=3.6, height=0.55, corner_radius=0.08, stroke_color=BLUE, fill_color=PAPER_LIGHT, fill_opacity=0.95)
        mass_text = VGroup(
            cn("椭球中心 ≡ 地球质心 O", 16, BLUE),
            latex(r"(O_{\mathrm{Ellipsoid}} \equiv O_{\mathrm{Mass}})", 15, BLUE),
        ).arrange(DOWN, buff=0.04)
        mass_text.move_to(mass_card_bg)
        mass_label = VGroup(mass_card_bg, mass_text).move_to([-1.2, -1.8, 0])

        orbit_ring = Circle(radius=2.65, stroke_color=BLUE, stroke_width=1.4).set_stroke(opacity=0.35).move_to(geocenter)

        sat1_pos = geocenter + np.array([2.65 * math.cos(0.8), 2.65 * math.sin(0.8), 0])
        sat1_body = Square(side_length=0.20, stroke_color=BLUE, fill_color=PAPER_LIGHT, fill_opacity=1, stroke_width=1.5).move_to(sat1_pos)
        sat1_beam = DashedLine(sat1_pos, geocenter, dash_length=0.08, color=SAGE, stroke_width=1.8)

        sat2_pos = geocenter + np.array([2.65 * math.cos(3.6), 2.65 * math.sin(3.6), 0])
        sat2_body = Square(side_length=0.20, stroke_color=BLUE, fill_color=PAPER_LIGHT, fill_opacity=1, stroke_width=1.5).move_to(sat2_pos)
        sat2_beam = DashedLine(sat2_pos, geocenter, dash_length=0.08, color=SAGE, stroke_width=1.8)

        satellites = VGroup(orbit_ring, sat1_body, sat1_beam, sat2_body, sat2_beam)

        badge_wgs84 = VGroup(
            RoundedRectangle(width=2.4, height=0.48, corner_radius=0.08, stroke_color=BLUE, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            latex(r"\mathbf{WGS\text{-}84}", 19, BLUE),
        )
        badge_wgs84[1].move_to(badge_wgs84[0])

        badge_cgcs = VGroup(
            RoundedRectangle(width=2.4, height=0.48, corner_radius=0.08, stroke_color=SAGE, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            latex(r"\mathbf{CGCS2000}", 19, SAGE),
        )
        badge_cgcs[1].move_to(badge_cgcs[0])

        badges_group = VGroup(badge_wgs84, badge_cgcs).arrange(RIGHT, buff=0.25).move_to([-3.2, 2.5, 0])

        b4_card_line5 = VGroup(
            latex(r"\mathbf{WGS\text{-}84}", 19, BLUE),
            cn(" / ", 18, INK),
            latex(r"\mathbf{CGCS2000}", 19, SAGE),
        ).arrange(RIGHT, buff=0.04)

        b4_card = make_card(
            title="地心空间直角坐标系",
            title_color=BLUE,
            items=[
                "• 现代 GNSS 卫星定位时代",
                "• 原点 O: 地球质心 (Geocenter)",
                "• Z轴: 指向 CTP 地极方向",
                "• X轴: 指向首子午面与赤道交点",
                b4_card_line5,
            ],
            tag_text="🌐 无偏置地心坐标系",
            tag_color=SAGE,
            width=5.8,
            height=4.6,
        ).move_to([3.4, -0.4, 0])

        self.cue(
            61.633,
            FadeOut(header3, shift=UP * 0.15),
            FadeOut(VGroup(geoid_b3, origin_star, origin_pulse, origin_tag, ref_ellipsoid, ref_spatial_axes, tangent_glow, tangent_tag, b3_card), shift=DOWN * 0.15),
            run_time=0.5,
        )

        self.cue(
            62.2,
            Write(header4[0]), Write(header4[1]), Write(header4[2]),
            Create(global_geoid),
            Create(geocentric_ellipsoid),
            Create(geocentric_axes),
            Create(mass_dot),
            Write(mass_label),
            run_time=0.95,
        )

        self.cue(66.5, Create(satellites), run_time=1.0)
        self.cue(71.0, Create(badges_group[0]), Create(badges_group[1]), run_time=0.85)
        self.cue(74.5, Create(b4_card[0]), LaggedStart(*[Write(item) for item in b4_card[1]], lag_ratio=0.15), run_time=0.85)

        self.wait_until(DURATION)
