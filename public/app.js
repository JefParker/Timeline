// UUID generation
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Game State

let gameState = {
    userId: localStorage.getItem('timeline_user_id') || generateUUID(),
    displayName: localStorage.getItem('timeline_display_name') || '',
    todayDate: '',
    puzzle: null,
    remainingEvents: [],
    placedCards: [],
    score: 0,
    startTime: 0,
    endTime: 0,
    savedTimeMs: 0,
    isGameOver: false,
    soundsEnabled: localStorage.getItem('timeline_sounds_enabled') === 'true',
    musicEnabled: localStorage.getItem('timeline_music_enabled') === 'true',
    musicVolume: localStorage.getItem('timeline_music_volume') ? parseFloat(localStorage.getItem('timeline_music_volume')) : 0.25
};

if (!localStorage.getItem('timeline_user_id')) {
    localStorage.setItem('timeline_user_id', gameState.userId);
}

// Initialize Theme
function saveGameState() {
    if (gameState.isGameOver || (!gameState.startTime && gameState.placedCards.length <= 1 && !gameState.savedTimeMs)) return;
    
    let currentElapsed = gameState.savedTimeMs || 0;
    if (gameState.startTime) {
        currentElapsed += (Date.now() - gameState.startTime);
    }
    
    const eventsToSave = [...gameState.remainingEvents];
    if (gameState.activeEvent) {
        eventsToSave.unshift(gameState.activeEvent);
    }
    
    const saveData = {
        date: gameState.todayDate,
        placedCards: gameState.placedCards,
        remainingEvents: eventsToSave,
        score: gameState.score,
        savedTimeMs: currentElapsed
    };
    localStorage.setItem('timeline_autosave', JSON.stringify(saveData));
}

window.addEventListener('beforeunload', saveGameState);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveGameState();
});

// Initialize Theme
function updateThemeColorMeta(theme) {
    const metaTag = document.getElementById('theme-color-meta');
    if (!metaTag) return;
    switch(theme) {
        case 'theme-elegant-dark':
            metaTag.setAttribute('content', '#1a1512');
            break;
        case 'theme-elegant-light':
            metaTag.setAttribute('content', '#fdfbf7');
            break;
        case 'theme-steampunk':
            metaTag.setAttribute('content', '#1c1614');
            break;
        case 'theme-new-yorker':
            metaTag.setAttribute('content', '#171b26');
            break;
        default:
            metaTag.setAttribute('content', '#0f0f11');
            break;
    }
}

const savedTheme = localStorage.getItem('timeline_theme') || 'default';
if (savedTheme !== 'default') {
    document.body.classList.add(savedTheme);
}
updateThemeColorMeta(savedTheme);

// Sound Manager
const sounds = {
    'default': {
        drop: new Audio('/sounds/default_drop.mp3'),
        confirm: new Audio('/sounds/default_confirm.mp3'),
        complete: new Audio('/sounds/default_complete.mp3')
    },
    'theme-elegant-dark': {
        drop: new Audio('/sounds/elegant_drop.mp3'),
        confirm: new Audio('/sounds/elegant_confirm.mp3'),
        complete: new Audio('/sounds/elegant_complete.mp3')
    },
    'theme-elegant-light': {
        drop: new Audio('/sounds/elegant_drop.mp3'),
        confirm: new Audio('/sounds/elegant_confirm.mp3'),
        complete: new Audio('/sounds/elegant_complete.mp3')
    },
    'theme-steampunk': {
        drop: new Audio('/sounds/steampunk_drop.mp3'),
        confirm: new Audio('/sounds/steampunk_confirm.mp3'),
        complete: new Audio('/sounds/steampunk_complete.mp3')
    }
};

function playSound(type) {
    if (!gameState.soundsEnabled) return;
    const currentTheme = localStorage.getItem('timeline_theme') || 'default';
    const themeSounds = sounds[currentTheme] || sounds['default'];
    if (themeSounds[type]) {
        // Clone the audio node so sounds can overlap if played quickly
        const audioNode = themeSounds[type].cloneNode();
        audioNode.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Music Manager
const musicTracks = {
    'default': new Audio('/music/Glass_Dark.mp3'),
    'theme-elegant-dark': new Audio('/music/Elegant_Dark.mp3'),
    'theme-elegant-light': new Audio('/music/Elegant_Light.mp3'),
    'theme-steampunk': new Audio('/music/Steampunk.mp3')
};

Object.values(musicTracks).forEach(audio => {
    audio.loop = true;
    audio.volume = gameState.musicVolume;
});

let currentMusic = null;

function playMusic() {
    if (!gameState.musicEnabled) return;
    const currentTheme = localStorage.getItem('timeline_theme') || 'default';
    const track = musicTracks[currentTheme] || musicTracks['default'];
    
    if (currentMusic && currentMusic !== track) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    currentMusic = track;
    currentMusic.volume = gameState.musicVolume;
    currentMusic.play().catch(e => console.log('Music play failed:', e));
}

function stopMusic() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
}

// Elements
const logoEl = document.getElementById('logo');
const categoryNameEl = document.getElementById('category-name');
const timelineCardsEl = document.getElementById('timeline-cards');
const activeCardContainer = document.getElementById('active-card-container');
const confirmContainer = document.getElementById('confirm-container');
const confirmBtn = document.getElementById('confirm-btn');
const eventCurrentEl = document.getElementById('event-current');
const endModal = document.getElementById('end-modal');
const nameModal = document.getElementById('name-modal');
const settingsModal = document.getElementById('settings-modal');
const aboutModal = document.getElementById('about-modal');
const overlay = document.getElementById('modal-overlay');

// 1. Logo Animation
function animateLogo() {
    logoEl.innerHTML = '';
    const text = "TIMELINE";
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char;
        span.style.animation = `slideLetters 0.5s ease forwards ${i * 0.05}s`;
        logoEl.appendChild(span);
    });
}

// Online/Offline status banner controller
function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const banner = document.getElementById('offline-banner');
    const bannerText = document.getElementById('offline-banner-text');
    const bannerIcon = banner?.querySelector('.offline-banner-icon');

    if (!banner) return;

    if (!isOnline) {
        banner.classList.remove('hidden', 'online-restored');
        if (bannerText) bannerText.textContent = "Offline Mode — Progress & scores saved locally";
        if (bannerIcon) bannerIcon.textContent = "⚡";
    } else {
        if (!banner.classList.contains('hidden') && !banner.classList.contains('online-restored')) {
            banner.classList.add('online-restored');
            if (bannerText) bannerText.textContent = "Back Online — Syncing scores...";
            if (bannerIcon) bannerIcon.textContent = "🟢";
            setTimeout(() => {
                banner.classList.add('hidden');
                banner.classList.remove('online-restored');
            }, 3000);
        } else {
            banner.classList.add('hidden');
        }
    }
}

