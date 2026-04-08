// ── Floorplan Page ──
function renderFloorplan() {
  const cont = h('div',{className:'animate-fade-up'});
  const fpMode = state.floorplanImg ? 'upload' : null;

  if (!fpMode && !state._fpManual) {
    cont.appendChild(h('div',{className:'page-header'},
      h('h2',null,'空間設定'),
      h('p',null,'選擇您偏好的方式')
    ));
    const fileInput = h('input',{type:'file',accept:'image/*',style:{display:'none'},'aria-label':'上傳平面圖'});
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
    const img = h('img',{src:state.floorplanImg,alt:'上傳的平面圖'});
    preview.appendChild(img);
    if(dirLabel) preview.appendChild(h('div',{className:'direction-badge'},'🧭 門朝'+dirLabel));
    cont.appendChild(preview);

    cont.appendChild(h('div',{className:'floorplan-actions'},
      h('button',{className:'btn btn-primary',onClick:()=>showToast('⚠️ AI 分析需要 API Key 配置'),disabled:false,'aria-label':'AI 分析平面圖'},'🤖 AI 分析平面圖'),
      h('button',{className:'btn btn-outline',onClick:()=>{up({floorplanImg:null,floorplanAnalysis:null});state._fpManual=false;render()}},'重選')
    ));

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
  const wInput = h('input',{className:'form-input',type:'number',value:String(state.roomW),'aria-label':'寬度 cm'});
  wInput.addEventListener('input',e=>up({roomW:parseInt(e.target.value)||0}));
  const hInput = h('input',{className:'form-input',type:'number',value:String(state.roomH),'aria-label':'長度 cm'});
  hInput.addEventListener('input',e=>up({roomH:parseInt(e.target.value)||0}));
  grid.appendChild(h('div',null,h('label',{className:'form-label'},'寬 (cm)'),wInput));
  grid.appendChild(h('div',null,h('label',{className:'form-label'},'長 (cm)'),hInput));
  card.appendChild(grid);

  const presets = [{l:'小套房',w:350,h:300},{l:'標準',w:500,h:400},{l:'大空間',w:700,h:550}];
  card.appendChild(h('div',{className:'size-presets'},
    ...presets.map(p=>h('div',{
      className:`preset-btn${state.roomW===p.w?' active':''}`,
      onClick:()=>up({roomW:p.w,roomH:p.h}),
      role:'button'
    },p.l))
  ));
  // Area display with explanation (I: Detail)
  card.appendChild(h('div',{className:'area-display',title:'公式：寬(m) × 長(m) × 0.3025 = 坪'},'≈ '+calcArea()+' 坪'));
  card.appendChild(h('div',{style:{textAlign:'center',fontSize:'10px',color:'var(--text-ter)',marginTop:'4px'}},'（'+state.roomW+'cm × '+state.roomH+'cm = '+(state.roomW/100).toFixed(1)+'m × '+(state.roomH/100).toFixed(1)+'m）'));
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

// ── Editor Page with Enhanced Tools ──
function renderEditor() {
  const cont = h('div',{className:'animate-fade-up'});
  cont.appendChild(h('div',{className:'page-header',style:{marginBottom:'14px'}},
    h('h2',null,'空間編輯'),
    h('p',null,'拖曳家具到畫布上 · 風水即時提醒 · 快捷鍵：Del 刪除 / R 旋轉 / Ctrl+Z 復原')
  ));

  // Toolbar
  const tbCnt = h('div',{id:'toolbar-container'});
  tbCnt.appendChild(renderEditorToolbar());
  cont.appendChild(tbCnt);

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
  },role:'application','aria-label':'家具擺放畫布'});
  canvas.addEventListener('click',()=>{selectedUid=null;render()});

  if(!hasFP) {
    const border = h('div',{style:{position:'absolute',inset:'0',border:`2px dashed ${T.accent}60`,borderRadius:'2px',pointerEvents:'none'}});
    canvas.appendChild(border);
  }

  // --- Rulers ---
  if(showGrid && !hasFP) {
    const rulerH = h('div',{className:'ruler-h'});
    const rulerV = h('div',{className:'ruler-v'});
    
    for(let i=0; i<=state.roomW; i+=25) {
      const isMajor = i%100===0;
      const tick = h('div',{className:'ruler-tick','data-major':isMajor?'true':'false',style:{left:(i*SC)+'px'}});
      rulerH.appendChild(tick);
      if(isMajor && i>0 && i<state.roomW) tick.appendChild(h('div',{style:{position:'absolute',left:'2px',bottom:'8px',fontSize:'8px',color:'var(--text-ter)'}},i));
    }
    for(let i=0; i<=state.roomH; i+=25) {
      const isMajor = i%100===0;
      const tick = h('div',{className:'ruler-tick','data-major':isMajor?'true':'false',style:{top:(i*SC)+'px'}});
      rulerV.appendChild(tick);
      if(isMajor && i>0 && i<state.roomH) tick.appendChild(h('div',{style:{position:'absolute',top:'-10px',right:'10px',fontSize:'8px',color:'var(--text-ter)'}},i));
    }
    canvasBox.appendChild(rulerH);
    canvasBox.appendChild(rulerV);
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
      'data-uid': String(item.uid),
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
        zIndex:dragState?.uid===item.uid?100:isSel?10:item.opacity<0.5?0:1,
        touchAction:'none',
      },
      role:'button',
      'aria-label':item.label + ' (' + item.w + '×' + item.h + 'cm)',
    },h('span',{style:{
        pointerEvents:'none',
        filter:'drop-shadow(0 1px 2px rgba(0,0,0,.3))',
        transform:`rotate(${item.rotation||0}deg)`,
        transition:'transform 0.3s var(--ease-spring)',
        display:'inline-block'
    }},item.icon));

    if(hasW&&!isSel) el.appendChild(h('div',{className:'warn-dot'},'!'));

    // Show dimension label on selected item
    if(isSel) {
      el.appendChild(h('div',{className:'dim-label'},item.w+'×'+item.h+'cm'));
      if(item.rotation) el.appendChild(h('div',{className:'rot-label'},'↻'+item.rotation+'°'));
    }

    el.addEventListener('pointerdown',e=>{
      e.stopPropagation();
      const canvasEl = document.querySelector('.canvas-area') || canvas;
      const rect = canvasEl.getBoundingClientRect();
      
      const currentCw = Math.min(680, window.innerWidth - 36);
      const currentSc = Math.min(currentCw / state.roomW, 400 / state.roomH);

      dragState={
        uid:item.uid,
        ox:(e.clientX-rect.left)/currentSc - item.x,
        oy:(e.clientY-rect.top)/currentSc - item.y
      };
      
      if (selectedUid !== item.uid) {
        selectedUid=item.uid;
        updateSelectionVisuals(item.uid);
      }
    });
    
    canvas.appendChild(el);
  });

  // Coordinate display during drag
  canvas.appendChild(h('div',{className:'drag-coords',style:{display:dragState?'block':'none'}}));

  canvasBox.appendChild(canvas);
  cont.appendChild(canvasBox);

  // Canvas info bar
  const fengScore = calcDynamicFengScore();
  const scoreColor = fengScore>=70?'var(--success)':fengScore>=40?'var(--warn)':'var(--error)';
  const infoItems = [`${state.roomW}cm × ${state.roomH}cm`,`${items.length} 件家具`,`風水 ${fengScore}分`];
  if(showGrid) infoItems.push('📐 吸附 25cm');
  const infoBar = h('div',{className:'canvas-info'},
    h('span',null,infoItems.slice(0,2).join(' · ')),
    h('span',{style:{color:scoreColor,fontWeight:'700'}},`🧭 ${fengScore}分`),
    showGrid ? h('span',{style:{fontSize:'10px',color:'var(--text-ter)'}},'Shift=自由') : null
  );
  cont.appendChild(infoBar);

  // Furniture library
  if(showLib) {
    const lib = h('div',{className:'card furniture-lib animate-fade-scale'},
      h('div',{className:'section-title'},h('span',{className:'icon'},'🪑'),'家具庫')
    );
    FURNITURE.forEach(cat=>{
      // Filter baby items for non-parent persona
      if (cat.cat === '育兒防護(防撞無毒)' && state.persona !== 'parent') {
        // Still show but collapsed
      }
      const isOpen = catOpen===cat.cat;
      lib.appendChild(h('div',{className:'cat-header',onClick:()=>{catOpen=isOpen?null:cat.cat;render()}},
        h('span',{className:'cat-label'},cat.icon+' '+cat.cat),
        h('span',{className:'cat-label',style:{fontSize:'11px',color:'var(--text-ter)'}},cat.items.length+'件'),
        h('span',{className:`cat-arrow${isOpen?' open':''}`},'▼')
      ));
      if(isOpen) {
        const grid = h('div',{className:'cat-grid'});
        cat.items.forEach(item=>{
          grid.appendChild(h('div',{className:'furniture-btn',onClick:()=>{
            pushUndo();
            const n={...item,uid:Date.now()+Math.random(),x:state.roomW/2,y:state.roomH/2,rotation:0};
            state.furniture = [...state.furniture, n];
            saveState();
            selectedUid=n.uid;showLib=false;
            render();
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

// Helper to update selection visuals without triggering full render on drag start
function updateSelectionVisuals(uid) {
  const items = document.querySelectorAll('.furniture-item');
  items.forEach(el => {
    const isSel = el.getAttribute('data-uid') === String(uid);
    const hasW = el.querySelector('.warn-dot') !== null;
    el.style.border = isSel ? `2.5px solid ${T.accent}` : hasW ? `2px solid ${T.warn}` : '1px solid rgba(0,0,0,.18)';
    el.style.boxShadow = isSel ? `0 0 0 4px ${T.accent}30` : hasW ? `0 0 0 3px ${T.warn}25` : '0 1px 4px rgba(0,0,0,.1)';
    el.style.zIndex = String(dragState?.uid) === String(uid) ? 100 : isSel ? 10 : (el.style.opacity < 0.5 ? 0 : 1);
    
    const dim = el.querySelector('.dim-label'); if(dim) dim.remove();
    const rot = el.querySelector('.rot-label'); if(rot) rot.remove();
    
    if(isSel) {
      const item = state.furniture.find(i=>String(i.uid)===String(uid));
      if(item) {
        el.appendChild(h('div',{className:'dim-label'},item.w+'×'+item.h+'cm'));
        if(item.rotation) el.appendChild(h('div',{className:'rot-label'},'↻'+item.rotation+'°'));
      }
    }
  });

  const tbCnt = document.getElementById('toolbar-container');
  if(tbCnt) {
    tbCnt.innerHTML = '';
    tbCnt.appendChild(renderEditorToolbar());
  }
}

function renderEditorToolbar() {
  const toolbar = h('div',{className:'editor-toolbar'});
  toolbar.appendChild(h('button',{className:'btn btn-primary btn-sm',onClick:()=>{showLib=!showLib;render()},'aria-label':showLib?'關閉家具庫':'新增家具'},showLib?'✕ 關閉':'＋ 新增'));
  toolbar.appendChild(h('button',{className:`btn btn-sm ${showGrid?'btn-outline':'btn-ghost'}`,onClick:toggleGrid},showGrid?'▦ ON':'▦ OFF'));
  toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',style:{borderColor:'var(--accent)',color:'var(--accent)',background:'var(--accent-light)',fontWeight:'bold'},onClick:()=>typeof show3DPreview === 'function'?show3DPreview():showToast('正在載入 3D 引擎...'),'aria-label':'3D 預覽'},'🧊 3D'));
  
  // Undo/Redo buttons (H: QA)
  toolbar.appendChild(h('button',{className:'btn btn-ghost btn-sm',onClick:undo,title:'復原 (Ctrl+Z)','aria-label':'復原'},'⏪'));
  toolbar.appendChild(h('button',{className:'btn btn-ghost btn-sm',onClick:redo,title:'重做 (Ctrl+Y)','aria-label':'重做'},'⏩'));
  
  if(selectedUid) {
    const selItem = state.furniture.find(i=>i.uid===selectedUid);
    
    // Size editor (A: Designer / D: Tool Maker)
    toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',onClick:()=>{
       const newW = prompt('輸入新寬度 (cm)', selItem.w);
       const newH = prompt('輸入新長度 (cm)', selItem.h);
       if(newW && newH && !isNaN(newW) && !isNaN(newH)) {
         pushUndo();
         up({furniture:state.furniture.map(i=>String(i.uid)===String(selectedUid)?{...i,w:parseInt(newW),h:parseInt(newH)}:i)});
       }
    },'aria-label':'調整尺寸'},'📏'));
    
    // Alignment tools (A: Designer)
    toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',onClick:()=>alignFurniture('center-h'),title:'水平置中','aria-label':'水平置中'},'↔️'));
    toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',onClick:()=>alignFurniture('center-v'),title:'垂直置中','aria-label':'垂直置中'},'↕️'));
    toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',onClick:()=>alignFurniture('wall-bottom'),title:'靠牆','aria-label':'靠牆'},'⬇️'));

    toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',onClick:()=>{
      pushUndo();
      up({furniture:state.furniture.map(i=>String(i.uid)===String(selectedUid)?{...i,rotation:(i.rotation+90)%360}:i)});
    },'aria-label':'旋轉'},'🔄'));
    
    toolbar.appendChild(h('button',{className:'btn btn-outline btn-sm',onClick:()=>{
      pushUndo();
      const copy = JSON.parse(JSON.stringify(selItem));
      copy.uid = Date.now()+Math.random();
      copy.x += 20; copy.y += 20;
      up({furniture:[...state.furniture, copy]});
    },'aria-label':'複製'},'📋'));

    toolbar.appendChild(h('button',{className:'btn btn-danger btn-sm',onClick:()=>{
      pushUndo();
      up({furniture:state.furniture.filter(i=>String(i.uid)!==String(selectedUid))});selectedUid=null;
    },'aria-label':'刪除'},'🗑️'));
    
    if(selItem) toolbar.appendChild(h('span',{className:'selected-label'},selItem.label));
  }
  return toolbar;
}
