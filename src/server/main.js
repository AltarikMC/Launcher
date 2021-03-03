const { app, BrowserWindow, Menu, ipcMain, Notification, autoUpdater, dialog } = require('electron')
const { join } = require('path')
if (require('electron-squirrel-startup')) {
  require("./install.js").handleSquirrelEvent(app)
  app.quit()
}
// don't work
//require('./updater.js').configUpdater(app, autoUpdater, dialog) 

const { Client, Authenticator } = require('minecraft-launcher-core')
const appdata = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")

const launcher = new Client();
const iconPath = join(__dirname, "icon.ico");
let win = null
let auth = null

let Minecraftpath = join(appdata, ".altarik")
let clientPackage = "https://www.dropbox.com/s/ww6a052nzzgojdm/modpack.zip?dl=1"
let version = "1.16.4"
let versionFolder = "fabric-loader-0.10.8-1.16.4"

function createWindow () {
  win = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    maxWidth: 1000,
    height: 600,
    minHeight: 600,
    maxHeight: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false,
  })
  Menu.setApplicationMenu(null)
  win.loadFile('src/client/login.html')
}

const {
    setWindow,
    minimizeWindow,
    closeWindow
  } = require("./menubar.js");

  setWindow(win)

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('minimizeWindow', () => {
  minimizeWindow(win)
})

ipcMain.on('closeWindow', () => {
  closeWindow(win)
})

app.on('activate', () => {
  if (win === null){
    createWindow()
  }
})

ipcMain.on("login", (event, args) => {
  auth = Authenticator.getAuth(args.user, args.pass)
  auth.then(v => {
    win.loadFile('src/client/index.html')
    setTimeout(() => {
      event.sender.send("nick", {
        name: v.name
      })
    }, 1000)
    
  }).catch((err) => {
    console.warn(err)
    showNotification("Erreur de connexion")
  })
})

function showNotification(title, body="") {
  const notification = {
    title: title,
    body: body
  }
  new Notification(notification).show()
}

ipcMain.on("notification", (event, args) => {
  showNotification(args.title, args.body)
})

ipcMain.on("launch", (event, args) => {
  let opts = {
    clientPackage: clientPackage,
    authorization: auth,
    root: Minecraftpath,
    version: {
        number: version,
        type: "release",
        custom: versionFolder
    },
    memory: {
        max: args.maxMem,
        min: args.minMem
    }
  }
  launcher.launch(opts)
  // launcher.on('debug', (e) => console.log("debug", e));
  // launcher.on('data', (e) => console.log("data", e));
  launcher.on('progress', (e) => event.sender.send("progress", e))
  launcher.on('arguments', (e) => event.sender.send("launch", e))
  launcher.on('close', (e) => {
    event.sender.send("close", e)
    if(e !== 0){
      showNotification("Une erreur est survenue", "Minecraft ne s'est pas fermé correctement")
    }
  })
  
})

ipcMain.on("disconnect", (e) => {
  win.loadFile('src/client/login.html')
})