window.addEventListener('online', () => {
    updateOnlineStatus();
    syncOfflineQueue();
});

window.addEventListener('offline', () => {
    updateOnlineStatus();
});

// 2. Fetch & Cache Puzzles (Network -> localStorage -> static precached /puzzles.json)
async function loadPuzzles() {
    // Tier 1: Try API network fetch first
    try {
        const res = await fetch('/api/puzzles?t=' + Date.now());
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                localStorage.setItem('timeline_puzzles', JSON.stringify(data));
                gameState.puzzles = data;
                return;
            }
        }
    } catch (e) {
        console.warn("API puzzle fetch unavailable, attempting local cache fallbacks");
    }

    // Tier 2: Read from localStorage cache
    const cached = localStorage.getItem('timeline_puzzles');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                gameState.puzzles = parsed;
                return;
            }
        } catch (e) {
            console.error("Failed to parse cached puzzles", e);
        }
    }

    // Tier 3: Fetch static precached puzzles.json file
    try {
        const res = await fetch('/puzzles.json');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                localStorage.setItem('timeline_puzzles', JSON.stringify(data));
                gameState.puzzles = data;
                console.log("Loaded static fallback puzzles.json successfully");
                return;
            }
        }
    } catch (e) {
        console.error("Static puzzles.json fallback fetch failed", e);
    }

    console.error("Offline and no cached puzzles available");
}

// Get LA Date
function getLADateStr() {
    const laTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const d = new Date(laTime);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function animateLogoElement(elementId, baseDelay = 0) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = 'TIMELINE';
    el.innerHTML = '';
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char;
        el.appendChild(span);
        
        // Trigger reflow
        void span.offsetWidth;
        
        setTimeout(() => {
            span.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s';
            span.style.transform = 'translateX(0)';
            span.style.opacity = '1';
        }, (baseDelay * 1000) + (i * 100) + 50); // Add 50ms buffer for DOM insert
    });
}

// 3. Initialize Game
async function syncUserData() {
    if (!navigator.onLine) return;
    try {
        const res = await fetch(`/api/user?user_id=${gameState.userId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.display_name && data.display_name !== gameState.displayName) {
                gameState.displayName = data.display_name;
                localStorage.setItem('timeline_display_name', data.display_name);
                document.getElementById('name-input').value = data.display_name;
                document.getElementById('settings-name-input').value = data.display_name;
            }
            if (data.history && data.history.length > 0) {
                const history = JSON.parse(localStorage.getItem('timeline_history') || '{}');
                let updated = false;
                data.history.forEach(row => {
                    if (!history[row.puzzle_date] || history[row.puzzle_date].score < row.score) {
                        let parsedCards = history[row.puzzle_date]?.placedCards || [];
                        if (row.placed_cards) {
                            try {
                                parsedCards = JSON.parse(row.placed_cards);
                            } catch (e) {
                                console.error("Failed to parse placed_cards", e);
                            }
                        }
                        
                        history[row.puzzle_date] = {
                            score: row.score,
                            timeMs: row.time_ms,
                            category: row.category,
                            synced: true,
                            placedCards: parsedCards
                        };
                        updated = true;
                    }
                });
                if (updated) {
                    localStorage.setItem('timeline_history', JSON.stringify(history));
                }
            }
        }
    } catch(e) {
        console.error("Sync error:", e);
    }
}

function updateReleaseTimeText() {
    const now = new Date();
    const ptStr = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const ptDate = new Date(ptStr);
    
    const nextMidnightPT = new Date(ptDate);
    nextMidnightPT.setHours(24, 0, 0, 0);
    const diff = nextMidnightPT - ptDate;
    
    const resetTime = new Date(now.getTime() + diff);
    const localTimeStr = resetTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    const releaseTextEl = document.getElementById('release-time-info');
    if (releaseTextEl) {
        if (localTimeStr === '12:00 AM' || localTimeStr === '0:00' || localTimeStr === '00:00' || localTimeStr === '24:00') {
            releaseTextEl.textContent = "(Los Angeles time)";
        } else {
            releaseTextEl.textContent = `(Los Angeles time; ${localTimeStr} your time)`;
        }
    }
}

function showNextPuzzleScreen() {
    const futurePuzzles = gameState.puzzles.filter(p => p.date > gameState.todayDate).sort((a, b) => a.date.localeCompare(b.date));
    const nextPuzzle = futurePuzzles.length > 0 ? futurePuzzles[0] : null;
    
    const categoryEl = document.getElementById('category-name');
    const labelEl = document.querySelector('.category-label');
    const deckCounterEl = document.querySelector('.deck-counter');
    
    if (deckCounterEl) deckCounterEl.style.display = 'none';
    if (labelEl) labelEl.textContent = "Tomorrow's Category";
    
    if (nextPuzzle) {
        categoryEl.innerHTML = `${nextPuzzle.category}<br><span id="next-countdown" style="font-size: 1rem; font-style: normal;"></span>`;
        
        setInterval(() => {
            const now = new Date();
            const ptStr = now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
            const ptDate = new Date(ptStr);
            const nextMidnightPT = new Date(ptDate);
            nextMidnightPT.setHours(24, 0, 0, 0);
            const diff = nextMidnightPT - ptDate;
            
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            const el = document.getElementById('next-countdown');
            if (el) {
                el.textContent = `Available in ${h}h ${m}m ${s}s`;
            }
        }, 1000);
    } else {
        categoryEl.textContent = "You've played today's puzzle!";
    }
}

async function initGame() {
    updateOnlineStatus();
    animateLogoElement('logo');
    await loadPuzzles();
    syncOfflineQueue();
    await syncUserData();
    
    updateReleaseTimeText();
    
    gameState.todayDate = getLADateStr();
    
    // Find today's puzzle
    const puzzle = gameState.puzzles.find(p => p.date === gameState.todayDate);
    if (!puzzle || puzzle.events.length < 7) {
        // Fallback if missing
        categoryNameEl.textContent = "Error Loading Puzzle";
        return;
    }
    
    // Check if already played today
    const history = JSON.parse(localStorage.getItem('timeline_history') || '{}');
    if (history[gameState.todayDate]) {
        // Game already played today
        gameState.isGameOver = true;
        gameState.placedCards = history[gameState.todayDate].placedCards || [];
        
        // Fallback for games finished before placedCards saving was added
        if (gameState.placedCards.length === 0 && puzzle) {
            gameState.placedCards = [...puzzle.events].sort((a, b) => a.year - b.year);
        }
        
        // Find next puzzle
        showNextPuzzleScreen();
        
        activeCardContainer.classList.add('game-over');
        const category = puzzle.category;
        const btnText = category.split(' ').length > 2 ? 'Review Results' : `View ${category} Results`;
        activeCardContainer.innerHTML = `
            <div style="display: flex; justify-content: center; width: 100%;">
                <button id="reopen-results-btn" class="primary-btn outline">${btnText}</button>
            </div>
        `;
        document.getElementById('reopen-results-btn')?.addEventListener('click', () => {
            showLeaderboard(history[gameState.todayDate]);
        });
        
        if (gameState.placedCards.length > 0) {
            renderTimeline();
        }
        
        return;
    }

    const autosaveStr = localStorage.getItem('timeline_autosave');
    let loadedAutosave = null;
    if (autosaveStr) {
        try {
            const save = JSON.parse(autosaveStr);
            if (save.date === gameState.todayDate && save.placedCards && save.placedCards.length > 0) {
                loadedAutosave = save;
            }
        } catch(e){}
    }

    if (loadedAutosave) {
        gameState.puzzle = puzzle;
        gameState.remainingEvents = loadedAutosave.remainingEvents;
        gameState.placedCards = loadedAutosave.placedCards;
        gameState.score = loadedAutosave.score;
        gameState.savedTimeMs = loadedAutosave.savedTimeMs || 0;
        
        categoryNameEl.textContent = puzzle.category;
        gameState.startTime = null; // Paused
        
        if (window.liveTimerInterval) clearInterval(window.liveTimerInterval);
        const liveEl = document.getElementById('live-timer');
        if (liveEl) liveEl.textContent = (gameState.savedTimeMs / 1000).toFixed(1) + 's';
        
        renderTimeline();
        nextEvent();
        return;
    }

    gameState.puzzle = puzzle;
    gameState.remainingEvents = [...puzzle.events];
    gameState.placedCards = [];
    gameState.score = 1; // You get the first one for free!
    
    categoryNameEl.textContent = puzzle.category;
    
    // Place first card automatically
    const firstEvent = gameState.remainingEvents.shift();
    gameState.placedCards.push(firstEvent);
    
    gameState.startTime = null;
    
    if (window.liveTimerInterval) clearInterval(window.liveTimerInterval);
    const liveEl = document.getElementById('live-timer');
    if (liveEl) liveEl.textContent = '0.0s';
    
    renderTimeline();
    nextEvent();
}

// 4. Render Timeline
let dropIndex = 0; // Where the user is intending to place the card

function renderTimeline() {
    // Rescue confirm container so it isn't destroyed
    if (confirmContainer.parentElement !== document.body) {
        document.body.appendChild(confirmContainer);
    }
    
    timelineCardsEl.innerHTML = '';
    
    // Render top drop target
    if (!gameState.isGameOver) {
        timelineCardsEl.appendChild(createDropTarget(0));
    }
    
    gameState.placedCards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'timeline-card';
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${card.event}</div>
                <div class="card-back ${card.wasWrong ? 'wrong-permanent' : ''}">
                    <div class="year">${card.year}</div>
                    <div class="event-text">${card.event}</div>
                </div>
            </div>
        `;
        // Already flipped because it's placed
        cardEl.classList.add('flipped');
        
        timelineCardsEl.appendChild(cardEl);
        
        if (!gameState.isGameOver) {
            timelineCardsEl.appendChild(createDropTarget(index + 1));
        }
    });
}

