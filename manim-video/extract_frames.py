import os
import subprocess

video_paths = [
    r"media\videos\ellipsoid_explainer\720p30\EllipsoidExplainer.mp4",
    r"media\videos\ellipsoid_explainer\1080p30\EllipsoidExplainer.mp4",
]

video_path = None
for p in video_paths:
    if os.path.exists(p):
        video_path = p
        break

print(f"Found video at: {video_path}")

out_dir = r"C:\Users\12907\.gemini\antigravity-ide\brain\087eeae6-5907-42c7-bc97-c37f58988e95"

timestamps = [
    (12.0, "beat1_frame.png"),
    (39.0, "beat2_frame.png"),
    (54.0, "beat3_frame.png"),
    (76.0, "beat4_frame.png"),
    (102.0, "beat5_frame.png"),
]

for t, filename in timestamps:
    out_path = os.path.join(out_dir, filename)
    cmd = f'ffmpeg -y -ss {t} -i "{video_path}" -vframes 1 "{out_path}"'
    subprocess.run(cmd, shell=True)
    print(f"Extracted {filename} at t={t}s")
