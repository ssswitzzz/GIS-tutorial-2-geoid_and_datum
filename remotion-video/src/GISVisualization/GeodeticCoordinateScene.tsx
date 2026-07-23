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

// Section Header at the top
const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], clamp);
  const translateY = interpolate(frame, [0, 20], [-15, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 60,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 20px",
          borderRadius: 24,
          background: "rgba(49, 95, 109, 0.12)",
          border: "1.5px solid rgba(49, 95, 109, 0.3)",
          fontFamily: SERIF,
          fontSize: 16,
          fontWeight: 700,
          color: "#315f6d",
          letterSpacing: "0.05em",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#a77748",
            boxShadow: "0 0 8px #a77748",
          }}
        />
        03 · 坐标系转换
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: "#29342f" }}>
        {title}
      </div>
    </div>
  );
};

// 3D Cartesian Graphic (Phase 1 Left Side)
const CartesianGraphic: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.08) * 3;
  const rotAngle = Math.sin(frame * 0.03) * 4;

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 150,
        width: 780,
        height: 760,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="760"
        height="720"
        viewBox="0 0 760 720"
        style={{ overflow: "visible", filter: "drop-shadow(0 20px 40px rgba(41,52,47,0.12))" }}
      >
        <ellipse
          cx="380"
          cy="380"
          rx="240"
          ry="240"
          fill="url(#earthGradient)"
          stroke="rgba(49,95,109,0.35)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        <ellipse
          cx="380"
          cy="380"
          rx="240"
          ry="85"
          fill="rgba(49,95,109,0.06)"
          stroke="rgba(49,95,109,0.4)"
          strokeWidth="1.5"
          transform={`rotate(${rotAngle}, 380, 380)`}
        />

        <ellipse
          cx="380"
          cy="380"
          rx="160"
          ry="55"
          fill="none"
          stroke="rgba(49,95,109,0.2)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Z Axis */}
        <line x1="380" y1="380" x2="380" y2="70" stroke="#315f6d" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="380,55 372,75 388,75" fill="#315f6d" />
        <text x="395" y="75" fontFamily={SERIF} fontSize="22" fontWeight="bold" fill="#315f6d">
          Z 轴 (地球自转轴)
        </text>

        {/* X Axis */}
        <line x1="380" y1="380" x2="140" y2="520" stroke="#8f4e3e" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="126,528 148,512 142,534" fill="#8f4e3e" />
        <text x="55" y="555" fontFamily={SERIF} fontSize="22" fontWeight="bold" fill="#8f4e3e">
          X 轴 (首子午面交线)
        </text>

        {/* Y Axis */}
        <line x1="380" y1="380" x2="630" y2="490" stroke="#4f745d" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="644,496 622,504 626,482" fill="#4f745d" />
        <text x="645" y="520" fontFamily={SERIF} fontSize="22" fontWeight="bold" fill="#4f745d">
          Y 轴 (东经 90° 交线)
        </text>

        {/* Origin Badge */}
        <circle cx="380" cy="380" r="7" fill="#a77748" />
        <text x="392" y="405" fontFamily={SERIF} fontSize="20" fontWeight="bold" fill="#29342f">
          O (地心)
        </text>

        {/* Target Point P */}
        <line x1="520" y1="190" x2="520" y2="445" stroke="#a77748" strokeWidth="2" strokeDasharray="5 4" />
        <line x1="520" y1="445" x2="380" y2="380" stroke="#a77748" strokeWidth="2" strokeDasharray="5 4" />
        <line x1="520" y1="445" x2="280" y2="438" stroke="#8f4e3e" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="520" y1="445" x2="480" y2="424" stroke="#4f745d" strokeWidth="1.5" strokeDasharray="3 3" />

        <circle cx="520" cy="190" r={16 + pulse} fill="rgba(167, 119, 72, 0.25)" />
        <circle cx="520" cy="190" r="9" fill="#a77748" stroke="#ffffff" strokeWidth="2.5" />

        <foreignObject x="540" y="165" width="220" height="50">
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              background: "rgba(255,253,246,0.95)",
              border: "1.8px solid #a77748",
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 700,
              color: "#29342f",
              display: "inline-block",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <Latex math="P(X, Y, Z)" />
          </div>
        </foreignObject>

        <defs>
          <radialGradient id="earthGradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(49, 95, 109, 0.15)" />
            <stop offset="70%" stopColor="rgba(49, 95, 109, 0.05)" />
            <stop offset="100%" stopColor="rgba(49, 95, 109, 0.22)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// Phase 1 Right Side Explanation Card with Animated Lottie Thinking Emoji
