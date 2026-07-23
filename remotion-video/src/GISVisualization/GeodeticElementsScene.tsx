import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import katex from "katex";
import "katex/dist/katex.min.css";
import { PaperBackground } from "./OpeningSceneElevation";

const SERIF = "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Noto Serif SC', SimSun, serif";
const SANS = "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Noto Serif SC', SimSun, serif";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const step = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1], { ...clamp, easing: ease });
const visible = (frame: number, from: number, to: number, edge = 18) => interpolate(frame, [from, from + edge, to - edge, to], [0, 1, 1, 0], clamp);
const inSpring = (frame: number, from: number, fps: number) => spring({ frame: Math.max(0, frame - from), fps, config: { damping: 200, stiffness: 105 } });

const Latex: React.FC<{ math: string; style?: React.CSSProperties }> = ({ math, style }) => {
  const html = useMemo(() => katex.renderToString(math, { throwOnError: false }), [math]);
  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};

const Header: React.FC<{ index: string; title: string; color?: string }> = ({ index, title, color = "#315f6d" }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const p = inSpring(frame, 0, fps);
  return (
    <div style={{ position: "absolute", zIndex: 10, left: 104, top: 70, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [-18, 0])}px)`, display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ padding: "9px 13px", border: `1px solid ${color}66`, borderRadius: 4, background: "rgba(255,253,246,.75)", color, fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>
        <Latex math={index} />
      </div>
      <div style={{ width: 34, height: 1, background: color }} />
      <div style={{ fontFamily: SERIF, color: "#29342f", fontSize: 28, fontWeight: 700 }}>{title}</div>
    </div>
  );
};

const Callout: React.FC<{ x: number; y: number; color?: string; p: number; children: React.ReactNode }> = ({ x, y, color = "#29342f", p, children }) => (
  <div style={{ position: "absolute", zIndex: 5, left: x, top: y, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [13, 0])}px)`, padding: "8px 14px", borderRadius: 5, background: "rgba(255,253,246,.95)", border: `1px solid ${color}66`, color, boxShadow: "0 8px 20px rgba(41,52,47,.08)", fontFamily: SERIF, fontWeight: 700, fontSize: 20, whiteSpace: "nowrap" }}>
    {children}
  </div>
);

