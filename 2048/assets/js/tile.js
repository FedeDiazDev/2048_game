export default class Tile {
    constructor(value, row, col, dom) {
        this.value = value;
        this.row = row;
        this.col = col;
        this.dom = dom;

        this.updateClass();
    }

    updateClass() {
        this.dom.className = "tile";

        if (this.value === 0) {
            this.dom.classList.add('empty');
            this.dom.textContent = '';
            return;
        }

        if (this.value === 2) this.dom.classList.add('two');
        if (this.value === 4) this.dom.classList.add('four');
        if (this.value === 8) this.dom.classList.add('eight');
        if (this.value === 16) this.dom.classList.add('sixteen');
        if (this.value === 32) this.dom.classList.add('thirty-two');
        if (this.value === 64) this.dom.classList.add('sixty-four');
        if (this.value === 128) this.dom.classList.add('hundred');
        if (this.value === 256) this.dom.classList.add('two-hundred');
        if (this.value === 512) this.dom.classList.add('five-hundred');
        if (this.value === 1024) this.dom.classList.add('thousand');
        if (this.value === 2048) this.dom.classList.add('two-thousand');

        this.dom.textContent = this.value;
    }



}