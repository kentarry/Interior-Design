// ── Result Page ──
function renderResult() {
  const r = state.aiResult;
  if(!r||r.error) {
    return h('div',{className:'error-state animate-fade-up'},
      h('div',{className:'error-icon'},'😔'),
      h('div',{className:'error-msg'},'方案生成失敗'),
      h('p',{style:{fontSize:'13px',color:'var(--text-sec)',marginBottom:'16px'}},'可能是資料不完整，請返回檢查設定後重試'),
      h('button',{className:'btn btn-primary',onClick:()=>{up({aiResult:null});goTo(getSteps().length-2)}},'重新生成')
    );
  }
  const cont = h('div',{className:'animate-fade-up'});
  const sty=DESIGN_STYLES.find(s=>s.id===state.style);
  const dir=DIRECTIONS.find(d=>d.id===state.direction);
  const dynamicScore = calcDynamicFengScore();
  const fs=r.fengshuiReport;
  // Override static score with dynamic
  if (fs) fs.score = dynamicScore;

  const isLandlord = state.persona === 'landlord';
  const isBuyer = state.persona === 'buyer';
  const isRenovator = state.persona === 'renovator';
  const isParent = state.persona === 'parent';

  // Banner
  cont.appendChild(h('div',{className:'result-banner'},
    h('h2',null,isLandlord && state.propertyName ? state.propertyName+' 設計方案' : '您的專屬設計方案'),
    h('div',{className:'result-meta'},
      h('span',{className:'meta-tag'},sty?.label||'現代'),
      h('span',{className:'meta-tag'},calcArea()+'坪'),
      h('span',{className:'meta-tag'},'門朝'+(dir?.label||'南')),
      h('span',{className:'meta-tag',style:{color:dynamicScore>=70?'var(--success)':dynamicScore>=40?'var(--warn)':'var(--error)'}},'風水 '+dynamicScore+'分'),
      isLandlord?h('span',{className:'meta-tag',style:{background:'var(--success-light)',color:'var(--success)'}},'🏘️ 出租版'):null,
      isParent?h('span',{className:'meta-tag',style:{background:'var(--success-light)',color:'var(--success)'}},'👶 育兒安全版'):null
    )
  ));

  // Tabs
  const tabs=[
    {id:'concept',l:'設計理念',ic:'💡'},
    {id:'layout',l:'空間配置',ic:'📐'},
    {id:'furniture',l:'家具清單',ic:'🪑'},
    {id:'color',l:'配色燈光',ic:'🎨'},
    {id:'budget',l:'預算明細',ic:'💰'},
    {id:'fengshui',l:'風水報告',ic:'🧭'},
    {id:'tips',l:'建議',ic:'📝'}
  ];
  if(isLandlord && r.rentalTip) tabs.splice(5,0,{id:'rental',l:'出租估算',ic:'📊'});
  if((isBuyer || isRenovator) && r.buyerChecklist) {
    tabs.push({id:'buyerCheck', l: isRenovator ? '翻修清單' : '新手清單', ic:'✅'});
  }
  if(isParent) {
    tabs.push({id:'safetyCheck', l:'安全清單', ic:'🛡️'});
    tabs.push({id:'growthTimeline', l:'成長建議', ic:'📅'});
  }

  const tabNav = h('div',{className:'tab-nav',role:'tablist'});
  tabs.forEach(t=>{
    tabNav.appendChild(h('button',{
      className:`tab-btn${resultTab===t.id?' active':''}`,
      onClick:()=>{resultTab=t.id;render()},
      role:'tab',
      'aria-selected':resultTab===t.id?'true':'false',
      'aria-label':t.l
    },t.ic+' '+t.l));
  });
  cont.appendChild(tabNav);

  // Tab content
  const content = h('div',{className:'animate-fade-up',role:'tabpanel'});

  if(resultTab==='concept') {
    content.appendChild(h('div',{className:'card'},
      h('div',{className:'section-title'},h('span',{className:'icon'},'💡'),'設計理念'),
      h('div',{className:'ai-hero-img',style:{background:'url("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800")',backgroundSize:'cover',backgroundPosition:'center',height:'200px',borderRadius:'8px',marginBottom:'12px',boxShadow:'var(--shadow-sm)'}}),
      h('p',{className:'result-text'},r.concept),
      h('button',{className:'btn btn-outline',style:{width:'100%',marginTop:'12px'},onClick:()=>{
        up({advancedEditMode: true});
        const steps = getSteps();
        const edIdx = steps.findIndex(s=>s.id==='editor');
        if(edIdx>=0) goTo(edIdx);
      }},'🔍 查看 AI 生成的平面圖配置')
    ));
  }
  if(resultTab==='layout') {
    content.appendChild(h('div',{className:'card'},
      h('div',{className:'section-title'},h('span',{className:'icon'},'📐'),'空間配置'),
      h('p',{className:'result-text'},r.layout)
    ));
  }
  if(resultTab==='furniture') {
    const card = h('div',{className:'card'},h('div',{className:'section-title'},h('span',{className:'icon'},'🪑'),'家具清單'));
    // Price timestamp (I: Detail)
    card.appendChild(h('div',{style:{fontSize:'10px',color:'var(--text-ter)',marginBottom:'12px',padding:'6px 10px',background:'var(--card-alt)',borderRadius:'6px'}},
      '💡 價格參考時間：2024年Q4 · 實際售價以各通路為準 · 🔗 點選品牌可直接查看'
    ));
    (r.furnitureList||[]).forEach(f=>{
      card.appendChild(h('div',{className:'furniture-entry',style:{display:'flex',flexDirection:'column'}},
        h('div',{className:'entry-name'},f.item),
        h('div',{className:'entry-details',innerHTML:`📏 ${f.spec} · 🪵 ${f.material}<br>💰 ${f.price} · 🏷️ ${f.brand}<br>📍 ${f.placement}`}),
        h('div',{style:{textAlign:'right',marginTop:'10px'}},
          h('button',{className:'btn btn-sm btn-primary',style:{background:'#0058a3',borderColor:'#0058a3',color:'#fff'},onClick:()=>showToast('🛒 已建立購物車連結！')},'🛒 加到購物車')
        )
      ));
    });
    content.appendChild(card);
  }
  if(resultTab==='color') {
    const cp = r.colorPlan;
    if(cp) {
      const colorCard = h('div',{className:'card',style:{marginBottom:'12px'}},
        h('div',{className:'section-title'},h('span',{className:'icon'},'🎨'),'配色方案'),
        h('div',{className:'color-bar'},
          h('div',{className:'color-seg',style:{flex:3,background:cp.primary}},h('span',{className:'color-label'},cp.primary)),
          h('div',{className:'color-seg',style:{flex:2,background:cp.secondary}},h('span',{className:'color-label'},cp.secondary)),
          h('div',{className:'color-seg',style:{flex:1,background:cp.accent}},h('span',{className:'color-label'},cp.accent))
        ),
        // Color codes (A: Designer / I: Detail)
        h('div',{style:{display:'flex',gap:'8px',marginBottom:'12px',flexWrap:'wrap'}},
          ...[{label:'主色',hex:cp.primary},{label:'輔色',hex:cp.secondary},{label:'點綴',hex:cp.accent}].map(c=>
            h('div',{style:{fontSize:'11px',padding:'4px 10px',background:'var(--card-alt)',borderRadius:'var(--r-sm)',color:'var(--text-sec)'}},c.label+': '+c.hex.toUpperCase())
          )
        ),
        h('p',{className:'result-text'},cp.description),
        cp.wall?h('div',{style:{fontSize:'12px',color:T.textSec,marginTop:'10px'}},'🧱 牆面：'+cp.wall):null,
        cp.floor?h('div',{style:{fontSize:'12px',color:T.textSec,marginTop:'4px'}},'🪵 地板：'+cp.floor):null
      );
      content.appendChild(colorCard);
    }
    content.appendChild(h('div',{className:'card'},
      h('div',{className:'section-title'},h('span',{className:'icon'},'💡'),'燈光設計'),
      h('p',{className:'result-text'},r.lighting)
    ));
    // Storage section
    if(r.storage) {
      content.appendChild(h('div',{className:'card',style:{marginTop:'12px'}},
        h('div',{className:'section-title'},h('span',{className:'icon'},'🗄️'),'收納規劃'),
        h('p',{className:'result-text'},r.storage)
      ));
    }
  }
  if(resultTab==='budget') {
    const card = h('div',{className:'card'},h('div',{className:'section-title'},h('span',{className:'icon'},'💰'),'預算分配'));
    
    // Interactive budget calculator (C: First-time Buyer / I: Detail)
    if(state.customBudgetTotal) {
      card.appendChild(h('div',{style:{padding:'12px',background:'var(--accent-light)',borderRadius:'var(--r-md)',marginBottom:'16px',textAlign:'center'}},
        h('div',{style:{fontSize:'11px',color:'var(--text-sec)'}},'您設定的總預算'),
        h('div',{style:{fontSize:'24px',fontWeight:'900',color:'var(--accent)'}},state.customBudgetTotal+'萬')
      ));
    }

    (r.budgetTable||[]).forEach(b=>{
      const actualAmt = state.customBudgetTotal ? Math.round(state.customBudgetTotal * b.pct / 100) : null;
      card.appendChild(h('div',{className:'budget-row'},
        h('div',{className:'budget-pct'},b.pct+'%'),
        h('div',{className:'budget-bar'},h('div',{className:'budget-bar-fill',style:{width:b.pct+'%'}})),
        h('div',{className:'budget-details'},
          h('div',{className:'budget-cat'},b.category),
          h('div',{className:'budget-amt'},actualAmt ? `${actualAmt}萬 (${b.amount})` : b.amount)
        )
      ));
    });
    // Contractor CTA (G: Strategy Partner)
    card.appendChild(h('div',{className:'contractor-cta',style:{marginTop:'20px',padding:'16px',background:'linear-gradient(135deg, var(--accent-light), rgba(184,149,106,0.08))',borderRadius:'12px',textAlign:'center',border:'1px solid rgba(184,149,106,0.2)'}},
      h('h4',{style:{color:'var(--accent)',marginBottom:'8px',fontWeight:'900',fontSize:'16px'}},'👷‍♂️ 需要專業工班？'),
      h('p',{style:{fontSize:'13px',color:'var(--text)',marginBottom:'12px'}},'我們已為您備妥清單，發送後將由 3 家在地優良統包向您報價（免費免手續費）'),
      h('button',{className:'btn btn-primary',style:{width:'100%',fontWeight:'900',background:'var(--accent)',fontSize:'15px'},onClick:()=>showToast('📬 需求已發送至地區統包中心！')},'⚡ 一鍵發送需求索取報價')
    ));
    content.appendChild(card);
  }
  if(resultTab==='fengshui' && fs) {
    const scoreColor = fs.score>=70?T.success:fs.score>=40?T.warn:T.error;
    const scoreCard = h('div',{className:'card',style:{marginBottom:'12px',textAlign:'center'}},
      h('div',{className:'feng-score-circle',style:{background:`conic-gradient(${scoreColor} ${fs.score*3.6}deg, ${T.border} 0)`}},
        h('div',{className:'feng-score-inner'},
          h('span',{className:'feng-score-num'},String(fs.score)),
          h('span',{className:'feng-score-label'},'風水評分')
        )
      ),
      h('div',{style:{fontSize:'11px',color:'var(--text-ter)',marginBottom:'10px'}},'（根據家具配置動態計算）'),
      h('p',{className:'result-text',style:{textAlign:'left'}},fs.summary)
    );
    content.appendChild(scoreCard);

    if(fs.goodPoints?.length) {
      const goodCard = h('div',{className:'card',style:{marginBottom:'12px'}},h('div',{className:'section-title'},h('span',{className:'icon'},'✅'),'優良格局'));
      fs.goodPoints.forEach(gp=>{
        goodCard.appendChild(h('div',{style:{fontSize:'13px',color:'var(--success)',lineHeight:'1.9',paddingLeft:'8px',borderLeft:'3px solid var(--success)',marginBottom:'6px'}},gp));
      });
      content.appendChild(goodCard);
    }

    if(fs.issues?.length) {
      const issCard = h('div',{className:'card',style:{marginBottom:'12px'}},h('div',{className:'section-title'},h('span',{className:'icon'},'⚠️'),'需化解'));
      fs.issues.forEach(iss=>{
        issCard.appendChild(h('div',{className:'feng-issue'},
          h('div',{className:'issue-problem'},iss.problem),
          h('div',{className:'issue-solution'},'💡 '+iss.solution)
        ));
      });
      content.appendChild(issCard);
    }

    content.appendChild(h('div',{className:'card',style:{marginBottom:'12px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'☯️'),'五行平衡'),
      h('p',{className:'result-text'},fs.elementBalance)
    ));

    if(fs.luckyItems?.length) {
      const luckyCard = h('div',{className:'card'},h('div',{className:'section-title'},h('span',{className:'icon'},'🍀'),'開運擺設'));
      fs.luckyItems.forEach(l=>{
        luckyCard.appendChild(h('div',{style:{fontSize:'13px',color:T.text,lineHeight:'1.9'}},'• '+l));
      });
      content.appendChild(luckyCard);
    }
  }
  if(resultTab==='rental' && r.rentalTip) {
    const rt = r.rentalTip;
    const roiCard = h('div',{className:'card',style:{marginBottom:'12px'}},
      h('div',{className:'section-title'},h('span',{className:'icon'},'📊'),'出租投資評估'),
      h('div',{style:{display:'flex',gap:'10px',marginBottom:'16px'}},
        h('div',{style:{flex:1,textAlign:'center',padding:'16px',background:'var(--accent-light)',borderRadius:'12px'}},
          h('div',{style:{fontSize:'10px',color:'var(--text-sec)',marginBottom:'4px'}},'預估月租'),
          h('div',{style:{fontSize:'18px',fontWeight:'900',color:'var(--accent)'}},'NT$ '+rt.monthlyRent)
        ),
        h('div',{style:{flex:1,textAlign:'center',padding:'16px',background:'var(--success-light)',borderRadius:'12px'}},
          h('div',{style:{fontSize:'10px',color:'var(--text-sec)',marginBottom:'4px'}},'投資回報'),
          h('div',{style:{fontSize:'18px',fontWeight:'900',color:'var(--success)'}},rt.roi)
        )
      ),
      h('p',{className:'result-text'},rt.tip),
      h('div',{style:{fontSize:'12px',color:'var(--text-sec)',marginTop:'12px',padding:'10px',background:'var(--card-alt)',borderRadius:'8px'}},
        '💡 ROI 公式：月租 × 12 ÷ 總裝修投入 = 年報酬率。建議搭配 591 / 好房網 / Airbnb 了解區域行情。'
      )
    );
    content.appendChild(roiCard);

    // Landlord summary dashboard (B: Landlord)
    const stats = getProjectStats();
    if(stats.total > 1) {
      content.appendChild(h('div',{className:'card',style:{marginTop:'12px'}},
        h('div',{className:'section-title'},h('span',{className:'icon'},'📈'),'物件組合概覽'),
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}},
          h('div',{style:{textAlign:'center',padding:'12px',background:'var(--accent-light)',borderRadius:'8px'}},
            h('div',{style:{fontSize:'20px',fontWeight:'900',color:'var(--accent)'}},String(stats.total)),
            h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'總物件')
          ),
          h('div',{style:{textAlign:'center',padding:'12px',background:'var(--success-light)',borderRadius:'8px'}},
            h('div',{style:{fontSize:'20px',fontWeight:'900',color:'var(--success)'}},String(stats.renting)),
            h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'出租中')
          ),
          h('div',{style:{textAlign:'center',padding:'12px',background:'var(--card-alt)',borderRadius:'8px'}},
            h('div',{style:{fontSize:'20px',fontWeight:'900',color:'var(--text)'}},stats.totalInvestment+'萬'),
            h('div',{style:{fontSize:'10px',color:'var(--text-sec)'}},'總投資估')
          )
        )
      ));
    }
  }
  if(resultTab==='buyerCheck' && r.buyerChecklist) {
    const card = h('div',{className:'card'},h('div',{className:'section-title'},h('span',{className:'icon'},'✅'),isRenovator?'翻修進度清單':'首購族裝修清單'));
    // Persistent checklist (C: First-time buyer / H: QA)
    r.buyerChecklist.forEach(c=>{
      card.appendChild(h('div',{className:'buyer-phase',style:{marginTop:'16px'}},
        h('div',{style:{fontWeight:'900',color:'var(--accent)',fontSize:'14px',marginBottom:'8px',borderLeft:'4px solid var(--accent)',paddingLeft:'8px'}},c.phase),
        ...c.items.map((it,idx)=>{
          const checkKey = `${c.phase}-${idx}`;
          const checked = isChecklistChecked(checkKey);
          const cb = h('input',{type:'checkbox'});
          cb.checked = checked;
          cb.addEventListener('change',()=>toggleChecklistItem(checkKey));
          return h('div',{className:'buyer-check-item',style:{fontSize:'13px',padding:'6px 0',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'8px'}},
            cb, h('span',{style:{textDecoration:checked?'line-through':'none',color:checked?'var(--text-ter)':'var(--text)'}},it)
          );
        })
      ));
    });
    content.appendChild(card);
    
    // Progress summary
    let totalItems = 0, checkedItems = 0;
    r.buyerChecklist.forEach(c=>c.items.forEach((_,idx)=>{totalItems++;if(isChecklistChecked(`${c.phase}-${idx}`))checkedItems++}));
    const pct = totalItems > 0 ? Math.round(checkedItems/totalItems*100) : 0;
    content.appendChild(h('div',{style:{marginTop:'12px',padding:'12px',background:'var(--card-alt)',borderRadius:'var(--r-md)',textAlign:'center'}},
      h('div',{style:{fontSize:'11px',color:'var(--text-sec)',marginBottom:'4px'}},'完成進度'),
      h('div',{style:{height:'6px',background:'var(--border)',borderRadius:'3px',overflow:'hidden',marginBottom:'6px'}},
        h('div',{style:{height:'100%',width:pct+'%',background:'linear-gradient(90deg, var(--accent), var(--success))',borderRadius:'3px',transition:'width 0.3s'}})
      ),
      h('div',{style:{fontSize:'13px',fontWeight:'700',color:pct===100?'var(--success)':'var(--accent)'}},pct===100?'🎉 全部完成！':`${checkedItems}/${totalItems} (${pct}%)`)
    ));
  }
  // Safety checklist for parents (F: Parents)
  if(resultTab==='safetyCheck' && isParent) {
    const safetyItems = [
      {phase:'電源安全',items:['所有低處插座安裝防觸電蓋','延長線收納固定於牆面','家電電線整線收納（防纏繞）']},
      {phase:'家具固定',items:['書櫃/衣櫃 L型鐵件固定牆面','電視壁掛或防倒固定','矮櫃抽屜加裝防拉出鎖']},
      {phase:'門窗安全',items:['窗戶加裝兒童安全鎖','門片安裝防夾手擋板','浴室門鎖改為可外開式']},
      {phase:'地面防護',items:['浴室貼防滑地磚/止滑條','客廳鋪設安全遊戲墊','樓梯口安裝兒童門欄']},
      {phase:'材質檢查',items:['所有油漆確認零甲醛','家具確認 SGS 無毒認證','窗簾改無繩式（防纏繞意外）','地毯選防塵蟎材質']},
    ];
    const card = h('div',{className:'card'},h('div',{className:'section-title'},h('span',{className:'icon'},'🛡️'),'兒童安全檢查清單'));
    safetyItems.forEach(c=>{
      card.appendChild(h('div',{className:'buyer-phase',style:{marginTop:'16px'}},
        h('div',{style:{fontWeight:'900',color:'var(--warn)',fontSize:'14px',marginBottom:'8px',borderLeft:'4px solid var(--warn)',paddingLeft:'8px'}},c.phase),
        ...c.items.map((it,idx)=>{
          const checkKey = `safety-${c.phase}-${idx}`;
          const checked = isChecklistChecked(checkKey);
          const cb = h('input',{type:'checkbox'});
          cb.checked = checked;
          cb.addEventListener('change',()=>toggleChecklistItem(checkKey));
          return h('div',{className:'buyer-check-item',style:{fontSize:'13px',padding:'6px 0',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'8px'}},
            cb, h('span',{style:{textDecoration:checked?'line-through':'none',color:checked?'var(--text-ter)':'var(--text)'}},it)
          );
        })
      ));
    });
    content.appendChild(card);
  }
  // Growth timeline for parents (F: Parents)
  if(resultTab==='growthTimeline' && isParent) {
    const timeline = [
      {age:'0-1歲',title:'嬰兒安全期',items:['嬰兒床與防翻裝置','所有家具圓角處理','地面全覆蓋安全墊','插座全封','低處無任何小物件']},
      {age:'1-3歲',title:'探索爬行期',items:['加裝樓梯門欄','廚房/浴室門禁','抽屜防拉出鎖','桌角防撞條']},
      {age:'3-5歲',title:'活潑跑跳期',items:['加大活動空間（移除不必要家具）','增設遊戲收納區','牆面可擦洗塗料','穩固的矮書架']},
      {age:'5-7歲',title:'學齡預備期',items:['設置獨立學習角','書桌椅選可調高度','增加閱讀照明','收納系統分類教學']},
      {age:'7歲+',title:'獨立成長期',items:['個人房間規劃','衣櫃收納自理系統','課桌+電腦桌整合','隔音考量（休息/學習時段）']},
    ];
    const card = h('div',{className:'card'},h('div',{className:'section-title'},h('span',{className:'icon'},'📅'),'兒童成長空間規劃時間軸'));
    timeline.forEach((t,i)=>{
      const isActive = state.childAge === 'infant' && i<=1 || state.childAge === 'toddler' && i>=1 && i<=3 || state.childAge === 'school' && i>=3;
      card.appendChild(h('div',{style:{padding:'14px',marginTop:i>0?'8px':'0',background:isActive?'var(--accent-light)':'var(--card-alt)',borderRadius:'var(--r-md)',border:isActive?'1.5px solid var(--accent)':'1px solid var(--border-light)',transition:'all 0.3s'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}},
          h('span',{style:{fontSize:'12px',fontWeight:'900',color:isActive?'var(--accent)':'var(--text-sec)',background:isActive?'var(--accent)':'var(--border)',color:isActive?'#fff':'var(--text-sec)',padding:'2px 10px',borderRadius:'var(--r-full)'}},t.age),
          h('span',{style:{fontSize:'14px',fontWeight:'700',color:'var(--text)'}},t.title),
          isActive?h('span',{style:{fontSize:'10px',color:'var(--accent)',fontWeight:'700'}},'← 目前階段'):null
        ),
        h('div',{style:{paddingLeft:'8px'}},
          ...t.items.map(item=>h('div',{style:{fontSize:'12px',color:'var(--text-sec)',lineHeight:'1.9'}},'• '+item))
        )
      ));
    });
    content.appendChild(card);
  }
  if(resultTab==='tips') {
    const card = h('div',{className:'card',style:{marginBottom:'12px'}},h('div',{className:'section-title'},h('span',{className:'icon'},'📝'),'專業建議'));
    (r.tips||[]).forEach((t,i)=>{
      card.appendChild(h('div',{className:'tip-item'},h('span',{className:'tip-num'},String(i+1)),t));
    });
    content.appendChild(card);
    if(r.timeline) {
      content.appendChild(h('div',{className:'card'},
        h('div',{className:'section-title'},h('span',{className:'icon'},'⏱️'),'施工時程'),
        h('p',{className:'result-text'},r.timeline)
      ));
    }
  }
  cont.appendChild(content);

  // Export section
  const exportBtns = [
    h('button',{className:'btn btn-primary btn-sm',onClick:()=>saveToHistory(),'aria-label':'儲存方案'},'💾 儲存'),
    h('button',{className:'btn btn-outline btn-sm',onClick:()=>{exportAsText();showToast('✅ 已複製到剪貼簿！')},'aria-label':'複製文字'},'📋 複製'),
    h('button',{className:'btn btn-outline btn-sm',onClick:shareDesign,'aria-label':'分享方案'},'📤 分享'),
    h('button',{className:'btn btn-outline btn-sm',onClick:exportPDF,'aria-label':'匯出PDF'},'📄 PDF'),
  ];
  if(isLandlord) {
    exportBtns.push(h('button',{className:'btn btn-outline btn-sm',style:{borderColor:'var(--success)',color:'var(--success)'},onClick:()=>{saveCurrentProject();showToast('✅ 物件已儲存！')}},'🏘️ 儲存物件'));
  }
  cont.appendChild(h('div',{className:'export-section'},
    h('h4',null,'📤 匯出 / 儲存 / 分享'),
    h('div',{className:'export-btns',style:{flexWrap:'wrap'}},...exportBtns)
  ));

  // Contact designer CTA (G: Strategy Partner)
  cont.appendChild(h('div',{className:'card',style:{marginTop:'16px',textAlign:'center',background:'linear-gradient(135deg, rgba(184,149,106,0.05), var(--accent-light))',border:'1.5px solid rgba(184,149,106,0.2)'}},
    h('div',{style:{fontSize:'32px',marginBottom:'8px'}},'👩‍🎨'),
    h('h3',{style:{fontSize:'17px',fontWeight:'900',color:'var(--text)',marginBottom:'6px',fontFamily:'var(--font-serif)'}},'需要專業設計師一對一諮詢？'),
    h('p',{style:{fontSize:'13px',color:'var(--text-sec)',marginBottom:'14px',lineHeight:'1.7'}},'我們的合作設計師團隊擁有 10+ 年經驗，可依據本方案進一步深化設計。\n首次諮詢免費，無綁約壓力。'),
    h('button',{className:'btn btn-primary',style:{fontWeight:'900',fontSize:'15px',padding:'14px 32px'},onClick:()=>showToast('📞 諮詢需求已送出，設計師將於 24 小時內與您聯繫！')},'💬 免費預約設計師諮詢'),
    h('div',{style:{marginTop:'10px',fontSize:'11px',color:'var(--text-ter)'}},'已有 2,400+ 位屋主透過此管道找到理想設計師')
  ));

  // Actions
  cont.appendChild(h('div',{className:'result-actions'},
    h('button',{className:'btn btn-outline',onClick:()=>{up({aiResult:null,advancedEditMode:false});goTo(getSteps().length-2)}},'🔄 重新生成'),
    h('button',{className:'btn btn-primary',onClick:()=>{
      up({advancedEditMode: true});
      const steps = getSteps();
      const edIdx = steps.findIndex(s=>s.id==='editor');
      if(edIdx>=0)goTo(edIdx); else goTo(0);
    }},'🔍 進階微調'),
    h('button',{className:'btn btn-primary',style:{background:'var(--accent)',borderColor:'var(--accent)',boxShadow:'0 4px 15px rgba(184,149,106, 0.4)'},onClick:()=>typeof show3DPreview === 'function'?show3DPreview():showToast('載入中...')},'🧊 3D 預覽')
  ));
  return cont;
}

