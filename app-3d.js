// ── 3D Scene Management ──
let is3DMode = false;
let scene3d = null;
let renderer3d = null;

function show3DPreview() {
  if (typeof THREE === 'undefined') {
    showToast('❌ 3D 引擎載入失敗，請檢查網路連線或重試。');
    return;
  }
  is3DMode = true;

  // 1. Container setup
  const container = document.createElement('div');
  container.className = 'canvas-3d-overlay animate-fade-in';
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.zIndex = '9999';
  container.style.background = 'var(--bg)';
  document.body.appendChild(container);

  // 2. UI overlaid on 3D
  const header = document.createElement('div');
  header.className = 'header-3d';
  header.style.position = 'absolute';
  header.style.top = '0';
  header.style.left = '0';
  header.style.right = '0';
  header.style.padding = '16px 24px';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.background = 'linear-gradient(to bottom, rgba(31,27,22,0.8), transparent)';
  header.style.zIndex = '1000';
  
  const title = document.createElement('h3');
  title.style.color = '#fff';
  title.style.margin = '0';
  title.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
  title.textContent = '✨ 3D 空間預覽模式';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-primary';
  closeBtn.textContent = '✖ 關閉 3D 預覽';
  closeBtn.onclick = () => {
    is3DMode = false;
    if (renderer3d) {
      renderer3d.dispose();
      renderer3d.forceContextLoss();
    }
    container.remove();
  };

  header.appendChild(title);
  header.appendChild(closeBtn);
  container.appendChild(header);

  const tips = document.createElement('div');
  tips.style.position = 'absolute';
  tips.style.bottom = '24px';
  tips.style.left = '50%';
  tips.style.transform = 'translateX(-50%)';
  tips.style.background = 'rgba(0,0,0,0.6)';
  tips.style.color = '#fff';
  tips.style.padding = '8px 16px';
  tips.style.borderRadius = '20px';
  tips.style.fontSize = '12px';
  tips.style.letterSpacing = '1px';
  tips.style.backdropFilter = 'blur(8px)';
  tips.textContent = '滑鼠左鍵：旋轉 ｜ 右鍵：平移 ｜ 滾輪：縮放';
  container.appendChild(tips);

  // 3. Three.js Initialization
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF6F4F0);
  // Fog for depth
  scene.fog = new THREE.Fog(0xF6F4F0, 1000, 3000);

  const W = window.innerWidth;
  const H = window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, W / H, 10, 5000);
  
  // Set camera to look down at an angle
  const maxDim = Math.max(state.roomW, state.roomH);
  camera.position.set(0, maxDim * 1.5, maxDim * 1.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer3d = renderer;

  // Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't look below ground
  
  // 4. Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemiLight.position.set(0, 500, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  dirLight.position.set(300, 600, -300);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  const d = Math.max(state.roomW, state.roomH);
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.camera.far = 2000;
  dirLight.shadow.bias = -0.001;
  scene.add(dirLight);

  // 5. Floor Construction (Centered)
  const cx = state.roomW / 2;
  const cy = state.roomH / 2;

  const floorTexConfig = { color: 0xE8E3D9, roughness: 0.8 };
  // Wood floor if modern or japandi styles
  if(state.style === 'japanese' || state.style === 'scandi') {
      floorTexConfig.color = 0xD4C1A5;
  }
  const floorMat = new THREE.MeshStandardMaterial(floorTexConfig);
  const floorGeo = new THREE.BoxGeometry(state.roomW, 4, state.roomH);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(0, -2, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // Outline for the room limits
  const gridHelper = new THREE.GridHelper(Math.max(state.roomW, state.roomH) * 2, 20, 0xCCCCCC, 0xEEEEEE);
  gridHelper.position.y = -2;
  scene.add(gridHelper);

  // Add walls (transparent/short to see inside)
  const wallMat = new THREE.MeshStandardMaterial({color: 0xFAFAFA, transparent: true, opacity: 0.3});
  const wallH = 150; // Don't make it to ceiling to keep visibility
  const thickness = 10;
  
  // Wall North
  const wN = new THREE.Mesh(new THREE.BoxGeometry(state.roomW, wallH, thickness), wallMat);
  wN.position.set(0, wallH/2, -state.roomH/2 - thickness/2);
  scene.add(wN);
  // Wall South
  const wS = new THREE.Mesh(new THREE.BoxGeometry(state.roomW, wallH, thickness), wallMat);
  wS.position.set(0, wallH/2, state.roomH/2 + thickness/2);
  scene.add(wS);
  // Wall East
  const wE = new THREE.Mesh(new THREE.BoxGeometry(thickness, wallH, state.roomH), wallMat);
  wE.position.set(state.roomW/2 + thickness/2, wallH/2, 0);
  scene.add(wE);
  // Wall West
  const wW = new THREE.Mesh(new THREE.BoxGeometry(thickness, wallH, state.roomH), wallMat);
  wW.position.set(-state.roomW/2 - thickness/2, wallH/2, 0);
  scene.add(wW);


  // 6. Furniture Construction
  const items = state.furniture || [];

  // Helper to estimate 3D height from 2D ID
  function estimateHeight(id) {
    if(id.includes('combo')) return 120;
    if(id.includes('wardrobe') || id.includes('fridge') || id.includes('bookshelf')) return 200;
    if(id.includes('sofa')) return 85;
    if(id.includes('bed')) return 50;
    if(id.includes('coffeetbl') || id.includes('console')) return 40;
    if(id.includes('din') || id.includes('desk') || id.includes('vanity') || id.includes('counter') || id.includes('island')) return 80;
    if(id.includes('tvstand')) return 45;
    if(id.includes('rug')) return 2;
    if(id.includes('plant_l')) return 150;
    if(id.includes('plant_s')) return 40;
    if(id.includes('window') || id.includes('door')) return 200;
    return 60; // Default fallback
  }

  items.forEach(item => {
    const isRotated = item.rotation === 90 || item.rotation === 270;
    const w = item.w;
    const d = item.h; // in 2D Y is depth
    const h = estimateHeight(item.id);
    
    // Convert canvas coordinates (top-left 0,0) to Three.js coordinates (center 0,0)
    // Canvas X goes right, Y goes down.
    // Three X goes right, Z goes towards viewer (meaning down on screen).
    const posX = item.x - state.roomW / 2;
    const posZ = item.y - state.roomH / 2;

    const geo = new THREE.BoxGeometry(w, h, d);
    
    // Rounded edges illusion via bevel (Optional but complex, we stick to smooth standard material)
    const matConfig = { 
      color: item.color, 
      roughness: 0.6, 
      metalness: 0.1,
      transparent: item.opacity < 1,
      opacity: item.opacity || 1
    };

    // If it's a window or door, make it distinct
    if(item.id.includes('window')) {
        matConfig.color = 0x88CCFF;
        matConfig.opacity = 0.4;
        matConfig.transparent = true;
    }

    const mat = new THREE.MeshStandardMaterial(matConfig);
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.set(posX, h/2, posZ);
    mesh.rotation.y = -(item.rotation || 0) * Math.PI / 180; // Negative because Three.js Y rotation is counter-clockwise
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add edges for "Enterprise blueprint" stylish look on some items
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const line = new THREE.LineSegments(edges, lineMat);
    mesh.add(line);

    scene.add(mesh);
  });

  // 7. Render Loop
  const animate = function () {
    if (!is3DMode) return;
    requestAnimationFrame(animate);
    controls.update(); // only required if controls.enableDamping or controls.autoRotate are set
    renderer.render(scene, camera);
  };

  // 8. Resize Handler
  const onResize = () => {
    if(!is3DMode) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  // Ensure cleanup on close
  const origClose = closeBtn.onclick;
  closeBtn.onclick = () => {
    window.removeEventListener('resize', onResize);
    origClose();
  };

  animate();
}
