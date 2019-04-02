/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 34);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var tiledata_1 = __webpack_require__(1);
var BaseTile = (function () {
    // A tile consists of a basic sprite and a highlight tile
    function BaseTile(_game, x, y) {
        // Items that every type has
        this.connectible = false;
        this.current_units = 0;
        this.input_quality = 0;
        this.input_units = 0;
        this.max_population = 0;
        this.name = "empty";
        this.output_quality = 0;
        this.output_units = 0;
        this.degrade_per_tick = 0;
        this.repair_cost = 0;
        this.current_tint = 0xffffff;
        this.display_name = "";
        this.in_flow = false;
        this.is_source = false;
        this.game_logic = _game;
        this._touch_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), 'watergame', "base_square");
        this._touch_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._touch_sprite);
        this._touch_sprite.inputEnabled = true;
        this._touch_sprite.input.pixelPerfectOver = true;
        this._touch_sprite.input.pixelPerfectClick = true;
        this._touch_sprite.alpha = 0.1;
        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), 'watergame', "base_square");
        this._base_sprite.alpha = 0;
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);
        this._highlight_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), 'watergame', "highlightsquare");
        this._highlight_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._highlight_sprite);
        this._highlight_sprite.visible = false;
        this._x = x;
        this._y = y;
        // Now tiles can get input, so we know if we are over them or not
        //this._base_sprite.inputEnabled = true;
        //this._base_sprite.input.pixelPerfectOver = true;
        //this._base_sprite.input.pixelPerfectClick = true;
        _game.game.input.onDown.add(this.Clicked, this);
        this.SetStats();
    }
    BaseTile.prototype.Destroy = function () {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
    };
    // Asks if the tile is being hovered over
    BaseTile.prototype.CheckHover = function () {
        if (this._touch_sprite.input != undefined) {
            //return this._touch_sprite.input.checkPointerOver(this.game_logic.game.input.activePointer);
            return this._touch_sprite.input.pointerOver();
        }
        else {
            return false;
        }
    };
    // Show the highlight if its sprite exists
    BaseTile.prototype.ShowHighlight = function () {
        if (this._highlight_sprite == undefined) {
            return;
        }
        this._highlight_sprite.visible = true;
        if (this.game_logic._delete_mode) {
            if (this.name != "empty") {
                this.game_logic.UI.notification.showMessage("Delete " + this.name);
            }
            else {
                this.game_logic.UI.notification.hideMessage();
            }
        }
        else if (this.game_logic._repair_mode) {
            if (this.name != "empty") {
                var amt = this.repair_cost;
                var message = "Integrity currently: " + +this.GetPercentIntegrity() + "%";
                message += "\n";
                message += "Repair for $" + amt.toString();
                this.game_logic.UI.notification.showMessage(message);
            }
            else {
                this.game_logic.UI.notification.hideMessage();
            }
        }
        else {
            // Grab a lake tile from our current spot
            var tempLake = this.game_logic._world.lakes[this._x][this._y];
            var message = "";
            if (this.name != "empty") {
                message += this.display_name;
                message += "\n";
                if (this.name == "treatment") {
                    message += "Modules: " + this.GetTypesString() + "\n";
                }
                message += "Integrity: " + this.GetPercentIntegrity() + "%";
            }
            if (tempLake.name == "lake") {
                if (message != "") {
                    message += "\n";
                }
                message += "Lake Water: " + tempLake.current_water_storage.toFixed(0) + " / " + tempLake.max_water_storage;
                message += "\nWater Quality: " + parseFloat((Math.round(tempLake.current_quality * 100) / 100).toString()).toFixed(2);
                ;
            }
            if (message != "") {
                this.game_logic.UI.notification.showMessage(message);
            }
            else {
                this.game_logic.UI.notification.hideMessage();
            }
        }
    };
    BaseTile.prototype.GetTypesString = function () {
        return "";
    };
    // Hides the highlight sprite if it exists
    BaseTile.prototype.HideHightlight = function () {
        if (this._highlight_sprite == undefined) {
            return;
        }
        this._highlight_sprite.visible = false;
    };
    // Visible tile positions, based on tiles that are 80x40
    BaseTile.prototype.DeriveGridX = function (x, y) {
        return this.game_logic._world.world_x + (40 * x) + (40 * y);
    };
    BaseTile.prototype.DeriveGridY = function (x, y) {
        return this.game_logic._world.world_y - (20 * y) + (20 * x);
    };
    // Turn off this tile - currently used for lakes so they don't show as visible
    BaseTile.prototype.Disable = function () {
        this._touch_sprite.inputEnabled = false;
        this._base_sprite.visible = false;
        this._highlight_sprite.visible = false;
    };
    BaseTile.prototype.Clicked = function () {
        // if( !this.game_logic.UI.IsInfoPanelVisible() ) {
        if (!this.game_logic.UI.IsAModalOpen()) {
            if (this.CheckHover()) {
                if ((!this.game_logic._delete_mode && !this.game_logic._repair_mode) && (this.name == "empty")) {
                    this.game_logic._construction_menu.Show(this._base_sprite.x, this._base_sprite.y, this._x, this._y);
                }
                else if (this.game_logic._delete_mode && this.name != "empty") {
                    this.game_logic._world.Disappear(this);
                }
                else if (this.game_logic._repair_mode && this.name != "empty") {
                    var amt = this.repair_cost;
                    if (this.game_logic._world.game_money - amt >= 0) {
                        this.game_logic._world.game_money -= amt;
                        this.integrity = this.max_integrity;
                    }
                }
            }
        }
    };
    // code for updating appearance on tiles
    BaseTile.prototype.Update = function () {
        if (this.name != "empty") {
            this.SetTint();
        }
    };
    BaseTile.prototype.SetTint = function () {
        if (this.GetPercentIntegrity() <= 25) {
            if (this.current_tint != 0xff0000) {
                this._base_sprite.tint = 0xff0000;
                this.current_tint = 0xff0000;
            }
        }
        else if (this.GetPercentIntegrity() <= 50) {
            if (this.current_tint = 0xFF4500) {
                this._base_sprite.tint = 0xFF4500;
                this.current_tint = 0xFF4500;
            }
        }
        else if (this.GetPercentIntegrity() <= 75) {
            if (this.current_tint != 0xEEB422) {
                this._base_sprite.tint = 0xEEB422;
                this.current_tint = 0xEEB422;
            }
        }
        else if (this.current_tint != 0xffffff) {
            this.current_tint = 0xffffff;
            this._base_sprite.tint = 0xffffff;
        }
    };
    BaseTile.prototype.Degrade = function (amt) {
        amt = this.degrade_per_tick;
        // TODO - make item show when it's about to delete, maybe items have a different degradation rate?
        var final_amt = amt;
        if (Math.random() > .5) {
            final_amt -= Math.floor(Math.random());
        }
        else {
            final_amt += Math.floor(Math.random());
        }
        if (final_amt < 0) {
            final_amt = 0;
        }
        this.integrity -= final_amt;
        // When an item has broken, delete it from the world
        if (this.integrity <= 0) {
            this.game_logic._world.Disappear(this);
        }
    };
    // A function for setting up an item's stats, which might be loaded from a file in the future
    BaseTile.prototype.SetStats = function () {
        var tile_data = tiledata_1.TileData.getTile(this.constructor["name"]);
        for (var stat in tile_data) {
            if (tile_data.hasOwnProperty(stat)) {
                this[stat] = tile_data[stat];
            }
        }
        // Since we have access to game logic - can we store that data? I am thinking...
        // Store scenerio objects somewhere - maybe in world. Make a dictionary of modifiers
        // Then retrieve them here based on tile names
        for (var key in this.game_logic._world.scenario_data) {
            var new_key = key.split("|");
            if (this.constructor["name"] == new_key[0]) {
                this[new_key[1]] = this.game_logic._world.scenario_data[key];
            }
        }
        if (!tile_data.hasOwnProperty("display_name")) {
            this.display_name = this.name;
        }
        this.max_integrity = this.integrity;
    };
    BaseTile.prototype.GetPercentIntegrity = function () {
        return Math.floor((this.integrity / this.max_integrity) * 100);
    };
    BaseTile.prototype.SetInFlow = function (set) {
        this.in_flow = set;
    };
    BaseTile.prototype.IsInFlow = function () {
        return this.in_flow;
    };
    return BaseTile;
}());
exports.BaseTile = BaseTile;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var TileData = (function () {
    function TileData() {
    }
    Object.defineProperty(TileData, "Instance", {
        get: function () {
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    TileData.init = function (game) {
        this._instance._game = game;
        this._instance._tile_data = game.cache.getJSON("tile_data");
    };
    TileData.getTile = function (key) {
        if (key === "BaseTile") {
            return this._instance._tile_data["default"];
        }
        else if (this._instance._tile_data.hasOwnProperty(key)) {
            //console.log("Found " + key);
            return __assign({}, this._instance._tile_data["default"], this._instance._tile_data[key]);
        }
        else {
            //console.log("Not found..." + key);
            throw new Error("Tile type " + key + " not found in TileData.");
        }
    };
    TileData.getTileByType = function (type) {
        for (var key in this._instance._tile_data) {
            //console.log(key);
            //console.log(this._instance._tile_data[key].name);
            if (this._instance._tile_data.hasOwnProperty(key) &&
                (this._instance._tile_data[key].name === type ||
                    (this._instance._tile_data[key].hasOwnProperty("upgrades") && this._instance._tile_data[key].upgrades.hasOwnProperty(type)))) {
                return this._instance._tile_data[key];
            }
        }
    };
    return TileData;
}());
TileData._instance = new TileData();
exports.TileData = TileData;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var AudioManager = (function () {
    function AudioManager() {
        this._sounds = {};
    }
    Object.defineProperty(AudioManager, "volume", {
        get: function () {
            if (this._instance._game) {
                return AudioManager.Instance._game.sound.volume;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AudioManager, "muted", {
        get: function () {
            return this._instance._game.sound.mute;
        },
        enumerable: true,
        configurable: true
    });
    AudioManager.init = function (game) {
        this._instance._game = game;
    };
    Object.defineProperty(AudioManager, "Instance", {
        get: function () {
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    AudioManager.RegisterSound = function (key, loop) {
        if (loop === void 0) { loop = false; }
        if (this._instance._sounds.hasOwnProperty(key)) {
            // TODO: Handle duplicate sound IDs more gracefully
            console.error("Sound with id \"" + key + "\" already exists.");
        }
        else if (this._instance !== null) {
            this._instance._sounds[key] = this._instance._game.add.sound(key, 1, loop, true);
        }
        else {
            console.error("Sounds cannot be registered before AudioManger.init has been called.");
        }
    };
    AudioManager.play = function (key) {
        this._instance._sounds[key].play();
    };
    // Stop the currently playing music, and start a new track
    AudioManager.playMusic = function (key) {
        console.log(this._instance._sounds);
        if (this._instance._current_music) {
            this._instance._current_music.stop();
        }
        this._instance._current_music = this._instance._sounds[key];
        this._instance._current_music.play();
    };
    AudioManager.toggleMute = function () {
        if (AudioManager.Instance._game.sound.mute) {
            AudioManager.Instance._game.sound.mute = false;
            localStorage.setItem("mute", "false");
        }
        else {
            AudioManager.Instance._game.sound.mute = true;
            localStorage.setItem("mute", "true");
        }
    };
    return AudioManager;
}());
AudioManager._instance = new AudioManager();
exports.AudioManager = AudioManager;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var GameData = (function () {
    function GameData() {
    }
    Object.defineProperty(GameData, "Instance", {
        get: function () {
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    GameData.init = function (game) {
        this._instance._game = game;
        this._instance._game_data = game.cache.getJSON("vars");
    };
    GameData.getVar = function (key) {
        if (this._instance._game_data.hasOwnProperty(key)) {
            return this._instance._game_data[key];
        }
        else {
            console.log("Not found..." + key);
            throw new Error("Tile type " + key + " not found in TileData.");
        }
    };
    return GameData;
}());
GameData._instance = new GameData();
exports.GameData = GameData;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by nathanmishler on 2/13/17.
 */

var base_tile_1 = __webpack_require__(0);
var gamedata_1 = __webpack_require__(3);
var residential_tile_1 = __webpack_require__(20);
var source_tile_1 = __webpack_require__(21);
var aquifer_tile_1 = __webpack_require__(15);
var lake_tile_1 = __webpack_require__(18);
var lake_source_tile_1 = __webpack_require__(17);
var pipe_tile_1 = __webpack_require__(19);
var watertower_tile_1 = __webpack_require__(24);
var industrial_tile_1 = __webpack_require__(16);
var agricultural_tile_1 = __webpack_require__(14);
var treatment_tile_1 = __webpack_require__(22);
var waste_water_treatment_tile_1 = __webpack_require__(23);
var tiledata_1 = __webpack_require__(1);
// This class holds the current displayed world
var World = (function () {
    function World(game) {
        // a tracked list of objects for flow
        this.sources = [];
        this.visited = [];
        this.pending = [];
        this.lakeInputs = [];
        this.visitedLakes = [];
        this.scenario_aquifer = null;
        // The usable water in the system
        this.total_usable_water = 0;
        this.last_turn_usable_water = 0;
        // Survey string for the world. Can be empty
        this.survey_url = "";
        // Money Tracking
        this._game_money = 0;
        this.money_generated = 0;
        this.this_turn_income = 0;
        // Population Tracking
        this.new_population = 0;
        this.population = 0;
        this.grid_width = 10;
        this.grid_height = 10;
        // Win Conditions
        this.has_complete_circuit = false;
        this.win_condition = "";
        this.goal_text = "";
        this.instruction_text = "";
        this.victory_text = "";
        // Various checkers for scenerios
        this.win_complete_circuit = false;
        this.link_all_items = false;
        this.win_population = -1;
        this.win_money = -1;
        this.num_ind = -1;
        this.num_res = -1;
        this.num_agr = -1;
        this.is_sandbox = false;
        this.scenario_data = new Object();
        this._game = game;
        this.world_x = 50;
        this.world_y = 400;
    }
    Object.defineProperty(World.prototype, "game_money", {
        get: function () {
            return Number(this._game_money);
        },
        set: function (num) {
            //console.log(num);
            this._game_money = Number(num);
            this._game._construction_menu.updateButtons(this._game_money);
        },
        enumerable: true,
        configurable: true
    });
    World.prototype.init = function (level_name) {
        if (level_name === void 0) { level_name = "scenario_1"; }
        this.sources = [];
        var map_json = this._game.game.cache.getJSON(level_name);
        this.scenario_data = map_json.properties;
        // TODO make this a real init that loads maps
        this.background = this._game.game.add.sprite(0, 0, map_json.properties.background_image);
        this._game._world_group.add(this.background);
        this.background.width = 800;
        this.background.height = 600;
        this.background_pol = this._game.game.add.sprite(0, 0, map_json.properties.background_image + "_pol");
        this._game._world_group.add(this.background_pol);
        this.background_pol.width = 800;
        this.background_pol.height = 600;
        this.background_pol.alpha = 0;
        // Create a 10x10 grid of basic land tiles
        this.tiles = [];
        for (var i = 0; i < this.grid_width; i++) {
            this.tiles[i] = [];
            for (var j = 0; j < this.grid_height; j++) {
                this.tiles[i][j] = new base_tile_1.BaseTile(this._game, i, j);
            }
        }
        // Create a 10x10 grid of base tiles for water
        this.lakes = [];
        for (var i = 0; i < this.grid_width; i++) {
            this.lakes[i] = [];
            for (var j = 0; j < this.grid_height; j++) {
                this.lakes[i][j] = new base_tile_1.BaseTile(this._game, i, j);
                this.lakes[i][j].Disable();
            }
        }
        // Set up all win conditions
        //
        if (map_json.properties.disable_policy) {
            this._game.UI.policy_button.visible = false;
        }
        if (map_json.properties.survey != "" && map_json.properties.survey != undefined) {
            this.survey_url = map_json.properties.survey;
        }
        this.win_complete_circuit = map_json.properties.win_complete_circuit;
        if (map_json.properties.build_list != "") {
            this.build_list = map_json.properties.build_list.split("|");
        }
        else {
            this.build_list = [];
        }
        this.link_all_items = map_json.properties.link_all_items;
        this.win_population = map_json.properties.win_population;
        this.win_money = map_json.properties.win_money;
        this.num_ind = map_json.properties.num_ind;
        this.num_res = map_json.properties.num_res;
        this.num_agr = map_json.properties.num_agr;
        this.instruction_text = map_json.properties.instructions_feedback;
        this.goal_text = map_json.properties.goals;
        this.victory_text = map_json.properties.ending_feedback;
        if (map_json.properties.money) {
            this._game_money = map_json.properties.money;
        }
        if (map_json.properties.sandbox) {
            this.is_sandbox = true;
        }
        if (map_json.properties.aquifer && map_json.properties.aquifer > 0) {
            this.scenario_aquifer = new aquifer_tile_1.AquiferTile(this._game, 0, 0);
            this.scenario_aquifer.max_water_storage = map_json.properties.aquifer;
            this.scenario_aquifer.current_water_storage = map_json.properties.aquifer;
        }
        // Construct the world. Starting with layers
        for (var i = 0; i < map_json.layers.length; i++) {
            // Parse out the data. We have a 10x10 grid
            if (map_json.layers[i].name == "Objects") {
                for (var x = 0; x < map_json.layers[i].data.length; x++) {
                    var x_pos = x % 10;
                    // Accounting for tiled's coordinate system
                    var y_pos = 9 - Math.floor(x / 10);
                    // Zero means it's an empty tile, so don't do anything
                    if (map_json.layers[i].data[x] != 0) {
                        var temp_num = map_json.layers[i].data[x] - 1;
                        var type = this.GetTypeForTileNumber(temp_num.toString());
                        this.CreateAt(type, x_pos, y_pos, "", false);
                    }
                }
            }
            // TODO - make this work for different lake tiles
            if (map_json.layers[i].name == "Lake") {
                for (var x = 0; x < map_json.layers[i].data.length; x++) {
                    var x_pos = x % 10;
                    // Accounting for tiled's coordinate system
                    var y_pos = 9 - Math.floor(x / 10);
                    // Zero means it's an empty tile, so don't do anything
                    if (map_json.layers[i].data[x] != 0) {
                        this.CreateAt("lake", x_pos, y_pos, "", false);
                    }
                    if (map_json.layers[i].data[x] == 10) {
                        this.lakes[x_pos][y_pos].is_source = true;
                    }
                }
            }
        }
        this.ShowInstructionText();
    };
    World.prototype.ShowInstructionText = function () {
        this._game.UI.notification.HidePortrait();
        this._game.UI.info_panel.showMessageInfo(this.instruction_text);
    };
    World.prototype.ShowHelpText = function () {
        this._game.UI.notification.HidePortrait();
        this._game.UI.info_panel.showMessageInfo(gamedata_1.GameData.getVar("tutorial_text"));
    };
    World.prototype.ShowGoalText = function () {
        this._game.UI.notification.HidePortrait();
        this._game.UI.info_panel.showMessageInfo(this.goal_text);
    };
    World.prototype.GetTypeForTileNumber = function (num) {
        var tiles_json = this._game.game.cache.getJSON('tiles_json');
        var image_path = "";
        for (var k in tiles_json.tiles) {
            if (k == num) {
                image_path = tiles_json.tiles[k].image;
            }
        }
        if (image_path != "") {
            if (image_path.indexOf("res_") != -1) {
                return "residential";
            }
            if (image_path.indexOf("source") != -1) {
                return "source";
            }
            if (image_path.indexOf("aquifer") != -1) {
                return "aquifer";
            }
            if (image_path.indexOf("lake") != -1) {
                return "lake";
            }
            if (image_path.indexOf("lakesource") != -1) {
                return "lakesource";
            }
            if (image_path.indexOf("piping") != -1) {
                return "pipe";
            }
            if (image_path.indexOf("watertower") != -1) {
                return "watertower";
            }
            if (image_path.indexOf("ind_") != -1) {
                return "industrial";
            }
            if (image_path.indexOf("agr_") != -1) {
                return "agricultural";
            }
            if (image_path.indexOf("DW") != -1) {
                return "treatment";
            }
            if (image_path.indexOf("WW") != -1) {
                return "wastewatertreatment";
            }
        }
        return "";
    };
    // Creation function for tiles
    // Always destroys a tile before making a new one
    World.prototype.CreateAt = function (type, x, y, subtype, cost) {
        if (subtype === void 0) { subtype = ""; }
        if (cost === void 0) { cost = true; }
        // Subtract money from player account
        var tile_cost = this._game.GetCostForUpgradeAtTile(type, x, y);
        if (cost && this.game_money !== null && tile_cost) {
            this.game_money -= tile_cost;
        }
        // Create tile and add it to the game world
        switch (type) {
            case "empty":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new base_tile_1.BaseTile(this._game, x, y);
                break;
            case "residential":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new residential_tile_1.ResidentialTile(this._game, x, y);
                break;
            case "source":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new source_tile_1.SourceTile(this._game, x, y);
                break;
            case "aquifer":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new aquifer_tile_1.AquiferTile(this._game, x, y);
                break;
            case "lake":
                this.lakes[x][y].Destroy();
                this.lakes[x][y] = new lake_tile_1.LakeTile(this._game, x, y);
                break;
            case "lakesource":
                this.lakes[x][y].Destroy();
                this.lakes[x][y] = new lake_source_tile_1.LakeSourceTile(this._game, x, y);
                break;
            case "pipe":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new pipe_tile_1.PipeTile(this._game, x, y);
                break;
            case "watertower":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new watertower_tile_1.WatertowerTile(this._game, x, y);
                break;
            case "industrial":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new industrial_tile_1.IndustrialTile(this._game, x, y);
                break;
            case "agricultural":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new agricultural_tile_1.AgriculturalTile(this._game, x, y);
                break;
            case "treatment":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new treatment_tile_1.TreatmentTile(this._game, x, y);
                break;
            case "coagulation":
                if (this.tiles[x][y].name != "treatment") {
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new treatment_tile_1.TreatmentTile(this._game, x, y);
                }
                this.tiles[x][y].SetTreatment("coagulation");
                break;
            case "filtration":
                if (this.tiles[x][y].name != "treatment") {
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new treatment_tile_1.TreatmentTile(this._game, x, y);
                }
                this.tiles[x][y].SetTreatment("filtration");
                break;
            case "disinfection":
                if (this.tiles[x][y].name != "treatment") {
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new treatment_tile_1.TreatmentTile(this._game, x, y);
                }
                this.tiles[x][y].SetTreatment("disinfection");
                break;
            case "primary":
                if (this.tiles[x][y].name != "wastewatertreatment") {
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new waste_water_treatment_tile_1.WasteWaterTreatmentTile(this._game, x, y);
                }
                this.tiles[x][y].SetTreatment("primary");
                break;
            case "secondary":
                if (this.tiles[x][y].name != "wastewatertreatment") {
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new waste_water_treatment_tile_1.WasteWaterTreatmentTile(this._game, x, y);
                }
                this.tiles[x][y].SetTreatment("secondary");
                break;
            case "tertiary":
                if (this.tiles[x][y].name != "wastewatertreatment") {
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new waste_water_treatment_tile_1.WasteWaterTreatmentTile(this._game, x, y);
                }
                this.tiles[x][y].SetTreatment("tertiary");
                break;
            case "wastewatertreatment":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new waste_water_treatment_tile_1.WasteWaterTreatmentTile(this._game, x, y);
                break;
            default:
                break;
        }
    };
    // Heartbeat function
    World.prototype.update = function () {
        if (!this._game.IsMenuUp()) {
            this.CheckForHighlights();
        }
        this.UpdateAppearances();
    };
    World.prototype.CheckWinCondition = function () {
        if (this.is_sandbox) {
            return;
        }
        var has_build_item = false;
        if (this.win_complete_circuit) {
            if (!this.has_complete_circuit) {
                return;
            }
        }
        if (this.build_list != []) {
            for (var x = 0; x < this.build_list.length; x++) {
                has_build_item = false;
                for (var i = 0; i < this.grid_width; i++) {
                    for (var j = 0; j < this.grid_height; j++) {
                        if (this.tiles[i][j].name == this.build_list[x]) {
                            has_build_item = true;
                        }
                    }
                }
                if (!has_build_item) {
                    return;
                }
                else {
                    console.log("Has build item");
                }
            }
        }
        if (this.link_all_items) {
            for (var i = 0; i < this.grid_width; i++) {
                for (var j = 0; j < this.grid_height; j++) {
                    if (this.tiles[i][j].name != "empty" && this.tiles[i][j].name != "pipe" && this.tiles[i][j].name != "source" && !this.tiles[i][j].IsInFlow()) {
                        return;
                    }
                }
            }
        }
        if (this.win_population != -1 && this.population < this.win_population) {
            return;
        }
        if (this.win_money != -1 && this._game_money < this.win_money) {
            return;
        }
        if (this.num_ind != -1 && this.NumItemsInWorld("industrial") < this.num_ind) {
            return;
        }
        if (this.num_res != -1 && this.NumItemsInWorld("residential") < this.num_ind) {
            return;
        }
        if (this.num_res != -1 && this.NumItemsInWorld("agricultural") < this.num_ind) {
            return;
        }
        this._game.Win(this.victory_text);
    };
    World.prototype.NumItemsInWorld = function (item_name) {
        var cur_num = 0;
        for (var i = 0; i < this.grid_width; i++) {
            for (var j = 0; j < this.grid_height; j++) {
                if (this.tiles[i][j].name == item_name) {
                    cur_num++;
                }
            }
        }
        console.log(item_name + " - " + cur_num.toString());
        return cur_num;
    };
    World.prototype.ResetInFlow = function () {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                if (this.tiles[i][j] != undefined) {
                    this.tiles[i][j].SetInFlow(false);
                }
            }
        }
    };
    World.prototype.UpdateAppearances = function () {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                if (this.tiles[i][j] != undefined) {
                    this.tiles[i][j].Update();
                }
            }
        }
        var numlakes = 0;
        var quality_total = 0;
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                if (this.lakes[i][j] != undefined && this.lakes[i][j].name != "empty") {
                    numlakes++;
                    quality_total += this.lakes[i][j].current_quality;
                }
            }
        }
        var alpha = 1 - (quality_total / numlakes);
        if (alpha < 0) {
            alpha = 0;
        }
        if (numlakes == 0) {
            alpha = 0;
        }
        this.background_pol.alpha = alpha;
        this.background.alpha = 1.0 - alpha;
    };
    // Grab a tile, null if it's off the grid
    World.prototype.GetTile = function (x, y, direction) {
        switch (direction) {
            case World.NORTH: return y >= this.grid_height - 1 ? null : this.tiles[x][y + 1];
            case World.EAST: return x <= 0 ? null : this.tiles[x - 1][y];
            case World.SOUTH: return y <= 0 ? null : this.tiles[x][y - 1];
            case World.WEST: return x >= this.grid_width - 1 ? null : this.tiles[x + 1][y];
            default: return null;
        }
    };
    World.prototype.GetLakeTile = function (x, y, direction) {
        switch (direction) {
            case World.NORTH: return y >= this.grid_height - 1 ? null : this.lakes[x][y + 1];
            case World.EAST: return x <= 0 ? null : this.lakes[x - 1][y];
            case World.SOUTH: return y <= 0 ? null : this.lakes[x][y - 1];
            case World.WEST: return x >= this.grid_width - 1 ? null : this.lakes[x + 1][y];
            default: return null;
        }
    };
    // TODO make sure it only highlights when we don't have a menu up
    World.prototype.CheckForHighlights = function () {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                if (this.tiles[i][j] != undefined) {
                    this.tiles[i][j].HideHightlight();
                }
            }
        }
        // if( !this._game.UI.IsInfoPanelVisible() ) {
        if (!this._game.UI.IsAModalOpen()) {
            for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 10; j++) {
                    if (this.tiles[i][j] != undefined) {
                        if (this.tiles[i][j].CheckHover()) {
                            this.tiles[i][j].ShowHighlight();
                        }
                        else {
                            this.tiles[i][j].HideHightlight();
                        }
                    }
                }
            }
        }
    };
    //The start of the water flow function
    World.prototype.Probe = function () {
        this.lakeInputs = [];
        // Assume no circuit, then if we ever discharge back into water, we have a circuit
        this.has_complete_circuit = false;
        // Step through each source and discharge your water into the system
        for (var sources_index = 0; sources_index < this.sources.length; sources_index++) {
            // Grab our current source
            var temp_source = this.sources[sources_index];
            // Get the source's name and current neighbors
            var source_name = temp_source.name;
            var source_neighbors = this._game.GetNeighborTilesFrom(temp_source._x, temp_source._y);
            // Have we pulled water?
            var is_water_pulled = false;
            // Currently this code pulls the maximum amount of water from the lake, every time.
            // For some reason it does this in two steps.
            // At this point it isn't checking with the lake...
            var water_pulled_from_lake = temp_source.max_water_usage;
            // Take water from lake or aquifer.
            var temp_lake = this.lakes[temp_source._x][temp_source._y];
            if (temp_lake.name == "lake") {
                if (temp_lake.current_water_storage > 0) {
                    if (temp_lake.current_water_storage - water_pulled_from_lake >= 0) {
                        temp_lake.current_water_storage -= water_pulled_from_lake;
                    }
                    else {
                        water_pulled_from_lake = temp_lake.current_water_storage;
                        temp_lake.current_water_storage = 0;
                    }
                    is_water_pulled = true;
                }
                else {
                    water_pulled_from_lake = 0;
                }
                temp_source.current_units = water_pulled_from_lake;
            }
            else {
            }
            // We did not pull any water, so reset this for the next step, which is the same as above
            if (!is_water_pulled) {
                water_pulled_from_lake = temp_source.max_water_usage;
            }
            var neighbors_to_visit = [];
            // Only grab neighbors that haven't been visited, and aren't lakes or empty.
            for (var n = 0; n < 4; n++) {
                if (source_neighbors[n]) {
                    temp_lake = this.lakes[source_neighbors[n]._x][source_neighbors[n]._y];
                    // if on lake tile pull from there, else pull from aquifer.
                    // If we haven't already drawn water, and it's a lake, draw from it.
                    if (!is_water_pulled && temp_lake.name == 'lake') {
                        if (temp_lake.current_water_storage > 0) {
                            if (temp_lake.current_water_storage - water_pulled_from_lake >= 0) {
                                temp_lake.current_water_storage -= water_pulled_from_lake;
                            }
                            else {
                                water_pulled_from_lake = temp_lake.current_water_storage;
                                temp_lake.current_water_storage = 0;
                            }
                            temp_source.current_units = water_pulled_from_lake;
                            is_water_pulled = true;
                        }
                    }
                    // Create list of Neighbors to visit with water. Don't include empty or source type tiles.
                    if (this.visited.indexOf(source_neighbors[n]) == -1 && source_neighbors[n].name != "empty" && source_neighbors[n].name != "source") {
                        neighbors_to_visit.push(source_neighbors[n]);
                    }
                }
            }
            // if we didn't pull water, try to pull it from an aquifer
            // TODO - confirm with Mike about Aquifers, as this code seems to only want to do ONE aquifer per scenerio
            if (!is_water_pulled && this.scenario_aquifer) {
                var water_pulled = void 0;
                if (this.scenario_aquifer.current_water_storage > 0) {
                    if (temp_source.max_water_usage >= this.scenario_aquifer.current_water_storage) {
                        water_pulled = this.scenario_aquifer.current_water_storage;
                        this.scenario_aquifer.current_water_storage = 0;
                    }
                    else {
                        water_pulled = temp_source.max_water_usage;
                        this.scenario_aquifer.current_water_storage -= temp_source.max_water_usage;
                    }
                }
                else {
                    water_pulled = 0;
                }
                temp_source.current_units = water_pulled;
            }
            var current_water_available = temp_source.current_units * temp_source.current_quality;
            this.total_usable_water += current_water_available;
            this.visited.push(temp_source);
            // TODO NM - Um. Sources always have a population of zero?
            var temp_current_water_usage = temp_source.current_water_usage * temp_source.current_population;
            // Temporary variables to pass flow information to next neighbor
            temp_source.output_units = current_water_available - (current_water_available * temp_source.evaporation_per_usage);
            temp_source.output_quality = temp_source.current_quality - (temp_current_water_usage * temp_source.quality_drop_per_usage);
            // Sources can have multiple children. Each gets equal output.
            var output_per_child = temp_source.output_units / neighbors_to_visit.length;
            for (var n = 0; n < neighbors_to_visit.length; n++) {
                var temp_neighbor = neighbors_to_visit[n];
                // Must be a pipe or other non-empty/non-input/non-output. Screened above
                // TODO check this out, should this be an addition? Maybe we need to zero it out at some point.
                temp_neighbor.input_units = output_per_child;
                temp_neighbor.input_quality = temp_source.output_quality;
                // TODO Decrease cell integrity for repair mechanic
                //temp_neighbor.Degrade(1);
                // Go to next neighbor
                this.Flow(temp_source, temp_neighbor);
            }
        }
        if (this.pending.length == 0) {
            //console.log("Probe resolving");
            this.ResolveFlow();
        }
        else {
            while (this.pending.length > 0) {
                //console.log("Probe finishing pending");
                // Pending is a list of all pipe branches left to explore.
                // FinishFlow goes through each just like normal flow()
                this.FinishFlow();
            }
        }
    };
    // Flow resolves tiles until multiple neighbors are found, then puts itself in the pending list
    // TODO - investigate - does this mean that a tile mighht be flowed into twice, thus doubling its water every turn?
    World.prototype.Flow = function (previous_cell, cell) {
        cell.SetInFlow(true);
        var cell_name = cell.name;
        // Grab incoming flow
        // Override the inputs
        // TODO Should this be additive? Make sure.
        cell.current_units = cell.input_units;
        cell.current_quality = cell.input_quality;
        // Tracking the total usable water in the system
        var current_water_available = cell.current_units * cell.current_quality;
        this.total_usable_water += current_water_available;
        var treatment_modifier = 0;
        var temp_current_water_usage = 0;
        // Usage tile water usage is population times
        if (cell_name == 'residential' && this._game.policy1Active) {
            temp_current_water_usage = cell.current_water_usage * cell.current_population * (1 - gamedata_1.GameData.getVar("policy1").percent);
        }
        if (this._game.policy3Active && (cell_name == 'residential' || cell_name == 'industrial' || cell_name == "agricultural")) {
            temp_current_water_usage = cell.current_water_usage * cell.current_population + (cell.current_water_usage * cell.current_population * gamedata_1.GameData.getVar("policy3").percent);
        }
        else {
            temp_current_water_usage = cell.current_water_usage * cell.current_population;
        }
        // Due to policy, we can use more or less water
        //console.log(this._game._policy_menu.GetPolicy());
        // Do what we should with the water
        // console.log(cell_name);
        switch (cell_name) {
            // Pipes just let water flow through
            case 'pipe':
                break;
            case 'watertower':
                // Check if water should be pulled from storage
                var predicted_water_available = this.last_turn_usable_water - this.total_usable_water;
                // If we think we need more water, dump the ENTIRE water tower into the system
                // TODO maybe not - all of it?
                if (current_water_available < predicted_water_available) {
                    current_water_available += cell.current_water_storage;
                    cell.current_water_storage = 0;
                }
                else {
                    // Refill storage
                    if (cell.current_water_storage < cell.max_water_storage) {
                        var space_left = (cell.max_water_usage - cell.current_water_storage);
                        if ((current_water_available - space_left) < 0) {
                            cell.current_water_storage += current_water_available;
                            this.LandTermination(cell);
                        }
                        else {
                            cell.current_water_storage += space_left;
                            current_water_available -= space_left;
                        }
                    }
                }
                break;
            case 'wastewater':
                treatment_modifier = cell.treatment_modifier;
                break;
            case 'treatment':
                treatment_modifier = cell.treatment_modifier;
                break;
            case 'agricultural':
                if (current_water_available >= temp_current_water_usage) {
                    if (this._game.policy2Active) {
                        cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;
                        if (this._game.policy3Active) {
                            cell.current_population += (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                        }
                    }
                    else if (this._game.policy3Active) {
                        cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                    }
                    else {
                        cell.current_population += cell.usage_increase_with_surplus;
                    }
                    if (cell.current_population >= cell.max_population) {
                        cell.current_population = cell.max_population;
                        this.Expand(cell);
                    }
                    this.money_generated = cell.current_population * cell.money_generated_per_usage;
                }
                else {
                    // We don't have enough water, so drop the population and terminate early
                    cell.current_population -= cell.usage_decrease_with_deficit;
                    if (cell.current_population <= 0) {
                        cell.current_population = 0;
                        this.DisappearFromFlow(cell);
                    }
                    // Insufficient water, terminate early.
                    this.LandTermination(cell);
                }
                cell.UpdateAppearance();
                break;
            case 'residential':
                if (current_water_available >= temp_current_water_usage) {
                    if (this._game.policy2Active) {
                        cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;
                        if (this._game.policy3Active) {
                            cell.current_population += (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                        }
                    }
                    else if (this._game.policy3Active) {
                        cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                    }
                    else {
                        cell.current_population += cell.usage_increase_with_surplus;
                    }
                    if (cell.current_population > cell.max_population) {
                        cell.current_population = cell.max_population;
                        this.Expand(cell);
                    }
                    this.money_generated = cell.current_population * cell.money_generated_per_usage;
                    cell.UpdateAppearance();
                }
                else {
                    cell.current_population -= cell.usage_decrease_with_deficit;
                    if (cell.current_population <= 0) {
                        cell.current_population = 0;
                        this.DisappearFromFlow(cell);
                    }
                    // Insufficient water, terminate early.
                    this.LandTermination(cell);
                }
                this.new_population += cell.current_population;
                // console.log(this.new_population);
                break;
            case 'industrial':
                if (current_water_available >= temp_current_water_usage) {
                    if (this._game.policy2Active) {
                        cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;
                        if (this._game.policy3Active) {
                            cell.current_population += (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                        }
                    }
                    else if (this._game.policy3Active) {
                        cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                    }
                    else {
                        cell.current_population += cell.usage_increase_with_surplus;
                    }
                    if (cell.current_population >= cell.max_population) {
                        cell.current_population = cell.max_population;
                        this.Expand(cell);
                    }
                    this.money_generated = cell.current_population * cell.money_generated_per_usage;
                }
                else {
                    cell.current_population -= cell.usage_decrease_with_deficit;
                    if (cell.current_population <= 0) {
                        cell.current_population = 0;
                        this.DisappearFromFlow(cell);
                    }
                    cell.UpdateAppearance();
                    // Insufficient water, terminate early.
                    this.LandTermination(cell);
                }
                this.new_population += cell.current_population;
                break;
            default:
                break;
        }
        this.this_turn_income += Math.round(this.money_generated);
        this.money_generated = 0;
        var cell_neighbors = this._game.GetNeighborTilesFrom(cell._x, cell._y);
        var neighbors_to_visit = [];
        for (var n = 0; n < 4; n++) {
            if (cell_neighbors[n] != null && cell_neighbors[n] != previous_cell && this.visited.indexOf(cell_neighbors[n]) == -1 && cell_neighbors[n].name != 'empty') {
                neighbors_to_visit.push(cell_neighbors[n]);
            }
        }
        // tempCurWaterUsage = cell.curPopulation * cell.curWaterUsage;
        if (neighbors_to_visit.length == 0) {
            // Decrease cell integrity for repair mechanic
            this.visited.push(cell);
            if (neighbors_to_visit.length == 0) {
                var tempLake = this.lakes[cell._x][cell._y];
                if (tempLake.name == "lake") {
                    this.Terminate(cell, tempLake);
                }
                else {
                    this.LandTermination(cell);
                }
            }
            cell.Degrade(1);
        }
        else if (neighbors_to_visit.length > 1) {
            // TODO - investigate - why does this cell push itself to the list if there's more than one neighbor?
            this.pending.push(cell);
        }
        else {
            this.visited.push(cell);
            for (var n = 0; n < neighbors_to_visit.length; n++) {
                var temp_neighbor = neighbors_to_visit[n];
                if (temp_neighbor != previous_cell) {
                    //cell.inFlowCircuit = true;
                    this.visited.push(cell);
                    cell.output_units = current_water_available - (temp_current_water_usage * cell.evaporation_per_usage);
                    cell.output_quality = cell.current_quality - (temp_current_water_usage * cell.quality_drop_per_usage) + treatment_modifier;
                    temp_neighbor.input_units = cell.output_units;
                    temp_neighbor.input_quality = cell.output_quality;
                    this.Flow(cell, temp_neighbor);
                    cell.Degrade(1);
                }
            }
        }
    };
    World.prototype.ResolveFlow = function () {
        // Check all squares - if they weren't visited, decrease their populations if appropriate
        for (var loopX = 0; loopX < this.grid_width; loopX++) {
            for (var loopY = 0; loopY < this.grid_height; loopY++) {
                var cell = this.tiles[loopX][loopY];
                if ((cell.name == 'agricultural' || cell.name == 'industrial' || cell.name == 'residential') && this.visited.indexOf(cell) == -1) {
                    //cell.inFlowCircuit = false;
                    cell.current_population -= cell.usage_decrease_with_deficit;
                    // Don't generate income
                    this.new_population += cell.current_population;
                    switch (cell.name) {
                        case 'agricultural':
                            cell.UpdateAppearance();
                            break;
                        case 'industrial':
                            cell.UpdateAppearance();
                            break;
                        case 'residential':
                            cell.UpdateAppearance();
                            break;
                    }
                    if (cell.current_population <= 0) {
                        cell.current_population = 0;
                        this.Disappear(cell);
                    }
                }
            }
        }
        // Diffuse water capacity and quality through lakes and groundwater
        //if(lakeSource){
        // Recharge the lake.
        this.StartLakeDiffusion();
        //}
        if (this.scenario_aquifer) {
            // Recharge the aquifer.
            if (this.scenario_aquifer.current_water_storage < this.scenario_aquifer.max_water_storage) {
                this.scenario_aquifer.current_water_storage += this.scenario_aquifer.recharge_amount;
            }
            if (this.scenario_aquifer.current_water_storage > this.scenario_aquifer.max_water_storage) {
                this.scenario_aquifer.current_water_storage = this.scenario_aquifer.max_water_storage;
            }
            this.scenario_aquifer.SetPosition();
        }
        this.visited = [];
        this.pending = [];
        this.last_turn_usable_water = this.total_usable_water;
        this.total_usable_water = 0;
        //console.log(newPopulation);
        this.population = this.new_population;
        // console.log(this.new_population);
        this.new_population = 0;
        if (this._game.policy2Active) {
            this.game_money += this.this_turn_income + (this.this_turn_income * this._game.policy2Cost);
        }
        else {
            this.game_money += this.this_turn_income;
        }
        this.this_turn_income = 0;
        this.UpdateUI();
    };
    World.prototype.UpdateUI = function () {
        this._game.UI.SetPopulation(Math.round(this.population));
        this._game.UI.SetMoney(Math.round(this.game_money));
    };
    // Resolves any pending elements
    World.prototype.FinishFlow = function () {
        for (var pendingIndex = 0; pendingIndex < this.pending.length; pendingIndex++) {
            var cell = this.pending[pendingIndex];
            var cell_name = cell.name;
            var cell_neighbors = this._game.GetNeighborTilesFrom(cell._x, cell._y);
            cell.current_units = cell.input_units;
            cell.current_quality = cell.input_quality;
            var current_water_available = cell.current_units * cell.current_quality;
            var temp_current_water_useage = 0;
            // Usage tile water usage is population times
            if (cell_name == 'residential' && this._game.policy1Active) {
                temp_current_water_useage = cell.current_water_usage * cell.current_population * (1 - gamedata_1.GameData.getVar("policy1").percent);
            }
            if (this._game.policy3Active && (cell_name == 'residential' || cell_name == 'industrial' || cell_name == "agricultural")) {
                temp_current_water_useage = cell.current_water_usage * cell.current_population + (cell.current_water_usage * cell.current_population * gamedata_1.GameData.getVar("policy3").percent);
            }
            else {
                temp_current_water_useage = cell.current_water_usage * cell.current_population;
            }
            this.total_usable_water += current_water_available;
            var treatment_modifier = 0;
            this.visited.push(cell);
            // Determine if there's enough water for use
            switch (cell_name) {
                case 'pipe':
                    break;
                case 'watertower':
                    // Check if water should be pulled from storage
                    var predicted_water_available = this.last_turn_usable_water - this.total_usable_water;
                    if (current_water_available < predicted_water_available) {
                        current_water_available += cell.current_water_storage;
                        cell.current_water_storage = 0;
                    }
                    else {
                        // Refill storage
                        if (cell.current_water_storage < cell.max_water_storage) {
                            var space_left = (cell.max_water_storage - cell.current_water_storage);
                            if ((current_water_available - space_left) < 0) {
                                cell.current_water_storage += current_water_available;
                                this.LandTermination(cell);
                            }
                            else {
                                cell.current_water_storage += space_left;
                                current_water_available -= space_left;
                            }
                        }
                    }
                    break;
                case 'wastewater':
                    treatment_modifier = cell.treatment_modifier;
                    break;
                case 'treatment':
                    treatment_modifier = cell.treatment_modifier;
                    break;
                case 'agricultural':
                    if (current_water_available >= temp_current_water_useage) {
                        if (this._game.policy2Active) {
                            cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;
                            if (this._game.policy3Active) {
                                cell.current_population += (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                            }
                        }
                        else if (this._game.policy3Active) {
                            cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                        }
                        else {
                            cell.current_population += cell.usage_increase_with_surplus;
                        }
                        if (cell.current_population >= cell.max_population) {
                            cell.current_population = cell.max_population;
                            this.Expand(cell);
                        }
                        this.money_generated = cell.current_population * cell.money_generated_per_usage;
                    }
                    else {
                        cell.current_population -= cell.usage_decrease_with_deficit;
                        if (cell.current_population <= 0) {
                            cell.current_population = 0;
                            this.DisappearFromFlow(cell);
                        }
                        // Don't generate income
                        this.LandTermination(cell);
                    }
                    this.new_population += cell.current_population;
                    cell.UpdateAppearance();
                    break;
                case 'residential':
                    if (current_water_available >= temp_current_water_useage) {
                        if (this._game.policy2Active) {
                            cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;
                            if (this._game.policy3Active) {
                                cell.current_population += (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                            }
                        }
                        else if (this._game.policy3Active) {
                            cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                        }
                        else {
                            cell.current_population += cell.usage_increase_with_surplus;
                        }
                        if (cell.current_population >= cell.max_population) {
                            cell.current_population = cell.max_population;
                            this.Expand(cell);
                        }
                        this.money_generated = cell.current_population * cell.money_generated_per_usage;
                    }
                    else {
                        cell.current_population -= cell.usage_decrease_with_deficit;
                        if (cell.current_population <= 0) {
                            cell.current_population = 0;
                            this.DisappearFromFlow(cell);
                        }
                        // Don't generate income
                        this.LandTermination(cell);
                    }
                    cell.UpdateAppearance();
                    this.new_population += cell.current_population;
                    break;
                case 'industrial':
                    if (current_water_available >= temp_current_water_useage) {
                        if (this._game.policy2Active) {
                            cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;
                            if (this._game.policy3Active) {
                                cell.current_population += (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                            }
                        }
                        else if (this._game.policy3Active) {
                            cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * gamedata_1.GameData.getVar("policy3").percent);
                        }
                        else {
                            cell.current_population += cell.usage_increase_with_surplus;
                        }
                        if (cell.current_population >= cell.max_population) {
                            cell.current_population = cell.max_population;
                            this.Expand(cell);
                        }
                        this.money_generated = cell.current_population * cell.money_generated_per_usage;
                    }
                    else {
                        cell.current_population -= cell.usage_decrease_with_deficit;
                        if (cell.current_population <= 0) {
                            cell.current_population = 0;
                            this.DisappearFromFlow(cell);
                        }
                        // Don't generate income
                        this.LandTermination(cell);
                        // return;
                        cell.UpdateAppearance();
                    }
                    this.new_population += cell.current_population;
                    break;
                default:
                    break;
            }
            this.this_turn_income += Math.round(this.money_generated);
            this.money_generated = 0;
            var neighbors_to_visit = [];
            // Grab all neighbors excluding empty.
            for (var n = 0; n < 4; n++) {
                if (this.visited.indexOf(cell_neighbors[n]) == -1 && cell_neighbors[n] && cell_neighbors[n].name != 'empty' && cell_neighbors[n].name != 'source') {
                    neighbors_to_visit.push(cell_neighbors[n]);
                }
            }
            //cell.inFlowCircuit = true;
            // Setup output to next square.
            cell.output_units = current_water_available - (temp_current_water_useage * cell.evaporation_per_usage);
            cell.output_quality = cell.current_quality - (temp_current_water_useage * cell.quality_drop_per_usage) + treatment_modifier;
            var output_per_child = cell.output_units / neighbors_to_visit.length;
            for (var n = 0; n < neighbors_to_visit.length; n++) {
                var temp_neighbor = neighbors_to_visit[n];
                temp_neighbor.input_units = output_per_child;
                temp_neighbor.input_quality = cell.output_quality;
                // Decrease cell integrity for repair mechanic
                this.Flow(cell, temp_neighbor);
                cell.Degrade(1);
            }
            // If we have no neighbors to visit, check
            if (neighbors_to_visit.length == 0) {
                var tempLake = this.lakes[cell._x][cell._y];
                if (tempLake.name == "lake") {
                    this.Terminate(cell, tempLake);
                }
            }
        }
        this.ResolveFlow();
    };
    // When water just gushes out onto land
    World.prototype.LandTermination = function (cell) {
        if (cell === void 0) { cell = null; }
        if (cell && cell.name != "empty") {
            this.CircuitCheckStart(cell);
        }
    };
    // Check for a terminating circuit
    World.prototype.CircuitCheckStart = function (cell) {
        // TODO Implement this? Currently it just checks if a circuit is complete for a tutorial. There's probably a better way to do it.
    };
    // When water gushes out into a lake
    // In preparation for lake diffusion
    World.prototype.Terminate = function (previous_cell, terminating_cell) {
        this.has_complete_circuit = true;
        this.lakeInputs.push(terminating_cell);
        terminating_cell.input_units = previous_cell.output_units;
        terminating_cell.input_quality = previous_cell.output_quality;
        terminating_cell.current_units += terminating_cell.input_units;
        terminating_cell.current_quality = (terminating_cell.input_quality + terminating_cell.current_quality) / 2;
    };
    // When a tile has max population and enough water, it will expand out into another cell.
    World.prototype.Expand = function (cell) {
        var possible_cells = [];
        var randomChoice = 0;
        var temp_neighbor = null;
        var temp_neighbors = [];
        var temp_cell = null;
        switch (cell.name) {
            case "industrial":
                for (var loopX = 0; loopX < this.grid_width; loopX++) {
                    for (var loopY = 0; loopY < this.grid_height; loopY++) {
                        temp_cell = this.tiles[loopX][loopY];
                        if (temp_cell.name == 'industrial') {
                            temp_neighbors = this._game.GetNeighborTilesFrom(loopX, loopY);
                            for (var i = 0; i < temp_neighbors.length; i++) {
                                if (temp_neighbors[i] && temp_neighbors[i].name == 'empty') {
                                    possible_cells.push(temp_neighbors[i]);
                                }
                            }
                        }
                    }
                }
                possible_cells = this.removeLakeTiles(possible_cells);
                if (possible_cells.length > 0) {
                    randomChoice = Math.floor(Math.random() * possible_cells.length);
                    temp_neighbor = possible_cells[randomChoice];
                    var data = tiledata_1.TileData.getTile("IndustrialTile");
                    cell.current_population -= data.current_population;
                    this.CreateAt("industrial", temp_neighbor._x, temp_neighbor._y, "", false);
                }
                break;
            case "residential":
                for (var loopX = 0; loopX < this.grid_width; loopX++) {
                    for (var loopY = 0; loopY < this.grid_height; loopY++) {
                        temp_cell = this.tiles[loopX][loopY];
                        if (temp_cell.name == 'agricultural') {
                            possible_cells.push(this.tiles[loopX][loopY]);
                        }
                        else if (temp_cell.name == 'residential') {
                            temp_neighbors = this._game.GetNeighborTilesFrom(loopX, loopY);
                            for (var i = 0; i < temp_neighbors.length; i++) {
                                if (temp_neighbors[i] && temp_neighbors[i].name == 'empty') {
                                    possible_cells.push(temp_neighbors[i]);
                                }
                            }
                        }
                    }
                }
                // console.log(possibleCells);
                possible_cells = this.removeLakeTiles(possible_cells);
                if (possible_cells.length > 0) {
                    randomChoice = Math.floor(Math.random() * possible_cells.length);
                    // console.log(randomChoice);
                    temp_neighbor = possible_cells[randomChoice];
                    // console.log(tempNeighbor);
                    var res_data = tiledata_1.TileData.getTile("ResidentialTile");
                    cell.current_population -= res_data.current_population;
                    this.CreateAt("residential", temp_neighbor._x, temp_neighbor._y, "", false);
                }
                break;
            case "agricultural":
                for (var loopX = 0; loopX < this.grid_width; loopX++) {
                    for (var loopY = 0; loopY < this.grid_height; loopY++) {
                        if (this.tiles[loopX][loopY].name == 'empty') {
                            possible_cells.push(this.tiles[loopX][loopY]);
                        }
                    }
                }
                possible_cells = this.removeLakeTiles(possible_cells);
                if (possible_cells.length > 0) {
                    randomChoice = Math.floor(Math.random() * possible_cells.length);
                    temp_neighbor = possible_cells[randomChoice];
                    var ag_data = tiledata_1.TileData.getTile("AgriculturalTile");
                    cell.current_population -= ag_data.current_population;
                    this.CreateAt("agricultural", temp_neighbor._x, temp_neighbor._y, "", false);
                }
                break;
            default:
                break;
        }
    };
    World.prototype.DisappearFromFlow = function (cell) {
        if (this.pending.indexOf(cell) != -1) {
            this.pending.splice(this.pending.indexOf(cell), 1);
        }
        cell.current_population = 0;
        var _x = cell._x;
        var _y = cell._y;
        //cell.inFlowCircuit = false;
        //this.world[cell.x][cell.y].emptyType(new Empty(world[cell.x][cell.y]));
        //world[cell.x][cell.y].setType(new Pipe(world[cell.x][cell.y]));
        this.CreateAt("pipe", _x, _y);
    };
    World.prototype.Disappear = function (cell) {
        if (this.pending.indexOf(cell) != -1) {
            this.pending.splice(this.pending.indexOf(cell), 1);
        }
        cell.current_population = 0;
        //cell.inFlowCircuit = false;
        var _x = cell._x;
        var _y = cell._y;
        this.CreateAt("empty", _x, _y, "", false);
    };
    World.prototype.StartLakeDiffusion = function () {
        // Go through all lakesource tiles, diffusing water out of them
        // Add all sources not in the Inputs to the list
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                if (this.lakes[i][j] != undefined && this.lakeInputs.indexOf(this.lakes[i][j]) == -1) {
                    this.lakeInputs.push(this.lakes[i][j]);
                }
            }
        }
        for (var x = 0; x < this.lakeInputs.length; x++) {
            this.visitedLakes = [];
            var cell = this.lakeInputs[x];
            var currentStorage = cell.current_water_storage;
            var maxStorage = cell.max_water_storage;
            if (cell.is_source) {
                cell.current_quality = .7;
            }
            // Factor evaporation and loss due to quality.
            var changeInStorage = (currentStorage * cell.current_quality) - (cell.current_water_storage * cell.evaporation_per_usage);
            // Recharge lake cell.
            if (this.lakeInputs[x].is_source) {
                changeInStorage += cell.recharge_amount;
            }
            var netStorage = currentStorage + changeInStorage;
            var excess = 0;
            if (currentStorage > maxStorage) {
                excess = netStorage - maxStorage;
            }
            var grossStorage = netStorage - excess;
            cell.current_water_storage = grossStorage;
            if (cell.current_water_storage > cell.max_water_storage) {
                cell.current_water_storage = cell.max_water_storage;
            }
            var cellNeighbors = this._game.GetNeighborLakeTilesFrom(cell._x, cell._y);
            var neighborsToVisit = [];
            // Grab all lake neighbors.
            for (var n = 0; n < 4; n++) {
                if (cellNeighbors[n]) {
                    var tempX = cellNeighbors[n]._x;
                    var tempY = cellNeighbors[n]._y;
                    var tempLake = this.lakes[tempX][tempY];
                    if (tempLake.name == "lake" && this.visitedLakes.indexOf(cellNeighbors[n]) == -1) {
                        neighborsToVisit.push(cellNeighbors[n]);
                    }
                }
            }
            this.visitedLakes.push(cell);
            for (var n = 0; n < neighborsToVisit.length; n++) {
                var tempNeighbor = neighborsToVisit[n];
                // Setup output to next square.
                cell.output_quality = cell.current_quality - (currentStorage * cell.quality_drop_per_usage);
                var outputPerChild = excess / neighborsToVisit.length;
                tempNeighbor.input_units = outputPerChild;
                tempNeighbor.input_quality = cell.output_quality;
                this.diffuse(tempNeighbor);
            }
        }
    };
    World.prototype.diffuse = function (cell) {
        var currentStorage = cell.current_water_storage;
        var maxStorage = cell.max_water_storage;
        cell.current_quality = (cell.current_quality + cell.input_quality) / 2;
        // Factor evaporation and loss due to quality.
        var change_in_storage = (currentStorage * cell.current_quality) - (cell.current_water_storage * cell.evaporation_per_usage);
        // Recharge lake cell.
        // EXCESS MIGHT BE THE INCOMING - CHECK THAT
        if (cell.is_source) {
            change_in_storage += cell.recharge_amount + cell.input_units;
        }
        else {
            change_in_storage += cell.input_units;
        }
        var net_storage = currentStorage + change_in_storage;
        var excess = 0;
        if (currentStorage > maxStorage) {
            excess = net_storage - maxStorage;
        }
        var gross_storage = net_storage - excess;
        cell.current_water_storage = gross_storage;
        var cellNeighbors = this._game.GetNeighborLakeTilesFrom(cell._x, cell._y);
        var neighborsToVisit = [];
        // Grab all lake neighbors.
        for (var n = 0; n < 4; n++) {
            if (cellNeighbors[n]) {
                //let tempX = cellNeighbors[n]._x;
                //let tempY = cellNeighbors[n]._y;
                //var tempLake = worldLakes[tempX][tempY];
                if (cellNeighbors[n].name == "lake" && this.visitedLakes.indexOf(cellNeighbors[n]) == -1) {
                    neighborsToVisit.push(cellNeighbors[n]);
                }
            }
        }
        this.visitedLakes.push(cell);
        var outputPerChild = excess / neighborsToVisit.length;
        // Setup output to next square.
        cell.output_quality = cell.current_quality - (currentStorage * cell.quality_drop_per_usage);
        for (var n = 0; n < neighborsToVisit.length; n++) {
            var tempNeighbor = neighborsToVisit[n];
            if (this.visitedLakes.indexOf(tempNeighbor) == -1 && outputPerChild > 0) {
                tempNeighbor.input_units = outputPerChild;
                tempNeighbor.input_quality = cell.output_quality;
                this.diffuse(tempNeighbor);
            }
        }
    };
    World.prototype.removeLakeTiles = function (tiles) {
        var _this = this;
        return tiles.filter(function (tile) {
            return _this.lakes[tile._x][tile._y].name !== "lake";
        });
    };
    return World;
}());
World.NORTH = 0;
World.EAST = 1;
World.SOUTH = 2;
World.WEST = 3;
exports.World = World;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var audio_1 = __webpack_require__(2);
// Initial mute state is set in LoadScreen.create() based on localStorage value
var MuteButton = (function (_super) {
    __extends(MuteButton, _super);
    function MuteButton(game, x, y, context) {
        var _this = _super.call(this, game, x, y, "watergame", null, context, null, null, null, null) || this;
        _this.onInputUp.add(_this.toggleMute, _this);
        _this.frameName = localStorage.getItem("mute") === "true" ? "mute_button/speaker_off" : "mute_button/speaker";
        return _this;
    }
    MuteButton.prototype.toggleMute = function () {
        audio_1.AudioManager.toggleMute();
        this.updateFrame();
    };
    MuteButton.prototype.updateFrame = function () {
        this.frameName = audio_1.AudioManager.muted ? "mute_button/speaker_off" : "mute_button/speaker";
    };
    return MuteButton;
}(Phaser.Button));
exports.MuteButton = MuteButton;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SpeechBubble = (function (_super) {
    __extends(SpeechBubble, _super);
    function SpeechBubble(game, x, y, width, text) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (width === void 0) { width = 300; }
        if (text === void 0) { text = ""; }
        var _this = _super.call(this, game) || this;
        _this._arrow_size = 12;
        _this._arrow_position = 20;
        _this._rect_radius = 15;
        _this.x = x;
        _this.y = y;
        // Create and add text
        _this._text = new Phaser.Text(game, 10, 10, text, { font: "20px sans-serif", wordWrap: true, wordWrapWidth: width });
        _this._graphics = new Phaser.Graphics(game, 0, 0);
        _this.add(_this._graphics);
        _this.add(_this._text);
        _this.render();
        return _this;
    }
    Object.defineProperty(SpeechBubble.prototype, "text", {
        set: function (text) {
            this._text.text = text;
            this.render();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechBubble.prototype, "width", {
        set: function (n) {
            this._text.wordWrapWidth = n;
            this.render();
        },
        enumerable: true,
        configurable: true
    });
    SpeechBubble.prototype.render = function () {
        this._graphics.clear();
        this._graphics.beginFill(0xffffff);
        this._graphics.drawRoundedRect(0, 0, this._text.width + 20, this._text.height + 20, this._rect_radius);
        //this._graphics.drawPolygon(this._arrow);
        this._graphics.drawTriangle([
            new Phaser.Point(0, this._arrow_position),
            new Phaser.Point(0, this._arrow_position + this._arrow_size),
            new Phaser.Point(-Math.sqrt(Math.pow(this._arrow_size, 2) + Math.pow(this._arrow_size / 2, 2)), this._arrow_position + this._arrow_size / 2)
        ]);
    };
    return SpeechBubble;
}(Phaser.Group));
exports.SpeechBubble = SpeechBubble;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Boot = (function (_super) {
    __extends(Boot, _super);
    function Boot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Boot.prototype.preload = function () {
        this.load.image("menu_background", "sprites/unpacked/main_menu/background.png");
    };
    Boot.prototype.create = function () {
        this.game.input.maxPointers = 1;
        this.game.state.start("LoadScreen");
    };
    return Boot;
}(Phaser.State));
exports.Boot = Boot;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/13/17.
 */
var world_1 = __webpack_require__(4);
var construction_menu_1 = __webpack_require__(26);
var UI_1 = __webpack_require__(12);
var tiledata_1 = __webpack_require__(1);
var gamedata_1 = __webpack_require__(3);
var audio_1 = __webpack_require__(2);
var policymenu_1 = __webpack_require__(13);
var GameLogic = (function (_super) {
    __extends(GameLogic, _super);
    function GameLogic() {
        var _this = _super.call(this) || this;
        _this._paused = false;
        _this._delete_mode = false;
        _this._repair_mode = false;
        _this.heartbeat_count = 0;
        _this.policy1Active = false;
        _this.policy3Active = false;
        _this.policy2Active = false;
        _this.policy1TimeLeft = 0;
        _this.policy3TimeLeft = 0;
        _this.policy2Cost = 0;
        _this.policy2PopulationReduction = 1;
        _this._game_active = false;
        _this._world = new world_1.World(_this);
        return _this;
    }
    GameLogic.prototype.SetPolicy2Numbers = function (cost, reduct) {
        this.policy2Cost = cost;
        this.policy2PopulationReduction = reduct;
    };
    GameLogic.prototype.ActivatePolicy1 = function () {
        this.policy1TimeLeft = gamedata_1.GameData.getVar("policy1").duration * 60;
        this.policy1Active = true;
    };
    GameLogic.prototype.ActivatePolicy3 = function () {
        this.policy3TimeLeft = gamedata_1.GameData.getVar("policy3").duration * 60;
        this.policy3Active = true;
    };
    GameLogic.prototype.TogglePolicy2 = function () {
        this.policy2Active = !this.policy2Active;
    };
    // Init is run separately from the constructor because we might need to create these things later.
    // Eventually world will get created and destroyed several times a session
    GameLogic.prototype.init = function (level_id) {
        tiledata_1.TileData.init(this.game);
        gamedata_1.GameData.init(this.game);
        this.level_id = level_id["level"];
        // Create the world Layer
        this._game_active = true;
        this._world_group = this.game.add.group();
        // Create the UI Layer
        this.UI = new UI_1.UI(this.game, this);
        this.game.add.existing(this.UI);
        this._world.init(this.level_id);
        this._construction_menu = new construction_menu_1.ConstructionMenu(this, 100, 100);
        this._construction_menu.visible = false;
        this.UI.add(this._construction_menu);
        this.trash_icon = new Phaser.Image(this.game, 0, 0, "delete_small");
        this.trash_icon.visible = false;
        this.UI.add(this.trash_icon);
        this.repair_icon = new Phaser.Image(this.game, 0, 0, "repair_small");
        this.repair_icon.visible = false;
        this.UI.add(this.repair_icon);
        this.UI.sendToBack(this.repair_icon);
        this._policy_menu = new policymenu_1.PolicyMenu(this.game, this);
        this.UI.add(this._policy_menu);
        this.UI.bringToTop(this._policy_menu);
    };
    GameLogic.prototype.EndRepairMode = function () {
        this._repair_mode = false;
        this.repair_icon.visible = false;
    };
    GameLogic.prototype.StartRepairMode = function () {
        this._repair_mode = true;
        this.repair_icon.visible = true;
        this.UI.delete_button.TurnOff();
    };
    GameLogic.prototype.EndDeleteMode = function () {
        this._delete_mode = false;
        this.trash_icon.visible = false;
    };
    GameLogic.prototype.StartDeleteMode = function () {
        this._delete_mode = true;
        this.trash_icon.visible = true;
        this.UI.repair_button.TurnOff();
    };
    GameLogic.prototype.update = function () {
        this.game.input.update();
        // Update the menu and tile highlights
        if (this._game_active) {
            this._world.update();
            // Run the world update heartbeat once a second
            if (!this._paused) {
                this.heartbeat_count++;
                if (this.heartbeat_count == 60) {
                    this._world.ResetInFlow();
                    this._world.Probe();
                    this._world.CheckWinCondition();
                    this.heartbeat_count = 0;
                }
                if (this.policy1Active) {
                    this.policy1TimeLeft--;
                    if (this.policy1TimeLeft <= 0) {
                        this.policy1Active = false;
                    }
                }
                if (this.policy3Active) {
                    this.policy3TimeLeft--;
                    if (this.policy3TimeLeft <= 0) {
                        this.policy3Active = false;
                    }
                }
            }
            else {
                this._world.UpdateUI();
            }
        }
        this.trash_icon.x = this.game.input.x + 10;
        this.trash_icon.y = this.game.input.y + 10;
        this.repair_icon.x = this.game.input.x + 10;
        this.repair_icon.y = this.game.input.y + 10;
    };
    GameLogic.prototype.Win = function (win_text) {
        this._paused = true;
        this.EndDeleteMode();
        this.EndRepairMode();
        audio_1.AudioManager.playMusic("win");
        this.UI.info_panel.showMessageWin(win_text);
        var completed_levels = JSON.parse(localStorage.getItem("completed_levels")) || [];
        if (completed_levels.indexOf(this.level_id) == -1) {
            completed_levels.push(this.level_id);
            localStorage.setItem("completed_levels", JSON.stringify(completed_levels));
        }
    };
    GameLogic.prototype.Pause = function () {
        this._paused = true;
    };
    // TODO - Honor the pause UI, so if the player paused it, then opens an info box, then closes the info box, the game remains paused.
    GameLogic.prototype.UnPause = function () {
        if (!this.UI.pause_button.GetIsPaused()) {
            this._paused = false;
        }
    };
    GameLogic.prototype.IsMenuUp = function () {
        return this._construction_menu.visible;
    };
    // Grab neighbors from world tiles
    // North to west, clockwise, starting at 0
    // Null if the tiles are out of bounds
    GameLogic.prototype.GetNeighborTilesFrom = function (x, y) {
        var neighbors = [];
        for (var dir = 0; dir <= 3; dir++) {
            var newDir = this._world.GetTile(x, y, dir);
            neighbors[dir] = newDir;
        }
        return neighbors;
    };
    GameLogic.prototype.GetNeighborLakeTilesFrom = function (x, y) {
        var neighbors = [];
        for (var dir = 0; dir <= 3; dir++) {
            var newDir = this._world.GetLakeTile(x, y, dir);
            neighbors[dir] = newDir;
        }
        return neighbors;
    };
    GameLogic.prototype.GetCostForUpgradeAtTile = function (id, x, y) {
        var current_tile = this._world.tiles[x][y];
        //console.log(current_tile);
        // If the id matches the existing tile, it cannot be purchased
        if (current_tile.name === id || id === "empty") {
            return null;
        }
        // If the tile has upgrades, and already has the type installed, it cannot be purchased
        if (current_tile.hasOwnProperty("upgrades") && current_tile.hasOwnProperty("types") && current_tile["types"].indexOf(id) > -1) {
            return null;
        }
        var tile_info = tiledata_1.TileData.getTileByType(id);
        if (tile_info.hasOwnProperty("upgrades") && current_tile.hasOwnProperty("upgrades")) {
            return tile_info.cost * (current_tile["types"].length / 2 + 1);
        }
        return tile_info.cost;
    };
    GameLogic.prototype.OpenSurvey = function (url) {
        window.open(url, "theSurvey");
        var surveyWrap = document.getElementById("surveyWrap");
        surveyWrap.style.visibility = "visible";
    };
    return GameLogic;
}(Phaser.State));
exports.GameLogic = GameLogic;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mute_button_1 = __webpack_require__(5);
var ChapterSelect = (function (_super) {
    __extends(ChapterSelect, _super);
    function ChapterSelect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChapterSelect.prototype.create = function () {
        var _this = this;
        this._menu_group = this.game.add.group();
        this.mute_button = this.game.add.existing(new mute_button_1.MuteButton(this.game, 20, this.game.world.height - 100, this));
        this.home_button = this.game.add.button(120, this.game.world.height - 95, "watergame", function () { _this.game.state.start("MainMenu"); }, this, null, "home_icon");
        this.background = this.game.add.sprite(0, 0, "level_select_bg");
        this._menu_group.add(this.background);
        this._menu_group.add(this.home_button);
        this.completed_levels = JSON.parse(localStorage.getItem("completed_levels")) || [];
        this.level_data = this.game.cache.getJSON("level_data");
        for (var i = 0; i < this.level_data.length; i++) {
            var level = this.level_data[i];
            var level_id = level["level_id"];
            var sprite = this.game.add.sprite(0, 0, level["sheet"], level["frame"]);
            var enabled = i == 0 || i <= this.completed_levels.length;
            var button = this.createLevelButton(sprite, level_id, level["x"], level["y"], enabled);
            this._menu_group.add(button);
        }
    };
    ChapterSelect.prototype.createLevelButton = function (sprite, levelid, x, y, enabled) {
        var _this = this;
        var button_group = this.game.add.group();
        button_group.x = x;
        button_group.y = y;
        sprite.anchor = new Phaser.Point(0.5, 0.5);
        button_group.add(sprite);
        if (this.completed_levels.indexOf(levelid.toString()) > -1) {
            var green_bg = this.game.add.sprite(0, 0, "chapterselect", "career_green", button_group);
            green_bg.anchor = new Phaser.Point(0.5, 0.5);
        }
        if (enabled) {
            var yellow_bg_1 = this.game.add.sprite(0, 0, "chapterselect", "career_yellow", button_group);
            yellow_bg_1.anchor = new Phaser.Point(0.5, 0.5);
            yellow_bg_1.visible = false;
            sprite.inputEnabled = true;
            sprite.events.onInputOver.add(function () {
                yellow_bg_1.visible = true;
                _this.game.canvas.style.cursor = "pointer";
            });
            sprite.events.onInputOut.add(function () {
                yellow_bg_1.visible = false;
                _this.game.canvas.style.cursor = "default";
            });
            sprite.events.onInputDown.add(function () {
                _this.InitGame(levelid);
            });
        }
        else {
            sprite.tint = 0x666666;
        }
        return button_group;
    };
    ChapterSelect.prototype.InitGame = function (level) {
        this.game.state.start("GameLogic", true, false, { level: level });
    };
    return ChapterSelect;
}(Phaser.State));
exports.ChapterSelect = ChapterSelect;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var audio_1 = __webpack_require__(2);
var LoadScreen = (function (_super) {
    __extends(LoadScreen, _super);
    function LoadScreen() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoadScreen.prototype.preload = function () {
        // Main images pack
        this.load.atlasJSONArray('watergame', 'sprites/packed/water_game_packed_sprites-0.png', 'sprites/packed/water_game_packed_sprites-0.json');
        this.load.atlasJSONArray("chapterselect", "sprites/packed/level_select_sprites.png", "sprites/packed/level_select_sprites.json");
        // Animations for creating items
        this.load.atlasJSONArray('create_anims', 'sprites/packed/placement_animations.png', 'sprites/packed/placement_animations.json');
        // worlds
        this.load.image("world_agri", "sprites/unpacked/worlds/world_agri.jpg");
        this.load.image("world_arid", "sprites/unpacked/worlds/world_arid.jpg");
        this.load.image("world_agri_pol", "sprites/unpacked/worlds/world_agri_pollution.png");
        this.load.image("world_arid_pol", "sprites/unpacked/worlds/world_arid_pollution.png");
        this.load.image("world_happy", "sprites/unpacked/worlds/world_happy.jpg");
        this.load.image("world_happy_pol", "sprites/unpacked/worlds/happy_pollution_all.png");
        this.load.image("world_ind", "sprites/unpacked/worlds/world_ind.jpg");
        this.load.image("world_ocean", "sprites/unpacked/worlds/world_ocean.jpg");
        this.load.image("world_wet", "sprites/unpacked/worlds/world_wet.jpg");
        this.load.image("world_ind_pol", "sprites/unpacked/worlds/world_ind_pollution.png");
        this.load.image("world_ocean_pol", "sprites/unpacked/worlds/world_ocean_pollution.png");
        this.load.image("world_wet_pol", "sprites/unpacked/worlds/world_wet_pollution.png");
        // Aquifer
        this.load.image("aquifer_foreground", "sprites/unpacked/aquifer/foreground.png");
        this.load.image("aquifer_mask", "sprites/unpacked/aquifer/mask.png");
        // Single Images
        this.load.image("menu_background", "sprites/unpacked/main_menu/background.png");
        this.load.image("cb", "sprites/unpacked/CB_icon.png");
        this.load.image("level_select_bg", "sprites/unpacked/main_menu/career_no_arrows.png");
        this.load.image("cb_full", "sprites/unpacked/CB/CB_smaller_trimmed.png");
        this.load.image("cb_win", "sprites/unpacked/CB/CB_win.png");
        this.load.image("cb_blocker", "sprites/unpacked/CB/CB_blocker.png");
        this.load.image("cb_finish", "sprites/unpacked/CB/continue_button.png");
        this.load.image("pause", "sprites/unpacked/UI/pause.png");
        this.load.image("resume", "sprites/unpacked/UI/resume.png");
        this.load.image('delete_on', "sprites/unpacked/UI/trash_on.png");
        this.load.image('delete_off', "sprites/unpacked/UI/trash_off.png");
        this.load.image('delete_small', "sprites/unpacked/UI/trash_small.png");
        this.load.image("slider_down", "sprites/unpacked/UI/grey_sliderDown.png");
        this.load.image("slider_horizontal", "sprites/unpacked/UI/grey_sliderHorizontal.png");
        this.load.image('yes_button', "sprites/unpacked/UI/yes_button.png");
        this.load.image('no_button', "sprites/unpacked/UI/no_button.png");
        this.load.image('repair_on', "sprites/unpacked/UI/wrench_on.png");
        this.load.image('repair_off', "sprites/unpacked/UI/wrench_off.png");
        this.load.image('repair_small', "sprites/unpacked/UI/wrench_small.png");
        this.load.image('buttonbg', "sprites/unpacked/UI/buttonbg.png");
        // JSON
        this.load.json('tiles_json', 'map_editor_files/WaterGamePlaceableTiles.json');
        this.load.json('test_scene_json', 'map_editor_files/WaterGameTestScene.json');
        this.load.json("tile_data", "json/Tile.json");
        this.load.json("construction_menu_data", "json/ConstructionMenu.json");
        this.load.json("level_data", "json/Levels.json");
        this.load.json("vars", "json/Vars.json");
        // LEVEL JSON
        this.load.json('scenario_1', 'map_editor_files/Scenario_1.json');
        this.load.json('scenario_2', 'map_editor_files/Scenario_2.json');
        this.load.json('scenario_3', 'map_editor_files/Scenario_3.json');
        this.load.json('scenario_4', 'map_editor_files/Scenario_4.json');
        this.load.json('scenario_5', 'map_editor_files/Scenario_5.json');
        this.load.json('scenario_6', 'map_editor_files/Scenario_6.json');
        this.load.json('scenario_7', 'map_editor_files/Scenario_7.json');
        this.load.json('scenario_8', 'map_editor_files/Scenario_8.json');
        this.load.json('scenario_9', 'map_editor_files/Scenario_9.json');
        this.load.json('scenario_10', 'map_editor_files/Scenario_10.json');
        this.load.json('sandbox', 'map_editor_files/Sandbox.json');
        // Audio
        this.load.audio("main_theme", "sounds/theme.mp3");
        this.load.audio("agriculture", "sounds/agricultural.mp3");
        this.load.audio("lose", "sounds/lose.mp3");
        this.load.audio("win", "sounds/win.mp3");
    };
    LoadScreen.prototype.create = function () {
        var _this = this;
        this.game.sound.mute = localStorage.getItem("mute") === "true";
        this.background = this.game.add.sprite(0, 0, "menu_background");
        this.text = this.game.add.text(this.game.world.centerX, 250, "Loading", { font: "bold 36px sans-serif", });
        this.text.anchor = new Phaser.Point(0.5, 0.5);
        if (this.game.load.hasLoaded) {
            this.InitMenu();
        }
        else {
            var show_menu_listener_1 = this.game.load.onLoadComplete.add(function () {
                _this.InitMenu();
                show_menu_listener_1.detach();
            });
        }
    };
    LoadScreen.prototype.InitMenu = function () {
        // Register all the audio before starting the game
        audio_1.AudioManager.RegisterSound("main_theme", true);
        audio_1.AudioManager.RegisterSound("agriculture", true);
        audio_1.AudioManager.RegisterSound("lose");
        audio_1.AudioManager.RegisterSound("win");
        this.game.state.start("MainMenu");
    };
    return LoadScreen;
}(Phaser.State));
exports.LoadScreen = LoadScreen;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var audio_1 = __webpack_require__(2);
var mute_button_1 = __webpack_require__(5);
var MainMenu = (function (_super) {
    __extends(MainMenu, _super);
    function MainMenu() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainMenu.prototype.create = function () {
        this._menu_group = this.game.add.group();
        this.background = this.game.add.sprite(0, 0, "menu_background");
        this._menu_group.add(this.background);
        this.career_button = this.game.add.button(this.game.world.centerX, 260, "watergame", this.SelectLevel, this, "menu_buttons/career_glow", "menu_buttons/career", null, null, this._menu_group);
        this.career_button.anchor = new Phaser.Point(0.5, 0.5);
        // TODO: Make this open sandbox mode when sandbox mode exists
        this.sandbox_button = this.game.add.button(this.game.world.centerX, 330, "watergame", this.StartSandbox, this, "menu_buttons/sandbox_glow", "menu_buttons/sandbox", null, null, this._menu_group);
        this.sandbox_button.anchor = new Phaser.Point(0.5, 0.5);
        this.how_to_button = this.game.add.button(this.game.world.centerX, 400, "watergame", this.ViewHowTo, this, "menu_buttons/how_to_play_glow", "menu_buttons/how_to_play", null, null, this._menu_group);
        this.how_to_button.anchor = new Phaser.Point(0.5, 0.5);
        this.about_button = this.game.add.button(this.game.world.centerX, 470, "watergame", this.ViewAbout, this, "menu_buttons/about_glow", "menu_buttons/about", null, null, this._menu_group);
        this.about_button.anchor = new Phaser.Point(0.5, 0.5);
        this.mute_button = this.game.add.existing(new mute_button_1.MuteButton(this.game, 20, this.game.world.height - 120, this));
        audio_1.AudioManager.playMusic("main_theme");
    };
    MainMenu.prototype.SelectLevel = function () {
        this.game.state.start("ChapterSelect", true, false);
    };
    MainMenu.prototype.StartSandbox = function () {
        this.InitGame("sandbox");
    };
    MainMenu.prototype.ViewHowTo = function () {
        window.location.assign("howtoplay.html");
    };
    MainMenu.prototype.ViewAbout = function () {
        window.location.assign("about.html");
    };
    MainMenu.prototype.destroy = function () {
        this._menu_group.destroy(true);
    };
    MainMenu.prototype.InitGame = function (level) {
        this.game.state.start("GameLogic", true, false, { level: level });
    };
    return MainMenu;
}(Phaser.State));
exports.MainMenu = MainMenu;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by nathanmishler on 3/15/17.
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var notification_1 = __webpack_require__(30);
var info_panel_1 = __webpack_require__(29);
var pause_button_1 = __webpack_require__(31);
var delete_button_1 = __webpack_require__(27);
var repair_button_1 = __webpack_require__(33);
var home_button_1 = __webpack_require__(28);
var UI = (function (_super) {
    __extends(UI, _super);
    function UI(game, _game_logic) {
        var _this = _super.call(this, game) || this;
        _this.game_logic = _game_logic;
        _this.population_icon = _this.game.add.sprite(650, 100, 'watergame', "population_icon");
        _this.population_icon.anchor = new Phaser.Point(0.5, 0.5);
        _this.population_icon.scale = new Phaser.Point(.5, .5);
        _this.add(_this.population_icon);
        _this.population_text = new Phaser.Text(_this.game, 700, 100, "0");
        _this.population_text.anchor = new Phaser.Point(0.5, 0.5);
        _this.add(_this.population_text);
        _this.money_icon = _this.game.add.sprite(650, 50, 'watergame', "money_icon");
        _this.money_icon.anchor = new Phaser.Point(0.5, 0.5);
        _this.money_icon.scale = new Phaser.Point(.5, .5);
        _this.add(_this.money_icon);
        _this.money_text = new Phaser.Text(_this.game, 700, 50, "0");
        _this.money_text.anchor = new Phaser.Point(0.5, 0.5);
        _this.add(_this.money_text);
        _this.notification = new notification_1.Notification(game, _game_logic);
        _this.add(_this.notification);
        _this.pause_button = new pause_button_1.PauseButton(game, _game_logic);
        _this.add(_this.pause_button);
        _this.info_panel = new info_panel_1.InfoPanel(game, _game_logic);
        _this.add(_this.info_panel);
        _this.delete_button = new delete_button_1.DeleteButton(game, _game_logic);
        _this.add(_this.delete_button);
        _this.repair_button = new repair_button_1.RepairButton(game, _game_logic);
        _this.add(_this.repair_button);
        _this.home_button = new home_button_1.HomeButton(game, _game_logic);
        _this.add(_this.home_button);
        _this.policy_button = game.add.button(230, 500, "watergame", function () {
            _game_logic._policy_menu.Open();
            game.canvas.style.cursor = "default";
        }, _this, null, "policy_icon");
        _this.add(_this.policy_button);
        return _this;
    }
    UI.prototype.IsAModalOpen = function () {
        return this.info_panel.visible || this.home_button.modal_visible || this.game_logic._policy_menu.visible;
    };
    UI.prototype.SetPopulation = function (pop) {
        this.population_text.text = pop.toString();
    };
    UI.prototype.SetMoney = function (money) {
        //console.log("setting money");
        var abbr;
        var substr_len;
        if (money >= 1e12) {
            abbr = 'T';
            substr_len = 12;
        }
        else if (money >= 1e9) {
            abbr = 'B';
            substr_len = 9;
        }
        else if (money >= 1e6) {
            abbr = 'M';
            substr_len = 6;
        }
        else if (money >= 1e4) {
            abbr = 'K';
            substr_len = 3;
        }
        else {
            abbr = '';
            substr_len = 0;
        }
        var adjusted_money = money.toString();
        adjusted_money = adjusted_money.substr(0, adjusted_money.length - substr_len) + abbr;
        this.money_text.text = adjusted_money;
    };
    return UI;
}(Phaser.Group));
exports.UI = UI;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var policy_option_1 = __webpack_require__(32);
var gamedata_1 = __webpack_require__(3);
var PolicyMenu = (function (_super) {
    __extends(PolicyMenu, _super);
    function PolicyMenu(game, logic) {
        var _this = _super.call(this, game) || this;
        _this._top_margin = 10; // percent distance from top edge
        _this._left_margin = 10; // percent distance from left edge
        _this._policy_buttons = [];
        _this._policy_data = [
            { id: "no_policy", text: "No Policy" },
            { id: "policy1", text: "Increase Water Cost" },
            { id: "policy2", text: "Every 5% decrease in water cost \n increases incoming population by 1%" }
        ];
        _this._padding = 15; // pixel distance between edge of modal and content
        _this._game_logic = logic;
        var graphics = game.add.graphics(0, 0, _this);
        graphics.inputEnabled = true;
        graphics.input.useHandCursor = false;
        _this.add(graphics);
        // create background fill
        graphics.beginFill(0xffffff, 0.3);
        graphics.drawRect(0, 0, game.width, game.height);
        graphics.endFill();
        // calculate margins
        _this._horizontal_margin = Math.floor(game.width / _this._left_margin);
        _this._vertical_margin = Math.floor(game.height / _this._top_margin);
        // create menu background
        graphics.beginFill(0xffffff);
        graphics.drawRoundedRect(_this._horizontal_margin, _this._vertical_margin, game.width - (2 * _this._horizontal_margin), game.height - (2 * _this._vertical_margin), 15);
        graphics.endFill();
        // create title
        var title = new Phaser.Text(game, game.width / 2 - _this._horizontal_margin, _this._vertical_margin + _this._padding, "Water Usage Policies", { align: "center" });
        _this.add(title);
        // Create Policy1 Item
        _this.policy1button = game.add.button(0, title.y + title.height + 10, 'buttonbg', _this.Policy1Click, _this, 2, 1, 0);
        _this.policy1buttontext = new Phaser.Text(game, 0, 0, "$" + gamedata_1.GameData.getVar("policy1").cost.toString(), { align: "center", wordWrap: true, wordWrapWidth: 100 });
        _this.add(_this.policy1button);
        _this.policy1button.x = _this._horizontal_margin + 10;
        _this.policy1button.addChild(_this.policy1buttontext);
        _this.policy1buttontext.x = _this.policy1button.width / 2 - _this.policy1buttontext.width / 2;
        _this.policy1buttontext.y = _this.policy1button.height / 2 - _this.policy1buttontext.height / 2;
        var policy1Explanation = new Phaser.Text(game, 0, 0, "Encourage Water Conservation: Reduce water use by " + (gamedata_1.GameData.getVar("policy1").percent * 100).toString() + "% for residential areas only for " + (gamedata_1.GameData.getVar("policy1").duration).toString() + " seconds.", { align: "left", wordWrap: true, wordWrapWidth: 500 });
        policy1Explanation.fontSize = 18;
        _this.policy1button.addChild(policy1Explanation);
        policy1Explanation.x = _this.policy1button.width + 10;
        // Create Policy2 Items
        _this.policy2button = game.add.button(_this.policy1button.x, _this.policy1button.y + _this.policy1button.height + 50, 'buttonbg', _this.Policy2Click, _this, 2, 1, 0);
        _this.policy2buttontext = new Phaser.Text(game, 0, 0, "Off", { align: "center", wordWrap: true, wordWrapWidth: 100 });
        _this.policy2button.addChild(_this.policy2buttontext);
        _this.add(_this.policy2button);
        var policy2Explanation = new Phaser.Text(game, 0, 0, "Raise water rates: in Industrial, Residential, and Agricultural areas with a corresponding drop in population growth.", { align: "left", wordWrap: true, wordWrapWidth: 500 });
        policy2Explanation.fontSize = 18;
        _this.policy2button.addChild(policy2Explanation);
        policy2Explanation.x = _this.policy2button.width + 10;
        var option = new policy_option_1.PolicyOption(game, _this._game_logic, "policy1", "text", gamedata_1.GameData.getVar("policy2").min, gamedata_1.GameData.getVar("policy2").max, null);
        //option.x = policy2Explanation.x;
        //option.y = policy2Explanation.y + policy2Explanation.height + 10;
        _this.add(option);
        option.x = _this._horizontal_margin + policy2Explanation.x + 20;
        option.y = game.height / 2 + 10;
        // Create Policy3 Item
        _this.policy3button = game.add.button(0, _this.policy2button.y + _this.policy2button.height + 100, 'buttonbg', _this.Policy3Click, _this, 2, 1, 0);
        _this.policy3buttontext = new Phaser.Text(game, 0, 0, "$" + gamedata_1.GameData.getVar("policy3").cost.toString(), { align: "center", wordWrap: true, wordWrapWidth: 100 });
        _this.add(_this.policy3button);
        _this.policy3button.x = _this._horizontal_margin + 10;
        _this.policy3button.addChild(_this.policy3buttontext);
        _this.policy3buttontext.x = _this.policy3button.width / 2 - _this.policy3buttontext.width / 2;
        _this.policy3buttontext.y = _this.policy3button.height / 2 - _this.policy3buttontext.height / 2;
        var policy3Explanation = new Phaser.Text(game, 0, 0, "Encourage growth: Purchase advertising. Growth rates and water consumption increase by  " + (gamedata_1.GameData.getVar("policy3").percent * 100).toString() + "% for " + (gamedata_1.GameData.getVar("policy1").duration).toString() + " seconds.", { align: "left", wordWrap: true, wordWrapWidth: 500 });
        policy3Explanation.fontSize = 18;
        _this.policy3button.addChild(policy3Explanation);
        policy3Explanation.x = _this.policy3button.width + 10;
        //create close button
        var close = game.add.text(game.width - _this._horizontal_margin - 40, _this._vertical_margin, "×", {
            fontSize: 48
        });
        close.inputEnabled = true;
        close.input.useHandCursor = true;
        close.events.onInputUp.add(_this.Close, _this);
        _this.add(close);
        _this.visible = false;
        return _this;
    }
    PolicyMenu.prototype.Policy1Click = function () {
        if (!this._game_logic.policy1Active && this._game_logic._world.game_money >= gamedata_1.GameData.getVar("policy1").cost) {
            this._game_logic._world.game_money -= gamedata_1.GameData.getVar("policy1").cost;
            this._game_logic.ActivatePolicy1();
        }
        this.Open();
    };
    PolicyMenu.prototype.Policy3Click = function () {
        if (!this._game_logic.policy3Active && this._game_logic._world.game_money >= gamedata_1.GameData.getVar("policy3").cost) {
            this._game_logic._world.game_money -= gamedata_1.GameData.getVar("policy3").cost;
            this._game_logic.ActivatePolicy3();
        }
        this.Open();
    };
    PolicyMenu.prototype.Policy2Click = function () {
        this._game_logic.TogglePolicy2();
        this.Open();
    };
    PolicyMenu.prototype.Open = function () {
        this.visible = true;
        this._game_logic.Pause();
        // If a policy is on, make its button display duration
        if (this._game_logic.policy1Active) {
            this.policy1buttontext.text = Math.floor(this._game_logic.policy1TimeLeft / 60).toString();
        }
        else {
            this.policy1buttontext.text = "$" + gamedata_1.GameData.getVar("policy1").cost.toString();
        }
        if (this._game_logic.policy3Active) {
            this.policy3buttontext.text = Math.floor(this._game_logic.policy3TimeLeft / 60).toString();
        }
        else {
            this.policy3buttontext.text = "$" + gamedata_1.GameData.getVar("policy3").cost.toString();
        }
        if (this._game_logic.policy2Active) {
            this.policy2buttontext.text = "On";
        }
        else {
            this.policy2buttontext.text = "Off";
        }
        this.policy1buttontext.x = this.policy1button.width / 2 - this.policy1buttontext.width / 2;
        this.policy1buttontext.y = this.policy1button.height / 2 - this.policy1buttontext.height / 2;
        this.policy2buttontext.x = this.policy2button.width / 2 - this.policy2buttontext.width / 2;
        this.policy2buttontext.y = this.policy2button.height / 2 - this.policy2buttontext.height / 2;
        this.policy3buttontext.x = this.policy3button.width / 2 - this.policy3buttontext.width / 2;
        this.policy3buttontext.y = this.policy3button.height / 2 - this.policy3buttontext.height / 2;
        if (this._game_logic.policy1Active || this._game_logic._world.game_money < gamedata_1.GameData.getVar("policy1").cost) {
            this.policy1button.tint = 0xC0C0C0;
        }
        else {
            this.policy1button.tint = 0xFFFFFF;
        }
        if (this._game_logic.policy3Active || this._game_logic._world.game_money < gamedata_1.GameData.getVar("policy3").cost) {
            this.policy3button.tint = 0xC0C0C0;
        }
        else {
            this.policy3button.tint = 0xFFFFFF;
        }
        if (this._game_logic.policy2Active) {
            this.policy2button.tint = 0xC0C0C0;
        }
        else {
            this.policy2button.tint = 0xFFFFFF;
        }
    };
    PolicyMenu.prototype.Close = function () {
        this.visible = false;
        this._game_logic.UnPause();
    };
    PolicyMenu.prototype.GetPolicy = function () {
        var return_obj = {};
        for (var i = 0; i < this._policy_buttons.length; i++) {
            if (this._policy_buttons[i].is_selected) {
                return_obj['id'] = this._policy_buttons[i].id;
                if (return_obj['id'] != "no_policy") {
                    var temp_percent = this._policy_buttons[i].percent;
                    if (return_obj['id'] == 'policy1') {
                        return_obj['water_cost_change'] = temp_percent;
                        return_obj['population_modifier'] = -(temp_percent * 2);
                    }
                    else {
                        return_obj['water_cost_change'] = -temp_percent;
                        return_obj['population_modifier'] = temp_percent / 5;
                    }
                }
            }
        }
        return return_obj;
    };
    return PolicyMenu;
}(Phaser.Group));
exports.PolicyMenu = PolicyMenu;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/16/17.
 */
var base_tile_1 = __webpack_require__(0);
var tiledata_1 = __webpack_require__(1);
var AgriculturalTile = (function (_super) {
    __extends(AgriculturalTile, _super);
    function AgriculturalTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this._base_sprite.destroy();
        var data = tiledata_1.TileData.getTile("AgriculturalTile");
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this.game_logic._world_group.add(_this._base_sprite);
        _this._create_animation = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), "create_anims", "res_10000");
        _this._create_animation.anchor = new Phaser.Point(0.5, 0.5);
        _this._create_animation.width = 80;
        _this._create_animation.height = 60;
        _this._create_animation.animations.add("create", ["agr_10000", "agr_10001", "agr_10002", "agr_10003", "agr_10004", "agr_10005", "agr_10006", "agr_10007", "agr_10008", "agr_10009", "agr_10010", "agr_10011", "agr_10012", "agr_10013", "agr_10014", "agr_10015", "agr_10016", "agr_10017", "agr_10018", "agr_10019", "agr_10020", "agr_10021", "agr_10022"], 30, false);
        _this.game_logic._world_group.add(_this._base_sprite);
        _this._base_sprite.visible = false;
        _this.game_logic._world_group.add(_this._create_animation);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 60;
        _this._create_animation.animations.play("create");
        return _this;
    }
    AgriculturalTile.prototype.Destroy = function () {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
        this._create_animation.destroy(true);
    };
    AgriculturalTile.prototype.UpdateAppearance = function () {
        var increments = this.max_population / 3;
        var _x = this._base_sprite.x;
        var _y = this._base_sprite.y;
        var changed = false;
        var data = tiledata_1.TileData.getTile("AgriculturalTile");
        if (this.current_population <= increments) {
            if (this._frame_name != data.frame) {
                changed = true;
                this._frame_name = data.frame;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame);
            }
        }
        else if (this.current_population <= increments * 2) {
            if (this._frame_name != data.frame1) {
                changed = true;
                this._frame_name = data.frame1;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame1);
            }
        }
        else {
            if (this._frame_name != data.frame2) {
                changed = true;
                this._frame_name = data.frame2;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame2);
            }
        }
        if (changed) {
            this._create_animation.visible = false;
            this._base_sprite.visible = true;
            this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
            this.game_logic._world_group.add(this._base_sprite);
            this._base_sprite.width = 80;
            this._base_sprite.height = 60;
        }
    };
    return AgriculturalTile;
}(base_tile_1.BaseTile));
exports.AgriculturalTile = AgriculturalTile;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/14/17.
 */
