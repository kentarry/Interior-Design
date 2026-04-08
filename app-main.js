// ── Main Render ──
function render() {
  checkFengShui();
  const app = document.getElementById('app');
  app.innerHTML = '';

  const steps = getSteps();
  const cur = steps[step];

  // Header
  const headerActions = h('div',{className:'header-actions'},
    state.direction?h('div',{className:'header-direction'},'🧭 門朝'+(DIRECTIONS.find(d=>d.id===state.direction)?.label||'')):null,
    state.persona==='landlord'&&activeProjectId?h('button',{className:'btn-restart',style:{color:'var(--success)',borderColor:'var(--success)'},onClick:saveCurrentProject,'aria-label':'儲存物件'},'💾 儲存'):null,
    state.persona==='landlord'?h('button',{className:'btn-restart',onClick:()=>{showProjects=true;render()},style:{fontSize:'13px'},'aria-label':'物件管理'},'🏘️ 物件'):null,
    h('div',{className:'theme-toggle',onClick:toggleDark,title:'切換深色模式',role:'button','aria-label':'切換深色模式'},darkMode?'☀️':'🌙'),
    h('button',{className:'btn-restart',onClick:()=>{showHistory=true;render()},style:{fontSize:'14px',padding:'5px 10px'},'aria-label':'歷史方案'},'📋'),
    step>0?h('button',{className:'btn-restart',onClick:resetAll,'aria-label':'重新開始'},'重新開始'):null
  );
  const header = h('header',{className:'header',role:'banner'},
    h('div',{className:'header-brand'},
      h('h1',null,'室',h('span',{className:'dot'},'·'),'設計'),
      h('div',{className:'subtitle'},'AI INTERIOR STUDIO')
    ),
    headerActions
  );
  app.appendChild(header);

  // Progress
  if(step>0 && step<steps.length-1 && cur?.id!=='generating') {
    const prog = h('div',{className:'progress-bar',role:'progressbar','aria-valuenow':String(step),'aria-valuemax':String(steps.length-1)},
      h('div',{className:'progress-info'},
        h('span',{className:'progress-step-num'},'步驟 '+step+'/'+(steps.length-1)),
        h('span',{className:'progress-divider'},'·'),
        h('span',{className:'progress-step-name'},cur?.title)
      ),
      h('div',{className:'progress-track'},
        ...steps.map((_,i)=>h('div',{
          className:`progress-segment${i<step?' completed':''}${i===step?' current':''}`,
          onClick:()=>{if(i<=step)goTo(i)},
          style:{cursor:i<=step?'pointer':'default'}
        }))
      )
    );
    app.appendChild(prog);
  }

  // Content
  const main = h('main',{className:'main-content',role:'main'});
  let pageContent = null;
  switch(cur?.id) {
    case 'persona': pageContent = renderPersona(); break;
    case 'property': pageContent = renderProperty(); break;
    case 'direction': pageContent = renderDirection(); break;
    case 'floorplan': pageContent = renderFloorplan(); break;
    case 'style': pageContent = renderStyle(); break;
    case 'editor': pageContent = renderEditor(); break;
    case 'generating': pageContent = renderGenerate(); startGeneration(); break;
    case 'result': pageContent = renderResult(); break;
  }
  if(pageContent) main.appendChild(pageContent);
  app.appendChild(main);

  // Bottom Nav
  if(step>0 && step<steps.length-1 && cur?.id!=='generating') {
    const isLastBeforeGen = step===steps.length-2;
    const nav = h('div',{className:'bottom-nav',role:'navigation'},
      h('button',{className:'btn btn-outline',onClick:goBack,'aria-label':'上一步'},'← 上一步'),
      h('button',{className:'btn btn-primary',onClick:goNext,'aria-label':isLastBeforeGen?'生成設計方案':'下一步'},isLastBeforeGen?'生成設計方案 ✨':'下一步 →')
    );
    app.appendChild(nav);
  }

  // Feng shui float
  if(fengWarnings.length>0 && cur?.id==='editor') {
    const fw = h('div',{className:'fengshui-float',role:'alert'},
      h('div',{className:'feng-title'},'🧭 風水即時提醒'),
      ...fengWarnings.slice(0,3).map(w=>h('div',{className:'feng-item'},badge(w.severity),' ',w.label,'：',w.msg)),
      fengWarnings.length>3?h('div',{className:'feng-more'},'還有 '+(fengWarnings.length-3)+' 項...'):null
    );
    app.appendChild(fw);
  }

  // History Panel
  if(showHistory) {
    const overlay = h('div',{className:'history-overlay',onClick:()=>{showHistory=false;render()}});
    app.appendChild(overlay);
    const hist = getHistory();
    const panel = h('div',{className:'history-panel',role:'dialog','aria-label':'歷史方案'},
      h('div',{className:'history-header'},
        h('h3',null,'📋 歷史方案'),
        h('button',{className:'btn btn-ghost btn-sm',onClick:()=>{showHistory=false;render()},'aria-label':'關閉'},'✕ 關閉')
      ),
      h('div',{className:'history-list'},
        hist.length===0
          ? h('div',{className:'history-empty'},'尚無儲存的方案\n完成設計後可在此查閱')
          : null,
        ...hist.map(entry=>h('div',{className:'history-item',onClick:()=>loadFromHistory(entry)},
          h('span',{className:'hi-delete',onClick:e=>{e.stopPropagation();deleteHistory(entry.id);}},'🗑️'),
          h('div',{className:'hi-title'},entry.style+' · '+entry.area+'坪'),
          h('div',{className:'hi-meta'},entry.date+' · 門朝'+entry.direction)
        ))
      )
    );
    app.appendChild(panel);
  }

  // Projects Panel (Landlord Portfolio)
  if(showProjects) {
    const overlay2 = h('div',{className:'history-overlay',onClick:()=>{showProjects=false;render()}});
    app.appendChild(overlay2);
    const projects = getProjects();
    const stats = getProjectStats();
    const statusColors = {empty:'var(--warn)',renovating:'var(--accent)',renting:'var(--success)'};
    const statusLabels = {empty:'空屋',renovating:'裝修中',renting:'出租中'};
    const panel2 = h('div',{className:'history-panel',role:'dialog','aria-label':'物件管理中心'},
      h('div',{className:'history-header'},
        h('h3',null,'🏘️ 物件管理中心'),
        h('button',{className:'btn btn-ghost btn-sm',onClick:()=>{showProjects=false;render()},'aria-label':'關閉'},'✕')
      ),
      // Stats bar (B: Landlord)
      h('div',{style:{display:'flex',gap:'8px',padding:'12px 16px',borderBottom:'1px solid var(--border)'}},
        h('div',{style:{flex:1,textAlign:'center',padding:'8px',background:'var(--accent-light)',borderRadius:'8px'}},
          h('div',{style:{fontSize:'20px',fontWeight:'900',color:'var(--accent)'}},String(stats.total)),
          h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'總物件')
        ),
        h('div',{style:{flex:1,textAlign:'center',padding:'8px',background:'var(--success-light)',borderRadius:'8px'}},
          h('div',{style:{fontSize:'20px',fontWeight:'900',color:'var(--success)'}},String(stats.renting||0)),
          h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'出租中')
        ),
        h('div',{style:{flex:1,textAlign:'center',padding:'8px',background:'var(--card-alt)',borderRadius:'8px'}},
          h('div',{style:{fontSize:'14px',fontWeight:'700',color:'var(--text)',marginTop:'3px'}},stats.topStyle),
          h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'常用風格')
        )
      ),
      // New project button
      h('div',{style:{padding:'12px 16px'}},
        h('button',{className:'btn btn-primary btn-sm',style:{width:'100%'},onClick:()=>{
          state={...DEFAULT_STATE,persona:'landlord'};
          activeProjectId=null;step=1;showProjects=false;saveState();render();
        }},'＋ 新增物件')
      ),
      // Project list with status (B: Landlord)
      h('div',{className:'history-list'},
        projects.length===0
          ? h('div',{className:'history-empty'},'尚無物件\n點擊上方按鈕開始建立')
          : null,
        ...projects.map(proj=>{
          const sty=DESIGN_STYLES.find(s=>s.id===proj.state?.style);
          const isActive=activeProjectId===proj.id;
          const st = proj.status || 'empty';
          return h('div',{className:`history-item${isActive?' card-selected':''}`,onClick:()=>loadProject(proj)},
            h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}},
              h('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
                h('div',{className:'hi-title'},proj.name),
                h('span',{style:{fontSize:'10px',padding:'2px 8px',borderRadius:'var(--r-full)',background:statusColors[st]+'20',color:statusColors[st],fontWeight:'700'}},statusLabels[st])
              ),
              h('div',{style:{display:'flex',gap:'4px'}},
                h('span',{style:{fontSize:'11px',cursor:'pointer',padding:'2px 6px',borderRadius:'4px',background:'var(--accent-light)',color:'var(--accent)'},onClick:e=>{e.stopPropagation();cloneProject(proj)}},'📋'),
                h('span',{className:'hi-delete',onClick:e=>{e.stopPropagation();deleteProject(proj.id)}},'🗑️')
              )
            ),
            h('div',{className:'hi-meta'},
              (proj.addr?proj.addr+' · ':'')+
              (sty?sty.label+' · ':'')+
              proj.updatedAt+
              (proj.hasResult?' · ✅ 已完成':' · 📝 進行中')
            )
          );
        })
      )
    );
    app.appendChild(panel2);
  }
}

