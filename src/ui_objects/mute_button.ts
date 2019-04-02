import {AudioManager} from "../audio";

// Initial mute state is set in LoadScreen.create() based on localStorage value
export class MuteButton extends Phaser.Button{

    constructor(game:Phaser.Game, x:number, y:number, context:Object){
        super(game, x, y, "watergame", null, context, null, null, null, null);
        this.onInputUp.add(this.toggleMute, this);
        this.frameName = localStorage.getItem("mute") === "true" ?  "mute_button/speaker_off" : "mute_button/speaker";
    }

    private toggleMute(){
        AudioManager.toggleMute();
        this.updateFrame();
    }

    private updateFrame(){
        this.frameName = AudioManager.muted ? "mute_button/speaker_off" : "mute_button/speaker";
    }
}