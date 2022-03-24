function generateButtons() {
    for (const [key, value] of Object.entries(DATA_BY_ID)) {
        let btn = document.createElement("button");
        let element = new value(0,0);
        btn.innerHTML = value.name;

        let hex = RGBToHex(element.Color[0], element.Color[1], element.Color[2]);
        if (isDark(hex)) {
            btn.style = "color: #eeeeee;" + "background-color: rgba(" + element.Color[0] + ", " + element.Color[1] + ", " + element.Color[2] + ", " + "0.75" + ");"
        } else {
            btn.style = "color: #333333;" + "background-color: rgba(" + element.Color[0] + ", " + element.Color[1] + ", " + element.Color[2] + ", " + "0.75" + ");"
        }
        btn.onclick = function (event) {
            CurrentElement = key;
        }
        switch (element.Category) {
            case CATEGORY.MATERIALS:
            default:
                document.getElementById('materialButtons').appendChild(btn);
                break;
            case CATEGORY.UTILITIES:
                document.getElementById('utilityButtons').appendChild(btn);
                break;
            case CATEGORY.LIFE:
                document.getElementById('lifeButtons').appendChild(btn);
                break;
        }
    }
}

function RGBToHex(r,g,b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
  
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;
  
    return "#" + r + g + b;
}


function isDark(color) {

    var r, g, b, hsp;
    if (color.match(/^rgb/)) {

        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        color = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );

    if (hsp>127.5) {

        return false;
    } 
    else {

        return true;
    }
}

function clearScreen() {
    for (let v = 0; v < GRID_SIZE; v++) {
        Grid[v] = new Array(GRID_SIZE);
        for (let w = 0; w < GRID_SIZE; w++) {
            Grid[v][w] = new DATA_BY_ID["0"](v, w);
        }
    }
}

function saveScreen() {
    var image = Canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
    var download = document.createElement('a');
    download.href = image
    download.download = document.getElementById("name").value + '.png';
    download.click();
}

function loadScreen(input) {
    if (input.files && input.files[0]) {
        document.getElementById("name").value = input.files[0].name.replace(".png", "")
        var reader = new FileReader();
        reader.onload = function (e) {
          $('#tempImg')
            .attr('src', e.target.result)
            .width(128)
            .height(128);
        };
        reader.readAsDataURL(input.files[0]);
        var img = document.getElementById("tempImg");
        img.onload = function() {
            placeScreen(img);
        };
    }
}


function placeScreen(img) {
    var tempc = document.getElementById("tempScreen");
    var tempctx = tempc.getContext("2d");
            
            tempctx.drawImage(img, 0, 0);
            let pixels = tempctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)  
            for (let x = 0; x < CANVAS_SIZE; x += 6) {
                for (let y = 0; y < CANVAS_SIZE; y += 6) {
                    let colorsInPixel = [pixels.data[4*x+4*CANVAS_SIZE*y], pixels.data[4*x+4*CANVAS_SIZE*y+1], pixels.data[4*x+4*CANVAS_SIZE*y+2], pixels.data[4*x+4*CANVAS_SIZE*y+3]]
                    if (compareColors(colorsInPixel, [255, 228, 181, 255])) {
                        Sand.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [30, 144, 255, 255])) {
                        Water.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [220, 220, 220, 255])) {
                        Steam.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [124, 252, 0, 255])) {
                        Acid.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [186, 85, 211, 255])) {
                        Multi.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [170, 74, 68, 255])) {
                        Wall.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [252, 116, 5, 255]) || compareColors(colorsInPixel, [54, 69, 79, 255])) {
                        Fire.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [73, 76, 79, 255])) {
                        Oil.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [174, 219, 240, 255])) {
                        Ice.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [150, 111, 51, 255])) {
                        Wood.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [90, 171, 97, 255])) {
                        Plant.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [181, 169, 159, 255]) || compareColors(colorsInPixel, [252, 196, 57, 225])) {
                        Flower.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [237, 151, 151, 255])) {
                        PinkSand.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if (compareColors(colorsInPixel, [136, 140, 141, 255])) {
                        Stone.load(x / 6, y / 6, colorsInPixel)
                    }
                    else if ((Grid[x/6][y/6] instanceof Empty)) {
                        Empty.load(x / 6, y / 6, colorsInPixel)
                    }
                }
            }
            img.src = ""
            tempctx.clearRect(0, 0, tempc.width, tempc.height);
}

function compareColors(col1, col2) {
    return (col1[0] == col2[0] && col1[1] == col2[1] && col1[2] == col2[2] && col1[3] == col2[3])
}