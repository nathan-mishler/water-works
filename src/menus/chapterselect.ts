import {MuteButton} from "../ui_objects/mute_button";

export class ChapterSelect extends Phaser.State{
    private _menu_group:Phaser.Group;
    private background:Phaser.Sprite;
    private level_buttons:Phaser.Sprite[];
    private completed_levels:string[];
    private level_data:Object[];

    mute_button:MuteButton;
    home_button:Phaser.Button;

    create(){
        this._menu_group = this.game.add.group();
        this.mute_button = this.game.add.existing(new MuteButton(this.game, 20, this.game.world.height -100, this));
        this.home_button = this.game.add.button(120, this.game.world.height - 95, "watergame", ()=>{this.game.state.start("MainMenu")}, this, null, "home_icon");
        this.background = this.game.add.sprite(0, 0, "level_select_bg");
        this._menu_group.add(this.background);
        this._menu_group.add(this.home_button);
        this.completed_levels = JSON.parse(localStorage.getItem("completed_levels")) || [];


        this.level_data = this.game.cache.getJSON("level_data");
        for(let i = 0; i < this.level_data.length; i++){
            let level = this.level_data[i];
            let level_id:string = level["level_id"];

            let sprite = this.game.add.sprite(0,0, level["sheet"], level["frame"]);
            let enabled = i==0 || i <= this.completed_levels.length;
            let button = this.createLevelButton(sprite, level_id, level["x"], level["y"], enabled);
            this._menu_group.add(button);
        }
    }

    createLevelButton(sprite:Phaser.Sprite, levelid:string, x:number, y:number, enabled:boolean):Phaser.Group{
        let button_group = this.game.add.group();
        button_group.x = x;
        button_group.y = y;
        sprite.anchor = new Phaser.Point(0.5, 0.5);
        button_group.add(sprite);
        if(this.completed_levels.indexOf(levelid.toString()) > -1){
            let green_bg = this.game.add.sprite(0, 0, "chapterselect", "career_green", button_group);
            green_bg.anchor = new Phaser.Point(0.5, 0.5);
        }
        if(enabled){
            let yellow_bg = this.game.add.sprite(0, 0, "chapterselect", "career_yellow", button_group);
            yellow_bg.anchor = new Phaser.Point(0.5, 0.5);
            yellow_bg.visible = false;
            sprite.inputEnabled = true;
            sprite.events.onInputOver.add(()=>{
                yellow_bg.visible = true;
                this.game.canvas.style.cursor = "pointer";
            });
            sprite.events.onInputOut.add(()=>{
                yellow_bg.visible = false;
                this.game.canvas.style.cursor = "default";
            });
            sprite.events.onInputDown.add(()=>{
                this.InitGame(levelid);
            });
        } else {
            sprite.tint = 0x666666;
        }
        return button_group;
    }

    InitGame(level:string){
        this.game.state.start("GameLogic", true, false, {level: level});
    }


}