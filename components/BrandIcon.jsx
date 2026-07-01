import { useId } from "react";

export default function BrandIcon({ size = 32, className = "" }) {
  const raw = useId();
  const id = `aeg${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C8E0" />
          <stop offset="100%" stopColor="#0040C8" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill={`url(#${id})`} />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fill="white"
        fontFamily="'Inter', 'Arial', sans-serif"
        fontWeight="800"
        fontSize="46"
        letterSpacing="-2"
      >
        AE
      </text>
    </svg>
  );
}
