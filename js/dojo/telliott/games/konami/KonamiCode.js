/**
 * @author mrtom
 */
dojo.provide("telliott.games.konami.KonamiCode");

dojo.declare("telliott.games.konami.KonamiCode", null, {
    
    /* Function to call back when sequence complete) */
    _callback: null,
    
    /* Current state in the sequence */
    _state: -1,
    
    /* The sequence needed to unlock the secret */
    _sequence: null,
    
    constructor: function(/* function */ callback, /* scope */ scope) /* throws error if callback is not a function */{
        if (typeof callback != "function") {
            throw "callback must be a function!";
        }
        
        var dk = dojo.keys;
        
        this._callback = callback;
        this._sequence = [dk.UP_ARROW, dk.UP_ARROW, dk.DOWN_ARROW, dk.DOWN_ARROW, dk.LEFT_ARROW, dk.RIGHT_ARROW, dk.LEFT_ARROW, dk.RIGHT_ARROW, 'B', 'A'];
        
        this._connect = dojo.connect(dojo.body(), "onkeypress", dojo.hitch(this, function(e) {
           this.check(e); 
        }), scope);
    },
    
    check: function(/* event */ e) {
        var dk = dojo.keys;
        var toCheck = e.charOrCode;
        
        // Ignore shift
        if (e.keyCode === dk.SHIFT) {
            return;
        }
        
        if(e.keyChar != "" && e.keyChar >= 'a' && e.keyChar <= 'z') {
            // Was a lower case character. Convert to uppercase
            console.debug("Converting to upper case");
            toCheck = toCheck.toUpperCase();
        }
        
        if (toCheck == this._sequence[this._state+1]) {
            console.debug("Next key in sequence!");
            // Don't add one yet as we'll only have to reset it if we're completed the sequence.
            // This does mean that our current state is actually this._state+1, which makes the calculations less intuitive.
            if (this._state+1 === this._sequence.length - 1) {
                console.debug("Unlocking secret!");
                this._state = -1;
                this._callback();
            }
            else {
                this._state++;                
            }
        }
        else {
            console.debug("Incorrect sequence, resetting...");
            this._state = -1; // Reset
        }
    }
});
