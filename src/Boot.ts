export class Boot extends Phaser.State{
    preload(){
        this.load.image("menu_background", "sprites/unpacked/main_menu/background.png");
    }
    create(){
        this.game.input.maxPointers = 1;
        this.game.state.start("LoadScreen");
    }
}