var base_tile_1 = __webpack_require__(0);
var AquiferTile = (function (_super) {
    __extends(AquiferTile, _super);
    function AquiferTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this._base_sprite.destroy();
        _this._touch_sprite.destroy();
        _this._foreground = _this.game_logic.game.add.sprite(0, 0, "aquifer_foreground");
        var x_pos = 530;
        var y_pos = 600 - _this._foreground.height;
        _this.game_logic._world_group.add(_this._foreground);
        _this._foreground.x = x_pos;
        _this._foreground.y = _this._foreground_start_pos = y_pos;
        _this._mask = _this.game_logic.game.add.graphics(0, 0);
        _this.game_logic._world_group.add(_this._mask);
        //	Shapes drawn to the Graphics object must be filled.
        _this._mask.beginFill(0xffffff);
        //	Here we'll draw a circle
        // you can also use rectangle... for the mask shape.
        // see this example https://phaser.io/examples/v2/sprites/mask
        var poly = new Phaser.Polygon([new Phaser.Point(530, 541), new Phaser.Point(711, 450), new Phaser.Point(711, 544), new Phaser.Point(530, 631)]);
        //this._mask.drawPolygon( poly );
        _this._mask.endFill();
        //this._foreground.mask = this._mask;
        var ellipse = new Phaser.Ellipse(620, 541, 181, 90);
        _this._test = _this.game_logic.game.add.graphics(620, 541);
        _this._test.angle = -25;
        _this._test.beginFill(0xffffff);
        _this._test.drawEllipse(0, 0, 90, 45);
        _this._test.endFill();
        _this._foreground.mask = _this._test;
        return _this;
    }
    AquiferTile.prototype.SetPosition = function () {
        var _possible_distance = 550 - this._foreground_start_pos;
        var _percent_unfilled = (this.max_water_storage - this.current_water_storage) / this.max_water_storage;
        this._foreground.y = this._foreground_start_pos + (_possible_distance * _percent_unfilled);
    };
    return AquiferTile;
}(base_tile_1.BaseTile));
exports.AquiferTile = AquiferTile;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/16/17.
 */
