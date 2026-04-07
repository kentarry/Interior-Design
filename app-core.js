// ── State Management ──
const STATE_KEY = 'rdesign-v3';
const PROJECTS_KEY = 'rdesign-projects';
const DEFAULT_STATE = {
  persona:null, direction:null, floorplanImg:null, floorplanAnalysis:null,
  roomW:500, roomH:400, roomType:null, style:null, budget:null, occupants:null,
  priorities:[], notes:'', furniture:[], aiResult:null,
  // Landlord fields
  propertyName:'', propertyAddr:'', propertyType:null, rentalTarget:null,
  rentalBudget:null, batchMode:false,
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

function loadState() {
  try {
    const s = localStorage.getItem(STATE_KEY);
    if (s) state = {...DEFAULT_STATE, ...JSON.parse(s)};
  } catch(e) {}
}

function saveState() {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e) {}
}

function up(patch) {
  Object.assign(state, patch);
  saveState();
  render();
}

function resetAll() {
  state = {...DEFAULT_STATE};
  step = 0; selectedUid = null; showLib = false; catOpen = null; resultTab = 'concept';
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
  if (hist.length > 10) hist.length = 10; // Keep max 10
  localStorage.setItem('rdesign-history', JSON.stringify(hist));
  showToast('✅ 方案已儲存');
}

function loadFromHistory(entry) {
  state = {...DEFAULT_STATE, ...entry.state};
  step = getSteps().length - 1; // Go to result page
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
  };
  projects.unshift(proj);
  saveProjects(projects);
  activeProjectId = proj.id;
  showToast('✅ 物件已建立：' + proj.name);
  return proj;
}

function saveCurrentProject() {
  if (!activeProjectId) {
    // Create new project
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
  // Clear result so user can regenerate
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
  step = 1; // Skip persona, go to direction
  saveState();
  showProjects = false;
  render();
}

function getProjectStats() {
  const projects = getProjects();
  const total = projects.length;
  const completed = projects.filter(p => p.hasResult).length;
  const styles = {};
  projects.forEach(p => {
    const s = p.state?.style;
    if (s) styles[s] = (styles[s]||0) + 1;
  });
  const topStyle = Object.entries(styles).sort((a,b) => b[1]-a[1])[0];
  return { total, completed, topStyle: topStyle ? DESIGN_STYLES.find(s=>s.id===topStyle[0])?.label : '—' };
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
  if (state.persona === 'landlord') return [all[0],{id:'property',title:'物件資訊'},all[1],all[2],all[3],all[4],all[5],all[6]];
  return all;
}

function goNext() { const s = getSteps(); step = Math.min(step+1, s.length-1); render(); }
function goBack() { step = Math.max(step-1, 0); render(); }
function goTo(i) { step = i; render(); }

// ── Feng Shui Check ──
function checkFengShui() {
  if (!state.furniture?.length) { fengWarnings = []; return; }
  const room = {width: state.roomW, height: state.roomH};
  const w = [];
  state.furniture.forEach(item => {
    FENG_RULES.forEach(rule => {
      if (rule.match(item, state.furniture, room))
        w.push({uid:item.uid, label:item.label, severity:rule.severity, msg:rule.msg});
    });
  });
  fengWarnings = w;
}

// ── Toast ──
function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
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
