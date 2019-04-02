/**
 * Created by nathanmishler on 2/13/17.
 */
import {GameLogic} from "./gamelogic"
import {TileData} from "./tiledata";
import {GameData} from "./gamedata";
import {TileInterface} from "./interfaces/tileinfo";
import {LakeTile} from "./tiles/lake_tile";

export class BaseTile implements TileInterface{

    // Connection to game logic for highlights
    game_logic:GameLogic;
    _base_sprite:Phaser.Sprite;

    _touch_sprite:Phaser.Sprite;

    _highlight_sprite:Phaser.Sprite;

    // Grid position
    _x:number;
    _y:number;

    // Items that every type has
    connectible:boolean = false;
    cost:number;
    current_population:number;
    current_quality:number;
    current_units:number = 0;
    current_water_storage:number;
    current_water_usage:number;
    evaporation_per_usage:number;
    input_quality:number = 0;
    input_units:number = 0;
    integrity:number;
    max_integrity:number;
    level:number;
    max_water_storage:number;
    max_water_usage:number;
    max_population:number = 0;
    min_population:number;
    money_generated_per_usage:number;
    public name: string = "empty";
    output_quality:number = 0;
    output_units:number = 0;
    population_generated_per_usage:number;
    quality_drop_per_usage:number;
    recharge_amount:number;
    treatment_modifier:number;
    turns_to_die:number;
    usage_decrease_with_deficit:number;
    usage_increase_with_surplus:number;
    degrade_per_tick:number = 0;
    repair_cost:number = 0;

    current_tint:number = 0xffffff;

    display_name:string = "";

    tooltip:string;

    in_flow:boolean = false;

    is_source:boolean = false;

