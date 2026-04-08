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
  if(state.aiResult){ goTo(getSteps().length - 1); return; }
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
    
    // Auto Auto-Layout injected by AI
    if (!state.furniture || state.furniture.length === 0) {
      const cx = state.roomW / 2;
      if (state.roomType === 'living' || !state.roomType) {
        state.furniture = [
          { uid: 'auto-1', id: 'sofa3', label: '三人沙發', x: cx - 100, y: state.roomH - 100, w: 200, h: 80, rot: 0, scale: 1 },
          { uid: 'auto-2', id: 'coffeeL', label: '大茶几', x: cx - 60, y: state.roomH - 180, w: 120, h: 60, rot: 0, scale: 1 },
          { uid: 'auto-3', id: 'tvUnit', label: '電視櫃', x: cx - 90, y: 20, w: 180, h: 40, rot: 0, scale: 1 },
          { uid: 'auto-4', id: 'plant', label: '盆栽', x: 20, y: 20, w: 40, h: 40, rot: 0, scale: 1 },
        ];
      } else {
        state.furniture = [
          { uid: 'auto-bed', id: 'bedDouble', label: '雙人床', x: cx - 75, y: state.roomH - 220, w: 150, h: 200, rot: 0, scale: 1 },
          { uid: 'auto-wardrobe', id: 'wardrobe', label: '衣櫥', x: 20, y: 20, w: 150, h: 60, rot: 0, scale: 1 },
        ];
      }
      saveState();
    }

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
  const isBuyer = state.persona === 'buyer';
  const isRenovator = state.persona === 'renovator';
  const isParent = state.persona === 'parent';
  const targetMap = {student:'學生',worker:'上班族',family:'小家庭',executive:'高端商務',expat:'外籍人士',elderly:'銀髮族'};
  const target = targetMap[state.rentalTarget] || '一般租客';
  const pTypeMap = {studio:'套房','1bed':'一房一廳','2bed':'兩房','3bed':'三房以上'};
  const pType = pTypeMap[state.propertyType] || '標準空間';

  const conceptBase = isLandlord
    ? `以「高出租率 × 低維護成本」為核心理念，為您的${pType}物件（${state.propertyName||'出租物件'}）打造最具吸引力的${sty.label}風格空間。目標租客：${target}。設計重點放在耐用材質、好清潔的表面處理、以及能讓租客一眼心動的第一印象。空間${area}坪，採用${ec.good}色系配色，符合${dir.element}屬性風水，讓物件在租屋市場中脫穎而出。所有建材與家具選擇均考量「5年以上使用壽命」與「可快速更換」的原則。`
    : isRenovator
    ? `面對屋齡較高的二手老屋，我們以「重塑骨骼 × 隱形工程優先」為理念，為這${area}坪空間進行徹底的體質大造改造。設計重點放在汰換老舊管線、加強防水泥作，並以${sty.label}風格賦予空間新生。大門朝${dir.label}屬${dir.element}，整體空間採用${ec.good}色系，在有限的預算下，確保未來十年的居住安全與舒適。`
    : isParent
    ? `為${state.childAge==='infant'?'嬰幼兒':state.childAge==='toddler'?'學齡前幼兒':'學齡兒童'}家庭設計的專屬溫馨空間！我們以「無毒防護 × 成長動線」為核心理念，為您的${area}坪居家打造${sty.label}風格的安全環境。特別注重：✅ 低甲醛健康建材、✅ 無死角的寬敞活動空間、✅ 圓角與好清潔的防污材質。配色選用溫和的${ec.good}色系，幫助安定情緒，符合朝${dir.label}的${dir.element}屬性能量。`
    : isBuyer
    ? `恭喜您購入人生第一間房！我們以「新手友善 × 實用優先」為核心，為您的${area}坪新居打造${sty.label}風格的溫馨空間。作為首購族，我們特別注重：✅ 不踩雷的建材選擇、✅ 合理的預算分配、✅ 好清潔好維護的家具推薦。大門朝${dir.label}屬${dir.element}，${dir.tip}。配色採用${ec.good}色系，營造舒適又有質感的居家氛圍。以下所有推薦都附上具體品牌與價格，讓您不用做功課也能輕鬆下單！`
    : `以${sty.label}風格為核心，結合${dir.element}屬性的風水智慧，為您打造一個${area}坪的理想${roomType}空間。設計理念強調「人與空間的和諧共生」，透過${ec.good}色系的巧妙運用，營造出既符合現代美學又尊重傳統風水的居住環境。空間配置以動線流暢為首要考量，確保每個角落都能發揮最大效用。大門朝${dir.label}，屬${dir.element}，${dir.tip}，在空間規劃中特別注重此方位的能量流動，讓居住者能夠享受最佳的運勢加持。`;

  const layoutBase = isLandlord
    ? `${pType}${area}坪空間規劃，以「租客友善動線」為核心。玄關區設置鞋櫃與掛鉤，第一眼就給租客整潔有序的好印象。主要生活區採開放式設計，最大化空間感。${target}特別需要的功能區都已規劃到位。廚房採一字型或L型配置，節省材料成本且方便使用。衛浴採乾濕分離，降低維護成本、延長使用壽命。大門朝${dir.label}，動線順暢，符合風水「藏風聚氣」原則。`
    : isRenovator
    ? `老屋翻新最講究「破與立」。空間${area}坪的重劃重點：🔧 管線：廚衛水電全數更新，插座依現代生活習慣重新分配。🧱 格局：評估非剪力牆的拆除可能，減少不必要的隔間以引入良好採光與通風。🚪 玄關：利用${dir.label}方位的特性，重新設計落塵區與高氣密大門。🛋️ 核心區：減少過度裝潢的固定式木作，改以活動家具為主，將資金集中於隱形工程。`
    : isParent
    ? `為了寶貝的安全與發展，${area}坪空間佈局以「視線無阻與防護動線」為原則！👀 視線：強烈建議採用開放式公領域（LDK設計），讓您在廚房忙碌時也能隨時掌握孩子動態。🛋️ 遊戲區：客廳捨棄笨重的大茶几，改用好收納的邊桌搭配大型安全地墊，釋放最大爬行與遊戲空間。🚪 動線：家具之間確保主要走道寬度大於 80cm，大幅減少跑跳時的碰撞危險。`
    : isBuyer
    ? `您的新家${area}坪，我們用最簡單的方式來規劃！🏠 玄關：進門右手邊放鞋櫃，左邊掛外套。🛋️ 客廳：沙發靠最大面牆壁放（風水上叫「有靠山」），電視在對面。☕ 茶几放中間，兩邊留走道（至少60公分才好走）。🍽️ 餐廳：靠近廚房的位置放餐桌，吃飯端菜方便。🛏️ 臥室：床頭靠牆，不要正對門（風水忌諱，睡覺也不安心）。💡 小提醒：先量好每個房間的長寬，買家具前一定要確認尺寸！很多新手都踩過「沙發太大塞不進去」的坑。`
    : `空間總面積約${area}坪，以開放式概念規劃，主要分為三大區域：活動區、休憩區與功能區。動線設計採用「回」字型流動，確保各區域之間的連結順暢無阻。入口玄關設置換鞋區與收納櫃，兼具實用性與風水上的「藏風聚氣」功能。主要活動區域面朝${dir.label}方，充分利用${dir.tip}的優勢。根據風水原理，沙發背靠實牆，形成穩固的「靠山」格局，茶几擺放在沙發前方，保持適當距離以利氣場流通。`;

  const furnitureBase = isLandlord ? [
    {item:`${sty.label}沙發（出租型）`,spec:'三人座 200×85cm',material:'防潑水科技布（5年保固）',price:'NT$ 12,000-20,000',brand:'推薦：IKEA FRIHETEN / 宜得利',placement:`靠${dir.label}方實牆，科技布易清潔不怕租客弄髒`},
    {item:'耐磨餐桌組',spec:'四人座 120×75cm',material:'美耐板桌面+金屬腳',price:'NT$ 5,000-10,000',brand:'推薦：IKEA / 特力屋',placement:'靠窗採光處，美耐板耐熱耐刮好保養'},
    {item:'收納床架（含床墊）',spec:'Queen 150×200cm',material:'六分木心板+獨立筒',price:'NT$ 15,000-25,000',brand:'推薦：掀床工坊 / IKEA MALM',placement:'床頭靠實牆，掀床設計增加收納空間'},
    {item:'系統衣櫃',spec:'180×60×240cm',material:'E1低甲醛系統板',price:'NT$ 15,000-30,000',brand:'推薦：歐德 / 系統傢俱工廠',placement:'臥室牆面，系統板耐用且風格統一'},
    {item:'基本家電組',spec:'冷氣+洗衣機+冰箱',material:'一級能效',price:'NT$ 35,000-55,000',brand:'推薦：大金/日立+LG+Panasonic',placement:'各對應位置，選一級能效降低租客電費糾紛'},
  ] : isBuyer ? [
    {item:'⭐ 沙發（首購推薦）',spec:'三人座 L型 240×160cm',material:'貓抓布/科技布（耐磨好清潔）',price:'NT$ 15,000-30,000',brand:'🛒 IKEA KIVIK / 宜得利 N-SHIELD系列',placement:`靠牆放（風水的「靠山」），面對電視，預留60cm走道`},
    {item:'⭐ 茶几',spec:'120×60cm',material:'鋼化玻璃或密集板貼皮',price:'NT$ 3,000-8,000',brand:'🛒 IKEA LACK / 生活工場',placement:'沙發前方、距離40-50cm最舒適'},
    {item:'⭐ 電視櫃',spec:'150-180cm寬',material:'系統板 or 實木貼皮',price:'NT$ 5,000-15,000',brand:'🛒 IKEA BESTÅ / 特力屋',placement:'沙發對面牆壁，電視掛牆上更省空間'},
    {item:'⭐ 雙人床+床墊',spec:'Queen 152×190cm',material:'獨立筒彈簧（建議試躺）',price:'NT$ 15,000-35,000',brand:'🛒 眠豆腐 / IKEA MALM床架 + 獨立筒床墊',placement:'床頭靠實牆，不要對著門，旁邊留空間放床頭櫃'},
    {item:'⭐ 衣櫃',spec:'至少150cm寬',material:'系統衣櫃 or 組合式',price:'NT$ 10,000-25,000',brand:'🛒 歐德系統櫃 / IKEA PAX',placement:'臥室角落 or 整面牆，選附鏡面的門片一舉兩得'},
    {item:'⭐ 餐桌椅組',spec:'四人座 110×70cm',material:'實木 or 密集板',price:'NT$ 5,000-15,000',brand:'🛒 IKEA EKEDALEN / 宜得利',placement:'靠近廚房，窗邊採光好吃飯心情好'},
    {item:'⭐ 基本家電組',spec:'冷氣+洗衣機+冰箱',material:'選「一級能效」最省電',price:'NT$ 40,000-65,000',brand:'🛒 冷氣：大金/日立 · 洗衣機：LG · 冰箱：Panasonic',placement:'冷氣裝臥室+客廳、洗衣機放陽台、冰箱靠廚房牆'},
  ] : [
    {item:`${sty.label}主沙發`,spec:'L型 260×180cm',material:'高密度泡棉+棉麻混紡',price:'NT$ 35,000-55,000',brand:'推薦：IKEA / 宜得利',placement:`靠${dir.label}方實牆擺放，符合風水靠山原則`},
    {item:'實木茶几',spec:'120×60×45cm',material:'橡木/胡桃木',price:'NT$ 8,000-15,000',brand:'推薦：無印良品 / 詩肯柚木',placement:'客廳中央，與沙發保持45cm走道'},
    {item:'收納電視櫃',spec:'180×45×50cm',material:`${sty.label}風格板材`,price:'NT$ 12,000-25,000',brand:'推薦：特力屋 / IKEA',placement:'沙發對面牆面，高度讓視線自然平視'},
    {item:'主臥雙人床',spec:'Queen 180×210cm',material:'獨立筒彈簧+乳膠',price:'NT$ 20,000-40,000',brand:'推薦：眠豆腐 / 德泰',placement:'床頭靠實牆，避免正對門口（風水忌沖）'},
    {item:'多功能書桌',spec:'140×70×75cm',material:'實木桌面+金屬腳',price:'NT$ 6,000-12,000',brand:'推薦：IKEA / Herman Miller',placement:'靠窗擺放，採光佳且利文昌位'},
  ];

  const budgetBase = isLandlord ? [
    {category:'基礎工程',pct:20,amount:'2-5萬',items:'油漆（選防汙漆）/超耐磨地板/簡易水電'},
    {category:'家具採購',pct:30,amount:'3-8萬',items:'沙發/床組/桌椅/衣櫃（選耐用款）'},
    {category:'家電配備',pct:30,amount:'3.5-6萬',items:'冷氣/冰箱/洗衣機/熱水器'},
    {category:'軟裝+雜項',pct:10,amount:'1-3萬',items:'窗簾/燈具/基本廚具/清潔'},
    {category:'預備金',pct:10,amount:'1-2萬',items:'突發狀況/租客退租後翻新'},
  ] : isRenovator ? [
    {category:'🔧 拆除與基礎工程（核心）',pct:45,amount:budget.includes('10')?'5-12萬':'15-40萬',items:'水電管線重拉/壁癌處理/防水工程/泥作'},
    {category:'🪟 門窗與地板',pct:15,amount:budget.includes('10')?'2-4萬':'5-12萬',items:'鋁門窗/氣密窗更換/超耐磨木地板/防滑磁磚'},
    {category:'🛋️ 實用家具家電',pct:25,amount:budget.includes('10')?'3-8萬':'8-20萬',items:'沿用堪用舊家電/添購必要耐用家具'},
    {category:'💰 隱形工程預備金',pct:15,amount:budget.includes('10')?'2-5萬':'5-15萬',items:'老屋常見的突發漏水或結構補強追加費用'},
  ] : isParent ? [
    {category:'🍼 安全基礎工程',pct:30,amount:budget.includes('10')?'4-9萬':'10-25萬',items:'全室無毒防敏油漆/綠建材地板/隱藏式線路槽'},
    {category:'🛋️ 圓角與防污家具',pct:35,amount:budget.includes('10')?'4-10萬':'12-30萬',items:'防貓抓防兒童塗鴉沙發/圓角實木家具/把手隱藏式收納櫃'},
    {category:'⚡ 空氣與環境家電',pct:20,amount:budget.includes('10')?'2-6萬':'6-15萬',items:'全熱交換器/空氣清淨機/冷暖變頻冷氣'},
    {category:'🪟 軟裝與防護套件',pct:15,amount:budget.includes('10')?'2-5萬':'5-10萬',items:'無繩窗簾/大型安全地墊/防撞邊條/防夾門擋'},
  ] : isBuyer ? [
    {category:'🔧 基礎工程（必做）',pct:25,amount:budget.includes('10')?'3-7萬':'8-20萬',items:'水電檢查/油漆粉刷/地板鋪設'},
    {category:'🛋️ 家具採購（核心）',pct:30,amount:budget.includes('10')?'4-9萬':'10-25萬',items:'沙發/床/衣櫃/餐桌椅/書桌'},
    {category:'⚡ 家電（必備）',pct:20,amount:budget.includes('10')?'4-6萬':'6-12萬',items:'冷氣/冰箱/洗衣機/熱水器'},
    {category:'🪟 軟裝佈置',pct:15,amount:budget.includes('10')?'1.5-4萬':'4-10萬',items:'窗簾/燈具/地毯/抱枕/掛畫'},
    {category:'💰 預備金（一定要留！）',pct:10,amount:budget.includes('10')?'1-3萬':'3-8萬',items:'裝修超支/搬家費/購物遺漏'},
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
    '沙發選科技布 or 貓抓布，防潑水且可機洗椅套',
    '廚房流理台選不鏽鋼 or 人造石，勿用大理石（易吃色）',
    '衛浴五金選台製品牌（如HCG），維修備品好找',
    '冷氣選變頻分離式，省電費減少租客抱怨',
    '安裝智能門鎖，租客換手時不用換鎖芯',
    '拍照前佈置抱枕、盆栽、桌巾，提升租屋平台照片質感',
    '預估月租 × 12 ÷ 總投入 = 年報酬率，目標 > 5%',
    `物件朝${dir.label}，${dir.tip}，看屋時可向租客介紹風水優勢`,
  ] : isRenovator ? [
    '⚠️ 老屋裝潢第一步：不要先看家具，先找專業師傅評估「漏水」與「壁癌」狀況！',
    '🔌 電箱與管線通常只有 15-20 年壽命，為了用電安全強烈建議全室重拉配置。',
    '🚪 鋁門窗如果變形或漏風，務必更換氣密窗，對隔音與冷氣保冷影響極大。',
    '💰 拆除工程很花錢（尤其是打牆），盡量保留好用的原格局，減少清運費用。',
    '🪟 浴室防水層一定要重做！至少塗刷 180cm 高度，並進行 48 小時積水測試。',
    '💡 陽台若要外推，請務必再三確認法規與建築結構安全，不建議隨意敲打剪力牆。',
    '🌿 老屋通風不良常有霉味，可考慮安裝全熱交換器，或至少在衛浴裝多合一暖風機。',
    `🔮 ${dir.label}向老屋（${dir.element}），${dir.tip}。重拉管線時可注意此方位的採光引入。`,
  ] : isParent ? [
    '🛡️ 挑選家具的三大鐵則：「圓角設計」、「穩固不搖晃」、「無突出把手」。',
    '🌿 全室強烈建議使用『綠建材』。油漆指定標示零甲醛或竹炭淨味配方！',
    '🧩 客廳改用「大型巧拼/一體成型遊戲墊」取代厚重地毯，防塵蟎又好擦拭。',
    '🔌 所有的低處插座，務必要購買「兒童防觸電安全插座蓋」全部封住。',
    '🪟 窗簾絕對禁用「拉繩式」百葉窗/捲簾！每年都有幼兒被繩索纏繞的意外，改用無繩款。',
    '🚪 櫃子若高度超過 60cm，務必使用 L 型鐵件固定在牆面上，防止幼兒攀爬倒塌。',
    '📺 電視強烈建議「壁掛」！如果放電視櫃上，一定要鎖死，避免孩子拉扯掉落。',
    `🧸 兒童房可安排在${dir.label}方，屬${dir.element}能量，有助於平穩孩子情緒。`,
  ] : isBuyer ? [
    '💡 交屋前一定要做「驗屋」！檢查水壓、漏水、電路、門窗密合度',
    '💡 裝修前先住一週，觀察採光、噪音、西曬位置，再決定格局',
    '💡 油漆千萬別省！選防潮防霉乳膠漆，虹牌全效或得利竹炭都不錯',
    '💡 地板推薦超耐磨木地板（約$2,500-4,000/坪），高CP值又好看',
    '💡 買家具前先量好「門寬」！沙發進不了門的慘案每天都在發生',
    '💡 系統櫃找工廠直營的比較便宜，品質不輸品牌（問Dcard裝潢版）',
    '💡 冷氣一定要裝「變頻」，雖然貴一點但電費差很多',
    '💡 浴室一定要做「乾濕分離」，不然地板永遠濕滑、容易發霉',
    '💡 插座數量寧多勿少！每面牆至少2組，廚房檯面至少3組',
    '💡 搬家前先裝好窗簾和冷氣，不然第一晚會很痛苦',
    `💡 您的房子朝${dir.label}（${dir.element}屬性），白話說就是「${dir.tip}」`,
    '💡 第一次買家具不要一次買齊！先買必需品，住一陣子再慢慢添購',
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

  const buyerChecklist = isBuyer ? [
    {phase:'交屋前',items:['驗屋（水電/漏水/門窗）','確認產權與權狀','拍照記錄屋況','確認管委會規定裝修時間']},
    {phase:'裝修規劃',items:['找設計師或自己規劃','量好每個房間尺寸','決定風格與預算','列出必要vs想要清單']},
    {phase:'基礎工程',items:['水電配線（插座位置）','泥作防水（浴室必做）','油漆粉刷','地板施工']},
    {phase:'家具採購',items:['床+床墊（最重要！）','沙發','餐桌椅','衣櫃/收納櫃','書桌（如需要）']},
    {phase:'家電安裝',items:['冷氣安裝','冰箱','洗衣機','熱水器','網路/第四台']},
    {phase:'軟裝入住',items:['窗簾安裝','燈具','寢具/毛巾','基本廚具鍋碗','清潔用品']},
  ] : isRenovator ? [
    {phase:'翻修勘估期',items:['壁癌滲水專業檢測','剪力牆防震評估','評估管線重拉(水電)','估算泥作防水預算']},
    {phase:'隱蔽工程',items:['水管/電線全室更新','電箱加大與斷路器升級','浴室牆面防水塗層']},
    {phase:'硬體工程',items:['鋁門窗氣密窗更換','木工隔間/天花板','超耐磨地板鋪裝']},
    {phase:'家具家電',items:['節能一級家電','保留堪用舊家具','添購耐用新家具']},
  ] : null;

  return {
    concept: conceptBase,
    layout: layoutBase,
    furnitureList: furnitureBase,
    colorPlan:{
      primary:sty.palette[0],secondary:sty.palette[1],accent:sty.palette[2],
      wall: isLandlord
        ? `建議全室白色或淺灰色防汙乳膠漆，通用性高、退租好補漆，局部點綴${ec.good}色系`
        : isBuyer
        ? `新手最安全的選擇：牆面用「百合白」或「淺暖灰」，不會出錯！想有個性可以「一面主牆」漆${ec.good}色系的跳色，其他牆維持白色。記得去油漆行買小罐試色再決定！`
        : `建議使用${ec.good}色系的乳膠漆，營造${sty.sub}的氛圍`,
      floor: isLandlord ? '超耐磨木地板（橡木色/灰橡色），耐用且萬用' : isBuyer ? '強烈推薦「超耐磨木地板」！比實木便宜一半、耐刮耐磨、好清潔，選橡木色或淺胡桃最百搭' : (sty.id==='japanese'?'淺色橡木木地板':'超耐磨木地板（中性色調）'),
      description: isLandlord
        ? `出租物件配色策略：以「中性色調 + 局部亮點」為原則。牆面維持白/淺灰，家具選${ec.good}系，讓租客容易搭配自己的物品。避免過度個人化的色彩（如${ec.avoid}），確保最大租客接受度。${sty.label}風格的元素可透過抱枕、掛畫等可拆卸軟裝帶入，退租更換成本低。`
        : isBuyer
        ? `🎨 新手配色祕訣：「70-20-10 法則」！70% 用大面積的中性色（白牆+木地板），20% 用家具的主色調（如${ec.good}色系的沙發或窗簾），10% 用小物點綴亮色（抱枕、花瓶、掛畫）。只要記住這個比例，怎麼配都好看！避免大面積使用${ec.avoid}。您家門朝${dir.label}屬${dir.element}，適合用${ec.good}色系，會讓空間感覺更舒服。`
        : `配色方案以${sty.label}美學為基礎，融合${dir.element}屬性的風水用色智慧。主色調採用${ec.good}，既符合風格定位又順應五行能量。避免大面積使用${ec.avoid}，以免干擾空間的五行平衡。牆面、地板、家具三者形成漸層過渡，創造視覺上的舒適與和諧。`,
    },
    lighting: isLandlord
      ? `出租物件燈光：全室採LED吸頂燈（色溫4000K中性白光），省電、亮度足、不需更換燈泡。臥室加裝壁燈增加溫馨感。玄關安裝感應燈，提升安全性與科技感。不建議安裝軌道燈或嵌燈（維修成本高）。`
      : isBuyer
      ? `💡 燈光新手指南：客廳裝「吸頂燈」（3000-4000K暖白光），一盞搞定整個空間。臥室選「暖黃光 2700K」比較好睡。書桌/廚房要「白光 4000K」看得清楚。建議全部選 LED 燈，省電又耐用。進階玩法：加一盞「落地燈」在沙發旁邊，看電視時只開它，氣氛超好！一盞好的落地燈（IKEA 就有很多選擇）可以讓房間瞬間升級。`
      : `燈光設計採用三層照明法：基礎照明（吸頂燈/嵌燈），中層照明（壁燈/軌道燈），重點照明（檯燈/落地燈）。客廳建議色溫3000-4000K暖白光，營造溫馨氛圍；書房區域建議4000-5000K中性白光，有利閱讀與工作。臥室使用2700K暖黃光，搭配調光系統，滿足不同情境需求。`,
    storage: isLandlord
      ? `出租物件收納：衣櫃必備（租客最重視），建議系統衣櫃含吊桿+層板。廚房上下櫃全配，浴室安裝鏡櫃+置物架。玄關鞋櫃是加分項。收納做足 = 看屋轉換率提高30%。`
      : isBuyer
      ? `🗄️ 收納新手心法：「東西沒有地方放」是新家最常見的困擾！建議：1️⃣ 玄關一定要有鞋櫃（30雙以上容量）2️⃣ 臥室做整面衣櫃（系統櫃CP值最高）3️⃣ 客廳電視牆做收納櫃（藏雜物神器）4️⃣ 浴室裝鏡櫃（鏡子+收納二合一）。買收納盒統一用白色/透明款，視覺上更整齊。`
      : `收納規劃以「八二法則」為核心 — 80%的物品藏於看不見之處，20%精選物品作為展示。玄關設置頂天立地鞋櫃，臥室規劃整面衣櫃系統，客廳電視牆整合收納機能。建議使用統一風格的收納盒與籃框，維持視覺整潔。`,
    budgetTable: budgetBase,
    fengshuiReport:{
      score:78,
      summary: isLandlord
        ? `物件朝${dir.label}屬${dir.element}，${dir.tip}。風水格局有利出租——${target}族群特別受益於${dir.element}能量。建議在看屋時向租客簡要說明風水優勢，可作為物件的差異化賣點。`
        : isBuyer
        ? `🔮 白話風水報告：您的新家大門朝「${dir.label}」，屬於「${dir.element}」的能量。簡單來說就是：${dir.tip}。這個方位很適合規劃成主要的生活空間！風水不用太迷信，但一些基本原則（像床不對門、沙發靠牆）其實也符合人體工學和心理學，遵循會讓住起來更舒服。`
        : `整體風水格局良好，大門朝${dir.label}屬${dir.element}，${dir.tip}。空間配置基本符合風水原則，建議微調部分家具擺放以進一步提升運勢。`,
      goodPoints:['大門朝向與空間用途相符','主要動線流暢無阻礙','光線充足，有助正面能量'],
      issues:[
        {problem:'部分角落可能形成「暗角」',solution:'建議擺放小型植栽或暖色燈具化解'},
        {problem:'鏡面位置需注意',solution:'避免鏡子正對大門或床位，可改為斜角擺放'},
      ],
      luckyItems:[`${dir.element}屬性開運植物（例：富貴竹、發財樹）`,'水晶球 or 風水擺件置於財位','香氛蠟燭增添空間正能量'],
      elementBalance:`${dir.element}為主導元素，建議搭配相生元素以達五行平衡。宜增加${dir.element==='水'?'金':dir.element==='木'?'水':dir.element==='火'?'木':dir.element==='土'?'火':'土'}屬性的裝飾。`,
    },
    timeline: isLandlord
      ? `出租裝修時程建議：極簡佈置（買家具+清潔）3-5天；標準裝修（油漆+地板+家具）2-3週；全面裝潢 4-6週。建議趁空屋期集中施工，縮短空租損失。多間物件可與同一廠商談批量折扣。`
      : isBuyer
      ? `⏰ 新手裝修時程表：第1週：驗屋+規劃+找廠商報價。第2-3週：水電配線+泥作防水。第4-5週：油漆+地板施工。第6-7週：系統櫃安裝+家電進場。第8週：家具到貨+軟裝佈置+大掃除。💡 實際可能要 2-3 個月，別太趕！每個工種之間需要「等乾」的時間。建議在裝修期間還不要退租，等新家完全好了再搬。`
      : '建議施工時程：簡單佈置約1-2週；基礎裝修約3-4週；全屋裝潢約6-8週。建議先確認水電管線，再進行硬裝工程，最後軟裝佈置。',
    tips: tipsBase,
    buyerChecklist: buyerChecklist,
    rentalTip: isLandlord ? {
      monthlyRent: state.propertyType==='studio'?'8,000-15,000':state.propertyType==='1bed'?'15,000-25,000':state.propertyType==='2bed'?'22,000-35,000':'30,000-50,000',
      roi: '預估年報酬率 5-8%',
      tip: `${pType}在${target}市場中，${sty.label}風格裝潢可提升月租 10-20%。建議拍攝專業照片上傳 591 / 好房網。`,
    } : null,
  };
}
