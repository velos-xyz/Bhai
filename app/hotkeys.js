const iohook = require('iohook');

module.exports = (globals) => {
    let rshift = false;
    let rctrl = false;
    let nkey = false;

    iohook.on('keyup', ev => {
        if (ev.keycode === 29) {
            rctrl = false;
        } else if (ev.keycode === 42) {
            rshift = false;
        }
    });

    iohook.on('keydown', ev => {
        if (ev.keycode === 29) {
            rctrl = true;
        } else if (ev.keycode === 42) {
            rshift = true;
        } else if (ev.keycode === 1) {
            globals.window ? globals.window.hide() : false;
            nkey = true;
        } else {
            nkey = true;
        }

        if ((ev.keycode === 29 || ev.keycode === 42) && rshift && rctrl) {
            nkey = false;

            setTimeout(() => {
                if (rshift && rctrl && !nkey) {
                    globals.window.show();
                    globals.window.focus();
                }
            }, 400);
        }
    });

    iohook.start();
}