// ── Floorplan Page ──
function renderFloorplan() {
  const cont = h('div',{className:'animate-fade-up'});
  const fpMode = state.floorplanImg ? 'upload' : null;

  if (!fpMode && !state._fpManual) {
    cont.appendChild(h('div',{className:'page-header'},
      h('h2',null,'空間設定'),
      h('p',null,'選擇您偏好的方式')
    ));
    const fileInput = h('input',{type:'file',accept:'image/*',style:{display:'none'}});
    fileInput.addEventListener('change',e=>{
      const f=e.target.files?.[0];if(!f)return;
      const reader=new FileReader();
      reader.onload=ev=>{up({floorplanImg:ev.target.result,floorplanAnalysis:null})};
      reader.readAsDataURL(f);
    });
    cont.appendChild(h('div',{className:'floorplan-choice'},
      h('div',{className:'card card-dashed card-interactive floorplan-option',onClick:()=>fileInput.click()},
        h('span',{className:'option-icon'},'📤'),
        h('div',{className:'option-title'},'上傳平面圖'),
        h('div',{className:'option-desc'},'AI 智能分析，可直接在圖上擺放家具'),
        fileInput
      ),
      h('div',{className:'card card-interactive floorplan-option',onClick:()=>{state._fpManual=true;render()}},
        h('span',{className:'option-icon'},'✏️'),
        h('div',{className:'option-title'},'手動輸入尺寸'),
        h('div',{className:'option-desc'},'輸入長寬，系統自動生成空間')
      )
    ));
    return cont;
  }

  if (state.floorplanImg) {
    cont.appendChild(h('div',{className:'page-header'},h('h2',null,'平面圖')));
    const dirLabel = DIRECTIONS.find(d=>d.id===state.direction)?.label;
    const preview = h('div',{className:'floorplan-preview'});
    const img = h('img',{src:state.floorplanImg,alt:'plan'});
    preview.appendChild(img);
    if(dirLabel) preview.appendChild(h('div',{className:'direction-badge'},'🧭 門朝'+dirLabel));
    cont.appendChild(preview);

    cont.appendChild(h('div',{className:'floorplan-actions'},
      h('button',{className:'btn btn-primary',onClick:()=>showToast('⚠️ AI 分析需要 API Key 配置'),disabled:false},'🤖 AI 分析平面圖'),
      h('button',{className:'btn btn-outline',onClick:()=>{up({floorplanImg:null,floorplanAnalysis:null});state._fpManual=false;render()}},'重選')
    ));

    // Size inputs
    cont.appendChild(renderSizeCard());

    if(state.floorplanAnalysis && !state.floorplanAnalysis.error) {
      cont.appendChild(renderAnalysisResult());
    }
    return cont;
  }

  // Manual mode
  cont.appendChild(h('div',{className:'page-header'},h('h2',null,'手動設定空間')));
  cont.appendChild(renderSizeCard());
  cont.appendChild(h('button',{className:'btn btn-ghost btn-sm',style:{display:'block',margin:'12px auto'},onClick:()=>{state._fpManual=false;render()}},'← 改用上傳平面圖'));
  return cont;
}