var base_tile_1 = __webpack_require__(0);
var tiledata_1 = __webpack_require__(1);
var IndustrialTile = (function (_super) {
    __extends(IndustrialTile, _super);
    function IndustrialTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this._base_sprite.destroy();
        var data = tiledata_1.TileData.getTile("IndustrialTile");
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this.game_logic._world_group.add(_this._base_sprite);
        _this._create_animation = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), "create_anims", "res_10000");
        _this._create_animation.anchor = new Phaser.Point(0.5, 0.5);
        _this._create_animation.width = 80;
        _this._create_animation.height = 60;
        _this._create_animation.animations.add("create", ["ind_10000", "ind_10001", "ind_10002", "ind_10003", "ind_10004", "ind_10005", "ind_10006", "ind_10007", "ind_10008", "ind_10009"], 30, false);
        _this.game_logic._world_group.add(_this._base_sprite);
        _this._base_sprite.visible = false;
        _this.game_logic._world_group.add(_this._create_animation);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 60;
        _this._create_animation.animations.play("create");
        return _this;
    }
    IndustrialTile.prototype.Destroy = function () {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
        this._create_animation.destroy(true);
    };
    IndustrialTile.prototype.UpdateAppearance = function () {
        var increments = this.max_population / 3;
        var _x = this._base_sprite.x;
        var _y = this._base_sprite.y;
        var changed = false;
        var data = tiledata_1.TileData.getTile("IndustrialTile");
        if (this.current_population <= increments) {
            if (this._frame_name != data.frame) {
                changed = true;
                this._frame_name = data.frame;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame);
            }
        }
        else if (this.current_population <= increments * 2) {
            if (this._frame_name != data.frame1) {
                changed = true;
                this._frame_name = data.frame1;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame1);
            }
        }
        else {
            if (this._frame_name != data.frame2) {
                changed = true;
                this._frame_name = data.frame2;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame2);
            }
        }
        if (changed) {
            this._create_animation.visible = false;
            this._base_sprite.visible = true;
            this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
            this.game_logic._world_group.add(this._base_sprite);
            this._base_sprite.width = 80;
            this._base_sprite.height = 60;
        }
    };
    return IndustrialTile;
}(base_tile_1.BaseTile));
exports.IndustrialTile = IndustrialTile;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/16/17.
 */