function createDropTarget(index) {
    const drop = document.createElement('div');
    drop.className = 'drop-target';
    drop.dataset.index = index;
    
    drop.addEventListener('click', () => {
        // Optional click-to-select for accessibility (ignoring for now as drag is primary)
    });
    return drop;
}

// 5. Next Event & Drag Logic
let isDragging = false;
let startY = 0;
let currentActiveElement = null;
let dragScrollInterval = null;
let lastClientY = 0;
const timelineArea = document.querySelector('.timeline-area');

function updateDropTarget(clientY) {
    const targets = Array.from(document.querySelectorAll('.drop-target'));
    if (!targets.length) return;
    
    let closest = targets[0];
    let minDiff = Infinity;
    
    targets.forEach(t => {
        const rect = t.getBoundingClientRect();
        const diff = Math.abs(clientY - (rect.top + rect.height/2));
        if (diff < minDiff) {
            minDiff = diff;
            closest = t;
        }
    });
    
    targets.forEach(t => t.classList.remove('active-hover'));
    if (minDiff < 80) {
        closest.classList.add('active-hover');
        dropIndex = parseInt(closest.dataset.index);
    } else {
        dropIndex = -1;
    }
}

function nextEvent() {
    if (gameState.remainingEvents.length === 0) {
        endGame();
        return;
    }
    
    gameState.activeEvent = gameState.remainingEvents.shift();
    eventCurrentEl.textContent = 7 - gameState.remainingEvents.length;
    
    activeCardContainer.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'active-card';
    el.textContent = gameState.activeEvent.event;
    
    // Drag logic (Touch/Mouse)
    el.addEventListener('pointerdown', e => {
        if (!gameState.startTime) {
            gameState.startTime = Date.now();
            playMusic();
            if (window.liveTimerInterval) clearInterval(window.liveTimerInterval);
            window.liveTimerInterval = setInterval(() => {
                const liveEl = document.getElementById('live-timer');
                if (liveEl && !gameState.isGameOver) {
                    const msElapsed = (Date.now() - gameState.startTime) + (gameState.savedTimeMs || 0);
                    liveEl.textContent = (msElapsed / 1000).toFixed(1) + 's';
                }
            }, 100);
        }
        
        isDragging = true;
        startY = e.clientY;
        el.classList.add('dragging');
        
        // Hide confirm if we pick it up again
        confirmContainer.classList.add('hidden');

        // If picking up from a drop target, reset the drop target
        if (el.parentElement.classList.contains('drop-target')) {
            el.parentElement.classList.remove('has-card');
        }

        const rect = el.getBoundingClientRect();

        // Enforce fixed horizontal alignment
        el.style.left = '0';
        el.style.right = '0';
        el.style.margin = '0 auto';
        el.style.top = `${rect.top}px`;
        el.style.width = `${rect.width}px`;

        document.body.appendChild(el); // Move to body to drag over everything
        currentActiveElement = el;
    });
    
    activeCardContainer.appendChild(el);
    confirmBtn.disabled = false; // Always enabled when it shows
    
    document.querySelectorAll('.drop-target').forEach(d => {
        d.classList.remove('active-hover');
        d.classList.remove('has-card');
    });
}

