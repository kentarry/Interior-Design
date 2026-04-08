// ── Page Renderers ──

function renderPersona() {
  const ps = [
    {id:'diy',icon:'🔨',title:'自己動手佈置',desc:'已有空間，想規劃家具擺放與風格',tag:'完整流程'},
    {id:'buyer',icon:'🏡',title:'初次買房',desc:'第一次購屋裝潢，從零開始規劃理想居家',tag:'新手推薦'},
    {id:'renovator',icon:'🏚️',title:'二手老屋翻修',desc:'管線重拉、拆除重點與預算評估',tag:'防坑必備'},
    {id:'parent',icon:'👶',title:'育兒家庭',desc:'打造安全防護、無毒的兒童成長環境',tag:'安全第一'},
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

  // Social proof (G: Strategy Partner)
  const proofBar = h('div',{className:'social-proof animate-fade-up delay-1'},
    h('div',{className:'proof-item'},h('span',{className:'proof-num'},'12,800+'),h('span',{className:'proof-label'},'設計方案')),
    h('div',{className:'proof-divider'}),
    h('div',{className:'proof-item'},h('span',{className:'proof-num'},'4.9'),h('span',{className:'proof-label'},'⭐ 評分')),
    h('div',{className:'proof-divider'}),
    h('div',{className:'proof-item'},h('span',{className:'proof-num'},'98%'),h('span',{className:'proof-label'},'滿意度'))
  );
  cont.appendChild(proofBar);

  const list = h('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}});
  ps.forEach((p,i) => {
    const card = h('div',{className:`persona-card animate-fade-up delay-${Math.min(i+1,6)}`, onClick:()=>{up({persona:p.id});goNext()}},
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

  // Trust badges (G: Strategy Partner)
  const trustBadges = h('div',{className:'trust-badges animate-fade-up delay-6'},
    h('div',{className:'trust-badge'},'🏆 2024 金點設計獎'),
    h('div',{className:'trust-badge'},'🔒 資料安全'),
    h('div',{className:'trust-badge'},'🌏 台灣在地化')
  );
  cont.appendChild(trustBadges);

  cont.appendChild(h('div',{className:'welcome-deco'},
    h('div',{className:'deco-line'},'由 AI 驅動的智慧設計 · 室設計股份有限公司')
  ));
  return cont;
}

// ═══════════════════════════════════════════
// PROPERTY INFO PAGE (Landlord/Buyer/Renovator/Parent)
// ═══════════════════════════════════════════
function renderProperty() {
  const isBuyer = state.persona === 'buyer';
  const isRenovator = state.persona === 'renovator';
  const isParent = state.persona === 'parent';
  const isLandlord = state.persona === 'landlord';
  const isHome = isBuyer || isRenovator || isParent;
  
  const cont = h('div',{className:'animate-fade-up'});
  cont.appendChild(h('div',{className:'page-header'},
    h('h2',null, isHome ? '新居資訊' : '物件資訊'),
    h('p',null, isHome ? '準備您的居家佈置計畫' : '設定您的出租物件基本資料')
  ));

  // Property name & address
  const infoCard = h('div',{className:'card',style:{marginBottom:'14px'}},
    h('div',{className:'section-title'},h('span',{className:'icon'},'🏠'), isHome ? '居家暱稱' : '物件名稱')
  );
  const nameInput = h('input',{className:'form-input',type:'text',placeholder:isHome?'例：我們的溫馨小窩':'例：信義路三段2樓A室',value:state.propertyName||'','aria-label':'物件名稱'});
  nameInput.addEventListener('input',e=>{state.propertyName=e.target.value;saveState()});
  infoCard.appendChild(h('div',{style:{marginBottom:'10px'}},h('label',{className:'form-label'},isHome?'居家暱稱':'物件名稱'),nameInput));
  const addrInput = h('input',{className:'form-input',type:'text',placeholder:isHome?'例：新北市板橋區...':'例：台北市信義區信義路三段',value:state.propertyAddr||'','aria-label':'地址'});
  addrInput.addEventListener('input',e=>{state.propertyAddr=e.target.value;saveState()});
  infoCard.appendChild(h('div',null,h('label',{className:'form-label'},'地址（選填）'),addrInput));
  cont.appendChild(infoCard);

  // Common property type
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
        style:{minWidth:'calc(50% - 6px)'},
        'aria-label':t.label,
        role:'button'
      },h('span',{className:'budget-icon'},t.icon),h('span',{className:'budget-label'},t.label),h('span',{className:'budget-range'},t.desc)))
    )
  ));

  if (isLandlord) {
    // Property status (B: Landlord)
    const statuses = [
      {id:'empty',label:'空屋',icon:'🏗️',color:'var(--warn)'},
      {id:'renovating',label:'裝修中',icon:'🔧',color:'var(--accent)'},
      {id:'renting',label:'出租中',icon:'✅',color:'var(--success)'},
    ];
    cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'📋'),'物件狀態'),
      h('div',{className:'tag-wrap'},
        ...statuses.map(s=>{
          const sel = state.propertyStatus === s.id;
          return h('span',{className:`tag${sel?' selected':''}`,style:{borderColor:sel?s.color:'transparent'},onClick:()=>up({propertyStatus:s.id})},s.icon+' '+s.label);
        })
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
  } else if (isParent) {
    // Parent specific fields
    const kidAges = [
      {id:'infant', label:'0-2歲 (嬰幼兒)', icon:'🍼'},
      {id:'toddler', label:'3-6歲 (學齡前)', icon:'🧸'},
      {id:'school', label:'7歲以上 (學齡期)', icon:'🎒'},
    ];
    cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'👶'),'孩童年齡階段'),
      h('div',{style:{fontSize:'12px',color:'var(--text-sec)',marginBottom:'12px'}},'我們將為您調整為無毒、防護、抗污的材質與動線建議'),
      h('div',{className:'tag-wrap'},
        ...kidAges.map(t=>{
          const sel=state.childAge===t.id;
          return h('span',{className:`tag${sel?' selected':''}`,onClick:()=>up({childAge:t.id})},t.icon+' '+t.label);
        })
      )
    ));

    // Safety info (F: Parents)
    cont.appendChild(h('div',{className:'card safety-alert-card',style:{marginBottom:'14px',borderLeft:'4px solid var(--warn)'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'🛡️'),'安全提醒'),
      h('div',{style:{fontSize:'12px',color:'var(--text)',lineHeight:'2'}},
        '✅ 所有推薦家具均為圓角、無毒認證材質',h('br'),
        '✅ 自動檢測走道寬度是否符合兒童安全（>80cm）',h('br'),
        '✅ 風水建議中包含兒童房最佳方位',h('br'),
        '⚠️ 報告中將標示【綠建材認證】與【SGS 檢驗合格】家具'
      )
    ));
  } else {
    // Buyer/Renovator specific fields
    const houseAges = [
      {id:'new', label:'新預售屋/新成屋', icon:'🏗️'},
      {id:'mid', label:'中古屋 (1-15年)', icon:'🏘️'},
      {id:'old', label:'老屋 (15年以上)', icon:'🏚️'},
    ];
    cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'🕰️'),'房屋屋齡'),
      h('div',{className:'tag-wrap'},
        ...houseAges.map(t=>{
          const sel=state.buyerHouseAge===t.id;
          return h('span',{className:`tag${sel?' selected':''}`,onClick:()=>up({buyerHouseAge:t.id})},t.icon+' '+t.label);
        })
      )
    ));
    if (isRenovator && state.buyerHouseAge === 'old') {
      // Hidden cost calculator (E: Renovator)
      cont.appendChild(h('div',{className:'card',style:{marginBottom:'14px',borderLeft:'4px solid var(--warn)'}},
        h('div',{className:'section-title'},h('span',{className:'icon'},'⚠️'),'老屋隱形工程預估'),
        h('div',{style:{fontSize:'12px',color:'var(--text)',lineHeight:'2.2'}},
          h('div',{style:{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid var(--border-light)'}},'🔌 水電管線重拉',h('span',{style:{fontWeight:'700',color:'var(--warn)'}},'$5-15萬')),
          h('div',{style:{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid var(--border-light)'}},'🚿 浴室防水工程',h('span',{style:{fontWeight:'700',color:'var(--warn)'}},'$3-8萬')),
          h('div',{style:{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid var(--border-light)'}},'🧱 壁癌/結構修補',h('span',{style:{fontWeight:'700',color:'var(--warn)'}},'$2-5萬')),
          h('div',{style:{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid var(--border-light)'}},'🪟 鋁窗氣密更換',h('span',{style:{fontWeight:'700',color:'var(--warn)'}},'$3-10萬')),
          h('div',{style:{display:'flex',justifyContent:'space-between',padding:'6px 0',fontWeight:'900',fontSize:'14px',color:'var(--error)'}},'💰 預估隱形費用總計','$13-38萬')
        ),
        h('div',{style:{fontSize:'11px',color:'var(--text-sec)',marginTop:'8px',padding:'8px',background:'var(--card-alt)',borderRadius:'6px'}},'⚠️ 15年以上老屋，建議預留 30-40% 預算用於水電管線與防水更新工程。實際金額依現場勘查為準。')
      ));
    }
  }

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
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('width','280');svg.setAttribute('height','280');svg.setAttribute('viewBox','0 0 280 280');
  svg.style.position='absolute';svg.style.left='0';svg.style.top='0';
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','風水羅盤選擇器');
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
      onClick:()=>up({direction:d.id}),
      role:'button',
      'aria-label':'門朝'+d.label,
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

    // Child-friendly direction tip (F: Parents)
    if (state.persona === 'parent') {
      const childDir = dir.element === '木' ? '有助於成長發育，非常適合兒童房！' 
        : dir.element === '水' ? '有助於學業與靜心，適合書房學習區。'
        : dir.element === '火' ? '能量較強，建議軟化為暖色調，避免過度刺激。'
        : dir.element === '土' ? '穩重踏實，有助於孩子情緒穩定。'
        : '清明理性，有助於培養紀律。';
      cont.appendChild(h('div',{style:{marginTop:'12px',padding:'12px 16px',background:'var(--success-light)',borderRadius:'var(--r-md)',fontSize:'13px',color:'var(--success)',fontWeight:'600'}},
        '🧒 育兒方位建議：'+childDir
      ));
    }
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
        onClick:()=>up({roomType:rt.id}),
        role:'button',
        'aria-label':rt.label
      },h('span',{className:'rt-icon'},rt.icon),h('span',{className:'rt-label'},rt.label)))
    )
  ));

  // Style list with enhanced visual
  const list = h('div',{className:'style-list'});
  DESIGN_STYLES.forEach((s,i) => {
    const sel = state.style===s.id;
    const card = h('div',{
      className:`style-card animate-fade-up delay-${Math.min(i+1,6)}${sel?' selected':''}`,
      onClick:()=>up({style:s.id}),
      role:'button',
      'aria-label':s.label+' 風格'
    },
      h('div',{className:'style-palette'},
        ...s.palette.map(c=>h('div',{className:'swatch',style:{background:c}}))
      ),
      h('div',null,
        h('div',{className:'style-name'},s.label),
        h('div',{className:'style-sub'},s.sub),
        // Color codes (A: Designer / I: Detail)
        sel ? h('div',{style:{fontSize:'10px',color:'var(--text-ter)',marginTop:'4px',letterSpacing:'0.5px'}},
          s.palette.map(c=>c.toUpperCase()).join(' · ')
        ) : null
      ),
      sel ? h('div',{className:'style-check'},'✓') : null
    );
    list.appendChild(card);
  });
  cont.appendChild(list);

  if (state.persona !== 'inspire') {
    // Budget with interactive calculator (C: First-time buyer / I: Detail)
    const budgets = [{id:'low',l:'經濟',r:'10-30萬',ic:'💰'},{id:'mid',l:'中等',r:'30-80萬',ic:'💎'},{id:'high',l:'高端',r:'80萬+',ic:'👑'}];
    const budgetCard = h('div',{className:'card',style:{marginTop:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'💰'),'預算'),
      h('div',{className:'budget-grid'},
        ...budgets.map(b=>h('div',{
          className:`budget-option${state.budget===b.id?' selected':''}`,
          onClick:()=>up({budget:b.id}),
          role:'button'
        },h('span',{className:'budget-icon'},b.ic),h('span',{className:'budget-label'},b.l),h('span',{className:'budget-range'},b.r)))
      )
    );

    // Custom budget input (C/I)
    if (state.budget) {
      const customRow = h('div',{style:{marginTop:'12px',display:'flex',alignItems:'center',gap:'8px'}});
      const budgetInput = h('input',{className:'form-input',type:'number',placeholder:'輸入精確預算（萬元）',value:state.customBudgetTotal||'',style:{flex:1},'aria-label':'自訂預算金額'});
      budgetInput.addEventListener('input',e=>{state.customBudgetTotal=parseInt(e.target.value)||null;saveState()});
      customRow.appendChild(h('span',{style:{fontSize:'12px',color:'var(--text-sec)',whiteSpace:'nowrap'}},'精確預算：'));
      customRow.appendChild(budgetInput);
      customRow.appendChild(h('span',{style:{fontSize:'12px',color:'var(--text-sec)'}},'萬'));
      budgetCard.appendChild(customRow);
    }
    cont.appendChild(budgetCard);

    // Occupants
    cont.appendChild(h('div',{className:'card',style:{marginTop:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'👥'),'居住人數'),
      h('div',{className:'occupant-grid'},
        ...[1,2,3,4,'5+'].map(n=>h('div',{
          className:`occupant-btn${state.occupants===n?' active':''}`,
          onClick:()=>up({occupants:n}),
          role:'button'
        },String(n)))
      )
    ));

    // Priorities - different for each persona
    const prioTags = state.persona === 'landlord'
      ? ['耐用好清潔','快速出租','高CP值','基本全配','智能門鎖','收納空間','光線氛圍','隔音效果','寵物友善','無障礙設計']
      : state.persona === 'parent'
      ? ['兒童安全','收納空間','光線氛圍','無毒材質','好清潔','隔音效果','學習區','遊戲空間']
      : state.persona === 'renovator'
      ? ['收納空間','管線更新','防水加強','光線氛圍','隔音效果','在家辦公','無障礙設計','節能省電']
      : ['收納空間','光線氛圍','兒童安全','寵物友善','智能家居','在家辦公','大量書籍','隔音效果'];
    const prioCard = h('div',{className:'card',style:{marginTop:'14px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'📝'),'需求'),
      h('div',{className:'tag-wrap',style:{marginBottom:'12px'}},
        ...prioTags.map(t=>{
          const sel=(state.priorities||[]).includes(t);
          return h('span',{className:`tag${sel?' selected':''}`,onClick:()=>{
            const p=state.priorities||[];
            up({priorities:sel?p.filter(x=>x!==t):[...p,t]});
          },role:'button'},t);
        })
      ),
    );
    const ta = document.createElement('textarea');
    ta.className='form-input';ta.placeholder='其他想法或特殊需求...';ta.value=state.notes||'';
    ta.setAttribute('aria-label','其他需求備註');
    ta.addEventListener('input',e=>{ state.notes=e.target.value; saveState(); });
    prioCard.appendChild(ta);
    cont.appendChild(prioCard);
  }
  return cont;
}