var base_tile_1 = __webpack_require__(0);
var LakeSourceTile = (function (_super) {
    __extends(LakeSourceTile, _super);
    function LakeSourceTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this.Disable();
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 40;
        // Now tiles can get input, so we know if we are over them or not
        _this._base_sprite.inputEnabled = false;
        return _this;
    }
    return LakeSourceTile;
}(base_tile_1.BaseTile));
exports.LakeSourceTile = LakeSourceTile;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/14/17.
 */
var base_tile_1 = __webpack_require__(0);
var LakeTile = (function (_super) {
    __extends(LakeTile, _super);
    function LakeTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this.Disable();
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 40;
        // Now tiles can get input, so we know if we are over them or not
        _this._base_sprite.inputEnabled = false;
        _this._highlight_sprite.visible = true;
        _this._highlight_sprite.alpha = 0;
        _this._highlight_sprite.tint = 0x83AB2C;
        return _this;
    }
    LakeTile.prototype.SetTint = function () {
        //let temp:number = .7 - this.current_quality;
        //this._highlight_sprite.alpha = temp;
    };
    return LakeTile;
}(base_tile_1.BaseTile));
exports.LakeTile = LakeTile;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/16/17.
 */
var base_tile_1 = __webpack_require__(0);
var world_1 = __webpack_require__(4);
var tiledata_1 = __webpack_require__(1);
var PipeTile = (function (_super) {
    __extends(PipeTile, _super);
    function PipeTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this._base_sprite.destroy();
        var data = tiledata_1.TileData.getTile("PipeTile");
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this.game_logic._world_group.add(_this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 40;
        return _this;
    }
    PipeTile.prototype.Update = function () {
        var pipe_id = 0;
        var tiles = this.game_logic.GetNeighborTilesFrom(this._x, this._y);
        // Find what's connectible and bit shift it, this gives us something in the range of 0000 - 1111
        for (var dir = world_1.World.NORTH; dir <= world_1.World.WEST; dir++) {
            if (tiles[dir] != null && tiles[dir].connectible) {
                // Shift it one
                var add = dir - 1;
                if (add < world_1.World.NORTH) {
                    add = world_1.World.WEST;
                }
                pipe_id |= (1 << add);
            }
        }
        var pipe_name = "";
        if (pipe_id != 0) {
            pipe_name = (pipe_id >>> 0).toString(2);
            while (pipe_name.length < 4) {
                pipe_name = "0" + pipe_name;
            }
            pipe_name = "piping/" + pipe_name;
        }
        else {
            pipe_name = "piping/0001";
        }
        if (pipe_name != this._base_sprite.key) {
            this.current_tint = 0xffffff;
            this._base_sprite.destroy();
            this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), 'watergame', pipe_name);
            this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
            this.game_logic._world_group.add(this._base_sprite);
            // Setting this because the individual tiles might be much larger than display size
            this._base_sprite.width = 80;
            this._base_sprite.height = 60;
        }
        this.SetTint();
    };
    return PipeTile;
}(base_tile_1.BaseTile));
exports.PipeTile = PipeTile;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/13/17.
 */
