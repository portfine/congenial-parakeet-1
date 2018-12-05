
let app = null;

window.addEventListener("load", function() {
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


    const twoHorses = new PIXI.Container();
    

    twoHorses.addChild(horseASprite, horseBSprite);
    horseASprite.scale.x = .1;
    horseASprite.scale.y = .1;
    horseBSprite.scale.x = .1;
    horseBSprite.scale.y = .1;
    horseBSprite.position.x = 10;
    horseBSprite.position.y = 20;

    app.stage.addChild(twoHorses);
    twoHorses.position.x = 200;
    twoHorses.position.y = 133;

    PIXI.ticker.shared.add(function(deltaT) {
        twoHorses.position.x += deltaT * 10;
        if (twoHorses.position.x > 800) {
            twoHorses.position.x = 0;
        }
        horseASprite.rotation += 0.01 * deltaT;
    });
}
