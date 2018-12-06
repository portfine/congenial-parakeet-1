let app = null;

window.addEventListener("load", function () {
    app = new PIXI.Application({
        width: 800,
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
    const horseATex = PIXI.utils.TextureCache["horse_a"];
    const horseBTex = PIXI.utils.TextureCache["horse_b"];

    const horseASprite = new PIXI.Sprite(horseATex);
    const horseBSprite = new PIXI.Sprite(horseBTex);

    console.log("all loaded!");

    window.horses = [horseASprite, horseBSprite];
    window.stage = app.stage;
    horseASprite.scale.x = .1;
    horseASprite.scale.y = .1;
    horseBSprite.scale.x = .1;
    horseBSprite.scale.y = .1;
    horseBSprite.position.x = 10;
    horseBSprite.position.y = 20;

    define_gamepads();
}

function define_gamepads() {
    window.gamepad = new Gamepad();
    window.gamepadHorseArray = Array();

    gamepad.bind(Gamepad.Event.CONNECTED, function (device) {
        // console.log('Connected', device);
        let horse = window.horses.pop();
        window.stage.addChild(horse);
        gamepadHorseArray[device.index] = horse;
    });

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
        let horse = gamepadHorseArray[e.gamepad.index];
        horse.position.x += 1;
    });

    gamepad.bind(Gamepad.Event.TICK, function (gamepads) {
        for (let i = 0; i < gamepads.length; i += 1) {
            let _gamepad = gamepads[i];
            let horse = gamepadHorseArray[_gamepad.index];
            // console.log("axis changed", e);
            horse.position.x += _gamepad.axes[6];
            horse.position.y += _gamepad.axes[7];
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