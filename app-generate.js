// ── Generate Page ──
function renderGenerate() {
  const cont = h('div',{className:'generating-page animate-fade-up'});
  cont.appendChild(h('div',{className:'generating-spinner'}));
  cont.appendChild(h('div',{className:'generating-title'},'AI 設計師工作中'));
  const stages=['分析空間','風水方位','家具配置','配色方案','預算分配','專業建議','完成報告'];
  cont.appendChild(h('div',{className:'generating-stage'},stages[Math.min(Math.floor(genProg/14),6)]+'...'));
  const bar = h('div',{className:'generating-bar'});
  bar.appendChild(h('div',{className:'generating-bar-fill',style:{width:genProg+'%'}}));
  cont.appendChild(bar);
  cont.appendChild(h('div',{className:'generating-pct'},Math.round(genProg)+'%'));
  return cont;
}

function startGeneration() {
  if(state.aiResult){goNext();return;}
  genProg=0;
  const iv=setInterval(()=>{
    if(genProg>=92){clearInterval(iv);return;}
    genProg+=Math.random()*5+1.5;
    render();
  },450);

  // Build the design result locally (no API needed)
  setTimeout(()=>{
    clearInterval(iv);
    genProg=100;
    const sty = DESIGN_STYLES.find(s=>s.id===state.style)||DESIGN_STYLES[0];
    const dir = DIRECTIONS.find(d=>d.id===state.direction)||DIRECTIONS[4];
    const bm = {low:'10-30萬',mid:'30-80萬',high:'80萬+'};
    const result = generateLocalResult(sty, dir, bm[state.budget]||'30-50萬');
    up({aiResult:result});
    setTimeout(()=>goNext(),400);
  },4500);
}

