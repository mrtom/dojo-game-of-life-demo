/**
 * @author mrtom
 */
dojo.provide("telliott.games.conway.GameOfLife");
dojo.require("telliott.games.conway.Seeds");
dojo.require("telliott.games.conway.engine.golEngine");

dojo.declare("telliott.games.conway.GameOfLife", null, {
    
    // STATICS
    SPEED_TWO_SECONDS: 2000,
    SPEED_ONE_SECOND: 1000,
    SPEED_500_MILLIS: 500,
    SPEED_200_MILLIS: 200,
    SPEED_100_MILLIS: 100,
    SPEED_50_MILLIS: 50,
    
    _seeds: new telliott.games.conway.Seeds(),
    
    // Instance variables
    
    _id: null,
    _defaultInterval: this.SPEED_ONE_SECOND,
    _debug: false,
    
    // Optional: Can define a View class when you create the game. If you do
    // You *must* also supply a node (String | DOMNode)
    _view: null,
    
    // Default View Widget, if and only if the View class was passed in during construction
    _viewWidget: null,
    
    // Container node for the View Widget, if and only if the View class was passed in during construction
    _node: null,
    
    _defaultGridWidth: 30,
    _defaultGridHeight: 30,
    
    _gridWidth: null,
    _gridHeight: null,
    
    _engine: null,
    _toToggle: null,
    
    _interval: 0,
    
    timer: null,
    
    speeds: [],
    
    _seed: [],
	_forcePublishFullGrid: null,
    
    constructor: function(/* Property Bag*/ props) {
        this._id = props.id;
        this._gridWidth = props.width || this._defaultGridWidth;
        this._gridHeight = props.height || this._defaultGridHeight;
        // TODO: Setup interval based on cookie
        this._interval = props.interval || this._defaultInterval;
        this._debug = props.debug || this._debug;
        this._view = props.view || null;
        this._node = props.node ? dojo.byId(props.node) : null;
        this._toToggle = [];
        
        // TODO: This is a glider. We should actually set this to 'glider', and get the UI to reflect what we've set it to
        // At the moment they're both just hard coded
        this._seed = [
            {x:4, y:4},
            {x:4, y:5},
            {x:4, y:6},
            
            {x:3, y:6},
            {x:2, y:5}
        ];

        this.speeds = [this.SPEED_TWO_SECONDS, this.SPEED_ONE_SECOND, this.SPEED_500_MILLIS, this.SPEED_200_MILLIS, this.SPEED_100_MILLIS, this.SPEED_50_MILLIS];

        this._engine = new telliott.games.conway.engine.golEngine({
            controllerId: this._id,
            width: this._gridWidth,
            height: this._gridHeight,
            seed: this._seed
        });
        
        if (this._debug) {
            dojo.require("telliott.games.conway.views.DebugView");
            dojo.ready(dojo.hitch(this, function() {
                new telliott.games.conway.views.DebugView({
                    engineId: this._id,
                    gridWidth: this._gridWidth,
                    gridHeight: this._gridHeight
                });                
            }));
        }
        
        if (this._view && this._node) {
            dojo.require(this._view);
            dojo.ready(dojo.hitch(this, function() {
                // Use dojo.getObject to get the 'class'
                var view = dojo.getObject(this._view);
                
                this._viewWidget = new view({
                    controllerId: this._id,
                    controller: this,
                    gridWidth: this._gridWidth,
                    gridHeight: this._gridHeight
                }, this._node);
            }));
        }
                
        // Wrap 'publish' in a dojo.ready to make sure view has loaded.
        dojo.ready(dojo.hitch(this, function() {
            this._publishGrid(this._engine.getCurrentState());
            this._publishInterval();
        }));        
    },
    
    // Starts the game
    start: function() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(dojo.hitch(this, this.step), this._interval);
        dojo.publish(this._id + "-start");
    },
    
    // Pause execution of the game
    pause: function() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            dojo.publish(this._id + "-pause");
            return true;
        }
        return false;
    },
    
    // Like a video. Go back to the beginning
    stop: function() {
        this.pause();
        this._engine.seedGrid(dojo.clone(this._seed));
        this._publishGrid(this._engine.getCurrentState());
    },
    
    // Same as stop
    reset: function() {
        this.stop();
    },
    
    // Stop the game, then clear the grid
    clear: function() {
        this.pause();
        this._engine.seedGrid([ /* Empty seed will clear the grid */]);
        this._publishGrid(this._engine.getCurrentState());
    },
    
    // Move the game forward one step
    step: function() {
        // First, empty the toggle stack
        this._engine.toggleCells(this._toToggle);
        this._toToggle = [];
        
        // Now get the engine to calculate the next state
		// This will return the new state of the board, but does *not* actually apply
		// that state to the board
        var result = this._engine.calculate();
		if (!this._forcePublishFullGrid) {
	        this._publish(result.allCells, result.cellsToToggle);
		}
		else {
			this._publishGrid(result.allCells);
			this._forcePublishFullGrid = false;
		}
        if (result.cellsToToggle.length == 0) {
            console.debug("No cells changed. Game Over!");
            this.pause();
            this._publishGameEnd();    
        }

        // Now apply that state to the board
		// We do this after the UI has updated in case it's a slow operation
        this._engine.applyChanges();
    },
    
    // Called by the view to toggle a cell as either on or off. For example, by clicking a cell
    toggleCell: function(/* int */ x, /* int */ y) {
        if (x && y) {
            this._toToggle.push({x: x, y: y});
        }
    },
    
    updateInterval: function(/* int */ newIntervalPos) {
        if (newIntervalPos >= 0 && newIntervalPos < this.speeds.length) {
            this._interval = this.speeds[newIntervalPos];
            this._publishInterval();
            if (this.pause()) {
                this.start();
            }
            return true;
        }
        return false;
    },
    
    updateGridSize: function(/* int */ newX, /* int */ newY) {
        var newSize =  {};
        newSize.x = newX || this._gridWidth;
        newSize.y = newY || this._gridHeight;
		
        this._engine.resizeGrid(newSize.x, newSize.y);
		
        if (this.pause()) {
			this._forcePublishFullGrid = true;
            this.start();
        }
		else {
			// Force a re-load of the grid
			this.stop();
		}
		
		this._gridWidth = newSize.x;
		this._gridHeight = newSize.y;
    },
    
    getSeeds: function() {
        return this._seeds;
    },
    
    setSeed: function(seed) {
        if (dojo.isArray(seed)) {
            this.pause();
            this._seed = dojo.clone(seed);
            this._engine.seedGrid(seed);
            this._publishGrid(this._engine.getCurrentState());
        }
    },
    
    deserializeCells: function(value) {
        // It's just an array. Return it
        return value;
    },
    
	// Return the current state of the board
	queryState: function() {
		this._publishGrid(this._engine.getCurrentState());
	},
    
    // Publish functions
    _publishInterval: function() {
        dojo.publish(this._id + "-interval", [this._interval]);
    },
    
    _publish: function(/* 2D cell array */ allCells, /* 1D cell array */ cellsToToggle) {
        //console.log("Publishing state...");
        dojo.publish(this._id + "-step-cells", [allCells]); // The complete game board, for views that can't handle just the updated cells
        dojo.publish(this._id + "-step-diff", [cellsToToggle]); // Just the cells that have changed state this step
    },
    
    _publishGrid: function(/* 2D cell array */ allCells) {
        dojo.publish(this._id + "-reset-board", [allCells]); // The complete game board
    },
    
    _publishGameEnd: function() {
        dojo.publish(this._id + "-game-ended");
    },
    
    // Return the view created when this Game was setup, if it exists. Null otherwise
    getView: function() {
        console.log(this._viewWidget);
        return this._viewWidget;
    }
});
