import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
  cancelRender,
} from "remotion";
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import katex from "katex";
import "katex/dist/katex.min.css";
import { PaperBackground } from "./OpeningSceneElevation";

const SERIF =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const enterSpring = (frame: number, start: number, fps: number, damping = 18, stiffness = 90) =>
  spring({ frame: frame - start, fps, config: { damping, stiffness } });

const rangeOpacity = (frame: number, start: number, end: number, fade = 14) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], clamp);

// KaTeX Formula Renderer Component
const Latex: React.FC<{ math: string; displayMode?: boolean; style?: React.CSSProperties }> = ({
  math,
  displayMode = false,
  style,
}) => {
  const html = useMemo(() => {
    return katex.renderToString(math, { displayMode, throwOnError: false });
  }, [math, displayMode]);

  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};

// Asynchronous Lottie JSON Loader Component
const LottieAsset: React.FC<{
  path: string;
  style?: React.CSSProperties;
  loop?: boolean;
  speed?: number;
}> = ({ path, style, loop = true, speed = 1 }) => {
  const [handle] = useState(() => delayRender(`Loading Lottie: ${path}`));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(staticFile(path))
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setAnimationData(data);
          continueRender(handle);
        }
      })
      .catch((err) => {
        console.error(`Failed to load Lottie ${path}:`, err);
        cancelRender(handle);
      });

    return () => {
      isMounted = false;
    };
  }, [path, handle]);

  if (!animationData) {
    return <div style={style} />;
  }

  return (
    <Lottie
      animationData={animationData}
      style={style}
      loop={loop}
      playbackRate={speed}
    />
  );
};

// Section Header at the top (Keep "03", remove "坐标系转换")
const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], clamp);
  const translateY = interpolate(frame, [0, 20], [-15, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 104,
        top: 55,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 18,
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: "8px 16px",
          border: "1px solid rgba(49, 95, 109, 0.4)",
          borderRadius: 5,
          background: "rgba(255, 253, 246, 0.85)",
          color: "#315f6d",
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 1,
          boxShadow: "0 4px 14px rgba(41, 52, 47, 0.06)",
        }}
      >
        03
      </div>
      <div style={{ width: 36, height: 1.5, background: "#315f6d" }} />
      <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: "#29342f" }}>
        {title}
      </div>
    </div>
  );
};

