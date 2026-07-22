import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {PaperBackground} from "./OpeningSceneElevation";

const SERIF =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const rangeOpacity = (frame: number, start: number, end: number, fade = 12) =>
  interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], clamp);

const enter = (frame: number, start: number, fps: number) =>
  spring({frame: frame - start, fps, config: {damping: 20, stiffness: 80}});

const SectionLabel: React.FC<{index: string; text: string}> = ({index, text}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: MONO,
      fontSize: 17,
      color: "#315f6d",
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        display: "grid",
        placeItems: "center",
        width: 42,
        height: 42,
        border: "1.5px solid rgba(49,95,109,.42)",
        borderRadius: "50%",
        background: "rgba(255,253,246,.82)",
      }}
    >
      {index}
    </span>
    {text}
  </div>
);

const VideoFrame: React.FC<{
  source: string;
  opacity?: number;
  scale?: number;
}> = ({source, opacity = 1, scale = 1}) => (
  <div
    style={{
      position: "absolute",
      left: 690,
      top: 118,
      width: 1040,
      height: 820,
      overflow: "hidden",
      borderRadius: 8,
      background: "#101312",
      border: "1px solid rgba(49,95,109,.28)",
      boxShadow: "0 34px 90px rgba(42,55,48,.2)",
      opacity,
      transform: `scale(${scale})`,
    }}
  >
    <OffthreadVideo
      src={staticFile(source)}
      muted
      style={{width: "100%", height: "100%", objectFit: "contain"}}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.14)",
        pointerEvents: "none",
      }}
    />
  </div>
);

