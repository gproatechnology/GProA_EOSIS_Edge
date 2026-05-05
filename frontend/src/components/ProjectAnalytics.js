import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function ProjectAnalytics({ projects }) {
  // Filtrar proyectos que tienen datos suficientes para calcular el ratio
  const data = projects
    .filter(p => p.square_meters > 0 && p.annual_consumption_kwh > 0)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      ratio: parseFloat((p.annual_consumption_kwh / p.square_meters).toFixed(1)),
      priority: p.priority || 'Baja',
      fullName: p.name
    }))
    .sort((a, b) => b.ratio - a.ratio); // Ordenar de mayor a menor consumo

  if (data.length === 0) return null;

  const getBarColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'crítica':
      case 'critica': return '#ef4444';
      case 'alta': return '#f97316';
      case 'media': return '#3b82f6';
      default: return '#10b981';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl p-6 mb-8 animate-fadeIn shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Análisis de Intensidad Energética
          </h2>
          <p className="text-xs text-slate-500 mt-1">Comparativa de consumo por metro cuadrado (kWh/m²)</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Crítica</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Eficiente</span>
          </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl">
                      <p className="text-xs font-bold text-slate-900 mb-1">{payload[0].payload.fullName}</p>
                      <p className="text-sm font-mono text-indigo-600 font-bold">
                        {payload[0].value} <span className="text-[10px] text-slate-400">kWh/m²</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Prioridad: {payload[0].payload.priority}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="ratio" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.priority)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
