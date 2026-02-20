"use client";

import { cn } from "@/lib/utils";

interface SparkIconProps {
  size?: number;
  className?: string;
}

export default function SparkIcon({ size = 16, className }: SparkIconProps) {
  return (
    <>
      <style>{`
        @keyframes spark-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(139, 92, 246, 0.6)) drop-shadow(0 0 6px rgba(167, 139, 250, 0.3)); }
          50%       { filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.9)) drop-shadow(0 0 12px rgba(167, 139, 250, 0.5)); }
        }
        .spark-glow {
          animation: spark-glow-pulse 2.4s ease-in-out infinite;
        }
      `}</style>
      <span
        className={cn("spark-glow inline-flex shrink-0", className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-5 -10 110 115"
          width={size}
          height={size}
          style={{
            fill: "rgb(139, 92, 246)",   /* violet-500 */
          }}
        >
          <path d="m50 5 5.7695 15.598c4.0547 10.949 12.684 19.578 23.633 23.633l15.598 5.7695-15.598 5.7695c-10.949 4.0547-19.578 12.684-23.633 23.633l-5.7695 15.598-5.7695-15.598c-4.0547-10.949-12.684-19.578-23.633-23.633l-15.598-5.7695 15.598-5.7695c10.949-4.0547 19.578-12.684 23.633-23.633z" />
        </svg>
      </span>
    </>
  );
}