// 3D Cartesian Graphic (Phase 1 Left Side)
const CartesianGraphic: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.08) * 3;
  const rotAngle = Math.sin(frame * 0.03) * 6;

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 140,
        width: 820,
        height: 800,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="800"
        height="760"
        viewBox="0 0 800 760"
        style={{ overflow: "visible", filter: "drop-shadow(0 20px 40px rgba(41,52,47,0.12))" }}
      >
        <ellipse
          cx="400"
          cy="400"
          rx="270"
          ry="270"
          fill="url(#earthGradient)"
          stroke="rgba(49,95,109,0.35)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />

        <ellipse
          cx="400"
          cy="400"
          rx="270"
          ry="95"
          fill="rgba(49,95,109,0.06)"
          stroke="rgba(49,95,109,0.45)"
          strokeWidth="2"
          transform={`rotate(${rotAngle}, 400, 400)`}
        />

        <ellipse
          cx="400"
          cy="400"
          rx="180"
          ry="65"
          fill="none"
          stroke="rgba(49,95,109,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Z Axis */}
        <line x1="400" y1="400" x2="400" y2="70" stroke="#315f6d" strokeWidth="4" strokeLinecap="round" />
        <polygon points="400,50 390,72 410,72" fill="#315f6d" />
        <text x="418" y="75" fontFamily={SERIF} fontSize="26" fontWeight="bold" fill="#315f6d">
          Z 轴 (地球自转轴)
        </text>

        {/* X Axis */}
        <line x1="400" y1="400" x2="130" y2="560" stroke="#8f4e3e" strokeWidth="4" strokeLinecap="round" />
        <polygon points="114,570 138,550 132,574" fill="#8f4e3e" />
        <text x="45" y="605" fontFamily={SERIF} fontSize="26" fontWeight="bold" fill="#8f4e3e">
          X 轴 (首子午面交线)
        </text>

        {/* Y Axis */}
        <line x1="400" y1="400" x2="670" y2="520" stroke="#4f745d" strokeWidth="4" strokeLinecap="round" />
        <polygon points="686,526 662,536 666,512" fill="#4f745d" />
        <text x="680" y="555" fontFamily={SERIF} fontSize="26" fontWeight="bold" fill="#4f745d">
          Y 轴 (东经 90° 交线)
        </text>

        {/* Origin Badge */}
        <circle cx="400" cy="400" r="8.5" fill="#a77748" stroke="#fffdf6" strokeWidth="2.5" />
        <text x="415" y="430" fontFamily={SERIF} fontSize="22" fontWeight="bold" fill="#29342f">
          O (地心)
        </text>

        {/* Target Point P */}
        <line x1="550" y1="200" x2="550" y2="470" stroke="#a77748" strokeWidth="2.5" strokeDasharray="6 4" />
        <line x1="550" y1="470" x2="400" y2="400" stroke="#a77748" strokeWidth="2.5" strokeDasharray="6 4" />
        <line x1="550" y1="470" x2="290" y2="465" stroke="#8f4e3e" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="550" y1="470" x2="500" y2="445" stroke="#4f745d" strokeWidth="2" strokeDasharray="4 4" />

        <circle cx="550" cy="200" r={18 + pulse} fill="rgba(167, 119, 72, 0.25)" />
        <circle cx="550" cy="200" r="10" fill="#a77748" stroke="#ffffff" strokeWidth="3" />

        <foreignObject x="575" y="170" width="240" height="55">
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              background: "rgba(255,253,246,0.96)",
              border: "2px solid #a77748",
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
              color: "#29342f",
              display: "inline-block",
              boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
              whiteSpace: "nowrap",
            }}
          >
            <Latex math="P(X, Y, Z)" />
          </div>
        </foreignObject>

        <defs>
          <radialGradient id="earthGradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(49, 95, 109, 0.18)" />
            <stop offset="70%" stopColor="rgba(49, 95, 109, 0.06)" />
            <stop offset="100%" stopColor="rgba(49, 95, 109, 0.25)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// Phase 1 Right Side Explanation Card
