import {SpeechBubble} from "./speech_bubble";
import {GameLogic} from "../gamelogic";

export class InfoPanel extends Phaser.Group{

    private _text_array:string[];
    private _text_position:number;
    private _speech_bubble:SpeechBubble;
    private _portrait_neutral:Phaser.Image;
    private _portrait_win:Phaser.Image;
    private _blocker:Phaser.Image;
    private _finish:Phaser.Image;

    private game_logic:GameLogic;

    public set text(_text:string){
        this._text_array = _text.split("|");
        this._text_position = 0;
        this._speech_bubble.text = this._text_array[this._text_position];
    }

    constructor(game:Phaser.Game, _game_logic:GameLogic){
        super(game);

        this.game_logic = _game_logic;


        this._blocker = new Phaser.Image(game, 0, 0, "cb_blocker");
        this._blocker.alpha = 0.2;
        this._blocker.inputEnabled = true;
        this._blocker.input.priorityID = 0;
        this.add(this._blocker);


        this._speech_bubble = new SpeechBubble(game, 300, 150, 300, "");
        this.add(this._speech_bubble);

        this._portrait_neutral = new Phaser.Image(game, 0, 80, "cb_full");
        this._portrait_neutral.x = 100;
        this.add(this._portrait_neutral);

        this._portrait_win = new Phaser.Image(game, 0, 50, "cb_win");
        this._portrait_win.width = this._portrait_win.width * .75;
        this._portrait_win.height = this._portrait_win.height * .75;
        this._portrait_win.x = 50;
        this.add(this._portrait_win);

        this._finish = new Phaser.Image(game, 350, 475, "cb_finish");
        this.add(this._finish);

        game.input.onDown.add(this.Clicked, this);

        // add an ok button

    }

    // IsVisible() {
    //     // return this.is_visible;
    //     return this.visible
    // }

    Clicked() {
        //if(this.is_visible){
        if(this.visible){
            if(this._portrait_neutral.visible == true){
                if(this._text_position === this._text_array.length - 1){
                    this.hideMessage();
                    // unpause world
                } else {
                    this._text_position++;
                    this._speech_bubble.text = this._text_array[this._text_position];
                }
            }else{
                // quit to main menu

                if( this.game_logic._world.survey_url == "" ) {
                    this.game.state.start("ChapterSelect", true, false);
                }else{
                    this.game_logic.OpenSurvey(this.game_logic._world.survey_url);
                    this.game.state.start("ChapterSelect", true, false);
                }
            }
        }

    }

    showMessageInfo(text:string){
        this._blocker.input.priorityID = 100000;
        this.game_logic.Pause();
        this.visible = true;
        this.text = text;
        this._portrait_neutral.visible = true;
        this._portrait_win.visible =  false;
    }

    showMessageWin(text:string){
        console.log("win!");
        this._blocker.input.priorityID = 100000;
        this.visible = true;
        this.text = text;
        this._portrait_neutral.visible = false;
        this._portrait_win.visible =  true;
    }

    hideMessage(){
        this._blocker.input.priorityID = 0;
        this.game_logic.UI.notification.ShowPortrait();
        this.game_logic.UnPause();
        this.visible = false;
    }

}