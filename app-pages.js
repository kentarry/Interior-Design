// ── Page Renderers ──

function renderPersona() {
  const ps = [
    {id:'diy',icon:'🔨',title:'自己動手佈置',desc:'已有空間，想規劃家具擺放與風格',tag:'完整流程'},
    {id:'plan',icon:'📋',title:'裝修前規劃',desc:'準備裝潢，需要完整方案與預算表',tag:'最詳細'},
    {id:'landlord',icon:'🏘️',title:'房東批量管理',desc:'多間物件設計、範本套用、出租導向',tag:'房東專屬'},
    {id:'inspire',icon:'💡',title:'靈感探索',desc:'先看看風格、配色、風水建議',tag:'快速體驗'},
  ];
  const cont = h('div',{className:'animate-fade-up'});
  const header = h('div',{className:'page-header'},
    h('span',{className:'hero-icon'},'🏠'),
    h('h2',null,'歡迎來到室',h('span',{style:{color:T.accent}},'·'),'設計'),
    h('p',null,'AI 設計師 × 風水顧問，打造您的理想空間')
  );
  cont.appendChild(header);

  const list = h('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}});
  ps.forEach((p,i) => {
    const card = h('div',{className:`persona-card animate-fade-up delay-${i+1}`, onClick:()=>{up({persona:p.id});goNext()}},
      h('div',{className:'persona-icon'},p.icon),
      h('div',{className:'persona-info'},
        h('div',{className:'persona-title-row'},
          h('span',{className:'persona-title'},p.title),
          h('span',{className:'persona-tag'},p.tag)
        ),
        h('div',{className:'persona-desc'},p.desc)
      ),
      h('span',{className:'persona-arrow'},'→')
    );
    list.appendChild(card);
  });
  cont.appendChild(list);

  // Portfolio quick access for returning landlords
  const projects = getProjects();
  if (projects.length > 0) {
    const portfolioCard = h('div',{className:'card animate-fade-up delay-5',style:{marginTop:'16px',cursor:'pointer',borderColor:'var(--accent)',borderWidth:'1.5px'},onClick:()=>{showProjects=true;render()}},
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:'12px'}},
          h('span',{style:{fontSize:'28px'}},'📊'),
          h('div',null,
            h('div',{style:{fontSize:'15px',fontWeight:'700',color:'var(--text)'}},'物件管理中心'),
            h('div',{style:{fontSize:'12px',color:'var(--text-sec)',marginTop:'2px'}},`已有 ${projects.length} 個物件 · ${projects.filter(p=>p.hasResult).length} 個完成方案`)
          )
        ),
        h('span',{style:{fontSize:'18px',color:'var(--accent)'}},'→')
      )
    );
    cont.appendChild(portfolioCard);
  }

  // Quick tips
  const tips = h('div',{className:'quick-tips animate-fade-up delay-6'},
    h('h3',null,'✨ 使用指南'),
    ...[
      '選擇您的使用模式，系統會引導您完成設計',
      '設定大門朝向，獲得專業風水建議',
      '上傳平面圖或手動輸入尺寸',
      'AI 將生成完整設計方案與預算表',
    ].map((t,i) => h('div',{className:'quick-tip-item'},
      h('div',{className:'quick-tip-num'},String(i+1)),
      h('div',{className:'quick-tip-text'},t)
    ))
  );
  cont.appendChild(tips);

  cont.appendChild(h('div',{className:'welcome-deco'},
    h('div',{className:'deco-line'},'由 AI 驅動的智慧設計')
  ));
  return cont;
}

