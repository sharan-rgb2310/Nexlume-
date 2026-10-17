export default function SugarBowl({ size = 80 }) {
  return (
    <div className="commodity-art" style={{ width: size, height: size }}>
      <svg role="img" aria-label="Bowl of white sugar" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="sugar-wood" x1="21" y1="44" x2="58" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8E492A" /><stop offset=".55" stopColor="#5C2E1D" /><stop offset="1" stopColor="#32190F" />
          </linearGradient>
          <linearGradient id="sugar-crystal" x1="25" y1="31" x2="53" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF" /><stop offset="1" stopColor="#E6E4DF" />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="66" rx="22" ry="3" fill="#7A90A6" opacity=".2" />
        <path d="M16 43c1 14 10 23 24 23s23-9 24-23H16Z" fill="url(#sugar-wood)" stroke="#462618" strokeWidth="1.2" />
        <path d="M21 54c8 6 25 8 38 0M23 59c8 5 19 6 31 2" stroke="#AD6540" strokeWidth="1" opacity=".6" />
        <ellipse cx="40" cy="43" rx="26" ry="12" fill="#532C1B" />
        <ellipse cx="40" cy="40" rx="23" ry="10.5" fill="#EEECE7" stroke="#3F2418" strokeWidth="1.5" />
        <path d="M18 39c6-4 13-9 22-10 9 1 17 6 22 10-3 5-11 8-22 8s-19-3-22-8Z" fill="url(#sugar-crystal)" />
        <g fill="#FFF" stroke="#D5D4D0" strokeWidth=".5">
          <path d="m25 38 3-3 3 3-3 3-3-3Zm8-4 3-3 3 3-3 3-3-3Zm9 2 3-3 3 3-3 3-3-3Zm7 4 3-3 3 3-3 3-3-3ZM30 43l3-3 3 3-3 3-3-3Zm9-1 3-3 3 3-3 3-3-3Z" />
        </g>
        <path d="M20 40c2 5 8 7 13 8" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
      </svg>
    </div>
  )
}
