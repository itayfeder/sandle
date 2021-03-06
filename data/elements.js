const CATEGORY = {
    MATERIALS: 1,
    UTILITIES: 2,
    LIFE: 3
}

class Element {
    constructor(id, color, x, y) {
        this.Color = color;
        this.Id = id;
        this.CanPassThrough = true;
        this.x = x;
        this.y = y;
        this.Unbrekable = false;
        this.HeatingId = "0";
        this.CoolingId = "0";
        this.Flammability = 0.5;
        this.Coolability = 0.01;
        this.Freezable = false;
        this.Category = CATEGORY.MATERIALS;
        this.plant = false;
    }

    onTick() {

    }

    static load(x, y, color) {
        
    }
}

class Empty extends Element {
    constructor(x ,y) {
        super("0", [38, 28, 40, 255], x ,y);
        this.Unbrekable = true;
        this.CanPassThrough = true;
        this.Category = CATEGORY.UTILITIES;
    }

    static load(x, y, color) {
        Grid[x][y] = new Empty(x,y);
    }
}

class Solid extends Element {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
        this.CanPassThrough = false;
    }
}

class GravitySolid extends Solid {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
        this.CanPassThrough = false;
    }

    onTick() {
        if (insideGrid(this.y+1)) {
            if (Grid[this.x][this.y+1].CanPassThrough) {
                switchPlaces(this.x, this.y, this.x, this.y+1, this)
            }
        }
    }
}

class Liquid extends Element {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
    }

    onTick() {
        if (insideGrid(this.y+1)) {
            if (Grid[this.x][this.y+1].CanPassThrough && !(Grid[this.x][this.y+1] instanceof Liquid) && !(Grid[this.x][this.y+1] instanceof Fire)) {
                switchPlaces(this.x, this.y, this.x, this.y+1, this)
            }
        }
        var side = Math.random() < 0.5 ? 1 : -1;
        for (let i = 1; i <= this.dispersionRate; i++) {
            if (insideGrid(this.x+side)) {
                if (Grid[this.x+side][this.y].CanPassThrough) {
                    switchPlaces(this.x, this.y, this.x+side, this.y, this)
                    continue
                }
            }
            break
        }
    }
}

class Gas extends Element {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
    }

    onTick() {
        if (insideGrid(this.y-1)) {
            if (Grid[this.x][this.y-1].CanPassThrough && !(Grid[this.x][this.y-1] instanceof DATA_BY_ID[this.Id])) {
                switchPlaces(this.x, this.y, this.x, this.y-1, this)
            }
        }
        
        var side = Math.random() < 0.5 ? 1 : -1;
        for (let i = 1; i <= this.dispersionRate; i++) {
            if (insideGrid(this.x+side)) {
                if (Grid[this.x+side][this.y].CanPassThrough) {
                    switchPlaces(this.x, this.y, this.x+side, this.y, this)
                    continue
                }
            }
            break
        }
        
    }
}

class Dust extends Solid {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
        this.InertialResistance = 0.1;
        this.Gravity = true;
    }

    onTick() {
        if (this.isFreeFalling) {
            if (insideGrid(this.x+1) && Grid[this.x+1][this.y] instanceof Dust && Math.random() <= this.InertialResistance) Grid[this.x+1][this.y].isFreeFalling = true;
            if (insideGrid(this.x-1) && Grid[this.x-1][this.y] instanceof Dust && Math.random() <= this.InertialResistance) Grid[this.x-1][this.y].isFreeFalling = true;
        }
        if (this.Gravity && insideGrid(this.y+1)) {
            if (Grid[this.x][this.y+1].CanPassThrough) {
                this.isFreeFalling = true
                switchPlaces(this.x, this.y, this.x, this.y+1, this)
            } else if (this.isFreeFalling) {
                var side = Math.random() < 0.5 ? 1 : -1;
                if (insideGrid(this.x+side)) {
                    if (Grid[this.x+side][this.y+1].CanPassThrough && Grid[this.x+side][this.y].CanPassThrough) {
                        this.isFreeFalling = true
                        switchPlaces(this.x, this.y, this.x+side, this.y+1, this) 
                    }
                }
            }
            
        }
    }
}

class Sand extends Dust {
    constructor(x ,y) {
        super("1", [255, 228, 181, 255], x ,y);
        this.isFreeFalling = false;
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        super.onTick()
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Sand(x,y);
    }
}

