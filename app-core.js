// ── State Management ──
const STATE_KEY = 'rdesign-v3';
const PROJECTS_KEY = 'rdesign-projects';
const CHECKLIST_KEY = 'rdesign-checklist';
const DEFAULT_STATE = {
  persona:null, direction:null, floorplanImg:null, floorplanAnalysis:null,
  roomW:500, roomH:400, roomType:null, style:null, budget:null, occupants:null,
  priorities:[], notes:'', furniture:[], aiResult:null,
  // Landlord fields
  propertyName:'', propertyAddr:'', propertyType:null, rentalTarget:null,
  rentalBudget:null, batchMode:false,
  advancedEditMode:false,
  // Buyer fields
  buyerHouseAge:null,
  // Parent fields
  childAge:null,
  // Budget calculator
  customBudgetTotal:null,
  // Property status (landlord)
  propertyStatus:'empty', // 'renting','empty','renovating'
};

let state = {...DEFAULT_STATE};
let step = 0;
let fengWarnings = [];
let dragState = null;
let selectedUid = null;
let showLib = false;
let catOpen = null;
let resultTab = 'concept';
let genProg = 0;
let toastTimer = null;
let showHistory = false;
let showGrid = true;
let showProjects = false;
let activeProjectId = null;
let darkMode = localStorage.getItem('rdesign-dark') === 'true';

// ── Undo/Redo System (H: QA / I: Detail) ──
const MAX_HISTORY = 30;
let undoStack = [];
let redoStack = [];

function pushUndo() {
  undoStack.push(JSON.stringify(state.furniture));
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack = []; // Clear redo on new action
}

function undo() {
  if (undoStack.length === 0) { showToast('⏪ 沒有更多可復原'); return; }
  redoStack.push(JSON.stringify(state.furniture));
  const prev = JSON.parse(undoStack.pop());
  state.furniture = prev;
  saveState();
  render();
  showToast('⏪ 已復原');
}

function redo() {
  if (redoStack.length === 0) { showToast('⏩ 沒有更多可重做'); return; }
  undoStack.push(JSON.stringify(state.furniture));
  const next = JSON.parse(redoStack.pop());
  state.furniture = next;
  saveState();
  render();
  showToast('⏩ 已重做');
}

function loadState() {
  try {
    const s = localStorage.getItem(STATE_KEY);
    if (s) state = {...DEFAULT_STATE, ...JSON.parse(s)};
  } catch(e) {
    // Error boundary: corrupted state → reset
    console.warn('State corrupted, resetting:', e);
    state = {...DEFAULT_STATE};
    saveState();
  }
}

function saveState() {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e) {}
}

function up(patch) {
  // Push undo for furniture changes
  if (patch.furniture && JSON.stringify(patch.furniture) !== JSON.stringify(state.furniture)) {
    pushUndo();
  }
  Object.assign(state, patch);
  saveState();
  render();
}

function resetAll() {
  state = {...DEFAULT_STATE};
  step = 0; selectedUid = null; showLib = false; catOpen = null; resultTab = 'concept';
  undoStack = []; redoStack = [];
  saveState();
  render();
}

// ── Dark Mode ──
function toggleDark() {
  darkMode = !darkMode;
  localStorage.setItem('rdesign-dark', darkMode);
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  render();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
}

// ── History Management ──
function getHistory() {
  try { return JSON.parse(localStorage.getItem('rdesign-history') || '[]'); } catch(e) { return []; }
}

function saveToHistory() {
  if (!state.aiResult) return;
  const sty = DESIGN_STYLES.find(s=>s.id===state.style);
  const dir = DIRECTIONS.find(d=>d.id===state.direction);
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString('zh-TW'),
    style: sty?.label || '未知',
    direction: dir?.label || '未知',
    area: calcArea(),
    state: JSON.parse(JSON.stringify(state)),
  };
  const hist = getHistory();
  hist.unshift(entry);
  if (hist.length > 10) hist.length = 10;
  localStorage.setItem('rdesign-history', JSON.stringify(hist));
  showToast('✅ 方案已儲存');
}

