import { app, BrowserWindow, Menu, ipcMain, autoUpdater, dialog } from 'electron'
import  logger from 'electron-log'
import { join } from 'path'
import updater from './updater.js'
import electronStartup from 'electron-squirrel-startup'
import install from "./install.js"
import mc from './minecraft.js'
import { minimizeWindow, closeWindow } from "./menubar.js";

import { fileURLToPath } from 'url'
import { dirname } from 'path'


let updaterInstance = new updater(app, autoUpdater, dialog, logger, showNotification)
updaterInstance.configUpdater()

let minecraft = new mc()
minecraft.showNotification = showNotification


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
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
    win.loadFile('src/client/checkingUpdate.html')
    win.on("close", () => {
        app.quit()
    })
}

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

ipcMain.on("checking-update", () => {
    updaterInstance.checkForUpdates(win, showNotification)
})

function main() {
    if (electronStartup) {
        install.handleSquirrelEvent(app)
        app.quit()
        return
    }

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

}

main()