class Water extends Liquid {
    constructor(x ,y) {
        super("2", [30, 144, 255, 255], x ,y);
        this.dispersionRate = 2
        this.HeatingId = "3";
        this.CoolingId = "9";
        this.Freezable = true;
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        super.onTick()
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Water(x,y);
    }
}

class Steam extends Gas {
    constructor(x ,y) {
        super("3", [220, 220, 220, 255], x ,y);
        this.dispersionRate = 2
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        super.onTick()
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Steam(x,y);
    }
}

class Acid extends Liquid {
    constructor(x ,y) {
        super("4", [124, 252, 0, 255], x ,y);
        this.dispersionRate = 1
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        var side = Math.random() < 0.5 ? 1 : -1;
        if (insideGrid(this.x+side)) {
            if (!Grid[this.x+side][this.y].Unbrekable && !(Grid[this.x+side][this.y] instanceof Acid)) {
                Grid[this.x+side][this.y] = new  DATA_BY_ID["0"](this.x+side, this.y)
                Grid[this.x][this.y] = new  DATA_BY_ID["0"](this.x, this.y)
                return;
            }
        }
        var side = Math.random() < 0.5 ? 1 : -1;
        if (insideGrid(this.y+side)) {
            if (!Grid[this.x][this.y+side].Unbrekable && !(Grid[this.x][this.y+side] instanceof Acid)) {
                Grid[this.x][this.y+side] = new  DATA_BY_ID["0"](this.x, this.y+side)
                Grid[this.x][this.y] = new  DATA_BY_ID["0"](this.x, this.y)
                return;
            }
        }
        super.onTick()
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Acid(x,y);
    }
}

class Multi extends Solid {
    constructor(x ,y) {
        super("5", [186, 85, 211, 255], x ,y);
        this.replicating = null;
        this.Unbrekable = true;
        this.Category = CATEGORY.UTILITIES;
    }

    onTick() {
        super.onTick();
        if (this.replicating == null) {
            if (insideGrid(this.y-1) && !(Grid[this.x][this.y-1] instanceof Empty) && !(Grid[this.x][this.y-1] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x][this.y-1].Id]
                return;
            }
            if (insideGrid(this.y+1) && !(Grid[this.x][this.y+1] instanceof Empty) && !(Grid[this.x][this.y+1] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x][this.y+1].Id]
                return;
            }
            if (insideGrid(this.x-1) && !(Grid[this.x-1][this.y] instanceof Empty) && !(Grid[this.x-1][this.y] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x-1][this.y].Id]
                return;
            }
            if (insideGrid(this.x+1) && !(Grid[this.x+1][this.y] instanceof Empty) && !(Grid[this.x+1][this.y] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x+1][this.y].Id]
                return;
            }
        }
        else {
            if (insideGrid(this.y-1) && (Grid[this.x][this.y-1] instanceof Empty)) {
                Grid[this.x][this.y-1] = new this.replicating(this.x, this.y-1)
            }
            if (insideGrid(this.y+1) && (Grid[this.x][this.y+1] instanceof Empty)) {
                Grid[this.x][this.y+1] = new this.replicating(this.x, this.y+1)
            }
            if (insideGrid(this.x-1) && (Grid[this.x-1][this.y] instanceof Empty)) {
                Grid[this.x-1][this.y] = new this.replicating(this.x-1, this.y)
            }
            if (insideGrid(this.x+1) && (Grid[this.x+1][this.y] instanceof Empty)) {
                Grid[this.x+1][this.y] = new this.replicating(this.x+1, this.y)
            }
        }
        
    }

    static load(x, y, color) {
        Grid[x][y] = new Multi(x,y);
    }
}

class Wall extends Solid {
    constructor(x, y) {
        super("6", [170, 74, 68, 255], x, y);
        this.Unbrekable = true;
        this.Category = CATEGORY.UTILITIES;
    }

    static load(x, y, color) {
        Grid[x][y] = new Wall(x,y);
    }
}

class Fire extends Gas {
    constructor(x, y) {
        super("7", [252, 116, 5, 255], x, y);
        this.dispersionRate = 1
        this.dissipationTime = 5;
        this.riseUp = false;
        this.Category = CATEGORY.UTILITIES;
        this.Flammability = -1;
    }

