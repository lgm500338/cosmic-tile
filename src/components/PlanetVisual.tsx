import React from 'react';
import { motion } from 'motion/react';

interface PlanetVisualProps {
  planetId: string;
  className?: string;
}

/**
 * High-definition cinematic planet renderer with atmospheric limb glow,
 * ring systems, rotating nebula, surface textures, and dynamic cosmic lighting.
 */
export const PlanetVisual: React.FC<PlanetVisualProps> = ({ planetId, className = 'w-48 h-48' }) => {
  switch (planetId) {
    case 'c_mercury':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Ambient Corona */}
          <div className="absolute inset-2 rounded-full bg-slate-400/20 blur-2xl" />
          {/* Planet Sphere */}
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-[inset_-24px_-24px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(148,163,184,0.4)] bg-gradient-to-tr from-[#1e293b] via-[#64748b] to-[#cbd5e1] border border-slate-400/40">
            {/* Crater details */}
            <div className="absolute top-5 left-7 w-6 h-6 rounded-full border border-slate-500/50 bg-black/20" />
            <div className="absolute top-12 left-14 w-10 h-10 rounded-full border border-slate-500/40 bg-black/25" />
            <div className="absolute bottom-8 left-9 w-8 h-8 rounded-full border border-slate-500/40 bg-black/30" />
            <div className="absolute top-3 right-6 w-4 h-4 rounded-full border border-slate-500/40 bg-black/15" />
            {/* Sun glare highlight */}
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/40 blur-md" />
          </div>
        </div>
      );

    case 'c_venus':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Dense Hot Atmosphere Corona */}
          <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-2xl animate-pulse" />
          {/* Planet Sphere */}
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-[inset_-26px_-26px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.6)] bg-gradient-to-tr from-[#78350f] via-[#d97706] to-[#fef08a] border border-amber-300/50">
            {/* Cloud swirls */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-4 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/30 via-transparent to-transparent"
            />
            <div className="absolute inset-x-0 top-1/4 h-8 bg-amber-900/25 blur-sm -skew-y-6" />
            <div className="absolute inset-x-0 bottom-1/3 h-10 bg-amber-800/30 blur-sm -skew-y-3" />
            {/* Glare */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-yellow-100/50 blur-lg" />
          </div>
        </div>
      );

    case 'c_earth':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Blue Atmosphere Halo */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-2xl" />
          {/* Earth Sphere */}
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-[inset_-26px_-26px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(56,189,248,0.7)] bg-gradient-to-tr from-[#082f49] via-[#0284c7] to-[#38bdf8] border border-sky-400/60">
            {/* Continents */}
            <div className="absolute top-4 left-6 w-14 h-12 rounded-3xl bg-emerald-600/80 blur-[1px] -rotate-12" />
            <div className="absolute bottom-5 left-10 w-16 h-10 rounded-2xl bg-emerald-700/80 blur-[1px] rotate-6" />
            <div className="absolute top-10 right-4 w-12 h-14 rounded-full bg-emerald-600/70 blur-[1px]" />
            {/* White Swirling Cloud Bands */}
            <motion.div
              animate={{ x: [-15, 15, -15] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 opacity-70"
            >
              <div className="absolute top-7 inset-x-0 h-4 bg-white/60 blur-[3px] rounded-full -skew-y-6" />
              <div className="absolute bottom-10 inset-x-2 h-5 bg-white/50 blur-[3px] rounded-full skew-y-3" />
            </motion.div>
            {/* Sun glare */}
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/60 blur-md" />
          </div>
        </div>
      );

    case 'c_mars':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Red Atmosphere Dust */}
          <div className="absolute inset-0 rounded-full bg-rose-600/30 blur-2xl" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-[inset_-26px_-26px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(244,63,94,0.6)] bg-gradient-to-tr from-[#4c0519] via-[#be123c] to-[#fda4af] border border-rose-400/50">
            {/* Dark Basaltic Plains (Syrtis Major) */}
            <div className="absolute top-8 left-6 w-14 h-14 rounded-full bg-stone-900/40 blur-[2px]" />
            <div className="absolute bottom-6 right-6 w-16 h-10 rounded-full bg-stone-900/50 blur-[2px]" />
            {/* White Polar Ice Cap */}
            <div className="absolute top-1 inset-x-8 h-3.5 bg-white/85 rounded-full blur-[1px] shadow-sm" />
            {/* Glare */}
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-amber-100/40 blur-md" />
          </div>
        </div>
      );

    case 'c_jupiter':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Giant Gas Glow */}
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-3xl" />
          <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-[inset_-28px_-28px_55px_rgba(0,0,0,0.95),0_0_35px_rgba(251,146,60,0.6)] bg-gradient-to-tr from-[#451a03] via-[#b45309] to-[#fed7aa] border border-amber-300/40">
            {/* Horizontal Atmospheric Belts */}
            <div className="absolute inset-x-0 top-6 h-3 bg-amber-950/60 blur-[1px]" />
            <div className="absolute inset-x-0 top-12 h-5 bg-amber-800/70 blur-[1px]" />
            <div className="absolute inset-x-0 top-20 h-4 bg-orange-950/80 blur-[1px]" />
            <div className="absolute inset-x-0 top-28 h-5 bg-amber-900/70 blur-[1px]" />
            {/* The Great Red Spot (대적점) */}
            <div className="absolute bottom-9 right-8 w-8 h-5 rounded-full bg-red-700 border border-amber-300/40 shadow-[0_0_8px_rgba(185,28,28,0.8)] flex items-center justify-center">
              <div className="w-4 h-2 rounded-full bg-red-500/80 blur-[0.5px]" />
            </div>
            {/* Sun glare */}
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-yellow-100/50 blur-md" />
          </div>
        </div>
      );

    case 'c_saturn':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Golden Ring Glow */}
          <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-3xl" />
          {/* Background Ring Behind Sphere */}
          <div className="absolute w-56 h-16 rounded-[100%] border-[10px] border-amber-300/60 -rotate-12 blur-[0.5px] shadow-[0_0_20px_rgba(245,158,11,0.5)] pointer-events-none" />
          <div className="absolute w-52 h-14 rounded-[100%] border-[4px] border-amber-200/80 -rotate-12 pointer-events-none" />
          {/* Planet Sphere */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-[inset_-24px_-24px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(245,158,11,0.5)] bg-gradient-to-tr from-[#78350f] via-[#d97706] to-[#fef3c7] border border-amber-300/50 z-10">
            {/* Atmospheric bands */}
            <div className="absolute inset-x-0 top-8 h-3 bg-amber-900/40 blur-[1px]" />
            <div className="absolute inset-x-0 top-14 h-4 bg-amber-800/50 blur-[1px]" />
            <div className="absolute inset-x-0 top-20 h-3 bg-amber-900/40 blur-[1px]" />
            <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-white/40 blur-md" />
          </div>
          {/* Foreground Ring Across Sphere */}
          <div className="absolute w-56 h-16 rounded-[100%] border-b-[10px] border-amber-300/80 -rotate-12 pointer-events-none z-20 overflow-hidden" />
        </div>
      );

    case 'c_uranus':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          <div className="absolute inset-0 rounded-full bg-cyan-400/25 blur-2xl" />
          {/* Vertical Ring (Uranus has a tilted axis!) */}
          <div className="absolute w-16 h-52 rounded-[100%] border-[4px] border-cyan-200/50 rotate-85 pointer-events-none" />
          {/* Sphere */}
          <div className="relative w-34 h-34 rounded-full overflow-hidden shadow-[inset_-24px_-24px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.6)] bg-gradient-to-tr from-[#0e7490] via-[#06b6d4] to-[#cffafe] border border-cyan-300/60 z-10">
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/50 blur-md" />
          </div>
        </div>
      );

    case 'c_neptune':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Deep Cobalt Blue Aura */}
          <div className="absolute inset-0 rounded-full bg-blue-600/35 blur-3xl animate-pulse" />
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-[inset_-26px_-26px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(37,99,235,0.7)] bg-gradient-to-tr from-[#172554] via-[#1d4ed8] to-[#93c5fd] border border-blue-400/50">
            {/* Great Dark Spot Storm */}
            <div className="absolute top-12 left-8 w-9 h-6 rounded-full bg-blue-950/80 border border-blue-300/30 blur-[1px]" />
            {/* White Cirrus Scooter Clouds */}
            <div className="absolute bottom-11 right-6 w-12 h-2.5 rounded-full bg-white/70 blur-[1px]" />
            <div className="absolute top-20 right-10 w-7 h-2 rounded-full bg-white/60 blur-[1px]" />
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-sky-200/50 blur-md" />
          </div>
        </div>
      );

    case 'c_pluto':
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          {/* Pluto Cold Nebula Glow */}
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
          {/* Pluto Sphere */}
          <div className="relative w-34 h-34 rounded-full overflow-hidden shadow-[inset_-24px_-24px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(251,191,36,0.4)] bg-gradient-to-tr from-[#292524] via-[#78716c] to-[#fed7aa] border border-amber-300/40 z-10">
            {/* Heart-shaped Sputnik Planitia Nitrogen Ice Sheet */}
            <div className="absolute bottom-6 left-8 w-14 h-12 rounded-3xl bg-amber-100/90 shadow-[0_0_10px_rgba(254,243,199,0.8)] blur-[0.5px] -rotate-12 flex items-center justify-center">
              <span className="text-xl opacity-90">🤍</span>
            </div>
            {/* Tholin dark organic belt */}
            <div className="absolute inset-x-0 bottom-2 h-6 bg-red-950/60 blur-[1px]" />
            <div className="absolute -top-3 -right-3 w-18 h-18 rounded-full bg-white/40 blur-md" />
          </div>
          {/* Companion Charon in Orbit */}
          <div className="absolute -top-1 -right-2 w-12 h-12 rounded-full overflow-hidden shadow-[inset_-6px_-6px_15px_rgba(0,0,0,0.9),0_0_12px_rgba(148,163,184,0.4)] bg-gradient-to-tr from-[#1c1917] via-[#57534e] to-[#cbd5e1] border border-slate-400/50 z-20">
            {/* Mordor Macula red polar cap */}
            <div className="absolute top-0 inset-x-1 h-3.5 bg-rose-900/80 rounded-full blur-[0.5px]" />
          </div>
        </div>
      );

    default:
      // Multi-Planet Solar System Panorama (수금지화목토천해 앙상블)
      return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative flex items-center justify-center">
            {/* Planet 1: Mercury / Golden Planet */}
            <div className="w-20 h-20 rounded-full shadow-[inset_-12px_-12px_20px_rgba(0,0,0,0.9),0_0_20px_rgba(251,191,36,0.6)] bg-gradient-to-tr from-[#78350f] via-[#d97706] to-[#fef08a] border border-amber-300/50 z-10 -mr-4" />
            {/* Planet 2: Earth / Blue Gem */}
            <div className="w-28 h-28 rounded-full shadow-[inset_-16px_-16px_30px_rgba(0,0,0,0.9),0_0_30px_rgba(56,189,248,0.7)] bg-gradient-to-tr from-[#082f49] via-[#0284c7] to-[#38bdf8] border border-sky-400/60 z-20" />
            {/* Planet 3: Mars / Red Planet */}
            <div className="w-16 h-16 rounded-full shadow-[inset_-10px_-10px_16px_rgba(0,0,0,0.9),0_0_18px_rgba(244,63,94,0.6)] bg-gradient-to-tr from-[#4c0519] via-[#be123c] to-[#fda4af] border border-rose-400/50 z-10 -ml-4" />
          </div>
        </div>
      );
  }
};
