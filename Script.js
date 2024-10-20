var lienzo = document.getElementById("lienzo"); //Lienzo
var contexto = lienzo.getContext("2d");
var info = document.getElementById("info"); //Párrafo de información
var play = document.getElementById("play"); //Botón de play
var stop = document.getElementById("stop"); //Botón de stop 
var clear = document.getElementById("clear"); //Botón de clear
var size = document.getElementById("size"); //Botón de cambiar tamaño
var person = document.getElementById("personalizar"); //Botón de personalizar célula
var infoX = 0; //Índice X de la célula bajo el ratón
var infoY = 0; //Índice Y de la célula bajo el ratón

var x = 0; //Posición de X para comenzar a pintar las células
var y = 0; //Posición de Y para comenzar a pintar las células
var t; //Tamaño de cada célula (lienzo / número de filas)
var interval; //Timer por intervalos
var world; //Mundo
var canClick = true; //Booleano para que no se le pueda dar más de una vez al botón de Play de seguido

var foto = new Image();
foto.src = 'https://cdn-icons-png.flaticon.com/512/1083/1083617.png'; //Imagen de la célula
var refresh; //Temporizador que soluciona algunos bugs más adelante

///////////////// CLASES: /////////////////

function World(longitud) //Clase mundo
{
	this.totalPasos = 0; //El número total de pasos de la simulación
	this.numCel = longitud; //Número de filas (correspondiente al número de columnas)
	this.matrix = new Array(this.numCel); //Matriz del mundo (de momento unidimensional)
	this.createWorld = function()
	{
		t = 700/this.numCel; //Obtenemos el tamaño de cada célula dependiendo del número de células del mundo
		for(var i = 0; i < this.numCel; i++) 
		{	
			this.matrix[i] = new Array(this.numCel); //Al hacer un array de arrays se obtiene un array bidimensional
		}
		
		//Se crean y pintan todas las células (muertas en un principio principio):
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
		
		añadirVecinas(); //Se añade a cada célula el array de 8 células vecinas
	};
}

function Cell() //Clase célula
{
	this.posX = x;
	this.posY = y;
	this.estado = "muerta";
	this.vecinas = new Array(8); //Array de células colindantes
	this.tiempo = 0; //Tiempo que lleva la célula en su estado actual
	this.vecinasVivas = 0; //Número de células vecinas vivas
	
	this.paintCell = function()
	{
		contexto.clearRect(this.posX, this.posY, t, t);
		if(this.estado === "muerta") //Si la célula está viva estará rellena. Si está muerta estará vacía
		{
			contexto.strokeRect(this.posX, this.posY, t, t);
		} 
		else
		{
			contexto.drawImage(foto, this.posX, this.posY, t, t);
		}
	};
	
	this.checkVecinas = function() //Función que comprueba cuántas células vecinas están vivas
	{
		this.vecinasVivas = 0;
		for(var i = 0; i < 8; i++)
		{
			if(this.vecinas[i].estado === "viva") this.vecinasVivas++;
		}
	};
	
	this.updateCell = function() //Función que cambia el estado de la célula dependiendo del número de células vecinas vivas.
	{
		if((this.estado === "muerta" && this.vecinasVivas === 3) || (this.estado === "viva" && (this.vecinasVivas < 2 || this.vecinasVivas > 3)))
		{
			cambiaEstado(this);
		}
	};
}


///////////////// MANEJO DE EVENTOS: /////////////////

window.onload = function() //Creación automática del mundo
{
	initializeWorld();
}

lienzo.onclick = function(e) //Función para añadir/quitar células con el ratón
{
	//Se obtienen los índices de la célula correspondiente a la zona del lienzo clicada:
	var indexX = (e.pageX - 20 - ((e.pageX - 20) % t)) / t; 
	var indexY = (e.pageY - 20 - ((e.pageY - 20) % t)) / t;
	//Se necesita el valor 20 para ajustar pageX y pageY al punto de origen del lienzo. 
	//De lo contrario, no tomaría en cuenta que el lienzo no comienza en el punto (0,0), calculando mal el click.
	cambiaEstado(world.matrix[indexY][indexX]); //Cambia el estado de la matriz clicada
}

lienzo.onmousemove = function(e) //Almacenamiento de los índices de la célula bajo el ratón
{
	infoX = (e.pageX - 20 - ((e.pageX - 20) % t)) / t; 
	infoY = (e.pageY - 20 - ((e.pageY - 20) % t)) / t;
}

function output() //Salida por pantalla de la información de la célula debajo del cursor
{
	info.innerHTML = "Ratón sobre la célula (" + infoY + ", " + infoX + "). Estado de la célula: " + world.matrix[infoY][infoX].estado + "." + 
						"<br>La célula lleva " + world.matrix[infoY][infoX].estado + " " + world.matrix[infoY][infoX].tiempo + " pasos." +
						"<br>Número total de pasos de la simulación: " + world.totalPasos + ".";
}


