// App.jsx (colocar en la raíz tal como lo nombraste)
// Este archivo usa React 18 UMD y Babel en el navegador (solo para desarrollo).
const { useState, useEffect } = React;

function Header() {
  return (
    <header style={styles.header}>
      <img src="/grido_lean.png" alt="Grido Lean" style={styles.logo} />
      <div>
        <h1 style={styles.title}>Grido · Piloto Lean en Franquicias</h1>
        <p style={styles.subtitle}>Panel de control y métricas básicas</p>
      </div>
    </header>
  );
}

function CounterCard() {
  const [count, setCount] = useState(0);
  return (
    <div style={styles.card}>
      <h3>Contador de pruebas</h3>
      <p>Usa este botón para verificar interactividad y renderizado.</p>
      <button onClick={() => setCount(c => c + 1)} style={styles.button}>
        Clicks: {count}
      </button>
    </div>
  );
}

function MetricsCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simula carga de datos (reemplaza por fetch real si tienes API)
    const t = setTimeout(() => {
      setData({
        ventasHoy: 12,
        tickets: 34,
        promedio: 8.5
      });
    }, 600);
    return () => clearTimeout(t);
  }, []);

  if (!data) {
    return <div style={styles.card}><em>Cargando métricas...</em></div>;
  }

  return (
    <div style={styles.card}>
      <h3>Métricas rápidas</h3>
      <ul>
        <li><strong>Ventas hoy:</strong> {data.ventasHoy}</li>
        <li><strong>Tickets:</strong> {data.tickets}</li>
        <li><strong>Ticket promedio:</strong> ${data.promedio}</li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        <div style={styles.grid}>
          <CounterCard />
          <MetricsCard />
        </div>
        <footer style={styles.footer}>
          <small>Desarrollado para prueba PWA · Grido Lean</small>
        </footer>
      </main>
    </div>
  );
}

// Estilos en línea simples para evitar dependencias
const styles = {
  app: { fontFamily: 'Arial, sans-serif', color: '#1A2C42' },
  header: { display: 'flex', alignItems: 'center', gap: 16, padding: 20, borderBottom: '1px solid #eee' },
  logo: { width: 64, height: 64, objectFit: 'contain' },
  title: { margin: 0, fontSize: 20 },
  subtitle: { margin: 0, color: '#666' },
  main: { padding: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 },
  card: { padding: 16, border: '1px solid #eee', borderRadius: 8, background: '#fff' },
  button: { padding: '8px 12px', background: '#1A2C42', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  footer: { marginTop: 20, textAlign: 'center', color: '#888' }
};

// Montaje seguro
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(React.createElement(App));
} else {
  console.error('No se encontró #root. Asegúrate de que index.html tenga <div id="root">');
}