const CartesianExplanationCard: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const questionSpring = enterSpring(frame, 240, fps, 16, 95);

  return (
    <div
      style={{
        position: "absolute",
        right: 80,
        top: 170,
        width: 760,
        height: 720,
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div
        style={{
          padding: 32,
          borderRadius: 24,
          background: "rgba(255, 253, 246, 0.94)",
          border: "1.5px solid rgba(49, 95, 109, 0.28)",
          boxShadow: "0 20px 50px rgba(41, 52, 47, 0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 16,
              background: "rgba(49, 95, 109, 0.12)",
              color: "#315f6d",
              fontFamily: SERIF,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            概念定义
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: "#29342f" }}>
            空间直角坐标系
          </span>
        </div>

        <p style={{ fontFamily: SERIF, fontSize: 18, color: "#4a5953", lineHeight: 1.6, margin: 0 }}>
          以地心 <Latex math="O" /> 为原点，使用三维直角坐标系中的三个长度分量{" "}
          <Latex math="X" />、<Latex math="Y" />、<Latex math="Z" /> 来准确表示空间中任意一点的位置：
        </p>

        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          <div
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: 16,
              background: "#1e2623",
              color: "#f4efe4",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 20, color: "#8f4e3e" }}>
              <Latex math="X" /> 轴
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 14, opacity: 0.85 }}>
              首子午面与赤道交线
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: 16,
              background: "#1e2623",
              color: "#f4efe4",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 20, color: "#4f745d" }}>
              <Latex math="Y" /> 轴
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 14, opacity: 0.85 }}>
              东经 90° 与赤道交线
            </span>
          </div>

          <div
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: 16,
              background: "#1e2623",
              color: "#f4efe4",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 20, color: "#315f6d" }}>
              <Latex math="Z" /> 轴
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 14, opacity: 0.85 }}>
              地球自转轴 (北极)
            </span>
          </div>
        </div>
      </div>

      {/* Animated Question Card with Lottie Thinking Emoji */}
      {questionSpring > 0.01 && (
        <div
          style={{
            transform: `scale(${questionSpring}) translateY(${interpolate(questionSpring, [0, 1], [20, 0])}px)`,
            opacity: questionSpring,
            padding: "24px 28px",
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(167, 119, 72, 0.15) 0%, rgba(143, 78, 62, 0.15) 100%)",
            border: "2px stroke #a77748",
            borderStyle: "dashed",
            boxShadow: "0 16px 40px rgba(167, 119, 72, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Lottie Animated Thinking Emoji */}
          <div style={{ width: 68, height: 68, flexShrink: 0 }}>
            <LottieAsset path="thinking.json" style={{ width: "100%", height: "100%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#29342f" }}>
              那我们熟悉的经纬度跑到哪里去了呢？
            </span>
            <div style={{ fontSize: 16, color: "#8f4e3e", fontWeight: 700 }}>
              <Latex math="(L, B, H)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// GNSS Satellite Constellation Graphic (Phase 2 Left Side)
const GNSSConstellationGraphic: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const orbitRot = frame * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 150,
        width: 720,
        height: 740,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="700" height="700" viewBox="0 0 700 700" style={{ overflow: "visible" }}>
        <circle cx="350" cy="350" r="140" fill="url(#earthGlobe)" stroke="#315f6d" strokeWidth="2" />
        <ellipse cx="350" cy="350" rx="140" ry="45" fill="none" stroke="rgba(49,95,109,0.3)" strokeDasharray="4 4" />

        <ellipse
          cx="350"
          cy="350"
          rx="270"
          ry="110"
          fill="none"
          stroke="rgba(167, 119, 72, 0.4)"
          strokeWidth="1.8"
          transform={`rotate(-25, 350, 350)`}
        />

        <ellipse
          cx="350"
          cy="350"
          rx="270"
          ry="110"
          fill="none"
          stroke="rgba(49, 95, 109, 0.4)"
          strokeWidth="1.8"
          transform={`rotate(40, 350, 350)`}
        />

        <g transform={`rotate(${orbitRot}, 350, 350) translate(620, 350)`}>
          <rect x="-14" y="-10" width="28" height="20" rx="4" fill="#1e2623" stroke="#a77748" strokeWidth="2" />
          <line x1="-30" y1="0" x2="-14" y2="0" stroke="#a77748" strokeWidth="3" />
          <line x1="14" y1="0" x2="30" y2="0" stroke="#a77748" strokeWidth="3" />
        </g>

        <g transform={`rotate(${orbitRot + 120}, 350, 350) translate(620, 350)`}>
          <rect x="-14" y="-10" width="28" height="20" rx="4" fill="#1e2623" stroke="#315f6d" strokeWidth="2" />
          <line x1="-30" y1="0" x2="-14" y2="0" stroke="#315f6d" strokeWidth="3" />
          <line x1="14" y1="0" x2="30" y2="0" stroke="#315f6d" strokeWidth="3" />
        </g>

        <g transform={`rotate(${orbitRot + 240}, 350, 350) translate(620, 350)`}>
          <rect x="-14" y="-10" width="28" height="20" rx="4" fill="#1e2623" stroke="#4f745d" strokeWidth="2" />
          <line x1="-30" y1="0" x2="-14" y2="0" stroke="#4f745d" strokeWidth="3" />
          <line x1="14" y1="0" x2="30" y2="0" stroke="#4f745d" strokeWidth="3" />
        </g>

        <text x="350" y="355" textAnchor="middle" fontFamily={SERIF} fontSize="20" fontWeight="bold" fill="#e3f0eaff">
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
  );
};

// Smartphone Navigation Joke (Phase 2 Right Side) with Animated Warning / Face Asset
const SmartphoneNavigationJoke: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const jokeEntrance = enterSpring(frame, 520, fps, 14, 110);
  const shake = jokeEntrance > 0.1 ? Math.sin(frame * 0.6) * (1 - jokeEntrance) * 8 : 0;

  return (
    <div
      style={{
        position: "absolute",
        right: 120,
        top: 140,
        width: 720,
        height: 780,
        opacity: progress,
        transform: `translateY(${shake}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 440,
          height: 740,
          borderRadius: 48,
          background: "linear-gradient(145deg, #1e2623, #111614)",
          padding: 14,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.08)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 22,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 24,
            borderRadius: 12,
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

          <svg width="412" height="712" style={{ position: "absolute", inset: 0 }}>
            <path d="M-20 280 Q 150 240, 220 380 T 440 500" stroke="#e0d6c3" strokeWidth="32" fill="none" />
            <path d="M-20 280 Q 150 240, 220 380 T 440 500" stroke="#ffffff" strokeWidth="24" fill="none" />
            <path d="M 80 180 L 160 260 L 220 380 L 310 420" stroke="#315f6d" strokeWidth="10" strokeLinecap="round" fill="none" />

            <circle cx="220" cy="380" r={24 + Math.sin(frame * 0.1) * 6} fill="rgba(167, 119, 72, 0.25)" />
            <circle cx="220" cy="380" r="12" fill="#a77748" stroke="#ffffff" strokeWidth="3" />
          </svg>

          <div
            style={{
              padding: "40px 24px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#29342f" }}>
              09:41
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 13, background: "#315f6d", color: "#fff", padding: "3px 10px", borderRadius: 6 }}>
              卫星定位中
            </span>
          </div>

          <div
            style={{
              marginTop: "auto",
              margin: 16,
              padding: 20,
              borderRadius: 24,
              background: "rgba(255, 253, 246, 0.94)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(49, 95, 109, 0.25)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8f4e3e" }} />
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: "#8f4e3e" }}>
                原生空间直角坐标解算结果
              </span>
            </div>

            <div
              style={{
                background: "#1e2623",
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                color: "#76c498",
                fontSize: 18,
              }}
            >
              <div><Latex math="X = +2,168,432.894 \text{ m}" /></div>
              <div><Latex math="Y = -4,387,105.123 \text{ m}" /></div>
              <div><Latex math="Z = +4,077,891.450 \text{ m}" /></div>
            </div>
          </div>
        </div>

        {/* Reaction Badge with Animated Warning MOV */}
        {jokeEntrance > 0.01 && (
          <div
            style={{
              position: "absolute",
              top: 290,
              left: -35,
              right: -35,
              transform: `scale(${jokeEntrance}) rotate(-4deg)`,
              opacity: jokeEntrance,
              padding: "16px 22px",
              borderRadius: 22,
              background: "linear-gradient(135deg, #8f4e3e 0%, #b84c36 100%)",
              color: "#ffffff",
              boxShadow: "0 24px 60px rgba(143, 78, 62, 0.45)",
              border: "3px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              zIndex: 40,
            }}
          >
            {/* Animated Transparent Warning MOV asset */}
            <div style={{ width: 44, height: 44, overflow: "hidden", borderRadius: "50%" }}>
              <OffthreadVideo
                src={staticFile("warning.webm")}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 900, letterSpacing: "0.05em" }}>
              这谁看得懂啊？！
            </span>
          </div>
        )}
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
        top: 150,
        width: 820,
        height: 760,
        opacity: progress,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="800"
        height="720"
        viewBox="0 0 800 720"
        style={{ overflow: "visible", filter: "drop-shadow(0 20px 40px rgba(41,52,47,0.1))" }}
      >
        <ellipse
          cx="400"
          cy="380"
          rx="320"
          ry="210"
          fill="url(#ellipsoidGrad)"
          stroke="#315f6d"
          strokeWidth="3"
        />

        <ellipse
          cx="400"
          cy="380"
          rx="320"
          ry="75"
          fill="rgba(49, 95, 109, 0.08)"
          stroke="rgba(49, 95, 109, 0.4)"
          strokeWidth="1.8"
          strokeDasharray="6 4"
        />

        {/* Axis b */}
        <line x1="400" y1="120" x2="400" y2="610" stroke="#29342f" strokeWidth="2" strokeDasharray="4 4" />
        <foreignObject x="415" y="130" width="160" height="40">
          <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: "#29342f" }}>
            <Latex math="b" /> (短半轴)
          </div>
        </foreignObject>

        {/* Axis a */}
        <line x1="400" y1="380" x2="720" y2="380" stroke="#a77748" strokeWidth="2.5" />
        <foreignObject x="540" y="388" width="160" height="40">
          <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: "#a77748" }}>
            <Latex math="a" /> (长半轴)
          </div>
        </foreignObject>

        {/* Normal Line N */}
        <line x1="480" y1="380" x2="630" y2="180" stroke="#8f4e3e" strokeWidth="3" />

        {/* Latitude B Arc */}
        <path d="M 530 380 A 50 50 0 0 0 522 326" fill="none" stroke="#8f4e3e" strokeWidth="3" />
        <foreignObject x="535" y="325" width="120" height="40">
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#8f4e3e" }}>
            <Latex math="B" /> (纬度)
          </div>
        </foreignObject>

        {/* Longitude L Arc */}
        <path d="M 400 425 A 90 30 0 0 0 470 415" fill="none" stroke="#315f6d" strokeWidth="3" />
        <foreignObject x="425" y="455" width="120" height="40">
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#315f6d" }}>
            <Latex math="L" /> (经度)
          </div>
        </foreignObject>

        {/* Height H */}
        <line x1="560" y1="260" x2="630" y2="180" stroke="#4f745d" strokeWidth="3.5" />
        <foreignObject x="615" y="225" width="140" height="40">
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#4f745d" }}>
            <Latex math="H" /> (大地高)
          </div>
        </foreignObject>

        {/* Projection point P0 */}
        <circle cx="560" cy="260" r="6" fill="#315f6d" />
        <foreignObject x="475" y="270" width="160" height="40">
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#315f6d" }}>
            <Latex math="P_0(L, B, 0)" />
          </div>
        </foreignObject>

        {/* Point P */}
        <circle cx="630" cy="180" r="9" fill="#8f4e3e" stroke="#ffffff" strokeWidth="2.5" />
        <foreignObject x="648" y="160" width="300" height="50">
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "#29342f", whiteSpace: "nowrap" }}>
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

// Phase 3 Right Side Formula Conversion Card with Animated Thumbs Up Lottie Emoji
const FormulaConversionCard: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: 80,
        top: 150,
        width: 780,
        height: 740,
        opacity: progress,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          padding: 28,
          borderRadius: 24,
          background: "rgba(255, 253, 246, 0.92)",
          border: "1.5px solid rgba(49, 95, 109, 0.28)",
          boxShadow: "0 20px 50px rgba(41, 52, 47, 0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 16,
              background: "rgba(167, 119, 72, 0.15)",
              color: "#a77748",
              fontFamily: SERIF,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            几何投影绑定
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#29342f" }}>
            绑定参考椭球体 · 大地坐标系
          </span>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 17, color: "#4a5953", lineHeight: 1.6, margin: 0 }}>
          设备后台通过几何公式，将空间直角坐标 <Latex math="(X, Y, Z)" /> 绑定到参考椭球面上，解算出易于直接理解的大地坐标 <Latex math="(L, B, H)" />。
        </p>
      </div>

      <div
        style={{
          padding: 28,
          borderRadius: 24,
          background: "#1e2623",
          border: "1.5px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          color: "#f4efe4",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: SERIF, fontSize: 16, color: "#a77748", fontWeight: 700 }}>
            坐标转换几何方程
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 14, color: "#7693a0" }}>
            <Latex math="N" /> 为卯酉圈曲率半径
          </span>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 16,
            padding: "20px 24px",
            fontSize: 22,
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

      {/* Output Card with Animated Thumbs Up Lottie Emoji */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: 24,
          background: "linear-gradient(135deg, rgba(79, 116, 93, 0.12) 0%, rgba(49, 95, 109, 0.12) 100%)",
          border: "2px solid #4f745d",
          boxShadow: "0 16px 40px rgba(79, 116, 93, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Lottie Animated Thumbs Up Emoji */}
          <div style={{ width: 56, height: 56, flexShrink: 0 }}>
            <LottieAsset path="thumbs_up.json" style={{ width: "100%", height: "100%" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: "#29342f" }}>
              大地坐标系 <Latex math="(L, B, H)" />
            </span>
            <div style={{ fontSize: 18, color: "#315f6d", fontWeight: 700 }}>
              <Latex math="116^\circ 24' 36'' \text{ E}, \; 39^\circ 54' 12'' \text{ N}, \; H: 43.5\text{ m}" />
            </div>
          </div>
        </div>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            padding: "6px 14px",
            borderRadius: 12,
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

// System Equivalence Summary Card (Phase 4) with Animated Glowing Star MOV
const SystemEquivalenceCard: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 170,
        transform: `translateX(-50%)`,
        width: 1440,
        height: 640,
        opacity: progress,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 36,
        zIndex: 60,
      }}
    >
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 16,
            fontWeight: 700,
            color: "#315f6d",
            letterSpacing: "0.08em",
            padding: "6px 20px",
            borderRadius: 20,
            background: "rgba(49, 95, 109, 0.12)",
          }}
        >
          概念等价性
        </span>
        <h2 style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 700, color: "#29342f", margin: 0 }}>
          地理坐标系 <Latex math="\equiv" /> 大地坐标系
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          width: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: 36,
            borderRadius: 28,
            background: "rgba(255, 253, 246, 0.94)",
            border: "2px solid rgba(49, 95, 109, 0.3)",
            boxShadow: "0 24px 60px rgba(41, 52, 47, 0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>🌐</span>
            <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: "#29342f" }}>
              地理坐标系
            </span>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 18, color: "#4a5953", lineHeight: 1.6, margin: 0 }}>
            日常生活与口语表达中最常用的名称，常统指以“经度 (Longitude)”和“纬度 (Latitude)”表示地球位置的坐标体系。
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a77748 0%, #315f6d 100%)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontSize: 40,
              fontWeight: 900,
              boxShadow: "0 16px 40px rgba(167, 119, 72, 0.35)",
            }}
          >
            ≡
          </div>
          <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: "#a77748" }}>
            大多数情况下等价
          </span>
        </div>

        <div
          style={{
            flex: 1,
            padding: 36,
            borderRadius: 28,
            background: "rgba(255, 253, 246, 0.94)",
            border: "2px solid rgba(167, 119, 72, 0.35)",
            boxShadow: "0 24px 60px rgba(41, 52, 47, 0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>📐</span>
            <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: "#29342f" }}>
              大地坐标系
            </span>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 18, color: "#4a5953", lineHeight: 1.6, margin: 0 }}>
            专业测绘与 GIS 中严谨的科学定义，建立在特定参考椭球体之上，由大地经度 <Latex math="L" />、大地纬度 <Latex math="B" /> 和大地高 <Latex math="H" /> 组成。
          </p>
        </div>
      </div>

      {/* Summary Pill with Glowing Star MOV Video Asset */}
      <div
        style={{
          padding: "14px 40px",
          borderRadius: 30,
          background: "#1e2623",
          color: "#f4efe4",
          fontFamily: SERIF,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: "0.04em",
          boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ width: 36, height: 36, overflow: "hidden", borderRadius: "50%" }}>
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
