import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const META_DEFAULT = {
  sdsMin: -3,
  sdsMax: 5,
  eficienciaMin: 22,
  ticketDeltaPct: 10,
  mermaMaxPct: 2,
  quiebresMax: 1
};

export default function DashboardGridoResponsive() {
  const [franquiciaSeleccionada, setFranquiciaSeleccionada] = useState('Belgrano');
  const [vistaMovilActiva, setVistaMovilActiva] = useState('kpis');

  const datosSemanales = [
    { semana: 'S0', sds: 2, eficiencia: 20, ticket: 1500 },
    { semana: 'S1', sds: 4, eficiencia: 23, ticket: 1620 },
    { semana: 'S2', sds: -1, eficiencia: 25, ticket: 1700 },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-3 md:p-6 text-gray-800 font-sans">
      
      {/* Encabezado Adaptativo */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-900">GRIDO · PILOTO LEAN</h1>
          <p className="text-xs md:text-sm text-gray-500">Panel de Control de Franquicias</p>
        </div>
        
        <select 
          value={franquiciaSeleccionada}
          onChange={(e) => setFranquiciaSeleccionada(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border rounded-md bg-white text-sm font-medium border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Belgrano">Franquicia Belgrano</option>
          <option value="Villa Allende">Franquicia Villa Allende</option>
          <option value="Alta Córdoba">Franquicia Alta Córdoba</option>
        </select>
      </header>

      {/* Navegación para Pantallas Móviles */}
      <div className="flex lg:hidden mb-4 border-b border-gray-200 bg-white rounded-t-lg">
        <button 
          onClick={() => setVistaMovilActiva('kpis')}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 ${vistaMovilActiva === 'kpis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          KPIs
        </button>
        <button 
          onClick={() => setVistaMovilActiva('graficos')}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 ${vistaMovilActiva === 'graficos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          GRÁFICOS
        </button>
        <button 
          onClick={() => setVistaMovilActiva('ishikawa')}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 ${vistaMovilActiva === 'ishikawa' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          DIAGNÓSTICO
        </button>
      </div>

      {/* Grid de KPIs - Tarjetas Flexibles */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${vistaMovilActiva !== 'kpis' ? 'hidden lg:grid' : ''}`}>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-600">
          <span className="text-xs font-semibold text-gray-400 uppercase">Eficiencia Operativa</span>
          <div className="text-2xl font-bold text-gray-800 mt-1">23.5 <span className="text-xs font-normal text-gray-500">porc/h</span></div>
          <span className="text-xs text-green-600 font-semibold">Meta: &gt; {META_DEFAULT.eficienciaMin} porc/h</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <span className="text-xs font-semibold text-gray-400 uppercase">SDS (Señal Desvío)</span>
          <div className="text-2xl font-bold text-gray-800 mt-1">+2.0</div>
          <span className="text-xs text-gray-500">Rango: {META_DEFAULT.sdsMin} a {META_DEFAULT.sdsMax}</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <span className="text-xs font-semibold text-gray-400 uppercase">Ticket Medio</span>
          <div className="text-2xl font-bold text-gray-800 mt-1">$1.620</div>
          <span className="text-xs text-green-600 font-semibold">+8% vs Obj.</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <span className="text-xs font-semibold text-gray-400 uppercase">Merma Acumulada</span>
          <div className="text-2xl font-bold text-gray-800 mt-1">1.4%</div>
          <span className="text-xs text-gray-500">Max: {META_DEFAULT.mermaMaxPct}%</span>
        </div>
      </div>

      {/* Gráficos Adaptativos */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 ${vistaMovilActiva !== 'graficos' ? 'hidden lg:grid' : ''}`}>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Evolución Eficiencia vs Meta</h3>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosSemanales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="eficiencia" name="Eficiencia (porc/h)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Comportamiento SDS por Semana</h3>
          <div className="w-full h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosSemanales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="sds" name="SDS" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla con Scroll Horizontal para Móviles */}
      <div className={`bg-white p-4 rounded-lg shadow-sm ${vistaMovilActiva !== 'ishikawa' ? 'hidden lg:block' : ''}`}>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Plan de Acción y Métodos Lean</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <th className="p-3">Herramienta</th>
                <th className="p-3">Estado Adopción</th>
                <th className="p-3">Acción Corrección</th>
                <th className="p-3">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              <tr>
                <td className="p-3 font-medium text-gray-800">5S (Estandarización)</td>
                <td className="p-3"><span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-semibold">85%</span></td>
                <td className="p-3 text-gray-600">Auditoría semanal de puestos.</td>
                <td className="p-3 text-gray-600">Encargado Belgrano</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-800">Kanban Reposición</td>
                <td className="p-3"><span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-semibold">60%</span></td>
                <td className="p-3 text-gray-600">Ajuste de stock mínimo en mostrador.</td>
                <td className="p-3 text-gray-600">Líder Turno</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2 block lg:hidden">* Deslice horizontalmente para evaluar la tabla completa.</p>
      </div>

    </div>
  );
}