    // A tile consists of a basic sprite and a highlight tile
    constructor (_game:GameLogic, x:number, y:number) {
        this.game_logic = _game;

        this._touch_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x,y), 'watergame', "base_square");
        this._touch_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._touch_sprite);

        this._touch_sprite.inputEnabled = true;
        this._touch_sprite.input.pixelPerfectOver = true;
        this._touch_sprite.input.pixelPerfectClick = true;
        this._touch_sprite.alpha = 0.1;

        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x,y), 'watergame',  "base_square");
        this._base_sprite.alpha = 0;
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);

        this._highlight_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x,y), 'watergame', "highlightsquare");
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

    Destroy() {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
    }

    // Asks if the tile is being hovered over
    CheckHover () {

        if( this._touch_sprite.input != undefined) {

            //return this._touch_sprite.input.checkPointerOver(this.game_logic.game.input.activePointer);
            return this._touch_sprite.input.pointerOver();
        }else{
            return false;

        }
    }

    // Show the highlight if its sprite exists
    ShowHighlight () {

        if ( this._highlight_sprite == undefined ){
            return;
        }

        this._highlight_sprite.visible = true;

        if( this.game_logic._delete_mode) {
            if( this.name != "empty") {
                this.game_logic.UI.notification.showMessage("Delete " + this.name);
            }else{
                this.game_logic.UI.notification.hideMessage();
            }
        }else if(this.game_logic._repair_mode){
            if( this.name != "empty") {

                let amt = this.repair_cost;
                let message = "Integrity currently: " + + this.GetPercentIntegrity() + "%";
                message += "\n";
                message += "Repair for $" + amt.toString();

                this.game_logic.UI.notification.showMessage(message);
            }else{
                this.game_logic.UI.notification.hideMessage();
            }

        }else {
            // Grab a lake tile from our current spot
            let tempLake:LakeTile = this.game_logic._world.lakes[this._x][this._y];

            let message:string = "";

            if (this.name != "empty") {



                message += this.display_name;
                message += "\n";
                if(this.name == "treatment"){
                    message += "Modules: " + this.GetTypesString() + "\n";


                }
                message += "Integrity: " + this.GetPercentIntegrity() + "%";
            }
            if (tempLake.name == "lake"){
                if (message != ""){
                    message += "\n";
                }
                message += "Lake Water: " + tempLake.current_water_storage.toFixed(0) + " / " + tempLake.max_water_storage ;
                message += "\nWater Quality: " + parseFloat((Math.round(tempLake.current_quality * 100) / 100).toString()).toFixed(2);  ;
            }

            if (message != "") {
                this.game_logic.UI.notification.showMessage(message);
            }
            else {
                this.game_logic.UI.notification.hideMessage();
            }
        }

    }

    GetTypesString() {
        return "";
    }


    // Hides the highlight sprite if it exists
    HideHightlight () {

        if ( this._highlight_sprite == undefined ){
            return;
        }

        this._highlight_sprite.visible = false;
    }

    // Visible tile positions, based on tiles that are 80x40
    DeriveGridX(x:number, y:number) {
        return this.game_logic._world.world_x + ( 40 * x) + ( 40 * y );
    }

    DeriveGridY(x:number, y:number) {
        return this.game_logic._world.world_y - ( 20 * y ) + ( 20 * x );
    }

    // Turn off this tile - currently used for lakes so they don't show as visible
    Disable() {
        this._touch_sprite.inputEnabled = false;
        this._base_sprite.visible = false;
        this._highlight_sprite.visible = false;
    }

    Clicked() {

        // if( !this.game_logic.UI.IsInfoPanelVisible() ) {
        if( !this.game_logic.UI.IsAModalOpen() ) {
            if (this.CheckHover()) {

                if((!this.game_logic._delete_mode && !this.game_logic._repair_mode) && (this.name == "empty")) {
                    this.game_logic._construction_menu.Show(this._base_sprite.x, this._base_sprite.y, this._x, this._y);
                }else if (this.game_logic._delete_mode && this.name != "empty" ) {
                    this.game_logic._world.Disappear(this);
                }else if (this.game_logic._repair_mode && this.name != "empty" ) {
                    let amt = this.repair_cost;

                    if(  this.game_logic._world.game_money - amt >= 0 ) {
                        this.game_logic._world.game_money -= amt;
                        this.integrity = this.max_integrity;
                    }
                }

            }
        }
    }

    // code for updating appearance on tiles
    Update() {


        if( this.name != "empty" ){
            this.SetTint();
        }


    }

    SetTint() {
        if( this.GetPercentIntegrity() <= 25 ) {
            if(this.current_tint != 0xff0000 ) {
                this._base_sprite.tint = 0xff0000;
                this.current_tint = 0xff0000;
            }
        }else if( this.GetPercentIntegrity() <= 50 ){
            if(this.current_tint = 0xFF4500 ) {
                this._base_sprite.tint = 0xFF4500;
                this.current_tint = 0xFF4500;
            }
        }else if( this.GetPercentIntegrity() <= 75 ){
            if( this.current_tint != 0xEEB422 ) {
                this._base_sprite.tint = 0xEEB422;
                this.current_tint = 0xEEB422;
            }
        }else if(this.current_tint != 0xffffff){
            this.current_tint = 0xffffff;
            this._base_sprite.tint = 0xffffff;
        }
    }

    Degrade(amt:number) {

        amt = this.degrade_per_tick;



        // TODO - make item show when it's about to delete, maybe items have a different degradation rate?
        let final_amt:number = amt;

        if(Math.random() > .5 ){
            final_amt -= Math.floor(Math.random());
        }else{
            final_amt += Math.floor(Math.random());
        }

        if(final_amt < 0){
            final_amt = 0;
        }

        this.integrity -= final_amt;

        // When an item has broken, delete it from the world
        if(this.integrity <= 0){
            this.game_logic._world.Disappear(this);
        }
    }

    // A function for setting up an item's stats, which might be loaded from a file in the future
    SetStats() {
        let tile_data = TileData.getTile(this.constructor["name"]);
        for(let stat in tile_data){
            if(tile_data.hasOwnProperty(stat)){
                this[stat] = tile_data[stat];
            }
        }



        // Since we have access to game logic - can we store that data? I am thinking...
        // Store scenerio objects somewhere - maybe in world. Make a dictionary of modifiers
        // Then retrieve them here based on tile names

        for( var key in this.game_logic._world.scenario_data ) {
            let new_key = key.split("|");

            if ( this.constructor["name"] == new_key[0]){

                this[new_key[1]] = this.game_logic._world.scenario_data[key];
            }
        }

        if( !tile_data.hasOwnProperty("display_name")) {
            this.display_name = this.name;
        }

        this.max_integrity = this.integrity;
    }

    GetPercentIntegrity() {
        return Math.floor((this.integrity / this.max_integrity) * 100);
    }

    SetInFlow(set:boolean) {
        this.in_flow = set;
    }

    IsInFlow() {
        return this.in_flow;
    }

}