    onTick() {
        if (this.dissipationTime <= 0) {
            Grid[this.x][this.y] = new DATA_BY_ID["0"](this.x, this.y)
            return;
        }
        if (this.dissipationTime == 3)
            this.Color = [54, 69, 79, 255]
        let burned = false;
        if (insideGrid(this.y-1) && !Grid[this.x][this.y-1].Unbrekable && !(Grid[this.x][this.y-1] instanceof Fire) && Math.random() < Grid[this.x][this.y-1].Flammability) {
            Grid[this.x][this.y-1] = new DATA_BY_ID[Grid[this.x][this.y-1].HeatingId](this.x, this.y-1)
            burned = true;
        }
        if (insideGrid(this.y+1) && !Grid[this.x][this.y+1].Unbrekable && !(Grid[this.x][this.y+1] instanceof Fire) && Math.random() < Grid[this.x][this.y+1].Flammability) {
            Grid[this.x][this.y+1] = new DATA_BY_ID[Grid[this.x][this.y+1].HeatingId](this.x, this.y+1)
            burned = true;
        }
        if (insideGrid(this.x-1) && !Grid[this.x-1][this.y].Unbrekable && !(Grid[this.x-1][this.y] instanceof Fire) && Math.random() < Grid[this.x-1][this.y].Flammability) {
            Grid[this.x-1][this.y] = new DATA_BY_ID[Grid[this.x-1][this.y].HeatingId](this.x-1, this.y)
            burned = true;
        }
        if (insideGrid(this.x+1) && !Grid[this.x+1][this.y].Unbrekable && !(Grid[this.x+1][this.y] instanceof Fire) && Math.random() < Grid[this.x+1][this.y].Flammability) {
            Grid[this.x+1][this.y] = new DATA_BY_ID[Grid[this.x+1][this.y].HeatingId](this.x+1, this.y)
            burned = true;
        }
        if (burned) {
            Grid[this.x][this.y] = new DATA_BY_ID["0"](this.x, this.y)
            this.dissipationTime = 0;
        }
        super.onTick()
        this.dissipationTime--;
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Fire(x,y);
        if (compareColors(color, [54, 69, 79, 255])) {
            Grid[x][y].dissipationTime = 3;
        }
    }
}

class Oil extends Liquid {
    constructor(x ,y) {
        super("8", [73, 76, 79, 255], x ,y);
        this.dispersionRate = 2
        this.HeatingId = "7";
        this.Flammability = 0.75;
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        if (insideGrid(this.y-1)) {
            if (Grid[this.x][this.y-1] instanceof Water) {
                switchPlaces(this.x, this.y, this.x, this.y-1, this)
            }
        }
        super.onTick()
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Oil(x,y);
    }
}

class Ice extends Dust {
    constructor(x ,y) {
        super("9", [174, 219, 240, 255], x ,y);
        this.HeatingId = "2";
        this.isFreeFalling = false;
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        if (insideGrid(this.y-1) && !Grid[this.x][this.y-1].Unbrekable && !(Grid[this.x][this.y-1] instanceof Ice) && Math.random() < Grid[this.x][this.y-1].Coolability && Grid[this.x][this.y-1].Freezable) {
            Grid[this.x][this.y-1] = new DATA_BY_ID[Grid[this.x][this.y-1].CoolingId](this.x, this.y-1)
        }
        if (insideGrid(this.y+1) && !Grid[this.x][this.y+1].Unbrekable && !(Grid[this.x][this.y+1] instanceof Ice) && Math.random() < Grid[this.x][this.y+1].Coolability && Grid[this.x][this.y+1].Freezable) {
            Grid[this.x][this.y+1] = new DATA_BY_ID[Grid[this.x][this.y+1].CoolingId](this.x, this.y+1)
        }
        if (insideGrid(this.x-1) && !Grid[this.x-1][this.y].Unbrekable && !(Grid[this.x-1][this.y] instanceof Ice) && Math.random() < Grid[this.x-1][this.y].Coolability && Grid[this.x-1][this.y].Freezable) {
            Grid[this.x-1][this.y] = new DATA_BY_ID[Grid[this.x-1][this.y].CoolingId](this.x-1, this.y)
        }
        if (insideGrid(this.x+1) && !Grid[this.x+1][this.y].Unbrekable && !(Grid[this.x+1][this.y] instanceof Ice) && Math.random() < Grid[this.x+1][this.y].Coolability && Grid[this.x+1][this.y].Freezable) {
            Grid[this.x+1][this.y] = new DATA_BY_ID[Grid[this.x+1][this.y].CoolingId](this.x+1, this.y)
        }
        
        if (this.isFreeFalling) {
            if (insideGrid(this.x+1) && Grid[this.x+1][this.y] instanceof Dust && Math.random() <= this.InertialResistance) Grid[this.x+1][this.y].isFreeFalling = true;
            if (insideGrid(this.x-1) && Grid[this.x-1][this.y] instanceof Dust && Math.random() <= this.InertialResistance) Grid[this.x-1][this.y].isFreeFalling = true;
        }
        if (insideGrid(this.y+1)) {
            if (Grid[this.x][this.y+1].CanPassThrough) {
                this.isFreeFalling = true
                switchPlaces(this.x, this.y, this.x, this.y+1, this)
            } else if (this.isFreeFalling) {
                var side = Math.random() < 0.5 ? 1 : -1;
                if (insideGrid(this.x+side)) {
                    if (Grid[this.x+side][this.y+1].CanPassThrough && !(Grid[this.x+side][this.y] instanceof Liquid)) {
                        this.isFreeFalling = true
                        switchPlaces(this.x, this.y, this.x+side, this.y+1, this) 
                    }
                }
            }
            
        }
        
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Ice(x,y);
    }
}