document.addEventListener('pointermove', e => {
    if (!isDragging || !currentActiveElement) return;
    
    let clampedY = e.clientY;
    // Don't let it go below the lowest drop target
    const dropTargets = document.querySelectorAll('.drop-target');
    if (dropTargets.length > 0) {
        const lastTarget = dropTargets[dropTargets.length - 1];
        const lastRect = lastTarget.getBoundingClientRect();
        const lowestAllowedCenterY = lastRect.top + (lastRect.height / 2);
        if (clampedY > lowestAllowedCenterY) {
            clampedY = lowestAllowedCenterY;
        }
    }
    
    lastClientY = clampedY;
    
    currentActiveElement.style.top = `${clampedY - 50}px`;
    
    updateDropTarget(clampedY);
    
    // Auto-scroll logic
    const scrollThreshold = 100; // pixels from top/bottom to trigger scroll
    let targetScrollDirection = 0;
    
    if (e.clientY < scrollThreshold) {
        targetScrollDirection = -1;
    } else if (e.clientY > window.innerHeight - scrollThreshold) {
        targetScrollDirection = 1;
    }
    
    // Only update interval if direction changed
    if (window.currentScrollDirection !== targetScrollDirection) {
        window.currentScrollDirection = targetScrollDirection;
        if (dragScrollInterval) {
            clearInterval(dragScrollInterval);
            dragScrollInterval = null;
        }
        if (targetScrollDirection !== 0) {
            dragScrollInterval = setInterval(() => {
                window.scrollBy(0, targetScrollDirection * 3);
                updateDropTarget(lastClientY);
            }, 16);
        }
    }
});

document.addEventListener('pointerup', e => {
    if (!isDragging || !currentActiveElement) return;
    
    if (dragScrollInterval) {
        clearInterval(dragScrollInterval);
        dragScrollInterval = null;
    }
    
    isDragging = false;
    currentActiveElement.classList.remove('dragging');
    
    currentActiveElement.style.position = 'relative';
    currentActiveElement.style.top = '0';
    currentActiveElement.style.left = '0';
    currentActiveElement.style.width = '';

    if (dropIndex !== -1) {
        // Snap into drop target
        const target = document.querySelector(`.drop-target[data-index="${dropIndex}"]`);
        target.classList.remove('active-hover');
        target.classList.add('has-card');
        target.appendChild(currentActiveElement);
        
        playSound('drop');
        
        target.appendChild(confirmContainer);
        
        // Show confirm button
        confirmContainer.classList.remove('hidden');
        setTimeout(() => confirmContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } else {
        // Move back to top container
        activeCardContainer.appendChild(currentActiveElement);
    }
    
    currentActiveElement = null;
});

// 6. Confirm Placement & Validation
confirmBtn.addEventListener('click', async () => {
    // Hide confirm button
    confirmContainer.classList.add('hidden');
    
    playSound('confirm');
    
    const event = gameState.activeEvent;
    
    // Determine correctness
    const placed = gameState.placedCards;
    let correct = true;
    
    // Check if the year fits at dropIndex
    if (dropIndex > 0 && placed[dropIndex - 1].year > event.year) correct = false;
    if (dropIndex < placed.length && placed[dropIndex].year < event.year) correct = false;
    
    if (correct) {
        gameState.score++;
    } else {
        event.wasWrong = true;
    }
    
    // Animate Card Flip and Move
    const activeEl = activeCardContainer.querySelector('.active-card');
    
    // Create actual timeline card structure for the animation
    const cardEl = document.createElement('div');
    cardEl.className = 'timeline-card';
    cardEl.innerHTML = `
        <div class="card-inner">
            <div class="card-front ${correct ? 'correct' : 'incorrect'}">${event.event}</div>
            <div class="card-back ${correct ? 'correct-year' : 'incorrect-year'}">
                <div class="year">${event.year}</div>
                <div class="event-text">${event.event}</div>
            </div>
        </div>
    `;
    
    // Replace active target with the new card temporarily
    const target = document.querySelector(`.drop-target[data-index="${dropIndex}"]`);
    if(target) {
        target.innerHTML = '';
        target.appendChild(cardEl);
    }
    
    // Flip to show year
    setTimeout(() => cardEl.classList.add('flipped'), 50);
    
    await new Promise(r => setTimeout(r, 1800));
    
    // Flip back
    cardEl.classList.remove('flipped');
    await new Promise(r => setTimeout(r, 600));
    
    // Find correct index
    let correctIndex = 0;
    while (correctIndex < placed.length && placed[correctIndex].year < event.year) {
        correctIndex++;
    }
    
    // Add to placed arrays and re-render timeline
    gameState.placedCards.splice(correctIndex, 0, event);
    renderTimeline();
    
    nextEvent();
    
    // Scroll back to the top to see the newly generated card or end game results
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 7. End Game
async function endGame() {
    gameState.isGameOver = true;
    renderTimeline(); // re-render to remove drop targets
    
    stopMusic();
    playSound('complete');
    
    gameState.endTime = Date.now();
    if (window.liveTimerInterval) clearInterval(window.liveTimerInterval);
    const timeMs = (gameState.endTime - gameState.startTime) + (gameState.savedTimeMs || 0);
    
    localStorage.removeItem('timeline_autosave');
    
    // Save history locally
    const history = JSON.parse(localStorage.getItem('timeline_history') || '{}');
    const result = { 
        score: gameState.score, 
        timeMs, 
        category: gameState.puzzle.category,
        placedCards: gameState.placedCards
    };
    history[gameState.todayDate] = result;
    localStorage.setItem('timeline_history', JSON.stringify(history));
    
    // Confetti
    if (gameState.score > 4) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    
    // Show a View Results button in the active card area
    const category = gameState.puzzle.category;
    const btnText = category.split(' ').length > 2 ? 'Review Results' : `View ${category} Results`;
    activeCardContainer.classList.add('game-over');
    activeCardContainer.innerHTML = `
        <div style="display: flex; justify-content: center; width: 100%;">
            <button id="reopen-results-btn-end" class="primary-btn outline">${btnText}</button>
        </div>
    `;
    document.getElementById('reopen-results-btn-end')?.addEventListener('click', () => {
        showLeaderboard(result);
    });
    
    showNextPuzzleScreen();
    
    await submitScore(result);
    
    // Delay popup to allow fireworks to be seen
    if (gameState.score > 4) {
        setTimeout(() => {
            showLeaderboard(result);
        }, 2500);
    } else {
        showLeaderboard(result);
    }
}

// 8. Leaderboard & Backend
function getOfflineQueue() {
    return JSON.parse(localStorage.getItem('timeline_offline_results') || '[]');
}

function saveToOfflineQueue(payload) {
    const queue = getOfflineQueue();
    queue.push(payload);
    localStorage.setItem('timeline_offline_results', JSON.stringify(queue));
}

async function syncOfflineQueue() {
    if (!navigator.onLine) return;
    
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    
    const failedQueue = [];
    let syncedCount = 0;
    
    for (const payload of queue) {
        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                syncedCount++;
            } else {
                failedQueue.push(payload);
            }
        } catch(e) {
            console.error("Sync failed for a result", e);
            failedQueue.push(payload);
        }
    }
    
    localStorage.setItem('timeline_offline_results', JSON.stringify(failedQueue));

    if (syncedCount > 0) {
        showToast(`Synced ${syncedCount} score${syncedCount > 1 ? 's' : ''} to leaderboard!`);
        const offlineBox = document.getElementById('offline-notice-box');
        if (offlineBox) offlineBox.classList.add('hidden');
        
        const listEl = document.getElementById('leaderboard-list');
        const endModal = document.getElementById('end-modal');
        if (listEl && endModal && !endModal.classList.contains('hidden')) {
            const leaderboardData = await fetchLeaderboard();
            renderLeaderboardItems(leaderboardData, listEl);
        }
    }
}

async function submitScore(result) {
    const payload = {
        user_id: gameState.userId,
        display_name: gameState.displayName,
        puzzle_date: gameState.todayDate,
        category: result.category,
        score: result.score,
        time_ms: result.timeMs,
        placedCards: result.placedCards
    };
    
    if (!navigator.onLine) {
        saveToOfflineQueue(payload);
        return;
    }
    
    try {
        const res = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            saveToOfflineQueue(payload);
        }
    } catch(e) {
        console.error("Failed to submit score, queueing offline", e);
        saveToOfflineQueue(payload);
    }
}

