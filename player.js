class Player {
    constructor(index, allBrainSlices) {
        this.index = index;
        this.brains = shuffle(allBrainSlices.slice());

        this.brainSliceContainer = new PIXI.Container({
            width: 550,
            height: 550,
        });

        this.currentBrainSliceSpriteIndex = -1;
        this.currentBrainSliceSpriteHelper = 0.2;

        this.brainSliceSprites = [];
        this.preloadedBrainSliceSprites = [];
        this.horse = null;
        this.score = 0.;
    }

    preloadBrainSlices() {
        if (this.brains.length > 0) {
            let slicesToLoad = this.brains.pop();
            this.preloadedBrainSliceSprites = [];
            for (let sliceIdx = 0; sliceIdx < slicesToLoad.length; sliceIdx++) {
                let slicePath = slicesToLoad[sliceIdx];
                const sprite = new PIXI.Sprite(PIXI.utils.TextureCache[slicePath]);
                this.preloadedBrainSliceSprites.push(sprite);
            }
        }
    }

    moveToNextBrain() {
        let spritesToDestroy = this.brainSliceSprites;
        this.brainSliceSprites = this.preloadedBrainSliceSprites;
        this.preloadBrainSlices();
        this.changeSlice(-this.currentBrainSliceSpriteHelper + 0.5);
        while (spritesToDestroy.length > 0) {
            spritesToDestroy.pop().destroy()
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
