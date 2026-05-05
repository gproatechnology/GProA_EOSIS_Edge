import { useLocation } from "react-router-dom";
import { Folders, House, Lightning, SignOut } from "@phosphor-icons/react";

export default function Sidebar({ projects, onNavigate }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("gproa_session");
    window.location.href = "/";
  };

  console.log("Sidebar Projects Data:", projects);

  return (
    <aside
      className="fixed top-0 left-0 w-[260px] h-screen bg-white/80 backdrop-blur-md border-r border-slate-100 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <Lightning weight="fill" className="text-white w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              EDGE
            </span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 block leading-tight">
              Doc Processor
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 px-3 mb-2">
            Principal
          </p>
          <button
            onClick={() => onNavigate("/")}
            className={`sidebar-link w-full ${isActive("/") ? "active" : ""}`}
            data-testid="nav-dashboard"
          >
            <House weight={isActive("/") ? "fill" : "regular"} className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-6 px-3">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 mb-2">
            Resumen Portafolio
          </p>
          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500">Críticos</span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 rounded">
                {projects.filter(p => p.priority && p.priority.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('crit')).length}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500">Alta Prioridad</span>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 rounded">
                {projects.filter(p => p.priority && p.priority.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('alt')).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Eficiencia Promedio</span>
              <span className="text-[10px] font-bold text-indigo-600">
                {projects.length > 0 ? (projects.reduce((acc, p) => acc + (p.square_meters > 0 ? (p.annual_consumption_kwh || 0) / p.square_meters : 0), 0) / projects.filter(p => p.square_meters > 0).length || 0).toFixed(0) : 0} <span className="text-[8px]">kWh/m²</span>
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400 px-3 mb-2">
            Proyectos
          </p>
          <div className="space-y-0.5">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onNavigate(`/projects/${p.id}`)}
                className={`sidebar-link w-full ${
                  location.pathname === `/projects/${p.id}` ? "active" : ""
                }`}
                data-testid={`nav-project-${p.id}`}
              >
                <Folders
                  weight={location.pathname === `/projects/${p.id}` ? "fill" : "regular"}
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="text-xs text-slate-400 px-4 py-2">Sin proyectos</p>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          EDGE Certification Tool v1.0
        </p>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
          title="Cerrar Sesión"
          data-testid="logout-button"
        >
          <SignOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
