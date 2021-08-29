const { app, BrowserWindow, Menu, ipcMain, Notification, autoUpdater, dialog } = require('electron')
const logger = require('electron-log')
const { join } = require('path')
if (require('electron-squirrel-startup')) {
    require("./install.js").handleSquirrelEvent(app)
    app.quit()
    return
}
require('./updater.js').configUpdater(app, autoUpdater, dialog, logger) 

const minecraft = require('./minecraft.js')

const iconPath = join(__dirname, "icon.ico")
let win = null

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
        contextIsolation: false
        },
        frame: false,
    })
    // Menu.setApplicationMenu(null)
    win.loadFile('src/client/login.html')
    win.on("close", () => {
        app.quit()
    })
}

const { setWindow, minimizeWindow, closeWindow } = require("./menubar.js");

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
    minecraft.login(event, win, showNotification, args.user, args.pass)
})

ipcMain.on("microsoft-login", (event, args) => {
    minecraft.microsoftLogin(event, win, showNotification)
})

ipcMain.on("invalidateData", event => {
    minecraft.invalidateData(event)
})

ipcMain.on("launch", (event, args) => {
  minecraft.launch(event, showNotification, args)
})

function showNotification(title, body="") {
    new Notification({ title: title, body: body, silent: false, icon: "../../icon.ico"}).show()
}

ipcMain.on("notification", (event, args) => {
    showNotification(args.title, args.body)
})

ipcMain.on("disconnect", (e) => {
    win.loadFile('src/client/login.html')
})


ipcMain.on("demandModsInformations", (e) => {
    minecraft.getModsInformations(e)
})



