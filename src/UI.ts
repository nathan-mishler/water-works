/**
 * Created by nathanmishler on 3/15/17.
 */

import {Notification} from "./ui_objects/notification";
import {InfoPanel} from "./ui_objects/info_panel";
import {GameLogic} from "./gamelogic";
import {PauseButton} from "./ui_objects/pause_button";
import {DeleteButton} from "./ui_objects/delete_button";
import {RepairButton} from "./ui_objects/repair_button";
import {HomeButton} from "./ui_objects/home_button";


export class UI extends Phaser.Group{

    population_icon:Phaser.Sprite;
    population_text:Phaser.Text;

    money_icon:Phaser.Sprite;
    money_text:Phaser.Text;

    notification:Notification;

    pause_button:PauseButton;

    delete_button:DeleteButton;

    repair_button:RepairButton;

    info_panel:InfoPanel;

    game_logic:GameLogic;

    home_button:HomeButton;

    policy_button:Phaser.Button;

    constructor (game:Phaser.Game, _game_logic:GameLogic ) {
        super(game);

        this.game_logic = _game_logic;

        this.population_icon = this.game.add.sprite(650, 100, 'watergame', "population_icon");
        this.population_icon.anchor = new Phaser.Point(0.5, 0.5);
        this.population_icon.scale = new Phaser.Point(.5, .5);
        this.add(this.population_icon);


        this.population_text = new Phaser.Text(this.game, 700, 100, "0");
        this.population_text.anchor = new Phaser.Point(0.5, 0.5);
        this.add(this.population_text);

        this.money_icon = this.game.add.sprite(650, 50, 'watergame',  "money_icon");
        this.money_icon.anchor = new Phaser.Point(0.5, 0.5);
        this.money_icon.scale = new Phaser.Point(.5, .5);
        this.add(this.money_icon);

        this.money_text = new Phaser.Text(this.game, 700, 50, "0");
        this.money_text.anchor = new Phaser.Point(0.5, 0.5);
        this.add(this.money_text);

        this.notification = new Notification(game, _game_logic);
        this.add(this.notification);

        this.pause_button = new PauseButton(game, _game_logic);
        this.add(this.pause_button);

        this.info_panel = new InfoPanel(game, _game_logic);
        this.add(this.info_panel);

        this.delete_button = new DeleteButton(game, _game_logic);
        this.add(this.delete_button);

        this.repair_button = new RepairButton(game, _game_logic);
        this.add(this.repair_button);

        this.home_button = new HomeButton(game, _game_logic);
        this.add(this.home_button);

        this.policy_button = game.add.button(230, 500, "watergame",()=>{
            _game_logic._policy_menu.Open();
            game.canvas.style.cursor = "default";
        }, this, null, "policy_icon");

        this.add(this.policy_button);


    }

    IsAModalOpen(){
        return this.info_panel.visible || this.home_button.modal_visible || this.game_logic._policy_menu.visible;
    }

    SetPopulation(pop:number) {
        this.population_text.text = pop.toString();
    }

    SetMoney(money:number) {
        //console.log("setting money");
        let abbr;
        let substr_len;
        if(money >= 1e12) {
            abbr = 'T';
            substr_len = 12;
        }
        else if(money >= 1e9) {
            abbr = 'B';
            substr_len = 9;
        }
        else if(money >= 1e6) {
            abbr = 'M';
            substr_len = 6;
        }
        else if(money >= 1e4) {
            abbr = 'K';
            substr_len = 3;
        }
        else {
            abbr = '';
            substr_len = 0;
        }
        let adjusted_money = money.toString();
        adjusted_money = adjusted_money.substr(0, adjusted_money.length - substr_len) + abbr;
        this.money_text.text = adjusted_money;
    }

}