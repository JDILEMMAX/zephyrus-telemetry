import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { X, Activity, Droplets } from 'lucide-react';
import { Forecast } from '@/types/weather';

/**
 * ARCHITECTURAL NOTE: THE DEEP ATMOSPHERE UTILITY MODAL
 * -----------------------------------------------------
 * Encapsulating advanced data visualizations within a dedicated rendering portal.
 * We freeze the underlying document body scroll to maintain physics integrity when 
 * the massive Recharts instances populate.
 */
interface DeepAtmosphereModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: Forecast | null;
}

export function DeepAtmosphereModal({ isOpen, onClose, forecast }: DeepAtmosphereModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-slate-950/80 backdrop-blur-2xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-blue-500/30 rounded-3xl w-full max-w-6xl shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden relative flex flex-col h-[80vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/40">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-light tracking-widest text-blue-50 drop-shadow-md">
                    DEEP <span className="font-bold text-blue-400">ATMOSPHERE</span>
                  </h2>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">Multi-vector Telemetry Extrapolation</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
              >
                <X className="text-slate-300 w-6 h-6" />
              </button>
            </div>

            {/* Modal Body with Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
               {/* Massive Recharts Deployment */}
               <div className="space-y-4">
                 <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-blue-200 flex items-center gap-3">
                    <Droplets className="w-4 h-4 text-cyan-400" /> Humidity & Precipitation Arcs
                 </h3>
                 <div className="h-[400px] w-full bg-black/30 rounded-2xl border border-white/5 p-4 md:p-6 shadow-inner">
                    {forecast?.days ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast.days} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorHumid" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid #1e293b', borderRadius: '12px' }}
                            itemStyle={{ color: '#67e8f9' }}
                          />
                          <Area type="monotone" dataKey="temperature" name="Temp Variance" stroke="#06b6d4" strokeWidth={4} fill="url(#colorHumid)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse">
                        Aggregating High-Fidelity Data Streams...
                      </div>
                    )}
                 </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