function loadFromHistory(entry) {
  state = {...DEFAULT_STATE, ...entry.state};
  step = getSteps().length - 1;
  showHistory = false;
  saveState();
  render();
}

function deleteHistory(id) {
  const hist = getHistory().filter(h => h.id !== id);
  localStorage.setItem('rdesign-history', JSON.stringify(hist));
  render();
}

// ── Grid Toggle ──
function toggleGrid() {
  showGrid = !showGrid;
  render();
}

// ── Checklist Persistence (C: First-time buyer / I: Detail) ──
function getChecklist() {
  try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}'); } catch(e) { return {}; }
}

function toggleChecklistItem(key) {
  const cl = getChecklist();
  cl[key] = !cl[key];
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(cl));
}

function isChecklistChecked(key) {
  return !!getChecklist()[key];
}

// ── Multi-Property Project Management ──
function getProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); } catch(e) { return []; }
}

function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function createProject(name, addr) {
  const projects = getProjects();
  const proj = {
    id: Date.now(),
    name: name || '未命名物件',
    addr: addr || '',
    createdAt: new Date().toLocaleDateString('zh-TW'),
    updatedAt: new Date().toLocaleDateString('zh-TW'),
    state: JSON.parse(JSON.stringify(state)),
    hasResult: !!state.aiResult,
    status: state.propertyStatus || 'empty',
  };
  projects.unshift(proj);
  saveProjects(projects);
  activeProjectId = proj.id;
  showToast('✅ 物件已建立：' + proj.name);
  return proj;
}

function saveCurrentProject() {
  if (!activeProjectId) {
    createProject(state.propertyName || '物件 ' + (getProjects().length + 1), state.propertyAddr);
    return;
  }
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === activeProjectId);
  if (idx >= 0) {
    projects[idx].state = JSON.parse(JSON.stringify(state));
    projects[idx].updatedAt = new Date().toLocaleDateString('zh-TW');
    projects[idx].hasResult = !!state.aiResult;
    projects[idx].name = state.propertyName || projects[idx].name;
    projects[idx].addr = state.propertyAddr || projects[idx].addr;
    projects[idx].status = state.propertyStatus || projects[idx].status;
    saveProjects(projects);
    showToast('✅ 物件已更新');
  }
}

function loadProject(proj) {
  state = {...DEFAULT_STATE, ...proj.state};
  activeProjectId = proj.id;
  step = proj.hasResult ? getSteps().length - 1 : 0;
  showProjects = false;
  saveState();
  render();
}

function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
  if (activeProjectId === id) activeProjectId = null;
  render();
}

function cloneProject(proj) {
  const projects = getProjects();
  const clone = {
    ...JSON.parse(JSON.stringify(proj)),
    id: Date.now(),
    name: proj.name + ' (複製)',
    createdAt: new Date().toLocaleDateString('zh-TW'),
    updatedAt: new Date().toLocaleDateString('zh-TW'),
  };
  clone.state.aiResult = null;
  clone.hasResult = false;
  projects.unshift(clone);
  saveProjects(projects);
  showToast('✅ 已複製：' + clone.name);
  render();
}

function createFromTemplate(templateName) {
  const templates = {
    studio: { roomW:350, roomH:300, roomType:'bedroom', occupants:1, budget:'low',
      propertyType:'studio', notes:'小套房出租，需簡約實用',
      priorities:['收納空間','光線氛圍'] },
    oneBed: { roomW:450, roomH:380, roomType:'living', occupants:2, budget:'low',
      propertyType:'1bed', notes:'一房一廳，適合上班族或小家庭',
      priorities:['收納空間','光線氛圍','在家辦公'] },
    twoBed: { roomW:550, roomH:450, roomType:'living', occupants:3, budget:'mid',
      propertyType:'2bed', notes:'兩房，家庭租屋需求',
      priorities:['收納空間','兒童安全','隔音效果'] },
    threeBed: { roomW:700, roomH:550, roomType:'living', occupants:4, budget:'mid',
      propertyType:'3bed', notes:'三房，大家庭或合租',
      priorities:['收納空間','光線氛圍','隔音效果'] },
  };
  const t = templates[templateName];
  if (!t) return;
  state = {...DEFAULT_STATE, ...t, persona:'landlord'};
  activeProjectId = null;
  step = 1;
  saveState();
  showProjects = false;
  render();
}

