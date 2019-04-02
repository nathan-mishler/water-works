/// <reference path="../lib/phaser.d.ts"/>
import {GameLogic} from "./gamelogic";
import {AudioManager} from "./audio";
import {LoadScreen} from "./menus/loading";
import {Boot} from "./Boot";
import {MainMenu} from "./menus/mainmenu";
import {ChapterSelect} from "./menus/chapterselect";
import Input = Phaser.Input;

class WaterGame extends Phaser.Game{

    constructor() {
        super(800, 600, Phaser.AUTO, "gameDiv", null);


        //this.state.add("LoadScreen", LoadScreen, false);
        this.state.add("Boot", Boot, false);
        this.state.add("LoadScreen", LoadScreen, false);
        this.state.add("MainMenu", MainMenu, false);
        this.state.add("ChapterSelect", ChapterSelect, false);
        this.state.add("GameLogic", GameLogic, false);

        AudioManager.init(this);

        this.state.start("Boot");
    }
}

window.onload = () => {
    let this_game = new WaterGame();
    let closeSurvey = document.getElementById("closeSurvey");
    closeSurvey.addEventListener("click", ()=> {
        console.log("click");
        let surveyWrap = document.getElementById("surveyWrap");
        //console.log(surveyWrap);
        surveyWrap.style.visibility = "hidden";
    })
};
