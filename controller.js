"use strict"

const gamepad = new Gamepad();
gamepad.init();

function vec2DotProduct(a, b) {
    return a[0] * b[0] + a[1] * b[1]
}

function vec2Normalize(v) {
    const vlen = Math.sqrt(v[0]*[0] + v[1]*v[1]);
    if (vlen > 0) {
        return [v[0] / vlen, v[1] / vlen];
    }
    return [v[0], v[1]];
}

class Controller {
    constructor(index) {
        this.index = index;
        
        this.onConnected = null;
        this.onButtonPressed = null;
        this.onButtonReleased = null;
        this.onDisconnected = null;
        
        this.isConnected = null;
        this.state = null;
        
        this._axisFilters = [null, null];
    }
    
    bindEvents() {
        gamepad.bind(Gamepad.Event.CONNECTED, this.connected.bind(this));
        gamepad.bind(Gamepad.Event.AXIS_CHANGED, this.axisChanged.bind(this));
        gamepad.bind(Gamepad.Event.BUTTON_DOWN, this.press.bind(this));
        gamepad.bind(Gamepad.Event.BUTTON_UP, this.release.bind(this));
        gamepad.bind(Gamepad.Event.DISCONNECTED, this.disconnected.bind(this));
        return this;
    }
    
    _applyStateFilters() {
        if (this.state === null) {
            return;
        }
        
        for (let i = 0; i < this._axisFilters.length; i++) {
            const filter = this._axisFilters[i];
            if (filter !== null) {
                const axesOffset = i * 2;
                const vec = [
                    this.state.axes[axesOffset], 
                    this.state.axes[axesOffset + 1]
                ];
                const vlen = Math.sqrt(
                    Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
                if (vlen < filter.deadzone) {
                    this.state.axes[axesOffset] = 0;
                    this.state.axes[axesOffset + 1] = 0;
                } else if ((filter.projections.length > 0) && (vlen > 0.001)) {
                    const normVec = [vec[0] / vlen, vec[1] / vlen];

                    let bestI = -1;
                    let maxI = -1;
                    for (let fi = 0; fi < filter.projections.length; fi++) {
                        const projection = filter.projections[fi];
                        const pValue = vec2DotProduct(
                            projection.dir,
                            normVec);
                        if (pValue > projection.threshold) {
                            if (pValue > maxI) {
                                maxI = pValue;
                                bestI = fi;
                            }
                        }
                    }
                    
                    const newVec = [0, 0];
                    if (bestI >= 0) {
                        const bestF = filter.projections[bestI];
                        newVec[0] += vlen * bestF.dir[0];
                        newVec[1] += vlen * bestF.dir[1];
                    }
                    this.state.axes[axesOffset] = newVec[0];
                    this.state.axes[axesOffset + 1] = newVec[1];
                }
            }
        }
    }
    
    _saveState(device) {
        if (this.isConnected === null)  {
            this.isConnected = true;
            this._saveState(device);
            this.cb(this.onConnected);
            return;
        }
        if (this.isConnected) {
            const axes = [];
            for (let ai = 0; ai < device.axes.length; ai++) {
                axes.push(device.axes[ai]);
            }
            
            const buttons = [];
            for (let ai = 0; ai < device.buttons.length; ai++) {
                buttons.push({
					pressed: device.buttons[ai].pressed
				});
            }

            this.state = {
                axes: axes,
                buttons: buttons
            };
            
            this._applyStateFilters();
        }
    }
    
    cb(x) {
        if (x !== null) {
            return x(this);
        }
    }
    
    cb1(x, p1) {
        if (x !== null) {
            return x(this, p1);
        }
    }
    
    connected(device) {
        if (device.index === this.index) {
            this.isConnected = null;
            this._saveState(device);
        }
    }
    
    disconnected(device) {
        if (device.index === this.index) {
            this.state = null;
            this.isConnected = false;
            this.cb(this.onDisconnected);
        }
    }
    
    axisChanged(axis) {
        if (axis.gamepad.index === this.index) {
            this._saveState(axis.gamepad);
        }
    }
    
    press(button) {
        if (button.gamepad.index === this.index) {
            this._saveState(button.gamepad);
            this.cb1(this.onButtonPressed, button.control);
        }
    }

    release(button) {
        if (button.gamepad.index === this.index) {
            this._saveState(button.gamepad);
            this.cb1(this.onButtonReleased, button.control);
        }
    }
    
    filterAnalog(analogIndex, deadzone, projections) {
        if (typeof deadzone === "undefined") {
            deadzone = 0;
        }
        if (typeof projections === "undefined") {
            projections = [];
        } else {
            const oldProjections = projections;
            projections = [];
            for (let i = 0; i < oldProjections.length; i++) {
                const p = oldProjections[i];
                const dir = vec2Normalize(p.dir);
                let threshold = p.threshold;
                if (typeof p.threshold === "undefined") {
                    threshold = 0;
                }
                
                projections.push({
                    dir: dir,
                    threshold: threshold
                });
            }
        }
        
        this._axisFilters[analogIndex] = {
            deadzone: deadzone,
            projections: projections
        };
    }
}
