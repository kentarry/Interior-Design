import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/*
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  室 · 設計 PRO — AI 全方位室內設計工作室                       ║
 * ║  Architecture: Single-file React for Claude Artifact         ║
 * ║  Migration target: Antigravity (Vite + React)                ║
 * ║  Sections marked // @EXTRACT: [filename] for migration       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// @EXTRACT: constants/theme.js
const T = {
  bg: "#F6F4F0", bgSub: "#EDEAE4",
  card: "#FFFFFF", cardHover: "#FDFCFA", cardAlt: "#FAF9F6",
  border: "#E2DCD3", borderLight: "#EFEBE5", borderFocus: "#C4A87A",
  text: "#1F1B16", textSec: "#7D7568", textTer: "#AEA899",
  accent: "#B8956A", accentL: "#F3EBDF", accentD: "#96764E", accentH: "#D4B896",
  success: "#5E9E72", successL: "#E5F2E9",
  warn: "#C49A3C", warnL: "#FDF4E0", warnBg: "#FFFCF5",
  error: "#BF5B5B", errorL: "#FCE8E8",
  feng: "#C04040", fengL: "#FCE8E8",
};
const FONT = "'Noto Sans TC', 'Helvetica Neue', sans-serif";
const SERIF = "'Noto Serif TC', 'Georgia', serif";
const inputBase = {
  width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${T.border}`,
  fontSize:14,fontFamily:FONT,background:T.card,color:T.text,boxSizing:"border-box",
  transition:"border .2s, box-shadow .2s",outline:"none",
};

// @EXTRACT: constants/furniture.js
const FURNITURE = [
  { cat:"客廳",icon:"🛋️",items:[
    {id:"sofa3",label:"三人沙發",w:210,h:90,color:"#8B7D6B",icon:"🛋️"},
    {id:"sofa2",label:"雙人沙發",w:155,h:85,color:"#9B8D7B",icon:"🛋️"},
    {id:"armchair",label:"單人扶手椅",w:80,h:80,color:"#A89880",icon:"🪑"},
    {id:"coffeetbl",label:"茶几",w:120,h:60,color:"#C4B8A0",icon:"☕"},
    {id:"tvstand",label:"電視櫃",w:180,h:45,color:"#8B7D6B",icon:"📺"},
    {id:"tv",label:"電視(壁掛)",w:130,h:8,color:"#2A2A2A",icon:"📺"},
    {id:"bookshelf",label:"書櫃",w:120,h:35,color:"#9B8D7B",icon:"📚"},
    {id:"sidetbl",label:"邊桌",w:50,h:50,color:"#C4B8A0",icon:"🔲"},
    {id:"rug_l",label:"大地毯",w:240,h:170,color:"#D8CCBB",icon:"▮",opacity:.3},
  ]},
  { cat:"臥室",icon:"🛏️",items:[
    {id:"bed_k",label:"雙人床King",w:200,h:220,color:"#7B8999",icon:"🛏️"},
    {id:"bed_q",label:"雙人床Queen",w:180,h:210,color:"#8B99A9",icon:"🛏️"},
    {id:"bed_s",label:"單人床",w:105,h:200,color:"#9BA9B9",icon:"🛏️"},
    {id:"nightstand",label:"床頭櫃",w:50,h:45,color:"#A89880",icon:"🔲"},
    {id:"wardrobe",label:"衣櫃",w:200,h:60,color:"#7B6D5B",icon:"🚪"},
    {id:"dresser",label:"化妝台",w:100,h:50,color:"#C4B8A0",icon:"🪞"},
    {id:"desk",label:"書桌",w:140,h:70,color:"#9B8D7B",icon:"💻"},
    {id:"chair_d",label:"書桌椅",w:55,h:55,color:"#7B8999",icon:"🪑"},
  ]},
  { cat:"餐廚",icon:"🍳",items:[
    {id:"din6",label:"六人餐桌",w:170,h:95,color:"#A89880",icon:"🍽️"},
    {id:"din4",label:"四人餐桌",w:130,h:80,color:"#B8A890",icon:"🍽️"},
    {id:"din_chair",label:"餐椅",w:45,h:45,color:"#8B7D6B",icon:"🪑"},
    {id:"island",label:"中島",w:180,h:90,color:"#909090",icon:"🏝️"},
    {id:"fridge",label:"冰箱",w:75,h:70,color:"#B0B0B0",icon:"🧊"},
    {id:"counter",label:"廚具檯面",w:200,h:60,color:"#A0A0A0",icon:"🔪"},
  ]},
  { cat:"衛浴",icon:"🚿",items:[
    {id:"bathtub",label:"浴缸",w:170,h:80,color:"#E0E0E0",icon:"🛁"},
    {id:"shower",label:"淋浴間",w:95,h:95,color:"#B0D0E0",icon:"🚿"},
    {id:"toilet",label:"馬桶",w:42,h:68,color:"#EBEBEB",icon:"🚽"},
    {id:"vanity",label:"洗手台",w:90,h:55,color:"#D4D4D4",icon:"🪞"},
  ]},
  { cat:"裝飾家電",icon:"🌿",items:[
    {id:"plant_l",label:"大型植栽",w:55,h:55,color:"#5A8A5A",icon:"🌳"},
    {id:"plant_s",label:"小型盆栽",w:30,h:30,color:"#6B9B6B",icon:"🪴"},
    {id:"lamp_f",label:"落地燈",w:35,h:35,color:"#E8D8B0",icon:"💡"},
    {id:"washer",label:"洗衣機",w:60,h:60,color:"#C0C0C0",icon:"🫧"},
    {id:"rug_s",label:"小地毯",w:140,h:90,color:"#DDD0C0",icon:"▮",opacity:.3},
  ]},
];

// @EXTRACT: constants/fengshui.js
const DIRECTIONS = [
  {id:"N",label:"北",deg:0,element:"水",color:"#1B4D6E",tip:"事業運・適合書房",emoji:"💧"},
  {id:"NE",label:"東北",deg:45,element:"土",color:"#8B7355",tip:"文昌位・適合學習區",emoji:"🪨"},
  {id:"E",label:"東",deg:90,element:"木",color:"#3A7A3A",tip:"健康運・適合餐廳",emoji:"🌿"},
  {id:"SE",label:"東南",deg:135,element:"木",color:"#4A8A4A",tip:"財位・適合客廳",emoji:"🌳"},
  {id:"S",label:"南",deg:180,element:"火",color:"#C04040",tip:"名聲運・採光最佳",emoji:"🔥"},
  {id:"SW",label:"西南",deg:225,element:"土",color:"#9B7A55",tip:"桃花運・適合主臥",emoji:"🏔️"},
  {id:"W",label:"西",deg:270,element:"金",color:"#B49A5A",tip:"子女運・適合兒童房",emoji:"⚙️"},
  {id:"NW",label:"西北",deg:315,element:"金",color:"#A4884A",tip:"貴人運・適合主人房",emoji:"🔔"},
];

const FENG_RULES = [
  {match:(item,items,room)=>item.id.startsWith("bed")&&item.y<item.h/2+30,severity:"high",msg:"床頭不宜靠近門口方向"},
  {match:(item,items,room)=>item.id.startsWith("bed")&&Math.abs(item.x-room.width/2)<item.w/2&&item.y<100,severity:"high",msg:"床不宜正對房門（沖煞）"},
  {match:(item,items,room)=>item.id==="toilet"&&items.some(i=>i.id.startsWith("bed")&&Math.abs(i.x-item.x)<120&&Math.abs(i.y-item.y)<120),severity:"high",msg:"馬桶不宜緊鄰床位"},
  {match:(item,items,room)=>item.id.startsWith("sofa")&&item.y>room.height-item.h-20,severity:"medium",msg:"沙發背後無牆，缺乏靠山"},
  {match:(item,items,room)=>item.id==="dresser"&&items.some(i=>i.id.startsWith("bed")&&Math.abs(i.x-item.x)<100),severity:"medium",msg:"化妝鏡避免正對床位"},
  {match:(item,items,room)=>item.id==="fridge"&&items.some(i=>i.id==="counter"&&Math.abs(i.x-item.x)<90&&Math.abs(i.y-item.y)<40),severity:"low",msg:"冰箱避免緊貼爐灶（水火相沖）"},
];

const DESIGN_STYLES = [
  {id:"modern",label:"現代簡約",sub:"乾淨・理性・留白",palette:["#2D2D2D","#F5F0EB","#C4A87A","#E8E2DA"]},
  {id:"scandi",label:"北歐風",sub:"溫暖・自然・Hygge",palette:["#F7F3EE","#A8BFA0","#D4A574","#E8DFD0"]},
  {id:"japanese",label:"日式侘寂",sub:"禪意・素材・呼吸",palette:["#E8DFD0","#8B7355","#6B8E6B","#F5F0E8"]},
  {id:"industrial",label:"工業風",sub:"粗獷・金屬・原始",palette:["#3D3D3D","#8B5A2B","#A0522D","#D4C8B8"]},
  {id:"luxury",label:"輕奢",sub:"精緻・品味・質感",palette:["#1C1C1C","#C4A265","#F5F0E8","#6B5B4A"]},
  {id:"chinese",label:"新中式",sub:"東方・韻味・傳承",palette:["#5B3A29","#C8102E","#F0E6D3","#2D4A3E"]},
  {id:"boho",label:"波西米亞",sub:"自由・層次・手作",palette:["#D4956A","#7B6B5D","#C9B896","#8B5E3C"]},
  {id:"coastal",label:"海岸風",sub:"清新・悠閒・自然",palette:["#5B8FB9","#F5F0E8","#DEB887","#87CEEB"]},
  {id:"midcentury",label:"中世紀復古",sub:"經典・有機・懷舊",palette:["#D4A017","#2F4F4F","#CD853F","#F5E6D3"]},
  {id:"farmhouse",label:"鄉村風",sub:"質樸・溫馨・手感",palette:["#F5F0E1","#6B8E23","#8B7355","#E8DFD0"]},
];

// @EXTRACT: hooks/useStorage.js
function useStorage(key, def) {
  const [val, setVal] = useState(def);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage?.get(key); if (r?.value) setVal(JSON.parse(r.value)); } catch {}
      setOk(true);
    })();
  }, [key]);
  const save = useCallback(async (v) => {
    const nv = typeof v === "function" ? v(val) : v;
    setVal(nv);
    try { await window.storage?.set(key, JSON.stringify(nv)); } catch {}
  }, [key, val]);
  return [val, save, ok];
}

// @EXTRACT: utils/ai.js
async function callAI(sys, usr, max = 4000) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:max,system:sys,messages:[{role:"user",content:usr}]}),
  });
  const d = await r.json();
  const t = d.content?.map(i=>i.text||"").join("")||"";
  return JSON.parse(t.replace(/```json|```/g,"").trim());
}

async function callAIImg(sys, usr, b64, mt, max = 3000) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:max,system:sys,
      messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mt,data:b64}},{type:"text",text:usr}]}]}),
  });
  const d = await r.json();
  const t = d.content?.map(i=>i.text||"").join("")||"";
  return JSON.parse(t.replace(/```json|```/g,"").trim());
}

// Shared components
function Card({children,style:s,onClick:oc}){return <div onClick={oc} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:18,...s}}>{children}</div>}
function Btn({children,primary,danger,small,disabled:dis,onClick:oc,style:s}){
  const b={padding:small?"7px 16px":"11px 26px",borderRadius:10,fontSize:small?13:14,fontWeight:600,cursor:dis?"not-allowed":"pointer",fontFamily:FONT,border:"none",transition:"all .2s",display:"inline-flex",alignItems:"center",gap:6,...s};
  if(primary)return <button disabled={dis} onClick={oc} style={{...b,background:dis?"#ccc":danger?T.error:T.accent,color:"#fff"}}>{children}</button>;
  return <button disabled={dis} onClick={oc} style={{...b,background:"transparent",border:`1.5px solid ${danger?T.error:T.border}`,color:danger?T.error:T.text}}>{children}</button>;
}
function STitle({children,icon}){return <div style={{fontSize:16,fontWeight:700,color:T.text,margin:"0 0 14px",fontFamily:SERIF,display:"flex",alignItems:"center",gap:8}}>{icon&&<span style={{fontSize:18}}>{icon}</span>}{children}</div>}
function FBadge({severity}){const m={high:{c:T.error,bg:T.errorL,l:"嚴重"},medium:{c:T.warn,bg:T.warnL,l:"注意"},low:{c:T.accent,bg:T.accentL,l:"建議"}};const s=m[severity]||m.low;return <span style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,color:s.c,background:s.bg}}>{s.l}</span>}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [P, setP, loaded] = useStorage("rdesign-v2", {
    persona:null,direction:null,floorplanImg:null,floorplanAnalysis:null,
    roomW:500,roomH:400,style:null,budget:null,occupants:null,
    priorities:[],notes:"",furniture:[],aiResult:null,
  });
  const [step, setStep] = useState(0);
  const [fengW, setFengW] = useState([]);

  const up = (patch) => setP(prev => ({...prev,...patch}));

  const allSteps = [
    {id:"persona",title:"歡迎"},
    {id:"direction",title:"方位設定"},
    {id:"floorplan",title:"空間設定"},
    {id:"style",title:"風格與需求"},
    {id:"editor",title:"家具擺放"},
    {id:"generating",title:"生成中"},
    {id:"result",title:"設計方案"},
  ];
  const steps = P.persona==="inspire"
    ? [allSteps[0],allSteps[1],allSteps[3],allSteps[5],allSteps[6]]
    : allSteps;
  const cur = steps[step];

  useEffect(()=>{
    if(!P.furniture?.length){setFengW([]);return;}
    const room={width:P.roomW,height:P.roomH};
    const w=[];
    P.furniture.forEach(item=>{FENG_RULES.forEach(rule=>{if(rule.match(item,P.furniture,room))w.push({uid:item.uid,label:item.label,severity:rule.severity,msg:rule.msg})})});
    setFengW(w);
  },[P.furniture,P.roomW,P.roomH]);

  const goNext=()=>setStep(s=>Math.min(s+1,steps.length-1));
  const goBack=()=>setStep(s=>Math.max(s-1,0));
  const goTo=(i)=>setStep(i);

  if(!loaded)return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:50,height:50,borderRadius:"50%",border:`3px solid ${T.border}`,borderTopColor:T.accent,animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
        <div style={{color:T.textSec,fontSize:14}}>載入中...</div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:FONT}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700;900&family=Noto+Serif+TC:wght@400;600;700;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input:focus,textarea:focus{border-color:${T.borderFocus}!important;box-shadow:0 0 0 3px ${T.accent}15!important;outline:none}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
      `}</style>

      {/* HEADER */}
      <header style={{background:`${T.card}F0`,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,padding:"12px 18px",position:"sticky",top:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontSize:19,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF,letterSpacing:3}}>室<span style={{color:T.accent}}>·</span>設計</h1>
          <p style={{fontSize:10,color:T.textTer,margin:0,letterSpacing:4,fontWeight:500}}>AI INTERIOR STUDIO</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {P.direction&&<div style={{fontSize:11,color:T.feng,fontWeight:600}}>🧭 門朝{DIRECTIONS.find(d=>d.id===P.direction)?.label}</div>}
          {step>0&&<div onClick={()=>{setP({persona:null,direction:null,floorplanImg:null,floorplanAnalysis:null,roomW:500,roomH:400,style:null,budget:null,occupants:null,priorities:[],notes:"",furniture:[],aiResult:null});setStep(0)}} style={{fontSize:11,color:T.textSec,cursor:"pointer",padding:"4px 10px",borderRadius:6,border:`1px solid ${T.border}`}}>重新開始</div>}
        </div>
      </header>

      {/* PROGRESS */}
      {step>0&&step<steps.length-1&&cur?.id!=="generating"&&(
        <div style={{padding:"12px 18px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <span style={{fontSize:11,color:T.accent,fontWeight:700}}>步驟 {step}/{steps.length-1}</span>
            <span style={{fontSize:11,color:T.textTer}}>·</span>
            <span style={{fontSize:11,color:T.textSec}}>{cur?.title}</span>
          </div>
          <div style={{display:"flex",gap:3}}>
            {steps.map((_,i)=><div key={i} onClick={()=>i<=step&&goTo(i)} style={{flex:1,height:3,borderRadius:2,background:i<step?T.accent:i===step?T.accentH:T.border,transition:"all .4s",cursor:i<=step?"pointer":"default"}}/>)}
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main style={{padding:"16px 16px 110px",maxWidth:680,margin:"0 auto"}} key={cur?.id}>
        <div style={{animation:"fadeUp .4s cubic-bezier(.4,0,.2,1)"}}>
          {cur?.id==="persona"&&<PPersona P={P} up={up} goNext={goNext}/>}
          {cur?.id==="direction"&&<PDirection P={P} up={up}/>}
          {cur?.id==="floorplan"&&<PFloorplan P={P} up={up}/>}
          {cur?.id==="style"&&<PStyle P={P} up={up}/>}
          {cur?.id==="editor"&&<PEditor P={P} up={up} fengW={fengW}/>}
          {cur?.id==="generating"&&<PGenerate P={P} up={up} goNext={goNext}/>}
          {cur?.id==="result"&&<PResult P={P} up={up} goTo={goTo} steps={steps}/>}
        </div>
      </main>

      {/* BOTTOM NAV */}
      {step>0&&step<steps.length-1&&cur?.id!=="generating"&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:`${T.card}F5`,backdropFilter:"blur(12px)",borderTop:`1px solid ${T.border}`,padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:300}}>
          <Btn onClick={goBack}>← 上一步</Btn>
          <Btn primary onClick={goNext}>{step===steps.length-2?"生成設計方案 ✨":"下一步 →"}</Btn>
        </div>
      )}

      {/* FENG SHUI FLOATING */}
      {fengW.length>0&&cur?.id==="editor"&&(
        <div style={{position:"fixed",bottom:65,left:16,right:16,background:T.warnBg,border:`1px solid ${T.warn}40`,borderRadius:12,padding:"10px 14px",zIndex:250,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.warn,marginBottom:4}}>🧭 風水即時提醒</div>
          {fengW.slice(0,3).map((w,i)=><div key={i} style={{fontSize:12,color:T.text,lineHeight:1.6}}><FBadge severity={w.severity}/> {w.label}：{w.msg}</div>)}
          {fengW.length>3&&<div style={{fontSize:11,color:T.textSec,marginTop:4}}>還有 {fengW.length-3} 項...</div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP: Persona
// ═══════════════════════════════════════════
function PPersona({P,up,goNext}){
  const ps=[
    {id:"diy",icon:"🔨",title:"自己動手佈置",desc:"已有空間，想規劃家具擺放與風格",tag:"完整流程"},
    {id:"plan",icon:"📋",title:"裝修前規劃",desc:"準備裝潢，需要完整方案與預算表",tag:"最詳細"},
    {id:"inspire",icon:"💡",title:"靈感探索",desc:"先看看風格、配色、風水建議",tag:"快速體驗"},
  ];
  return(
    <div style={{paddingTop:20}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:42,marginBottom:12}}>🏠</div>
        <h2 style={{fontSize:26,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF,letterSpacing:2}}>歡迎來到室·設計</h2>
        <p style={{fontSize:14,color:T.textSec,marginTop:8,lineHeight:1.7}}>AI 設計師 × 風水顧問，打造您的理想空間</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {ps.map((p,i)=>(
          <div key={p.id} onClick={()=>{up({persona:p.id});goNext()}}
            style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:16,padding:"20px 18px",cursor:"pointer",transition:"all .25s",display:"flex",alignItems:"center",gap:16,animation:`fadeUp .4s cubic-bezier(.4,0,.2,1) ${i*.08}s both`}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${T.accent}15`}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
            <div style={{fontSize:36,width:52,textAlign:"center"}}>{p.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16,fontWeight:700,color:T.text}}>{p.title}</span>
                <span style={{padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:700,color:T.accent,background:T.accentL}}>{p.tag}</span>
              </div>
              <div style={{fontSize:13,color:T.textSec,marginTop:4}}>{p.desc}</div>
            </div>
            <span style={{fontSize:18,color:T.textTer}}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP: Direction (Feng Shui)
// ═══════════════════════════════════════════
function PDirection({P,up}){
  const dir=DIRECTIONS.find(d=>d.id===P.direction);
  const elemClr={水:{g:"黑、深藍",a:"大面積紅色"},木:{g:"綠、原木色",a:"大面積白色"},火:{g:"紅、橘暖色",a:"大面積黑色"},土:{g:"黃、米色大地色",a:"大面積綠色"},金:{g:"白、金、銀灰",a:"大面積紅色"}};

  return(
    <div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <h2 style={{fontSize:22,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF}}>大門朝向</h2>
        <p style={{fontSize:13,color:T.textSec,marginTop:6,lineHeight:1.6}}>風水的第一步 · 影響後續所有建議</p>
      </div>
      <div style={{display:"flex",justifyContent:"center",margin:"20px 0"}}>
        <div style={{position:"relative",width:260,height:260}}>
          <svg width={260} height={260} viewBox="0 0 260 260">
            <defs><radialGradient id="cg" cx="50%" cy="50%"><stop offset="0%" stopColor={`${T.accent}08`}/><stop offset="100%" stopColor={`${T.accent}02`}/></radialGradient></defs>
            <circle cx={130} cy={130} r={120} fill="url(#cg)" stroke={T.border} strokeWidth={1}/>
            <circle cx={130} cy={130} r={85} fill="none" stroke={T.borderLight} strokeWidth={.5} strokeDasharray="4 4"/>
            {[0,45,90,135].map(d=>{const r=d*Math.PI/180;return <line key={d} x1={130+120*Math.sin(r)} y1={130-120*Math.cos(r)} x2={130-120*Math.sin(r)} y2={130+120*Math.cos(r)} stroke={T.borderLight} strokeWidth={.3}/>})}
          </svg>
          {DIRECTIONS.map(d=>{
            const r=100,rad=(d.deg-90)*Math.PI/180,x=130+r*Math.cos(rad),y=130+r*Math.sin(rad),sel=P.direction===d.id;
            return(
              <div key={d.id} onClick={()=>up({direction:d.id})} style={{position:"absolute",left:x-24,top:y-24,width:48,height:48,borderRadius:"50%",background:sel?d.color:T.card,border:`2.5px solid ${sel?d.color:T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .3s",boxShadow:sel?`0 4px 16px ${d.color}40`:"0 1px 4px rgba(0,0,0,0.06)",transform:sel?"scale(1.15)":"scale(1)",zIndex:sel?10:1}}>
                <span style={{fontSize:10,fontWeight:900,color:sel?"#fff":T.text,lineHeight:1}}>{d.label}</span>
                <span style={{fontSize:8,color:sel?"rgba(255,255,255,.7)":T.textTer,marginTop:1}}>{d.element}</span>
              </div>
            );
          })}
          <div style={{position:"absolute",left:105,top:105,width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.accentD})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${T.accent}40`}}>
            <span style={{fontSize:22}}>🚪</span>
          </div>
        </div>
      </div>
      {dir&&(
        <Card style={{marginTop:16,borderColor:`${dir.color}40`,animation:"fadeUp .3s"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${dir.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{dir.emoji}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:dir.color}}>{dir.label}方 · {dir.element}屬性</div>
              <div style={{fontSize:13,color:T.textSec,marginTop:2}}>{dir.tip}</div>
            </div>
          </div>
          {elemClr[dir.element]&&(
            <div style={{fontSize:12,color:T.text,lineHeight:1.7,padding:"8px 12px",background:T.cardAlt,borderRadius:8}}>
              🎨 配色建議 — 宜用：<strong>{elemClr[dir.element].g}</strong> ｜ 避免：{elemClr[dir.element].a}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP: Floorplan
// ═══════════════════════════════════════════
function PFloorplan({P,up}){
  const [mode,setMode]=useState(P.floorplanImg?"upload":null);
  const [busy,setBusy]=useState(false);
  const ref=useRef(null);

  const handleFile=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{up({floorplanImg:ev.target.result,floorplanAnalysis:null});setMode("upload")};r.readAsDataURL(f)};

  const analyze=async()=>{
    if(!P.floorplanImg)return;setBusy(true);
    try{
      const b64=P.floorplanImg.split(",")[1],mt=P.floorplanImg.startsWith("data:image/png")?"image/png":"image/jpeg";
      const dir=DIRECTIONS.find(d=>d.id===P.direction);
      const res=await callAIImg("你是頂級室內設計師+風水顧問。只回覆純JSON。繁體中文。",
        `分析此平面圖。大門朝${dir?.label||"南"}（${dir?.element||"火"}屬性）。
回覆：{"layout":"格局","totalArea":"坪數","rooms":[{"name":"名","area":"坪","suggestedUse":"建議","fengshuiNote":"風水"}],"strengths":["優點"],"issues":["問題"],"fengshuiScore":0-100,"fengshuiOverall":"風水評價","keyAdvice":["建議"]}`,b64,mt);
      up({floorplanAnalysis:res});
    }catch(e){console.error(e);up({floorplanAnalysis:{error:"分析失敗"}});}
    setBusy(false);
  };

  if(!mode)return(
    <div>
      <div style={{textAlign:"center",marginBottom:28}}>
        <h2 style={{fontSize:22,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF}}>空間設定</h2>
        <p style={{fontSize:13,color:T.textSec,marginTop:6}}>選擇您偏好的方式</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card onClick={()=>ref.current?.click()} style={{cursor:"pointer",padding:24,textAlign:"center",borderStyle:"dashed",borderWidth:2}}>
          <div style={{fontSize:40,marginBottom:8}}>📤</div>
          <div style={{fontSize:16,fontWeight:700,color:T.text}}>上傳平面圖</div>
          <div style={{fontSize:13,color:T.textSec,marginTop:4}}>可直接在圖上擺放家具</div>
        </Card>
        <Card onClick={()=>setMode("manual")} style={{cursor:"pointer",padding:24,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>✏️</div>
          <div style={{fontSize:16,fontWeight:700,color:T.text}}>手動輸入尺寸</div>
          <div style={{fontSize:13,color:T.textSec,marginTop:4}}>輸入長寬自動生成空間</div>
        </Card>
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    </div>
  );

  if(mode==="upload"){
    const a=P.floorplanAnalysis;
    return(
      <div>
        <div style={{textAlign:"center",marginBottom:16}}>
          <h2 style={{fontSize:20,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF}}>平面圖</h2>
        </div>
        <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`,marginBottom:12,position:"relative"}}>
          <img src={P.floorplanImg} alt="plan" style={{width:"100%",display:"block"}}/>
          {P.direction&&<div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,.6)",color:"#fff",padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:600}}>🧭 門朝{DIRECTIONS.find(d=>d.id===P.direction)?.label}</div>}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <Btn primary style={{flex:1}} onClick={analyze} disabled={busy}>{busy?"🔄 分析中...":"🤖 AI 分析平面圖"}</Btn>
          <Btn onClick={()=>{up({floorplanImg:null,floorplanAnalysis:null});setMode(null)}}>重選</Btn>
        </div>
        <Card style={{marginBottom:12}}>
          <STitle icon="📏">比例校準（實際尺寸）</STitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:12,color:T.textSec}}>寬 (cm)</label><input type="number" value={P.roomW} onChange={e=>up({roomW:parseInt(e.target.value)||0})} style={inputBase}/></div>
            <div><label style={{fontSize:12,color:T.textSec}}>長 (cm)</label><input type="number" value={P.roomH} onChange={e=>up({roomH:parseInt(e.target.value)||0})} style={inputBase}/></div>
          </div>
          <div style={{textAlign:"center",marginTop:8,fontSize:13,color:T.accent,fontWeight:600}}>≈ {(P.roomW/100*P.roomH/100*.3025).toFixed(1)} 坪</div>
        </Card>
        {a&&!a.error&&(
          <div style={{animation:"fadeUp .4s"}}>
            <Card style={{marginBottom:12}}>
              <STitle icon="📊">分析結果</STitle>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[{l:"格局",v:a.layout},{l:"面積",v:`≈${a.totalArea}`},{l:"風水",v:`${a.fengshuiScore}分`}].map((x,i)=>(
                  <div key={i} style={{flex:1,background:i===2?`${T.feng}10`:T.accentL,borderRadius:10,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:11,color:T.textSec}}>{x.l}</div>
                    <div style={{fontSize:15,fontWeight:700,color:i===2?(a.fengshuiScore>=70?T.success:a.fengshuiScore>=40?T.warn:T.error):T.text,marginTop:2}}>{x.v}</div>
                  </div>
                ))}
              </div>
              {a.rooms?.map((r,i)=>(
                <div key={i} style={{padding:"8px 0",borderBottom:i<a.rooms.length-1?`1px solid ${T.borderLight}`:"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:600,color:T.text}}>{r.name}</span><span style={{fontSize:12,color:T.textSec}}>≈{r.area}</span></div>
                  <div style={{fontSize:12,color:T.textSec,marginTop:2}}>建議：{r.suggestedUse}</div>
                  {r.fengshuiNote&&<div style={{fontSize:11,color:T.feng,marginTop:2}}>🧭 {r.fengshuiNote}</div>}
                </div>
              ))}
            </Card>
            <Card style={{marginBottom:12}}><STitle icon="🧭">風水評價</STitle><p style={{fontSize:13,color:T.text,lineHeight:1.8}}>{a.fengshuiOverall}</p></Card>
            <Card><STitle icon="💡">建議</STitle>{a.keyAdvice?.map((x,i)=><div key={i} style={{fontSize:13,color:T.text,lineHeight:1.8,paddingLeft:18,position:"relative"}}><span style={{position:"absolute",left:0,color:T.accent,fontWeight:700}}>{i+1}.</span>{x}</div>)}</Card>
          </div>
        )}
        {a?.error&&<div style={{padding:16,background:T.errorL,borderRadius:12,color:T.error,fontSize:13,textAlign:"center"}}>{a.error}</div>}
      </div>
    );
  }

  // Manual
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <h2 style={{fontSize:20,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF}}>手動設定空間</h2>
      </div>
      <Card style={{marginBottom:14}}>
        <STitle icon="📐">尺寸</STitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={{fontSize:12,color:T.textSec}}>寬 (cm)</label><input type="number" value={P.roomW} onChange={e=>up({roomW:parseInt(e.target.value)||0})} style={inputBase}/></div>
          <div><label style={{fontSize:12,color:T.textSec}}>長 (cm)</label><input type="number" value={P.roomH} onChange={e=>up({roomH:parseInt(e.target.value)||0})} style={inputBase}/></div>
        </div>
        <div style={{display:"flex",gap:6,marginTop:10}}>
          {[{l:"小套房",w:350,h:300},{l:"標準",w:500,h:400},{l:"大空間",w:700,h:550}].map(p=>(
            <div key={p.l} onClick={()=>up({roomW:p.w,roomH:p.h})} style={{flex:1,textAlign:"center",padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",background:P.roomW===p.w?T.accent:T.accentL,color:P.roomW===p.w?"#fff":T.text,transition:"all .2s"}}>{p.l}</div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:10,fontSize:14,color:T.accent,fontWeight:700}}>≈ {(P.roomW/100*P.roomH/100*.3025).toFixed(1)} 坪</div>
      </Card>
      <Btn small onClick={()=>setMode(null)} style={{display:"block",margin:"0 auto"}}>← 改用上傳平面圖</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP: Style
// ═══════════════════════════════════════════
function PStyle({P,up}){
  const dir=DIRECTIONS.find(d=>d.id===P.direction);
  const ec={水:"黑、深藍系",木:"綠色、原木色系",火:"紅色、橘暖色系",土:"黃色、大地色系",金:"白色、金銀灰系"};

  return(
    <div>
      <div style={{textAlign:"center",marginBottom:20}}>
        <h2 style={{fontSize:22,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF}}>風格探索</h2>
      </div>
      {dir&&(
        <Card style={{marginBottom:16,borderColor:`${T.feng}30`,background:`${T.feng}04`,padding:14}}>
          <div style={{fontSize:13,fontWeight:700,color:T.feng}}>🧭 {dir.element}屬性配色建議：{ec[dir.element]||""}</div>
        </Card>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
        {DESIGN_STYLES.map((s,i)=>{
          const sel=P.style===s.id;
          return(
            <div key={s.id} onClick={()=>up({style:s.id})} style={{background:sel?T.accentL:T.card,border:`1.5px solid ${sel?T.accent:T.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all .25s",position:"relative",animation:`fadeUp .35s ease ${i*.03}s both`}}>
              {sel&&<div style={{position:"absolute",top:12,right:12,width:22,height:22,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff"}}>✓</div>}
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{display:"flex",gap:0,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                  {s.palette.map((c,j)=><div key={j} style={{width:16,height:48,background:c}}/>)}
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.text}}>{s.label}</div>
                  <div style={{fontSize:12,color:T.textSec,marginTop:2}}>{s.sub}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {P.persona!=="inspire"&&(
        <>
          <Card style={{marginBottom:12}}>
            <STitle icon="💰">預算</STitle>
            <div style={{display:"flex",gap:8}}>
              {[{id:"low",l:"經濟",r:"10-30萬",ic:"💰"},{id:"mid",l:"中等",r:"30-80萬",ic:"💎"},{id:"high",l:"高端",r:"80萬+",ic:"👑"}].map(b=>(
                <div key={b.id} onClick={()=>up({budget:b.id})} style={{flex:1,textAlign:"center",padding:"14px 8px",borderRadius:12,cursor:"pointer",background:P.budget===b.id?T.accent:T.card,color:P.budget===b.id?"#fff":T.text,border:`1.5px solid ${P.budget===b.id?T.accent:T.border}`,transition:"all .2s"}}>
                  <div style={{fontSize:20}}>{b.ic}</div><div style={{fontSize:13,fontWeight:600,marginTop:4}}>{b.l}</div><div style={{fontSize:11,opacity:.7,marginTop:2}}>{b.r}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{marginBottom:12}}>
            <STitle icon="👥">居住人數</STitle>
            <div style={{display:"flex",gap:6}}>
              {[1,2,3,4,"5+"].map(n=><div key={n} onClick={()=>up({occupants:n})} style={{flex:1,textAlign:"center",padding:"10px 0",borderRadius:8,fontSize:15,fontWeight:600,cursor:"pointer",background:P.occupants===n?T.accent:T.accentL,color:P.occupants===n?"#fff":T.text,transition:"all .2s"}}>{n}</div>)}
            </div>
          </Card>
          <Card>
            <STitle icon="📝">需求</STitle>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {["收納空間","光線氛圍","兒童安全","寵物友善","智能家居","在家辦公","大量書籍","隔音效果"].map(t=>{
                const sel=(P.priorities||[]).includes(t);
                return <span key={t} onClick={()=>up({priorities:sel?P.priorities.filter(x=>x!==t):[...(P.priorities||[]),t]})} style={{padding:"6px 14px",borderRadius:20,fontSize:12,cursor:"pointer",fontWeight:500,background:sel?T.accent:T.accentL,color:sel?"#fff":T.text,transition:"all .2s"}}>{t}</span>;
              })}
            </div>
            <textarea value={P.notes||""} onChange={e=>up({notes:e.target.value})} placeholder="其他想法..." style={{...inputBase,minHeight:60,resize:"vertical"}}/>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP: Editor
// ═══════════════════════════════════════════
function PEditor({P,up,fengW}){
  const [selUid,setSelUid]=useState(null);
  const [drag,setDrag]=useState(null);
  const [catOpen,setCatOpen]=useState(null);
  const [showLib,setShowLib]=useState(false);
  const cvRef=useRef(null);
  const hasFP=!!P.floorplanImg;
  const cW=Math.min(650,typeof window!=="undefined"?window.innerWidth-32:650);
  const SC=Math.min(cW/P.roomW,380/P.roomH);
  const canW=P.roomW*SC,canH=P.roomH*SC;
  const items=P.furniture||[];
  const setItems=fn=>{const n=typeof fn==="function"?fn(items):fn;up({furniture:n})};
  const addItem=t=>{const n={...t,uid:Date.now()+Math.random(),x:P.roomW/2,y:P.roomH/2,rotation:0};setItems([...items,n]);setSelUid(n.uid);setShowLib(false)};

  const onDown=(e,uid)=>{e.stopPropagation();e.preventDefault();setSelUid(uid);const rect=cvRef.current.getBoundingClientRect();const it=items.find(i=>i.uid===uid);setDrag({uid,ox:(e.clientX-rect.left)/SC-it.x,oy:(e.clientY-rect.top)/SC-it.y})};
  const onMove=useCallback(e=>{if(!drag||!cvRef.current)return;const rect=cvRef.current.getBoundingClientRect();setItems(prev=>prev.map(i=>i.uid===drag.uid?{...i,x:Math.max(0,Math.min(P.roomW,(e.clientX-rect.left)/SC-drag.ox)),y:Math.max(0,Math.min(P.roomH,(e.clientY-rect.top)/SC-drag.oy))}:i))},[drag,SC,P.roomW,P.roomH]);
  const onUp=useCallback(()=>setDrag(null),[]);
  useEffect(()=>{if(drag){window.addEventListener("pointermove",onMove);window.addEventListener("pointerup",onUp);return()=>{window.removeEventListener("pointermove",onMove);window.removeEventListener("pointerup",onUp)}}},[drag,onMove,onUp]);

  const selItem=items.find(i=>i.uid===selUid);
  const selWarns=fengW.filter(w=>w.uid===selUid);

  return(
    <div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <h2 style={{fontSize:20,fontWeight:900,color:T.text,margin:0,fontFamily:SERIF}}>空間編輯</h2>
        <p style={{fontSize:12,color:T.textSec,marginTop:4}}>拖曳家具 · 風水即時提醒</p>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <Btn primary small onClick={()=>setShowLib(!showLib)}>{showLib?"✕ 關閉":"＋ 新增家具"}</Btn>
        {selUid&&<><Btn small onClick={()=>setItems(prev=>prev.map(i=>i.uid===selUid?{...i,rotation:(i.rotation+90)%360}:i))}>🔄 旋轉</Btn><Btn small danger onClick={()=>{setItems(prev=>prev.filter(i=>i.uid!==selUid));setSelUid(null)}}>🗑️</Btn><span style={{fontSize:12,color:T.accent,fontWeight:600,alignSelf:"center",marginLeft:"auto"}}>{selItem?.label}</span></>}
      </div>
      {selWarns.length>0&&<div style={{background:T.warnBg,border:`1px solid ${T.warn}30`,borderRadius:10,padding:"8px 12px",marginBottom:10}}>{selWarns.map((w,i)=><div key={i} style={{fontSize:12,color:T.text,lineHeight:1.6}}><FBadge severity={w.severity}/> {w.msg}</div>)}</div>}

      <div style={{borderRadius:14,overflow:"hidden",border:`2px solid ${T.border}`,background:T.card,marginBottom:10}}>
        <div ref={cvRef} onClick={()=>setSelUid(null)} style={{width:canW,height:canH,position:"relative",touchAction:"none",margin:"0 auto",backgroundImage:hasFP?`url(${P.floorplanImg})`:`linear-gradient(90deg,${T.border}30 1px,transparent 1px),linear-gradient(${T.border}30 1px,transparent 1px)`,backgroundSize:hasFP?"100% 100%":`${50*SC}px ${50*SC}px`,backgroundRepeat:hasFP?"no-repeat":"repeat"}}>
          {!hasFP&&<div style={{position:"absolute",inset:0,border:`2px dashed ${T.accent}60`,borderRadius:2,pointerEvents:"none"}}/>}
          {P.direction&&<div style={{position:"absolute",top:6,left:6,background:"rgba(0,0,0,.55)",color:"#fff",padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:600,zIndex:20,pointerEvents:"none"}}>🧭 {DIRECTIONS.find(d=>d.id===P.direction)?.label}</div>}
          {items.map(item=>{
            const rot=item.rotation===90||item.rotation===270;const dw=(rot?item.h:item.w)*SC,dh=(rot?item.w:item.h)*SC;const isSel=selUid===item.uid;const hasW=fengW.some(w=>w.uid===item.uid);
            return(
              <div key={item.uid} onPointerDown={e=>onDown(e,item.uid)} style={{position:"absolute",left:item.x*SC-dw/2,top:item.y*SC-dh/2,width:dw,height:dh,background:item.color||"#A09080",opacity:item.opacity||.82,borderRadius:Math.min(dw,dh)>30?4:2,border:isSel?`2.5px solid ${T.accent}`:hasW?`2px solid ${T.warn}`:"1px solid rgba(0,0,0,.18)",boxShadow:isSel?`0 0 0 4px ${T.accent}30`:hasW?`0 0 0 3px ${T.warn}25`:"0 1px 4px rgba(0,0,0,.1)",cursor:drag?.uid===item.uid?"grabbing":"grab",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.min(dw,dh)*.45,userSelect:"none",touchAction:"none",zIndex:isSel?10:item.opacity<.5?0:1,transition:drag?.uid===item.uid?"none":"border .2s, box-shadow .2s"}}>
                <span style={{pointerEvents:"none",filter:"drop-shadow(0 1px 2px rgba(0,0,0,.3))"}}>{item.icon}</span>
                {hasW&&!isSel&&<div style={{position:"absolute",top:-6,right:-6,width:14,height:14,borderRadius:"50%",background:T.warn,fontSize:8,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>!</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:11,color:T.textTer,marginBottom:10}}>{P.roomW}cm × {P.roomH}cm · {items.length} 件家具</div>

      {showLib&&(
        <Card style={{animation:"fadeUp .25s",maxHeight:350,overflowY:"auto"}}>
          <STitle icon="🪑">家具庫</STitle>
          {FURNITURE.map(cat=>(
            <div key={cat.cat}>
              <div onClick={()=>setCatOpen(catOpen===cat.cat?null:cat.cat)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 8px",cursor:"pointer",borderRadius:8,background:catOpen===cat.cat?T.accentL:"transparent"}}>
                <span style={{fontSize:14,fontWeight:600}}>{cat.icon} {cat.cat}</span>
                <span style={{fontSize:11,color:T.textTer,transition:"transform .2s",transform:catOpen===cat.cat?"rotate(180deg)":"none"}}>▼</span>
              </div>
              {catOpen===cat.cat&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,padding:"4px 4px 8px",animation:"fadeUp .2s"}}>
                  {cat.items.map(item=>(
                    <div key={item.id} onClick={()=>addItem(item)} style={{padding:"8px 10px",borderRadius:8,cursor:"pointer",background:T.cardAlt,border:`1px solid ${T.borderLight}`,display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
                      <span style={{fontSize:18}}>{item.icon}</span>
                      <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>{item.label}</div><div style={{fontSize:10,color:T.textSec}}>{item.w}×{item.h}cm</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP: Generate
// ═══════════════════════════════════════════
function PGenerate({P,up,goNext}){
  const [prog,setProg]=useState(0);
  useEffect(()=>{
    if(P.aiResult){goNext();return;}
    let mt=true;
    const run=async()=>{
      setProg(0);
      const iv=setInterval(()=>{if(mt)setProg(p=>p>=92?(clearInterval(iv),92):p+Math.random()*5+1.5)},450);
      const sty=DESIGN_STYLES.find(s=>s.id===P.style);const dir=DIRECTIONS.find(d=>d.id===P.direction);
      const fd=(P.furniture||[]).map(i=>`${i.label}(${i.w}×${i.h}cm)@(${Math.round(i.x)},${Math.round(i.y)})`).join("; ");
      const bm={low:"10-30萬",mid:"30-80萬",high:"80萬+"};
      try{
        const res=await callAI("你是頂級室內設計師+風水顧問。只回覆純JSON。繁體中文。",
`設計方案：空間${P.roomW}cm×${P.roomH}cm≈${(P.roomW/100*P.roomH/100*.3025).toFixed(1)}坪
風格：${sty?.label||"現代"} 門朝：${dir?.label||"南"}（${dir?.element||"火"}） 預算：${bm[P.budget]||"未指定"} 人數：${P.occupants||"未指定"}
需求：${(P.priorities||[]).join("、")||"無"} 備註：${P.notes||"無"} 家具：${fd||"無"}
${P.floorplanAnalysis?`平面圖分析：${JSON.stringify(P.floorplanAnalysis)}`:""}

回覆JSON：
{"concept":"設計理念250字含風水","layout":"空間配置300字含動線風水","furnitureList":[{"item":"名","spec":"規格","material":"材質","price":"價格","brand":"品牌","placement":"擺放含風水"}],"colorPlan":{"primary":"#hex","secondary":"#hex","accent":"#hex","wall":"牆色","floor":"地板","description":"配色說明含風水用色"},"lighting":"燈光200字","storage":"收納150字","budgetTable":[{"category":"類別","pct":數字,"amount":"金額","items":"細項"}],"fengshuiReport":{"score":0-100,"summary":"風水總評200字","goodPoints":["好"],"issues":[{"problem":"問題","solution":"化解"}],"luckyItems":["開運物"],"elementBalance":"五行100字"},"timeline":"時程","tips":["建議x8"]}`);
        clearInterval(iv);
        if(mt){setProg(100);setTimeout(()=>{up({aiResult:res});goNext()},500)}
      }catch(e){clearInterval(iv);console.error(e);if(mt){up({aiResult:{error:true}});goNext()}}
    };
    run();
    return()=>{mt=false};
  },[]);

  const stages=["分析空間","風水方位","家具配置","配色方案","預算分配","專業建議","完成報告"];
  return(
    <div style={{textAlign:"center",padding:"50px 20px"}}>
      <div style={{width:76,height:76,margin:"0 auto 24px",borderRadius:"50%",border:`3px solid ${T.border}`,borderTopColor:T.accent,animation:"spin 1s linear infinite"}}/>
      <h2 style={{fontSize:20,fontWeight:900,color:T.text,margin:"0 0 6px",fontFamily:SERIF}}>AI 設計師工作中</h2>
      <div style={{fontSize:14,color:T.accent,fontWeight:600,marginBottom:24,animation:"pulse 1.5s infinite"}}>{stages[Math.min(Math.floor(prog/14),6)]}...</div>
      <div style={{width:"75%",height:4,background:T.border,borderRadius:2,margin:"0 auto",overflow:"hidden"}}>
        <div style={{width:`${prog}%`,height:"100%",background:`linear-gradient(90deg,${T.accent},${T.accentD})`,borderRadius:2,transition:"width .3s"}}/>
      </div>
      <div style={{fontSize:12,color:T.textTer,marginTop:8}}>{Math.round(prog)}%</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// STEP: Result
// ═══════════════════════════════════════════
function PResult({P,up,goTo,steps}){
  const [tab,setTab]=useState("concept");
  const r=P.aiResult;
  if(!r||r.error)return(
    <div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:44,marginBottom:12}}>😔</div>
      <div style={{fontSize:16,fontWeight:600,color:T.text}}>方案生成失敗</div>
      <Btn primary style={{marginTop:20}} onClick={()=>{up({aiResult:null});goTo(steps.length-2)}}>重新生成</Btn>
    </div>
  );

  const tabs=[{id:"concept",l:"設計理念",ic:"💡"},{id:"layout",l:"空間配置",ic:"📐"},{id:"furniture",l:"家具清單",ic:"🪑"},{id:"color",l:"配色燈光",ic:"🎨"},{id:"budget",l:"預算明細",ic:"💰"},{id:"fengshui",l:"風水報告",ic:"🧭"},{id:"tips",l:"建議",ic:"📝"}];
  const sty=DESIGN_STYLES.find(s=>s.id===P.style);const dir=DIRECTIONS.find(d=>d.id===P.direction);const fs=r.fengshuiReport;

  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${T.accent}12,${T.accentL})`,borderRadius:16,padding:22,marginBottom:16,border:`1px solid ${T.accent}25`}}>
        <div style={{fontSize:22,fontWeight:900,color:T.text,fontFamily:SERIF,marginBottom:6}}>您的專屬設計方案</div>
        <div style={{fontSize:13,color:T.textSec}}>{sty?.label} · {(P.roomW/100*P.roomH/100*.3025).toFixed(1)}坪 · 門朝{dir?.label} · 風水{fs?.score}分</div>
      </div>

      <div style={{display:"flex",gap:0,overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:14,borderBottom:`1px solid ${T.border}`}}>
        {tabs.map(t=><div key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 11px",fontSize:12,fontWeight:tab===t.id?700:500,color:tab===t.id?T.accent:T.textSec,borderBottom:tab===t.id?`2.5px solid ${T.accent}`:"2.5px solid transparent",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}>{t.ic} {t.l}</div>)}
      </div>

      <div style={{animation:"fadeUp .3s"}} key={tab}>
        {tab==="concept"&&<Card><STitle icon="💡">設計理念</STitle><p style={{fontSize:14,color:T.text,lineHeight:2}}>{r.concept}</p></Card>}
        {tab==="layout"&&<Card><STitle icon="📐">空間配置</STitle><p style={{fontSize:14,color:T.text,lineHeight:2}}>{r.layout}</p></Card>}
        {tab==="furniture"&&<Card><STitle icon="🪑">家具清單</STitle>{r.furnitureList?.map((f,i)=><div key={i} style={{padding:"12px 0",borderBottom:i<r.furnitureList.length-1?`1px solid ${T.borderLight}`:"none"}}><div style={{fontSize:14,fontWeight:700,color:T.text}}>{f.item}</div><div style={{fontSize:12,color:T.textSec,lineHeight:1.8,marginTop:4}}>📏 {f.spec} · 🪵 {f.material}<br/>💰 {f.price} · 🏷️ {f.brand}<br/>📍 {f.placement}</div></div>)}</Card>}
        {tab==="color"&&<div>
          <Card style={{marginBottom:12}}>
            <STitle icon="🎨">配色方案</STitle>
            {r.colorPlan&&<><div style={{display:"flex",borderRadius:12,overflow:"hidden",marginBottom:14,height:56}}>{[{c:r.colorPlan.primary,f:3},{c:r.colorPlan.secondary,f:2},{c:r.colorPlan.accent,f:1}].map((x,i)=><div key={i} style={{flex:x.f,background:x.c,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:4}}><span style={{fontSize:9,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,.5)",fontWeight:600}}>{x.c}</span></div>)}</div><p style={{fontSize:13,color:T.text,lineHeight:1.8}}>{r.colorPlan.description}</p>{r.colorPlan.wall&&<div style={{fontSize:12,color:T.textSec,marginTop:8}}>牆面：{r.colorPlan.wall} ｜ 地板：{r.colorPlan.floor}</div>}</>}
          </Card>
          <Card><STitle icon="💡">燈光設計</STitle><p style={{fontSize:14,color:T.text,lineHeight:2}}>{r.lighting}</p></Card>
        </div>}
        {tab==="budget"&&<Card><STitle icon="💰">預算</STitle>{r.budgetTable?.map((b,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<r.budgetTable.length-1?`1px solid ${T.borderLight}`:"none"}}><div style={{width:44,textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:T.accent}}>{b.pct}%</div></div><div style={{flex:1,height:6,background:T.border,borderRadius:3,overflow:"hidden"}}><div style={{width:`${b.pct}%`,height:"100%",background:T.accent,borderRadius:3}}/></div><div style={{minWidth:100}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{b.category}</div><div style={{fontSize:11,color:T.textSec}}>{b.amount}</div></div></div>)}</Card>}
        {tab==="fengshui"&&fs&&<div>
          <Card style={{marginBottom:12,textAlign:"center"}}>
            <div style={{width:90,height:90,borderRadius:"50%",margin:"0 auto 12px",background:`conic-gradient(${fs.score>=70?T.success:fs.score>=40?T.warn:T.error} ${fs.score*3.6}deg,${T.border} 0)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:72,height:72,borderRadius:"50%",background:T.card,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:26,fontWeight:900,color:T.text}}>{fs.score}</span><span style={{fontSize:9,color:T.textSec}}>風水評分</span></div></div>
            <p style={{fontSize:13,color:T.text,lineHeight:1.8}}>{fs.summary}</p>
          </Card>
          {fs.issues?.length>0&&<Card style={{marginBottom:12}}><STitle icon="⚠️">需化解</STitle>{fs.issues.map((iss,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<fs.issues.length-1?`1px solid ${T.borderLight}`:"none"}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{iss.problem}</div><div style={{fontSize:12,color:T.success,marginTop:2}}>💡 {iss.solution}</div></div>)}</Card>}
          <Card style={{marginBottom:12}}><STitle icon="☯️">五行平衡</STitle><p style={{fontSize:13,color:T.text,lineHeight:1.8}}>{fs.elementBalance}</p></Card>
          {fs.luckyItems?.length>0&&<Card><STitle icon="🍀">開運擺設</STitle>{fs.luckyItems.map((l,i)=><div key={i} style={{fontSize:13,color:T.text,lineHeight:1.8}}>• {l}</div>)}</Card>}
        </div>}
        {tab==="tips"&&<div>
          <Card style={{marginBottom:12}}><STitle icon="📝">專業建議</STitle>{r.tips?.map((t,i)=><div key={i} style={{fontSize:13,color:T.text,lineHeight:1.9,paddingLeft:24,position:"relative"}}><span style={{position:"absolute",left:0,width:20,height:20,borderRadius:"50%",background:T.accentL,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.accent}}>{i+1}</span>{t}</div>)}</Card>
          {r.timeline&&<Card><STitle icon="⏱️">施工時程</STitle><p style={{fontSize:13,color:T.text,lineHeight:1.8}}>{r.timeline}</p></Card>}
        </div>}
      </div>

      <div style={{display:"flex",gap:8,marginTop:20}}>
        <Btn style={{flex:1}} onClick={()=>{up({aiResult:null});goTo(steps.length-2)}}>🔄 重新生成</Btn>
        <Btn primary style={{flex:1}} onClick={()=>goTo(steps.findIndex(s=>s.id==="editor"))}>✏️ 調整家具</Btn>
      </div>
    </div>
  );
}