const CartesianExplanationCard: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const questionSpring = enterSpring(frame, 240, fps, 16, 95);

  return (
    <div
      style={{
        position: "absolute",
        right: 90,
        top: 155,
        width: 820,
        height: 780,
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div
        style={{
          padding: "38px 42px",
          borderRadius: 24,
          background: "rgba(255, 253, 246, 0.96)",
          border: "2px solid rgba(49, 95, 109, 0.28)",
          boxShadow: "0 22px 54px rgba(41, 52, 47, 0.14)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              padding: "8px 18px",
              borderRadius: 18,
              background: "rgba(49, 95, 109, 0.14)",
              color: "#315f6d",
              fontFamily: SERIF,
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            概念定义
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 700, color: "#29342f" }}>
            空间直角坐标系
          </span>
        </div>

        <p style={{ fontFamily: SERIF, fontSize: 22, color: "#4a5953", lineHeight: 1.7, margin: 0 }}>
          以地心 <Latex math="O" /> 为原点，使用三维直角坐标系中的三个长度分量{" "}
          <Latex math="X" />、<Latex math="Y" />、<Latex math="Z" /> 来准确表示空间中任意一点的位置：
        </p>

        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div
            style={{
              flex: 1,
              padding: "20px 22px",
              borderRadius: 16,
              background: "#1e2623",
              color: "#f4efe4",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 24, color: "#8f4e3e", fontWeight: 700 }}>
              <Latex math="X" /> 轴
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 16, opacity: 0.88 }}>
              首子午面与赤道交线
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "20px 22px",
              borderRadius: 16,
              background: "#1e2623",
              color: "#f4efe4",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 24, color: "#4f745d", fontWeight: 700 }}>
              <Latex math="Y" /> 轴
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 16, opacity: 0.88 }}>
              东经 90° 与赤道交线
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "20px 22px",
              borderRadius: 16,
              background: "#1e2623",
              color: "#f4efe4",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 24, color: "#315f6d", fontWeight: 700 }}>
              <Latex math="Z" /> 轴
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 16, opacity: 0.88 }}>
              地球自转轴 (北极)
            </span>
          </div>
        </div>
      </div>

      {/* Animated Question Card */}
      {questionSpring > 0.01 && (
        <div
          style={{
            transform: `scale(${questionSpring}) translateY(${interpolate(questionSpring, [0, 1], [20, 0])}px)`,
            opacity: questionSpring,
            padding: "28px 34px",
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(167, 119, 72, 0.15) 0%, rgba(143, 78, 62, 0.15) 100%)",
            border: "2px stroke #a77748",
            borderStyle: "dashed",
            boxShadow: "0 18px 46px rgba(167, 119, 72, 0.22)",
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div style={{ width: 76, height: 76, flexShrink: 0 }}>
            <LottieAsset path="thinking.json" style={{ width: "100%", height: "100%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: "#29342f" }}>
              那我们熟悉的经纬度跑到哪里去了呢？
            </span>
            <div style={{ fontSize: 19, color: "#8f4e3e", fontWeight: 700 }}>
              <Latex math="(L, B, h)" /> 三要素绑定
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// GNSS Satellite Constellation Graphic (Phase 2 Left Side with Info Cards)
const GNSSConstellationGraphic: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const orbitRot = frame * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 155,
        width: 820,
        height: 780,
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        zIndex: 20,
      }}
    >
      {/* Top Banner Intro & Explanation Card */}
      <div
        style={{
          padding: "28px 34px",
          borderRadius: 20,
          background: "rgba(255, 253, 246, 0.96)",
          border: "2px solid rgba(49, 95, 109, 0.28)",
          boxShadow: "0 18px 46px rgba(41, 52, 47, 0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              padding: "6px 16px",
              borderRadius: 16,
              background: "rgba(49, 95, 109, 0.14)",
              color: "#315f6d",
              fontFamily: SERIF,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            定位原理
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: "#29342f" }}>
            卫星定位与原生解算
          </span>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 20, color: "#4a5953", lineHeight: 1.65, margin: 0 }}>
          GNSS 卫星通过距离后方交会，在几何数学上最直接解算出的物理原生坐标是<b>地心三维直角坐标 <Latex math="(X, Y, Z)" /></b>。
        </p>

        {/* 3 Step Indicator Badges */}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <div style={{ padding: "8px 14px", borderRadius: 8, background: "#a7774818", border: "1.5px solid #a77748", color: "#a77748", fontFamily: SERIF, fontSize: 16, fontWeight: 700 }}>
            ① 卫星多视后方交会
          </div>
          <div style={{ padding: "8px 14px", borderRadius: 8, background: "#8f4e3e18", border: "1.5px solid #8f4e3e", color: "#8f4e3e", fontFamily: SERIF, fontSize: 16, fontWeight: 700 }}>
            ② 得原生坐标 <Latex math="(X,Y,Z)" />
          </div>
          <div style={{ padding: "8px 14px", borderRadius: 8, background: "#4f745d18", border: "1.5px solid #4f745d", color: "#4f745d", fontFamily: SERIF, fontSize: 16, fontWeight: 700 }}>
            ③ 必须转换 <Latex math="(L,B,H)" />
          </div>
        </div>
      </div>

      {/* SVG Satellites Illustration */}
      <div style={{ width: "100%", height: 500, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <svg width="720" height="500" viewBox="0 0 720 500" style={{ overflow: "visible" }}>
          <circle cx="360" cy="250" r="140" fill="url(#earthGlobe)" stroke="#315f6d" strokeWidth="2.5" />
          <ellipse cx="360" cy="250" rx="140" ry="50" fill="none" stroke="rgba(49,95,109,0.35)" strokeDasharray="5 5" />

          <ellipse
            cx="360"
            cy="250"
            rx="270"
            ry="110"
            fill="none"
            stroke="rgba(167, 119, 72, 0.45)"
            strokeWidth="2"
            transform={`rotate(-25, 360, 250)`}
          />

          <ellipse
            cx="360"
            cy="250"
            rx="270"
            ry="110"
            fill="none"
            stroke="rgba(49, 95, 109, 0.45)"
            strokeWidth="2"
            transform={`rotate(40, 360, 250)`}
          />

          <g transform={`rotate(${orbitRot}, 360, 250) translate(630, 250)`}>
            <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#1e2623" stroke="#a77748" strokeWidth="2.5" />
            <line x1="-34" y1="0" x2="-16" y2="0" stroke="#a77748" strokeWidth="3.5" />
            <line x1="16" y1="0" x2="34" y2="0" stroke="#a77748" strokeWidth="3.5" />
          </g>

          <g transform={`rotate(${orbitRot + 120}, 360, 250) translate(630, 250)`}>
            <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#1e2623" stroke="#315f6d" strokeWidth="2.5" />
            <line x1="-34" y1="0" x2="-16" y2="0" stroke="#315f6d" strokeWidth="3.5" />
            <line x1="16" y1="0" x2="34" y2="0" stroke="#315f6d" strokeWidth="3.5" />
          </g>

          <g transform={`rotate(${orbitRot + 240}, 360, 250) translate(630, 250)`}>
            <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#1e2623" stroke="#4f745d" strokeWidth="2.5" />
            <line x1="-34" y1="0" x2="-16" y2="0" stroke="#4f745d" strokeWidth="3.5" />
            <line x1="16" y1="0" x2="34" y2="0" stroke="#4f745d" strokeWidth="3.5" />
          </g>

          <text x="360" y="256" textAnchor="middle" fontFamily={SERIF} fontSize="22" fontWeight="bold" fill="#e3f0eaff">
            卫星定位信号 (GNSS)
          </text>

          <defs>
            <radialGradient id="earthGlobe" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#7693a0" />
              <stop offset="70%" stopColor="#315f6d" />
              <stop offset="100%" stopColor="#172b33" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

// Smartphone Navigation (Phase 2 Right Side - Red Badge Completely Removed)
const SmartphoneNavigationJoke: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        right: 110,
        top: 140,
        width: 760,
        height: 800,
        opacity: progress,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 470,
          height: 760,
          borderRadius: 48,
          background: "linear-gradient(145deg, #1e2623, #111614)",
          padding: 16,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.08)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: 130,
            height: 26,
            borderRadius: 13,
            background: "#080a09",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1c2522" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0d4332" }} />
        </div>

        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 36,
            background: "#f4efe4",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(49, 95, 109, 0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(49, 95, 109, 0.08) 2px, transparent 2px)",
              backgroundSize: "40px 40px",
            }}
          />

          <svg width="440" height="730" style={{ position: "absolute", inset: 0 }}>
            <path d="M-20 280 Q 150 240, 220 380 T 440 500" stroke="#e0d6c3" strokeWidth="32" fill="none" />
            <path d="M-20 280 Q 150 240, 220 380 T 440 500" stroke="#ffffff" strokeWidth="24" fill="none" />
            <path d="M 80 180 L 160 260 L 220 380 L 310 420" stroke="#315f6d" strokeWidth="10" strokeLinecap="round" fill="none" />

            <circle cx="220" cy="380" r={24 + Math.sin(frame * 0.1) * 6} fill="rgba(167, 119, 72, 0.25)" />
            <circle cx="220" cy="380" r="12" fill="#a77748" stroke="#ffffff" strokeWidth="3" />
          </svg>

          <div
            style={{
              padding: "42px 26px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: "#29342f" }}>
              09:41
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 14, background: "#315f6d", color: "#fff", padding: "4px 12px", borderRadius: 6, fontWeight: 700 }}>
              卫星定位中
            </span>
          </div>

          <div
            style={{
              marginTop: "auto",
              margin: 18,
              padding: 22,
              borderRadius: 24,
              background: "rgba(255, 253, 246, 0.96)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(49, 95, 109, 0.25)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8f4e3e" }} />
              <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#8f4e3e" }}>
                原生空间直角坐标解算结果
              </span>
            </div>

            <div
              style={{
                background: "#1e2623",
                borderRadius: 14,
                padding: "18px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                color: "#76c498",
                fontSize: 21,
                fontFamily: MONO,
                fontWeight: 700,
              }}
            >
              <div><Latex math="X = +2,168,432.894 \text{ m}" /></div>
              <div><Latex math="Y = -4,387,105.123 \text{ m}" /></div>
              <div><Latex math="Z = +4,077,891.450 \text{ m}" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reference Ellipsoid Projection Graphic (Phase 3 Left Side)
