import type { SVGProps } from "react";

export default function BinanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Center */}
      <path d="M12 7.15L14.85 10L12 12.85L9.15 10L12 7.15Z" />

      {/* Top */}
      <path d="M12 2L14.15 4.15L12 6.3L9.85 4.15L12 2Z" />

      {/* Left */}
      <path d="M6.15 8.15L8.3 10.3L6.15 12.45L4 10.3L6.15 8.15Z" />

      {/* Right */}
      <path d="M17.85 8.15L20 10.3L17.85 12.45L15.7 10.3L17.85 8.15Z" />

      {/* Bottom */}
      <path d="M12 13.7L14.15 15.85L12 18L9.85 15.85L12 13.7Z" />

      {/* Lower-left */}
      <path d="M6.15 13.55L8.3 15.7L6.15 17.85L4 15.7L6.15 13.55Z" />

      {/* Lower-right */}
      <path d="M17.85 13.55L20 15.7L17.85 17.85L15.7 15.7L17.85 13.55Z" />
    </svg>
  );
}
