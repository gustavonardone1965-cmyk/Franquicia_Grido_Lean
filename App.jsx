import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

// ==========================================
// 1. CONSTANTES Y ESTILOS GLOBALES
// ==========================================
const NAVY = "#0F2027";
const TEAL = "#2C5364";
const ACCENT = "#00C9A7";
const LIGHT_BG = "#F4F7F6";
const WHITE = "#FFFFFF";

const TH = {
  padding: "10px 12px",
  textAlign: "center",
  background: NAVY,
  color: "#FFFFFF",
  fontSize: "12px",
  fontWeight: 700,
  borderBottom: "2px solid #00C9A7"
};

const TD = {
  padding: "8px 12px",
  textAlign: "center",
  fontSize: "12px",
  borderBottom: "1px solid #E0E0E0"
};

const CARD_STYLE = {
  background: WHITE,
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const INITIAL_KPIS = [
  { id: 1, metrica: "Eficiencia de Mano de Obra", actual: "72%", meta: "85%", estado: "En Proceso" },
  { id: 2, metrica: "Reducción de Mermas de Helado", actual: "4.5%", meta: "2.0%", estado: "Atención" },
  { id: 3, metrica: "Disponibilidad de Sabores Estrella", actual: "98%", meta: "100%", estado: "Óptimo" }
];

const INITIAL_PLAN = [
  { semana: "S1-S3", fase: "5S y VSM", objetivo: "Organización física de cámaras y mapeo de flujo", avance: 100 },
  { semana: "S4-S6", fase: "Trabajo Estándar", objetivo: "Estandarización de porciones y balanceo de turnos", avance: 60 },
  { semana: "S7-S9", fase: "Sistema Kanban", objetivo: "Reposición visual en cámara de frío", avance: 20 },
  { semana: "S10-S12", fase: "Gestión Visual", objetivo: "Tableros KPI y reuniones Huddle de 5 min", avance: 0 }
];

const sdsData = [
  { dia: "Lun", actual: 12, objetivo: 5 },
  { dia: "Mar", actual: 10, objetivo: 5 },
  { dia: "Mié", actual: 8, objetivo: 5 },
  { dia: "Jue", actual: 15, objetivo: 5 },
  { dia: "Vie", actual: 22, objetivo: 5 },
  { dia: "Sáb", actual: 30, objetivo: 5 },
  { dia: "Dom", actual: 25, objetivo: 5 }
];

const radarData = [
  { pilar: "5S", puntaje: 85 },
  { pilar: "Estándar", puntaje: 65 },
  { pilar: "Kanban", puntaje: 40 },
  { pilar: "Huddles", puntaje: 50 },
  { pilar: "Seguridad", puntaje: 90 }
];

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================
const Btn = ({ children, onClick, color = NAVY, tiny = false }) => (
  <button
    onClick={onClick}
    style={{
      background: color,
      color: "#FFFFFF",
      border: "none",
      borderRadius: "4px",
      padding: tiny ? "4px 8px" : "8px 16px",
      fontSize: tiny ? "11px" : "13px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s ease"
    }}
  >
    {children}
  </button>
);

const Card = ({ title, children }) => (
  <div style={CARD_STYLE}>
    {title && <h4 style={{ color: NAVY, marginTop: 0 }}>{title}</h4>}
    {children}
  </div>
);

const InfoBar = ({ kpis = [] }) => (
  <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
    {kpis.map((kpi) => (
      <div key={kpi.id} style={{ ...CARD_STYLE, flex: 1, marginBottom: 0, borderLeft: `4px solid ${ACCENT}` }}>
        <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", fontWeight: 700 }}>
          {kpi.metrica}
        </span>
        <div style={{ fontSize: "22px", fontWeight: 800, color: NAVY, marginTop: "4px" }}>
          {kpi.actual}
        </div>
        <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
          Meta: {kpi.meta} | Estado: <strong style={{ color: NAVY }}>{kpi.estado}</strong>
        </div>
      </div>
    ))}
  </div>
);

// ==========================================
// 3. GRÁFICOS
// ==========================================
const ChartSDS = () => (
  <Card title="Desvío de Porcionamiento por Día (Mermas g/bocha)">
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sdsData}>
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="actual" fill="#FF6B6B" name="Desvío Actual (g)" />
        <Bar dataKey="objetivo" fill={ACCENT} name="Tolerancia Máx. (g)" />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

const ChartLineal = () => (
  <Card title="Evolución Semanal de Eficiencia Laboral (%)">
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={sdsData}>
        <XAxis dataKey="dia" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line type="monotone" dataKey="actual" stroke={NAVY} strokeWidth={3} name="Eficiencia %" />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const RadarGlobal = () => (
  <Card title="Madurez Lean de la Franquicia">
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="pilar" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Franquicia" dataKey="puntaje" stroke={ACCENT} fill={ACCENT} fillOpacity={0.5} />
      </RadarChart>
    </ResponsiveContainer>
  </Card>
);

// ==========================================
// 4. TABLAS Y HITOS
// ==========================================
const TablaKPIs = ({ kpis = [] }) => (
  <Card title="Panel General de Métricas">
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={TH}>Métrica</th>
          <th style={TH}>Valor Actual</th>
          <th style={TH}>Meta</th>
          <th style={TH}>Estado</th>
        </tr>
      </thead>
      <tbody>
        {kpis.map((row) => (
          <tr key={row.id}>
            <td style={TD}>{row.metrica}</td>
            <td style={{ ...TD, fontWeight: 700 }}>{row.actual}</td>
            <td style={TD}>{row.meta}</td>
            <td style={TD}>
              <span style={{ padding: "2px 8px", borderRadius: "10px", background: row.estado === "Óptimo" ? "#E8F8F5" : "#FEF9E7", fontSize: "11px", fontWeight: 700 }}>
                {row.estado}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const MMMTable = () => (
  <Card title="Registro de Mermas y Movimientos de Stock">
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={TH}>Sabor</th>
          <th style={TH}>Consumo (Kg)</th>
          <th style={TH}>Merma Registrada (%)</th>
          <th style={TH}>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={TD}>Dulce de Leche Granizado</td>
          <td style={TD}>120 kg</td>
          <td style={TD}>1.8%</td>
          <td style={TD}><Btn tiny color={NAVY}>Detalle</Btn></td>
        </tr>
        <tr>
          <td style={TD}>Tramontana</td>
          <td style={TD}>95 kg</td>
          <td style={TD}>3.2%</td>
          <td style={TD}><Btn tiny color={NAVY}>Detalle</Btn></td>
        </tr>
      </tbody>
    </table>
  </Card>
);

const PlanTable = ({ plan = [] }) => (
  <Card title="Plan Maestro de Implementación (12 Semanas)">
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={TH}>Semanas</th>
          <th style={TH}>Fase</th>
          <th style={TH}>Objetivo Principal</th>
          <th style={TH}>Avance</th>
        </tr>
      </thead>
      <tbody>
        {plan.map((item, idx) => (
          <tr key={idx}>
            <td style={{ ...TD, fontWeight: 700 }}>{item.semana}</td>
            <td style={TD}>{item.fase}</td>
            <td style={{ ...TD, textAlign: "left" }}>{item.objetivo}</td>
            <td style={TD}>
              <div style={{ background: "#E0E0E0", borderRadius: "4px", overflow: "hidden", height: "12px", width: "100px", margin: "0 auto" }}>
                <div style={{ background: ACCENT, width: `${item.avance}%`, height: "100%" }} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

const Milestones = () => {
  const hitos = [
    { titulo: "Caminata Gemba inicial completada", fecha: "Semana 1", ok: true },
    { titulo: "Estandarización 5S en cámara frigorífica", fecha: "Semana 3", ok: true },
    { titulo: "Despliegue del Tarjetero Kanban", fecha: "Semana 6", ok: false },
    { titulo: "Evaluación del ROI del piloto", fecha: "Semana 12", ok: false }
  ];

  return (
    <Card title="Hitos del Proyecto">
      <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {hitos.map((h, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: "10px", fontSize: "13px" }}>
            <span style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: h.ok ? ACCENT : "#CCC",
              color: "#FFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
              fontSize: "10px",
              fontWeight: 700
            }}>
              {h.ok ? "✓" : "•"}
            </span>
            <strong style={{ minWidth: "90px", color: NAVY }}>{h.fecha}:</strong>
            <span>{h.titulo}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

// ==========================================
// 5. COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [kpis] = useState(INITIAL_KPIS);
  const [plan] = useState(INITIAL_PLAN);

  return (
    <div style={{ background: LIGHT_BG, minHeight: "100vh", fontFamily: "Segoe UI, sans-serif", color: "#333" }}>
      {/* CABECERA */}
      <header style={{ background: NAVY, color: "#FFF", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Piloto Lean Management — Heladerías Grido</h2>
          <span style={{ fontSize: "12px", opacity: 0.8 }}>Consultoría de Operaciones y Eficiencia en Franquicias</span>
        </div>
        <Btn onClick={() => alert("Reporte exportado correctamente.")} color={TEAL}>
          Exportar Reporte PDF
        </Btn>
      </header>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div style={{ background: TEAL, padding: "0 24px", display: "flex", gap: "8px" }}>
        {["dashboard", "mermas", "planificacion"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? LIGHT_BG : "transparent",
              color: tab === t ? NAVY : "#FFF",
              border: "none",
              padding: "10px 18px",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
              textTransform: "capitalize",
              fontSize: "13px"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* CUERPO PRINCIPAL */}
      <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <InfoBar kpis={kpis} />

        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <ChartSDS />
              <ChartLineal />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <TablaKPIs kpis={kpis} />
              <RadarGlobal />
            </div>
            <Milestones />
          </div>
        )}

        {tab === "mermas" && (
          <div>
            <MMMTable />
            <ChartSDS />
          </div>
        )}

        {tab === "planificacion" && (
          <div>
            <PlanTable plan={plan} />
            <Card title="Marco de Referencia — Complejidad y Tangibilidad del Servicio">
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <img 
                  src="https://via.placeholder.com/800x300?text=Marco+de+Referencia+Lean+Grido" 
                  alt="Marco de Referencia" 
                  style={{ maxWidth: "100%", borderRadius: "4px" }} 
                />
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
