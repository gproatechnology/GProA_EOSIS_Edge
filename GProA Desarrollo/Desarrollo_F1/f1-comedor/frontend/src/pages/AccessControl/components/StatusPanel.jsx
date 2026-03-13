export default function StatusPanel({ systemStatus }) {
  const { camera, scanner, latency } = systemStatus

  const Indicator = ({ label, status }) => {
    let color = 'bg-slate-600'
    let textColor = 'text-slate-400'
    
    if (status === 'ONLINE' || status === 'SCANNING') {
      color = 'bg-[#00E676] shadow-[0_0_10px_#00E676]'
      textColor = 'text-[#00E676]'
    } else if (status === 'IDLE') {
      color = 'bg-[#FFD600] opacity-50'
      textColor = 'text-[#FFD600]'
    } else if (status === 'ERROR' || status === 'OFFLINE') {
      color = 'bg-[#FF3B30] shadow-[0_0_10px_#FF3B30]' 
      textColor = 'text-[#FF3B30]'
    }

    return (
      <div className="flex items-center justify-between border-b border-[#233554] py-2">
        <span className="text-xs font-mono text-[#8892B0] uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black tracking-widest ${textColor}`}>{status}</span>
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h3 className="text-[#E6EDF3] font-black italic uppercase tracking-wider text-sm flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-[#E10600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
          System Diagnostics
        </h3>
        
        <div className="space-y-1">
          <Indicator label="Camera Feed" status={camera} />
          <Indicator label="Scan Engine" status={scanner} />
          
          <div className="flex items-center justify-between border-b border-[#233554] py-2">
            <span className="text-xs font-mono text-[#8892B0] uppercase tracking-widest">Network Latency</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black tracking-widest ${latency < 200 ? 'text-[#00E676]' : latency < 500 ? 'text-[#FFD600]' : 'text-[#FF3B30]'}`}>{latency}ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between bg-[#0A192F] p-2 rounded border border-[#233554]">
        <span className="text-[9px] font-mono text-[#8892B0]">SYSTEM INTEGRITY</span>
        <span className="text-[9px] font-mono text-[#00E676] bg-[#00E676]/10 px-1 rounded border border-[#00E676]/30 animate-pulse">OPTIMAL</span>
      </div>
    </div>
  )
}