class Wood extends Solid {
    constructor(x, y) {
        super("10", [150, 111, 51, 255], x, y);
        this.HeatingId = "7";
        this.Flammability = 0.9;
        this.Category = CATEGORY.MATERIALS;
    }

    static load(x, y, color) {
        Grid[x][y] = new Wood(x,y);
    }
}

class Plant extends Dust {
    constructor(x, y) {
        super("11", [90, 171, 97, 255], x, y);
        this.Category = CATEGORY.LIFE;
        this.Flammability = 0.7;
        this.HeatingId = "7";
        this.plant = true;

    }

    flower() {
        if (Math.random() < 0.02) {
            Grid[this.x][this.y] = new Flower(this.x, this.y)
            Grid[this.x][this.y].bloom()
        }
    }

    onTick() {
        super.onTick();
        var watered = false;
        if (insideGrid(this.y-1) && Grid[this.x][this.y-1] instanceof Water) {
            Grid[this.x][this.y-1] = new DATA_BY_ID["0"](this.x, this.y-1)
            watered = true;
        }
        if (insideGrid(this.y+1) && Grid[this.x][this.y+1] instanceof Water) {
            Grid[this.x][this.y+1] = new DATA_BY_ID["0"](this.x, this.y+1)
            watered = true;
        }
        if (insideGrid(this.x-1) && Grid[this.x-1][this.y] instanceof Water) {
            Grid[this.x-1][this.y] = new DATA_BY_ID["0"](this.x-1, this.y)
            watered = true;
        }
        if (insideGrid(this.x+1) && Grid[this.x+1][this.y] instanceof Water) {
            Grid[this.x+1][this.y] = new DATA_BY_ID["0"](this.x+1, this.y)
            watered = true;
        }
        if (watered) {
            var side = Math.random() < 0.5 ? 1 : -1;
            if (insideGrid(this.x+side) && Math.random() < 0.2) {
                if (Grid[this.x+side][this.y] instanceof Empty) {
                    Grid[this.x+side][this.y] = new Plant(this.x+side, this.y);
                    Grid[this.x+side][this.y].Gravity = false;
                    this.flower();
                    return;
                }
            } 
            if (insideGrid(this.x-side) && Math.random() < 0.2) {
                if (Grid[this.x-side][this.y] instanceof Empty) {
                    Grid[this.x-side][this.y] = new Plant(this.x-side, this.y);
                    Grid[this.x-side][this.y].Gravity = false;
                    this.flower();
                    return;
                }
            } 
            if (insideGrid(this.y-1) && Math.random() < 0.2) {
                if (Grid[this.x][this.y-1] instanceof Empty) {
                    Grid[this.x][this.y-1] = new Plant(this.x, this.y-1);
                    Grid[this.x][this.y-1].Gravity = false;
                    this.flower();
                    return;
                }
            }

            if (insideGrid(this.y+1) && Math.random() < 0.2) {
                if (Grid[this.x][this.y+1] instanceof Empty) {
                    Grid[this.x][this.y+1] = new Plant(this.x, this.y+1);
                    Grid[this.x][this.y+1].Gravity = false;
                    this.flower();
                    return;
                }
            }
        }
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Plant(x,y);
        Grid[x][y].Gravity = false;
    }
}

class Flower extends Dust {
    constructor(x, y) {
        super("12", [181, 169, 159, 255], x, y);
        this.Category = CATEGORY.LIFE;
        this.planted = false;
        this.isFreeFalling = false;
        this.Flammability = 0.7;
        this.HeatingId = "7";
        this.plant = true;
    }

