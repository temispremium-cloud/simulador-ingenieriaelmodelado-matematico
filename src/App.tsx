import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Plot from 'react-plotly.js';
import { 
  Zap,
  Activity,
  Droplets,
  Terminal,
  Monitor,
  ShieldCheck,
  Settings,
  Cpu,
  Layers,
  ArrowRight,
  HelpCircle,
  Play,
  RefreshCcw,
  BarChart3,
  Gauge,
  Info,
  TrendingUp,
  TrendingDown,
  Maximize2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from './lib/utils';
import { simulateCooling, simulatePopulation, simulateMixing } from './lib/models';
import { coolingPython, populationPython, mixingPython } from './lib/python-templates';

type SimulationType = 'cooling' | 'population' | 'mixing';

/* --- Components Visuales --- */

const ThermometerVisual = ({ temp }: { temp: number, tm: number, t0: number }) => {
  const tempC = Number(((temp - 32) / 1.8).toFixed(1));
  
  const baseMinF = 0;
  const baseMaxF = 250;
  
  const minF = Math.min(baseMinF, Math.floor(temp / 50) * 50 - 50);
  const maxF = Math.max(baseMaxF, Math.ceil(temp / 50) * 50 + 50);
  const rangeF = maxF - minF;

  const minC = (minF - 32) / 1.8;
  const maxC = (maxF - 32) / 1.8;
  const rangeC = maxC - minC;

  let scaleY = (temp - minF) / rangeF;
  scaleY = Math.min(0.995, Math.max(0, scaleY));

  const isOverload = temp > 400 || temp < 0;

  const labelsF = useMemo(() => {
    const step = rangeF / 10;
    return Array.from({ length: 11 }, (_, i) => Math.round(maxF - i * step));
  }, [minF, maxF, rangeF]);

  const labelsC = useMemo(() => {
    const step = rangeC / 10;
    return Array.from({ length: 11 }, (_, i) => Math.round(maxC - i * step));
  }, [minC, maxC, rangeC]);

  const thermometerColor = useMemo(() => {
    if (temp <= 80) return '#2196F3';
    if (temp <= 140) return '#8BC34A';
    if (temp <= 220) return '#f59e0b';
    return '#f44336';
  }, [temp]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        className={cn(
          "thermometer shadow-2xl transition-all duration-500",
          isOverload && "thermometer--overload"
        )}
        style={{ '--thermometer-color': thermometerColor } as React.CSSProperties}
      >
        <div className="thermometer__inner py-2">
          <div className="w-full flex justify-between px-3 mb-2">
            <div className="font-bold text-[9px]">°C</div>
            <div className="font-bold text-[9px]">°F</div>
          </div>
          
          <div className="thermometer__c">
            {labelsC.map((val) => (
              <div key={`c-${val}`} className="thermometer__label" style={{ top: `${((maxC - val) / rangeC) * 100}%` }}>{val}</div>
            ))}
          </div>

          <div className="thermometer__tube">
            <motion.div 
              className="thermometer__mercury"
              animate={{ scaleY }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="thermometer__f">
            {labelsF.map((val) => (
              <div key={`f-${val}`} className="thermometer__label" style={{ top: `${((maxF - val) / rangeF) * 100}%` }}>{val}</div>
            ))}
          </div>
        </div>
        <div className="thermometer__bulb" />
      </div>
      
      <div className="text-center">
                <p className={cn("text-xl font-mono font-bold transition-colors duration-500", temp > 180 ? "text-red-700" : "text-black")}>
          {temp.toFixed(1)}°F
        </p>
        <p className="text-[8px] uppercase text-black font-extrabold tracking-widest leading-none mt-1 opacity-70">
          Core Temperature | Real-time
        </p>
      </div>
    </div>
  );
};

const MixingTankVisual = ({ amount, volume }: { amount: number, volume: number }) => {
  const concentration = volume > 0 ? (amount / volume) : 0;
  // Volume level normalized to 1000MB tank
  const levelPercent = Math.min(100, Math.max(5, (volume / 1000) * 100));
  
  return (
    <div className="flex items-center gap-12">
      {/* Timeline Tracker */}
      <div className="hidden md:flex flex-col gap-4 relative py-4">
        <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-brand-border/50" />
        {[0, 10, 20].map((t, i) => (
          <div key={t} className="relative pl-6">
            <div className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 size-2 rounded-full border-2 border-brand-bg z-10",
              i === 0 ? "bg-black ring-4 ring-black/10" : "bg-brand-border"
            )} />
            <div className="flex flex-col">
              <span className={cn("text-[8px] font-bold uppercase tracking-wider", i === 0 ? "text-black" : "text-gray-500")}>
                {i === 0 ? 'Actual' : `Log-${t}s`}
              </span>
              <span className="text-[10px] font-mono text-black font-bold">
                {(amount * (1 - i * 0.15)).toFixed(1)} <span className="opacity-50">MB</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-44 bg-brand-bg/50 rounded-xl border-2 border-brand-border overflow-hidden shadow-[0_20px_50px_rgba(6,182,212,0.15)] group">
          {/* Animated Water */}
          <div 
            className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-in-out"
            style={{ 
              height: `${levelPercent}%`,
              backgroundColor: `rgba(6, 182, 212, ${0.4 + Math.min(0.5, concentration * 2)})` 
            }}
          >
            {/* Wave Wrapper */}
            <div className="absolute bottom-full left-0 w-full overflow-visible h-6 pointer-events-none">
              <svg className="absolute bottom-0 left-0 w-[200%] animate-wave-front h-full fill-current text-cyan-500/60" viewBox="0 0 560 20" preserveAspectRatio="none">
                <path d="M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z" />
                <path d="M420,20c-21.5-0.4-38.8-2.5-51.1-4.5-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z" />
                <path d="M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z" />
                <path d="M140,20c-21.5-0.4-38.8-2.5-51.1-4.5-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z" />
              </svg>
              <svg className="absolute bottom-0 left-[-100%] w-[200%] animate-wave-back h-full fill-current text-cyan-700/40 ml-[-1px]" viewBox="0 0 560 20" preserveAspectRatio="none">
                 <path d="M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z" />
                 <path d="M420,20c-21.5-0.4-38.8-2.5-51.1-4.5-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z" />
                 <path d="M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z" />
                 <path d="M140,20c-21.5-0.4-38.8-2.5-51.1-4.5-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z" />
              </svg>
            </div>

            {/* Bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute bottom-4 left-1/4 size-1.5 bg-white/40 rounded-full animate-bubble-rise" style={{ animationDelay: '0s' }} />
              <div className="absolute bottom-2 left-1/2 size-2 bg-white/30 rounded-full animate-bubble-rise" style={{ animationDelay: '0.4s' }} />
              <div className="absolute bottom-6 left-3/4 size-1 bg-white/20 rounded-full animate-bubble-rise" style={{ animationDelay: '1.2s' }} />
            </div>
          </div>

          {/* Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none drop-shadow-lg">
                    <div className="flex flex-col items-center bg-black/10 backdrop-blur-sm p-3 rounded-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <span className="text-3xl font-mono font-bold text-black leading-none">{(concentration * 100).toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">%</span>
                     </div>
          </div>
        </div>
                <p className="text-[10px] font-bold text-black uppercase tracking-[0.2em] mb-1">Ocupación Buffer</p>
          <p className="text-[8px] font-mono text-black uppercase font-bold">V_max: {volume.toFixed(0)} MB</p>
      </div>
    </div>
  );
};

const PersonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 36 36" className={cn("size-full", className)} xmlns="http://www.w3.org/2000/svg">
    <path fill="#F7DECE" d="M13.052 22.569c-.236.161-.512-.02-.646-.131c-.379-.313-.763-1.144-.611-2.142c.154-1.008.199-2.185.673-4.137c.055-.228-.069-2.776.212-4.528c.076-.473.958-1.066 1.495-1.057c.536.008.263.944.274 1.101c.12 1.682-.348 4.279-.398 4.632c-.277 1.956-1.033 2.835-.776 4.13c.135.679.154 1.293-.242 1.345c.005.366.106.728.019.787zm9.896 0c.236.161.512-.02.646-.131c.379-.313.763-1.144.611-2.142c-.154-1.008-.199-2.185-.673-4.137c-.055-.228.069-2.776-.212-4.528c-.076-.473-.958-1.066-1.495-1.057c-.536.008-.263.944-.274 1.101c-.12 1.682.348 4.279.398 4.632c.277 1.956 1.033 2.835.776 4.13c-.135.679-.154 1.293.242 1.345c-.005.366-.106.728-.019.787z" />
    <path fill="#4289C1" d="M21.57 26.733c.02-3.063.014-6.5.014-6.5h-7.197s.033 3.747.119 6.46c.067 2.14.382 6.193.096 8.349c-.064.479 2.782.937 2.742-.125c-.075-1.969.255-6.322.316-7.309c.034-.547.241-2.326.331-3.659c.011-.018.284-.018.295 0c.09 1.333.297 3.112.331 3.659c.062.987.392 5.34.316 7.309c-.041 1.062 2.805.604 2.742.125c-.286-2.157-.107-7.96-.105-8.309z" />
    <path fill="#FA743E" d="M22.366 9.472C21.661 8.623 18 8.023 18 8.023s-3.693.6-4.398 1.449c-.856 1.031-1.302 2.773-1.302 2.773l1.783.318s.449 1.612.449 3.148s-.398 5.307-.398 5.307h7.734s-.43-3.84-.43-5.306s.481-3.149.481-3.149l1.751-.318c-.002 0-.449-1.743-1.304-2.773z" />
    <path fill="#292F33" d="M19.242.83c-.59-.191-1.98-.139-2.327.313c-.903.017-1.962.834-2.101 1.91c-.138 1.066.169 1.561.278 2.362c.123.908.634 1.198 1.042 1.32c.587.776 1.211.742 2.259.742c2.046 0 3.021-1.369 3.107-3.695c.052-1.406-.774-2.472-2.258-2.952z" />
    <path fill="#F7DECE" d="M17.009 6.893v1.754c0 .484.488.877 1.091.877s1.091-.393 1.091-.877V6.893h-2.182z" />
    <path fill="#EEC2AD" d="M17.009 7.981c.396.251 1.201.557 2.182-.03V6.893h-2.182v1.088z" />
    <path fill="#F7DECE" d="M20.412 3.882c-.198-.274-.452-.495-1.007-.573c.208.096.408.425.434.608c.026.182.052.33-.113.148c-.661-.731-1.381-.443-2.094-.889c-.498-.312-.65-.657-.65-.657s-.061.46-.816.929c-.219.136-.48.439-.625.886c-.104.321-.072.608-.072 1.098c0 1.429 1.178 2.631 2.631 2.631s2.631-1.212 2.631-2.631c0-.89-.093-1.238-.319-1.55z" />
    <path fill="#662113" d="M16.931 5.138a.292.292 0 0 1-.292-.292v-.292a.292.292 0 0 1 .584 0v.292a.292.292 0 0 1-.292.292zm2.338 0a.292.292 0 0 1-.292-.292v-.292a.292.292 0 0 1 .584 0v.292a.29.29 0 0 1-.292.292z" />
    <path fill="#C1694F" d="M18.573 7.356h-.953c-.102 0-.186-.084-.186-.186s.084-.186.186-.186h.953c.102 0 .186.084.186.186s-.084.186-.186.186zm-.181-1.194h-.585a.146.146 0 0 1-.146-.146c0-.081.065-.146.146-.146h.585c.081 0 .146.065.146.146a.146.146 0 0 1-.146.146z" />
    <path fill="#292F33" d="M13.884 35.907c-.546-.051-.187-.684.061-.897c.276-.238.718-.441.94-.852c.246-.455 1.433-.395 1.683-.023c.447.664.645.179.775.488c.207.494.049 1.284.049 1.284h-3.508zm8.476 0c.546-.051.187-.684-.061-.897c-.276-.238-.718-.441-.94-.852c-.246-.455-1.433-.395-1.683-.023c-.447.664-.645.179-.775.488c-.207.494-.049 1.284-.049 1.284h3.508z" />
  </svg>
);

const PopulationPlanet = ({ count }: { count: number }) => {
  // Max population for visual normalization
  const maxDisplay = 10000;
  const growthFactor = Math.min(1, count / maxDisplay);
  
  // Transition phases:
  // 0 - 10% Growth: Planet rotates normally
  // 10% - 100% Growth: Planet slows down and zooms into "Country Region"
  const zoomLevel = growthFactor > 0.1 ? 1.4 + (growthFactor - 0.1) * 2.5 : 1;
  const isZoomed = growthFactor > 0.1;

  // The more people, the smaller the icons become (paulatinamente)
  const iconBaseSize = Math.max(3, 8 - (growthFactor * 5));

  // Generate more people for a denser hub visualization
  const people = useMemo(() => {
    return Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      x: 45 + (Math.random() - 0.5) * 45, // Wider distribution
      y: 40 + (Math.random() - 0.5) * 45,
      delay: Math.random() * 2,
      rotation: (Math.random() - 0.5) * 15
    }));
  }, []);

  const visiblePeopleCount = Math.floor(growthFactor * people.length);

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div className="relative group/planet">
        {/* Glow / Atmosphere */}
        <div className="absolute inset-[-30px] rounded-full bg-emerald-500/5 blur-3xl transition-opacity duration-1000" style={{ opacity: 0.5 + growthFactor * 0.5 }} />
        
        {/* The Planet Container */}
        <motion.div 
          animate={{ scale: zoomLevel }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="relative size-52 rounded-full border-[1px] border-white/20 shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden bg-[#000814]"
        >
          {/* Rotating Surface */}
          <motion.div 
            animate={{ 
              x: isZoomed ? "-25%" : "0%",
              rotate: isZoomed ? -10 : 0
            }}
            transition={{ duration: 2, ease: "circOut" }}
            className={cn(
              "absolute inset-0 opacity-40 brightness-75 transition-filter duration-700",
              !isZoomed && "animate-rotate-planet"
            )}
            style={{ 
              backgroundImage: `url('https://i0.wp.com/narceliodesa.com/wp-content/uploads/2013/06/1.jpg')`,
              backgroundSize: 'cover',
              backgroundRepeat: 'repeat-x',
              filter: `hue-rotate(${growthFactor * 15}deg)`
            }}
          />
          
          {/* Scanning Line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-1/4 w-full animate-scan pointer-events-none opacity-30" />
          
          {/* Zoom Overlay (Regional Detail View) */}
          <AnimatePresence>
            {isZoomed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-emerald-900/10 pointer-events-none"
              >
                {/* Simulated Region Outline */}
                <div className="absolute top-1/4 left-1/4 size-1/2 border border-emerald-500/20 rounded-lg rotate-12" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Person Icons (Population) */}
          <div className="absolute inset-0 pointer-events-none">
            {people.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: (i < visiblePeopleCount && isZoomed) ? 1 : 0,
                  scale: (i < visiblePeopleCount && isZoomed) ? 1 : 0,
                  rotate: p.rotation
                }}
                transition={{ type: "spring", stiffness: 100, damping: 10, delay: p.delay * 0.05 }}
                className="absolute"
                style={{ 
                  left: `${p.x}%`, 
                  top: `${p.y}%`,
                  width: `${iconBaseSize}px`,
                  height: `${iconBaseSize}px`,
                  zIndex: 50
                }}
              >
                <PersonIcon className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
              </motion.div>
            ))}
          </div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #34d399 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
        </motion.div>

        {/* Labels Tracking */}
        <div className="absolute top-0 -right-20 hidden md:flex flex-col gap-1">
           <span className="text-[7px] font-bold text-brand-muted uppercase tracking-tighter">Sector: REG-01</span>
           <span className="text-[7px] font-bold text-brand-muted uppercase tracking-tighter">Zoom: x{zoomLevel.toFixed(1)}</span>
        </div>
      </div>

      <div className="text-center relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="flex flex-col items-center">
          <p className="text-[10px] uppercase text-brand-text font-bold tracking-[0.4em] mb-1">Tráfico de Red</p>
          <p className="text-4xl font-mono font-black text-brand-text drop-shadow-sm tracking-tighter">
            {Math.floor(count).toLocaleString()}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-bold text-brand-muted uppercase">Status Nodo</span>
               <span className="text-[10px] font-mono text-brand-text font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PopIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop" 
    alt="Dinámica Poblacional" 
    className={cn("size-full object-cover shrink-0 rounded-md", className)}
    referrerPolicy="no-referrer"
  />
);

const ControllerIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=200&auto=format&fit=crop" 
    alt="Controladores" 
    className={cn("size-full object-cover shrink-0 rounded-md", className)}
    referrerPolicy="no-referrer"
  />
);

const ColabIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Google_Colaboratory_SVG_Logo.svg/960px-Google_Colaboratory_SVG_Logo.svg.png" 
    alt="Google Colab" 
    className={cn("size-full object-contain shrink-0", className)}
    referrerPolicy="no-referrer"
  />
);

const FireIcon = () => (
  <div className="relative size-6 flex items-center justify-center -ml-1">
    <div className="fire-btn scale-[0.55]">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="fire-btn__p"></span>
      ))}
      <span className="fire-btn__text flex items-center justify-center text-lg">!</span>
    </div>
  </div>
);

/* --- Main Application --- */

export default function App() {
  const [activeTab, setActiveTab] = useState<SimulationType>('population');
  const [showGame, setShowGame] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // States
  const [coolingParams, setCoolingParams] = useState({ t0: 300, tm: 70, k: 0.19018, duration: 45 });
  const [popParams, setPopParams] = useState({ p0: 1000, k: 0.40546, duration: 5 });
  const [mixingParams, setMixingParams] = useState({ a0: 50, v: 300, rin: 3, cin: 2, rout: 3, duration: 400 });

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Data
  const coolingData = useMemo(() => simulateCooling(coolingParams.t0, coolingParams.tm, coolingParams.k, coolingParams.duration, 100), [coolingParams]);
  const popData = useMemo(() => simulatePopulation(popParams.p0, popParams.k, popParams.duration, 100), [popParams]);
  const mixingData = useMemo(() => simulateMixing(mixingParams.a0, mixingParams.v, mixingParams.rin, mixingParams.cin, mixingParams.rout, mixingParams.duration, 100), [mixingParams]);

  const currentSimulationData = activeTab === 'cooling' ? coolingData : activeTab === 'population' ? popData : mixingData;
  const currentVal = currentSimulationData.find(p => p.time >= currentTime)?.value || 0;

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const max = activeTab === 'cooling' ? coolingParams.duration : activeTab === 'population' ? popParams.duration : mixingParams.duration;
          if (prev >= max) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (max / 100);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTab, coolingParams.duration, popParams.duration, mixingParams.duration]);

  const tabs = [
    { id: 'pop', label: 'Tráfico de Red', icon: PopIcon, color: 'text-brand-text', type: 'population' },
    { id: 'cool', label: 'Térmica de CPU', icon: FireIcon, color: 'text-brand-text', type: 'cooling' },
    { id: 'mix', label: 'Dinámica de Buffer', icon: Droplets, color: 'text-brand-text', type: 'mixing' },
  ];

  const chartColor = activeTab === 'cooling' ? '#f59e0b' : activeTab === 'population' ? '#10b981' : '#06b6d4';

  return (
    <div className="top font-sans min-h-screen">
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden text-brand-text font-sans relative z-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-brand-border bg-brand-surface flex flex-row lg:flex-col p-4 shrink-0 transition-all duration-300">
          <div className="flex items-center gap-3 mb-0 lg:mb-8 px-2 overflow-hidden mr-auto lg:mr-0">
            <div className="size-10 bg-white rounded-sm flex items-center justify-center shrink-0 shadow-md border border-brand-border overflow-hidden p-1">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Logo_de_la_Universidad_de_La_Guajira.svg/960px-Logo_de_la_Universidad_de_La_Guajira.svg.png" 
                alt="Logo Uniguajira" 
                className="size-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight">UNIGUAJIRA</h1>
              <p className="text-[9px] text-brand-muted font-mono uppercase tracking-widest leading-none">Lab Engine v4.0</p>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1.5 flex-1 items-center lg:items-stretch lg:mt-0">
            <p className="hidden lg:block text-[9px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4 px-2 opacity-50">Menú Principal</p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.type as SimulationType); setCurrentTime(0); setIsPlaying(false); }}
                className={cn(
                  "flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-3 rounded-md text-xs lg:text-sm font-semibold transition-all relative overflow-hidden group",
                  activeTab === tab.type 
                    ? "bg-black/5 text-black border border-black/20" 
                    : "text-brand-muted hover:text-brand-text hover:bg-brand-border/20 border border-transparent"
                )}
              >
                <tab.icon className={cn("size-4 lg:size-5 transition-transform group-hover:scale-110 shrink-0", activeTab === tab.type ? "" : "grayscale opacity-60")} />
                <span className="hidden sm:inline whitespace-nowrap">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
            
            <div className="hidden lg:block pt-8 space-y-1.5">
              <p className="text-[9px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4 px-2 opacity-50">Extras</p>
              <button 
                onClick={() => setShowGame(true)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-border/20"
              >
                <img src="https://img.freepik.com/psd-premium/copa-trofeo-oro-aislada-sobre-fondo-transparente-png_888962-456.jpg" className="size-5 object-contain" alt="Trophy" referrerPolicy="no-referrer" />
                <span className="whitespace-nowrap">Gamificación</span>
              </button>
            </div>
          </nav>

          <div className="hidden lg:block mt-auto border-t border-brand-border pt-4 px-2">
            <div className="flex items-center gap-2 text-[9px] text-brand-muted font-mono mb-2">
              <ShieldCheck size={12} className="text-brand-accent" />
              SYSTEM SECURE: READY
            </div>
            <p className="text-[8px] text-brand-muted/40 uppercase tracking-widest leading-relaxed">
              Uniguajira Engineering<br/>Simulation Hub 2026
            </p>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-brand-bg relative overflow-hidden h-[calc(100vh-64px)] lg:h-screen">
          {/* Top Info Bar */}
          <header className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-brand-surface/30 backdrop-blur-md shrink-0 z-20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md flex items-center justify-center overflow-hidden border border-brand-border bg-white shadow-sm p-1">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Logo_de_la_Universidad_de_La_Guajira.svg/960px-Logo_de_la_Universidad_de_La_Guajira.svg.png" 
                    alt="Logo Uniguajira" 
                    className="size-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-tight text-brand-text leading-none uppercase">Uniguajira</h1>
                  <p className="text-[9px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-1">Advanced Differential Analysis</p>
                </div>
              </div>
              <div className="h-6 w-[1px] bg-brand-border" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gray-900 uppercase opacity-60">Modulo:</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-brand-surface border border-brand-border rounded-full flex items-center gap-2 transition-all duration-500 text-black shadow-sm"
                )}>
                  <span className="size-2 rounded-full bg-black" />
                  {tabs.find(t => t.type === activeTab)?.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col items-end mr-4 text-right">
                  <span className="text-[8px] font-bold text-brand-muted uppercase tracking-widest leading-none">Status del Núcleo</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                       {[1,2,3].map(i => <div key={i} className="w-2 h-0.5 bg-brand-text/10 rounded-full overflow-hidden"><div className="h-full bg-brand-text animate-pulse" style={{ animationDelay: `${i*0.2}s` }} /></div>)}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-brand-text uppercase leading-none">Synchronized</span>
                  </div>
               </div>
               <div className="size-8 rounded-sm border border-brand-border flex items-center justify-center text-brand-muted hover:text-black hover:border-black/30 cursor-pointer transition-all">
                  <Settings size={16} />
               </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 max-w-[1440px] mx-auto pb-10"
            >
              
              {/* TOP SECTION: Controls, Visuals, Code */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* 1. Controllers (First) */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-3 space-y-4"
                >
                  <div className="widget p-4 h-full bg-brand-surface/20 rounded-md">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="size-7 rounded-sm bg-brand-accent/10 flex items-center justify-center overflow-hidden border border-brand-accent/20">
                        <ControllerIcon />
                      </div>
                      <h3 className="font-bold text-[10px] uppercase tracking-wider">Controladores del Modelo</h3>
                    </div>

                    <div className="space-y-4">
                       {activeTab === 'cooling' && (
                        <div className="space-y-4">
                          <ParamInput label="Temp. Inicial CPU (T₀)" val={coolingParams.t0} set={(v) => setCoolingParams({...coolingParams, t0: v})} min={0} max={500} unit="°F" />
                          <ParamInput label="Ambiente Data Center (Tm)" val={coolingParams.tm} set={(v) => setCoolingParams({...coolingParams, tm: v})} min={0} max={150} unit="°F" />
                          <ParamInput label="Constante k (min⁻¹)" val={coolingParams.k} set={(v) => setCoolingParams({...coolingParams, k: v})} min={0} max={1} step={0.001} unit="k" />
                          <ParamInput label="Tiempo de Monitoreo" val={coolingParams.duration} set={(v) => setCoolingParams({...coolingParams, duration: v})} min={1} max={500} unit="min" />
                        </div>
                      )}
                      {activeTab === 'population' && (
                        <div className="space-y-4">
                          <ParamInput label="Tráfico Inicial (P₀)" val={popParams.p0} set={(v) => setPopParams({...popParams, p0: v})} min={1} max={50000} unit="paq/s" />
                          <ParamInput label="Factor Crecimiento (k)" val={popParams.k} set={(v) => setPopParams({...popParams, k: v})} min={-1} max={2} step={0.001} unit="h⁻¹" />
                          <ParamInput label="Tiempo de Observación" val={popParams.duration} set={(v) => setPopParams({...popParams, duration: v})} min={1} max={500} unit="h" />
                        </div>
                      )}
                      {activeTab === 'mixing' && (
                        <div className="space-y-4">
                          <ParamInput label="Datos Iniciales (A₀)" val={mixingParams.a0} set={(v) => setMixingParams({...mixingParams, a0: v})} min={0} max={2000} unit="MB" />
                          <ParamInput label="Capacidad Buffer (V)" val={mixingParams.v} set={(v) => setMixingParams({...mixingParams, v: v})} min={1} max={10000} unit="MB" />
                          <ParamInput label="Flujo Entrada (f_ent)" val={mixingParams.rin} set={(v) => setMixingParams({...mixingParams, rin: v})} min={0} max={500} unit="MB/s" />
                          <ParamInput label="Concentración (c_ent)" val={mixingParams.cin} set={(v) => setMixingParams({...mixingParams, cin: v})} min={0} max={20} step={0.1} unit="u/MB" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* 2. Visual Simulation (Center) */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.3 }}
                   className="lg:col-span-4 flex flex-col gap-4"
                >
                  <div className="widget p-4 h-full bg-brand-surface/40 flex flex-col items-center justify-center min-h-[380px] border-2 border-transparent hover:border-brand-accent/10 transition-all duration-500 shadow-xl overflow-hidden relative">
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                       <span className="size-1.5 rounded-full bg-brand-accent animate-ping" />
                       <span className="text-[8px] font-bold text-brand-muted uppercase tracking-widest">Visual Analysis Mode</span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div 
                          key={activeTab}
                          initial={{ opacity: 0, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(10px)' }}
                          transition={{ duration: 0.4 }}
                          className="w-full flex justify-center scale-75 sm:scale-90 lg:scale-100"
                        >
                           {activeTab === 'cooling' && <ThermometerVisual temp={currentVal} tm={coolingParams.tm} t0={coolingParams.t0} />}
                           {activeTab === 'population' && <PopulationPlanet count={currentVal} />}
                           {activeTab === 'mixing' && (
                              <MixingTankVisual 
                                amount={currentVal} 
                                volume={mixingParams.v + (mixingParams.rin - mixingParams.rout) * currentTime} 
                              />
                            )}
                        </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="widget p-3 bg-brand-surface/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeTab === 'cooling' && (
                          <>
                            <ResultRow label="Temp. CPU" value={`${currentVal.toFixed(1)} °F`} />
                            <ResultRow label="Diferencial Delta" value={`${(currentVal - coolingParams.tm).toFixed(2)} °F`} />
                          </>
                        )}
                        {activeTab === 'population' && (
                          <>
                            <ResultRow label="Tráfico Nodo" value={`${Math.floor(currentVal)} paq/s`} />
                            <ResultRow label="Escalamiento Neto" value={`${(currentVal - popParams.p0).toFixed(0)}`} />
                          </>
                        )}
                        {activeTab === 'mixing' && (
                          <>
                            <ResultRow label="Datos Buffer" value={`${currentVal.toFixed(2)} MB`} />
                            <ResultRow label="Tasa Ocupación" value={`${((currentVal / (mixingParams.v + (mixingParams.rin - mixingParams.rout) * currentTime)) * 100).toFixed(1)} %`} />
                          </>
                        )}
                      </div>
                  </div>
                </motion.div>

                {/* 3. Python Script (Right) */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="lg:col-span-5 flex flex-col gap-4"
                >
                  <section className="widget overflow-hidden p-0 h-full flex flex-col group/terminal bg-black/40">
                    <div className="p-3 bg-brand-border/20 border-b border-brand-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal size={12} className="text-brand-accent group-hover/terminal:scale-110 transition-transform" />
                          <span className="text-[9px] font-mono font-bold uppercase text-brand-muted tracking-[0.1em] leading-none">Matplotlib / NumPy Integration</span>
                        </div>
                        <div className="flex gap-1.5 opacity-30">
                           <div className="size-1.5 rounded-full bg-white/50" />
                           <div className="size-1.5 rounded-full bg-white/50" />
                           <div className="size-1.5 rounded-full bg-white/50" />
                        </div>
                    </div>
                    <div className="bg-[#0b0e14]/90 font-mono overflow-hidden flex-1 backdrop-blur-sm">
                      <pre className="p-6 text-cyan-400/90 h-full max-h-[380px] text-[10px] custom-scrollbar overflow-y-auto leading-relaxed">
                        {activeTab === 'cooling' && coolingPython(coolingParams.t0, coolingParams.tm, coolingParams.k, coolingParams.duration)}
                        {activeTab === 'population' && populationPython(popParams.p0, popParams.k, popParams.duration)}
                        {activeTab === 'mixing' && mixingPython(mixingParams.a0, mixingParams.v, mixingParams.rin, mixingParams.cin, mixingParams.rout, mixingParams.duration)}
                      </pre>
                    </div>
                  </section>
                  
                  <div className="bg-brand-accent/5 rounded-md border border-brand-accent/10 p-5 relative overflow-hidden group hover:bg-brand-accent/10 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-black" />
                      <h4 className="font-bold text-[9px] uppercase text-black tracking-[0.2em]">Soporte Teórico</h4>
                    </div>
                    <p className="text-[11px] text-brand-muted leading-relaxed font-medium">
                      {activeTab === 'cooling' && "Ing. de Sistemas: Gestión térmica en Centros de Datos. La rapidez de enfriamiento de servidores es vital para prevenir el estrangulamiento térmico (thermal throttling)."}
                      {activeTab === 'population' && "Ing. de Sistemas: Escalamiento del Tráfico. El crecimiento exponencial modela la rapidez con la que se saturan los nodos de red ante el aumento de usuarios o servicios."}
                      {activeTab === 'mixing' && "Ing. de Sistemas: Balance de Carga en Redes. El flujo de 'soluto' puede compararse con la acumulación de paquetes en buffers de red con tasas de entrada y salida dinámicas."}
                    </p>
                  </div>

                  <a 
                    href="https://colab.research.google.com/drive/1obu8Ep4Iv0f7PQOIZKTXRG7WeaHMhTFy?usp=sharing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-md bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 group/colab"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-sm bg-black/5 flex items-center justify-center p-1.5 group-hover/colab:scale-110 transition-transform">
                        <ColabIcon />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-black">Google Colab Notebook</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wider">Acceso al código fuente Python</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-black/30 group-hover/colab:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              </div>

              {/* BOTTOM SECTION: The Graph (Last) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full"
              >
                <section className="widget p-0 group shadow-2xl border-brand-accent/10 overflow-hidden">
                  {/* Dashboard Header */}
                  <div className="p-6 border-b border-brand-border bg-brand-surface/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded-md bg-brand-text/5 border border-brand-text/20">
                          <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Ecuaciones Diferenciales</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-text/5 border border-brand-text/20">
                          <div className="size-1.5 rounded-full bg-brand-text animate-pulse" />
                          <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">En Vivo</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-brand-text flex items-center gap-2">
                        Dashboard Analítico de Simulación
                        <Info size={14} className="text-brand-muted cursor-help" />
                      </h3>
                      <p className="text-[10px] text-brand-muted font-medium flex items-center gap-1">
                        Modelado matemático mediante {activeTab === 'cooling' ? 'Gestión Térmica de CPUs' : activeTab === 'population' ? 'Crecimiento de Tráfico de Red' : 'Dinámica de Flujo en Buffers'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end mr-2 hidden sm:block text-right">
                        <span className="text-[9px] font-bold text-brand-muted uppercase tracking-tighter opacity-50">Tiempo de cómputo</span>
                        <span className="text-[11px] font-mono font-bold text-brand-text">~0.12ms</span>
                      </div>
                      
                      <div className="h-10 w-[1px] bg-brand-border mx-2 hidden sm:block" />

                      <button 
                        onClick={() => setCurrentTime(0)}
                        className="size-10 rounded-md border border-brand-border text-brand-muted hover:text-brand-accent hover:bg-brand-accent/5 transition-all flex items-center justify-center shadow-sm active:scale-90"
                        title="Reiniciar Simulación"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={cn(
                          "group relative flex items-center gap-3 px-6 h-10 rounded-md font-bold text-[11px] tracking-widest transition-all shadow-lg active:scale-95 overflow-hidden",
                          isPlaying 
                            ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                            : "bg-brand-accent text-white hover:shadow-brand-accent/20"
                        )}
                      >
                        <div className="relative z-10 flex items-center gap-2">
                          {isPlaying ? <Activity size={14} className="animate-pulse" /> : <Play size={14} fill="currentColor" />}
                          {isPlaying ? 'PAUSAR' : 'EJECUTAR SIMULACIÓN'}
                        </div>
                        {!isPlaying && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-brand-border">
                    {/* Main Graph Area */}
                    <div className="flex-1 p-4 bg-white relative">
                      {/* Graph Overlay UI */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col sm:flex-row items-end sm:items-center gap-2 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-md border border-brand-border p-2.5 rounded-md shadow-lg">
                           <div className="text-[7px] font-black text-black uppercase mb-1 text-left leading-none opacity-60">Valor Actual</div>
                           <div className="text-xs font-mono font-bold text-black leading-none">{currentVal.toFixed(activeTab === 'mixing' ? 3 : 1)}</div>
                        </div>
                        <div className="bg-white/95 backdrop-blur-md border border-brand-border p-2.5 rounded-md shadow-lg">
                           <div className="text-[7px] font-black text-black uppercase mb-1 text-left leading-none opacity-60">Delta (Δ)</div>
                           <div className={cn("text-xs font-mono font-bold flex items-center gap-1 leading-none", isPlaying ? "text-black" : "text-gray-400")}>
                              {isPlaying && <TrendingUp size={10} className="text-black" />}
                              {Math.abs(currentVal - (currentSimulationData[currentSimulationData.length-2]?.value || currentVal)).toFixed(4)}
                           </div>
                        </div>
                      </div>

                      <div className="h-[320px] sm:h-[450px] w-full transform transition-all duration-700">
                        <Plot
                          data={[
                            {
                              x: currentSimulationData.map(p => p.time),
                              y: currentSimulationData.map(p => p.value),
                              type: 'scatter',
                              mode: 'lines',
                              name: 'Valor Real',
                              line: { 
                                color: chartColor, 
                                width: 3, 
                                shape: 'spline',
                                smoothing: 1.3
                              },
                              fill: 'tozeroy',
                              fillcolor: `${chartColor}22`,
                            },
                            {
                              x: [currentTime],
                              y: [currentVal],
                              type: 'scatter',
                              mode: 'markers',
                              name: 'Actual',
                              marker: {
                                color: chartColor,
                                size: 12,
                                line: { color: 'white', width: 2 },
                                symbol: 'circle'
                              }
                            }
                          ]}
                          layout={{
                            autosize: true,
                            margin: { l: 40, r: 20, t: 30, b: 40 },
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            showlegend: false,
                            xaxis: {
                                 title: { text: 'Tiempo (t)', font: { size: 10, family: 'JetBrains Mono', color: '#000000' } },
                                 color: '#000000',
                                 gridcolor: '#f1f5f9',
                                 zerolinecolor: '#e2e8f0',
                                 tickfont: { size: 8 },
                                 showline: true,
                                 linecolor: '#e2e8f0'
                            },
                            yaxis: {
                                 title: { text: activeTab === 'cooling' ? 'Temp (°F)' : activeTab === 'population' ? 'Tráfico' : 'Datos (MB)', font: { size: 10, family: 'JetBrains Mono', color: '#000000' } },
                                 color: '#000000',
                                 gridcolor: '#f1f5f9',
                                 zerolinecolor: '#e2e8f0',
                                 tickfont: { size: 8 },
                                 showline: true,
                                 linecolor: '#e2e8f0'
                            },
                            hovermode: 'x unified',
                            hoverlabel: {
                              bgcolor: '#0f172a',
                              font: { color: 'white', family: 'JetBrains Mono', size: 10 },
                              bordercolor: chartColor
                            }
                          }}
                          config={{ 
                            responsive: true, 
                            displayModeBar: false,
                            scrollZoom: false
                          }}
                          useResizeHandler={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </div>

                    {/* Dashboard Sidebar Stats */}
                    <div className="lg:w-72 bg-brand-surface/20 p-6 space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] flex items-center gap-2">
                           <Gauge size={12} className="text-brand-accent" />
                           Métricas Críticas
                        </h4>
                        
                        <div className="space-y-3">
                           <div className="p-3 bg-white border border-brand-border rounded-md shadow-sm hover:border-black/30 transition-colors">
                              <div className="text-[8px] font-bold text-black uppercase mb-1 flex items-center gap-1 opacity-70">
                                <ChevronRight size={8} /> Punto de Inicio
                              </div>
                              <div className="text-lg font-mono font-bold text-black leading-none mt-1">
                                {activeTab === 'cooling' ? coolingParams.t0 : activeTab === 'population' ? popParams.p0 : mixingParams.a0}
                                <span className="text-[10px] ml-1 text-black opacity-50">
                                  {activeTab === 'cooling' ? '°F' : activeTab === 'population' ? 'paq/s' : 'MB'}
                                </span>
                              </div>
                           </div>

                           <div className="p-3 bg-white border border-brand-border rounded-md shadow-sm hover:border-black/30 transition-colors">
                              <div className="text-[8px] font-bold text-black uppercase mb-1 flex items-center gap-1 opacity-70">
                                <ChevronRight size={8} /> Razón de Cambio
                              </div>
                              <div className="text-lg font-mono font-bold text-black leading-none mt-1">
                                {Math.abs(activeTab === 'cooling' ? coolingParams.k : activeTab === 'population' ? popParams.k : (mixingParams.rin * mixingParams.cin)).toFixed(3)}
                                <span className="text-[10px] ml-1 text-black opacity-50">k/r</span>
                              </div>
                              <div className="mt-2 h-1.5 w-full bg-brand-bg rounded-md overflow-hidden">
                                <div className="h-full bg-black transition-all duration-500" style={{ width: `${Math.min(100, Math.abs(activeTab === 'cooling' ? coolingParams.k * 100 : activeTab === 'population' ? popParams.k * 100 : 50))}%` }} />
                              </div>
                           </div>

                           <div className="p-3 bg-white border border-brand-border rounded-md shadow-sm hover:border-black/30 transition-colors">
                              <div className="text-[8px] font-bold text-black uppercase mb-1 flex items-center gap-1 opacity-70">
                                <ChevronRight size={8} /> Estado del Sistema
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className={cn("size-2 rounded-full", isPlaying ? "bg-black animate-pulse" : "bg-gray-300")} />
                                <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                                  {isPlaying ? 'Procesando' : 'En Espera'}
                                </span>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-brand-border">
                         <div className="flex items-center gap-2 mb-3">
                           <TrendingDown size={14} className="text-brand-muted" />
                           <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">Cálculo Progresivo</h4>
                         </div>
                         <p className="text-[10px] text-brand-muted leading-relaxed font-medium italic">
                           {activeTab === 'cooling' && "La aproximación incremental valida que la pérdida de calor es asintótica hacia Tm."}
                           {activeTab === 'population' && "El crecimiento exponencial se proyecta según la tasa instantánea r definida."}
                           {activeTab === 'mixing' && "El flujo volumétrico balancea la masa total del soluto de forma estocástica."}
                         </p>
                      </div>

                      <button className="w-full flex items-center justify-center gap-2 py-3 border border-brand-border rounded-md text-black hover:bg-black/5 transition-all group active:scale-95">
                         <Maximize2 size={12} className="group-hover:rotate-12 transition-transform" />
                         <span className="text-[9px] font-bold uppercase tracking-widest">Pantalla Completa</span>
                      </button>
                    </div>
                  </div>
                </section>
              </motion.div>

            </motion.div>
          </div>
        </main>

        {/* Game Overlay */}
        <AnimatePresence>
          {showGame && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-bg/95 backdrop-blur-[60px] z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="widget w-full max-w-xl border border-brand-border p-8 relative shadow-2xl rounded-md"
              >
                  <button onClick={() => setShowGame(false)} className="absolute top-8 right-8 p-3 rounded-md hover:bg-brand-border text-brand-muted hover:text-brand-text transition-all active:scale-90">
                     <RefreshCcw size={24} className="rotate-45" />
                  </button>
                  <div className="text-center">
                    <div className="size-24 bg-black/5 rounded-md flex items-center justify-center mx-auto mb-8 p-2">
                      <img src="https://img.freepik.com/psd-premium/copa-trofeo-oro-aislada-sobre-fondo-transparente-png_888962-456.jpg" className="size-full object-contain drop-shadow-xl" alt="Trophy" referrerPolicy="no-referrer" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 tracking-tight">Challenge Experimental</h2>
                    <p className="text-brand-muted text-sm mb-12 max-w-sm mx-auto leading-relaxed">Valide sus conocimientos en modelado matemático aplicado a la ingeniería.</p>
                    
                    <div className="space-y-4 max-w-lg mx-auto">
                      <QuizOption label="¿Cuál es la solución exacta de dy/dt = ky?" correct onClick={() => { setQuizScore(s => s + 1); }} />
                      <QuizOption label="¿Si k > 0 en Newton, el objeto se calienta o se enfría?" onClick={() => {}} />
                      <QuizOption label="¿En mezclas, Cin es volumen o concentración?" onClick={() => {}} />
                    </div>

                    {quizScore > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="mt-12 p-5 bg-black/5 border border-black/10 rounded-md text-black font-bold flex items-center justify-center gap-4 transition-all"
                      >
                        <Zap size={24} className="fill-current" />
                        <span className="tracking-wide uppercase text-xs">¡NIVEL COMPLETADO! +{quizScore * 100} EXP</span>
                      </motion.div>
                    )}
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ParamInput({ label, val, set, min, max, step = 1, unit }: { label: string, val: number, set: (v: number) => void, min: number, max: number, step?: number, unit: string }) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className={cn("group space-y-3 p-2.5 rounded-md border border-transparent transition-all", isEditing ? "bg-brand-surface shadow-sm border-brand-border" : "hover:bg-brand-surface/30")}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-bold text-black uppercase tracking-[0.1em] group-hover:opacity-100 opacity-70 transition-colors">{label}</label>
        <div className={cn(
          "flex items-center gap-1.5 bg-brand-bg/80 border rounded-md px-2 py-1 transition-all",
          isEditing ? "border-black shadow-sm" : "border-brand-border"
        )}>
          <input 
            type="number" 
            value={val} 
            step={step}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onChange={(e) => set(Number(e.target.value))}
            className="w-16 bg-transparent text-[10px] font-mono font-bold text-black outline-none text-right"
          />
          <span className="text-[8px] font-bold text-black uppercase opacity-60">{unit}</span>
        </div>
      </div>
      
      <div 
        className="custom-slider-form" 
        style={{ 
          '--min': min, 
          '--max': max, 
          '--val': val 
        } as React.CSSProperties}
      >
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={val} 
          onChange={(e) => set(Number(e.target.value))}
          className="custom-range"
        />
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-brand-bg/30 rounded-md border border-brand-border/40 hover:bg-brand-bg/50 transition-all hover:border-black/20 group cursor-default">
      <span className="text-[9px] font-bold text-black uppercase tracking-widest group-hover:opacity-80">{label}</span>
      <span className="text-[10px] font-mono font-bold text-black group-hover:scale-105 transition-transform">{value}</span>
    </div>
  );
}

function QuizOption({ label, correct, onClick }: { label: string, correct?: boolean, onClick: () => void }) {
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  return (
    <button 
      disabled={status !== 'idle'}
      onClick={() => { 
        if(correct) {
          setStatus('correct');
          onClick();
        } else {
          setStatus('wrong');
        }
      }}
      className={cn(
        "w-full p-5 rounded-md border text-left text-sm font-bold transition-all relative group overflow-hidden",
        status === 'idle' && "bg-brand-surface border-brand-border hover:bg-brand-border/40 hover:border-black/30 hover:-translate-y-1",
        status === 'correct' && "bg-black/10 border-black text-black shadow-sm",
        status === 'wrong' && "bg-red-500/10 border-red-500 text-red-500 opacity-60"
      )}
    >
      <div className="flex items-center justify-between relative z-10">
        {label}
        {status === 'correct' && <motion.div initial={{scale:0}} animate={{scale:1}} className="size-6 bg-black rounded-sm flex items-center justify-center text-white"><Zap size={14} fill="white" /></motion.div>}
        {status === 'wrong' && <div className="size-6 bg-red-500 rounded-sm flex items-center justify-center text-white">×</div>}
      </div>
      {status === 'idle' && (
        <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/0 via-brand-accent/5 to-brand-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
    </button>
  );
}