const Intro: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const p = inSpring(frame, 15, fps);
  const elements = [
    { k: "L", n: "大地经度", c: "#a77748", x: 530, y: 692, d: 35 },
    { k: "B", n: "大地纬度", c: "#315f6d", x: 835, y: 760, d: 61 },
    { k: "H", n: "大地高", c: "#4f745d", x: 1140, y: 692, d: 87 }
  ];
  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04" title="大地坐标系的三个要素" />
      <div style={{ position: "absolute", left: 166, top: 276, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [36, 0])}px)` }}>
        <div style={{ fontFamily: SERIF, color: "#29342f", fontSize: 72, lineHeight: 1.1, fontWeight: 700 }}>定位一个地点</div>
        <div style={{ fontFamily: SERIF, color: "#315f6d", fontSize: 72, lineHeight: 1.1, fontWeight: 700 }}>需要哪三个量？</div>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(960 552) rotate(${frame * .18})`}>
          {[0, 60, 120].map((a, i) => (
            <ellipse key={a} cx="0" cy="0" rx={276 - i * 42} ry={94 - i * 13} fill="none" stroke={["#a77748", "#315f6d", "#4f745d"][i]} strokeOpacity=".37" strokeWidth="2" transform={`rotate(${a})`} />
          ))}
        </g>
        <circle cx="960" cy="552" r={116 + Math.sin(frame / 12) * 4} fill="#315f6d" fillOpacity=".1" stroke="#315f6d" strokeWidth="2" />
        <circle cx="960" cy="552" r="76" fill="#fffdf6" stroke="#a77748" strokeWidth="2" />
        <text x="960" y="565" textAnchor="middle" fontFamily={SERIF} fontSize="33" fontWeight="bold" fill="#29342f">P</text>
      </svg>
      {elements.map((e) => {
        const q = inSpring(frame, e.d, fps);
        return (
          <div key={e.k} style={{ position: "absolute", left: e.x, top: e.y, display: "flex", alignItems: "center", gap: 12, opacity: q, transform: `scale(${interpolate(q, [0, 1], [.82, 1])}) translateY(${interpolate(q, [0, 1], [18, 0])}px)` }}>
            <div style={{ display: "grid", placeItems: "center", width: 60, height: 60, borderRadius: "50%", color: "#fff", background: e.c, fontFamily: SERIF, fontSize: 32, fontWeight: 700, boxShadow: `0 12px 26px ${e.c}55` }}>
              <Latex math={e.k} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 25, color: "#29342f", fontWeight: 700 }}>{e.n}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Longitude: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const local = frame - 145; const p = inSpring(local, 0, fps); const sweep = step(local, 112, 415); const angle = interpolate(sweep, [0, 1], [0, 116.4]); const rad = (angle * Math.PI) / 180;

  // Globe geometry
  const cx = 1010, cy = 530, sphereRx = 300, sphereRy = 284, eqRy = 38;

  // Prime meridian viewing angle — its bezier control bulges left to x=770
  const primeCtrlX = 770;
  const phi0 = Math.asin((primeCtrlX - cx) / sphereRy); // ≈ -57.7°

  // Local meridian control: starts overlapping prime meridian, sweeps eastward (right)
  const ctrlX = cx + sphereRy * Math.sin(phi0 + rad);

  // Point P exactly ON the quadratic bezier of the local meridian (not the control point!)
  // Bezier: P0 = (cx, cy−sphereRy), P1 = (ctrlX, cy), P2 = (cx, cy+sphereRy)
  const tP = 0.28; // northern-hemisphere position on the arc
  const pPx = (1 - tP) ** 2 * cx + 2 * (1 - tP) * tP * ctrlX + tP ** 2 * cx;
  const pPy = (1 - tP) ** 2 * (cy - sphereRy) + 2 * (1 - tP) * tP * cy + tP ** 2 * (cy + sphereRy);

  // Equatorial sweep arc — traces the equatorial ellipse from prime to local meridian
  const arcSegs = 32;
  const eqArcPts: string[] = [];
  for (let i = 0; i <= arcSegs; i++) {
    const theta = phi0 + (rad * i) / Math.max(arcSegs, 1);
    eqArcPts.push(`${i === 0 ? "M" : "L"} ${(cx + sphereRy * Math.sin(theta)).toFixed(1)} ${(cy + eqRy * Math.cos(theta)).toFixed(1)}`);
  }
  const eqArcPath = eqArcPts.join(" ");

  // Arrowhead at end of equatorial arc
  const thetaEnd = phi0 + rad;
  const arrowX = cx + sphereRy * Math.sin(thetaEnd);
  const arrowY = cy + eqRy * Math.cos(thetaEnd);
  const arrowDeg = Math.atan2(-eqRy * Math.sin(thetaEnd), sphereRy * Math.cos(thetaEnd)) * 180 / Math.PI;

  // Perspective-corrected dihedral-angle fan at centre
  const fanR = 60, fanRy = 18;
  const fanPts = [`M ${cx} ${cy}`];
  for (let i = 0; i <= 20; i++) {
    const th = phi0 + (rad * i) / 20;
    fanPts.push(`L ${(cx + fanR * Math.sin(th)).toFixed(1)} ${(cy + fanRy * Math.cos(th)).toFixed(1)}`);
  }
  fanPts.push("Z");
  const fanPath = fanPts.join(" ");

  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04.1" title="大地经度 L" color="#a77748" />
      <div style={{ position: "absolute", zIndex: 4, left: 116, top: 198, width: 475, opacity: p }}>
        <div style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1.2, color: "#29342f", fontWeight: 700 }}>子午面绕着<br /><span style={{ color: "#a77748" }}>旋转轴</span>转动</div>
        <div style={{ width: 270, height: 2, background: "#a7774888", margin: "28px 0" }} />
        <div style={{ fontFamily: SANS, fontSize: 21, lineHeight: 1.7, color: "#5d6964" }}>地点所在子午面与本初子午面<br />之间的夹角，就是大地经度</div>
      </div>
      
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 24px 35px rgba(41,52,47,.14))" }}>
        <defs>
          <radialGradient id="earthLong" cx="34%" cy="28%" r="70%">
            <stop offset="0" stopColor="#7898a2" />
            <stop offset=".72" stopColor="#315f6d" />
            <stop offset="1" stopColor="#213c47" />
          </radialGradient>
        </defs>
        {/* Globe Body */}
        <ellipse cx={cx} cy={cy} rx={sphereRx} ry={sphereRy} fill="url(#earthLong)" stroke="#315f6d" strokeWidth="3" />
        {/* Latitude Parallels */}
        {[-170, -85, 0, 85, 170].map((off) => (
          <ellipse key={off} cx={cx} cy={cy + off} rx={Math.sqrt(Math.max(0, sphereRy * sphereRy - off * off))} ry={Math.max(5, eqRy - Math.abs(off) * .12)} fill="none" stroke="#fff" strokeOpacity=".23" strokeWidth="1.5" />
        ))}
        
        {/* Vertical Rotation Axis Z */}
        <line x1={cx} y1="155" x2={cx} y2="902" stroke="#fffdf6" strokeOpacity=".85" strokeWidth="4" />
        
        {/* Prime Meridian Plane Sector (Greenwich 0°) */}
        <path d={`M ${cx} ${cy - sphereRy} Q ${primeCtrlX} ${cy} ${cx} ${cy + sphereRy} L ${cx} ${cy - sphereRy} Z`} fill="#a77748" fillOpacity=".25" stroke="#a77748" strokeWidth="3.5" />
        
        {/* Dynamic Local Meridian — starts at prime meridian, sweeps east */}
        <path d={`M ${cx} ${cy - sphereRy} Q ${ctrlX} ${cy} ${cx} ${cy + sphereRy} L ${cx} ${cy - sphereRy} Z`} fill="#f4c875" fillOpacity=".38" stroke="#f4c875" strokeWidth="4.5" />
        
        {/* Equatorial direction arc with arrowhead */}
        {angle > 5 && (
          <>
            <path d={eqArcPath} fill="none" stroke="#f4c875" strokeWidth="3.5" strokeOpacity=".9" />
            <g transform={`translate(${arrowX.toFixed(1)}, ${arrowY.toFixed(1)}) rotate(${arrowDeg.toFixed(1)})`}>
              <polygon points="0,-6 12,0 0,6" fill="#f4c875" />
            </g>
          </>
        )}
        
        {/* Dihedral angle fan at centre */}
        <path d={fanPath} fill="#f4c875" fillOpacity=".85" />
        
        {/* Point P on the local meridian arc */}
        <circle cx={pPx} cy={pPy} r="11" fill="#f6d47f" stroke="#fffdf6" strokeWidth="3" />
        <circle cx={pPx} cy={pPy} r={21 + Math.sin(frame * .18) * 4} fill="none" stroke="#f6d47f" strokeWidth="2" strokeOpacity=".65" />
      </svg>

      <Callout x={817} y={852} color="#315f6d" p={step(local, 28, 80)}>地球自转轴 Z</Callout>
      <Callout x={730} y={380} color="#a77748" p={step(local, 80, 140)}>本初子午面 (格林尼治 <Latex math="0^\circ" />)</Callout>
      <Callout x={Math.min(1320, pPx + 25)} y={pPy - 40} color="#a77748" p={step(local, 105, 160)}>地点 P 所在子午面</Callout>
      <Callout x={1070} y={618} color="#a77748" p={step(local, 185, 240)}><Latex math={`L = ${angle.toFixed(1)}^\\circ`} /></Callout>
      
      <div style={{ position: "absolute", right: 112, bottom: 104, width: 420, padding: "25px 29px", opacity: step(local, 365, 430), borderRadius: 7, background: "rgba(255,253,246,.94)", border: "1px solid #a7774877", boxShadow: "0 18px 40px rgba(41,52,47,.1)" }}>
        <div style={{ fontFamily: SANS, color: "#a77748", fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>经度的方向约定</div>
        <div style={{ fontFamily: SERIF, color: "#29342f", fontWeight: 700, fontSize: 29, marginTop: 8 }}>东经 / 西经各 <Latex math="180^\circ" /></div>
      </div>
    </AbsoluteFill>
  );
};

