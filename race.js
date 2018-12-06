let app = null;

window.addEventListener("load", function () {
    app = new PIXI.Application({
        width: 1100,
        height: 600,
        antialias: true,
        backgroundColor: 0x00FF00
    });
    document.body.appendChild(app.view);


    app.renderer.autoResize = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);

    PIXI.loader.add("horse_a", "HorseA.png").add("horse_b", "HorseB.png").load();

    PIXI.loader.onComplete.add(resources_loaded);
});

function resources_loaded() {
    define_horses();
    define_race_track();
    define_gamepads();
    define_player_id_box();
    define_separators();
}

function define_gamepads() {
    window.gamepad = new Gamepad();
    window.gamepadHorseArray = Array();

    gamepad.bind(Gamepad.Event.CONNECTED, function (device) {
        // console.log('Connected', device);
        gamepadHorseArray[device.index] = window.horses.pop();
    });

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
        let horse = gamepadHorseArray[e.gamepad.index];
        horse.position.x += 1;
    });

    gamepad.bind(Gamepad.Event.TICK, function (gamepads) {
        for (let i = 0; i < gamepads.length; i += 1) {
            let _gamepad = gamepads[i];

            let horse = gamepadHorseArray[_gamepad.index];
            horse.position.x += _gamepad.axes[6];
            // horse.position.y += _gamepad.axes[7];
        }

    });

    gamepad.bind(Gamepad.Event.DISCONNECTED, function (device) {
        // console.log('Disconnected', device);
        let horse = gamepadHorseArray[device.index];
        horses.push(horse);
        window.stage.removeChild(horse);
    });

    console.log("Gamepad defined!");
    gamepad.init();
}

function define_horses() {
    const horseATex = PIXI.utils.TextureCache["horse_a"];
    const horseBTex = PIXI.utils.TextureCache["horse_b"];

    const horseASprite = new PIXI.Sprite(horseATex);
    const horseBSprite = new PIXI.Sprite(horseBTex);

    console.log("all loaded!");

    window.horses = [horseASprite, horseBSprite];
    window.stage = app.stage;

    horseASprite.scale.x = .1;
    horseASprite.scale.y = .1;

    horseASprite.position.x = 40;
    horseASprite.position.y = 23;

    horseBSprite.scale.x = .1;
    horseBSprite.scale.y = .1;

    horseBSprite.position.x = -15;
    horseBSprite.position.y = 133;

}

function define_race_track() {
    window.race_track_container = new PIXI.Container({
        width: 900,
        height: 200
    });
    race_track_container.position.x = 200;

    let race_track_ground = new PIXI.Graphics();
    race_track_ground.beginFill(0xff8000);
    race_track_ground.drawPolygon([100, 0, 0,200, 900,200, 1000,0]);
    race_track_ground.position.set(30, 10);

    for (let i = 0; i < 10; i += 1) {
        race_track_ground.lineStyle(5, 0xeeeeee).moveTo((i+1) * 100, 0).lineTo(i*100, 200);
    }

    race_track_container.addChild(race_track_ground, horses[0], horses[1]);
    window.stage.addChild(race_track_container);
}

function define_player_id_box() {
    window.player_ids_container = new PIXI.Container({
        width: 200,
        height: 200
    });
    let p1Text = new PIXI.Text('P1', {fontFamily: 'DisposableDroidBB', fontSize: 80, fill: 0x000000, align: 'center'});
    let p2Text = new PIXI.Text('P2', {fontFamily: 'DisposableDroidBB', fontSize: 80, fill: 0x000000, align: 'center'});
    p1Text.position.set(120, 20);
    p2Text.position.set(70, 120);


    player_ids_container.addChild(p1Text, p2Text);
    window.stage.addChild(player_ids_container);
}

function define_separators() {
    let race_track_separator = new PIXI.Graphics();
    race_track_separator.position.set(0, 110);
    race_track_separator.lineStyle(5, 0x444444).moveTo(0, 0).lineTo(1200, 0);

    let box_separator = new PIXI.Graphics();
    box_separator.position.set(250, 0);
    box_separator.lineStyle(5, 0x444444).moveTo(0, 0).lineTo(-110, 220);
    window.stage.addChild(race_track_separator, box_separator)
}