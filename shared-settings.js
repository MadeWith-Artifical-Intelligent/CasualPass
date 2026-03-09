/**
 * Global settings config for CasualPass Platform.
 * Available for both the main dashboard and games.
 */
let cpSettings = {
    sound: true,
    effects: true,
    theme: 'liquid' // 'liquid', 'paper', 'neon', 'retro'
};

// Initialization
function loadSettings() {
    const saved = localStorage.getItem('casualPassSettings');
    if (saved) {
        try {
            cpSettings = { ...cpSettings, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Failed to load CasualPass settings", e);
        }
    }
}

function saveSettings() {
    localStorage.setItem('casualPassSettings', JSON.stringify(cpSettings));
}

function applySettings() {
    // 1. Apply Theme Classes to body
    document.body.className = ''; // reset classes
    document.body.classList.add(`theme-${cpSettings.theme}`);

    // 2. Effects
    if (!cpSettings.effects) {
        document.body.classList.add('disable-effects');
    } else {
        document.body.classList.remove('disable-effects');
    }

    // 3. Inject global background structure if needed
    const bgContainer = document.getElementById('global-bg-container');
    if (bgContainer) {
        if (cpSettings.theme === 'liquid' && cpSettings.effects) {
            bgContainer.innerHTML = `
                <div class="blob blob-1"></div>
                <div class="blob blob-2"></div>
                <div class="blob blob-3"></div>
            `;
        } else {
            bgContainer.innerHTML = '';
        }
    }
}

// Global Sound Management
function playClickSound() {
    if (cpSettings.sound) {
        const audio = document.getElementById('global-click-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play ignored prior to user interaction'));
        }
    }
}

function playPopSound() {
    if (cpSettings.sound) {
        const audio = document.getElementById('global-pop-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 0.6;
            audio.play().catch(e => console.log('Audio play ignored prior to user interaction'));
        }
    }
}

/**
 * Game Statistics System
 */
function getGameStats() {
    const saved = localStorage.getItem('casualPassStats');
    if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
    }
    return {};
}

function saveGameStats(stats) {
    localStorage.setItem('casualPassStats', JSON.stringify(stats));
}

function recordGameResult(gameName, result) {
    // result: { won: bool, score: number (optional), duration: seconds (optional) }
    const stats = getGameStats();
    if (!stats[gameName]) {
        stats[gameName] = { played: 0, won: 0, highScore: 0, totalScore: 0 };
    }
    const g = stats[gameName];
    g.played++;
    if (result.won) g.won++;
    if (typeof result.score === 'number') {
        g.totalScore += result.score;
        if (result.score > g.highScore) g.highScore = result.score;
    }
    saveGameStats(stats);
}

function getHighScore(gameName) {
    const stats = getGameStats();
    return (stats[gameName] && stats[gameName].highScore) || 0;
}

// Ensure settings apply whenever a page loads this script
loadSettings();
document.addEventListener('DOMContentLoaded', () => {
    applySettings();
});
