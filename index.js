let game;

let gameState = 0;

function getRandomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
class Tile{
    constructor(x,y,value){
    this.x = x;
    this.y = y;
    this.value = value;
    this.display = 0;
    }
}

let neighbor = [[-1, -1], [-1, 0], [-1, +1], [0, -1], [0, +1], [+1, -1], [+1, 0], [+1, +1]];


class Grid{
    rows;
    cols;
    bombTiles = [];
    mineNumber;
    constructor(rows,cols,mineNumber){
        this.rows = rows;
        this.cols = cols;
        this.mineNumber = mineNumber;
        for(let i=0 ; i<rows; i++){
            this.bombTiles[i] = [];
            for(let j=0; j<cols; j++){
                this.bombTiles[i][j] = new Tile(i,j,-2);
            }
        }
    }
    generateMines(){
        for(let i=0; i<this.mineNumber; i++) this.spawnMine();   
        //this.printBoardValue();
    }

    spawnMine(){
        let x;
        let y;
        do{
            x = getRandomNumberInRange(0,this.rows-1);
            y = getRandomNumberInRange(0, this.cols-1);
        }while(this.bombTiles[x][y].value != -2);
        this.bombTiles[x][y].value = -1;
    }

    createButtons(){
        document.getElementById("game").remove();
        const div = document.createElement("div");
        div.id = "game";
        document.body.appendChild(div);
        for(let i=0; i<this.rows; i++){
            div.appendChild(document.createElement('br'));
            for(let j=0; j<this.cols; j++){
                const btn = document.createElement(`button`);
                btn.classList.add("tile")
                btn.id = Help.convert2dTo1d(i, j, this.cols);
                div.appendChild(btn);
                btn.innerHTML= "&nbsp";
                btn.addEventListener('click', () =>{this.leftClick(i, j)});
                btn.addEventListener('contextmenu', (btn) =>{btn.preventDefault() ;this.rightClick(i, j); return false});
            }
        }
    }
    
    printBoardValue(){
        let msg = "";
        for(let i=0 ; i<this.rows; i++){
            msg += "\n";
            for(let j=0; j<this.cols; j++){
                msg += `${this.bombTiles[i][j].value}`;
            }
        }
        console.log(msg);   
    }

    refreshBtn(){
        for(let i=0 ; i<this.rows; i++){
            for(let j=0; j<this.cols; j++){
                if(this.bombTiles[i][j].display == 1){
                    const btn = document.getElementById(Help.convert2dTo1d(i, j, this.cols));
                    btn.innerHTML = this.bombTiles[i][j].value;
                    btn.classList.add("tile_open");
                    switch(this.bombTiles[i][j].value){
                        case 0:
                            btn.innerHTML = "&nbsp";
                            break;
                    }
                }
                else if(this.bombTiles[i][j].display == 2){ 
                    const btn = document.getElementById(Help.convert2dTo1d(i, j, this.cols));
                    btn.innerHTML = String.fromCodePoint(0x1F6A9);
                }
                else if(this.bombTiles[i][j].display == 0){ 
                    const btn = document.getElementById(Help.convert2dTo1d(i, j, this.cols));
                    btn.innerHTML = "&nbsp";
                }
            }
        }
        this.isGameWon();
        switch(gameState){
            case -1:
                this.messageLose();
                break;
            case 0:
               // console.log("Ongoing");
                break;
            case 1:
                this.messageWin();
                break;
        }
    }

    generateNeighbours(){
        for(let i=0 ; i<this.rows; i++){
            for(let j=0; j<this.cols; j++){
                if(this.bombTiles[i][j].value != -1){
                    let tmpValue = 0;
                    for(let k=0; k<8; k++){
                        let x = i + neighbor[k][0];
                        let y = j + neighbor[k][1];
                        if (x >= 0 && x < this.rows && y >= 0 && y < this.cols) {
                            if (this.bombTiles[x][y].value == -1)
                                tmpValue++;
                        }
                    }
                    this.bombTiles[i][j].value = tmpValue;
                }
            }
        }
    }
    rightClick(x, y){
        if(gameState == 0){
            if(this.bombTiles[x][y].display == 0)
                this.bombTiles[x][y].display = 2;
            else if(this.bombTiles[x][y].display == 2)
                this.bombTiles[x][y].display = 0;
            this.refreshBtn();
        }   
    }

