var Canvas;
var Ctx;
var Interval;
var IsHeld = false;
var CurrentElement = "1";

var Mouse = {
    x: 0,
    y: 0
}
const DATA_BY_ID = {
    "0": Empty,
    "1": Sand,
    "2": Water,
    "3": Steam,
    "4": Acid,
    "5": Multi,
    "6": Wall
};

const GRID_SIZE = 128;
const CANVAS_SIZE = 768;
const PIXEL_SIZE = CANVAS_SIZE / GRID_SIZE;
var Grid = [GRID_SIZE];
for (let v = 0; v < GRID_SIZE; v++) {
    Grid[v] = new Array(GRID_SIZE);
    for (let w = 0; w < GRID_SIZE; w++) {
        Grid[v][w] = new DATA_BY_ID["0"](v, w);
    }
}

function switchPlaces(x1, y1, x2, y2, current) {
    var Element = Grid[x2][y2];
    Grid[x2][y2] = current;
    Grid[x1][y1] = new DATA_BY_ID[Element.Id](x1, y1);
    changeLocation(x2, y2, current);
}

function changeLocation(x, y, element) {
    element.x = x;
    element.y = y;
}

const getCells = () => {
	const cells = []
	for (let v = 0; v < GRID_SIZE; v++) {
		for (let w = 0; w < GRID_SIZE; w++) {
			cells.push(Grid[v][w])
		}
	}
	return cells
}

function insideGrid(coord) {
    return coord >= 0 && coord < GRID_SIZE;
}

window.onload = function () {
    /////////////////////GAME LOADING AND INIT
    Canvas = document.getElementById("screen");
    Ctx = Canvas.getContext("2d");
    var fps = 60;
    Interval = setInterval(function () {
        DrawScreen();
        Tick();
    }, 1000 / fps);
    window.addEventListener("mousedown", function(e) {
        IsHeld = true;
    });
    window.addEventListener("mouseup", function(e) {
        IsHeld = false;
    });
    window.addEventListener("mousemove", onMouseMoved);
    window.addEventListener("keydown", OnKeyPress);
    /////////////////////

    generateButtons()
};

function OnKeyPress(event) {
    var KeyCode = event.keyCode;
    switch (KeyCode) {
        case 49:
        default:
            CurrentElement = "1";
            break;
        case 50:
            CurrentElement = "2";
            break;
        case 51:
            CurrentElement = "3";
            break;
        case 52:
            CurrentElement = "4";
            break;
        case 48:
            CurrentElement = "0";
            break;
    }
}

function DrawScreen() {
    Ctx.fillStyle = "#100A11";
    Ctx.clearRect(Canvas.width - CANVAS_SIZE, Canvas.height - CANVAS_SIZE, Canvas.width, Canvas.height);
    let pixels = Ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)  
    for (let x = 0; x < CANVAS_SIZE; x++) {
        for (let y = 0; y < CANVAS_SIZE; y++) {
            let i = 4*(x + y* CANVAS_SIZE)
            if (!(Grid[Math.floor(x / PIXEL_SIZE)][Math.floor(y / PIXEL_SIZE)] instanceof Empty)) {
                let test = 3;
            }
            let col = Grid[Math.floor(x / PIXEL_SIZE)][Math.floor(y / PIXEL_SIZE)].Color
            pixels.data[i + 0] = col[0]
            pixels.data[i + 1] = col[1]
            pixels.data[i + 2] = col[2]
            pixels.data[i + 3] = col[3]
        }
    }
    Ctx.putImageData(pixels, 0, 0)

    // //Ctx.fillStyle = "white";
    // for (let x = 0; x < GRID_SIZE; x++) {
    //     for (let y = 0; y < GRID_SIZE; y++) {
    //         var Element = Grid[x][y];
    //         if (!(Element instanceof Empty)) {
    //             let test = PIXEL_SIZE;
    //         }
    //         Ctx.fillStyle = Element.Color;
    //         Ctx.fillRect(PIXEL_SIZE * x, PIXEL_SIZE * y, PIXEL_SIZE, PIXEL_SIZE);
    //     }
    // }
    // //Ctx.fillStyle = "white";
}

function Tick() {
    if (IsHeld && Mouse.x != -1 && Mouse.y != -1) {
        let size = Number(document.getElementById("brushWidthSlider").value);
        let optimisedSize = size * 2 - 1;
        for (let i = 0; i < optimisedSize; i++) {
            if (insideGrid(Mouse.x - (size-1) + (i % optimisedSize)) && insideGrid(Mouse.y))
                Grid[Mouse.x - (size-1) + (i % optimisedSize)][Mouse.y] = new DATA_BY_ID[CurrentElement](Mouse.x - (size-1) + (i % optimisedSize), Mouse.y);

        }
    }

    var cells = getCells();
    cells = cells.sort(() => Math.random() - 0.5)

    for (let i = 0; i < cells.length; i++) {
        var element = cells[i];
        if (!(element instanceof Empty)) {
            element.onTick();
        }
    }
}

function onMouseMoved(event) {
    let rect = Canvas.getBoundingClientRect();
    Mouse.x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
    if (Mouse.x < 0 || Mouse.x >= GRID_SIZE) {
        Mouse.x = -1;
    }
    Mouse.y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);
    if (Mouse.y < 0 || Mouse.y >= GRID_SIZE) {
        Mouse.y = -1;
    }
}