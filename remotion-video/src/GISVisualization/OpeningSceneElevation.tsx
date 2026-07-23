import React, { useMemo } from "react";
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
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const fade = (frame: number, start: number, end: number, fadeIn = 14, fadeOut = 16) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);

const softStep = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing: ease });

// Paper Background with subtle geodetic grid lines & smooth drift
export const PaperBackground: React.FC<{ tone?: "light" | "warm" }> = ({ tone = "light" }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(Math.sin(frame / 90), [-1, 1], [-10, 10]);

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
        <path d="M96 282 C 352 194, 604 372, 884 282 S 1388 96, 1940 250" fill="none" stroke="#426b80" strokeWidth="1.5" />
        <path d="M1380 980 C 1478 810, 1656 762, 1848 826" fill="none" stroke="#a98452" strokeWidth="2" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 14%, rgba(196, 143, 72, 0.18), transparent 26%), radial-gradient(circle at 82% 22%, rgba(59, 105, 121, 0.12), transparent 24%), radial-gradient(circle at 74% 86%, rgba(93, 120, 89, 0.15), transparent 30%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Bespoke 3D Geodetic Globe Component
const GeodeticGlobe: React.FC<{ size?: number; scale?: number }> = ({ size = 440, scale = 1 }) => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.45;
  const pulse = Math.sin(frame * 0.08) * 4;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `scale(${scale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer Geodetic Equatorial Ring */}
      <div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: "50%",
          border: "1.5px dashed rgba(49, 95, 109, 0.35)",
          transform: `rotate(${rotation * 0.5}deg)`,
        }}
      />

      {/* Outer Orbit Ring 2 */}
      <div
        style={{
          position: "absolute",
          inset: -60,
          borderRadius: "50%",
          border: "1px solid rgba(167, 119, 72, 0.25)",
          transform: `rotate(${-rotation * 0.3}deg)`,
        }}
      />

      {/* Main 3D Sphere Body */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        style={{ filter: "drop-shadow(0 22px 55px rgba(35, 65, 75, 0.25))" }}
      >
        <defs>
          <radialGradient id="globeGrad" cx="32%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#4f7988" />
            <stop offset="50%" stopColor="#2c4d59" />
            <stop offset="100%" stopColor="#172b33" />
          </radialGradient>

          <clipPath id="globeClip">
            <circle cx="200" cy="200" r="185" />
          </clipPath>
        </defs>

        <circle cx="200" cy="200" r="185" fill="url(#globeGrad)" stroke="#4f745d" strokeWidth="3" />

        <g clipPath="url(#globeClip)">
          {/* Latitudes */}
          {[-120, -60, 0, 60, 120].map((yOffset) => (
            <ellipse
              key={yOffset}
              cx="200"
              cy={200 + yOffset}
              rx="182"
              ry={Math.max(10, 50 - Math.abs(yOffset) * 0.25)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          ))}

          {/* Dynamic Rotating Longitudes */}
          {[0, 45, 90, 135].map((angle) => {
            const currentAngle = (angle + rotation) % 180;
            const rx = Math.sin((currentAngle * Math.PI) / 180) * 182;
            return (
              <ellipse
                key={angle}
                cx="200"
                cy="200"
                rx={Math.max(2, Math.abs(rx))}
                ry="182"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Continents / Terrain Outlines Vector */}
          <path
            d="M 120 140 Q 170 120 230 150 T 290 190 Q 240 260 180 250 T 100 200 Z"
            fill="rgba(79, 116, 93, 0.35)"
            stroke="rgba(167, 119, 72, 0.6)"
            strokeWidth="2"
          />
          <path
            d="M 220 280 Q 270 270 310 310 T 260 360 Q 210 340 200 300 Z"
            fill="rgba(79, 116, 93, 0.3)"
            stroke="rgba(167, 119, 72, 0.5)"
            strokeWidth="2"
          />

          {/* Glowing Coordinate Target Ping */}
          <circle cx="230" cy="160" r={8 + pulse * 0.5} fill="none" stroke="#facc15" strokeWidth="2" />
          <circle cx="230" cy="160" r="4" fill="#facc15" />
          <line x1="215" y1="160" x2="245" y2="160" stroke="#facc15" strokeWidth="1.5" />
          <line x1="230" y1="145" x2="230" y2="175" stroke="#facc15" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Floating Coordinate Badge */}
      <div
        style={{
          position: "absolute",
          top: 35,
          right: -50,
          background: "rgba(255, 252, 246, 0.96)",
          border: "1.5px solid rgba(49, 95, 109, 0.4)",
          borderRadius: 8,
          padding: "10px 20px",
          boxShadow: "0 14px 35px rgba(0,0,0,0.12)",
          fontFamily: SERIF_STACK,
          fontSize: 18,
          color: "#315f6d",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        📍 纬度: 39.9042° N <br />
        &nbsp;&nbsp;&nbsp;经度: 116.4074° E
      </div>
    </div>
  );
};

const FloatingQuestionMark: React.FC<{ x: number; y: number; size: number; delay: number }> = ({
  x,
  y,
  size,
  delay,
}) => {
  const frame = useCurrentFrame();
  const appear = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 16, stiffness: 90 },
  });
  const rotate = interpolate(Math.sin((frame - delay) / 30), [-1, 1], [-8, 7]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: SERIF_STACK,
        fontSize: size,
        lineHeight: 1,
        color: "rgba(56, 75, 69, 0.14)",
        transform: `translate(-50%, -50%) scale(${interpolate(appear, [0, 1], [0.8, 1])}) rotate(${rotate}deg)`,
        opacity: interpolate(appear, [0, 1], [0, 1]),
        whiteSpace: "nowrap",
      }}
    >
      ?
    </div>
  );
};

const SeaCard: React.FC<{
  title: string;
  subtitle: string;
  highlight?: boolean;
  tag?: string;
  style?: React.CSSProperties;
}> = ({ title, subtitle, highlight = false, tag, style }) => (
  <div
    style={{
      padding: "28px 34px",
      borderRadius: 12,
      background: highlight ? "rgba(244, 250, 246, 0.96)" : "rgba(255, 252, 246, 0.88)",
      border: `2px solid ${highlight ? "rgba(79, 116, 93, 0.45)" : "rgba(67, 85, 75, 0.18)"}`,
      boxShadow: highlight ? "0 22px 65px rgba(50, 80, 60, 0.14)" : "0 12px 35px rgba(40, 40, 40, 0.06)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minWidth: 340,
      ...style,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontFamily: SERIF_STACK, fontSize: 18, color: highlight ? "#4f745d" : "#7c7c72", fontWeight: 700, whiteSpace: "nowrap" }}>
        高程基准面 (DATUM BENCHMARK)
      </span>
      {tag && (
        <span
          style={{
            fontFamily: SERIF_STACK,
            fontSize: 18,
            background: highlight ? "#4f745d" : "rgba(100,100,100,0.12)",
            color: highlight ? "#fff" : "#555",
            padding: "5px 14px",
            borderRadius: 16,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {tag}
        </span>
      )}
    </div>
    <div>
      <div
        style={{
          fontFamily: SERIF_STACK,
          fontSize: 38,
          lineHeight: 1.15,
          color: highlight ? "#2d4b3d" : "#3c403d",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>
      <div style={{ fontFamily: SERIF_STACK, fontSize: 22, color: "#6a706b", marginTop: 10, lineHeight: 1.5, whiteSpace: "nowrap" }}>
        {subtitle}
      </div>
    </div>
  </div>
);

export const OpeningSceneElevation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // 30

  // 5 Beats Crisp Motion Fades
  // Total 873 frames (29.1s)
  const sec1 = fade(frame, 0, 132);
  const sec2 = fade(frame, 126, 255);
  const sec3 = fade(frame, 248, 397);
  const sec4 = fade(frame, 390, 564);
  const sec5 = fade(frame, 558, 873, 16, 24);

  // Original Crisp Spring Motion (stiffness: 80, damping: 18)
  const titleSpring1 = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 80 } });
  const titleY1 = interpolate(titleSpring1, [0, 1], [40, 0]);
  const titleOpacity1 = interpolate(titleSpring1, [0, 1], [0, 1]);
  const globeScale = interpolate(
    spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 72 } }),
    [0, 1],
    [0.75, 1]
  );

  // Beat 2 Springs & Terrain scan
  const s2Progress = spring({ frame: frame - 123, fps, config: { damping: 20, stiffness: 80 } });
  const terrainScan = softStep(frame, 140, 230);
  const laserX = interpolate(terrainScan, [0, 1], [340, 1540]);

  // Beat 3 Springs (Sea Level)
  const s3Progress = spring({ frame: frame - 255, fps, config: { damping: 19, stiffness: 85 } });
  const waveOffset = Math.sin(frame * 0.1) * 8;
  const seaCard1 = spring({ frame: frame - 280, fps, config: { damping: 18, stiffness: 90 } });
  const seaCard2 = spring({ frame: frame - 305, fps, config: { damping: 18, stiffness: 90 } });

  // Beat 4 Springs (Textbook Secret)
  const s4Progress = spring({ frame: frame - 390, fps, config: { damping: 18, stiffness: 80 } });
  const stampSpring = spring({ frame: frame - 450, fps, config: { damping: 11, stiffness: 140 } });

  // Beat 5 Springs (Final Core Thesis)
  const s5Progress = spring({ frame: frame - 558, fps, config: { damping: 20, stiffness: 80 } });
  const finalUnderline = softStep(frame, 640, 720);

  const typedThesis = useMemo(() => {
    const text = "HOW TO DESCRIBE EARTH: GEOID & DATUMS";
    const count = Math.floor(interpolate(frame, [580, 650], [0, text.length], clamp));
    return text.slice(0, count);
  }, [frame]);

  return (
    <AbsoluteFill style={{ fontFamily: SERIF_STACK, color: "#29342f", overflow: "hidden" }}>
      <PaperBackground tone={frame > 558 ? "warm" : "light"} />

      {/* ==================== BEAT 1: UNIFIED QUESTION PART 1 (0.0s - 4.1s) ==================== */}
      {frame >= 0 && frame < 134 && (
        <AbsoluteFill style={{ opacity: sec1 }}>
          <FloatingQuestionMark x={220} y={220} size={190} delay={14} />
          <FloatingQuestionMark x={1680} y={760} size={280} delay={26} />
          <FloatingQuestionMark x={1550} y={220} size={120} delay={38} />

          {/* 3D Geodetic Globe */}
          <div style={{ position: "absolute", left: 200, top: 250 }}>
            <GeodeticGlobe size={460} scale={globeScale} />
          </div>

          {/* Hero Part 1 Sentence Text - Moderated Title Size 90px */}
          <div
            style={{
              position: "absolute",
              left: 820,
              top: 270,
              width: 960,
              opacity: titleOpacity1,
              transform: `translateY(${titleY1}px)`,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 22, color: "#5f7166", fontWeight: 700, marginBottom: 24, whiteSpace: "nowrap" }}>
              大地测量学核心问题 (THE GEODESY QUESTION)
            </div>
            <div style={{ fontSize: 90, lineHeight: 1.1, fontWeight: 700, letterSpacing: 0, whiteSpace: "nowrap" }}>
              你有没有想过，
              <br />
              我们在地图上看到的
              <br />
              <span style={{ color: "#315f6d" }}>经纬度坐标——</span>
            </div>
            <div
              style={{
                width: interpolate(titleSpring1, [0, 1], [0, 600]),
                height: 5,
                background: "linear-gradient(90deg, #a77748, #4f745d, transparent)",
                marginTop: 32,
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BEAT 2: UNIFIED QUESTION PART 2 - BUMPY EARTH (4.1s - 7.9s) ==================== */}
      {frame >= 126 && frame < 257 && (
        <AbsoluteFill style={{ opacity: sec2 }}>
          {/* Moderated Title Size 60px */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 105,
              fontSize: 60,
              lineHeight: 1.15,
              fontWeight: 700,
              color: "#26332e",
              whiteSpace: "nowrap",
              transform: `translateY(${interpolate(s2Progress, [0, 1], [40, 0])}px)`,
            }}
          >
            ——到底是怎么在
            <span style={{ color: "#9b5a42", margin: "0 12px" }}>【凹凸不平的地球上】</span>
            定出来的？
          </div>

          <div
            style={{
              position: "absolute",
              left: 142,
              top: 195,
              fontFamily: SERIF_STACK,
              fontSize: 24,
              color: "#6b7268",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            高山、深谷、重力异常——数学上的标准球体根本放不进去。
          </div>

          {/* Bumpy Earth Terrain Cutaway Diagram */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 260,
              width: 1640,
              height: 680,
              background: "rgba(255, 253, 247, 0.88)",
              border: "1.5px solid rgba(47, 55, 49, 0.18)",
              boxShadow: "0 30px 90px rgba(55, 48, 38, 0.13)",
              borderRadius: 14,
              overflow: "hidden",
              transform: `translateY(${interpolate(s2Progress, [0, 1], [60, 0])}px)`,
            }}
          >
            <svg viewBox="0 0 1640 680" style={{ width: "100%", height: "100%" }}>
              <defs>
                <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(40,60,50,0.06)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="1640" height="680" fill="url(#gridPattern)" />

              {/* Reference Smooth Ellipsoid Datum line */}
              <path
                d="M 100 460 Q 820 440 1540 460"
                fill="none"
                stroke="#315f6d"
                strokeWidth="3.5"
                strokeDasharray="8 6"
              />
              <text x="130" y="495" fill="#315f6d" fontFamily={SERIF_STACK} fontSize="20" fontWeight="bold">
                ─── 参考椭球面 (Mathematical Ellipsoid Surface)
              </text>

              {/* Irregular Terrain Profile */}
              <path
                d="M 100 460 C 250 460, 320 180, 480 180 C 600 180, 680 540, 840 540 C 980 540, 1100 280, 1260 280 C 1380 280, 1450 460, 1540 460 L 1540 640 L 100 640 Z"
                fill="rgba(79, 116, 93, 0.12)"
                stroke="#4f745d"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <text x="490" y="145" fill="#2d4b3d" fontFamily={SERIF_STACK} fontSize="26" fontWeight="bold">
                ▲ 珠穆朗玛峰 (+8848.86m)
              </text>
              <text x="800" y="585" fill="#8f4e3e" fontFamily={SERIF_STACK} fontSize="24" fontWeight="bold">
                ▼ 海洋深沟 (-10984m)
              </text>

              {/* Scan Laser Plumb Line */}
              <line x1={laserX} y1="100" x2={laserX} y2="580" stroke="#a77748" strokeWidth="3" strokeDasharray="5 5" />
              <circle cx={laserX} cy="460" r="8" fill="#a77748" />
            </svg>

            <div
              style={{
                position: "absolute",
                right: 50,
                top: 40,
                background: "rgba(155, 90, 66, 0.14)",
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
              ⚠️ 地表极度不规则 (IRREGULAR SURFACE)
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BEAT 3: ALTITUDE & SEA LEVEL (8.5s - 13.2s) ==================== */}
      {frame >= 248 && frame < 399 && (
        <AbsoluteFill style={{ opacity: sec3 }}>
          {/* Moderated Title Size 60px & Subtitle Question 44px */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 105,
              fontSize: 60,
              fontWeight: 700,
              color: "#26332e",
              whiteSpace: "nowrap",
              transform: `translateY(${interpolate(s3Progress, [0, 1], [40, 0])}px)`,
            }}
          >
            我们平常说的【海拔 / 海平面】
          </div>
          <div
            style={{
              position: "absolute",
              left: 142,
              top: 190,
              fontSize: 44,
              fontFamily: SERIF_STACK,
              color: "#315f6d",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            说的到底是哪个海？🌊
          </div>

          <div
            style={{
              position: "absolute",
              left: 140,
              top: 270,
              width: 1640,
              height: 660,
              display: "grid",
              gridTemplateColumns: "1fr 540px",
              gap: 40,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 26, justifyContent: "center" }}>
              <SeaCard
                title="青岛验潮站 (黄海)"
                subtitle="1985国家高程基准 • 我国绝大多数海拔测量的起点"
                highlight={true}
                tag="国家标准基准"
                style={{
                  transform: `translateX(${interpolate(seaCard1, [0, 1], [-60, 0])}px)`,
                  opacity: interpolate(seaCard1, [0, 1], [0, 1]),
                }}
              />
              <SeaCard
                title="理论深度基准面 / 东海 / 南海"
                subtitle="不同海域水面受潮汐、风暴影响，各不相同"
                highlight={false}
                tag="地方/航海基准"
                style={{
                  transform: `translateX(${interpolate(seaCard2, [0, 1], [-60, 0])}px)`,
                  opacity: interpolate(seaCard2, [0, 1], [0, 1]),
                }}
              />
            </div>

            <div
              style={{
                position: "relative",
                background: "rgba(255, 252, 246, 0.94)",
                border: "1.5px solid rgba(49, 95, 109, 0.28)",
                borderRadius: 14,
                boxShadow: "0 28px 80px rgba(49, 95, 109, 0.12)",
                padding: "36px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", fontFamily: SERIF_STACK, fontSize: 18, color: "#315f6d", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>
                验潮站与平均海平面 (TIDE GAUGE)
              </div>

              {/* Bespoke Tide Benchmark Pillar Icon */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "16px 0" }}>
                <div style={{ fontSize: 80 }}>📍</div>
                <div style={{ fontFamily: SERIF_STACK, fontSize: 18, color: "#4f745d", fontWeight: 700, marginTop: 6 }}>
                  1985 国家高程基准标石
                </div>
              </div>

              <div
                style={{
                  fontFamily: SERIF_STACK,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#2d4b3d",
                  textAlign: "center",
                  lineHeight: 1.35,
                  whiteSpace: "nowrap",
                }}
              >
                海水时刻在起伏，
                <br />
                必须长期观测求出“平均水面”！
              </div>

              <div style={{ width: "100%", height: 120, position: "relative" }}>
                <svg viewBox="0 0 520 120" style={{ width: "100%", height: "100%" }}>
                  <path
                    d={`M 0 ${60 + waveOffset} Q 130 ${30 + waveOffset} 260 ${60 + waveOffset} T 520 ${60 + waveOffset}`}
                    fill="none"
                    stroke="#426b80"
                    strokeWidth="3.5"
                    opacity="0.75"
                  />
                  <line x1="0" y1="60" x2="520" y2="60" stroke="#4f745d" strokeWidth="3" strokeDasharray="6 4" />
                  <text x="10" y="48" fill="#4f745d" fontFamily={SERIF_STACK} fontSize="18" fontWeight="bold">
                    ── 零高程基准面 (H = 0.000m)
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BEAT 4: TEXTBOOK SECRET (13.2s - 18.8s) ==================== */}
      {frame >= 390 && frame < 566 && (
        <AbsoluteFill style={{ opacity: sec4 }}>
          {/* Moderated Title Size 62px */}
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 105,
              fontSize: 62,
              lineHeight: 1.15,
              fontWeight: 700,
              color: "#26332e",
              whiteSpace: "nowrap",
              transform: `translateY(${interpolate(s4Progress, [0, 1], [50, 0])}px)`,
            }}
          >
            以及中学地理学过的经纬度，
            <br />
            背后还有什么<span style={{ color: "#8f4e3e" }}>秘密呢？</span>
          </div>

          <div
            style={{
              position: "absolute",
              left: 140,
              top: 270,
              width: 1640,
              height: 640,
              background: "#1e3025",
              border: "12px solid #5c3f25",
              borderRadius: 14,
              boxShadow: "0 34px 90px rgba(27, 44, 35, 0.28), inset 0 0 50px rgba(0,0,0,0.6)",
              padding: "44px 54px",
              boxSizing: "border-box",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              transform: `scale(${interpolate(s4Progress, [0, 1], [0.88, 1])})`,
            }}
          >
            <div style={{ borderRight: "1px dashed rgba(255,255,255,0.2)", strokeDasharray: "8 8", paddingRight: 40, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "#facc15", fontFamily: SERIF_STACK, fontSize: 22, fontWeight: 700, whiteSpace: "nowrap" }}>
                📖 中学课本的简化概念
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 48, fontWeight: 700, fontFamily: SERIF_STACK, whiteSpace: "nowrap" }}>
                  完美正球体
                </div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 22, marginTop: 16, lineHeight: 1.6, fontFamily: SERIF_STACK }}>
                  认为地球是一个半径为 6371km 的完美圆球，经纬度只是球面角度。
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "16px 22px", borderRadius: 8, color: "#a7f3d0", fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700, whiteSpace: "nowrap" }}>
                计算公式: R = 6371 km (Spherical Model)
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ color: "#60a5fa", fontFamily: SERIF_STACK, fontSize: 22, fontWeight: 700, whiteSpace: "nowrap" }}>
                🌐 真实测量学与 GIS
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 48, fontWeight: 700, fontFamily: SERIF_STACK, whiteSpace: "nowrap" }}>
                  大地水准面 + 椭球体
                </div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 22, marginTop: 16, lineHeight: 1.6, fontFamily: SERIF_STACK }}>
                  基于重力等潜面 (Geoid) 定义高程，基于旋转椭球体 (Ellipsoid) 计算经纬度！
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "16px 22px", borderRadius: 8, color: "#93c5fd", fontFamily: SERIF_STACK, fontSize: 18, fontWeight: 700, whiteSpace: "nowrap" }}>
                坐标基准: CGCS2000 / WGS84 / Datum Shift
              </div>
            </div>

            {frame >= 450 && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  border: "6px double #ef4444",
                  color: "#ef4444",
                  fontFamily: SERIF_STACK,
                  fontSize: 58,
                  fontWeight: 900,
                  padding: "18px 48px",
                  borderRadius: 16,
                  background: "#fffaf5",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
                  zIndex: 20,
                  whiteSpace: "nowrap",
                  transform: `translate(-50%, -50%) rotate(-12deg) scale(${interpolate(stampSpring, [0, 1], [3, 1])})`,
                  opacity: interpolate(stampSpring, [0, 1], [0, 1]),
                }}
              >
                教科书没讲的底层秘密 📜
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* ==================== BEAT 5: CORE THESIS (18.8s - 29.1s) ==================== */}
      {frame >= 558 && frame < 873 && (
        <AbsoluteFill style={{ opacity: sec5 }}>
          {/* Moderated Top Title 76px & Main Core Title 74px */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 140,
              transform: `translate(-50%, ${interpolate(s5Progress, [0, 1], [40, 0])}px)`,
              textAlign: "center",
              width: 1600,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 20, color: "#315f6d", fontWeight: 700, marginBottom: 20, height: 28, whiteSpace: "nowrap" }}>
              {typedThesis}
            </div>
            <div style={{ fontSize: 76, lineHeight: 1.12, fontWeight: 700, whiteSpace: "nowrap" }}>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 360,
              transform: `translateX(-50%) scale(${interpolate(s5Progress, [0, 1], [0.9, 1])})`,
              textAlign: "center",
              width: 1500,
              padding: "48px 60px",
              background: "rgba(255, 253, 246, 0.95)",
              border: "1.5px solid rgba(79, 116, 93, 0.35)",
              borderRadius: 18,
              boxShadow: "0 30px 100px rgba(50, 80, 60, 0.16)",
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 20, color: "#4f745d", letterSpacing: 2, fontWeight: 700, marginBottom: 18, whiteSpace: "nowrap" }}>
              GIS & 测量学最底层核心命题
            </div>
            <div style={{ fontSize: 74, fontWeight: 700, color: "#26332e", lineHeight: 1.15, whiteSpace: "nowrap" }}>
              我们到底要
              <span style={{ color: "#315f6d", margin: "0 18px" }}>如何描述地球？</span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 38 }}>
              {["大地水准面 (Geoid)", "参考椭球体 (Ellipsoid)", "高程基准面 (Datum)"].map((tag) => (
                <div
                  key={tag}
                  style={{
                    background: "rgba(79, 116, 93, 0.14)",
                    border: "1.5px solid rgba(79, 116, 93, 0.35)",
                    color: "#2d4b3d",
                    padding: "12px 26px",
                    borderRadius: 36,
                    fontFamily: SERIF_STACK,
                    fontSize: 20,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            <div
              style={{
                height: 5,
                width: interpolate(finalUnderline, [0, 1], [0, 960]),
                background: "linear-gradient(90deg, transparent, #a77748, #4f745d, transparent)",
                margin: "36px auto 0",
                borderRadius: 3,
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
