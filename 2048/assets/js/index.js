import Board from './board.js';

const board = new Board();
board.startGame();

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        board.moveLeft();
    } else if (e.key === 'ArrowRight') {
        board.moveRight();
    } else if (e.key === 'ArrowUp') {
        board.moveUp();
    } else if (e.key === 'ArrowDown') {
        board.moveDown();
    }
});

const restart = document.querySelector("#restart-button");
restart.addEventListener("click", () => {
    board.resetGame();
})