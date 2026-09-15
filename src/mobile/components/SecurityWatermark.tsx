import React from 'react';

interface SecurityWatermarkProps {
  name?: string;
  timestamp?: string;
}

export const SecurityWatermark: React.FC<SecurityWatermarkProps> = ({
  name = '戚中彪',
  timestamp = '2026/09/08 09:34',
}) => {
  // Generate an SVG data URI pattern rotated by -18 degrees with 2 lines matching Figure 1, 2, 3, 4
  const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='210' height='130'>
    <g transform='rotate(-18 105 65)'>
      <text x='105' y='56' text-anchor='middle' fill='rgba(148, 163, 184, 0.15)' font-size='12' font-family='sans-serif' font-weight='500'>
        ${name}
      </text>
      <text x='105' y='74' text-anchor='middle' fill='rgba(148, 163, 184, 0.15)' font-size='11' font-family='sans-serif' font-weight='500'>
        ${timestamp}
      </text>
    </g>
  </svg>`;
  const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden"
      style={{
        backgroundImage: `url("${encodedSvg}")`,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
      }}
    />
  );
};
