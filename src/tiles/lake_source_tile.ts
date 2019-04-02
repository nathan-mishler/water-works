/**
 * Created by nathanmishler on 2/16/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"

export class LakeSourceTile extends BaseTile {

    constructor( _game:GameLogic, x:number, y:number ) {
        super(_game, x, y);
        this.Disable();

        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 40;

        // Now tiles can get input, so we know if we are over them or not
        this._base_sprite.inputEnabled = false;
    }

}