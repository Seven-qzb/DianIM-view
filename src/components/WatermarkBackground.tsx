import React from 'react';

interface WatermarkBackgroundProps {
  text?: string;
  className?: string;
}

export const WatermarkBackground: React.FC<WatermarkBackgroundProps> = ({
  text = '戚中彪7630 2026-08-18 15:54',
  className = '',
}) => {
  // Generate a pattern of repeating angled watermark text
  const rows = Array.from({ length: 8 });
  const cols = Array.from({ length: 5 });

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-[0.035] ${className}`}
    >
      <div className="w-[150%] h-[150%] -top-[25%] -left-[25%] absolute flex flex-col justify-around rotate-[-22deg]">
        {rows.map((_, rIdx) => (
          <div key={rIdx} className="flex justify-around items-center whitespace-nowrap">
            {cols.map((_, cIdx) => (
              <span
                key={cIdx}
                className="text-gray-900 font-medium text-sm tracking-widest px-8"
              >
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
