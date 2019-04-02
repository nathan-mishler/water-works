export class TileData{
    private static _instance:TileData = new TileData();
    private _game:Phaser.Game;
    private _tile_data:Object;

    public static get Instance():TileData{
        return this._instance;
    }

    public static init(game:Phaser.Game){
        this._instance._game = game;
        this._instance._tile_data = game.cache.getJSON("tile_data");
    }
    public static getTile(key:string){
        if(key === "BaseTile"){
            return this._instance._tile_data["default"];
        } else if(this._instance._tile_data.hasOwnProperty(key)){
            //console.log("Found " + key);
            return {...this._instance._tile_data["default"], ...this._instance._tile_data[key]};
        } else {
            //console.log("Not found..." + key);
            throw new Error("Tile type " + key + " not found in TileData.");
        }
    }
    public static getTileByType(type:string){

        for(let key in this._instance._tile_data){
            //console.log(key);
            //console.log(this._instance._tile_data[key].name);
            if(this._instance._tile_data.hasOwnProperty(key) &&
                (this._instance._tile_data[key].name === type ||
                    (this._instance._tile_data[key].hasOwnProperty("upgrades") && this._instance._tile_data[key].upgrades.hasOwnProperty(type)))){

                return this._instance._tile_data[key];
            }
        }
    }
}