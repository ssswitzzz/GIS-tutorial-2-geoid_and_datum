import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import katex from "katex";
import "katex/dist/katex.min.css";
import { PaperBackground } from "./OpeningSceneElevation";

const SERIF = "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing: ease });

const fade = (frame: number, from: number, to: number, edge = 16) =>
  interpolate(frame, [from, from + edge, to - edge, to], [0, 1, 1, 0], clamp);

const inSpring = (frame: number, from: number, fps: number, damping = 18, stiffness = 100) =>
  spring({ frame: Math.max(0, frame - from), fps, config: { damping, stiffness } });

const Latex: React.FC<{ math: string; style?: React.CSSProperties }> = ({ math, style }) => {
  const html = useMemo(() => katex.renderToString(math, { throwOnError: false }), [math]);
  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};

// -----------------------------------------------------------------------------
// Precision Double-Headed Dimension Arrow Component (\updownarrow)
// -----------------------------------------------------------------------------
const DoubleArrowLine: React.FC<{
  x: number;
  y1: number; // Top Y coordinate
  y2: number; // Bottom Y coordinate
  color: string;
  strokeWidth?: number;
  arrowSize?: number;
  opacity?: number;
}> = ({ x, y1, y2, color, strokeWidth = 3, arrowSize = 9, opacity = 1 }) => {
  const topY = Math.min(y1, y2);
  const bottomY = Math.max(y1, y2);
  const len = bottomY - topY;

  if (len <= 4 || opacity <= 0.01) return null;

  return (
    <g opacity={opacity}>
      {/* Vertical Connecting Stem Line */}
      <line x1={x} y1={topY + arrowSize} x2={x} y2={bottomY - arrowSize} stroke={color} strokeWidth={strokeWidth} />

      {/* Top Arrowhead Pointing UPWARD (▲) */}
      <polygon
        points={`${x},${topY} ${x - arrowSize * 0.75},${topY + arrowSize * 1.35} ${x + arrowSize * 0.75},${topY + arrowSize * 1.35}`}
        fill={color}
      />

      {/* Bottom Arrowhead Pointing DOWNWARD (▼) */}
      <polygon
        points={`${x},${bottomY} ${x - arrowSize * 0.75},${bottomY - arrowSize * 1.35} ${x + arrowSize * 0.75},${bottomY - arrowSize * 1.35}`}
        fill={color}
      />
    </g>
  );
};

const Header: React.FC<{ index: string; title: string; color?: string }> = ({ index, title, color = "#315f6d" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = inSpring(frame, 0, fps);
  return (
    <div
      style={{
        position: "absolute",
        left: 104,
        top: 55,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [-18, 0])}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          border: `1px solid ${color}66`,
          borderRadius: 5,
          background: "rgba(255,253,246,.85)",
          color,
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 1,
          boxShadow: "0 4px 14px rgba(41,52,47,.06)",
        }}
      >
        {index}
      </div>
      <div style={{ width: 36, height: 1.5, background: color }} />
      <div style={{ fontFamily: SERIF, color: "#29342f", fontSize: 28, fontWeight: 700, whiteSpace: "nowrap" }}>
        {title}
      </div>
    </div>
  );
};