function generateLocalResult(sty, dir, budget) {
  const ec = ELEM_COLORS[dir.element]||{good:'自然色',avoid:'過重色彩'};
  const area = calcArea();
  const roomType = ROOM_TYPES.find(r=>r.id===state.roomType)?.label||'客廳';
  const isLandlord = state.persona === 'landlord';
  const targetMap = {student:'學生',worker:'上班族',family:'小家庭',executive:'高端商務',expat:'外籍人士',elderly:'銀髮族'};
  const target = targetMap[state.rentalTarget] || '一般租客';
  const pTypeMap = {studio:'套房','1bed':'一房一廳','2bed':'兩房','3bed':'三房以上'};
  const pType = pTypeMap[state.propertyType] || '標準空間';

  // Landlord-specific concept
  const conceptBase = isLandlord
    ? `以「高出租率 × 低維護成本」為核心理念，為您的${pType}物件（${state.propertyName||'出租物件'}）打造最具吸引力的${sty.label}風格空間。目標租客：${target}。設計重點放在耐用材質、好清潔的表面處理、以及能讓租客一眼心動的第一印象。空間${area}坪，採用${ec.good}色系配色，符合${dir.element}屬性風水，讓物件在租屋市場中脫穎而出。所有建材與家具選擇均考量「5年以上使用壽命」與「可快速更換」的原則。`
    : `以${sty.label}風格為核心，結合${dir.element}屬性的風水智慧，為您打造一個${area}坪的理想${roomType}空間。設計理念強調「人與空間的和諧共生」，透過${ec.good}色系的巧妙運用，營造出既符合現代美學又尊重傳統風水的居住環境。空間配置以動線流暢為首要考量，確保每個角落都能發揮最大效用。大門朝${dir.label}，屬${dir.element}，${dir.tip}，在空間規劃中特別注重此方位的能量流動，讓居住者能夠享受最佳的運勢加持。`;

  const layoutBase = isLandlord
    ? `${pType}${area}坪空間規劃，以「租客友善動線」為核心。玄關區設置鞋櫃與掛鉤，第一眼就給租客整潔有序的好印象。主要生活區採開放式設計，最大化空間感。${target}特別需要的功能區都已規劃到位。廚房採一字型或L型配置，節省材料成本且方便使用。衛浴採乾濕分離，降低維護成本、延長使用壽命。大門朝${dir.label}，動線順暢，符合風水「藏風聚氣」原則。`
    : `空間總面積約${area}坪，以開放式概念規劃，主要分為三大區域：活動區、休憩區與功能區。動線設計採用「回」字型流動，確保各區域之間的連結順暢無阻。入口玄關設置換鞋區與收納櫃，兼具實用性與風水上的「藏風聚氣」功能。主要活動區域面朝${dir.label}方，充分利用${dir.tip}的優勢。根據風水原理，沙發背靠實牆，形成穩固的「靠山」格局，茶几擺放在沙發前方，保持適當距離以利氣場流通。`;

  const furnitureBase = isLandlord ? [
    {item:`${sty.label}沙發（出租型）`,spec:'三人座 200×85cm',material:'防潑水科技布（5年保固）',price:'NT$ 12,000-20,000',brand:'推薦：IKEA FRIHETEN / 宜得利',placement:`靠${dir.label}方實牆，科技布易清潔不怕租客弄髒`},
    {item:'耐磨餐桌組',spec:'四人座 120×75cm',material:'美耐板桌面+金屬腳',price:'NT$ 5,000-10,000',brand:'推薦：IKEA / 特力屋',placement:'靠窗採光處，美耐板耐熱耐刮好保養'},
    {item:'收納床架（含床墊）',spec:'Queen 150×200cm',material:'六分木心板+獨立筒',price:'NT$ 15,000-25,000',brand:'推薦：掀床工坊 / IKEA MALM',placement:'床頭靠實牆，掀床設計增加收納空間'},
    {item:'系統衣櫃',spec:'180×60×240cm',material:'E1低甲醛系統板',price:'NT$ 15,000-30,000',brand:'推薦：歐德 / 系統傢俱工廠',placement:'臥室牆面，系統板耐用且風格統一'},
    {item:'基本家電組',spec:'冷氣+洗衣機+冰箱',material:'一級能效',price:'NT$ 35,000-55,000',brand:'推薦：大金/日立+LG+Panasonic',placement:'各對應位置，選一級能效降低租客電費糾紛'},
  ] : [
    {item:`${sty.label}主沙發`,spec:'L型 260×180cm',material:'高密度泡棉+棉麻混紡',price:'NT$ 35,000-55,000',brand:'推薦：IKEA / 宜得利',placement:`靠${dir.label}方實牆擺放，符合風水靠山原則`},
    {item:'實木茶几',spec:'120×60×45cm',material:'橡木/胡桃木',price:'NT$ 8,000-15,000',brand:'推薦：無印良品 / 詩肯柚木',placement:'客廳中央，與沙發保持45cm走道'},
    {item:'收納電視櫃',spec:'180×45×50cm',material:`${sty.label}風格板材`,price:'NT$ 12,000-25,000',brand:'推薦：特力屋 / IKEA',placement:'沙發對面牆面，高度讓視線自然平視'},
    {item:'主臥雙人床',spec:'Queen 180×210cm',material:'獨立筒彈簧+乳膠',price:'NT$ 20,000-40,000',brand:'推薦：眠豆腐 / 德泰',placement:'床頭靠實牆，避免正對門口（風水忌沖）'},
    {item:'多功能書桌',spec:'140×70×75cm',material:'實木桌面+金屬腳',price:'NT$ 6,000-12,000',brand:'推薦：IKEA / Herman Miller',placement:'靠窗擺放，採光佳且利文昌位'},
  ];

  // Landlord budget table with ROI
  const budgetBase = isLandlord ? [
    {category:'基礎工程',pct:20,amount:'2-5萬',items:'油漆（選防汙漆）/超耐磨地板/簡易水電'},
    {category:'家具採購',pct:30,amount:'3-8萬',items:'沙發/床組/桌椅/衣櫃（選耐用款）'},
    {category:'家電配備',pct:30,amount:'3.5-6萬',items:'冷氣/冰箱/洗衣機/熱水器'},
    {category:'軟裝+雜項',pct:10,amount:'1-3萬',items:'窗簾/燈具/基本廚具/清潔'},
    {category:'預備金',pct:10,amount:'1-2萬',items:'突發狀況/租客退租後翻新'},
  ] : [
    {category:'基礎工程',pct:25,amount:budget.includes('10')?'3-8萬':'8-20萬',items:'水電/油漆/地板'},
    {category:'家具採購',pct:35,amount:budget.includes('10')?'4-10萬':'10-28萬',items:'沙發/床/桌椅/櫃體'},
    {category:'燈具照明',pct:10,amount:budget.includes('10')?'1-3萬':'3-8萬',items:'主燈/輔助燈/氣氛燈'},
    {category:'軟裝佈置',pct:15,amount:budget.includes('10')?'2-5萬':'5-12萬',items:'窗簾/地毯/抱枕/掛畫'},
    {category:'家電設備',pct:15,amount:budget.includes('10')?'2-5萬':'5-12萬',items:'冷氣/洗衣機/冰箱'},
  ];

  const tipsBase = isLandlord ? [
    '地板選超耐磨木地板，比實木便宜耐用，退租後不需翻新',
    '油漆選防汙乳膠漆（如虹牌全效），釘孔髒污輕鬆擦拭',
    '沙發選科技布或貓抓布，防潑水且可機洗椅套',
    '廚房流理台選不鏽鋼或人造石，勿用大理石（易吃色）',
    '衛浴五金選台製品牌（如HCG），維修備品好找',
    '冷氣選變頻分離式，省電費減少租客抱怨',
    '安裝智能門鎖，租客換手時不用換鎖芯',
    '拍照前佈置抱枕、盆栽、桌巾，提升租屋平台照片質感',
    '預估月租 × 12 ÷ 總投入 = 年報酬率，目標 > 5%',
    `物件朝${dir.label}，${dir.tip}，看屋時可向租客介紹風水優勢`,
  ] : [
    '先確認基礎水電管線狀態，避免入住後才發現問題',
    '選購家具前務必丈量空間，預留走道至少60cm',
    '窗簾選擇遮光+紗簾雙層設計，兼顧隱私與採光',
    '油漆顏色建議先買小罐試色，實際效果可能與色卡有差異',
    '收納設計優先考慮使用頻率，常用物品放在順手位置',
    '照明規劃要考慮自然光方向，避免螢幕反光',
    '地板材質選擇要考慮清潔便利性與耐用度',
    '預留10-15%的預算彈性，應對施工中的變動',
  ];

  return {
    concept: conceptBase,
    layout: layoutBase,
    furnitureList: furnitureBase,
    colorPlan:{
      primary:sty.palette[0],secondary:sty.palette[1],accent:sty.palette[2],
      wall: isLandlord
        ? `建議全室白色或淺灰色防汙乳膠漆，通用性高、退租好補漆，局部點綴${ec.good}色系`
        : `建議使用${ec.good}色系的乳膠漆，營造${sty.sub}的氛圍`,
      floor: isLandlord ? '超耐磨木地板（橡木色/灰橡色），耐用且萬用' : (sty.id==='japanese'?'淺色橡木木地板':'超耐磨木地板（中性色調）'),
      description: isLandlord
        ? `出租物件配色策略：以「中性色調 + 局部亮點」為原則。牆面維持白/淺灰，家具選${ec.good}系，讓租客容易搭配自己的物品。避免過度個人化的色彩（如${ec.avoid}），確保最大租客接受度。${sty.label}風格的元素可透過抱枕、掛畫等可拆卸軟裝帶入，退租更換成本低。`
        : `配色方案以${sty.label}美學為基礎，融合${dir.element}屬性的風水用色智慧。主色調採用${ec.good}，既符合風格定位又順應五行能量。避免大面積使用${ec.avoid}，以免干擾空間的五行平衡。牆面、地板、家具三者形成漸層過渡，創造視覺上的舒適與和諧。`,
    },
    lighting: isLandlord
      ? `出租物件燈光：全室採LED吸頂燈（色溫4000K中性白光），省電、亮度足、不需更換燈泡。臥室加裝壁燈增加溫馨感。玄關安裝感應燈，提升安全性與科技感。不建議安裝軌道燈或嵌燈（維修成本高）。`
      : `燈光設計採用三層照明法：基礎照明（吸頂燈/嵌燈），中層照明（壁燈/軌道燈），重點照明（檯燈/落地燈）。客廳建議色溫3000-4000K暖白光，營造溫馨氛圍；書房區域建議4000-5000K中性白光，有利閱讀與工作。臥室使用2700K暖黃光，搭配調光系統，滿足不同情境需求。`,
    storage: isLandlord
      ? `出租物件收納：衣櫃必備（租客最重視），建議系統衣櫃含吊桿+層板。廚房上下櫃全配，浴室安裝鏡櫃+置物架。玄關鞋櫃是加分項。收納做足 = 看屋轉換率提高30%。`
      : `收納規劃以「八二法則」為核心 — 80%的物品藏於看不見之處，20%精選物品作為展示。玄關設置頂天立地鞋櫃，臥室規劃整面衣櫃系統，客廳電視牆整合收納機能。建議使用統一風格的收納盒與籃框，維持視覺整潔。`,
    budgetTable: budgetBase,
    fengshuiReport:{
      score:78,
      summary: isLandlord
        ? `物件朝${dir.label}屬${dir.element}，${dir.tip}。風水格局有利出租——${target}族群特別受益於${dir.element}能量。建議在看屋時向租客簡要說明風水優勢，可作為物件的差異化賣點。`
        : `整體風水格局良好，大門朝${dir.label}屬${dir.element}，${dir.tip}。空間配置基本符合風水原則，建議微調部分家具擺放以進一步提升運勢。`,
      goodPoints:['大門朝向與空間用途相符','主要動線流暢無阻礙','光線充足，有助正面能量'],
      issues:[
        {problem:'部分角落可能形成「暗角」',solution:'建議擺放小型植栽或暖色燈具化解'},
        {problem:'鏡面位置需注意',solution:'避免鏡子正對大門或床位，可改為斜角擺放'},
      ],
      luckyItems:[`${dir.element}屬性開運植物（例：富貴竹、發財樹）`,'水晶球或風水擺件置於財位','香氛蠟燭增添空間正能量'],
      elementBalance:`${dir.element}為主導元素，建議搭配相生元素以達五行平衡。宜增加${dir.element==='水'?'金':dir.element==='木'?'水':dir.element==='火'?'木':dir.element==='土'?'火':'土'}屬性的裝飾。`,
    },
    timeline: isLandlord
      ? `出租裝修時程建議：極簡佈置（買家具+清潔）3-5天；標準裝修（油漆+地板+家具）2-3週；全面裝潢 4-6週。建議趁空屋期集中施工，縮短空租損失。多間物件可與同一廠商談批量折扣。`
      : '建議施工時程：簡單佈置約1-2週；基礎裝修約3-4週；全屋裝潢約6-8週。建議先確認水電管線，再進行硬裝工程，最後軟裝佈置。',
    tips: tipsBase,
    // Landlord extra: rental pricing suggestion
    rentalTip: isLandlord ? {
      monthlyRent: state.propertyType==='studio'?'8,000-15,000':state.propertyType==='1bed'?'15,000-25,000':state.propertyType==='2bed'?'22,000-35,000':'30,000-50,000',
      roi: '預估年報酬率 5-8%',
      tip: `${pType}在${target}市場中，${sty.label}風格裝潢可提升月租 10-20%。建議拍攝專業照片上傳 591 / 好房網。`,
    } : null,
  };
}
