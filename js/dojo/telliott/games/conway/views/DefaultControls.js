dojo.provide("telliott.games.conway.views.DefaultControls");

dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.HorizontalRule");
dojo.require("dijit.form.HorizontalRuleLabels");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.form.NumberSpinner");

dojo.declare("telliott.games.conway.views.DefaultControls", null, {

    // TODO: Use i18n for the labels

    // Statics
    CELL_SIZE_EXTRA_SMALL: 0,
    CELL_SIZE_SMALL: 1,
    CELL_SIZE_MEDIUM: 2,
    CELL_SIZE_LARGE: 3,
    CELL_SIZE_EXTRA_LARGE: 4,
    
    _cellSizes: [],

    _createLayout: function() {
        // Create the GUI
        this._createGrid(true);
        
        // Controls:
        // Buttons
        this._stepBtn = new dijit.form.Button({
            label: "Step",
            onClick: dojo.hitch(this, function() {
                this._controller.step();  
            })
        }).placeAt(this.domNode, "first");
        
        this._startBtn = new dijit.form.Button({
            label: "Start",
            onClick: dojo.hitch(this, function() {
                this._startBtn.toggle();
            }),
            // Toggle the state of the button and tell the controller that the button was clicked
            toggle: dojo.hitch(this, function() {
                if (dojo.attr(this._startBtn, "playing")) {
                    this._startBtn.setPaused(true);                    
                }
                else {
                    this._startBtn.setPlaying(true);
                }
            }),
            setPaused: dojo.hitch(this, function(/* boolean */ notify) {
                if (dojo.attr(this._startBtn, "playing")) {
                    if (notify) {
                        this._controller.pause();
                    }
                    dojo.attr(this._startBtn, "label", "Start");
                    dojo.attr(this._startBtn, "playing", false);
                }
            }),
            setPlaying: dojo.hitch(this, function(/* boolean */ notify) {
                if (!dojo.attr(this._startBtn, "playing")) {
                    if (notify) {
                        this._controller.start();
                    }
                    dojo.attr(this._startBtn, "label", "Pause");
                    dojo.attr(this._startBtn, "playing", true);
                }
            })
        }).placeAt(this._stepBtn.domNode, "after");
        dojo.attr(this._startBtn, "playing", false);
        dojo.subscribe(this._controllerId + "-start", dojo.hitch(this, function() {
            this._startBtn.setPlaying(false);
        }));
        
        this._resetBtn = new dijit.form.Button({
            label: "Reset",
            onClick: dojo.hitch(this, function() {
                this._controller.reset();  
            })
        }).placeAt(this._startBtn.domNode, "after");
        
        this._clrBtn = new dijit.form.Button({
            label: "Clear",
            onClick: dojo.hitch(this, function() {
                this._controller.clear();  
            })
        }).placeAt(this._resetBtn.domNode, "after");
    
        // Seed options
        this._seedOptionStore = new dojo.data.ItemFileReadStore({
            data: this._controller.getSeeds(),
            typeMap: {
                'seed': this._controller.deserializeCells
            }
        });
        this._seedOptions = new dijit.form.FilteringSelect({
            id: this.id + "_seed",
            name: this.id + "_seed",
            value: "gl",
            labelAttr: "label",
            store: this._seedOptionStore,
            searchAttr: "name",
            onChange: dojo.hitch(this, function(value) {
                this._seedOptionStore.fetch({
                    onComplete: dojo.hitch(this, function(items, request) {
                        this._controller.setSeed(dojo.clone(items[0].resetState[0].cells));
                    }),
                    query: { "id": value}
                });
            })
        }).placeAt(this.domNode);
        var seedOptionLabel = dojo.create("label", { "for": this._seedOptions.id, innerHTML: "Seed Grid with:" }, this._seedOptions.domNode, "before");
        dojo.addClass(seedOptionLabel, "controlsLabel");
    
        // Grid resizers
        this._xSizer = new dijit.form.NumberSpinner({
            value: this._width,
            smallDelta: 10,
            constraints: {
                min: 0,
                max: 5000,
                places: 0
            },
            onChange: dojo.hitch(this, function(value) {
                this._controller.updateGridSize(value, this._ySizer.attr("value"));
            }),
            style: "width:80px"
        }).placeAt(this.domNode);
        
        var gridSizeLabel = dojo.create("label", { "for": this._xSizer.id, innerHTML: "Grid Size:" }, this._xSizer.domNode, "before");
        dojo.addClass(gridSizeLabel, "controlsLabel");
        dojo.create("span", { innerHTML: " x "}, this.domNode, "last");
        
        this._ySizer = new dijit.form.NumberSpinner({
            value: this._height,
            smallDelta: 10,
            constraints: {
                min: 0,
                max: 5000,
                places: 0
            },
            onChange: dojo.hitch(this, function(value) {
                this._controller.updateGridSize(this._xSizer.attr("value"), value);
            }),
            style: "width:80px"
        }).placeAt(this.domNode);
        this._addWidgets(this._xSizer, this._ySizer);
    
        dojo.create("br", null, this.domNode, "last");
        dojo.create("br", null, this.domNode, "last");
    
        // Speed Adjuster Slider
        var sliderSpan = dojo.create("span", null, this.domNode);
        dojo.addClass(sliderSpan, "sliderWrapper");
        var sliderNode = dojo.create("div", null, sliderSpan);
        var sliderRulesNode = dojo.create("div", null, sliderNode, 'last');
        this._speedSliderRules = new dijit.form.HorizontalRule({
            count: this._controller.speeds.length,
            style: "height:5px"
        }, sliderRulesNode);
        
        this._speedSlider = new dijit.form.HorizontalSlider({
            name: "speedAdjuster",
            value: 5,
            minimum: 0,
            maximum: this._controller.speeds.length - 1,
            discreteValues: this._controller.speeds.length,
            intermediateChanges: true,
            style: "width:300px;",
            onChange: dojo.hitch(this, function(value) {
                this._controller.updateInterval(value);
            })
        }, sliderNode);
        this._addWidgets(this._speedSliderRules, this._speedSlider);
        var speedSliderLabel = dojo.create("label", { "for": this._speedSlider.id, innerHTML: "Speed:" }, sliderSpan, "before");
        dojo.addClass(speedSliderLabel, "controlsLabel");
        
        // Size Slider
        var sizeSliderSpan = dojo.create("span", null, this.domNode);
        dojo.addClass(sizeSliderSpan, "sliderWrapper");
        var sizeSliderNode = dojo.create("div", null, sizeSliderSpan);
        var sizeSliderRulesNode = dojo.create("div", null, sizeSliderNode, 'last');
        this._sizeSliderRules = new dijit.form.HorizontalRule({
            count: 5,
            style: "height:5px;"
        }, sizeSliderRulesNode);
        this._sizeSliderRuleLabels = new dijit.form.HorizontalRuleLabels({
            style: "height:1.2em;font-size:75%;",
            //count: 5,
            //numericMargin: 1,
            labels: ["one", "two", "three", "four", "five"]
        }, sizeSliderRulesNode);
        
        this._sizeSlider = new dijit.form.HorizontalSlider({
            name: "sizeAdjuster",
            value: this._currentSize,
            minimum: 0,
            maximum: this._cellSizes.length - 1,
            discreteValues: this._cellSizes.length,
            intermediateChanges: true,
            style: "width:300px;",
            onChange: dojo.hitch(this, function(value) {
                this._updateCellSize(value);
            })
        }, sizeSliderNode);
        this._addWidgets(this._sizeSliderRules, this._sizeSlider);
        var sizeSliderLabel = dojo.create("label", { "for": this._sizeSlider.id, innerHTML: "Cell Size:" }, sizeSliderSpan, "before");
        dojo.addClass(sizeSliderLabel, "controlsLabel");
        
        // Dialogs:
        this._gameOverDialog = new dijit.Dialog({
            title: "Game Over!",
            content: "The game has reached a steady state. Reset or modify the board, and then hit Start to play again :)"
        });
        var gameOverDialogButtons = dojo.create("div", null, this._gameOverDialog.domNode, "last");
        dojo.addClass(gameOverDialogButtons, "dijitDialogPaneActionBar");
        new dijit.form.Button({
            value: "OK",
            onClick: dojo.hitch(this, function() {
                this._gameOverDialog.hide();
            })
        }).placeAt(gameOverDialogButtons);
    },
	
	_addWidgets: function(/* Widget */ w /* ... */) {
        for (i = 0; i < arguments.length; i++) {
            this._containedWidgets.push(arguments[i]);
        }
    }
});