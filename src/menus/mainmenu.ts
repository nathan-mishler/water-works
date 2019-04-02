import {GameLogic} from "../gamelogic";
import {AudioManager} from "../audio";
import {MuteButton} from "../ui_objects/mute_button";

export class MainMenu extends Phaser.State{
    _menu_group:Phaser.Group;

    background:Phaser.Sprite;
    career_button:Phaser.Button;
    sandbox_button:Phaser.Button;
    about_button:Phaser.Button;
    how_to_button:Phaser.Button;

    mute_button:MuteButton;

    create(){
        this._menu_group = this.game.add.group();
        this.background = this.game.add.sprite(0, 0, "menu_background");
        this._menu_group.add(this.background);

        this.career_button = this.game.add.button(this.game.world.centerX,260,"watergame", this.SelectLevel, this, "menu_buttons/career_glow", "menu_buttons/career", null, null, this._menu_group);
        this.career_button.anchor = new Phaser.Point(0.5,0.5);

        // TODO: Make this open sandbox mode when sandbox mode exists
        this.sandbox_button = this.game.add.button(this.game.world.centerX,330,"watergame", this.StartSandbox, this, "menu_buttons/sandbox_glow", "menu_buttons/sandbox", null, null, this._menu_group);
        this.sandbox_button.anchor = new Phaser.Point(0.5,0.5);

        this.how_to_button = this.game.add.button(this.game.world.centerX,400,"watergame", this.ViewHowTo, this, "menu_buttons/how_to_play_glow", "menu_buttons/how_to_play", null, null, this._menu_group);
        this.how_to_button.anchor = new Phaser.Point(0.5,0.5);

        this.about_button = this.game.add.button(this.game.world.centerX,470,"watergame", this.ViewAbout, this, "menu_buttons/about_glow", "menu_buttons/about", null, null, this._menu_group);
        this.about_button.anchor = new Phaser.Point(0.5,0.5);

        this.mute_button = this.game.add.existing(new MuteButton(this.game, 20, this.game.world.height -120, this));

        AudioManager.playMusic("main_theme");
    }
    SelectLevel(){
        this.game.state.start("ChapterSelect", true, false);
    }
    StartSandbox(){

        this.InitGame("sandbox");
    }
    private ViewHowTo(){
        window.location.assign("howtoplay.html");
    }
    private ViewAbout(){
        window.location.assign("about.html");
    }
    destroy(){
        this._menu_group.destroy(true);
    }
    InitGame(level:string){
        this.game.state.start("GameLogic", true, false, {level: level});
    }
}