    bloom() {
        this.planted = true
        this.Color = [252, 196, 57, 225]
        var colorType = Math.floor(Math.random() * 3) + 1;
        var petalColor;
        switch (colorType) {
            case 1:
            default:
                petalColor = [255, 144, 93, 225]
                break;
            case 2:
                petalColor = [255, 34, 87, 225]
                break;
            case 3:
                petalColor = [17, 186, 202, 225]
                break;
        }
        if (insideGrid(this.y+1) && (Grid[this.x][this.y+1] instanceof Empty || Grid[this.x][this.y+1] instanceof Plant)) {
            Grid[this.x][this.y+1] = new FlowerPetal(this.x, this.y+1, this.x, this.y)
            Grid[this.x][this.y+1].Color = petalColor;
        }
        if (insideGrid(this.y-1) && (Grid[this.x][this.y-1] instanceof Empty || Grid[this.x][this.y-1] instanceof Plant)) {
            Grid[this.x][this.y-1] = new FlowerPetal(this.x, this.y-1, this.x, this.y)
            Grid[this.x][this.y-1].Color = petalColor;
        }
        if (insideGrid(this.x+1) && (Grid[this.x+1][this.y] instanceof Empty || Grid[this.x+1][this.y] instanceof Plant)) {
            Grid[this.x+1][this.y] = new FlowerPetal(this.x+1, this.y, this.x, this.y)
            Grid[this.x+1][this.y].Color = petalColor;
        }
        if (insideGrid(this.x-1) && (Grid[this.x-1][this.y] instanceof Empty || Grid[this.x-1][this.y] instanceof Plant)) {
            Grid[this.x-1][this.y] = new FlowerPetal(this.x-1, this.y, this.x, this.y)
            Grid[this.x-1][this.y].Color = petalColor;
        }
    }

    onTick() {
        if (!this.planted) {
            super.onTick();
            if (insideGrid(this.y+1)) {
                if (Grid[this.x][this.y+1] instanceof Plant || Grid[this.x][this.y+1] instanceof Sand) {
                    this.bloom()
                }
                else if (!(Grid[this.x][this.y+1] instanceof Plant || Grid[this.x][this.y+1] instanceof Sand || Grid[this.x][this.y+1] instanceof Empty || Grid[this.x][this.y+1] instanceof Flower)) {
                    Grid[this.x][this.y] = new Empty(this.x, this.y)
                }
            }
            else {
                Grid[this.x][this.y] = new Empty(this.x, this.y)
            }

        }

        else {
            if (insideGrid(this.y+1)) {
                if (!(Grid[this.x][this.y+1] instanceof Plant || Grid[this.x][this.y+1] instanceof Sand || Grid[this.x][this.y+1] instanceof FlowerPetal)) {
                    Grid[this.x][this.y] = new Empty(this.x, this.y)
                    
                } 
            }
        }
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Flower(x,y);
        if (compareColors(color, [252, 196, 57, 225])) {
            Grid[x][y].bloom();
        }
    }
}

class FlowerPetal extends Solid {
    constructor(x, y, conx, cony) {
        super("13", [226, 226, 226, 255], x, y);
        this.connectionX = conx;
        this.connectionY =  cony;
        this.Flammability = 0.7;
        this.HeatingId = "7";
        this.plant = true;
    }

    onTick() {
        if (!(Grid[this.connectionX][this.connectionY] instanceof Flower)) {
            Grid[this.x][this.y] = new Empty(this.x, this.y)
        }
        return;
    }
}

class PinkSand extends Dust {
    constructor(x ,y) {
        super("14", [237, 151, 151, 255], x ,y);
        this.isFreeFalling = false;
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        super.onTick()
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new PinkSand(x,y);
    }
}

class Stone extends GravitySolid {
    constructor(x ,y) {
        super("15", [136, 140, 141, 255], x ,y);
        this.isFreeFalling = false;
        this.Category = CATEGORY.MATERIALS;
    }

    onTick() {
        super.onTick()
        return;
    }

    static load(x, y, color) {
        Grid[x][y] = new Stone(x,y);
    }
}

class RainbowSand extends Dust {
    constructor(x ,y) {
        super("16", [255, 255, 127, 255], x ,y);
        this.isFreeFalling = false;
        this.Category = CATEGORY.MATERIALS;
    }


    onTick() {
        super.onTick()
        let base = (this.x + this.y + (performance.now() / 32)) % 90;
        this.Color = this.toRGB(base / 90, 0.5, 1)
        return;
    }

    toRGB(h, s, v) {
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [ r * 255, g * 255, b * 255, 255];
    }
}