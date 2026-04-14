import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/App";
import {
  Lightning,
  Drop,
  Cube,
  PencilRuler,
  CheckCircle,
  WarningCircle,
  SpinnerGap,
} from "@phosphor-icons/react";

const CATEGORY_CONFIG = {
  ENERGY: { icon: Lightning, color: "sky", label: "Energia" },
  WATER: { icon: Drop, color: "blue", label: "Agua" },
  MATERIALS: { icon: Cube, color: "amber", label: "Materiales" },
  DESIGN: { icon: PencilRuler, color: "emerald", label: "Diseno" },
};

export default function EdgeStatusTab({ projectId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/projects/${projectId}/edge-status`);
      setStatus(res.data);
    } catch (e) {
      console.error("Error fetching edge status:", e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="edge-status-loading">
        <SpinnerGap className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!status || status.total_files === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-12 text-center" data-testid="edge-status-empty">
        <Lightning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Sin datos de estado EDGE</p>
        <p className="text-xs text-slate-400 mt-1">
          Procesa archivos para ver el estado de certificacion
        </p>
      </div>
    );
  }

  const progressPercent = status.total_files > 0
    ? Math.round((status.processed_files / status.total_files) * 100)
    : 0;

  return (
    <div data-testid="edge-status-tab">
      {/* Progress */}
      <div className="stat-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400">
            Progreso General
          </p>
          <span className="font-mono text-sm font-medium text-slate-900">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
            data-testid="progress-bar"
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          <span className="font-mono font-medium text-slate-700">{status.processed_files}</span> de{" "}
          <span className="font-mono font-medium text-slate-700">{status.total_files}</span> archivos procesados
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const count = status.categories[key] || 0;
          const Icon = config.icon;
          return (
            <div
              key={key}
              className={`stat-card border-l-4 border-l-${config.color}-400`}
              data-testid={`category-card-${key.toLowerCase()}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon weight="fill" className={`w-4 h-4 text-${config.color}-500`} />
                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400">
                  {config.label}
                </p>
              </div>
              <p className="text-2xl font-semibold text-slate-900 font-mono">{count}</p>
              <p className="text-xs text-slate-400">documento{count !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {/* Measures breakdown */}
      {Object.keys(status.measures).length > 0 && (
        <div className="stat-card mb-6">
          <h3 className="text-sm font-medium text-slate-900 mb-4" style={{ fontFamily: "'Chivo', sans-serif" }}>
            Medidas EDGE Detectadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(status.measures)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([measure, count]) => (
                <div
                  key={measure}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm"
                  data-testid={`measure-badge-${measure}`}
                >
                  <span className="font-mono text-xs font-medium text-slate-700">{measure}</span>
                  <span className="w-5 h-5 flex items-center justify-center bg-slate-200 rounded-full text-[10px] font-semibold text-slate-600">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Missing documents */}
      {status.faltantes && status.faltantes.length > 0 && (
        <div className="stat-card border-l-4 border-l-amber-400">
          <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
            <WarningCircle weight="fill" className="w-4 h-4 text-amber-500" />
            Documentos Faltantes
          </h3>
          <div className="space-y-3">
            {status.faltantes.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-sm"
                data-testid={`faltante-${idx}`}
              >
                <span className="font-mono text-xs font-semibold text-amber-700 mt-0.5 shrink-0">
                  {item.medida}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(item.faltan || []).map((tipo, tidx) => (
                    <span
                      key={tidx}
                      className="edge-badge invalid text-[10px] capitalize"
                    >
                      {tipo.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All complete */}
      {status.faltantes && status.faltantes.length === 0 && status.processed_files > 0 && (
        <div className="stat-card border-l-4 border-l-emerald-400">
          <div className="flex items-center gap-3">
            <CheckCircle weight="fill" className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Documentacion Completa</p>
              <p className="text-xs text-slate-500">No se detectaron documentos faltantes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
