/**
 * Created by nathanmishler on 2/13/17.
 */
import {World} from "./world"
import {BaseTile} from "./base_tile"
import {ConstructionMenu} from "./ui_objects/construction_menu"
import {UI} from "./UI"
import {TileData} from "./tiledata";
import {GameData} from "./gamedata";
import {InfoPanel} from "./ui_objects/info_panel";
import {AudioManager} from "./audio";
import {PolicyMenu} from "./menus/policymenu";

export class GameLogic extends Phaser.State{

    _world:World;

    UI:UI;

    _game_active:boolean;

    _construction_menu:ConstructionMenu;

    _policy_menu:PolicyMenu;

    _world_group:Phaser.Group;

    _paused:Boolean = false;

    _delete_mode:boolean = false;
    _repair_mode:boolean = false;

    heartbeat_count:number = 0;

    trash_icon:Phaser.Image;
    repair_icon:Phaser.Image;

    level_id:string;


    public policy1Active:boolean = false;
    public policy3Active:boolean = false;
    public policy2Active:boolean = false;
    public policy1TimeLeft:number = 0;
    public policy3TimeLeft:number = 0;
    public policy2Cost:number = 0;
    public policy2PopulationReduction:number = 1;

    constructor(){
        super();

        this._game_active = false;
        this._world = new World(this);

    }

    public SetPolicy2Numbers(cost:number, reduct:number) {
        this.policy2Cost = cost;
        this.policy2PopulationReduction = reduct;
    }

    public ActivatePolicy1(){
        this.policy1TimeLeft = GameData.getVar("policy1").duration * 60;
        this.policy1Active = true;
    }

    public ActivatePolicy3(){
        this.policy3TimeLeft = GameData.getVar("policy3").duration * 60;
        this.policy3Active = true;
    }

    public TogglePolicy2(){
        this.policy2Active = !this.policy2Active;
    }

    // Init is run separately from the constructor because we might need to create these things later.
    // Eventually world will get created and destroyed several times a session
    init(level_id:Object) {
        TileData.init(this.game);
        GameData.init(this.game);
        this.level_id = level_id["level"];
        // Create the world Layer
        this._game_active = true;
        this._world_group = this.game.add.group();

        // Create the UI Layer
        this.UI = new UI(this.game, this);
        this.game.add.existing(this.UI);

        this._world.init(this.level_id);
        this._construction_menu = new ConstructionMenu(this, 100, 100 );
        this._construction_menu.visible = false;
        this.UI.add(this._construction_menu);

        this.trash_icon = new Phaser.Image(this.game, 0, 0, "delete_small");
        this.trash_icon.visible = false;
        this.UI.add(this.trash_icon);

        this.repair_icon = new Phaser.Image(this.game, 0, 0, "repair_small");
        this.repair_icon.visible = false;
        this.UI.add(this.repair_icon);
        this.UI.sendToBack(this.repair_icon);

        this._policy_menu = new PolicyMenu(this.game, this);
        this.UI.add(this._policy_menu);
        this.UI.bringToTop(this._policy_menu);

    }


    EndRepairMode() {
        this._repair_mode = false;
        this.repair_icon.visible = false;
    }

    StartRepairMode() {
        this._repair_mode = true;
        this.repair_icon.visible = true;
        this.UI.delete_button.TurnOff();
    }

    EndDeleteMode() {
        this._delete_mode = false;
        this.trash_icon.visible = false;
    }

    StartDeleteMode() {
       this._delete_mode = true;
       this.trash_icon.visible = true;
        this.UI.repair_button.TurnOff();
    }

    update() {
        this.game.input.update();
        // Update the menu and tile highlights
        if(this._game_active){

            this._world.update();

            // Run the world update heartbeat once a second
            if( !this._paused ) {
                this.heartbeat_count++;
                if(this.heartbeat_count == 60){
                    this._world.ResetInFlow();
                    this._world.Probe();
                    this._world.CheckWinCondition();
                    this.heartbeat_count = 0;
                }

                if(this.policy1Active){
                    this.policy1TimeLeft--;

                    if(this.policy1TimeLeft <= 0){

                        this.policy1Active = false;
                    }
                }

                if(this.policy3Active){
                    this.policy3TimeLeft--;

                    if(this.policy3TimeLeft <= 0){

                        this.policy3Active = false;
                    }
                }

            }else{
                this._world.UpdateUI();
            }
        }

        this.trash_icon.x = this.game.input.x + 10;
        this.trash_icon.y = this.game.input.y + 10;

        this.repair_icon.x = this.game.input.x + 10;
        this.repair_icon.y = this.game.input.y + 10;




    }

    Win(win_text:string) {
        this._paused = true;
        this.EndDeleteMode();
        this.EndRepairMode();
        AudioManager.playMusic("win");

        this.UI.info_panel.showMessageWin(win_text);

        let completed_levels:string[] = JSON.parse(localStorage.getItem("completed_levels")) || [];

        if (completed_levels.indexOf(this.level_id) == -1 ){
            completed_levels.push(this.level_id);
            localStorage.setItem("completed_levels", JSON.stringify(completed_levels));
        }



    }

    Pause() {
        this._paused = true;
    }

    // TODO - Honor the pause UI, so if the player paused it, then opens an info box, then closes the info box, the game remains paused.
    UnPause() {
        if( !this.UI.pause_button.GetIsPaused() ) {
            this._paused = false;
        }
    }

    IsMenuUp ( ) {
        return this._construction_menu.visible;
    }

    // Grab neighbors from world tiles
    // North to west, clockwise, starting at 0
    // Null if the tiles are out of bounds
    GetNeighborTilesFrom (x:number, y:number) {

        let neighbors:BaseTile[] = [];

        for(let dir = 0; dir <= 3; dir++) {

            let newDir = this._world.GetTile(x, y, dir);

            neighbors[dir] = newDir;

        }
        return neighbors;
    }

    GetNeighborLakeTilesFrom (x:number, y:number) {

        let neighbors:BaseTile[] = [];

        for(let dir = 0; dir <= 3; dir++) {

            let newDir = this._world.GetLakeTile(x, y, dir);

            neighbors[dir] = newDir;

        }
        return neighbors;
    }

    GetCostForUpgradeAtTile(id:string, x:number, y:number):number{
        let current_tile = this._world.tiles[x][y];
        //console.log(current_tile);
        // If the id matches the existing tile, it cannot be purchased
        if(current_tile.name === id || id === "empty"){
            return null;
        }
        // If the tile has upgrades, and already has the type installed, it cannot be purchased
        if(current_tile.hasOwnProperty("upgrades") && current_tile.hasOwnProperty("types") && current_tile["types"].indexOf(id) > -1){
            return null;
        }
        let tile_info = TileData.getTileByType(id);

        if(tile_info.hasOwnProperty("upgrades") && current_tile.hasOwnProperty("upgrades")){
            return tile_info.cost * (current_tile["types"].length/2 + 1);
        }
        return tile_info.cost;
    }

    OpenSurvey(url: string) {
        window.open(url, "theSurvey");
        let surveyWrap = document.getElementById("surveyWrap");
        surveyWrap.style.visibility = "visible";
    }

}