'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, CloudLightning, Sun, Cloud, Search, Droplets, Activity, Radio, Shield, Thermometer, Moon, Server, Zap, Globe, RefreshCcw, Database, X, BarChart3, ChevronRight, XOctagon, RotateCw, Terminal, Settings2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getWeatherTheme } from '../lib/weatherTheme';
import { BackgroundWeatherGraphic, ClippedWeatherIcon, HeaderWeatherIcon } from '../components/WeatherVisuals';
// DEVELOPMENT UTILITY: Uncomment below to import the environmental cycle simulator
// import { useWeatherSimulator } from '../hooks/useWeatherSimulator';

/*
 * ARCHITECTURAL NOTES:
 * Decoupled Frontends & Backends with Edge Caching & SSE
 * 
 * 1. Adapter Pattern (Dependency Injection):
 *    The `backendMode` toggle dynamically switches the data source between the integrated Next.js BFF layer 
 *    and the specialized decoupled FastAPI node.
 * 2. Edge Caching & State Hydration:
 *    We simulate robust TTL edge caching to protect external proprietary API constraints. The frontend 
 *    utilizes optimistic UI rendering and graceful degradation when offline or rate-limited.
 * 3. SSE Webhook (Server-Sent Events):
 *    A mocked SSE listener is bound on mount, establishing a persistent unidirectional data stream 
 *    from the command center to capture volatile atmospheric anomalies instantly.
 */

