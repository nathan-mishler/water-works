import {SpeechBubble} from "./speech_bubble";
import {GameLogic} from "../gamelogic"

export class Notification extends Phaser.Group{

    private _speech_bubble:SpeechBubble;
    private _portrait:Phaser.Image;

    _help_button:Phaser.Button;
    _help_button_text:Phaser.Text;

    _game:GameLogic;

    public set text(_text:string){
        this._speech_bubble.text = _text;
    }

    constructor(game:Phaser.Game, _logic:GameLogic){
        super(game);
        this._game = _logic;
        this._speech_bubble = new SpeechBubble(game, 130, 40, 300, "");
        this._speech_bubble.visible = false;
        this.add(this._speech_bubble);

        this._portrait = new Phaser.Image(game, 10, 10, "cb");
        this.add(this._portrait);

        this._portrait.inputEnabled = true;
        this._portrait.events.onInputDown.add(()=>{
            this._game._world.ShowGoalText();
        });

        // Add the help button
        this._help_button = game.add.button(10, this._portrait.y + this._portrait.height, 'buttonbg', this.HelpClick, this, 2, 1, 0);
        this._help_button_text = new Phaser.Text(game, 0, 0,"help", {align: "center", wordWrap: true, wordWrapWidth: 100});



        this.addChild(this._help_button);

        this._help_button.addChild(this._help_button_text);
        this._help_button_text.x = this._help_button.width/2 - this._help_button_text.width/2;
        this._help_button_text.y = this._help_button.height/2 - this._help_button_text.height/2;

        this._help_button.scale = new Phaser.Point(.5, .5);
    }

    HelpClick() {
        this._game._world.ShowHelpText();
    }

    HidePortrait() {
        this._portrait.visible = false;
        this._help_button.visible = false;

    }

    ShowPortrait() {
        this._portrait.visible = true;
        this._help_button.visible = true;
    }

    showMessage(text:string){
        this._speech_bubble.text = text;
        this._speech_bubble.visible = true;
    }
    hideMessage(){
        this._speech_bubble.visible = false;
    }

}