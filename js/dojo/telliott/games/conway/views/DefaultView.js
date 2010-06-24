dojo.provide("telliott.games.conway.views.DefaultView");

dojo.require("dijit.Dialog");
dojo.require("dijit.layout.ContentPane");
dojo.require("telliott.games.conway.views.DefaultControls");

dojo.declare("telliott.games.conway.views.DefaultView", [dijit.layout.ContentPane, telliott.games.conway.views.DefaultControls], {
    
    // Instance Vars
    
    // The id of the game controller we wish to represent
    _controllerId: null,
    _controller: null,
    _currentSize: null,
    _width: null,
    _height: null,
    _containerNode: null,
    
    _containedWidgets: null,
    
    _container: null,
    
    constructor: function(/* property bag */ props) {
           if (!(props.controllerId && props.controller && props.gridWidth && props.gridHeight)) {
            throw new Error("You must provide an ID for a GameOfLife Controller and grid height and width. Aborting!");
        }
        
        dojo.addClass(dojo.body(), "goldefaultview");
        
        this._controllerId = props.controllerId;
        this._controller = props.controller;
        this._width = props.gridWidth;
        this._height = props.gridHeight;
        this._containedWidgets = [];
        this._cellSizes = [this.CELL_SIZE_EXTRA_SMALL, this.CELL_SIZE_SMALL, this.CELL_SIZE_MEDIUM, this.CELL_SIZE_LARGE, this.CELL_SIZE_EXTRA_LARGE ];
        
        // TODO: Set size based on grid and viewport size?
        this._currentSize = this.CELL_SIZE_SMALL;
    },
    
    postCreate: function() {
        this.inherited(arguments);
        
        this._createLayout();
                
        // Subscribe to updates from the controller
        dojo.subscribe(this._controllerId + "-reset-board", dojo.hitch(this, function(/* 2D Cell array */ all_cells) {
            this._setupDisplay(all_cells);
        }));
        dojo.subscribe(this._controllerId + "-step-diff", dojo.hitch(this, function(/* 1D Cell array */ cells) {
            this._updateDisplay(cells);
        }));
        dojo.subscribe(this._controllerId + "-game-ended", dojo.hitch(this, function() {
            this._controller.pause();
            dojo.attr(this._startBtn, "label", "Start");
            dojo.attr(this._startBtn, "playing", false);
            new dijit.Dialog({
                title: "Game Over!",
                content: "The game has reached a steady state. Reset or modify the board, and then hit Start to play again :)",
                style: "width:500px;"
            }).show();
        }));
        dojo.subscribe(this._controllerId + "-interval", this, function(/* int */ interval) {
            var index = dojo.indexOf(this._controller.speeds, interval);
            if (index >= 0) {
                this._speedSlider.attr("value", index);
            }
            else {
                log.error("Unknown value for speed slider: " + index);
            }
        });
        dojo.subscribe(this._controllerId + "-pause", this, function() {
            this._startBtn.setPaused(false);
        });
        dojo.subscribe(this._controllerId + "-play", this, function() {
            this._startBtn.setPlaying(false);
        });
    },
    
    _createGrid: function(/* boolean */ createTable) {
        // Table for the game board
        var table;
        
        if (createTable || !dojo.byId(this.id+"_gameBoard")) {
          table = dojo.create("table", { id: this.id+"_gameBoard"}, this.domNode);            
        }
        else {
            table = dojo.byId(this.id+"_gameBoard");
            dojo.empty(table);
        }
        
        var cssClass = this._getCellSizeCssSelector(this._currentSize);
        
        dojo.addClass(table, "gameBoard");
        
        for (var y = 0; y < this._height; y++) {
            var row = dojo.create("tr", { id: "gameRow_" + y}, table);
            dojo.addClass(row, "gameRow");
            for (var x = 0; x < this._width; x++) {
                var cell = dojo.create("td", { 
                    id: "gameCell_" + x + "_" + y,
                    xCoord: x,
                    yCoord: y
                }, row);
                dojo.addClass(cell, "gameCell " + cssClass);
                dojo.connect(cell, "onclick", this, function(evt) {
                    this._controller.toggleCell(dojo.attr(evt.target, "xCoord"), dojo.attr(evt.target, "yCoord"));
                    dojo.toggleClass(evt.target, "alive");
                });
            }
        }
    },
    
    _updateCellSize: function(/* int */ newSize) {
        var oldCss = this._getCellSizeCssSelector(this._currentSize);
        var newCss = this._getCellSizeCssSelector(newSize);
        if (oldCss && newCss) {
            dojo.query(".gameBoard td.gameCell." + oldCss).forEach(function(td) {
                dojo.addClass(td, newCss);
                dojo.removeClass(td, oldCss);
            });
            this._currentSize = newSize;
        }
    },
    
    _getCellSizeCssSelector: function(/* int */ size) {
        if (size >= 0 && size < this._cellSizes.length) {
            switch(size) {
                case this.CELL_SIZE_EXTRA_SMALL:
                    return "extraSmall";
                case this.CELL_SIZE_SMALL:
                    return "small";
                case this.CELL_SIZE_LARGE:
                    return "large";
                case this.CELL_SIZE_EXTRA_LARGE:
                    return "extraLarge"
                case this._CELL_SIZE_MEDIUM:
                    // Fall through
                default:
                    // Shouldn't be possible, but just in case
                    return "medium";
            }
        }
        return null;
    },
    
    _setupDisplay: function(all_cells) {
        // If the grid is a different size, bin the old one and start over
        
        if (all_cells.length !== this._width || all_cells[0].length !== this._height) {
            this._width = all_cells.length;
            this._height = all_cells[0].length;
            dojo.empty(this.id+"_gameBoard");
            this._createGrid(false);
        }
        
        var alive = [];
        
        dojo.query(".gameCell.alive").forEach(function(n){
            dojo.removeClass(n, "alive");
        });
        
        for (var x = 0; x < all_cells.length; x++) {
            for (var y = 0; y < all_cells.length; y++) {
                var cell = all_cells[x][y];
                if (cell && cell.isAlive()) {
                    alive.push(cell);
                }
            }
        }
        this._updateDisplay(alive);
    },
    
    _updateDisplay: function(cells) {
        for (var i = 0; i < cells.length; i++) {
            var coords = cells[i].getLocation();
            if (coords) {
                var id = "gameCell_" + coords.x + "_" + coords.y;
                dojo.toggleClass(id, "alive");
            }
        }
    }
});
