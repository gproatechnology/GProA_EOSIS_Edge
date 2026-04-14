import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import ProjectDashboard from "@/components/ProjectDashboard";
import ProjectDetail from "@/components/ProjectDetail";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export { API };

function AppLayout() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/projects`);
      setProjects(res.data);
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex min-h-screen bg-slate-50" data-testid="app-layout">
      <Sidebar projects={projects} onNavigate={navigate} />
      <main className="flex-1 ml-[260px]">
        <Routes>
          <Route
            path="/"
            element={
              <ProjectDashboard
                projects={projects}
                loading={loading}
                onProjectCreated={fetchProjects}
                onNavigate={navigate}
              />
            }
          />
          <Route
            path="/projects/:projectId"
            element={<ProjectDetailWrapper onProjectDeleted={fetchProjects} />}
          />
        </Routes>
      </main>
    </div>
  );
}

function ProjectDetailWrapper({ onProjectDeleted }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  return (
    <ProjectDetail
      projectId={projectId}
      onProjectDeleted={() => {
        onProjectDeleted();
        navigate("/");
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