    leftClick(x, y){
        if(gameState == 0){
            if(this.bombTiles[x][y].value == 0 && this.bombTiles[x][y].display == 0){
                this.clickZeroTile(x, y);
            }
            else if(this.bombTiles[x][y].value == -1){
                this.clickBomb(x, y);
            }
            else if(this.bombTiles[x][y].display == 0){
                this.clickNonZeroTile(x, y);
            }
            this.refreshBtn();
        }
    }

    clickBomb(x, y){
        gameState = -1;
    }

    clickNonZeroTile(x, y){
        this.bombTiles[x][y].display = 1;
    }

    clickZeroTile(x, y){
        let flood = [];
        this.bombTiles[x][y].display = 1;
        flood.push(this.bombTiles[x][y]);
        while(flood.length !=0){

            let tile = flood.pop();

            for(let k=0; k<8; k++){
                let x = tile.x + neighbor[k][0];
                let y = tile.y + neighbor[k][1];
                
                if (x >= 0 && x < this.rows && y >= 0 && y < this.cols) {
                    if (this.bombTiles[x][y].value == 0 && this.bombTiles[x][y].display == 0){
                        flood.push(this.bombTiles[x][y]);
                        this.bombTiles[x][y].display = 1;
                    }
                }
            }

            for(let k=0; k<8; k++){
                let x = tile.x + neighbor[k][0];
                let y = tile.y + neighbor[k][1];
                
                if (x >= 0 && x < this.rows && y >= 0 && y < this.cols) {
                    if (this.bombTiles[x][y].value != 0 && this.bombTiles[x][y].display == 0){
                        this.bombTiles[x][y].display = 1;
                    }
                }
            }

        }
    }

    isGameWon(){
        let realCount = 0;
        for (let i=0; i<this.rows; i++) {
            for (let j=0; j<this.cols; j++) {
                if (this.bombTiles[i][j].value != -1 &&
                    this.bombTiles[i][j].display != 1)
                    realCount++;
            }
        }
        if(realCount == 0) gameState = 1;
    }

    messageLose(){
        for (let i=0; i<this.rows; i++) {
            for (let j=0; j<this.cols; j++) {
                if (this.bombTiles[i][j].value == -1){
                    const btn = document.getElementById(Help.convert2dTo1d(i, j, this.cols));
                    btn.innerHTML = String.fromCodePoint(0x1F4A3);
                    btn.classList.add("bomb");
                    
                }
            }
        }
        document.body.classList.add("body_lose");
    }
    messageWin(){
        document.body.classList.add("body_win");
    }
}
 
 class Help{
   static convert2dTo1d(x, y, cols){
        return x * cols + y;
    }
    static convert1dTo2d(id,cols){
        return {
            y: id % cols,
            x: (id-this.y)/cols
        };
    }
 }
 


const startGame = () =>{
    gameState = 0;
    const rows = parseInt(document.getElementById("rows").value);
    const cols = parseInt(document.getElementById("cols").value);
    const mines = parseInt(document.getElementById("mines").value);

    document.body.classList.remove("body_lose");
    document.body.classList.remove("body_win");

    if(rows*cols < mines) {
        game.messageLose();
        return;
    }

    // console.log(`
    //     Rows: ${rows}
    //     Cols: ${cols}
    //     Mines: ${mines}
    // `);

    game = new Grid(rows, cols, mines);
    game.createButtons();
    game.generateMines();
    game.generateNeighbours();
}

document.getElementById("start").addEventListener("click", startGame);