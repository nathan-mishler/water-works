import {AudioManager} from "../audio";

export class LoadScreen extends Phaser.State{
    background:Phaser.Sprite;
    text:Phaser.Text;

    preload(){
        // Main images pack
        this.load.atlasJSONArray('watergame', 'sprites/packed/water_game_packed_sprites-0.png', 'sprites/packed/water_game_packed_sprites-0.json');
        this.load.atlasJSONArray("chapterselect", "sprites/packed/level_select_sprites.png", "sprites/packed/level_select_sprites.json");

        // Animations for creating items
        this.load.atlasJSONArray('create_anims', 'sprites/packed/placement_animations.png', 'sprites/packed/placement_animations.json');

        // worlds
        this.load.image("world_agri", "sprites/unpacked/worlds/world_agri.jpg");
        this.load.image("world_arid", "sprites/unpacked/worlds/world_arid.jpg");
        this.load.image("world_agri_pol", "sprites/unpacked/worlds/world_agri_pollution.png");
        this.load.image("world_arid_pol", "sprites/unpacked/worlds/world_arid_pollution.png");
        this.load.image("world_happy", "sprites/unpacked/worlds/world_happy.jpg");
        this.load.image("world_happy_pol", "sprites/unpacked/worlds/happy_pollution_all.png");
        this.load.image("world_ind", "sprites/unpacked/worlds/world_ind.jpg");
        this.load.image("world_ocean", "sprites/unpacked/worlds/world_ocean.jpg");
        this.load.image("world_wet", "sprites/unpacked/worlds/world_wet.jpg");

        this.load.image("world_ind_pol", "sprites/unpacked/worlds/world_ind_pollution.png");
        this.load.image("world_ocean_pol", "sprites/unpacked/worlds/world_ocean_pollution.png");
        this.load.image("world_wet_pol", "sprites/unpacked/worlds/world_wet_pollution.png");


        // Aquifer
        this.load.image("aquifer_foreground", "sprites/unpacked/aquifer/foreground.png");
        this.load.image("aquifer_mask", "sprites/unpacked/aquifer/mask.png");

        // Single Images
        this.load.image("menu_background", "sprites/unpacked/main_menu/background.png");
        this.load.image("cb", "sprites/unpacked/CB_icon.png");
        this.load.image("level_select_bg", "sprites/unpacked/main_menu/career_no_arrows.png");
        this.load.image("cb_full", "sprites/unpacked/CB/CB_smaller_trimmed.png");
        this.load.image("cb_win", "sprites/unpacked/CB/CB_win.png");
        this.load.image("cb_blocker", "sprites/unpacked/CB/CB_blocker.png");
        this.load.image("cb_finish", "sprites/unpacked/CB/continue_button.png");
        this.load.image("pause", "sprites/unpacked/UI/pause.png");
        this.load.image("resume", "sprites/unpacked/UI/resume.png");
        this.load.image('delete_on', "sprites/unpacked/UI/trash_on.png");
        this.load.image('delete_off', "sprites/unpacked/UI/trash_off.png");
        this.load.image('delete_small', "sprites/unpacked/UI/trash_small.png");
        this.load.image("slider_down", "sprites/unpacked/UI/grey_sliderDown.png");
        this.load.image("slider_horizontal", "sprites/unpacked/UI/grey_sliderHorizontal.png");

        this.load.image('yes_button', "sprites/unpacked/UI/yes_button.png");
        this.load.image('no_button', "sprites/unpacked/UI/no_button.png");


        this.load.image('repair_on', "sprites/unpacked/UI/wrench_on.png");
        this.load.image('repair_off', "sprites/unpacked/UI/wrench_off.png");
        this.load.image('repair_small', "sprites/unpacked/UI/wrench_small.png");

        this.load.image('buttonbg', "sprites/unpacked/UI/buttonbg.png");

        // JSON
        this.load.json('tiles_json', 'map_editor_files/WaterGamePlaceableTiles.json');
        this.load.json('test_scene_json', 'map_editor_files/WaterGameTestScene.json');
        this.load.json("tile_data", "json/Tile.json");
        this.load.json("construction_menu_data", "json/ConstructionMenu.json");
        this.load.json("level_data", "json/Levels.json");
        this.load.json("vars", "json/Vars.json");

        // LEVEL JSON
        this.load.json('scenario_1', 'map_editor_files/Scenario_1.json');
        this.load.json('scenario_2', 'map_editor_files/Scenario_2.json');
        this.load.json('scenario_3', 'map_editor_files/Scenario_3.json');
        this.load.json('scenario_4', 'map_editor_files/Scenario_4.json');
        this.load.json('scenario_5', 'map_editor_files/Scenario_5.json');
        this.load.json('scenario_6', 'map_editor_files/Scenario_6.json');
        this.load.json('scenario_7', 'map_editor_files/Scenario_7.json');
        this.load.json('scenario_8', 'map_editor_files/Scenario_8.json');
        this.load.json('scenario_9', 'map_editor_files/Scenario_9.json');
        this.load.json('scenario_10', 'map_editor_files/Scenario_10.json');

        this.load.json('sandbox', 'map_editor_files/Sandbox.json');

        // Audio
        this.load.audio("main_theme", "sounds/theme.mp3");
        this.load.audio("agriculture", "sounds/agricultural.mp3");
        this.load.audio("lose", "sounds/lose.mp3");
        this.load.audio("win", "sounds/win.mp3");


    }

    create(){
        this.game.sound.mute = localStorage.getItem("mute") === "true";
        this.background = this.game.add.sprite(0, 0, "menu_background");
        this.text = this.game.add.text(this.game.world.centerX,250, "Loading", {font: "bold 36px sans-serif",});
        this.text.anchor = new Phaser.Point(0.5, 0.5);
        if(this.game.load.hasLoaded){
            this.InitMenu();
        } else{
            let show_menu_listener = this.game.load.onLoadComplete.add(()=>{
                this.InitMenu();
                show_menu_listener.detach();
            })
        }

    }
    InitMenu(){
        // Register all the audio before starting the game
        AudioManager.RegisterSound("main_theme", true);
        AudioManager.RegisterSound("agriculture", true);
        AudioManager.RegisterSound("lose");
        AudioManager.RegisterSound("win");
        this.game.state.start("MainMenu");
    }
}