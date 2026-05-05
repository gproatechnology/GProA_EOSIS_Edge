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
        return <WarningCircle weight="fill" className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
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
            <SpinnerGap className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Subiendo archivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 transition-transform group-hover:scale-110">
              <UploadSimple className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              Fichas técnicas, planos, memorias, facturas, etc.
            </p>
          </div>
        )}
      </div>

      {/* Info banner */}
      {files.length > 0 && files.some(f => f.status === "pending") && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3 animate-fadeIn" data-testid="pending-alert">
          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground leading-relaxed">
            <span className="font-bold">{files.filter(f => f.status === "pending").length} archivo(s) pendiente(s).</span><br/> 
            Usa el botón <strong className="text-primary">"Procesar Proyecto EDGE"</strong> en la parte superior para clasificar y analizar todos los archivos.
          </p>
        </div>
      )}

      {/* File List */}
      {files.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold">No hay archivos subidos</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sube documentos técnicos para clasificarlos automáticamente
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full data-table" data-testid="files-table">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Archivo</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Tamaño</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Medida</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((f) => (
                <tr key={f.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate max-w-[200px] text-sm font-medium">{f.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                    {f.file_size > 1024 ? `${(f.file_size / 1024).toFixed(1)} KB` : `${f.file_size} B`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {statusIcon(f.status)}
                      <span className="text-xs font-medium">
                        {f.status === "pending" ? "Pendiente" : f.status === "processed" ? "Procesado" : "Error"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {f.category_edge ? (
                      <span className={`edge-badge ${categoryBadgeClass(f.category_edge)}`}>
                        {f.category_edge}
                      </span>
                    ) : (
                      <span className="text-xs opacity-40">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.measure_edge || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.id); }}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
