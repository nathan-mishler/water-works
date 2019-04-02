/**
 * Created by nathanmishler on 2/13/17.
 */

import {BaseTile} from "./base_tile"
import {GameLogic} from "./gamelogic"
import {GameData} from "./gamedata"
import {ResidentialTile} from "./tiles/residential_tile"
import {SourceTile} from "./tiles/source_tile"
import {AquiferTile} from "./tiles/aquifer_tile";
import {LakeTile} from "./tiles/lake_tile"
import {LakeSourceTile} from "./tiles/lake_source_tile"
import {PipeTile} from "./tiles/pipe_tile"
import {WatertowerTile} from "./tiles/watertower_tile"
import {IndustrialTile} from "./tiles/industrial_tile"
import {AgriculturalTile} from "./tiles/agricultural_tile"
import {TreatmentTile} from "./tiles/treatment_tile"
import {WasteWaterTreatmentTile} from "./tiles/waste_water_treatment_tile"
import {TileData} from "./tiledata";

// This class holds the current displayed world
export class World{

    static NORTH:number = 0;
    static EAST:number = 1;
    static SOUTH:number = 2;
    static WEST:number = 3;

    // The positions on screen to display the grid
    world_x:number;
    world_y:number;

    // Our grid of tiles
    tiles:BaseTile[][];
    public lakes:BaseTile[][];

    // a tracked list of objects for flow
    sources:SourceTile[] = [];
    visited:BaseTile[] = [];
    pending:BaseTile[] = [];
    lakeInputs:LakeTile[] = [];
    visitedLakes:LakeTile[] = [];

    scenario_aquifer:AquiferTile = null;

    // The usable water in the system
    total_usable_water:number = 0;
    last_turn_usable_water:number = 0;

    // Survey string for the world. Can be empty
    public survey_url:string = "";

    // Money Tracking
    private _game_money:number = 0;
    get game_money():number{
        return Number(this._game_money);
    }
    set game_money(num){
        //console.log(num);
        this._game_money = Number(num);
        this._game._construction_menu.updateButtons(this._game_money);
    }
    money_generated:number = 0;
    this_turn_income:number = 0;

    // Population Tracking
    new_population:number = 0;
    population:number = 0;

    grid_width:number = 10;
    grid_height:number = 10;

    // A reference to the Phaser instance so we can pass it to the tiles we own
    _game:GameLogic;

    background:Phaser.Sprite;
    background_pol:Phaser.Sprite;

    // Win Conditions
    has_complete_circuit:boolean = false;

    win_condition:string = "";

    goal_text:string = "";
    instruction_text:string = "";
    victory_text:string = "";

    // Various checkers for scenerios
    win_complete_circuit:boolean = false;
    build_list:string[];
    link_all_items:boolean = false;
    win_population:number = -1;
    win_money:number = -1;
    num_ind:number = -1;
    num_res:number = -1;
    num_agr:number = -1;

    is_sandbox:boolean = false;

    scenario_data:Object = new Object();

    constructor( game:GameLogic ) {
        this._game = game;

        this.world_x = 50;
        this.world_y = 400;



    }

