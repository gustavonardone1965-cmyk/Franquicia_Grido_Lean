import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell
} from "recharts";

// ── PALETA ─────────────────────────────────────────────────────────────────
const NAVY="#1A2C42", MID="#2E4A6B", GRN="#1A5C2A", YEL="#D4920A";
const RED="#C0392B", AMB="#B8860B", PUR="#6A1B9A";
const FC_COLORS=["#1A2C42","#1A5C2A","#8B1A1A"];
const FC_LIGHT=["#E8EEF5","#E8F5E9","#FFF0F0"];

// ── METAS DEFAULT ──────────────────────────────────────────────────────────
const META_DEFAULT={ sds_min:-3, sds_max:5, ef_op:22, cmv:3, ticket_delta:10, merma:2, quiebres:1 };

// ── SEMANAS ────────────────────────────────────────────────────────────────
const SEMANAS=Array.from({length:13},(_,i)=>i);
const semLabel=s=>s===0?"K":`S${s}`;

// ── FRANQUICIA VACÍA ───────────────────────────────────────────────────────
const emptyFc=(nombre,color,colorLight)=>({
  nombre, color, colorLight, activa:true,
  datos:{},   
  acciones:[] 
});

// ── ESTADO INICIAL LIMPIO ──────────────────────────────────────────────────
const INITIAL_STATE=[
  emptyFc("Franquicia 1",FC_COLORS[0],FC_LIGHT[0]),
  emptyFc("Franquicia 2",FC_COLORS[1],FC_LIGHT[1]),
  emptyFc("Franquicia 3",FC_COLORS[2],FC_LIGHT[2]),
];

// ── HELPERS ────────────────────────────────────────────────────────────────
const fmt1=v=>(v==null||isNaN(v))?"—":Number(v).toFixed(1);
const fmt0=v=>(v==null||isNaN(v))?"—":Math.round(v);
const nv=v=>{ const n=parseFloat(v); return isNaN(n)?null:n; };

function sdsCol(v,meta){
  if(v==null||isNaN(v)) return"#aaa";
  if(v<meta.sds_min-3) return RED;
  if(v<meta.sds_min)   return YEL;
  if(v<=meta.sds_max)  return GRN;
  return"#2196F3";
}
function kpiCol(v,meta,lower){
  if(v==null||isNaN(v)) return"#aaa";
  if(lower) return v<=meta?GRN:v<=meta*1.6?YEL:RED;
  return v>=meta?GRN:v>=meta*0.85?YEL:RED;
}

// ── COMPONENTE BTN ─────────────────────────────────────────────────────────
const Btn = ({ children, color = NAVY, tiny, ...props }) => (
  <button style={{
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: tiny ? "3px 8px" : "6px 14px",
    fontSize: tiny ? 10 : 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
    ...props.style
  }} {...props}>
    {children}
  </button>
);

