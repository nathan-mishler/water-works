/**
 * Created by nathanmishler on 2/7/18.
 */
/**
 * Created by nathanmishler on 2/6/18.
 */

import {GameLogic} from "../gamelogic";

export class DeleteButton extends Phaser.Group{

    private _on:Phaser.Image;
    private _off:Phaser.Image;

    game_logic:GameLogic;

    _game:Phaser.Game;

    constructor(game:Phaser.Game, logic:GameLogic){
        super(game);
        this._game = game;
        this.game_logic = logic;

        this._on = new Phaser.Image(game, 100, 500, "delete_on");
        this._on.inputEnabled = true;
        this._on.visible = false;
        this.add(this._on);

        this._off = new Phaser.Image(game, 100, 500, "delete_off");
        this._off.inputEnabled = true;
        this._off.visible = true;
        this.add(this._off);

        game.input.onDown.add(this.Clicked, this);
    }

    GetIsDeleteMode() {
        return this._on.visible;
    }

    Clicked( ){

        if(this._on.input.pointerOver() || this._off.input.pointerOver()) {

            this._on.visible = !this._on.visible;
            this._off.visible = !this._off.visible;

            if (this._off.visible) {
                this.game_logic.EndDeleteMode();
            } else {
                this.game_logic.StartDeleteMode();
            }
        }
    }

    TurnOff() {
        this._on.visible = false;
        this._off.visible = true;

        this.game_logic.EndDeleteMode();
    }

}