///////////////// BOTONES: /////////////////

play.onclick = function() //Comienzo de la simulación al pulsar el botón de play
{
	if(canClick) //Este booleano evita bugs al pulsar el botón de play en repetidas ocasiones
	{
		interval = setInterval(timer, 100);
		canClick = false;
	}
}

function timer() //Función que actualiza las células en función del tiempo
{
	for(var i = 0; i < world.numCel; i++)
	{
		for(var j = 0; j < world.numCel; j++)
		{
			world.matrix[i][j].tiempo++;
			world.matrix[i][j].checkVecinas();					
		}	
	}
	
	for(var i = 0; i < world.numCel; i++)
	{
		for(var j = 0; j < world.numCel; j++)
		{
			
			world.matrix[i][j].updateCell();				
		}	
	}
	//Los dos dobles bucles for anteriores no se pueden juntar en uno solo. De lo contrario, la actualización de cada célula según se registran
	//sus células vecinas cambiaría la actualización de las células posteriores del array bidimensional, provocando fallos en la simulación
	world.totalPasos++;
}

stop.onclick = function() //Función que para la simulación
{
	clearInterval(interval);
	canClick = true;
}

clear.onclick = function() //Función que resetea el mundo
{
	x = 0;
	y = 0;
	clearInterval(interval);
	canClick = true;
	world = new World(world.numCel);
	world.createWorld();
}

size.onclick = function() //Función para volver a definir el tamaño de la matriz
{
	initializeWorld();
}

person.onclick = function() //Función que personaliza la imagen de las células
{
	var pic = prompt("Introduzca el link de la foto que desee: ");
	foto.src = pic;
	refresh = setInterval(paint, 10);
}

function paint() //Función que pinta las células tras haber sido personalizadas
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

///////////////// FUNCIONES AUXILIARES: /////////////////

function initializeWorld() //Función que inicializa el mundo
{
	x = 0;
	y = 0;
	var longitud = setSize(); //El usuario puede introducir el número de filas deseado
	world = new World(longitud);
	world.createWorld();
	setInterval(output, 10); //Temporizador para actualizar el párrafo de información de la célula bajo el ratón
	clearInterval(interval); //Se pausan los temporizadores por si se ha pulsado el botón de Set Size
	canClick = true;
}

function setSize() //Función para que el usuario elija el tamaño de la matriz
{
	do
	{
		var longitud = prompt("Introduzca el número de filas deseado: ");
			
		if(isNaN(longitud)) //Si no es un número
		{
			alert("El valor a introducir debe ser un número entero.");
		} 
		else 
		{
			longitud = parseInt(longitud); //Si el número introducido es decimal no funciona. Hay que hacer un parseInt()
		}
	} while(isNaN(longitud));
	return longitud;
}
		
function cambiaEstado(cell) //Función que cambia el estado de una célula, la vuelve a pintar y resetea su temporizador
{
	if(cell.estado === "muerta")
	{
		cell.estado = "viva";
	}
	else if(cell.estado === "viva")
	{
		cell.estado = "muerta";
	}
	cell.tiempo = 0;
	cell.paintCell();
}
	
