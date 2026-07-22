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

# Total duration: 00:01:06.366 -> 00:02:16.800 (70.434s = 2113 frames @ 30fps)
DURATION = 2113 / 30


def cn(text: str, size: float, color: str = INK, weight: str = "SEMIBOLD", **kwargs) -> Text:
    return Text(text, font=CN_FONT, weight=weight, font_size=size, color=color, **kwargs)


def latex(text: str, size: float, color: str = INK) -> MathTex:
    return MathTex(text, font_size=size, color=color)


def irregular_loop(width: float = 4.4, height: float = 4.4, color: str = BLUE, opacity: float = 0.12) -> VMobject:
    points = []
    for theta in np.linspace(0, TAU, 180):
        radius = 1 + 0.055 * math.sin(3 * theta + 0.4) + 0.035 * math.sin(7 * theta - 0.8)
        points.append(np.array([width * 0.5 * radius * math.cos(theta), height * 0.5 * radius * math.sin(theta), 0]))
    loop = VMobject(stroke_color=color, stroke_width=3.5, fill_color=color, fill_opacity=opacity)
    loop.set_points_smoothly(points + [points[0]])
    return loop


def terrain_curve() -> VMobject:
    """Smooth continuous ground surface curve f(x)."""
    points = [
        [-7.2, -0.55, 0],
        [-6.2, -0.25, 0],
        [-5.4, 0.45, 0],
        [-4.6, -0.15, 0],
        [-3.6, 1.25, 0],
        [-2.6, -0.10, 0],
        [-1.6, 0.15, 0],
        [-0.6, 1.95, 0],
        [0.4, 0.15, 0],
        [1.5, -0.10, 0],
        [2.6, 1.35, 0],
        [3.6, 0.25, 0],
        [4.6, 0.65, 0],
        [5.8, -0.35, 0],
        [7.2, -0.45, 0],
    ]
    profile = VMobject(stroke_color=INK, stroke_width=4.5)
    profile.set_points_smoothly([np.array(p) for p in points])
    return profile


def ground_fill_shape(profile: VMobject, bottom_y: float = -4.2) -> VMobject:
    """100% smooth ground fill matching the exact bezier curves of the terrain profile."""
    all_pts = profile.get_all_points()
    start_x = all_pts[0][0]
    end_x = all_pts[-1][0]

    fill = profile.copy()
    fill.add_line_to(np.array([end_x, bottom_y, 0]))
    fill.add_line_to(np.array([start_x, bottom_y, 0]))
    fill.add_line_to(all_pts[0])
    fill.set_fill("#DFD6C5", opacity=0.82)
    fill.set_stroke(width=0)
    return fill


def ocean_water_fill(sea_y: float = -0.35) -> VMobject:
    """Clean ocean water fills in low basin valleys below sea level."""
    water = VGroup()
    # Left ocean basin
    w1 = Polygon(
        [-7.2, sea_y, 0], [-6.2, -0.25, 0], [-5.8, sea_y, 0], [-7.2, sea_y, 0],
        color=BLUE, fill_color=BLUE, fill_opacity=0.38, stroke_width=0
    )
    # Right ocean basin
    w2 = Polygon(
        [5.4, sea_y, 0], [5.8, -0.35, 0], [6.6, -0.45, 0], [7.2, sea_y, 0], [7.2, -0.8, 0], [5.4, sea_y, 0],
        color=BLUE, fill_color=BLUE, fill_opacity=0.38, stroke_width=0
    )
    water.add(w1, w2)
    return water


def right_angle_mark(point: np.ndarray, size: float = 0.16) -> VMobject:
    """Clean perpendicular right-angle mark at line intersection."""
    a = point + RIGHT * size
    b = a + UP * size
    c = point + UP * size
    return VMobject(stroke_color=AMBER, stroke_width=2.5).set_points_as_corners([a, b, c])