async function fetchLeaderboard() {
    if (!navigator.onLine) {
        return { isOffline: true, top10: [], userRank: -1, userData: null };
    }
    try {
        const urlParams = new URLSearchParams({
            date: gameState.todayDate,
            user_id: gameState.userId,
            display_name: gameState.displayName || '',
            t: Date.now()
        });
        const res = await fetch(`/api/leaderboard?${urlParams.toString()}`);
        if (res.ok) {
            return await res.json();
        }
    } catch(e) {
        console.error("Leaderboard fetch error:", e);
    }
    return { isError: true, top10: [], userRank: -1, userData: null };
}

function renderLeaderboardItems(leaderboardData, listEl) {
    listEl.innerHTML = '';
    
    if (!navigator.onLine || leaderboardData.isOffline) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 0.75rem 0; font-size: 0.9rem;">Leaderboard unavailable while offline.</p>';
        return;
    }
    
    if (leaderboardData.isError) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 0.75rem 0; font-size: 0.9rem;">Unable to load leaderboard data.</p>';
        return;
    }
    
    if (!leaderboardData.top10 || leaderboardData.top10.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 0.75rem 0; font-size: 0.9rem;">No scores yet today!</p>';
    } else {
        leaderboardData.top10.forEach((l, i) => {
            const secs = Math.floor(l.time_ms / 1000);
            const time = `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
            const item = document.createElement('div');
            const isMe = l.user_id === gameState.userId || (gameState.displayName && l.display_name === gameState.displayName);
            item.className = 'leaderboard-item' + (isMe ? ' is-me' : '');
            const nameDisplay = isMe ? `<strong>${l.display_name || 'Anonymous'} (You)</strong>` : (l.display_name || 'Anonymous');
            
            const badge = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            item.innerHTML = `
                <div class="left-col">
                    <span class="rank">${i+1}</span>
                    <span class="player-name">${nameDisplay}</span>
                </div>
                <div class="right-col">
                    <span class="score">${l.score}/7</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); margin-right: 0.25rem;">${time}</span>
                    ${badge ? `<span style="font-size: 1.2em;">${badge}</span>` : ''}
                </div>
            `;
            listEl.appendChild(item);
        });
        
        if (leaderboardData.userRank > 10 && leaderboardData.userData) {
            const separator = document.createElement('div');
            separator.style.textAlign = 'center';
            separator.style.color = 'var(--text-secondary)';
            separator.style.margin = '0.5rem 0';
            separator.textContent = '...';
            listEl.appendChild(separator);
            
            const l = leaderboardData.userData;
            const secs = Math.floor(l.time_ms / 1000);
            const time = `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
            const item = document.createElement('div');
            item.className = 'leaderboard-item is-me';
            item.innerHTML = `
                <div class="left-col">
                    <span class="rank">${leaderboardData.userRank}</span>
                    <span class="player-name"><strong>${l.display_name || 'Anonymous'} (You)</strong></span>
                </div>
                <div class="right-col">
                    <span class="score">${l.score}/7</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); margin-right: 0.25rem;">${time}</span>
                </div>
            `;
            listEl.appendChild(item);
        }
    }
}

