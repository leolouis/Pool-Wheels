// Original vector car illustration (no third-party artwork). Colour is a prop.
export default function CarArt({ color = '#FF7A1A', body = 'suv', label }) {
  const hatch = body === 'hatch'
  const shell = hatch
    ? 'M40 122V98q0-10 12-13l52-8 26-30q5-5 12-5h92q10 0 16 7l24 28 36 8q14 4 14 18v22z'
    : 'M30 122V96q0-10 12-13l58-8 30-34q5-5 12-5h118q10 0 16 8l28 30 46 8q16 4 16 18v22z'
  const glass = hatch ? 'M142 52h88l24 25H120z' : 'M138 48h120l26 27H118z'
  return (
    <svg viewBox="0 0 400 180" role="img" aria-label={label || 'Car illustration'} className="car">
      <ellipse cx="200" cy="160" rx="170" ry="9" fill="#0B1F33" opacity=".12" />
      <path d={shell} fill={color} />
      <path d={glass} fill="#CFE3F2" />
      <path d="M200 48v27" stroke={color} strokeWidth="5" />
      {[100, 300].map((x) => (
        <g key={x}>
          <circle cx={x} cy="126" r="34" fill="#0B1F33" />
          <circle cx={x} cy="126" r="25" fill="#1B2D40" />
          <circle cx={x} cy="126" r="12" fill="#C9D4DF" />
        </g>
      ))}
      <rect x="352" y="96" width="14" height="8" rx="3" fill="#FFE3A3" />
    </svg>
  )
}
