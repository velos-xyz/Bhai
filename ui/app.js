const prompt = require('electron-prompt');
const { ipcRenderer } = require('electron');


const pasteEl = document.querySelector('.paste');
const nameEl = document.querySelector('.name');

autosize(pasteEl);

ipcRenderer.on('showing', () => {
    pasteEl.focus();
});

ipcRenderer.on('name', (ev, name) => {
    nameEl.innerHTML = name;
});

nameEl.addEventListener('click', () => {
    prompt({
        title: 'Set Name',
        label: 'Name:',
        value: nameEl.innerHTML
    }).then((name) => {
        if(name !== null) {
            nameEl.innerHTML = name;
            ipcRenderer.send('name', name);
        }
    }).catch(console.error);
});

pasteEl.addEventListener('keydown', ev => {
    if (event.keyCode == 13 && !event.shiftKey) {
        ev.preventDefault();
        pasteEl.value = '';
        pasteEl.rows = 1;
        autosize.update(pasteEl);
    }
});
