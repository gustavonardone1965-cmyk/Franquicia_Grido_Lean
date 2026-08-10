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

// ── DATOS DEMO ─────────────────────────────────────────────────────────────
const DEMO_STATE=()=>[
  {
    ...emptyFc("F1 · Belgrano",FC_COLORS[0],FC_LIGHT[0]),
    datos:{
      0:{sds:-6.8,ef_op:16.2,cmv:6.2,ticket:100,merma:5.1,quiebres:4,mo:100,kaizen:0,s1:15,s2:10,s3:20,s4:5,s5:0,kanban:0,venta_sug:0},
      1:{sds:-5.9,ef_op:16.8,cmv:5.8,ticket:101,merma:4.7,quiebres:3,mo:99,kaizen:25,s1:30,s2:25,s3:35,s4:15,s5:5,kanban:15,venta_sug:20},
      2:{sds:-5.0,ef_op:17.5,cmv:5.3,ticket:103,merma:4.2,quiebres:3,mo:98,kaizen:40,s1:45,s2:40,s3:50,s4:25,s5:10,kanban:30,venta_sug:35},
      3:{sds:-4.1,ef_op:18.1,cmv:4.9,ticket:104,merma:3.8,quiebres:2,mo:98,kaizen:55,s1:55,s2:55,s3:60,s4:35,s5:20,kanban:45,venta_sug:50},
      4:{sds:-3.2,ef_op:18.9,cmv:4.5,ticket:105,merma:3.4,quiebres:2,mo:97,kaizen:65,s1:65,s2:65,s3:70,s4:45,s5:30,kanban:55,venta_sug:60},
      5:{sds:-2.5,ef_op:19.6,cmv:4.0,ticket:107,merma:3.0,quiebres:2,mo:96,kaizen:72,s1:72,s2:70,s3:75,s4:55,s5:40,kanban:65,venta_sug:68},
      6:{sds:-1.8,ef_op:20.2,cmv:3.7,ticket:108,merma:2.7,quiebres:1,mo:96,kaizen:78,s1:78,s2:75,s3:80,s4:62,s5:50,kanban:72,venta_sug:75},
    },
    acciones:[
      {id:1,semana:1,accion:"5S en área de almacén completada",impacto:"Búsqueda de insumos -8 min/turno"},
      {id:2,semana:2,accion:"Tablero Kanban para helados premium",impacto:"Quiebres reducidos 25%"},
      {id:3,semana:3,accion:"Script venta sugerida en caja",impacto:"Ticket medio +3%"},
    ]
  },
  {
    ...emptyFc("F2 · Villa Allende",FC_COLORS[1],FC_LIGHT[1]),
    datos:{
      0:{sds:-4.2,ef_op:17.5,cmv:5.0,ticket:100,merma:4.3,quiebres:3,mo:100,kaizen:0,s1:20,s2:15,s3:25,s4:10,s5:5,kanban:10,venta_sug:5},
      1:{sds:-3.8,ef_op:18.0,cmv:4.8,ticket:101,merma:4.0,quiebres:3,mo:99,kaizen:30,s1:35,s2:30,s3:40,s4:20,s5:10,kanban:20,venta_sug:25},
      2:{sds:-3.1,ef_op:18.6,cmv:4.4,ticket:102,merma:3.6,quiebres:2,mo:99,kaizen:48,s1:50,s2:48,s3:55,s4:30,s5:15,kanban:35,venta_sug:40},
      3:{sds:-2.5,ef_op:19.1,cmv:4.0,ticket:104,merma:3.2,quiebres:2,mo:98,kaizen:60,s1:60,s2:58,s3:65,s4:42,s5:25,kanban:50,venta_sug:55},
    },
    acciones:[]
  },
  {
    ...emptyFc("F3 · Alta Córdoba",FC_COLORS[2],FC_LIGHT[2]),
    datos:{
      0:{sds:-8.1,ef_op:14.5,cmv:7.5,ticket:100,merma:6.2,quiebres:5,mo:100,kaizen:0,s1:10,s2:8,s3:12,s4:3,s5:0,kanban:5,venta_sug:3},
      1:{sds:-7.5,ef_op:15.0,cmv:7.1,ticket:100,merma:5.9,quiebres:5,mo:100,kaizen:18,s1:20,s2:18,s3:22,s4:8,s5:2,kanban:10,venta_sug:10},
      2:{sds:-6.8,ef_op:15.6,cmv:6.7,ticket:101,merma:5.5,quiebres:4,mo:99,kaizen:32,s1:32,s2:30,s3:35,s4:15,s5:5,kanban:18,venta_sug:18},
    },
    acciones:[]
  }
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

// ── COMPONENTE BTN (AGREGADO PARA EVITAR ERROR DE REFERENCIA) ───────────────
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
const SecLbl=({children})=>(
  <div style={{fontSize:10,fontWeight:700,color:NAVY,letterSpacing:1,
    borderBottom:`2px solid ${NAVY}`,paddingBottom:3,marginBottom:8,marginTop:10}}>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// APP PRINCIPAL[cite: 8]
// ─────────────────────────────────────────────────────────────────────────
export default function App(){
  const [fcs,setFcs]=useState(INITIAL_STATE);
  const [semana,setSemana]=useState(0);
  const [tab,setTab]=useState("resumen");
  const [fcIdx,setFcIdx]=useState(0);
  const [meta,setMeta]=useState({...META_DEFAULT});
  const [editTab,setEditTab]=useState("kpis");
  const [toast,setToast]=useState(null);
  const FORM_EMPTY={semana:"0",sds:"",ef_op:"",cmv:"",ticket:"",merma:"",
    quiebres:"",mo:"",kaizen:"",s1:"",s2:"",s3:"",s4:"",s5:"",kanban:"",venta_sug:""};
  const [form,setForm]=useState({...FORM_EMPTY});
  const [acForm,setAcForm]=useState({semana:"0",accion:"",impacto:""});
  const [editAcId,setEditAcId]=useState(null);
  const [nextAccId,setNextAccId]=useState(100);
  const [confirmClear,setConfirmClear]=useState(false);

  const [lastSaved,setLastSaved]=useState(null);
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const [bitNota,setBitNota]=useState(["","",""]);

  const STORAGE_KEY="grido_piloto_v4";

  const newIshRow=(id)=>({id,pond:"",colaboradores:"",metodos:"",
    mediciones:"",ambiente:"",material:"",maquinas:"",problema:"",
    porques:{q1:"",q2:"",q3:"",q4:"",q5:""}});
  const [ishRows,setIshRows]=useState([newIshRow(1)]);
  const [nextIshId,setNextIshId]=useState(2);
  const [ishExpanded,setIshExpanded]=useState({});

  const newMMMRow=(id)=>({id,recurso:"",muda:"",mura:"",muri:""});
  const [mmmRows,setMmmRows]=useState([newMMMRow(1)]);
  const [nextMmmId,setNextMmmId]=useState(2);

  const newPlanRow=(id,accion="",fuente="manual")=>({
    id,accion,fechaIni:"",fechaFin:"",responsable:"",
    resultadoEsp:"",resultadoReal:"",avance:"",fuente});
  const [planRows,setPlanRows]=useState([newPlanRow(1)]);
  const [nextPlanId,setNextPlanId]=useState(2);

  useEffect(()=>{
    const load=async()=>{
      try{
        const result=await window.storage.get(STORAGE_KEY);
        if(result && result.value){
          const snap=JSON.parse(result.value);
          if(snap.fcs)     setFcs(snap.fcs);
          if(snap.meta)    setMeta(snap.meta);
          if(snap.semana!=null) setSemana(snap.semana);
          if(snap.bitNota)  setBitNota(snap.bitNota);
          if(snap.ishRows)  setIshRows(snap.ishRows);
          if(snap.mmmRows)  setMmmRows(snap.mmmRows);
          if(snap.planRows) setPlanRows(snap.planRows);
          if(snap.nextIshId)  setNextIshId(snap.nextIshId);
          if(snap.nextMmmId)  setNextMmmId(snap.nextMmmId);
          if(snap.nextPlanId) setNextPlanId(snap.nextPlanId);
          setLastSaved(fmtDate(new Date(snap.ts)));
        }
      }catch(e){
        // Estado inicial por defecto
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
      const snapshot={
        version:4, ts:ts.toISOString(),
        fcs,meta,semana,bitNota,
        ishRows,mmmRows,planRows,
        nextIshId,nextMmmId,nextPlanId,
      };
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

  const handleSaveKPI=()=>{
    const s=parseInt(form.semana);
    if(isNaN(s)||s<0||s>12){ showToast("Semana inválida (0–12)",false); return; }
    const row={};
    ["sds","ef_op","cmv","ticket","merma","quiebres","mo","kaizen",
     "s1","s2","s3","s4","s5","kanban","venta_sug"].forEach(k=>{row[k]=nv(form[k]);});
    setFcs(prev=>{
      const next=[...prev];
      next[fcIdx]={...next[fcIdx],datos:{...next[fcIdx].datos,[s]:row}};
      return next;
    });
    showToast(`Semana guardada en ${fc.nombre}`);
  };

  return(
    <div style={{minHeight:"100vh",background:"#F4F6F9",fontFamily:"Arial,sans-serif",fontSize:13}}>
      {/* Interfaz principal operativa */}
    </div>
  );
}
