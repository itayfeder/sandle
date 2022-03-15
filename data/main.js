var Canvas;
var Ctx;
var Interval;
var IsHeld = false;
var CurrentElement = "1";

var Mouse = {
    x: 0,
    prevx: 0,
    y: 0,
    prevy: 0
}
const DATA_BY_ID = {
    "0": Empty,
    "1": Sand,
    "2": Water,
    "3": Steam,
    "4": Acid,
    "5": Multi,
    "6": Wall,
    "7": Fire
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
    /////////////////////

    generateButtons()
};

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

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i+1))
        ;[array[i], array[r]] = [array[r], array[i]]
    }
}

const xCoordinates = []
for (let i = 0; i < GRID_SIZE; i++) {
    xCoordinates[i] = i
}

function Tick() {
    if (IsHeld && Mouse.x != -1 && Mouse.y != -1 && Mouse.prevx != -1 && Mouse.prevy != -1) {
        allPoints(Mouse.prevx, Mouse.prevy, Mouse.x, Mouse.y, (xpos, ypos) => {
            let size = Number(document.getElementById("brushWidthSlider").value);
            let optimisedSize = size * 2 - 1;
            for (let i = 0; i < optimisedSize * optimisedSize; i++) {
                if (insideGrid(xpos - (size-1) + (i % optimisedSize)) && insideGrid(ypos - (size-1) + Math.floor(i / optimisedSize)))
                    Grid[xpos - (size-1) + (i % optimisedSize)][ypos - (size-1) + Math.floor(i / optimisedSize)] = new DATA_BY_ID[CurrentElement](xpos - (size-1) + (i % optimisedSize), ypos - (size-1) + Math.floor(i / optimisedSize));
    
            }
        });
        
    }

    shuffle(xCoordinates)

    for (let i = 0; i < GRID_SIZE; i++) {
        const x = xCoordinates[i]
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
            const element = Grid[x][y]
            if (!(element instanceof Empty)) {
                element.onTick();
            }
        }
    }
}

function onMouseMoved(event) {
    Mouse.prevx = Mouse.x;
    Mouse.prevy = Mouse.y;
    
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

function allPoints(x1, y1, x2, y2, func) {
    // If the two points are the same no need to iterate. Just run the provided function
    if (x1 == x2 && y1 == y2) {
      func(x1, y1);
      return;
    }
  
    const xDiff = x1 - x2;
    const yDiff = y1 - y2;
    const xDiffIsLarger = Math.abs(xDiff) > Math.abs(yDiff);
  
    const xModifier = xDiff < 0 ? 1 : -1;
    const yModifier = yDiff < 0 ? 1 : -1;
  
    const longerSideLength = Math.max(Math.abs(xDiff), Math.abs(yDiff));
    const shorterSideLength = Math.min(Math.abs(xDiff), Math.abs(yDiff));
    const slope = (shorterSideLength == 0 || longerSideLength == 0) ? 0 : (shorterSideLength / longerSideLength);
  
    let shorterSideIncrease;
    for (let i = 1; i <= longerSideLength; i++) {
      shorterSideIncrease = Math.round(i * slope);
      let yIncrease, xIncrease;
      if (xDiffIsLarger) {
        xIncrease = i;
        yIncrease = shorterSideIncrease;
      } else {
        yIncrease = i;
        xIncrease = shorterSideIncrease;
      }
      let currentY = y1 + (yIncrease * yModifier);
      let currentX = x1 + (xIncrease * xModifier);
      func(currentX, currentY);
    }
  }