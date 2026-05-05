import { useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { DownloadSimple, Table as TableIcon, Lightning } from "@phosphor-icons/react";

export default function ExtractedDataTab({ projectId, files }) {
  const [exporting, setExporting] = useState(false);

  const processedFiles = files.filter((f) => f.status === "processed");

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axios.get(`${API}/projects/${projectId}/export-excel`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `proyecto_EDGE.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error exporting:", e);
    } finally {
      setExporting(false);
    }
  };

  const categoryBadgeClass = (cat) => {
    switch (cat?.toUpperCase()) {
      case "ENERGY": return "energy";
      case "WATER": return "water";
      case "MATERIALS": return "materials";
      case "DESIGN": return "design";
      default: return "pending";
    }
  };

  if (processedFiles.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-12 text-center" data-testid="extracted-data-empty">
        <TableIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Sin datos extraidos</p>
        <p className="text-xs text-slate-400 mt-1">
          Procesa archivos con "Procesar Proyecto EDGE" para ver datos extraidos
        </p>
      </div>
    );
  }

  // Separate EEM22 files for special display
  const eem22Files = processedFiles.filter(
    (f) => (f.measure_edge === "EEM22" || f.measure_edge === "EEM23") && f.specialized_data?.luminarias?.length > 0
  );
  const otherFiles = processedFiles.filter(
    (f) => !(f.measure_edge === "EEM22" || f.measure_edge === "EEM23") || !f.specialized_data?.luminarias?.length
  );

  return (
    <div data-testid="extracted-data-tab">
      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          <span className="font-mono font-medium text-slate-900">{processedFiles.length}</span> archivo{processedFiles.length !== 1 ? "s" : ""} procesado{processedFiles.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          data-testid="export-excel"
        >
          <DownloadSimple className="w-4 h-4" />
          {exporting ? "Exportando..." : "Exportar Excel"}
        </button>
      </div>

      {/* Billing Insights Panel */}
      {processedFiles.some(f => f.cost > 0 || f.consumption_kwh > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Gasto Total Detectado</p>
            <p className="text-2xl font-bold text-indigo-700 font-mono">
              ${processedFiles.reduce((sum, f) => sum + (f.cost || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 mb-1">Consumo Total</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono">
              {processedFiles.reduce((sum, f) => sum + (f.consumption_kwh || 0), 0).toLocaleString()} <span className="text-xs">kWh</span>
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Confianza Media IA</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-700 font-mono">
                {(processedFiles.reduce((sum, f) => sum + (f.confidence || 0), 0) / processedFiles.length * 100).toFixed(0)}%
              </p>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${(processedFiles.reduce((sum, f) => sum + (f.confidence || 0), 0) / processedFiles.length * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Data Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto mb-6">
        <table className="w-full data-table" data-testid="extracted-data-table">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Categoria</th>
              <th>Medida</th>
               <th>Tipo Doc</th>
              <th>Consumo / Costo</th>
              <th>Watts / Lumens</th>
              <th>Equipo / Marca</th>
              <th>Confianza</th>
            </tr>
          </thead>
          <tbody>
            {processedFiles.map((f) => (
              <tr key={f.id} data-testid={`data-row-${f.id}`}>
                <td><span className="truncate max-w-[180px] block text-sm">{f.filename}</span></td>
                <td>
                  <span className={`edge-badge ${categoryBadgeClass(f.category_edge)}`}>{f.category_edge}</span>
                </td>
                <td className="font-mono text-xs font-medium">{f.measure_edge || "-"}</td>
                <td className="text-xs capitalize">{f.doc_type?.replace("_", " ") || "-"}</td>
                <td className="text-[10px]">
                  {f.consumption_kwh != null && (
                    <div className="font-mono font-medium text-slate-700">{f.consumption_kwh.toLocaleString()} <span className="text-[8px] text-slate-400">kWh</span></div>
                  )}
                  {f.cost != null && (
                    <div className="font-mono text-indigo-600">${f.cost.toLocaleString()}</div>
                  )}
                  {f.consumption_kwh == null && f.cost == null && "-"}
                </td>
                <td className="font-mono text-[10px]">
                  {f.watts != null && <span>{f.watts}W</span>}
                  {f.lumens != null && <span className="text-slate-400 ml-1">/ {f.lumens}lm</span>}
                  {f.watts == null && f.lumens == null && "-"}
                </td>
                <td className="text-[10px]">
                  <div className="font-medium text-slate-700">{f.tipo_equipo || "-"}</div>
                  <div className="text-slate-400">{f.marca} {f.modelo}</div>
                </td>
                <td className="font-mono text-xs">
                  {f.confidence != null ? (
                    <div className="w-full max-w-[100px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold ${f.confidence >= 0.8 ? "text-emerald-600" : f.confidence >= 0.5 ? "text-orange-600" : "text-red-500"}`}>
                          {(f.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${f.confidence >= 0.8 ? "bg-emerald-500" : f.confidence >= 0.5 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{ width: `${f.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EEM22 Luminaire Detail */}
      {eem22Files.length > 0 && (
        <div className="mb-6" data-testid="eem22-section">
          <div className="flex items-center gap-2 mb-3">
            <Lightning weight="fill" className="w-4 h-4 text-sky-500" />
            <h3 className="text-base font-medium text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              EEM22 — Tabla de Luminarias
            </h3>
          </div>
          {eem22Files.map((f) => {
            const sd = f.specialized_data;
            return (
              <div key={f.id} className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Fuente: {f.filename}</p>
                <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
                  <table className="w-full data-table" data-testid={`luminaire-table-${f.id}`}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Modelo</th>
                        <th>Cantidad</th>
                        <th>Lumens</th>
                        <th>Watts</th>
                        <th>Eficiencia (lm/W)</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sd.luminarias || []).map((lum, idx) => (
                        <tr key={idx}>
                          <td className="font-mono text-xs">{lum.id || "-"}</td>
                          <td className="text-xs">{lum.modelo || "-"}</td>
                          <td className="font-mono text-xs font-medium">{lum.cantidad || 0}</td>
                          <td className="font-mono text-xs">{lum.lumens || 0}</td>
                          <td className="font-mono text-xs">{lum.watts || 0}</td>
                          <td className="font-mono text-xs">
                            <span className={lum.eficiencia >= 90 ? "text-emerald-600 font-medium" : lum.eficiencia >= 60 ? "text-amber-600" : "text-red-500"}>
                              {lum.eficiencia || 0}
                            </span>
                          </td>
                          <td className="text-[10px] text-slate-500">{lum.notas || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Summary */}
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-0.5">Total Lumens</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">{(sd.total_lumens || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-0.5">Total Watts</p>
                    <p className="font-mono text-sm font-semibold text-slate-900">{(sd.total_watts || 0).toLocaleString()}</p>
                  </div>
                  <div className={`border rounded-sm p-3 text-center ${sd.cumple_edge ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-0.5">Eficacia Global</p>
                    <p className={`font-mono text-sm font-bold ${sd.cumple_edge ? 'text-emerald-600' : 'text-red-600'}`}>
                      {sd.eficacia_global || 0} lm/W
                    </p>
                  </div>
                  <div className={`border rounded-sm p-3 text-center ${sd.cumple_edge ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-0.5">EDGE</p>
                    <p className={`text-sm font-bold ${sd.cumple_edge ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {sd.cumple_edge ? "Cumple" : "No Cumple"}
                    </p>
                  </div>
                </div>
                {/* Alerts */}
                {sd.alertas && sd.alertas.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {sd.alertas.map((a, i) => (
                      <p key={i} className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-sm">{a}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Areas Section */}
      {processedFiles.some((f) => f.areas && f.areas.length > 0) && (
        <div>
          <h3 className="text-base font-medium text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Areas Calculadas
          </h3>
          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
            <table className="w-full data-table" data-testid="areas-table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Espacio</th>
                  <th>Area (m2)</th>
                </tr>
              </thead>
              <tbody>
                {processedFiles
                  .filter((f) => f.areas && f.areas.length > 0)
                  .flatMap((f) =>
                    f.areas.map((area, idx) => (
                      <tr key={`${f.id}-${idx}`}>
                        <td className="text-sm">{idx === 0 ? f.filename : ""}</td>
                        <td className="text-sm">{area.nombre}</td>
                        <td className="font-mono text-xs font-medium">{area.area_m2}</td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