function getProjectStats() {
  const projects = getProjects();
  const total = projects.length;
  const completed = projects.filter(p => p.hasResult).length;
  const renting = projects.filter(p => p.status === 'renting').length;
  const styles = {};
  let totalInvestment = 0;
  projects.forEach(p => {
    const s = p.state?.style;
    if (s) styles[s] = (styles[s]||0) + 1;
    // Estimate investment from budget
    const b = p.state?.budget;
    if (b === 'low') totalInvestment += 20;
    else if (b === 'mid') totalInvestment += 55;
    else if (b === 'high') totalInvestment += 100;
  });
  const topStyle = Object.entries(styles).sort((a,b) => b[1]-a[1])[0];
  return { total, completed, renting, topStyle: topStyle ? DESIGN_STYLES.find(s=>s.id===topStyle[0])?.label : '—', totalInvestment };
}

// ── Steps Logic ──
function getSteps() {
  const all = [
    {id:'persona',title:'歡迎'},
    {id:'direction',title:'方位設定'},
    {id:'floorplan',title:'空間設定'},
    {id:'style',title:'風格與需求'},
    {id:'editor',title:'家具擺放'},
    {id:'generating',title:'生成中'},
    {id:'result',title:'設計方案'},
  ];
  if (state.persona === 'inspire') return [all[0],all[1],all[3],all[5],all[6]];
  
  if (state.persona === 'diy' || state.persona === 'plan') return all;

  if (state.persona === 'landlord' || state.persona === 'buyer' || state.persona === 'renovator' || state.persona === 'parent') {
    if (state.advancedEditMode) {
      return [all[0],{id:'property',title:'物件資訊'},all[1],all[2],all[3],all[4],all[5],all[6]];
    }
    return [all[0],{id:'property',title:'物件資訊'},all[1],all[2],all[3],all[5],all[6]];
  }
  return all;
}

function goNext() {
  const s = getSteps();
  const cur = s[step];
  // Form validation (H: QA)
  if (cur?.id === 'direction' && !state.direction) {
    showToast('⚠️ 請選擇大門朝向');
    return;
  }
  if (cur?.id === 'style' && !state.style) {
    showToast('⚠️ 請選擇設計風格');
    return;
  }
  if (cur?.id === 'style' && !state.roomType) {
    showToast('⚠️ 請選擇空間類型');
    return;
  }
  step = Math.min(step+1, s.length-1);
  render();
}
function goBack() { step = Math.max(step-1, 0); render(); }
function goTo(i) { step = i; render(); }

// ── Dynamic Feng Shui Score (I: Detail) ──
function checkFengShui() {
  if (!state.furniture?.length) { fengWarnings = []; return; }
  const room = {width: state.roomW, height: state.roomH};
  const w = [];
  state.furniture.forEach(item => {
    FENG_RULES.forEach(rule => {
      try {
        if (rule.match(item, state.furniture, room))
          w.push({uid:item.uid, label:item.label, severity:rule.severity, msg:rule.msg});
      } catch(e) { /* Skip broken rules gracefully */ }
    });
  });
  fengWarnings = w;
}

