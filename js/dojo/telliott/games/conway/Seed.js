dojo.provide("telliott.games.conway.Seed");

dojo.declare("telliott.games.conway.Seed", null, {
    
    // int
    id: null,
    
    // String
    name: "",
    
    // String
    label: "",
    
    // Array of {x: x, y: y} objects
    resetState: [],
    
    // Min grid size
    minX: null,
    minY: null,
    
    constructor: function(/* propetyBag */ props) {
        this.id = props.id;
        this.name = props.name;
        this.resetState = props.resetState;
        this.minX = props.minX;
        this.minY = props.minY;
    }
});
