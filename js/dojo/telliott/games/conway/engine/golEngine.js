/**
 * @author mrtom
 */
dojo.provide("telliott.games.conway.engine.golEngine");

dojo.declare("telliott.games.conway.engine.golEngine", null, {
    
    _id: null,
    _showNeighboursNum: false,
    
    _grid: { },

    cells: [],
    cellsToToggle: [],
    
    constructor: function(/* Property Bag*/ props) {
        this._id = props.controllerId + "_engine";
        var gridWidth = props.width || 0;
        var gridHeight = props.height || 0;
        var seed = props.seed || [];

        this._grid = new telliott.games.conway.engine.golEngine._grid(gridWidth, gridHeight);
        
        // Create a 2D array to represent my cells
        for (var x = 0; x < this._grid.getWidth(); x++) {
            this.cells[x] = new Array(this._grid.getHeight());
        }
        
        // Init each cell in my grid
        for (var x = 0; x < this._grid.getWidth(); x++) {
            for (var y = 0; y < this._grid.getHeight(); y++) {
                this.cells[x][y] = new telliott.games.conway.engine.golEngine._cell(x, y, this._grid, this.cells);
            }
        }
        
        // Setup the neighbours for each cell
        for (var x = 0; x < this._grid.getWidth(); x++) {
            for (var y = 0; y < this._grid.getHeight(); y++) {
                this.cells[x][y].findNeighbouringCells();
            }
        }
        
        this._seedGrid(seed);
    },
    
    /**
     * Seed the grid by clearing the current state and resuscitating the
     * cells provided by seed
     * 
     * @param {Object} Array of Live cell positions: seed
     */
    seedGrid: function(/* Array of Live cell positions */ seed) {
        if (dojo.isArray(seed)) {
            this._clear();
            this._seedGrid(seed);            
        }
    },
    
    /**
     * Public function to toggle the current state of a cell
     * @param {Object} Array of {x, y} pairs: toToggle
     */
    toggleCells: function(/* Array of {x,y} */ toToggle) {
        if (dojo.isArray(toToggle)) {
            while (toToggle.length > 0) {
                var o = toToggle.pop();
                var x = o.x;
                var y = o.y;
                
                if (this.isContainedWithinGrid(x, y)) {
                    var cell = this.cells[x][y];
                    cell.isAlive() ? cell.kill() : cell.resuscitate();
                }
            }
        }
    },
    
    /**
     * Resize the grid. This will calculate the neighbouring cells for changed cells too
     * @param {Object} newX - new x (width) dimension, assumed > 0
     * @param {Object} newY - new y (height) dimension, assumed > 0
     * @return: true if the resize succeeds. False otherwise
     */
    resizeGrid: function(/* int */ newX, /* int */ newY) {
        if (typeof newX === "number" && newX > 0 && typeof newY === "number" && newY > 0) {
            var curWidth = dojo.clone(this._grid.getWidth());
            var curHeight = dojo.clone(this._grid.getHeight());
            
            // First, cull
            if (newX < curWidth) {
                this.cells.splice(newX, (curWidth - newX));
                this._grid.setWidth(newX);
            }
            
            if (newY < curHeight) {
                for (var i = 0; i < newX; i++) {
                    this.cells[i].splice(newY, (curHeight - newY));
                }
                this._grid.setHeight(newY);
            }
            
            // Then grow
            if (newX > curWidth) {
                for (var i = curWidth; i < newX; i++) {
                    this.cells[i] = new Array(newY);
                    for (var j = 0; j < newY; j++) {
                        this.cells[i][j] = new telliott.games.conway.engine.golEngine._cell(i, j, this._grid, this.cells);
                    }
                }
                this._grid.setWidth(newX);        
            }
            
            if (newY > curHeight) {
                for (var j = curHeight; j < newY; j++) {
                    for (var i = 0; i < newX; i++) {
                        this.cells[i][j] = new telliott.games.conway.engine.golEngine._cell(i, j, this._grid, this.cells);
                    }
                }
                this._grid.setHeight(newY);
            }
            
            // Then calculate the new neighbours
            // TODO: This will run even when the values havn't changed, which is inefficient
            // Subtract 2 because the final row/column will be newX,Y - 1, and we need to jump one back again to calculate the neighbours
            // for the previous row/column, as they'll have new neighbours!
            var neighX = Math.min(newX, curWidth) - 2
            var neighY = Math.min(newY, curHeight) -2; 
            
            // If we're negative, make zero
            if (neighX < 0) neighX =  0;
            if (neighY < 0) neighY = 0;
            
            // Columns first
            if (newX != curWidth) {
                for (var i = neighX; i < newX; i++) {
                    for (var j = 0; j < newY; j++) {
                        this.cells[i][j].findNeighbouringCells();
                    }
                }
            }
            
            // Now the rows
            if (newY != curHeight) {
                // TODO: We're going to end up doing the new corners twice. Maybe optimize this out?
                for (var i = 0; i < newX; i++) {
                    for (var j = neighY; j < newY; j++) {
                        this.cells[i][j].findNeighbouringCells();
                    }
                }
            }
        }
        else {
            return false;
        }

        return true;
    },
    
    /**
     * Clear the grid, essentially marking every cell as dead
     */
    _clear: function() {
        // TODO: Keep an array of the resusciated cells to make this quicker?
        this._applyToCells(function(c) {
            if (c.isAlive()) c.kill();
        });
    },
    
    /**
     * Resuscitate the cells provided by seed. Does not clear the grid first!
     * @param {Object} Array of Live cell positions: seed
     */
    _seedGrid: function(/* Array of Live cell positions */ seed) {
        while(seed.length > 0) {
            var values = seed.pop();
            
            // We can't just do: var x = values.x || someDefaultValue 
            // as 0 will fail the check and is valid here
            var x = typeof values.x === 'number' ? values.x : -1;
            var y = typeof values.y === 'number' ? values.y : -1; 
                        
            if (this.isContainedWithinGrid(x,y)) {
                this.cells[x][y].resuscitate();
            }
            else {
                console.error("Attempted to seed grid with unknown cell: " + x + ", " + y);
            }
        }
    },
    
    /**
     * Returns the current state of the application
     */
    getCurrentState: function() {
        return  this.cells;
    },
    
    /**
     * Calculate the next step
     */
    calculate: function() {
        for (var x = 0; x < this._grid.getWidth(); x++) {
            for (var y = 0; y < this._grid.getHeight(); y++) {
                var currentCell = this.cells[x][y];
                var cellNeighbours = currentCell.getNeighbours();
                
                if (currentCell.isAlive() && cellNeighbours < 2) {
                    //console.debug("Cell " + currentCell._x + ", " + currentCell._y + " has " + cellNeighbours + "(< 2) neighbours. Killing...");
                    this.cellsToToggle.push(currentCell);
                }
                else if (currentCell.isAlive() && cellNeighbours > 3) {
                    //console.debug("Cell " + currentCell._x + ", " + currentCell._y + " has " + cellNeighbours + " (> 3) neighbours. Killing...");
                    this.cellsToToggle.push(currentCell);
                }
                else if (!currentCell.isAlive() && cellNeighbours === 3) {
                    //console.debug("Cell " + currentCell._x + ", " + currentCell._y + " has exactly 3 neighbours. Resuciating...");
                    this.cellsToToggle.push(currentCell);
                }
            }
        }
        
        return {
            allCells: this.cells,
            cellsToToggle: this.cellsToToggle
        };
        
    },
    
    /**
     * Update the grid to the next step
     */
    applyChanges: function() {    
        // Update the model and clear the cache
        while (this.cellsToToggle.length > 0) {
            var cell = this.cellsToToggle.pop();
            cell.isAlive() ? cell.kill() : cell.resuscitate();
        }
    },
    
    /**
     * Returns true if the point x,y is contained within the grid
     * @param {Object} int x : x coordinate
     * @param {Object} int y : y coordinate
     */
    isContainedWithinGrid: function(/* int */ x, /* int */ y) {
        return (x >= 0 && x < this._grid.getWidth() && y >= 0 && y < this._grid.getHeight());
    },
    
    /**
     * Runs the function, f, one for every cell. The only argument given to f will the a cell
     * (optional): scope: The scope to run f in
     * 
     * @param {Object} Function f
     * @param {Object} scope scope
     */
    _applyToCells:function(/* Function */ f, /* scope */ scope) {
        var s = scope || this;
        for (var x = 0; x < this._grid.getWidth(); x++) {
            for (var y = 0; y < this._grid.getHeight(); y++) {
                dojo.hitch(s, f(this.cells[x][y]));
            }
        }    
    }
});

