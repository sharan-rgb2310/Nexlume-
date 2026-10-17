export default function PeopleIcon({ size = 90 }) {
  return (
    <svg role="img" aria-label="Group of three citizens" width={size} height={size} viewBox="0 0 90 80" fill="none">
      <defs>
        <linearGradient id="people-blue" x1="17" y1="23" x2="72" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1D75D3" /><stop offset="1" stopColor="#0751AC" />
        </linearGradient>
      </defs>
      <circle cx="45" cy="20" r="10" fill="url(#people-blue)" />
      <circle cx="20" cy="28" r="8" fill="#1671CE" />
      <circle cx="70" cy="28" r="8" fill="#0A58B2" />
      <path d="M27 67V56c0-10 7-17 18-17s18 7 18 17v11H27Z" fill="url(#people-blue)" />
      <path d="M7 65v-7c0-8 5-13 13-13 5 0 9 2 11 6-3 4-4 8-4 13v1H7Zm51 0v-1c0-5-1-9-4-13 2-4 6-6 11-6 8 0 13 5 13 13v7H58Z" fill="#0D62BE" />
      <path d="M36 42h18M12 63h13m40 0h12" stroke="#73B5F1" strokeWidth="1.5" strokeLinecap="round" opacity=".75" />
    </svg>
  )
}