// ── Drag Handlers ──
window.addEventListener('pointermove',e=>{
  if(!dragState) return;
  e.preventDefault();

  const canvas = document.querySelector('.canvas-area');
  if(!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const cW = Math.min(680,window.innerWidth-36);
  const SC = Math.min(cW/state.roomW, 400/state.roomH);

  let newX = (e.clientX-rect.left)/SC - dragState.ox;
  let newY = (e.clientY-rect.top)/SC - dragState.oy;

  if(isNaN(newX) || isNaN(newY)) return;

  newX = Math.max(0, Math.min(state.roomW, newX));
  newY = Math.max(0, Math.min(state.roomH, newY));

  if(showGrid && !e.shiftKey) {
    newX = Math.round(newX/25)*25;
    newY = Math.round(newY/25)*25;
  }

  state.furniture = state.furniture.map(i=>i.uid===dragState.uid?{...i,x:newX,y:newY}:i);

  // Direct DOM update for smooth dragging (no full re-render)
  const el = document.querySelector(`[data-uid="${dragState.uid}"]`);
  if(el) {
    const item = state.furniture.find(i=>i.uid===dragState.uid);
    if(item) {
      const rot = item.rotation===90||item.rotation===270;
      const dw = (rot?item.h:item.w)*SC;
      const dh = (rot?item.w:item.h)*SC;
      el.style.left = (newX*SC - dw/2)+'px';
      el.style.top = (newY*SC - dh/2)+'px';
    }
  }

  const coordEl = document.querySelector('.drag-coords');
  if(coordEl) {
    coordEl.textContent = Math.round(newX)+', '+Math.round(newY)+' cm';
    coordEl.style.opacity = '1';
  }
}, {passive: false});

window.addEventListener('pointerup',()=>{
  if(dragState) {
    pushUndo(); // Save state before drag ends
    dragState = null;
    checkFengShui();
    saveState();
    render();
  }
});

window.addEventListener('pointercancel',()=>{
  if(dragState) {
    dragState = null;
    checkFengShui();
    saveState();
    render();
  }
});

// ── Keyboard Shortcuts (H: QA / A: Designer) ──
window.addEventListener('keydown', e => {
  const steps = getSteps();
  const cur = steps[step];
  
  // Only active in editor mode
  if (cur?.id !== 'editor') return;
  
  // Don't intercept when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedUid) {
      e.preventDefault();
      pushUndo();
      up({furniture:state.furniture.filter(i=>String(i.uid)!==String(selectedUid))});
      selectedUid = null;
    }
  }
  if (e.key === 'r' || e.key === 'R') {
    if (selectedUid) {
      e.preventDefault();
      pushUndo();
      up({furniture:state.furniture.map(i=>String(i.uid)===String(selectedUid)?{...i,rotation:(i.rotation+90)%360}:i)});
    }
  }
  if (e.key === 'g' || e.key === 'G') {
    e.preventDefault();
    toggleGrid();
  }
  if (e.key === 'Escape') {
    selectedUid = null;
    showLib = false;
    render();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    undo();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
    e.preventDefault();
    redo();
  }
  // Arrow keys for fine positioning
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key) && selectedUid) {
    e.preventDefault();
    const delta = e.shiftKey ? 25 : 5;
    pushUndo();
    up({furniture:state.furniture.map(i=>{
      if (String(i.uid)!==String(selectedUid)) return i;
      switch(e.key) {
        case 'ArrowUp': return {...i, y: Math.max(0, i.y - delta)};
        case 'ArrowDown': return {...i, y: Math.min(state.roomH, i.y + delta)};
        case 'ArrowLeft': return {...i, x: Math.max(0, i.x - delta)};
        case 'ArrowRight': return {...i, x: Math.min(state.roomW, i.x + delta)};
        default: return i;
      }
    })});
  }
});

// Scroll shadow on header
window.addEventListener('scroll',()=>{
  const hdr = document.querySelector('.header');
  if(hdr) hdr.classList.toggle('scrolled', window.scrollY>5);
});

// ── Init ──
applyTheme();
loadState();
render();
