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
  ArrowRight,
  Gauge,
} from "@phosphor-icons/react";

const CATEGORY_CONFIG = {
  ENERGY: { icon: Lightning, bgColor: "bg-sky-50", borderColor: "border-sky-200", textColor: "text-sky-700", iconColor: "text-sky-500", label: "Energia" },
  WATER: { icon: Drop, bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700", iconColor: "text-blue-500", label: "Agua" },
  MATERIALS: { icon: Cube, bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-700", iconColor: "text-amber-500", label: "Materiales" },
  DESIGN: { icon: PencilRuler, bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-700", iconColor: "text-emerald-500", label: "Diseno" },
};

export default function EdgeComplianceTab({ projectId }) {
  const [validation, setValidation] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wbsRes, kpisRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}/wbs-validation`),
        axios.get(`${API}/projects/${projectId}/kpis`),
      ]);
      setValidation(wbsRes.data);
      setKpis(kpisRes.data);
    } catch (e) {
      console.error("Error fetching compliance data:", e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="compliance-loading">
        <SpinnerGap className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!validation || validation.processed_files === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-12 text-center" data-testid="compliance-empty">
        <Gauge className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Sin datos de compliance</p>
        <p className="text-xs text-slate-400 mt-1">Procesa archivos con el boton "Procesar Proyecto EDGE" para ver el estado de compliance</p>
      </div>
    );
  }

  const coverage = validation.coverage;
  const measures = validation.measures;
  const sortedMeasures = Object.entries(measures).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div data-testid="edge-compliance-tab" className="space-y-6">
      {/* Coverage overview */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Cobertura del Proyecto
          </h3>
          <span className="font-mono text-2xl font-semibold text-slate-900" data-testid="coverage-percent">
            {coverage.coverage_percent}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-500"
            style={{ width: `${coverage.coverage_percent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const catData = coverage.categories[key] || { total: 0, detected: 0 };
            const Icon = config.icon;
            return (
              <div key={key} className={`p-3 rounded-sm border ${config.borderColor} ${config.bgColor}`} data-testid={`coverage-${key.toLowerCase()}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon weight="fill" className={`w-3.5 h-3.5 ${config.iconColor}`} />
                  <span className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${config.textColor}`}>{config.label}</span>
                </div>
                <p className={`font-mono text-lg font-semibold ${config.textColor}`}>
                  {catData.detected}/{catData.total}
                </p>
                <p className="text-[10px] text-slate-500">medidas detectadas</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      {kpis && Object.keys(kpis).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            KPIs por Medida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(kpis).map(([measure, kpi]) => (
              <div key={measure} className="stat-card" data-testid={`kpi-${measure}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-500">{measure}</span>
                    <p className="text-sm font-medium text-slate-900">{kpi.nombre}</p>
                  </div>
                  {kpi.cumple !== undefined && (
                    kpi.cumple ? (
                      <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <WarningCircle weight="fill" className="w-5 h-5 text-amber-500" />
                    )
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`font-mono text-2xl font-bold ${kpi.cumple ? 'text-emerald-600' : kpi.cumple === false ? 'text-amber-600' : 'text-slate-900'}`}>
                    {typeof kpi.valor === 'number' ? kpi.valor.toLocaleString() : kpi.valor}
                  </span>
                  <span className="text-xs text-slate-400">{kpi.unidad}</span>
                </div>
                {kpi.umbral_edge && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Umbral EDGE: {kpi.umbral_edge} {kpi.unidad}
                    {kpi.cumple ? " — Cumple" : " — No cumple"}
                  </p>
                )}
                {kpi.alertas && kpi.alertas.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {kpi.alertas.slice(0, 3).map((a, i) => (
                      <p key={i} className="text-[10px] text-amber-600 flex items-center gap-1">
                        <WarningCircle weight="fill" className="w-3 h-3 flex-shrink-0" />
                        {a}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WBS Compliance Table */}
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Estado por Medida EDGE
        </h3>
        <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
          <table className="w-full data-table" data-testid="wbs-compliance-table">
            <thead>
              <tr>
                <th>Medida</th>
                <th>Categoria</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Progreso</th>
                <th>Docs Disponibles</th>
                <th>Faltantes</th>
              </tr>
            </thead>
            <tbody>
              {sortedMeasures.map(([measure, data]) => {
                const catConfig = CATEGORY_CONFIG[data.categoria] || {};
                return (
                  <tr key={measure} data-testid={`wbs-row-${measure}`}>
                    <td className="font-mono text-xs font-semibold">{measure}</td>
                    <td>
                      <span className={`edge-badge ${data.categoria?.toLowerCase() || ''}`}>
                        {data.categoria}
                      </span>
                    </td>
                    <td className="text-xs">{data.nombre}</td>
                    <td>
                      {data.estado === "completo" ? (
                        <span className="edge-badge valid flex items-center gap-1 w-fit">
                          <CheckCircle weight="fill" className="w-3 h-3" /> Completo
                        </span>
                      ) : (
                        <span className="edge-badge invalid flex items-center gap-1 w-fit">
                          <WarningCircle weight="fill" className="w-3 h-3" /> Incompleto
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${data.progreso >= 1 ? 'bg-emerald-500' : data.progreso >= 0.5 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${(data.progreso || 0) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{Math.round((data.progreso || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(data.documentos_disponibles || []).map((d, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-sm capitalize">{d.replace("_", " ")}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(data.faltantes || []).map((d, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-sm capitalize">{d.replace("_", " ")}</span>
                        ))}
                        {(!data.faltantes || data.faltantes.length === 0) && (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts summary */}
      {sortedMeasures.some(([, d]) => d.estado === "incompleto") && (
        <div className="stat-card border-l-4 border-l-amber-400" data-testid="compliance-alerts">
          <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <WarningCircle weight="fill" className="w-4 h-4 text-amber-500" />
            Alertas de Documentacion
          </h3>
          <div className="space-y-2">
            {sortedMeasures
              .filter(([, d]) => d.estado === "incompleto")
              .map(([measure, data]) => (
                <div key={measure} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs font-semibold text-amber-700 w-14">{measure}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <span className="text-xs text-slate-600">
                    Faltan: {data.faltantes.map(f => f.replace("_", " ")).join(", ")}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