const Latitude: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const local = frame - 680; const p = inSpring(local, 0, fps); const geo = step(local, 85, 260); const ellip = step(local, 420, 590); 
  
  // Ellipsoid Center O = (932, 556)
  const cx = 932; const cy = 556; 
  // Point P on Ellipse: px = 1178, py = 393.5
  const px = 1178; const py = 393.5; 
  
  // Equatorial Intersection of Normal Line N_eq = (1062.8, 556)
  const neq_x = 1062.8;

  // Fade out spherical stage callouts when transitioning to ellipsoid stage
  const sphereCalloutOpacity = (1 - step(local, 380, 450));

  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04.2" title="大地纬度 B" color="#315f6d" />
      <div style={{ position: "absolute", zIndex: 4, left: 116, top: 196, width: 525, opacity: p }}>
        <div style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 1.25, color: "#29342f", fontWeight: 700 }}>
          大地纬度 <Latex math="B" /><br />
          <span style={{ color: "#315f6d" }}>法线与赤道面的夹角</span>
        </div>
        <div style={{ fontFamily: SERIF, color: "#5d6964", fontSize: 20, lineHeight: 1.7, marginTop: 24 }}>
          在正球体中，地心连线与法线重合；<br />
          但在旋转椭球体上，<span style={{ color: "#a77748", fontWeight: 700 }}>过点 P 的法线不再经过地心</span>。<br />
          法线与赤道平面的夹角即为大地纬度。
        </div>
      </div>
      
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="earthLat" cx="34%" cy="25%" r="74%">
            <stop offset="0" stopColor="#90a8ae" />
            <stop offset="1" stopColor="#315f6d" />
          </radialGradient>
        </defs>
        {/* Ellipsoid Body */}
        <ellipse cx={cx} cy={cy} rx={interpolate(ellip, [0, 1], [282, 342])} ry={interpolate(ellip, [0, 1], [282, 234])} fill="url(#earthLat)" stroke="#315f6d" strokeWidth="3" />
        {/* Equatorial Line */}
        <line x1="603" y1={cy} x2="1415" y2={cy} stroke="#fffdf6" strokeOpacity=".8" strokeWidth="3" />
        {/* Rotation Axis Z */}
        <line x1={cx} y1="245" x2={cx} y2="860" stroke="#fffdf6" strokeOpacity=".42" strokeWidth="2" strokeDasharray="7 7" />
        
        {/* Geocentric Line OP in Terracotta Red */}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#8f4e3e" strokeWidth="4" strokeDasharray="8 6" strokeOpacity={1 - ellip * .35} />
        
        {/* EXACT Ellipsoid Tangent Line at P: Red Line going from top-left (978, 251.7) to bottom-right (1378, 535.3) */}
        <line x1="978" y1="251.7" x2="1378" y2="535.3" stroke="#e05638" strokeWidth="3.5" strokeOpacity={ellip} strokeDasharray="8 5" />
        
        {/* Normal Line at P extending INWARDS across Ellipsoid to Equatorial Intersection N_eq(neq_x, cy) */}
        <line x1={px + 50} y1={py - 70.5} x2={neq_x} y2={cy} stroke="#a77748" strokeWidth="4.5" strokeOpacity={ellip} />
        
        {/* RIGOROUS 90° Right Angle Mark (\perp) between Tangent Line (red) and Normal Line (gold) at P */}
        <path d="M 1161.7 381.9 L 1150.1 398.2 L 1166.4 409.8" fill="none" stroke="#e05638" strokeWidth="3" strokeOpacity={ellip} />
        
        {/* Geocentric Angle Arc psi */}
        <path d={`M ${cx} ${cy} L ${cx + 90} ${cy} A 90 90 0 0 0 ${cx + 90 * 0.84} ${cy - 90 * 0.54} Z`} fill="#8f4e3e" fillOpacity={geo * (1 - ellip * 0.7)} />
        
        {/* Geodetic Angle Arc B at Intersection N_eq */}
        <path d={`M ${neq_x} ${cy} L ${neq_x + 80} ${cy} A 80 80 0 0 0 ${neq_x + 80 * 0.58} ${cy - 80 * 0.81} Z`} fill="#f2c66c" fillOpacity={ellip * .72} />
        
        {/* Normal Intersection Point N_eq on Equatorial Line */}
        <circle cx={neq_x} cy={cy} r="6" fill="#a77748" stroke="#fffdf6" strokeWidth="1.5" opacity={ellip} />
        
        {/* Dashed Gap Line on Equator between Center O(cx, cy) and N_eq */}
        <line x1={cx} y1={cy + 14} x2={neq_x} y2={cy + 14} stroke="#a77748" strokeWidth="2" strokeDasharray="4 3" opacity={ellip} />
        
        {/* Ellipsoid Center O */}
        <circle cx={cx} cy={cy} r="7" fill="#fffdf6" />
        {/* Surface Point P */}
        <circle cx={px} cy={py} r="11" fill="#f6d47f" stroke="#fffdf6" strokeWidth="3" />
      </svg>

      {/* PHASE 1 CALLOUTS (Spherical Stage) - Fades out smoothly so it NEVER clutters Phase 2 */}
      <Callout x={1040} y={420} color="#8f4e3e" p={step(local, 108, 170) * sphereCalloutOpacity}>地心连线 OP</Callout>
      <Callout x={990} y={490} color="#8f4e3e" p={step(local, 190, 250) * sphereCalloutOpacity}><Latex math="\psi" /> 地心纬度</Callout>
      
      {/* PHASE 2 CALLOUTS (Ellipsoid Normal & Tangent Stage) - Clean & Spaced Out */}
      <Callout x={1380} y={450} color="#e05638" p={step(local, 430, 500)}>椭球面切线</Callout>
      <Callout x={1240} y={260} color="#a77748" p={step(local, 445, 515)}>椭球面法线</Callout>
      <Callout x={1140} y={510} color="#a77748" p={step(local, 560, 625)}><Latex math="B" /> 大地纬度</Callout>
      <Callout x={1380} y={560} color="#315f6d" p={step(local, 195, 260)}>赤道平面</Callout>
      
      <div style={{ position: "absolute", right: 110, bottom: 90, width: 440, opacity: step(local, 600, 675), padding: "23px 28px", borderRadius: 7, background: "#fffdf6", border: "1px solid #315f6d55", boxShadow: "0 18px 40px rgba(41,52,47,.1)" }}>
        <div style={{ fontFamily: SANS, fontSize: 16, color: "#315f6d", fontWeight: 700 }}>椭球体的关键差异</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: "#29342f", lineHeight: 1.35, marginTop: 7 }}>法线延长后<br />不经过椭球中心 O</div>
      </div>
    </AbsoluteFill>
  );
};

