"use strict"

const gamepad = new Gamepad();
gamepad.init();

class Controller {
    constructor(index) {
        this.index = index;
        
        this.onConnected = null;
        this.onButtonPressed = null;
        this.onButtonReleased = null;
        this.onDisconnected = null;
        
        this.isConnected = null;
        this.state = null;
    }
    
    bindEvents() {
        gamepad.bind(Gamepad.Event.CONNECTED, this.connected.bind(this));
        gamepad.bind(Gamepad.Event.AXIS_CHANGED, this.axisChanged.bind(this));
        gamepad.bind(Gamepad.Event.BUTTON_DOWN, this.press.bind(this));
        gamepad.bind(Gamepad.Event.BUTTON_UP, this.release.bind(this));
        gamepad.bind(Gamepad.Event.DISCONNECTED, this.disconnected.bind(this));
        return this;
    }
    
    _saveState(device) {
        if (this.isConnected === null)  {
            this.isConnected = true;
            this._saveState(device);
            this.cb(this.onConnected);
            return;
        }
        if (this.isConnected) {
            this.state = {
                axes: device.axes,
                buttons: device.buttons
            };
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
        if (device.index == this.index) {
            this.isConnected = null;
            this._saveState(device);
        }
    }
    
    disconnected(device) {
        if (device.index == this.index) {
            this.state = null;
            this.isConnected = false;
            this.cb(this.onDisconnected);
        }
    }
    
    axisChanged(axis) {
        if (axis.gamepad.index == this.index) {
            this._saveState(axis.gamepad);
        }
    }
    
    press(button) {
        if (button.gamepad.index == this.index) {
            this._saveState(button.gamepad);
            this.cb1(this.onButtonPressed, button.control);
        }
    }

    release(button) {
        if (button.gamepad.index == this.index) {
            this._saveState(button.gamepad);
            this.cb1(this.onButtonReleased, button.control);
        }
    }
}