class GeoidExplainer(Scene):
    def wait_until(self, target: float) -> None:
        remaining = target - self.time
        if remaining > 1 / config.frame_rate:
            self.wait(remaining)

    def cue(self, target: float, *animations: Animation, run_time: float = 0.8, **kwargs) -> None:
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
        )
        contours.set_stroke(BLUE, width=1.4, opacity=0.15)
        return VGroup(grid, contours)

    def section_mark(self, index: str, title: str) -> VGroup:
        circle = Circle(radius=0.24, stroke_color=BLUE, stroke_width=1.8, fill_color=PAPER_LIGHT, fill_opacity=0.95)
        number = latex(rf"\mathrm{{{index}}}", 22, BLUE).move_to(circle)
        label = cn(title, 24, BLUE).next_to(circle, RIGHT, buff=0.18)
        return VGroup(circle, number, label).to_corner(UL, buff=0.55)

    def construct(self) -> None:
        background = self.paper_background()
        self.add(background)

        # =========================================================================
        # 0.000s: Subtitle 32-34 ── First Approximation: Geoid Intro
        # =========================================================================
        mark = self.section_mark("01", "第一级逼近")
        eyebrow = cn("从真实地球到物理曲面", 26, BLUE)
        title = cn("大地水准面", 80, INK)
        underline = Line(LEFT * 2.8, RIGHT * 2.8, color=AMBER, stroke_width=5)
        title_group = VGroup(eyebrow, title, underline).arrange(DOWN, buff=0.2).move_to([-2.6, 0.45, 0])

        geoid_shape = irregular_loop(4.0, 4.0, BLUE, opacity=0.15).move_to([4.2, 0.25, 0])
        nested = VGroup(*[
            irregular_loop(4.0 - i * 0.6, 4.0 - i * 0.6, [BLUE, SAGE, AMBER][i], opacity=0.16 - i * 0.04).move_to([4.2, 0.25, 0])
            for i in range(3)
        ])
        self.cue(0.0, FadeIn(mark, shift=UP * 0.15), FadeIn(eyebrow, shift=UP * 0.2), run_time=0.7)
        self.cue(0.65, Write(title), Create(underline), run_time=1.0)
        self.cue(1.55, LaggedStart(*[Create(x) for x in nested], lag_ratio=0.16), run_time=1.2)

        # 3.134s: Subtitle 33 ── GEOID Word
        geoid_word = latex(r"\mathrm{GEOID}", 62, BLUE).next_to(title, DOWN, buff=0.6)
        phonetic = cn("大地水准面 (物理重力等位面)", 20, MUTED).next_to(geoid_word, DOWN, buff=0.12)
        self.cue(3.134, FadeIn(geoid_word, shift=UP * 0.18), FadeIn(phonetic), run_time=0.8)

        # 5.200s: Subtitle 34 ── Physicist's Ideal Experiment
        idea_label = cn("物理学家的理想实验", 34, AMBER)
        idea_rule = Line(LEFT * 2.2, RIGHT * 2.2, color=AMBER, stroke_width=3)
        idea = VGroup(idea_label, idea_rule).arrange(DOWN, buff=0.16).to_edge(UP, buff=0.55)
        old_intro = VGroup(mark, title_group, nested, geoid_word, phonetic)
        self.cue(5.2, FadeOut(old_intro, shift=LEFT * 0.35), FadeIn(idea, shift=UP * 0.2), run_time=0.75)

        # =========================================================================
        # 6.467s: Subtitles 35-39 ── Real Ground vs Sea Level (FIX ISSUE 1)
        # =========================================================================
        terrain = terrain_curve().shift(DOWN * 0.4)
        ground_fill = ground_fill_shape(terrain, bottom_y=-4.2)
        water_fill = ocean_water_fill(sea_y=-0.35)

        sea_level = DashedLine([-7.1, -0.35, 0], [7.1, -0.35, 0], dash_length=0.14, color=BLUE, stroke_width=3.5)
        sea_label = cn("全球平均海平面", 24, BLUE).next_to(sea_level, UP, buff=0.15).to_corner(UL, buff=0.85).shift(DOWN * 1.0)

        still_badge = VGroup(
            RoundedRectangle(width=3.2, height=0.65, corner_radius=0.1, stroke_color=SAGE, stroke_width=2, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            cn("完全静止 · 平衡状态", 22, SAGE),
        )
        still_badge[1].move_to(still_badge[0])
        still_badge.to_corner(DR, buff=0.65)

        # Smooth reveal of Terrain and Water (Fix Issue 1: Clean Terrain & Ocean Fill)
        self.cue(6.467, Create(terrain), FadeIn(ground_fill, rate_func=smooth), run_time=1.1)
        self.cue(8.7, FadeIn(water_fill), FadeIn(still_badge, shift=UP * 0.15), run_time=0.8)

        # 10.967s: Subtitle 37-39 ── Extend Sea Level under continents
        self.cue(10.967, Create(sea_level), FadeIn(sea_label), run_time=1.2)
        under_land = Line([-5.8, -0.35, 0], [5.4, -0.35, 0], color=BLUE, stroke_width=6).set_opacity(0.35)
        extension_note = cn("穿过陆地，延伸至大陆下部", 26, BLUE).next_to(sea_level, DOWN, buff=0.28)
        self.cue(14.767, Create(under_land), FadeIn(extension_note, shift=UP * 0.15), run_time=1.0)

        # =========================================================================
        # 17.600s: Subtitles 40-41 ── Gravity Plumb Lines & Right-Angle Marks (FIX ISSUE 2)
        # =========================================================================
        field_arrows = VGroup()
        angle_marks = VGroup()
        x_coords = [-5.0, -3.2, -1.4, 0.6, 2.4, 4.25]

        for x in x_coords:
            arrow = Arrow([x, 1.6, 0], [x, -0.35, 0], buff=0, color=AMBER, stroke_width=3.5, max_tip_length_to_length_ratio=0.12)
            field_arrows.add(arrow)
            # Fix Issue 2: Draw right-angle mark PRECISELY at the intersection of arrow tip and sea level line
            mark_square = right_angle_mark(np.array([x, -0.35, 0]), size=0.16)
            angle_marks.add(mark_square)

        gravity_label = VGroup(latex(r"\vec{g}", 36, AMBER), cn("重力线", 24, AMBER)).arrange(RIGHT, buff=0.12).to_corner(UR, buff=0.75)
        self.cue(17.6, LaggedStart(*[GrowArrow(a) for a in field_arrows], lag_ratio=0.08), FadeIn(gravity_label), run_time=1.1)

        perpendicular = VGroup(cn("处处正交", 32, AMBER), latex(r"\vec{g}\perp W", 40, AMBER)).arrange(DOWN, buff=0.12).move_to([4.8, 2.3, 0])
        self.cue(19.767, LaggedStart(*[Create(m) for m in angle_marks], lag_ratio=0.08), FadeIn(perpendicular, shift=UP * 0.15), run_time=0.85)

        # =========================================================================
        # 21.534s: Subtitles 42-45 ── Reveal Geoid Solid Body (FIX ISSUE 3)
        # =========================================================================
        cross_section = VGroup(idea, terrain, ground_fill, water_fill, sea_level, sea_label, still_badge, under_land, extension_note, field_arrows, angle_marks, gravity_label, perpendicular)

        # Fix Issue 3: Move Geoid loop shape to LEFT side, and explanation text card to RIGHT side!
        closed = irregular_loop(5.2, 5.0, BLUE, opacity=0.15).move_to([-3.2, -0.1, 0])
        closed_inner = irregular_loop(4.6, 4.4, SAGE, opacity=0.22).move_to([-3.2, -0.1, 0])
        closed_rings = VGroup(*[
            irregular_loop(5.2 - i * 0.28, 5.0 - i * 0.28, BLUE, opacity=0.10).move_to([-3.2, -0.1, 0])
            for i in range(1, 5)
        ])

        geoid_center_label = VGroup(cn("大地水准面", 42, INK), latex(r"\mathrm{GEOID}", 34, BLUE)).arrange(DOWN, buff=0.12).move_to([-3.2, -0.1, 0])

        # Right Side Card Layout for Text
        right_info_card = VGroup(
            RoundedRectangle(width=5.8, height=4.6, corner_radius=0.16, stroke_color=BLUE, stroke_width=2, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            cn("连续 · 封闭 · 重力等位", 32, BLUE),
            Line(LEFT * 2.2, RIGHT * 2.2, color=BLUE, stroke_width=2),
            cn("它包裹出的三维形体", 26, MUTED),
            cn("【 大地体 】", 48, SAGE),
            cn("测绘学物理起算基准面", 22, MUTED),
        )
        right_info_card[1:].arrange(DOWN, buff=0.25).move_to(right_info_card[0])
        right_info_card.move_to([3.4, -0.1, 0])

        self.cue(21.534, FadeOut(cross_section, shift=DOWN * 0.2), Create(closed), FadeIn(closed_inner), run_time=1.0)
        self.cue(23.867, LaggedStart(*[Create(r) for r in closed_rings], lag_ratio=0.1), FadeIn(geoid_center_label, scale=0.9), run_time=0.85)
        self.cue(25.634, FadeIn(right_info_card, shift=LEFT * 0.3), run_time=1.0)

        # =========================================================================
        # 30.300s: Subtitles 46-49 ── Absolute Height (H) above Geoid
        # =========================================================================
        geoid_group = VGroup(closed, closed_inner, closed_rings, geoid_center_label, right_info_card)
        section_title = self.section_mark("01.1", "绝对高程")
        datum_curve = CubicBezier([-6.6, -1.75, 0], [-3.2, -1.45, 0], [2.8, -2.05, 0], [6.6, -1.62, 0]).set_stroke(BLUE, width=4.5)
        surface_curve = terrain_curve().scale(0.78).shift(UP * 0.55)

        point = Dot([2.25, 1.52, 0], radius=0.1, color=CLAY)
        point_label = cn("地面点 P", 25, CLAY).next_to(point, UP, buff=0.14)
        plumb = DashedLine([2.25, -1.72, 0], [2.25, 1.52, 0], color=AMBER, dash_length=0.12, stroke_width=3)
        height_arrow = DoubleArrow([2.58, -1.72, 0], [2.58, 1.52, 0], buff=0, color=CLAY, stroke_width=4)
        h_label = VGroup(latex("H", 48, CLAY), cn("绝对高程", 28, CLAY)).arrange(DOWN, buff=0.05).next_to(height_arrow, RIGHT, buff=0.2)
        datum_label = VGroup(cn("大地水准面", 25, BLUE), latex(r"W=W_0", 30, BLUE)).arrange(DOWN, buff=0.06).move_to([-4.6, -2.2, 0])

        self.cue(30.3, FadeOut(geoid_group), FadeIn(section_title), Create(surface_curve), Create(datum_curve), run_time=0.9)
        self.cue(31.967, FadeIn(point, scale=0.4), FadeIn(point_label), run_time=0.6)
        self.cue(35.2, Create(plumb), GrowArrow(height_arrow), FadeIn(h_label), run_time=0.9)
        self.cue(37.234, FadeIn(datum_label, shift=UP * 0.15), run_time=0.65)

        # =========================================================================
        # 39.434s: Subtitles 50-53 ── Ideal Sea Level vs Actual Ocean
        # =========================================================================
        actual_ocean = VGroup(
            RoundedRectangle(width=4.5, height=2.2, corner_radius=0.12, stroke_color=CLAY, stroke_width=2, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            cn("现实中的某一片海洋", 28, CLAY),
        )
        actual_ocean[1].move_to(actual_ocean[0])
        actual_ocean.move_to([-3.4, 0.45, 0])
        cross_mark = VGroup(
            Line(actual_ocean.get_corner(UL), actual_ocean.get_corner(DR), color=CLAY, stroke_width=5),
            Line(actual_ocean.get_corner(DL), actual_ocean.get_corner(UR), color=CLAY, stroke_width=5)
        )

        ideal_card = VGroup(
            RoundedRectangle(width=5.4, height=2.5, corner_radius=0.12, stroke_color=BLUE, stroke_width=2, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            cn("理想平均海平面", 34, BLUE),
            latex(r"W=W_0,\quad \vec{g}\perp W", 36, AMBER),
        )
        ideal_card[1:].arrange(DOWN, buff=0.25).move_to(ideal_card[0])
        ideal_card.move_to([3.4, 0.45, 0])

        old_height = VGroup(section_title, surface_curve, datum_curve, point, point_label, plumb, height_arrow, h_label, datum_label)
        contrast_title = cn("“海拔”里的海，究竟是什么？", 46, INK).to_edge(UP, buff=0.65)
        self.cue(39.434, FadeOut(old_height), FadeIn(contrast_title), FadeIn(actual_ocean, shift=UP * 0.2), run_time=0.85)
        self.cue(41.4, Create(cross_mark), run_time=0.55)
        self.cue(44.4, FadeIn(ideal_card, shift=UP * 0.25), run_time=0.85)
        ideal_note = cn("静止平衡 · 连续封闭 · 与重力线正交", 28, SAGE).to_edge(DOWN, buff=0.75)
        self.cue(46.4, FadeIn(ideal_note, shift=UP * 0.15), run_time=0.65)

        # =========================================================================
        # 50.434s: Subtitles 54-58 ── Absolute vs Relative Height
        # =========================================================================
        contrast_group = VGroup(contrast_title, actual_ocean, cross_mark, ideal_card, ideal_note)
        compare_title = cn("同一个地面点，两种高程基准", 48, INK).to_edge(UP, buff=0.62)
        divider = Line([0, -3.2, 0], [0, 2.5, 0], color=GRID, stroke_width=2)
        left_head = cn("绝对高程", 36, BLUE).move_to([-3.8, 1.85, 0])
        right_head = cn("相对高程", 36, AMBER).move_to([3.8, 1.85, 0])

        left_datum = CubicBezier([-6.7, -1.5, 0], [-5.1, -1.3, 0], [-2.0, -1.8, 0], [-0.7, -1.5, 0]).set_stroke(BLUE, width=4)
        right_datum = DashedLine([0.8, -0.55, 0], [6.7, -0.55, 0], dash_length=0.12, color=AMBER, stroke_width=4)

        left_point = Dot([-3.7, 1.05, 0], color=CLAY)
        right_point = Dot([3.7, 1.05, 0], color=CLAY)
        abs_arrow = DoubleArrow([-3.35, -1.53, 0], [-3.35, 1.05, 0], buff=0, color=BLUE)
        rel_arrow = DoubleArrow([4.05, -0.55, 0], [4.05, 1.05, 0], buff=0, color=AMBER)
        abs_formula = latex("H", 46, BLUE).next_to(abs_arrow, RIGHT, buff=0.12)
        rel_formula = latex("h_r", 46, AMBER).next_to(rel_arrow, RIGHT, buff=0.12)
        abs_caption = cn("到大地水准面", 24, BLUE).move_to([-3.8, -2.15, 0])
        rel_caption = cn("到任意假定水准面", 24, AMBER).move_to([3.8, -1.2, 0])

        self.cue(50.434, FadeOut(contrast_group), FadeIn(compare_title), Create(divider), FadeIn(left_head), run_time=0.8)
        self.cue(52.434, FadeIn(right_head), Create(left_datum), Create(right_datum), FadeIn(left_point), FadeIn(right_point), run_time=0.8)
        self.cue(54.2, GrowArrow(abs_arrow), FadeIn(abs_formula), FadeIn(abs_caption), run_time=0.7)
        self.cue(56.767, GrowArrow(rel_arrow), FadeIn(rel_formula), FadeIn(rel_caption), run_time=0.7)

        # =========================================================================
        # 60.134s: Subtitles 59-63 ── Building Example & Local Zero Benchmark (FIX ISSUES 4 & 5)
        # =========================================================================
        comparison_group = VGroup(compare_title, divider, left_head, right_head, left_datum, right_datum, left_point, right_point, abs_arrow, rel_arrow, abs_formula, rel_formula, abs_caption, rel_caption)
        building_title = self.section_mark("01.2", "相对高程的测量实例")

        # Ground level line at y = -1.8
        ground_y = -1.8
        ground = Line([-7.2, ground_y, 0], [7.2, ground_y, 0], color=INK, stroke_width=5)

        # Fix Issue 4: Place the building AND the assumed zero level line (假定水准面 0.000m) at the ground level y = -1.8!
        building_height = 4.4
        building_width = 3.2
        building_bottom = ground_y
        building_top = building_bottom + building_height

        building = VGroup(
            Rectangle(width=building_width, height=building_height, stroke_color=INK, stroke_width=4, fill_color="#E9E1D3", fill_opacity=0.9).move_to([1.2, building_bottom + building_height/2, 0]),
            *[Rectangle(width=0.55, height=0.62, stroke_color=BLUE, fill_color=BLUE, fill_opacity=0.12, stroke_width=2) for _ in range(6)],
        )
        windows = building[1:]
        for i, window in enumerate(windows):
            row, col = divmod(i, 2)
            window.move_to([0.6 + col * 1.2, building_bottom + 1.1 + row * 1.1, 0])

        roof = Polygon([-0.5, building_top, 0], [1.2, building_top + 0.9, 0], [2.9, building_top, 0], color=INK, fill_color="#D8C8B5", fill_opacity=0.95)

        # Zero Datum Line right at ground level y = -1.8!
        local_zero = DashedLine([-6.8, ground_y, 0], [6.8, ground_y, 0], dash_length=0.14, color=AMBER, stroke_width=4)
        benchmark = VGroup(
            Triangle(color=CLAY, fill_color=CLAY, fill_opacity=1).scale(0.18),
            cn("固定点 A (地面起算点)", 24, CLAY)
        ).arrange(RIGHT, buff=0.14).move_to([-4.4, ground_y + 0.35, 0])

        zero_badge = VGroup(
            RoundedRectangle(width=3.2, height=0.65, corner_radius=0.1, stroke_color=AMBER, stroke_width=2, fill_color=PAPER_LIGHT, fill_opacity=0.96),
            cn("假定零点 0.000 m", 22, AMBER),
        )
        zero_badge[1].move_to(zero_badge[0])
        zero_badge.move_to([-4.4, ground_y - 0.55, 0])

        top_point = Dot([1.2, building_top + 0.9, 0], color=CLAY, radius=0.1)
        rel_height = DoubleArrow([3.4, ground_y, 0], [3.4, building_top + 0.9, 0], buff=0, color=AMBER, stroke_width=5)
        rel_height_label = VGroup(latex("h_r", 52, AMBER), cn("相对高程", 32, AMBER)).arrange(DOWN, buff=0.05).next_to(rel_height, RIGHT, buff=0.25)

        self.cue(60.134, FadeOut(comparison_group), FadeIn(building_title), Create(ground), FadeIn(building), FadeIn(roof), run_time=0.9)
        self.cue(62.567, FadeIn(benchmark, shift=UP * 0.15), run_time=0.6)
        self.cue(65.234, Create(local_zero), FadeIn(zero_badge), run_time=0.75)
        self.cue(67.034, FadeIn(top_point, scale=0.4), GrowArrow(rel_height), FadeIn(rel_height_label), run_time=0.85)

        # Fix Issue 5: Expand badge box width from 7.2 to 11.2 so text fits comfortably inside without bleeding out!
        final_badge = VGroup(
            RoundedRectangle(width=11.2, height=0.9, corner_radius=0.12, stroke_color=SAGE, stroke_width=2, fill_color=PAPER_LIGHT, fill_opacity=0.97),
            cn("相对高程 = 地面点到假定水准面的铅垂距离", 27, SAGE),
        )
        final_badge[1].move_to(final_badge[0])
        final_badge.to_edge(DOWN, buff=0.35)

        self.cue(69.034, FadeIn(final_badge, shift=UP * 0.18), run_time=0.65)
        self.wait_until(DURATION)
