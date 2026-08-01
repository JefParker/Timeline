// UUID generation
function generateUUID() {
    // crypto.randomUUID is available in every browser that supports service
    // workers; Math.random is only a last-resort fallback.
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- Safe DOM helpers -------------------------------------------------------
// Display names and event text are user- or server-supplied. They are never
// interpolated into innerHTML; everything goes through textContent so a name
// like `<img src=x onerror=...>` renders as literal text.

function createEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
}

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
        console.error(`Failed to parse localStorage key "${key}"`, e);
        return fallback;
    }
}

function getHistory() {
    const history = readJson('timeline_history', {});
    return (history && typeof history === 'object' && !Array.isArray(history)) ? history : {};
}

function formatClock(timeMs) {
    const secs = Math.max(0, Math.floor((Number(timeMs) || 0) / 1000));
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

// Game State

// A corrupted stored value here used to throw at startup when assigned to
// Audio.volume (which rejects NaN and out-of-range numbers), leaving the whole
// app stuck on the loading screen.
function sanitizeVolume(raw) {
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) return 0.25;
    return Math.min(1, Math.max(0, value));
}

let gameState = {
    userId: localStorage.getItem('timeline_user_id') || generateUUID(),
    displayName: localStorage.getItem('timeline_display_name') || '',
    todayDate: '',
    puzzle: null,
    puzzles: [],
    remainingEvents: [],
    placedCards: [],
    score: 0,
    startTime: 0,
    endTime: 0,
    savedTimeMs: 0,
    isGameOver: false,
    soundsEnabled: localStorage.getItem('timeline_sounds_enabled') === 'true',
    musicEnabled: localStorage.getItem('timeline_music_enabled') === 'true',
    musicVolume: sanitizeVolume(localStorage.getItem('timeline_music_volume'))
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
// Always leaves gameState.puzzles as an array. Returns true when a usable set
// was found, so callers can show an error instead of crashing on undefined.
async function loadPuzzles() {
    gameState.puzzles = Array.isArray(gameState.puzzles) ? gameState.puzzles : [];

    const todayStr = getLADateStr();
    const isUsable = (data) => Array.isArray(data) && data.length > 0;
    // "Usable" is not enough for the offline fallbacks: a stale localStorage
    // cache that ends yesterday used to win over the freshly deployed
    // puzzles.json that actually contains today, producing "Error Loading
    // Puzzle" while a good puzzle sat in the service worker cache.
    const hasToday = (data) => isUsable(data) && data.some(p => p && p.date === todayStr);

    const cacheAndUse = (data) => {
        gameState.puzzles = data;
        try {
            localStorage.setItem('timeline_puzzles', JSON.stringify(data));
        } catch (e) {
            // Quota exceeded or private mode; the in-memory copy still works.
            console.warn("Could not cache puzzles locally", e);
        }
        return true;
    };

    // Tier 1: Try API network fetch first.
    // No cache-busting query param: the endpoint sets a 5 minute Cache-Control,
    // and a unique URL per request would make that header useless.
    try {
        const res = await fetch('/api/puzzles');
        if (res.ok) {
            const data = await res.json();
            if (isUsable(data)) return cacheAndUse(data);
        }
    } catch (e) {
        console.warn("API puzzle fetch unavailable, attempting local cache fallbacks");
    }

    // Tier 2: localStorage cache, if it covers today.
    const cached = readJson('timeline_puzzles', null);
    if (hasToday(cached)) {
        gameState.puzzles = cached;
        return true;
    }

    // Tier 3: static precached puzzles.json, if it covers today.
    let staticData = null;
    try {
        const res = await fetch('/puzzles.json');
        if (res.ok) {
            const data = await res.json();
            if (isUsable(data)) staticData = data;
        }
    } catch (e) {
        console.error("Static puzzles.json fallback fetch failed", e);
    }
    if (hasToday(staticData)) {
        console.log("Loaded static fallback puzzles.json successfully");
        return cacheAndUse(staticData);
    }

    // Neither source has today's puzzle; keep whichever exists so the archive
    // and dashboard still work, and let initGame show the error state.
    if (isUsable(cached)) {
        gameState.puzzles = cached;
        return true;
    }
    if (staticData) {
        return cacheAndUse(staticData);
    }

    console.error("Offline and no cached puzzles available");
    return false;
}

// Get LA Date.
// en-CA formats as YYYY-MM-DD directly, so we never have to parse a localised
// date string back through the Date constructor (which is implementation
// defined and has historically differed between Safari and Chrome).
const LA_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

function getLADateStr(now = new Date()) {
    return LA_DATE_FORMATTER.format(now);
}

const LA_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});

