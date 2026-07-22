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


def oblate_ellipsoid_3d(
    center: np.ndarray = ORIGIN,
    radii: tuple[float, float, float] = (2.4, 2.4, 1.95),
    color: str = BLUE,
    opacity: float = 0.18,
) -> VGroup:
    """Smooth 3D oblate ellipsoid volume with pure solid fill and crisp equator/meridian outlines, NO dense mesh grid."""
    a, b, c = radii
    surface = Surface(
        lambda u, v: center + np.array([
            a * np.cos(u) * np.sin(v),
            b * np.sin(u) * np.sin(v),
            c * np.cos(v),
        ]),
        u_range=[0, TAU],
        v_range=[0, PI],
        resolution=(16, 32),
    )
    # ZERO wireframe stroke width to eliminate black mesh grid clutter!
    surface.set_style(
        fill_color=color,
        fill_opacity=opacity,
        stroke_width=0.0,
        stroke_opacity=0.0,
    )

    # Add clean elegant equator & main meridian ring outlines
    equator = ParametricFunction(
        lambda t: center + np.array([a * np.cos(t), b * np.sin(t), 0]),
        t_range=[0, TAU],
        color=color,
        stroke_width=2.0,
    ).set_opacity(0.6)

    meridian1 = ParametricFunction(
        lambda t: center + np.array([a * np.cos(t), 0, c * np.sin(t)]),
        t_range=[0, TAU],
        color=color,
        stroke_width=1.8,
    ).set_opacity(0.5)

    meridian2 = ParametricFunction(
        lambda t: center + np.array([0, b * np.cos(t), c * np.sin(t)]),
        t_range=[0, TAU],
        color=color,
        stroke_width=1.8,
    ).set_opacity(0.5)

    return VGroup(surface, equator, meridian1, meridian2)


def irregular_geoid_3d(
    center: np.ndarray = ORIGIN,
    color: str = CLAY,
    opacity: float = 0.16,
) -> VGroup:
    """Smooth 3D irregular geoid surface with clean solid fill and smooth profile outlines, NO dense mesh grid."""
    def point(u: float, v: float) -> np.ndarray:
        wobble = 1.0 + 0.045 * np.sin(3 * u) * (np.sin(v) ** 2) + 0.03 * np.cos(5 * u - 0.5) * np.sin(2 * v)
        return center + wobble * np.array([
            2.45 * np.cos(u) * np.sin(v),
            2.45 * np.sin(u) * np.sin(v),
            2.05 * np.cos(v),
        ])

    surface = Surface(point, u_range=[0, TAU], v_range=[0, PI], resolution=(16, 32))
    surface.set_style(
        fill_color=color,
        fill_opacity=opacity,
        stroke_width=0.0,
        stroke_opacity=0.0,
    )

    profile = ParametricFunction(
        lambda t: point(t, PI / 2),
        t_range=[0, TAU],
        color=color,
        stroke_width=2.2,
    ).set_opacity(0.65)

    return VGroup(surface, profile)


def spatial_axes_3d(
    center: np.ndarray = ORIGIN,
    scale: float = 2.6,
    color: str = BLUE,
    label_prefix: str = "",
) -> VGroup:
    """Creates crisp 3D Spatial Cartesian Axes with tips."""
    axes = ThreeDAxes(
        x_range=[-scale, scale, scale],
        y_range=[-scale, scale, scale],
        z_range=[-scale, scale, scale],
        x_length=2 * scale,
        y_length=2 * scale,
        z_length=2 * scale,
        axis_config={"color": color, "stroke_width": 2.4, "include_ticks": False, "tip_length": 0.16},
    )
    axes.move_to(center)
    return axes


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


