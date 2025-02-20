// ========== Global Variables ==========
let moduleCount = 0;
const beatData = {}; // For intervals, beat counts
const tapData = {};  // For tap tempo

// Touch handling variables
let touchStartY = 0;
let touchStartTime = 0;
let touchedElement = null;
let draggedElement = null;

/* ========== DARK MODE TOGGLE ========== */
function setDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  localStorage.setItem('darkMode', isDark ? 'true' : 'false');
  document.getElementById('darkModeToggle').checked = isDark;
}

function loadDarkModePreference() {
  const saved = localStorage.getItem('darkMode');
  setDarkMode(saved === 'true');
}

/* ========== REFRESH BUTTON ========== */
function refreshPage() {
  const baseUrl = window.location.origin + window.location.pathname;
  window.location.href = baseUrl; // full reload
}

/* ========== CREATE SONG MODULE ========== */
function createSongModule(index, data = {}) {
  const container = document.createElement('div');
  container.className = 'song-module';
  container.dataset.index = index;
  container.draggable = true;

 

  // Desktop drag event handlers
  container.addEventListener('dragstart', handleDragStart);
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('drop', handleDrop);
  container.addEventListener('dragend', handleDragEnd);

  // Prevent dragging when interacting with controls
  container.addEventListener('mousedown', preventDragOnControls);
  container.addEventListener('touchstart', preventDragOnControls);

  // Create drag handle icon
  const dragHandle = document.createElement('div');
  dragHandle.className = 'drag-handle';
  dragHandle.innerHTML = '<ion-icon name="reorder-two-outline"></ion-icon>'; // Using Ionicons
  dragHandle.setAttribute('aria-label', 'Drag to reorder');

  // Add touch listeners to drag handle only
  dragHandle.addEventListener('touchstart', handleTouchStart, { passive: false });
  dragHandle.addEventListener('touchmove', handleTouchMove, { passive: false });
  dragHandle.addEventListener('touchend', handleTouchEnd);

  // Create song title container
  const songTitleContainer = createSongTitleContainer(data);
  
  // Create controls
  const bpmSelect = createBPMSelect(data);
  const tapTempoBtn = createTapTempoButton();
  const timesigSelect = createTimeSignatureSelect(data);
  const beatIndicator = createBeatIndicator();
  const removeBtn = createRemoveButton(index, container);

  // Append all elements
  container.appendChild(songTitleContainer);
  container.appendChild(bpmSelect);
  container.appendChild(tapTempoBtn);
  container.appendChild(timesigSelect);
  container.appendChild(dragHandle);     // Add this line
  container.appendChild(beatIndicator);
  container.appendChild(removeBtn);

  // Setup event listeners for BPM and TimeSignature changes
  bpmSelect.addEventListener('change', () => updateBeatIndicator(index));
  timesigSelect.addEventListener('change', () => updateBeatIndicator(index));
  tapTempoBtn.addEventListener('click', () => handleTapTempo(index));

  return container;
}

// ========== Touch Event Handlers ==========
function handleTouchStart(e) {
  const songModule = this.closest('.song-module');
  if (!songModule) return;

  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
  touchedElement = songModule;
  songModule.classList.add('dragging');
}

function handleTouchMove(e) {
  const songModule = this.closest('.song-module');
  if (!touchedElement || touchedElement !== songModule) return;
  
  e.preventDefault();
  const touch = e.touches[0];
  const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
  
  const targetElement = elements.find(el => 
      el.classList.contains('song-module') && el !== touchedElement
  );

  if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      if (touch.clientY < targetRect.top + (targetRect.height / 2)) {
          targetElement.parentNode.insertBefore(touchedElement, targetElement);
      } else {
          targetElement.parentNode.insertBefore(touchedElement, targetElement.nextSibling);
      }
  }
}

function handleTouchEnd() {
  const songModule = this.closest('.song-module');
  if (!touchedElement || touchedElement !== songModule) return;
  
  const touchDuration = Date.now() - touchStartTime;
  if (touchDuration >= 200) {
      updateModuleIndices();
  }
  
  songModule.classList.remove('dragging');
  touchedElement = null;
}