const Tag: React.FC<{ x: number; y: number; color: string; p: number; children: React.ReactNode; bg?: string }> = ({
  x,
  y,
  color,
  p,
  children,
  bg = "rgba(255,253,246,.96)",
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      zIndex: 10,
      opacity: p,
      transform: `translateY(${interpolate(p, [0, 1], [15, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
      padding: "8px 15px",
      borderRadius: 6,
      background: bg,
      border: `1.5px solid ${color}77`,
      boxShadow: "0 8px 24px rgba(41,52,47,.1)",
      color,
      fontFamily: SERIF,
      fontSize: 19,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

// -----------------------------------------------------------------------------
// Scene 1: From 2D (L, B) on Ellipsoid to 3D (L, B, h) Spatial Point
// -----------------------------------------------------------------------------
const CoordinateLift: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textIn = inSpring(frame, 10, fps);
  const rise = ramp(frame, 130, 220);
  const height = interpolate(rise, [0, 1], [0, 195]);

  const tokens = [
    { k: "L", label: "大地经度", sub: "确定东西角度", color: "#a77748", from: 35 },
    { k: "B", label: "大地纬度", sub: "确定南北角度", color: "#315f6d", from: 65 },
    { k: "h", label: "大地高", sub: "沿法线向外延伸", color: "#4f745d", from: 150 },
  ];

  const cx = 1220;
  const cy = 650;
  const rx = 440;
  const ry = 350;

  const t0 = 0.32;
  const p0x = (1 - t0) ** 2 * cx + 2 * (1 - t0) * t0 * (cx + 220) + t0 ** 2 * cx;
  const p0y = (1 - t0) ** 2 * (cy - ry) + 2 * (1 - t0) * t0 * cy + t0 ** 2 * (cy + ry); // 542.0

  const normDx = 0.9298;
  const normDy = -0.3682;

  const px = p0x + height * normDx;
  const py = p0y + height * normDy;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04.4" title="从二维位置到三维定位" color="#315f6d" />

      {/* Left Info Panel */}
      <div style={{ position: "absolute", left: 120, top: 165, width: 500, opacity: textIn }}>
        <div style={{ fontFamily: SERIF, fontSize: 54, fontWeight: 700, lineHeight: 1.18, color: "#29342f" }}>
          仅有经纬度<br />
          只能落在<span style={{ color: "#315f6d" }}>椭球面上</span>
        </div>
        <div style={{ width: 280, height: 2, background: "#315f6d44", margin: "22px 0" }} />
        <div style={{ fontFamily: SERIF, fontSize: 21, color: "#5d6964", lineHeight: 1.7 }}>
          经度 <Latex math="L" /> 与纬度 <Latex math="B" /> 在曲面上唯一确定一个<b>二维点</b>。<br />
          若要在三维空间中定位，必须加上第三要素：<br />
          沿法线延伸的<b>大地高 <Latex math="h" /></b>。
        </div>
      </div>

      {/* 3D Visual Diagram */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="ell3d" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#e2eeea" />
            <stop offset="60%" stopColor="#9bbcb2" />
            <stop offset="100%" stopColor="#436c61" />
          </radialGradient>
        </defs>

        <ellipse cx={cx} cy={cy + 45} rx={rx + 20} ry={ry + 10} fill="rgba(41,52,47,.08)" filter="blur(16px)" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#ell3d)" stroke="#315f6d" strokeWidth="4" />

        <ellipse cx={cx} cy={cy} rx={rx} ry={ry * 0.42} fill="none" stroke="#fffdf6" strokeWidth="2.5" strokeDasharray="10 7" strokeOpacity="0.85" />
        <ellipse cx={cx} cy={cy - 70} rx={rx * 0.86} ry={ry * 0.36} fill="none" stroke="#315f6d" strokeWidth="2" strokeDasharray="6 5" strokeOpacity="0.6" />
        <ellipse cx={cx} cy={cy + 70} rx={rx * 0.86} ry={ry * 0.36} fill="none" stroke="#fffdf6" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.4" />

        <path d={`M ${cx} ${cy - ry} Q ${cx - 240} ${cy} ${cx} ${cy + ry}`} fill="none" stroke="#fffdf6" strokeWidth="2" strokeDasharray="8 6" strokeOpacity="0.7" />
        <path d={`M ${cx} ${cy - ry} Q ${cx + 220} ${cy} ${cx} ${cy + ry}`} fill="none" stroke="#a77748" strokeWidth="3.5" strokeDasharray="9 6" />

        <path d={`M ${cx - rx * 0.86} ${p0y} Q ${cx} ${p0y + 40} ${cx + rx * 0.86} ${p0y}`} fill="none" stroke="#315f6d" strokeWidth="3" opacity="0.85" />

        <line
          x1={p0x}
          y1={p0y}
          x2={p0x + 260 * normDx}
          y2={p0y + 260 * normDy}
          stroke="#4f745d"
          strokeWidth="3.5"
          strokeDasharray="8 6"
          opacity={ramp(frame, 80, 120)}
        />

        {height > 2 && (
          <line
            x1={p0x}
            y1={p0y}
            x2={px}
            y2={py}
            stroke="#a77748"
            strokeWidth="5"
          />
        )}

        <circle cx={p0x} cy={p0y} r="8" fill="#a77748" stroke="#fffdf6" strokeWidth="3" />

        {rise > 0.02 && (
          <g transform={`translate(${px}, ${py})`}>
            <circle cx="0" cy="0" r="12" fill="#f6d47f" stroke="#fffdf6" strokeWidth="4" />
            <circle cx="0" cy="0" r={22 + Math.sin(frame / 6) * 3} fill="none" stroke="#a77748" strokeWidth="2" opacity="0.8" />
          </g>
        )}
      </svg>

      <Tag x={p0x + 25} y={p0y + 15} color="#315f6d" p={ramp(frame, 50, 90)}>
        曲面点 <Latex math="P_0 (L, B)" />
      </Tag>

      {rise > 0.1 && (
        <Tag x={px + 25} y={py - 25} color="#4f745d" p={rise}>
          空间点 <Latex math="P (L, B, h)" />
        </Tag>
      )}

      <div style={{ position: "absolute", left: 120, bottom: 85, display: "flex", gap: 20 }}>
        {tokens.map((t) => {
          const p = inSpring(frame, t.from, fps);
          const isH = t.k === "h";
          return (
            <div
              key={t.k}
              style={{
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px) scale(${isH && rise > 0.5 ? 1.05 : 1})`,
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
                borderRadius: 8,
                background: isH && rise > 0.5 ? "rgba(255, 253, 246, 0.98)" : "rgba(255,253,246,.92)",
                border: isH && rise > 0.5 ? `2px solid ${t.color}` : `1.5px solid ${t.color}66`,
                boxShadow: isH && rise > 0.5 ? `0 14px 36px ${t.color}33` : "0 10px 26px rgba(41,52,47,.08)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 34, color: t.color, fontWeight: 700 }}>
                <Latex math={t.k} />
              </div>
              <div>
                <div style={{ fontFamily: SERIF, color: "#29342f", fontSize: 21, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {t.label}
                </div>
                <div style={{ fontFamily: SERIF, color: "#5d6964", fontSize: 14, marginTop: 2 }}>{t.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Scene 2: Definition of Geodetic Height (h) along Ellipsoid Normal
// -----------------------------------------------------------------------------
const HeightDefinition: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = inSpring(frame, 400, fps);
  const normalIn = ramp(frame, 430, 480);
  const distIn = ramp(frame, 490, 560);

  const normalX = 960;
  const groundY = 440;
  const ellipsoidY = 720;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04.5" title="大地高的几何定义" color="#a77748" />

      {/* Top Title & Explanation */}
      <div style={{ position: "absolute", left: 120, top: 135, opacity: titleIn }}>
        <div style={{ fontFamily: SERIF, fontSize: 50, fontWeight: 700, lineHeight: 1.18, color: "#29342f" }}>
          地面点<span style={{ color: "#a77748" }}>沿着法线方向</span><br />
          到旋转椭球面的距离
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 20, color: "#5d6964", marginTop: 12, lineHeight: 1.55 }}>
          大地高 <Latex math="h" /> 以<b>旋转椭球面</b>为基准面，基准方向严格取椭球面的<b>法线方向</b>。
        </div>
      </div>

      {/* SVG Geometric Cross Section Diagram */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="groundGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#b4cbbf" />
            <stop offset="100%" stopColor="#698b76" />
          </linearGradient>
        </defs>

        {/* Ground Terrain Block */}
        <path
          d="M 180 520 C 350 480 450 410 620 440 C 760 465 850 450 960 440 C 1100 430 1250 390 1400 430 C 1550 470 1660 450 1740 490 L 1740 900 L 180 900 Z"
          fill="url(#groundGrad)"
          opacity="0.8"
        />

        {/* Top Terrain Surface Contour */}
        <path
          d="M 180 520 C 350 480 450 410 620 440 C 760 465 850 450 960 440 C 1100 430 1250 390 1400 430 C 1550 470 1660 450 1740 490"
          fill="none"
          stroke="#4f745d"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Ellipsoid Surface Arc */}
        <path
          d="M 180 810 Q 960 630 1740 810"
          fill="none"
          stroke="#315f6d"
          strokeWidth="4.5"
          strokeDasharray="12 8"
        />

        {/* Ellipsoid Normal Line */}
        <line
          x1={normalX}
          y1="360"
          x2={normalX}
          y2="810"
          stroke="#4f745d"
          strokeWidth="3.5"
          opacity={normalIn}
        />

        {/* Surface Point Pe on Ellipsoid (960, 720) */}
        <circle cx={normalX} cy={ellipsoidY} r="7" fill="#315f6d" stroke="#fffdf6" strokeWidth="2.5" opacity={normalIn} />

        {/* Precision Double-Headed Dimension Arrow for Geodetic Height h (\updownarrow) */}
        <DoubleArrowLine
          x={normalX + 45}
          y1={groundY}
          y2={ellipsoidY}
          color="#a77748"
          strokeWidth={4.5}
          arrowSize={11}
          opacity={distIn}
        />

        {/* Ground Point P Dot at (960, 440) */}
        <circle cx={normalX} cy={groundY} r="10" fill="#f6d47f" stroke="#fffdf6" strokeWidth="3.5" />
        <circle cx={normalX} cy={groundY} r={19 + Math.sin(frame / 6) * 3} fill="none" stroke="#a77748" strokeWidth="2" opacity="0.8" />
      </svg>

      {/* Floating Labels */}
      <Tag x={normalX - 170} y={groundY - 25} color="#a77748" p={ramp(frame, 410, 450)}>
        地面点 <Latex math="P" />
      </Tag>

      <Tag x={1380} y={765} color="#315f6d" p={ramp(frame, 420, 460)}>
        旋转椭球面 <Latex math="S_{\mathrm{ellipsoid}}" />
      </Tag>

      <Tag x={normalX - 160} y={520} color="#4f745d" p={normalIn}>
        椭球法线
      </Tag>

      {distIn > 0.05 && (
        <div
          style={{
            position: "absolute",
            left: normalX + 80,
            top: (groundY + ellipsoidY) / 2 - 40,
            opacity: distIn,
            transform: `translateX(${interpolate(distIn, [0, 1], [-15, 0])}px)`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 24px",
            background: "rgba(255,253,246,.96)",
            border: "2px solid #a77748",
            borderRadius: 8,
            boxShadow: "0 12px 32px rgba(167,119,72,.18)",
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 44, color: "#a77748", fontWeight: 700 }}>
            <Latex math="h" />
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 25, color: "#29342f", fontWeight: 700 }}>
              大地高
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: "#a77748", marginTop: 2 }}>
              基准：旋转椭球面
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Scene 3: Comparison between Altitude H (Geoid) and Geodetic Height h (Ellipsoid)
// -----------------------------------------------------------------------------
const HeightComparison: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = inSpring(frame, 790, fps);
  const geoidIn = ramp(frame, 820, 870);
  const measureIn = ramp(frame, 880, 960);
  const formulaIn = ramp(frame, 1050, 1140);

  const normalX = 960;
  const groundY = 420;
  const geoidY = 570;
  const ellipsoidY = 720;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04.5" title="海拔与大地高的对比" color="#8f4e3e" />

      {/* Title */}
      <div style={{ position: "absolute", left: 120, top: 135, opacity: titleIn }}>
        <div style={{ fontFamily: SERIF, fontSize: 50, fontWeight: 700, lineHeight: 1.18, color: "#29342f" }}>
          海拔与大地高：<span style={{ color: "#8f4e3e" }}>不是同一把尺子</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 20, color: "#5d6964", marginTop: 12, lineHeight: 1.55 }}>
          施工与地图所说的<b>海拔 <Latex math="H" /></b> 基于凹凸不平的大地水准面；<br />
          GPS 卫星测出的<b>大地高 <Latex math="h" /></b> 则基于规则的旋转椭球面。
        </div>
      </div>

      {/* SVG Diagram with 3 Surfaces & Measurements */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {/* Terrain Background */}
        <path
          d="M 180 500 C 350 460 450 390 620 420 C 760 445 850 430 960 420 C 1100 410 1250 370 1400 410 C 1550 450 1660 430 1740 470 L 1740 900 L 180 900 Z"
          fill="#9bbcb2"
          opacity="0.2"
        />

        {/* Ground Surface Contour */}
        <path
          d="M 180 500 C 350 460 450 390 620 420 C 760 445 850 430 960 420 C 1100 410 1250 370 1400 410 C 1550 450 1660 430 1740 470"
          fill="none"
          stroke="#4f745d"
          strokeWidth="4.5"
        />

        {/* Geoid Curve */}
        {geoidIn > 0.01 && (
          <path
            d="M 180 600 C 400 540 520 610 750 550 C 870 520 940 580 1120 560 C 1350 530 1520 610 1740 560"
            fill="none"
            stroke="#8f4e3e"
            strokeWidth="4"
            strokeDasharray="10 7"
            opacity={geoidIn}
          />
        )}

        {/* Ellipsoid Surface */}
        <path
          d="M 180 810 Q 960 630 1740 810"
          fill="none"
          stroke="#315f6d"
          strokeWidth="4.5"
          strokeDasharray="12 8"
        />

        {/* Double-Headed Dimension Line 1: Geodetic Height h (\updownarrow) */}
        <DoubleArrowLine
          x={normalX + 50}
          y1={groundY}
          y2={ellipsoidY}
          color="#a77748"
          strokeWidth={4.5}
          arrowSize={11}
          opacity={measureIn}
        />

        {/* Double-Headed Dimension Line 2: Altitude H (\updownarrow) */}
        <DoubleArrowLine
          x={normalX - 50}
          y1={groundY}
          y2={geoidY}
          color="#4f745d"
          strokeWidth={4}
          arrowSize={10}
          opacity={measureIn}
        />

        {/* Double-Headed Dimension Line 3: Height Anomaly zeta (\updownarrow) */}
        <DoubleArrowLine
          x={normalX - 50}
          y1={geoidY}
          y2={ellipsoidY}
          color="#8f4e3e"
          strokeWidth={3.5}
          arrowSize={9}
          opacity={measureIn > 0.5 ? measureIn : 0}
        />

        {/* Ground Point P */}
        <circle cx={normalX} cy={groundY} r="9" fill="#f6d47f" stroke="#fffdf6" strokeWidth="3" />
      </svg>

      {/* Surface Badges */}
      <Tag x={1410} y={535} color="#8f4e3e" p={geoidIn}>
        大地水准面
      </Tag>
      <Tag x={1410} y={745} color="#315f6d" p={ramp(frame, 800, 840)}>
        旋转椭球面
      </Tag>

      {/* Height Labels */}
      {measureIn > 0.1 && (
        <>
          <div
            style={{
              position: "absolute",
              left: normalX + 68,
              top: (groundY + ellipsoidY) / 2 - 20,
              color: "#a77748",
              fontFamily: SERIF,
              fontSize: 32,
              fontWeight: 700,
              opacity: measureIn,
              whiteSpace: "nowrap",
            }}
          >
            <Latex math="h" /> 大地高
          </div>

          <div
            style={{
              position: "absolute",
              left: normalX - 210,
              top: (groundY + geoidY) / 2 - 20,
              color: "#4f745d",
              fontFamily: SERIF,
              fontSize: 30,
              fontWeight: 700,
              opacity: measureIn,
              whiteSpace: "nowrap",
            }}
          >
            海拔 <Latex math="H" />
          </div>

          {measureIn > 0.5 && (
            <div
              style={{
                position: "absolute",
                left: normalX - 260,
                top: (geoidY + ellipsoidY) / 2 - 18,
                color: "#8f4e3e",
                fontFamily: SERIF,
                fontSize: 26,
                fontWeight: 700,
                opacity: measureIn,
                whiteSpace: "nowrap",
              }}
            >
              高程异常 <Latex math="\zeta" />
            </div>
          )}
        </>
      )}

      {/* Bottom Formula Box */}
      {formulaIn > 0.02 && (
        <div
          style={{
            position: "absolute",
            left: 120,
            bottom: 75,
            right: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 32px",
            background: "rgba(255,253,246,.96)",
            border: "1.5px solid #8f4e3e77",
            borderRadius: 8,
            boxShadow: "0 14px 36px rgba(41,52,47,.1)",
            opacity: formulaIn,
            transform: `translateY(${interpolate(formulaIn, [0, 1], [20, 0])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                padding: "10px 20px",
                background: "#315f6d",
                color: "#fffdf6",
                borderRadius: 6,
                fontFamily: SERIF,
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              <Latex math="h = H + \zeta \quad \Longleftrightarrow \quad H = h - \zeta" />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 21, color: "#29342f", fontWeight: 700 }}>
              大地高 = 海拔 + 高程异常
            </div>
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ padding: "10px 16px", background: "#4f745d22", border: "1px solid #4f745d77", borderRadius: 5, color: "#4f745d", fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>
              施工/地图：海拔 H
            </div>
            <div style={{ padding: "10px 16px", background: "#a7774822", border: "1px solid #a7774877", borderRadius: 5, color: "#a77748", fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>
              GPS测量：大地高 h
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Scene 4: Why GPS measures Geodetic Height first (Math Tractability)
// -----------------------------------------------------------------------------
const WhyGps: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const waveIn = ramp(frame, 1510, 1620);
  const formulaIn = ramp(frame, 1650, 1750);
  const titleIn = inSpring(frame, 1380, fps);

  const bumpyGeoidPath = useMemo(() => {
    const pts = [];
    const count = 36;
    const gCx = 1260;
    const gCy = 650;
    const gRx = 380;
    const gRy = 250;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rOffset = Math.sin(angle * 4) * 22 + Math.cos(angle * 6) * 16 + Math.sin(angle * 2) * 18;
      const x = gCx + (gRx + rOffset) * Math.cos(angle);
      const y = gCy + (gRy + rOffset * 0.6) * Math.sin(angle);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ") + " Z";
  }, []);

  const sats = [
    { x: 860, y: 220, label: "SAT-1" },
    { x: 1300, y: 190, label: "SAT-2" },
    { x: 1680, y: 350, label: "SAT-3" },
  ];

  const targetX = 1260;
  const targetY = 560;

  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden" }}>
      <PaperBackground tone="light" />

      <Header index="04.6" title="为什么 GPS 先得到大地高？" color="#315f6d" />

      {/* Left Column: Title & Formula Card */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 155,
          width: 630,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          zIndex: 10,
        }}
      >
        <div style={{ opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [-15, 0])}px)` }}>
          <div style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 700, lineHeight: 1.18, color: "#29342f" }}>
            卫星定位需要<br />
            <span style={{ color: "#315f6d" }}>解析可算的参考面</span>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 19, color: "#5d6964", marginTop: 12, lineHeight: 1.6 }}>
            大地水准面由重力决定，凹凸不平，无统一封闭的数学公式；<br />
            旋转椭球面是标准几何体，拥有简洁的代数方程。
          </div>
        </div>

        {formulaIn > 0.02 && (
          <div
            style={{
              marginTop: 24,
              padding: "32px 36px",
              borderRadius: 12,
              background: "rgba(255,253,246,.97)",
              border: "1.5px solid #315f6d88",
              boxShadow: "0 22px 54px rgba(41,52,47,.15)",
              opacity: formulaIn,
              transform: `translateY(${interpolate(formulaIn, [0, 1], [20, 0])}px)`,
            }}
          >
            <div style={{ fontFamily: MONO, color: "#315f6d", fontSize: 16, fontWeight: 700, letterSpacing: 1.5 }}>
              椭球面解析代数方程
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 34, color: "#29342f", fontWeight: 700, marginTop: 14, marginBottom: 8 }}>
              <Latex math="\frac{X^2+Y^2}{a^2} + \frac{Z^2}{b^2} = 1" />
            </div>
            <div style={{ width: "100%", height: 1, background: "#315f6d33", margin: "18px 0" }} />
            <div style={{ fontFamily: SERIF, fontSize: 19, color: "#5d6964", lineHeight: 1.7 }}>
              卫星交会直接算得直角坐标 <Latex math="(X,Y,Z)" />，在旋转椭球面上可<b>直接无缝转换为大地坐标 <Latex math="(L, B, h)" /></b>。
            </div>
          </div>
        )}
      </div>

      {/* SVG Diagram */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="satEarth3d" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#c5ded7" />
            <stop offset="70%" stopColor="#5f8c80" />
            <stop offset="100%" stopColor="#2a4d44" />
          </radialGradient>

          <radialGradient id="bumpyGradGps" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e8c9bd" />
            <stop offset="70%" stopColor="#b57b6c" />
            <stop offset="100%" stopColor="#63392f" />
          </radialGradient>
        </defs>

        {/* 1. Irregular 3D Bumpy Geoid Surface */}
        <g opacity="0.95">
          <path d={bumpyGeoidPath} fill="url(#bumpyGradGps)" stroke="#8f4e3e" strokeWidth="4.5" />
          <path d="M 940 630 Q 1260 560 1580 640" fill="none" stroke="#fffdf6" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.8" />
          <path d="M 920 680 Q 1260 750 1600 670" fill="none" stroke="#fffdf6" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
        </g>

        {/* 2. Smooth Geometric Ellipsoid (Translucent Fitting Mesh Envelope) */}
        <ellipse cx="1260" cy="650" rx="380" ry="250" fill="rgba(95, 140, 128, 0.4)" stroke="#315f6d" strokeWidth="4" />
        <ellipse cx="1260" cy="650" rx="380" ry="85" fill="none" stroke="#fffdf6" strokeWidth="2.5" strokeDasharray="10 7" opacity="0.85" />
        <ellipse cx="1260" cy="570" rx="335" ry="70" fill="none" stroke="#315f6d" strokeWidth="2" strokeDasharray="6 5" opacity="0.6" />
        <path d="M 1260 400 Q 1060 650 1260 900" fill="none" stroke="#fffdf6" strokeWidth="2" strokeDasharray="8 6" opacity="0.7" />

        {/* Satellite Orbits */}
        <ellipse cx="1260" cy="480" rx="660" ry="300" fill="none" stroke="#315f6d" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />

        {sats.map((s, i) => {
          const sIn = ramp(frame, 1410 + i * 30, 1460 + i * 30);
          return (
            <g key={s.label} opacity={sIn}>
              <line
                x1={s.x}
                y1={s.y}
                x2={targetX}
                y2={targetY}
                stroke="#a77748"
                strokeWidth="3"
                strokeDasharray="8 6"
                opacity={waveIn}
              />

              {waveIn > 0.1 && (
                <circle
                  cx={s.x + (targetX - s.x) * ((frame * 0.04 + i * 0.3) % 1)}
                  cy={s.y + (targetY - s.y) * ((frame * 0.04 + i * 0.3) % 1)}
                  r="14"
                  fill="none"
                  stroke="#a77748"
                  strokeWidth="2"
                  opacity="0.7"
                />
              )}

              <g transform={`translate(${s.x}, ${s.y})`}>
                <rect x="-38" y="-8" width="22" height="16" rx="2" fill="#315f6d" stroke="#fffdf6" strokeWidth="1.5" />
                <rect x="16" y="-8" width="22" height="16" rx="2" fill="#315f6d" stroke="#fffdf6" strokeWidth="1.5" />
                <rect x="-14" y="-12" width="28" height="24" rx="4" fill="#fffdf6" stroke="#a77748" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4" fill="#a77748" />
              </g>
            </g>
          );
        })}

        <circle cx={targetX} cy={targetY} r="10" fill="#f6d47f" stroke="#fffdf6" strokeWidth="3" />
      </svg>

      <Tag x={1440} y={540} color="#8f4e3e" p={ramp(frame, 1440, 1480)}>
        凹凸起伏的大地水准面
      </Tag>
      <Tag x={1420} y={840} color="#315f6d" p={ramp(frame, 1480, 1520)}>
        规则光滑的旋转椭球面
      </Tag>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Scene 5: Global Gravity Model Lookup & Height Conversion (H = h - zeta)
// -----------------------------------------------------------------------------
const GravityModel: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = inSpring(frame, 2040, fps);
  const scanIn = ramp(frame, 2080, 2160);
  const lookupIn = ramp(frame, 2220, 2300);
  const calcIn = ramp(frame, 2380, 2460);

  const cols = 14;
  const rows = 8;
  const targetCol = 9;
  const targetRow = 4;

  const cells = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = Math.sin(c * 0.65 + r * 1.3) * 25 + Math.cos(c * 0.9 - r * 0.7) * 15;
        arr.push({ r, c, val });
      }
    }
    return arr;
  }, []);

  const steps = [
    { num: "01", title: "定位测得大地高", desc: "GPS/卫星接收机结算得 h", color: "#a77748", from: 2060 },
    { num: "02", title: "检索重力场模型", desc: "按经纬度翻查得高程异常 \u03B6", color: "#315f6d", from: 2180 },
    { num: "03", title: "自动扣减计算", desc: "通过 H = h - \u03B6 输出真正海拔", color: "#4f745d", from: 2320 },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04.7" title="从大地高到海拔：重力场模型" color="#4f745d" />

      {/* Left Column */}
      <div style={{ position: "absolute", left: 120, top: 135, width: 440, opacity: titleIn }}>
        <div style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 700, lineHeight: 1.18, color: "#29342f" }}>
          设备后台翻查<br />
          <span style={{ color: "#4f745d" }}>全球重力场模型</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 18, color: "#5d6964", marginTop: 12, lineHeight: 1.55 }}>
          内置全球重力场模型记录各点的<b>高程异常值 <Latex math="\zeta" /></b>，自动修正后即可输出正常海拔。
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((s) => {
            const p = inSpring(frame, s.from, fps);
            return (
              <div
                key={s.num}
                style={{
                  opacity: p,
                  transform: `translateX(${interpolate(p, [0, 1], [-20, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  borderRadius: 8,
                  background: "rgba(255,253,246,.95)",
                  border: `1.5px solid ${s.color}55`,
                  boxShadow: "0 8px 24px rgba(41,52,47,.06)",
                }}
              >
                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 4,
                    background: s.color,
                    color: "#fffdf6",
                    fontFamily: MONO,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {s.num}
                </div>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 19, color: "#29342f", fontWeight: 700 }}>{s.title}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 14, color: "#5d6964", marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column */}
      <div
        style={{
          position: "absolute",
          left: 600,
          top: 135,
          right: 120,
          height: 520,
          padding: 24,
          boxSizing: "border-box",
          background: "rgba(255,253,246,.94)",
          border: "1.5px solid #4f745d66",
          borderRadius: 10,
          boxShadow: "0 20px 54px rgba(41,52,47,.12)",
          opacity: scanIn,
          transform: `scale(${interpolate(scanIn, [0, 1], [0.96, 1])})`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: SERIF, color: "#4f745d", fontSize: 18, fontWeight: 700 }}>
            全球重力场模型网格查询
          </div>
          <div style={{ fontFamily: MONO, color: "#a77748", fontSize: 15, fontWeight: 700 }}>
            当前位置: 东经 116.4°, 北纬 39.9°
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, height: 410, gap: 5, position: "relative" }}>
          {cells.map((cell) => {
            const isActive = cell.c === targetCol && cell.r === targetRow;
            const norm = (cell.val + 40) / 80;
            const bg = isActive
              ? "#f4d17c"
              : norm > 0.6
                ? "#729b86"
                : norm < 0.35
                  ? "#557d8c"
                  : "#c2d8cd";

            return (
              <div
                key={`${cell.r}-${cell.c}`}
                style={{
                  background: bg,
                  borderRadius: 4,
                  border: isActive ? "3px solid #a77748" : "1px solid rgba(255,255,255,.5)",
                  opacity: isActive ? 1 : 0.85,
                  transform: isActive ? `scale(${1 + Math.sin(frame / 4) * 0.08})` : undefined,
                  boxShadow: isActive ? "0 0 20px #f4d17c" : undefined,
                  transition: "all 0.2s ease",
                }}
              />
            );
          })}

          <div
            style={{
              position: "absolute",
              left: `${(targetCol / cols) * 100 + 2}%`,
              top: `${(targetRow / rows) * 100 + 4}%`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: lookupIn,
              transform: `translateX(${interpolate(lookupIn, [0, 1], [20, 0])}px)`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                padding: "12px 22px",
                background: "#29342f",
                color: "#fffdf6",
                borderRadius: 7,
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                boxShadow: "0 10px 28px rgba(0,0,0,.25)",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>高程异常</span>
              <span style={{ color: "#f4d17c", fontFamily: MONO, fontSize: 22 }}>
                <Latex math="\zeta = -9.5\,\mathrm{m}" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Calculation Workflow Bar */}
      {calcIn > 0.02 && (
        <div
          style={{
            position: "absolute",
            left: 120,
            bottom: 65,
            right: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 36px",
            background: "rgba(255,253,246,.96)",
            border: "2px solid #4f745d",
            borderRadius: 10,
            boxShadow: "0 16px 44px rgba(41,52,47,.14)",
            opacity: calcIn,
            transform: `translateY(${interpolate(calcIn, [0, 1], [20, 0])}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                padding: "12px 24px",
                background: "#4f745d",
                color: "#fffdf6",
                borderRadius: 7,
                fontFamily: SERIF,
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              <Latex math="H = h - \zeta" />
            </div>
            <div style={{ fontFamily: SERIF, color: "#29342f", fontSize: 24, fontWeight: 700 }}>
              海拔 = 大地高 - 高程异常
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: SERIF, fontSize: 22, color: "#29342f", fontWeight: 700 }}>
            <span style={{ color: "#a77748", fontFamily: MONO }}>582.4 m</span>
            <span>-</span>
            <span style={{ color: "#8f4e3e", fontFamily: MONO }}>(-9.5 m)</span>
            <span>=</span>
            <span style={{ color: "#4f745d", fontSize: 28, fontFamily: MONO, borderBottom: "3px double #4f745d" }}>
              591.9 m
            </span>
            <span style={{ fontSize: 20, color: "#4f745d" }}>（海拔）</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Main Scene Component: GeodeticHeightScene
// -----------------------------------------------------------------------------
export const GeodeticHeightScene: React.FC = () => {
  const frame = useCurrentFrame();

  const a = fade(frame, 0, 395);
  const b = fade(frame, 375, 805);
  const c = fade(frame, 785, 1390);
  const d = fade(frame, 1370, 2050);
  const e = fade(frame, 2030, 2742);

  return (
    <AbsoluteFill style={{ overflow: "hidden", color: "#29342f", fontFamily: SERIF }}>
      <PaperBackground tone={frame > 1370 ? "light" : "warm"} />

      {frame < 395 && <CoordinateLift opacity={a} />}
      {frame >= 375 && frame < 805 && <HeightDefinition opacity={b} />}
      {frame >= 785 && frame < 1390 && <HeightComparison opacity={c} />}
      {frame >= 1370 && frame < 2050 && <WhyGps opacity={d} />}
      {frame >= 2030 && <GravityModel opacity={e} />}
    </AbsoluteFill>
  );
};