const GeodeticProjectionGraphic: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 140,
        width: 840,
        height: 800,
        opacity: progress,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="820"
        height="760"
        viewBox="0 0 820 760"
        style={{ overflow: "visible", filter: "drop-shadow(0 20px 40px rgba(41,52,47,0.1))" }}
      >
        <ellipse
          cx="410"
          cy="400"
          rx="340"
          ry="240"
          fill="url(#ellipsoidGrad)"
          stroke="#315f6d"
          strokeWidth="3.5"
        />

        <ellipse
          cx="410"
          cy="400"
          rx="340"
          ry="85"
          fill="rgba(49, 95, 109, 0.08)"
          stroke="rgba(49, 95, 109, 0.45)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        {/* Axis b */}
        <line x1="410" y1="120" x2="410" y2="650" stroke="#29342f" strokeWidth="2.5" strokeDasharray="4 4" />
        <foreignObject x="425" y="130" width="180" height="45">
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#29342f" }}>
            <Latex math="b" /> (短半轴)
          </div>
        </foreignObject>

        {/* Axis a */}
        <line x1="410" y1="400" x2="750" y2="400" stroke="#a77748" strokeWidth="3" />
        <foreignObject x="560" y="410" width="180" height="45">
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#a77748" }}>
            <Latex math="a" /> (长半轴)
          </div>
        </foreignObject>

        {/* Normal Line N */}
        <line x1="500" y1="400" x2="660" y2="190" stroke="#8f4e3e" strokeWidth="3.5" />

        {/* Latitude B Arc */}
        <path d="M 550 400 A 50 50 0 0 0 542 344" fill="none" stroke="#8f4e3e" strokeWidth="3.5" />
        <foreignObject x="555" y="340" width="140" height="45">
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: "#8f4e3e" }}>
            <Latex math="B" /> (纬度)
          </div>
        </foreignObject>

        {/* Longitude L Arc */}
        <path d="M 410 450 A 90 30 0 0 0 490 438" fill="none" stroke="#315f6d" strokeWidth="3.5" />
        <foreignObject x="440" y="480" width="140" height="45">
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: "#315f6d" }}>
            <Latex math="L" /> (经度)
          </div>
        </foreignObject>

        {/* Height H */}
        <line x1="585" y1="285" x2="660" y2="190" stroke="#4f745d" strokeWidth="4" />
        <foreignObject x="645" y="240" width="160" height="45">
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#4f745d" }}>
            <Latex math="H" /> (大地高)
          </div>
        </foreignObject>

        {/* Projection point P0 */}
        <circle cx="585" cy="285" r="7" fill="#315f6d" />
        <foreignObject x="495" y="295" width="180" height="45">
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: "#315f6d" }}>
            <Latex math="P_0(L, B, 0)" />
          </div>
        </foreignObject>

        {/* Point P */}
        <circle cx="660" cy="190" r="10" fill="#8f4e3e" stroke="#ffffff" strokeWidth="3" />
        <foreignObject x="680" y="170" width="320" height="55">
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#29342f", whiteSpace: "nowrap" }}>
            <Latex math="P(X,Y,Z) \to (L,B,H)" />
          </div>
        </foreignObject>

        <defs>
          <radialGradient id="ellipsoidGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(49, 95, 109, 0.18)" />
            <stop offset="75%" stopColor="rgba(49, 95, 109, 0.06)" />
            <stop offset="100%" stopColor="rgba(49, 95, 109, 0.25)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// Phase 3 Right Side Formula Conversion Card
