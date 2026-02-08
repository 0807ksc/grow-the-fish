(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const TOUCH_CAPABLE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const COARSE_POINTER = window.matchMedia?.('(pointer: coarse)')?.matches || false;

  const PLAYER_SPECIES = [
    { key: 'clownfish', label: '흰동가리', scientific: 'Amphiprion ocellaris', color: '#ff8f3d', speed: 370, baseR: 24 },
    { key: 'mackerel', label: '고등어', scientific: 'Scomber japonicus', color: '#86c5de', speed: 400, baseR: 26 },
    { key: 'tuna', label: '참다랑어', scientific: 'Thunnus orientalis', color: '#6887a5', speed: 350, baseR: 30 },
  ];

  const BIOMES = [
    {
      key: 'river',
      label: '강맵',
      waterTop: '#5ab7d6',
      waterBottom: '#14344a',
      skyTop: '#cfefff',
      skyBottom: '#96d2ff',
      surface: '#d4f2ff',
      worldW: 2600,
      worldH: 1500,
    },
    {
      key: 'wetland',
      label: '늪지대맵',
      waterTop: '#678a5b',
      waterBottom: '#203427',
      skyTop: '#c9d6a8',
      skyBottom: '#8ca26a',
      surface: '#dbe7b3',
      worldW: 2400,
      worldH: 1500,
    },
    {
      key: 'reef',
      label: '산호초맵',
      waterTop: '#4fc4de',
      waterBottom: '#12385f',
      skyTop: '#d9f8ff',
      skyBottom: '#8ddaf0',
      surface: '#ddfbff',
      worldW: 2500,
      worldH: 1600,
    },
    {
      key: 'ocean',
      label: '대양맵',
      waterTop: '#2f86c2',
      waterBottom: '#081c40',
      skyTop: '#c8ecff',
      skyBottom: '#83c7f2',
      surface: '#cbefff',
      worldW: 3200,
      worldH: 1900,
    },
    {
      key: 'arctic',
      label: '북극맵',
      waterTop: '#87d5f8',
      waterBottom: '#0c2d4d',
      skyTop: '#f2fbff',
      skyBottom: '#c7ecff',
      surface: '#f4fdff',
      worldW: 2800,
      worldH: 1700,
    },
    {
      key: 'beach',
      label: '해변가맵',
      waterTop: '#57bdd7',
      waterBottom: '#1d4e79',
      skyTop: '#fff1bf',
      skyBottom: '#8fd8f2',
      surface: '#fff8d7',
      worldW: 2700,
      worldH: 1650,
    },
  ];

  const CREATURES = [
    { key: 'trout', label: '송어', kind: 'fish', color: '#8cab9a', minSize: 0.52, maxSize: 0.84, speed: [95, 170], biomes: ['river', 'wetland'] },
    { key: 'bass', label: '배스', kind: 'fish', color: '#6e8f67', minSize: 0.72, maxSize: 1.08, speed: [80, 150], biomes: ['river', 'wetland'] },
    { key: 'catfish', label: '메기', kind: 'fish', color: '#677b7d', minSize: 0.88, maxSize: 1.26, speed: [65, 120], biomes: ['river', 'wetland'] },
    { key: 'sturgeon', label: '철갑상어', kind: 'fish', color: '#6f8690', minSize: 1.02, maxSize: 1.42, speed: [70, 130], biomes: ['river'] },
    { key: 'pike', label: '강꼬치고기', kind: 'fish', color: '#7d9d74', minSize: 0.95, maxSize: 1.25, speed: [120, 210], biomes: ['river', 'wetland'] },
    { key: 'carp', label: '잉어', kind: 'fish', color: '#c79d73', minSize: 0.78, maxSize: 1.14, speed: [70, 140], biomes: ['river', 'wetland'] },
    { key: 'freshwaterCrayfish', label: '민물가재', kind: 'crustacean', color: '#8f5a49', minSize: 0.62, maxSize: 0.98, speed: [45, 85], biomes: ['river', 'wetland'] },
    { key: 'mackerel', label: '고등어', kind: 'fish', color: '#6fa9cc', minSize: 0.86, maxSize: 1.16, speed: [100, 190], biomes: ['reef', 'ocean'] },
    { key: 'anchovy', label: '멸치', kind: 'fish', color: '#94aec6', minSize: 0.35, maxSize: 0.62, speed: [90, 180], biomes: ['reef', 'ocean'] },
    { key: 'sardine', label: '정어리', kind: 'fish', color: '#78a0c0', minSize: 0.58, maxSize: 0.9, speed: [80, 170], biomes: ['reef', 'ocean'] },
    { key: 'reefShark', label: '리프상어', kind: 'fish', color: '#7f95ad', minSize: 1.2, maxSize: 1.5, speed: [120, 230], biomes: ['reef', 'ocean'] },
    { key: 'octopus', label: '문어', kind: 'cephalopod', color: '#b96e87', minSize: 0.85, maxSize: 1.25, speed: [70, 135], biomes: ['reef', 'ocean'] },
    { key: 'squid', label: '오징어', kind: 'cephalopod', color: '#e1d2d8', minSize: 0.75, maxSize: 1.22, speed: [90, 220], biomes: ['reef', 'ocean', 'arctic'] },
    { key: 'lobster', label: '가재', kind: 'crustacean', color: '#ad5a49', minSize: 0.7, maxSize: 1.05, speed: [50, 95], biomes: ['reef', 'ocean'] },
    { key: 'turtle', label: '바다거북', kind: 'reptile', color: '#5f9f6a', minSize: 1.1, maxSize: 1.45, speed: [60, 120], biomes: ['reef', 'ocean'] },
    { key: 'whale', label: '고래', kind: 'mammal', color: '#5e7893', minSize: 1.5, maxSize: 2.2, speed: [90, 160], biomes: ['ocean', 'arctic'] },
    { key: 'plesiosaur', label: '수장룡', kind: 'ancient', color: '#5d7e6b', minSize: 1.28, maxSize: 1.72, speed: [105, 175], biomes: ['ocean'] },
    { key: 'ichthyosaur', label: '어룡', kind: 'ancient', color: '#688a9f', minSize: 1.35, maxSize: 1.8, speed: [120, 195], biomes: ['ocean', 'arctic'] },
    { key: 'arcticCod', label: '북극대구', kind: 'fish', color: '#b9d8ea', minSize: 0.62, maxSize: 0.96, speed: [90, 165], biomes: ['arctic'], tags: ['arctic'] },
    { key: 'penguin', label: '펭귄', kind: 'bird', color: '#1f3440', minSize: 0.85, maxSize: 1.18, speed: [85, 145], biomes: ['arctic', 'beach'] },
  ];

  const state = {
    mode: 'start',
    prePauseMode: 'playing',
    score: 0,
    kills: 0,
    time: 0,
    biomeIndex: 3,
    selectedPlayerIndex: 1,
    world: { w: 3200, h: 1900, zNear: 0.18, zFar: 2.3 },
    player: {
      x: 0,
      y: 0,
      z: 1.1,
      vx: 0,
      vy: 0,
      vz: 0,
      baseR: PLAYER_SPECIES[1].baseR,
      size: 1,
      speed: PLAYER_SPECIES[1].speed,
      color: PLAYER_SPECIES[1].color,
      species: PLAYER_SPECIES[1].key,
      speciesLabel: PLAYER_SPECIES[1].label,
      scientific: PLAYER_SPECIES[1].scientific,
      hp: 100,
      facing: -1,
      boostStamina: 100,
      speedBoost: 1,
    },
    entities: [],
    nextId: 1,
    keys: new Set(),
    spawnCooldown: 0,
    attackCooldown: 0,
    suctionCooldown: 0,
    suctionTimer: 0,
    killFlash: 0,
    biomeImpactTimer: 300,
    ui: {
      speciesButtons: [],
      touchButtons: {},
    },
    touch: {
      moveX: 0,
      moveY: 0,
      buttons: new Set(),
      usingTouch: TOUCH_CAPABLE,
    },
  };

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(v, mn, mx) {
    return Math.max(mn, Math.min(mx, v));
  }

  function currentBiome() {
    return BIOMES[state.biomeIndex];
  }

  function biomeImpactStrength() {
    return clamp(state.biomeImpactTimer / 300, 0, 1);
  }

  function biomeModifiers() {
    const key = currentBiome().key;
    const s = biomeImpactStrength();
    const base = {
      currentX: 0,
      currentY: 0,
      speedMul: 1,
      incomingDamageMul: 1,
      spawnMul: 1,
      tint: null,
    };
    if (key === 'river') {
      base.currentX = (38 + 54 * s) * (Math.sin(state.time * 0.6) * 0.6 + 0.9);
      base.speedMul = 1 + s * 0.08;
      base.tint = 'rgba(145,225,255,0.10)';
    } else if (key === 'wetland') {
      base.currentX = (10 + 18 * s) * Math.sin(state.time * 0.8);
      base.currentY = (6 + 10 * s) * Math.cos(state.time * 0.7);
      base.speedMul = 1 - s * 0.15;
      base.incomingDamageMul = 1 + s * 0.12;
      base.tint = 'rgba(156,195,120,0.14)';
    } else if (key === 'reef') {
      base.speedMul = 1 + s * 0.05;
      base.spawnMul = 1 + s * 0.2;
      base.tint = 'rgba(255,160,150,0.08)';
    } else if (key === 'ocean') {
      base.currentY = (14 + 22 * s) * Math.sin(state.time * 0.52);
      base.spawnMul = 1 + s * 0.18;
      base.tint = 'rgba(120,170,255,0.09)';
    } else if (key === 'arctic') {
      base.currentX = (16 + 22 * s) * Math.sin(state.time * 0.45);
      base.speedMul = 1 - s * 0.11;
      base.incomingDamageMul = 1 + s * 0.2;
      base.tint = 'rgba(230,248,255,0.17)';
    }
    return base;
  }

  function updateWorldByBiome() {
    const b = currentBiome();
    state.world.w = b.worldW;
    state.world.h = b.worldH;
  }

  function playerRadius() {
    return state.player.baseR * state.player.size;
  }

  function entityRadius(e) {
    return e.baseR * e.size;
  }

  function project(worldX, worldY, z) {
    const depth = clamp(z, state.world.zNear, state.world.zFar);
    const scale = 1 / depth;
    const lookAhead = 120;
    const camX = state.player.x + state.player.facing * lookAhead;
    const camY = state.player.y + 56;
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.58;
    return {
      screenX: cx + (worldX - camX) * scale,
      screenY: cy + (worldY - camY) * scale,
      scale,
    };
  }

  function selectableCreatures() {
    const biome = currentBiome().key;
    return CREATURES.filter((c) => c.biomes.includes(biome) && !(biome === 'reef' && c.tags?.includes('arctic')));
  }

  function isGroundCrawler(entity) {
    const key = entity.template?.key || '';
    return key === 'lobster' || key === 'freshwaterCrayfish';
  }

  function seabedWorldY() {
    return state.world.h * 0.44;
  }

  function setPlayerSpecies(index) {
    const safe = ((index % PLAYER_SPECIES.length) + PLAYER_SPECIES.length) % PLAYER_SPECIES.length;
    const picked = PLAYER_SPECIES[safe];
    state.selectedPlayerIndex = safe;
    state.player.baseR = picked.baseR;
    state.player.speed = picked.speed;
    state.player.color = picked.color;
    state.player.species = picked.key;
    state.player.speciesLabel = picked.label;
    state.player.scientific = picked.scientific;
  }

  function cycleBiome(delta) {
    state.biomeIndex = (state.biomeIndex + delta + BIOMES.length) % BIOMES.length;
    updateWorldByBiome();
    state.biomeImpactTimer = 300;
    state.player.x = clamp(state.player.x, -state.world.w * 0.5, state.world.w * 0.5);
    state.player.y = clamp(state.player.y, -state.world.h * 0.5, state.world.h * 0.5);

    if (state.mode === 'playing') {
      const allowed = new Set(selectableCreatures().map((c) => c.key));
      state.entities = state.entities.filter((e) => allowed.has(e.template.key));
      while (state.entities.length < 72) spawnEntity(state.time < 8);
    }
  }

  function spawnEntity(forceSmall = false) {
    const id = state.nextId++;
    const pool = selectableCreatures();
    if (!pool.length) return;
    const c = pool[Math.floor(random(0, pool.length))];
    const zone = 560;
    let x = random(-state.world.w * 0.5, state.world.w * 0.5);
    let y = random(-state.world.h * 0.5, state.world.h * 0.5);
    if (Math.abs(x - state.player.x) < zone) x += Math.sign(x || 1) * zone;
    if (Math.abs(y - state.player.y) < zone) y += Math.sign(y || 1) * zone;

    const sizeBase = forceSmall ? random(0.45, 0.95) : random(c.minSize, c.maxSize);
    const size = clamp(sizeBase + random(-0.06, 0.06), 0.3, 2.6);
    const speed = random(c.speed[0], c.speed[1]);
    const angle = random(0, Math.PI * 2);
    const spawned = {
      id,
      x,
      y,
      z: random(state.world.zNear + 0.05, state.world.zFar - 0.05),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: random(-0.16, 0.16),
      baseR: 24,
      hp: Math.round(35 + size * 45),
      maxHp: Math.round(35 + size * 45),
      size,
      template: c,
      speciesLabel: c.label,
      color: c.color,
      facing: Math.sign(Math.cos(angle)) || 1,
      deadTimer: 0,
    };

    if (spawned.template.kind === 'bird') {
      spawned.z = random(0.24, 0.44);
      spawned.y = random(-state.world.h * 0.08, state.world.h * 0.18);
      spawned.vz = random(-0.04, 0.04);
    }

    if (isGroundCrawler(spawned)) {
      spawned.y = random(state.world.h * 0.32, state.world.h * 0.47);
      spawned.z = random(state.world.zFar - 0.35, state.world.zFar - 0.06);
      spawned.vy *= 0.2;
      spawned.vz *= 0.12;
    }

    state.entities.push(spawned);
  }

  function resetGame() {
    updateWorldByBiome();
    setPlayerSpecies(state.selectedPlayerIndex);
    state.mode = 'playing';
    state.score = 0;
    state.kills = 0;
    state.time = 0;
    state.player.x = 0;
    state.player.y = 0;
    state.player.z = 1.1;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.vz = 0;
    state.player.size = 1;
    state.player.hp = 100;
    state.player.facing = -1;
    state.player.boostStamina = 100;
    state.player.speedBoost = 1;
    state.entities = [];
    state.nextId = 1;
    state.spawnCooldown = 0;
    state.attackCooldown = 0;
    state.suctionCooldown = 0;
    state.suctionTimer = 0;
    state.killFlash = 0;
    state.biomeImpactTimer = 300;
    for (let i = 0; i < 72; i++) spawnEntity(i < 26);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) canvas.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function togglePause() {
    if (state.mode === 'playing') {
      state.prePauseMode = 'playing';
      state.mode = 'paused';
    } else if (state.mode === 'paused') {
      state.mode = state.prePauseMode || 'playing';
    }
  }

  function shouldShowTouchUI() {
    return state.touch.usingTouch || TOUCH_CAPABLE || COARSE_POINTER || window.innerWidth <= 900;
  }

  function fitCanvasSize() {
    const aspect = 16 / 9;
    const margin = 12;
    const maxW = Math.max(320, window.innerWidth - margin * 2);
    const maxH = Math.max(220, window.innerHeight - margin * 2);
    let w = maxW;
    let h = Math.round(w / aspect);
    if (h > maxH) {
      h = maxH;
      w = Math.round(h * aspect);
    }
    return { w: Math.max(320, w), h: Math.max(220, h) };
  }

  function onResize() {
    if (document.fullscreenElement === canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    } else if (shouldShowTouchUI()) {
      canvas.width = Math.max(320, window.innerWidth);
      canvas.height = Math.max(220, window.innerHeight);
    } else {
      const size = fitCanvasSize();
      canvas.width = size.w;
      canvas.height = size.h;
    }
  }

  function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    const code = e.code;
    if (key === 'f') {
      toggleFullscreen();
      return;
    }
    if (key === 'p') {
      togglePause();
      return;
    }

    if (
      code === 'Comma' || code === 'Period' ||
      code === 'KeyN' || code === 'KeyM' ||
      code === 'Digit4' || code === 'Digit5' ||
      key === ',' || key === '<' || key === '.' || key === '>' ||
      key === 'n' || key === 'm'
    ) {
      const dir = (code === 'Comma' || code === 'KeyN' || code === 'Digit4' || key === ',' || key === '<' || key === 'n') ? -1 : 1;
      cycleBiome(dir);
      if (state.mode !== 'playing') render();
      return;
    }

    if (state.mode !== 'playing') {
      if (key === '1' || key === '2' || key === '3') {
        setPlayerSpecies(Number(key) - 1);
        return;
      }
      if (key === '[') {
        setPlayerSpecies(state.selectedPlayerIndex - 1);
        return;
      }
      if (key === ']') {
        setPlayerSpecies(state.selectedPlayerIndex + 1);
        return;
      }
    }

    if (state.mode === 'start' && (key === 'enter' || key === ' ')) {
      resetGame();
      return;
    }
    if ((state.mode === 'gameover' || state.mode === 'win') && key === 'r') {
      resetGame();
      return;
    }

    state.keys.add(key);
  }

  function handleKeyUp(e) {
    state.keys.delete(e.key.toLowerCase());
  }

  function getCanvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      sx: ((clientX - rect.left) * canvas.width) / rect.width,
      sy: ((clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function pressAt(sx, sy) {
    if (state.mode === 'start') {
      const ui = state.ui.touchButtons;
      if (ui.prevSpecies && sx >= ui.prevSpecies.x && sx <= ui.prevSpecies.x + ui.prevSpecies.w && sy >= ui.prevSpecies.y && sy <= ui.prevSpecies.y + ui.prevSpecies.h) {
        setPlayerSpecies(state.selectedPlayerIndex - 1);
        render();
        return true;
      }
      if (ui.nextSpecies && sx >= ui.nextSpecies.x && sx <= ui.nextSpecies.x + ui.nextSpecies.w && sy >= ui.nextSpecies.y && sy <= ui.nextSpecies.y + ui.nextSpecies.h) {
        setPlayerSpecies(state.selectedPlayerIndex + 1);
        render();
        return true;
      }
      if (ui.prevBiome && sx >= ui.prevBiome.x && sx <= ui.prevBiome.x + ui.prevBiome.w && sy >= ui.prevBiome.y && sy <= ui.prevBiome.y + ui.prevBiome.h) {
        cycleBiome(-1);
        render();
        return true;
      }
      if (ui.nextBiome && sx >= ui.nextBiome.x && sx <= ui.nextBiome.x + ui.nextBiome.w && sy >= ui.nextBiome.y && sy <= ui.nextBiome.y + ui.nextBiome.h) {
        cycleBiome(1);
        render();
        return true;
      }
      if (ui.start && sx >= ui.start.x && sx <= ui.start.x + ui.start.w && sy >= ui.start.y && sy <= ui.start.y + ui.start.h) {
        resetGame();
        return true;
      }
    }
    if ((state.mode === 'gameover' || state.mode === 'win') && state.ui.touchButtons.restart) {
      const b = state.ui.touchButtons.restart;
      if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) {
        resetGame();
        return true;
      }
    }
    if (state.mode === 'paused' && state.ui.touchButtons.resume) {
      const b = state.ui.touchButtons.resume;
      if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) {
        togglePause();
        return true;
      }
    }
    if (state.mode === 'playing' && state.ui.touchButtons.pause) {
      const b = state.ui.touchButtons.pause;
      if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) {
        togglePause();
        return true;
      }
    }
    return false;
  }

  function handleMouseDown(e) {
    const { sx, sy } = getCanvasPoint(e.clientX, e.clientY);
    if (pressAt(sx, sy)) return;
    if (state.mode !== 'start') return;
    for (const btn of state.ui.speciesButtons) {
      if (sx >= btn.x && sx <= btn.x + btn.w && sy >= btn.y && sy <= btn.y + btn.h) {
        setPlayerSpecies(btn.index);
        render();
        return;
      }
    }
  }

  function updateTouchState(touches) {
    state.touch.moveX = 0;
    state.touch.moveY = 0;
    state.touch.buttons.clear();
    if (state.mode !== 'playing') return;

    let moveCount = 0;
    for (const t of touches) {
      const { sx, sy } = getCanvasPoint(t.clientX, t.clientY);
      if (sx <= canvas.width * 0.56 && sy >= canvas.height * 0.36) {
        const nx = clamp((sx / (canvas.width * 0.56)) * 2 - 1, -1, 1);
        const ny = clamp(((sy - canvas.height * 0.36) / (canvas.height * 0.64)) * 2 - 1, -1, 1);
        state.touch.moveX += nx;
        state.touch.moveY += ny;
        moveCount += 1;
        continue;
      }
      const ui = state.ui.touchButtons;
      if (ui.attack && sx >= ui.attack.x && sx <= ui.attack.x + ui.attack.w && sy >= ui.attack.y && sy <= ui.attack.y + ui.attack.h) state.touch.buttons.add('k');
      if (ui.suction && sx >= ui.suction.x && sx <= ui.suction.x + ui.suction.w && sy >= ui.suction.y && sy <= ui.suction.y + ui.suction.h) state.touch.buttons.add('x');
      if (ui.boost && sx >= ui.boost.x && sx <= ui.boost.x + ui.boost.w && sy >= ui.boost.y && sy <= ui.boost.y + ui.boost.h) state.touch.buttons.add('shift');
      if (ui.depthUp && sx >= ui.depthUp.x && sx <= ui.depthUp.x + ui.depthUp.w && sy >= ui.depthUp.y && sy <= ui.depthUp.y + ui.depthUp.h) state.touch.buttons.add('q');
      if (ui.depthDown && sx >= ui.depthDown.x && sx <= ui.depthDown.x + ui.depthDown.w && sy >= ui.depthDown.y && sy <= ui.depthDown.y + ui.depthDown.h) state.touch.buttons.add('e');
    }

    if (moveCount > 0) {
      state.touch.moveX = clamp(state.touch.moveX / moveCount, -1, 1);
      state.touch.moveY = clamp(state.touch.moveY / moveCount, -1, 1);
    }
  }

  function handleTouchStart(e) {
    e.preventDefault();
    state.touch.usingTouch = true;
    for (const t of e.changedTouches) {
      const { sx, sy } = getCanvasPoint(t.clientX, t.clientY);
      if (pressAt(sx, sy)) continue;
      if (state.mode === 'start') {
        for (const btn of state.ui.speciesButtons) {
          if (sx >= btn.x && sx <= btn.x + btn.w && sy >= btn.y && sy <= btn.y + btn.h) {
            setPlayerSpecies(btn.index);
            render();
            break;
          }
        }
      }
    }
    updateTouchState(e.touches);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    updateTouchState(e.touches);
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    updateTouchState(e.touches);
  }

  function keyActive(key) {
    return state.keys.has(key) || state.touch.buttons.has(key);
  }

  function attackBurst() {
    if (state.attackCooldown > 0) return;
    state.attackCooldown = 0.52;
    const pR = playerRadius();
    let killed = 0;
    for (const e of state.entities) {
      if (e.deadTimer > 0) continue;
      const dx = e.x - state.player.x;
      const dy = e.y - state.player.y;
      const dz = (e.z - state.player.z) * 320;
      const dist = Math.hypot(dx, dy, dz);
      const inFront = Math.sign(dx || 1) === state.player.facing;
      if (dist < pR * 3.2 && inFront) {
        const damage = state.player.size >= e.size * 0.8 ? 90 : 40;
        e.hp -= damage;
        if (e.hp <= 0) {
          e.deadTimer = 0.45;
          state.score += Math.ceil(e.size * 18);
          state.kills += 1;
          state.player.size = clamp(state.player.size + e.size * 0.02, 1, 4.5);
          state.killFlash = 0.2;
          killed += 1;
        }
      }
    }
    return killed;
  }

  function updatePlayer(dt) {
    const bm = biomeModifiers();
    const keyDirX = (keyActive('d') || keyActive('arrowright') ? 1 : 0) - (keyActive('a') || keyActive('arrowleft') ? 1 : 0);
    const keyDirY = (keyActive('s') || keyActive('arrowdown') ? 1 : 0) - (keyActive('w') || keyActive('arrowup') ? 1 : 0);
    const dirX = clamp(keyDirX + state.touch.moveX, -1, 1);
    const dirY = clamp(keyDirY + state.touch.moveY, -1, 1);
    const dirZ = (keyActive('e') ? 1 : 0) - (keyActive('q') ? 1 : 0);
    const wantsBoost = keyActive('shift');

    if (wantsBoost && state.player.boostStamina > 0) {
      state.player.speedBoost = 1.9;
      state.player.boostStamina = clamp(state.player.boostStamina - dt * 30, 0, 100);
    } else {
      state.player.speedBoost = 1;
      state.player.boostStamina = clamp(state.player.boostStamina + dt * 18, 0, 100);
    }

    const len = Math.hypot(dirX, dirY) || 1;
    const speed = state.player.speed * state.player.speedBoost * bm.speedMul;
    state.player.vx = (dirX / len) * speed;
    state.player.vy = (dirY / len) * speed;
    state.player.vz = dirZ * 0.76;

    state.player.x += state.player.vx * dt;
    state.player.y += state.player.vy * dt;
    state.player.z += state.player.vz * dt;
    state.player.x += bm.currentX * dt;
    state.player.y += bm.currentY * dt;

    if (Math.abs(state.player.vx) > 2) state.player.facing = Math.sign(state.player.vx);

    state.player.x = clamp(state.player.x, -state.world.w * 0.5, state.world.w * 0.5);
    state.player.y = clamp(state.player.y, -state.world.h * 0.5, state.world.h * 0.5);
    state.player.z = clamp(state.player.z, state.world.zNear, state.world.zFar);

    if (keyActive('k')) attackBurst();
    if (keyActive('x') && state.suctionCooldown <= 0) {
      state.suctionTimer = 2.1;
      state.suctionCooldown = 6.0;
    }
  }

  function updateEntities(dt) {
    const bm = biomeModifiers();
    const pR = playerRadius();

    for (const e of state.entities) {
      if (e.deadTimer > 0) {
        e.deadTimer -= dt;
        continue;
      }

      const dx = state.player.x - e.x;
      const dy = state.player.y - e.y;
      const dz = state.player.z - e.z;
      const dist = Math.hypot(dx, dy, dz * 330) + 0.001;
      const isThreat = e.size > state.player.size * 1.08;
      const isPrey = e.size < state.player.size * 0.98;
      const crawler = isGroundCrawler(e);
      const seabedY = seabedWorldY();

      if (state.suctionTimer > 0 && isPrey && dist < 920) {
        const pull = 220 * dt;
        e.vx += (dx / dist) * pull;
        e.vy += (dy / dist) * pull;
        e.vz += (dz / dist) * pull * 0.0022;
      } else if (isThreat && dist < 430) {
        const flee = -120 * dt;
        e.vx += (dx / dist) * flee;
        e.vy += (dy / dist) * flee;
      } else if (isPrey && dist < 340) {
        const flee = 110 * dt;
        e.vx -= (dx / dist) * flee;
        e.vy -= (dy / dist) * flee;
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.z += e.vz * dt;
      e.x += bm.currentX * dt * 0.68;
      e.y += bm.currentY * dt * 0.68;
      e.facing = Math.sign(e.vx || 1);

      if (crawler) {
        const drift = Math.sin(state.time * 1.8 + e.id) * 8;
        e.vx += drift * dt;
        e.vy += (seabedY - e.y) * dt * 0.6;
        e.y = clamp(e.y, state.world.h * 0.2, state.world.h * 0.49);
        e.z = clamp(e.z + (state.world.zFar - 0.12 - e.z) * dt * 1.8, state.world.zFar - 0.5, state.world.zFar - 0.05);
        e.vy *= 0.86;
        e.vz *= 0.35;
      }

      e.vx *= 0.997;
      e.vy *= 0.997;
      e.vz *= 0.995;

      if (Math.abs(e.x) > state.world.w * 0.5) e.vx *= -1;
      if (Math.abs(e.y) > state.world.h * 0.5) e.vy *= -1;
      if (e.z < state.world.zNear || e.z > state.world.zFar) e.vz *= -1;
      e.z = clamp(e.z, state.world.zNear, state.world.zFar);

      const cdx = e.x - state.player.x;
      const cdy = e.y - state.player.y;
      const cdz = (e.z - state.player.z) * 330;
      const collisionDist = Math.hypot(cdx, cdy, cdz);
      const canEat = state.player.size >= e.size * 1.02;
      const touch = collisionDist < pR + entityRadius(e) * 0.95;
      if (touch) {
        if (canEat) {
          e.deadTimer = 0.4;
          state.score += Math.ceil(e.size * 11);
          state.player.size = clamp(state.player.size + e.size * 0.022, 1, 4.5);
        } else {
          state.player.hp = clamp(state.player.hp - dt * 46 * bm.incomingDamageMul, 0, 100);
          if (state.player.hp <= 0) {
            state.mode = 'gameover';
          }
        }
      }
    }

    state.entities = state.entities.filter((e) => e.deadTimer > 0 ? e.deadTimer > -0.01 : true);
    state.entities = state.entities.filter((e) => e.deadTimer === 0 || e.deadTimer > 0.01);
  }

  function updateSpawning(dt) {
    const bm = biomeModifiers();
    state.spawnCooldown -= dt;
    if (state.spawnCooldown > 0) return;
    const target = clamp(Math.round((90 + Math.floor(state.score / 25)) * bm.spawnMul), 90, 190);
    if (state.entities.length < target) {
      for (let i = 0; i < 3; i++) spawnEntity(state.time < 8);
    }
    state.spawnCooldown = 0.22;
  }

  function updatePlaying(dt) {
    state.time += dt;
    state.biomeImpactTimer = Math.max(0, state.biomeImpactTimer - dt);
    state.attackCooldown = Math.max(0, state.attackCooldown - dt);
    state.suctionCooldown = Math.max(0, state.suctionCooldown - dt);
    state.suctionTimer = Math.max(0, state.suctionTimer - dt);
    state.killFlash = Math.max(0, state.killFlash - dt);

    updatePlayer(dt);
    updateEntities(dt);
    updateSpawning(dt);

    if (state.player.size >= 4.0 && state.kills >= 8 && state.mode === 'playing') {
      state.mode = 'win';
    }
  }

  function shade(color, amount) {
    const c = color.replace('#', '');
    const n = parseInt(c, 16);
    const r = clamp(((n >> 16) & 255) + amount, 0, 255);
    const g = clamp(((n >> 8) & 255) + amount, 0, 255);
    const b = clamp((n & 255) + amount, 0, 255);
    return `rgb(${r},${g},${b})`;
  }

  function drawSurface() {
    const b = currentBiome();
    const bm = biomeModifiers();
    const waterline = canvas.height * 0.2;

    const sky = ctx.createLinearGradient(0, 0, 0, waterline);
    sky.addColorStop(0, b.skyTop);
    sky.addColorStop(1, b.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, waterline);

    const water = ctx.createLinearGradient(0, waterline, 0, canvas.height);
    water.addColorStop(0, b.waterTop);
    water.addColorStop(1, b.waterBottom);
    ctx.fillStyle = water;
    ctx.fillRect(0, waterline, canvas.width, canvas.height - waterline);

    ctx.strokeStyle = b.surface;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 14) {
      const wave = Math.sin((x + state.time * 90) * 0.03) * 3;
      const y = waterline + wave;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (b.key === 'arctic') {
      for (let i = 0; i < 5; i++) {
        const x = ((i * 230 + state.time * 11) % (canvas.width + 200)) - 100;
        ctx.fillStyle = 'rgba(236,248,255,0.8)';
        ctx.beginPath();
        ctx.moveTo(x, waterline - 8);
        ctx.lineTo(x + 38, waterline - 30);
        ctx.lineTo(x + 82, waterline - 6);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (b.key === 'reef') {
      for (let i = 0; i < 18; i++) {
        const x = (i * 63) % canvas.width;
        const h = 24 + (i % 6) * 9;
        ctx.fillStyle = i % 2 ? 'rgba(255,132,132,0.25)' : 'rgba(255,199,105,0.22)';
        ctx.fillRect(x, canvas.height - h, 9, h);
      }
    }

    if (b.key === 'beach') {
      for (let i = 0; i < 12; i++) {
        const x = (i * 120 + state.time * 5) % (canvas.width + 200) - 100;
        ctx.fillStyle = 'rgba(255, 230, 160, 0.35)';
        ctx.beginPath();
        ctx.ellipse(x, waterline - 10, 80, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (bm.tint) {
      ctx.fillStyle = bm.tint;
      ctx.fillRect(0, waterline, canvas.width, canvas.height - waterline);
    }

    // seabed + caustics for a more realistic underwater feel
    const bedGrad = ctx.createLinearGradient(0, canvas.height * 0.76, 0, canvas.height);
    if (b.key === 'beach') {
      bedGrad.addColorStop(0, 'rgba(229, 196, 132, 0.44)');
      bedGrad.addColorStop(1, 'rgba(190, 150, 92, 0.62)');
    } else if (b.key === 'arctic') {
      bedGrad.addColorStop(0, 'rgba(182, 203, 224, 0.34)');
      bedGrad.addColorStop(1, 'rgba(122, 151, 184, 0.5)');
    } else {
      bedGrad.addColorStop(0, 'rgba(158, 122, 93, 0.26)');
      bedGrad.addColorStop(1, 'rgba(96, 72, 55, 0.45)');
    }
    ctx.fillStyle = bedGrad;
    ctx.fillRect(0, canvas.height * 0.76, canvas.width, canvas.height * 0.24);

    ctx.strokeStyle = 'rgba(210, 245, 255, 0.11)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      const y = canvas.height * 0.28 + i * 34;
      for (let x = 0; x <= canvas.width; x += 28) {
        const wave = Math.sin((x + state.time * 90 + i * 33) * 0.02) * 6;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  }

  function drawBubbles() {
    for (let i = 0; i < 42; i++) {
      const x = ((i * 97 + state.time * (6 + (i % 3))) % (canvas.width + 130)) - 65;
      const y = ((i * 57 + state.time * (11 + (i % 4))) % (canvas.height + 100)) - 50;
      const r = 1.6 + ((i * 7) % 6);
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = '#d7f6ff';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawCreature(screenX, screenY, r, color, facing, kind, isThreat, viewBack = false) {
    const bodyW = r * 2.2;
    const bodyH = r * 1.34;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.scale(facing, 1);

    const bodyGrad = ctx.createLinearGradient(-bodyW * 0.5, -bodyH * 0.5, bodyW * 0.5, bodyH * 0.5);
    bodyGrad.addColorStop(0, shade(color, 28));
    bodyGrad.addColorStop(0.6, color);
    bodyGrad.addColorStop(1, shade(color, -22));
    ctx.fillStyle = bodyGrad;

    if (kind === 'cephalopod') {
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW * 0.45, bodyH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = -3; i <= 3; i++) {
        const sx = i * r * 0.18;
        ctx.beginPath();
        ctx.moveTo(sx, bodyH * 0.2);
        ctx.quadraticCurveTo(sx + r * 0.15, bodyH * 0.8, sx - r * 0.12, bodyH * 1.2);
        ctx.strokeStyle = shade(color, -30);
        ctx.lineWidth = Math.max(1, r * 0.09);
        ctx.stroke();
      }
    } else if (kind === 'crustacean') {
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW * 0.42, bodyH * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.2, bodyH * 0.18);
        ctx.lineTo(i * r * 0.36, bodyH * 0.72);
        ctx.strokeStyle = shade(color, -40);
        ctx.lineWidth = Math.max(1, r * 0.08);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(bodyW * 0.32, -bodyH * 0.12);
      ctx.lineTo(bodyW * 0.62, -bodyH * 0.33);
      ctx.lineTo(bodyW * 0.56, -bodyH * 0.02);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 'ancient') {
      ctx.beginPath();
      ctx.ellipse(-r * 0.08, 0, bodyW * 0.48, bodyH * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bodyW * 0.28, -bodyH * 0.2);
      ctx.quadraticCurveTo(bodyW * 0.72, -bodyH * 0.7, bodyW * 0.58, -bodyH * 0.02);
      ctx.lineWidth = Math.max(2, r * 0.13);
      ctx.strokeStyle = shade(color, -35);
      ctx.stroke();
    } else if (kind === 'mammal') {
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW * 0.55, bodyH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.2, -bodyH * 0.4);
      ctx.lineTo(bodyW * 0.1, -bodyH * 0.65);
      ctx.lineTo(bodyW * 0.35, -bodyH * 0.36);
      ctx.closePath();
      ctx.fill();
    } else if (kind === 'reptile') {
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW * 0.44, bodyH * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * bodyW * 0.15, bodyH * 0.2);
        ctx.lineTo(i * bodyW * 0.5, bodyH * 0.45);
        ctx.lineTo(i * bodyW * 0.2, bodyH * 0.02);
        ctx.closePath();
        ctx.fill();
      }
    } else if (kind === 'bird') {
      ctx.fillStyle = '#1f2f38';
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW * 0.38, bodyH * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eef5f8';
      ctx.beginPath();
      ctx.ellipse(bodyW * 0.06, bodyH * 0.03, bodyW * 0.2, bodyH * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2aa55';
      ctx.beginPath();
      ctx.moveTo(bodyW * 0.4, -bodyH * 0.03);
      ctx.lineTo(bodyW * 0.6, bodyH * 0.03);
      ctx.lineTo(bodyW * 0.4, bodyH * 0.1);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW * 0.5, bodyH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const tailScale = viewBack ? 1.35 : 1;
    ctx.fillStyle = shade(color, -28);
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.5, 0);
    ctx.lineTo(-bodyW * (0.9 * tailScale), -bodyH * 0.46 * tailScale);
    ctx.lineTo(-bodyW * (0.9 * tailScale), bodyH * 0.46 * tailScale);
    ctx.closePath();
    ctx.fill();

    if (!viewBack) {
      ctx.fillStyle = '#eefaff';
      ctx.beginPath();
      ctx.arc(bodyW * 0.22, -bodyH * 0.11, Math.max(2, r * 0.13), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b111a';
      ctx.beginPath();
      ctx.arc(bodyW * 0.24, -bodyH * 0.1, Math.max(1, r * 0.07), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(230,245,255,0.45)';
      ctx.lineWidth = Math.max(1, r * 0.08);
      ctx.beginPath();
      ctx.arc(-bodyW * 0.08, 0, Math.max(3, r * 0.17), 0, Math.PI * 2);
      ctx.stroke();
    }

    if (isThreat) {
      ctx.strokeStyle = 'rgba(255,90,96,0.88)';
      ctx.lineWidth = Math.max(1, r * 0.09);
      ctx.beginPath();
      ctx.ellipse(0, 0, bodyW * 0.64, bodyH * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawHUD() {
    const mobile = shouldShowTouchUI();
    const portrait = canvas.height > canvas.width;
    const hudX = mobile ? 8 : 12;
    const hudY = mobile ? 8 : 10;
    const hudW = mobile ? canvas.width - 16 : 650;
    const hudH = mobile ? (portrait ? 112 : 130) : 148;
    const fontSize = mobile ? (portrait ? 12 : 14) : 18;
    const lineGap = mobile ? (portrait ? 18 : 22) : 24;
    const textX = hudX + 10;
    const firstY = hudY + (mobile ? 18 : 24);

    ctx.fillStyle = 'rgba(0, 14, 26, 0.5)';
    ctx.fillRect(hudX, hudY, hudW, hudH);

    ctx.fillStyle = '#dff3ff';
    ctx.font = `${fontSize}px Trebuchet MS`;
    ctx.fillText(`맵:${currentBiome().label} | 모드:${state.mode.toUpperCase()} | 종:${state.player.speciesLabel}`, textX, firstY);
    ctx.fillText(`점수:${state.score} | 처치:${state.kills} | 크기:${state.player.size.toFixed(2)}x | HP:${state.player.hp.toFixed(0)}`, textX, firstY + lineGap);
    ctx.fillText(`부스트:${state.player.boostStamina.toFixed(0)} | 흡인CD:${state.suctionCooldown.toFixed(1)} | 공격CD:${state.attackCooldown.toFixed(1)}`, textX, firstY + lineGap * 2);
    ctx.fillText(`강화:${Math.ceil(state.biomeImpactTimer)}초 | 개체수:${state.entities.length}`, textX, firstY + lineGap * 3);

    if (state.suctionTimer > 0) {
      ctx.fillStyle = 'rgba(133, 235, 199, 0.9)';
      ctx.fillRect(textX, hudY + hudH - 10, clamp((state.suctionTimer / 2.1) * 180, 0, 180), 6);
    }

    if (state.killFlash > 0) {
      ctx.fillStyle = `rgba(255,222,126,${state.killFlash * 2.5})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function nearestEntity(predicate) {
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const e of state.entities) {
      if (e.deadTimer > 0) continue;
      if (!predicate(e)) continue;
      const dx = e.x - state.player.x;
      const dy = e.y - state.player.y;
      const dz = (e.z - state.player.z) * 320;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < bestDist) {
        best = e;
        bestDist = dist;
      }
    }
    return best;
  }

  function drawGuides() {
    const prey = nearestEntity((e) => e.size < state.player.size * 0.98);
    const threat = nearestEntity((e) => e.size > state.player.size * 1.05);

    let y = canvas.height - 56;
    ctx.font = '16px Trebuchet MS';
    if (threat) {
      const p = project(threat.x, threat.y, threat.z);
      ctx.strokeStyle = 'rgba(255,99,109,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5, canvas.height * 0.58);
      ctx.lineTo(p.screenX, p.screenY);
      ctx.stroke();
      ctx.fillStyle = '#ffbac0';
      ctx.fillText(`Nearest threat: ${threat.speciesLabel} (${threat.size.toFixed(2)}x)`, 20, y);
      y -= 24;
    }
    if (prey) {
      const p = project(prey.x, prey.y, prey.z);
      ctx.strokeStyle = 'rgba(95, 255, 190, 0.78)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5, canvas.height * 0.58);
      ctx.lineTo(p.screenX, p.screenY);
      ctx.stroke();
      ctx.fillStyle = '#a9f6d9';
      ctx.fillText(`Target prey: ${prey.speciesLabel} (${prey.size.toFixed(2)}x)`, 20, y);
    }

    if (state.suctionTimer > 0) {
      const p = project(state.player.x, state.player.y, state.player.z);
      ctx.strokeStyle = 'rgba(120,240,212,0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.screenX, p.screenY, 180 * (1 / state.player.z), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawStart() {
    const mobile = shouldShowTouchUI();
    const portrait = mobile && canvas.height > canvas.width;
    const panel = mobile
      ? { x: canvas.width * 0.04, y: canvas.height * 0.08, w: canvas.width * 0.92, h: canvas.height * 0.84 }
      : { x: canvas.width * 0.08, y: canvas.height * 0.14, w: canvas.width * 0.84, h: canvas.height * 0.74 };

    drawSurface();
    drawBubbles();

    ctx.fillStyle = 'rgba(0, 10, 18, 0.58)';
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);

    ctx.fillStyle = '#def6ff';
    ctx.textAlign = 'center';
    ctx.font = `bold ${mobile ? (portrait ? 34 : 40) : 46}px Trebuchet MS`;
    ctx.fillText('GROW THE FISH', canvas.width * 0.5, panel.y + panel.h * 0.16);
    ctx.font = `bold ${mobile ? (portrait ? 18 : 20) : 22}px Trebuchet MS`;
    ctx.fillText('REAL OCEAN HUNT', canvas.width * 0.5, panel.y + panel.h * 0.23);

    const infoFont = mobile ? (portrait ? 14 : 17) : 20;
    const lineGap = mobile ? (portrait ? 24 : 22) : 26;
    let infoY = panel.y + panel.h * 0.32;
    ctx.font = `${infoFont}px Trebuchet MS`;
    ctx.fillText(`플레이어: ${state.player.speciesLabel} (${state.player.scientific})`, canvas.width * 0.5, infoY);
    infoY += lineGap;
    ctx.fillText(`선택 맵: ${currentBiome().label}`, canvas.width * 0.5, infoY);
    infoY += lineGap;
    ctx.fillText('종/맵 변경: 좌우 버튼 (키보드도 가능)', canvas.width * 0.5, infoY);
    infoY += lineGap;
    ctx.fillText('모바일: 왼쪽 이동패드 + 오른쪽 액션버튼', canvas.width * 0.5, infoY);
    infoY += lineGap;
    ctx.fillText('시작: START 버튼 또는 Enter/Space', canvas.width * 0.5, infoY);
    const infoBottom = infoY;

    state.ui.speciesButtons = [];
    const baseY = Math.max(panel.y + panel.h * 0.52, infoBottom + 18);
    const w = Math.min(210, panel.w * 0.26);
    const h = Math.max(38, panel.h * 0.07);
    const gap = Math.max(8, canvas.width * 0.014);
    const total = w * PLAYER_SPECIES.length + gap * (PLAYER_SPECIES.length - 1);
    const startX = canvas.width * 0.5 - total * 0.5;
    for (let i = 0; i < PLAYER_SPECIES.length; i++) {
      const x = startX + i * (w + gap);
      const picked = i === state.selectedPlayerIndex;
      const p = PLAYER_SPECIES[i];
      ctx.fillStyle = picked ? 'rgba(140,235,255,0.86)' : 'rgba(9,30,44,0.72)';
      ctx.fillRect(x, baseY, w, h);
      ctx.strokeStyle = picked ? '#dffbff' : 'rgba(170,226,255,0.52)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, baseY, w, h);
      ctx.fillStyle = picked ? '#072130' : '#d7f3ff';
      ctx.font = `bold ${Math.round(clamp(w * 0.09, 12, 17))}px Trebuchet MS`;
      ctx.fillText(p.label, x + w * 0.5, baseY + h * 0.65);
      state.ui.speciesButtons.push({ x, y: baseY, w, h, index: i });
    }

    ctx.font = `${mobile ? (portrait ? 13 : 15) : 16}px Trebuchet MS`;
    ctx.fillStyle = '#c8f2ff';
    ctx.fillText('물고기 버튼/키보드로 종 선택 가능', canvas.width * 0.5, baseY + h + 24);

    const navW = mobile ? Math.max(44, panel.w * 0.10) : 52;
    const navH = mobile ? Math.max(40, panel.h * 0.065) : 42;
    const biomeY = baseY + h + 34;
    const speciesY = baseY + h * 0.5;
    const leftX = panel.x + panel.w * 0.08;
    const rightX = panel.x + panel.w * 0.92 - navW;
    state.ui.touchButtons.prevSpecies = { x: leftX, y: speciesY - navH * 0.5, w: navW, h: navH };
    state.ui.touchButtons.nextSpecies = { x: rightX, y: speciesY - navH * 0.5, w: navW, h: navH };
    state.ui.touchButtons.prevBiome = { x: leftX, y: biomeY - navH * 0.5, w: navW, h: navH };
    state.ui.touchButtons.nextBiome = { x: rightX, y: biomeY - navH * 0.5, w: navW, h: navH };
    state.ui.touchButtons.start = { x: canvas.width * 0.34, y: panel.y + panel.h * 0.80, w: canvas.width * 0.32, h: Math.max(42, panel.h * 0.08) };

    const navButtons = [state.ui.touchButtons.prevSpecies, state.ui.touchButtons.nextSpecies, state.ui.touchButtons.prevBiome, state.ui.touchButtons.nextBiome];
    const navLabels = ['<', '>', '<', '>'];
    for (let i = 0; i < navButtons.length; i++) {
      const b = navButtons[i];
      ctx.fillStyle = 'rgba(16, 44, 62, 0.85)';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = 'rgba(170,226,255,0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = '#dff6ff';
      ctx.font = `bold ${Math.round(clamp(navH * 0.56, 20, 28))}px Trebuchet MS`;
      ctx.fillText(navLabels[i], b.x + b.w * 0.5, b.y + navH * 0.70);
    }

    const sb = state.ui.touchButtons.start;
    ctx.fillStyle = 'rgba(86, 196, 222, 0.86)';
    ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
    ctx.strokeStyle = '#e4fdff';
    ctx.lineWidth = 2;
    ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
    ctx.fillStyle = '#042534';
    ctx.font = `bold ${Math.round(clamp(sb.h * 0.52, 19, 28))}px Trebuchet MS`;
    ctx.fillText('START', sb.x + sb.w * 0.5, sb.y + sb.h * 0.68);
    ctx.textAlign = 'start';
  }

  function drawEnd(title, subtitle) {
    ctx.fillStyle = 'rgba(0, 8, 14, 0.65)';
    ctx.fillRect(canvas.width * 0.22, canvas.height * 0.24, canvas.width * 0.56, canvas.height * 0.48);
    ctx.fillStyle = '#eefaff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Trebuchet MS';
    ctx.fillText(title, canvas.width * 0.5, canvas.height * 0.40);
    ctx.font = '24px Trebuchet MS';
    ctx.fillText(subtitle, canvas.width * 0.5, canvas.height * 0.5);
    ctx.fillText(`점수: ${state.score} / 처치: ${state.kills}`, canvas.width * 0.5, canvas.height * 0.58);
    ctx.fillText('R 키로 재시작', canvas.width * 0.5, canvas.height * 0.66);
    state.ui.touchButtons.restart = { x: canvas.width * 0.38, y: canvas.height * 0.61, w: canvas.width * 0.24, h: 48 };
    const rb = state.ui.touchButtons.restart;
    ctx.fillStyle = 'rgba(104, 212, 240, 0.9)';
    ctx.fillRect(rb.x, rb.y, rb.w, rb.h);
    ctx.strokeStyle = '#e0fbff';
    ctx.lineWidth = 2;
    ctx.strokeRect(rb.x, rb.y, rb.w, rb.h);
    ctx.fillStyle = '#042333';
    ctx.font = 'bold 22px Trebuchet MS';
    ctx.fillText('RESTART', rb.x + rb.w * 0.5, rb.y + 31);
    ctx.textAlign = 'start';
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(0, 10, 18, 0.42)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e8f8ff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 52px Trebuchet MS';
    ctx.fillText('PAUSED', canvas.width * 0.5, canvas.height * 0.45);
    ctx.font = '24px Trebuchet MS';
    ctx.fillText('P 키로 재개', canvas.width * 0.5, canvas.height * 0.54);
    state.ui.touchButtons.resume = { x: canvas.width * 0.40, y: canvas.height * 0.50, w: canvas.width * 0.2, h: 44 };
    const b = state.ui.touchButtons.resume;
    ctx.fillStyle = 'rgba(104, 212, 240, 0.9)';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#e0fbff';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#042333';
    ctx.font = 'bold 20px Trebuchet MS';
    ctx.fillText('RESUME', b.x + b.w * 0.5, b.y + 29);
    ctx.textAlign = 'start';
  }

  function drawTouchControls() {
    if (!shouldShowTouchUI() || state.mode !== 'playing') return;
    const joy = {
      x: canvas.width * 0.06,
      y: canvas.height * 0.38,
      w: canvas.width * 0.48,
      h: canvas.height * 0.56,
    };
    const pause = { x: canvas.width * 0.90, y: canvas.height * 0.03, w: canvas.width * 0.07, h: canvas.height * 0.08 };
    const depthUp = { x: canvas.width * 0.62, y: canvas.height * 0.48, w: canvas.width * 0.12, h: canvas.height * 0.13 };
    const depthDown = { x: canvas.width * 0.62, y: canvas.height * 0.63, w: canvas.width * 0.12, h: canvas.height * 0.13 };
    const boost = { x: canvas.width * 0.78, y: canvas.height * 0.33, w: canvas.width * 0.15, h: canvas.height * 0.12 };
    const suction = { x: canvas.width * 0.78, y: canvas.height * 0.50, w: canvas.width * 0.15, h: canvas.height * 0.12 };
    const attack = { x: canvas.width * 0.78, y: canvas.height * 0.67, w: canvas.width * 0.15, h: canvas.height * 0.12 };
    state.ui.touchButtons = { ...state.ui.touchButtons, joy, pause, depthUp, depthDown, boost, suction, attack };

    ctx.save();
    ctx.fillStyle = 'rgba(10, 25, 35, 0.25)';
    ctx.fillRect(joy.x, joy.y, joy.w, joy.h);
    ctx.strokeStyle = 'rgba(150, 220, 245, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(joy.x, joy.y, joy.w, joy.h);
    ctx.fillStyle = '#d7f6ff';
    ctx.font = 'bold 16px Trebuchet MS';
    ctx.fillText('MOVE', joy.x + 10, joy.y + 22);

    const buttons = [
      [pause, 'II'],
      [depthUp, 'Q'],
      [depthDown, 'E'],
      [boost, 'BOOST'],
      [suction, 'SUCK'],
      [attack, 'ATK'],
    ];
    for (const [b, label] of buttons) {
      ctx.fillStyle = 'rgba(8, 30, 44, 0.5)';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = 'rgba(170, 230, 255, 0.75)';
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = '#e4faff';
      ctx.font = 'bold 16px Trebuchet MS';
      ctx.textAlign = 'center';
      ctx.fillText(label, b.x + b.w * 0.5, b.y + b.h * 0.57);
      ctx.textAlign = 'start';
    }
    ctx.restore();
  }

  function renderWorld() {
    drawSurface();
    drawBubbles();

    const renderables = state.entities
      .filter((e) => e.deadTimer <= 0)
      .map((e) => ({ type: 'entity', z: e.z, data: e }))
      .concat([{ type: 'player', z: state.player.z, data: state.player }])
      .sort((a, b) => b.z - a.z);

    for (const item of renderables) {
      if (item.type === 'entity') {
        const e = item.data;
        const p = project(e.x, e.y, e.z);
        const r = entityRadius(e) * p.scale;
        if (r < 1.5) continue;
        if (p.screenX < -140 || p.screenX > canvas.width + 140 || p.screenY < -140 || p.screenY > canvas.height + 140) continue;

        const fade = clamp(1.2 - Math.abs(e.z - state.player.z) * 0.58, 0.45, 1);
        ctx.save();
        ctx.globalAlpha = fade;
        drawCreature(p.screenX, p.screenY, r, e.color, e.facing, e.template.kind, e.size > state.player.size * 1.08, false);
        ctx.restore();
      } else {
        const p = project(state.player.x, state.player.y, state.player.z);
        const r = playerRadius() * p.scale;
        const backView = state.player.facing < 0;
        drawCreature(p.screenX, p.screenY, r, state.player.color, state.player.facing, 'fish', false, backView);
      }
    }

    drawHUD();
    drawGuides();
    drawTouchControls();

    if (state.mode === 'paused') drawPaused();
    if (state.mode === 'gameover') drawEnd('GAME OVER', '사냥꾼에게 당했습니다');
    if (state.mode === 'win') drawEnd('YOU WIN', '바다 최상위 포식자가 되었습니다');
  }

  function render() {
    if (state.mode === 'start') {
      drawStart();
      return;
    }
    renderWorld();
  }

  function step(dt) {
    if (state.mode === 'playing') updatePlaying(dt);
    render();
  }

  let lastTs = 0;
  function loop(ts) {
    if (!lastTs) lastTs = ts;
    const dt = clamp((ts - lastTs) / 1000, 0, 0.05);
    lastTs = ts;
    step(dt);
    requestAnimationFrame(loop);
  }

  window.render_game_to_text = function renderGameToText() {
    const p = state.player;
    const prey = nearestEntity((e) => e.size < p.size * 0.98);
    const threat = nearestEntity((e) => e.size > p.size * 1.05);

    return JSON.stringify({
      mode: state.mode,
      biome: currentBiome().label,
      biomeImpactSec: Number(state.biomeImpactTimer.toFixed(1)),
      coordinateSystem: 'origin=(0,0) world center, +x right, +y down, +z farther from camera',
      score: state.score,
      kills: state.kills,
      timeSec: Number(state.time.toFixed(2)),
      player: {
        species: p.speciesLabel,
        scientific: p.scientific,
        x: Number(p.x.toFixed(1)),
        y: Number(p.y.toFixed(1)),
        z: Number(p.z.toFixed(2)),
        vx: Number(p.vx.toFixed(1)),
        vy: Number(p.vy.toFixed(1)),
        vz: Number(p.vz.toFixed(2)),
        size: Number(p.size.toFixed(2)),
        radius: Number(playerRadius().toFixed(1)),
        hp: Number(p.hp.toFixed(0)),
        facing: p.facing,
        boostStamina: Number(p.boostStamina.toFixed(1)),
      },
      skillState: {
        attackCooldown: Number(state.attackCooldown.toFixed(2)),
        suctionCooldown: Number(state.suctionCooldown.toFixed(2)),
        suctionActive: state.suctionTimer > 0,
        biomeEffectStrength: Number(biomeImpactStrength().toFixed(2)),
      },
      target: {
        nearestPrey: prey ? { id: prey.id, species: prey.speciesLabel, size: Number(prey.size.toFixed(2)) } : null,
        nearestThreat: threat ? { id: threat.id, species: threat.speciesLabel, size: Number(threat.size.toFixed(2)) } : null,
      },
      entities: state.entities.slice(0, 30).map((e) => ({
        id: e.id,
        species: e.speciesLabel,
        kind: e.template.kind,
        x: Number(e.x.toFixed(1)),
        y: Number(e.y.toFixed(1)),
        z: Number(e.z.toFixed(2)),
        size: Number(e.size.toFixed(2)),
        hp: Math.max(0, Math.round(e.hp)),
      })),
      entityCount: state.entities.length,
      objective: 'grow, hunt, and survive across river/wetland/reef/ocean/arctic biomes',
      controls: 'species:1/2/3/[ ], map:,./n/m/4/5, start:enter/space/touch, move:wasd/arrows/touch-pad, depth:q/e/touch, kill:k/touch, suction:x/touch, boost:shift/touch, pause:p/touch, restart:r/touch, fullscreen:f',
      touchUi: shouldShowTouchUI(),
    });
  };

  window.advanceTime = function advanceTime(ms) {
    const frameMs = 1000 / 60;
    const steps = Math.max(1, Math.round(ms / frameMs));
    for (let i = 0; i < steps; i++) {
      if (state.mode === 'playing') updatePlaying(1 / 60);
    }
    render();
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  window.addEventListener('resize', onResize);
  document.addEventListener('fullscreenchange', onResize);

  updateWorldByBiome();
  setPlayerSpecies(state.selectedPlayerIndex);
  onResize();
  render();
  requestAnimationFrame(loop);
})();
