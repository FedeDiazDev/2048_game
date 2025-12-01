import Tile from './tile.js';

export default class Board {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.boardElement = document.querySelector('.board');
        this.score = 0;

        this.createOverlay();

        let i = 0;
        const domCells = Array.from(this.boardElement.children);
        for (let row = 0; row < this.size; row++) {
            const rowArray = [];
            for (let col = 0; col < this.size; col++) {
                const tile = new Tile(0, row, col, domCells[i]);
                rowArray.push(tile);
                i++;
            }
            this.grid.push(rowArray);

        }

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

    moveLeft() {
        let moved = false;
        for (let row = 0; row < this.size; row++) {
            let rowValues = this.grid[row].map(tile => tile.value);
            let originalRow = [...rowValues];
            rowValues = this.compressLine(rowValues);
            const combineResult = this.combineTiles(rowValues);
            rowValues = combineResult.rowValues;
            const merges = combineResult.merges;
            rowValues = this.compressLine(rowValues);

            for (let col = 0; col < this.size; col++) {
                this.grid[row][col].value = rowValues[col];
                this.grid[row][col].updateClass();
                if (merges.includes(col) && this.grid[row][col].value !== 0) {
                    this.grid[row][col].dom.classList.add('tile-merged');
                    this.grid[row][col].dom.addEventListener('animationend', () => {
                        this.grid[row][col].dom.classList.remove('tile-merged');
                    }, { once: true });
                }
            }
            if (!moved && rowValues.some((val, i) => val !== originalRow[i])) {
                moved = true;
            }
        }
        if (moved) {
            this.spawnRandomTile();
            this.checkGameState();
        }

    }

    moveRight() {
        let moved = false;
        for (let row = 0; row < this.size; row++) {
            let rowValues = this.grid[row].map(tile => tile.value);
            let originalRow = [...rowValues];

            rowValues.reverse();
            rowValues = this.compressLine(rowValues);
            const combineResult = this.combineTiles(rowValues);
            rowValues = combineResult.rowValues;
            const merges = combineResult.merges;
            rowValues = this.compressLine(rowValues);
            rowValues.reverse();

            for (let col = 0; col < this.size; col++) {
                this.grid[row][col].value = rowValues[col];
                this.grid[row][col].updateClass();
                const reversedIndex = this.size - 1 - col;
                if (merges.includes(reversedIndex) && this.grid[row][col].value !== 0) {
                    this.grid[row][col].dom.classList.add('tile-merged');
                    this.grid[row][col].dom.addEventListener('animationend', () => {
                        this.grid[row][col].dom.classList.remove('tile-merged');
                    }, { once: true });
                }
            }
            if (!moved && rowValues.some((val, i) => val !== originalRow[i])) {
                moved = true;
            }
        }
        if (moved) {
            this.spawnRandomTile();
            this.checkGameState();
        }
    }


    moveUp() {
        let moved = false;
        for (let col = 0; col < this.size; col++) {

            let colValues = [];
            for (let row = 0; row < this.size; row++) {
                colValues.push(this.grid[row][col].value);
            }

            let originalCol = [...colValues];
            colValues = this.compressLine(colValues);
            const combineResult = this.combineTiles(colValues);
            colValues = combineResult.rowValues;
            const merges = combineResult.merges;
            colValues = this.compressLine(colValues);

            for (let row = 0; row < this.size; row++) {
                this.grid[row][col].value = colValues[row];
                this.grid[row][col].updateClass();
                if (merges.includes(row) && this.grid[row][col].value !== 0) {
                    this.grid[row][col].dom.classList.add('tile-merged');
                    this.grid[row][col].dom.addEventListener('animationend', () => {
                        this.grid[row][col].dom.classList.remove('tile-merged');
                    }, { once: true });
                }
            }
            if (!moved && colValues.some((v, i) => v !== originalCol[i])) {
                moved = true;
            }
        }
        if (moved) {
            this.spawnRandomTile();
            this.checkGameState();
        }
    }

    moveDown() {
        let moved = false;
        for (let col = 0; col < this.size; col++) {

            let colValues = [];
            for (let row = 0; row < this.size; row++) {
                colValues.push(this.grid[row][col].value);
            }

            let originalCol = [...colValues];

            colValues.reverse();
            colValues = this.compressLine(colValues);
            const combineResult = this.combineTiles(colValues);
            colValues = combineResult.rowValues;
            const merges = combineResult.merges;
            colValues = this.compressLine(colValues);
            colValues.reverse();

            for (let row = 0; row < this.size; row++) {
                this.grid[row][col].value = colValues[row];
                this.grid[row][col].updateClass();
                const reversedIndex = this.size - 1 - row;
                if (merges.includes(reversedIndex) && this.grid[row][col].value !== 0) {
                    this.grid[row][col].dom.classList.add('tile-merged');
                    this.grid[row][col].dom.addEventListener('animationend', () => {
                        this.grid[row][col].dom.classList.remove('tile-merged');
                    }, { once: true });
                }
            }
            if (!moved && colValues.some((v, i) => v !== originalCol[i])) {
                moved = true;
            }
        }
        if (moved) {
            this.spawnRandomTile();
            this.checkGameState();
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
