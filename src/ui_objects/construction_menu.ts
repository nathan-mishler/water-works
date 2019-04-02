/**
 * Created by nathanmishler on 2/13/17.
 */
import {GameLogic} from "../gamelogic";
import {TileData} from "../tiledata";
import DisplayObject = PIXI.DisplayObject;
import {ConstructionButton} from "./construction_button";

export class ConstructionMenu extends Phaser.Group{

    game_logic:GameLogic;

    // Pixel location
    _x:number;
    _y:number;

    // Current grid location
    _grid_x:number;
    _grid_y:number;

    _menu_data:Object;

    private _menu_buttons:ConstructionButton[];

    // _main_menu:Phaser.Sprite[];
    // _sub_menu_is:Phaser.Sprite[];
    // _sub_menu_wt:Phaser.Sprite[];
    // _sub_menu_ww:Phaser.Sprite[];


    constructor(_game:GameLogic, x:number, y:number) {
        super(_game.game);

        this.game_logic = _game;

        this._menu_data = <Object>this.game.cache.getJSON("construction_menu_data");

        this._menu_buttons = [];

        // Keeping track of menus here
        //this._main_menu = [];
        //this._sub_menu_is = [];
        //this._sub_menu_wt = [];
        //this._sub_menu_ww = [];

        this._x = x;
        this._y = y;

        this._grid_x = 0;
        this._grid_y = 0;

        this.createMenu();
        this.Hide();
    }

    createMenu(){
        for (let i=0; i < this._menu_data["main_menu"].length; i++){
            let item_data = this._menu_data["main_menu"][i];
            this.addMainMenuItem(item_data);
        }

        this.ArraySprites(this.children);
    }


    // Create a main menu item, and associated submenus
    addMainMenuItem(item_data:Object){
        // Create sprite
        let sprite:ConstructionButton = new ConstructionButton(this.game, 0,0, item_data);
        sprite.anchor = new Phaser.Point(0.5, 0.5);
        this._menu_buttons.push(sprite);
        this.add(sprite);

        // Events
        sprite.inputEnabled = true;

        // Handle whether button opens a submenu or creates a tile
        if(item_data["submenu"]){
            // if it has a submenu, create the submenu
            this.createSubmenu(sprite, item_data["hover_text"]);
            sprite.events.onInputDown.add(()=>{
                this.HideSubMenus();
                sprite.children[0].visible = true;
            })
        } else {
            sprite.events.onInputDown.add(()=>{
                this.game_logic._world.CreateAt(item_data["type"], this._grid_x, this._grid_y);
                this.Hide();
            }, this, 0);
        }
        //sprite.events.onInputOver.add(()=>{this.game_logic.UI.notification.showMessage(formatted_text);});
        sprite.events.onInputOver.add(this.ShowItemCost, this, 10, item_data["type"], item_data["hover_text"]);
        sprite.events.onInputOut.add(()=>{this.game_logic.UI.notification.hideMessage();});
    }

    createSubmenu(parent:Phaser.Sprite, key:string){
        // Get submenu data
        let submenu_items = this._menu_data["sub_menus"][key];

        // Create group to hold buttons
        let submenu = this.game.add.group();
        parent.addChild(submenu);

        // Create and add buttons
        for(let sub_key in submenu_items){
            if(submenu_items.hasOwnProperty(sub_key)){
                let sub_item = submenu_items[sub_key];
                this.addSubMenuItem(submenu, sub_item);
            }
        }
        submenu.visible = false;
    }

    // Add button to given submenu
    addSubMenuItem(submenu:Phaser.Group, item_data:Object){
        // Create sprite
        let sprite:ConstructionButton = new ConstructionButton(this.game, 0,0, item_data);
        sprite.anchor = new Phaser.Point(0.5, 0.5);
        this._menu_buttons.push(sprite);
        submenu.add(sprite);

        // Events
        sprite.inputEnabled = true;
        sprite.input.priorityID = 10;
        sprite.events.onInputDown.add(()=>{
            this.game_logic._world.CreateAt(item_data["type"], this._grid_x, this._grid_y);
            this.Hide();
        }, this, 0);
        sprite.events.onInputOver.add(this.ShowItemCost, this, 10, item_data["type"], item_data["hover_text"]);
        sprite.events.onInputOut.add(()=>{this.game_logic.UI.notification.hideMessage();});

    }

    // Array the main sprites in a circle.
    ArraySprites(sprites:DisplayObject[]) {
        let angle:number = 0;
        let radius:number = 60;
        let step:number = (2 * Math.PI) / sprites.length;

        for( let i = 0; i < sprites.length; i++ ) {

            let new_XY = this.GetNextXY(radius, angle);
            sprites[i].x = new_XY[0];
            sprites[i].y = new_XY[1];
            sprites[i].visible = true;
            angle += step;
            let current_sprite = <Phaser.Sprite>sprites[i];
            if(current_sprite.children[0]){
                this.ArraySubmenu(<Phaser.Group>current_sprite.children[0], i)
            }
        }
    }

