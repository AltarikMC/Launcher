const { app, BrowserWindow, Menu, ipcMain, Notification } = require('electron')
const path = require('path')
const { Client, Authenticator } = require('minecraft-launcher-core')

const launcher = new Client();
const iconPath = path.join(__dirname, "icon.png");
let win = null
let auth = null

let Minecraftpath = "game"
let clientPackage = "https://www.dropbox.com/s/ww6a052nzzgojdm/modpack.zip?dl=1"
let version = "1.16.4"
let versionFolder = "fabric-loader-0.10.8-1.16.4"

function createWindow () {
  win = new BrowserWindow({
    width: 1000,
    minWidth: 900,
    height: 600,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false
  })
  Menu.setApplicationMenu(null)
  win.loadFile('login.html')
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

ipcMain.on("login", (event, args) => {
  auth = Authenticator.getAuth(args.user, args.pass)
  auth.then(v => {
    win.loadFile('index.html')
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

function showNotification(title="", body="") {
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
  launcher.on('data', (e) => console.log("data", e));
  launcher.on('progress', (e) => event.sender.send("progress", e));
  launcher.on('close', (e) => {
    event.sender.send("close", e)
    if(e !== 0){
      showNotification("Une erreur est suvenue", "Minecraft ne s'est pas fermé correctement")
    }
  });
  
})

ipcMain.on("disconnect", (e) => {
  win.loadFile('login.html')
})