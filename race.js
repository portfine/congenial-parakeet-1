let app = null;

window.addEventListener("load", function () {
    app = new PIXI.Application({
        width: 1920,
        height: 1080,
        antialias: true,
        backgroundColor: 0x00FF00
    });
    document.body.appendChild(app.view);

    window.stage = app.stage;
    adaptRenderSize();
    window.addEventListener("resize", adaptRenderSize);

    PIXI.loader.add("horse_a", "HorseA.png").add("horse_b", "HorseB.png").load();

    PIXI.loader.onComplete.add(drawCanvas);
});

function adaptRenderSize() {
    const realWidth = window.innerWidth;
    const realHeight = window.innerHeight;
    const referenceWidth = 1920;
    const aspectRatio = 16 / 9;

    app.renderer.resize(realWidth, realWidth / aspectRatio);

    const scale = realWidth / referenceWidth;
    const scaleM = new PIXI.Matrix().scale(scale, scale);
    app.stage.scale.x = scale;
    app.stage.scale.y = scale;
}

function drawCanvas() {
    drawRaceComponentsContainer();
    drawHorses();
    drawRaceTrack();
    drawPlayerIdBox();
    drawSeparators();
    drawTimer();

    defineGamepads();
}

function defineGamepads() {
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

function drawHorses() {
    const horseATex = PIXI.utils.TextureCache["horse_a"];
    const horseBTex = PIXI.utils.TextureCache["horse_b"];

    const horseASprite = new PIXI.Sprite(horseATex);
    const horseBSprite = new PIXI.Sprite(horseBTex);

    console.log("all loaded!");

    window.horses = [horseASprite, horseBSprite];


    horseASprite.scale.x = .1;
    horseASprite.scale.y = .1;

    horseASprite.position.x = 40;
    horseASprite.position.y = 23;

    horseBSprite.scale.x = .1;
    horseBSprite.scale.y = .1;

    horseBSprite.position.x = -15;
    horseBSprite.position.y = 133;
}

function drawRaceComponentsContainer() {
    window.raceComponentsContainer = new PIXI.Container({
        width: 1100,
        height: 330
    });
    raceComponentsContainer.position.set(300, 50);
    window.stage.addChild(raceComponentsContainer);
}

function drawRaceTrack() {
    window.raceTrackContainer = new PIXI.Container({
        width: 900,
        height: 200
    });
    raceTrackContainer.position.x = 200;

    let raceTrackGround = new PIXI.Graphics();
    raceTrackGround.beginFill(0xff8000);
    raceTrackGround.drawPolygon([100, 0, 0, 200, 900, 200, 1000, 0]);
    raceTrackGround.position.set(30, 10);

    for (let i = 0; i < 10; i += 1) {
        raceTrackGround.lineStyle(5, 0xeeeeee).moveTo((i + 1) * 100, 0).lineTo(i * 100, 200);
    }

    raceTrackContainer.addChild(raceTrackGround, horses[0], horses[1]);
    raceComponentsContainer.addChild(raceTrackContainer);
}

function drawPlayerIdBox() {
    window.playerIdsContainer = new PIXI.Container({
        width: 200,
        height: 200
    });
    let p1Text = new PIXI.Text('P1', {fontFamily: 'DisposableDroidBB', fontSize: 80, fill: 0x000000, align: 'center'});
    let p2Text = new PIXI.Text('P2', {fontFamily: 'DisposableDroidBB', fontSize: 80, fill: 0x000000, align: 'center'});
    p1Text.position.set(120, 20);
    p2Text.position.set(70, 120);


    playerIdsContainer.addChild(p1Text, p2Text);
    raceComponentsContainer.addChild(playerIdsContainer);
}

function drawSeparators() {
    let raceTrackSeparator = new PIXI.Graphics();
    raceTrackSeparator.position.set(0, 110);
    raceTrackSeparator.lineStyle(5, 0x444444).moveTo(0, 0).lineTo(1200, 0);

    let boxSeparator = new PIXI.Graphics();
    boxSeparator.position.set(250, 0);
    boxSeparator.lineStyle(5, 0x444444).moveTo(0, 0).lineTo(-110, 220);
    raceComponentsContainer.addChild(raceTrackSeparator, boxSeparator)
}

function drawTimer() {
    window.timerText = new PIXI.Text('Time 0.00', {
        fontFamily: 'DisposableDroidBB',
        fontSize: 80,
        fill: 0x000000,
        align: 'left'
    });
    timerText.position.set(450, 250);
    raceComponentsContainer.addChild(timerText);
}

function startTimer() {
    let startTime = new Date().getTime();
    window.timerTicker = PIXI.ticker.shared.add(function (deltaT) {
        let currentTime = new Date().getTime();
        let time = (currentTime - startTime) / 1000;
        window.timerText.text = "Time " + time.toFixed(2);
    });
}
