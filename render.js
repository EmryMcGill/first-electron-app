
const torrents = document.getElementById("torrents")
var torrentList = []

const ipcRenderer = require('electron').ipcRenderer
const fs = require('fs')

// on load load torrent list from storage and update window
window.onload = () => {
    updateTorrents()
}

// listen for form submit and send magnet link to main process
document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()
    const magnetLink = document.getElementById('magLink').value
    ipcRenderer.send('magnetLink:add', magnetLink)
})

ipcRenderer.on('updateTorrentList', (event) => updateTorrents())

// update torrent list and display to window
const updateTorrents = () => {
    let currentTorrentName = null
    let downloadSpeed = null
    // get the current downloading torrent name
    ipcRenderer.on('torrentName', (event, name) => { currentTorrentName = name })
    // get the current download speed
    ipcRenderer.on('downloadSpeed', (event, speed) => { downloadSpeed = speed })
    // loading torrent list from storage
    torrentList = JSON.parse(fs.readFileSync('torrentList.json'))
    torrents.innerHTML = ""
    // run through each torrent in list and make elements
    torrentList.forEach((torrent) => {
        let newTorrent = document.createElement('div')
        if (torrent == currentTorrentName) {
            var innerHTMLStr = `
        <div class="text">${torrent} ${downloadSpeed}</div>
        `
        } else {
            var innerHTMLStr = `
        <div class="text">${torrent} ${downloadSpeed}</div>
        `
        }

        newTorrent.innerHTML = innerHTMLStr
        // add new elements to window
        torrents.appendChild(newTorrent)
    })
}
