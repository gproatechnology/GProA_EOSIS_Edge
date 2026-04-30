import { useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Plus, Folders, ArrowRight } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPOLOGIES = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
  { value: "hospitalario", label: "Hospitalario" },
  { value: "educativo", label: "Educativo" },
  { value: "industrial", label: "Industrial" },
  { value: "mixto", label: "Uso Mixto" },
  { value: "hotelero", label: "Hotelero" },
  { value: "otro", label: "Otro" },
];

export default function ProjectDashboard({ projects, loading, onProjectCreated, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [typology, setTypology] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !typology) return;
    setCreating(true);
    try {
      await axios.post(`${API}/projects`, { name: name.trim(), typology });
      setName("");
      setTypology("");
      setShowDialog(false);
      onProjectCreated();
    } catch (e) {
      console.error("Error creating project:", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto" data-testid="project-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl tracking-tight font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Proyectos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona tus proyectos de certificacion EDGE
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          data-testid="create-project-button"
        >
          <Plus weight="bold" className="w-4 h-4" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Total Proyectos</p>
          <p className="text-2xl font-semibold text-slate-900 font-mono">{projects.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Archivos Totales</p>
          <p className="text-2xl font-semibold text-slate-900 font-mono">
            {projects.reduce((sum, p) => sum + (p.file_count || 0), 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-1">Procesados</p>
          <p className="text-2xl font-semibold text-slate-900 font-mono">
            {projects.reduce((sum, p) => sum + (p.processed_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/3 mb-4" />
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl p-16 text-center animate-fadeIn shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Folders className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Sin proyectos
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Crea tu primer proyecto para comenzar a clasificar documentos EDGE
          </p>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 hover:shadow-glow transition-all duration-300"
            data-testid="empty-create-project-button"
          >
            <Plus weight="bold" className="w-4 h-4" />
            Crear Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, idx) => (
            <button
              key={project.id}
              onClick={() => onNavigate(`/projects/${project.id}`)}
              className="stat-card text-left hover:border-slate-300 transition-all duration-200 group animate-fadeIn"
              style={{ animationDelay: `${idx * 50}ms` }}
              data-testid={`project-card-${project.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {project.name}
                  </h3>
                  <span className="edge-badge mt-1.5 capitalize">
                    {project.typology}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400">Archivos</p>
                  <p className="text-lg font-semibold text-slate-900 font-mono">{project.file_count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400">Procesados</p>
                  <p className="text-lg font-semibold text-slate-900 font-mono">{project.processed_count}</p>
                </div>
                <div className="ml-auto">
                  <p className="text-[10px] text-slate-400">
                    {new Date(project.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[420px]" data-testid="create-project-dialog">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Outfit', sans-serif" }} className="text-lg font-bold text-slate-900">Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="project-name" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-500">
                Nombre del Proyecto
              </Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Torre Central - EDGE Avanzado"
                className="mt-1.5"
                data-testid="project-name-input"
              />
            </div>
            <div>
              <Label htmlFor="project-type" className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-500">
                Tipologia
              </Label>
              <Select value={typology} onValueChange={setTypology}>
                <SelectTrigger className="mt-1.5" data-testid="project-typology-select">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPOLOGIES.map((t) => (
                    <SelectItem key={t.value} value={t.value} data-testid={`typology-option-${t.value}`}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowDialog(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              data-testid="cancel-create-project"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || !typology}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="confirm-create-project"
            >
              {creating ? "Creando..." : "Crear Proyecto"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