class DatumExplainer(ThreeDScene):
    def wait_until(self, target: float) -> None:
        remaining = target - self.time
        if remaining > 1 / config.frame_rate:
            self.wait(remaining)

    def cue(self, target: float, *animations: Animation, run_time: float = 0.75, **kwargs) -> None:
        self.wait_until(target)
        self.play(*animations, run_time=run_time, rate_func=smooth, **kwargs)

    def camera_cue(self, target: float, **kwargs) -> None:
        self.wait_until(target)
        self.move_camera(**kwargs)

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
        self.camera.background_color = PAPER
        self.set_camera_orientation(phi=66 * DEGREES, theta=-45 * DEGREES, zoom=0.82)

        # Background HUD
        bg_hud = self.paper_background()
        self.add_fixed_in_frame_mobjects(bg_hud)

        # =========================================================================
        # BEAT 1 (0.000s -> 15.633s / Subtitles 112-119):
        # 椭球面确定了形状，但不知道放在哪里 ➔ 第三级逼近：大地基准面
        # =========================================================================
        header1 = self.top_header("03", "第三级逼近：大地基准面")
        self.add_fixed_in_frame_mobjects(header1)

        center_b1 = np.array([-2.8, -0.2, 0.2])
        floating_ellipsoid = oblate_ellipsoid_3d(center_b1, color=BLUE, opacity=0.22)

        q1 = latex(r"?", 36, CLAY).move_to(center_b1 + np.array([-1.4, 1.2, 1.0]))
        q2 = latex(r"?", 44, AMBER).move_to(center_b1 + np.array([1.5, 1.0, 0.8]))
        q3 = latex(r"?", 32, BLUE).move_to(center_b1 + np.array([0.0, -1.5, -0.8]))
        self.add_fixed_orientation_mobjects(q1, q2, q3)

        b1_card = make_card(
            title="地球形状的第三级逼近",
            title_color=BLUE,
            items=[
                "• 1st 逼近: 地球自然表面 ➔ 球体",
                "• 2nd 逼近: 大地水准面 ➔ 旋转椭球 (形状)",
                "• 3rd 逼近: 大地基准面",
                "• 解决问题：椭球的空间位置与姿态",
            ],
            tag_text="📍 确定椭球中心位置与自转轴方向",
            tag_color=CLAY,
            width=5.8,
            height=4.5,
        ).move_to([3.4, -0.4, 0])
        self.add_fixed_in_frame_mobjects(b1_card)

        beat1_hud = VGroup(header1, b1_card)
        beat1_3d = VGroup(floating_ellipsoid, q1, q2, q3)

        self.cue(
            0.0,
            Write(header1[0]), Write(header1[1]), Write(header1[2]),
            Create(floating_ellipsoid),
            LaggedStart(FadeIn(q1, scale=0.7), FadeIn(q2, scale=0.7), FadeIn(q3, scale=0.7), lag_ratio=0.2),
            run_time=0.95,
        )
        self.cue(5.5, Create(b1_card[0]), LaggedStart(*[Write(item) for item in b1_card[1]], lag_ratio=0.15), run_time=0.85)

        self.cue(
            8.5,
            floating_ellipsoid.animate.shift(UP * 0.25 + RIGHT * 0.2),
            run_time=1.2,
        )
        self.cue(
            12.0,
            floating_ellipsoid.animate.shift(DOWN * 0.25 + LEFT * 0.2),
            run_time=1.2,
        )

        # =========================================================================
        # BEAT 2 (15.633s -> 29.866s / Subtitles 120-127):
        # 确定椭球中心在空间中的位置、旋转轴的方向 ➔ 空间直角坐标系
        # Clean Single Transition without Double Fading!
        # =========================================================================
        header2 = self.top_header("03", "基准面两要素：空间位置与定向")

        b2_origin = np.array([-2.8, -0.3, 0.0])
        spatial_axes = spatial_axes_3d(b2_origin, scale=2.4, color=BLUE)
        aligned_ellipsoid = oblate_ellipsoid_3d(b2_origin, color=BLUE, opacity=0.18)

        axis_lbl_x = latex(r"X", 22, BLUE).move_to(b2_origin + np.array([-2.7, 0, 0]))
        axis_lbl_y = latex(r"Y", 22, BLUE).move_to(b2_origin + np.array([0, 2.7, 0]))
        axis_lbl_z = latex(r"Z", 22, BLUE).move_to(b2_origin + np.array([0, 0, 2.7]))
        self.add_fixed_orientation_mobjects(axis_lbl_x, axis_lbl_y, axis_lbl_z)

        pos_start = b2_origin + np.array([-2.2, -1.2, -1.0])
        pos_vec = Arrow3D(start=pos_start, end=b2_origin, color=AMBER, thickness=0.03)
        pos_label = latex(r"\mathbf{r}_0 (X_0, Y_0, Z_0)", 19, AMBER).move_to(pos_start + np.array([-0.6, 0, 0]))
        self.add_fixed_orientation_mobjects(pos_label)

        rot_axis_line = DashedLine(b2_origin + np.array([0, 0, -2.5]), b2_origin + np.array([0, 0, 2.8]), color=CLAY, stroke_width=2.5)
        rot_axis_label = cn("椭球旋转轴 ∥ 地球自转轴", 16, CLAY).move_to(b2_origin + np.array([1.2, 0, 2.6]))
        self.add_fixed_orientation_mobjects(rot_axis_label)

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

        beat2_hud = VGroup(header2, b2_card)
        beat2_3d = VGroup(spatial_axes, aligned_ellipsoid, axis_lbl_x, axis_lbl_y, axis_lbl_z, pos_vec, pos_label, rot_axis_line, rot_axis_label)

        # Transition Beat 1 -> Beat 2 smoothly without double entrance
        self.cue(
            15.633,
            FadeOut(beat1_hud),
            FadeOut(beat1_3d),
            run_time=0.6,
        )

        self.add_fixed_in_frame_mobjects(header2, b2_card)

        self.cue(
            16.3,
            Write(header2[0]), Write(header2[1]), Write(header2[2]),
            Create(spatial_axes),
            FadeIn(axis_lbl_x), FadeIn(axis_lbl_y), FadeIn(axis_lbl_z),
            Create(aligned_ellipsoid),
            run_time=0.9,
        )
        self.cue(19.0, Create(pos_vec), Write(pos_label), run_time=0.8)
        self.cue(21.5, Create(rot_axis_line), Write(rot_axis_label), run_time=0.8)
        self.cue(24.5, Create(b2_card[0]), LaggedStart(*[Write(item) for item in b2_card[1]], lag_ratio=0.15), run_time=0.85)

        self.camera_cue(26.0, phi=60 * DEGREES, theta=-28 * DEGREES, zoom=0.85, run_time=2.5)

        # =========================================================================
        # BEAT 3 (29.866s -> 61.633s / Subtitles 128-141):
        # 过去经典参心坐标系：寻找大地原点 (陕西省泾阳县永乐镇) ➔ 西安80参心坐标系
        # Clean Single Transition without Double Fading!
        # =========================================================================
        header3 = self.top_header("03.1", "经典参心坐标系：西安80坐标系")

        geoid_center = np.array([-2.8, -0.3, 0.0])
        geoid_b3 = irregular_geoid_3d(geoid_center, color=CLAY, opacity=0.16)

        origin_pt_3d = geoid_center + np.array([-1.6, 1.2, 0.8])
        origin_dot_3d = Dot3D(origin_pt_3d, radius=0.10, color=AMBER)
        origin_star_2d = Star(n=5, outer_radius=0.18, inner_radius=0.08, color=AMBER, fill_color=AMBER, fill_opacity=1.0).move_to(origin_pt_3d)
        self.add_fixed_orientation_mobjects(origin_star_2d)

        origin_tag = VGroup(
            RoundedRectangle(width=3.2, height=0.68, corner_radius=0.08, stroke_color=AMBER, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            VGroup(
                cn("📍 国家大地原点", 16, AMBER),
                cn("陕西省泾阳县永乐镇", 14, INK),
            ).arrange(DOWN, buff=0.04),
        )
        origin_tag[1].move_to(origin_tag[0])
        origin_tag.move_to([-4.6, -1.8, 0])

        ref_center_3d = geoid_center + np.array([0.38, 0.26, -0.15])
        ref_ellipsoid_3d = oblate_ellipsoid_3d(ref_center_3d, color=AMBER, opacity=0.18)

        ref_spatial_axes = spatial_axes_3d(ref_center_3d, scale=2.0, color=AMBER)
        axis_lbl_80_z = latex(r"Z_{80}", 20, AMBER).move_to(ref_center_3d + np.array([0, 0, 2.2]))
        axis_lbl_80_o = latex(r"O_{80}", 20, AMBER).move_to(ref_center_3d + np.array([-0.3, -0.3, 0]))
        self.add_fixed_orientation_mobjects(axis_lbl_80_z, axis_lbl_80_o)

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

        beat3_hud = VGroup(header3, origin_tag, tangent_tag, b3_card)
        beat3_3d = VGroup(geoid_b3, origin_dot_3d, origin_star_2d, ref_ellipsoid_3d, ref_spatial_axes, axis_lbl_80_z, axis_lbl_80_o)

        # Transition Beat 2 -> Beat 3 cleanly
        self.cue(
            29.866,
            FadeOut(beat2_hud),
            FadeOut(beat2_3d),
            run_time=0.6,
        )

        self.add_fixed_in_frame_mobjects(header3, origin_tag, tangent_tag, b3_card)

        self.cue(
            30.5,
            Write(header3[0]), Write(header3[1]), Write(header3[2]),
            Create(geoid_b3),
            run_time=0.9,
        )

        self.cue(35.0, FadeIn(origin_dot_3d), FadeIn(origin_star_2d), Write(origin_tag), run_time=0.9)

        self.cue(
            41.0,
            Create(ref_ellipsoid_3d),
            Create(ref_spatial_axes),
            FadeIn(axis_lbl_80_z), FadeIn(axis_lbl_80_o),
            Write(tangent_tag),
            run_time=1.1,
        )

        self.cue(48.5, Create(b3_card[0]), LaggedStart(*[Write(item) for item in b3_card[1]], lag_ratio=0.15), run_time=0.9)

        self.camera_cue(50.0, phi=72 * DEGREES, theta=-62 * DEGREES, zoom=0.82, run_time=3.0)

        self.cue(
            54.0,
            Circumscribe(origin_tag, color=AMBER, fade_out=True),
            run_time=1.0,
        )

        # =========================================================================
        # BEAT 4 (61.633s -> 82.000s / Subtitles 142-150):
        # 现代卫星定位 ➔ 椭球中心与地球质心重合 ➔ 3D 地心空间直角坐标系 (WGS-84 / CGCS2000)
        # REMOVED CONFUSING GREY SLICING DISK! Clean satellite constellation + clear signal beams!
        # =========================================================================
        header4 = self.top_header("03.2", "现代地心坐标系：WGS-84 & CGCS2000")

        geocenter_3d = np.array([-2.8, -0.3, 0.0])
        global_geoid_3d = irregular_geoid_3d(geocenter_3d, color=CLAY, opacity=0.14)
        geocentric_ellipsoid_3d = oblate_ellipsoid_3d(geocenter_3d, color=BLUE, opacity=0.18)

        geocentric_axes_3d = spatial_axes_3d(geocenter_3d, scale=2.5, color=BLUE)

        axis_geo_z = latex(r"Z", 22, BLUE).move_to(geocenter_3d + np.array([0, 0, 2.7]))
        axis_geo_o = latex(r"O_{\mathrm{Mass}}", 20, BLUE).move_to(geocenter_3d + np.array([-0.35, -0.35, 0]))
        self.add_fixed_orientation_mobjects(axis_geo_z, axis_geo_o)

        mass_card_bg = RoundedRectangle(width=3.6, height=0.55, corner_radius=0.08, stroke_color=BLUE, fill_color=PAPER_LIGHT, fill_opacity=0.95)
        mass_text = VGroup(
            cn("椭球中心 ≡ 地球质心 O", 16, BLUE),
            latex(r"(O_{\mathrm{Ellipsoid}} \equiv O_{\mathrm{Mass}})", 15, BLUE),
        ).arrange(DOWN, buff=0.04)
        mass_text.move_to(mass_card_bg)
        mass_label = VGroup(mass_card_bg, mass_text).move_to([-1.2, -1.8, 0])

        # Clean 3D Satellite Constellation (NO grey cutting disk plane!)
        sat1_pos = geocenter_3d + np.array([3.1 * math.cos(0.8), 3.1 * math.sin(0.8), 1.2])
        sat1_dot = Dot3D(sat1_pos, radius=0.10, color=BLUE)
        sat1_beam = DashedLine(sat1_pos, geocenter_3d, dash_length=0.08, color=SAGE, stroke_width=2.0)

        sat2_pos = geocenter_3d + np.array([3.1 * math.cos(3.6), 3.1 * math.sin(3.6), -1.1])
        sat2_dot = Dot3D(sat2_pos, radius=0.10, color=BLUE)
        sat2_beam = DashedLine(sat2_pos, geocenter_3d, dash_length=0.08, color=SAGE, stroke_width=2.0)

        sat3_pos = geocenter_3d + np.array([-2.8, 1.8, -0.9])
        sat3_dot = Dot3D(sat3_pos, radius=0.10, color=BLUE)
        sat3_beam = DashedLine(sat3_pos, geocenter_3d, dash_length=0.08, color=SAGE, stroke_width=2.0)

        satellites_3d = VGroup(sat1_dot, sat1_beam, sat2_dot, sat2_beam, sat3_dot, sat3_beam)

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

        beat4_hud = VGroup(header4, mass_label, badges_group, b4_card)
        beat4_3d = VGroup(global_geoid_3d, geocentric_ellipsoid_3d, geocentric_axes_3d, axis_geo_z, axis_geo_o, satellites_3d)

        # Transition Beat 3 -> Beat 4 cleanly
        self.cue(
            61.633,
            FadeOut(beat3_hud),
            FadeOut(beat3_3d),
            run_time=0.6,
        )

        self.add_fixed_in_frame_mobjects(header4, mass_label, badges_group, b4_card)

        self.cue(
            62.3,
            Write(header4[0]), Write(header4[1]), Write(header4[2]),
            Create(global_geoid_3d),
            Create(geocentric_ellipsoid_3d),
            Create(geocentric_axes_3d),
            FadeIn(axis_geo_z), FadeIn(axis_geo_o),
            Write(mass_label),
            run_time=0.95,
        )

        self.cue(66.5, Create(satellites_3d), run_time=1.0)
        self.cue(71.0, Create(badges_group[0]), Create(badges_group[1]), run_time=0.85)
        self.cue(74.5, Create(b4_card[0]), LaggedStart(*[Write(item) for item in b4_card[1]], lag_ratio=0.15), run_time=0.85)

        self.camera_cue(75.5, phi=64 * DEGREES, theta=-42 * DEGREES, zoom=0.82, run_time=2.5)

        self.wait_until(DURATION)
