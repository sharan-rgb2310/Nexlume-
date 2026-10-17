export default function EmblemSVG({ size = 120 }) {
  return (
    <svg
      role="img"
      aria-label="Tamil Nadu government seal with temple gopuram"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
    >
      <defs>
        <linearGradient id="seal-gold" x1="44" y1="22" x2="77" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD64A" />
          <stop offset="1" stopColor="#F39A13" />
        </linearGradient>
        <linearGradient id="seal-red" x1="47" y1="66" x2="72" y2="103" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5048" />
          <stop offset="1" stopColor="#C90018" />
        </linearGradient>
        <path id="seal-top-arc" d="M15 59a45 45 0 0 1 90 0" />
        <path id="seal-bottom-arc" d="M17 72a45 45 0 0 0 86 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="#FFF" stroke="#07570C" strokeWidth="3" />
      <circle cx="60" cy="60" r="50" fill="#FFF" stroke="#07570C" strokeWidth="2" />
      <text fill="#07570C" fontFamily="Noto Sans Tamil, sans-serif" fontSize="7" fontWeight="700" letterSpacing=".5">
        <textPath href="#seal-top-arc" startOffset="50%" textAnchor="middle">தமிழ்நாடு அரசு</textPath>
      </text>
      <text fill="#07570C" fontFamily="Noto Sans Tamil, sans-serif" fontSize="5.4" fontWeight="700" letterSpacing=".3">
        <textPath href="#seal-bottom-arc" startOffset="50%" textAnchor="middle">தமிழ்நாடு அரசு</textPath>
      </text>
      <path d="M27 47 42 35l5 4-13 14-4 21-5-1 3-26Z" fill="#07570C" />
      <path d="m93 47-15-12-5 4 13 14 4 21 5-1-2-26Z" fill="#07570C" />
      <path d="M37 76h46l-3 6H40l-3-6Z" fill="#07570C" />
      <path d="M41 73h38V39H41v34Z" fill="url(#seal-gold)" />
      <path d="m39 39 4-5h34l4 5H39Zm5-6 4-5h24l4 5H44Zm7-6 9-12 9 12H51Z" fill="#F6B817" stroke="#D1850A" strokeWidth=".8" />
      <circle cx="60" cy="13" r="1.7" fill="#07570C" />
      <path d="M44 43h32M43 50h34M42 57h36M42 64h36M41 71h38" stroke="#C77D08" strokeWidth="1" />
      <path d="M47 41v5m8-5v5m9-5v5m8-5v5M46 48v5m9-5v5m9-5v5m8-5v5M45 55v5m9-5v5m10-5v5m8-5v5M44 62v5m10-5v5m10-5v5m8-5v5" stroke="#FFF1A8" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M45 81h30v8H45z" fill="#FF9933" />
      <path d="M45 89h30v8H45z" fill="#FFF" />
      <path d="M45 97h30v8H45z" fill="#138808" />
      <circle cx="60" cy="93" r="3.4" fill="#FFF" stroke="#142D83" strokeWidth=".8" />
      <circle cx="60" cy="93" r=".8" fill="#142D83" />
      <g fill="url(#seal-red)" stroke="#C90018" strokeWidth=".6">
        <path d="M58 66c-5-7-13-6-16-1-3 4 1 8 3 11-1 5 1 10 4 13l-1 8 5 8 4-2 1-10-3-8 4-7-1-12Z" />
        <path d="M62 66c5-7 13-6 16-1 3 4-1 8-3 11 1 5-1 10-4 13l1 8-5 8-4-2-1-10 3-8-4-7 1-12Z" />
        <path d="M54 68c0-6 3-10 6-10s6 4 6 10l-2 14H56l-2-14Z" />
      </g>
      <path d="M58 66c-3 2-4 5-4 9m8-9c3 2 4 5 4 9M55 84l-2 12m14-12 2 12" stroke="#FFF" strokeWidth="1" strokeLinecap="round" />
      <path d="M47 65c4-6 8-4 10 0m6 0c2-4 6-6 10 0" stroke="#FFF3E3" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M46 104h28l-2 4H48l-2-4Z" fill="#D80B20" />
    </svg>
  )
}