const FormulaConversionCard: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: 80,
        top: 140,
        width: 820,
        height: 780,
        opacity: progress,
        display: "flex",
        flexDirection: "column",
        gap: 26,
      }}
    >
      <div
        style={{
          padding: "34px 38px",
          borderRadius: 24,
          background: "rgba(255, 253, 246, 0.96)",
          border: "2px solid rgba(49, 95, 109, 0.28)",
          boxShadow: "0 22px 54px rgba(41, 52, 47, 0.14)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              padding: "8px 18px",
              borderRadius: 18,
              background: "rgba(167, 119, 72, 0.15)",
              color: "#a77748",
              fontFamily: SERIF,
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            几何投影绑定
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: "#29342f" }}>
            绑定参考椭球体 · 大地坐标系
          </span>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 20, color: "#4a5953", lineHeight: 1.7, margin: 0 }}>
          设备后台通过几何公式，将空间直角坐标 <Latex math="(X, Y, Z)" /> 绑定到参考椭球面上，解算出易于直接理解的大地坐标 <Latex math="(L, B, H)" />。
        </p>
      </div>

      <div
        style={{
          padding: "34px 38px",
          borderRadius: 24,
          background: "#1e2623",
          border: "1.5px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          color: "#f4efe4",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: SERIF, fontSize: 19, color: "#a77748", fontWeight: 700 }}>
            坐标转换几何方程
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 16, color: "#7693a0" }}>
            <Latex math="N" /> 为卯酉圈曲率半径
          </span>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 16,
            padding: "24px 28px",
            fontSize: 26,
            color: "#e8f0ec",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Latex
            displayMode
            math="\begin{cases} X = (N + H) \cos B \cos L \\ Y = (N + H) \cos B \sin L \\ Z = [N(1 - e^2) + H] \sin B \end{cases}"
          />
        </div>
      </div>

      {/* Output Card */}
      <div
        style={{
          padding: "24px 30px",
          borderRadius: 24,
          background: "linear-gradient(135deg, rgba(79, 116, 93, 0.15) 0%, rgba(49, 95, 109, 0.15) 100%)",
          border: "2px solid #4f745d",
          boxShadow: "0 18px 46px rgba(79, 116, 93, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, flexShrink: 0 }}>
            <LottieAsset path="thumbs_up.json" style={{ width: "100%", height: "100%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 700, color: "#29342f" }}>
              大地坐标系 <Latex math="(L, B, H)" />
            </span>
            <div style={{ fontSize: 20, color: "#315f6d", fontWeight: 700, fontFamily: MONO }}>
              <Latex math="116^\circ 24' 36'' \text{ E}, \; 39^\circ 54' 12'' \text{ N}, \; H: 43.5\text{ m}" />
            </div>
          </div>
        </div>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 16,
            padding: "8px 18px",
            borderRadius: 14,
            background: "#4f745d",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          直观可读经纬度
        </span>
      </div>
    </div>
  );
};

// System Equivalence Summary Card (Phase 4)
const SystemEquivalenceCard: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 160,
        transform: `translateX(-50%)`,
        width: 1540,
        height: 680,
        opacity: progress,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
        zIndex: 60,
      }}
    >
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            fontWeight: 700,
            color: "#315f6d",
            letterSpacing: "0.08em",
            padding: "8px 24px",
            borderRadius: 20,
            background: "rgba(49, 95, 109, 0.12)",
          }}
        >
          概念等价性
        </span>
        <h2 style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 700, color: "#29342f", margin: 0 }}>
          地理坐标系 <Latex math="\equiv" /> 大地坐标系
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 46,
          width: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "42px 46px",
            borderRadius: 28,
            background: "rgba(255, 253, 246, 0.96)",
            border: "2px solid rgba(49, 95, 109, 0.3)",
            boxShadow: "0 24px 64px rgba(41, 52, 47, 0.14)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 38 }}>🌐</span>
            <span style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: "#29342f" }}>
              地理坐标系
            </span>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 22, color: "#4a5953", lineHeight: 1.7, margin: 0 }}>
            日常生活与口语表达中最常用的名称，常统指以“经度 (Longitude)”和“纬度 (Latitude)”表示地球位置的坐标体系。
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a77748 0%, #315f6d 100%)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontSize: 44,
              fontWeight: 900,
              boxShadow: "0 18px 46px rgba(167, 119, 72, 0.38)",
            }}
          >
            ≡
          </div>
          <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#a77748" }}>
            大多数情况下等价
          </span>
        </div>

        <div
          style={{
            flex: 1,
            padding: "42px 46px",
            borderRadius: 28,
            background: "rgba(255, 253, 246, 0.96)",
            border: "2px solid rgba(167, 119, 72, 0.35)",
            boxShadow: "0 24px 64px rgba(41, 52, 47, 0.14)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 38 }}>📐</span>
            <span style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: "#29342f" }}>
              大地坐标系
            </span>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 22, color: "#4a5953", lineHeight: 1.7, margin: 0 }}>
            专业测绘与 GIS 中严谨的科学定义，建立在特定参考椭球体之上，由大地经度 <Latex math="L" />、大地纬度 <Latex math="B" /> 和大地高 <Latex math="H" /> 组成。
          </p>
        </div>
      </div>

      {/* Summary Pill */}
      <div
        style={{
          padding: "16px 44px",
          borderRadius: 30,
          background: "#1e2623",
          color: "#f4efe4",
          fontFamily: SERIF,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.04em",
          boxShadow: "0 18px 46px rgba(0,0,0,0.22)",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ width: 40, height: 40, overflow: "hidden", borderRadius: "50%" }}>
          <OffthreadVideo
            src={staticFile("glowing_star.webm")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <span style={{ color: "#a77748" }}>总结：</span>
        <span>在 CGCS2000 / WGS-84 等标准 GIS 框架中两者直接通用与重合</span>
      </div>
    </div>
  );
};

