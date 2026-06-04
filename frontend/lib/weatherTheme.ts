export interface WeatherTheme {
  accentColor: string;
  accentTextClass: string;
  isStormy: boolean; // Determines glass reflections mostly
  conditionKey: string;
}

export function getWeatherTheme(condition: string): WeatherTheme {
  const norm = condition.toLowerCase();

  if (norm.includes('tornado') || norm.includes('hurricane')) {
    return { accentColor: 'rose', accentTextClass: 'text-rose-500', isStormy: true, conditionKey: 'tornado' };
  }
  if (norm.includes('hail') || norm.includes('sleet')) {
    return { accentColor: 'cyan', accentTextClass: 'text-cyan-400', isStormy: true, conditionKey: 'hail' };
  }
  if (norm.includes('storm') || norm.includes('thunder')) {
    return { accentColor: 'indigo', accentTextClass: 'text-indigo-400', isStormy: true, conditionKey: 'stormy' };
  }
  if (norm.includes('heavy rain')) {
    return { accentColor: 'sky', accentTextClass: 'text-sky-500', isStormy: true, conditionKey: 'heavy_rain' };
  }
  if (norm.includes('drizzle')) {
    return { accentColor: 'blue', accentTextClass: 'text-blue-400', isStormy: false, conditionKey: 'drizzle' };
  }
  if (norm.includes('rain')) {
    return { accentColor: 'sky', accentTextClass: 'text-sky-400', isStormy: true, conditionKey: 'rain' };
  }
  if (norm.includes('blizzard') || norm.includes('snow')) {
    return { accentColor: 'cyan', accentTextClass: 'text-cyan-400', isStormy: true, conditionKey: 'snowy' };
  }
  if (norm.includes('fog') || norm.includes('mist')) {
    return { accentColor: 'slate', accentTextClass: 'text-slate-400', isStormy: false, conditionKey: 'fog' };
  }
  if (norm.includes('wind')) {
    return { accentColor: 'teal', accentTextClass: 'text-teal-400', isStormy: false, conditionKey: 'windy' };
  }
  if (norm.includes('partly')) {
    return { accentColor: 'yellow', accentTextClass: 'text-yellow-400', isStormy: false, conditionKey: 'partly_cloudy' };
  }
  if (norm.includes('cloud')) {
    return { accentColor: 'slate', accentTextClass: 'text-slate-400', isStormy: false, conditionKey: 'cloudy' };
  }
  if (norm.includes('clear') || norm.includes('night')) {
    return { accentColor: 'violet', accentTextClass: 'text-violet-400', isStormy: false, conditionKey: 'clear_night' };
  }
  // Default to Clear Day
  return { accentColor: 'amber', accentTextClass: 'text-amber-500', isStormy: false, conditionKey: 'clear_day' };
}

/*
  TAILWIND SAFELIST
  Because we dynamically construct classes like `bg-${accentColor}-400` in page.tsx, 
  Tailwind's JIT compiler might miss them if they aren't explicitly declared in source code.
  We list them here so they are bundled into the final CSS.

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
*/
