/**
 * Created by nathanmishler on 2/6/18.
 */

import {GameLogic} from "../gamelogic";

export class PauseButton extends Phaser.Group{

    private _resume:Phaser.Image;
    private _pause:Phaser.Image;

    game_logic:GameLogic;

    _game:Phaser.Game;

    constructor(game:Phaser.Game, logic:GameLogic){
        super(game);
        this._game = game;
        this.game_logic = logic;

        this._pause = new Phaser.Image(game, 50, 520, "pause");
        this._pause.inputEnabled = true;
        this._pause.visible = true;
        this.add(this._pause);

        this._resume = new Phaser.Image(game, 50, 520, "resume");
        this._resume.inputEnabled = true;
        this._resume.visible = false;
        this.add(this._resume);

        game.input.onDown.add(this.Clicked, this);
    }

    GetIsPaused() {
        return this._resume.visible;
    }

    Clicked( ){

        if(this._pause.input.pointerOver() || this._resume.input.pointerOver()) {

            this._resume.visible = !this._resume.visible;
            this._pause.visible = !this._pause.visible;

            if (this._pause.visible) {
                this.game_logic.UnPause();
            } else {
                this.game_logic.Pause();
            }
        }
    }

}