    ArraySubmenu(submenu:Phaser.Group, array_position:number){
        let parent_angle:number = (2 * Math.PI) / 7 * array_position; // angle of the parent in the radial submenu
        let angle:number = 0;
        let radius:number = 45; // Distance from parent button
        let step:number = (2 * Math.PI) / 8; // Distance between submenu items, in radians

        angle += parent_angle - (step * (submenu.children.length/2 - 0.5));
        for( let i = 0; i < submenu.children.length; i++ ) {
            let new_XY = this.GetNextXY(radius, angle);
            submenu.children[i].x = new_XY[0];
            submenu.children[i].y = new_XY[1];
            submenu.children[i].visible = true;
            angle += step;
        }

    }

    HideSubMenus() {
        for(let i = 0; i < this.children.length; i++){
            let sprite:Phaser.Sprite = <Phaser.Sprite>this.children[i];
            if(sprite.children[0]){
                sprite.children[0].visible = false;
            }
        }
    }

    GetNextXY(radius, angle) {
        return [((radius) * Math.cos(angle)),  ((radius) * Math.sin(angle))];
    }

    // Hide it when it isn't in use
    Hide() {
        this.visible = false;
        // So that we can open and close on the same tile
        this._x = -1000;
        this._y = -1000;

    }

    // Show this menu on a specific pixel
    Show(x:number, y:number, grid_x:number, grid_y:number) {
        let min_x = 100;
        let max_x = 700;
        let min_y = 0;
        let max_y = 500;

        let clamp_x = clamp(x, min_x, max_x);
        let clamp_y = clamp(y, min_y, max_y);

        if( this._x != clamp_x || this._y != clamp_y ) {

            this._x = clamp_x;
            this._y = clamp_y;

            this._grid_x = grid_x;
            this._grid_y = grid_y;

            this.visible = true;
            this.x = clamp_x;
            this.y = clamp_y;
            this.HideSubMenus();
            this.ArraySprites(this.children);
            this.updateButtons(this.game_logic._world.game_money );
        }
        else{
            this.Hide();
        }

        function clamp(num, min, max):number{
            return Math.min(Math.max(num, min), max);
        }
    }

    ShowItemCost(obj, pointer:Phaser.Pointer, type:string, prepend:string = ""){
        //console.log(type);
        if(type){
            let cost = this.game_logic.GetCostForUpgradeAtTile(type, this._grid_x, this._grid_y);
            //console.log(cost);
            if(cost){
                this.game_logic.UI.notification.showMessage(prepend + ": $" + cost.toString());
            } else {
                this.game_logic.UI.notification.showMessage(prepend);
            }
        } else {
            this.game_logic.UI.notification.showMessage(prepend);
        }
    }

    createTile(button:ConstructionButton, Pointer:Phaser.Pointer, tile_type:string){
        //console.log(tile_type);
        this.game_logic._world.CreateAt(tile_type, this._grid_x, this._grid_y);
        this.Hide();
    }

    // Sets active/disabled state of each button in the menu, based on affordability
    // This should disable buttons based on the base tile...

    // TODO: If we are over a lake, disable everything but pipes and the source tile
    // TODO: If we are over a Waste Water or Treatment tile, disable everything but them
    updateButtons(current_money:number){
        if(this.visible){

            let tile_name:string = this.game_logic._world.tiles[this._grid_x][this._grid_y].name;

            let lake_tile_name:string =  this.game_logic._world.lakes[this._grid_x][this._grid_y].name;


            for(let i=0; i<this._menu_buttons.length; i++){
                let button = this._menu_buttons[i];
                let allowed: boolean = true;
                if(!button.item_data["submenu"]){
                    let cost = this.game_logic.GetCostForUpgradeAtTile(button.item_data["type"], this._grid_x, this._grid_y);

                    // Check, are we over a lake? Then check if a button is a pipe or the water sub menu
                    if( lake_tile_name != "empty" ){
                        if (button.item_data["type"] != 'pipe' && button.item_data["type"] != "source" ) {
                            allowed = false;
                        }
                    }

                    if((cost > current_money && button.enabled) || (!allowed && button.enabled)){
                        button.disable();
                    } else if(cost <= current_money && !button.enabled && allowed){
                        button.enable(this.createTile, this);
                    }

                }else{

                    if( lake_tile_name != "empty" ){
                        if (button.item_data["hover_text"] != 'Potable Water' ) {
                            allowed = false;
                        }
                    }

                    if(!allowed){
                        button.disable();
                    }else if(allowed && !button.enabled){
                        button.enable(()=>{
                            this.HideSubMenus();
                            button.children[0].visible = true;
                        }, this);

                    }
                }
            }
        }
    }
}