// Main Composition Component
export const GeodeticCoordinateScene: React.FC = () => {
  const frame = useCurrentFrame();

  const phase1Op = rangeOpacity(frame, 0, 340, 18);
  const phase2Op = rangeOpacity(frame, 340, 770, 18);
  const phase3Op = rangeOpacity(frame, 770, 1178, 18);
  const phase4Op = rangeOpacity(frame, 1178, 1360, 18);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBackground tone="warm" />

      <SectionHeader
        title={
          frame < 340
            ? "空间直角坐标系"
            : frame < 770
              ? "卫星定位与原生坐标"
              : frame < 1178
                ? "绑定椭球面与坐标转换"
                : "地理坐标系与大地坐标系的等价性"
        }
      />

      {phase1Op > 0 && (
        <>
          <CartesianGraphic opacity={phase1Op} />
          <CartesianExplanationCard opacity={phase1Op} />
        </>
      )}

      {phase2Op > 0 && (
        <>
          <GNSSConstellationGraphic opacity={phase2Op} />
          <SmartphoneNavigationJoke progress={phase2Op} />
        </>
      )}

      {phase3Op > 0 && (
        <>
          <GeodeticProjectionGraphic progress={phase3Op} />
          <FormulaConversionCard progress={phase3Op} />
        </>
      )}

      {phase4Op > 0 && <SystemEquivalenceCard progress={phase4Op} />}
    </AbsoluteFill>
  );
};