// ═══════════════════════════════════════════
// LANDLORD: Property Info Page
// ═══════════════════════════════════════════
function renderProperty() {
  const cont = h('div',{className:'animate-fade-up'});
  cont.appendChild(h('div',{className:'page-header'},
    h('h2',null,'物件資訊'),
    h('p',null,'設定您的出租物件基本資料')
  ));

  // Property name & address
  const infoCard = h('div',{className:'card',style:{marginBottom:'14px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'🏠'),'物件名稱')
  );
  const nameInput = h('input',{className:'form-input',type:'text',placeholder:'例：信義路三段2樓A室',value:state.propertyName||''});
  nameInput.addEventListener('input',e=>{state.propertyName=e.target.value;saveState()});
  infoCard.appendChild(h('div',{style:{marginBottom:'10px'}},h('label',{className:'form-label'},'物件名稱'),nameInput));
  const addrInput = h('input',{className:'form-input',type:'text',placeholder:'例：台北市信義區信義路三段',value:state.propertyAddr||''});
  addrInput.addEventListener('input',e=>{state.propertyAddr=e.target.value;saveState()});
  infoCard.appendChild(h('div',null,h('label',{className:'form-label'},'地址（選填）'),addrInput));
  cont.appendChild(infoCard);

  // Property type
  const types = [
    {id:'studio',label:'套房',icon:'🏢',desc:'10-15坪'},
    {id:'1bed',label:'一房一廳',icon:'🏠',desc:'15-25坪'},
    {id:'2bed',label:'兩房',icon:'🏡',desc:'25-35坪'},
    {id:'3bed',label:'三房以上',icon:'🏘️',desc:'35坪+'},
  ];
  cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'📐'),'物件類型'),
    h('div',{className:'budget-grid',style:{flexWrap:'wrap'}},
      ...types.map(t=>h('div',{
        className:`budget-option${state.propertyType===t.id?' selected':''}`,
        onClick:()=>up({propertyType:t.id}),
        style:{minWidth:'calc(50% - 6px)'}
      },h('span',{className:'budget-icon'},t.icon),h('span',{className:'budget-label'},t.label),h('span',{className:'budget-range'},t.desc)))
    )
  ));

  // Rental target audience
  const targets = [
    {id:'student',label:'學生',icon:'🎓'},
    {id:'worker',label:'上班族',icon:'💼'},
    {id:'family',label:'小家庭',icon:'👨‍👩‍👧'},
    {id:'executive',label:'高端商務',icon:'👔'},
    {id:'expat',label:'外籍人士',icon:'🌍'},
    {id:'elderly',label:'銀髮族',icon:'🧓'},
  ];
  cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'🎯'),'目標租客'),
    h('div',{className:'tag-wrap'},
      ...targets.map(t=>{
        const sel=state.rentalTarget===t.id;
        return h('span',{className:`tag${sel?' selected':''}`,onClick:()=>up({rentalTarget:t.id})},t.icon+' '+t.label);
      })
    )
  ));

  // Rental budget per unit
  const rBudgets = [
    {id:'minimal',label:'極簡出租',range:'5-10萬/間',icon:'💡',desc:'基本家具家電'},
    {id:'standard',label:'品質出租',range:'10-20萬/間',icon:'⭐',desc:'舒適完善配置'},
    {id:'premium',label:'高端出租',range:'20萬+/間',icon:'👑',desc:'精裝全配'},
  ];
  cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'💰'),'單間裝修預算'),
    h('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
      ...rBudgets.map(rb=>h('div',{
        className:`persona-card${state.rentalBudget===rb.id?' card-selected':''}`,
        style:{padding:'14px 16px'},
        onClick:()=>up({rentalBudget:rb.id})
      },
        h('span',{style:{fontSize:'24px'}},rb.icon),
        h('div',{style:{flex:1}},
          h('div',{style:{fontSize:'14px',fontWeight:'700',color:'var(--text)'}},rb.label),
          h('div',{style:{fontSize:'12px',color:'var(--text-sec)',marginTop:'2px'}},rb.range+' · '+rb.desc)
        )
      ))
    )
  ));

  // Quick templates
  cont.appendChild(h('div',{className:'card'},
    h('div',{className:'section-title'},h('span',{className:'icon'},'📋'),'快速範本（一鍵套用）'),
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
      ...[
        {id:'studio',label:'套房範本',icon:'🏢',desc:'小坪數高CP值'},
        {id:'oneBed',label:'一房範本',icon:'🏠',desc:'上班族最愛'},
        {id:'twoBed',label:'兩房範本',icon:'🏡',desc:'家庭型出租'},
        {id:'threeBed',label:'三房範本',icon:'🏘️',desc:'大坪數規劃'},
      ].map(t=>h('div',{
        className:'furniture-btn',
        style:{padding:'14px',textAlign:'center',flexDirection:'column',justifyContent:'center'},
        onClick:()=>createFromTemplate(t.id)
      },
        h('span',{style:{fontSize:'28px',display:'block',marginBottom:'4px'}},t.icon),
        h('div',{className:'f-name',style:{textAlign:'center'}},t.label),
        h('div',{className:'f-size',style:{textAlign:'center'}},t.desc)
      ))
    )
  ));

  return cont;
}

