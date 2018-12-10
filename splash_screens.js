
PRECACHE_TEXTURE_LIST.push(["startnewround_splash", "start_new_round.png"]);

class StartNewRoundSplash {
    constructor() {
        this.sprite = new PIXI.Sprite(PIXI.utils.TextureCache.startnewround_splash);
        const frame = PIXI.utils.TextureCache.startnewround_splash.frame;
        
        this.sprite.position.set(
            (1920 - frame.width) / 2, (1080 - frame.height) / 2);
        this.sprite.visible = false;
        
        this.isVisible = false;
        this.timer = 0;
        
        app.stage.addChild(this.sprite);
    }
    
    start() {
        this.ticker = new PIXI.ticker.Ticker();
        this.ticker.add(this._tick.bind(this));
        this.ticker.start();
        return this;
    }
    
    _tick(deltaT) {
        const timeDeltaT = deltaT * (1 / 60);
        this.timer += timeDeltaT;
        if (this.timer > 0.5) {
            this.timer %= 0.5;
            this.sprite.visible = this.isVisible && !this.sprite.visible;
        }
    }
    
    setVisible(b) {
        this.isVisible = b;
        if (!b) {
            this.sprite.visible = false;
        }
    }
};
