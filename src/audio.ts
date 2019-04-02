export class AudioManager{
    private _game:Phaser.Game;
    private static _instance:AudioManager = new AudioManager();
    private _sounds:{[k:string]:Phaser.Sound} = {};
    private _current_music:Phaser.Sound;

    private constructor(){

    }

    public static get volume():number{
        if(this._instance._game){
            return AudioManager.Instance._game.sound.volume;
        }
    }

    public static get muted():boolean{
        return this._instance._game.sound.mute;
    }

    public static init(game:Phaser.Game){
        this._instance._game = game;
    }

    public static get Instance():AudioManager{
        return this._instance;
    }

    public static RegisterSound(key:string, loop:boolean = false){
        if (this._instance._sounds.hasOwnProperty(key)){
            // TODO: Handle duplicate sound IDs more gracefully
            console.error("Sound with id \"" + key + "\" already exists.");
        } else if (this._instance !== null){
            this._instance._sounds[key] = this._instance._game.add.sound(key, 1, loop, true);
        } else {
            console.error("Sounds cannot be registered before AudioManger.init has been called.")
        }
    }

    public static play(key:string){
        this._instance._sounds[key].play();
    }

    // Stop the currently playing music, and start a new track
    public static playMusic(key:string){
        console.log(this._instance._sounds);
        if(this._instance._current_music){
            this._instance._current_music.stop();
        }
        this._instance._current_music = this._instance._sounds[key];
        this._instance._current_music.play();

    }

    public static toggleMute(){
        if(AudioManager.Instance._game.sound.mute){
            AudioManager.Instance._game.sound.mute = false;
            localStorage.setItem("mute", "false");
        } else {
            AudioManager.Instance._game.sound.mute = true;
            localStorage.setItem("mute", "true");
        }
    }
}