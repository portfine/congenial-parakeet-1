class Player {
    constructor(index, allBrainSlices, controller) {
        this.index = index;
        this.controller = controller;
        this.brains = shuffle(allBrainSlices.slice());

        this.brainSliceContainer = new PIXI.Container({
            width: 550,
            height: 550,
        });

        this.controllerTimer = 0;
        this.controller.filterAnalog(0, .25, [
            {dir: [1, 0]},
            {dir: [0, 1]},
            {dir: [-1, 0]},
            {dir: [0, -1]}
        ])

        this.currentBrainSliceSpriteIndex = -1;
        this.currentBrainSliceSpriteHelper = 0.2;

        this.brainSliceSprites = [];
        this.preloadedBrainSliceSprites = [];
        this.horse = null;
        this.score = 0.;
    }

    start() {
        this.ticker = new PIXI.ticker.Ticker();
        this.ticker.add(this._tick.bind(this));
        this.ticker.start();
        return this;
    }
    
    _tick(deltaT) {
        const timeDeltaT = deltaT * (1 / 60);
        this.controllerTimer += timeDeltaT;
        if (this.controller.state !== null) {
            const controller = this.controller.state;
            this.changeSlice(20 * Math.pow(controller.axes[1], 4) * timeDeltaT);

            if (this.controllerTimer > 0.05) {
                this.controllerTimer -= 0.05;
            }
        }
    }

    preloadBrainSlices() {
        if (this.brains.length > 0) {
            let slicesToLoad = this.brains.pop();
            this.preloadedBrainSliceSprites = [];
            for (let sliceIdx = 0; sliceIdx < slicesToLoad.length; sliceIdx++) {
                let slicePath = slicesToLoad[sliceIdx];
                const sprite = new PIXI.Sprite(PIXI.Texture.fromImage(slicePath));
                this.preloadedBrainSliceSprites.push(sprite);
            }
        }
    }

    moveToNextBrain() {
        let spritesToDestroy = this.brainSliceSprites;
        this.brainSliceSprites = this.preloadedBrainSliceSprites;
        this.preloadBrainSlices();
        this.currentBrainSliceSpriteHelper = 0.5;
        this.changeSlice(0);
        while (spritesToDestroy.length > 0) {
            const sprite = spritesToDestroy.pop();
            const texture = sprite.texture;
            sprite.destroy();
            texture.destroy(true);
        }
    }

    changeSlice(speed) {
        // very hacky implementation to slide between stuff..
        this.currentBrainSliceSpriteHelper += speed + this.brainSliceSprites.length;
        this.currentBrainSliceSpriteHelper %= this.brainSliceSprites.length;
        const newBrainSliceSpriteIndex = Math.floor(this.currentBrainSliceSpriteHelper);
        if (newBrainSliceSpriteIndex !== this.currentBrainSliceSpriteIndex) {
            this.brainSliceContainer.removeChildren();
            this.currentBrainSliceSpriteIndex = newBrainSliceSpriteIndex;
            return this.brainSliceContainer.addChild(this.brainSliceSprites[newBrainSliceSpriteIndex]);
        }
    }
}


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
