export default function ResultPanel({ result }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center text-[#8892B0] h-full animate-pulse transition-opacity">
        <svg className="w-24 h-24 mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-mono text-sm uppercase tracking-widest text-[#233554]">A T T E N D I N G &nbsp; I N P U T . . .</p>
      </div>
    )
  }

  const { status, employee, message } = result

  let statusConfig = { color: 'text-gray-500', bg: 'bg-gray-900', border: 'border-gray-500', glow: 'shadow-none', icon: '' }

  switch (status) {
    case 'ACCESS_GRANTED':
      statusConfig = { color: 'text-[#00E676]', bg: 'bg-[#00E676]/10', border: 'border-[#00E676]', glow: 'shadow-[0_0_40px_rgba(0,230,118,0.2)]', icon: 'M5 13l4 4L19 7' }
      break
    case 'ACCESS_DENIED':
      statusConfig = { color: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]/10', border: 'border-[#FF3B30]', glow: 'shadow-[0_0_40px_rgba(255,59,48,0.2)]', icon: 'M6 18L18 6M6 6l12 12' }
      break
    case 'ALREADY_REGISTERED':
      statusConfig = { color: 'text-[#FFD600]', bg: 'bg-[#FFD600]/10', border: 'border-[#FFD600]', glow: 'shadow-[0_0_40px_rgba(255,214,0,0.2)]', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
      break
    case 'EMPLOYEE_NOT_FOUND':
      statusConfig = { color: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]/10', border: 'border-[#FF3B30]', glow: 'shadow-[0_0_40px_rgba(255,59,48,0.2)]', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' }
      break
  }

  return (
    <div className={`w-full max-w-3xl mx-auto rounded-3xl border-2 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.glow} p-8 flex flex-col md:flex-row items-center gap-8 animate-[fade-in-up_0.2s_ease-out] relative z-10 backdrop-blur-sm transition-all`}>
      {/* Icon Area */}
      <div className={`w-32 h-32 rounded-full border-4 ${statusConfig.border} flex items-center justify-center shrink-0`}>
        <svg className={`w-16 h-16 ${statusConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d={statusConfig.icon} />
        </svg>
      </div>

      {/* Info Area */}
      <div className="flex-1 text-center md:text-left flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-wider text-[#E6EDF3] mb-2 leading-tight">
          {employee.first_name} <span className="text-white bg-[#0A192F] px-2 border-l-4 border-[#E10600] inline-block">{employee.last_name}</span>
        </h2>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
          <span className="font-mono text-xl font-bold tracking-widest text-[#8892B0] bg-[#0A192F] px-3 py-1 rounded border border-[#233554]">
            ID: {employee.employee_number || 'UNKNOWN'}
          </span>
          <span className="font-bold text-xs uppercase tracking-widest text-[#E10600] bg-[#E10600]/10 px-2 py-1 rounded border border-[#E10600]/30">
            {employee.company?.name || 'UNKNOWN CORPS'}
          </span>
        </div>

        <div className={`inline-flex items-center justify-center md:justify-start px-6 py-3 rounded-xl border ${statusConfig.border} ${statusConfig.bg}`}>
          <p className={`font-black uppercase tracking-widest text-lg ${statusConfig.color}`}>
            {message}
          </p>
        </div>
      </div>
      
      {/* Decorative lines */}
      <div className="absolute top-6 right-6 flex flex-col gap-1 opacity-50">
        <div className="w-8 h-1 bg-[#233554]"></div>
        <div className="w-12 h-1 bg-[#233554]"></div>
        <div className="w-4 h-1 bg-[#E10600]"></div>
      </div>
    </div>
  )
}
