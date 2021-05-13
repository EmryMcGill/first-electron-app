const electron = require('electron')
const { ipcRenderer, contextBridge } = electron 
const fs = require('fs')

contextBridge.exposeInMainWorld(
    'electron',
    {
        submitMagnetLink: (magnetLink) => ipcRenderer.send('magnetLink:add', magnetLink),
        loadTorrentListFunction: () => JSON.parse(fs.readFileSync('torrentList.json')),
    }
)