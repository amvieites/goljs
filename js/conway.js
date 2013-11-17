/***********************************************************************/
//
// Dumb Game of Life implementation v0.1
//
/***********************************************************************/

/************************/
/* Game logic functions */
/************************/

function Game(gameProperties) {
	var divObject = document.getElementById(gameProperties.divId);
	
	if (!gameProperties.width) {
		gameProperties.width = 200;
	}
	if (!gameProperties.height) {
		gameProperties.height = 100;
	}
	if (!gameProperties.squareSide) {
		gameProperties.squareSide = 5;
	}
	if (!gameProperties.linesWidth) {
		gameProperties.linesWidth = 1;
	}
	if (!gameProperties.linesColour) {
		gameProperties.linesColour = "#f00";
	}
	if (!gameProperties.gradientLight) {
		gameProperties.gradientLight = "#aaa";
	}
	if (!gameProperties.gradientDark) {
		gameProperties.gradientDark = "#555";
	}
	if (!gameProperties.squareColour) {
		gameProperties.squareColour = "#000";
	}
	if (!gameProperties.spawnTimeMs) {
		gameProperties.spawnTimeMs = 750;
	}
	this.gameProperties = gameProperties;

	this.normalizeMeasures();
	this.board = [];
	for (var i = 0; i<this.gameProperties.width / this.gameProperties.squareSide; i++) {
		this.board.push(new Array(this.gameProperties.height/this.gameProperties.squareSide));
	}
	this.evolutionStrategy = new EvolutionStrategy(this.board, this.gameProperties.pattern);

	this.colonyViewer = new ColonyViewer(divObject, this.gameProperties.width,
		this.gameProperties.height, this.gameProperties.squareSide, this.gameProperties.linesColour,
		this.gameProperties.linesWidth, this.gameProperties.squareColour, this.gameProperties.backgroundColour);

	this.newGame();
}

Game.prototype.newGame = function() {
	this.playing = true;
	this.generation = 0;
	this.livingCells
	this.colonyViewer.initializeCanvas();
	this.colonyViewer.paintEcosystem(this.evolutionStrategy.board, this.gameProperties.squareColour);
	
	this.loop = delayRemove(this);
}

function delayRemove(this1) {
  return window.setInterval(function(_this) {
      _this.nextStage();
    }, this1.gameProperties.spawnTimeMs, this1);
}

Game.prototype.nextStage = function() {
	this.generation++;
	this.livingCells = this.evolutionStrategy.nextGeneration(this.board);
	this.colonyViewer.paintEcosystem(this.board, this.gameProperties.pattern.name, this.generation, this.livingCells);

	if (this.evolutionStrategy.currentCells <= 0) {
		window.clearInterval(this.loop);
	}
}

Game.prototype.normalizeMeasures = function() {
	this.gameProperties.width = Math.floor(this.gameProperties.width / this.gameProperties.squareSide) * this.gameProperties.squareSide;
	this.gameProperties.height = Math.floor(this.gameProperties.height / this.gameProperties.squareSide) * this.gameProperties.squareSide;
}

function EvolutionStrategy(board, pattern) {
	this.board = board;
	this.pattern = pattern;
	for(var i = 0; i<pattern.cells.length; i++) {
		this.board[pattern.cells[i][0]][pattern.cells[i][1]] = 1;
	}
}

EvolutionStrategy.prototype.nextGeneration = function () {
	var newInhabitants = [];

	for (var x=0; x<this.board.length; x++) {
		for (var y=0; y<this.board[0].length; y++) {
			var neighbours = this.countNeighbours(x, y);
			if (this.board[x][y]){	// There's life already
				if (this.survives(neighbours)) {
					newInhabitants.push(new Cell(x, y));
				}
			} else {
				if (this.birth(neighbours)) {
					newInhabitants.push(new Cell(x, y));
				}
			}
		}
	}

	for (var x=0; x<this.board.length; x++) {
		for (var y=0; y<this.board[0].length; y++) {
			this.board[x][y] = undefined;
		}
	}

	for (var i = 0; i< newInhabitants.length; i++) {
		this.board[newInhabitants[i].x][newInhabitants[i].y] = 1;
	}

	return newInhabitants.length;
}

