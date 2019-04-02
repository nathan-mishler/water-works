/**
 * Created by nathanmishler on 2/14/17.
 */
import {BaseTile} from "../base_tile"
import {GameLogic} from "../gamelogic"
import {TileData} from "../tiledata";
import Point = Phaser.Point;

export class AquiferTile extends BaseTile {

    _foreground:Phaser.Sprite;
    _mask:Phaser.Graphics;
    _test:Phaser.Graphics;

    _foreground_start_pos:number;

    constructor(_game: GameLogic, x: number, y: number) {
        super(_game, x, y);
        this._base_sprite.destroy();
        this._touch_sprite.destroy();

        this._foreground = this.game_logic.game.add.sprite(0, 0, "aquifer_foreground");

        let x_pos:number = 530;
        let y_pos:number = 600 - this._foreground.height;

        this.game_logic._world_group.add(this._foreground);

        this._foreground.x = x_pos;
        this._foreground.y = this._foreground_start_pos =  y_pos;

        this._mask = this.game_logic.game.add.graphics(0, 0);
        this.game_logic._world_group.add(this._mask);
        //	Shapes drawn to the Graphics object must be filled.
       this._mask.beginFill(0xffffff);

        //	Here we'll draw a circle
        // you can also use rectangle... for the mask shape.
        // see this example https://phaser.io/examples/v2/sprites/mask
        let poly = new Phaser.Polygon( [ new Phaser.Point(530, 541), new Phaser.Point(711, 450), new Phaser.Point(711, 544), new Phaser.Point(530, 631)]  );
        //this._mask.drawPolygon( poly );
        this._mask.endFill();

        //this._foreground.mask = this._mask;

        let ellipse = new Phaser.Ellipse(620, 541, 181, 90);
        this._test = this.game_logic.game.add.graphics(620,541);
        this._test.angle = -25;
        this._test.beginFill(0xffffff);
        this._test.drawEllipse(0, 0, 90, 45);
        this._test.endFill();
        this._foreground.mask = this._test;

    }

    SetPosition() {
        let _possible_distance = 550 - this._foreground_start_pos;

        let _percent_unfilled = (this.max_water_storage - this.current_water_storage) / this.max_water_storage;

        this._foreground.y = this._foreground_start_pos + ( _possible_distance * _percent_unfilled );
        
    }

}