function renderDirection() {
  const cont = h('div',{className:'animate-fade-up'});
  cont.appendChild(h('div',{className:'page-header'},
    h('h2',null,'大門朝向'),
    h('p',null,'風水的第一步 · 影響後續所有建議')
  ));

  // Compass
  const cWrap = h('div',{className:'compass-wrapper'});
  // SVG background
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('width','280');svg.setAttribute('height','280');svg.setAttribute('viewBox','0 0 280 280');
  svg.style.position='absolute';svg.style.left='0';svg.style.top='0';
  const c1 = document.createElementNS(ns,'circle');
  c1.setAttribute('cx','140');c1.setAttribute('cy','140');c1.setAttribute('r','125');
  c1.setAttribute('fill','none');c1.setAttribute('stroke',T.border);c1.setAttribute('stroke-width','1');
  svg.appendChild(c1);
  const c2 = document.createElementNS(ns,'circle');
  c2.setAttribute('cx','140');c2.setAttribute('cy','140');c2.setAttribute('r','90');
  c2.setAttribute('fill','none');c2.setAttribute('stroke','#EFEBE5');c2.setAttribute('stroke-width','0.5');
  c2.setAttribute('stroke-dasharray','4 4');
  svg.appendChild(c2);
  cWrap.appendChild(svg);

  DIRECTIONS.forEach(d => {
    const r=108, rad=(d.deg-90)*Math.PI/180;
    const x=140+r*Math.cos(rad), y=140+r*Math.sin(rad);
    const sel = state.direction===d.id;
    const btn = h('div',{
      className:`compass-btn${sel?' selected':''}`,
      style:{
        left:(x-25)+'px', top:(y-25)+'px',
        background:sel?d.color:T.card,
        borderColor:sel?d.color:T.border,
        boxShadow:sel?`0 4px 16px ${d.color}40`:'var(--shadow-sm)',
      },
      onClick:()=>up({direction:d.id})
    },
      h('span',{className:'dir-label',style:{color:sel?'#fff':T.text}},d.label),
      h('span',{className:'dir-element',style:{color:sel?'rgba(255,255,255,.7)':T.textTer}},d.element)
    );
    cWrap.appendChild(btn);
  });

  cWrap.appendChild(h('div',{className:'compass-center'},'🚪'));
  cont.appendChild(h('div',{className:'compass-container'},cWrap));

  // Direction info
  const dir = DIRECTIONS.find(d=>d.id===state.direction);
  if (dir) {
    const ec = ELEM_COLORS[dir.element];
    const info = h('div',{className:'card direction-info',style:{marginTop:'16px',borderColor:`${dir.color}40`}},
      h('div',{className:'direction-header'},
        h('div',{className:'direction-icon-box',style:{background:`${dir.color}15`}},dir.emoji),
        h('div',null,
          h('div',{className:'direction-name',style:{color:dir.color}},`${dir.label}方 · ${dir.element}屬性`),
          h('div',{className:'direction-tip'},dir.tip)
        )
      ),
      ec ? h('div',{className:'color-advice'},`🎨 配色建議 — 宜用：${ec.good} ｜ 避免：${ec.avoid}`) : null
    );
    cont.appendChild(info);
  }
  return cont;
}