function renderSizeCard() {
  const card = h('div',{className:'card',style:{marginBottom:'14px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'📏'),'空間尺寸')
  );
  const grid = h('div',{className:'size-grid'});
  const wInput = h('input',{className:'form-input',type:'number',value:String(state.roomW)});
  wInput.addEventListener('input',e=>up({roomW:parseInt(e.target.value)||0}));
  const hInput = h('input',{className:'form-input',type:'number',value:String(state.roomH)});
  hInput.addEventListener('input',e=>up({roomH:parseInt(e.target.value)||0}));
  grid.appendChild(h('div',null,h('label',{className:'form-label'},'寬 (cm)'),wInput));
  grid.appendChild(h('div',null,h('label',{className:'form-label'},'長 (cm)'),hInput));
  card.appendChild(grid);

  const presets = [{l:'小套房',w:350,h:300},{l:'標準',w:500,h:400},{l:'大空間',w:700,h:550}];
  card.appendChild(h('div',{className:'size-presets'},
    ...presets.map(p=>h('div',{
      className:`preset-btn${state.roomW===p.w?' active':''}`,
      onClick:()=>up({roomW:p.w,roomH:p.h})
    },p.l))
  ));
  card.appendChild(h('div',{className:'area-display'},'≈ '+calcArea()+' 坪'));
  return card;
}

function renderAnalysisResult() {
  const a = state.floorplanAnalysis;
  const wrap = h('div',{className:'animate-fade-up'});
  wrap.appendChild(h('div',{className:'card',style:{marginBottom:'12px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'📊'),'分析結果'),
    h('div',{className:'analysis-stats'},
      ...[{l:'格局',v:a.layout},{l:'面積',v:'≈'+a.totalArea},{l:'風水',v:a.fengshuiScore+'分'}].map((x,i)=>
        h('div',{className:'stat-box',style:{background:i===2?`${T.feng}10`:T.accentL}},
          h('div',{className:'stat-label'},x.l),
          h('div',{className:'stat-value',style:{color:i===2?(a.fengshuiScore>=70?T.success:a.fengshuiScore>=40?T.warn:T.error):T.text}},x.v)
        ))
    ),
    ...(a.rooms||[]).map((r,i)=>h('div',{className:'room-item'},
      h('div',{className:'room-header'},h('span',{className:'room-name'},r.name),h('span',{className:'room-area'},'≈'+r.area)),
      h('div',{className:'room-use'},'建議：'+r.suggestedUse),
      r.fengshuiNote?h('div',{className:'room-feng'},'🧭 '+r.fengshuiNote):null
    ))
  ));
  return wrap;
}

// ── Editor Page ──
function renderEditor() {
  const cont = h('div',{className:'animate-fade-up'});
  cont.appendChild(h('div',{className:'page-header',style:{marginBottom:'14px'}},
    h('h2',null,'空間編輯'),
    h('p',null,'拖曳家具到畫布上 · 風水即時提醒')
  ));

  // Toolbar
  const toolbar = h('div',{className:'editor-toolbar'});
  toolbar.appendChild(h('button',{className:'btn btn-primary btn-sm',onClick:()=>{showLib=!showLib;render()}},showLib?'✕ 關閉':'＋ 新增家具'));
  toolbar.appendChild(h('button',{className:`btn btn-sm ${showGrid?'btn-outline':' btn-ghost'}`,onClick:toggleGrid},showGrid?'▦ 網格 ON':'▦ 網格 OFF'));
  if(selectedUid) {
    const selItem = state.furniture.find(i=>i.uid===selectedUid);
    toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',onClick:()=>{
      up({furniture:state.furniture.map(i=>i.uid===selectedUid?{...i,rotation:(i.rotation+90)%360}:i)});
    }},'🔄 旋轉'));
    toolbar.appendChild(h('button',{className:'btn btn-danger btn-sm',onClick:()=>{
      up({furniture:state.furniture.filter(i=>i.uid!==selectedUid)});selectedUid=null;
    }},'🗑️'));
    if(selItem) toolbar.appendChild(h('span',{className:'selected-label'},selItem.label));
  }
  cont.appendChild(toolbar);

  // Feng shui warnings for selected
  const selWarns = fengWarnings.filter(w=>w.uid===selectedUid);
  if(selWarns.length) {
    cont.appendChild(h('div',{className:'feng-inline-warn'},
      ...selWarns.map(w=>h('div',{style:{fontSize:'12px',color:T.text,lineHeight:'1.7',display:'flex',alignItems:'center',gap:'6px'}},badge(w.severity),' '+w.msg))
    ));
  }

  // Canvas
  const items = state.furniture||[];
  const cW = Math.min(680, window.innerWidth-36);
  const SC = Math.min(cW/state.roomW, 400/state.roomH);
  const canW = state.roomW*SC, canH = state.roomH*SC;
  const hasFP = !!state.floorplanImg;

  const canvasBox = h('div',{className:'canvas-container'});
  const canvas = h('div',{className:'canvas-area',style:{
    width:canW+'px',height:canH+'px',
    backgroundImage:hasFP?`url(${state.floorplanImg})`:showGrid?`linear-gradient(90deg,${T.border}30 1px,transparent 1px),linear-gradient(${T.border}30 1px,transparent 1px)`:'none',
    backgroundSize:hasFP?'100% 100%':`${50*SC}px ${50*SC}px`,
    backgroundRepeat:hasFP?'no-repeat':'repeat',
    backgroundColor:hasFP?'transparent':'var(--card-alt)',
  }});
  canvas.addEventListener('click',()=>{selectedUid=null;render()});

  if(!hasFP) {
    const border = h('div',{style:{position:'absolute',inset:'0',border:`2px dashed ${T.accent}60`,borderRadius:'2px',pointerEvents:'none'}});
    canvas.appendChild(border);
  }

  const dirLabel = DIRECTIONS.find(d=>d.id===state.direction)?.label;
  if(dirLabel) canvas.appendChild(h('div',{className:'compass-badge'},'🧭 '+dirLabel));

  items.forEach(item=>{
    const rot=item.rotation===90||item.rotation===270;
    const dw=(rot?item.h:item.w)*SC, dh=(rot?item.w:item.h)*SC;
    const isSel=selectedUid===item.uid;
    const hasW=fengWarnings.some(w=>w.uid===item.uid);
    const el = h('div',{
      className:`furniture-item${dragState?.uid===item.uid?' dragging':''}`,
      style:{
        left:(item.x*SC-dw/2)+'px',top:(item.y*SC-dh/2)+'px',
        width:dw+'px',height:dh+'px',
        background:item.color||'#A09080',
        opacity:item.opacity||0.82,
        borderRadius:Math.min(dw,dh)>30?'4px':'2px',
        border:isSel?`2.5px solid ${T.accent}`:hasW?`2px solid ${T.warn}`:'1px solid rgba(0,0,0,.18)',
        boxShadow:isSel?`0 0 0 4px ${T.accent}30`:hasW?`0 0 0 3px ${T.warn}25`:'0 1px 4px rgba(0,0,0,.1)',
        cursor:dragState?.uid===item.uid?'grabbing':'grab',
        fontSize:Math.min(dw,dh)*0.45+'px',
        zIndex:isSel?10:item.opacity<0.5?0:1,
      }
    },h('span',{style:{pointerEvents:'none',filter:'drop-shadow(0 1px 2px rgba(0,0,0,.3))'}},item.icon));

    if(hasW&&!isSel) el.appendChild(h('div',{className:'warn-dot'},'!'));

    el.addEventListener('pointerdown',e=>{
      e.stopPropagation();e.preventDefault();
      selectedUid=item.uid;
      const rect=canvas.getBoundingClientRect();
      dragState={uid:item.uid,ox:(e.clientX-rect.left)/SC-item.x,oy:(e.clientY-rect.top)/SC-item.y,canvas};
      render();
    });
    canvas.appendChild(el);
  });

  canvasBox.appendChild(canvas);
  cont.appendChild(canvasBox);
  cont.appendChild(h('div',{className:'canvas-info'},`${state.roomW}cm × ${state.roomH}cm · ${items.length} 件家具`));

  // Furniture library
  if(showLib) {
    const lib = h('div',{className:'card furniture-lib animate-fade-scale'},
      h('div',{className:'section-title'},h('span',{className:'icon'},'🪑'),'家具庫')
    );
    FURNITURE.forEach(cat=>{
      const isOpen = catOpen===cat.cat;
      lib.appendChild(h('div',{className:'cat-header',onClick:()=>{catOpen=isOpen?null:cat.cat;render()}},
        h('span',{className:'cat-label'},cat.icon+' '+cat.cat),
        h('span',{className:`cat-arrow${isOpen?' open':''}`},'▼')
      ));
      if(isOpen) {
        const grid = h('div',{className:'cat-grid'});
        cat.items.forEach(item=>{
          grid.appendChild(h('div',{className:'furniture-btn',onClick:()=>{
            const n={...item,uid:Date.now()+Math.random(),x:state.roomW/2,y:state.roomH/2,rotation:0};
            up({furniture:[...state.furniture,n]});selectedUid=n.uid;showLib=false;
          }},
            h('span',{className:'f-icon'},item.icon),
            h('div',null,h('div',{className:'f-name'},item.label),h('div',{className:'f-size'},item.w+'×'+item.h+'cm'))
          ));
        });
        lib.appendChild(grid);
      }
    });
    cont.appendChild(lib);
  }
  return cont;
}
