// JavaScript Logic for Micro Apps Portal

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCursorGlow();
  initStatsClock();
  initStatsCounter();
  initSearchAndFilters();
  initTerminal();
  initModalsAndCarousels();
});

// Theme Management
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('svg');
  
  // Set default theme to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let nextTheme = theme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateThemeIcon(nextTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'light') {
      themeIcon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.32 11.32l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
    } else {
      themeIcon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" fill="currentColor"/>`;
    }
  }
}

// Interactive cursor glowing gradient
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// Live stats updating (Clock & Ping)
function initStatsClock() {
  const timeDisplay = document.getElementById('statsTime');
  const pingDisplay = document.getElementById('statsPing');
  
  function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    timeDisplay.textContent = timeStr;
  }
  
  setInterval(updateClock, 1000);
  updateClock();

  // Simulate server connection quality / response delay
  function updatePing() {
    const randomPing = Math.floor(Math.random() * 12) + 4; // 4-15ms
    pingDisplay.textContent = randomPing + 'ms';
  }
  
  setInterval(updatePing, 5000);
  updatePing();
}

// Stats Counter animation on loading
function initStatsCounter() {
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(stat => {
    const target = parseFloat(stat.getAttribute('data-target'));
    const isFloat = stat.getAttribute('data-target').includes('.');
    let current = 0;
    const duration = 1200; // ms
    const stepTime = 15;
    const steps = duration / stepTime;
    const increment = target / steps;
    
    let stepCount = 0;
    const timer = setInterval(() => {
      current += increment;
      stepCount++;
      
      if (stepCount >= steps) {
        clearInterval(timer);
        stat.textContent = isFloat ? target.toFixed(1) + 's' : Math.round(target);
      } else {
        stat.textContent = isFloat ? current.toFixed(1) : Math.round(current);
      }
    }, stepTime);
  });
}

// Search and Filter functionality
function initSearchAndFilters() {
  const searchInput = document.getElementById('appSearch');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.app-card-wrapper');

  // Input typing search
  searchInput.addEventListener('input', filterCards);

  // Category pill filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards();
    });
  });

  function filterCards() {
    const query = searchInput.value.toLowerCase().trim();
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

    cards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const tags = card.getAttribute('data-tags').split(',');
      const categories = card.getAttribute('data-categories').split(',');

      const matchesSearch = title.includes(query) || desc.includes(query) || tags.some(tag => tag.toLowerCase().includes(query));
      const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);

      if (matchesSearch && matchesFilter) {
        card.style.display = 'block';
        setTimeout(() => card.style.opacity = '1', 10);
      } else {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 300);
      }
    });
  }
}