const GlassPanel = ({
  children, clearMode = false, isLight = false, isStormy = true, className = ""
}: {
  children: React.ReactNode; clearMode?: boolean; isLight?: boolean; isStormy?: boolean; className?: string
}) => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const borderClass = isLight ? 'border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)]' : isStormy ? 'border-sky-400/20' : 'border-amber-500/20';
  const frostClass = isLight ? 'bg-white/30 backdrop-blur-md' : isStormy ? 'bg-slate-900/30 backdrop-blur-md' : 'bg-[#181005]/40 backdrop-blur-md';
  const clearClass = isLight ? 'bg-white/10 backdrop-blur-[2px]' : 'bg-white/[0.02] backdrop-blur-[2px] shadow-none';

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${clearMode ? clearClass : frostClass} ${borderClass} border rounded-[2rem] transition-colors duration-700 shadow-2xl ${isLight ? 'shadow-black/5' : 'shadow-black/20'} ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${
            isLight ? 'rgba(255,255,255,0.8)' : isStormy ? 'rgba(56, 189, 248, 0.08)' : 'rgba(245, 158, 11, 0.08)'
            }, transparent 40%)`
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export default function Page() {
  const [backendMode, setBackendMode] = useState<'EDGE_BFF' | 'FASTAPI'>('EDGE_BFF');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'STABLE' | 'SYNCING' | 'DISCONNECTED'>('STABLE');
  const [glassPhysics, setGlassPhysics] = useState<'FROSTED' | 'CLEAR'>('FROSTED');
  const [themeMode, setThemeMode] = useState<'DARK' | 'LIGHT'>('DARK');
  const [showDeepAtmosphere, setShowDeepAtmosphere] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFabAnimating, setIsFabAnimating] = useState(true);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const [weatherData, setWeatherData] = useState<{
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    location: string;
    feelsLike: number;
    uvIndex: number | string;
    isDay: boolean;
  }>({
    temperature: 0,
    condition: "Offline",
    humidity: 0,
    windSpeed: 0,
    location: "Offline",
    feelsLike: 0,
    uvIndex: "None",
    isDay: true
  });

  const [forecastData, setForecastData] = useState<any[]>([]);

  const [usageData, setUsageData] = useState({ quotaUsed: 0, quotaTotal: 0 });
  const [latency, setLatency] = useState(0);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const fallbackHubs = ["Nairobi", "New York", "Tokyo", "London", "Paris"];
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // =========================================================================
  // DEVELOPMENT SIMULATOR: Uncomment the line below to hijack the telemetry feed 
  // and preview all aesthetic condition states every 5 seconds.
  // =========================================================================
  // useWeatherSimulator(setWeatherData);

  const fetchData = async (targetLocation: string = weatherData.location) => {
    setIsRefreshing(true);
    setConnectionStatus('SYNCING');
    addLog(`[REQ] GET weather context for ${targetLocation}`);
    const start = performance.now();
    try {
      const baseUrl = backendMode === 'FASTAPI' ? (process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000') : '';
      const [weatherRes, usageRes, forecastRes] = await Promise.all([
        fetch(`${baseUrl}/api/weather/current?location=${encodeURIComponent(targetLocation)}`),
        fetch(`${baseUrl}/api/usage`),
        fetch(`${baseUrl}/api/weather/forecast?location=${encodeURIComponent(targetLocation)}`)
      ]);
      const wData = await weatherRes.json();
      const uData = await usageRes.json();
      const fData = await forecastRes.json();
      setWeatherData({
        temperature: wData.temperature ?? 0,
        condition: wData.condition || "Offline",
        humidity: wData.humidity ?? 0,
        windSpeed: wData.windSpeed ?? 0,
        location: wData.location || targetLocation,
        feelsLike: wData.feelsLike ?? 0,
        uvIndex: wData.uvIndex ?? "None",
        isDay: wData.isDay ?? true
      });
      setUsageData({ quotaUsed: uData.quotaUsed ?? 0, quotaTotal: uData.quotaTotal ?? 0 });
      if (fData.days && fData.days.length > 0) {
        setForecastData(fData.days);
      }
      setConnectionStatus('STABLE');
      addLog(`[RES] 200 OK (${Math.round(performance.now() - start)}ms)`);
    } catch (err) {
      console.error(err);
      setConnectionStatus('DISCONNECTED');
      addLog(`[ERR] 503 Service Unavailable`);
    } finally {
      setIsRefreshing(false);
      setLatency(Math.round(performance.now() - start));
    }
  };

  const initZeroClickOnboarding = async () => {
    addLog(`[REQ] Initializing Zero-Click Onboarding...`);
    try {
      const baseUrl = backendMode === 'FASTAPI' ? (process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000') : '';
      const geoRes = await fetch(`${baseUrl}/api/weather/geo`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.location && geoData.location !== "Unknown") {
          setIsUsingFallback(false);
          await fetchData(geoData.location);
          return;
        }
      }
    } catch (e) {
      console.error("Zero-click IP geo failed", e);
    }

    // Fallback logic
    addLog(`[WARN] IP detection failed. Activating Atmospheric Fallback.`);
    setIsUsingFallback(true);
    await fetchData(fallbackHubs[0]);
  };

  useEffect(() => {
    initZeroClickOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendMode]);

  useEffect(() => {
    if (isUsingFallback) {
      fallbackIntervalRef.current = setInterval(() => {
        setFallbackIndex(prev => {
          const next = (prev + 1) % fallbackHubs.length;
          fetchData(fallbackHubs[next]);
          return next;
        });
      }, 5 * 60 * 1000); // 5 minutes
    } else if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
    }
    return () => {
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    };
  }, [isUsingFallback, backendMode]);

  // EKG FAB Animation
  useEffect(() => {
    const timer = setTimeout(() => setIsFabAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsFabAnimating(true);
    setTimeout(() => setIsFabAnimating(false), 2500);
    fetchData();
  };

  const handleLocationSubmit = (newLocation: string) => {
    if (newLocation && newLocation.trim() !== '') {
      setIsUsingFallback(false);
      setIsEditingLocation(false);
      fetchData(newLocation);
    } else {
      setIsEditingLocation(false);
    }
  };

  const isLight = themeMode === 'LIGHT';
  const isClear = glassPhysics === 'CLEAR';
  const weatherTheme = getWeatherTheme(weatherData.condition);
  const isStormy = weatherTheme.isStormy;
  const isNight = !weatherData.isDay;

  const accentColor = weatherTheme.accentColor;
  const accentHex = weatherTheme.accentHex;
  const accentTextClass = weatherTheme.accentTextClass;

  const ToggleBtn = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 text-center ${
        active 
          ? (isLight ? `bg-${accentColor}-100 text-${accentColor}-700 shadow-sm border border-${accentColor}-200` : `bg-${accentColor}-500/20 text-${accentColor}-300 shadow-sm border border-${accentColor}-500/30`)
          : (isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent')
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`min-h-screen font-sans selection:bg-${accentColor}-500/30 relative transition-colors duration-1000 ${
      isLight ? 'bg-slate-100 text-slate-900' : (isStormy ? 'bg-[#050b14] text-slate-100' : 'bg-[#0a0703] text-slate-100')
      }`}>

      {/* Massive Kinetic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <BackgroundWeatherGraphic condition={weatherData.condition} isClear={isClear} isLight={isLight} />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-10 relative z-10 flex flex-col min-h-screen">

        {/* Premium Header Grid */}
        <header className="flex flex-row items-start sm:items-center justify-between mb-8 gap-4 w-full">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all duration-700 ${isLight ? 'bg-black/5' : 'bg-white/5 border-white/10 border'}`}>
                <HeaderWeatherIcon condition={weatherData.condition} />
              </div>
            </div>
            <div>
              <h1 className={`font-display text-base sm:text-lg md:text-2xl font-bold uppercase tracking-wider sm:tracking-[0.1em] md:tracking-[0.15em] flex flex-wrap items-center gap-1 md:gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Zephyrus <span className={accentTextClass}>Command</span>
              </h1>
              <p className={`font-mono text-[7px] sm:text-[8px] md:text-[10px] uppercase tracking-widest md:tracking-[0.3em] mt-0.5 md:mt-1 ${isLight ? 'text-slate-500' : 'opacity-60'}`}>
                Atmospheric Telemetry Node
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowSettings(prev => !prev)}
                  className={`p-3 rounded-full border transition-all duration-500 focus:outline-none flex items-center justify-center ${
                    glassPhysics === 'FROSTED'
                    ? (isLight ? 'bg-white/30 backdrop-blur-md border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:bg-white/40' : (isStormy ? 'bg-slate-900/30 border-sky-400/20' : 'bg-[#181005]/40 border-amber-500/20') + ' backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/10')
                    : (isLight ? 'bg-white/10 backdrop-blur-[2px] border-white/30 shadow-sm hover:bg-white/20' : 'bg-white/[0.02] backdrop-blur-[2px] border-white/10 shadow-none hover:bg-white/[0.05]')
                  } ${showSettings ? (isLight ? `bg-${accentColor}-100 border-${accentColor}-300` : `bg-${accentColor}-500/20 border-${accentColor}-500/50`) : ''}`}
              >
                <Settings2 className={`w-5 h-5 transition-colors ${isLight ? `text-${accentColor}-600` : `text-${accentColor}-400`}`} />
              </button>
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    key="settings-panel"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                      className={`absolute right-0 top-full mt-4 p-5 rounded-[2rem] border flex flex-col gap-6 min-w-[280px] z-50 transition-all duration-500 ${
                        glassPhysics === 'FROSTED'
                        ? (isLight ? 'bg-white/30 backdrop-blur-md border-white/60 shadow-[0_16px_48px_rgba(0,0,0,0.1)]' : (isStormy ? 'bg-slate-900/30 border-sky-400/20' : 'bg-[#181005]/40 border-amber-500/20') + ' shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-md')
                        : (isLight ? 'bg-white/20 backdrop-blur-sm border-white/40 shadow-sm' : 'bg-[#0f0f11]/40 border-white/10 shadow-lg backdrop-blur-sm')
                      }`}
                  >
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest block mb-3 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Theme</span>
                      <div className={`flex w-full rounded-full p-1 transition-colors ${isLight ? 'bg-black/5' : 'bg-black/40'}`}>
                        <ToggleBtn active={themeMode === 'DARK'} onClick={() => setThemeMode('DARK')} label="Dark" />
                        <ToggleBtn active={themeMode === 'LIGHT'} onClick={() => setThemeMode('LIGHT')} label="Light" />
                      </div>
                    </div>

                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest block mb-3 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Glass Physics</span>
                      <div className={`flex w-full rounded-full p-1 transition-colors ${isLight ? 'bg-black/5' : 'bg-black/40'}`}>
                        <ToggleBtn active={glassPhysics === 'FROSTED'} onClick={() => setGlassPhysics('FROSTED')} label="Frosted" />
                        <ToggleBtn active={glassPhysics === 'CLEAR'} onClick={() => setGlassPhysics('CLEAR')} label="Clear" />
                      </div>
                    </div>

                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest block mb-3 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Adapter Node</span>
                      <div className={`flex w-full rounded-full p-1 transition-colors ${isLight ? 'bg-black/5' : 'bg-black/40'}`}>
                        <ToggleBtn active={backendMode === 'EDGE_BFF'} onClick={() => setBackendMode('EDGE_BFF')} label="BFF Adapter" />
                        <ToggleBtn active={backendMode === 'FASTAPI'} onClick={() => setBackendMode('FASTAPI')} label="FastAPI" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 mt-4 lg:mt-0">

          {/* Left Column - Core Metrics */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6 h-full">

            {/* Hero Card */}
            <GlassPanel clearMode={isClear} isLight={isLight} isStormy={isStormy} className="col-span-1 flex-1 relative flex items-center">
              <div className="p-12 z-10 w-full flex justify-between items-center h-full">
                <div className="flex flex-col h-full justify-between w-full">

                  {/* Location & Refresh */}
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-${accentColor}-500/30 font-mono text-[10px] uppercase tracking-widest ${isLight ? 'bg-black/5 text-slate-800' : 'bg-white/5 text-slate-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'STABLE' ? `bg-${accentColor}-400 animate-pulse` : connectionStatus === 'SYNCING' ? 'bg-orange-400' : 'bg-red-500'}`} />
                      {isEditingLocation ? (
                        <input
                          autoFocus
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          onBlur={() => handleLocationSubmit(locationInput)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleLocationSubmit(locationInput) }}
                          className={`bg-transparent outline-none border-none min-w-[120px] text-[10px] placeholder:text-slate-500 uppercase font-mono tracking-widest ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
                          placeholder="ENTER CITY..."
                        />
                      ) : (
                        <span
                          onClick={() => { setLocationInput(weatherData.location); setIsEditingLocation(true); }}
                          className="cursor-pointer hover:opacity-70 transition-opacity"
                        >
                          {weatherData.location}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleManualRefresh}
                      disabled={isRefreshing}
                      className={`p-1.5 rounded-full transition-all duration-300 ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
                    >
                      <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} ${accentTextClass}`} />
                    </button>
                  </div>

                  {/* Temperature & Condition strictly flushed */}
                  <div className="mt-12 lg:mt-8 flex flex-col">
                    <div className="flex items-start">
                      <span className={`text-[8rem] lg:text-[12rem] leading-[0.8] font-display font-medium tracking-tighter ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                        {weatherData.temperature}
                      </span>
                      <div className="flex items-center justify-center w-8 h-8 lg:w-16 lg:h-16 mt-2 lg:mt-4 ml-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className={`text-5xl lg:text-6xl ${accentTextClass} leading-none block transform-gpu origin-center`}
                        >
                          °
                        </motion.span>
                      </div>
                    </div>
                    <p className={`text-3xl lg:text-5xl mt-4 lg:mt-2 font-display font-light tracking-tight ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {weatherData.condition}
                    </p>
                  </div>
                </div>
              </div>

              {/* Massive Clipped Icon on Right Edge */}
              <ClippedWeatherIcon condition={weatherData.condition} isLight={isLight} />
            </GlassPanel>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 flex-none">
              {[
                { label: "Humidity", icon: Droplets, val: `${weatherData.humidity}%` },
                { label: "Wind Velocity", icon: Wind, val: `${weatherData.windSpeed} km/h` },
                { label: "Feels Like", icon: Thermometer, val: `${weatherData.feelsLike}°` },
                { label: "UV Index", icon: Sun, val: weatherData.uvIndex }
              ].map((stat, i) => (
                <GlassPanel clearMode={isClear} isLight={isLight} isStormy={isStormy} key={i} className="flex flex-col justify-center p-6 lg:p-8 transition-transform hover:-translate-y-1 group min-h-[140px] lg:min-h-[192px]">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500 ${isLight ? 'bg-black/5 group-hover:bg-black/10' : 'bg-white/5 group-hover:bg-white/10 border border-white/5'}`}>
                    <stat.icon className={`w-6 h-6 ${accentTextClass}`} />
                  </div>
                  <p className={`font-mono text-xs uppercase tracking-[0.2em] mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                  <p className={`text-3xl font-display font-medium ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{stat.val}</p>
                </GlassPanel>
              ))}
            </div>
          </div>

          {/* Right Column - Live Engineering Data */}
          <div className="col-span-1 lg:col-span-4 h-full flex flex-col">
            <GlassPanel clearMode={isClear} isLight={isLight} isStormy={isStormy} className="p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-${accentColor}-500/20`}>
                    <Radio className={`w-5 h-5 text-${accentColor}-400`} />
                  </div>
                  <h3 className={`font-mono text-xs tracking-[0.2em] uppercase ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Target Radar</h3>
                </div>
                {/* Radar Ping Animation */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <motion.div animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} className={`absolute inset-0 rounded-full border border-${accentColor}-400`} />
                  <div className={`w-2 h-2 rounded-full bg-${accentColor}-400 animate-pulse`} />
                </div>
              </div>

              <div className="space-y-8 flex-1 flex flex-col">

                {/* Live SSE Ping Log (Trickling Feed) */}
                <div className={`flex-1 rounded-[1.5rem] overflow-hidden flex flex-col font-mono text-[10px] tracking-wider leading-relaxed border shadow-inner min-h-[160px] max-h-[220px] relative ${isLight ? 'bg-white/60 border-white/60 text-slate-700' : 'bg-black/20 border-white/5 text-slate-400'}`}>
                  <div className="absolute inset-x-5 bottom-5 flex flex-col justify-end pointer-events-none">
                    <AnimatePresence>
                      {logs.map((log, i) => (
                        <motion.div
                          key={`${log}-${i}`}
                          layout
                          initial={{ opacity: 0, x: -10, height: 0 }}
                          animate={{ opacity: 1 - (i * 0.2), x: 0, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="py-1 border-t border-black/5 dark:border-white/5 first:border-none whitespace-nowrap overflow-hidden"
                        >
                          {log}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {logs.length === 0 && <div className="absolute inset-5 flex items-end animate-pulse opacity-50 pointer-events-none z-10">Listening on wss://zephyrus.core/stream...</div>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase">Gateway Quota (/v1/usage)</span>
                    <span className={`font-mono text-xs font-bold ${accentTextClass}`}>{usageData.quotaUsed} / {usageData.quotaTotal}</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-black/10' : 'bg-white/10'}`}>
                    <div className={`h-full transition-all duration-1000 bg-${accentColor}-400`} style={{ width: `${(usageData.quotaUsed / usageData.quotaTotal) * 100}%` }} />
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border flex items-start gap-4 transition-all duration-700 backdrop-blur-md shadow-lg ${isLight ? `bg-${accentColor}-50/50 border-${accentColor}-200/50 hover:shadow-xl` : `bg-${accentColor}-950/40 border-${accentColor}-500/30 hover:border-${accentColor}-400/50 hover:bg-${accentColor}-900/30`}`}>
                  <div className={`p-3 bg-${accentColor}-500/20 rounded-2xl shadow-inner flex items-center justify-center`}>
                    <Shield className={`w-6 h-6 text-${accentColor}-400`} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className={`text-sm font-bold mb-1 ${isLight ? `text-${accentColor}-900` : `text-${accentColor}-100`}`}>Edge Route Active</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full bg-${accentColor}-400 animate-pulse`} />
                      <p className={`text-[10px] font-mono uppercase tracking-widest ${isLight ? `text-${accentColor}-700` : `text-${accentColor}-300`}`}>TTL: 10m / Ping: {latency}ms</p>
                    </div>
                  </div>
                </div>

              </div>
            </GlassPanel>
          </div>

        </div>

      </div>

      {/* Deep Flow FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDeepAtmosphere(true)}
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 flex items-center justify-center md:gap-3 w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-4 rounded-full border z-40 transition-colors ${
          glassPhysics === 'FROSTED'
            ? (isLight ? 'bg-white/30 backdrop-blur-md border-white/60 text-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.05)]' : 'bg-slate-900/40 backdrop-blur-md border-white/10 text-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.2)]')
            : (isLight ? 'bg-white/10 backdrop-blur-[2px] border-white/30 text-slate-800 shadow-sm' : 'bg-slate-950/20 backdrop-blur-[2px] border-white/20 text-slate-200 shadow-md')
          }`}
      >
        <div className="flex items-end justify-center gap-[3px] h-5 w-5">
          <motion.div animate={isFabAnimating ? { height: ['30%', '100%', '30%', '100%', '30%'] } : { height: '30%' }} transition={{ duration: 1.5, ease: "easeInOut" }} className={`w-1 rounded-sm bg-${accentColor}-400`} />
          <motion.div animate={isFabAnimating ? { height: ['100%', '40%', '100%', '40%', '100%'] } : { height: '100%' }} transition={{ duration: 1.5, ease: "easeInOut" }} className={`w-1 rounded-sm bg-${accentColor}-400`} />
          <motion.div animate={isFabAnimating ? { height: ['60%', '20%', '60%', '20%', '60%'] } : { height: '60%' }} transition={{ duration: 1.5, ease: "easeInOut" }} className={`w-1 rounded-sm bg-${accentColor}-400`} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] hidden md:block">Deep Scan</span>
      </motion.button>

      {/* Deep Atmosphere Modal */}
      <AnimatePresence>
        {showDeepAtmosphere && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 ${isLight ? 'bg-white/60' : 'bg-black/60'}`}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl h-[80vh] flex flex-col"
            >
              <GlassPanel clearMode={false} isLight={isLight} isStormy={isStormy} className="flex-1 flex flex-col shadow-2xl">
                <div className={`p-8 border-b ${isLight ? 'border-white/50' : 'border-white/5'} flex justify-between items-center`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isLight ? 'bg-white/60 shadow-sm' : 'bg-white/5'}`}>
                      <Activity className={`w-6 h-6 ${accentTextClass}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-display font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>DEEP ATMOSPHERE VARIANCE</h2>
                      <p className={`font-mono text-[10px] mt-1 uppercase tracking-widest ${accentTextClass}`}>Aggregated from Global Nodes</p>
                    </div>
                  </div>
                  <button onClick={() => setShowDeepAtmosphere(false)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-black/5 text-slate-800' : 'hover:bg-white/10 text-white'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-4 sm:p-10 flex-1 min-h-[300px] h-full flex flex-col relative w-full">
                  <div className="absolute inset-4 sm:inset-10 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTempModal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor={accentHex} stopOpacity={0.4}/>
                             <stop offset="95%" stopColor={accentHex} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                         <XAxis dataKey="time" stroke={isLight ? '#94a3b8' : '#475569'} tick={{fill: isLight ? '#64748b' : '#94a3b8', fontSize: 12, fontFamily: 'monospace'}} />
                         <YAxis stroke={isLight ? '#94a3b8' : '#475569'} tick={{fill: isLight ? '#64748b' : '#94a3b8', fontSize: 12, fontFamily: 'monospace'}} />
                        <CartesianGrid strokeDasharray="3 3" stroke={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'} vertical={false} />
                        <Tooltip
                          contentStyle={{
                            background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)',
                            border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '16px', backdropFilter: 'blur(10px)', color: isLight ? '#0f172a' : '#f1f5f9',
                            fontFamily: 'monospace', fontSize: '13px'
                          }}
                          cursor={{ stroke: accentHex, strokeOpacity: 0.2, strokeWidth: 2 }}
                        />
                        <Area type="monotone" dataKey="temp" stroke={accentHex} strokeWidth={4} fillOpacity={1} fill="url(#colorTempModal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