// Milliseconds until the next midnight in Los Angeles, derived from the LA
// wall clock rather than from arithmetic on a re-parsed date string.
function msUntilLAMidnight(now = new Date()) {
    const parts = {};
    for (const part of LA_TIME_FORMATTER.formatToParts(now)) {
        parts[part.type] = part.value;
    }

    const hour = Number(parts.hour) % 24; // h23 cycles can report "24"
    const minute = Number(parts.minute);
    const second = Number(parts.second);

    const elapsedMs = ((hour * 60 + minute) * 60 + second) * 1000 + now.getMilliseconds();
    return Math.max(1000, 24 * 60 * 60 * 1000 - elapsedMs);
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
        const res = await fetch(`/api/user?user_id=${encodeURIComponent(gameState.userId)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.display_name && data.display_name !== gameState.displayName) {
                gameState.displayName = data.display_name;
                localStorage.setItem('timeline_display_name', data.display_name);
                const nameInput = document.getElementById('name-input');
                const settingsNameInput = document.getElementById('settings-name-input');
                if (nameInput) nameInput.value = data.display_name;
                if (settingsNameInput) settingsNameInput.value = data.display_name;
            }
            if (data.history && data.history.length > 0) {
                const history = getHistory();
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
    const resetTime = new Date(now.getTime() + msUntilLAMidnight(now));
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

let countdownInterval = null;

// Restores the header to its normal "today's puzzle" state. Called on every
// init so a midnight rollover does not inherit yesterday's end-of-game UI.
function resetHeaderState() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    const labelEl = document.querySelector('.category-label');
    const deckCounterEl = document.querySelector('.deck-counter');

    if (labelEl) labelEl.textContent = "Today's Category";
    if (deckCounterEl) deckCounterEl.style.display = '';

    activeCardContainer.classList.remove('game-over');
    activeCardContainer.innerHTML = '';
}

function showNextPuzzleScreen() {
    const futurePuzzles = gameState.puzzles
        .filter(p => p.date > gameState.todayDate)
        .sort((a, b) => a.date.localeCompare(b.date));
    const nextPuzzle = futurePuzzles.length > 0 ? futurePuzzles[0] : null;

    const categoryEl = document.getElementById('category-name');
    const labelEl = document.querySelector('.category-label');
    const deckCounterEl = document.querySelector('.deck-counter');

    if (deckCounterEl) deckCounterEl.style.display = 'none';
    if (labelEl) labelEl.textContent = "Tomorrow's Category";

    // Only ever one countdown timer alive; this used to leak an interval on
    // every call (init, end of game, and each midnight rollover check).
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    if (!categoryEl) return;
    categoryEl.textContent = '';

    if (nextPuzzle) {
        categoryEl.appendChild(document.createTextNode(nextPuzzle.category));
        categoryEl.appendChild(document.createElement('br'));

        const countdownEl = createEl('span');
        countdownEl.id = 'next-countdown';
        countdownEl.style.fontSize = '1rem';
        countdownEl.style.fontStyle = 'normal';
        categoryEl.appendChild(countdownEl);

        const tick = () => {
            if (!countdownEl.isConnected) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                return;
            }
            const diff = msUntilLAMidnight();
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            countdownEl.textContent = `Available in ${h}h ${m}m ${s}s`;
        };

        tick();
        countdownInterval = setInterval(tick, 1000);
    } else {
        categoryEl.textContent = "You've played today's puzzle!";
    }
}

// Renders the "view results" button shown once the day's game is finished.
function showResultsButton(category, result) {
    const label = String(category || '').split(' ').length > 2
        ? 'Review Results'
        : `View ${category} Results`;

    activeCardContainer.classList.add('game-over');
    activeCardContainer.innerHTML = '';

    const wrapper = createEl('div');
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.width = '100%';

    const button = createEl('button', 'primary-btn outline', label);
    button.addEventListener('click', () => showLeaderboard(result));

    wrapper.appendChild(button);
    activeCardContainer.appendChild(wrapper);
}

async function initGame() {
    // Reset any end-of-game UI left over from the previous day. Without this a
    // midnight rollover kept "Tomorrow's Category" and hid the event counter.
    resetHeaderState();
    gameState.isGameOver = false;
    gameState.activeEvent = null;
    gameState.score = 0;
    gameState.savedTimeMs = 0;
    gameState.startTime = null;
    if (window.liveTimerInterval) clearInterval(window.liveTimerInterval);

    updateOnlineStatus();
    animateLogoElement('logo');

    const puzzlesLoaded = await loadPuzzles();
    syncOfflineQueue();
    await syncUserData();

    updateReleaseTimeText();

    gameState.todayDate = getLADateStr();

    if (!puzzlesLoaded) {
        categoryNameEl.textContent = navigator.onLine
            ? "Couldn't load today's puzzle"
            : "Offline — no saved puzzles available";
        return;
    }

    // Find today's puzzle
    const puzzle = gameState.puzzles.find(p => p.date === gameState.todayDate);
    // Exactly 7: the counter, score displays, and stats buckets all assume it,
    // so a malformed 8-event puzzle must not start.
    if (!puzzle || !Array.isArray(puzzle.events) || puzzle.events.length !== 7) {
        // Fallback if missing
        categoryNameEl.textContent = "Error Loading Puzzle";
        return;
    }

    // Check if already played today
    const history = getHistory();
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

        showResultsButton(puzzle.category, history[gameState.todayDate]);

        if (gameState.placedCards.length > 0) {
            renderTimeline();
        }

        return;
    }

    const loadedAutosave = (() => {
        const save = readJson('timeline_autosave', null);
        if (!save || typeof save !== 'object') return null;
        if (save.date !== gameState.todayDate) return null;
        if (!Array.isArray(save.placedCards) || save.placedCards.length === 0) return null;
        if (!Array.isArray(save.remainingEvents)) return null;
        return save;
    })();

    if (loadedAutosave) {
        gameState.puzzle = puzzle;
        gameState.remainingEvents = loadedAutosave.remainingEvents;
        gameState.placedCards = loadedAutosave.placedCards;
        gameState.score = Number.isFinite(loadedAutosave.score) ? loadedAutosave.score : 1;
        gameState.savedTimeMs = Number.isFinite(loadedAutosave.savedTimeMs) ? loadedAutosave.savedTimeMs : 0;

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
        const cardEl = buildTimelineCard(card.event, card.year, {
            backClass: card.wasWrong ? 'wrong-permanent' : ''
        });
        // Already flipped because it's placed
        cardEl.classList.add('flipped');

        timelineCardsEl.appendChild(cardEl);

        if (!gameState.isGameOver) {
            timelineCardsEl.appendChild(createDropTarget(index + 1));
        }
    });
}

// Builds a timeline card without interpolating text into innerHTML. Event text
// can originate from a synced payload, so it is never treated as markup.
function buildTimelineCard(eventText, year, { frontClass = '', backClass = '' } = {}) {
    const cardEl = createEl('div', 'timeline-card');
    const inner = createEl('div', 'card-inner');

    const front = createEl('div', `card-front${frontClass ? ' ' + frontClass : ''}`, eventText);

    const back = createEl('div', `card-back${backClass ? ' ' + backClass : ''}`);
    back.appendChild(createEl('div', 'year', year));
    back.appendChild(createEl('div', 'event-text', eventText));

    inner.appendChild(front);
    inner.appendChild(back);
    cardEl.appendChild(inner);
    return cardEl;
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
        // endGame is async and is not awaited here; without an explicit catch
        // any throw inside it becomes an unhandled rejection that silently
        // skips score submission and the results modal.
        endGame().catch(err => {
            console.error('endGame failed', err);
            showToast('Something went wrong saving your result.');
        });
        return;
    }
    
    gameState.activeEvent = gameState.remainingEvents.shift();
    // A fresh card has no chosen slot yet. Without this, a bare tap on the
    // card (pointerdown + pointerup, no move) snapped it into whatever slot
    // the previous card used.
    dropIndex = -1;
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
        dropIndex = -1; // No slot is chosen until the card actually moves
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

// Shared teardown for both pointerup and pointercancel. Resetting the scroll
// direction matters: leaving it stale meant the next drag in the same
// direction never restarted the auto-scroll interval.
function stopDragScroll() {
    if (dragScrollInterval) {
        clearInterval(dragScrollInterval);
        dragScrollInterval = null;
    }
    window.currentScrollDirection = 0;
}

document.addEventListener('pointerup', e => {
    if (!isDragging || !currentActiveElement) return;

    stopDragScroll();

    isDragging = false;
    currentActiveElement.classList.remove('dragging');

    currentActiveElement.style.position = 'relative';
    currentActiveElement.style.top = '0';
    currentActiveElement.style.left = '0';
    currentActiveElement.style.width = '';

    const target = dropIndex !== -1
        ? document.querySelector(`.drop-target[data-index="${dropIndex}"]`)
        : null;

    if (target) {
        // Snap into drop target
        target.classList.remove('active-hover');
        target.classList.add('has-card');
        target.appendChild(currentActiveElement);

        playSound('drop');

        target.appendChild(confirmContainer);

        // Show confirm button
        confirmContainer.classList.remove('hidden');
        setTimeout(() => confirmContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } else {
        // No valid target (or it was re-rendered mid-drag) — return the card
        dropIndex = -1;
        activeCardContainer.appendChild(currentActiveElement);
    }

    currentActiveElement = null;
});

// The browser can take the pointer away mid-drag (system gesture, incoming
// call, browser UI). Without this handler the card stayed fixed on the body
// with pointer-events disabled — a soft-lock only a reload could clear — and
// any auto-scroll interval kept scrolling forever.
document.addEventListener('pointercancel', () => {
    if (!isDragging || !currentActiveElement) return;

    stopDragScroll();

    isDragging = false;
    currentActiveElement.classList.remove('dragging');
    currentActiveElement.style.position = 'relative';
    currentActiveElement.style.top = '0';
    currentActiveElement.style.left = '0';
    currentActiveElement.style.width = '';

    document.querySelectorAll('.drop-target').forEach(t => t.classList.remove('active-hover'));
    dropIndex = -1;
    activeCardContainer.appendChild(currentActiveElement);
    currentActiveElement = null;
});

// 6. Confirm Placement & Validation
confirmBtn.addEventListener('click', async () => {
    const event = gameState.activeEvent;
    // No card in hand (double fire) or no chosen slot: nothing to confirm.
    if (!event || dropIndex < 0) return;

    // Hide confirm button
    confirmContainer.classList.add('hidden');

    playSound('confirm');

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

    // Commit the placement to game state NOW, before the ~2.4s flip animation.
    // An autosave firing mid-animation (tab close, app switch) used to capture
    // the incremented score with the card still in hand, so restoring the save
    // let the same card be played — and scored — a second time.
    let correctIndex = 0;
    while (correctIndex < placed.length && placed[correctIndex].year < event.year) {
        correctIndex++;
    }
    placed.splice(correctIndex, 0, event);
    gameState.activeEvent = null;

    // Create actual timeline card structure for the animation
    const cardEl = buildTimelineCard(event.event, event.year, {
        frontClass: correct ? 'correct' : 'incorrect',
        backClass: correct ? 'correct-year' : 'incorrect-year'
    });

    // Replace active target with the new card temporarily.
    // The confirm container currently lives inside this drop target, so move it
    // back to the body first rather than letting innerHTML detach it.
    const target = document.querySelector(`.drop-target[data-index="${dropIndex}"]`);
    if (target) {
        if (confirmContainer.parentElement === target) {
            document.body.appendChild(confirmContainer);
        }
        target.innerHTML = '';
        target.appendChild(cardEl);
    }

    // Flip to show year
    setTimeout(() => cardEl.classList.add('flipped'), 50);
    
    await new Promise(r => setTimeout(r, 1800));
    
    // Flip back
    cardEl.classList.remove('flipped');
    await new Promise(r => setTimeout(r, 600));

    // State was committed above; the animation was presentation only.
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

    // startTime is null if the game somehow ended without the player ever
    // dragging a card; treat the active session as zero-length rather than
    // sending Date.now() to the server as an elapsed time.
    const activeMs = gameState.startTime ? (gameState.endTime - gameState.startTime) : 0;
    const timeMs = Math.max(0, activeMs + (gameState.savedTimeMs || 0));

    localStorage.removeItem('timeline_autosave');

    // Save history locally
    const history = getHistory();
    const result = {
        score: gameState.score,
        timeMs,
        category: gameState.puzzle.category,
        placedCards: gameState.placedCards
    };
    history[gameState.todayDate] = result;
    try {
        localStorage.setItem('timeline_history', JSON.stringify(history));
    } catch (e) {
        console.error('Could not persist history', e);
    }

    // Confetti is loaded from a CDN. If it is blocked or unavailable an
    // uncaught ReferenceError here used to abort the rest of endGame, so the
    // score was never submitted and no results modal ever appeared.
    if (gameState.score > 4 && typeof confetti === 'function') {
        try {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {
            console.warn('Confetti failed', e);
        }
    }

    // Show a View Results button in the active card area
    showResultsButton(gameState.puzzle.category, result);

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
const MAX_OFFLINE_QUEUE = 120;

function getOfflineQueue() {
    const queue = readJson('timeline_offline_results', []);
    return Array.isArray(queue) ? queue : [];
}

function saveToOfflineQueue(payload) {
    // One queued result per player per date: re-submitting today's score (e.g.
    // after setting a display name) supersedes the earlier anonymous entry
    // instead of posting both on reconnect.
    const queue = getOfflineQueue().filter(
        p => !(p && p.user_id === payload.user_id && p.puzzle_date === payload.puzzle_date)
    );
    queue.push(payload);
    // Bound the queue so a long offline streak cannot fill localStorage.
    const trimmed = queue.slice(-MAX_OFFLINE_QUEUE);
    try {
        localStorage.setItem('timeline_offline_results', JSON.stringify(trimmed));
    } catch (e) {
        console.error('Could not queue score offline', e);
    }
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
            } else if (res.status >= 400 && res.status < 500) {
                // The server rejected the payload itself; retrying will never
                // succeed, so drop it instead of retrying forever.
                console.warn(`Dropping unsyncable queued score (HTTP ${res.status})`);
            } else {
                failedQueue.push(payload);
            }
        } catch(e) {
            console.error("Sync failed for a result", e);
            failedQueue.push(payload);
        }
    }
    
    try {
        localStorage.setItem('timeline_offline_results', JSON.stringify(failedQueue));
    } catch (e) {
        console.error('Could not update offline queue', e);
    }

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
        if (res.status >= 400 && res.status < 500) {
            // The server rejected the payload itself; queueing it would just
            // retry the same rejection forever.
            console.error(`Score rejected by server (HTTP ${res.status}); not queueing.`);
        } else if (!res.ok) {
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
        // Only the player id is sent. The server used to also match on display
        // name, which meant two players sharing a name were treated as one.
        const urlParams = new URLSearchParams({
            date: gameState.todayDate,
            user_id: gameState.userId,
            t: Date.now()
        });
        const res = await fetch(`/api/leaderboard?${urlParams.toString()}`);
        if (res.ok) {
            // A 200 with a null/non-object body (broken proxy, captive
            // portal) must not escape here — callers dereference the result.
            const data = await res.json();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                return data;
            }
        }
    } catch(e) {
        console.error("Leaderboard fetch error:", e);
    }
    return { isError: true, top10: [], userRank: -1, userData: null };
}

function renderLeaderboardMessage(listEl, message) {
    listEl.innerHTML = '';
    const p = createEl('p', null, message);
    p.style.textAlign = 'center';
    p.style.color = 'var(--text-secondary)';
    p.style.padding = '0.75rem 0';
    p.style.fontSize = '0.9rem';
    listEl.appendChild(p);
}

// Builds one leaderboard row. Display names are attacker-controlled, so they
// are only ever set via textContent — never interpolated into innerHTML.
function buildLeaderboardRow(entry, rank, badge) {
    const isMe = entry.isMe === true;

    const item = createEl('div', 'leaderboard-item' + (isMe ? ' is-me' : ''));

    const leftCol = createEl('div', 'left-col');
    leftCol.appendChild(createEl('span', 'rank', rank));

    const nameSpan = createEl('span', 'player-name');
    const nameText = `${entry.display_name || 'Anonymous'}${isMe ? ' (You)' : ''}`;
    if (isMe) {
        nameSpan.appendChild(createEl('strong', null, nameText));
    } else {
        nameSpan.textContent = nameText;
    }
    leftCol.appendChild(nameSpan);

    if (entry.isBot) {
        const tag = createEl('span', 'player-tag', 'demo');
        tag.style.fontSize = '0.65rem';
        tag.style.textTransform = 'uppercase';
        tag.style.letterSpacing = '0.08em';
        tag.style.opacity = '0.6';
        tag.style.marginLeft = '0.4rem';
        tag.title = 'Sample entry, not a real player';
        leftCol.appendChild(tag);
    }

    const rightCol = createEl('div', 'right-col');
    rightCol.appendChild(createEl('span', 'score', `${entry.score}/7`));

    const timeSpan = createEl('span', null, formatClock(entry.time_ms));
    timeSpan.style.fontSize = '0.8rem';
    timeSpan.style.color = 'var(--text-secondary)';
    timeSpan.style.marginRight = '0.25rem';
    rightCol.appendChild(timeSpan);

    if (badge) {
        const badgeSpan = createEl('span', null, badge);
        badgeSpan.style.fontSize = '1.2em';
        rightCol.appendChild(badgeSpan);
    }

    item.appendChild(leftCol);
    item.appendChild(rightCol);
    return item;
}

function renderLeaderboardItems(leaderboardData, listEl) {
    listEl.innerHTML = '';

    if (!navigator.onLine || (leaderboardData && leaderboardData.isOffline)) {
        renderLeaderboardMessage(listEl, 'Leaderboard unavailable while offline.');
        return;
    }

    if (!leaderboardData || leaderboardData.isError) {
        renderLeaderboardMessage(listEl, 'Unable to load leaderboard data.');
        return;
    }

    if (!Array.isArray(leaderboardData.top10) || leaderboardData.top10.length === 0) {
        renderLeaderboardMessage(listEl, 'No scores yet today!');
    } else {
        const badges = ['🥇', '🥈', '🥉'];
        leaderboardData.top10.forEach((entry, i) => {
            listEl.appendChild(buildLeaderboardRow(entry, i + 1, badges[i] || ''));
        });

        if (leaderboardData.userRank > 10 && leaderboardData.userData) {
            const separator = createEl('div', null, '...');
            separator.style.textAlign = 'center';
            separator.style.color = 'var(--text-secondary)';
            separator.style.margin = '0.5rem 0';
            listEl.appendChild(separator);

            listEl.appendChild(
                buildLeaderboardRow(
                    { ...leaderboardData.userData, isMe: true },
                    leaderboardData.userRank,
                    ''
                )
            );
        }
    }
}

async function showLeaderboard(result) {
    if (!result) return;

    overlay.classList.remove('hidden');
    endModal.classList.remove('hidden');

    const endTitle = document.getElementById('end-title');
    if (result.score === 7) endTitle.textContent = 'Perfect!';
    else if (result.score === 6) endTitle.textContent = 'Excellent!';
    else if (result.score === 5) endTitle.textContent = 'Good!';
    else if (result.score >= 3) endTitle.textContent = 'Not Bad!';
    else endTitle.textContent = 'Keep Practicing!';

    document.getElementById('score-display').textContent = `${result.score}/7`;
    document.getElementById('time-display').textContent = formatClock(result.timeMs);

    // Personal Stats
    const history = getHistory();
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
                
                const leftCol = createEl('div', 'left-col');
                leftCol.appendChild(createEl('span', 'rank', '-'));
                leftCol.appendChild(document.createTextNode(' '));
                leftCol.appendChild(
                    createEl('span', 'player-name', `${counts[i]} game${counts[i] !== 1 ? 's' : ''}`)
                );

                const rightCol = createEl('div', 'right-col');
                rightCol.appendChild(createEl('span', 'score', `${i}/7`));

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
    
    // If no display name, prompt for one first. This is checked before the
    // leaderboard fetch is awaited, otherwise the results modal flashes up for
    // as long as the request takes before being replaced by the name prompt.
    if (!gameState.displayName) {
        endModal.classList.add('hidden');
        nameModal.classList.remove('hidden');
    }

    const listEl = document.getElementById('leaderboard-list');
    listEl.innerHTML = '';
    listEl.appendChild(createEl('div', 'loading-spinner', 'Loading...'));

    const leaderboardData = await fetchLeaderboard();
    renderLeaderboardItems(leaderboardData, listEl);
}


// 9. Modals & Settings
document.getElementById('name-input')?.addEventListener('input', (e) => {
    document.getElementById('save-name-btn').disabled = !e.target.value.trim();
});

document.getElementById('save-name-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('name-input').value.trim();
    if (!name) return;

    gameState.displayName = name;
    localStorage.setItem('timeline_display_name', name);

    const todaysResult = getHistory()[gameState.todayDate];

    if (navigator.onLine) {
        try {
            await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: gameState.userId, display_name: name })
            });
            // Re-submit so the name is attached to today's score
            if (todaysResult) await submitScore(todaysResult);
        } catch (e) {
            console.error('Could not save display name', e);
        }
    }

    nameModal.classList.add('hidden');
    endModal.classList.remove('hidden');

    // Refresh leaderboard
    if (todaysResult) showLeaderboard(todaysResult);
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
    if (!name || name === gameState.displayName) return;

    gameState.displayName = name;
    localStorage.setItem('timeline_display_name', name);

    let saved = true;
    if (navigator.onLine) {
        // navigator.onLine being true does not mean the request will succeed.
        // An unhandled rejection here used to abort the rest of the handler,
        // leaving the button stuck and no confirmation shown.
        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: gameState.userId, display_name: name })
            });
            saved = res.ok;
        } catch (e) {
            console.error('Could not update display name', e);
            saved = false;
        }
    }

    showToast(saved ? "Name updated!" : "Saved locally — will sync later.");

    // Reset buttons to original state
    const updateBtn = document.getElementById('update-name-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    updateBtn.disabled = true;
    updateBtn.style.display = 'none';
    updateBtn.className = 'modal-btn outline';
    closeBtn.className = 'modal-btn primary';
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

function getShareText() {
    const res = getHistory()[gameState.todayDate];
    if (!res) return '';

    const [year, month, day] = gameState.todayDate.split('-');
    const dateStr = `${parseInt(month, 10)}/${parseInt(day, 10)}/${year.slice(-2)}`;

    return `📅 Timeline, ${dateStr}\n${window.location.origin}\nCategory: ${res.category}\nScore: ${res.score}/7  (${formatClock(res.timeMs)})`;
}

async function copyToClipboard(text) {
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
}

document.getElementById('share-btn')?.addEventListener('click', async () => {
    const text = getShareText();
    if (!text) return;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Timeline Result',
                text: text,
                url: window.location.origin
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                await copyToClipboard(text);
            }
        }
    } else {
        await copyToClipboard(text);
    }
});

document.getElementById('copy-btn')?.addEventListener('click', async () => {
    const text = getShareText();
    if (!text) return;
    await copyToClipboard(text);
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
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered', reg))
            .catch(err => console.error('SW registration failed', err));
    });
}

// Start. Any unexpected failure here used to leave the page stuck on "..."
// with no indication of what went wrong.
function startGame() {
    initGame().catch(err => {
        console.error('Failed to initialise game', err);
        if (categoryNameEl) categoryNameEl.textContent = 'Error Loading Puzzle';
    });
}

startGame();

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
        const modalOverlay = document.getElementById('modal-overlay');
        const isModalOpen = modalOverlay && !modalOverlay.classList.contains('hidden');

        if (!isTimerRunning && !isModalOpen) {
            // It's a new day, force refresh game
            startGame();
        }
    }
}, 5000);

// Admin / Dashboard logic
//
// The admin session is an HttpOnly, HMAC-signed cookie set by /api/login. The
// client cannot forge it and cannot read it, so `isAdmin` here is only a UI
// hint — every privileged response is gated server-side. It replaces the old
// `localStorage.dashboardLoggedIn` flag, which anyone could simply set.
const dashboardBtn = document.getElementById('dashboard-btn');
let adminClickCount = 0;
let isAdmin = false;

function setDashboardButtonVisible(visible) {
    if (!dashboardBtn) return;
    dashboardBtn.style.display = visible ? '' : 'none';
    dashboardBtn.classList.toggle('hidden', !visible);
}

async function refreshAdminSession() {
    // Clean up the legacy client-side flag if it is still lying around.
    localStorage.removeItem('dashboardLoggedIn');
    localStorage.removeItem('isAdmin');

    if (!navigator.onLine) return false;
    try {
        const res = await fetch('/api/session');
        if (res.ok) {
            const data = await res.json();
            isAdmin = data.admin === true;
        }
    } catch (e) {
        isAdmin = false;
    }
    setDashboardButtonVisible(isAdmin);
    return isAdmin;
}

setDashboardButtonVisible(false);
refreshAdminSession();

document.addEventListener('click', (e) => {
    const logo = document.getElementById('logo');
    if (logo && logo.firstElementChild && e.target === logo.firstElementChild) {
        adminClickCount++;
        if (adminClickCount >= 10) {
            setDashboardButtonVisible(true);
        }
    }
});

window.addEventListener('blur', () => {
    if (!isAdmin) {
        setDashboardButtonVisible(false);
        adminClickCount = 0;
    }
});

if (dashboardBtn) {
    dashboardBtn.addEventListener('click', async () => {
        const modalOverlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const dashboardModal = document.getElementById('dashboard-modal');
        if (!modalOverlay) return;

        modalOverlay.classList.remove('hidden');

        if (await refreshAdminSession()) {
            if (dashboardModal) {
                dashboardModal.classList.remove('hidden');
                initDashboard();
            }
        } else if (loginModal) {
            loginModal.classList.remove('hidden');
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
                // The session itself is the HttpOnly cookie the server just
                // set; nothing about being logged in is stored client-side.
                isAdmin = true;
                setDashboardButtonVisible(true);
                document.getElementById('login-modal').classList.add('hidden');
                document.getElementById('dashboard-modal').classList.remove('hidden');
                loginUsernameInput.value = '';
                loginPasswordInput.value = '';
                loginErrorMsg.style.display = 'none';
                initDashboard();
            } else {
                loginPasswordInput.value = '';
                loginErrorMsg.textContent = res.status === 503
                    ? 'Admin login is not configured on this deployment.'
                    : 'Incorrect credentials.';
                loginErrorMsg.style.display = 'block';
            }
        } catch (e) {
            console.error('Login error:', e);
            loginErrorMsg.textContent = 'Could not reach the server.';
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
    
    // Puzzle dates are LA-calendar dates; the device's local date highlighted
    // the wrong "today" for anyone east of Los Angeles after their midnight.
    const todayStr = getLADateStr();

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
    // Default the selection to the game's "today" (LA calendar), not the
    // admin's local date.
    selectedDateStr = getLADateStr();
    const [laYear, laMonth] = selectedDateStr.split('-').map(Number);
    currentCalDate = new Date(laYear, laMonth - 1, 1);
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
            const res = await fetch(`/api/puzzles?date=${encodeURIComponent(dateStr)}`);
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
            const el = createEl('div', 'event-item');
            el.appendChild(createEl('span', 'event-year', ev.year));
            el.appendChild(createEl('span', 'event-text', ev.event));
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

function setDashboardMessage(container, message) {
    container.innerHTML = '';
    const p = createEl('p', null, message);
    p.style.textAlign = 'center';
    p.style.color = 'var(--text-secondary)';
    container.appendChild(p);
}

async function fetchLeaderboardForDashboard(dateStr) {
    const leaderboardDisplay = document.getElementById('leaderboard-display');
    const leaderboardContent = document.getElementById('leaderboard-content');

    if (!navigator.onLine) {
        leaderboardDisplay.classList.remove('hidden');
        setDashboardMessage(leaderboardContent, 'Leaderboard data unavailable while offline.');
        return;
    }

    try {
        const res = await fetch(`/api/leaderboard?date=${encodeURIComponent(dateStr)}`);
        leaderboardDisplay.classList.remove('hidden');

        if (!res.ok) {
            setDashboardMessage(leaderboardContent, 'Unable to load leaderboard data.');
            return;
        }
        const data = await res.json();

        // `all` is only returned to an authenticated admin; fall back to the
        // public top 10 if the session has expired.
        const rows = Array.isArray(data.all) ? data.all : data.top10;

        if (!Array.isArray(rows) || rows.length === 0) {
            setDashboardMessage(leaderboardContent, 'No leaderboard data yet for this date.');
            return;
        }

        // Built with DOM nodes rather than an HTML string: display names are
        // player-supplied and must never be parsed as markup.
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        ['Rank', 'Player', 'Score', 'Time (s)'].forEach(label => {
            headRow.appendChild(createEl('th', null, label));
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        rows.forEach((entry, index) => {
            const tr = document.createElement('tr');
            tr.appendChild(createEl('td', null, index + 1));
            tr.appendChild(
                createEl(
                    'td',
                    null,
                    `${entry.display_name || 'Missing Name'}${entry.isBot ? ' (demo)' : ''}`
                )
            );
            tr.appendChild(createEl('td', null, entry.score));
            tr.appendChild(createEl('td', null, ((Number(entry.time_ms) || 0) / 1000).toFixed(1)));
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        leaderboardContent.innerHTML = '';
        leaderboardContent.appendChild(table);
    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        leaderboardDisplay.classList.remove('hidden');
        setDashboardMessage(leaderboardContent, 'Unable to load leaderboard data.');
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
    // Clear the session server-side; the cookie is HttpOnly so the client
    // cannot expire it on its own.
    fetch('/api/logout', { method: 'POST' }).catch(e => console.error('Logout failed', e));

    isAdmin = false;
    adminClickCount = 0;
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('dashboard-modal').classList.add('hidden');
    setDashboardButtonVisible(false);
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
