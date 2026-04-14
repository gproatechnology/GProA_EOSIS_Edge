import { useLocation } from "react-router-dom";
import { Folders, House, Lightning } from "@phosphor-icons/react";

export default function Sidebar({ projects, onNavigate }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className="fixed top-0 left-0 w-[260px] h-screen bg-white border-r border-slate-200 flex flex-col z-30"
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
            <Lightning weight="fill" className="text-white w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
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
      <div className="px-5 py-4 border-t border-slate-200">
        <p className="text-[10px] text-slate-400">
          EDGE Certification Tool v1.0
        </p>
      </div>
    </aside>
  );
}