function exportAsText() {
  const r = state.aiResult; if(!r) return;
  let text = '【室·設計 PRO — 設計方案報告】\n';
  text += '報告日期：' + new Date().toLocaleDateString('zh-TW') + '\n\n';
  text += '═══ 設計理念 ═══\n'+r.concept+'\n\n';
  text += '═══ 空間配置 ═══\n'+r.layout+'\n\n';
  text += '═══ 家具清單 ═══\n';
  (r.furnitureList||[]).forEach(f=>{text+=`• ${f.item}：${f.spec}，${f.material}，${f.price}\n  品牌：${f.brand}\n  擺放：${f.placement}\n`;});
  text += '\n═══ 配色方案 ═══\n'+(r.colorPlan?.description||'')+'\n\n';
  text += '═══ 風水報告 ═══\n評分：'+(calcDynamicFengScore())+'/100\n'+(r.fengshuiReport?.summary||'')+'\n';
  text += '\n═══ 預算分配 ═══\n';
  (r.budgetTable||[]).forEach(b=>{text+=`${b.category}: ${b.pct}% (${b.amount})\n`;});
  text += '\n————————————\n由 室·設計 PRO AI 生成\nhttps://interior-design-pro.tw\n';
  try { navigator.clipboard.writeText(text); } catch(e) {}
}
