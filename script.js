document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsModal = document.getElementById('settings-modal');

    // UI elements for settings
    const soundToggle = document.getElementById('setting-sound');
    const effectsToggle = document.getElementById('setting-effects');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Load initial settings to UI (Logic is handled via shared-settings.js)
    soundToggle.checked = cpSettings.sound;
    effectsToggle.checked = cpSettings.effects;

    // Highlight current theme
    themeOptions.forEach(opt => {
        if (opt.getAttribute('data-theme') === cpSettings.theme) {
            opt.classList.add('selected');
        }
    });

    // Open/Close settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        playClickSound(); // uses shared instance if available
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        playClickSound();
    });

    // Handle background clicks on modal to close
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
            playClickSound();
        }
    });

    // Toggle Handlers
    soundToggle.addEventListener('change', (e) => {
        cpSettings.sound = e.target.checked;
        saveSettings();
        playClickSound();
    });

    effectsToggle.addEventListener('change', (e) => {
        cpSettings.effects = e.target.checked;
        saveSettings();
        applySettings();
        playClickSound();
    });

    // Stats Rendering
    function renderStats() {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;
        const stats = getGameStats();
        const games = Object.keys(stats);

        if (games.length === 0) {
            statsGrid.innerHTML = '<p class="stats-empty">Henuz oyun istatistigi yok. Oynamaya basla!</p>';
            return;
        }

        statsGrid.innerHTML = '';
        games.forEach(name => {
            const g = stats[name];
            const winRate = g.played > 0 ? Math.round((g.won / g.played) * 100) : 0;
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <h3>${name}</h3>
                <div class="stat-row"><span class="stat-label">Oynanan</span><span class="stat-value">${g.played}</span></div>
                <div class="stat-row"><span class="stat-label">Kazanilan</span><span class="stat-value">${g.won}</span></div>
                <div class="stat-row"><span class="stat-label">Kazanma %</span><span class="stat-value">${winRate}%</span></div>
                ${g.highScore > 0 ? `<div class="stat-row"><span class="stat-label">Yuksek Skor</span><span class="stat-value" style="color:var(--cp-accent)">${g.highScore}</span></div>` : ''}
            `;
            statsGrid.appendChild(card);
        });
    }
    renderStats();

    // Theme Handlers
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            // update UI
            themeOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');

            // save
            const newTheme = opt.getAttribute('data-theme');
            cpSettings.theme = newTheme;
            saveSettings();
            applySettings();

            playClickSound();
        });
    });

});
