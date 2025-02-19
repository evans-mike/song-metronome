let moduleCount = 0;
const beatData = {}; // For intervals, beat counts
const tapData = {};  // For tap tempo

/* ========== DARK MODE TOGGLE ========== */
function setDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  localStorage.setItem('darkMode', isDark ? 'true' : 'false');
  // Update the checkbox state
  document.getElementById('darkModeToggle').checked = isDark;
}

function loadDarkModePreference() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') {
    setDarkMode(true);
  } else {
    setDarkMode(false);
  }
}

/* ========== REFRESH BUTTON ========== */
function refreshPage() {
  // Clear ?data= by reloading the page without query params
  const baseUrl = window.location.origin + window.location.pathname;
  window.location.href = baseUrl; // full reload
}

/* ========== CREATE TITLE MODULE ========== */
function createTitleModule(data) {
  const titleDiv = document.createElement('div');
  titleDiv.className = 'title-module';
  titleDiv.textContent = data.title || 'Setlist Name';

  // title Title container
  const titleTitleContainer = document.createElement('div');
  titleTitleContainer.className = 'title-title-container';

  // Display text
  const titleDisplay = document.createElement('span');
  titleDisplay.className = 'title-display';
  titleDisplay.title = "Click to edit title";

  // Input for editing the title
  const titleInput = document.createElement('input');
  titleInput.className = 'title-input song-input'; // Add song-input class to match the song-input style
  titleInput.type = 'text';
  titleInput.placeholder = 'Add Setlist Title';
  titleInput.value = data.title || '';

  // Sync display text
  function updateTitleDisplay() {
    const val = titleInput.value.trim();
    if (val) {
      titleDisplay.innerHTML = '<ion-icon name="create-outline" class="edit-icon"></ion-icon> ' + val;
    } else {
      titleDisplay.innerHTML = '';
    }
  }

  // On blur, if there's a value, show the display
  titleInput.addEventListener('blur', () => {
    updateTitleDisplay();
    const val = titleInput.value.trim();
    if (val) {
      titleInput.style.display = 'none';
      titleDisplay.style.display = 'block';
    } else {
      titleInput.style.display = 'block';
      titleDisplay.style.display = 'none';
    }
  });

  // Clicking anywhere in title-module => revert to input
  titleDiv.addEventListener('click', () => {
    titleDisplay.style.display = 'none';
    titleInput.style.display = 'block';
    titleInput.focus();
  });

  // Initialize display
  updateTitleDisplay();
  if (titleInput.value.trim()) {
    titleInput.style.display = 'none';
    titleDisplay.style.display = 'block';
  } else {
    titleInput.style.display = 'block';
    titleDisplay.style.display = 'none';
  }

  titleTitleContainer.appendChild(titleDisplay);
  titleTitleContainer.appendChild(titleInput);
  titleDiv.appendChild(titleTitleContainer); // Append titleTitleContainer to titleDiv
  document.getElementById('titleContainer').appendChild(titleDiv); // Append titleDiv to the titleContainer
}