// ── VALUE BOX ──────────────────────────────────────────────────────────────
const VBox=({label,value,unit,color,sub})=>(
  <div style={{background:"#fff",border:"1px solid #e0e0e0",
    borderTop:`3px solid ${color}`,borderRadius:6,padding:"10px 14px"}}>
    <div style={{fontSize:9,color:"#888",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{label}</div>
    <div style={{fontSize:22,fontWeight:800,color,letterSpacing:-0.5}}>
      {value}<span style={{fontSize:11,fontWeight:400,color:"#999",marginLeft:2}}>{unit}</span>
    </div>
    {sub&&<div style={{fontSize:9,color:"#aaa",marginTop:1}}>{sub}</div>}
  </div>
);

// ── CARD ───────────────────────────────────────────────────────────────────
const Card=({title,color=NAVY,children,pad=true})=>(
  <div style={{background:"#fff",borderRadius:6,borderTop:`3px solid ${color}`,
    boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
    <div style={{padding:"9px 14px 6px",fontWeight:700,fontSize:12,
      color,borderBottom:"1px solid #f0f0f0"}}>{title}</div>
    <div style={{padding:pad?"12px 10px 10px":0}}>{children}</div>
  </div>
);

// ── INPUT ──────────────────────────────────────────────────────────────────
const IS={border:"1px solid #ccc",borderRadius:4,padding:"5px 8px",fontSize:12,width:"100%",boxSizing:"border-box"};
const Inp=({label,note,...props})=>(
  <div style={{marginBottom:8}}>
    {label&&<label style={{fontSize:10,color:"#555",display:"block",marginBottom:3}}>
      {label}{note&&<span style={{color:"#aaa",marginLeft:5}}>{note}</span>}
    </label>}
    <input style={IS} {...props}/>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────
export default function App(){
  const [fcs,setFcs]=useState(INITIAL_STATE);
  const [semana,setSemana]=useState(0);
  const [tab,setTab]=useState("resumen");
  const [fcIdx,setFcIdx]=useState(0);
  const [meta,setMeta]=useState({...META_DEFAULT});
  const [toast,setToast]=useState(null);
  const FORM_EMPTY={semana:"0",sds:"",ef_op:"",cmv:"",ticket:"",merma:"",
    quiebres:"",mo:"",kaizen:"",s1:"",s2:"",s3:"",s4:"",s5:"",kanban:"",venta_sug:""};
  const [form,setForm]=useState({...FORM_EMPTY});
  const [lastSaved,setLastSaved]=useState(null);
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);

  const STORAGE_KEY="grido_piloto_v4";

  useEffect(()=>{
    const load=async()=>{
      try{
        const result=await window.storage.get(STORAGE_KEY);
        if(result && result.value){
          const snap=JSON.parse(result.value);
          if(snap.fcs) setFcs(snap.fcs);
          if(snap.meta) setMeta(snap.meta);
          if(snap.semana!=null) setSemana(snap.semana);
          setLastSaved(fmtDate(new Date(snap.ts)));
        }
      }catch(e){
        // Usar estado inicial si falla
      }finally{
        setLoading(false);
      }
    };
    load();
  },[]);

  const fmtDate=(d)=>
    d.toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric"})+
    " "+d.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  const handleGuardarTodo=async()=>{
    setSaving(true);
    try{
      const ts=new Date();
      const snapshot={ version:4, ts:ts.toISOString(), fcs, meta, semana };
      await window.storage.set(STORAGE_KEY, JSON.stringify(snapshot));
      setLastSaved(fmtDate(ts));
      showToast("💾 Guardado correctamente");
    }catch(e){
      showToast("Error al guardar: "+e.message,false);
    }finally{
      setSaving(false);
    }
  };

  const showToast=(txt,ok=true)=>{
    setToast({txt,ok});
    setTimeout(()=>setToast(null),3000);
  };

  const fc=fcs[fcIdx];
  const getRows=useCallback((f,upTo)=>SEMANAS.filter(s=>s<=upTo&&f.datos[s]!=null).map(s=>({semana:s,...f.datos[s]})),[]);
  const getCurrent=useCallback((f,upTo)=>{let cur=null; for(let s=0;s<=upTo;s++) if(f.datos[s]!=null) cur=f.datos[s]; return cur;},[]);

  const rows=useMemo(()=>getRows(fc,semana),[fc,semana,getRows]);
  const cur=useMemo(()=>getCurrent(fc,semana),[fc,semana,getCurrent]);

  if(loading){
    return <div style={{padding:40,textAlign:"center",fontFamily:"Arial"}}>Cargando tablero de gestión...</div>;
  }

  return(
    <div style={{minHeight:"100vh",background:"#F4F6F9",fontFamily:"Arial,sans-serif",fontSize:13}}>
      {/* BARRA SUPERIOR */}
      <div style={{background:NAVY,color:"#fff",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:15}}>GRIDO · Piloto Lean en Franquicias</div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#cbd5e1"}}>{lastSaved ? `Guardado: ${lastSaved}` : "Sin guardar"}</span>
          <Btn color={GRN} onClick={handleGuardarTodo} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Btn>
        </div>
      </div>

      {/* MENÚ DE TABS */}
      <div style={{background:"#fff",borderBottom:"1px solid #ddd",display:"flex",padding:"0 20px",gap:15}}>
        {[
          {id:"resumen",label:"📊 Resumen Ejecutivo"},
          {id:"franquicias",label:"🏪 Detalle Franquicia"},
          {id:"edicion",label:"✏️ Carga de Datos"},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:"none",border:"none",padding:"12px 16px",fontWeight:700,
            cursor:"pointer",color:tab===t.id?NAVY:"#666",
            borderBottom:tab===t.id?`3px solid ${NAVY}`:"3px solid transparent"
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{padding:20}}>
        {toast && (
          <div style={{background:toast.ok?"#d4edda":"#f8d7da",color:toast.ok?"#155724":"#721c24",padding:10,borderRadius:4,marginBottom:15}}>
            {toast.txt}
          </div>
        )}

        {tab==="resumen" && (
          <div>
            <h2 style={{color:NAVY,fontSize:18,marginBottom:15}}>Panel de Control General</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:15}}>
              <VBox label="Franquicias Activas" value={fcs.filter(f=>f.activa).length} unit="un." color={NAVY}/>
              <VBox label="Semana Actual" value={`S${semana}`} unit="" color={MID}/>
              <VBox label="Meta SDS Máx" value={meta.sds_max} unit="%" color={GRN}/>
            </div>
          </div>
        )}

        {tab==="franquicias" && (
          <div>
            <div style={{display:"flex",gap:10,marginBottom:15}}>
              {fcs.map((f,idx)=>(
                <Btn key={f.nombre} color={fcIdx===idx?NAVY:"#94a3b8"} onClick={()=>setFcIdx(idx)}>
                  {f.nombre}
                </Btn>
              ))}
            </div>
            <Card title={`Detalle de Rendimiento: ${fc.nombre}`}>
              <p>Seleccione la semana de análisis o cargue datos desde la solapa de Carga de Datos.</p>
            </Card>
          </div>
        )}

        {tab==="edicion" && (
          <Card title="Carga de Datos Semanales">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:15}}>
              <Inp label="Semana (0 a 12)" type="number" value={form.semana} onChange={e=>setForm({...form,semana:e.target.value})}/>
              <Inp label="SDS (%)" type="number" value={form.sds} onChange={e=>setForm({...form,sds:e.target.value})}/>
            </div>
            <Btn color={GRN} onClick={()=>{
              const s=parseInt(form.semana);
              if(isNaN(s)||s<0||s>12){ showToast("Semana inválida",false); return; }
              setFcs(prev=>{
                const next=[...prev];
                next[fcIdx]={...next[fcIdx],datos:{...next[fcIdx].datos,[s]:{sds:nv(form.sds)}}};
                return next;
              });
              showToast("Datos actualizados correctamente");
            }}>Guardar Semana</Btn>
          </Card>
        )}
      </div>
    </div>
  );
}