async function showLeaderboard(result) {
    overlay.classList.remove('hidden');
    endModal.classList.remove('hidden');
    
    // Add a 300ms delay to let the modal transition in first
    animateLogoElement('end-logo', 0.3);
    
    const endTitle = document.getElementById('end-title');
    if (result.score === 7) endTitle.textContent = 'Perfect!';
    else if (result.score === 6) endTitle.textContent = 'Excellent!';
    else if (result.score === 5) endTitle.textContent = 'Good!';
    else if (result.score >= 3) endTitle.textContent = 'Not Bad!';
    else endTitle.textContent = 'Keep Practicing!';
    
    document.getElementById('score-display').textContent = `${result.score}/7`;
    const secs = Math.floor(result.timeMs / 1000);
    document.getElementById('time-display').textContent = `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
    
    // Personal Stats
    const history = JSON.parse(localStorage.getItem('timeline_history') || '{}');
    const playCount = Object.keys(history).length;
    const statsSection = document.getElementById('personal-stats-section');
    const statsList = document.getElementById('personal-stats-list');
    const streakDisplay = document.getElementById('streak-display');
    
    if (playCount > 0 && statsSection && statsList) {
        statsSection.classList.remove('hidden');
        
        let currentStreak = 0;
        let checkDate = gameState.todayDate;
        while (history[checkDate]) {
            currentStreak++;
            const d = new Date(checkDate + "T12:00:00Z");
            d.setUTCDate(d.getUTCDate() - 1);
            checkDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        }
        
        if (streakDisplay) {
            streakDisplay.textContent = `Current Streak ${currentStreak} Day${currentStreak !== 1 ? 's' : ''} 🔥`;
        }
        
        const counts = {};
        for (let i = 0; i <= 7; i++) counts[i] = 0;
        
        Object.values(history).forEach(game => {
            if (game.score !== undefined && game.score >= 0 && game.score <= 7) {
                counts[game.score]++;
            }
        });
        
        statsList.innerHTML = '';
        for (let i = 7; i >= 0; i--) {
            if (counts[i] > 0) {
                const statItem = document.createElement('div');
                statItem.className = 'leaderboard-item';
                statItem.style.padding = '0.25rem 0';
                statItem.style.borderBottom = 'none';
                
                const leftCol = document.createElement('div');
                leftCol.className = 'left-col';
                leftCol.innerHTML = `<span class="rank">-</span> <span class="player-name">${counts[i]} game${counts[i] !== 1 ? 's' : ''}</span>`;
                
                const rightCol = document.createElement('div');
                rightCol.className = 'right-col';
                rightCol.innerHTML = `<span class="score">${i}/7</span>`;
                
                statItem.appendChild(leftCol);
                statItem.appendChild(rightCol);
                statsList.appendChild(statItem);
            }
        }
    } else if (statsSection) {
        statsSection.classList.add('hidden');
    }

    // Toggle offline notice box inside modal
    const offlineNoticeBox = document.getElementById('offline-notice-box');
    const offlineNoticeText = document.getElementById('offline-notice-text');
    if (!navigator.onLine) {
        if (offlineNoticeBox) offlineNoticeBox.classList.remove('hidden');
        if (offlineNoticeText) {
            const queue = getOfflineQueue();
            const queueMsg = queue.length > 0 ? ` (${queue.length} score${queue.length > 1 ? 's' : ''} queued for sync)` : '';
            offlineNoticeText.textContent = `You are offline. Your score is saved locally and will auto-submit when connected.${queueMsg}`;
        }
    } else {
        if (offlineNoticeBox) offlineNoticeBox.classList.add('hidden');
    }
    
    const listEl = document.getElementById('leaderboard-list');
    listEl.innerHTML = '<div class="loading-spinner">Loading...</div>';
    
    const leaderboardData = await fetchLeaderboard();
    renderLeaderboardItems(leaderboardData, listEl);
    
    // If no display name, prompt them
    if (!gameState.displayName) {
        endModal.classList.add('hidden');
        nameModal.classList.remove('hidden');
    }
}


// 9. Modals & Settings
document.getElementById('name-input')?.addEventListener('input', (e) => {
    document.getElementById('save-name-btn').disabled = !e.target.value.trim();
});

document.getElementById('save-name-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('name-input').value.trim();
    if (name) {
        gameState.displayName = name;
        localStorage.setItem('timeline_display_name', name);
        
        if (navigator.onLine) {
            await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: gameState.userId, display_name: name })
            });
            // Update leaderboard if we just saved
            await submitScore(JSON.parse(localStorage.getItem('timeline_history'))[gameState.todayDate]);
        }
        
        nameModal.classList.add('hidden');
        endModal.classList.remove('hidden');
        
        // Refresh leaderboard
        showLeaderboard(JSON.parse(localStorage.getItem('timeline_history'))[gameState.todayDate]);
    }
});

document.getElementById('skip-name-btn')?.addEventListener('click', () => {
    nameModal.classList.add('hidden');
    endModal.classList.remove('hidden');
});

document.getElementById('settings-btn')?.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    settingsModal.classList.remove('hidden');
    document.getElementById('settings-name-input').value = gameState.displayName || '';
    document.getElementById('settings-uuid').value = gameState.userId;
    document.getElementById('theme-selector').value = localStorage.getItem('timeline_theme') || 'default';
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.checked = gameState.soundsEnabled;
    }
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('music-volume');
    if (musicToggle) {
        musicToggle.checked = gameState.musicEnabled;
    }
    if (volumeSlider) {
        volumeSlider.value = gameState.musicVolume;
        volumeSlider.disabled = !gameState.musicEnabled;
        volumeSlider.style.opacity = gameState.musicEnabled ? '1' : '0.5';
    }
    
    // Reset buttons
    const updateBtn = document.getElementById('update-name-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    updateBtn.disabled = true;
    updateBtn.style.display = 'none';
    updateBtn.className = 'modal-btn outline';
    closeBtn.className = 'modal-btn primary';
});

document.getElementById('settings-name-input')?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    const updateBtn = document.getElementById('update-name-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    
    if (val && val !== (gameState.displayName || '')) {
        updateBtn.disabled = false;
        updateBtn.style.display = '';
        updateBtn.className = 'modal-btn primary';
        closeBtn.className = 'modal-btn outline';
    } else {
        updateBtn.disabled = true;
        updateBtn.style.display = 'none';
        updateBtn.className = 'modal-btn outline';
        closeBtn.className = 'modal-btn primary';
    }
});

document.getElementById('close-settings-btn')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    settingsModal.classList.add('hidden');
});

document.getElementById('close-settings-x')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    settingsModal.classList.add('hidden');
});

document.getElementById('theme-selector')?.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    
    // Remove all theme classes first
    document.body.classList.remove('theme-elegant-dark', 'theme-elegant-light', 'theme-steampunk');
    
    // Apply selected theme if not default
    if (selectedTheme !== 'default') {
        document.body.classList.add(selectedTheme);
    }
    
    // Save preference
    localStorage.setItem('timeline_theme', selectedTheme);
    updateThemeColorMeta(selectedTheme);
    
    // If music is actively playing, swap track instantly
    if (gameState.musicEnabled && gameState.startTime && !gameState.isGameOver) {
        playMusic();
    }
});

document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
    gameState.soundsEnabled = e.target.checked;
    localStorage.setItem('timeline_sounds_enabled', gameState.soundsEnabled);
});

document.getElementById('music-toggle')?.addEventListener('change', (e) => {
    gameState.musicEnabled = e.target.checked;
    localStorage.setItem('timeline_music_enabled', gameState.musicEnabled);
    
    const volumeSlider = document.getElementById('music-volume');
    if (volumeSlider) {
        volumeSlider.disabled = !gameState.musicEnabled;
        volumeSlider.style.opacity = gameState.musicEnabled ? '1' : '0.5';
    }
    
    if (gameState.startTime && !gameState.isGameOver) {
        if (gameState.musicEnabled) {
            playMusic();
        } else {
            stopMusic();
        }
    }
});

document.getElementById('music-volume')?.addEventListener('input', (e) => {
    gameState.musicVolume = parseFloat(e.target.value);
    localStorage.setItem('timeline_music_volume', gameState.musicVolume);
    if (currentMusic) {
        currentMusic.volume = gameState.musicVolume;
    }
});

document.getElementById('about-btn')?.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    aboutModal.classList.remove('hidden');
});

document.getElementById('close-about-btn')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    aboutModal.classList.add('hidden');
});

document.getElementById('close-about-x')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    aboutModal.classList.add('hidden');
});

document.getElementById('update-name-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('settings-name-input').value.trim();
    if (name && name !== gameState.displayName) {
        gameState.displayName = name;
        localStorage.setItem('timeline_display_name', name);
        if (navigator.onLine) {
            await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: gameState.userId, display_name: name })
            });
        }
        showToast("Name updated!");
        
        // Reset buttons to original state
        const updateBtn = document.getElementById('update-name-btn');
        const closeBtn = document.getElementById('close-settings-btn');
        updateBtn.disabled = true;
        updateBtn.style.display = 'none';
        updateBtn.className = 'modal-btn outline';
        closeBtn.className = 'modal-btn primary';
    }
});

// UUID Sync Logic
const settingsUuidInput = document.getElementById('settings-uuid');
const copyUuidBtn = document.getElementById('copy-uuid-btn');
const pasteUuidBtn = document.getElementById('paste-uuid-btn');
const updateUuidBtn = document.getElementById('update-uuid-btn');
const confirmUuidModal = document.getElementById('confirm-uuid-modal');
const confirmUuidYes = document.getElementById('confirm-uuid-yes');
const confirmUuidNo = document.getElementById('confirm-uuid-no');

let pendingUuid = null;

settingsUuidInput.addEventListener('input', () => {
    const val = settingsUuidInput.value.trim();
    const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (isValid && val !== gameState.userId) {
        updateUuidBtn.style.display = 'block';
    } else {
        updateUuidBtn.style.display = 'none';
    }
});

copyUuidBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(gameState.userId);
        showToast("Player ID copied!");
    } catch(e) {
        showToast("Unable to copy ID");
    }
});

pasteUuidBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        settingsUuidInput.value = text.trim();
        settingsUuidInput.dispatchEvent(new Event('input'));
        showToast("ID pasted from clipboard");
    } catch(e) {
        showToast("Unable to read clipboard");
    }
});

updateUuidBtn.addEventListener('click', () => {
    const val = settingsUuidInput.value.trim();
    pendingUuid = val;
    document.getElementById('new-uuid-display').textContent = val;
    
    settingsModal.classList.add('hidden');
    confirmUuidModal.classList.remove('hidden');
});

confirmUuidNo.addEventListener('click', () => {
    confirmUuidModal.classList.add('hidden');
    settingsModal.classList.remove('hidden');
    settingsUuidInput.value = gameState.userId;
    updateUuidBtn.style.display = 'none';
    pendingUuid = null;
});

confirmUuidYes.addEventListener('click', () => {
    if (pendingUuid) {
        gameState.userId = pendingUuid;
        localStorage.setItem('timeline_user_id', pendingUuid);
        confirmUuidModal.classList.add('hidden');
        showToast("Player ID synced! Reloading...");
        setTimeout(() => location.reload(), 1500);
    }
});

document.getElementById('share-btn')?.addEventListener('click', async () => {
    const history = JSON.parse(localStorage.getItem('timeline_history'));
    const res = history[gameState.todayDate];
    
    const [year, month, day] = gameState.todayDate.split('-');
    const dateStr = `${parseInt(month)}/${parseInt(day)}/${year.slice(-2)}`;
    
    const secs = Math.floor(res.timeMs / 1000);
    const timeFormatted = `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
    
    const text = `📅 Timeline, ${dateStr}\nhttps://timeline-74i.pages.dev\nCategory: ${res.category}\nScore: ${res.score}/7  (${timeFormatted})`;
    
    try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!");
    } catch(err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast("Copied to clipboard!");
        } catch(e) {}
        document.body.removeChild(textArea);
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2500);
}

