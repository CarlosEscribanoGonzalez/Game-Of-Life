var canvas = document.getElementById("canvas"); //canvas
var context = canvas.getContext("2d");
var info = document.getElementById("info"); //Info paragraph
var play = document.getElementById("play"); //Play button
var stop = document.getElementById("stop"); //Stop button
var clear = document.getElementById("clear"); //Clear button
var size = document.getElementById("size"); //Set size button
var custom = document.getElementById("customize"); //Customize cell button
var infoX = 0; //X index of the hovered cell
var infoY = 0; //Y index of the hovered cell

var cellW;
var cellH;
var interval; //Timer
var outputInterval;
var world;
var canClick = true; //So buttons can't be pressed multiple consecutive times

var cellImage = new Image();
cellImage.src = 'https://cdn-icons-png.flaticon.com/512/1083/1083617.png';
var refresh;

///////////////// CLASSES /////////////////

function World(rows, cols)
{
	this.totalSteps = 0; //Simulation's total steps
	this.numRows = rows;
	this.numCols = cols;
	this.matrix = new Array(this.numRows); //World matrix
	this.createWorld = function()
	{
		cellW = canvas.width / this.numCols;
		cellH = canvas.height / this.numRows;
		context.clearRect(0, 0, canvas.width, canvas.height);

		//All cells are created
		for(var i = 0; i < this.numRows; i++)
		{
			this.matrix[i] = new Array(this.numCols); //Two-dimensional array
			for(var j = 0; j < this.numCols; j++)
			{
				this.matrix[i][j] = new Cell(j * cellW, i * cellH);
				this.matrix[i][j].paintCell();
			}
		}

		fillNeighbors(); //Neighbors are assigned to each cell of the grid
	};
}

function Cell(posX, posY)
{
	this.posX = posX;
	this.posY = posY;
	this.state = "dead";
	this.neighbors = new Array(8); //Array of adjacent cells
	this.time = 0; //Time the cell has stayed in the same state
	this.aliveNeighbors = 0; //Number of adjacent cells alive

	this.paintCell = function()
	{
		context.clearRect(this.posX, this.posY, cellW, cellH);
		if(this.state === "dead")
		{
			context.strokeRect(this.posX, this.posY, cellW, cellH);
		}
		else
		{
			context.drawImage(cellImage, this.posX, this.posY, cellW, cellH);
		}
	};

	this.checkNeighbors = function() //Checks how many neighbors are alive
	{
		this.aliveNeighbors = 0;
		for(var i = 0; i < 8; i++)
		{
			if(this.neighbors[i].state === "alive") this.aliveNeighbors++;
		}
	};

	this.updateCell = function() //Updates cell's state depending on aliveNeighbors
	{
		if((this.state === "dead" && this.aliveNeighbors === 3) || (this.state === "alive" && (this.aliveNeighbors < 2 || this.aliveNeighbors > 3)))
		{
			changeState(this);
		}
	};
}


///////////////// EVENT HANDLING /////////////////

window.onload = function() //World creation
{
	initializeWorld();
}

function getCellIndices(e)
{
	var rect = canvas.getBoundingClientRect();
	var scaleX = canvas.width / rect.width;
	var scaleY = canvas.height / rect.height;
	var col = Math.floor((e.clientX - rect.left) * scaleX / cellW);
	var row = Math.floor((e.clientY - rect.top) * scaleY / cellH);
	col = Math.max(0, Math.min(world.numCols - 1, col));
	row = Math.max(0, Math.min(world.numRows - 1, row));
	return { row: row, col: col };
}

canvas.onclick = function(e) //So cells can be added/removed
{
	var idx = getCellIndices(e);
	changeState(world.matrix[idx.row][idx.col]);
}

canvas.onmousemove = function(e) //Stores the indices of the hovered cell
{
	var idx = getCellIndices(e);
	infoY = idx.row;
	infoX = idx.col;
}

function output() //Displays information of the hovered cell
{
	var cell = world.matrix[infoY] && world.matrix[infoY][infoX];
	if(!cell) return;
	info.innerHTML = "Cursor is over cell (" + infoY + ", " + infoX + "); whose state is: " + cell.state + "." +
						"<br>This cell has been " + cell.state + " " + cell.time + " steps." +
						"<br>Simulation's total steps: " + world.totalSteps + ".";
}


///////////////// BUTTONS /////////////////

play.onclick = function()
{
	if(canClick) //To avoid bugs when the button is pressed multiple consecutive times
	{
		interval = setInterval(timer, 100);
		canClick = false;
	}
}

stop.onclick = function() //Stops simulation
{
	clearInterval(interval);
	canClick = true;
}

clear.onclick = function() //Resets the world
{
	clearInterval(interval);
	canClick = true;
	world = new World(world.numRows, world.numCols);
	world.createWorld();
}

size.onclick = function() //Redefines grid's size
{
	initializeWorld();
}

custom.onclick = function()
{
	var pic = prompt("Please, enter the link to the desired image.");
	if (pic === null || pic.trim() === "") return;
	pic = pic.trim();
	var testImage = new Image();
	testImage.onload = function () {
		cellImage.src = pic;
		clearInterval(refresh);
		refresh = setInterval(paint, 10);
	};
	testImage.onerror = function () {
		alert("The link is not a valid image.");
	};
	testImage.src = pic;
}

///////////////// FUNCTIONS /////////////////

function timer() //Updates cells
{
	for(var i = 0; i < world.numRows; i++)
	{
		for(var j = 0; j < world.numCols; j++)
		{
			world.matrix[i][j].time++;
			world.matrix[i][j].checkNeighbors();
		}
	}
	for(var i = 0; i < world.numRows; i++)
	{
		for(var j = 0; j < world.numCols; j++)
		{
			world.matrix[i][j].updateCell();
		}
	}
	world.totalSteps++;
}

function paint() //Paints the grid of cells after cellImage has changed
{
	for(var i = 0; i < world.numRows; i++)
	{
		for(var j = 0; j < world.numCols; j++)
		{
			world.matrix[i][j].paintCell();
		}
	}
	clearInterval(refresh);
}

function initializeWorld() //Initializes the world
{
	var dims = setSize();
	world = new World(dims.rows, dims.cols);
	world.createWorld();
	clearInterval(outputInterval);
	outputInterval = setInterval(output, 10);
	clearInterval(interval);
	canClick = true;
}

function askPositiveInt(message)
{
	var value;
	do
	{
		value = parseInt(prompt(message));
		if(isNaN(value) || value < 1)
		{
			alert("The value must be a valid number greater than 0.");
			value = NaN;
		}
	} while(isNaN(value));
	return value;
}

function setSize()
{
	var rows = askPositiveInt("Please, enter the number of rows (height): ");
	var cols = askPositiveInt("Please, enter the number of columns (width): ");
	return { rows: rows, cols: cols };
}

function changeState(cell)
{
	cell.state = (cell.state === "dead") ? "alive" : "dead";
	cell.time = 0;
	cell.paintCell();
}

function fillNeighbors()
{
	var R = world.numRows;
	var C = world.numCols;
	for(var i = 0; i < R; i++)
	{
		for(var j = 0; j < C; j++)
		{
			var n = 0;
			for(var di = -1; di <= 1; di++)
			{
				for(var dj = -1; dj <= 1; dj++)
				{
					if(di === 0 && dj === 0) continue;
					world.matrix[i][j].neighbors[n++] = world.matrix[(i + di + R) % R][(j + dj + C) % C];
				}
			}
		}
	}
}