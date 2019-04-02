/**
 * Created by nathanmishler on 2/16/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"
import {TileData} from "../tiledata";

export class AgriculturalTile extends BaseTile {

    _create_animation: Phaser.Sprite;
    _frame_name: string;

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this._base_sprite.destroy();

        let data = TileData.getTile("AgriculturalTile");
        this._base_sprite = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), data.sprite_sheet, data.frame);
        this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);
        this.game_logic._world_group.add(this._base_sprite);

        this._create_animation = this.game_logic.game.add.sprite(this.DeriveGridX(x, y), this.DeriveGridY(x, y), "create_anims", "res_10000");
        this._create_animation.anchor = new Phaser.Point(0.5, 0.5);
        this._create_animation.width = 80;
        this._create_animation.height = 60;
        this._create_animation.animations.add("create", ["agr_10000", "agr_10001", "agr_10002", "agr_10003", "agr_10004", "agr_10005", "agr_10006", "agr_10007", "agr_10008", "agr_10009","agr_10010","agr_10011","agr_10012","agr_10013","agr_10014","agr_10015","agr_10016","agr_10017","agr_10018","agr_10019","agr_10020","agr_10021","agr_10022"], 30, false);


        this.game_logic._world_group.add(this._base_sprite);
        this._base_sprite.visible = false;
        this.game_logic._world_group.add(this._create_animation);

        // Setting this because the individual tiles might be much larger than display size
        this._base_sprite.width = 80;
        this._base_sprite.height = 60;

        this._create_animation.animations.play("create");
    }

    Destroy() {
        this._base_sprite.destroy(true);
        this._touch_sprite.destroy(true);
        this._highlight_sprite.destroy(true);
        this._create_animation.destroy(true);
    }

    UpdateAppearance() {
        let increments: number = this.max_population / 3;
        let _x: number = this._base_sprite.x;
        let _y: number = this._base_sprite.y;
        let changed: boolean = false;

        let data = TileData.getTile("AgriculturalTile");

        if (this.current_population <= increments) {
            if (this._frame_name != data.frame) {

                changed = true;
                this._frame_name = data.frame;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame);
            }
        } else if (this.current_population <= increments * 2) {
            if (this._frame_name != data.frame1) {
                changed = true;
                this._frame_name = data.frame1;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame1);
            }
        } else {
            if (this._frame_name != data.frame2) {
                changed = true;
                this._frame_name = data.frame2;
                this.game_logic._world_group.remove(this._base_sprite, true);
                this._base_sprite.visible = true;
                this._base_sprite = this.game_logic.game.add.sprite(_x, _y, data.sprite_sheet, data.frame2);
            }
        }

        if (changed) {
            this._create_animation.visible = false;
            this._base_sprite.visible = true;
            this._base_sprite.anchor = new Phaser.Point(0.5, 0.5);

            this.game_logic._world_group.add(this._base_sprite);
            this._base_sprite.width = 80;
            this._base_sprite.height = 60;
        }


    }

}