document.addEventListener('DOMContentLoaded', () => {
    const gridEl = document.getElementById('grid');
    const scoreEl = document.getElementById('score');
    const bestScoreEl = document.getElementById('best-score');
    const overlay = document.getElementById('game-over-overlay');
    const gameOverText = document.getElementById('game-over-text');
    const finalScoreEl = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const newGameBtn = document.getElementById('new-game-btn');

    const SIZE = 4;
    let grid = [];
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('cp_2048_best') || '0');
    let gameOver = false;
    let won = false;

    bestScoreEl.textContent = bestScore;

    function init() {
        grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        score = 0;
        gameOver = false;
        won = false;
        scoreEl.textContent = '0';
        overlay.classList.add('hidden');
        addRandomTile();
        addRandomTile();
        render();
    }

    function addRandomTile() {
        const empty = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return;
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function render() {
        gridEl.innerHTML = '';

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (grid[r][c] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.setAttribute('data-value', grid[r][c]);
                    tile.textContent = grid[r][c];
                    if (grid[r][c] > 2048) tile.classList.add('super');
                    cell.appendChild(tile);
                }

                gridEl.appendChild(cell);
            }
        }
    }

    function slideRow(row) {
        let arr = row.filter(v => v !== 0);
        let merged = false;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                score += arr[i];
                if (arr[i] === 2048 && !won) {
                    won = true;
                }
                arr[i + 1] = 0;
                merged = true;
                i++;
            }
        }
        arr = arr.filter(v => v !== 0);
        while (arr.length < SIZE) arr.push(0);
        return { result: arr, merged };
    }

    function move(direction) {
        if (gameOver) return;

        let moved = false;
        let anyMerge = false;
        const prev = grid.map(row => [...row]);

        if (direction === 'left') {
            for (let r = 0; r < SIZE; r++) {
                const { result, merged } = slideRow(grid[r]);
                grid[r] = result;
                if (merged) anyMerge = true;
            }
        } else if (direction === 'right') {
            for (let r = 0; r < SIZE; r++) {
                const { result, merged } = slideRow(grid[r].reverse());
                grid[r] = result.reverse();
                if (merged) anyMerge = true;
            }
        } else if (direction === 'up') {
            for (let c = 0; c < SIZE; c++) {
                let col = [];
                for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
                const { result, merged } = slideRow(col);
                for (let r = 0; r < SIZE; r++) grid[r][c] = result[r];
                if (merged) anyMerge = true;
            }
        } else if (direction === 'down') {
            for (let c = 0; c < SIZE; c++) {
                let col = [];
                for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
                col.reverse();
                const { result, merged } = slideRow(col);
                const reversed = result.reverse();
                for (let r = 0; r < SIZE; r++) grid[r][c] = reversed[r];
                if (merged) anyMerge = true;
            }
        }

        // Check if anything changed
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (prev[r][c] !== grid[r][c]) moved = true;
            }
        }

        if (moved) {
            addRandomTile();
            scoreEl.textContent = score;

            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('cp_2048_best', bestScore);
                bestScoreEl.textContent = bestScore;
            }

            if (anyMerge && typeof playPopSound === 'function') playPopSound();
            else if (typeof playClickSound === 'function') playClickSound();

            render();
            addTileAnimations();

            if (checkGameOver()) {
                gameOver = true;
                setTimeout(() => {
                    if (won) {
                        gameOverText.textContent = 'Tebrikler! 2048!';
                        gameOverText.style.color = '#ffcd75';
                    } else {
                        gameOverText.textContent = 'Oyun Bitti!';
                        gameOverText.style.color = '#ff3366';
                    }
                    finalScoreEl.textContent = score;
                    overlay.classList.remove('hidden');

                    // Record stats
                    if (typeof recordGameResult === 'function') {
                        recordGameResult('2048', { won: won, score: score });
                    }
                }, 300);
            }
        }
    }

    function addTileAnimations() {
        const tiles = gridEl.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.classList.add('appear');
            setTimeout(() => tile.classList.remove('appear'), 200);
        });
    }

    function checkGameOver() {
        // Check for empty cells
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === 0) return false;
            }
        }
        // Check for possible merges
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const val = grid[r][c];
                if (c < SIZE - 1 && grid[r][c + 1] === val) return false;
                if (r < SIZE - 1 && grid[r + 1][c] === val) return false;
            }
        }
        return true;
    }

    // Keyboard input
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        switch (e.key) {
            case 'ArrowLeft': case 'a': case 'A': move('left'); break;
            case 'ArrowRight': case 'd': case 'D': move('right'); break;
            case 'ArrowUp': case 'w': case 'W': move('up'); break;
            case 'ArrowDown': case 's': case 'S': move('down'); break;
        }
    });

    // Touch/Swipe support
    let touchStartX = 0, touchStartY = 0;
    const boardWrapper = document.getElementById('board-wrapper');

    boardWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    boardWrapper.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) < 30) return; // too small

        if (absDx > absDy) {
            move(dx > 0 ? 'right' : 'left');
        } else {
            move(dy > 0 ? 'down' : 'up');
        }
    }, { passive: true });

    // Mobile D-pad
    document.querySelectorAll('.d-pad').forEach(btn => {
        btn.addEventListener('click', () => {
            move(btn.getAttribute('data-dir'));
        });
    });

    // Buttons
    restartBtn.addEventListener('click', () => {
        if (typeof playClickSound === 'function') playClickSound();
        init();
    });

    newGameBtn.addEventListener('click', () => {
        if (typeof playClickSound === 'function') playClickSound();
        init();
    });

    backToMenuBtn.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Start
    init();
});