EvolutionStrategy.prototype.birth = function(neighbours) {
	return neighbours == 3;
}

EvolutionStrategy.prototype.survives = function(neighbours) {
	return neighbours < 4 && neighbours > 1;
}

EvolutionStrategy.prototype.countNeighbours = function(x, y) {
	var neighbours = 0;
	if (x>0 && y > 0 && this.board[x-1][y-1]) neighbours++;
	if (x>0 && this.board[x-1][y]) neighbours++;
	if (x>0 && y < this.board[0].length-1 && this.board[x-1][y+1]) neighbours++;


	if (x<this.board.length-1 && y > 0 && this.board[x+1][y-1]) neighbours++;
	if (x<this.board.length-1 && this.board[x+1][y]) neighbours++;
	if (x<this.board.length-1 && y < this.board[0].length-1 && this.board[x+1][y+1]) neighbours++;

	if (y > 0 && this.board[x][y-1]) neighbours++;
	if (y < this.board[0].length-1 && this.board[x][y+1]) neighbours++;
	
	return neighbours;
}

function Cell(x, y) {
	this.x = x;
	this.y = y;
}

/**********************/
/* Drawing functions. */
/**********************/

function ColonyViewer(divObject, width, height, squareSide,	linesColour, linesWidth, squareColour, backgroundColour) {
	this.width = width;
	this.height = height;
	this.squareSide = squareSide;
	this.squareColour = squareColour;
	this.backgroundColour = backgroundColour;
	this.linesWidth = linesWidth;
	this.linesColour = linesColour;

	divObject.innerHTML = "<canvas id=\"conway-game\" width=\""
		+ this.width + "\" height=\"" + this.height + "\"></canvas>";
	this.canvas = divObject.firstChild;
}

ColonyViewer.prototype.initializeCanvas = function() {
	var ctx = this.canvas.getContext("2d");
	ctx.strokeStyle = this.linesColour;
	ctx.lineWidth = this.linesWidth;

	// Draw columns
	for (var x=0; x<=this.width; x=x+this.squareSide){
	  ctx.moveTo(x,0);
	  ctx.lineTo(x,this.height);
	}

	// Draw rows
	for (var y=0; y<=this.height; y=y+this.squareSide){
	  ctx.moveTo(0,y);
	  ctx.lineTo(this.width, y);
	}

	ctx.stroke();
}

ColonyViewer.prototype.paintEcosystem = function(board, pattern, generation, livingCells) {
	for (var x=0; x<board.length; x++) {
		for (var y=0; y<board[0].length; y++) {
			if (board[x][y]) {
				this.paintSquare(x, y, this.squareColour);
			} else {
				this.paintSquare(x, y, this.backgroundColour);
			}
		}
	}

	var stats = "Pattern: " + pattern + ", Generation: " + generation +
			", Living cells: " + livingCells;
	this.paintText(stats, 10, this.height - 10); 
};

ColonyViewer.prototype.paintText = function(text, x, y) {
	var ctx = this.canvas.getContext("2d");
	ctx.font = 'italic 10pt Calibri';
    ctx.fillStyle = 'grey';
	ctx.fillText(text, x, y);
}

ColonyViewer.prototype.paintSquare = function(x, y, colour) {
	var ctx = this.canvas.getContext("2d");
	ctx.beginPath();
	ctx.fillStyle = colour;
	ctx.rect(x*this.squareSide, y*this.squareSide,
		this.squareSide, this.squareSide);
	ctx.stroke();
	ctx.fill();
}

/*********/
/* Utils */
/*********/

function get2DArray(width, height) {
	var board = new Array();
	for (var i=0; i<width; i++) {
		board.push([]);
		for(var j=0; j<height; j++) {
			board[i].push(undefined);
		}
	}
	return board;
}
