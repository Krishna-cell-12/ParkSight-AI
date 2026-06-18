import { useState, useRef } from 'react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

// Map GPS → SVG percentage
function gpsToSvg(lat, lng) {
  const LAT_MIN = 12.90, LAT_MAX = 13.05;
  const LNG_MIN = 77.48, LNG_MAX = 77.76;
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 90 + 5;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 80 + 10;
  return { x, y };
}

function getColor(rank) {
  if (rank === 1)       return 'rgba(239,68,68,0.85)';
  if (rank <= 3)        return 'rgba(249,115,22,0.75)';
  if (rank <= 5)        return 'rgba(245,158,11,0.70)';
  return 'rgba(59,130,246,0.60)';
}

function getRadius(violations) {
  return Math.max(6, Math.min(32, violations / 2200));
}

export default function HeatmapPlaceholder({ clusters }) {
  const { isDark } = useTheme();
  const [hoveredCluster, setHoveredCluster] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const bgColor = isDark ? '#0D1B2A' : '#E8F0F7';
  const roadColor = isDark ? '#ffffff' : '#4B5563';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-xl overflow-hidden"
      style={{ background: bgColor, minHeight: 300 }}
      onMouseMove={handleMouseMove}
    >
      <svg width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          {clusters.map(c => (
            <filter key={`glow-${c.rank}`} id={`glow-${c.rank}`}>
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <linearGradient id="legendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#3B82F6" />
            <stop offset="50%"  stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* ── Road Grid ── */}
        <g stroke={roadColor} strokeWidth="0.8" fill="none" opacity={isDark ? 0.15 : 0.12}>
          {/* Outer Ring Road ellipse */}
          <ellipse cx="50%" cy="50%" rx="38%" ry="32%" />
          {/* Horizontal streets */}
          <line x1="5%" y1="30%" x2="95%" y2="33%" />
          <line x1="5%" y1="48%" x2="95%" y2="50%" />
          <line x1="5%" y1="65%" x2="95%" y2="67%" />
          <line x1="5%" y1="78%" x2="95%" y2="79%" />
          {/* Vertical streets */}
          <line x1="22%" y1="5%" x2="22%" y2="95%" />
          <line x1="40%" y1="5%" x2="40%" y2="95%" />
          <line x1="58%" y1="5%" x2="58%" y2="95%" />
          <line x1="75%" y1="5%" x2="75%" y2="95%" />
          {/* Diagonals (MG Road direction) */}
          <line x1="15%" y1="25%" x2="65%" y2="70%" />
          <line x1="35%" y1="15%" x2="80%" y2="75%" />
        </g>

        {/* ── Area Labels ── */}
        <g fontSize="9" fill={textColor} opacity={0.45} fontFamily="Inter, sans-serif">
          <text x="14%" y="20%">Malleshwaram</text>
          <text x="40%" y="35%">Shivajinagar</text>
          <text x="75%" y="30%">Whitefield</text>
          <text x="46%" y="68%">Koramangala</text>
          <text x="52%" y="84%">Electronic City</text>
          <text x="8%"  y="55%">Vijayanagara</text>
          <text x="20%" y="42%">Rajajinagar</text>
        </g>

        {/* ── Hotspot Circles ── */}
        {clusters.map(cluster => {
          const { x, y } = gpsToSvg(cluster.lat, cluster.lng);
          const cx = `${x}%`;
          const cy = `${y}%`;
          const r  = getRadius(cluster.violations);
          const color = getColor(cluster.rank);
          const isPulse = cluster.rank <= 2;

          return (
            <g
              key={cluster.rank}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredCluster(cluster)}
              onMouseLeave={() => setHoveredCluster(null)}
            >
              {/* Glow */}
              <circle
                cx={cx} cy={cy}
                r={r * 2.5}
                fill={color}
                opacity={0.35}
                filter={`url(#glow-${cluster.rank})`}
              />
              {/* Solid */}
              {isPulse ? (
                <circle
                  cx={cx} cy={cy}
                  r={r}
                  fill={color}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                  style={{
                    '--base-r': `${r}px`,
                    '--pulse-r': `${r * 1.3}px`,
                    animation: 'pulseCircle 2s ease-in-out infinite',
                    transformOrigin: `${x}% ${y}%`,
                  }}
                />
              ) : (
                <circle
                  cx={cx} cy={cy}
                  r={r}
                  fill={color}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                />
              )}
              {/* Rank label for top clusters */}
              {cluster.rank <= 5 && (
                <text
                  x={cx} y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={r > 10 ? 9 : 7}
                  fill="white"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {cluster.rank}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Compass ── */}
        <g opacity={0.5} fill={textColor} fontSize="10" fontFamily="Inter, sans-serif">
          <text x="92%" y="9%" textAnchor="middle" fontWeight="bold">N</text>
          <polygon
            points="92%,11% 91%,16% 92%,14% 93%,16%"
            fill={textColor}
            style={{ transform: 'none' }}
          />
        </g>

        {/* ── Legend ── */}
        <g>
          <text x="50%" y="94%" textAnchor="middle" fontSize="8" fill={textColor} opacity={0.6}>
            Violation Intensity
          </text>
          <rect x="28%" y="95.5%" width="44%" height="7" rx="3" fill="url(#legendGrad)" opacity={0.7} />
          <text x="27%" y="98.5%" fontSize="7" fill={textColor} opacity={0.5}>Low</text>
          <text x="73%" y="98.5%" textAnchor="end" fontSize="7" fill={textColor} opacity={0.5}>High</text>
        </g>
      </svg>

      {/* ── Tooltip ── */}
      {hoveredCluster && (
        <div
          className={clsx(
            'absolute pointer-events-none rounded-lg shadow-xl p-3 text-xs border z-10',
            isDark ? 'bg-navy-600 border-navy-500 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
          )}
          style={{
            left: Math.min(mousePos.x + 12, (containerRef.current?.offsetWidth || 300) - 200),
            top:  Math.min(mousePos.y + 12, (containerRef.current?.offsetHeight || 300) - 130),
            width: 188,
          }}
        >
          <p className="font-semibold text-sm mb-1.5">{hoveredCluster.name}</p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            <span className="font-medium text-gray-300">Violations:</span>{' '}
            {hoveredCluster.violations.toLocaleString()}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            <span className="font-medium text-gray-300">Impact Score:</span>{' '}
            {hoveredCluster.score}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            <span className="font-medium text-gray-300">Peak:</span>{' '}
            2–6AM ({hoveredCluster.peakRatio})
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            <span className="font-medium text-gray-300">Vehicle:</span>{' '}
            {hoveredCluster.vehicle}
          </p>
        </div>
      )}

      {/* ── Map Label ── */}
      <div className="absolute top-2 left-2">
        <span className={clsx(
          'text-[9px] font-medium px-2 py-0.5 rounded-full border',
          isDark
            ? 'bg-navy-800/80 text-gray-400 border-navy-600/40'
            : 'bg-white/80 text-gray-500 border-gray-200'
        )}>
          Bengaluru, Karnataka
        </span>
      </div>
    </div>
  );
}
