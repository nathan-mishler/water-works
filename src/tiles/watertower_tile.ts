/**
 * Created by nathanmishler on 2/16/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"
import {TileData} from "../tiledata";

export class WatertowerTile extends BaseTile {

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this._base_sprite.destroy(true);

        let data = TileData.getTile("WatertowerTile");
        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);

        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 60;

    }
}