var base_tile_1 = __webpack_require__(0);
var tiledata_1 = __webpack_require__(1);
var ResidentialTile = (function (_super) {
    __extends(ResidentialTile, _super);
    function ResidentialTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this._base_sprite.destroy();
        var data = tiledata_1.TileData.getTile("ResidentialTile");
        _this._frame_name = data.frame;
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this._create_animation = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), "create_anims", "res_10000");
        _this._create_animation.anchor = new Phaser.Point(0.5, 0.5);
        _this._create_animation.width = 80;
        _this._create_animation.height = 60;
        _this._create_animation.animations.add("create", ["res_10000", "res_10001", "res_10002", "res_10003", "res_10004", "res_10005", "res_10006", "res_10007", "res_10008", "res_10009"], 30, false);
        _this.game_logic._world_group.add(_this._base_sprite);
        _this._base_sprite.visible = false;
        _this.game_logic._world_group.add(_this._create_animation);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 60;
        _this._create_animation.animations.play("create");
        return _this;
    }
    ResidentialTile.prototype.Destroy = function () {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
        this._create_animation.destroy(true);
    };
    ResidentialTile.prototype.UpdateAppearance = function () {
        var increments = this.max_population / 3;
        var _x = this._base_sprite.x;
        var _y = this._base_sprite.y;
        var changed = false;
        var data = tiledata_1.TileData.getTile("ResidentialTile");
        if (this.current_population <= increments) {
            if (this._frame_name != data.frame) {
                changed = true;
                this._frame_name = data.frame;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame);
            }
        }
        else if (this.current_population <= increments * 2) {
            if (this._frame_name != data.frame1) {
                changed = true;
                this._frame_name = data.frame1;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame1);
            }
        }
        else {
            if (this._frame_name != data.frame2) {
                changed = true;
                this._frame_name = data.frame2;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame2);
            }
        }
        if (changed) {
            this._create_animation.visible = false;
            this._base_sprite.visible = true;
            this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
            this.game_logic._world_group.add(this._base_sprite);
            this._base_sprite.width = 80;
            this._base_sprite.height = 60;
        }
    };
    return ResidentialTile;
}(base_tile_1.BaseTile));
exports.ResidentialTile = ResidentialTile;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/13/17.
 */
