const TRUNK = "#6B5643";

function Trunk({ h = 34 }) {
  return <rect x={-4} y={-h} width={8} height={h} rx={3} fill={TRUNK} />;
}

function Spring() {
  return (
    <g>
      <Trunk h={30} />
      {[
        [0, -46, 15],
        [-14, -38, 11],
        [13, -36, 12],
        [-6, -56, 12],
        [9, -54, 11],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#F3D98B" opacity={0.92} />
      ))}
      {[
        [0, -46],
        [-14, -38],
        [13, -36],
      ].map(([cx, cy], i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r={3} fill="#E3B458" />
      ))}
    </g>
  );
}

function Summer() {
  return (
    <g>
      <Trunk h={36} />
      <ellipse cx={0} cy={-58} rx={34} ry={30} fill="#5F7A52" opacity={0.94} />
      <ellipse cx={-16} cy={-46} rx={20} ry={18} fill="#6E8B5F" opacity={0.9} />
      <ellipse cx={16} cy={-48} rx={20} ry={17} fill="#4F6B45" opacity={0.9} />
    </g>
  );
}

function Autumn() {
  return (
    <g>
      <Trunk h={34} />
      <ellipse cx={0} cy={-54} rx={30} ry={26} fill="#C2674E" opacity={0.92} />
      <ellipse cx={-15} cy={-44} rx={17} ry={15} fill="#D98A5E" opacity={0.9} />
      <ellipse cx={14} cy={-46} rx={16} ry={14} fill="#A85338" opacity={0.9} />
    </g>
  );
}

function Winter() {
  return (
    <g stroke="#6B5643" strokeWidth={3} strokeLinecap="round" fill="none">
      <Trunk h={32} />
      <path d="M0,-30 L-14,-46 M0,-30 L14,-44 M0,-40 L-10,-56 M0,-40 L9,-58" />
      <g fill="#fff" stroke="none" opacity={0.85}>
        <circle cx={-14} cy={-46} r={2.4} />
        <circle cx={14} cy={-44} r={2.4} />
        <circle cx={-10} cy={-56} r={2} />
        <circle cx={9} cy={-58} r={2} />
      </g>
    </g>
  );
}

const VARIANTS = { spring: Spring, summer: Summer, autumn: Autumn, winter: Winter };

export default function SeasonTree({ season, x, y, scale = 1 }) {
  const Variant = VARIANTS[season] ?? Summer;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <Variant />
    </g>
  );
}
