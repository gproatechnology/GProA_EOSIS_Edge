import { useState, useEffect, useRef } from "react";
import { SpinnerGap, CheckCircle, WarningCircle, Lightning, X } from "@phosphor-icons/react";

export default function BatchProgressModal({ isOpen, onClose, jobId, projectId, api, onComplete }) {
  const [status, setStatus] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !jobId) return;

    const poll = async () => {
      try {
        const res = await fetch(`${api}/projects/${projectId}/process-status/${jobId}`);
        const data = await res.json();
        setStatus(data);
        if (data.status === "completed" || data.status === "error") {
          clearInterval(intervalRef.current);
          if (data.status === "completed" && onComplete) {
            setTimeout(() => onComplete(), 1500);
          }
        }
      } catch (e) {
        console.error("Error polling status:", e);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, jobId, projectId, api, onComplete]);

  if (!isOpen) return null;

  const percent = status?.percent || 0;
  const isCompleted = status?.status === "completed";
  const isError = status?.status === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" data-testid="batch-progress-modal">
      <div className="bg-white rounded-sm border border-slate-200 shadow-xl w-[520px] max-w-[90vw] animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
              <Lightning weight="fill" className="text-white w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {isCompleted ? "Procesamiento Completado" : isError ? "Error en Procesamiento" : "Procesando Proyecto EDGE"}
            </h3>
          </div>
          {(isCompleted || isError) && (
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors" data-testid="close-progress-modal">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400">Progreso</span>
              <span className="font-mono text-sm font-medium text-slate-900" data-testid="progress-percent">{percent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? "bg-emerald-500" : isError ? "bg-red-500" : "bg-slate-900"}`}
                style={{ width: `${percent}%` }}
                data-testid="batch-progress-bar"
              />
            </div>
          </div>

          {/* Current status */}
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
            <div className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : isError ? (
                <WarningCircle weight="fill" className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <SpinnerGap className="w-5 h-5 text-slate-500 animate-spin flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate" data-testid="current-step">
                  {status?.current_step || "Iniciando..."}
                </p>
                {status?.current_file && (
                  <p className="text-xs text-slate-400 truncate mt-0.5" data-testid="current-file">
                    {status.current_file}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-slate-50 rounded-sm border border-slate-100">
              <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-0.5">Total</p>
              <p className="font-mono text-lg font-semibold text-slate-900">{status?.total || 0}</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-sm border border-slate-100">
              <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-0.5">Procesados</p>
              <p className="font-mono text-lg font-semibold text-emerald-600">{status?.processed || 0}</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-sm border border-slate-100">
              <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-0.5">Restantes</p>
              <p className="font-mono text-lg font-semibold text-amber-600">
                {(status?.total || 0) - (status?.processed || 0)}
              </p>
            </div>
          </div>

          {/* Results list (completed) */}
          {isCompleted && status?.results?.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {status.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-sm bg-slate-50">
                  {r.status === "processed" ? (
                    <CheckCircle weight="fill" className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <WarningCircle weight="fill" className="w-3 h-3 text-red-500 flex-shrink-0" />
                  )}
                  <span className="truncate text-slate-600">{r.filename}</span>
                  {r.measure && <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">{r.measure}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          {(isCompleted || isError) && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-sm hover:bg-slate-800 transition-colors"
              data-testid="close-progress-button"
            >
              {isCompleted ? "Ver Resultados" : "Cerrar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
