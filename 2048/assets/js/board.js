import Tile from './tile.js';

export default class Board {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.isAnimating = false;
        this.boardElement = document.querySelector('.board');
        this.boardElement.innerHTML =
            `        <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>
                <div class="tile"></div>`;
        this.score = 0;

        this.createOverlay();

        let i = 0;
        const domCells = Array.from(this.boardElement.children);
        this.cellElements = domCells.slice();
        for (let row = 0; row < this.size; row++) {
            const rowArray = [];
            for (let col = 0; col < this.size; col++) {
                const tile = new Tile(0, row, col, domCells[i]);
                rowArray.push(tile);
                i++;
            }
            this.grid.push(rowArray);

        }

        this.floatingLayer = document.createElement('div');
        this.floatingLayer.className = 'floating-layer';
        this.boardElement.appendChild(this.floatingLayer);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'game-overlay';
        this.overlay.innerHTML = `
            <div class="panel">
                <div class="title" id="overlay-title"></div>
                <div id="overlay-sub"></div>
                <button id="overlay-restart">Reiniciar</button>
            </div>`;
        document.body.appendChild(this.overlay);
        this.overlay.querySelector('#overlay-restart').addEventListener('click', () => {
            this.hideOverlay();
            this.resetGame();
        });
    }

    showOverlay(title, sub = '') {
        const t = this.overlay.querySelector('#overlay-title');
        const s = this.overlay.querySelector('#overlay-sub');
        t.textContent = title;
        s.textContent = sub;
        this.overlay.classList.add('show');
    }

    hideOverlay() {
        this.overlay.classList.remove('show');
    }

    resetGame() {
        this.score = 0;
        this.updateScore();
        this.startGame();
    }


    startGame() {

        if (this.floatingLayer) {
            this.floatingLayer.innerHTML = '';
        }

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.grid[row][col].value = 0;
                this.grid[row][col].updateClass();
            }
        }
        this.spawnRandomTile();
        this.spawnRandomTile();
    }

    spawnRandomTile() {
        let emptyTiles = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col].value === 0) {
                    emptyTiles.push(this.grid[row][col]);
                }
            }
        }
        if (emptyTiles.length === 0) return;

        const randomIndex = Math.floor(Math.random() * emptyTiles.length);
        const tile = emptyTiles[randomIndex];
        tile.value = Math.random() < 0.9 ? 2 : 4;
        tile.updateClass();
        tile.dom.classList.add('tile-new');
        tile.dom.addEventListener('animationend', () => {
            tile.dom.classList.remove('tile-new');
        }, { once: true });
        this.updateScore();

    }


    getCellRect(row, col) {
        const boardRect = this.boardElement.getBoundingClientRect();
        const cell = this.cellElements[row * this.size + col];
        const cellRect = cell.getBoundingClientRect();
        return {
            left: cellRect.left - boardRect.left,
            top: cellRect.top - boardRect.top,
            width: cellRect.width,
            height: cellRect.height
        };
    }


    createFloatingTile(value, row, col) {
        const { left, top, width, height } = this.getCellRect(row, col);
        const el = document.createElement('div');
        el.className = 'tile';


        if (value === 2) el.classList.add('two');
        if (value === 4) el.classList.add('four');
        if (value === 8) el.classList.add('eight');
        if (value === 16) el.classList.add('sixteen');
        if (value === 32) el.classList.add('thirty-two');
        if (value === 64) el.classList.add('sixty-four');
        if (value === 128) el.classList.add('hundred');
        if (value === 256) el.classList.add('two-hundred');
        if (value === 512) el.classList.add('five-hundred');
        if (value === 1024) el.classList.add('thousand');
        if (value === 2048) el.classList.add('two-thousand');

        el.textContent = value;
        el.style.position = 'absolute';
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.transform = `translate(${left}px, ${top}px)`;
        el.style.transition = 'transform 100ms cubic-bezier(0.22, 0.9, 0.2, 1)';
        el.style.pointerEvents = 'none';

        this.floatingLayer.appendChild(el);
        return el;
    }

    animateMoves(moves) {
        return new Promise(resolve => {
            if (!moves || moves.length === 0) return resolve();

            let pending = moves.length;
            const onEnd = () => {
                pending--;
                if (pending === 0) resolve();
            };

            moves.forEach(m => {
                const { left, top } = this.getCellRect(m.toRow, m.toCol);

                void m.el.offsetWidth;
                m.el.style.transform = `translate(${left}px, ${top}px)`;

                m.el.addEventListener('transitionend', () => {
                    onEnd();
                }, { once: true });


                setTimeout(() => {
                    if (m.el && m.el.parentElement) {
                        m.el.remove();
                        onEnd();
                    }
                }, 100);
            });
        });
    }

    moveLeft() {
        let moved = false;

        const allAnimations = [];
        const gridUpdates = [];
        const tilesToHide = [];
        if (this.isAnimating) return;
        for (let row = 0; row < this.size; row++) {

            let rowValues = this.grid[row].map(tile => tile.value);
            let originalRow = [...rowValues];


            const originalPositions = [];
            for (let col = 0; col < this.size; col++) {
                if (rowValues[col] !== 0) {
                    originalPositions.push({ col, value: rowValues[col] });
                    tilesToHide.push(this.grid[row][col].dom);
                }
            }


            rowValues = this.compressLine(rowValues);
            const combineResult = this.combineTiles(rowValues);
            rowValues = combineResult.rowValues;
            const merges = combineResult.merges;
            rowValues = this.compressLine(rowValues);


            const finalPositions = [];
            for (let col = 0; col < this.size; col++) {
                if (rowValues[col] !== 0) {
                    finalPositions.push({ col, value: rowValues[col] });
                }
            }


            const moves = [];
            let writeCol = 0;
            let origIdx = 0;

            while (origIdx < originalPositions.length) {
                const current = originalPositions[origIdx];
                const next = originalPositions[origIdx + 1];

                if (next && current.value === next.value) {

                    moves.push({
                        el: this.createFloatingTile(current.value, row, current.col),
                        toRow: row,
                        toCol: writeCol
                    });

                    moves.push({
                        el: this.createFloatingTile(next.value, row, next.col),
                        toRow: row,
                        toCol: writeCol
                    });

                    origIdx += 2;
                } else {

                    moves.push({
                        el: this.createFloatingTile(current.value, row, current.col),
                        toRow: row,
                        toCol: writeCol
                    });
                    origIdx++;
                }

                writeCol++;
            }


            if (!moved && rowValues.some((val, i) => val !== originalRow[i])) {
                moved = true;
            }


            gridUpdates.push({ row, rowValues, merges });


            allAnimations.push(this.animateMoves(moves));
        }

        if (moved) {
            this.isAnimating = true;
            tilesToHide.forEach(tile => {
                tile.classList.remove('two', 'four', 'eight', 'sixteen', 'thirty-two', 'sixty-four', 'hundred', 'two-hundred', 'five-hundred', 'thousand', 'two-thousand');
                tile.classList.add('empty');
                tile.textContent = '';
            });

            Promise.all(allAnimations).then(() => {
                gridUpdates.forEach(({ row, rowValues, merges }) => {
                    for (let col = 0; col < this.size; col++) {
                        this.grid[row][col].value = rowValues[col];
                        this.grid[row][col].updateClass();
                    }
                });
                this.floatingLayer.innerHTML = '';
                this.spawnRandomTile();
                this.checkGameState();
                this.isAnimating = false;
            });
        }
    }

    moveRight() {
        let moved = false;
        const allAnimations = [];
        const gridUpdates = [];
        const tilesToHide = [];

        if (this.isAnimating) return;
        for (let row = 0; row < this.size; row++) {
            let rowValues = this.grid[row].map(tile => tile.value);
            let originalRow = [...rowValues];


            const originalPositions = [];
            for (let col = this.size - 1; col >= 0; col--) {
                if (rowValues[col] !== 0) {
                    originalPositions.push({ col, value: rowValues[col] });
                    tilesToHide.push(this.grid[row][col].dom);
                }
            }


            rowValues.reverse();
            rowValues = this.compressLine(rowValues);
            const combineResult = this.combineTiles(rowValues);
            rowValues = combineResult.rowValues;
            const merges = combineResult.merges;
            rowValues = this.compressLine(rowValues);
            rowValues.reverse();


            const finalPositions = [];
            for (let col = this.size - 1; col >= 0; col--) {
                if (rowValues[col] !== 0) {
                    finalPositions.push({ col, value: rowValues[col] });
                }
            }


            

            const moves = [];
            let writeCol = this.size - 1; 
            let origIdx = 0;

            while (origIdx < originalPositions.length) {
                const current = originalPositions[origIdx];
                const next = originalPositions[origIdx + 1];

                if (next && current.value === next.value) {
                    
                    moves.push({ el: this.createFloatingTile(current.value, row, current.col), toRow: row, toCol: writeCol });
                    moves.push({ el: this.createFloatingTile(next.value, row, next.col), toRow: row, toCol: writeCol });
                    origIdx += 2;
                } else {
                    
                    moves.push({ el: this.createFloatingTile(current.value, row, current.col), toRow: row, toCol: writeCol });
                    origIdx++;
                }
                writeCol--; 
            }

            if (!moved && rowValues.some((val, i) => val !== originalRow[i])) {
                moved = true;
            }

            gridUpdates.push({ row, rowValues, merges });
            allAnimations.push(this.animateMoves(moves));
        }

        if (moved) {
            this.isAnimating = true;
            tilesToHide.forEach(tile => {
                tile.classList.remove('two', 'four', 'eight', 'sixteen', 'thirty-two', 'sixty-four', 'hundred', 'two-hundred', 'five-hundred', 'thousand', 'two-thousand');
                tile.classList.add('empty');
                tile.textContent = '';
            });

            Promise.all(allAnimations).then(() => {
                gridUpdates.forEach(({ row, rowValues, merges }) => {
                    for (let col = 0; col < this.size; col++) {
                        this.grid[row][col].value = rowValues[col];
                        this.grid[row][col].updateClass();
                    }
                });
                this.floatingLayer.innerHTML = '';
                this.spawnRandomTile();
                this.checkGameState();
                this.isAnimating = false;

            });
        }
    }


    moveUp() {
        let moved = false;
        const allAnimations = [];
        const gridUpdates = [];
        const tilesToHide = [];

        if (this.isAnimating) return;
        for (let col = 0; col < this.size; col++) {
            let colValues = [];
            let originalCol = [];


            for (let row = 0; row < this.size; row++) {
                colValues.push(this.grid[row][col].value);
                originalCol.push(this.grid[row][col].value);
            }


            const originalPositions = [];
            for (let row = 0; row < this.size; row++) {
                if (colValues[row] !== 0) {
                    originalPositions.push({ row, value: colValues[row] });
                    tilesToHide.push(this.grid[row][col].dom);
                }
            }


            colValues = this.compressLine(colValues);
            const combineResult = this.combineTiles(colValues);
            colValues = combineResult.rowValues;
            const merges = combineResult.merges;
            colValues = this.compressLine(colValues);


            const finalPositions = [];
            for (let row = 0; row < this.size; row++) {
                if (colValues[row] !== 0) {
                    finalPositions.push({ row, value: colValues[row] });
                }
            }


            

            const moves = [];
            let writeRow = 0; 
            let origIdx = 0;

            while (origIdx < originalPositions.length) {
                const current = originalPositions[origIdx];
                const next = originalPositions[origIdx + 1];

                if (next && current.value === next.value) {
                    
                    moves.push({ el: this.createFloatingTile(current.value, current.row, col), toRow: writeRow, toCol: col });
                    moves.push({ el: this.createFloatingTile(next.value, next.row, col), toRow: writeRow, toCol: col });
                    origIdx += 2;
                } else {
                    
                    moves.push({ el: this.createFloatingTile(current.value, current.row, col), toRow: writeRow, toCol: col });
                    origIdx++;
                }
                writeRow++; 
            }

            if (!moved && colValues.some((v, i) => v !== originalCol[i])) {
                moved = true;
            }

            gridUpdates.push({ col, colValues, merges });
            allAnimations.push(this.animateMoves(moves));
        }

        if (moved) {
            this.isAnimating = true;
            tilesToHide.forEach(tile => {
                tile.classList.remove('two', 'four', 'eight', 'sixteen', 'thirty-two', 'sixty-four', 'hundred', 'two-hundred', 'five-hundred', 'thousand', 'two-thousand');
                tile.classList.add('empty');
                tile.textContent = '';
            });

            Promise.all(allAnimations).then(() => {
                gridUpdates.forEach(({ col, colValues, merges }) => {
                    for (let row = 0; row < this.size; row++) {
                        this.grid[row][col].value = colValues[row];
                        this.grid[row][col].updateClass();
                    }
                });

                this.floatingLayer.innerHTML = '';
                this.spawnRandomTile();
                this.checkGameState();
                this.isAnimating = false;

            });
        }
    }

    moveDown() {
        let moved = false;
        const allAnimations = [];
        const gridUpdates = [];
        const tilesToHide = [];

        if (this.isAnimating) return;
        for (let col = 0; col < this.size; col++) {
            let colValues = [];
            let originalCol = [];


            for (let row = 0; row < this.size; row++) {
                colValues.push(this.grid[row][col].value);
                originalCol.push(this.grid[row][col].value);
            }


            const originalPositions = [];
            for (let row = this.size - 1; row >= 0; row--) {
                if (colValues[row] !== 0) {
                    originalPositions.push({ row, value: colValues[row] });
                    tilesToHide.push(this.grid[row][col].dom);
                }
            }


            colValues.reverse();
            colValues = this.compressLine(colValues);
            const combineResult = this.combineTiles(colValues);
            colValues = combineResult.rowValues;
            const merges = combineResult.merges;
            colValues = this.compressLine(colValues);
            colValues.reverse();


            const finalPositions = [];
            for (let row = this.size - 1; row >= 0; row--) {
                if (colValues[row] !== 0) {
                    finalPositions.push({ row, value: colValues[row] });
                }
            }

            

            const moves = [];
            let writeRow = this.size - 1; 
            let origIdx = 0;

            while (origIdx < originalPositions.length) {
                const current = originalPositions[origIdx];
                const next = originalPositions[origIdx + 1];

                if (next && current.value === next.value) {
                    
                    moves.push({ el: this.createFloatingTile(current.value, current.row, col), toRow: writeRow, toCol: col });
                    moves.push({ el: this.createFloatingTile(next.value, next.row, col), toRow: writeRow, toCol: col });
                    origIdx += 2;
                } else {
                    
                    moves.push({ el: this.createFloatingTile(current.value, current.row, col), toRow: writeRow, toCol: col });
                    origIdx++;
                }
                writeRow--; 
            }

            if (!moved && colValues.some((v, i) => v !== originalCol[i])) {
                moved = true;
            }

            gridUpdates.push({ col, colValues, merges });
            allAnimations.push(this.animateMoves(moves));
        }

        if (moved) {
            this.isAnimating = false;

            tilesToHide.forEach(tile => {
                tile.classList.remove('two', 'four', 'eight', 'sixteen', 'thirty-two', 'sixty-four', 'hundred', 'two-hundred', 'five-hundred', 'thousand', 'two-thousand');
                tile.classList.add('empty');
                tile.textContent = '';
            });

            Promise.all(allAnimations).then(() => {
                gridUpdates.forEach(({ col, colValues, merges }) => {
                    for (let row = 0; row < this.size; row++) {
                        this.grid[row][col].value = colValues[row];
                        this.grid[row][col].updateClass();
                    }
                });

                this.floatingLayer.innerHTML = '';
                this.spawnRandomTile();
                this.checkGameState();
                this.isAnimating = false;
            });
        }
    }

    compressLine(rowValues) {
        let rowCompressed = rowValues.filter(tile => tile !== 0);
        while (rowCompressed.length < this.size) {
            rowCompressed.push(0);
        }
        return rowCompressed;
    }

    combineTiles(rowValues) {
        const merges = [];
        for (let i = 0; i < rowValues.length - 1; i++) {
            if (rowValues[i] !== 0 && rowValues[i] === rowValues[i + 1]) {
                rowValues[i] *= 2;
                this.score += rowValues[i];
                merges.push(i);
                rowValues[i + 1] = 0;
            }
        }
        if (merges.length > 0) this.updateScore();
        return { rowValues, merges };
    }
    updateScore() {
        document.getElementById("score").textContent = this.score;
    }

    checkGameState() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c].value >= 2048) {
                    this.showOverlay('¡Ganaste!', 'Has alcanzado 2048');
                    return;
                }
            }
        }
        if (!this.hasMoves()) {
            this.showOverlay('Juego terminado', 'No hay movimientos posibles');
        }
    }

    hasMoves() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c].value === 0) return true;
            }
        }
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.grid[r][c].value;
                if (r + 1 < this.size && this.grid[r + 1][c].value === val) return true;
                if (c + 1 < this.size && this.grid[r][c + 1].value === val) return true;
            }
        }
        return false;
    }

}
