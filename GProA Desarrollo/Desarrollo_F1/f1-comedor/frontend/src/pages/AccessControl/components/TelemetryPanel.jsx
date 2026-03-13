export default function TelemetryPanel({ stats }) {
  const Card = ({ label, value, type }) => {
    let colors = 'text-[#8892B0] border-[#233554] bg-[#0A192F]'
    if (type === 'success') colors = 'text-[#00E676] border-[#00E676]/30 bg-[#00E676]/5'
    if (type === 'error') colors = 'text-[#FF3B30] border-[#FF3B30]/30 bg-[#FF3B30]/5'
    if (type === 'warning') colors = 'text-[#FFD600] border-[#FFD600]/30 bg-[#FFD600]/5'
    if (type === 'neutral') colors = 'text-[#E6EDF3] border-[#233554] bg-[#0A192F]'

    return (
      <div className={`p-4 rounded-xl border-l-[3px] border-y border-r flex flex-col justify-center items-start shadow-sm transition-all ${colors}`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-black font-mono tracking-tighter leading-none">{value.toString().padStart(3, '0')}</p>
      </div>
    )
  }

  return (
    <div className="w-full flex items-center justify-between gap-4 h-full">
      <div className="hidden sm:flex flex-col border-r border-[#233554] pr-4 gap-1 h-full justify-center">
        <h3 className="text-[#E6EDF3] font-black italic uppercase tracking-wider text-xs">TELEMETRY</h3>
        <p className="text-[9px] text-[#8892B0] uppercase tracking-widest font-mono">LIVE DATASTREAM</p>
      </div>
      
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 h-full pb-1">
        <Card label="Total Scans" value={stats.total} type="neutral" />
        <Card label="Authorized" value={stats.granted} type="success" />
        <Card label="Rejected" value={stats.denied} type="error" />
        <Card label="Duplicates" value={stats.duplicates} type="warning" />
      </div>
    </div>
  )
}