function calcDynamicFengScore() {
  if (!state.furniture?.length) return 70;
  const room = {width: state.roomW, height: state.roomH};
  let score = 85; // Base score
  const severityPenalty = { high: -8, medium: -4, low: -2 };
  const penalties = new Set();
  
  state.furniture.forEach(item => {
    FENG_RULES.forEach(rule => {
      try {
        if (rule.match(item, state.furniture, room)) {
          const key = rule.msg;
          if (!penalties.has(key)) {
            penalties.add(key);
            score += (severityPenalty[rule.severity] || -2);
          }
        }
      } catch(e) {}
    });
  });

  // Bonuses
  const hasBedOnWall = state.furniture.some(i => i.id?.startsWith('bed') && (i.y < i.h/2 + 50 || i.y > room.height - i.h/2 - 50 || i.x < i.w/2 + 50 || i.x > room.width - i.w/2 - 50));
  if (hasBedOnWall) score += 3;
  
  const hasSofaOnWall = state.furniture.some(i => i.id?.startsWith('sofa') && i.y > room.height - i.h - 60);
  if (hasSofaOnWall) score += 3;

  const hasPlant = state.furniture.some(i => i.id?.includes('plant'));
  if (hasPlant) score += 2;

  return Math.max(30, Math.min(98, score));
}

// ── Furniture Alignment Tools (A: Designer) ──
function alignFurniture(mode) {
  if (!selectedUid) return;
  pushUndo();
  const item = state.furniture.find(i => i.uid === selectedUid);
  if (!item) return;
  
  switch(mode) {
    case 'center-h':
      item.x = state.roomW / 2;
      break;
    case 'center-v':
      item.y = state.roomH / 2;
      break;
    case 'wall-top':
      item.y = (item.rotation === 90 || item.rotation === 270 ? item.w : item.h) / 2 + 5;
      break;
    case 'wall-bottom':
      item.y = state.roomH - (item.rotation === 90 || item.rotation === 270 ? item.w : item.h) / 2 - 5;
      break;
    case 'wall-left':
      item.x = (item.rotation === 90 || item.rotation === 270 ? item.h : item.w) / 2 + 5;
      break;
    case 'wall-right':
      item.x = state.roomW - (item.rotation === 90 || item.rotation === 270 ? item.h : item.w) / 2 - 5;
      break;
  }
  state.furniture = state.furniture.map(i => i.uid === selectedUid ? item : i);
  saveState();
  render();
}

// ── Toast ──
function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'polite');
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2500);
}

// ── Helpers ──
function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    Object.entries(props).forEach(([k,v]) => {
      if (k === 'style' && typeof v === 'object') {
        Object.assign(el.style, v);
      } else if (k.startsWith('on')) {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'className') {
        el.className = v;
      } else if (k === 'innerHTML') {
        el.innerHTML = v;
      } else {
        el.setAttribute(k, v);
      }
    });
  }
  children.flat(Infinity).forEach(c => {
    if (c == null || c === false) return;
    if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(c));
    else if (c instanceof Node) el.appendChild(c);
  });
  return el;
}

function calcArea() {
  return (state.roomW/100 * state.roomH/100 * 0.3025).toFixed(1);
}

function badge(severity) {
  const m = {high:'嚴重',medium:'注意',low:'建議'};
  return h('span', {className:`badge badge-${severity}`}, m[severity]||'建議');
}

// ── Share Function (G: Strategy Partner) ──
function shareDesign() {
  const text = `來看看我用「室·設計 PRO」打造的 ${calcArea()} 坪 ${DESIGN_STYLES.find(s=>s.id===state.style)?.label||''} 風格空間設計方案！✨\n#室設計PRO #室內設計 #AI設計`;
  if (navigator.share) {
    navigator.share({ title: '室·設計 PRO 設計方案', text }).catch(()=>{});
  } else {
    try { navigator.clipboard.writeText(text); showToast('✅ 分享文字已複製到剪貼簿'); } catch(e) { showToast('⚠️ 複製失敗'); }
  }
}

// ── PDF Export stub (A: Designer) ──
function exportPDF() {
  showToast('📄 PDF 報告生成中...');
  setTimeout(() => {
    exportAsText();
    showToast('✅ 報告已複製到剪貼簿（PDF 功能開發中）');
  }, 1000);
}

// ── Budget Calculator (C: First-time Buyer / I: Detail) ──
function calcBudgetBreakdown(total) {
  if (!total || total <= 0) return null;
  const r = state.aiResult;
  if (!r?.budgetTable) return null;
  return r.budgetTable.map(b => ({
    ...b,
    actualAmount: Math.round(total * b.pct / 100)
  }));
}
