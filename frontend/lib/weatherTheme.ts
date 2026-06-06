export interface WeatherTheme {
  accentColor: string;
  accentHex: string;
  accentTextClass: string;
  isStormy: boolean;
  conditionKey: string;
}

export function getWeatherTheme(condition: string): WeatherTheme {
  const norm = condition.toLowerCase();

  if (norm.includes('tornado') || norm.includes('hurricane')) {
    return { accentColor: 'rose', accentHex: '#fb7185', accentTextClass: 'text-rose-500', isStormy: true, conditionKey: 'tornado' };
  }
  if (norm.includes('hail') || norm.includes('sleet')) {
    return { accentColor: 'cyan', accentHex: '#22d3ee', accentTextClass: 'text-cyan-400', isStormy: true, conditionKey: 'hail' };
  }
  if (norm.includes('storm') || norm.includes('thunder')) {
    return { accentColor: 'indigo', accentHex: '#818cf8', accentTextClass: 'text-indigo-400', isStormy: true, conditionKey: 'stormy' };
  }
  if (norm.includes('heavy rain')) {
    return { accentColor: 'sky', accentHex: '#38bdf8', accentTextClass: 'text-sky-500', isStormy: true, conditionKey: 'heavy_rain' };
  }
  if (norm.includes('drizzle')) {
    return { accentColor: 'blue', accentHex: '#60a5fa', accentTextClass: 'text-blue-400', isStormy: false, conditionKey: 'drizzle' };
  }
  if (norm.includes('rain')) {
    return { accentColor: 'sky', accentHex: '#38bdf8', accentTextClass: 'text-sky-400', isStormy: true, conditionKey: 'rain' };
  }
  if (norm.includes('blizzard') || norm.includes('snow')) {
    return { accentColor: 'cyan', accentHex: '#22d3ee', accentTextClass: 'text-cyan-400', isStormy: true, conditionKey: 'snowy' };
  }
  if (norm.includes('fog') || norm.includes('mist')) {
    return { accentColor: 'slate', accentHex: '#94a3b8', accentTextClass: 'text-slate-400', isStormy: false, conditionKey: 'fog' };
  }
  if (norm.includes('wind')) {
    return { accentColor: 'teal', accentHex: '#2dd4bf', accentTextClass: 'text-teal-400', isStormy: false, conditionKey: 'windy' };
  }
  if (norm.includes('partly') && norm.includes('night')) {
    return { accentColor: 'violet', accentHex: '#a78bfa', accentTextClass: 'text-violet-400', isStormy: false, conditionKey: 'partly_cloudy_night' };
  }
  if (norm.includes('cloud') && norm.includes('night') || norm.includes('overcast') && norm.includes('night')) {
    return { accentColor: 'violet', accentHex: '#a78bfa', accentTextClass: 'text-violet-400', isStormy: false, conditionKey: 'cloudy_night' };
  }
  if (norm.includes('partly')) {
    return { accentColor: 'yellow', accentHex: '#facc15', accentTextClass: 'text-yellow-400', isStormy: false, conditionKey: 'partly_cloudy' };
  }
  if (norm.includes('cloud') || norm.includes('overcast')) {
    return { accentColor: 'slate', accentHex: '#94a3b8', accentTextClass: 'text-slate-400', isStormy: false, conditionKey: 'cloudy' };
  }
  if (norm.includes('clear') || norm.includes('night')) {
    return { accentColor: 'violet', accentHex: '#a78bfa', accentTextClass: 'text-violet-400', isStormy: false, conditionKey: 'clear_night' };
  }
  // Default to Clear Day
  return { accentColor: 'amber', accentHex: '#fbbf24', accentTextClass: 'text-amber-500', isStormy: false, conditionKey: 'clear_day' };
}

