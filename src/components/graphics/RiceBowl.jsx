export default function RiceBowl({ size = 80 }) {
  return (
    <div className="commodity-art" style={{ width: size, height: size }}>
      <svg role="img" aria-label="Bowl of white rice" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="rice-bowl" x1="21" y1="46" x2="59" y2="73" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F6E4C5" /><stop offset=".55" stopColor="#B88D57" /><stop offset="1" stopColor="#79532F" />
          </linearGradient>
          <radialGradient id="rice-fill" cx="0" cy="0" r="1" gradientTransform="matrix(0 17 -29 0 40 40)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF" /><stop offset="1" stopColor="#E8E1D4" />
          </radialGradient>
          <filter id="rice-shadow" x="13" y="46" width="54" height="24" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <ellipse cx="40" cy="66" rx="23" ry="3" fill="#7892AA" opacity=".2" filter="url(#rice-shadow)" />
        <path d="M16 43c1 14 10 24 24 24s23-10 24-24H16Z" fill="url(#rice-bowl)" stroke="#9D7548" strokeWidth="1.2" />
        <ellipse cx="40" cy="43" rx="25" ry="12" fill="#AF8856" />
        <ellipse cx="40" cy="40" rx="23" ry="11" fill="url(#rice-fill)" stroke="#E9D4AF" strokeWidth="1.5" />
        <path d="M19 39c5-5 12-8 21-8 10 0 17 4 21 8-3 5-11 8-21 8s-18-3-21-8Z" fill="#F8F7F1" />
        <g fill="#FFF" stroke="#DAD5C9" strokeWidth=".45">
          <ellipse cx="29" cy="37" rx="2.2" ry="1" transform="rotate(-25 29 37)" /><ellipse cx="36" cy="34" rx="2.2" ry="1" transform="rotate(20 36 34)" />
          <ellipse cx="44" cy="36" rx="2.1" ry="1" transform="rotate(-15 44 36)" /><ellipse cx="51" cy="39" rx="2" ry="1" transform="rotate(25 51 39)" />
          <ellipse cx="33" cy="41" rx="2.1" ry="1" transform="rotate(12 33 41)" /><ellipse cx="42" cy="42" rx="2.1" ry="1" transform="rotate(-30 42 42)" />
          <ellipse cx="49" cy="44" rx="2" ry="1" transform="rotate(12 49 44)" /><ellipse cx="25" cy="42" rx="2" ry="1" transform="rotate(-12 25 42)" />
        </g>
        <path d="M21 52c6 7 18 11 32 5" stroke="#FFF3D9" strokeWidth="2" strokeLinecap="round" opacity=".75" />
      </svg>
    </div>
  )
}
