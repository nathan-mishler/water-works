export class SpeechBubble extends Phaser.Group{

    private _text:Phaser.Text;

    private _arrow_size:number = 12;
    private _arrow_position:number = 20;

    private _rect_radius = 15;
    private _graphics:Phaser.Graphics;

    public set text(text:string){
        this._text.text = text;
        this.render();
    }
    public set width(n:number){
        this._text.wordWrapWidth = n;
        this.render();
    }

    constructor(game:Phaser.Game, x:number = 0, y:number = 0, width:number = 300, text:string = ""){
        super(game);

        this.x = x;
        this.y = y;

        // Create and add text
        this._text = new Phaser.Text(game, 10, 10, text, {font: "20px sans-serif", wordWrap: true, wordWrapWidth: width});

        this._graphics = new Phaser.Graphics(game,0, 0);

        this.add(this._graphics);
        this.add(this._text);

        this.render();
    }

    private render(){
        this._graphics.clear();
        this._graphics.beginFill(0xffffff);
        this._graphics.drawRoundedRect(0,0,this._text.width+20, this._text.height+20, this._rect_radius);
        //this._graphics.drawPolygon(this._arrow);
        this._graphics.drawTriangle([
            new Phaser.Point(0,this._arrow_position),
            new Phaser.Point(0, this._arrow_position + this._arrow_size),
            new Phaser.Point(-Math.sqrt(Math.pow(this._arrow_size, 2) + Math.pow(this._arrow_size/2, 2)), this._arrow_position + this._arrow_size/2)]);
    }
}