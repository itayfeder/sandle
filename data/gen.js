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
        document.getElementById('elementButtons').appendChild(btn);
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