document.getElementById('close-end-btn')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    endModal.classList.add('hidden');
});

document.getElementById('close-end-x')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    endModal.classList.add('hidden');
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('SW registered', reg);
        });
    });
}

// Start
initGame();

// Mobile keyboard handling for modals
document.querySelectorAll('.modal input').forEach(input => {
    input.addEventListener('focus', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) modal.classList.add('keyboard-up');
    });
    input.addEventListener('blur', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
            // Delay removing the class so click events on buttons have time to fire
            setTimeout(() => {
                modal.classList.remove('keyboard-up');
            }, 300);
        }
    });
});

// Check for daily midnight rollover
setInterval(() => {
    if (!gameState.todayDate) return;
    const currentLADate = getLADateStr();
    if (currentLADate !== gameState.todayDate) {
        // Is timer running? (null means hasn't started, isGameOver means finished)
        const isTimerRunning = gameState.startTime !== null && !gameState.isGameOver;
        
        // Are modals open?
        const overlay = document.getElementById('modal-overlay');
        const isModalOpen = overlay && !overlay.classList.contains('hidden');
        
        if (!isTimerRunning && !isModalOpen) {
            // It's a new day, force refresh game
            initGame();
        }
    }
}, 5000);

// Admin / Dashboard logic
const dashboardBtn = document.getElementById('dashboard-btn');
let adminClickCount = 0;

if (localStorage.getItem('dashboardLoggedIn') === 'true') {
    if (dashboardBtn) {
        dashboardBtn.style.display = '';
        dashboardBtn.classList.remove('hidden');
    }
} else {
    if (dashboardBtn) {
        dashboardBtn.style.display = 'none';
        dashboardBtn.classList.add('hidden');
    }
}

document.addEventListener('click', (e) => {
    const logo = document.getElementById('logo');
    if (logo && logo.firstElementChild && e.target === logo.firstElementChild) {
        adminClickCount++;
        if (adminClickCount >= 10) {
            if (dashboardBtn) {
                dashboardBtn.style.display = '';
                dashboardBtn.classList.remove('hidden');
            }
        }
    }
});

window.addEventListener('blur', () => {
    if (localStorage.getItem('dashboardLoggedIn') !== 'true') {
        if (dashboardBtn) {
            dashboardBtn.style.display = 'none';
            dashboardBtn.classList.add('hidden');
        }
        adminClickCount = 0;
    }
});

if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const dashboardModal = document.getElementById('dashboard-modal');
        if (overlay) {
            overlay.classList.remove('hidden');
            if (localStorage.getItem('dashboardLoggedIn') === 'true' && dashboardModal) {
                dashboardModal.classList.remove('hidden');
                initDashboard();
            } else if (loginModal) {
                loginModal.classList.remove('hidden');
            }
        }
    });
}

const loginSubmitBtn = document.getElementById('login-submit-btn');
const loginCancelBtn = document.getElementById('login-cancel-btn');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginErrorMsg = document.getElementById('login-error');

if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: loginUsernameInput.value,
                    password: loginPasswordInput.value
                })
            });

            if (res.ok) {
                localStorage.setItem('dashboardLoggedIn', 'true');
                document.getElementById('login-modal').classList.add('hidden');
                document.getElementById('dashboard-modal').classList.remove('hidden');
                loginUsernameInput.value = '';
                loginPasswordInput.value = '';
                loginErrorMsg.style.display = 'none';
                initDashboard();
            } else {
                loginErrorMsg.style.display = 'block';
            }
        } catch (e) {
            console.error('Login error:', e);
            loginErrorMsg.style.display = 'block';
        }
    });
}

