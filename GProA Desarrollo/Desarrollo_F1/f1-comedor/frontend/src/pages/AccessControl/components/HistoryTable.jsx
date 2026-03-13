export default function HistoryTable({ history }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#233554] bg-[#0A192F]/50 flex justify-between items-center shrink-0">
        <h3 className="text-[#E6EDF3] font-black italic uppercase tracking-wider text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-[#E10600]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          History Log
        </h3>
        <span className="text-[9px] font-mono tracking-widest text-[#8892B0] bg-[#233554] px-2 py-0.5 rounded">
          LAST 30 HITS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#050D19] relative">
        {history.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8892B0] opacity-50">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-mono uppercase tracking-widest">NO DATA IN CACHE</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#112240] sticky top-0 z-10 border-b border-[#233554]">
              <tr>
                <th className="py-3 px-4 text-[#8892B0] font-bold uppercase tracking-widest">Time</th>
                <th className="py-3 px-4 text-[#8892B0] font-bold uppercase tracking-widest">Employee</th>
                <th className="py-3 px-4 text-[#8892B0] font-bold uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233554]/50">
              {history.map((record, idx) => {
                let badgeClass = ''
                let label = ''
                if (record.status === 'ACCESS_GRANTED') {
                  badgeClass = 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/50'
                  label = 'AUTH'
                } else if (record.status === 'ACCESS_DENIED') {
                  badgeClass = 'text-[#FF3B30] bg-[#FF3B30]/10 border-[#FF3B30]/50'
                  label = 'DENY'
                } else if (record.status === 'ALREADY_REGISTERED') {
                  badgeClass = 'text-[#FFD600] bg-[#FFD600]/10 border-[#FFD600]/50'
                  label = 'DUPE'
                } else {
                  badgeClass = 'text-slate-400 bg-slate-900 border-slate-700'
                  label = 'NOT_FOUND'
                }

                return (
                  <tr key={idx} className="hover:bg-[#112240] transition-colors group">
                    <td className="py-3 px-4 font-mono text-[#8892B0] group-hover:text-white transition-colors">
                      {record.timestamp.toLocaleTimeString('es-MX', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-[#E6EDF3] font-bold uppercase tracking-wider">
                      {record.employee.first_name} <span className="text-[#8892B0]">{record.employee.last_name || ''}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded border font-black uppercase text-[10px] tracking-widest ${badgeClass}`}>
                        {label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
