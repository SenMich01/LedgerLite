export default function LogoIcon({ size = 36, className = "" }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 40 40" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vertical bar of L */}
      <rect x="5" y="4" width="7" height="24" rx="2" fill="#1B6B3A"/>
      {/* Horizontal bar of L */}
      <rect x="5" y="27" width="22" height="7" rx="2" fill="#1B6B3A"/>
      {/* Inner ledger lines */}
      <rect x="8" y="8"  width="2" height="3" rx="0.5" fill="#ffffff" opacity="0.5"/>
      <rect x="8" y="14" width="2" height="3" rx="0.5" fill="#ffffff" opacity="0.5"/>
      <rect x="8" y="20" width="2" height="3" rx="0.5" fill="#ffffff" opacity="0.5"/>
      {/* Trend line */}
      <polyline
        points="7,23 13,16 19,19 27,8"
        stroke="#4ADE80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow head */}
      <polyline
        points="22,6 28,6 28,12"
        stroke="#4ADE80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
