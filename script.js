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
