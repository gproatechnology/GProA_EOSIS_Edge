import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/App";
import { ArrowLeft, Trash, Lightning, Gauge, FilePdf } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import FileUploadTab from "@/components/FileUploadTab";
import ExtractedDataTab from "@/components/ExtractedDataTab";
import EdgeStatusTab from "@/components/EdgeStatusTab";
import EdgeComplianceTab from "@/components/EdgeComplianceTab";
import BatchProgressModal from "@/components/BatchProgressModal";

const TABS = [
  { id: "files", label: "Archivos" },
  { id: "data", label: "Datos Extraidos" },
  { id: "compliance", label: "Compliance EDGE" },
  { id: "status", label: "Resumen" },
];

export default function ProjectDetail({ projectId, onProjectDeleted }) {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("files");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [processingEdge, setProcessingEdge] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/projects/${projectId}`);
      setProject(res.data);
    } catch (e) {
      console.error("Error fetching project:", e);
    }
  }, [projectId]);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/projects/${projectId}/files`);
      setFiles(res.data);
    } catch (e) {
      console.error("Error fetching files:", e);
    }
  }, [projectId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProject(), fetchFiles()]);
      setLoading(false);
    };
    load();
  }, [fetchProject, fetchFiles]);

  const handleDelete = async () => {
    if (!window.confirm("Eliminar este proyecto y todos sus archivos?")) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      onProjectDeleted();
    } catch (e) {
      console.error("Error deleting project:", e);
    } finally {
      setDeleting(false);
    }
  };

  const refreshData = useCallback(async () => {
    await Promise.all([fetchProject(), fetchFiles()]);
  }, [fetchProject, fetchFiles]);

  const handleProcessEdge = async () => {
    if (files.length === 0) return;
    setProcessingEdge(true);
    try {
      const res = await axios.post(`${API}/projects/${projectId}/process-edge`);
      setCurrentJobId(res.data.job_id);
      setShowProgress(true);
    } catch (e) {
      console.error("Error starting EDGE processing:", e);
      setProcessingEdge(false);
    }
  };

  const handleProgressComplete = useCallback(() => {
    setShowProgress(false);
    setProcessingEdge(false);
    setCurrentJobId(null);
    refreshData();
  }, [refreshData]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-64 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto text-center py-20">
        <p className="text-slate-500">Proyecto no encontrado</p>
        <button onClick={() => navigate("/")} className="mt-4 text-sm text-slate-700 underline" data-testid="go-back-link">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const processedCount = files.filter((f) => f.status === "processed").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-fadeIn" data-testid="project-detail">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <button onClick={() => navigate("/")} className="hover:text-slate-600 transition-colors" data-testid="breadcrumb-home">
          Proyectos
        </button>
        <span>/</span>
        <span className="text-slate-700">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all"
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <h1 className="text-2xl tracking-tight font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {project.name}
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-2 ml-11">
            <span className="edge-badge capitalize">{project.typology}</span>
            <span className="text-xs text-slate-400">
              Creado {new Date(project.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Main EDGE Process Button */}
          {files.length > 0 && (
            <button
              onClick={handleProcessEdge}
              disabled={processingEdge || files.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="process-edge-button"
            >
              <Lightning weight="fill" className="w-4 h-4" />
              Procesar Proyecto EDGE
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:shadow-sm transition-all disabled:opacity-50"
            data-testid="delete-project-button"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Archivos</p>
          <p className="text-xl font-semibold text-slate-900 font-mono">{files.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Procesados</p>
          <p className="text-xl font-semibold text-emerald-600 font-mono">{processedCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Pendientes</p>
          <p className="text-xl font-semibold text-amber-600 font-mono">{pendingCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Errores</p>
          <p className="text-xl font-semibold text-red-500 font-mono">{errorCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Tipologia</p>
          <p className="text-sm font-medium text-slate-900 capitalize">{project.typology}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.id === "compliance" && <Gauge className="w-3.5 h-3.5" />}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "files" && (
        <FileUploadTab projectId={projectId} files={files} onRefresh={refreshData} />
      )}
      {activeTab === "data" && (
        <ExtractedDataTab projectId={projectId} files={files} />
      )}
      {activeTab === "compliance" && (
        <EdgeComplianceTab projectId={projectId} />
      )}
      {activeTab === "status" && (
        <EdgeStatusTab projectId={projectId} />
      )}

      {/* Batch Progress Modal */}
      <BatchProgressModal
        isOpen={showProgress}
        onClose={handleProgressComplete}
        jobId={currentJobId}
        projectId={projectId}
        api={API}
        onComplete={handleProgressComplete}
      />
    </div>
  );
}
