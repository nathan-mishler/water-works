import Texture = PIXI.Texture;

export class ConstructionButton extends Phaser.Sprite{
    item_data:Object;
    enabled:boolean = true;

    constructor(game:Phaser.Game, x:number, y:number, item_data:Object){
        super(game, x, y, item_data["sheet"], item_data["frame"]);
        this.item_data = item_data;
    }

    enable(callback:Function, context){
        this.enabled = true;
        this.events.onInputDown.add(callback, context, 10, this.item_data["type"]);
        this.tint = 0xFFFFFF;
    }

    disable(){
        this.enabled = false;
        this.events.onInputDown.removeAll();
        this.tint = 0x999999;
    }

}