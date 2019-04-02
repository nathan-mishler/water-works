/**
 * Created by nathanmishler on 2/16/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"
import {TileData} from "../tiledata";

export class WasteWaterTreatmentTile extends BaseTile {

    types: string[] = [];
    upgrades:Object;

    _primary_sprite:Phaser.Sprite;
    _secondary_sprite:Phaser.Sprite;
    _tertiary_sprite:Phaser.Sprite;

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this._base_sprite.destroy();

        let data = TileData.getTile("WasteWaterTreatmentTile");
        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 60;

        //this.SetTreatment("primary");
        //this.SetTreatment("secondary");
        //this.SetTreatment("tertiary");

    }

    Destroy() {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);

        if(this._primary_sprite != null ){
            this._primary_sprite.destroy(true);
        }

        if(this._secondary_sprite != null ){
            this._secondary_sprite.destroy(true);
        }

        if(this._tertiary_sprite != null ){
            this._tertiary_sprite.destroy(true);
        }
    }

    GetTypesString() {
        let temp:string = " ";
        for (let i:number = 0; i < this.types.length; i++ ){
            temp += this.types[i];
            temp += " ";
        }

        return temp;
    }

    SetTreatment(type: string) {
        if (this.types.indexOf(type) == -1) {
            this.types.push(type);

            switch(type) {
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
    }

}