var base_tile_1 = __webpack_require__(0);
var tiledata_1 = __webpack_require__(1);
var world_1 = __webpack_require__(4);
var SourceTile = (function (_super) {
    __extends(SourceTile, _super);
    function SourceTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this.output_units = 0;
        _this.output_quality = 0;
        _this._base_sprite.destroy();
        var data = tiledata_1.TileData.getTile("SourceTile");
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this.game_logic._world_group.add(_this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 40;
        _this.game_logic._world.sources.push(_this);
        return _this;
    }
    SourceTile.prototype.Destroy = function () {
        var idx = this.game_logic._world.sources.indexOf(this);
        this.game_logic._world.sources.splice(idx, 1);
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
    };
    SourceTile.prototype.Update = function () {
        // if we are over a lake, update the following...
        if (this.game_logic._world.lakes[this._x][this._y].name == "lake") {
            var pipe_id = 0;
            var tiles = this.game_logic.GetNeighborTilesFrom(this._x, this._y);
            // Find what's connectible and bit shift it, this gives us something in the range of 0000 - 1111
            for (var dir = world_1.World.NORTH; dir <= world_1.World.WEST; dir++) {
                if (tiles[dir] != null && tiles[dir].connectible) {
                    // Shift it one
                    var add = dir - 1;
                    if (add < world_1.World.NORTH) {
                        add = world_1.World.WEST;
                    }
                    pipe_id |= (1 << add);
                }
            }
            var pipe_name = "";
            if (pipe_id != 0) {
                pipe_name = (pipe_id >>> 0).toString(2);
                while (pipe_name.length < 4) {
                    pipe_name = "0" + pipe_name;
                }
                pipe_name = "piping_source/" + pipe_name;
            }
            else {
                pipe_name = "piping_source/0001";
            }
            //console.log(pipe_name);
            if (pipe_name != this._base_sprite.key) {
                this.current_tint = 0xffffff;
                this._base_sprite.destroy();
                this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), 'watergame', pipe_name);
                this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
                this.game_logic._world_group.add(this._base_sprite);
                // Setting this because the individual tiles might be much larger than display size
                this._base_sprite.width = 80;
                this._base_sprite.height = 60;
            }
            this.SetTint();
        }
    };
    return SourceTile;
}(base_tile_1.BaseTile));
exports.SourceTile = SourceTile;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/16/17.
 */
