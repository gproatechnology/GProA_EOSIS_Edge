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
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-slate-700 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          data-testid="export-excel"
        >
          <DownloadSimple className="w-4 h-4" />
          {exporting ? "Exportando..." : "Exportar Excel"}
        </button>
      </div>

      {/* General Data Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto mb-6">
        <table className="w-full data-table" data-testid="extracted-data-table">
          <thead>
            <tr>
              <th>Archivo</th>
              <th>Categoria</th>
              <th>Medida</th>
              <th>Tipo Doc</th>
              <th>Watts</th>
              <th>Lumens</th>
              <th>Equipo</th>
              <th>Marca</th>
              <th>Modelo</th>
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
                <td className="font-mono text-xs">{f.watts != null ? f.watts : "-"}</td>
                <td className="font-mono text-xs">{f.lumens != null ? f.lumens : "-"}</td>
                <td className="text-xs">{f.tipo_equipo || "-"}</td>
                <td className="text-xs">{f.marca || "-"}</td>
                <td className="text-xs">{f.modelo || "-"}</td>
                <td className="font-mono text-xs">
                  {f.confidence != null ? (
                    <span className={f.confidence >= 0.7 ? "text-emerald-600" : f.confidence >= 0.4 ? "text-amber-600" : "text-red-500"}>
                      {(f.confidence * 100).toFixed(0)}%
                    </span>
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