// ========== Desktop Drag Event Handlers ==========
function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  
  const target = e.currentTarget;
  if (target !== draggedElement) {
    const targetRect = target.getBoundingClientRect();
    if (e.clientY < targetRect.top + (targetRect.height / 2)) {
      target.parentNode.insertBefore(draggedElement, target);
    } else {
      target.parentNode.insertBefore(draggedElement, target.nextSibling);
    }
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

function handleDragEnd() {
  this.classList.remove('dragging');
  updateModuleIndices();
  draggedElement = null;
}

// ========== Helper Functions ==========
function preventDragOnControls(e) {
  if (shouldPreventDrag(e.target)) {
    this.draggable = false;
    setTimeout(() => {
      this.draggable = true;
    }, 100);
  }
}

function shouldPreventDrag(target) {
  return target.tagName === 'INPUT' || 
         target.tagName === 'SELECT' || 
         target.tagName === 'BUTTON';
}

function updateModuleIndices() {
  const songModules = document.querySelectorAll('.song-module');
  songModules.forEach((module, index) => {
    module.dataset.index = index + 1;
    updateBeatIndicator(index + 1);
  });
}

function createSongTitleContainer(data) {
  const container = document.createElement('div');
  container.className = 'song-title-container';

  const display = document.createElement('span');
  display.className = 'song-display';
  display.title = "Click to edit title";

  const input = document.createElement('input');
  input.className = 'song-input';
  input.type = 'text';
  input.placeholder = 'Add Song Title';
  input.value = data.song || '';

  function updateDisplay() {
    const val = input.value.trim();
    if (val) {
      display.innerHTML = '<ion-icon name="create-outline" class="edit-icon"></ion-icon> ' + val;
      input.style.display = 'none';
      display.style.display = 'block';
    } else {
      display.innerHTML = '';
      input.style.display = 'block';
      display.style.display = 'none';
    }
  }

  input.addEventListener('blur', updateDisplay);
  display.addEventListener('click', () => {
    display.style.display = 'none';
    input.style.display = 'block';
    input.focus();
  });

  updateDisplay();
  container.appendChild(display);
  container.appendChild(input);
  return container;
}

function createBPMSelect(data) {
  const select = document.createElement('select');
  select.className = 'bpm-select';
  for (let i = 30; i <= 300; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    if (data.bpm ? (i === +data.bpm) : (i === 68)) {
      opt.selected = true;
    }
    select.appendChild(opt);
  }
  return select;
}

function createTapTempoButton() {
  const btn = document.createElement('button');
  btn.className = 'tap-tempo-btn';
  btn.type = 'button';
  btn.textContent = 'Tap';
  return btn;
}

function createTimeSignatureSelect(data) {
  const select = document.createElement('select');
  select.className = 'timesig-select';
  const options = ['2/2','3/4','4/4','6/8','9/8','12/8'];
  options.forEach(ts => {
    const opt = document.createElement('option');
    opt.value = ts;
    opt.textContent = ts;
    opt.selected = data.timeSig ? (ts === data.timeSig) : (ts === '4/4');
    select.appendChild(opt);
  });
  return select;
}

function createBeatIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'beat-indicator';
  return indicator;
}

function createRemoveButton(index, container) {
  const btn = document.createElement('button');
  btn.className = 'remove-song-btn';
  btn.title = "Remove this song";
  btn.innerHTML = '<ion-icon name="trash-outline"></ion-icon>';
  
  btn.addEventListener('click', () => {
    if (confirm("Are you sure you want to remove this song?")) {
      if (beatData[index]?.intervalId) {
        clearInterval(beatData[index].intervalId);
        delete beatData[index];
      }
      delete tapData[index];
      container.remove();
    }
  });
  
  return btn;
}

/* ========== TAP TEMPO ========== */
function handleTapTempo(index) {
  const now = performance.now();
  if (!tapData[index]) return;

  const lastTap = tapData[index].lastTapTime;
  if (lastTap > 0) {
    const diff = now - lastTap;
    const newBpm = Math.round(60000 / diff);
    
    const moduleEl = document.querySelector(`.song-module[data-index="${index}"]`);
    if (!moduleEl) return;
    
    const bpmSelect = moduleEl.querySelector('.bpm-select');
    const clampedBpm = Math.max(30, Math.min(newBpm, 300));
    bpmSelect.value = clampedBpm;
    updateBeatIndicator(index);
  }
  tapData[index].lastTapTime = now;
}

/* ========== BEAT INDICATOR ========== */
function updateBeatIndicator(index) {
  const moduleEl = document.querySelector(`.song-module[data-index="${index}"]`);
  if (!moduleEl) return;

  const bpmSelect = moduleEl.querySelector('.bpm-select');
  const timesigSelect = moduleEl.querySelector('.timesig-select');
  const beatIndicator = moduleEl.querySelector('.beat-indicator');

  if (beatData[index]?.intervalId) {
    clearInterval(beatData[index].intervalId);
  }
  beatData[index] = { intervalId: null, beatCount: 0 };

  const bpm = Number(bpmSelect.value);
  if (!bpm || bpm <= 0) {
    beatIndicator.innerHTML = '';
    return;
  }

  const topNumber = parseInt(timesigSelect.value.split('/')[0], 10);
  beatIndicator.innerHTML = Array.from({length: topNumber}, (_, i) => 
    `<span data-beat="${i + 1}">${i + 1}</span> `
  ).join('');

  const intervalMs = (60 / bpm) * 1000;
  beatData[index].intervalId = setInterval(() => {
    beatData[index].beatCount++;
    const currentBeat = ((beatData[index].beatCount - 1) % topNumber) + 1;
    const span = beatIndicator.querySelector(`span[data-beat="${currentBeat}"]`);
    if (span) {
      span.classList.add('active');
      setTimeout(() => span.classList.remove('active'), 100);
    }
  }, intervalMs);
}

