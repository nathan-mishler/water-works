/**
 * Created by nathanmishler on 4/5/18.
 */
import {SpeechBubble} from "./speech_bubble";
import {GameLogic} from "../gamelogic"

export class EventPanel extends Phaser.Group{

    private _speech_bubble:SpeechBubble;
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

    }

    showMessage(text:string){
        this._speech_bubble.text = text;
        this._speech_bubble.visible = true;
    }
    hideMessage(){
        this._speech_bubble.visible = false;
    }

}