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
    state.persona==='landlord'&&activeProjectId?h('button',{className:'btn-restart',style:{color:'var(--success)',borderColor:'var(--success)'},onClick:saveCurrentProject},'💾 儲存'):null,
    state.persona==='landlord'?h('button',{className:'btn-restart',onClick:()=>{showProjects=true;render()},style:{fontSize:'13px'}},'🏘️ 物件'):null,
    h('div',{className:'theme-toggle',onClick:toggleDark,title:'切換深色模式'},darkMode?'☀️':'🌙'),
    h('button',{className:'btn-restart',onClick:()=>{showHistory=true;render()},style:{fontSize:'14px',padding:'5px 10px'}},'📋'),
    step>0?h('button',{className:'btn-restart',onClick:resetAll},'重新開始'):null
  );
  const header = h('header',{className:'header'},
    h('div',{className:'header-brand'},
      h('h1',null,'室',h('span',{className:'dot'},'·'),'設計'),
      h('div',{className:'subtitle'},'AI INTERIOR STUDIO')
    ),
    headerActions
  );
  app.appendChild(header);

  // Progress
  if(step>0 && step<steps.length-1 && cur?.id!=='generating') {
    const prog = h('div',{className:'progress-bar'},
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
  const main = h('main',{className:'main-content'});
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
    const nav = h('div',{className:'bottom-nav'},
      h('button',{className:'btn btn-outline',onClick:goBack},'← 上一步'),
      h('button',{className:'btn btn-primary',onClick:goNext},step===steps.length-2?'生成設計方案 ✨':'下一步 →')
    );
    app.appendChild(nav);
  }

  // Feng shui float
  if(fengWarnings.length>0 && cur?.id==='editor') {
    const fw = h('div',{className:'fengshui-float'},
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
    const panel = h('div',{className:'history-panel'},
      h('div',{className:'history-header'},
        h('h3',null,'📋 歷史方案'),
        h('button',{className:'btn btn-ghost btn-sm',onClick:()=>{showHistory=false;render()}},'✕ 關閉')
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
    const panel2 = h('div',{className:'history-panel'},
      h('div',{className:'history-header'},
        h('h3',null,'🏘️ 物件管理中心'),
        h('button',{className:'btn btn-ghost btn-sm',onClick:()=>{showProjects=false;render()}},'✕')
      ),
      // Stats bar
      h('div',{style:{display:'flex',gap:'8px',padding:'12px 16px',borderBottom:'1px solid var(--border)'}},
        h('div',{style:{flex:1,textAlign:'center',padding:'8px',background:'var(--accent-light)',borderRadius:'8px'}},
          h('div',{style:{fontSize:'20px',fontWeight:'900',color:'var(--accent)'}},String(stats.total)),
          h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'總物件')
        ),
        h('div',{style:{flex:1,textAlign:'center',padding:'8px',background:'var(--success-light)',borderRadius:'8px'}},
          h('div',{style:{fontSize:'20px',fontWeight:'900',color:'var(--success)'}},String(stats.completed)),
          h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'已完成')
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
      // Project list
      h('div',{className:'history-list'},
        projects.length===0
          ? h('div',{className:'history-empty'},'尚無物件\n點擊上方按鈕開始建立')
          : null,
        ...projects.map(proj=>{
          const sty=DESIGN_STYLES.find(s=>s.id===proj.state?.style);
          const isActive=activeProjectId===proj.id;
          return h('div',{className:`history-item${isActive?' card-selected':''}`,onClick:()=>loadProject(proj)},
            h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}},
              h('div',{className:'hi-title'},proj.name),
              h('div',{style:{display:'flex',gap:'4px'}},
                h('span',{style:{fontSize:'11px',cursor:'pointer',padding:'2px 6px',borderRadius:'4px',background:'var(--accent-light)',color:'var(--accent)'},onClick:e=>{e.stopPropagation();cloneProject(proj)}},'📋 複製'),
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
  const canvas = dragState.canvas;
  if(!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const cW = Math.min(680,window.innerWidth-36);
  const SC = Math.min(cW/state.roomW, 400/state.roomH);
  const newX = Math.max(0,Math.min(state.roomW,(e.clientX-rect.left)/SC-dragState.ox));
  const newY = Math.max(0,Math.min(state.roomH,(e.clientY-rect.top)/SC-dragState.oy));
  state.furniture = state.furniture.map(i=>i.uid===dragState.uid?{...i,x:newX,y:newY}:i);
  saveState();
  render();
});

window.addEventListener('pointerup',()=>{
  if(dragState) { dragState=null; checkFengShui(); render(); }
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