function añadirVecinas() //Función que añade a cada célula el array de células vecinas correspondiente
{
	//Se le asigna a cada célula sus células vecinas:
	for(var i = 0; i < world.numCel; i++)
	{
		for(var j = 0; j < world.numCel; j++)
		{
			if(i != 0 && j != 0 && i != (world.numCel - 1) && j != (world.numCel - 1)) //Células centrales, que no están en los extremos
			{
				world.matrix[i][j].vecinas[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].vecinas[1] = world.matrix[i-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].vecinas[3] = world.matrix[i][j-1];
				world.matrix[i][j].vecinas[4] = world.matrix[i][j+1];
				world.matrix[i][j].vecinas[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].vecinas[6] = world.matrix[i+1][j];
				world.matrix[i][j].vecinas[7] = world.matrix[i+1][j+1];
			}
			else if(i === 0 && j != 0 && j != (world.numCel-1)) //Células de la pared superior (menos esquinas)
			{
				world.matrix[i][j].vecinas[0] = world.matrix[world.numCel-1][j-1];
				world.matrix[i][j].vecinas[1] = world.matrix[world.numCel-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[world.numCel-1][j+1];
				world.matrix[i][j].vecinas[3] = world.matrix[i][j-1];
				world.matrix[i][j].vecinas[4] = world.matrix[i][j+1];
				world.matrix[i][j].vecinas[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].vecinas[6] = world.matrix[i+1][j];
				world.matrix[i][j].vecinas[7] = world.matrix[i+1][j+1];
			}
			else if(j === 0 && i != 0 && i != (world.numCel - 1)) //Células de la pared izquierda (menos esquinas)
			{
				world.matrix[i][j].vecinas[0] = world.matrix[i-1][world.numCel - 1];
				world.matrix[i][j].vecinas[1] = world.matrix[i-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].vecinas[3] = world.matrix[i][world.numCel-1];
				world.matrix[i][j].vecinas[4] = world.matrix[i][j+1];
				world.matrix[i][j].vecinas[5] = world.matrix[i+1][world.numCel-1];
				world.matrix[i][j].vecinas[6] = world.matrix[i+1][j];
				world.matrix[i][j].vecinas[7] = world.matrix[i+1][j+1];
			}
			else if(i === (world.numCel - 1) && j != 0 && j != (world.numCel - 1)) //Células de la pared inferior (menos esquinas)
			{
				world.matrix[i][j].vecinas[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].vecinas[1] = world.matrix[i-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].vecinas[3] = world.matrix[i][j-1];
				world.matrix[i][j].vecinas[4] = world.matrix[i][j+1];
				world.matrix[i][j].vecinas[5] = world.matrix[0][j-1];
				world.matrix[i][j].vecinas[6] = world.matrix[0][j];
				world.matrix[i][j].vecinas[7] = world.matrix[0][j+1];
			}
			else if(j === (world.numCel - 1) && i != 0 && i != (world.numCel - 1)) //Células de la pared derecha (menos esquinas)
			{
				world.matrix[i][j].vecinas[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].vecinas[1] = world.matrix[i-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[i-1][0];
				world.matrix[i][j].vecinas[3] = world.matrix[i][j-1];
				world.matrix[i][j].vecinas[4] = world.matrix[i][0];
				world.matrix[i][j].vecinas[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].vecinas[6] = world.matrix[i+1][j];
				world.matrix[i][j].vecinas[7] = world.matrix[i+1][0];
			}
			else if(i === 0 && j === 0) //Esquina superior izquierda
			{
				world.matrix[i][j].vecinas[0] = world.matrix[world.numCel-1][world.numCel-1];
				world.matrix[i][j].vecinas[1] = world.matrix[world.numCel-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[world.numCel-1][j+1];
				world.matrix[i][j].vecinas[3] = world.matrix[i][world.numCel-1];
				world.matrix[i][j].vecinas[4] = world.matrix[i][1];
				world.matrix[i][j].vecinas[5] = world.matrix[1][world.numCel-1];
				world.matrix[i][j].vecinas[6] = world.matrix[1][0];
				world.matrix[i][j].vecinas[7] = world.matrix[1][1];
			}
			else if(i === 0 && j === world.numCel-1) //Esquina superior derecha
			{
				world.matrix[i][j].vecinas[0] = world.matrix[world.numCel-1][j-1];
				world.matrix[i][j].vecinas[1] = world.matrix[world.numCel-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[world.numCel-1][0];
				world.matrix[i][j].vecinas[3] = world.matrix[0][j-1];
				world.matrix[i][j].vecinas[4] = world.matrix[0][0];
				world.matrix[i][j].vecinas[5] = world.matrix[i+1][j-1];
				world.matrix[i][j].vecinas[6] = world.matrix[i+1][j];
				world.matrix[i][j].vecinas[7] = world.matrix[1][0];
			}
			else if(j === 0 && i === world.numCel-1) //Esquina inferior izquierda 
			{
				world.matrix[i][j].vecinas[0] = world.matrix[i-1][world.numCel-1];
				world.matrix[i][j].vecinas[1] = world.matrix[i-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[i-1][j+1];
				world.matrix[i][j].vecinas[3] = world.matrix[world.numCel-1][world.numCel-1];
				world.matrix[i][j].vecinas[4] = world.matrix[i][j+1];
				world.matrix[i][j].vecinas[5] = world.matrix[0][world.numCel-1];
				world.matrix[i][j].vecinas[6] = world.matrix[0][0];
				world.matrix[i][j].vecinas[7] = world.matrix[0][1];
			}
			else if(i === world.numCel-1 && j === world.numCel-1) //Esquina inferior derecha
			{
				world.matrix[i][j].vecinas[0] = world.matrix[i-1][j-1];
				world.matrix[i][j].vecinas[1] = world.matrix[i-1][j];
				world.matrix[i][j].vecinas[2] = world.matrix[i-1][0];
				world.matrix[i][j].vecinas[3] = world.matrix[i][j-1];
				world.matrix[i][j].vecinas[4] = world.matrix[world.numCel-1][0];
				world.matrix[i][j].vecinas[5] = world.matrix[0][j-1];
				world.matrix[i][j].vecinas[6] = world.matrix[0][j];
				world.matrix[i][j].vecinas[7] = world.matrix[0][0];
			}
		}	
	}
}