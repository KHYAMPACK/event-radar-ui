interface EventRadarLogoProps {
  size?: number;
  className?: string;
}

export function EventRadarLogo({ size = 64, className = '' }: EventRadarLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Event Radar"
      role="img"
    >
      {/* Base platform */}
      <rect
        x="8"
        y="54"
        width="32"
        height="4"
        fill="#3A82F7"
        rx="1"
      />
      
      {/* Tripod left leg */}
      <path
        d="M 15 54 L 20 38"
        stroke="#3A82F7"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Tripod right leg */}
      <path
        d="M 33 54 L 28 38"
        stroke="#3A82F7"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Central pivot/connection point */}
      <circle
        cx="24"
        cy="36"
        r="4"
        fill="#3A82F7"
      />
      
      {/* Inner circle detail */}
      <circle
        cx="24"
        cy="36"
        r="2"
        fill="#0D0D0F"
      />
      
      {/* Parabolic dish - curved shape */}
      <path
        d="M 18 38 Q 20 28, 24 24 Q 28 28, 30 38"
        stroke="#3A82F7"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Dish support arm */}
      <path
        d="M 24 36 L 24 24"
        stroke="#3A82F7"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      
      {/* Signal waves - three curved arcs */}
      <path
        d="M 28 22 Q 32 18, 38 14"
        stroke="#3A82F7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      
      <path
        d="M 30 18 Q 36 13, 44 8"
        stroke="#3A82F7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      
      <path
        d="M 32 14 Q 40 8, 50 4"
        stroke="#3A82F7"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Accent dots on waves */}
      <circle cx="38" cy="14" r="1.5" fill="#4DFFF3" />
      <circle cx="44" cy="8" r="1.5" fill="#A05BFF" />
      <circle cx="50" cy="4" r="1.5" fill="#3A82F7" />
    </svg>
  );
}