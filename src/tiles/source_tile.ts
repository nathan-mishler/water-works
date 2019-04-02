/**
 * Created by nathanmishler on 2/13/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"
import {TileData} from "../tiledata"
import {World} from "../world"

export class SourceTile extends BaseTile {

    output_units: number = 0;
    output_quality: number = 0;

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this._base_sprite.destroy();

        let data = TileData.getTile("SourceTile");
        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);
        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 40;

        this.game_logic._world.sources.push(this);

    }

    Destroy() {

        let idx: number = this.game_logic._world.sources.indexOf(this);
        this.game_logic._world.sources.splice(idx, 1);

        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
    }


    Update() {

        // if we are over a lake, update the following...
        if( this.game_logic._world.lakes[this._x][this._y].name == "lake" ) {

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

                pipe_name = "piping_source/" + pipe_name;

            } else {
                pipe_name = "piping_source/0001";
            }
            //console.log(pipe_name);
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

}