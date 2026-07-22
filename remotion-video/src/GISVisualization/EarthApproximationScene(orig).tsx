import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const fade = (frame: number, start: number, end: number, fadeIn = 14, fadeOut = 16) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);

const softStep = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing: ease });

// Editorial Paper Background
const PaperBackground: React.FC<{ tone?: "light" | "warm" | "dark" }> = ({ tone = "light" }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(Math.sin(frame / 90), [-1, 1], [-10, 10]);

  if (tone === "dark") {
    return (
      <AbsoluteFill style={{ background: "linear-gradient(135deg, #121c17 0%, #192720 50%, #0f1814 100%)" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.15,
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            transform: `translate(${drift}px, ${drift * 0.4}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.18), transparent 60%), radial-gradient(circle at 80% 80%, rgba(49, 95, 109, 0.2), transparent 50%)",
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background:
          tone === "warm"
            ? "linear-gradient(135deg, #f6efe1 0%, #fffaf0 44%, #e9f0e4 100%)"
            : "linear-gradient(135deg, #f9f4e9 0%, #fcfbf5 50%, #e9efea 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.28,
          backgroundImage:
            "linear-gradient(rgba(37, 48, 43, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 48, 43, 0.09) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${drift}px, ${drift * 0.4}px)`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, opacity: 0.16 }}
      >
        <path d="M-40 736 C 246 664, 402 810, 710 718 S 1238 470, 1970 592" fill="none" stroke="#6d7c6b" strokeWidth="2" />
        <path d="M-30 812 C 246 734, 460 910, 748 804 S 1300 540, 1980 664" fill="none" stroke="#6d7c6b" strokeWidth="2" />
        <path d="M114 218 C 384 120, 584 300, 858 204 S 1398 18, 1960 180" fill="none" stroke="#426b80" strokeWidth="1.5" />
      </svg>
    </AbsoluteFill>
  );
};

// Custom Vector Animated Fire Graphic (Replaces .mov video to fix browser playback errors)
const AnimatedFireGraphic: React.FC = () => {
  const frame = useCurrentFrame();

  const f1 = Math.sin(frame * 0.35) * 12;
  const f2 = Math.cos(frame * 0.28) * 15;
  const f3 = Math.sin(frame * 0.42) * 10;

  // Rising embers particles
  const embers = [
    { x: 120, speed: 2.2, size: 5, delay: 0 },
    { x: 220, speed: 3.1, size: 7, delay: 10 },
    { x: 320, speed: 2.5, size: 4, delay: 20 },
    { x: 400, speed: 3.5, size: 6, delay: 35 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Background Heat Glow */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          background:
            "radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.45), rgba(245, 158, 11, 0.25), transparent 70%)",
        }}
      />

      {/* SVG Vector Flame Graphic */}
      <svg viewBox="0 0 500 500" style={{ width: "100%", height: "100%", position: "relative", zIndex: 2 }}>
        <defs>
          <linearGradient id="fireOuter" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="fireMid" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id="fireCore" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Red Flame */}
        <path
          d={`M 150 450 C ${160 + f1} 340, ${100 + f2} 240, ${220 + f3} 100 C ${320 - f1} 240, ${360 + f2} 320, ${350 - f3} 450 Z`}
          fill="url(#fireOuter)"
          opacity="0.9"
        />

        {/* Middle Orange Flame */}
        <path
          d={`M 180 450 C ${200 - f2} 360, ${160 + f1} 270, ${250 + f2} 160 C ${320 + f3} 270, ${330 - f1} 360, ${320 + f2} 450 Z`}
          fill="url(#fireMid)"
          opacity="0.95"
        />

        {/* Core Yellow/White Flame */}
        <path
          d={`M 210 450 C ${220 + f3} 380, ${200 - f1} 320, ${250 + f1} 240 C ${290 - f2} 320, ${290 + f3} 380, ${290 - f1} 450 Z`}
          fill="url(#fireCore)"
        />

        {/* Rising Embers */}
        {embers.map((emb, idx) => {
          const yPos = 440 - ((frame * emb.speed + emb.delay * 20) % 350);
          const xOffset = Math.sin((frame + idx * 30) * 0.1) * 20;
          const alpha = interpolate(yPos, [100, 350, 440], [0, 1, 0.2], clamp);

          return <circle key={idx} cx={emb.x + xOffset} cy={yPos} r={emb.size} fill="#fef08a" opacity={alpha} />;
        })}
      </svg>
    </div>
  );
};

