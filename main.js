const electron = require('electron')
const { app, BrowserWindow, ipcMain, dialog, Menu } = electron
const path = require('path')
const WebTorrent = require('webtorrent')
const cp = require('child_process')
const fs = require('fs')


// variables
var client = new WebTorrent()
var vlc_path = path.join('C:', 'Program Files (x86)', 'VideoLAN', 'VLC', 'vlc.exe')
var torrentList = []
let mainWindow = null
//magnet:?xt=urn:btih:224BF45881252643DFC2E71ABC7B2660A21C68C4&dn=Inception+%282010%29+1080p+BrRip+x264+-+1.85GB+-+YIFY&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce

// start renderer process
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        hieght: 600,
        
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            //preload: path.join(__dirname, 'preload.js')
        }
    });
    // load html file in browser
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    // insert menu
    ////Menu.setApplicationMenu(mainMenu)

    // get torrent list from storage
    torrentList = loadTorrentList()
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item'
            },
            {
                label: 'Quit',
                click(){
                    app.quit()
                },
            }
        ]
    }
]

// detect new torrent and add to list
client.on('torrent', torrent => {
    torrentList = [...torrentList, torrent.name]
    saveTorrentList(torrentList)
})


//-----------------------IPC EVENTS--------------------------------


// download:start button press
ipcMain.on('magnetLink:add', (event, magnetLink) => {
    client.add(magnetLink, { path: 'downloads' }, torrent => {
        event.sender.send('downloadSpeed', torrent.downloadSpeed)
        event.sender.send('torrentName', torrent.name)
    })
    
})

// downlaod torrent
ipcMain.on('torrent:download', (event, magnetLink) => {
    // start torrent client
    
})

 // vlc:open button press
 ipcMain.on('vlc', (event) => {
    // run vlc process
    var proc = cp.spawn(vlc_path)

    // handle errors with vlc process
    proc.stderr.on('data', stderr => {
        console.log(stderr.toString())
    })

    // handles closing vlc process
    proc.on('close', (code) => {
        console.log('vlc exited with code')
    })
})




//-----------------------FUNCTIONS---------------------------------


// search torrent directory for a video file by filtering out other directories
const fileSearch = (dir_path) => {

    var files = fs.readdirSync(dir_path)

    for (var i = 0; i < files.length; i++) {
        var file = path.join(dir_path, files[i])
        var stat = fs.lstatSync(file)

        if (!stat.isDirectory()) {
            return file
        }
    }
}

// save torrent list to stoarge
const saveTorrentList = (list) => {
    let data = JSON.stringify(list)
    fs.writeFileSync('torrentList.json', data)
    mainWindow.webContents.send('updateTorrentList')
}

// load torrent list form storage
const loadTorrentList = () => {
    data = fs.readFileSync('torrentList.json')
    torrentList = JSON.parse(data)
    return torrentList
}