---
name: manim-execution
description: Standard execution rules for running Python and rendering Manim scenes in this workspace using the local uv environment.
---

# Manim Execution & Environment Rules

## Environment Directive
- **ALWAYS** execute Python scripts and Manim renders using `uv run python` or `uv run manim`.
- **NEVER** call external or global system Python binaries.

## Manim Render Commands
- High quality render: `uv run manim -pqh path/to/scene.py SceneClassName`
- Fast preview render: `uv run manim -pql path/to/scene.py SceneClassName`
