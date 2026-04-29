import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Call onFinish after fade out animation completes (2.5s total)
    const timer2 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center animate-pulse">
        <div className="h-20 w-20 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] mb-6">
          <Zap size={40} className="text-white" fill="currentColor" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
          GProA Edge
        </h1>
        <p className="text-slate-400 tracking-widest uppercase text-sm font-semibold">
          Doc Processor
        </p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center">
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-[loading_2s_ease-in-out]"></div>
        </div>
        <p className="mt-4 text-xs text-slate-500 font-mono">Inicializando entorno...</p>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
