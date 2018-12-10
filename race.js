let app = null;
let gameScene = null;
let startNewRoundSplash = null;

const allBrainSlices = [];

(function () {
    for (let i = 1; i <= 100; i++) {
        const img = [];
        for (let s = 0; s < 320; s++) {
            img.push("slices/" + i + "/img_" + s + ".jpg");
        }
        allBrainSlices.push(img);
    }
})();

PRECACHE_TEXTURE_LIST.push(["horse_a", "HorseA.png"]);
PRECACHE_TEXTURE_LIST.push(["horse_b", "HorseB.png"]);
PRECACHE_TEXTURE_LIST.push(["bgtile", "bgtiles.jpg"]);

function lookupButton(name) {
    for (let i = 0; i < Gamepad.StandardButtons.length; i++) {
        if (name === Gamepad.StandardButtons[i]) {
            return i;
        }
    }
    return null;
}

$(document).ready(function () {
    app = new PIXI.Application({
        width: 1920,
        height: 1080,
        antialias: true,
        backgroundColor: 0x00FF00
    });
    document.body.appendChild(app.view);

    adaptRenderSize();
    window.addEventListener("resize", adaptRenderSize);

    let loader = PIXI.loader;
    PIXI.loader.onComplete.add(preloadPlayers);
    for (let i = 0; i < PRECACHE_TEXTURE_LIST.length; i++) {
        const item = PRECACHE_TEXTURE_LIST[i];
        console.log("Loading: " + item);
        if ((typeof item == "string") || (item.length === 1)) {
            loader.add(item);
        } else {
            loader.add(item[0], item[1]);
        }
    }
    loader.load();
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

function preloadPlayers() {
    gameScene = new PIXI.Container();
    
    const bgsprite = new PIXI.extras.TilingSprite(
        PIXI.utils.TextureCache.bgtile,
        1920, 1080
    );
    app.stage.addChild(bgsprite);
    

    const horseATex = PIXI.utils.TextureCache["horse_a"];
    const horseBTex = PIXI.utils.TextureCache["horse_b"];

    const horseASprite = new PIXI.Sprite(horseATex);
    const horseBSprite = new PIXI.Sprite(horseBTex);

    window.horses = [horseASprite, horseBSprite];


    horseASprite.scale.x = .1;
    horseASprite.scale.y = .1;

    horseASprite.position.x = 40;
    horseASprite.position.y = 23;

    horseBSprite.scale.x = .1;
    horseBSprite.scale.y = .1;

    horseBSprite.position.x = -15;
    horseBSprite.position.y = 133;

    const controllers = [
        (new Controller(0)).bindEvents(),
        (new Controller(1)).bindEvents()
    ];

    window.players = [
        (new Player(
            0,
            allBrainSlices,
            brainVolumes,
            controllers[0],
            horseASprite)
        ).start(),
        (new Player(
            1,
            allBrainSlices,
            brainVolumes,
            controllers[1],
            horseBSprite)
        ).start(),
    ];
    
    window.players[0].onFinished = checkGameFinished;
    window.players[1].onFinished = checkGameFinished;
    
    let interval = window.setInterval(function() {
        let allReady = true;
        window.players.forEach(function(pl) {
            if (!pl.isPreloadReady()) {
                allReady = false;
            }
        });
        if (allReady) {
            window.clearInterval(interval);
            initializeGame();
        }
    }, 500);
}

function initializeGame() {
    $("#loading").hide();
    console.log("all loaded!");

    app.stage.addChild(gameScene);

    drawRaceComponentsContainer();
    drawRaceTrack();
    drawPlayerIdBox();
    drawSeparators();
    drawTimer();
    drawVolumeText();

    let playerContainer = new PIXI.Container();
    playerContainer.position.set(0, 400);
    players[0].mainSprite.position.set(300, 0);
    players[1].mainSprite.position.set(960, 0);

    playerContainer.addChild(players[0].mainSprite, players[1].mainSprite);
    gameScene.addChild(playerContainer);

    startNewRoundSplash = new StartNewRoundSplash().start();
    startNewRoundSplash.setVisible(true);

    PIXI.ticker.shared.add(testResetGame);
}

function checkGameFinished() {
    let allFinished = true;
    for (let i = 0; i < window.players.length; i++) {
        if (!window.players[i].hasFinished()) {
            allFinished = false;
        }
    }
    if (allFinished) {
        startNewRoundSplash.setVisible(true);
    }
}

const RESET_BUTTON_INDEX = 7;
let bothResetButtonsWerePressed = false;
function testResetGame() {
    if (players[0].controller.state && players[1].controller.state) {
        const bothButtonsPressed = players[0].controller.state.buttons[RESET_BUTTON_INDEX].pressed && players[1].controller.state.buttons[RESET_BUTTON_INDEX].pressed;
        if (!bothResetButtonsWerePressed && bothButtonsPressed) {
            bothResetButtonsWerePressed = true;
        } else if (bothResetButtonsWerePressed && !bothButtonsPressed) {
            bothResetButtonsWerePressed = false;
            resetGame();
        }
    }
}

function resetGame() {
    startNewRoundSplash.setVisible(false);
    players.forEach(function (p) {
        p.startRound();
    });
}

function drawRaceComponentsContainer() {
    window.raceComponentsContainer = new PIXI.Container({
        width: 1100,
        height: 330
    });
    raceComponentsContainer.position.set(300, 50);
    
    gameScene.addChild(raceComponentsContainer);
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

function drawVolumeText() {

    let volumesContainer = new PIXI.Container({
        width: 1920,
        height: 80
    });

    volumesContainer.position.set(0, 950);
    players[0].volumeSelectionText.position.set(450, 0);
    players[1].volumeSelectionText.position.set(1100, 0);

    volumesContainer.addChild(players[0].volumeSelectionText, players[1].volumeSelectionText);
    gameScene.addChild(volumesContainer);
}

function startTimer() {
    let startTime = new Date().getTime();
    players.forEach(function (p) {
        p.startTime = startTime;
    });
    window.timerTicker = PIXI.ticker.shared.add(function (deltaT) {
        let currentTime = new Date().getTime();
        let time = (currentTime - startTime) / 1000;
        window.timerText.text = "Time " + time.toFixed(2);
    });
}

function stopTimer() {
    window.timerTicker.stop();
}