    init( level_name:string = "scenario_1" ) {

        this.sources = [];

        let map_json = this._game.game.cache.getJSON(level_name);

        this.scenario_data = map_json.properties;

        // TODO make this a real init that loads maps
        this.background = this._game.game.add.sprite(0, 0, map_json.properties.background_image);
        this._game._world_group.add(this.background);



        this.background.width = 800;
        this.background.height = 600;

        this.background_pol = this._game.game.add.sprite(0, 0, map_json.properties.background_image +"_pol" );
        this._game._world_group.add(this.background_pol);
        this.background_pol.width = 800;
        this.background_pol.height = 600;
        this.background_pol.alpha = 0;
        // Create a 10x10 grid of basic land tiles
        this.tiles = [];

        for(let i: number = 0; i < this.grid_width; i++) {
            this.tiles[i] = [];
            for(let j: number = 0; j < this.grid_height; j++) {
                this.tiles[i][j] = new BaseTile( this._game, i, j );
            }
        }


        // Create a 10x10 grid of base tiles for water
        this.lakes = [];

        for(let i: number = 0; i < this.grid_width; i++) {
            this.lakes[i] = [];
            for(let j: number = 0; j < this.grid_height; j++) {
                this.lakes[i][j] = new BaseTile( this._game, i, j );
                this.lakes[i][j].Disable();
            }
        }


        // Set up all win conditions
        //

        if(map_json.properties.disable_policy){
            this._game.UI.policy_button.visible = false;
        }

        if(map_json.properties.survey != "" && map_json.properties.survey != undefined){
            this.survey_url = map_json.properties.survey;
        }

        this.win_complete_circuit = map_json.properties.win_complete_circuit;
        if ( map_json.properties.build_list != "" ){
            this.build_list = map_json.properties.build_list.split("|");
        }else{
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

        if( map_json.properties.money ){
            this._game_money = map_json.properties.money;
        }

        if( map_json.properties.sandbox ){
            this.is_sandbox = true;
        }

        if( map_json.properties.aquifer && map_json.properties.aquifer > 0){
            this.scenario_aquifer = new AquiferTile(this._game, 0,0);
            this.scenario_aquifer.max_water_storage = map_json.properties.aquifer;
            this.scenario_aquifer.current_water_storage = map_json.properties.aquifer;
        }

        // Construct the world. Starting with layers
        for ( let i = 0; i < map_json.layers.length; i++ ){

            // Parse out the data. We have a 10x10 grid
            if(map_json.layers[i].name == "Objects"){
                for ( let x = 0; x < map_json.layers[i].data.length; x++) {
                    let x_pos = x % 10;

                    // Accounting for tiled's coordinate system
                    let y_pos = 9 - Math.floor(x / 10);

                    // Zero means it's an empty tile, so don't do anything
                    if( map_json.layers[i].data[x] != 0) {

                        let temp_num:number = map_json.layers[i].data[x] - 1;


                        let type = this.GetTypeForTileNumber(temp_num.toString());

                        this.CreateAt(type, x_pos, y_pos, "", false);

                    }
                }
            }

            // TODO - make this work for different lake tiles
            if(map_json.layers[i].name == "Lake"){
                for ( let x = 0; x < map_json.layers[i].data.length; x++) {
                    let x_pos = x % 10;

                    // Accounting for tiled's coordinate system
                    let y_pos = 9 - Math.floor(x / 10);

                    // Zero means it's an empty tile, so don't do anything
                    if( map_json.layers[i].data[x] != 0) {

                        this.CreateAt("lake", x_pos, y_pos, "", false);

                    }

                    if(map_json.layers[i].data[x] == 10) {
                        this.lakes[x_pos][y_pos].is_source = true;
                    }
                }
            }
        }
        this.ShowInstructionText();
    }

    ShowInstructionText() {
        this._game.UI.notification.HidePortrait();
        this._game.UI.info_panel.showMessageInfo(this.instruction_text);
    }

    ShowHelpText() {
        this._game.UI.notification.HidePortrait();

        this._game.UI.info_panel.showMessageInfo(GameData.getVar("tutorial_text"));
    }

    ShowGoalText() {
        this._game.UI.notification.HidePortrait();
        this._game.UI.info_panel.showMessageInfo(this.goal_text);
    }

    GetTypeForTileNumber(num: string) {

        let tiles_json = this._game.game.cache.getJSON('tiles_json');

        let image_path:string = "";

        for (let k in tiles_json.tiles ){
            if( k == num ) {
                image_path = tiles_json.tiles[k].image;
            }
        }

        if( image_path != "" ){

            if ( image_path.indexOf("res_") != -1 ){
                return "residential";
            }

            if ( image_path.indexOf("source") != -1 ){
                return "source";
            }

            if ( image_path.indexOf("aquifer") != -1 ){
                return "aquifer";
            }

            if ( image_path.indexOf("lake") != -1 ){
                return "lake";
            }

            if ( image_path.indexOf("lakesource") != -1 ){
                return "lakesource";
            }

            if ( image_path.indexOf("piping") != -1 ){
                return "pipe";
            }

            if ( image_path.indexOf("watertower") != -1 ){
                return "watertower";
            }

            if ( image_path.indexOf("ind_") != -1 ){
                return "industrial";
            }

            if ( image_path.indexOf("agr_") != -1 ){
                return "agricultural";
            }

            if ( image_path.indexOf("DW") != -1 ){
                return "treatment";
            }

            if ( image_path.indexOf("WW") != -1 ){
                return "wastewatertreatment";
            }

        }

        return "";

    }

    // Creation function for tiles
    // Always destroys a tile before making a new one
    CreateAt(type:string, x:number, y:number, subtype: string = "", cost:boolean = true) {

        // Subtract money from player account
        let tile_cost = this._game.GetCostForUpgradeAtTile(type, x, y);
        if(cost && this.game_money !== null && tile_cost){
            this.game_money -= tile_cost;
        }

        // Create tile and add it to the game world
        switch(type) {
            case "empty":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new BaseTile(this._game, x, y );
                break;
            case "residential":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new ResidentialTile(this._game, x, y );
                break;
            case "source":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new SourceTile(this._game, x, y   );
                break;
            case "aquifer":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new AquiferTile(this._game, x, y   );
                break;
            case "lake":
                this.lakes[x][y].Destroy();
                this.lakes[x][y] = new LakeTile(this._game, x, y );
                break;
            case "lakesource":
                this.lakes[x][y].Destroy();
                this.lakes[x][y] = new LakeSourceTile(this._game, x, y );
                break;
            case "pipe":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new PipeTile(this._game, x, y );
                break;
            case "watertower":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new WatertowerTile(this._game, x, y );
                break;
            case "industrial":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new IndustrialTile(this._game, x, y );
                break;
            case "agricultural":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new AgriculturalTile(this._game, x, y );
                break;
            case "treatment":

                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new TreatmentTile(this._game, x, y );
                break;
            case "coagulation":
                if (this.tiles[x][y].name != "treatment" ){
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new TreatmentTile(this._game, x, y );
                }

                (this.tiles[x][y] as TreatmentTile).SetTreatment("coagulation");
                break;
            case "filtration":
                if (this.tiles[x][y].name != "treatment" ){
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new TreatmentTile(this._game, x, y );
                }

                (this.tiles[x][y] as TreatmentTile).SetTreatment("filtration");
                break;
            case "disinfection":
                if (this.tiles[x][y].name != "treatment" ){
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new TreatmentTile(this._game, x, y );
                }

                (this.tiles[x][y] as TreatmentTile).SetTreatment("disinfection");
                break;
            case "primary":
                if (this.tiles[x][y].name != "wastewatertreatment" ){
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new WasteWaterTreatmentTile(this._game, x, y );
                }

                (this.tiles[x][y] as WasteWaterTreatmentTile).SetTreatment("primary");
                break;
            case "secondary":
                if (this.tiles[x][y].name != "wastewatertreatment" ){
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new WasteWaterTreatmentTile(this._game, x, y );
                }

                (this.tiles[x][y] as WasteWaterTreatmentTile).SetTreatment("secondary");
                break;
            case "tertiary":
                if (this.tiles[x][y].name != "wastewatertreatment" ){
                    this.tiles[x][y].Destroy();
                    this.tiles[x][y] = new WasteWaterTreatmentTile(this._game, x, y );
                }

                (this.tiles[x][y] as WasteWaterTreatmentTile).SetTreatment("tertiary");
                break;

            case "wastewatertreatment":
                this.tiles[x][y].Destroy();
                this.tiles[x][y] = new WasteWaterTreatmentTile(this._game, x, y );
                break;
            default:
                break;
        }
    }

    // Heartbeat function
    update() {

        if( !this._game.IsMenuUp() ) {
            this.CheckForHighlights();
        }

        this.UpdateAppearances();

    }

    CheckWinCondition() {

        if(this.is_sandbox){
            return;
        }

        let has_build_item = false;


        if(this.win_complete_circuit){
            if (!this.has_complete_circuit){
                return;
            }
        }

        if(this.build_list != []){

            for (let x:number = 0; x < this.build_list.length; x++) {
                has_build_item = false;
                for (let i: number = 0; i < this.grid_width; i++) {
                    for (let j: number = 0; j < this.grid_height; j++) {
                        if(this.tiles[i][j].name == this.build_list[x]) {
                            has_build_item = true;
                        }
                    }
                }
                if(!has_build_item){
                    return;
                }else{
                    console.log("Has build item");
                }
            }
        }


        if( this.link_all_items ){
            for (let i: number = 0; i < this.grid_width; i++) {
                for (let j: number = 0; j < this.grid_height; j++) {
                    if(this.tiles[i][j].name != "empty" && this.tiles[i][j].name != "pipe" && this.tiles[i][j].name != "source" && !this.tiles[i][j].IsInFlow()  ) {

                        return;
                    }
                }
            }
        }

       if( this.win_population != -1 && this.population < this.win_population ){
            return;
       }

       if( this.win_money != -1 && this._game_money < this.win_money ){
            return;
       }

       if (this.num_ind != -1 && this.NumItemsInWorld("industrial") < this.num_ind){
           return;

       }


        if (this.num_res != -1 && this.NumItemsInWorld("residential") < this.num_ind){
            return;

        }


        if (this.num_res != -1 && this.NumItemsInWorld("agricultural") < this.num_ind){
            return;

        }

        this._game.Win(this.victory_text);

    }

    NumItemsInWorld(item_name:string ){

        let cur_num:number = 0;

        for (let i: number = 0; i < this.grid_width; i++) {
            for (let j: number = 0; j < this.grid_height; j++) {
                if(this.tiles[i][j].name == item_name) {
                    cur_num++;
                }
            }
        }
        console.log(item_name + " - " + cur_num.toString());
        return cur_num;
    }

    ResetInFlow() {
        for(let i: number = 0; i < 10; i++) {
            for(let j: number = 0; j < 10; j++) {
                if (this.tiles[i][j] != undefined ) {
                    this.tiles[i][j].SetInFlow(false);
                }
            }
        }
    }

    UpdateAppearances() {
        for(let i: number = 0; i < 10; i++) {
            for(let j: number = 0; j < 10; j++) {
                if (this.tiles[i][j] != undefined ) {
                    this.tiles[i][j].Update();
                }
            }
        }

        let numlakes: number = 0;
        let quality_total: number = 0;

        for(let i: number = 0; i < 10; i++) {
            for(let j: number = 0; j < 10; j++) {
                if (this.lakes[i][j] != undefined && this.lakes[i][j].name != "empty") {
                    numlakes++;
                    quality_total += this.lakes[i][j].current_quality;
                }
            }
        }

        let alpha:number = 1 - (quality_total / numlakes) ;
        if (alpha < 0){
            alpha = 0;
        }
        if (numlakes == 0){
            alpha = 0;
        }

        this.background_pol.alpha = alpha;
        this.background.alpha = 1.0 - alpha;
    }

    // Grab a tile, null if it's off the grid
    GetTile(x:number, y:number, direction) {
        switch (direction) {
            case World.NORTH: return y >= this.grid_height - 1 ? null : this.tiles[x][y + 1];
            case World.EAST: return x <= 0 ? null : this.tiles[x - 1][y];
            case World.SOUTH: return y <= 0 ? null : this.tiles[x][y - 1];
            case World.WEST: return x >= this.grid_width - 1 ? null : this.tiles[x + 1][y];
            default: return null;
        }
    }

    GetLakeTile(x:number, y:number, direction) {
        switch (direction) {
            case World.NORTH: return y >= this.grid_height - 1 ? null : this.lakes[x][y + 1];
            case World.EAST: return x <= 0 ? null : this.lakes[x - 1][y];
            case World.SOUTH: return y <= 0 ? null : this.lakes[x][y - 1];
            case World.WEST: return x >= this.grid_width - 1 ? null : this.lakes[x + 1][y];
            default: return null;
        }
    }

    // TODO make sure it only highlights when we don't have a menu up
    CheckForHighlights () {

        for(let i: number = 0; i < 10; i++) {
            for(let j: number = 0; j < 10; j++) {
                if (this.tiles[i][j] != undefined ) {

                        this.tiles[i][j].HideHightlight();

                }
            }
        }

        // if( !this._game.UI.IsInfoPanelVisible() ) {
        if( !this._game.UI.IsAModalOpen() ) {
            for (let i: number = 0; i < 10; i++) {
                for (let j: number = 0; j < 10; j++) {
                    if (this.tiles[i][j] != undefined) {


                        if (this.tiles[i][j].CheckHover()) {
                            this.tiles[i][j].ShowHighlight();

                        } else {
                            this.tiles[i][j].HideHightlight();

                        }
                    }
                }
            }
        }

    }

    //The start of the water flow function
    Probe(){

        this.lakeInputs = [];

        // Assume no circuit, then if we ever discharge back into water, we have a circuit
        this.has_complete_circuit = false;

        // Step through each source and discharge your water into the system
        for(let sources_index = 0; sources_index < this.sources.length; sources_index++){

            // Grab our current source
            let temp_source:SourceTile = this.sources[sources_index];

            // Get the source's name and current neighbors
            let source_name:string = temp_source.name;
            let source_neighbors:BaseTile[] =  this._game.GetNeighborTilesFrom(temp_source._x, temp_source._y);

            // Have we pulled water?
            let is_water_pulled:boolean = false;

            // Currently this code pulls the maximum amount of water from the lake, every time.
            // For some reason it does this in two steps.
            // At this point it isn't checking with the lake...
            let water_pulled_from_lake:number = temp_source.max_water_usage;


            // Take water from lake or aquifer.
            let temp_lake:BaseTile = this.lakes[temp_source._x][temp_source._y];

            if(temp_lake.name == "lake"){

                if( temp_lake.current_water_storage > 0 ) {
                    if (temp_lake.current_water_storage - water_pulled_from_lake >= 0 ) {
                        temp_lake.current_water_storage -= water_pulled_from_lake;

                    }else{
                        water_pulled_from_lake = temp_lake.current_water_storage;
                        temp_lake.current_water_storage = 0;
                    }


                    is_water_pulled = true;
                }else{
                    water_pulled_from_lake = 0;
                }

                temp_source.current_units = water_pulled_from_lake;

            }else{
                // TODO it is an aquifer - implement that
            }

            // We did not pull any water, so reset this for the next step, which is the same as above
            if(!is_water_pulled) {
                water_pulled_from_lake = temp_source.max_water_usage;
            }

            let neighbors_to_visit:BaseTile[] = [];

            // Only grab neighbors that haven't been visited, and aren't lakes or empty.
            for(let n:number = 0; n < 4; n++){
                if(source_neighbors[n]){

                    temp_lake = this.lakes[source_neighbors[n]._x][source_neighbors[n]._y];



                    // if on lake tile pull from there, else pull from aquifer.
                    // If we haven't already drawn water, and it's a lake, draw from it.
                    if(!is_water_pulled && temp_lake.name == 'lake'){
                        if( temp_lake.current_water_storage > 0 ) {
                            if (temp_lake.current_water_storage - water_pulled_from_lake >= 0 ) {
                                temp_lake.current_water_storage -= water_pulled_from_lake;

                            }else{
                                water_pulled_from_lake = temp_lake.current_water_storage;
                                temp_lake.current_water_storage = 0;
                            }

                            temp_source.current_units = water_pulled_from_lake;
                            is_water_pulled = true;
                        }
                    }



                    // Create list of Neighbors to visit with water. Don't include empty or source type tiles.
                    if( this.visited.indexOf(source_neighbors[n]) == -1 && source_neighbors[n].name != "empty" && source_neighbors[n].name != "source"){

                        neighbors_to_visit.push(source_neighbors[n]);
                    }
                }
            }

            // if we didn't pull water, try to pull it from an aquifer
            // TODO - confirm with Mike about Aquifers, as this code seems to only want to do ONE aquifer per scenerio

            if(!is_water_pulled && this.scenario_aquifer){

                let water_pulled:number;

                if( this.scenario_aquifer.current_water_storage > 0) {

                    if (temp_source.max_water_usage >= this.scenario_aquifer.current_water_storage) {
                        water_pulled = this.scenario_aquifer.current_water_storage;
                        this.scenario_aquifer.current_water_storage = 0;
                    } else {
                        water_pulled = temp_source.max_water_usage;
                        this.scenario_aquifer.current_water_storage -= temp_source.max_water_usage;
                    }
                }else{
                    water_pulled = 0;
                }

                temp_source.current_units = water_pulled;
            }



            let current_water_available:number = temp_source.current_units * temp_source.current_quality;

            this.total_usable_water += current_water_available;

            this.visited.push(temp_source);

            // TODO NM - Um. Sources always have a population of zero?

            let temp_current_water_usage:number = temp_source.current_water_usage * temp_source.current_population;

            // Temporary variables to pass flow information to next neighbor
            temp_source.output_units = current_water_available - (current_water_available * temp_source.evaporation_per_usage);
            temp_source.output_quality = temp_source.current_quality - (temp_current_water_usage * temp_source.quality_drop_per_usage);

            // Sources can have multiple children. Each gets equal output.
            let output_per_child = temp_source.output_units / neighbors_to_visit.length;

            for(let n:number = 0; n < neighbors_to_visit.length; n++){
                let temp_neighbor:BaseTile = neighbors_to_visit[n];

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



        if(this.pending.length == 0){
            //console.log("Probe resolving");
            this.ResolveFlow();
        } else {
            while(this.pending.length > 0){
                //console.log("Probe finishing pending");
                // Pending is a list of all pipe branches left to explore.
                // FinishFlow goes through each just like normal flow()
                this.FinishFlow();
            }
        }
    }

    // Flow resolves tiles until multiple neighbors are found, then puts itself in the pending list
    // TODO - investigate - does this mean that a tile mighht be flowed into twice, thus doubling its water every turn?
    Flow(previous_cell:BaseTile, cell:BaseTile){
        cell.SetInFlow(true);
        let cell_name:string  = cell.name;

        // Grab incoming flow
        // Override the inputs
        // TODO Should this be additive? Make sure.
        cell.current_units = cell.input_units;
        cell.current_quality = cell.input_quality;

        // Tracking the total usable water in the system
        let current_water_available:number = cell.current_units * cell.current_quality;
        this.total_usable_water += current_water_available;

        let treatment_modifier:number = 0;
        let temp_current_water_usage:number = 0;
        // Usage tile water usage is population times
        if(cell_name == 'residential' && this._game.policy1Active ) {
            temp_current_water_usage = cell.current_water_usage * cell.current_population * (1-GameData.getVar("policy1").percent);
        }if(this._game.policy3Active && (cell_name == 'residential' || cell_name == 'industrial' || cell_name == "agricultural")){
            temp_current_water_usage = cell.current_water_usage * cell.current_population + (cell.current_water_usage * cell.current_population * GameData.getVar("policy3").percent);
        }else{
            temp_current_water_usage = cell.current_water_usage * cell.current_population;
        }

        // Due to policy, we can use more or less water
        //console.log(this._game._policy_menu.GetPolicy());

        // Do what we should with the water
        // console.log(cell_name);
        switch(cell_name){
            // Pipes just let water flow through
            case 'pipe':
                break;

            case 'watertower':
                // Check if water should be pulled from storage
                let predicted_water_available:number = this.last_turn_usable_water - this.total_usable_water;

                // If we think we need more water, dump the ENTIRE water tower into the system
                // TODO maybe not - all of it?
                if(current_water_available < predicted_water_available){
                    current_water_available += cell.current_water_storage;
                    cell.current_water_storage = 0;
                } else {
                    // Refill storage
                    if(cell.current_water_storage < cell.max_water_storage){
                        let space_left:number = (cell.max_water_usage - cell.current_water_storage);

                        if((current_water_available - space_left) < 0){
                            cell.current_water_storage += current_water_available;
                            this.LandTermination(cell);
                        } else {
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

                if(current_water_available >= temp_current_water_usage){

                    if(this._game.policy2Active){

                        cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;

                        if(this._game.policy3Active ){
                            cell.current_population += (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                        }
                    }else if( this._game.policy3Active ) {
                        cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                    }else{
                        cell.current_population += cell.usage_increase_with_surplus;
                    }

                    if(cell.current_population >= cell.max_population){
                        cell.current_population = cell.max_population;
                        this.Expand(cell);
                    }

                    this.money_generated = cell.current_population * cell.money_generated_per_usage;
                } else {

                    // We don't have enough water, so drop the population and terminate early

                    cell.current_population -= cell.usage_decrease_with_deficit;

                    if(cell.current_population <= 0){
                        cell.current_population = 0;
                        this.DisappearFromFlow(cell);
                    }
                   // Insufficient water, terminate early.
                   this.LandTermination(cell);

                }

                (cell as AgriculturalTile).UpdateAppearance();
                break;
            case 'residential':

                if(current_water_available >= temp_current_water_usage){

                    if(this._game.policy2Active){
                        cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;

                        if(this._game.policy3Active ){
                            cell.current_population += (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                        }
                    }else if( this._game.policy3Active ) {
                        cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                    }else{
                        cell.current_population += cell.usage_increase_with_surplus;
                    }

                    if(cell.current_population > cell.max_population){

                        cell.current_population = cell.max_population;
                        this.Expand(cell);
                    }
                    this.money_generated = cell.current_population * cell.money_generated_per_usage;

                    (cell as ResidentialTile).UpdateAppearance();

                } else { // Insufficient water, terminate early.

                    cell.current_population -= cell.usage_decrease_with_deficit;

                    if(cell.current_population <= 0){
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

                if(current_water_available >= temp_current_water_usage){
                    if(this._game.policy2Active){
                        cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;

                        if(this._game.policy3Active ){
                            cell.current_population += (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                        }
                    }else if( this._game.policy3Active ) {
                        cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                    }else{
                        cell.current_population += cell.usage_increase_with_surplus;
                    }

                    if(cell.current_population >= cell.max_population){
                        cell.current_population = cell.max_population;
                        this.Expand(cell);
                    }

                    this.money_generated = cell.current_population * cell.money_generated_per_usage;
                } else { // Insufficient water, terminate early.
                    cell.current_population -= cell.usage_decrease_with_deficit;

                    if(cell.current_population <= 0){
                        cell.current_population = 0;
                        this.DisappearFromFlow(cell);
                    }

                    (cell as IndustrialTile).UpdateAppearance();
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


        let cell_neighbors:BaseTile[] = this._game.GetNeighborTilesFrom(cell._x, cell._y);

        let neighbors_to_visit:BaseTile[] = [];

        for(let n:number = 0; n < 4; n++){
            if(cell_neighbors[n] != null && cell_neighbors[n] != previous_cell && this.visited.indexOf(cell_neighbors[n]) == -1 && cell_neighbors[n].name != 'empty'){
                neighbors_to_visit.push(cell_neighbors[n]);
            }
        }

        // tempCurWaterUsage = cell.curPopulation * cell.curWaterUsage;

        if(neighbors_to_visit.length == 0){
            // Decrease cell integrity for repair mechanic
            this.visited.push(cell);

            if ( neighbors_to_visit.length == 0 ) {
                let tempLake:BaseTile = this.lakes[cell._x][cell._y];

                if(tempLake.name == "lake"){
                    this.Terminate(cell, tempLake);
                }else {
                    this.LandTermination(cell);
                }
            }


            cell.Degrade(1);
        } else if(neighbors_to_visit.length > 1){
            // TODO - investigate - why does this cell push itself to the list if there's more than one neighbor?
            this.pending.push(cell);
        } else {

            this.visited.push(cell);
            for(let n:number = 0; n < neighbors_to_visit.length; n++){
                let temp_neighbor = neighbors_to_visit[n];

                if(temp_neighbor != previous_cell){

                    //cell.inFlowCircuit = true;

                    this.visited.push(cell);

                    cell.output_units = current_water_available - (temp_current_water_usage * cell.evaporation_per_usage);
                    cell.output_quality = cell.current_quality - (temp_current_water_usage* cell.quality_drop_per_usage) + treatment_modifier;

                    temp_neighbor.input_units = cell.output_units;
                    temp_neighbor.input_quality = cell.output_quality;

                   this.Flow(cell, temp_neighbor);
                   cell.Degrade(1);

                   //let temp_lake:LakeTile = this.lakes[temp_neighbor._x][temp_neighbor._y];

                  // if(temp_lake.name == "lake"){
                   //    this.Terminate(cell, temp_neighbor);
                   //}
                }
            }
        }
    }

    ResolveFlow() {

        // Check all squares - if they weren't visited, decrease their populations if appropriate
        for(let loopX = 0; loopX < this.grid_width; loopX++){
            for(let loopY = 0; loopY < this.grid_height; loopY++){
                let cell = this.tiles[loopX][loopY];

                if((cell.name == 'agricultural' || cell.name == 'industrial' || cell.name == 'residential') && this.visited.indexOf(cell) == -1){

                    //cell.inFlowCircuit = false;

                    cell.current_population -= cell.usage_decrease_with_deficit;

                    // Don't generate income

                    this.new_population += cell.current_population;

                    switch (cell.name) {
                        case 'agricultural':
                            (cell as AgriculturalTile).UpdateAppearance();
                            break;

                        case 'industrial':
                            (cell as IndustrialTile).UpdateAppearance();

                            break;
                        case 'residential':
                            (cell as ResidentialTile).UpdateAppearance();
                            break;
                    }

                    if(cell.current_population <= 0){
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

        if(this.scenario_aquifer){
            // Recharge the aquifer.
            if(this.scenario_aquifer.current_water_storage < this.scenario_aquifer.max_water_storage){
                 this.scenario_aquifer.current_water_storage += this.scenario_aquifer.recharge_amount;
            }

            if(this.scenario_aquifer.current_water_storage > this.scenario_aquifer.max_water_storage){
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

        if(this._game.policy2Active){
            this.game_money += this.this_turn_income + (this.this_turn_income * this._game.policy2Cost)
        }else {
            this.game_money += this.this_turn_income;
        }


        this.this_turn_income = 0;

        this.UpdateUI();


    }

    UpdateUI() {
        this._game.UI.SetPopulation( Math.round(this.population) );
        this._game.UI.SetMoney(Math.round(this.game_money));
    }

    // Resolves any pending elements
    FinishFlow(){
        for(let pendingIndex:number = 0; pendingIndex < this.pending.length; pendingIndex++){
            let cell:BaseTile = this.pending[pendingIndex];
            let cell_name:string = cell.name;
            let cell_neighbors:BaseTile[] =  this._game.GetNeighborTilesFrom(cell._x, cell._y);

            cell.current_units = cell.input_units;
            cell.current_quality = cell.input_quality;

            let current_water_available:number = cell.current_units * cell.current_quality;

            let temp_current_water_useage:number = 0;

            // Usage tile water usage is population times
            if(cell_name == 'residential' && this._game.policy1Active ) {
                temp_current_water_useage = cell.current_water_usage * cell.current_population * (1-GameData.getVar("policy1").percent);
            }if(this._game.policy3Active && (cell_name == 'residential' || cell_name == 'industrial' || cell_name == "agricultural")){
                temp_current_water_useage = cell.current_water_usage * cell.current_population + (cell.current_water_usage * cell.current_population * GameData.getVar("policy3").percent);
            }else{
                temp_current_water_useage = cell.current_water_usage * cell.current_population;
            }


            this.total_usable_water += current_water_available;

            let treatment_modifier = 0;

            this.visited.push(cell);
            // Determine if there's enough water for use
            switch(cell_name){
                case 'pipe':
                    break;
                case 'watertower':
                    // Check if water should be pulled from storage
                    let predicted_water_available = this.last_turn_usable_water - this.total_usable_water;

                    if(current_water_available < predicted_water_available){
                        current_water_available += cell.current_water_storage;
                        cell.current_water_storage = 0;
                    } else {
                        // Refill storage
                        if(cell.current_water_storage < cell.max_water_storage){
                            let space_left = (cell.max_water_storage - cell.current_water_storage);

                            if((current_water_available - space_left) < 0){
                                cell.current_water_storage += current_water_available;
                                this.LandTermination(cell);

                            } else {
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
                    if(current_water_available >= temp_current_water_useage){
                        if(this._game.policy2Active){
                            cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;
                            if(this._game.policy3Active ){
                                cell.current_population += (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                            }
                        }else if( this._game.policy3Active ) {
                            cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                        }else{
                            cell.current_population += cell.usage_increase_with_surplus;
                        }

                        if(cell.current_population >= cell.max_population){
                            cell.current_population = cell.max_population;
                            this.Expand(cell);
                        }

                        this.money_generated = cell.current_population * cell.money_generated_per_usage;
                    } else { // Insufficient water, terminate early.



                        cell.current_population -= cell.usage_decrease_with_deficit;

                        if(cell.current_population <= 0){
                            cell.current_population = 0;
                            this.DisappearFromFlow(cell);
                        }

                        // Don't generate income
                        this.LandTermination(cell);

                    }

                    this.new_population += cell.current_population;
                    (cell as AgriculturalTile).UpdateAppearance();
                    break;
                case 'residential':
                    if(current_water_available >= temp_current_water_useage){
                        if(this._game.policy2Active){
                            cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;

                            if(this._game.policy3Active ){
                                cell.current_population += (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                            }
                        }else if( this._game.policy3Active ) {
                            cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                        }else{
                            cell.current_population += cell.usage_increase_with_surplus;
                        }

                        if(cell.current_population >= cell.max_population){
                            cell.current_population = cell.max_population;
                            this.Expand(cell);
                        }
                        this.money_generated = cell.current_population * cell.money_generated_per_usage;


                    } else { // Insufficient water, terminate early.


                        cell.current_population -= cell.usage_decrease_with_deficit;

                        if(cell.current_population <= 0){
                            cell.current_population = 0;
                            this.DisappearFromFlow(cell);
                        }

                        // Don't generate income
                        this.LandTermination(cell);

                    }
                    (cell as ResidentialTile).UpdateAppearance();
                    this.new_population += cell.current_population;
                    break;
                case 'industrial':
                    if(current_water_available >= temp_current_water_useage){
                        if(this._game.policy2Active){
                            cell.current_population += cell.usage_increase_with_surplus * this._game.policy2PopulationReduction;

                            if(this._game.policy3Active ){
                                cell.current_population += (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                            }
                        }else if( this._game.policy3Active ) {
                            cell.current_population += cell.usage_increase_with_surplus + (cell.usage_increase_with_surplus * GameData.getVar("policy3").percent);
                        }else{
                            cell.current_population += cell.usage_increase_with_surplus;
                        }

                        if(cell.current_population >= cell.max_population){
                            cell.current_population = cell.max_population;
                            this.Expand(cell);
                        }

                        this.money_generated = cell.current_population * cell.money_generated_per_usage;
                    } else { // Insufficient water, terminate early.
                        cell.current_population -= cell.usage_decrease_with_deficit;

                        if(cell.current_population <= 0){
                            cell.current_population = 0;
                            this.DisappearFromFlow(cell);
                        }

                        // Don't generate income

                        this.LandTermination(cell);
                        // return;
                        (cell as IndustrialTile).UpdateAppearance();
                    }

                    this.new_population += cell.current_population;

                    break;
                default:
                    break;
            }


            this.this_turn_income += Math.round(this.money_generated);
            this.money_generated = 0;

            let neighbors_to_visit:BaseTile[] = [];

            // Grab all neighbors excluding empty.
            for(let n:number = 0; n < 4; n++){
                if(this.visited.indexOf(cell_neighbors[n]) == -1 && cell_neighbors[n] && cell_neighbors[n].name != 'empty' && cell_neighbors[n].name != 'source'){
                    neighbors_to_visit.push(cell_neighbors[n]);
                }
            }

            //cell.inFlowCircuit = true;


            // Setup output to next square.
            cell.output_units = current_water_available - (temp_current_water_useage* cell.evaporation_per_usage);
            cell.output_quality = cell.current_quality - (temp_current_water_useage * cell.quality_drop_per_usage) + treatment_modifier;

            let output_per_child:number = cell.output_units / neighbors_to_visit.length;

            for(let n:number = 0; n < neighbors_to_visit.length; n++){
                let temp_neighbor:BaseTile = neighbors_to_visit[n];

                temp_neighbor.input_units = output_per_child;
                temp_neighbor.input_quality = cell.output_quality;

                // Decrease cell integrity for repair mechanic

                this.Flow(cell, temp_neighbor);
                cell.Degrade(1);



            }


            // If we have no neighbors to visit, check
            if ( neighbors_to_visit.length == 0 ) {
                let tempLake:LakeTile = this.lakes[cell._x][cell._y];

                if(tempLake.name == "lake"){
                    this.Terminate(cell, tempLake);
                }
            }
        }
        this.ResolveFlow();
    }

    // When water just gushes out onto land
    LandTermination( cell:BaseTile = null ) {
        if(cell && cell.name != "empty"){
            this.CircuitCheckStart(cell);
        }

    }

    // Check for a terminating circuit
    CircuitCheckStart(cell:BaseTile) {
        // TODO Implement this? Currently it just checks if a circuit is complete for a tutorial. There's probably a better way to do it.
    }

    // When water gushes out into a lake
    // In preparation for lake diffusion
    Terminate(previous_cell:BaseTile, terminating_cell:LakeTile ) {
        this.has_complete_circuit = true;

        this.lakeInputs.push(terminating_cell);

        terminating_cell.input_units = previous_cell.output_units;
        terminating_cell.input_quality = previous_cell.output_quality;

        terminating_cell.current_units += terminating_cell.input_units;
        terminating_cell.current_quality = (terminating_cell.input_quality + terminating_cell.current_quality) / 2;
    }

    // When a tile has max population and enough water, it will expand out into another cell.
    Expand( cell:BaseTile ) {


        let possible_cells:BaseTile[] = [];
        let randomChoice:number = 0;
        let temp_neighbor:BaseTile = null;
        let temp_neighbors:BaseTile[] = [];
        let temp_cell:BaseTile = null;
        switch(cell.name){
            case "industrial":

                for(let loopX = 0; loopX < this.grid_width; loopX++){
                    for(let loopY = 0; loopY < this.grid_height; loopY++){
                        temp_cell = this.tiles[loopX][loopY];

                        if(temp_cell.name == 'industrial'){
                            temp_neighbors = this._game.GetNeighborTilesFrom( loopX, loopY );

                            for(let i = 0; i < temp_neighbors.length; i++){
                                if(temp_neighbors[i] && temp_neighbors[i].name == 'empty'){
                                    possible_cells.push(temp_neighbors[i]);
                                }
                            }
                        }
                    }
                }

                possible_cells = this.removeLakeTiles(possible_cells);

                if(possible_cells.length > 0){

                    randomChoice = Math.floor(Math.random() * possible_cells.length);

                    temp_neighbor = possible_cells[randomChoice];



                    let data = TileData.getTile("IndustrialTile");
                    cell.current_population -= data.current_population;
                    this.CreateAt( "industrial", temp_neighbor._x, temp_neighbor._y, "", false );
                }

                break;
            case "residential":

                for(let loopX = 0; loopX < this.grid_width; loopX++){
                    for(let loopY = 0; loopY < this.grid_height; loopY++){
                        temp_cell = this.tiles[loopX][loopY];

                        if(temp_cell.name == 'agricultural') {
                            possible_cells.push(this.tiles[loopX][loopY]);
                        }else if(temp_cell.name == 'residential'){

                            temp_neighbors = this._game.GetNeighborTilesFrom(loopX, loopY);

                            for(let i = 0; i < temp_neighbors.length; i++){
                                if(temp_neighbors[i] && temp_neighbors[i].name == 'empty'){
                                    possible_cells.push(temp_neighbors[i]);
                                }
                            }
                        }
                    }
                }
                // console.log(possibleCells);

                possible_cells = this.removeLakeTiles(possible_cells);

                if(possible_cells.length > 0){
                    randomChoice = Math.floor(Math.random() * possible_cells.length);
                    // console.log(randomChoice);
                    temp_neighbor = possible_cells[randomChoice];
                    // console.log(tempNeighbor);
                    let res_data = TileData.getTile("ResidentialTile");
                    cell.current_population -= res_data.current_population;
                    this.CreateAt( "residential", temp_neighbor._x, temp_neighbor._y, "", false );
                    //world[tempNeighbor.x][tempNeighbor.y].setType(new Residential(world[tempNeighbor.x][tempNeighbor.y]));
                }

                break;
            case "agricultural":

                for(let loopX = 0; loopX < this.grid_width; loopX++){
                    for(let loopY = 0; loopY < this.grid_height; loopY++){
                        if(this.tiles[loopX][loopY].name == 'empty'){
                            possible_cells.push(this.tiles[loopX][loopY]);
                        }
                    }
                }

                possible_cells = this.removeLakeTiles(possible_cells);

                if(possible_cells.length > 0){

                    randomChoice = Math.floor(Math.random() * possible_cells.length);

                    temp_neighbor = possible_cells[randomChoice];
                    let ag_data = TileData.getTile("AgriculturalTile");
                    cell.current_population -= ag_data.current_population;
                    this.CreateAt( "agricultural", temp_neighbor._x, temp_neighbor._y, "", false );
                    //world[tempNeighbor.x][tempNeighbor.y].setType(new Agricultural(this.tiles[tempNeighbor.x][tempNeighbor.y]));
                }

                break;
            default:

                break;

        }

    }

    DisappearFromFlow( cell:BaseTile ){
        if(this.pending.indexOf(cell) != -1){
            this.pending.splice(this.pending.indexOf(cell), 1);
        }

        cell.current_population = 0;
        let _x = cell._x;
        let _y = cell._y;
        //cell.inFlowCircuit = false;

        //this.world[cell.x][cell.y].emptyType(new Empty(world[cell.x][cell.y]));
        //world[cell.x][cell.y].setType(new Pipe(world[cell.x][cell.y]));
        this.CreateAt("pipe", _x, _y);
    }

    Disappear( cell:BaseTile ) {
        if(this.pending.indexOf(cell) != -1){
            this.pending.splice(this.pending.indexOf(cell), 1);
        }

        cell.current_population = 0;
        //cell.inFlowCircuit = false;

        let _x = cell._x;
        let _y = cell._y;

        this.CreateAt("empty", _x, _y, "", false)
    }






    StartLakeDiffusion() {
        // Go through all lakesource tiles, diffusing water out of them

        // Add all sources not in the Inputs to the list

        for(let i: number = 0; i < 10; i++) {
            for(let j: number = 0; j < 10; j++) {
                if (this.lakes[i][j] != undefined && this.lakeInputs.indexOf(this.lakes[i][j]) == -1) {
                    this.lakeInputs.push(this.lakes[i][j]);
                }
            }
        }

        for(let x:number = 0; x < this.lakeInputs.length; x++ ) {
             this.visitedLakes = [];

             let cell:LakeTile = this.lakeInputs[x];
             let currentStorage:number = cell.current_water_storage;
             let maxStorage:number = cell.max_water_storage;

             if (cell.is_source) {
                 cell.current_quality = .7;
             }


             // Factor evaporation and loss due to quality.
             let changeInStorage = (currentStorage * cell.current_quality) - (cell.current_water_storage * cell.evaporation_per_usage);

             // Recharge lake cell.
             if ( this.lakeInputs[x].is_source ) {
                 changeInStorage += cell.recharge_amount;
             }

             let netStorage = currentStorage + changeInStorage;

             let excess = 0;

             if(currentStorage > maxStorage){
                excess = netStorage - maxStorage;
             }

             let grossStorage = netStorage - excess;
             cell.current_water_storage = grossStorage;

             if (cell.current_water_storage > cell.max_water_storage){
                 cell.current_water_storage = cell.max_water_storage;
             }

             let cellNeighbors = this._game.GetNeighborLakeTilesFrom(cell._x, cell._y);

             let neighborsToVisit = [];

             // Grab all lake neighbors.
             for(let n = 0; n < 4; n++){
                if(cellNeighbors[n]){
                     let tempX = cellNeighbors[n]._x;
                     let tempY = cellNeighbors[n]._y;

                    let tempLake = this.lakes[tempX][tempY];
                    if(tempLake.name == "lake" && this.visitedLakes.indexOf(cellNeighbors[n]) == -1){
                        neighborsToVisit.push(cellNeighbors[n]);
                    }
                }

             }

             this.visitedLakes.push(cell);

             for(let n:number = 0; n < neighborsToVisit.length; n++){
             let tempNeighbor:LakeTile = neighborsToVisit[n];

             // Setup output to next square.
             cell.output_quality = cell.current_quality - (currentStorage * cell.quality_drop_per_usage);

             let outputPerChild = excess / neighborsToVisit.length;

             tempNeighbor.input_units = outputPerChild;
             tempNeighbor.input_quality = cell.output_quality;


             this.diffuse(tempNeighbor);
             }

        }
    }

    diffuse( cell:LakeTile ) {
        let currentStorage:number = cell.current_water_storage;
        let maxStorage = cell.max_water_storage;

        cell.current_quality = (cell.current_quality + cell.input_quality) / 2;

        // Factor evaporation and loss due to quality.
        let change_in_storage:number = (currentStorage * cell.current_quality) - (cell.current_water_storage * cell.evaporation_per_usage);

        // Recharge lake cell.
        // EXCESS MIGHT BE THE INCOMING - CHECK THAT

        if( cell.is_source ) {
            change_in_storage += cell.recharge_amount + cell.input_units;
        }else{
            change_in_storage += cell.input_units;
        }

        let net_storage:number = currentStorage + change_in_storage;

        let excess:number = 0;

        if(currentStorage > maxStorage){
            excess = net_storage - maxStorage;
        }

        let gross_storage:number = net_storage - excess;
        cell.current_water_storage = gross_storage;

        let cellNeighbors = this._game.GetNeighborLakeTilesFrom(cell._x, cell._y);
        let neighborsToVisit = [];

        // Grab all lake neighbors.
        for(let n = 0; n < 4; n++){
            if(cellNeighbors[n]){
                //let tempX = cellNeighbors[n]._x;
                //let tempY = cellNeighbors[n]._y;

                //var tempLake = worldLakes[tempX][tempY];
                if(cellNeighbors[n].name == "lake" && this.visitedLakes.indexOf(cellNeighbors[n]) == -1){
                    neighborsToVisit.push(cellNeighbors[n]);
                }
            }

        }

        this.visitedLakes.push(cell);

        let outputPerChild = excess / neighborsToVisit.length;

        // Setup output to next square.
        cell.output_quality = cell.current_quality - (currentStorage * cell.quality_drop_per_usage);

        for(let n = 0; n < neighborsToVisit.length; n++){

            let tempNeighbor:BaseTile = neighborsToVisit[n];

            if( this.visitedLakes.indexOf(tempNeighbor) == -1 && outputPerChild > 0 ) {


                tempNeighbor.input_units = outputPerChild;
                tempNeighbor.input_quality = cell.output_quality;

                this.diffuse( tempNeighbor );
            }

        }
    }

    removeLakeTiles(tiles:BaseTile[]){
        return tiles.filter((tile) => {
                return this.lakes[tile._x][tile._y].name !== "lake";
        });

    }

}
