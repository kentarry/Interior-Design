/* ═══════════════════════════════════════════
   室·設計 PRO — AI 全方位室內設計工作室
   ═══════════════════════════════════════════ */

// ── Theme Colors ──
const T = {
  accent:'#B8956A', accentD:'#96764E', accentL:'#F3EBDF',
  success:'#5E9E72', warn:'#C49A3C', error:'#BF5B5B', feng:'#C04040',
  text:'#1F1B16', textSec:'#7D7568', textTer:'#AEA899',
  border:'#E2DCD3', card:'#FFFFFF', bg:'#F6F4F0',
};

// ── Furniture Database ──
const FURNITURE = [
  { cat:'客廳',icon:'🛋️',items:[
    {id:'sofa3',label:'三人沙發',w:210,h:90,color:'#8B7D6B',icon:'🛋️'},
    {id:'sofa2',label:'雙人沙發',w:155,h:85,color:'#9B8D7B',icon:'🛋️'},
    {id:'armchair',label:'單人扶手椅',w:80,h:80,color:'#A89880',icon:'🪑'},
    {id:'coffeetbl',label:'茶几',w:120,h:60,color:'#C4B8A0',icon:'☕'},
    {id:'tvstand',label:'電視櫃',w:180,h:45,color:'#8B7D6B',icon:'📺'},
    {id:'tv',label:'電視(壁掛)',w:130,h:8,color:'#2A2A2A',icon:'📺'},
    {id:'bookshelf',label:'書櫃',w:120,h:35,color:'#9B8D7B',icon:'📚'},
    {id:'sidetbl',label:'邊桌',w:50,h:50,color:'#C4B8A0',icon:'🔲'},
    {id:'rug_l',label:'大地毯',w:240,h:170,color:'#D8CCBB',icon:'▮',opacity:.3},
  ]},
  { cat:'臥室',icon:'🛏️',items:[
    {id:'bed_k',label:'雙人床King',w:200,h:220,color:'#7B8999',icon:'🛏️'},
    {id:'bed_q',label:'雙人床Queen',w:180,h:210,color:'#8B99A9',icon:'🛏️'},
    {id:'bed_s',label:'單人床',w:105,h:200,color:'#9BA9B9',icon:'🛏️'},
    {id:'nightstand',label:'床頭櫃',w:50,h:45,color:'#A89880',icon:'🔲'},
    {id:'wardrobe',label:'衣櫃',w:200,h:60,color:'#7B6D5B',icon:'🚪'},
    {id:'dresser',label:'化妝台',w:100,h:50,color:'#C4B8A0',icon:'🪞'},
    {id:'desk',label:'書桌',w:140,h:70,color:'#9B8D7B',icon:'💻'},
    {id:'chair_d',label:'書桌椅',w:55,h:55,color:'#7B8999',icon:'🪑'},
  ]},
  { cat:'餐廚',icon:'🍳',items:[
    {id:'din6',label:'六人餐桌',w:170,h:95,color:'#A89880',icon:'🍽️'},
    {id:'din4',label:'四人餐桌',w:130,h:80,color:'#B8A890',icon:'🍽️'},
    {id:'din_chair',label:'餐椅',w:45,h:45,color:'#8B7D6B',icon:'🪑'},
    {id:'island',label:'中島',w:180,h:90,color:'#909090',icon:'🏝️'},
    {id:'fridge',label:'冰箱',w:75,h:70,color:'#B0B0B0',icon:'🧊'},
    {id:'counter',label:'廚具檯面',w:200,h:60,color:'#A0A0A0',icon:'🔪'},
  ]},
  { cat:'衛浴',icon:'🚿',items:[
    {id:'bathtub',label:'浴缸',w:170,h:80,color:'#E0E0E0',icon:'🛁'},
    {id:'shower',label:'淋浴間',w:95,h:95,color:'#B0D0E0',icon:'🚿'},
    {id:'toilet',label:'馬桶',w:42,h:68,color:'#EBEBEB',icon:'🚽'},
    {id:'vanity',label:'洗手台',w:90,h:55,color:'#D4D4D4',icon:'🪞'},
  ]},
  { cat:'裝飾家電',icon:'🌿',items:[
    {id:'plant_l',label:'大型植栽',w:55,h:55,color:'#5A8A5A',icon:'🌳'},
    {id:'plant_s',label:'小型盆栽',w:30,h:30,color:'#6B9B6B',icon:'🪴'},
    {id:'lamp_f',label:'落地燈',w:35,h:35,color:'#E8D8B0',icon:'💡'},
    {id:'washer',label:'洗衣機',w:60,h:60,color:'#C0C0C0',icon:'🫧'},
    {id:'rug_s',label:'小地毯',w:140,h:90,color:'#DDD0C0',icon:'▮',opacity:.3},
  ]},
  { cat:'玄關',icon:'🚪',items:[
    {id:'shoe_cab',label:'鞋櫃',w:120,h:35,color:'#8B7D6B',icon:'👟'},
    {id:'coat_rack',label:'掛衣架',w:45,h:45,color:'#9B8D7B',icon:'🧥'},
    {id:'console',label:'玄關桌',w:100,h:35,color:'#A89880',icon:'🔲'},
    {id:'bench',label:'穿鞋椅',w:80,h:40,color:'#B8A890',icon:'🪑'},
    {id:'umbrella',label:'雨傘架',w:25,h:25,color:'#909090',icon:'☂️'},
    {id:'key_box',label:'鑰匙收納',w:30,h:15,color:'#C4B8A0',icon:'🔑'},
  ]},
  { cat:'陽台',icon:'🌤️',items:[
    {id:'lounge',label:'休閒躺椅',w:170,h:65,color:'#8B99A9',icon:'🏖️'},
    {id:'outdoor_tbl',label:'戶外小桌',w:60,h:60,color:'#A89880',icon:'☕'},
    {id:'outdoor_chair',label:'戶外椅',w:50,h:50,color:'#7B8999',icon:'🪑'},
    {id:'planter',label:'花盆架',w:80,h:30,color:'#5A8A5A',icon:'🌱'},
    {id:'dryer',label:'曬衣架',w:150,h:40,color:'#C0C0C0',icon:'👕'},
    {id:'swing',label:'吊椅',w:70,h:70,color:'#D4956A',icon:'🪺'},
  ]},
];

