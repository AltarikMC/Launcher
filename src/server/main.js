const { app, BrowserWindow, Menu, ipcMain, autoUpdater, dialog } = require('electron')
const logger = require('electron-log')
const { join } = require('path')

if (require('electron-squirrel-startup')) {
    require("./install.js").handleSquirrelEvent(app)
    app.quit()
    return
}
const minecraft = require('./minecraft.js')
minecraft.showNotification = showNotification

const iconPath = join(__dirname, "icon.ico")
let win = null

function createWindow () {
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        resizable: false,
        icon: iconPath,
        webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
        },
        frame: false
    })
    //Menu.setApplicationMenu(null)
    win.loadFile('src/client/checkingUpdate.html').then(() => {
        require('./updater.js').configUpdater(app, autoUpdater, dialog, logger, showNotification)
    })
    win.on("close", () => {
        app.quit()
    })
}

const { setWindow, minimizeWindow, closeWindow } = require("./menubar.js");

app.whenReady().then(() => {
    createWindow()
    setWindow(win)
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
    minecraft.login(event, win, args.user, args.pass)
})

ipcMain.on("microsoft-login", (event) => {
    minecraft.microsoftLogin(event, win)
})

ipcMain.on("invalidateData", event => {
    minecraft.invalidateData(event)
})

ipcMain.on("launch", (event, args) => {
  minecraft.launch(event, args)
})

function showNotification(title, body="", clazz="info") {
    win.webContents.send('notification', {title: title, body: body, class: clazz})
}

ipcMain.on("disconnect", () => {
    minecraft.auth = null
    win.loadFile('src/client/login.html').then(() =>  showNotification("Déconnecté", "Vous avez été déconnecté de votre compte", "success"))
   
})

ipcMain.on("pageReady", (event) => {
    event.sender.send("nick", { name: minecraft.auth.name })
    minecraft.getModsInformations(event)
})