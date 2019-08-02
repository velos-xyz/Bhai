const electron = require('electron');
const hotkeys = require('./app/hotkeys');
const coms = require('./app/coms');

const {
    app,
    BrowserWindow,
    Tray,
    Menu,
    MenuItem,
    ipcMain
} = require('electron');

let globals = {
    window: null,
    tray: null
};

function showWindow() {
    globals.window.show();
    globals.window.focus();
    globals.window.webContents.send('showing');
    globals.window.webContents.send('name', coms.getName());
}

function createWindow() {
    const {
        width,
        height
    } = electron.screen.getPrimaryDisplay().workAreaSize

    const win = new BrowserWindow({
        width,
        height,
        transparent: true,
        frame: false,
        title: "Bhai",
        minimizable: false,
        maximizable: false,
        alwaysOnTop: false,
        autoHideMenuBar: true,
        darkTheme: true,
        show: false,
        icon: 'res/tray.png',
        closable: false,
        webPreferences: {
            nodeIntegration: true
        }
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

    win.webContents.openDevTools();

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
                showWindow();
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

hotkeys(globals, showWindow);

ipcMain.on('name', (ev, name) => {
    coms.setName(name);
});

ipcMain.on('list', (ev, name) => {
    globals.window.webContents.send('list', JSON.stringify(coms.get()));
});

coms.bus.on('new', share => {
    globals.window.webContents.send('new', JSON.stringify(share));
});