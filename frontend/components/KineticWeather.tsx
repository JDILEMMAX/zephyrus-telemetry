import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * ARCHITECTURAL NOTE: SVG KINETIC ANIMATION LOOPS
 * ------------------------------------------------
 * Traditional DOM-based animations trigger massive layout thrashing (Reflow/Repaint). 
 * By binding our kinetic weather states to bare SVG paths and manipulating them via 
 * Framer Motion, we offload the rendering calculations directly to the GPU compositor layer.
 * 
 * This ensures the Command Center maintains a flawless 60FPS refresh rate even when 
 * the underlying SSE (Server-Sent Events) pipeline is bombarding the application 
 * with high-bandwidth anomaly payloads.
 */
export function KineticWeather({ condition, className }: { condition: string; className?: string }) {
  const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm');
  const isCloudy = condition.toLowerCase().includes('cloud') || condition.toLowerCase().includes('wind');
  const isSunny = !isRain && !isCloudy; // Default fallback to sun/clear

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
        {isSunny && (
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="origin-center"
          >
            <circle cx="50" cy="50" r="20" fill="#fcd34d" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.line
                key={angle}
                x1="50" y1="20" x2="50" y2="8"
                stroke="#fde68a" strokeWidth="4" strokeLinecap="round"
                transform={`rotate(${angle} 50 50)`}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: angle / 100 }}
              />
            ))}
          </motion.g>
        )}

        {isCloudy && !isRain && (
          <motion.g>
            <motion.path
              d="M30 60 Q20 60 20 50 Q20 40 30 40 Q35 30 50 30 Q65 30 70 45 Q80 45 80 55 Q80 65 70 65 L30 65 Z"
              fill="#94a3b8"
              animate={{ x: [-5, 5, -5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M10 70 L90 70"
              stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 10"
              animate={{ x: [-20, 20] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.g>
        )}

        {isRain && (
          <motion.g>
             <path d="M30 50 Q20 50 20 40 Q20 30 30 30 Q35 20 50 20 Q65 20 70 35 Q80 35 80 45 Q80 55 70 55 L30 55 Z" fill="#475569" />
             {[35, 45, 55, 65].map((x, i) => (
               <motion.line
                 key={x}
                 x1={x} y1="60" x2={x - 10} y2="80"
                 stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"
                 initial={{ y: -10, opacity: 0 }}
                 animate={{ y: 20, opacity: [0, 1, 0] }}
                 transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
               />
             ))}
             <motion.path 
                d="M40 70 L50 90 L60 70 Z" fill="#fbbf24"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 0, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "circIn", delay: 1 }}
             />
          </motion.g>
        )}
      </svg>
    </div>
  );
}