// Interactive Terminal emulator
function initTerminal() {
  const termContainer = document.getElementById('terminalContainer');
  const termToggle = document.getElementById('terminalToggle');
  const minimizeBtn = document.getElementById('minimizeTerm');
  const maximizeBtn = document.getElementById('maximizeTerm');
  const closeBtn = document.getElementById('closeTerm');
  
  const termBody = document.getElementById('terminalBody');
  const termInput = document.getElementById('terminalInput');
  const matrixCanvas = document.getElementById('matrixCanvas');
  
  // Commands mapping
  const COMMANDS = {
    help: 'Show list of available commands.',
    list: 'List all deployed micro-applications.',
    launch: 'Launch an application. Usage: launch [id]',
    stats: 'Display simulated system diagnostic specs.',
    neofetch: 'Show system dashboard information.',
    matrix: 'Initiate standard digital rain visualizer.',
    about: 'Details regarding the Micro Apps Suite framework.',
    clear: 'Clear terminal screen console.'
  };

  const APPS_LIST = [
    { id: 'camp', name: 'clara-summer-camps-madrid', label: '🏕️ Campamentos de Verano Clara' },
    { id: 'scout', name: 'andalucia-scouting-2026', label: '🏠 Andalucía Real Estate Scouting' },
    { id: 'prefab', name: 'casa-prefab-madrid', label: '🏗️ Modular House Cost Calculator' },
    { id: 'designer', name: 'house-designer', label: '📐 3D House & Floor Plan Designer' }
  ];

  // Toggle terminal height
  termToggle.addEventListener('click', toggleTerminal);
  minimizeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    termContainer.classList.add('minimized');
  });
  maximizeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    termContainer.classList.remove('minimized');
    termInput.focus();
  });
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    termContainer.style.display = 'none';
  });

  function toggleTerminal() {
    termContainer.classList.toggle('minimized');
    if (!termContainer.classList.contains('minimized')) {
      termInput.focus();
    }
  }

  // Focus input on body click
  termBody.addEventListener('click', () => {
    termInput.focus();
  });

  // Handle Command Submit
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const line = termInput.value.trim();
      termInput.value = '';
      if (line) {
        handleCommand(line);
      }
    }
  });

  function writeLine(text, type = '') {
    const el = document.createElement('div');
    el.className = 'terminal-line ' + type;
    el.innerHTML = text;
    termBody.insertBefore(el, termBody.lastElementChild);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function handleCommand(rawCmd) {
    const tokens = rawCmd.split(' ');
    const command = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    writeLine(`<span class="terminal-prompt">guest@microapps:~$</span> ${rawCmd}`);

    if (command === 'help') {
      writeLine('Available Commands:', 'info');
      Object.keys(COMMANDS).forEach(cmd => {
        writeLine(`  <span style="color: #6366f1; font-weight: 500">${cmd.padEnd(10)}</span> - ${COMMANDS[cmd]}`);
      });
    } 
    else if (command === 'clear') {
      const welcome = termBody.querySelector('.terminal-welcome');
      termBody.innerHTML = '';
      if (welcome) termBody.appendChild(welcome);
      // Re-append the input line
      const inputLine = document.createElement('div');
      inputLine.className = 'terminal-input-line';
      inputLine.innerHTML = `<span class="terminal-prompt">guest@microapps:~$</span><div class="terminal-input-container"><input type="text" id="terminalInput" autocomplete="off" spellcheck="false"></div>`;
      termBody.appendChild(inputLine);
      // Re-bind input
      const newInput = document.getElementById('terminalInput');
      newInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const line = newInput.value.trim();
          newInput.value = '';
          if (line) {
            handleCommand(line);
          }
        }
      });
      setTimeout(() => newInput.focus(), 50);
    } 
    else if (command === 'list') {
      writeLine('Active Micro-Applications:', 'info');
      APPS_LIST.forEach(app => {
        writeLine(`  [<span style="color:#14b8a6">${app.id}</span>] ${app.label}`);
        writeLine(`        Path: ./${app.name}/`);
      });
      writeLine('Use command "launch [id]" to start.', 'comment');
    } 
    else if (command === 'launch') {
      if (args.length === 0) {
        writeLine('Error: App ID needed. Type "list" to view applications.', 'error');
        return;
      }
      const targetId = args[0].toLowerCase();
      const app = APPS_LIST.find(a => a.id === targetId || a.name.includes(targetId));
      if (app) {
        writeLine(`Launching <span style="color:#22c55e">${app.label}</span>...`);
        window.open(`./${app.name}/`, '_blank');
      } else {
        writeLine(`Error: App ID "${targetId}" not found. Type "list" to see app keys.`, 'error');
      }
    } 
    else if (command === 'stats') {
      writeLine('Simulating Client Diagnostic Suite...', 'info');
      setTimeout(() => {
        writeLine(`  OS Platform:   <span style="color:#f8fafc">Antigravity OS Web</span>`);
        writeLine(`  Environment:   <span style="color:#22c55e">Stable Production</span>`);
        writeLine(`  CPU Load:      <span style="color:#f59e0b">${(Math.random() * 8 + 2).toFixed(1)}%</span>`);
        writeLine(`  Browser Node:  <span style="color:#14b8a6">${navigator.userAgent.split(' ')[0]}</span>`);
        writeLine(`  Active Nodes:  <span style="color:#a855f7">4 Isolated Sandboxes</span>`);
      }, 100);
    } 
    else if (command === 'neofetch') {
      const asciiArt = `
<span style="color: #6366f1; font-weight: bold">   __  ___ _               ___                </span>
<span style="color: #6366f1; font-weight: bold">  /  |/  /(_)_____ ___ ___/ _ | ___  ___  ___ </span>
<span style="color: #a855f7; font-weight: bold"> / /|_/ // // __// __/ _ \\/ __ |/ _ \\/ _ \\(_-< </span>
<span style="color: #a855f7; font-weight: bold">/_/  /_//_/ \\___/\\__/ \\___/_/ |_/ .__/ .__/___/</span>
<span style="color: #14b8a6; font-weight: bold">                               /_/  /_/        </span>`;
      writeLine(asciiArt);
      writeLine('--------------------------------------------');
      writeLine('<b>Micro Apps Suite Console v2.1.0</b>');
      writeLine('<b>Uptime:</b> ' + Math.floor(performance.now() / 1000) + 's');
      writeLine('<b>Renderer:</b> CSS Hardware Accelerated Glass');
      writeLine('<b>Apps Mounted:</b> 4 Active Subdirectories');
      writeLine('<b>License:</b> Open Source Developer Suite');
      writeLine('--------------------------------------------');
    } 
    else if (command === 'matrix') {
      writeLine('Deploying Matrix Rain digital stream...', 'info');
      runMatrixRain();
    } 
    else if (command === 'about') {
      writeLine('<b>Micro Apps Suite</b> is a playground for bespoke HTML5 microservices, developers layouts, and visual tools.', 'info');
      writeLine('Built using standard Vanilla DOM APIs, modern HSL design theory, and hardware-accelerated animations.', 'info');
    } 
    else {
      writeLine(`Command not found: "${command}". Type "help" to see valid inputs.`, 'error');
    }
  }

  // Matrix Code Rain
  let matrixInterval = null;
  function runMatrixRain() {
    matrixCanvas.classList.add('active');
    const ctx = matrixCanvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      matrixCanvas.width = termContainer.offsetWidth;
      matrixCanvas.height = termContainer.offsetHeight;
    };
    resizeCanvas();
    
    const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabet = katakana.split('');
    
    const fontSize = 12;
    const columns = matrixCanvas.width / fontSize;
    
    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = 1;
    }
    
    const draw = () => {
      ctx.fillStyle = 'rgba(4, 6, 15, 0.05)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
        
        if (rainDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };
    
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(draw, 30);
    
    // End after 8 seconds
    setTimeout(() => {
      clearInterval(matrixInterval);
      ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      matrixCanvas.classList.remove('active');
      writeLine('Matrix stream terminated successfully.', 'comment');
    }, 6000);
  }
}

