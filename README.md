## Overview
Interactive implementation of John Conway's **Game of Life** in JavaScript, drawn on an HTML canvas. The world is a square grid of cells that live or die in each step according to the number of living neighbors they have.

## Features

* Configurable world size, chosen when the page loads or at any time with the size button
* Toroidal world: the edges wrap around, so cells on one side are neighbors of the cells on the opposite side
* Click on any cell to bring it to life or kill it, before or during the simulation
* Play, stop and clear controls
* Live information about the cell under the cursor: its position, its state, how many steps it has been in that state and the total steps of the simulation
* Customizable cell appearance: living cells can be drawn with any image, loaded from a link that is validated before being applied
<p align = "center">
  <img width="500" height="500" alt="gameOfLife" src="https://github.com/user-attachments/assets/7c8b0fe7-6243-4716-94ad-dce735c5f1cc" />
</p>

## Rules

* A living cell with fewer than 2 or more than 3 living neighbors dies
* A dead cell with exactly 3 living neighbors comes to life
* Every other cell keeps its state

## Technologies

* JavaScript
* HTML5 Canvas

## Usage

* Open `index.html` in a browser <!-- fill in: file name -->
* Enter the size of the world when prompted
* Click on cells to create an initial pattern and press play
