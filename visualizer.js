var totalRows = 40;
var totalCols = 100;
var inProgress = false;
var cellsToAnimate = [];
var createWalls = false;
var algorithm = null;
var justFinished = false;
var animationSpeed = "Fast";
var animationState = null;
var startCell = [1, 60];
var endCell = [38, 1];
var movingStart = false;
var movingEnd = false;

/*************Grid Generation*************/

function generateGrid(rows, cols) {
    var grid = "<table>";
    for (row = 1; row <= rows; row++) {
        grid += "<tr>";
        for (col = 1; col <= cols; col++) {
            grid += "<td></td>";
        }
        grid += "</tr>";
    }
    grid += "</table>"
    return grid;
}

var myGrid = generateGrid(totalRows, totalCols);
$("#tableContainer").append(myGrid);

/***************Object Declaration********************/

function Queue() {
    this.stack = new Array();
    this.dequeue = function () {
        return this.stack.pop();
    }
    this.enqueue = function (item) {
        this.stack.unshift(item);
        return;
    }
    this.empty = function () {
        return (this.stack.length == 0);
    }
    this.clear = function () {
        this.stack = new Array();
        return;
    }
}

/*****************Mouse Function***********************/

$("td").mousedown(function () {
    var index = $("td").index(this);
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
    var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    if (!inProgress) {
        if (justFinished && !inProgress) {
            clearBoard(keepWalls = true);
            justFinished = false;
        }
        if (index == startCellIndex) {
            movingStart = true;
        } else if (index == endCellIndex) {
            movingEnd = true;
        } else {
            createWalls = true;
        }
    }
});

$("td").mouseup(function () {
    createWalls = false;
    movingStart = false;
    movingEnd = false;
});

$("td").mouseenter(function () {
    if (!createWalls && !movingStart && !movingEnd) { return; }
    var index = $("td").index(this);
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
    var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    if (!inProgress) {
        if (justFinished) {
            clearBoard(keepWalls = true);
            justFinished = false;
        }
        if (movingStart && index != endCellIndex) {
            moveStartOrEnd(startCellIndex, index, "start");
        } else if (movingEnd && index != startCellIndex) {
            moveStartOrEnd(endCellIndex, index, "end");
        } else if (index != startCellIndex && index != endCellIndex) {
            $(this).toggleClass("wall");
        }
    }
});

$("td").click(function () {
    var index = $("td").index(this);
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
    var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    if ((inProgress == false) && !(index == startCellIndex) && !(index == endCellIndex)) {
        if (justFinished) {
            clearBoard(keepWalls = true);
            justFinished = false;
        }
        $(this).toggleClass("wall");
    }
});

$("body").mouseup(function () {
    createWalls = false;
    movingStart = false;
    movingEnd = false;
});


/********************Buttons****************************/

$("#startBtn").click(function () {
    if (algorithm == null) { return; }
    if (inProgress) { update("wait"); return; }
    traverseGraph(algorithm);
});

$("#clearBtn").click(function () {
    if (inProgress) { update("wait"); return; }
    clearBoard(keepWalls = false);
});



/********************Nav-Bar Menus***********************/

$("#algorithms .dropdown-item").click(function () {
    if (inProgress) { update("wait"); return; }
    algorithm = $(this).text();
    updatealgo();
});

$("#speed .dropdown-item").click(function () {
    if (inProgress) { update("wait"); return; }
    animationSpeed = $(this).text();
    updateSpeedDisplay();
});

$("#mazes .dropdown-item").click(function () {
    if (inProgress) { update("wait"); return; }
    maze = $(this).text();
    if (maze == "Random") {
        randomMaze();
    }
});


/*************************Functions**********************/
// For updation of start at new location of both start and end
function moveStartOrEnd(prevIndex, newIndex, startOrEnd) {
    var newCellY = newIndex % totalCols;
    var newCellX = Math.floor((newIndex - newCellY) / totalCols);
    if (startOrEnd == "start") {
        startCell = [newCellX, newCellY];
    } else {
        endCell = [newCellX, newCellY];
    }
    clearBoard(keepWalls = true);
    return;
}

