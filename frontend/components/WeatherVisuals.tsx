'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, Sun, Moon, CloudFog, CloudLightning, 
  CloudSnow, CloudDrizzle, Tornado, Wind, CloudSun, Cloud, Snowflake, CloudMoon
} from 'lucide-react';
import { getWeatherTheme } from '../lib/weatherTheme';

// --------------------------------------------------------------------------
// BACKGROUND GRAPHIC (Massive Kinetic Background Atmosphere)
// --------------------------------------------------------------------------
export function BackgroundWeatherGraphic({ 
  condition, 
  isClear, 
  isLight 
}: { 
  condition: string; 
  isClear: boolean; 
  isLight: boolean; 
}) {
  const theme = getWeatherTheme(condition);
  const strokeColorClass = theme.accentTextClass;

  // Preserve the exact background opacity scaling constraints
  const blurClass = isClear ? 'blur-[4px]' : 'blur-[12px] sm:blur-[24px]';
  const opacityClass = isClear 
    ? (isLight ? 'opacity-80' : 'opacity-40') 
    : (isLight ? (theme.isStormy ? 'opacity-60' : 'opacity-70') : 'opacity-30');

  // Animation variants per condition block
  const backgroundMotion = {
    x: theme.isStormy ? [-30, 30, -30] : [-20, 20, -20],
    y: theme.isStormy ? [-10, 10, -10] : [-15, 15, -15]
  };

  return (
    <motion.div
      animate={backgroundMotion}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className={`absolute w-[600px] h-[600px] lg:w-[1200px] lg:h-[1200px] transition-all duration-1000 ${blurClass} ${opacityClass}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full overflow-visible ${strokeColorClass}`}>
        <AnimatePresence mode="popLayout">
          {renderBackgroundPaths(theme.conditionKey)}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
}

// --------------------------------------------------------------------------
// CLIPPED HEADER GRAPHIC (Massive Clipped Icon on Right Edge)
// AIRTIGHT CSS CONSTRAINTS: MUST preserve opacity-[0.12] / [0.08], scale-[2]/[3], z-index
// --------------------------------------------------------------------------
export function ClippedWeatherIcon({ condition, isLight }: { condition: string; isLight: boolean }) {
  const theme = getWeatherTheme(condition);
  const opacityClass = isLight ? 'opacity-[0.12]' : 'opacity-[0.08]';
  const Container = 'div';
  
  return (
    <Container className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 pointer-events-none scale-[2] lg:scale-[3] ${opacityClass}`}>
      {renderLucideIcon(theme.conditionKey, `w-64 h-64 ${theme.accentTextClass}`)}
    </Container>
  );
}

// --------------------------------------------------------------------------
// HEADER ICON (Top Left Logo)
// --------------------------------------------------------------------------
export function HeaderWeatherIcon({ condition }: { condition: string }) {
  const theme = getWeatherTheme(condition);
  return renderLucideIcon(theme.conditionKey, `w-7 h-7 ${theme.accentTextClass}`);
}

// ==========================================================================
// RENDER HELPERS
// ==========================================================================

function renderLucideIcon(key: string, className: string) {
  switch (key) {
    case 'tornado': return <Tornado className={className} strokeWidth={1} />;
    case 'snowy': return <Snowflake className={className} strokeWidth={1} />;
    case 'hail': return <CloudSnow className={className} strokeWidth={1} />;
    case 'stormy': return <CloudLightning className={className} strokeWidth={1} />;
    case 'heavy_rain': return <CloudRain className={className} strokeWidth={1} />;
    case 'drizzle': return <CloudDrizzle className={className} strokeWidth={1} />;
    case 'rain': return <CloudRain className={className} strokeWidth={1} />;
    case 'fog': return <CloudFog className={className} strokeWidth={1} />;
    case 'windy': return <Wind className={className} strokeWidth={1} />;
    case 'cloudy': return <Cloud className={className} strokeWidth={1} />;
    case 'partly_cloudy': return <CloudSun className={className} strokeWidth={1} />;
    case 'partly_cloudy_night': return <CloudMoon className={className} strokeWidth={1} />;
    case 'cloudy_night': return <CloudMoon className={className} strokeWidth={1} />;
    case 'clear_night': return <Moon className={className} strokeWidth={1} />;
    case 'clear_day':
    default: return <Sun className={className} strokeWidth={1} />;
  }
}

function renderBackgroundPaths(key: string) {
  switch (key) {
    case 'rain':
    case 'heavy_rain':
    case 'drizzle':
      return (
        <motion.g key="rainy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <motion.path d="M16 14v8" animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          <motion.path d="M8 14v8" animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.5 }} />
          {key !== 'drizzle' && <motion.path d="M12 16v8" animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 1 }} />}
        </motion.g>
      );
    case 'stormy':
      return (
        <motion.g key="stormy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <motion.path d="M13 14l-4 5h5l-2 5" animate={{ opacity: [0, 1, 0], filter: ['drop-shadow(0 0 0px transparent)', 'drop-shadow(0 0 10px currentColor)', 'drop-shadow(0 0 0px transparent)'] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', times: [0, 0.1, 0.5] }} fill="currentColor" stroke="none" />
          <motion.path d="M16 14v4" animate={{ y: [0, 6, 0], opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
        </motion.g>
      );
    case 'snowy':
      return (
        <motion.g key="snowy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '12px 12px' }}>
            <path d="M2 12h20" />
            <path d="M12 2v20" />
            <path d="m20 4-16 16" />
            <path d="m4 4 16 16" />
            <path d="m15 9-3-3 3-3" />
            <path d="m9 9 3-3-3-3" />
            <path d="m15 15-3 3 3 3" />
            <path d="m9 15 3 3-3 3" />
          </motion.g>
        </motion.g>
      );
    case 'hail':
      return (
        <motion.g key="hail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <motion.circle cx="16" cy="16" r="1.5" fill="currentColor" animate={{ y: [0, 8, 2], opacity: [1, 1, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          <motion.circle cx="8" cy="16" r="1.5" fill="currentColor" animate={{ y: [0, 8, 2], opacity: [1, 1, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.3 }} />
          <motion.circle cx="12" cy="18" r="1.5" fill="currentColor" animate={{ y: [0, 8, 2], opacity: [1, 1, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.6 }} />
        </motion.g>
      );
    case 'windy':
      return (
        <motion.g key="windy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M12.8 19.6A2 2 0 1 0 14 16H2" animate={{ x: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" animate={{ x: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} />
          <motion.path d="M9.8 4.4A2 2 0 1 1 11 8H2" animate={{ x: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
        </motion.g>
      );
    case 'cloudy':
    case 'partly_cloudy':
    case 'cloudy_night':
    case 'partly_cloudy_night':
      return (
        <motion.g key="cloudy_group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          {key === 'partly_cloudy' && (
            <motion.g animate={{ rotate: 10 }} transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} style={{ transformOrigin: '12px 12px' }}>
              <circle cx="16" cy="8" r="3" />
            </motion.g>
          )}
          {key === 'partly_cloudy_night' && (
            <motion.g animate={{ rotate: 10 }} transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} style={{ transformOrigin: '16px 8px' }}>
              <g transform="translate(8, 2) scale(0.6)">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </g>
            </motion.g>
          )}
          <motion.path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" animate={{ x: [-2, 2, -2] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M18 16a4 4 0 0 0-4-4h-1a6 6 0 0 0-11.2-3.1" opacity={0.5} animate={{ x: [2, -2, 2] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.g>
      );
    case 'fog':
      return (
        <motion.g key="fog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M4 8h16" animate={{ x: [-4, 4, -4], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M2 12h20" animate={{ x: [4, -4, 4], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M6 16h12" animate={{ x: [-3, 3, -3], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.g>
      );
    case 'tornado':
      return (
        <motion.g key="tornado" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M4 12h16" animate={{ x: [-8, 8, -8] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M6 16h12" animate={{ x: [-12, 12, -12] }} transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M8 20h8" animate={{ x: [-16, 16, -16] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M3 8h18" animate={{ x: [-4, 4, -4] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.path d="M2 4h20" animate={{ x: [-2, 2, -2] }} transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.g>
      );
    case 'clear_night':
      return (
        <motion.g key="clear_night" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          <motion.path d="M18 4v2" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.path d="M17 5h2" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.g>
      );
    case 'clear_day':
    default:
      return (
        <motion.g key="clear_day" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '12px 12px' }}>
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </motion.g>
        </motion.g>
      );
  }
}

