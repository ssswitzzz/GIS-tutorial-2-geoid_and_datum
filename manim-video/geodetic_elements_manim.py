from manim import *
import numpy as np

# Set background to match warm paper texture aesthetic
config.background_color = "#f9f6f0"

class GeodeticLatitudeDemo(Scene):
    def construct(self):
        # 1. Title
        title = Text("地心纬度 vs 大地纬度", font="Microsoft YaHei", font_size=32, weight=BOLD, color="#29342f")
        title.to_corner(UL, buff=0.6)
        
        subtitle = Text("椭球面法线不经过椭球中心 O", font="Microsoft YaHei", font_size=20, color="#8f4e3e")
        subtitle.next_to(title, DOWN, aligned_edge=LEFT, buff=0.15)
        
        self.play(Write(title), FadeIn(subtitle), run_time=1.2)

        # 2. Ellipse (Meridian Section) Setup
        a = 4.2  # Semi-major axis
        b = 2.8  # Semi-minor axis (exaggerated oblateness for visual clarity)
        
        # Center O
        center = Dot(ORIGIN, color="#8f4e3e", radius=0.08)
        center_label = Text("O (椭球中心)", font="Microsoft YaHei", font_size=18, color="#8f4e3e").next_to(center, DL, buff=0.1)

        # Equator line (X-axis) and Rotation axis (Z-axis)
        equator = Line(LEFT * (a + 0.6), RIGHT * (a + 0.6), color="#a77748", stroke_width=2.5)
        equator_label = Text("赤道平面", font="Microsoft YaHei", font_size=16, color="#a77748").next_to(equator, RIGHT, buff=0.1)
        
        z_axis = DashedLine(DOWN * (b + 0.6), UP * (b + 0.6), color="#315f6d", stroke_width=2.5, dash_length=0.15)
        z_label = Text("自转轴 Z", font="Microsoft YaHei", font_size=16, color="#315f6d").next_to(z_axis, UP, buff=0.1)

        # Ellipse curve
        ellipse = Ellipse(width=2*a, height=2*b, color="#315f6d", stroke_width=4)
        
        self.play(
            Create(equator),
            Create(z_axis),
            Create(ellipse),
            FadeIn(center),
            Write(center_label),
            Write(equator_label),
            Write(z_label),
            run_time=2.0
        )

        # 3. Parametric Surface Point P and Geometry Calculations
        t_val = ValueTracker(45 * DEGREES)

        def get_p():
            t = t_val.get_value()
            return np.array([a * np.cos(t), b * np.sin(t), 0])

        p_dot = always_redraw(lambda: Dot(get_p(), color="#b84c36", radius=0.1))
        p_label = always_redraw(lambda: Text("P", font="Microsoft YaHei", color="#b84c36", font_size=22, weight=BOLD).next_to(p_dot, UR, buff=0.1))

        # Geocentric Line OP (Center O to Point P)
        op_line = always_redraw(lambda: DashedLine(ORIGIN, get_p(), color="#b84c36", stroke_width=3, dash_length=0.12))
        
        # Normal Line at Point P (Perpendicular to Ellipse Tangent)
        def get_normal_intersection():
            t = t_val.get_value()
            px, py, _ = get_p()
            x_int = ((a**2 - b**2) / a) * np.cos(t)
            return np.array([x_int, 0, 0])

        normal_line = always_redraw(lambda: Line(
            get_p() + 0.8 * (get_p() - get_normal_intersection()) / np.linalg.norm(get_p() - get_normal_intersection()),
            get_normal_intersection(),
            color="#29735a",
            stroke_width=4.5
        ))

        normal_int_dot = always_redraw(lambda: Dot(get_normal_intersection(), color="#29735a", radius=0.08))
        normal_int_label = always_redraw(lambda: Text("法线交点 (非 O 点!)", font="Microsoft YaHei", font_size=15, color="#29735a").next_to(normal_int_dot, DOWN, buff=0.15))

        self.play(
            FadeIn(p_dot),
            Write(p_label),
            Create(op_line),
            run_time=1.5
        )

        # 4. Geocentric Angle Arc
        psi_arc = always_redraw(lambda: Arc(
            radius=0.9,
            start_angle=0,
            angle=np.arctan2(get_p()[1], get_p()[0]),
            color="#b84c36",
            stroke_width=3
        ))
        psi_tex = always_redraw(lambda: Text("地心纬度 ψ", font="Microsoft YaHei", color="#b84c36", font_size=18).next_to(psi_arc, RIGHT, buff=0.15))

        self.play(Create(psi_arc), Write(psi_tex), run_time=1.5)

        # 5. Normal Line and Geodetic Latitude Angle Arc B
        self.play(
            Create(normal_line),
            FadeIn(normal_int_dot),
            Write(normal_int_label),
            run_time=2.0
        )

        def get_normal_angle():
            vec = get_p() - get_normal_intersection()
            return np.arctan2(vec[1], vec[0])

        b_arc = always_redraw(lambda: Arc(
            radius=1.3,
            arc_center=get_normal_intersection(),
            start_angle=0,
            angle=get_normal_angle(),
            color="#29735a",
            stroke_width=3.5
        ))
        b_tex = always_redraw(lambda: Text("大地纬度 B", font="Microsoft YaHei", color="#29735a", font_size=20).next_to(b_arc, UR, buff=0.1))

        self.play(Create(b_arc), Write(b_tex), run_time=1.5)

        # 6. Exaggerate Motion & Show Divergence
        card_bg = RoundedRectangle(corner_radius=0.15, width=4.8, height=2.2, fill_color="#ffffff", fill_opacity=0.92, stroke_color="#315f6d", stroke_width=2)
        card_bg.to_corner(DR, buff=0.4)

        card_text1 = Text("地心纬度 ψ: 连线 OP 与赤道夹角", font="Microsoft YaHei", font_size=16, color="#b84c36")
        card_text2 = Text("大地纬度 B: 法线与赤道夹角", font="Microsoft YaHei", font_size=16, color="#29735a")
        card_text3 = Text("因椭球扁平，法线偏向两极，B > ψ", font="Microsoft YaHei", font_size=15, color="#29342f", weight=BOLD)
        
        card_group = VGroup(card_text1, card_text2, card_text3).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        card_group.move_to(card_bg.get_center())

        self.play(FadeIn(card_bg), FadeIn(card_group), run_time=1.5)

        # Move point P along the ellipse curve from 35 deg to 60 deg to demonstrate dynamic divergence
        self.play(t_val.animate.set_value(65 * DEGREES), run_time=3.0, rate_func=there_and_back_with_pause)
        self.play(t_val.animate.set_value(25 * DEGREES), run_time=3.0, rate_func=there_and_back)

        self.wait(1.5)
