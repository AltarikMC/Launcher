const { app, BrowserWindow, Menu, ipcMain, Notification, autoUpdater, dialog } = require('electron')
const { join } = require('path')
if (require('electron-squirrel-startup')) {
  require("./install.js").handleSquirrelEvent(app)
  app.quit()
}
const server = 'https://update.electronjs.org'
const feed = `${server}/OWNER/REPO/${process.platform}-${process.arch}/${app.getVersion()}`
autoUpdater.setFeedURL(feed)
setInterval(() => {
  autoUpdater.checkForUpdates()
}, 10 * 60 * 1000) // 10 minutes

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Rédémarrer', 'Plus tard'],
    title: 'Une mise à jour du launcher est disponible',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'Une nouvelle version du launcher a été téléchargé. Redémarrez l\'application pour appliquer les mises à jour.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
  const dialogOpts = {
    type: 'info',
    buttons: ['Fermer'],
    title: 'Erreur lors de la tentetive de mise à jour de l\'application',
    message: "Une Erreur est survenur de lros de la mise à jour du launcher"
  }
  dialog.showMessageBox(dialogOpts)
})

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
