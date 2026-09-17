import "./CrossedMountainView.css";

export default function CrossedMountainView({ onBack }) {
  return (
    <div className="crossed-view">
      <svg viewBox="0 0 400 700" className="crossed-svg" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="crossed-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F6D9A8" />
            <stop offset="45%" stopColor="#F1C98C" />
            <stop offset="100%" stopColor="#EDE1C8" />
          </linearGradient>
          <linearGradient id="crossed-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9FB9C4" />
            <stop offset="100%" stopColor="#7C9EAC" />
          </linearGradient>
          <linearGradient id="crossed-pier" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B9A98C" />
            <stop offset="100%" stopColor="#8C7A5E" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="700" fill="url(#crossed-sky)" />

        {/* 越えてきた山（水平線の向こうに小さく） */}
        <g opacity="0.55">
          <path d="M0,330 L60,300 L110,325 L170,285 L230,320 L290,295 L340,318 L400,300 L400,340 L0,340 Z" fill="#8FA089" />
        </g>

        {/* 海 */}
        <rect x="0" y="330" width="400" height="150" fill="url(#crossed-sea)" />
        <g stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none">
          <path d="M20,360 q20,-6 40,0" />
          <path d="M220,380 q20,-6 40,0" />
          <path d="M300,350 q20,-6 40,0" />
          <path d="M80,400 q20,-6 40,0" />
        </g>

        {/* クルーズ船 */}
        <g transform="translate(258,300)">
          <path d="M-60,60 L60,60 L48,84 L-48,84 Z" fill="#F4F1EA" stroke="#C9C2AE" strokeWidth="1.5" />
          <rect x="-52" y="30" width="104" height="32" rx="4" fill="#FDFBF6" stroke="#D8D1BC" strokeWidth="1.5" />
          <rect x="-40" y="10" width="80" height="24" rx="4" fill="#F4F1EA" stroke="#D8D1BC" strokeWidth="1.5" />
          <rect x="-24" y="-8" width="48" height="20" rx="3" fill="#EDE8DA" stroke="#D8D1BC" strokeWidth="1.5" />
          <rect x="-6" y="-26" width="12" height="20" fill="#C2674E" />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={-46 + i * 11} y={38} width={5} height={7} fill="#8AA6B0" />
          ))}
        </g>

        {/* 桟橋（手前へ伸びる・足場をしっかり描く） */}
        <path d="M120,700 L160,420 L240,420 L300,700 Z" fill="url(#crossed-pier)" />
        <g stroke="#6E5E44" strokeWidth="2" opacity="0.4">
          <line x1="150" y1="700" x2="172" y2="440" />
          <line x1="200" y1="700" x2="200" y2="420" />
          <line x1="250" y1="700" x2="228" y2="440" />
        </g>

        {/* ポートタワー（鼓形・埠頭に足がつく） */}
        <g transform="translate(150,150)">
          <rect x="-6" y="270" width="12" height="30" fill="#8C7A5E" />
          <path
            d="M-4,270 C-30,220 -30,140 -4,100 C6,86 6,86 16,100 C42,140 42,220 16,270 Z"
            fill="none"
            stroke="#C2674E"
            strokeWidth="5"
          />
          <path
            d="M10,270 C-16,220 -16,140 10,100 C20,86 20,86 30,100 C56,140 56,220 30,270 Z"
            fill="none"
            stroke="#C2674E"
            strokeWidth="5"
            opacity="0.85"
          />
          <g stroke="#C2674E" strokeWidth="3" opacity="0.7">
            <line x1="-4" y1="140" x2="30" y2="120" />
            <line x1="-4" y1="180" x2="30" y2="200" />
            <line x1="6" y1="110" x2="20" y2="260" />
          </g>
          <circle cx="13" cy="90" r="14" fill="#C2674E" />
          <rect x="4" y="78" width="18" height="10" rx="3" fill="#A6503A" />
        </g>

        <rect x="0" y="670" width="400" height="30" fill="var(--bg)" />
      </svg>

      <div className="crossed-caption">
        <p className="crossed-eyebrow">55歳、ここに立っている。</p>
        <p className="crossed-sub">山を越えた、その先。</p>
      </div>

      <button className="crossed-back" onClick={onBack}>
        道の途中に戻る
      </button>
    </div>
  );
}
