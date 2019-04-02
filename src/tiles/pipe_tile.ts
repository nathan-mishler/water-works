/**
 * Created by nathanmishler on 2/16/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"
import {World} from "../world"
import {TileData} from "../tiledata";

export class PipeTile extends BaseTile {

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this._base_sprite.destroy();

        let data = TileData.getTile("PipeTile");
        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);

        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 40;


    }

    Update() {

        let pipe_id: number = 0;

        let tiles: BaseTile[] = this.game_logic.GetNeighborTilesFrom(this._x, this._y);

        // Find what's connectible and bit shift it, this gives us something in the range of 0000 - 1111
        for (let dir: number = World.NORTH; dir <= World.WEST; dir++) {

            if (tiles[dir] != null && tiles[dir].connectible) {

                // Shift it one
                let add: number = dir - 1;

                if (add < World.NORTH) {
                    add = World.WEST;
                }

                pipe_id |= (1 << add);
            }

        }

        let pipe_name: string = "";

        if (pipe_id != 0) {

            pipe_name = (pipe_id >>> 0).toString(2);
            while (pipe_name.length < 4) {
                pipe_name = "0" + pipe_name;
            }

            pipe_name = "piping/" + pipe_name;

        } else {
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

    }

}