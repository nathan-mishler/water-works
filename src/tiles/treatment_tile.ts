/**
 * Created by nathanmishler on 2/16/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"
import {TileData} from "../tiledata";

export class TreatmentTile extends BaseTile {

    types: string[] = [];
    upgrades: Object;
    _coagulation_sprite:Phaser.Sprite;
    _filtration_sprite:Phaser.Sprite;
    _disinfection_sprite:Phaser.Sprite;

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this._base_sprite.destroy();

        let data = TileData.getTile("TreatmentTile");
        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 60;

        //this.SetTreatment("coagulation");
       // this.SetTreatment("filtration");
        //this.SetTreatment("disinfection");

    }

    GetTypesString() {
        let temp:string = " ";
        for (let i:number = 0; i < this.types.length; i++ ){
            temp += this.types[i];
            temp += " ";
        }

        return temp;
    }



   Destroy() {
       this._base_sprite.destroy(true);
       this._touch_sprite.destroy(true);
       this._highlight_sprite.destroy(true);

        if(this._coagulation_sprite != null ){
            this._coagulation_sprite.destroy(true);
        }

       if(this._disinfection_sprite != null ){
           this._disinfection_sprite.destroy(true);
       }

       if(this._filtration_sprite != null ){
           this._filtration_sprite.destroy(true);
       }
   }

   SetTreatment(type: string) {
        if (this.types.indexOf(type) == -1) {
            this.types.push(type);

            switch(type) {
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
   }

}
