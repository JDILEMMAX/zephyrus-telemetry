import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

/**
 * ARCHITECTURAL NOTE: REUSABLE GLASS PANEL COMPONENT
 * --------------------------------------------------
 * This component abstracts the complex Tailwind backdrop-filter and shadow combinations
 * required for the "Frosty Blue Glassmorphism" aesthetic.
 * 
 * By encapsulating the `isFrosted` state logic here, we ensure that the entire 
 * dashboard can fluidly transition between heavy frost (blur) and transparent clear glass 
 * uniformly, without duplicating utility classes across dozens of DOM nodes.
 */
interface GlassPanelProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  isFrosted?: boolean;
  className?: string;
}

export function GlassPanel({ children, isFrosted = true, className, ...props }: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        'rounded-3xl border transition-all duration-700 ease-in-out',
        isFrosted
          ? 'bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          : 'bg-black/20 backdrop-blur-sm border-white/5 shadow-none',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