const TerrainTag: React.FC<{
  label: string;
  x: number;
  y: number;
  color: string;
  progress: number;
}> = ({label, x, y, color, progress}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px)`,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      borderRadius: 6,
      background: "rgba(255,253,246,.92)",
      border: `1.5px solid ${color}`,
      boxShadow: "0 12px 30px rgba(0,0,0,.14)",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{width: 9, height: 9, borderRadius: "50%", background: color}} />
    <span style={{fontFamily: SERIF, fontSize: 24, color: "#29342f", fontWeight: 700}}>{label}</span>
  </div>
);

const FormulaStream: React.FC<{intensity: number}> = ({intensity}) => {
  const frame = useCurrentFrame();
  const formulas = [
    "z = f(x, y)",
    "∇²V = -4πGρ",
    "r(φ, λ, h) → ?",
    "Σ|Δhᵢ| → ∞",
    "N = H - h",
    "∂S / ∂t → ∞",
  ];
  return (
    <>
      {formulas.map((formula, i) => {
        const x = 820 + ((i * 239 + frame * (1.1 + i * 0.08)) % 820);
        const y = 180 + ((i * 127 + frame * (0.45 + i * 0.04)) % 600);
        return (
          <div
            key={formula}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: MONO,
              fontSize: 21 + (i % 2) * 5,
              color: i > 3 ? "#8f4e3e" : "#315f6d",
              opacity: intensity * (0.45 + (i % 3) * 0.16),
              transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
              whiteSpace: "nowrap",
            }}
          >
            {formula}
          </div>
        );
      })}
    </>
  );
};

const ComputerWorkbench: React.FC<{progress: number; heat: number}> = ({progress, heat}) => {
  const frame = useCurrentFrame();
  const load = Math.round(interpolate(frame, [486, 600, 648, 724], [8, 48, 100, 100], clamp));
  const shake = heat > 0.72 ? Math.sin(frame * 2.4) * interpolate(heat, [0.72, 1], [0, 5], clamp) : 0;
  const orbScale = interpolate(progress, [0, 1], [0.72, 1], clamp);
  const formulaRows = ["z=f(x,y)", "∇²V=-4πGρ", "r(φ,λ,h)=?", "Σ|Δhᵢ|→∞", "S(x,y,z)=0"];

  return (
    <div
      style={{
        position: "absolute",
        left: 690,
        top: 118,
        width: 1040,
        height: 820,
        transform: `translateX(${shake}px) scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 0 80px",
          borderRadius: 8,
          background: "#26332e",
          border: "12px solid #3c4943",
          boxShadow: "0 34px 90px rgba(42,55,48,.22)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: "#e8e3d8",
            color: "#3d4b45",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <span style={{whiteSpace: "nowrap"}}>地球模型计算台</span>
          <span style={{fontFamily: MONO, color: heat > 0.7 ? "#8f4e3e" : "#4f745d", whiteSpace: "nowrap"}}>
            处理负载 {load}%
          </span>
        </div>

        <div style={{position: "absolute", left: 46, top: 112, width: 330, height: 420}}>
          <div
            style={{
              position: "absolute",
              left: 34,
              top: 28,
              width: 260,
              height: 260,
              borderRadius: "46% 54% 49% 51% / 55% 44% 56% 45%",
              background: "radial-gradient(circle at 32% 28%, #7693a0, #315f6d 58%, #172b33)",
              border: "3px solid #a77748",
              boxShadow: `0 0 ${20 + heat * 46}px rgba(143,78,62,${0.15 + heat * 0.4})`,
              transform: `scale(${orbScale}) rotate(${Math.sin(frame / 14) * 3}deg)`,
            }}
          />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 48 + i * 72,
                top: 310 + Math.sin((frame + i * 10) / 10) * 8,
                width: 62,
                height: 22,
                borderRadius: "50%",
                borderTop: "2px solid rgba(236,230,216,.42)",
                opacity: heat,
              }}
            />
          ))}
          <div style={{position: "absolute", left: 76, bottom: 12, fontSize: 25, color: "#ece6d8", fontWeight: 700, whiteSpace: "nowrap"}}>
            不规则地球体
          </div>
        </div>

        <div style={{position: "absolute", left: 414, top: 292, fontFamily: MONO, fontSize: 54, color: "#a77748"}}>→</div>

        <div
          style={{
            position: "absolute",
            right: 42,
            top: 98,
            width: 500,
            height: 438,
            padding: "26px 30px",
            boxSizing: "border-box",
            borderRadius: 6,
            background: "rgba(255,253,246,.95)",
            border: `2px solid ${heat > 0.65 ? "#8f4e3e" : "#83988d"}`,
          }}
        >
          <div style={{fontSize: 24, fontWeight: 700, color: "#33423b", whiteSpace: "nowrap"}}>尝试建立统一数学表达</div>
          <div style={{marginTop: 22, display: "flex", flexDirection: "column", gap: 12}}>
            {formulaRows.map((formula, i) => {
              const rowProgress = enter(frame, 510 + i * 22, 30);
              return (
                <div
                  key={formula}
                  style={{
                    height: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 14px",
                    borderRadius: 4,
                    background: i < 2 ? "rgba(79,116,93,.1)" : "rgba(143,78,62,.1)",
                    color: i < 2 ? "#315f6d" : "#8f4e3e",
                    fontFamily: MONO,
                    fontSize: 19,
                    opacity: rowProgress,
                    transform: `translateX(${interpolate(rowProgress, [0, 1], [26, 0])}px)`,
                  }}
                >
                  <span style={{whiteSpace: "nowrap"}}>{formula}</span>
                  <span style={{fontFamily: SERIF, fontSize: 16, fontWeight: 700, whiteSpace: "nowrap"}}>{i < 2 ? "计算中" : "过于复杂"}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{position: "absolute", left: 54, right: 54, bottom: 42}}>
          <div style={{display: "flex", justifyContent: "space-between", color: "#ece6d8", fontSize: 18, fontWeight: 700}}>
            <span style={{whiteSpace: "nowrap"}}>核心温度</span>
            <span style={{fontFamily: MONO, color: heat > 0.68 ? "#f2a68e" : "#b9d0c1", whiteSpace: "nowrap"}}>{Math.round(48 + heat * 62)}°C</span>
          </div>
          <div style={{height: 16, borderRadius: 3, background: "rgba(255,255,255,.12)", marginTop: 10, overflow: "hidden"}}>
            <div
              style={{
                width: `${interpolate(frame, [486, 724], [18, 100], clamp)}%`,
                height: "100%",
                background: heat > 0.68 ? "#b75f49" : "#6f9a7d",
              }}
            />
          </div>
        </div>
      </div>
      <div style={{position: "absolute", left: 420, right: 160, bottom: 24, height: 56, background: "#4a5650", borderRadius: "0 0 20px 20px"}} />
      <div style={{position: "absolute", left: 330, right: 70, bottom: 0, height: 24, background: "#66716c", borderRadius: "24px 24px 5px 5px"}} />
    </div>
  );
};

const ApproximationOrb: React.FC<{
  index: string;
  title: string;
  subtitle: string;
  color: string;
  progress: number;
  kind: "irregular" | "smooth" | "grid";
}> = ({index, title, subtitle, color, progress, kind}) => {
  const frame = useCurrentFrame();
  const wobble = kind === "irregular" ? 4 + Math.sin(frame / 8) * 2 : kind === "smooth" ? 1.5 : 0;
  return (
    <div
      style={{
        width: 410,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [44, 0])}px)`,
      }}
    >
      <div style={{position: "relative", width: 250, height: 250}}>
        <div
          style={{
            position: "absolute",
            inset: 14 + wobble,
            borderRadius: kind === "irregular" ? "45% 55% 48% 52% / 53% 43% 57% 47%" : "50%",
            background:
              kind === "irregular"
                ? "radial-gradient(circle at 32% 28%, #7693a0, #315f6d 58%, #253a42)"
                : "radial-gradient(circle at 32% 28%, #fffdf6, #dbe7df 66%, #9bb3a4)",
            border: `3px solid ${color}`,
            boxShadow: "0 24px 55px rgba(42,64,54,.18)",
            transform: kind === "irregular" ? `rotate(${Math.sin(frame / 18) * 2}deg)` : "none",
          }}
        />
        {kind === "grid" && (
          <svg viewBox="0 0 250 250" style={{position: "absolute", inset: 0}}>
            <circle cx="125" cy="125" r="105" fill="none" stroke="#315f6d" strokeWidth="2" />
            {[55, 90, 125, 160, 195].map((cy) => (
              <ellipse key={cy} cx="125" cy={cy} rx="100" ry="20" fill="none" stroke="rgba(49,95,109,.42)" />
            ))}
            {[55, 90, 125, 160, 195].map((cx) => (
              <ellipse key={cx} cx={cx} cy="125" rx="20" ry="100" fill="none" stroke="rgba(49,95,109,.42)" />
            ))}
          </svg>
        )}
        <div
          style={{
            position: "absolute",
            left: 4,
            top: 8,
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            background: color,
            color: "#fff",
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {index}
        </div>
      </div>
      <div style={{fontFamily: SERIF, fontSize: 34, fontWeight: 700, color: "#29342f", whiteSpace: "nowrap"}}>{title}</div>
      <div style={{fontFamily: MONO, fontSize: 15, color: "#68726d", marginTop: 8, whiteSpace: "nowrap"}}>{subtitle}</div>
    </div>
  );
};

const RoadmapCard: React.FC<{
  stage: string;
  title: string;
  description: string;
  role: string;
  color: string;
  progress: number;
  shape: "geoid" | "ellipsoid" | "datum";
}> = ({stage, title, description, role, color, progress, shape}) => (
  <div
    style={{
      height: 420,
      padding: "26px 28px",
      boxSizing: "border-box",
      borderRadius: 8,
      background: "rgba(255,253,246,.96)",
      border: `2px solid ${color}66`,
      boxShadow: "0 20px 55px rgba(45,62,53,.12)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [64, 0])}px) scale(${interpolate(progress, [0, 1], [0.94, 1])})`,
    }}
  >
    <div>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <div
          style={{
            padding: "7px 14px",
            borderRadius: 5,
            background: color,
            color: "#fff",
            fontSize: 17,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {stage}
        </div>
        <div style={{position: "relative", width: 90, height: 70}}>
          <div
            style={{
              position: "absolute",
              left: shape === "ellipsoid" ? 9 : 13,
              top: shape === "ellipsoid" ? 17 : 10,
              width: shape === "ellipsoid" ? 72 : 62,
              height: shape === "ellipsoid" ? 42 : 62,
              borderRadius: shape === "geoid" ? "45% 55% 48% 52% / 55% 44% 56% 45%" : "50%",
              border: `2px solid ${color}`,
              background: `${color}18`,
            }}
          />
          {shape === "datum" && (
            <>
              <div style={{position: "absolute", left: 6, top: 7, width: 76, height: 66, border: `1px dashed ${color}`, borderRadius: "50%"}} />
              <div style={{position: "absolute", left: 44, top: 2, height: 76, width: 1, background: color}} />
              <div style={{position: "absolute", left: 5, top: 39, width: 78, height: 1, background: color}} />
            </>
          )}
        </div>
      </div>
      <div style={{fontSize: 38, fontWeight: 700, color, marginTop: 20, whiteSpace: "nowrap"}}>{title}</div>
      <div style={{fontSize: 21, lineHeight: 1.55, color: "#59635e", marginTop: 18}}>{description}</div>
    </div>
    <div
      style={{
        padding: "13px 16px",
        borderRadius: 5,
        background: `${color}14`,
        color,
        fontSize: 18,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      核心作用：{role}
    </div>
  </div>
);

export const EarthApproximationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Relative to SRT 00:29.600. Every boundary below follows entries 14-31.
  const intro = rangeOpacity(frame, 0, 118, 10);
  const terrain = rangeOpacity(frame, 94, 379, 14);
  const math = rangeOpacity(frame, 366, 486, 12);
  const computer = rangeOpacity(frame, 474, 735, 12);
  const simplify = rangeOpacity(frame, 724, 1019, 14);
  const finale = rangeOpacity(frame, 1004, 1103, 12);

  const introIn = enter(frame, 0, fps);
  const terrainIn = enter(frame, 100, fps);
  const mathIn = enter(frame, 379, fps);
  const pcIn = enter(frame, 486, fps);
  const simplifyIn = enter(frame, 735, fps);
  const finalIn = enter(frame, 1019, fps);
  const irregularity = interpolate(frame, [255, 306, 366], [0, 0.45, 1], clamp);
  const equationIntensity = interpolate(frame, [413, 474], [0.15, 1], {...clamp, easing: ease});
  const heat = interpolate(frame, [582, 648, 724], [0, 0.82, 1], clamp);

  return (
    <AbsoluteFill style={{overflow: "hidden", color: "#29342f", fontFamily: SERIF}}>
      <PaperBackground tone={frame >= 724 ? "warm" : "light"} />

      {frame < 118 && (
        <AbsoluteFill style={{opacity: intro}}>
          <div style={{position: "absolute", left: 150, top: 126, opacity: introIn}}>
            <SectionLabel index="02" text="把地球变成数学对象" />
          </div>
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 292,
              width: 1040,
              transform: `translateY(${interpolate(introIn, [0, 1], [52, 0])}px)`,
              opacity: introIn,
            }}
          >
            <div style={{fontSize: 92, lineHeight: 1.08, fontWeight: 700, whiteSpace: "nowrap"}}>先看一眼</div>
            <div style={{fontSize: 92, lineHeight: 1.08, fontWeight: 700, color: "#315f6d", whiteSpace: "nowrap"}}>地球真实的样貌</div>
            <div style={{marginTop: 30, fontSize: 24, color: "#68726d", whiteSpace: "nowrap"}}>真实地球 · 真实表面 · 真实复杂度</div>
          </div>
          <div
            style={{
              position: "absolute",
              right: 170,
              bottom: 112,
              width: 440,
              height: 440,
              borderRadius: "50%",
              border: "1px dashed rgba(49,95,109,.38)",
              transform: `scale(${interpolate(introIn, [0, 1], [0.72, 1])}) rotate(${frame * 0.2}deg)`,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 48 + i * 48,
                  borderRadius: i === 0 ? "46% 54% 49% 51% / 55% 44% 56% 45%" : "50%",
                  border: `${3 - i * 0.6}px solid ${i === 0 ? "#315f6d" : i === 1 ? "#4f745d" : "#a77748"}`,
                }}
              />
            ))}
          </div>
        </AbsoluteFill>
      )}

      {frame >= 94 && frame < 379 && (
        <AbsoluteFill style={{opacity: terrain}}>
          <div style={{position: "absolute", left: 130, top: 112, width: 470, opacity: terrainIn}}>
            <SectionLabel index="02.1" text="不规则地表" />
            <div style={{fontSize: 64, lineHeight: 1.12, fontWeight: 700, marginTop: 42}}>海洋与湖泊</div>
            <div style={{fontSize: 64, lineHeight: 1.12, fontWeight: 700, color: "#4f745d"}}>高山与丘陵</div>
            <div style={{width: 360, height: 2, background: "rgba(49,95,109,.24)", margin: "34px 0"}} />
            <div style={{fontSize: 28, lineHeight: 1.55, color: "#59635e"}}>真实地表从来不是<br />一个光滑的球面。</div>
            <div
              style={{
                marginTop: 42,
                display: "inline-flex",
                padding: "12px 18px",
                borderRadius: 6,
                background: irregularity > 0.5 ? "#8f4e3e" : "#315f6d",
                color: "#fff",
                fontFamily: MONO,
                fontSize: 16,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              地表不规则度 {Math.round(irregularity * 99)}%
            </div>
          </div>
          <Sequence from={94} layout="none">
            <VideoFrame source="geoid-height-rotation.mp4" scale={interpolate(terrainIn, [0, 1], [0.94, 1])} />
          </Sequence>
          {frame >= 118 && (
            <TerrainTag label="海洋 · 湖泊" x={760} y={680} color="#315f6d" progress={enter(frame, 118, fps)} />
          )}
          {frame >= 203 && (
            <TerrainTag label="高山 · 丘陵" x={1370} y={270} color="#a77748" progress={enter(frame, 203, fps)} />
          )}
          {frame >= 306 && (
            <div
              style={{
                position: "absolute",
                right: 126,
                bottom: 78,
                padding: "18px 26px",
                borderRadius: 6,
                background: "#fffdf6",
                border: "2px solid #8f4e3e",
                boxShadow: "0 18px 45px rgba(51,43,37,.18)",
                fontSize: 30,
                fontWeight: 700,
                color: "#8f4e3e",
                transform: `rotate(-2deg) scale(${enter(frame, 306, fps)})`,
                whiteSpace: "nowrap",
              }}
            >
              十分，甚至九分的不规则
            </div>
          )}
        </AbsoluteFill>
      )}

      {frame >= 366 && frame < 486 && (
        <AbsoluteFill style={{opacity: math}}>
          <div style={{position: "absolute", left: 140, top: 118, opacity: mathIn}}>
            <SectionLabel index="02.2" text="数学计算难题" />
            <div style={{fontSize: 76, lineHeight: 1.08, fontWeight: 700, marginTop: 42}}>真实，很复杂。</div>
            <div style={{fontSize: 76, lineHeight: 1.08, fontWeight: 700, color: "#8f4e3e"}}>计算，更困难。</div>
            <div style={{marginTop: 34, fontSize: 26, color: "#68726d", whiteSpace: "nowrap"}}>不规则边界意味着无法写出简洁、稳定的统一公式</div>
          </div>
          <FormulaStream intensity={equationIntensity} />
          <div
            style={{
              position: "absolute",
              right: 170,
              bottom: 104,
              width: 540,
              height: 154,
              borderRadius: 8,
              background: "rgba(143,78,62,.95)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              padding: "0 42px",
              gap: 28,
              transform: `translateY(${interpolate(mathIn, [0, 1], [50, 0])}px)`,
            }}
          >
            <div style={{fontFamily: MONO, fontSize: 58, fontWeight: 700}}>!</div>
            <div>
              <div style={{fontSize: 30, fontWeight: 700, whiteSpace: "nowrap"}}>数学表达受阻</div>
              <div style={{fontSize: 17, marginTop: 8, opacity: 0.82, whiteSpace: "nowrap"}}>模型复杂度持续上升</div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {frame >= 474 && frame < 735 && (
        <AbsoluteFill style={{opacity: computer}}>
          <div style={{position: "absolute", inset: 0, background: `rgba(143,78,62,${heat * 0.18})`}} />
          <div style={{position: "absolute", left: 122, top: 102, width: 520, opacity: pcIn}}>
            <SectionLabel index="02.3" text="计算机过载" />
            <div style={{fontSize: 66, lineHeight: 1.1, fontWeight: 700, marginTop: 38}}>把真实地球</div>
            <div style={{fontSize: 66, lineHeight: 1.1, fontWeight: 700, color: "#315f6d"}}>塞进数学公式？</div>
            <div style={{marginTop: 34, fontSize: 20, color: "#68726d", lineHeight: 1.8}}>
              输入：不规则地球体<br />
              目标：统一数学公式<br />
              状态：正在计算……
            </div>
          </div>
          <ComputerWorkbench progress={pcIn} heat={heat} />
          <FormulaStream intensity={interpolate(frame, [546, 648], [0.15, 0.85], clamp)} />
          {frame >= 648 && (
            <div
              style={{
                position: "absolute",
                left: 110,
                bottom: 112,
                padding: "20px 28px",
                borderRadius: 6,
                background: "#8f4e3e",
                color: "#fff",
                boxShadow: "0 18px 50px rgba(143,78,62,.28)",
                transform: `scale(${enter(frame, 648, fps)}) rotate(-2deg)`,
              }}
            >
              <div style={{fontSize: 34, fontWeight: 700, whiteSpace: "nowrap"}}>闻到电脑的烧焦味了</div>
              <div style={{fontSize: 17, marginTop: 8, opacity: 0.86, whiteSpace: "nowrap"}}>温度过高，计算终止</div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {frame >= 724 && frame < 1019 && (
        <AbsoluteFill style={{opacity: simplify}}>
          <div style={{position: "absolute", left: 140, top: 94, opacity: simplifyIn}}>
            <SectionLabel index="02.4" text="从真实世界到数学模型" />
            <div style={{fontSize: 64, fontWeight: 700, marginTop: 28, whiteSpace: "nowrap"}}>保留地球特征，降低数学复杂度</div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 120,
              right: 120,
              top: 300,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ApproximationOrb index="00" title="真实地球" subtitle="凹凸不平" color="#8f4e3e" progress={enter(frame, 735, fps)} kind="irregular" />
            <div style={{fontFamily: MONO, fontSize: 48, color: "#a77748", opacity: enter(frame, 830, fps)}}>→</div>
            <ApproximationOrb index="01" title="物理简化" subtitle="保留主要特征" color="#4f745d" progress={enter(frame, 830, fps)} kind="smooth" />
            <div style={{fontFamily: MONO, fontSize: 48, color: "#a77748", opacity: enter(frame, 888, fps)}}>→</div>
            <ApproximationOrb index="02" title="数学表达" subtitle="形成可计算模型" color="#315f6d" progress={enter(frame, 888, fps)} kind="grid" />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 92,
              transform: "translateX(-50%)",
              fontSize: 25,
              color: "#59635e",
              whiteSpace: "nowrap",
            }}
          >
            数学家与物理学家：用可计算的模型，逐级逼近不可直接表达的真实地球
          </div>
        </AbsoluteFill>
      )}

      {frame >= 1004 && (
        <AbsoluteFill style={{opacity: finale}}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 80,
              width: 1640,
              textAlign: "center",
              transform: `translate(-50%, ${interpolate(finalIn, [0, 1], [38, 0])}px)`,
              opacity: finalIn,
            }}
          >
            <div style={{fontSize: 20, color: "#315f6d", fontWeight: 700, whiteSpace: "nowrap"}}>02.5 · 测绘学的经典解决方案</div>
            <div style={{fontSize: 72, lineHeight: 1.08, fontWeight: 700, marginTop: 10, whiteSpace: "nowrap"}}>地球的三级逼近</div>
            <div style={{fontSize: 24, color: "#68726d", marginTop: 10, whiteSpace: "nowrap"}}>从复杂真实，逐级走向可计算模型</div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 332,
              width: 1640,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 30,
            }}
          >
            <RoadmapCard
              stage="01 · 一级逼近"
              title="大地水准面"
              description="以重力等位面逼近真实地球，建立统一的物理表面。"
              role="定义绝对高程"
              color="#4f745d"
              progress={enter(frame, 1019, fps)}
              shape="geoid"
            />
            <RoadmapCard
              stage="02 · 二级逼近"
              title="旋转椭球面"
              description="用规则旋转椭球近似地球形状，使其能够严密计算。"
              role="推导经纬度"
              color="#315f6d"
              progress={enter(frame, 1031, fps)}
              shape="ellipsoid"
            />
            <RoadmapCard
              stage="03 · 三级逼近"
              title="大地基准面"
              description="定位并调整旋转椭球，使其贴合国家或区域的地表。"
              role="建立坐标系统"
              color="#a77748"
              progress={enter(frame, 1043, fps)}
              shape="datum"
            />
            <div
              style={{
                gridColumn: "1 / -1",
                height: 5,
                width: interpolate(frame, [1022, 1084], [0, 1580], clamp),
                background: "linear-gradient(90deg, #4f745d, #315f6d, #a77748)",
                margin: "12px auto 0",
                borderRadius: 3,
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
