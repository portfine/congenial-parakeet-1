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

class Player {
    constructor(index, allBrainSlices, controller) {
        this.index = index;
        this.controller = controller;
        this.brains = shuffle(allBrainSlices.slice());

        this.brainSliceContainer = new PIXI.Container();

        this.controllerTimer = 0;
        this.controller.filterAnalog(0, .25, [
            {dir: [1, 0]},
            {dir: [0, 1]},
            {dir: [-1, 0]},
            {dir: [0, -1]}
        ]);

        this.loader = null;

        this.currentBrainSliceSpriteIndex = null;
        this.currentBrainSliceSpriteHelper = 0.2;

        this.brainSliceSprites = [];
        this.preloadedBrainSliceSprites = [];
        this.horse = null;
        this.score = 0.;

        this.volumeSelectionValue = 1500.;
        this.volumeSelectionText = new PIXI.Text('1500.00', {
            fontFamily: 'DisposableDroidBB',
            fontSize: 80,
            fill: 0x000000,
            align: 'left'
        });
    }

    start() {
        this.controller.onButtonPressed = this._buttonPressed.bind(this);

        this.ticker = new PIXI.ticker.Ticker();
        this.ticker.add(this._tick.bind(this));
        this.ticker.start();
        return this;
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
        this.controllerTimer += timeDeltaT;
        if (this.controller.state !== null) {
            const controller = this.controller.state;
            this.changeSlice(ramp(controller.axes[1]) * timeDeltaT);
            this.changeVolume(ramp(controller.axes[0]) * timeDeltaT);

            if (this.controllerTimer > 0.05) {
                this.controllerTimer -= 0.05;
            }
        }
    }

    _buttonPressed(controller, button) {
        if (button === Gamepad.StandardButtons[0]) {
            this.moveToNextBrain();
        }
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
        this.volumeSelectionValue += speed;
        if (this.volumeSelectionValue > 2100) {
            this.volumeSelectionValue = 2100;
            speed = 0;
        } else if (this.volumeSelectionValue < 900) {
            this.volumeSelectionValue = 900;
            speed = 0;
        }
        if (speed !== 0)
            this.volumeSelectionText.text = this.volumeSelectionValue.toFixed(2)
    }
}