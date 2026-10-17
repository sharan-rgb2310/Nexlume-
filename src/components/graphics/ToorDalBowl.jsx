export default function ToorDalBowl({ size = 80 }) {
  return (
    <div className="commodity-art" style={{ width: size, height: size }}>
      <svg role="img" aria-label="Bowl of yellow toor dal" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="dal-ceramic" x1="25" y1="45" x2="51" y2="67" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF" /><stop offset=".72" stopColor="#E7E0D2" /><stop offset="1" stopColor="#B9A98D" />
          </linearGradient>
          <linearGradient id="dal-grain" x1="25" y1="31" x2="54" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD95D" /><stop offset="1" stopColor="#E89D0A" />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="67" rx="22" ry="3" fill="#7892AA" opacity=".2" />
        <path d="M16 43c1 14 10 23 24 23s23-9 24-23H16Z" fill="url(#dal-ceramic)" stroke="#C9BDA9" strokeWidth="1.2" />
        <ellipse cx="40" cy="43" rx="26" ry="12" fill="#D9D1C3" />
        <ellipse cx="40" cy="40" rx="23" ry="10.5" fill="#FFFDF6" stroke="#D3C9B8" strokeWidth="1.5" />
        <path d="M18 39c6-5 14-9 22-9 10 0 17 5 22 9-3 5-11 8-22 8s-19-3-22-8Z" fill="url(#dal-grain)" />
        <g fill="#FFC526" stroke="#D99008" strokeWidth=".6">
          <ellipse cx="26" cy="38" rx="2.5" ry="1.4" transform="rotate(-25 26 38)" /><ellipse cx="33" cy="35" rx="2.5" ry="1.4" transform="rotate(18 33 35)" />
          <ellipse cx="40" cy="38" rx="2.5" ry="1.4" transform="rotate(-12 40 38)" /><ellipse cx="48" cy="35" rx="2.5" ry="1.4" transform="rotate(24 48 35)" />
          <ellipse cx="54" cy="40" rx="2.5" ry="1.4" transform="rotate(-20 54 40)" /><ellipse cx="30" cy="42" rx="2.5" ry="1.4" transform="rotate(12 30 42)" />
          <ellipse cx="38" cy="43" rx="2.5" ry="1.4" transform="rotate(-25 38 43)" /><ellipse cx="47" cy="42" rx="2.5" ry="1.4" transform="rotate(20 47 42)" />
        </g>
        <path d="M20 41c3 4 8 6 13 7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
      </svg>
    </div>
  )
}
