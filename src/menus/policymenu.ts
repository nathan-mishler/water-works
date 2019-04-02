import {PolicyOption} from "../ui_objects/policy_option";
import {GameData} from "../gamedata";
import {GameLogic} from "../gamelogic"

export class PolicyMenu extends Phaser.Group {

    private _top_margin = 10; // percent distance from top edge
    private _left_margin = 10; // percent distance from left edge

    readonly _vertical_margin: number; // calculated distance from top and bottom edges
    readonly _horizontal_margin: number; // calculated distance from left and right edges
    private _policy_buttons: PolicyOption[] = [];

    private _game_logic:GameLogic;

    private _policy_data = [
        {id: "no_policy", text: "No Policy"},
        {id: "policy1", text: "Increase Water Cost"},
        {id: "policy2", text: "Every 5% decrease in water cost \n increases incoming population by 1%"}

    ];

    _padding = 15; // pixel distance between edge of modal and content

    policy1buttontext:Phaser.Text;
    policy1button:Phaser.Button;

    policy2buttontext:Phaser.Text;
    policy2button:Phaser.Button;

    policy3buttontext:Phaser.Text;
    policy3button:Phaser.Button;
    
    
    constructor(game: Phaser.Game, logic: GameLogic) {
        super(game);

        this._game_logic = logic;

        let graphics = game.add.graphics(0, 0, this);
        graphics.inputEnabled = true;
        graphics.input.useHandCursor = false;
        this.add(graphics);

        // create background fill
        graphics.beginFill(0xffffff, 0.3);
        graphics.drawRect(0,0, game.width, game.height);
        graphics.endFill();

        // calculate margins
        this._horizontal_margin = Math.floor(game.width / this._left_margin);
        this._vertical_margin = Math.floor(game.height / this._top_margin);

        // create menu background
        graphics.beginFill(0xffffff);
        graphics.drawRoundedRect(this._horizontal_margin, this._vertical_margin, game.width - (2 * this._horizontal_margin), game.height - (2 * this._vertical_margin), 15);
        graphics.endFill();

        // create title
        let title = new Phaser.Text(game, game.width/2 - this._horizontal_margin, this._vertical_margin + this._padding, "Water Usage Policies", {align: "center"});
        this.add(title);


        // Create Policy1 Item
        this.policy1button = game.add.button(0, title.y + title.height + 10, 'buttonbg', this.Policy1Click, this, 2, 1, 0);
        this.policy1buttontext = new Phaser.Text(game, 0, 0,"$"+GameData.getVar("policy1").cost.toString(), {align: "center", wordWrap: true, wordWrapWidth: 100});

        this.add(this.policy1button);
        this.policy1button.x = this._horizontal_margin + 10;
        this.policy1button.addChild(this.policy1buttontext);

        this.policy1buttontext.x = this.policy1button.width/2 - this.policy1buttontext.width/2;
        this.policy1buttontext.y = this.policy1button.height/2 - this.policy1buttontext.height/2;

        let policy1Explanation = new Phaser.Text(game, 0, 0,"Encourage Water Conservation: Reduce water use by " + (GameData.getVar("policy1").percent * 100).toString() + "% for residential areas only for " + (GameData.getVar("policy1").duration).toString() + " seconds.", {align: "left", wordWrap: true, wordWrapWidth: 500});
        policy1Explanation.fontSize = 18;

        this.policy1button.addChild(policy1Explanation);
        policy1Explanation.x = this.policy1button.width + 10;


        // Create Policy2 Items
        this.policy2button = game.add.button(this.policy1button.x, this.policy1button.y + this.policy1button.height + 50, 'buttonbg', this.Policy2Click, this, 2, 1, 0);
        this.policy2buttontext = new Phaser.Text(game, 0, 0, "Off", {align: "center", wordWrap: true, wordWrapWidth: 100});
        this.policy2button.addChild(this.policy2buttontext);


        this.add(this.policy2button);

        let policy2Explanation = new Phaser.Text(game, 0, 0,"Raise water rates: in Industrial, Residential, and Agricultural areas with a corresponding drop in population growth.", {align: "left", wordWrap: true, wordWrapWidth: 500});
        policy2Explanation.fontSize = 18;

        this.policy2button.addChild(policy2Explanation);
        policy2Explanation.x = this.policy2button.width + 10;

        let option = new PolicyOption(game, this._game_logic, "policy1", "text", GameData.getVar("policy2").min, GameData.getVar("policy2").max, null);
        //option.x = policy2Explanation.x;
        //option.y = policy2Explanation.y + policy2Explanation.height + 10;
        this.add(option);
        option.x = this._horizontal_margin + policy2Explanation.x + 20;
        option.y = game.height / 2 + 10;


        // Create Policy3 Item
        this.policy3button = game.add.button(0, this.policy2button.y + this.policy2button.height + 100, 'buttonbg', this.Policy3Click, this, 2, 1, 0);
        this.policy3buttontext = new Phaser.Text(game, 0, 0,"$"+GameData.getVar("policy3").cost.toString(), {align: "center", wordWrap: true, wordWrapWidth: 100});

        this.add(this.policy3button);
        this.policy3button.x = this._horizontal_margin + 10;
        this.policy3button.addChild(this.policy3buttontext);

        this.policy3buttontext.x = this.policy3button.width/2 - this.policy3buttontext.width/2;
        this.policy3buttontext.y = this.policy3button.height/2 - this.policy3buttontext.height/2;

        let policy3Explanation = new Phaser.Text(game, 0, 0,"Encourage growth: Purchase advertising. Growth rates and water consumption increase by  " + (GameData.getVar("policy3").percent * 100).toString() + "% for " + (GameData.getVar("policy1").duration).toString() + " seconds.", {align: "left", wordWrap: true, wordWrapWidth: 500});
        policy3Explanation.fontSize = 18;

        this.policy3button.addChild(policy3Explanation);
        policy3Explanation.x = this.policy3button.width + 10;



        //create close button
        let close = game.add.text(game.width-this._horizontal_margin - 40, this._vertical_margin, "×", {
            fontSize: 48
        });

        close.inputEnabled = true;
        close.input.useHandCursor = true;
        close.events.onInputUp.add(this.Close, this);
        this.add(close);

        this.visible = false;
    }

