import { useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Plus, Folders, ArrowRight, MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import ProjectAnalytics from "./ProjectAnalytics";
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
  { value: "Retail", label: "Retail / Comercial" },
  { value: "Hotel", label: "Hotelero / Hospitalidad" },
  { value: "Industrial", label: "Industrial / Logística" },
  { value: "Healthcare", label: "Salud / Hospitalario" },
  { value: "Office", label: "Oficinas / Administrativo" },
  { value: "Data Center", label: "Data Center" },
  { value: "Education", label: "Educativo" },
  { value: "Transport", label: "Transporte" },
  { value: "Logistics", label: "Logística" },
  { value: "Residencial", label: "Residencial" },
  { value: "Otro", label: "Otro" },
];

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "crítica":
    case "critica":
      return "bg-red-50 text-red-600 border-red-100";
    case "alta":
      return "bg-orange-50 text-orange-600 border-orange-100";
    case "media":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "baja":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

export default function ProjectDashboard({ projects, loading, onProjectCreated, onNavigate }) {
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [typology, setTypology] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTypology, setFilterTypology] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTypology = filterTypology === "all" || p.typology === filterTypology;
    const matchesPriority = filterPriority === "all" || p.priority === filterPriority;
    return matchesSearch && matchesTypology && matchesPriority;
  });

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

  const clearFilters = () => {
    setSearch("");
    setFilterTypology("all");
    setFilterPriority("all");
  };

  const getCountByTypology = (type) => projects.filter(p => p.typology === type).length;
  const getCountByPriority = (prio) => projects.filter(p => p.priority === prio).length;
  const isFiltered = search !== "" || filterTypology !== "all" || filterPriority !== "all";

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

      {/* Analytics Section */}
      {!loading && projects.length > 0 && (
        <ProjectAnalytics projects={projects} />
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar proyecto por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterTypology} onValueChange={setFilterTypology}>
            <SelectTrigger className="w-[200px] bg-white border-slate-200 rounded-xl shadow-sm">
              <SelectValue placeholder="Tipología" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tipologías ({projects.length})</SelectItem>
              {TYPOLOGIES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center justify-between w-full gap-8">
                    <span>{t.label}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-full">{getCountByTypology(t.value)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[160px] bg-white border-slate-200 rounded-xl shadow-sm">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {["Crítica", "Alta", "Media", "Baja"].map(p => (
                <SelectItem key={p} value={p}>
                  <div className="flex items-center justify-between w-full gap-8">
                    <span>{p}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded-full">{getCountByPriority(p)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Pills */}
      {isFiltered && (
        <div className="flex items-center gap-2 mb-6 animate-fadeIn">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-2">Filtros Activos:</span>
          {search && (
            <button onClick={() => setSearch("")} className="filter-pill">
              Búsqueda: {search} <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          {filterTypology !== "all" && (
            <button onClick={() => setFilterTypology("all")} className="filter-pill">
              Tipo: {filterTypology} <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          {filterPriority !== "all" && (
            <button onClick={() => setFilterPriority("all")} className="filter-pill">
              Prioridad: {filterPriority} <span className="ml-1 text-slate-400">×</span>
            </button>
          )}
          <button 
            onClick={clearFilters}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 ml-2"
          >
            Limpiar todo
          </button>
        </div>
      )}

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
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl p-16 text-center animate-fadeIn shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Funnel className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">No hay resultados</h3>
          <p className="text-sm text-slate-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project, idx) => (
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
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="edge-badge capitalize">
                      {project.typology}
                    </span>
                    {project.priority && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    )}
                  </div>
                  {project.square_meters > 0 && project.annual_consumption_kwh > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                      <p className="text-[11px] font-medium">
                        {(project.annual_consumption_kwh / project.square_meters).toFixed(1)} <span className="text-[9px] text-slate-400">kWh/m²</span>
                      </p>
                    </div>
                  )}
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