/* ========== URL HANDLING ========== */
function buildUrlWithValues() {
  const modules = document.querySelectorAll('.song-module, .title-module');
  const allData = Array.from(modules).map(module => {
    if (module.classList.contains('song-module')) {
      return {
        type: 'song',
        song: module.querySelector('.song-input').value,
        bpm: module.querySelector('.bpm-select').value,
        timeSig: module.querySelector('.timesig-select').value
      };
    } else {
      return {
        type: 'title',
        title: module.querySelector('.title-input').value
      };
    }
  });

  const jsonString = JSON.stringify(allData);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  return window.location.origin + window.location.pathname + '?data=' + compressed;
}

function loadFromUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const compressedData = params.get('data');

  if (!compressedData) {
    addTitleModule();
    addSongModule();
    return;
  }

  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);
    if (!jsonString) throw new Error('Invalid compressed data');
    
    const allData = JSON.parse(jsonString);
    if (!Array.isArray(allData)) throw new Error('Invalid data format');

    let titleAdded = false;
    allData.forEach(item => {
      if (item.type === 'title' && !titleAdded) {
        addTitleModule(item);
        titleAdded = true;
      } else if (item.type === 'song') {
        addSongModule(item);
      }
    });

    if (!titleAdded) addTitleModule();
  } catch (e) {
    console.error('Error loading data:', e);
    addTitleModule();
    addSongModule();
  }
}

/* ========== ADD MODULES ========== */
function addSongModule(data = {}) {
  moduleCount++;
  const songModule = createSongModule(moduleCount, data);
  document.getElementById('songsContainer').appendChild(songModule);
  updateBeatIndicator(moduleCount);
  
  // Initialize tap data
  tapData[moduleCount] = { lastTapTime: 0 };
}

function addTitleModule(data) {
  const titleContainer = document.getElementById('titleContainer');
  if (!titleContainer) return;

  const titleElement = document.createElement('div');
  titleElement.className = 'title-module';

  const display = document.createElement('span');
  display.className = 'title-display';
  display.title = "Click to edit title";

  const input = document.createElement('input');
  input.className = 'title-input song-input';
  input.type = 'text';
  input.placeholder = 'Add Setlist Title';
  input.value = data?.title || '';

  function updateDisplay() {
    const val = input.value.trim();
    if (val) {
      display.innerHTML = '<ion-icon name="create-outline" class="edit-icon"></ion-icon> ' + val;
      input.style.display = 'none';
      display.style.display = 'block';
    } else {
      display.innerHTML = '';
      input.style.display = 'block';
      display.style.display = 'none';
    }
  }

  input.addEventListener('blur', updateDisplay);
  titleElement.addEventListener('click', () => {
    display.style.display = 'none';
    input.style.display = 'block';
    input.focus();
  });

  updateDisplay();
  titleElement.appendChild(display);
  titleElement.appendChild(input);
  titleContainer.appendChild(titleElement);
}

/* ========== PAGE INITIALIZATION ========== */
document.addEventListener('DOMContentLoaded', () => {
  // 1) Dark mode preference
  loadDarkModePreference();
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('change', () => {
    setDarkMode(darkModeToggle.checked);
  });

  // 2) Load modules from URL
  loadFromUrlParams();

  // 3) Setup top bar
  document.getElementById('refreshBtn').addEventListener('click', refreshPage);

  // 4) Bottom bar: +Add Song, Share
  document.getElementById('addSongBtn').addEventListener('click', () => {
    addSongModule();
  });
  
  document.getElementById('shareBtn').addEventListener('click', () => {
    const newUrl = buildUrlWithValues();
  
    // If the Web Share API is supported, open the native share sheet
    if (navigator.share) {
      navigator.share({
        title: 'Tempo Notes', 
        text: 'Check out my current tempo set!',
        url: newUrl
      }).catch(err => {
        console.log('Sharing canceled or failed', err);
      });
    } else {
      // Fallback if Web Share API not supported (copy to clipboard)
      navigator.clipboard.writeText(newUrl)
        .then(() => alert(`URL copied to clipboard:\n${newUrl}`))
        .catch(err => alert('Error copying URL: ' + err));
    }
  });
});