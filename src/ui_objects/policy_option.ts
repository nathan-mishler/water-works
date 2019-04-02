import {GameLogic} from "../gamelogic"

import Rectangle = Phaser.Rectangle;
export class PolicyOption extends Phaser.Group{

    graphics:Phaser.Graphics;
    text:Phaser.Text;

    cost_text:Phaser.Text;
    population_growth_text:Phaser.Text;
    id:string;

    bounds:Rectangle;
    percent:number;
    public price:number = 0;
    public percent_population:number = 0;

    // Slider variables
    slider_track:Phaser.Image;
    slider_handle:Phaser.Image;

    public is_selected:boolean = false;

    min:number;
    max:number;

    _logic:GameLogic;

    constructor(game:Phaser.Game, logic:GameLogic,  id:string, text:string, min:number, max:number, callback:Function){
        super(game);
        this._logic = logic;
        this.id = id;
        this.min = min;
        this.max = max;
        //this.graphics = game.add.graphics(0, 0, this);
        //this.graphics.inputEnabled = true;
        //this.graphics.input.useHandCursor = true;
        //this.add(this.graphics);
        //this.text = game.add.text( 70, 15, text, {fontSize: 15}, this);
        //this.add(this.text);

        //this.graphics.events.onInputUp.add(()=>{
        //    callback(this);
        //});
        //this.setSelected(false);


        // Add slider down
        if( id != "no_policy") {
            this.slider_track = new Phaser.Image(game, 0, 0, "slider_horizontal");
            this.slider_track.width *= 2;
            this.slider_track.inputEnabled = false;
            this.add(this.slider_track);

            this.cost_text = game.add.text( this.slider_track.x + this.slider_track.width + 20, this.slider_track.y, "$" + min.toString(), {fontSize: 12}, this);
            this.cost_text.y -= this.cost_text.height;
            this.add(this.cost_text);

            this.population_growth_text = game.add.text( this.slider_track.x + this.slider_track.width + 20, this.slider_track.y, "%" + Math.floor(min/max * 100).toString(), {fontSize: 12}, this);
            //this.population_growth_text.y -= this.cost_text.height / 2;
            this.add(this.population_growth_text);

            this.slider_handle = new Phaser.Image(game, this.slider_track.x, this.slider_track.y, "slider_down");
            this.slider_handle.x -= this.slider_handle.width / 2;
            this.slider_handle.y -= this.slider_handle.height / 2;


            this.bounds = new Phaser.Rectangle(this.slider_track.x- this.slider_handle.width/2, this.slider_track.y - this.slider_handle.height/2, this.slider_track.width + this.slider_handle.width, 80);
            this.slider_handle.inputEnabled = true;
            this.slider_handle.input.enableDrag(false,false,false,255,this.bounds);
            this.slider_handle.input.allowVerticalDrag = false;
            this.slider_handle.events.onDragStop.add(this.setParameter, this);

            this.add(this.slider_handle);
        }


        this.setParameter();

    }

    setSelected(state:boolean){
        /*
        this.is_selected = state;

        this.graphics.clear();
        this.graphics.lineStyle(5, 0x000000, 1);
        if(state){
            this.graphics.beginFill(0x99ddaa, 1);
        } else {
            this.graphics.beginFill(0xffffff,1 );
        }
        this.graphics.drawCircle(30,30,50);
        this.graphics.endFill();
        */
    }


    setParameter() {

        this.percent =  (this.slider_handle.x - this.bounds.x + this.slider_handle.width/2) / (this.bounds.width );

        if(Math.floor(this.percent * 100) == 96){
            this.percent = 1;
        }

        if(Math.floor(this.percent * 100) == 3){
            this.percent = 0;
        }

        this.price = (this.max-this.min) * this.percent;

        this.cost_text.text = "Cost +$" + this.price.toFixed(2).toString();

        this.population_growth_text.text = "Pop Rt. " + Math.floor((1-this.percent) * 100).toString() + "%";

        this._logic.SetPolicy2Numbers(this.price, 1-this.percent);


    }






    /*

    function create() {

    //define the boundary of the handler
    bounds= new Phaser.Rectangle(100,190,500,80);
    var graphics = game.add.graphics(bounds.x, bounds.y);
    graphics.beginFill(0x000077);
    graphics.drawRect(0, 0, bounds.width, bounds.height);


    //add empty sprite for input detection
    sprite = game.add.sprite(100, 200,'object');
    sprite.scale.setTo(2);
    sprite.inputEnabled = true;
    sprite.input.enableDrag(false,false,false,255,bounds);
    sprite.input.allowVerticalDrag = false;
    sprite.events.onDragStop.add(setParameter, game);
    min=1;
}

    function update(){
}

    function render() {
    game.debug.inputInfo(32, 32);
    game.debug.text(min,200,200);
    game.debug.spriteInputInfo(sprite, 300, 32);
}

    function setParameter(){
    if(sprite.x>(bounds.width/2)+bounds.x){
        min=((bounds.width+bounds.x-sprite.x-sprite.width)/(bounds.width+bounds.x-sprite.width))*100;
    }
    if(sprite.x<(bounds.width/2)+bounds.x){
        min=((bounds.width+bounds.x-sprite.x)/(bounds.width))*100;
    }
}
*/


}