const Readout: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const local = frame - 2370; const p = inSpring(local, 0, fps); 
  const rows = [
    { k: "L", v: <Latex math="116^\circ 24^\prime 36^{\prime\prime} \text{ E}" />, c: "#a77748" }, 
    { k: "B", v: <Latex math="39^\circ 54^\prime 12^{\prime\prime} \text{ N}" />, c: "#315f6d" }, 
    { k: "H", v: <Latex math="43.5 \text{ m}" />, c: "#4f745d" }
  ];
  return (
    <AbsoluteFill style={{ opacity }}>
      <Header index="04.3" title="大地坐标的读取方式" />
      <div style={{ position: "absolute", zIndex: 4, left: 180, top: 262, width: 690, opacity: p }}>
        <div style={{ fontFamily: SERIF, fontSize: 61, fontWeight: 700, color: "#29342f", lineHeight: 1.13 }}>软件中看到的经纬度</div>
        <div style={{ fontFamily: SERIF, fontSize: 61, fontWeight: 700, color: "#315f6d", lineHeight: 1.13 }}>就是大地经纬度</div>
      </div>
      <div style={{ position: "absolute", zIndex: 4, right: 190, top: 210, width: 700, padding: 38, borderRadius: 8, background: "rgba(255,253,246,.94)", border: "1.5px solid rgba(49,95,109,.35)", boxShadow: "0 28px 70px rgba(41,52,47,.15)", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, letterSpacing: 1.8, color: "#69736d", marginBottom: 24 }}>坐标信息 / POINT P</div>
        {rows.map((r, i) => {
          const q = inSpring(local, 35 + i * 25, fps);
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr", alignItems: "center", padding: "17px 0", borderTop: i ? "1px solid #dbe0d8" : undefined, opacity: q, transform: `translateX(${interpolate(q, [0, 1], [30, 0])}px)` }}>
              <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: r.c }}>
                <Latex math={r.k} />
              </div>
              <div style={{ fontFamily: SANS, fontSize: 28, fontWeight: 700, color: "#29342f" }}>{r.v}</div>
            </div>
          );
        })}
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, opacity: p * .92 }}>
        <ellipse cx="525" cy="730" rx="285" ry="142" fill="#315f6d" fillOpacity=".16" stroke="#315f6d" strokeWidth="3" />
        <ellipse cx="525" cy="730" rx="195" ry="96" fill="none" stroke="#315f6d" strokeOpacity=".5" strokeWidth="2" strokeDasharray="8 8" />
        <line x1="525" y1="515" x2="525" y2="945" stroke="#315f6d" strokeWidth="3" />
        <circle cx="705" cy="650" r={12 + Math.sin(frame * .2) * 3} fill="#f2c66c" stroke="#fffdf6" strokeWidth="3" />
        <line x1="705" y1="650" x2="705" y2="730" stroke="#4f745d" strokeWidth="3" strokeDasharray="7 7" />
      </svg>
      <Callout x={612} y={814} color="#4f745d" p={step(local, 95, 145)}>
        <Latex math="H" /> 大地高
      </Callout>
    </AbsoluteFill>
  );
};

export const GeodeticElementsScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", fontFamily: SERIF, color: "#29342f" }}>
      <PaperBackground tone={frame > 2180 ? "warm" : "light"} />
      {frame < 160 && <Intro opacity={visible(frame, 0, 160, 15)} />}
      {frame >= 145 && frame < 695 && <Longitude opacity={visible(frame, 145, 695, 15)} />}
      {frame >= 680 && frame < 2385 && <Latitude opacity={visible(frame, 680, 2385, 15)} />}
      {frame >= 2370 && <Readout opacity={visible(frame, 2370, 2660, 15)} />}
    </AbsoluteFill>
  );
};