// ── Feng Shui Directions ──
const DIRECTIONS = [
  {id:'N',label:'北',deg:0,element:'水',color:'#1B4D6E',tip:'事業運・適合書房',emoji:'💧'},
  {id:'NE',label:'東北',deg:45,element:'土',color:'#8B7355',tip:'文昌位・適合學習區',emoji:'🪨'},
  {id:'E',label:'東',deg:90,element:'木',color:'#3A7A3A',tip:'健康運・適合餐廳',emoji:'🌿'},
  {id:'SE',label:'東南',deg:135,element:'木',color:'#4A8A4A',tip:'財位・適合客廳',emoji:'🌳'},
  {id:'S',label:'南',deg:180,element:'火',color:'#C04040',tip:'名聲運・採光最佳',emoji:'🔥'},
  {id:'SW',label:'西南',deg:225,element:'土',color:'#9B7A55',tip:'桃花運・適合主臥',emoji:'🏔️'},
  {id:'W',label:'西',deg:270,element:'金',color:'#B49A5A',tip:'子女運・適合兒童房',emoji:'⚙️'},
  {id:'NW',label:'西北',deg:315,element:'金',color:'#A4884A',tip:'貴人運・適合主人房',emoji:'🔔'},
];

const FENG_RULES = [
  {match:(item,items,room)=>item.id.startsWith('bed')&&item.y<item.h/2+30,severity:'high',msg:'床頭不宜靠近門口方向'},
  {match:(item,items,room)=>item.id.startsWith('bed')&&Math.abs(item.x-room.width/2)<item.w/2&&item.y<100,severity:'high',msg:'床不宜正對房門（沖煞）'},
  {match:(item,items,room)=>item.id==='toilet'&&items.some(i=>i.id.startsWith('bed')&&Math.abs(i.x-item.x)<120&&Math.abs(i.y-item.y)<120),severity:'high',msg:'馬桶不宜緊鄰床位'},
  {match:(item,items,room)=>item.id.startsWith('sofa')&&item.y>room.height-item.h-20,severity:'medium',msg:'沙發背後無牆，缺乏靠山'},
  {match:(item,items,room)=>item.id==='dresser'&&items.some(i=>i.id.startsWith('bed')&&Math.abs(i.x-item.x)<100),severity:'medium',msg:'化妝鏡避免正對床位'},
  {match:(item,items,room)=>item.id==='fridge'&&items.some(i=>i.id==='counter'&&Math.abs(i.x-item.x)<90&&Math.abs(i.y-item.y)<40),severity:'low',msg:'冰箱避免緊貼爐灶（水火相沖）'},
];

const DESIGN_STYLES = [
  {id:'modern',label:'現代簡約',sub:'乾淨・理性・留白',palette:['#2D2D2D','#F5F0EB','#C4A87A','#E8E2DA']},
  {id:'scandi',label:'北歐風',sub:'溫暖・自然・Hygge',palette:['#F7F3EE','#A8BFA0','#D4A574','#E8DFD0']},
  {id:'japanese',label:'日式侘寂',sub:'禪意・素材・呼吸',palette:['#E8DFD0','#8B7355','#6B8E6B','#F5F0E8']},
  {id:'industrial',label:'工業風',sub:'粗獷・金屬・原始',palette:['#3D3D3D','#8B5A2B','#A0522D','#D4C8B8']},
  {id:'luxury',label:'輕奢',sub:'精緻・品味・質感',palette:['#1C1C1C','#C4A265','#F5F0E8','#6B5B4A']},
  {id:'chinese',label:'新中式',sub:'東方・韻味・傳承',palette:['#5B3A29','#C8102E','#F0E6D3','#2D4A3E']},
  {id:'boho',label:'波西米亞',sub:'自由・層次・手作',palette:['#D4956A','#7B6B5D','#C9B896','#8B5E3C']},
  {id:'coastal',label:'海岸風',sub:'清新・悠閒・自然',palette:['#5B8FB9','#F5F0E8','#DEB887','#87CEEB']},
  {id:'midcentury',label:'中世紀復古',sub:'經典・有機・懷舊',palette:['#D4A017','#2F4F4F','#CD853F','#F5E6D3']},
  {id:'farmhouse',label:'鄉村風',sub:'質樸・溫馨・手感',palette:['#F5F0E1','#6B8E23','#8B7355','#E8DFD0']},
];

const ROOM_TYPES = [
  {id:'living',label:'客廳',icon:'🛋️'},
  {id:'bedroom',label:'臥室',icon:'🛏️'},
  {id:'study',label:'書房',icon:'💻'},
  {id:'dining',label:'餐廳',icon:'🍽️'},
  {id:'kitchen',label:'廚房',icon:'🍳'},
  {id:'bathroom',label:'浴室',icon:'🚿'},
];

const ELEM_COLORS = {
  水:{good:'黑、深藍',avoid:'大面積紅色'},
  木:{good:'綠、原木色',avoid:'大面積白色'},
  火:{good:'紅、橘暖色',avoid:'大面積黑色'},
  土:{good:'黃、米色大地色',avoid:'大面積綠色'},
  金:{good:'白、金、銀灰',avoid:'大面積紅色'},
};
