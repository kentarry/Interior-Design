// ── Result Page ──
function renderResult() {
  const r = state.aiResult;
  if(!r||r.error) {
    return h('div',{className:'error-state animate-fade-up'},
      h('div',{className:'error-icon'},'😔'),
      h('div',{className:'error-msg'},'方案生成失敗'),
      h('button',{className:'btn btn-primary',onClick:()=>{up({aiResult:null});goTo(getSteps().length-2)}},'重新生成')
    );
  }
  const cont = h('div',{className:'animate-fade-up'});
  const sty=DESIGN_STYLES.find(s=>s.id===state.style);
  const dir=DIRECTIONS.find(d=>d.id===state.direction);
  const fs=r.fengshuiReport;

  const isLandlord = state.persona === 'landlord';

  // Banner
  cont.appendChild(h('div',{className:'result-banner'},
    h('h2',null,isLandlord && state.propertyName ? state.propertyName+' 設計方案' : '您的專屬設計方案'),
    h('div',{className:'result-meta'},
      h('span',{className:'meta-tag'},sty?.label||'現代'),
      h('span',{className:'meta-tag'},calcArea()+'坪'),
      h('span',{className:'meta-tag'},'門朝'+(dir?.label||'南')),
      h('span',{className:'meta-tag'},'風水 '+(fs?.score||'--')+'分'),
      isLandlord?h('span',{className:'meta-tag',style:{background:'var(--success-light)',color:'var(--success)'}},'🏘️ 出租版'):null
    )
  ));

  // Tabs
  const tabs=[{id:'concept',l:'設計理念',ic:'💡'},{id:'layout',l:'空間配置',ic:'📐'},{id:'furniture',l:'家具清單',ic:'🪑'},{id:'color',l:'配色燈光',ic:'🎨'},{id:'budget',l:'預算明細',ic:'💰'},{id:'fengshui',l:'風水報告',ic:'🧭'},{id:'tips',l:'建議',ic:'📝'}];
  if(isLandlord && r.rentalTip) tabs.splice(5,0,{id:'rental',l:'出租估算',ic:'📊'});
  const tabNav = h('div',{className:'tab-nav'});
  tabs.forEach(t=>{
    tabNav.appendChild(h('button',{className:`tab-btn${resultTab===t.id?' active':''}`,onClick:()=>{resultTab=t.id;render()}},t.ic+' '+t.l));
  });
  cont.appendChild(tabNav);

  // Tab content
  const content = h('div',{className:'animate-fade-up',key:resultTab});

  if(resultTab==='concept') {
    content.appendChild(h('div',{className:'card'},
      h('div',{className:'section-title'},h('span',{className:'icon'},'💡'),'設計理念'),
      h('p',{className:'result-text'},r.concept)
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
    (r.furnitureList||[]).forEach(f=>{
      card.appendChild(h('div',{className:'furniture-entry'},
        h('div',{className:'entry-name'},f.item),
        h('div',{className:'entry-details',innerHTML:`📏 ${f.spec} · 🪵 ${f.material}<br>💰 ${f.price} · 🏷️ ${f.brand}<br>📍 ${f.placement}`})
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
        h('p',{className:'result-text'},cp.description),
        cp.wall?h('div',{style:{fontSize:'12px',color:T.textSec,marginTop:'10px'}},'牆面：'+cp.wall+' ｜ 地板：'+cp.floor):null
      );
      content.appendChild(colorCard);
    }
    content.appendChild(h('div',{className:'card'},
      h('div',{className:'section-title'},h('span',{className:'icon'},'💡'),'燈光設計'),
      h('p',{className:'result-text'},r.lighting)
    ));
  }
  if(resultTab==='budget') {
    const card = h('div',{className:'card'},h('div',{className:'section-title'},h('span',{className:'icon'},'💰'),'預算分配'));
    (r.budgetTable||[]).forEach(b=>{
      card.appendChild(h('div',{className:'budget-row'},
        h('div',{className:'budget-pct'},b.pct+'%'),
        h('div',{className:'budget-bar'},h('div',{className:'budget-bar-fill',style:{width:b.pct+'%'}})),
        h('div',{className:'budget-details'},
          h('div',{className:'budget-cat'},b.category),
          h('div',{className:'budget-amt'},b.amount)
        )
      ));
    });
    content.appendChild(card);
  }
  if(resultTab==='fengshui' && fs) {
    // Score circle
    const scoreColor = fs.score>=70?T.success:fs.score>=40?T.warn:T.error;
    const scoreCard = h('div',{className:'card',style:{marginBottom:'12px',textAlign:'center'}},
      h('div',{className:'feng-score-circle',style:{background:`conic-gradient(${scoreColor} ${fs.score*3.6}deg, ${T.border} 0)`}},
        h('div',{className:'feng-score-inner'},
          h('span',{className:'feng-score-num'},String(fs.score)),
          h('span',{className:'feng-score-label'},'風水評分')
        )
      ),
      h('p',{className:'result-text',style:{textAlign:'left'}},fs.summary)
    );
    content.appendChild(scoreCard);

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
  // Rental ROI tab (landlord only)
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
    h('button',{className:'btn btn-primary btn-sm',onClick:()=>saveToHistory()},'💾 儲存方案'),
    h('button',{className:'btn btn-outline btn-sm',onClick:()=>{exportAsText();showToast('✅ 已複製到剪貼簿！')}},'📋 複製文字'),
  ];
  if(isLandlord) {
    exportBtns.push(h('button',{className:'btn btn-outline btn-sm',style:{borderColor:'var(--success)',color:'var(--success)'},onClick:()=>{saveCurrentProject();showToast('✅ 物件已儲存！')}},'🏘️ 儲存物件'));
  }
  cont.appendChild(h('div',{className:'export-section'},
    h('h4',null,'📤 匯出 / 儲存方案'),
    h('div',{className:'export-btns'},...exportBtns)
  ));

  // Actions
  cont.appendChild(h('div',{className:'result-actions'},
    h('button',{className:'btn btn-outline',onClick:()=>{up({aiResult:null});goTo(getSteps().length-2)}},'🔄 重新生成'),
    h('button',{className:'btn btn-primary',onClick:()=>{
      const edIdx = getSteps().findIndex(s=>s.id==='editor');
      if(edIdx>=0)goTo(edIdx); else goTo(0);
    }},'✏️ 調整家具')
  ));
  return cont;
}

function exportAsText() {
  const r = state.aiResult; if(!r) return;
  let text = '【室·設計 PRO — 設計方案報告】\n\n';
  text += '═══ 設計理念 ═══\n'+r.concept+'\n\n';
  text += '═══ 空間配置 ═══\n'+r.layout+'\n\n';
  text += '═══ 家具清單 ═══\n';
  (r.furnitureList||[]).forEach(f=>{text+=`• ${f.item}：${f.spec}，${f.material}，${f.price}\n  擺放：${f.placement}\n`;});
  text += '\n═══ 配色方案 ═══\n'+(r.colorPlan?.description||'')+'\n\n';
  text += '═══ 風水報告 ═══\n評分：'+(r.fengshuiReport?.score||'--')+'/100\n'+(r.fengshuiReport?.summary||'')+'\n';
  try { navigator.clipboard.writeText(text); } catch(e) {}
}