/* ========== CREATE SONG MODULE ========== */
function createSongModule(index, data = {}) {
  const container = document.createElement('div');
  container.className = 'song-module';
  container.dataset.index = index;
  container.draggable = true;

  // Prevent dragging when interacting with controls
  const preventDrag = (e) => {
    const target = e.target;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'SELECT' || 
      target.tagName === 'BUTTON' ||
      target.closest('.beat-indicator')
    ) {
      container.draggable = false;
      // Re-enable dragging after the interaction
      setTimeout(() => {
        container.draggable = true;
      }, 100);
    }
  };

  // Add mousedown listener to handle draggable state
  container.addEventListener('mousedown', preventDrag);
  container.addEventListener('touchstart', preventDrag);

  // Song Title container
  const songTitleContainer = document.createElement('div');
  songTitleContainer.className = 'song-title-container';

  // Display text
  const songDisplay = document.createElement('span');
  songDisplay.className = 'song-display';
  songDisplay.title = "Click to edit title";

  // Input for editing the title
  const songInput = document.createElement('input');
  songInput.className = 'song-input';
  songInput.type = 'text';
  songInput.placeholder = 'Add Song Title';
  songInput.value = data.song || '';

  // Sync display text
  function updateSongDisplay() {
    const val = songInput.value.trim();
    if (val) {
      songDisplay.innerHTML = '<ion-icon name="create-outline" class="edit-icon"></ion-icon> ' + val;
    } else {
      songDisplay.innerHTML = '';
    }
  }

  // On blur, if there's a value, show the display
  songInput.addEventListener('blur', () => {
    updateSongDisplay();
    const val = songInput.value.trim();
    if (val) {
      songInput.style.display = 'none';
      songDisplay.style.display = 'block';
    } else {
      songInput.style.display = 'block';
      songDisplay.style.display = 'none';
    }
  });

  // Clicking display => revert to input
  songDisplay.addEventListener('click', () => {
    songDisplay.style.display = 'none';
    songInput.style.display = 'block';
    songInput.focus();
  });

  // Initialize display
  updateSongDisplay();
  if (songInput.value.trim()) {
    songInput.style.display = 'none';
    songDisplay.style.display = 'block';
  }

  songTitleContainer.appendChild(songDisplay);
  songTitleContainer.appendChild(songInput);

  // BPM <select> (30..300, default 68 if no data)
  const bpmSelect = document.createElement('select');
  bpmSelect.className = 'bpm-select';
  for (let i = 30; i <= 300; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    if (data.bpm ? (i === +data.bpm) : (i === 68)) {
      opt.selected = true;
    }
    bpmSelect.appendChild(opt);
  }

  // Tap Tempo button
  const tapTempoBtn = document.createElement('button');
  tapTempoBtn.className = 'tap-tempo-btn';
  tapTempoBtn.type = 'button';
  tapTempoBtn.textContent = 'Tap';

  // TimeSig <select>
  const timesigSelect = document.createElement('select');
  timesigSelect.className = 'timesig-select';
  const timesigOptions = ['2/2','3/4','4/4','6/8','9/8','12/8'];
  timesigOptions.forEach(ts => {
    const opt = document.createElement('option');
    opt.value = ts;
    opt.textContent = ts;
    if (data.timeSig) {
      if (ts === data.timeSig) opt.selected = true;
    } else {
      if (ts === '4/4') opt.selected = true;
    }
    timesigSelect.appendChild(opt);
  });

  // Beat indicator
  const beatIndicator = document.createElement('div');
  beatIndicator.className = 'beat-indicator';

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-song-btn';
  removeBtn.title = "Remove this song";
  removeBtn.innerHTML = '<ion-icon name="trash-outline"></ion-icon>';

  // Add mousedown listener to handle draggable state
  container.addEventListener('mousedown', preventDrag);
  container.addEventListener('touchstart', preventDrag);

  // Handle drag events
  container.addEventListener('dragstart', (e) => {
    draggedElement = container;
    container.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
  });

  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('drop', handleDrop);
  
  container.addEventListener('dragend', (e) => {
    container.style.opacity = '1';
    
    // Update the song modules' indices
    const songModules = document.querySelectorAll('.song-module');
    songModules.forEach((module, index) => {
      module.dataset.index = index + 1;
      updateBeatIndicator(index + 1);
    });
  });

  // Append all elements
  container.appendChild(songTitleContainer);
  container.appendChild(bpmSelect);
  container.appendChild(tapTempoBtn);
  container.appendChild(timesigSelect);
  container.appendChild(beatIndicator);
  container.appendChild(removeBtn);


  // Tap data
  tapData[index] = { lastTapTime: 0 };

  // Remove logic with confirmation
  removeBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to remove this song?")) {
      if (beatData[index] && beatData[index].intervalId) {
        clearInterval(beatData[index].intervalId);
        delete beatData[index];
      }
      delete tapData[index];
      container.remove();
    }
  });

  // BPM & TimeSig -> update beat indicator
  bpmSelect.addEventListener('change', () => updateBeatIndicator(index));
  timesigSelect.addEventListener('change', () => updateBeatIndicator(index));

  // Tap Tempo
  tapTempoBtn.addEventListener('click', () => handleTapTempo(index));

  return container;
}