var base_tile_1 = __webpack_require__(0);
var tiledata_1 = __webpack_require__(1);
var TreatmentTile = (function (_super) {
    __extends(TreatmentTile, _super);
    function TreatmentTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this.types = [];
        _this._base_sprite.destroy();
        var data = tiledata_1.TileData.getTile("TreatmentTile");
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this.game_logic._world_group.add(_this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 60;
        return _this;
        //this.SetTreatment("coagulation");
        // this.SetTreatment("filtration");
        //this.SetTreatment("disinfection");
    }
    TreatmentTile.prototype.GetTypesString = function () {
        var temp = " ";
        for (var i = 0; i < this.types.length; i++) {
            temp += this.types[i];
            temp += " ";
        }
        return temp;
    };
    TreatmentTile.prototype.Destroy = function () {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
        if (this._coagulation_sprite != null) {
            this._coagulation_sprite.destroy(true);
        }
        if (this._disinfection_sprite != null) {
            this._disinfection_sprite.destroy(true);
        }
        if (this._filtration_sprite != null) {
            this._filtration_sprite.destroy(true);
        }
    };
    TreatmentTile.prototype.SetTreatment = function (type) {
        if (this.types.indexOf(type) == -1) {
            this.types.push(type);
            switch (type) {
                case "coagulation":
                    // this.treatment_modifier += this.upgrades["coagulation"].treatment_modifier;
                    this._coagulation_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), this.upgrades["coagulation"].sprite_sheet, this.upgrades["coagulation"].frame);
                    this._coagulation_sprite.anchor = new Phaser.Point(0.5, 0.5);
                    this._coagulation_sprite.width = 80;
                    this._coagulation_sprite.height = 60;
                    break;
                case "filtration":
                    this.treatment_modifier += this.upgrades["filtration"].treatment_modifier;
                    this._filtration_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), this.upgrades["filtration"].sprite_sheet, this.upgrades["filtration"].frame);
                    this._filtration_sprite.anchor = new Phaser.Point(0.5, 0.5);
                    this._filtration_sprite.width = 80;
                    this._filtration_sprite.height = 60;
                    break;
                case "disinfection":
                    this.treatment_modifier += this.upgrades["disinfection"].treatment_modifier;
                    this._disinfection_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), this.upgrades["disinfection"].sprite_sheet, this.upgrades["disinfection"].frame);
                    this._disinfection_sprite.anchor = new Phaser.Point(0.5, 0.5);
                    this._disinfection_sprite.width = 80;
                    this._disinfection_sprite.height = 60;
                    break;
            }
        }
        console.log(this.treatment_modifier);
    };
    return TreatmentTile;
}(base_tile_1.BaseTile));
exports.TreatmentTile = TreatmentTile;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/16/17.
 */
var base_tile_1 = __webpack_require__(0);
var tiledata_1 = __webpack_require__(1);
var WasteWaterTreatmentTile = (function (_super) {
    __extends(WasteWaterTreatmentTile, _super);
    function WasteWaterTreatmentTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this.types = [];
        _this._base_sprite.destroy();
        var data = tiledata_1.TileData.getTile("WasteWaterTreatmentTile");
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this.game_logic._world_group.add(_this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 60;
        return _this;
        //this.SetTreatment("primary");
        //this.SetTreatment("secondary");
        //this.SetTreatment("tertiary");
    }
    WasteWaterTreatmentTile.prototype.Destroy = function () {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
        if (this._primary_sprite != null) {
            this._primary_sprite.destroy(true);
        }
        if (this._secondary_sprite != null) {
            this._secondary_sprite.destroy(true);
        }
        if (this._tertiary_sprite != null) {
            this._tertiary_sprite.destroy(true);
        }
    };
    WasteWaterTreatmentTile.prototype.GetTypesString = function () {
        var temp = " ";
        for (var i = 0; i < this.types.length; i++) {
            temp += this.types[i];
            temp += " ";
        }
        return temp;
    };
    WasteWaterTreatmentTile.prototype.SetTreatment = function (type) {
        if (this.types.indexOf(type) == -1) {
            this.types.push(type);
            switch (type) {
                case "primary":
                    //let c_data = TileData.getTile("primary");
                    //this.treatment_modifier += this.upgrades["primary"].treatment_modifier;
                    this._primary_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), this.upgrades["primary"].sprite_sheet, this.upgrades["primary"].frame);
                    this._primary_sprite.anchor = new Phaser.Point(0.5, 0.5);
                    this._primary_sprite.width = 80;
                    this._primary_sprite.height = 60;
                    break;
                case "secondary":
                    //let f_data = TileData.getTile("secondary");
                    //this.treatment_modifier += this.upgrades["secondary"].treatment_modifier;
                    this._secondary_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), this.upgrades["secondary"].sprite_sheet, this.upgrades["secondary"].frame);
                    this._secondary_sprite.anchor = new Phaser.Point(0.5, 0.5);
                    this._secondary_sprite.width = 80;
                    this._secondary_sprite.height = 60;
                    break;
                case "tertiary":
                    //let d_data = TileData.getTile("tertiary");
                    //this.treatment_modifier += this.upgrades["tertiary"].treatment_modifier;
                    this._tertiary_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(this._x, this._y), this.DeriveGridY(this._x, this._y), this.upgrades["tertiary"].sprite_sheet, this.upgrades["tertiary"].frame);
                    this._tertiary_sprite.anchor = new Phaser.Point(0.5, 0.5);
                    this._tertiary_sprite.width = 80;
                    this._tertiary_sprite.height = 60;
                    break;
            }
        }
    };
    return WasteWaterTreatmentTile;
}(base_tile_1.BaseTile));
exports.WasteWaterTreatmentTile = WasteWaterTreatmentTile;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by nathanmishler on 2/16/17.
 */
