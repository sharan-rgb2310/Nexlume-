export default function WheatBowl({ size = 80 }) {
  return (
    <div className="commodity-art" style={{ width: size, height: size }}>
      <svg role="img" aria-label="Bowl of wheat grains" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="wheat-bowl" x1="20" y1="43" x2="59" y2="69" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4E3C6" /><stop offset=".56" stopColor="#B99461" /><stop offset="1" stopColor="#765332" />
          </linearGradient>
          <linearGradient id="wheat-grain" x1="24" y1="31" x2="54" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9D981" /><stop offset="1" stopColor="#BC7723" />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="67" rx="22" ry="3" fill="#7892AA" opacity=".2" />
        <path d="M16 43c1 14 10 23 24 23s23-9 24-23H16Z" fill="url(#wheat-bowl)" stroke="#9D7548" strokeWidth="1.2" />
        <ellipse cx="40" cy="43" rx="26" ry="12" fill="#AF8856" />
        <ellipse cx="40" cy="40" rx="23" ry="10.5" fill="#F3E7D2" stroke="#9E7B51" strokeWidth="1.5" />
        <path d="M18 39c6-5 14-9 22-9 10 0 17 5 22 9-3 5-11 8-22 8s-19-3-22-8Z" fill="url(#wheat-grain)" />
        <g fill="#E9B85C" stroke="#B77A2F" strokeWidth=".55">
          <ellipse cx="26" cy="38" rx="2.1" ry="3" transform="rotate(-35 26 38)" />
          <ellipse cx="33" cy="35" rx="2.1" ry="3" transform="rotate(22 33 35)" />
          <ellipse cx="40" cy="38" rx="2.1" ry="3" transform="rotate(-12 40 38)" />
          <ellipse cx="48" cy="35" rx="2.1" ry="3" transform="rotate(30 48 35)" />
          <ellipse cx="54" cy="40" rx="2.1" ry="3" transform="rotate(-20 54 40)" />
          <ellipse cx="30" cy="42" rx="2.1" ry="3" transform="rotate(12 30 42)" />
          <ellipse cx="39" cy="43" rx="2.1" ry="3" transform="rotate(-25 39 43)" />
          <ellipse cx="48" cy="42" rx="2.1" ry="3" transform="rotate(20 48 42)" />
        </g>
        <path d="M20 45c5 2 10 3 15 3" stroke="#FFF8E7" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
      </svg>
    </div>
  )
}
