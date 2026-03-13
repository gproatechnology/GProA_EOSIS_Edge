import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useAccessControl } from '@/pages/AccessControl/hooks/useAccessControl'

// Areas
import ScannerPanel from '@/pages/AccessControl/components/ScannerPanel'
import ResultPanel from '@/pages/AccessControl/components/ResultPanel'
import TelemetryPanel from '@/pages/AccessControl/components/TelemetryPanel'
import HistoryTable from '@/pages/AccessControl/components/HistoryTable'
import StatusPanel from '@/pages/AccessControl/components/StatusPanel'

export default function AccessControl() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const {
    isScanning,
    setIsScanning,
    isFullscreen,
    toggleFullscreen,
    stats,
    history,
    currentResult,
    systemStatus,
    setSystemStatus,
    handleScan
  } = useAccessControl()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0A192F] text-[#E6EDF3] font-sans selection:bg-[#E10600] selection:text-white flex flex-col overflow-hidden">
      
      {/* Top HUD Header */}
      <header className="flex-none bg-[#112240] border-b-2 border-[#E10600] p-4 flex justify-between items-center shadow-[0_4px_20px_rgba(225,6,0,0.15)] z-10">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-[#0A192F] hover:bg-[#1A365D] text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs border border-[#233554]"
          >
            <svg className="w-4 h-4 text-[#E10600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Pit Wall (Dashboard)</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#E10600] to-red-900 rounded flex justify-center items-center shadow-inner">
              <span className="font-black italic text-white text-lg">F1</span>
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-widest leading-none">Access Control</h1>
              <p className="text-[10px] font-bold text-[#E10600] uppercase tracking-widest mt-0.5">Automated Gate System v2.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#233554] hover:bg-[#30456B] rounded text-xs font-bold uppercase tracking-wider transition-colors border border-[#112240]"
          >
            {isFullscreen ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> Exit</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l-5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> Fullscreen</>
            )}
          </button>
          
          <div className="text-right border-l border-[#233554] pl-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">{user?.username || 'GUEST'}</p>
            <p className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest">{user?.role || 'OPERATOR'}</p>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 grid-rows-1 lg:grid-rows-6 gap-4 overflow-hidden">
        
        {/* Left Column: Scanner (Area 1) & Status (Area 5) */}
        <div className="lg:col-span-4 lg:row-span-6 flex flex-col gap-4">
          <div className="flex-1 bg-[#112240] rounded-xl border border-[#233554] flex flex-col shadow-lg overflow-hidden relative group">
            <ScannerPanel 
              isScanning={isScanning} 
              setIsScanning={setIsScanning} 
              onScan={handleScan} 
              setSystemStatus={setSystemStatus}
            />
          </div>
          
          <div className="h-48 bg-[#112240] rounded-xl border border-[#233554] p-4 shadow-lg shrink-0">
            <StatusPanel systemStatus={systemStatus} />
          </div>
        </div>

        {/* Middle Column: Result (Area 2) & Telemetry (Area 3) */}
        <div className="lg:col-span-5 lg:row-span-6 flex flex-col gap-4">
          <div className="h-32 shrink-0 bg-[#112240] rounded-xl border border-[#233554] p-4 shadow-lg flex items-center">
            <TelemetryPanel stats={stats} />
          </div>
          
          <div className="flex-1 bg-[#112240] rounded-xl border border-[#233554] p-6 shadow-lg relative overflow-hidden flex flex-col justify-center">
            {/* Animated Grid Background for Result Area */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(35,53,84,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(35,53,84,0.3)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>
            
            <ResultPanel result={currentResult} />
          </div>
        </div>

        {/* Right Column: History (Area 4) */}
        <div className="lg:col-span-3 lg:row-span-6 bg-[#112240] rounded-xl border border-[#233554] shadow-lg flex flex-col overflow-hidden">
          <HistoryTable history={history} />
        </div>

      </main>
    </div>
  )
}