dojo.declare("telliott.games.conway.engine.golEngine._grid", null, {
    _width: 0,
    _height: 0,
    
    constructor: function(/* int */ width, /* int */ height) {
        this._width = width || 0;
        this._height = height || 0;
    },
    
    getWidth: function() {
        return this._width;
    },
    
    getHeight: function() {
        return this._height;
    },
    
    setWidth: function(/* int */ newWidth) {
        this._width = dojo.clone(newWidth);
    },
    
    setHeight: function(/* int */ newHeight) {
        this._height = dojo.clone(newHeight);
    }
});

dojo.declare("telliott.games.conway.engine.golEngine._cell", null, {
    
    _x: 0,
    _y: 0,
    
    _alive: false,
    
    _grid: null,
    _allCells: null,
    _neighbours: null,
    
    constructor: function(/* int */ x, /* int */ y, /* telliott.games.conway.GameOfLife._grid */ grid, /* [][] */ cells) {
        this._x = x;
        this._y = y;
        
        this._grid = grid;
        this._allCells = cells;
    },
    
    resuscitate: function() {
        //console.debug("Resuscitating cell " + this._x + ", " + this._y);
        this._alive = true;
    },
    
    kill: function() {
        //console.debug("Killing cell " + this._x + ", " + this._y);
        this._alive = false;
    },
    
    isAlive: function() {
        return this._alive;
    },
    
    /**
     * Calculates the neighbouring cells for this cell and stores in _neighbours (an array)
     */
    findNeighbouringCells: function() {
        //console.log("Generating neighbours for [" + this._x + "," + this._y + "]");
        this._neighbours = [];
        var n = 0;
        
        /*
           .........
           .........
           ...XXX...
           ...X0X...
           ...XXX...
           .........
           .........
           
           ^y
           x->
        */
        
        // Add the row of y's 'behind' you if there is one
        if (this._x > 0) {
            this._neighbours.push(this._allCells[this._x - 1][this._y]);
            if (this._y < (this._grid.getHeight() - 1)) {
                this._neighbours.push(this._allCells[this._x - 1][this._y + 1]);
            }
            if (this._y > 0) {
                this._neighbours.push(this._allCells[this._x - 1][this._y - 1]);
            }
        }
        
        // Add the row of y's 'in front' of you if there is one
        if (this._x < (this._grid.getWidth() - 1)) {
            this._neighbours.push(this._allCells[this._x + 1][this._y]);
            if (this._y < (this._grid.getHeight() - 1)) {
                this._neighbours.push(this._allCells[this._x + 1][this._y + 1]);
            }
            if (this._y > 0) {
                this._neighbours.push(this._allCells[this._x + 1][this._y - 1]);
            }            
        }
        
        // Add the cells above and below you, if they exist
        if (this._y > 0) {
            this._neighbours.push(this._allCells[this._x][this._y - 1]);
        }
        if (this._y < (this._grid.getHeight() - 1)) {
            this._neighbours.push(this._allCells[this._x][this._y + 1]);
        }
        
        //console.debug("Neighbouring cells found for " + this._x + ", " + this._y + ". Total found = " + this._neighbours.length);
    },
    
    /**
     * Returns the living neighbours for this cell
     */
    getNeighbours: function() {
        //console.debug("Getting neighbours for " + this._x + ", " + this._y);
        var count = 0;
        
        for (var i = 0; i < this._neighbours.length; i++) {
            if (typeof this._neighbours[i] != "undefined" && this._neighbours[i].isAlive()) {
                count++;
            }
        }
        
        //console.debug("Found " + count + " neighbours for cell " + this._x + ", " + this._y);
        return count;
    },
    
    // Returns the x,y location of itself as an object: { x: _x, y: _y}
    getLocation: function() {
        return {x: this._x, y: this._y};
    }
});

