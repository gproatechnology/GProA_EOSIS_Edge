import { useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import {
  UploadSimple,
  FileText,
  Trash,
  CheckCircle,
  WarningCircle,
  Clock,
  SpinnerGap,
} from "@phosphor-icons/react";

export default function FileUploadTab({ projectId, files, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(`${API}/projects/${projectId}/files`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await onRefresh();
    } catch (e) {
      console.error("Error uploading files:", e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`${API}/files/${fileId}`);
      await onRefresh();
    } catch (e) {
      console.error("Error deleting file:", e);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "processed":
        return <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />;
      case "error":
        return <WarningCircle weight="fill" className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
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

  return (
    <div data-testid="file-upload-tab">
      {/* Upload Zone */}
      <div
        className={`drop-zone mb-6 ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="upload-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          data-testid="file-input"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <SpinnerGap className="w-8 h-8 text-slate-400 animate-spin" />
            <p className="text-sm text-slate-500">Subiendo archivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadSimple className="w-8 h-8 text-slate-400" />
            <p className="text-sm text-slate-600 font-medium">
              Arrastra archivos aqui o haz click para seleccionar
            </p>
            <p className="text-xs text-slate-400">
              Fichas tecnicas, planos, memorias, facturas, etc.
            </p>
          </div>
        )}
      </div>

      {/* Info banner */}
      {files.length > 0 && files.some(f => f.status === "pending") && (
        <div className="bg-sky-50 border border-sky-200 rounded-sm p-3 mb-6 flex items-center gap-2" data-testid="pending-alert">
          <Clock className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <p className="text-xs text-sky-700">
            {files.filter(f => f.status === "pending").length} archivo(s) pendiente(s). 
            Usa el boton <strong>"Procesar Proyecto EDGE"</strong> en la parte superior para clasificar y analizar todos los archivos.
          </p>
        </div>
      )}

      {/* File List */}
      {files.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-sm p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay archivos subidos</p>
          <p className="text-xs text-slate-400 mt-1">
            Sube documentos tecnicos para clasificarlos automaticamente
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
          <table className="w-full data-table" data-testid="files-table">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Tamano</th>
                <th>Estado</th>
                <th>Categoria</th>
                <th>Medida</th>
                <th>Tipo Doc</th>
                <th>Confianza</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id} data-testid={`file-row-${f.id}`}>
                  <td>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{f.filename}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-500">
                    {f.file_size > 1024 ? `${(f.file_size / 1024).toFixed(1)} KB` : `${f.file_size} B`}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {statusIcon(f.status)}
                      <span className="text-xs capitalize">
                        {f.status === "pending" ? "Pendiente" : f.status === "processed" ? "Procesado" : "Error"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {f.category_edge ? (
                      <span className={`edge-badge ${categoryBadgeClass(f.category_edge)}`}>
                        {f.category_edge}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="font-mono text-xs">{f.measure_edge || "-"}</td>
                  <td className="text-xs capitalize">{f.doc_type?.replace("_", " ") || "-"}</td>
                  <td className="font-mono text-xs">
                    {f.confidence != null ? `${(f.confidence * 100).toFixed(0)}%` : "-"}
                  </td>
                  <td>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.id); }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      data-testid={`delete-file-${f.id}`}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
