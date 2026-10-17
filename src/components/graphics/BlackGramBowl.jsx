export default function BlackGramBowl({ size = 80 }) {
  return (
    <div className="commodity-art" style={{ width: size, height: size }}>
      <svg role="img" aria-label="Bowl of black gram" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="blackgram-bowl" x1="20" y1="43" x2="59" y2="69" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF" /><stop offset=".7" stopColor="#DAD8D3" /><stop offset="1" stopColor="#A6A29A" />
          </linearGradient>
          <linearGradient id="blackgram-bean" x1="27" y1="32" x2="54" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#51483F" /><stop offset=".5" stopColor="#211D19" /><stop offset="1" stopColor="#090A0B" />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="67" rx="22" ry="3" fill="#7892AA" opacity=".2" />
        <path d="M16 43c1 14 10 23 24 23s23-9 24-23H16Z" fill="url(#blackgram-bowl)" stroke="#B8B5AF" strokeWidth="1.2" />
        <ellipse cx="40" cy="43" rx="26" ry="12" fill="#C7C3BC" />
        <ellipse cx="40" cy="40" rx="23" ry="10.5" fill="#FBFAF6" stroke="#B8B5AF" strokeWidth="1.5" />
        <path d="M18 39c6-5 14-9 22-9 10 0 17 5 22 9-3 5-11 8-22 8s-19-3-22-8Z" fill="#403932" />
        <g fill="url(#blackgram-bean)" stroke="#171411" strokeWidth=".55">
          <ellipse cx="26" cy="38" rx="3.3" ry="2.1" transform="rotate(-25 26 38)" />
          <ellipse cx="34" cy="35" rx="3.3" ry="2.1" transform="rotate(18 34 35)" />
          <ellipse cx="42" cy="37" rx="3.3" ry="2.1" transform="rotate(-12 42 37)" />
          <ellipse cx="51" cy="38" rx="3.3" ry="2.1" transform="rotate(24 51 38)" />
          <ellipse cx="30" cy="42" rx="3.3" ry="2.1" transform="rotate(12 30 42)" />
          <ellipse cx="39" cy="42" rx="3.3" ry="2.1" transform="rotate(-25 39 42)" />
          <ellipse cx="48" cy="42" rx="3.3" ry="2.1" transform="rotate(20 48 42)" />
        </g>
        <g fill="#E9D9C6">
          <circle cx="26" cy="38" r=".8" /><circle cx="34" cy="35" r=".8" /><circle cx="42" cy="37" r=".8" />
          <circle cx="51" cy="38" r=".8" /><circle cx="30" cy="42" r=".8" /><circle cx="39" cy="42" r=".8" /><circle cx="48" cy="42" r=".8" />
        </g>
        <path d="M20 45c5 2 10 3 15 3" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
      </svg>
    </div>
  )
}