if (loginCancelBtn) {
    loginCancelBtn.addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('login-modal').classList.add('hidden');
        loginUsernameInput.value = '';
        loginPasswordInput.value = '';
        loginErrorMsg.style.display = 'none';
    });
}

let currentCalDate = new Date();
let selectedDateStr = null;

function renderCalendar(year, month) {
    const daysContainer = document.getElementById('calendar-days');
    const monthLabel = document.getElementById('cal-current-month');
    daysContainer.innerHTML = '';
    
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    monthLabel.textContent = `${monthName} ${year}`;
    
    const firstDayIndex = date.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        daysContainer.appendChild(emptyDiv);
    }
    
    const todayDateObj = new Date();
    const todayStr = `${todayDateObj.getFullYear()}-${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        
        const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (cellDateStr === selectedDateStr) {
            dayDiv.classList.add('selected');
        }
        if (cellDateStr === todayStr) {
            dayDiv.classList.add('today');
        }
        
        dayDiv.addEventListener('click', () => {
            selectedDateStr = cellDateStr;
            renderCalendar(year, month);
            fetchPuzzleForDashboard(selectedDateStr);
        });
        
        daysContainer.appendChild(dayDiv);
    }
}

function initDashboard() {
    const today = new Date();
    selectedDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    currentCalDate = new Date();
    renderCalendar(currentCalDate.getFullYear(), currentCalDate.getMonth());
    fetchPuzzleForDashboard(selectedDateStr);
    
    document.getElementById('cal-prev-month').onclick = () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendar(currentCalDate.getFullYear(), currentCalDate.getMonth());
    };
    
    document.getElementById('cal-next-month').onclick = () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendar(currentCalDate.getFullYear(), currentCalDate.getMonth());
    };
}

async function fetchPuzzleForDashboard(dateStr) {
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleCategory = document.getElementById('puzzle-category');
    const puzzleEvents = document.getElementById('puzzle-events');
    const errorMsg = document.getElementById('error-message');
    const leaderboardDisplay = document.getElementById('leaderboard-display');
    
    errorMsg.classList.add('hidden');
    puzzleDisplay.classList.add('hidden');
    leaderboardDisplay.classList.add('hidden');
    
    let puzzle = null;

    // Check local gameState.puzzles array first
    if (Array.isArray(gameState.puzzles)) {
        puzzle = gameState.puzzles.find(p => p.date === dateStr);
    }

    if (!puzzle) {
        try {
            const res = await fetch(`/api/puzzles?date=${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    puzzle = data[0];
                }
            }
        } catch (e) {
            console.warn("Error fetching dashboard puzzle", e);
        }
    }

    if (puzzle) {
        puzzleCategory.textContent = puzzle.category;
        
        const sortedEvents = [...puzzle.events].sort((a, b) => a.year - b.year);
        puzzleEvents.innerHTML = '';
        sortedEvents.forEach(ev => {
            const el = document.createElement('div');
            el.className = 'event-item';
            el.innerHTML = `<span class="event-year">${ev.year}</span><span class="event-text">${ev.event}</span>`;
            puzzleEvents.appendChild(el);
        });
        
        puzzleDisplay.classList.remove('hidden');
        fetchLeaderboardForDashboard(dateStr);
    } else {
        if (!navigator.onLine) {
            errorMsg.textContent = "You are offline. Connect to the internet to fetch un-cached archive puzzles.";
        } else {
            errorMsg.textContent = "No puzzle found for the selected date.";
        }
        errorMsg.classList.remove('hidden');
    }
}

async function fetchLeaderboardForDashboard(dateStr) {
    const leaderboardDisplay = document.getElementById('leaderboard-display');
    const leaderboardContent = document.getElementById('leaderboard-content');
    
    if (!navigator.onLine) {
        leaderboardDisplay.classList.remove('hidden');
        leaderboardContent.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Leaderboard data unavailable while offline.</p>';
        return;
    }
    
    try {
        const res = await fetch(`/api/leaderboard?date=${dateStr}`);
        if (!res.ok) {
            leaderboardDisplay.classList.remove('hidden');
            leaderboardContent.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Unable to load leaderboard data.</p>';
            return;
        }
        const data = await res.json();
        const top10 = data.all || data.top10;
        
        leaderboardDisplay.classList.remove('hidden');
        if (!top10 || top10.length === 0) {
            leaderboardContent.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No leaderboard data yet for this date.</p>';
            return;
        }
        
        let html = '<table><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Time (s)</th></tr></thead><tbody>';
        top10.forEach((entry, index) => {
            const timeSeconds = (entry.time_ms / 1000).toFixed(1);
            html += `<tr>
                <td>${index + 1}</td>
                <td>${entry.display_name || 'Missing Name'}</td>
                <td>${entry.score}</td>
                <td>${timeSeconds}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        leaderboardContent.innerHTML = html;
    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        leaderboardDisplay.classList.remove('hidden');
        leaderboardContent.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Unable to load leaderboard data.</p>';
    }
}

document.getElementById('close-dashboard-btn')?.addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('dashboard-modal').classList.add('hidden');
});

document.getElementById('close-dashboard-x')?.addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('dashboard-modal').classList.add('hidden');
});

document.getElementById('logout-dashboard-btn')?.addEventListener('click', () => {
    localStorage.removeItem('dashboardLoggedIn');
    localStorage.removeItem('isAdmin');
    adminClickCount = 0;
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('dashboard-modal').classList.add('hidden');
    if (dashboardBtn) {
        dashboardBtn.style.display = 'none';
        dashboardBtn.classList.add('hidden');
    }
});

// PWA Install Logic
let deferredPrompt;
const installAppContainer = document.getElementById('install-app-container');
const installAppBtn = document.getElementById('install-app-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    if (installAppContainer) {
        installAppContainer.style.display = 'flex';
        const closeBtn = document.getElementById('close-settings-btn');
        if (closeBtn) closeBtn.style.display = 'none';
    }
});

if (installAppBtn) {
    installAppBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        // Hide the install button
        if (installAppContainer) {
            installAppContainer.style.display = 'none';
            const closeBtn = document.getElementById('close-settings-btn');
            if (closeBtn) closeBtn.style.display = '';
        }
    });
}

window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    if (installAppContainer) {
        installAppContainer.style.display = 'none';
    }
    deferredPrompt = null;
    console.log('PWA was installed');
});

// --- Screen Wake Lock ---
let wakeLock = null;

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator && wakeLock === null) {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                wakeLock = null;
            });
        }
    } catch (err) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
    }
}

document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});

document.addEventListener('click', () => {
    if (wakeLock === null && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});
