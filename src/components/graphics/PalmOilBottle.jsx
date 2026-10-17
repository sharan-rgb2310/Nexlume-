export default function PalmOilBottle({ size = 80 }) {
  return (
    <div className="commodity-art" style={{ width: size, height: size }}>
      <svg role="img" aria-label="Bottle of golden palm oil" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id="oil-glass" x1="24" y1="27" x2="57" y2="67" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFCE5" /><stop offset=".2" stopColor="#F3C52D" /><stop offset=".58" stopColor="#F6A900" /><stop offset="1" stopColor="#D87D00" />
          </linearGradient>
          <linearGradient id="oil-highlight" x1="26" y1="35" x2="35" y2="61" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF" stopOpacity=".9" /><stop offset="1" stopColor="#FFF" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="15" ry="3" fill="#7892AA" opacity=".2" />
        <path d="M34 13h12v8l5 6v6c3 3 4 6 4 10v20c0 3-2 5-5 5H30c-3 0-5-2-5-5V43c0-4 1-7 4-10v-6l5-6v-8Z" fill="url(#oil-glass)" stroke="#D28A0B" strokeWidth="1.3" />
        <path d="M33 12h14v9H33z" fill="#F4EFE1" stroke="#BFC7C8" strokeWidth="1" />
        <path d="M34 7h12v7H34z" fill="#E54A37" stroke="#BA3329" strokeWidth="1" />
        <path d="M34 9h12M34 12h12" stroke="#FF9B84" strokeWidth="1" />
        <path d="M30 37h20M29 43h24M29 53h24M29 61h23" stroke="#FFD957" strokeWidth="1.2" opacity=".75" />
        <path d="M29 35c-1 3-2 5-2 9v18c0 2 1 3 3 3V42c0-3 1-5 3-7V29l5-7v-7h-3v7l-5 6v5l-1 2Z" fill="url(#oil-highlight)" />
        <path d="M49 31c2 3 3 7 3 11v18" stroke="#FFF1AA" strokeWidth="1.5" strokeLinecap="round" opacity=".8" />
      </svg>
    </div>
  )
}
