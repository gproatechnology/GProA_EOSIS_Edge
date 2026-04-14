import { useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { DownloadSimple, Table as TableIcon } from "@phosphor-icons/react";

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
          Procesa archivos con IA para ver datos extraidos aqui
        </p>
      </div>
    );
  }

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

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
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
                <td>
                  <span className="truncate max-w-[180px] block text-sm">{f.filename}</span>
                </td>
                <td>
                  <span className={`edge-badge ${categoryBadgeClass(f.category_edge)}`}>
                    {f.category_edge}
                  </span>
                </td>
                <td className="font-mono text-xs font-medium">{f.measure_edge || "-"}</td>
                <td className="text-xs capitalize">{f.doc_type || "-"}</td>
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

      {/* Areas Section */}
      {processedFiles.some((f) => f.areas && f.areas.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-slate-900 mb-3" style={{ fontFamily: "'Chivo', sans-serif" }}>
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
