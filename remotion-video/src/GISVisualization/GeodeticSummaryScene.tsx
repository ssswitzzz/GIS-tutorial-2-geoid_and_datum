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

const inSpring = (frame: number, from: number, fps: number, damping = 18, stiffness = 100) =>
  spring({ frame: Math.max(0, frame - from), fps, config: { damping, stiffness } });

const Latex: React.FC<{ math: string; style?: React.CSSProperties }> = ({ math, style }) => {
  const html = useMemo(() => katex.renderToString(math, { throwOnError: false }), [math]);
  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
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
// Component: Summary Step Card
// -----------------------------------------------------------------------------
const StepCard: React.FC<{
  stepNum: string;
  title: string;
  subTitle: string;
  highlightText: string;
  color: string;
  isActive: boolean;
  isComplete: boolean;
  progress: number;
  style?: React.CSSProperties;
}> = ({ stepNum, title, subTitle, highlightText, color, isActive, isComplete, progress, style }) => {
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px) scale(${
          isActive ? 1.04 : 1
        })`,
        padding: "18px 22px",
        borderRadius: 10,
        background: isActive
          ? "rgba(255, 253, 246, 0.98)"
          : isComplete
          ? "rgba(255, 253, 246, 0.9)"
          : "rgba(255, 253, 246, 0.75)",
        border: isActive
          ? `2.5px solid ${color}`
          : isComplete
          ? `1.5px solid ${color}88`
          : `1px solid ${color}44`,
        boxShadow: isActive
          ? `0 14px 38px ${color}33`
          : isComplete
          ? "0 8px 24px rgba(41,52,47,.08)"
          : "none",
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              padding: "4px 9px",
              borderRadius: 4,
              background: color,
              color: "#fffdf6",
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {stepNum}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: "#29342f", fontWeight: 700 }}>
            {title}
          </div>
        </div>
        {isComplete && (
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: `${color}22`,
              border: `1.5px solid ${color}`,
              display: "grid",
              placeItems: "center",
              color,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ✓
          </div>
        )}
      </div>

      <div style={{ fontFamily: SERIF, fontSize: 15, color: "#5d6964" }}>{subTitle}</div>

      <div
        style={{
          marginTop: 2,
          padding: "6px 12px",
          borderRadius: 5,
          background: `${color}15`,
          border: `1px stroke ${color}44`,
          color,
          fontFamily: SERIF,
          fontSize: 16,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          alignSelf: "flex-start",
        }}
      >
        {highlightText}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component: Final Geodetic Summary Scene
// -----------------------------------------------------------------------------
export const GeodeticSummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline Progress Ramps
  const p1 = ramp(frame, 60, 120);
  const p2 = ramp(frame, 330, 390);
  const p3 = ramp(frame, 560, 620);
  const p4 = ramp(frame, 760, 820);
  const p5 = ramp(frame, 940, 1010);

  // Active status per phase
  const isPhase1Active = frame >= 100 && frame < 340;
  const isPhase2Active = frame >= 340 && frame < 570;
  const isPhase3Active = frame >= 570 && frame < 770;
  const isPhase4Active = frame >= 770 && frame < 940;

  // ---------------------------------------------------------------------------
  // Model Center & Well-Proportioned Ellipsoid Geometry (Slightly Less Flat!)
  // rx = 360, ry = 240 (Aspect ratio: 240/360 = 0.67, natural & elegant)
  // ---------------------------------------------------------------------------
  const cx = 1180;
  const cy = 540;
  const rx = 360;
  const ry = 240;

  // ---------------------------------------------------------------------------
  // Precise Point P0 & Normal Vector Calculation on Meridian Curve
  // Meridian Bezier: P_start(cx, cy-ry), P_ctrl(cx+210, cy), P_end(cx, cy+ry)
  // ---------------------------------------------------------------------------
  const t0 = 0.35;
  const p0x = (1 - t0) ** 2 * cx + 2 * (1 - t0) * t0 * (cx + 210) + t0 ** 2 * cx; // 1275.55
  const p0y = (1 - t0) ** 2 * (cy - ry) + 2 * (1 - t0) * t0 * cy + t0 ** 2 * (cy + ry); // 438.9

  // Normal Unit Vector: (0.967, -0.254)
  const normDx = 0.967;
  const normDy = -0.254;
  const hLength = 150;

  // Elevated Spatial Point P
  const px = p0x + hLength * normDx; // 1420.6
  const py = p0y + hLength * normDy; // 400.8

  // ---------------------------------------------------------------------------
  // Irregular 3D Bumpy Geoid Shape Generator for Step 1
  // -----------------------------------------------------------------------------
  const bumpyPoints = useMemo(() => {
    const pts = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rOffset = Math.sin(angle * 4) * 20 + Math.cos(angle * 7) * 12 + Math.sin(angle * 2) * 16;
      const x = cx + (rx + rOffset) * Math.cos(angle);
      const y = cy + (ry + rOffset * 0.6) * Math.sin(angle);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ") + " Z";
  }, [cx, cy, rx, ry]);

  // Steps Information
  const steps = [
    {
      num: "STEP 01",
      title: "物理逼近",
      sub: "真实坑洼地球 ➔ 大地水准面",
      highlight: "确立统一的海拔基准",
      color: "#8f4e3e",
      from: 60,
      active: isPhase1Active,
      done: frame >= 340,
      prog: p1,
    },
    {
      num: "STEP 02",
      title: "几何逼近",
      sub: "不规则水准面 ➔ 旋转椭球面",
      highlight: "提供代数公式精准计算",
      color: "#315f6d",
      from: 330,
      active: isPhase2Active,
      done: frame >= 570,
      prog: p2,
    },
    {
      num: "STEP 03",
      title: "定位定向",
      sub: "抽象椭球 ➔ 大地基准面",
      highlight: "确立坐标原点与方向",
      color: "#a77748",
      from: 560,
      active: isPhase3Active,
      done: frame >= 770,
      prog: p3,
    },
    {
      num: "STEP 04",
      title: "坐标绑定",
      sub: "参数三要素 ➔ 大地坐标系",
      highlight: "绑定经度、纬度、大地高",
      color: "#4f745d",
      from: 760,
      active: isPhase4Active,
      done: frame >= 940,
      prog: p4,
    },
  ];

  return (
    <AbsoluteFill style={{ overflow: "hidden", color: "#29342f", fontFamily: SERIF }}>
      <PaperBackground tone={frame > 940 ? "warm" : "light"} />

      <Header index="05" title="总结：地理坐标系的底层样貌" color="#315f6d" />

      {/* Top Banner Intro */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 135,
          opacity: inSpring(frame, 10, fps),
          transform: `translateY(${interpolate(inSpring(frame, 10, fps), [0, 1], [-15, 0])}px)`,
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 46, fontWeight: 700, lineHeight: 1.18, color: "#29342f" }}>
          从真实地球到<span style={{ color: "#315f6d" }}>地理坐标系</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 19, color: "#5d6964", marginTop: 8 }}>
          四层递进构建，奠定 GIS 与测绘系统的宏伟基石
        </div>
      </div>

      {/* Left Column: 4 Sequential Steps Cards */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 245,
          width: 440,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          zIndex: 10,
        }}
      >
        {steps.map((s) => (
          <StepCard
            key={s.num}
            stepNum={s.num}
            title={s.title}
            subTitle={s.sub}
            highlightText={s.highlight}
            color={s.color}
            isActive={s.active}
            isComplete={s.done}
            progress={s.prog}
          />
        ))}
      </div>

      {/* Right Central Interactive Model Visualization Area */}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="sumEarthGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#d2e5df" />
            <stop offset="70%" stopColor="#668e82" />
            <stop offset="100%" stopColor="#2c4f46" />
          </radialGradient>

          <radialGradient id="bumpyGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e8c9bd" />
            <stop offset="70%" stopColor="#b57b6c" />
            <stop offset="100%" stopColor="#63392f" />
          </radialGradient>

          <radialGradient id="finalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f4d17c" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f4d17c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Halo Glow on Final Phase */}
        {p5 > 0.01 && (
          <circle
            cx={cx}
            cy={cy}
            r={rx + 90}
            fill="url(#finalGlow)"
            opacity={p5}
            transform={`scale(${1 + Math.sin(frame / 8) * 0.03})`}
          />
        )}

        {/* Base Ellipsoid Shadow */}
        <ellipse cx={cx} cy={cy + 40} rx={rx + 15} ry={ry + 10} fill="rgba(41,52,47,.08)" filter="blur(18px)" />

        {/* -------------------------------------------------------------------
            Step 1: Irregular 3D Bumpy Geoid Surface (Physical Approximation)
           ------------------------------------------------------------------- */}
        {frame < 390 && (
          <g opacity={frame >= 340 ? interpolate(frame, [340, 390], [1, 0], clamp) : ramp(frame, 20, 80)}>
            <path d={bumpyPoints} fill="url(#bumpyGrad)" stroke="#8f4e3e" strokeWidth="4.5" />
            <path
              d={`M ${cx - rx * 0.7} ${cy - 30} Q ${cx} ${cy - 80} ${cx + rx * 0.7} ${cy - 20}`}
              fill="none"
              stroke="#fffdf6"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.75"
            />
            <path
              d={`M ${cx - rx * 0.8} ${cy + 40} Q ${cx} ${cy + 90} ${cx + rx * 0.8} ${cy + 50}`}
              fill="none"
              stroke="#fffdf6"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.6"
            />
          </g>
        )}

        {/* -------------------------------------------------------------------
            Step 2: Smooth Geometric Ellipsoid (Geometric Approximation)
            - Well proportioned rx = 360, ry = 240
           ------------------------------------------------------------------- */}
        {p2 > 0.01 && (
          <g opacity={p2}>
            {/* Smooth Teal Ellipsoid Body */}
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#sumEarthGrad)" stroke="#315f6d" strokeWidth="4" />

            {/* Equator & Latitude Parallels */}
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry * 0.42} fill="none" stroke="#fffdf6" strokeWidth="2.5" strokeDasharray="10 7" opacity="0.85" />
            <ellipse cx={cx} cy={cy - 80} rx={rx * 0.88} ry={ry * 0.36} fill="none" stroke="#315f6d" strokeWidth="2" strokeDasharray="6 5" opacity="0.6" />
            <ellipse cx={cx} cy={cy + 80} rx={rx * 0.88} ry={ry * 0.36} fill="none" stroke="#fffdf6" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.4" />

            {/* Prime Meridian */}
            <path d={`M ${cx} ${cy - ry} Q ${cx - 210} ${cy} ${cx} ${cy + ry}`} fill="none" stroke="#fffdf6" strokeWidth="2" strokeDasharray="8 6" opacity="0.7" />
          </g>
        )}

        {/* -------------------------------------------------------------------
            Step 3: Datum Positioning & Coordinate Origin O (0,0,0)
           ------------------------------------------------------------------- */}
        {p3 > 0.01 && (
          <g opacity={p3}>
            {/* X, Y, Z Coordinate Axes */}
            <line x1={cx} y1={cy} x2={cx + rx + 60} y2={cy} stroke="#a77748" strokeWidth="3" strokeDasharray="6 4" />
            <line x1={cx} y1={cy} x2={cx} y2={cy - ry - 60} stroke="#a77748" strokeWidth="3" strokeDasharray="6 4" />
            <line x1={cx} y1={cy} x2={cx - rx * 0.6} y2={cy + ry * 0.8} stroke="#a77748" strokeWidth="3" strokeDasharray="6 4" />

            {/* Origin Point O */}
            <circle cx={cx} cy={cy} r="8.5" fill="#f4d17c" stroke="#fffdf6" strokeWidth="3" />
            <text x={cx - 28} y={cy - 14} fontFamily={SERIF} fontSize="20" fontWeight="bold" fill="#a77748">
              O (0,0,0)
            </text>
          </g>
        )}

        {/* -------------------------------------------------------------------
            Step 4: Precision Geodetic Parameters (L, B, h) Vector Binding
            - Point P0 is EXACTLY ON the Meridian Bezier Curve!
           ------------------------------------------------------------------- */}
        {p4 > 0.01 && (
          <g opacity={p4}>
            {/* Target Meridian Curve L: Passing EXACTLY through P0(1275.55, 438.9) */}
            <path d={`M ${cx} ${cy - ry} Q ${cx + 210} ${cy} ${cx} ${cy + ry}`} fill="none" stroke="#a77748" strokeWidth="3.5" strokeDasharray="9 6" />

            {/* Target Latitude Curve B: Passing EXACTLY through P0(1275.55, 438.9) */}
            <path d={`M ${cx - rx * 0.86} ${p0y} Q ${cx} ${p0y + 42} ${cx + rx * 0.86} ${p0y}`} fill="none" stroke="#315f6d" strokeWidth="3" opacity="0.85" />

            {/* Ellipsoid Normal Vector Line for h starting at P0 */}
            <line x1={p0x} y1={p0y} x2={px} y2={py} stroke="#4f745d" strokeWidth="4.5" strokeDasharray="8 5" />

            {/* Surface Point P0 (L, B) - EXACTLY ON THE MERIDIAN & LATITUDE CURVES! */}
            <circle cx={p0x} cy={p0y} r="8" fill="#a77748" stroke="#fffdf6" strokeWidth="3" />

            {/* Spatial Point P (L, B, h) */}
            <circle cx={px} cy={py} r="11" fill="#f4d17c" stroke="#fffdf6" strokeWidth="3.5" />
            <circle cx={px} cy={py} r={20 + Math.sin(frame / 6) * 3} fill="none" stroke="#a77748" strokeWidth="2" opacity="0.8" />
          </g>
        )}

        {/* -------------------------------------------------------------------
            Step 5: Final Energy Conduits Connecting 4 Cards to Central Model
           ------------------------------------------------------------------- */}
        {p5 > 0.01 && (
          <g opacity={p5}>
            {[290, 390, 490, 590].map((cardY, i) => (
              <path
                key={i}
                d={`M 570 ${cardY} C 750 ${cardY} 850 ${cy} ${cx - rx * 0.7} ${cy}`}
                fill="none"
                stroke={["#8f4e3e", "#315f6d", "#a77748", "#4f745d"][i]}
                strokeWidth="3"
                strokeDasharray="8 6"
                opacity="0.8"
              />
            ))}
          </g>
        )}
      </svg>

      {/* Floating Callout Badges */}
      {isPhase1Active && (
        <Tag x={cx - 80} y={cy - 140} color="#8f4e3e" p={p1}>
          基准：凹凸不平的大地水准面
        </Tag>
      )}

      {isPhase2Active && (
        <Tag x={cx - 100} y={cy - 140} color="#315f6d" p={p2}>
          几何体：光滑规则的旋转椭球面
        </Tag>
      )}

      {isPhase3Active && (
        <Tag x={cx + 120} y={cy - 170} color="#a77748" p={p3}>
          定位定向：大地基准面
        </Tag>
      )}

      {isPhase4Active && (
        <>
          <Tag x={p0x + 20} y={p0y + 15} color="#315f6d" p={p4}>
            曲面点 <Latex math="P_0 (L, B)" />
          </Tag>
          <Tag x={px + 20} y={py - 25} color="#4f745d" p={p4}>
            空间点 <Latex math="P (L, B, h)" />
          </Tag>
        </>
      )}

      {/* Phase 5: Final Grand Synthesis Card Overlay */}
      {p5 > 0.02 && (
        <div
          style={{
            position: "absolute",
            left: 600,
            top: 245,
            right: 120,
            padding: "36px 44px",
            borderRadius: 14,
            background: "rgba(255, 253, 246, 0.97)",
            border: "3px solid #315f6d",
            boxShadow: "0 24px 64px rgba(41,52,47,.18)",
            opacity: p5,
            transform: `scale(${interpolate(p5, [0, 1], [0.92, 1])})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            zIndex: 30,
          }}
        >
          {/* Top Seal Tag */}
          <div
            style={{
              padding: "6px 18px",
              borderRadius: 20,
              background: "#315f6d",
              color: "#fffdf6",
              fontFamily: SERIF,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            地理坐标系
          </div>

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 44,
              fontWeight: 700,
              color: "#29342f",
              marginTop: 18,
              lineHeight: 1.2,
            }}
          >
            地理坐标系的底层样貌
          </div>

          <div
            style={{
              width: 120,
              height: 3,
              background: "#a77748",
              margin: "18px 0",
              borderRadius: 2,
            }}
          />

          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              color: "#5d6964",
              lineHeight: 1.7,
              maxWidth: 820,
            }}
          >
            <b>大地水准面</b>提供物理海拔基准，<b>旋转椭球面</b>提供解析几何形状，<br />
            <b>大地基准面</b>确立定位定向原点，<b>大地坐标系</b>将经纬度与大地高完美绑定。<br />
            四者合一，构筑起现代 GIS 与测绘定位系统的核心基石。
          </div>

          {/* Bottom 4 Element Badges Grid */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ padding: "12px 20px", borderRadius: 8, background: "#8f4e3e15", border: "1.5px solid #8f4e3e", color: "#8f4e3e", fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>
              ① 海拔基准
            </div>
            <div style={{ padding: "12px 20px", borderRadius: 8, background: "#315f6d15", border: "1.5px solid #315f6d", color: "#315f6d", fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>
              ② 几何解析
            </div>
            <div style={{ padding: "12px 20px", borderRadius: 8, background: "#a7774815", border: "1.5px solid #a77748", color: "#a77748", fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>
              ③ 坐标原点
            </div>
            <div style={{ padding: "12px 20px", borderRadius: 8, background: "#4f745d15", border: "1.5px solid #4f745d", color: "#4f745d", fontFamily: SERIF, fontSize: 18, fontWeight: 700 }}>
              ④ <Latex math="(L, B, h)" /> 绑定
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
