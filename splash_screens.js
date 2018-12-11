
PRECACHE_TEXTURE_LIST.push(["startnewround_splash", "start_new_round.png"]);
PRECACHE_TEXTURE_LIST.push(["title_splash", "title.png"]);
PRECACHE_TEXTURE_LIST.push(["beams", "beams.png"]);

class StartNewRoundSplash {
    constructor() {
        this.sprite = new PIXI.Container();
        
        this.startnewFlasher = new PIXI.Sprite(PIXI.utils.TextureCache.startnewround_splash);
        const newroundframe = PIXI.utils.TextureCache.startnewround_splash.frame;
        
        this.startnewFlasher.position.set((1920 - newroundframe.width) / 2, 900);
        this.startnewFlasher.visible = false;
        
        this.starburstSprite = new PIXI.Container();
        this.starburstCenteredSprite = new PIXI.Sprite(PIXI.utils.TextureCache.beams);
        const beamsFrame = PIXI.utils.TextureCache.beams.frame;
        this.starburstCenteredSprite.position.set(
            -beamsFrame.width / 2, -beamsFrame.height / 2);
        this.starburstSprite.position.set(1920 / 2, 400);
        this.starburstSprite.scale.set(0, 0);
        this.starburstSprite.addChild(this.starburstCenteredSprite);

        this.titleSprite = new PIXI.Container();
        const titleOffsetSprite = new PIXI.Sprite(PIXI.utils.TextureCache.title_splash);
        const titleFrame = PIXI.utils.TextureCache.title_splash.frame;
        titleOffsetSprite.position.set(-titleFrame.width / 2, -titleFrame.height / 2);
        this.titleSprite.addChild(titleOffsetSprite);
        this.titleSprite.scale.set(0, 0);
        this.titleSprite.position.set(1920 / 2, 400);
        
        this.isVisible = false;
        this.timer = 0;
        
        this.initTimer = -10;
        
        this.sprite.addChild(this.starburstSprite);
        this.sprite.addChild(this.startnewFlasher);
        this.sprite.addChild(this.titleSprite);
        
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
            this.timer = 0.0;
            this.startnewFlasher.visible = !this.startnewFlasher.visible;
        }
        if (!this.isVisible) {
            this.initTimer = -20;
            this.titleSprite.scale.set(0, 0);
            this.starburstSprite.scale.set(0, 0);
        } else {
            this.initTimer += timeDeltaT;
            if (this.initTimer > 0.75) this.initTimer = 0.75;
            const initRatio = this.initTimer / 0.75;
            
            if (initRatio > 0) {
                this.titleSprite.scale.set(initRatio, initRatio);
                this.starburstSprite.scale.set(8 * initRatio, 5 * initRatio);
                
                this.starburstSprite.rotation = (this.starburstSprite.rotation + timeDeltaT) % (2 * 3.1415);
            }
        }
    }
    
    setVisible(b) {
        this.isVisible = b;
        this.sprite.visible = b;
    }
};
