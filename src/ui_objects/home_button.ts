/**
 * Created by nathanmishler on 2/7/18.
 */
/**
 * Created by nathanmishler on 2/6/18.
 */

import {GameLogic} from "../gamelogic";
import {SpeechBubble} from "./speech_bubble";

export class HomeButton extends Phaser.Group {

    game_logic: GameLogic;

    private home_button: Phaser.Button;

    private yes_button: Phaser.Button;
    private no_button: Phaser.Button;
    private _text:Phaser.Text;
    private _graphics:Phaser.Graphics;
    private _modal_group:Phaser.Group;

    public get modal_visible(){
        return this._modal_group.visible;
    }

    constructor(game: Phaser.Game, logic: GameLogic) {
        super(game);
        this.game_logic = logic;

        // Create button
        this.home_button = this.game.add.button(this.game.world.width - 100, this.game.world.height - 95, "watergame", ()=>{this.Clicked();}, this, null, "home_icon");
        this.add(this.home_button);

        // Create modal
        this._text = new Phaser.Text(game, this.game.width / 2, this.game.height/2, "Quit and return to Main Menu?", {font: "20px sans-serif", wordWrap: false});
        this._text.x = this._text.x - this._text.width / 2;

        this._graphics = new Phaser.Graphics(game,this._text.x-10, this._text.y - this._text.height/2);
        this._graphics.clear();
        this._graphics.beginFill(0xffffff);
        this._graphics.drawRoundedRect(0,0,this._text.width+20, this._text.height+20, 15);

        this.yes_button = this.game.add.button(this._text.x + 30, this._text.y + this._text.height - 5, "yes_button", ()=>{this.YesClicked();}, this, null);
        this.no_button = this.game.add.button(this._text.x + 160, this._text.y + this._text.height - 5, "no_button", ()=>{this.NoClicked();}, this, null);

        this._modal_group = game.add.group();
        this._modal_group.add(this._graphics);
        this._modal_group.add(this._text);
        this._modal_group.add(this.yes_button);
        this._modal_group.add(this.no_button);
        this._modal_group.visible = false;
    }

    Clicked() {

        this._modal_group.visible = true;

        this.game_logic.Pause();

    }

    YesClicked() {

        this.game.state.start("MainMenu", true, false);

    }

    NoClicked() {

        this._modal_group.visible = false;
        // this._graphics.visible = false;
        // this._text.visible = false;
        // this.yes_button.visible = false;
        // this.no_button.visible = false;

        this.game_logic.UnPause();

    }

}
