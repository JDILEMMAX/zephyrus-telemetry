import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * ARCHITECTURAL NOTE: UNIVERSAL PORT TOGGLE
 * -----------------------------------------
 * This interactive switch serves as the visual representation of our strict 
 * decoupling. Modifying this toggle instructs the overarching layout to instantly 
 * discard the current adapter (e.g., NextBFFAdapter) and instantiate an entirely 
 * different technology stack (e.g., FastAPIAdapter).
 * 
 * Framer Motion's `layoutId` flawlessly handles the liquid transition geometry 
 * between the two options.
 */
type BackendType = 'edge' | 'python';

interface BackendSwitcherProps {
  activeBackend: BackendType;
  onChange: (backend: BackendType) => void;
}

export function BackendSwitcher({ activeBackend, onChange }: BackendSwitcherProps) {
  const options = [
    { id: 'edge', label: 'Next.js Edge (BFF)' },
    { id: 'python', label: 'FastAPI (Python)' },
  ] as const;

  return (
    <div className="flex p-1.5 bg-black/40 rounded-full border border-white/10 backdrop-blur-md relative overflow-hidden shadow-inner">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'relative px-5 py-2 text-xs font-mono uppercase tracking-wider rounded-full transition-colors z-10 outline-none',
            activeBackend === option.id ? 'text-blue-50 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          {activeBackend === option.id && (
            <motion.div
              layoutId="active-backend-pill"
              className="absolute inset-0 bg-blue-600/80 shadow-[0_0_20px_rgba(37,99,235,0.6)] backdrop-blur-md rounded-full -z-10"
              transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
            />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}