function updateSpeedDisplay() {
    if (animationSpeed == "Slow") {
        $(".Visualizerspeed").text("Speed: Slow");
    }
    else if (animationSpeed == "Average") {
        $(".Visualizerspeed").text("Speed: Average");
    }
    else if (animationSpeed == "Fast") {
        $(".Visualizerspeed").text("Speed: Fast");
    }
    return;
}

function updatealgo() {
    if (algorithm == "Depth-First Search") {
        $(".algo").text("Depth-First Search");
    } else if (algorithm == "Breadth-First Search") {
        $(".algo").text("BFS (Breadth-First Search");
    }
    return;
}

async function traverseGraph(algorithm) {
    inProgress = true;
    clearBoard(keepWalls = true);
    var pathFound = executeAlgo();
    
    await animateCells();
    if (pathFound) {
        alert("Path Found")
    } else {
        alert("Path Not Found");
    }
    inProgress = false;
    justFinished = true;
}

function executeAlgo() {
    if (algorithm == "Depth-First Search") {
        var visited = createVisited();
        var pathFound = DFS(startCell[0], startCell[1], visited);
    } else if (algorithm == "Breadth-First Search") {
        var pathFound = BFS();
    }
    return pathFound;
}

function createVisited() {
    var visited = [];
    var cells = $("#tableContainer").find("td");
    for (var i = 0; i < totalRows; i++) {
        var row = [];
        for (var j = 0; j < totalCols; j++) {
            if (cellIsAWall(i, j, cells)) {
                row.push(true);
            } else {
                row.push(false);
            }
        }
        visited.push(row);
    }
    return visited;
}

function cellIsAWall(i, j, cells) {
    var cellNum = (i * (totalCols)) + j;
    return $(cells[cellNum]).hasClass("wall");
}

function DFS(i, j, visited) {
    if (i == endCell[0] && j == endCell[1]) {
        cellsToAnimate.push([[i, j], "success"]);
        return true;
    }
    visited[i][j] = true;
    cellsToAnimate.push([[i, j], "searching"]);
    var neighbors = getNeighbors(i, j);
    for (var k = 0; k < neighbors.length; k++) {
        var m = neighbors[k][0];
        var n = neighbors[k][1];
        if (!visited[m][n]) {
            var pathFound = DFS(m, n, visited);
            if (pathFound) {
                cellsToAnimate.push([[i, j], "success"]);
                return true;
            }
        }
    }
    cellsToAnimate.push([[i, j], "visited"]);
    return false;
}


function BFS() {
    var pathFound = false;
    var myQueue = new Queue();
    var prev = createPrev();
    var visited = createVisited();
    myQueue.enqueue(startCell);
    cellsToAnimate.push(startCell, "searching");
    visited[startCell[0]][startCell[1]] = true;
    while (!myQueue.empty()) {
        var cell = myQueue.dequeue();
        var r = cell[0];
        var c = cell[1];
        cellsToAnimate.push([cell, "visited"]);
        if (r == endCell[0] && c == endCell[1]) {
            pathFound = true;
            break;
        }
        // Put neighboring cells in queue
        var neighbors = getNeighbors(r, c);
        for (var k = 0; k < neighbors.length; k++) {
            var m = neighbors[k][0];
            var n = neighbors[k][1];
            if (visited[m][n]) { continue; }
            visited[m][n] = true;
            prev[m][n] = [r, c];
            cellsToAnimate.push([neighbors[k], "searching"]);
            myQueue.enqueue(neighbors[k]);
        }
    }
    while (!myQueue.empty()) {
        var cell = myQueue.dequeue();
        var r = cell[0];
        var c = cell[1];
        cellsToAnimate.push([cell, "visited"]);
    }
    if (pathFound) {
        var r = endCell[0];
        var c = endCell[1];
        cellsToAnimate.push([[r, c], "success"]);
        while (prev[r][c] != null) {
            var prevCell = prev[r][c];
            r = prevCell[0];
            c = prevCell[1];
            cellsToAnimate.push([[r, c], "success"]);
        }
    }
    return pathFound;
}