export const EarthApproximationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // 30

  // Total 1103 frames @ 30fps (36.766s: 00:00:29,600 --> 00:01:06,366)
  const sec1 = fade(frame, 0, 366);
  const sec2 = fade(frame, 360, 735);
  const sec3 = fade(frame, 730, 1103, 16, 24);

  // Beat 1 Springs
  const s1Header = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 80 } });
  const s1Y = interpolate(s1Header, [0, 1], [40, 0]);
  const scanX = interpolate(softStep(frame, 40, 300), [0, 1], [200, 1700]);

  // Beat 2 Springs (Computer Burning / Overload)
  const s2Header = spring({ frame: frame - 370, fps, config: { damping: 18, stiffness: 80 } });
  const shakeX = frame > 500 && frame < 720 ? Math.sin(frame * 0.8) * 5 : 0;
  const shakeY = frame > 500 && frame < 720 ? Math.cos(frame * 0.7) * 4 : 0;

  // Beat 3 Springs (3-Stage Roadmap)
  const s3Header = spring({ frame: frame - 740, fps, config: { damping: 18, stiffness: 80 } });
  const card1 = spring({ frame: frame - 780, fps, config: { damping: 18, stiffness: 85 } });
  const card2 = spring({ frame: frame - 820, fps, config: { damping: 18, stiffness: 85 } });
  const card3 = spring({ frame: frame - 860, fps, config: { damping: 18, stiffness: 85 } });
  const roadmapUnderline = softStep(frame, 920, 1050);

  return (
    <AbsoluteFill style={{ fontFamily: SERIF_STACK, color: "#29342f", overflow: "hidden" }}>
      <PaperBackground tone={frame >= 360 && frame < 735 ? "dark" : frame >= 730 ? "warm" : "light"} />

      {/* ==================== BEAT 1: REAL EARTH TERRAIN (29.6s - 41.8s) ==================== */}
      {frame >= 0 && frame < 368 && (
        <AbsoluteFill style={{ opacity: sec1 }}>
          {/* Header */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 90,
              opacity: interpolate(s1Header, [0, 1], [0, 1]),
              transform: `translateY(${s1Y}px)`,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 20, color: "#5f7166", fontWeight: 700, marginBottom: 12 }}>
              01 • 地球真实的样貌 (REAL TOPOGRAPHY OF EARTH)
            </div>
            <div style={{ fontSize: 60, fontWeight: 700, color: "#26332e", lineHeight: 1.12, whiteSpace: "nowrap" }}>
              那么首先，我们需要看一看
              <span style={{ color: "#315f6d", margin: "0 12px" }}>地球真实的样貌</span>
            </div>
            <div style={{ fontSize: 24, color: "#6b7268", marginTop: 10, whiteSpace: "nowrap" }}>
              表面有海洋湖泊、也有高山丘陵 ── 凹凸不平，十分甚至九分的不规则！
            </div>
          </div>

          {/* Interactive Topographic Landscape Diagram */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 275,
              width: 1640,
              height: 660,
              background: "rgba(255, 253, 247, 0.92)",
              border: "1.5px solid rgba(47, 55, 49, 0.18)",
              boxShadow: "0 30px 90px rgba(55, 48, 38, 0.13)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <svg viewBox="0 0 1640 660" style={{ width: "100%", height: "100%" }}>
              <defs>
                <pattern id="b1Grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(40,60,50,0.06)" strokeWidth="1" />
                </pattern>
                <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#315f6d" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1e3a43" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f745d" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#2a4535" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <rect width="1640" height="660" fill="url(#b1Grid)" />

              {/* Sea Level Reference Line */}
              <line x1="100" y1="410" x2="1540" y2="410" stroke="#315f6d" strokeWidth="2.5" strokeDasharray="8 6" />
              <text x="120" y="395" fill="#315f6d" fontFamily={SERIF_STACK} fontSize="18" fontWeight="bold">
                ── 理论海平面 (Sea Level Reference)
              </text>

              {/* Mountains & Hills Profile */}
              <path
                d="M 100 410 C 200 410, 280 130, 420 130 C 520 130, 580 330, 680 330 C 760 330, 820 210, 920 210 C 1020 210, 1100 510, 1260 510 C 1380 510, 1460 410, 1540 410 L 1540 640 L 100 640 Z"
                fill="url(#mountainGrad)"
                stroke="#2a4535"
                strokeWidth="4"
              />

              {/* Ocean Basin Deep Water Fill */}
              <path
                d="M 1100 510 C 1220 510, 1280 610, 1360 610 C 1440 610, 1490 410, 1540 410 L 1540 640 L 1100 640 Z"
                fill="url(#oceanGrad)"
                opacity="0.85"
              />

              {/* Altitude Labels */}
              <g transform="translate(420, 100)">
                <circle cx="0" cy="0" r="6" fill="#a77748" />
                <text x="-80" y="-14" fill="#2d4b3d" fontFamily={SERIF_STACK} fontSize="22" fontWeight="bold">
                  🏔️ 青藏高原 / 珠峰区域 (+8848.86m)
                </text>
              </g>

              <g transform="translate(920, 180)">
                <circle cx="0" cy="0" r="6" fill="#a77748" />
                <text x="-60" y="-14" fill="#2d4b3d" fontFamily={SERIF_STACK} fontSize="20" fontWeight="bold">
                  ⛰️ 丘陵台地 (+1200m)
                </text>
              </g>

              <g transform="translate(1360, 580)">
                <circle cx="0" cy="0" r="6" fill="#93c5fd" />
                <text x="-70" y="30" fill="#93c5fd" fontFamily={SERIF_STACK} fontSize="22" fontWeight="bold">
                  🌊 盆地与深海板块 (-10984m)
                </text>
              </g>

              {/* Vertical Plumb Measurement Scan */}
              <line x1={scanX} y1="70" x2={scanX} y2="590" stroke="#a77748" strokeWidth="2.5" strokeDasharray="5 5" />
              <circle cx={scanX} cy="410" r="7" fill="#a77748" />
            </svg>

            {/* Warning Pill Tag */}
            <div
              style={{
                position: "absolute",
                right: 40,
                top: 36,
                background: "rgba(155, 90, 66, 0.15)",
                border: "1.5px solid rgba(155, 90, 66, 0.4)",
                color: "#9b5a42",
                padding: "10px 22px",
                borderRadius: 10,
                fontFamily: SERIF_STACK,
                fontSize: 18,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              ⚠️ 极度不规则几何体 (IRREGULAR TOPOGRAPHY)
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BEAT 2: COMPUTER OVERLOAD / BURNING SMELL (42.2s - 53.7s) ==================== */}
      {frame >= 360 && frame < 737 && (
        <AbsoluteFill style={{ opacity: sec2 }}>
          {/* Header */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 90,
              opacity: interpolate(s2Header, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s2Header, [0, 1], [40, 0])}px)`,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 20, color: "#ef4444", fontWeight: 700, marginBottom: 12 }}>
              02 • 数学计算困境 (COMPUTATIONAL IMPOSSIBILITY)
            </div>
            <div style={{ fontSize: 60, fontWeight: 700, color: "#fff", lineHeight: 1.15, whiteSpace: "nowrap" }}>
              在这种情况下，
              <span style={{ color: "#f87171", margin: "0 10px" }}>是非常不利于数学计算的</span>
            </div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.75)", marginTop: 10, whiteSpace: "nowrap" }}>
              如果把不规则的球体抽象成数学公式放入计算机……估计我们只能闻到电脑的烧焦味了！🔥
            </div>
          </div>

          {/* Computer Terminal Monitor Graphic */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 250,
              width: 1640,
              height: 680,
              background: "#0b120f",
              border: "3px solid #ef4444",
              borderRadius: 16,
              boxShadow: "0 0 60px rgba(239, 68, 68, 0.35)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "1fr 540px",
              padding: "36px",
              boxSizing: "border-box",
              gap: 40,
              transform: `translate(${shakeX}px, ${shakeY}px)`,
            }}
          >
            {/* Left Terminal Monitor Code Screen */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#eab308" }} />
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ color: "#ef4444", fontFamily: MONO_STACK, fontSize: 16, marginLeft: 16, fontWeight: 700 }}>
                  TERMINAL: GEODESY_COMPUTE_MESH.EXE [SYSTEM CRITICAL OVERLOAD]
                </span>
              </div>

              {/* Code lines */}
              <div style={{ fontFamily: MONO_STACK, fontSize: 18, color: "#4ade80", lineHeight: 1.6 }}>
                <div style={{ color: "#94a3b8" }}>// Attempting to fit 8,848m Everest & -10,984m Mariana into smooth formula:</div>
                <div style={{ color: "#f87171" }}>ERROR: f(x, y, z) = ∫∫∫ Irregular_Mesh(v_1...v_∞) dV ➔ UNDEFINED</div>
                <div style={{ color: "#facc15" }}>CPU_USAGE: 100% (All 128 Threads Maxed Out)</div>
                <div style={{ color: "#ef4444", fontWeight: 700 }}>GPU_TEMP: 108°C [THERMAL THROTTLING ALERT]</div>
                <div style={{ color: "#ef4444", fontWeight: 700, marginTop: 12 }}>
                  [FATAL KERNEL PANIC]: HARDWARE OVERHEATING! SMELL OF BURNING SILICON DETECTED!
                </div>
              </div>

              {/* Bottom Alert Bar */}
              <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", padding: "16px 20px", borderRadius: 8, color: "#fca5a5", fontFamily: SERIF_STACK, fontSize: 20, fontWeight: 700 }}>
                💥 无法用单一数学公式精确描述地表全部凹凸！
              </div>
            </div>

            {/* Right Bespoke Animated Vector Fire Component */}
            <div
              style={{
                position: "relative",
                background: "#080c09",
                border: "2px solid rgba(239, 68, 68, 0.5)",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <AnimatedFireGraphic />

              {/* Center Warning Symbol */}
              <div style={{ position: "relative", zIndex: 10, fontSize: 68 }}>
                🚨
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  fontFamily: SERIF_STACK,
                  fontSize: 28,
                  fontWeight: 900,
                  color: "#fef2f2",
                  textAlign: "center",
                  marginTop: 12,
                  textShadow: "0 4px 12px rgba(0,0,0,0.9)",
                }}
              >
                闻到电脑的烧焦味了！🔥
                <br />
                <span style={{ fontSize: 20, color: "#fca5a5", fontWeight: 700 }}>算力崩溃 (COMPUTE CRASH)</span>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BEAT 3: THE 3-STAGE APPROXIMATION (54.1s - 66.4s) ==================== */}
      {frame >= 730 && frame < 1103 && (
        <AbsoluteFill style={{ opacity: sec3 }}>
          {/* Header */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 90,
              opacity: interpolate(s3Header, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s3Header, [0, 1], [40, 0])}px)`,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 20, color: "#315f6d", fontWeight: 700, marginBottom: 12 }}>
              03 • 测绘学经典解决方案 (THE GEODESIC SOLUTION)
            </div>
            <div style={{ fontSize: 60, fontWeight: 700, color: "#26332e", lineHeight: 1.15, whiteSpace: "nowrap" }}>
              既然没法用数学表达真实的地球，
              <span style={{ color: "#315f6d", margin: "0 10px" }}>学者们就进行了简化──</span>
            </div>
            <div style={{ fontSize: 24, color: "#4f745d", fontWeight: 700, marginTop: 10, whiteSpace: "nowrap" }}>
              使其能够用数学表达，我们称之为：【地球的三级逼近】📐
            </div>
          </div>

          {/* 3-Stage Roadmap Cards Grid */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 265,
              width: 1640,
              height: 660,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 32,
            }}
          >
            {/* Stage 1 Card */}
            <div
              style={{
                background: "rgba(255, 253, 246, 0.95)",
                border: "2px solid rgba(79, 116, 93, 0.4)",
                borderRadius: 14,
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 20px 60px rgba(50, 80, 60, 0.12)",
                transform: `translateY(${interpolate(card1, [0, 1], [60, 0])}px)`,
                opacity: interpolate(card1, [0, 1], [0, 1]),
              }}
            >
              <div>
                <div style={{ background: "#4f745d", color: "#fff", padding: "6px 16px", borderRadius: 20, fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700, display: "inline-block", marginBottom: 20 }}>
                  STAGE 01 • 一级逼近
                </div>
                <div style={{ fontSize: 38, fontWeight: 700, color: "#2d4b3d", fontFamily: SERIF_STACK }}>
                  大地水准面
                  <br />
                  <span style={{ fontSize: 22, color: "#4f745d" }}>(Geoid)</span>
                </div>
                <div style={{ fontSize: 22, color: "#555", marginTop: 20, lineHeight: 1.6, fontFamily: SERIF_STACK }}>
                  基于重力等潜面 (Equipotential Surface)，剔除潮汐与风暴影响，定义真实海拔起算面。
                </div>
              </div>

              <div style={{ background: "rgba(79, 116, 93, 0.1)", padding: "14px 18px", borderRadius: 8, color: "#2d4b3d", fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700 }}>
                📌 核心作用: 定义物理绝对高程 (Elevation)
              </div>
            </div>

            {/* Stage 2 Card */}
            <div
              style={{
                background: "rgba(255, 253, 246, 0.95)",
                border: "2px solid rgba(49, 95, 109, 0.4)",
                borderRadius: 14,
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 20px 60px rgba(49, 95, 109, 0.12)",
                transform: `translateY(${interpolate(card2, [0, 1], [60, 0])}px)`,
                opacity: interpolate(card2, [0, 1], [0, 1]),
              }}
            >
              <div>
                <div style={{ background: "#315f6d", color: "#fff", padding: "6px 16px", borderRadius: 20, fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700, display: "inline-block", marginBottom: 20 }}>
                  STAGE 02 • 二级逼近
                </div>
                <div style={{ fontSize: 38, fontWeight: 700, color: "#1e3a43", fontFamily: SERIF_STACK }}>
                  旋转椭球体
                  <br />
                  <span style={{ fontSize: 22, color: "#315f6d" }}>(Ellipsoid)</span>
                </div>
                <div style={{ fontSize: 22, color: "#555", marginTop: 20, lineHeight: 1.6, fontFamily: SERIF_STACK }}>
                  用规则的旋转椭球公式近似代表地球形状，使球面能够用严密的数学公式推导。
                </div>
              </div>

              <div style={{ background: "rgba(49, 95, 109, 0.1)", padding: "14px 18px", borderRadius: 8, color: "#1e3a43", fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700 }}>
                📐 核心作用: 用数学公式推导经纬度 (Lat/Lon)
              </div>
            </div>

            {/* Stage 3 Card */}
            <div
              style={{
                background: "rgba(255, 253, 246, 0.95)",
                border: "2px solid rgba(167, 119, 72, 0.4)",
                borderRadius: 14,
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 20px 60px rgba(167, 119, 72, 0.12)",
                transform: `translateY(${interpolate(card3, [0, 1], [60, 0])}px)`,
                opacity: interpolate(card3, [0, 1], [0, 1]),
              }}
            >
              <div>
                <div style={{ background: "#a77748", color: "#fff", padding: "6px 16px", borderRadius: 20, fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700, display: "inline-block", marginBottom: 20 }}>
                  STAGE 03 • 三级逼近
                </div>
                <div style={{ fontSize: 38, fontWeight: 700, color: "#5c3f25", fontFamily: SERIF_STACK }}>
                  参考椭球体 / Datum
                  <br />
                  <span style={{ fontSize: 22, color: "#a77748" }}>(CGCS2000 / WGS84)</span>
                </div>
                <div style={{ fontSize: 22, color: "#555", marginTop: 20, lineHeight: 1.6, fontFamily: SERIF_STACK }}>
                  将旋转椭球体精确定位与平移，使之最佳贴合具体国家或区域的真实地表！
                </div>
              </div>

              <div style={{ background: "rgba(167, 119, 72, 0.1)", padding: "14px 18px", borderRadius: 8, color: "#5c3f25", fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700 }}>
                🌐 核心作用: 落地国家/区域坐标系 (Datums)
              </div>
            </div>

            {/* Bottom Connecting Golden Line */}
            <div
              style={{
                gridColumn: "1 / -1",
                height: 5,
                width: interpolate(roadmapUnderline, [0, 1], [0, 1580]),
                background: "linear-gradient(90deg, #4f745d, #315f6d, #a77748)",
                margin: "10px auto 0",
                borderRadius: 3,
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