/*
  TAILWIND SAFELIST
  Because we dynamically construct classes like `bg-${accentColor}-400` in page.tsx, 
  Tailwind's JIT compiler might miss them if they aren't explicitly declared in source code.
  We list them here so they are bundled into the final CSS.

  --- Core (bg / border / selection) ---
  bg-rose-400 border-rose-400 border-rose-500/30 selection:bg-rose-500/30
  bg-cyan-400 border-cyan-400 border-cyan-500/30 selection:bg-cyan-500/30
  bg-indigo-400 border-indigo-400 border-indigo-500/30 selection:bg-indigo-500/30
  bg-sky-400 border-sky-400 border-sky-500/30 selection:bg-sky-500/30
  bg-blue-400 border-blue-400 border-blue-500/30 selection:bg-blue-500/30
  bg-slate-400 border-slate-400 border-slate-500/30 selection:bg-slate-500/30
  bg-teal-400 border-teal-400 border-teal-500/30 selection:bg-teal-500/30
  bg-yellow-400 border-yellow-400 border-yellow-500/30 selection:bg-yellow-500/30
  bg-violet-400 border-violet-400 border-violet-500/30 selection:bg-violet-500/30
  bg-amber-400 border-amber-400 border-amber-500/30 selection:bg-amber-500/30

  --- Toggle active (light mode) ---
  bg-rose-100 text-rose-700 border-rose-200
  bg-cyan-100 text-cyan-700 border-cyan-200
  bg-indigo-100 text-indigo-700 border-indigo-200
  bg-sky-100 text-sky-700 border-sky-200
  bg-blue-100 text-blue-700 border-blue-200
  bg-slate-100 text-slate-700 border-slate-200
  bg-teal-100 text-teal-700 border-teal-200
  bg-yellow-100 text-yellow-700 border-yellow-200
  bg-violet-100 text-violet-700 border-violet-200
  bg-amber-100 text-amber-700 border-amber-200

  --- Toggle active (dark mode) ---
  bg-rose-500/20 text-rose-300 border-rose-500/30
  bg-cyan-500/20 text-cyan-300 border-cyan-500/30
  bg-indigo-500/20 text-indigo-300 border-indigo-500/30
  bg-sky-500/20 text-sky-300 border-sky-500/30
  bg-blue-500/20 text-blue-300 border-blue-500/30
  bg-slate-500/20 text-slate-300 border-slate-500/30
  bg-teal-500/20 text-teal-300 border-teal-500/30
  bg-yellow-500/20 text-yellow-300 border-yellow-500/30
  bg-violet-500/20 text-violet-300 border-violet-500/30
  bg-amber-500/20 text-amber-300 border-amber-500/30

  --- Settings button active + icon ---
  border-rose-300 border-rose-500/50 text-rose-400 text-rose-600
  border-cyan-300 border-cyan-500/50 text-cyan-400 text-cyan-600
  border-indigo-300 border-indigo-500/50 text-indigo-400 text-indigo-600
  border-sky-300 border-sky-500/50 text-sky-400 text-sky-600
  border-blue-300 border-blue-500/50 text-blue-400 text-blue-600
  border-slate-300 border-slate-500/50 text-slate-400 text-slate-600
  border-teal-300 border-teal-500/50 text-teal-400 text-teal-600
  border-yellow-300 border-yellow-500/50 text-yellow-400 text-yellow-600
  border-violet-300 border-violet-500/50 text-violet-400 text-violet-600
  border-amber-300 border-amber-500/50 text-amber-400 text-amber-600

  --- Radar / Edge Route cards ---
  bg-rose-500/20 text-rose-100 text-rose-900 bg-rose-50/50 border-rose-200/50 bg-rose-950/40 border-rose-400/50 bg-rose-900/30
  bg-cyan-500/20 text-cyan-100 text-cyan-900 bg-cyan-50/50 border-cyan-200/50 bg-cyan-950/40 border-cyan-400/50 bg-cyan-900/30
  bg-indigo-500/20 text-indigo-100 text-indigo-900 bg-indigo-50/50 border-indigo-200/50 bg-indigo-950/40 border-indigo-400/50 bg-indigo-900/30
  bg-sky-500/20 text-sky-100 text-sky-900 bg-sky-50/50 border-sky-200/50 bg-sky-950/40 border-sky-400/50 bg-sky-900/30
  bg-blue-500/20 text-blue-100 text-blue-900 bg-blue-50/50 border-blue-200/50 bg-blue-950/40 border-blue-400/50 bg-blue-900/30
  bg-slate-500/20 text-slate-100 text-slate-900 bg-slate-50/50 border-slate-200/50 bg-slate-950/40 border-slate-400/50 bg-slate-900/30
  bg-teal-500/20 text-teal-100 text-teal-900 bg-teal-50/50 border-teal-200/50 bg-teal-950/40 border-teal-400/50 bg-teal-900/30
  bg-yellow-500/20 text-yellow-100 text-yellow-900 bg-yellow-50/50 border-yellow-200/50 bg-yellow-950/40 border-yellow-400/50 bg-yellow-900/30
  bg-violet-500/20 text-violet-100 text-violet-900 bg-violet-50/50 border-violet-200/50 bg-violet-950/40 border-violet-400/50 bg-violet-900/30
  bg-amber-500/20 text-amber-100 text-amber-900 bg-amber-50/50 border-amber-200/50 bg-amber-950/40 border-amber-400/50 bg-amber-900/30
*/