async function randomMaze() {
    inProgress = true;
    clearBoard(keepWalls = false);
    var visited = createVisited();
    var walls = makeWalls();
    var cells = [startCell, endCell];
    walls[startCell[0]][startCell[1]] = false;
    walls[endCell[0]][endCell[1]] = false;
    visited[startCell[0]][startCell[1]] = true;
    visited[endCell[0]][endCell[1]] = true;
    while (cells.length > 0) {
        var random = Math.floor(Math.random() * cells.length);
        var randomCell = cells[random];
        cells[random] = cells[cells.length - 1];
        cells.pop();
        var neighbors = getNeighbors(randomCell[0], randomCell[1]);
        if (neighborsThatAreWalls(neighbors, walls) < 2) { continue; }
        walls[randomCell[0]][randomCell[1]] = false;
        for (var k = 0; k < neighbors.length; k++) {
            var i = neighbors[k][0];
            var j = neighbors[k][1];
            if (visited[i][j]) { continue; }
            visited[i][j] = true;
            cells.push([i, j]);
        }
    }
    var cells = $("#tableContainer").find("td");
    for (var i = 0; i < totalRows; i++) {
        for (var j = 0; j < totalCols; j++) {
            if (i == 0 || i == (totalRows - 1) || j == 0 || j == (totalCols - 1) || walls[i][j]) {
                cellsToAnimate.push([[i, j], "wall"]);
            }
        }
    }
    await animateCells();
    inProgress = false;
    return;
}


function makeWalls() {
    var walls = [];
    for (var i = 0; i < totalRows; i++) {
        var row = [];
        for (var j = 0; j < totalCols; j++) {
            row.push(true);
        }
        walls.push(row);
    }
    return walls;
}

function neighborsThatAreWalls(neighbors, walls) {
    var neighboringWalls = 0;
    for (var k = 0; k < neighbors.length; k++) {
        var i = neighbors[k][0];
        var j = neighbors[k][1];
        if (walls[i][j]) { neighboringWalls++; }
    }
    return neighboringWalls;
}

function createPrev() {
    var prev = [];
    for (var i = 0; i < totalRows; i++) {
        var row = [];
        for (var j = 0; j < totalCols; j++) {
            row.push(null);
        }
        prev.push(row);
    }
    return prev;
}

function getNeighbors(i, j) {
    var neighbors = [];
    if (i > 0) { neighbors.push([i - 1, j]); }
    if (j > 0) { neighbors.push([i, j - 1]); }
    if (i < (totalRows - 1)) { neighbors.push([i + 1, j]); }
    if (j < (totalCols - 1)) { neighbors.push([i, j + 1]); }
    return neighbors;
}

async function animateCells() {
    animationState = null;
    var cells = $("#tableContainer").find("td");
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
    var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    var delay = getDelay();
    for (var i = 0; i < cellsToAnimate.length; i++) {
        var cellCoordinates = cellsToAnimate[i][0];
        var x = cellCoordinates[0];
        var y = cellCoordinates[1];
        var num = (x * (totalCols)) + y;
        if (num == startCellIndex || num == endCellIndex) { continue; }
        var cell = cells[num];
        var colorClass = cellsToAnimate[i][1];

        // Wait until its time to animate
        await new Promise(resolve => setTimeout(resolve, delay));

        $(cell).removeClass();
        $(cell).addClass(colorClass);
    }
    cellsToAnimate = [];
    return new Promise(resolve => resolve(true));
}

function getDelay() {
    var delay;
    if (animationSpeed === "Slow") {
        if (algorithm == "Depth-First Search") {
            delay = 25;
        } else {
            delay = 20;
        }
    } else if (animationSpeed === "Average") {
        if (algorithm == "Depth-First Search") {
            delay = 15;
        } else {
            delay = 10;
        }
    } else if (animationSpeed == "Fast") {
        if (algorithm == "Depth-First Search") {
            delay = 10;
        } else {
            delay = 5;
        }
    }
    return delay;
}

function clearBoard(keepWalls) {
    var cells = $("#tableContainer").find("td");
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
    var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    for (var i = 0; i < cells.length; i++) {
        isWall = $(cells[i]).hasClass("wall");
        $(cells[i]).removeClass();
        if (i == startCellIndex) {
            $(cells[i]).addClass("start");
        } else if (i == endCellIndex) {
            $(cells[i]).addClass("end");
        } else if (keepWalls && isWall) {
            $(cells[i]).addClass("wall");
        }
    }
}

// Ending statements
clearBoard();