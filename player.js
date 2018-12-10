/** source: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array/6274398
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

PRECACHE_TEXTURE_LIST.push(["slider", "slider.png"]);
PRECACHE_TEXTURE_LIST.push(["finished_splash", "finished.png"]);

class Player {
    constructor(index, allBrainSlices, brainVolumes, controller, horse) {
        this.index = index;
        this.controller = controller;

        this.shuffleBrains(allBrainSlices, brainVolumes);

        this.mainSprite = new PIXI.Container();
        this.brainSliceContainer = new PIXI.Container();
        this.mainSprite.addChild(this.brainSliceContainer);

        this.controller.filterAnalog(0, .25, [
            {dir: [1, 0]},
            {dir: [0, 1]},
            {dir: [-1, 0]},
            {dir: [0, -1]}
        ]);

        this.loader = null;

        this.finishedSprite = new PIXI.Sprite(PIXI.utils.TextureCache.finished_splash);
        this.mainSprite.addChild(this.finishedSprite);

        this.currentBrainSliceSpriteIndex = null;
        this.currentBrainSliceSpriteHelper = 0.2;

        this.currentBrainVolume = null;
        this.brainSliceSprites = [];
        this.preloadedBrainSliceSprites = [];
        this.horse = horse;
        this.horseStart = null;
        
        this.score = 0.0;
        this.distanceTraveled = 0;
        this.totalChoices = 0;
        this.startTime = null;


        this.volumeSelectionValue = 1500.;
        this.volumeSelectionText = new PIXI.Text('1500.00', {
            fontFamily: 'DisposableDroidBB',
            fontSize: 80,
            fill: 0x000000,
            align: 'left'
        });
    }

    shuffleBrains(allBrainSlices, brainVolumes) {
        let zipped = allBrainSlices.map(function (brainSlices, index) {
            return [brainSlices, brainVolumes[index]];
        });
        let shuffled = shuffle(zipped.slice());
        this.brains = shuffled.map(function (brainSliceAndVolume, index) {
            return brainSliceAndVolume[0];
        });
        this.brainVolumes = shuffled.map(function (brainSliceAndVolume, index) {
            return brainSliceAndVolume[1];
        });
    }

    start() {
        this.controller.onButtonPressed = this._buttonPressed.bind(this);
        this.ticker = new PIXI.ticker.Ticker();
        this.ticker.add(this._tick.bind(this));
        this.ticker.start();
        
        this.preloadBrainSlices();
        
        return this;
    }

    startRound() {
        if (this.horseStart === null) {
            this.horseStart = this.horse.position.x;
        }
        
        this.score = 0.0;
        this.distanceTraveled = 0;
        this.totalChoices = 0;
        this.horse.position.x = this.horseStart + this.distanceTraveled;
        
        this.finishedSprite.visible = false;
        this.startTime = +new Date();
        this.moveToNextBrain();
    }
    
    _tick(deltaT) {
        function ramp(x) {
            if (x === 0) {
                return 0;
            }
            const sign = x > 0 ? 1 : -1;
            return 150 * Math.pow((Math.abs(x) - .25) / .75, 4) * sign;
        }

        const timeDeltaT = deltaT * (1 / 60);
        if (this.controller.state !== null) {
            const controller = this.controller.state;
            this.changeSlice(ramp(controller.axes[1]) * timeDeltaT);
            this.changeVolume(ramp(controller.axes[0]) * timeDeltaT);
        }
    }

    _buttonPressed(controller, button) {
        if (button === Gamepad.StandardButtons[0]) {
            this.makeSelection();
        }
    }

    isPreloadReady() {
        return (this.preloadedBrainSliceSprites !== null) && 
            (this.preloadedBrainSliceSprites.length > 0);
    }

    preloadBrainSlices() {
        if (this.loader !== null) {
            this.loader.destroy();
            this.loader = null;
        }

        if (this.brains.length > 0) {
            this.loader = new PIXI.loaders.Loader();
            let slicesToLoad = this.brains.pop();
            this.preloadedBrainSliceSprites = [];
            for (let sliceIdx = 0; sliceIdx < slicesToLoad.length; sliceIdx++) {
                this.loader.add(slicesToLoad[sliceIdx]);
            }

            const spritesList = this.preloadedBrainSliceSprites;
            this.loader.load((loader, resources) => {
                for (let sliceIdx = 0; sliceIdx < slicesToLoad.length; sliceIdx++) {
                    const sprite = new PIXI.Sprite(resources[slicesToLoad[sliceIdx]].texture);
                    sprite.position.set((550 - 512) / 2);
                    spritesList.push(sprite);
                }
            });
        }
    }

    moveToNextBrain() {
        let spritesToDestroy = this.brainSliceSprites;

        if ((this.preloadedBrainSliceSprites !== null) &&
            (this.loader !== null) &&
            (this.preloadedBrainSliceSprites.length === 0)) {
            this.loader.onComplete.add(this.moveToNextBrain.bind(this));
            return;
        }
        this.brainSliceSprites = this.preloadedBrainSliceSprites;


        this.preloadBrainSlices();

        this.currentBrainSliceSpriteIndex = null;
        this.currentBrainSliceSpriteHelper = 100;
        this.changeSlice(0);

        this.currentBrainVolume = this.brainVolumes.pop();
        this.volumeSelectionValue = this.currentBrainVolume +
            Math.floor((Math.random() * 3) - 1) * 100 + ((Math.random() * 50) - 25);
        this.volumeSelectionText.text = this.volumeSelectionValue.toFixed(2);

        while (spritesToDestroy.length > 0) {
            const sprite = spritesToDestroy.pop();
            this.brainSliceContainer.removeChild(sprite);
            const texture = sprite.texture;
            sprite.destroy();
            PIXI.Texture.removeFromCache(texture);
            texture.destroy(true);
        }
    }

    changeSlice(speed) {
        if (this.startTime === null) {
            return;
        }
        
        if (this.brainSliceSprites.length === 0) {
            return;
        }

        // very hacky implementation to slide between stuff..
        this.currentBrainSliceSpriteHelper += speed + this.brainSliceSprites.length;
        this.currentBrainSliceSpriteHelper %= this.brainSliceSprites.length;
        const newBrainSliceSpriteIndex = Math.floor(this.currentBrainSliceSpriteHelper);
        if (newBrainSliceSpriteIndex !== this.currentBrainSliceSpriteIndex) {
            if (this.currentBrainSliceSpriteIndex !== null) {
                this.brainSliceContainer.removeChild(this.brainSliceSprites[this.currentBrainSliceSpriteIndex]);
            }
            this.currentBrainSliceSpriteIndex = newBrainSliceSpriteIndex;
            this.brainSliceContainer.addChild(this.brainSliceSprites[newBrainSliceSpriteIndex]);
        }
    }

    changeVolume(speed) {
        if (this.startTime === null) {
            return;
        }
        
        this.volumeSelectionValue += speed;
        if (this.volumeSelectionValue > 2100) {
            this.volumeSelectionValue = 2100;
            speed = null;
        } else if (this.volumeSelectionValue < 900) {
            this.volumeSelectionValue = 900;
            speed = null;
        }
        if (speed !== 0)
            this.volumeSelectionText.text = this.volumeSelectionValue.toFixed(2)
    }

    makeSelection() {
        if (this.startTime === null) {
            return;
        }
        
        const diff = Math.abs(this.currentBrainVolume - this.volumeSelectionValue);
        if (diff < 200) {
            let distance = Math.pow(200 - diff, 2) / 200;
            this.distanceTraveled += distance;
            this.horse.position.x = this.horseStart + this.distanceTraveled;
        }
        this.totalChoices += 1;
        if (this.distanceTraveled >= 900) {
            this.finish();
        } else {
            this.moveToNextBrain();
        }
    }

    finish() {
        if (this.startTime !== null) {
            this.startTime = null;

            let endTime = +new Date();
            this.finishedSprite.visible = true;

            this.score = (60 * 1000) / Math.max(60 * 1000, endTime - this.startTime);
            this.startTime = null;
            
            if (this.totalChoices < 15) {
                const bonus = 1000 - (100 * (this.totalChoices - 5));
                this.score += bonus;
            }

            this.volumeSelectionText.text = "Score: " + this.score.toFixed(2);
        }
    }
}
