const { app, BrowserWindow, Menu } = require('electron')
const path = require('path');
const iconPath = path.join(__dirname, "icon.png");

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false
  })
  //Menu.setApplicationMenu(null)
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null){
    createWindow()
  }
})