// Modals, Detail Tab Navigation & Screenshot Carousels
function initModalsAndCarousels() {
  const modalOverlay = document.getElementById('detailsModal');
  const modalClose = modalOverlay.querySelector('.modal-close');
  const detailsBtns = document.querySelectorAll('.btn-details');
  
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const tabBtns = document.querySelectorAll('.modal-tab-btn');
  const tabPanes = document.querySelectorAll('.modal-tab-pane');

  // App-specific descriptions and specs for detail popups
  const APP_DETAILS = {
    'clara-summer-camps-madrid': {
      title: 'Clara Summer Camps Madrid 2026',
      icon: '🏕️',
      tech: ['React', 'Vite', 'CSS Flexbox', 'Dynamic Ordering', 'JSON Data Structs'],
      overview: 'Interactive research portal designed to evaluate summer camps in Penagrande, Madrid for July & August 2026. Tailored specifically for 5-year-old Clara to find Spanish-language camps near grandparents\' homes.',
      features: [
        '<b>Priority Registration Alerts:</b> Uptime tracking of the Madrid municipal registration window (Apr 23 - Apr 29).',
        '<b>Flexible Sorting Matrix:</b> Instantly sort options by weekly pricing, walking distance (Peñagrande center base), or age eligibility.',
        '<b>Strategic Priority Advisor:</b> Built-in decision matrices highlighting optimal camp sequences to balance budget and dates.'
      ]
    },
    'andalucia-scouting-2026': {
      title: 'Andalucía Real Estate Scouting 2026',
      icon: '🏠',
      tech: ['React', 'Dynamic Map Routing', 'Bilingual UI (ES/EN)', 'Structured Checklists', 'Responsive CSS'],
      overview: 'Detailed travel planner and real-estate evaluation dashboard for a 4-day intensive scouting trip (Aug 12–15, 2026) across Málaga, Granada, and Sevilla.',
      features: [
        '<b>Bilingual Switcher:</b> Quick localized Spanish/English layouts for shared agent and buyer workflows.',
        '<b>Town Comparison Sheet:</b> Side-by-side assessment of climate comfort, parking logistics, local school access, and neighborhood pros/cons.',
        '<b>Comprehensive Buying Analysis:</b> Curated checklists tailored for three development types: Obra Nueva (new builds), Resale, and Suelo Urbano (buildable plots under LISTA 2022).'
      ]
    },
    'casa-prefab-madrid': {
      title: 'Prefabricated House Calculator',
      icon: '🏗️',
      tech: ['React', 'Cost Matrix Engine', 'Vite', 'Modular CSS', 'Math Utility Kernels'],
      overview: 'Bespoke modular building pricing engine and structural material analysis designed to compute "turnkey" (llave en mano) building budgets for Madrid properties.',
      features: [
        '<b>Turnkey Budget Calculator:</b> Input build sizes and material standards to see instant cimentación, structural, cladding, and architectural fee breakdowns.',
        '<b>Materials Spectrum:</b> Interactive details comparing Structural Insulated Panels (SIP), steel frames, timber frame, concrete columns, and CLT.',
        '<b>Exhibitions & Builder Auditing:</b> Compiled list of major manufacturers, modular models, upcoming expos, and crucial warnings about vendor pricing tricks.'
      ]
    },
    'house-designer': {
      title: 'House Designer 2D/3D Plan Editor',
      icon: '📐',
      tech: ['Three.js Canvas', 'SVG Grid Engine', 'WebGL Renderers', 'JSON Import/Export', 'LocalForage Storage'],
      overview: 'A visual vector canvas tool for creating architectural floor plans. Enables users to sketch walls, place furniture assets, and render the layout instantly in high-fidelity 3D with walk-through features.',
      features: [
        '<b>Frictionless Vector Canvas:</b> Draw walls, doors, windows, and partition lines with accurate snapping grids.',
        '<b>Curated Furniture Directory:</b> Catalog of modern sofas, tables, cabinets, beds, and fixtures.',
        '<b>Realtime 3D Walkthrough:</b> Switch view modes from 2D blueprints to 3D Orbit camera or FPS walk-through, built directly using WebGL.',
        '<b>JSON import/export:</b> Save design configurations locally or export layout files to share with builders.'
      ]
    },
    'madrid-fire-planner': {
      title: 'Madrid FIRE Planner — What-If Budget',
      icon: '🔥',
      tech: ['React 19', 'Live Capital Engine', 'Capitalised-Cost Model', 'EUR/USD Toggle', 'Vite'],
      overview: 'An interactive early-retirement (FIRE) planner for a family of 4 relocating to the eastern Madrid commuter belt (Alcalá de Henares) to live off investments with no earned income. Define your starting capital, then add, remove, or edit any expense to see in real time whether you reach the goal — and exactly what each choice costs your nest-egg.',
      features: [
        '<b>Starting-capital → goal engine:</b> Enter what you have; the app shows the tax-adjusted capital target, the gap, and a live "% of goal funded" bar.',
        '<b>Capitalised cost per line:</b> Every recurring expense reveals what it truly ties up in your nest-egg (annual ÷ safe-withdrawal-rate) — a €250/mo line is really ~€86k of capital.',
        '<b>Give-up / add what-ifs:</b> Toggle any expense off, edit amounts, or add custom lines; the "Biggest levers" panel ranks what closes the gap fastest.',
        '<b>Fact-checked defaults:</b> Values verified against 2026 sources (idealista, Numbeo, INE, Adeslas/Sanitas, CRTM, Agencia Tributaria); switch to the original xlsx figures to compare.',
        '<b>Faithful financial model:</b> Perpetual costs are capitalised at an adjustable SWR (default 3.5%), children funded as a finite lump through age 18, home/car/furniture bought outright.'
      ]
    }
  };

  // House Designer Screenshots Array
  const HOUSE_DESIGNER_SCREENSHOTS = [
    { src: './3d-walk.jpeg', desc: 'First-Person 3D walkthrough rendering of a modern cabin interior.' },
    { src: './3d-sofa.jpeg', desc: 'Close-up perspective of living area placement and materials.' },
    { src: './3d-top.jpeg', desc: 'Orthographic 3D top-down view showing interior partitioning.' },
    { src: './2d-view.jpeg', desc: 'Intuitive 2D blueprint drafting grid displaying walls and furniture layouts.' },
    { src: './3d-family.jpeg', desc: 'Visualizing spacing and scales in 3D perspective.' }
  ];

  // Details button click opens Modal
  detailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.app-card-wrapper');
      const appId = card.getAttribute('data-id');
      const details = APP_DETAILS[appId];
      
      if (!details) return;

      // Populate basic info
      modalIcon.textContent = details.icon;
      modalTitle.textContent = details.title;
      
      // Populate Overview tab
      const overviewPane = document.getElementById('tabOverview');
      overviewPane.innerHTML = `
        <p style="font-size: 1rem; margin-bottom: 1.5rem; color: var(--text-primary);">${details.overview}</p>
        <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight:600; color: var(--primary); margin-bottom: 0.75rem;">Key Capabilities:</h4>
        <div class="modal-features-list">
          ${details.features.map(f => `
            <div class="modal-feature-item">
              <span class="modal-feature-bullet">✦</span>
              <div>${f}</div>
            </div>
          `).join('')}
        </div>
      `;

      // Populate Specs tab
      const specsPane = document.getElementById('tabSpecs');
      specsPane.innerHTML = `
        <p style="font-size: 0.95rem; margin-bottom: 1.25rem;">This tool runs fully client-side inside standard browser sandboxes. Key technologies deployed in the codebase:</p>
        <div class="modal-tech-list">
          ${details.tech.map(t => `<span class="modal-tech-tag">${t}</span>`).join('')}
        </div>
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.02); border: 1px solid var(--panel-border); border-radius: 12px; font-size: 0.85rem; color: var(--text-secondary);">
          <b>Uptime Node:</b> Local Directory Static Mount<br>
          <b>Performance Target:</b> &lt; 150ms Initial Frame Layout Render Time<br>
          <b>Build Toolchain:</b> Vite Compilation Bundler / ES6 Standard Module Loader
        </div>
      `;

      // Populate Gallery / Showcase tab
      const galleryPane = document.getElementById('tabGallery');
      const galleryTabBtn = document.querySelector('[data-tab="gallery"]');
      
      if (appId === 'house-designer') {
        galleryTabBtn.style.display = 'block';
        setupGalleryCarousel(galleryPane);
      } else {
        galleryTabBtn.style.display = 'none';
        galleryPane.innerHTML = '';
        // If gallery was active, switch to overview
        if (galleryTabBtn.classList.contains('active')) {
          switchTab('overview');
        }
      }

      // Switch to Overview tab by default
      switchTab('overview');
      modalOverlay.classList.add('active');
    });
  });

  // Tab click actions
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  function switchTab(tabId) {
    tabBtns.forEach(b => {
      if (b.getAttribute('data-tab') === tabId) b.classList.add('active');
      else b.classList.remove('active');
    });
    
    tabPanes.forEach(pane => {
      if (pane.id === 'tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1)) pane.classList.add('active');
      else pane.classList.remove('active');
    });
  }

  // Close modal
  modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('active');
  });

  // Carousel rendering for House Designer
  function setupGalleryCarousel(container) {
    container.innerHTML = `
      <div class="carousel-container">
        ${HOUSE_DESIGNER_SCREENSHOTS.map((s, idx) => `
          <div class="carousel-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            <img src="${s.src}" alt="${s.desc}" loading="lazy">
            <div class="carousel-caption">${s.desc}</div>
          </div>
        `).join('')}
        
        <button class="carousel-btn prev">&#10094;</button>
        <button class="carousel-btn next">&#10095;</button>
        
        <div class="carousel-indicators">
          ${HOUSE_DESIGNER_SCREENSHOTS.map((_, idx) => `
            <span class="indicator ${idx === 0 ? 'active' : ''}" data-slide-to="${idx}"></span>
          `).join('')}
        </div>
      </div>
    `;

    const slides = container.querySelectorAll('.carousel-slide');
    const indicators = container.querySelectorAll('.indicator');
    const prevBtn = container.querySelector('.carousel-btn.prev');
    const nextBtn = container.querySelector('.carousel-btn.next');
    let currentIdx = 0;

    function showSlide(index) {
      if (index < 0) currentIdx = slides.length - 1;
      else if (index >= slides.length) currentIdx = 0;
      else currentIdx = index;

      slides.forEach(s => s.classList.remove('active'));
      indicators.forEach(ind => ind.classList.remove('active'));

      slides[currentIdx].classList.add('active');
      indicators[currentIdx].classList.add('active');
    }

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentIdx - 1);
    });
    
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentIdx + 1);
    });

    indicators.forEach(ind => {
      ind.addEventListener('click', (e) => {
        e.stopPropagation();
        const slideTo = parseInt(ind.getAttribute('data-slide-to'));
        showSlide(slideTo);
      });
    });
  }
}
