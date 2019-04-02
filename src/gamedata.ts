export class GameData{
    private static _instance:GameData = new GameData();
    private _game:Phaser.Game;
    private _game_data:Object;

    public static get Instance():GameData{
        return this._instance;
    }

    public static init(game:Phaser.Game){
        this._instance._game = game;
        this._instance._game_data = game.cache.getJSON("vars");
    }
    public static getVar(key:string){
       if(this._instance._game_data.hasOwnProperty(key)){
            return this._instance._game_data[key];
        } else {
            console.log("Not found..." + key);
            throw new Error("Tile type " + key + " not found in TileData.");
        }
    }

}