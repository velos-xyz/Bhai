const electron = require('electron');
const hotkeys = require('./app/hotkeys');

const {
    app,
    BrowserWindow,
    Tray,
    Menu,
    MenuItem
} = require('electron');

let globals = {
    window: null,
    tray: null
};

function createWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

    const win = new BrowserWindow({
        width,
        height,
        transparent: true,
        frame: false,
        title: "Bhai",
        minimizable: false,
        maximizable: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        darkTheme: true,
        show: false,
        icon: 'res/tray.png',
        closable: false
    });

    win.setMenu(null);

    win.on('close', ev => {
        ev.preventDefault();
        win.hide();
    });

    win.on('minimize', ev => {
        ev.preventDefault();
    });

    win.on('maximize', ev => {
        ev.preventDefault();
    });

    win.loadFile('ui/index.htm');

    globals.window = win;
}

app.on('ready', () => {
    setTimeout(() => {
        createWindow();
    }, 100);

    const tray = globals.tray = new Tray('res/tray.png');
    const menu = new Menu();

    menu.append(
        new MenuItem({
            label: 'Open',
            click: () => {
                globals.window.show();
                globals.window.focus();
            }
        }
    ));

    menu.append(
        new MenuItem({
            label: 'Quit',
            click: () => {
                app.exit();

                setTimeout(() => {
                    process.exit(0);
                }, 5000);
            }
        }
    ));

    tray.setContextMenu(menu);
});

app.on('window-all-closed', () => {
    createWindow();
});

hotkeys(globals);