dojo.provide("telliott.games.conway.Seeds");

dojo.declare("telliott.games.conway.Seeds", null, 
    {
        // TODO: Add min-x and min-y for each seed
        identifier:"id",
        label: "name",
        items: [
            {name:"Blocks", label:"Blocks - Still born",id:"bk", resetState: { _type: 'seed', _value: { cells: [
                {x:1, y:1},
                {x:1, y:2},
                {x:2, y:1},
                {x:2, y:2}
            ]}}},
            {name:"Behives", label:"Behives - Still born",id:"bh", resetState: { _type: 'seed', _value: { cells: [
                {x:1, y:2},
                
                {x:2, y:1},
                {x:3, y:1},
                
                {x:4, y:2},
                
                {x:2, y:3},
                {x:3, y:3}
            ]}}},
            {name:"Loaves", label:"Loaves - Still born",id:"lv", resetState: { _type: 'seed', _value: { cells: [
                {x:2, y:1},
                {x:3, y:1},
                {x:1, y:2},
                {x:4, y:2},
                {x:2, y:3},
                {x:4, y:3},
                {x:3, y:4}
            ]}}},
            {name:"Boats", label:"Boats - Still born",id:"bt", resetState: { _type: 'seed', _value: { cells: [
                {x:1, y:1},
                {x:1, y:2},
                {x:2, y:1},
                {x:3, y:2},
                {x:2, y:3}
            ]}}},
            {name:"Blinkers", label:"Blinker - Period 2",id:"bl", resetState: { _type: 'seed', _value: { cells: [
                {x:2, y:1},
                {x:2, y:2},
                {x:2, y:3}
            ]}}},
            {name:"Toads", label:"Toad - Period 2",id:"td", resetState: { _type: 'seed', _value: { cells: [
                {x:2, y:2},
                {x:3, y:2},
                {x:4, y:2},
                {x:1, y:3},
                {x:2, y:3},
                {x:3, y:3}
            ]}}},
            {name:"Beacons", label:"Beacons - Period 2",id:"bc", resetState: { _type: 'seed', _value: { cells: [
                {x:1, y:1},
                {x:1, y:2},
                {x:2, y:1},
                {x:2, y:2},
                {x:3, y:3},
                {x:3, y:4},
                {x:4, y:3},
                {x:4, y:4}
            ]}}},
            {name:"Pulsars", label:"Pulsars - Period 3",id:"ps", resetState: { _type: 'seed', _value: { cells: [
                {x:4, y:2},
                {x:5, y:2},
                {x:6, y:2},
                {x:2, y:4},
                {x:2, y:5},
                {x:2, y:6},
                {x:7, y:4},
                {x:7, y:5},
                {x:7, y:6},
                {x:4, y:7},
                {x:5, y:7},
                {x:6, y:7},
                
                {x:10, y:2},
                {x:11, y:2},
                {x:12, y:2},
                {x:9, y:4},
                {x:9, y:5},
                {x:9, y:6},
                {x:14, y:4},
                {x:14, y:5},
                {x:14, y:6},
                {x:10, y:7},
                {x:11, y:7},
                {x:12, y:7},
                
                {x:4, y:9},
                {x:5, y:9},
                {x:6, y:9},
                {x:2, y:10},
                {x:2, y:11},
                {x:2, y:12},
                {x:7, y:10},
                {x:7, y:11},
                {x:7, y:12},
                {x:4, y:14},
                {x:5, y:14},
                {x:6, y:14},
                
                {x:10, y:9},
                {x:11, y:9},
                {x:12, y:9},
                {x:9, y:10},
                {x:9, y:11},
                {x:9, y:12},
                {x:14, y:10},
                {x:14, y:11},
                {x:14, y:12},
                {x:10, y:14},
                {x:11, y:14},
                {x:12, y:14}
                
            ]}}},
            {name:"Glider", label:"Glider - Spaceship",id:"gl", resetState: { _type: 'seed', _value: { cells: [
                {x:4, y:4},
                {x:4, y:5},
                {x:4, y:6},
                
                {x:3, y:6},
                {x:2, y:5}
            ]}}},
            {name:"LWSS", label:"Lightweight Spaceship",id:"lwss", resetState: { _type: 'seed', _value: { cells: [
                {x:3, y:1},
                {x:4, y:1},
                {x:2, y:2},
                {x:3, y:2},
                {x:4, y:2},
                {x:5, y:2},
                {x:2, y:3},
                {x:3, y:3},
                {x:5, y:3},
                {x:6, y:3},
                {x:4, y:4},
                {x:5, y:4}
            ]}}},
            {name: "F-pentomino", label:"F-pentomino - Unstable", id:"fp", resetState: { _type: 'seed', _value: { cells: [
                {x:12, y:11},
                {x:13, y:11},
                {x:11, y:12},
                {x:12, y:12},
                {x:12, y:13}
            ]}}}
        ]
    }
);