    Policy1Click() {

        if( !this._game_logic.policy1Active && this._game_logic._world.game_money >= GameData.getVar("policy1").cost ) {
            this._game_logic._world.game_money -= GameData.getVar("policy1").cost;
            this._game_logic.ActivatePolicy1();

        }

        this.Open();
    }

    Policy3Click() {

        if( !this._game_logic.policy3Active && this._game_logic._world.game_money >= GameData.getVar("policy3").cost ) {
            this._game_logic._world.game_money -= GameData.getVar("policy3").cost;
            this._game_logic.ActivatePolicy3();

        }

        this.Open();
    }

    Policy2Click() {

        this._game_logic.TogglePolicy2();

       this.Open();
    }

    Open() {
        this.visible = true;
        this._game_logic.Pause();

        // If a policy is on, make its button display duration
        if(this._game_logic.policy1Active){
            this.policy1buttontext.text = Math.floor(this._game_logic.policy1TimeLeft/60).toString();

        }else{
            this.policy1buttontext.text = "$"+GameData.getVar("policy1").cost.toString();
        }

        if(this._game_logic.policy3Active){
            this.policy3buttontext.text = Math.floor(this._game_logic.policy3TimeLeft/60).toString();

        }else{
            this.policy3buttontext.text = "$"+GameData.getVar("policy3").cost.toString();
        }

        if(this._game_logic.policy2Active){
            this.policy2buttontext.text = "On";

        }else{
            this.policy2buttontext.text = "Off";
        }


        this.policy1buttontext.x = this.policy1button.width/2 - this.policy1buttontext.width/2;
        this.policy1buttontext.y = this.policy1button.height/2 - this.policy1buttontext.height/2;

        this.policy2buttontext.x = this.policy2button.width/2 - this.policy2buttontext.width/2;
        this.policy2buttontext.y = this.policy2button.height/2 - this.policy2buttontext.height/2;

        this.policy3buttontext.x = this.policy3button.width/2 - this.policy3buttontext.width/2;
        this.policy3buttontext.y = this.policy3button.height/2 - this.policy3buttontext.height/2;

        if( this._game_logic.policy1Active || this._game_logic._world.game_money < GameData.getVar("policy1").cost ) {
            this.policy1button.tint = 0xC0C0C0;
        }else{
            this.policy1button.tint = 0xFFFFFF;
        }

        if( this._game_logic.policy3Active || this._game_logic._world.game_money < GameData.getVar("policy3").cost ) {
            this.policy3button.tint = 0xC0C0C0;
        }else{
            this.policy3button.tint = 0xFFFFFF;
        }

        if( this._game_logic.policy2Active ) {
            this.policy2button.tint = 0xC0C0C0;
        }else{
            this.policy2button.tint = 0xFFFFFF;
        }


    }

    Close() {
        this.visible = false;
        this._game_logic.UnPause();
    }

    GetPolicy () {
        let return_obj = {};

        for ( let i = 0; i < this._policy_buttons.length; i++ ){
            if(this._policy_buttons[i].is_selected){
                return_obj['id'] = this._policy_buttons[i].id;
                if(return_obj['id'] != "no_policy"){

                    let temp_percent:number = this._policy_buttons[i].percent;

                    if(return_obj['id'] == 'policy1' ){
                        return_obj['water_cost_change'] = temp_percent;
                        return_obj['population_modifier'] = -(temp_percent * 2);
                    }else{
                        return_obj['water_cost_change'] = -temp_percent;
                        return_obj['population_modifier'] = temp_percent / 5;
                    }

                }
            }
        }

        return return_obj;

    }





}