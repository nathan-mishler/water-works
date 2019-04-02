/**
 * Created by nathanmishler on 2/14/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"

export class LakeTile extends BaseTile {

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this.Disable();

        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 40;

        // Now tiles can get input, so we know if we are over them or not
        this._base_sprite.inputEnabled = false;


        this._highlight_sprite.visible = true;
        this._highlight_sprite.alpha = 0;
        this._highlight_sprite.tint = 0x83AB2C;
    }


    SetTint() {

        //let temp:number = .7 - this.current_quality;

        //this._highlight_sprite.alpha = temp;
    }

}