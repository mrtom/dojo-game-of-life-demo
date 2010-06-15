dojo.provide("telliott.games.conway.views.DebugView");

dojo.declare("telliott.games.conway.views.DebugView", null, {
    
    // The id of the game engine we wish to represent
    _engineId: null,
    _width: null,
    _height: null,
    
    constructor: function(/* property bag */ props) {
           if (!(props.engineId && props.gridWidth && props.gridHeight)) {
            throw new Error("You must provide an ID for a GameOfLife Engine and grid height and width. Aborting!");
        }
        
        this._engineId = props.engineId;
        this._width = props.gridWidth;
        this._height = props.gridHeight;
        
        // Create a simple text based view of the game
        if (!dojo.byId("debugContainer")) {
            // FIXME: Clean this up
            var container = dojo.create("div", {
                id: "debugContainer"
            });
            dojo.place(container, dojo.body(), "last");
            
            dojo.style(container, "height", "100%");
            dojo.style(container, "width", "100%");            
        }
        
        dojo.subscribe(this._engineId + "-step-cells", dojo.hitch(this, function(cells) {
            this._displayDebug(cells);
        }));
    },
    
    _displayDebug: function(cells) {
        //console.log("Adding Debug Output...");
        
        dojo.empty("debugContainer");
        var container = dojo.byId("debugContainer");
        var gui = "";
        gui += "<pre style='font-family:monospace; margin: 0; font-size:24px;'>";
        gui += "y>:";
        for (var i = 0; i < this._height; i++) {
            gui += i;
        }
        gui += "***</pre>";
        
        for (var x=0; x < this._width; x++) {
            gui += ("<pre style='font-family:monospace; margin: 0; font-size:24px;'>" + x + "**");
            for (var y=0; y< this._height; y++) {
                var cell = cells[x][y];
                gui += (cell.isAlive() ? "X" : "O");                
            }
            gui += "***</pre>";
        }
        container.innerHTML = gui;
    }
});