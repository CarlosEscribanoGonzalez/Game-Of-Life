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

var x = 0; //Drawing start pos (x)
var y = 0; //Drawing start pos (y)
var t; //Cell size (canvas / row number)
var interval; //Timer
var world;
var canClick = true; //So buttons can't be pressed multiple consecutive times

var cellImage = new Image();
cellImage.src = 'https://cdn-icons-png.flaticon.com/512/1083/1083617.png';
var refresh;

///////////////// CLASSES /////////////////

function World(length)
{
	this.totalSteps = 0; //Simulation's total steps
	this.numCel = length; //Row and column number
	this.matrix = new Array(this.numCel); //World matrix
	this.createWorld = function()
	{
		t = 700/this.numCel;
		for(var i = 0; i < this.numCel; i++) 
		{	
			this.matrix[i] = new Array(this.numCel); //Two-dimensional array
		}
		
		//All cells are created
		for(var i = 0; i < this.numCel; i++)
		{
			for(var j = 0; j < this.numCel; j++)
			{
				this.matrix[i][j] = new Cell();
				this.matrix[i][j].paintCell();
				x = x + t;
			}	
			x = 0;
			y = y + t;
		}
		
		fillNeighbors(); //Neighbors are assigned to each cell of the grid
	};
}

function Cell()
{
	this.posX = x;
	this.posY = y;
	this.state = "dead";
	this.neighbors = new Array(8); //Array of adjacent cells
	this.time = 0; //Time the cell has stayed in the same state
	this.aliveNeighbors = 0; //Number of adjacent cells alive
	
	this.paintCell = function()
	{
		context.clearRect(this.posX, this.posY, t, t);
		if(this.state === "dead")
		{
			context.strokeRect(this.posX, this.posY, t, t);
		} 
		else
		{
			context.drawImage(cellImage, this.posX, this.posY, t, t);
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

canvas.onclick = function(e) //So cells can be added/removed
{
	var indexX = (e.pageX - 20 - ((e.pageX - 20) % t)) / t; 
	var indexY = (e.pageY - 20 - ((e.pageY - 20) % t)) / t;
	changeState(world.matrix[indexY][indexX]);
}

canvas.onmousemove = function(e) //Stores the indices of the hovered cell
{
	infoX = (e.pageX - 20 - ((e.pageX - 20) % t)) / t; 
	infoY = (e.pageY - 20 - ((e.pageY - 20) % t)) / t;
}

function output() //Displays information of the hovered cell
{
	info.innerHTML = "Cursor is over cell (" + infoY + ", " + infoX + "); whose state is: " + world.matrix[infoY][infoX].state + "." + 
						"<br>This cell has been " + world.matrix[infoY][infoX].state + " " + world.matrix[infoY][infoX].time + " steps." +
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
	x = 0;
	y = 0;
	clearInterval(interval);
	canClick = true;
	world = new World(world.numCel);
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
	for(var i = 0; i < world.numCel; i++)
	{
		for(var j = 0; j < world.numCel; j++)
		{
			world.matrix[i][j].time++;
			world.matrix[i][j].checkNeighbors();					
		}	
	}
	for(var i = 0; i < world.numCel; i++)
	{
		for(var j = 0; j < world.numCel; j++)
		{
			
			world.matrix[i][j].updateCell();				
		}	
	}
	world.totalSteps++;
}

function paint() //Paints the grid of cells after cellImage has changed
{
	for(var i = 0; i < world.numCel; i++)
	{
		for(var j = 0; j < world.numCel; j++)
		{
			world.matrix[i][j].paintCell();
		}
	}
	clearInterval(refresh);
}

function initializeWorld() //Initializes the world
{
	x = 0;
	y = 0;
	var length = setSize();
	world = new World(length);
	world.createWorld();
	setInterval(output, 10);
	clearInterval(interval);
	canClick = true;
}

function setSize() 
{
	do
	{
		var length = prompt("Please, enter the desired world size: ");
			
		if(isNaN(length))
		{
			alert("The value must be a valid number.");
		} 
		else 
		{
			length = parseInt(length);
		}
	} while(isNaN(length));
	return length;
}
		
function changeState(cell)
{
	if(cell.state === "dead")
	{
		cell.state = "alive";
	}
	else if(cell.state === "alive")
	{
		cell.state = "dead";
	}
	cell.time = 0;
	cell.paintCell();
}
	
function fillNeighbors()
{
	for(var i = 0; i < world.numCel; i++)
	{
		for(var j = 0; j < world.numCel; j++)
		{
			if(i != 0 && j != 0 && i != (world.numCel - 1) && j != (world.numCel - 1)) //Cells in the center
			{
				world.matrix[i][j].neighbors[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].neighbors[1] = world.matrix[i-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].neighbors[3] = world.matrix[i][j-1];
				world.matrix[i][j].neighbors[4] = world.matrix[i][j+1];
				world.matrix[i][j].neighbors[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].neighbors[6] = world.matrix[i+1][j];
				world.matrix[i][j].neighbors[7] = world.matrix[i+1][j+1];
			}
			else if(i === 0 && j != 0 && j != (world.numCel-1)) //Upper edge cells
			{
				world.matrix[i][j].neighbors[0] = world.matrix[world.numCel-1][j-1];
				world.matrix[i][j].neighbors[1] = world.matrix[world.numCel-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[world.numCel-1][j+1];
				world.matrix[i][j].neighbors[3] = world.matrix[i][j-1];
				world.matrix[i][j].neighbors[4] = world.matrix[i][j+1];
				world.matrix[i][j].neighbors[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].neighbors[6] = world.matrix[i+1][j];
				world.matrix[i][j].neighbors[7] = world.matrix[i+1][j+1];
			}
			else if(j === 0 && i != 0 && i != (world.numCel - 1)) //Left edge cells
			{
				world.matrix[i][j].neighbors[0] = world.matrix[i-1][world.numCel - 1];
				world.matrix[i][j].neighbors[1] = world.matrix[i-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].neighbors[3] = world.matrix[i][world.numCel-1];
				world.matrix[i][j].neighbors[4] = world.matrix[i][j+1];
				world.matrix[i][j].neighbors[5] = world.matrix[i+1][world.numCel-1];
				world.matrix[i][j].neighbors[6] = world.matrix[i+1][j];
				world.matrix[i][j].neighbors[7] = world.matrix[i+1][j+1];
			}
			else if(i === (world.numCel - 1) && j != 0 && j != (world.numCel - 1)) //Bottom edge cells
			{
				world.matrix[i][j].neighbors[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].neighbors[1] = world.matrix[i-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].neighbors[3] = world.matrix[i][j-1];
				world.matrix[i][j].neighbors[4] = world.matrix[i][j+1];
				world.matrix[i][j].neighbors[5] = world.matrix[0][j-1];
				world.matrix[i][j].neighbors[6] = world.matrix[0][j];
				world.matrix[i][j].neighbors[7] = world.matrix[0][j+1];
			}
			else if(j === (world.numCel - 1) && i != 0 && i != (world.numCel - 1)) //Right edge cells
			{
				world.matrix[i][j].neighbors[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].neighbors[1] = world.matrix[i-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[i-1][0];
				world.matrix[i][j].neighbors[3] = world.matrix[i][j-1];
				world.matrix[i][j].neighbors[4] = world.matrix[i][0];
				world.matrix[i][j].neighbors[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].neighbors[6] = world.matrix[i+1][j];
				world.matrix[i][j].neighbors[7] = world.matrix[i+1][0];
			}
			else if(i === 0 && j === 0) //Upper-left corner
			{
				world.matrix[i][j].neighbors[0] = world.matrix[world.numCel-1][world.numCel-1];
				world.matrix[i][j].neighbors[1] = world.matrix[world.numCel-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[world.numCel-1][j+1];
				world.matrix[i][j].neighbors[3] = world.matrix[i][world.numCel-1];
				world.matrix[i][j].neighbors[4] = world.matrix[i][1];
				world.matrix[i][j].neighbors[5] = world.matrix[1][world.numCel-1];
				world.matrix[i][j].neighbors[6] = world.matrix[1][0];
				world.matrix[i][j].neighbors[7] = world.matrix[1][1];
			}
			else if(i === 0 && j === world.numCel-1) //Upper-right corner
			{
				world.matrix[i][j].neighbors[0] = world.matrix[world.numCel-1][j-1];
				world.matrix[i][j].neighbors[1] = world.matrix[world.numCel-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[world.numCel-1][0];
				world.matrix[i][j].neighbors[3] = world.matrix[0][j-1];
				world.matrix[i][j].neighbors[4] = world.matrix[0][0];
				world.matrix[i][j].neighbors[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].neighbors[6] = world.matrix[i+1][j];
				world.matrix[i][j].neighbors[7] = world.matrix[1][0];
			}
			else if(j === 0 && i === world.numCel-1) //Bottom-left corner
			{
				world.matrix[i][j].neighbors[0] = world.matrix[i-1][world.numCel-1];
				world.matrix[i][j].neighbors[1] = world.matrix[i-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].neighbors[3] = world.matrix[world.numCel-1][world.numCel-1];
				world.matrix[i][j].neighbors[4] = world.matrix[i][j+1];
				world.matrix[i][j].neighbors[5] = world.matrix[0][world.numCel-1];
				world.matrix[i][j].neighbors[6] = world.matrix[0][0];
				world.matrix[i][j].neighbors[7] = world.matrix[0][1];
			}
			else if(i === world.numCel-1 && j === world.numCel-1) //Bottom-right corner
			{
				world.matrix[i][j].neighbors[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].neighbors[1] = world.matrix[i-1][j];
				world.matrix[i][j].neighbors[2] = world.matrix[i-1][0];
				world.matrix[i][j].neighbors[3] = world.matrix[i][j-1];
				world.matrix[i][j].neighbors[4] = world.matrix[world.numCel-1][0];
				world.matrix[i][j].neighbors[5] = world.matrix[0][j-1];
				world.matrix[i][j].neighbors[6] = world.matrix[0][j];
				world.matrix[i][j].neighbors[7] = world.matrix[0][0];
			}
		}	
	}
}