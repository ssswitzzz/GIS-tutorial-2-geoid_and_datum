from geoid_explainer import GeoidExplainer
from manim import config

config.pixel_width = 1920
config.pixel_height = 1080
config.frame_rate = 30

scene = GeoidExplainer()
scene.render()
