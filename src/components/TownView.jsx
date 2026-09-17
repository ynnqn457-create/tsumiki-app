import { useEffect, useMemo, useRef, useState } from "react";
import SeasonTree from "./SeasonTree";
import CrossedMountainView from "./CrossedMountainView";
import { currentSeasonByDate, SEASONS, SEASON_LABEL } from "../lib/season";
import "./TownView.css";

const ROAD_D =
  "M200,690 C255,600 120,540 165,450 C200,380 260,360 220,280 C195,225 150,210 180,140 C195,105 205,90 200,55";

const SEASON_EMOJI = { spring: "🌸", summer: "🌿", autumn: "🍁", winter: "❄️" };

function HouseIcon({ x, y, scale, color, glow }) {
  return (
    <g
      transform={`translate(${x},${y}) scale(${scale})`}
      className={glow ? "town-house town-house--glow" : "town-house"}
    >
      <rect x={-16} y={-14} width={32} height={22} rx={2} fill="#F7F1E4" stroke="#C9BC9E" strokeWidth={1.2} />
      <path d="M-20,-14 L0,-32 L20,-14 Z" fill={color} />
      <rect x={-5} y={-9} width={10} height={9} fill="#3A2E20" opacity={0.45} />
      <rect x={-3.4} y={-7.5} width={6.8} height={6} fill="#F3D98B" />
    </g>
  );
}

function MonumentIcon({ x, y, glow }) {
  return (
    <g transform={`translate(${x},${y})`} className={glow ? "town-monument town-monument--glow" : "town-monument"}>
      <path d="M-6,0 L-6,-22 Q0,-30 6,-22 L6,0 Z" fill="#B7AC94" stroke="#948A72" strokeWidth={1} />
    </g>
  );
}

export default function TownView({ houses, monuments }) {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const [season, setSeason] = useState(currentSeasonByDate());
  const [reflecting, setReflecting] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [crossed, setCrossed] = useState(false);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, []);

  const count = houses.length;
  const currentT = Math.min(0.62, 0.12 + count * 0.045);

  const housePoints = useMemo(() => {
    if (!pathRef.current || pathLength === 0) return [];
    return houses.map((h, i) => {
      const t = count === 1 ? currentT : 0.1 + (i / Math.max(count - 1, 1)) * (currentT - 0.1);
      const p = pathRef.current.getPointAtLength(t * pathLength);
      const scale = 1.05 - t * 0.72;
      return { house: h, x: p.x, y: p.y, scale };
    });
  }, [houses, pathLength, count, currentT]);

  const currentPoint = useMemo(() => {
    if (!pathRef.current || pathLength === 0) return null;
    return pathRef.current.getPointAtLength(currentT * pathLength);
  }, [pathLength, currentT]);

  if (crossed) return <CrossedMountainView onBack={() => setCrossed(false)} />;

  return (
    <div className="town-view">
      <svg viewBox="0 0 400 700" className="town-svg" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="town-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDE6D6" />
            <stop offset="100%" stopColor="#F5F0E8" />
          </linearGradient>
          <linearGradient id="town-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EAE3D3" stopOpacity="1" />
            <stop offset="100%" stopColor="#EAE3D3" stopOpacity="0" />
          </linearGradient>
          <filter id="town-blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <rect x="0" y="0" width="400" height="700" fill="url(#town-sky)" />

        <path
          d="M0,190 L60,150 L120,180 L180,130 L240,175 L300,140 L360,178 L400,155 L400,240 L0,240 Z"
          fill="#B9C2AC"
          opacity="0.6"
        />
        <path
          d="M0,220 L70,185 L140,215 L210,175 L280,212 L340,182 L400,205 L400,260 L0,260 Z"
          fill="#A9B79C"
          opacity="0.5"
        />

        {peeking && (
          <g filter="url(#town-blur-heavy)" opacity="0.5">
            <rect x="140" y="100" width="120" height="50" fill="#9FB9C4" />
            <rect x="185" y="62" width="14" height="66" fill="#C2674E" />
            <circle cx="192" cy="58" r="8" fill="#C2674E" />
          </g>
        )}

        <path ref={pathRef} d={ROAD_D} fill="none" stroke="#DCD2B9" strokeWidth="30" strokeLinecap="round" />
        <path
          d={ROAD_D}
          fill="none"
          stroke="#CFC3A4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1,17"
          opacity="0.6"
        />

        {reflecting && pathLength > 0 && (
          <path
            d={ROAD_D}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${currentT * pathLength} ${pathLength}`}
            opacity="0.9"
          />
        )}

        <SeasonTree season={season} x={68} y={505} scale={1.1} />

        {housePoints
          .slice()
          .sort((a, b) => a.y - b.y)
          .map(({ house, x, y, scale }) => (
            <HouseIcon key={house.id} x={x} y={y} scale={scale} color={house.color} glow={reflecting} />
          ))}

        {reflecting && currentPoint && (
          <g transform={`translate(${currentPoint.x},${currentPoint.y})`}>
            <circle r="11" fill="var(--gold)" opacity="0.3" />
            <circle r="5" fill="var(--gold)" stroke="#fff" strokeWidth="1.5" />
            <text y="-16" textAnchor="middle" fontSize="11" fill="var(--ink)" className="mincho">
              いま、ここ
            </text>
          </g>
        )}

        <rect x="0" y="0" width="400" height="250" fill="url(#town-fog)" />

        <ellipse cx="200" cy="662" rx="150" ry="32" fill="#E7DEC8" opacity="0.6" />
        {monuments.map((m, i) => {
          const cols = Math.min(monuments.length, 6);
          const spread = 220;
          const cx = 200 - spread / 2 + (spread / Math.max(cols - 1, 1)) * (i % cols);
          const row = Math.floor(i / cols);
          return <MonumentIcon key={m.id} x={cx} y={668 - row * 24} glow={reflecting} />;
        })}
      </svg>

      <div className="town-season-switch">
        {SEASONS.map((s) => (
          <button
            key={s}
            className={s === season ? "town-season town-season--active" : "town-season"}
            onClick={() => setSeason(s)}
            title={SEASON_LABEL[s]}
          >
            {SEASON_EMOJI[s]}
          </button>
        ))}
      </div>

      <div className="town-actions">
        <button className={reflecting ? "town-btn town-btn--active" : "town-btn"} onClick={() => setReflecting((v) => !v)}>
          振り返る
        </button>
        <button className={peeking ? "town-btn town-btn--active" : "town-btn"} onClick={() => setPeeking((v) => !v)}>
          55歳、世界へ
        </button>
        <button className="town-btn" onClick={() => setCrossed(true)}>
          山を越えた景色
        </button>
      </div>
    </div>
  );
}