function renderStyle() {
  const cont = h('div',{className:'animate-fade-up'});
  cont.appendChild(h('div',{className:'page-header'},
    h('h2',null,'風格探索'),
    h('p',null,'選擇最能代表您品味的設計風格')
  ));

  const dir = DIRECTIONS.find(d=>d.id===state.direction);
  if (dir) {
    const ec = ELEM_COLORS[dir.element];
    cont.appendChild(h('div',{className:'element-tip',style:{background:`${T.feng}08`,border:`1px solid ${T.feng}30`,borderRadius:'12px'}},
      h('span',{className:'element-icon'},dir.emoji),
      h('span',{className:'element-text',style:{color:T.feng}},`${dir.element}屬性配色建議：${ec?.good||''}`)
    ));
  }

  // Room type selector
  cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'🏠'),'空間類型'),
    h('div',{className:'room-type-grid'},
      ...ROOM_TYPES.map(rt => h('div',{
        className:`room-type-btn${state.roomType===rt.id?' active':''}`,
        onClick:()=>up({roomType:rt.id})
      },h('span',{className:'rt-icon'},rt.icon),h('span',{className:'rt-label'},rt.label)))
    )
  ));

  // Style list
  const list = h('div',{className:'style-list'});
  DESIGN_STYLES.forEach((s,i) => {
    const sel = state.style===s.id;
    const card = h('div',{
      className:`style-card animate-fade-up delay-${Math.min(i+1,6)}${sel?' selected':''}`,
      onClick:()=>up({style:s.id})
    },
      h('div',{className:'style-palette'},
        ...s.palette.map(c=>h('div',{className:'swatch',style:{background:c}}))
      ),
      h('div',null,
        h('div',{className:'style-name'},s.label),
        h('div',{className:'style-sub'},s.sub)
      ),
      sel ? h('div',{className:'style-check'},'✓') : null
    );
    list.appendChild(card);
  });
  cont.appendChild(list);

  if (state.persona !== 'inspire') {
    // Budget
    const budgets = [{id:'low',l:'經濟',r:'10-30萬',ic:'💰'},{id:'mid',l:'中等',r:'30-80萬',ic:'💎'},{id:'high',l:'高端',r:'80萬+',ic:'👑'}];
    cont.appendChild(h('div',{className:'card',style:{marginTop:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'💰'),'預算'),
      h('div',{className:'budget-grid'},
        ...budgets.map(b=>h('div',{
          className:`budget-option${state.budget===b.id?' selected':''}`,
          onClick:()=>up({budget:b.id})
        },h('span',{className:'budget-icon'},b.ic),h('span',{className:'budget-label'},b.l),h('span',{className:'budget-range'},b.r)))
      )
    ));

    // Occupants
    cont.appendChild(h('div',{className:'card',style:{marginTop:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'👥'),'居住人數'),
      h('div',{className:'occupant-grid'},
        ...[1,2,3,4,'5+'].map(n=>h('div',{
          className:`occupant-btn${state.occupants===n?' active':''}`,
          onClick:()=>up({occupants:n})
        },String(n)))
      )
    ));

    // Priorities
    // Priorities - different for landlord
    const prioTags = state.persona === 'landlord'
      ? ['耐用好清潔','快速出租','高CP值','基本全配','智能門鎖','收納空間','光線氛圍','隔音效果','寵物友善','無障礙設計']
      : ['收納空間','光線氛圍','兒童安全','寵物友善','智能家居','在家辦公','大量書籍','隔音效果'];
    const prioCard = h('div',{className:'card',style:{marginTop:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'📝'),'需求'),
      h('div',{className:'tag-wrap',style:{marginBottom:'12px'}},
        ...prioTags.map(t=>{
          const sel=(state.priorities||[]).includes(t);
          return h('span',{className:`tag${sel?' selected':''}`,onClick:()=>{
            const p=state.priorities||[];
            up({priorities:sel?p.filter(x=>x!==t):[...p,t]});
          }},t);
        })
      ),
    );
    const ta = document.createElement('textarea');
    ta.className='form-input';ta.placeholder='其他想法或特殊需求...';ta.value=state.notes||'';
    ta.addEventListener('input',e=>{ state.notes=e.target.value; saveState(); });
    prioCard.appendChild(ta);
    cont.appendChild(prioCard);
  }
  return cont;
}