var base_tile_1 = __webpack_require__(0);
var tiledata_1 = __webpack_require__(1);
var WatertowerTile = (function (_super) {
    __extends(WatertowerTile, _super);
    function WatertowerTile(_game, x, y) {
        var _this = _super.call(this, _game, x, y) || this;
        _this._base_sprite.destroy(true);
        var data = tiledata_1.TileData.getTile("WatertowerTile");
        _this._base_sprite = _this.game_logic.game.add.sprite(_this.DeriveGridX(x, y), _this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        _this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        _this.game_logic._world_group.add(_this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        _this._base_sprite.width = 80;
        _this._base_sprite.height = 60;
        return _this;
    }
    return WatertowerTile;
}(base_tile_1.BaseTile));
exports.WatertowerTile = WatertowerTile;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConstructionButton = (function (_super) {
    __extends(ConstructionButton, _super);
    function ConstructionButton(game, x, y, item_data) {
        var _this = _super.call(this, game, x, y, item_data["sheet"], item_data["frame"]) || this;
        _this.enabled = true;
        _this.item_data = item_data;
        return _this;
    }
    ConstructionButton.prototype.enable = function (callback, context) {
        this.enabled = true;
        this.events.onInputDown.add(callback, context, 10, this.item_data["type"]);
        this.tint = 0xFFFFFF;
    };
    ConstructionButton.prototype.disable = function () {
        this.enabled = false;
        this.events.onInputDown.removeAll();
        this.tint = 0x999999;
    };
    return ConstructionButton;
}(Phaser.Sprite));
exports.ConstructionButton = ConstructionButton;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var construction_button_1 = __webpack_require__(25);
var ConstructionMenu = (function (_super) {
    __extends(ConstructionMenu, _super);
    // _main_menu:Phaser.Sprite[];
    // _sub_menu_is:Phaser.Sprite[];
    // _sub_menu_wt:Phaser.Sprite[];
    // _sub_menu_ww:Phaser.Sprite[];
    function ConstructionMenu(_game, x, y) {
        var _this = _super.call(this, _game.game) || this;
        _this.game_logic = _game;
        _this._menu_data = _this.game.cache.getJSON("construction_menu_data");
        _this._menu_buttons = [];
        // Keeping track of menus here
        //this._main_menu = [];
        //this._sub_menu_is = [];
        //this._sub_menu_wt = [];
        //this._sub_menu_ww = [];
        _this._x = x;
        _this._y = y;
        _this._grid_x = 0;
        _this._grid_y = 0;
        _this.createMenu();
        _this.Hide();
        return _this;
    }
    ConstructionMenu.prototype.createMenu = function () {
        for (var i = 0; i < this._menu_data["main_menu"].length; i++) {
            var item_data = this._menu_data["main_menu"][i];
            this.addMainMenuItem(item_data);
        }
        this.ArraySprites(this.children);
    };
    // Create a main menu item, and associated submenus
    ConstructionMenu.prototype.addMainMenuItem = function (item_data) {
        var _this = this;
        // Create sprite
        var sprite = new construction_button_1.ConstructionButton(this.game, 0, 0, item_data);
        sprite.anchor = new Phaser.Point(0.5, 0.5);
        this._menu_buttons.push(sprite);
        this.add(sprite);
        // Events
        sprite.inputEnabled = true;
        // Handle whether button opens a submenu or creates a tile
        if (item_data["submenu"]) {
            // if it has a submenu, create the submenu
            this.createSubmenu(sprite, item_data["hover_text"]);
            sprite.events.onInputDown.add(function () {
                _this.HideSubMenus();
                sprite.children[0].visible = true;
            });
        }
        else {
            sprite.events.onInputDown.add(function () {
                _this.game_logic._world.CreateAt(item_data["type"], _this._grid_x, _this._grid_y);
                _this.Hide();
            }, this, 0);
        }
        //sprite.events.onInputOver.add(()=>{this.game_logic.UI.notification.showMessage(formatted_text);});
        sprite.events.onInputOver.add(this.ShowItemCost, this, 10, item_data["type"], item_data["hover_text"]);
        sprite.events.onInputOut.add(function () { _this.game_logic.UI.notification.hideMessage(); });
    };
    ConstructionMenu.prototype.createSubmenu = function (parent, key) {
        // Get submenu data
        var submenu_items = this._menu_data["sub_menus"][key];
        // Create group to hold buttons
        var submenu = this.game.add.group();
        parent.addChild(submenu);
        // Create and add buttons
        for (var sub_key in submenu_items) {
            if (submenu_items.hasOwnProperty(sub_key)) {
                var sub_item = submenu_items[sub_key];
                this.addSubMenuItem(submenu, sub_item);
            }
        }
        submenu.visible = false;
    };
    // Add button to given submenu
    ConstructionMenu.prototype.addSubMenuItem = function (submenu, item_data) {
        var _this = this;
        // Create sprite
        var sprite = new construction_button_1.ConstructionButton(this.game, 0, 0, item_data);
        sprite.anchor = new Phaser.Point(0.5, 0.5);
        this._menu_buttons.push(sprite);
        submenu.add(sprite);
        // Events
        sprite.inputEnabled = true;
        sprite.input.priorityID = 10;
        sprite.events.onInputDown.add(function () {
            _this.game_logic._world.CreateAt(item_data["type"], _this._grid_x, _this._grid_y);
            _this.Hide();
        }, this, 0);
        sprite.events.onInputOver.add(this.ShowItemCost, this, 10, item_data["type"], item_data["hover_text"]);
        sprite.events.onInputOut.add(function () { _this.game_logic.UI.notification.hideMessage(); });
    };
    // Array the main sprites in a circle.
    ConstructionMenu.prototype.ArraySprites = function (sprites) {
        var angle = 0;
        var radius = 60;
        var step = (2 * Math.PI) / sprites.length;
        for (var i = 0; i < sprites.length; i++) {
            var new_XY = this.GetNextXY(radius, angle);
            sprites[i].x = new_XY[0];
            sprites[i].y = new_XY[1];
            sprites[i].visible = true;
            angle += step;
            var current_sprite = sprites[i];
            if (current_sprite.children[0]) {
                this.ArraySubmenu(current_sprite.children[0], i);
            }
        }
    };
    ConstructionMenu.prototype.ArraySubmenu = function (submenu, array_position) {
        var parent_angle = (2 * Math.PI) / 7 * array_position; // angle of the parent in the radial submenu
        var angle = 0;
        var radius = 45; // Distance from parent button
        var step = (2 * Math.PI) / 8; // Distance between submenu items, in radians
        angle += parent_angle - (step * (submenu.children.length / 2 - 0.5));
        for (var i = 0; i < submenu.children.length; i++) {
            var new_XY = this.GetNextXY(radius, angle);
            submenu.children[i].x = new_XY[0];
            submenu.children[i].y = new_XY[1];
            submenu.children[i].visible = true;
            angle += step;
        }
    };
    ConstructionMenu.prototype.HideSubMenus = function () {
        for (var i = 0; i < this.children.length; i++) {
            var sprite = this.children[i];
            if (sprite.children[0]) {
                sprite.children[0].visible = false;
            }
        }
    };
    ConstructionMenu.prototype.GetNextXY = function (radius, angle) {
        return [((radius) * Math.cos(angle)), ((radius) * Math.sin(angle))];
    };
    // Hide it when it isn't in use
    ConstructionMenu.prototype.Hide = function () {
        this.visible = false;
        // So that we can open and close on the same tile
        this._x = -1000;
        this._y = -1000;
    };
    // Show this menu on a specific pixel
    ConstructionMenu.prototype.Show = function (x, y, grid_x, grid_y) {
        var min_x = 100;
        var max_x = 700;
        var min_y = 0;
        var max_y = 500;
        var clamp_x = clamp(x, min_x, max_x);
        var clamp_y = clamp(y, min_y, max_y);
        if (this._x != clamp_x || this._y != clamp_y) {
            this._x = clamp_x;
            this._y = clamp_y;
            this._grid_x = grid_x;
            this._grid_y = grid_y;
            this.visible = true;
            this.x = clamp_x;
            this.y = clamp_y;
            this.HideSubMenus();
            this.ArraySprites(this.children);
            this.updateButtons(this.game_logic._world.game_money);
        }
        else {
            this.Hide();
        }
        function clamp(num, min, max) {
            return Math.min(Math.max(num, min), max);
        }
    };
    ConstructionMenu.prototype.ShowItemCost = function (obj, pointer, type, prepend) {
        if (prepend === void 0) { prepend = ""; }
        //console.log(type);
        if (type) {
            var cost = this.game_logic.GetCostForUpgradeAtTile(type, this._grid_x, this._grid_y);
            //console.log(cost);
            if (cost) {
                this.game_logic.UI.notification.showMessage(prepend + ": $" + cost.toString());
            }
            else {
                this.game_logic.UI.notification.showMessage(prepend);
            }
        }
        else {
            this.game_logic.UI.notification.showMessage(prepend);
        }
    };
    ConstructionMenu.prototype.createTile = function (button, Pointer, tile_type) {
        //console.log(tile_type);
        this.game_logic._world.CreateAt(tile_type, this._grid_x, this._grid_y);
        this.Hide();
    };
    // Sets active/disabled state of each button in the menu, based on affordability
    // This should disable buttons based on the base tile...
    // TODO: If we are over a lake, disable everything but pipes and the source tile
    // TODO: If we are over a Waste Water or Treatment tile, disable everything but them
    ConstructionMenu.prototype.updateButtons = function (current_money) {
        var _this = this;
        if (this.visible) {
            var tile_name = this.game_logic._world.tiles[this._grid_x][this._grid_y].name;
            var lake_tile_name = this.game_logic._world.lakes[this._grid_x][this._grid_y].name;
            var _loop_1 = function (i) {
                var button = this_1._menu_buttons[i];
                var allowed = true;
                if (!button.item_data["submenu"]) {
                    var cost = this_1.game_logic.GetCostForUpgradeAtTile(button.item_data["type"], this_1._grid_x, this_1._grid_y);
                    // Check, are we over a lake? Then check if a button is a pipe or the water sub menu
                    if (lake_tile_name != "empty") {
                        if (button.item_data["type"] != 'pipe' && button.item_data["type"] != "source") {
                            allowed = false;
                        }
                    }
                    if ((cost > current_money && button.enabled) || (!allowed && button.enabled)) {
                        button.disable();
                    }
                    else if (cost <= current_money && !button.enabled && allowed) {
                        button.enable(this_1.createTile, this_1);
                    }
                }
                else {
                    if (lake_tile_name != "empty") {
                        if (button.item_data["hover_text"] != 'Potable Water') {
                            allowed = false;
                        }
                    }
                    if (!allowed) {
                        button.disable();
                    }
                    else if (allowed && !button.enabled) {
                        button.enable(function () {
                            _this.HideSubMenus();
                            button.children[0].visible = true;
                        }, this_1);
                    }
                }
            };
            var this_1 = this;
            for (var i = 0; i < this._menu_buttons.length; i++) {
                _loop_1(i);
            }
        }
    };
    return ConstructionMenu;
}(Phaser.Group));
exports.ConstructionMenu = ConstructionMenu;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by nathanmishler on 2/7/18.
 */
/**
 * Created by nathanmishler on 2/6/18.
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DeleteButton = (function (_super) {
    __extends(DeleteButton, _super);
    function DeleteButton(game, logic) {
        var _this = _super.call(this, game) || this;
        _this._game = game;
        _this.game_logic = logic;
        _this._on = new Phaser.Image(game, 100, 500, "delete_on");
        _this._on.inputEnabled = true;
        _this._on.visible = false;
        _this.add(_this._on);
        _this._off = new Phaser.Image(game, 100, 500, "delete_off");
        _this._off.inputEnabled = true;
        _this._off.visible = true;
        _this.add(_this._off);
        game.input.onDown.add(_this.Clicked, _this);
        return _this;
    }
    DeleteButton.prototype.GetIsDeleteMode = function () {
        return this._on.visible;
    };
    DeleteButton.prototype.Clicked = function () {
        if (this._on.input.pointerOver() || this._off.input.pointerOver()) {
            this._on.visible = !this._on.visible;
            this._off.visible = !this._off.visible;
            if (this._off.visible) {
                this.game_logic.EndDeleteMode();
            }
            else {
                this.game_logic.StartDeleteMode();
            }
        }
    };
    DeleteButton.prototype.TurnOff = function () {
        this._on.visible = false;
        this._off.visible = true;
        this.game_logic.EndDeleteMode();
    };
    return DeleteButton;
}(Phaser.Group));
exports.DeleteButton = DeleteButton;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by nathanmishler on 2/7/18.
 */
/**
 * Created by nathanmishler on 2/6/18.
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HomeButton = (function (_super) {
    __extends(HomeButton, _super);
    function HomeButton(game, logic) {
        var _this = _super.call(this, game) || this;
        _this.game_logic = logic;
        // Create button
        _this.home_button = _this.game.add.button(_this.game.world.width - 100, _this.game.world.height - 95, "watergame", function () { _this.Clicked(); }, _this, null, "home_icon");
        _this.add(_this.home_button);
        // Create modal
        _this._text = new Phaser.Text(game, _this.game.width / 2, _this.game.height / 2, "Quit and return to Main Menu?", { font: "20px sans-serif", wordWrap: false });
        _this._text.x = _this._text.x - _this._text.width / 2;
        _this._graphics = new Phaser.Graphics(game, _this._text.x - 10, _this._text.y - _this._text.height / 2);
        _this._graphics.clear();
        _this._graphics.beginFill(0xffffff);
        _this._graphics.drawRoundedRect(0, 0, _this._text.width + 20, _this._text.height + 20, 15);
        _this.yes_button = _this.game.add.button(_this._text.x + 30, _this._text.y + _this._text.height - 5, "yes_button", function () { _this.YesClicked(); }, _this, null);
        _this.no_button = _this.game.add.button(_this._text.x + 160, _this._text.y + _this._text.height - 5, "no_button", function () { _this.NoClicked(); }, _this, null);
        _this._modal_group = game.add.group();
        _this._modal_group.add(_this._graphics);
        _this._modal_group.add(_this._text);
        _this._modal_group.add(_this.yes_button);
        _this._modal_group.add(_this.no_button);
        _this._modal_group.visible = false;
        return _this;
    }
    Object.defineProperty(HomeButton.prototype, "modal_visible", {
        get: function () {
            return this._modal_group.visible;
        },
        enumerable: true,
        configurable: true
    });
    HomeButton.prototype.Clicked = function () {
        this._modal_group.visible = true;
        this.game_logic.Pause();
    };
    HomeButton.prototype.YesClicked = function () {
        this.game.state.start("MainMenu", true, false);
    };
    HomeButton.prototype.NoClicked = function () {
        this._modal_group.visible = false;
        // this._graphics.visible = false;
        // this._text.visible = false;
        // this.yes_button.visible = false;
        // this.no_button.visible = false;
        this.game_logic.UnPause();
    };
    return HomeButton;
}(Phaser.Group));
exports.HomeButton = HomeButton;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var speech_bubble_1 = __webpack_require__(6);
var InfoPanel = (function (_super) {
    __extends(InfoPanel, _super);
    function InfoPanel(game, _game_logic) {
        var _this = _super.call(this, game) || this;
        _this.game_logic = _game_logic;
        _this._blocker = new Phaser.Image(game, 0, 0, "cb_blocker");
        _this._blocker.alpha = 0.2;
        _this._blocker.inputEnabled = true;
        _this._blocker.input.priorityID = 0;
        _this.add(_this._blocker);
        _this._speech_bubble = new speech_bubble_1.SpeechBubble(game, 300, 150, 300, "");
        _this.add(_this._speech_bubble);
        _this._portrait_neutral = new Phaser.Image(game, 0, 80, "cb_full");
        _this._portrait_neutral.x = 100;
        _this.add(_this._portrait_neutral);
        _this._portrait_win = new Phaser.Image(game, 0, 50, "cb_win");
        _this._portrait_win.width = _this._portrait_win.width * .75;
        _this._portrait_win.height = _this._portrait_win.height * .75;
        _this._portrait_win.x = 50;
        _this.add(_this._portrait_win);
        _this._finish = new Phaser.Image(game, 350, 475, "cb_finish");
        _this.add(_this._finish);
        game.input.onDown.add(_this.Clicked, _this);
        return _this;
        // add an ok button
    }
    Object.defineProperty(InfoPanel.prototype, "text", {
        set: function (_text) {
            this._text_array = _text.split("|");
            this._text_position = 0;
            this._speech_bubble.text = this._text_array[this._text_position];
        },
        enumerable: true,
        configurable: true
    });
    // IsVisible() {
    //     // return this.is_visible;
    //     return this.visible
    // }
    InfoPanel.prototype.Clicked = function () {
        //if(this.is_visible){
        if (this.visible) {
            if (this._portrait_neutral.visible == true) {
                if (this._text_position === this._text_array.length - 1) {
                    this.hideMessage();
                }
                else {
                    this._text_position++;
                    this._speech_bubble.text = this._text_array[this._text_position];
                }
            }
            else {
                // quit to main menu
                if (this.game_logic._world.survey_url == "") {
                    this.game.state.start("ChapterSelect", true, false);
                }
                else {
                    this.game_logic.OpenSurvey(this.game_logic._world.survey_url);
                    this.game.state.start("ChapterSelect", true, false);
                }
            }
        }
    };
    InfoPanel.prototype.showMessageInfo = function (text) {
        this._blocker.input.priorityID = 100000;
        this.game_logic.Pause();
        this.visible = true;
        this.text = text;
        this._portrait_neutral.visible = true;
        this._portrait_win.visible = false;
    };
    InfoPanel.prototype.showMessageWin = function (text) {
        console.log("win!");
        this._blocker.input.priorityID = 100000;
        this.visible = true;
        this.text = text;
        this._portrait_neutral.visible = false;
        this._portrait_win.visible = true;
    };
    InfoPanel.prototype.hideMessage = function () {
        this._blocker.input.priorityID = 0;
        this.game_logic.UI.notification.ShowPortrait();
        this.game_logic.UnPause();
        this.visible = false;
    };
    return InfoPanel;
}(Phaser.Group));
exports.InfoPanel = InfoPanel;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var speech_bubble_1 = __webpack_require__(6);
var Notification = (function (_super) {
    __extends(Notification, _super);
    function Notification(game, _logic) {
        var _this = _super.call(this, game) || this;
        _this._game = _logic;
        _this._speech_bubble = new speech_bubble_1.SpeechBubble(game, 130, 40, 300, "");
        _this._speech_bubble.visible = false;
        _this.add(_this._speech_bubble);
        _this._portrait = new Phaser.Image(game, 10, 10, "cb");
        _this.add(_this._portrait);
        _this._portrait.inputEnabled = true;
        _this._portrait.events.onInputDown.add(function () {
            _this._game._world.ShowGoalText();
        });
        // Add the help button
        _this._help_button = game.add.button(10, _this._portrait.y + _this._portrait.height, 'buttonbg', _this.HelpClick, _this, 2, 1, 0);
        _this._help_button_text = new Phaser.Text(game, 0, 0, "help", { align: "center", wordWrap: true, wordWrapWidth: 100 });
        _this.addChild(_this._help_button);
        _this._help_button.addChild(_this._help_button_text);
        _this._help_button_text.x = _this._help_button.width / 2 - _this._help_button_text.width / 2;
        _this._help_button_text.y = _this._help_button.height / 2 - _this._help_button_text.height / 2;
        _this._help_button.scale = new Phaser.Point(.5, .5);
        return _this;
    }
    Object.defineProperty(Notification.prototype, "text", {
        set: function (_text) {
            this._speech_bubble.text = _text;
        },
        enumerable: true,
        configurable: true
    });
    Notification.prototype.HelpClick = function () {
        this._game._world.ShowHelpText();
    };
    Notification.prototype.HidePortrait = function () {
        this._portrait.visible = false;
        this._help_button.visible = false;
    };
    Notification.prototype.ShowPortrait = function () {
        this._portrait.visible = true;
        this._help_button.visible = true;
    };
    Notification.prototype.showMessage = function (text) {
        this._speech_bubble.text = text;
        this._speech_bubble.visible = true;
    };
    Notification.prototype.hideMessage = function () {
        this._speech_bubble.visible = false;
    };
    return Notification;
}(Phaser.Group));
exports.Notification = Notification;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by nathanmishler on 2/6/18.
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PauseButton = (function (_super) {
    __extends(PauseButton, _super);
    function PauseButton(game, logic) {
        var _this = _super.call(this, game) || this;
        _this._game = game;
        _this.game_logic = logic;
        _this._pause = new Phaser.Image(game, 50, 520, "pause");
        _this._pause.inputEnabled = true;
        _this._pause.visible = true;
        _this.add(_this._pause);
        _this._resume = new Phaser.Image(game, 50, 520, "resume");
        _this._resume.inputEnabled = true;
        _this._resume.visible = false;
        _this.add(_this._resume);
        game.input.onDown.add(_this.Clicked, _this);
        return _this;
    }
    PauseButton.prototype.GetIsPaused = function () {
        return this._resume.visible;
    };
    PauseButton.prototype.Clicked = function () {
        if (this._pause.input.pointerOver() || this._resume.input.pointerOver()) {
            this._resume.visible = !this._resume.visible;
            this._pause.visible = !this._pause.visible;
            if (this._pause.visible) {
                this.game_logic.UnPause();
            }
            else {
                this.game_logic.Pause();
            }
        }
    };
    return PauseButton;
}(Phaser.Group));
exports.PauseButton = PauseButton;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PolicyOption = (function (_super) {
    __extends(PolicyOption, _super);
    function PolicyOption(game, logic, id, text, min, max, callback) {
        var _this = _super.call(this, game) || this;
        _this.price = 0;
        _this.percent_population = 0;
        _this.is_selected = false;
        _this._logic = logic;
        _this.id = id;
        _this.min = min;
        _this.max = max;
        //this.graphics = game.add.graphics(0, 0, this);
        //this.graphics.inputEnabled = true;
        //this.graphics.input.useHandCursor = true;
        //this.add(this.graphics);
        //this.text = game.add.text( 70, 15, text, {fontSize: 15}, this);
        //this.add(this.text);
        //this.graphics.events.onInputUp.add(()=>{
        //    callback(this);
        //});
        //this.setSelected(false);
        // Add slider down
        if (id != "no_policy") {
            _this.slider_track = new Phaser.Image(game, 0, 0, "slider_horizontal");
            _this.slider_track.width *= 2;
            _this.slider_track.inputEnabled = false;
            _this.add(_this.slider_track);
            _this.cost_text = game.add.text(_this.slider_track.x + _this.slider_track.width + 20, _this.slider_track.y, "$" + min.toString(), { fontSize: 12 }, _this);
            _this.cost_text.y -= _this.cost_text.height;
            _this.add(_this.cost_text);
            _this.population_growth_text = game.add.text(_this.slider_track.x + _this.slider_track.width + 20, _this.slider_track.y, "%" + Math.floor(min / max * 100).toString(), { fontSize: 12 }, _this);
            //this.population_growth_text.y -= this.cost_text.height / 2;
            _this.add(_this.population_growth_text);
            _this.slider_handle = new Phaser.Image(game, _this.slider_track.x, _this.slider_track.y, "slider_down");
            _this.slider_handle.x -= _this.slider_handle.width / 2;
            _this.slider_handle.y -= _this.slider_handle.height / 2;
            _this.bounds = new Phaser.Rectangle(_this.slider_track.x - _this.slider_handle.width / 2, _this.slider_track.y - _this.slider_handle.height / 2, _this.slider_track.width + _this.slider_handle.width, 80);
            _this.slider_handle.inputEnabled = true;
            _this.slider_handle.input.enableDrag(false, false, false, 255, _this.bounds);
            _this.slider_handle.input.allowVerticalDrag = false;
            _this.slider_handle.events.onDragStop.add(_this.setParameter, _this);
            _this.add(_this.slider_handle);
        }
        _this.setParameter();
        return _this;
    }
    PolicyOption.prototype.setSelected = function (state) {
        /*
        this.is_selected = state;

        this.graphics.clear();
        this.graphics.lineStyle(5, 0x000000, 1);
        if(state){
            this.graphics.beginFill(0x99ddaa, 1);
        } else {
            this.graphics.beginFill(0xffffff,1 );
        }
        this.graphics.drawCircle(30,30,50);
        this.graphics.endFill();
        */
    };
    PolicyOption.prototype.setParameter = function () {
        this.percent = (this.slider_handle.x - this.bounds.x + this.slider_handle.width / 2) / (this.bounds.width);
        if (Math.floor(this.percent * 100) == 96) {
            this.percent = 1;
        }
        if (Math.floor(this.percent * 100) == 3) {
            this.percent = 0;
        }
        this.price = (this.max - this.min) * this.percent;
        this.cost_text.text = "Cost +$" + this.price.toFixed(2).toString();
        this.population_growth_text.text = "Pop Rt. " + Math.floor((1 - this.percent) * 100).toString() + "%";
        this._logic.SetPolicy2Numbers(this.price, 1 - this.percent);
    };
    return PolicyOption;
}(Phaser.Group));
exports.PolicyOption = PolicyOption;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RepairButton = (function (_super) {
    __extends(RepairButton, _super);
    function RepairButton(game, logic) {
        var _this = _super.call(this, game) || this;
        _this._game = game;
        _this.game_logic = logic;
        _this._on = new Phaser.Image(game, 175, 525, "repair_on");
        _this._on.inputEnabled = true;
        _this._on.visible = false;
        _this.add(_this._on);
        _this._off = new Phaser.Image(game, 175, 525, "repair_off");
        _this._off.inputEnabled = true;
        _this._off.visible = true;
        _this.add(_this._off);
        game.input.onDown.add(_this.Clicked, _this);
        return _this;
    }
    RepairButton.prototype.GetIsRepairMode = function () {
        return this._on.visible;
    };
    RepairButton.prototype.Clicked = function () {
        if (this._on.input.pointerOver() || this._off.input.pointerOver()) {
            this._on.visible = !this._on.visible;
            this._off.visible = !this._off.visible;
            if (this._off.visible) {
                this.game_logic.EndRepairMode();
            }
            else {
                this.game_logic.StartRepairMode();
            }
        }
    };
    RepairButton.prototype.TurnOff = function () {
        this._on.visible = false;
        this._off.visible = true;
        this.game_logic.EndRepairMode();
    };
    return RepairButton;
}(Phaser.Group));
exports.RepairButton = RepairButton;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../lib/phaser.d.ts"/>
var gamelogic_1 = __webpack_require__(8);
var audio_1 = __webpack_require__(2);
var loading_1 = __webpack_require__(10);
var Boot_1 = __webpack_require__(7);
var mainmenu_1 = __webpack_require__(11);
var chapterselect_1 = __webpack_require__(9);
var WaterGame = (function (_super) {
    __extends(WaterGame, _super);
    function WaterGame() {
        var _this = _super.call(this, 800, 600, Phaser.AUTO, "gameDiv", null) || this;
        //this.state.add("LoadScreen", LoadScreen, false);
        _this.state.add("Boot", Boot_1.Boot, false);
        _this.state.add("LoadScreen", loading_1.LoadScreen, false);
        _this.state.add("MainMenu", mainmenu_1.MainMenu, false);
        _this.state.add("ChapterSelect", chapterselect_1.ChapterSelect, false);
        _this.state.add("GameLogic", gamelogic_1.GameLogic, false);
        audio_1.AudioManager.init(_this);
        _this.state.start("Boot");
        return _this;
    }
    return WaterGame;
}(Phaser.Game));
window.onload = function () {
    var this_game = new WaterGame();
    var closeSurvey = document.getElementById("closeSurvey");
    closeSurvey.addEventListener("click", function () {
        console.log("click");
        var surveyWrap = document.getElementById("surveyWrap");
        //console.log(surveyWrap);
        surveyWrap.style.visibility = "hidden";
    });
};


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map