let draggedElement = null;

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

// Update handleDrop function
function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  
  // Update the song modules' indices
  const songModules = document.querySelectorAll('.song-module');
  songModules.forEach((module, index) => {
    module.dataset.index = index + 1;
    updateBeatIndicator(index + 1);
  });
}

/* Tap Tempo: time between last two taps => BPM */
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

    // clamp BPM to 30..300
    const clampedBpm = Math.max(30, Math.min(newBpm, 300));
    bpmSelect.value = clampedBpm;
    updateBeatIndicator(index);
  }
  tapData[index].lastTapTime = now;
}

/* Set up or reset the beat indicator */
function updateBeatIndicator(index) {
  const moduleEl = document.querySelector(`.song-module[data-index="${index}"]`);
  if (!moduleEl) return;
  const bpmSelect = moduleEl.querySelector('.bpm-select');
  const timesigSelect = moduleEl.querySelector('.timesig-select');
  const beatIndicator = moduleEl.querySelector('.beat-indicator');

  if (beatData[index] && beatData[index].intervalId) {
    clearInterval(beatData[index].intervalId);
  }
  beatData[index] = { intervalId: null, beatCount: 0 };

  const bpm = Number(bpmSelect.value);
  if (!bpm || bpm <= 0) {
    beatIndicator.innerHTML = '';
    return;
  }
  const topNumber = parseInt(timesigSelect.value.split('/')[0], 10);

  let beatHTML = '';
  for (let i = 1; i <= topNumber; i++) {
    beatHTML += `<span data-beat="${i}">${i}</span> `;
  }
  beatIndicator.innerHTML = beatHTML;

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

/* Build compressed URL */
function buildUrlWithValues() {
  const modules = document.querySelectorAll('.song-module, .title-module');
  const allData = [];
  modules.forEach((module) => {
    if (module.classList.contains('song-module')) {
      const songVal = module.querySelector('.song-input').value;
      const bpmVal = module.querySelector('.bpm-select').value;
      const timeSigVal = module.querySelector('.timesig-select').value;
      allData.push({ type: 'song', song: songVal, bpm: bpmVal, timeSig: timeSigVal });
    } else if (module.classList.contains('title-module')) {
      const titleVal = module.querySelector('.title-input').value;
      allData.push({ type: 'title', title: titleVal });
    }
  });
  const jsonString = JSON.stringify(allData);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  return window.location.origin + window.location.pathname + '?data=' + compressed;
}

/* Load from URL or create a default module */
function loadFromUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const compressedData = params.get('data');

  if (!compressedData) {
    addTitleModule(); // Add title module if no data is found
    addSongModule();  // Add a default song module
    return;
  }

  const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);
  if (!jsonString) {
    addTitleModule(); // Add title module if decompression fails
    addSongModule();  // Add a default song module
    return;
  }

  let allData;
  try {
    allData = JSON.parse(jsonString);
  } catch (e) {
    addTitleModule(); // Add title module if JSON parsing fails
    addSongModule();  // Add a default song module
    return;
  }

  let titleAdded = false;
  if (Array.isArray(allData) && allData.length > 0) {
    allData.forEach((item) => {
      if (item.type === 'title') {
        if (!titleAdded) {
          addTitleModule(item); // Add title module only once
          titleAdded = true;
        }
      } else {
        addSongModule(item);
      }
    });
  }

  if (!titleAdded) {
    addTitleModule(); // Ensure title module is added if not present in data
  }
}

/* Add a new module & update its indicator */
function addSongModule(data = {}) {
  moduleCount++;
  const songModule = createSongModule(moduleCount, data);
  document.getElementById('songsContainer').appendChild(songModule);
  updateBeatIndicator(moduleCount);
}

/* Add title module */
function addTitleModule(data) {
  console.log('addTitleModule called with data:', data);
  const titleContainer = document.getElementById('titleContainer');
  if (titleContainer) {
    const titleElement = document.createElement('div');
    titleElement.className = 'title-module';

    // Display text
    const titleDisplay = document.createElement('span');
    titleDisplay.className = 'title-display';
    titleDisplay.title = "Click to edit title";
    titleDisplay.innerHTML = data && data.title ? '<ion-icon name="create-outline" class="edit-icon"></ion-icon> ' + data.title : 'Setlist Name';

    // Input for editing the title
    const titleInput = document.createElement('input');
    titleInput.className = 'title-input song-input'; // Add song-input class to match the song-input style
    titleInput.type = 'text';
    titleInput.placeholder = 'Add Setlist Title';
    titleInput.value = data && data.title ? data.title : '';

    // Sync display text
    function updateTitleDisplay() {
      const val = titleInput.value.trim();
      if (val) {
        titleDisplay.innerHTML = '<ion-icon name="create-outline" class="edit-icon"></ion-icon> ' + val;
      } else {
        titleDisplay.innerHTML = '';
      }
    }

    // On blur, if there's a value, show the display
    titleInput.addEventListener('blur', () => {
      updateTitleDisplay();
      const val = titleInput.value.trim();
      if (val) {
        titleInput.style.display = 'none';
        titleDisplay.style.display = 'block';
      } else {
        titleInput.style.display = 'block';
        titleDisplay.style.display = 'none';
      }
    });

    // Clicking anywhere in title-module => revert to input
    titleElement.addEventListener('click', () => {
      titleDisplay.style.display = 'none';
      titleInput.style.display = 'block';
      titleInput.focus();
    });

    // Initialize display
    updateTitleDisplay();
    if (titleInput.value.trim()) {
      titleInput.style.display = 'none';
      titleDisplay.style.display = 'block';
    } else {
      titleInput.style.display = 'block';
      titleDisplay.style.display = 'none';
    }

    titleElement.appendChild(titleDisplay);
    titleElement.appendChild(titleInput);
    titleContainer.appendChild(titleElement);
    console.log('Title module added:', titleElement);
  } else {
    console.error('Title container not found');
  }
}

/* Refresh: clear ?data= and reload */
function refreshPage() {
  const baseUrl = window.location.origin + window.location.pathname;
  window.location.href = baseUrl; // full reload
}

/* On page load */
document.addEventListener('DOMContentLoaded', () => {
  // 1) Dark mode preference
  loadDarkModePreference();
  // Toggle with the switch
  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('change', () => {
    setDarkMode(darkModeToggle.checked);
  });

  // 2) Load modules from URL
  loadFromUrlParams();

  // 3) Setup top bar
  document.getElementById('refreshBtn').addEventListener('click', refreshPage);

  // 4) Bottom bar: +Add Song, Copy URL
  document.getElementById('addSongBtn').addEventListener('click', () => {
    addSongModule();
  });
  document.getElementById('shareBtn').addEventListener('click', () => {
    const newUrl = buildUrlWithValues(); // your existing function
  
    // If the Web Share API is supported, open the native share sheet:
    if (navigator.share) {
      navigator.share({
        title: 'Tempo Notes', 
        text: 'Check out my current tempo set!',
        url: newUrl
      }).catch(err => {
        console.log('Sharing canceled or failed', err);
      });
    } else {
      // Fallback if Web Share API not supported (e.g., copy to clipboard)
      navigator.clipboard.writeText(newUrl)
        .then(() => alert(`URL copied to clipboard:\n${newUrl}`))
        .catch(err => alert('Error copying URL: ' + err));
    }
  });  
});
